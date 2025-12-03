// src/components/AIChat.jsx
// 旅ナカのAIチャットUIを担当します

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { style } from '../constants.js'; 
import { fetchChatResponse } from '../api/geminiApi.js';

// export default function に統一
export default function AIChat({ currentPlan, userId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);

    // マウント時にブラウザの位置情報を取得
    useEffect(() => {
        if (!navigator.geolocation) {
             setLocationError("お使いのブラウザは位置情報に対応していません。");
             return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setLocationError(null);
            },
            (error) => {
                console.error("位置情報取得エラー:", error);
                setLocationError("位置情報が許可されていません");
            }
        );
    }, []); 

    // コンテキスト生成（ここがエラーの原因でした）
    const context = useMemo(() => {
        let locationContext;
        if (locationError) {
            locationContext = `ユーザーの現在地: ${locationError}`;
        } else if (currentLocation) {
            locationContext = `ユーザーの実際の現在地: 緯度 ${currentLocation.latitude}, 経度 ${currentLocation.longitude}`;
        } else {
            locationContext = "ユーザーの現在地: 取得中...";
        }
        
        // ★ 修正: プランデータが不完全な場合にクラッシュしないよう、チェックを厳重にしました
        // days が配列として存在するか確認してから .length を参照します
        if (!currentPlan || 
            !currentPlan.itinerary || 
            !Array.isArray(currentPlan.itinerary.days) || 
            currentPlan.itinerary.days.length === 0) {
            return `現在、有効な旅行プランはありません。\n${locationContext}`;
        }
        
        const today = currentPlan.itinerary.days[0]; 
        
        return `現在のプランの地域は「${currentPlan.region}」、都道府県は「${currentPlan.prefecture}」、テーマは「${currentPlan.theme}」です。\n${locationContext}\n今日は${today.date}です。`;
    }, [currentPlan, currentLocation, locationError]);


    const handleSend = useCallback(async () => {
        if (!input.trim() || loading) return;

        const userMessage = { sender: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const aiText = await fetchChatResponse(context, currentPlan?.itinerary, input);
            setMessages([...newMessages, { sender: 'ai', text: aiText }]);

        } catch (e) {
            console.error("チャット応答エラー:", e);
            setMessages([...newMessages, { sender: 'ai', text: `[接続エラー]: API接続に問題が発生しています。（${e.message}）` }]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages, currentPlan, context]);

    return (
        <div className={`${style.card} h-full flex flex-col`}>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">旅ナカ AIチャット</h2>
            
            <div className="flex-grow overflow-y-auto mb-4 p-3 bg-gray-50 rounded-lg space-y-4">
                <div className="text-sm text-gray-500 p-2 border-b border-indigo-200">
                    <p>🤖 AIコンシェルジュがあなたの旅をサポートします。</p>
                    <p>例: 「次の予定はどこ？」「この付近でおすすめのカフェは？」</p>
                    <p className={`mt-1 font-medium ${locationError ? 'text-red-500' : 'text-green-600'}`}>
                        📍 <strong>現在地:</strong> {locationError ? locationError : (currentLocation ? `緯度 ${currentLocation.latitude.toFixed(2)}, 経度 ${currentLocation.longitude.toFixed(2)}` : "取得中...")}
                    </p>
                </div>
                
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                                🤖
                            </div>
                        )}
                        <div className={`max-w-xs lg:max-w-md p-3 rounded-xl shadow-md ${msg.sender === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex justify-start space-x-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                            🤖
                        </div>
                        <div className="max-w-xs lg:max-w-md p-3 rounded-xl shadow-md bg-gray-200 text-gray-800 rounded-bl-none">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex">
                <input
                    type="text"
                    className={`${style.input} mr-2`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSend(); }}
                    placeholder={userId ? "質問を入力..." : "ユーザー認証待ち..."}
                    disabled={loading || !userId}
                />
                <button 
                    className={`${style.buttonPrimary} shadow-lg flex-shrink-0`}
                    onClick={handleSend}
                    disabled={loading || !input.trim() || !userId}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M3.105 3.105a.5.5 0 01.83.058l1.78 3.56A.5.5 0 015.5 7.5h6.99a.5.5 0 01.488.608l-1.876 7.506a.5.5 0 01-.488.392H3.105a.5.5 0 01-.058-.83l3.56-1.78a.5.5 0 00-.097-.914l-3.56-1.78a.5.5 0 01-.058-.83zM16.5 7.5a.5.5 0 000-1H13a.5.5 0 000 1h3.5z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}