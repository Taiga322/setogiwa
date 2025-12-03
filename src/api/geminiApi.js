// src/api/geminiApi.js
// Gemini APIへの接続、リトライ、スキーマ定義を担当します

import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../firebaseConfig.js';

// APIキーとURL
export const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || ""; 
export const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"; 

// リトライ機能付きのフェッチ関数
export const fetchWithRetry = async (url, options, retries = 3) => {
    const apiUrl = `${url}?key=${API_KEY}`;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(apiUrl, options);
            if (response.status === 401) {
                throw new Error("API Request failed with status 401 (Authentication Error). Please check your GEMINI_API_KEY.");
            }
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API Request failed with status ${response.status}: ${errorBody}`);
            }
            return response;
        } catch (error) {
            if (i === retries - 1 || error.message.includes("401")) {
                console.error("APIエラー:", error);
                throw error;
            }
            console.warn(`リトライ中 (${i + 1}/${retries})...`);
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
    throw new Error("API request failed after multiple retries.");
};

// スキーマ定義（AIに守らせるデータ構造）
export const PlanSchema = {
    type: "object",
    properties: {
        destination: { "type": "string" },
        days: {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "day_number": { "type": "integer" },
                    "date": { "type": "string", "description": "YYYY-MM-DD format" },
                    "activities": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "time": { "type": "string" },
                                "spot_name": { "type": "string" },
                                "duration": { "type": "integer", "description": "minutes" },
                                "notes": { "type": "string" }
                            }
                        }
                    }
                }
            }
        }
    }
};

// =================================================================
// エクスポートされるAPI関数
// =================================================================

/**
 * AIに地域のおすすめ都道府県を問い合わせる
 */
export const fetchPrefectures = async (regionLabel) => {
    const prompt = `あなたは日本の地理の専門家です。ユーザーが選択した地域「${regionLabel}」に属する「都道府県」を【すべて】、JSON形式の配列でのみリストアップしてください。例: ["東京都", "神奈川県"]`;
    
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "array",
                items: { type: "string" }
            }
        }
    };

    const response = await fetchWithRetry(GEMINI_API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (!result.candidates || !result.candidates[0].content) {
        throw new Error("AIが応答を返しませんでした。");
    }
    
    return JSON.parse(result.candidates[0].content.parts[0].text);
};

/**
 * AIに旅行プランの生成をリクエストし、Firestoreに保存する
 */
export const generatePlan = async (userId, regionLabel, selectedPrefecture, themeLabel, customRequest) => { 
    
    // ★★★ プロンプトを修正：より簡潔な出力を要求 ★★★
    const fullPrompt = `あなたは【超・簡潔な】旅行プランナーです。以下の条件で旅行プランをJSON形式で出力してください。
    
    【条件】
    - 地域: ${regionLabel}
    - 都道府県: ${selectedPrefecture}
    - テーマ: ${themeLabel}
    - 要望: ${customRequest}
    - 日程: 3日間
    
    【厳守事項】
    1. 出力はJSONのみ。余計な文章は禁止。
    2. 各日のアクティビティは【最大3つ】まで。
    3. 「notes」は【20文字以内】の箇条書き。長文禁止。
    4. 途中で途切れないよう、データ量を最小限にしてください。

    【JSONスキーマ】
    ${JSON.stringify(PlanSchema)}
    `;

    const payload = {
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            // temperatureを下げることで、より予測可能で短い回答を促す
            temperature: 0.5
        }
    };

    const response = await fetchWithRetry(GEMINI_API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.candidates || !result.candidates[0].content) {
        throw new Error("AIからの応答がありませんでした。");
    }

    const rawPlanText = result.candidates[0].content.parts[0].text.trim();
    
    let generatedPlan;
    try {
        // マークダウンのコードブロックを削除してパースを試みる
        const cleanedText = rawPlanText.replace(/```json|```/g, '').trim();
        generatedPlan = JSON.parse(cleanedText);
    } catch (parseError) {
        console.error("JSONパースエラー:", parseError);
        console.error("AI生データ:", rawPlanText);
        
        // 最後の手段：閉じ括弧が足りない場合、無理やり閉じてみる（簡易的な復旧）
        try {
            const fixedText = rawPlanText + "}]}]}"; 
            generatedPlan = JSON.parse(fixedText);
        } catch (e) {
            throw new Error(`AIの回答が長すぎて途切れました。もう一度試すか、要望を短くしてください。`);
        }
    }

    // バリデーション
    if (!generatedPlan || !generatedPlan.days || !Array.isArray(generatedPlan.days)) {
        throw new Error("AIが有効な旅程データを生成できませんでした。");
    }

    // Firestoreに保存
    const newPlanId = Date.now().toString();
    const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/travel_plans`, newPlanId);
    
    const planDataToSave = {
        planId: newPlanId,
        region: regionLabel,
        prefecture: selectedPrefecture,
        theme: themeLabel,
        customRequest: customRequest, // UI表示用
        itinerary: generatedPlan,     // 生成されたプランデータ
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await setDoc(userDocRef, planDataToSave);

    return { newPlanId, generatedPlan };
};

/**
 * AIチャットの応答を取得する
 */
export const fetchChatResponse = async (context, itinerary, input) => {
    const prompt = `あなたは旅行ガイドです。以下の情報に基づき、ユーザーの質問に短く答えてください。
    【状況】${context}
    【プラン】${JSON.stringify(itinerary).substring(0, 1000)}... (省略)
    【質問】${input}
    
    Google検索ツールを使用して最新情報を確認し、回答してください。`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ "google_search": {} }]
    };

    const response = await fetchWithRetry(GEMINI_API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
};