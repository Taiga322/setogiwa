// src/components/PlanGeneratorForm.jsx
// プラン生成のステップUIを担当します

import React, { useState, useCallback } from 'react';
// ★ 変更: 新しい選択肢（Budgets, Transports）をインポート
import { travelRegions, travelThemes, style, travelBudgets, travelTransports } from '../constants.js'; 
import { fetchPrefectures, generatePlan } from '../api/geminiApi.js';

function PlanGeneratorForm({ userId, setPlanData }) {
    const [step, setStep] = useState(1);
    const [region, setRegion] = useState('');
    const [prefectureCandidates, setPrefectureCandidates] = useState([]);
    const [selectedPrefecture, setSelectedPrefecture] = useState('');
    const [theme, setTheme] = useState('');
    
    // ★ 変更: 最終要望の state を分割
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    const [transport, setTransport] = useState('');
    const [otherRequest, setOtherRequest] = useState(''); // 「その他の要望」
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Step 2: AIによる「都道府県」の候補生成
    const fetchCandidates = useCallback(async (selectedRegion) => {
        if (!selectedRegion) return;
        setLoading(true);
        setError(null);
        
        const regionLabel = travelRegions.find(r => r.value === selectedRegion)?.label;
        
        try {
            const candidates = await fetchPrefectures(regionLabel); 
            setPrefectureCandidates(candidates); 
            setStep(2); 
        } catch (e) {
            console.error("都道府県 候補生成エラー:", e);
            setError("AI接続エラー。ダミーデータで続行します。");
            setPrefectureCandidates(["東京都 (ダミー)", "神奈川県 (ダミー)", "千葉県 (ダミー)"]); 
            setStep(2);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Step 4: AIによる最終プランの生成とFirestoreへの保存
    const handleSubmitPlan = useCallback(async () => {
        // ★ 変更: バリデーションを新しい state に合わせる
        if (!userId || userId === 'anonymous' || !region || !selectedPrefecture || !theme || !startDate || !endDate || !budget || !transport) {
            setError("すべての入力（地域、都道府県、テーマ、日程、予算、移動手段）は必須です。");
            return;
        }

        setLoading(true);
        setError(null);

        const regionLabel = travelRegions.find(r => r.value === region)?.label;
        const themeLabel = travelThemes.find(t => t.value === theme)?.label;

        try {
            // ★ 変更: API呼び出しに新しい引数を渡す
            const { newPlanId, generatedPlan } = await generatePlan(
                userId,
                regionLabel,
                selectedPrefecture,
                themeLabel,
                startDate,
                endDate,
                budget,
                transport,
                otherRequest // その他の要望
            );

            // メインコンポーネントのステートを更新
            setPlanData({ 
                planId: newPlanId, 
                itinerary: generatedPlan, 
                region: regionLabel, 
                prefecture: selectedPrefecture,
                theme: themeLabel,
                // ★ 変更: 新しいデータも渡す
                startDate,
                endDate,
                budget,
                transport,
                otherRequest
            });
            
            setStep(5); // 完了画面へ

        } catch (e) {
            console.error("プラン生成エラー:", e);
            setError(`AIプラン生成に失敗しました: ${e.message}.`);
        } finally {
            setLoading(false);
        }
    }, [userId, region, selectedPrefecture, theme, startDate, endDate, budget, transport, otherRequest, setPlanData]); // ★ 変更: 依存配列
    
    // --- Step 1 UI: 地域選択 ---
    const renderStep1 = () => (
        <>
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">Step 1: 地域を選ぶ</h3>
            <div className="grid grid-cols-2 gap-4">
                {travelRegions.map((r) => (
                    <button
                        key={r.value}
                        className={`${style.buttonSecondary} ${region === r.value ? 'ring-2 ring-indigo-500 bg-indigo-100' : ''} text-center font-semibold`}
                        onClick={() => setRegion(r.value)}
                        disabled={loading}
                    >
                        {r.label}
                    </button>
                ))}
            </div>
            <button
                className={`${style.buttonPrimary} w-full mt-6`}
                onClick={() => fetchCandidates(region)}
                disabled={!region || loading}
            >
                {loading ? '候補を生成中...' : '次へ: 都道府県を選ぶ'}
            </button>
        </>
    );

    // --- Step 2 UI: 都道府県選択 ---
    const renderStep2 = () => (
        <>
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">Step 2: 都道府県を選ぶ</h3>
            <p className="mb-4 text-gray-600">AIが「{travelRegions.find(r => r.value === region)?.label}」の都道府県を一覧表示しました。</p>
            <div className="grid grid-cols-2 gap-4">
                {prefectureCandidates.map((prefecture) => (
                    <button
                        key={prefecture}
                        className={`${style.buttonSecondary} ${selectedPrefecture === prefecture ? 'ring-2 ring-indigo-500 bg-indigo-100' : ''} text-center font-semibold`}
                        onClick={() => setSelectedPrefecture(prefecture)}
                        disabled={loading}
                    >
                        {prefecture}
                    </button>
                ))}
            </div>
            <button
                className={`${style.buttonPrimary} w-full mt-6`}
                onClick={() => setStep(3)}
                disabled={!selectedPrefecture || loading}
            >
                次へ: 旅のテーマを選ぶ
            </button>
            <button
                className={`${style.buttonSecondary} w-full mt-3`}
                onClick={() => setStep(1)}
                disabled={loading}
            >
                地域選択に戻る
            </button>
        </>
    );

    // --- Step 3 UI: テーマ選択 ---
    const renderStep3 = () => (
        <>
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">Step 3: 旅のテーマを選ぶ</h3>
            <p className="mb-4 text-gray-600">都道府県: <strong>{selectedPrefecture}</strong></p>
            <div className="grid grid-cols-2 gap-4">
                {travelThemes.map((t) => (
                    <button
                        key={t.value}
                        className={`${style.buttonSecondary} ${theme === t.value ? 'ring-2 ring-indigo-500 bg-indigo-100' : ''} text-center font-semibold`}
                        onClick={() => setTheme(t.value)}
                        disabled={loading}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <button
                className={`${style.buttonPrimary} w-full mt-6`}
                onClick={() => setStep(4)}
                disabled={!theme || loading}
            >
                次へ: 最終要望を伝える
            </button>
            <button
                className={`${style.buttonSecondary} w-full mt-3`}
                onClick={() => setStep(2)}
                disabled={loading}
            >
                都道府県選択に戻る
            </button>
        </>
    );
    
    // --- ★ 変更: Step 4 UI: 最終要望（選択式） ---
    const renderStep4 = () => (
        <>
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">Step 4: 最終要望を伝える</h3>
            <p className="mb-4 text-gray-600">都道府県: <strong>{selectedPrefecture}</strong>, テーマ: <strong>{travelThemes.find(t => t.value === theme)?.label}</strong></p>
            
            <div className="space-y-4">
                {/* 日付選択 (カレンダー) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={style.label} htmlFor="start-date">出発日:</label>
                        <input 
                            type="date" 
                            id="start-date" 
                            className={style.input} 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]} // 今日より前の日付は選べない
                        />
                    </div>
                    <div>
                        <label className={style.label} htmlFor="end-date">最終日:</label>
                        <input 
                            type="date" 
                            id="end-date" 
                            className={style.input} 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().split("T")[0]} // 出発日より前の日付は選べない
                        />
                    </div>
                </div>

                {/* 予算選択 */}
                <div>
                    <label className={style.label} htmlFor="budget">予算（1人あたり）:</label>
                    <select 
                        id="budget" 
                        className={style.input} 
                        value={budget} 
                        onChange={(e) => setBudget(e.target.value)}
                    >
                        <option value="">予算を選んでください</option>
                        {travelBudgets.map(b => <option key={b.value} value={b.label}>{b.label}</option>)}
                    </select>
                </div>

                {/* 移動手段選択 */}
                <div>
                    <label className={style.label} htmlFor="transport">主な移動手段:</label>
                    <select 
                        id="transport" 
                        className={style.input} 
                        value={transport} 
                        onChange={(e) => setTransport(e.target.value)}
                    >
                        <option value="">移動手段を選んでください</option>
                        {travelTransports.map(t => <option key={t.value} value={t.label}>{t.label}</option>)}
                    </select>
                </div>

                {/* その他の要望 */}
                <div>
                    <label className={style.label} htmlFor="other-request">その他の要望（任意）:</label>
                    <textarea
                        id="other-request"
                        className={style.input}
                        value={otherRequest}
                        onChange={(e) => setOtherRequest(e.target.value)}
                        placeholder="例: 海鮮をたくさん食べたい、景色の良いカフェに行きたい、など"
                        rows="2"
                    />
                </div>
            </div>

            <button
                className={`${style.buttonPrimary} w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700`}
                onClick={handleSubmitPlan}
                disabled={!startDate || !endDate || !budget || !transport || loading} // ★ バリデーション変更
            >
                {loading ? 'AIが完璧なプランを設計中...' : '🚀 完璧な旅程をAIに生成してもらう'}
            </button>
            <button
                className={`${style.buttonSecondary} w-full mt-3`}
                onClick={() => setStep(3)}
                disabled={loading}
            >
                テーマ選択に戻る
            </button>
        </>
    );

    // --- Step 5 UI: 完了 ---
    const renderStep5 = () => (
        <div className="text-center">
            <h3 className="text-2xl font-bold text-green-600 mb-4">🎉 プラン生成完了！</h3>
            <p className="text-gray-700 mb-6">右側の画面で生成された旅程を確認・編集してください。</p>
            <button
                className={style.buttonPrimary}
                onClick={() => {
                    // 全てのstateをリセット
                    setRegion('');
                    setPrefectureCandidates([]); 
                    setSelectedPrefecture(''); 
                    setTheme('');
                    // ★ 変更: 新しい state もリセット
                    setStartDate('');
                    setEndDate('');
                    setBudget('');
                    setTransport('');
                    setOtherRequest('');
                    setStep(1);
                }}
            >
                新しいプランを作成する
            </button>
        </div>
    );


    return (
        <div className={`${style.card} h-full flex flex-col`}>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <div className="flex-grow">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
            </div>
            <p className="text-sm text-gray-400 mt-4">ユーザーID: {userId || '認証中...'}</p>
        </div>
    );
}

export default PlanGeneratorForm;