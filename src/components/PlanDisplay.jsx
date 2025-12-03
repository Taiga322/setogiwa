// src/components/PlanDisplay.jsx
// 生成されたプランの表示と編集UIを担当します

import React, { useState, useEffect, useCallback } from 'react';
import { style } from '../constants.js'; 
import { db, appId, doc, updateDoc } from '../firebaseConfig.js';

function PlanDisplay({ currentPlan, userId }) {
    const [planData, setPlanData] = useState(currentPlan ? currentPlan.itinerary : null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if (currentPlan && currentPlan.itinerary) {
            setPlanData(currentPlan.itinerary);
        } else {
             setPlanData(null);
        }
    }, [currentPlan]);

    // 入力内容の変更ハンドラ
    const handleActivityChange = useCallback((dayIndex, activityIndex, field, value) => {
        setPlanData(prevItinerary => {
            if (!prevItinerary) return null;

            const newDays = [...prevItinerary.days];
            const newActivities = [...newDays[dayIndex].activities];
            
            newActivities[activityIndex] = {
                ...newActivities[activityIndex],
                [field]: value
            };

            newDays[dayIndex] = {
                ...newDays[dayIndex],
                activities: newActivities
            };

            return { ...prevItinerary, days: newDays };
        });
    }, []);

    // Firestoreへの保存ハンドラ
    const handleUpdatePlan = useCallback(async () => {
        if (!userId || !currentPlan || !planData) return;

        setIsSaving(true);
        setSaveMessage('保存中...');

        try {
            const planDocRef = doc(db, `artifacts/${appId}/users/${userId}/travel_plans`, currentPlan.planId);
            
            await updateDoc(planDocRef, {
                itinerary: planData,
                updatedAt: new Date(),
            });

            setSaveMessage('✅ プランをクラウドに同期しました！');

        } catch (e) {
            console.error("プラン更新エラー:", e);
            setSaveMessage(`❌ 保存失敗: ${e.message}`);
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 3000);
        }
    }, [userId, currentPlan, planData]);

    if (!currentPlan) { 
        return (
            <div className={`${style.card} bg-gray-50 h-full flex items-center justify-center text-center text-gray-500 print:hidden`}>
                <p>左側のフォームでプランを生成するか、一覧からプランを読み込んでください。</p>
            </div>
        );
    }

    // ★ 修正1: タイトルの「へ」問題解消
    // 値がない場合は空文字にして、三項演算子で表示を制御
    const locationName = currentPlan.prefecture || currentPlan.destination || currentPlan.region;
    const displayTitle = locationName ? `${locationName}への旅` : "旅行プラン";

    return (
        // ★ 修正3: 印刷時のスクロール解除 (print:overflow-visible h-auto)
        <div className={`${style.card} h-full overflow-y-auto print:overflow-visible print:h-auto print:shadow-none print:border-none print:bg-white`}>
            
            {/* ヘッダーエリア（印刷時もおしゃれに） */}
            <div className="mb-6 border-b-2 border-indigo-100 pb-4 print:border-black print:mb-8">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-sm text-indigo-500 font-bold tracking-widest uppercase mb-1 print:text-black print:text-xs">Travel Plan</p>
                        <h2 className="text-3xl font-extrabold text-indigo-800 print:text-4xl print:text-black">
                            {displayTitle}
                        </h2>
                    </div>
                    <div className="text-right hidden print:block">
                        <p className="text-sm text-gray-500">AI旅の設計士</p>
                    </div>
                </div>
                <p className="text-md font-semibold text-gray-600 mt-2 print:text-gray-800">
                    {currentPlan.region} {currentPlan.theme ? `/ テーマ: ${currentPlan.theme}` : ''}
                </p>
            </div>
            
            {/* 条件表示エリア */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg grid grid-cols-3 gap-4 print:bg-white print:border print:border-gray-300 print:py-2">
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide">日程</span>
                    <span className="font-bold text-gray-800 text-lg print:text-base">
                        {currentPlan.startDate && currentPlan.endDate ? `${currentPlan.startDate} 〜 ${currentPlan.endDate}` : '未定'}
                    </span>
                </div>
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide">予算</span>
                    <span className="font-bold text-gray-800 text-lg print:text-base">{currentPlan.budget || '-'}</span>
                </div>
                <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide">移動手段</span>
                    <span className="font-bold text-gray-800 text-lg print:text-base">{currentPlan.transport || '-'}</span>
                </div>
            </div>
            
            {/* 操作ボタン（印刷時は完全に隠す） */}
            <div className="flex space-x-3 print:hidden mb-6">
                <button 
                    className={`${style.buttonPrimary} shadow-lg`}
                    onClick={handleUpdatePlan}
                    disabled={isSaving}
                >
                    {isSaving ? '同期中...' : '🔄 プランを同期・保存'}
                </button>
                
                <button 
                    className={`${style.buttonSecondary} shadow-lg flex items-center space-x-2`}
                    onClick={() => window.print()} 
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.5A1.75 1.75 0 0 1 13.25 8H6.75A1.75 1.75 0 0 1 5 6.25v-3.5ZM6.75 2.5a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h6.5a.25.25 0 0 0 .25-.25v-3.5a.25.25 0 0 0-.25-.25h-6.5ZM.75 9.75C.75 8.784 1.534 8 2.5 8h15c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 17.5 19H2.5A1.75 1.75 0 0 1 .75 17.25v-7.5ZM2.5 9.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h15a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25H2.5Z" clipRule="evenodd" />
                    </svg>
                    <span>印刷してしおりにする</span>
                </button>
            </div>
            {saveMessage && <p className={`text-sm mt-2 print:hidden ${saveMessage.startsWith('❌') ? 'text-red-500' : 'text-green-600'}`}>{saveMessage}</p>}

            {/* スケジュール詳細 */}
            <div className="space-y-8">
                {planData && planData.days && planData.days.map((day, dayIndex) => (
                    <div key={dayIndex} className="print:break-inside-avoid print:mb-8"> {/* 改ページ制御 */}
                        {/* 日付ヘッダー */}
                        <div className="flex items-center mb-4">
                            <div className="bg-indigo-600 text-white font-bold py-1 px-3 rounded-lg shadow-sm print:bg-black print:text-white print:shadow-none">
                                Day {day.day_number}
                            </div>
                            <span className="ml-3 text-lg font-bold text-gray-700 print:text-black">{day.date}</span>
                        </div>
                        
                        {/* タイムライン（左の線） */}
                        <div className="border-l-2 border-indigo-200 ml-4 pl-6 pb-2 space-y-6 print:border-l print:border-gray-400 print:ml-4 print:pl-6">
                            {day.activities.map((activity, activityIndex) => (
                                <div key={activityIndex} className="relative group">
                                    {/* タイムラインのドット */}
                                    <div className="absolute -left-[1.95rem] top-2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white print:bg-black print:border-white print:w-2 print:h-2 print:-left-[1.8rem] print:hidden"></div>

                                    {/* ★ 修正2: 二重表示の完全解消 (hidden / print:block の使い分け) */}
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all print:shadow-none print:border-none print:p-0 print:mb-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 mb-2">
                                            {/* 時間 */}
                                            <div className="w-24 font-mono text-lg font-bold text-indigo-600 print:text-black print:text-base flex-shrink-0 pt-1">
                                                {/* 画面用（入力）: 印刷時は消す (print:hidden) */}
                                                <input
                                                    type="text"
                                                    value={activity.time}
                                                    onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'time', e.target.value)}
                                                    className="w-full text-center bg-indigo-50 border-none rounded focus:ring-2 focus:ring-indigo-500 print:hidden"
                                                />
                                                {/* 印刷用（テキスト）: 画面では消す (hidden print:block) */}
                                                <span className="hidden print:block">{activity.time}</span>
                                            </div>

                                            {/* スポット名 */}
                                            <div className="flex-grow">
                                                {/* 画面用（入力）: 印刷時は消す (print:hidden) */}
                                                <input
                                                    type="text"
                                                    value={activity.spot_name}
                                                    onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'spot_name', e.target.value)}
                                                    className="w-full text-lg font-bold border-b-2 border-transparent focus:border-indigo-500 focus:outline-none bg-transparent print:hidden"
                                                />
                                                {/* 印刷用（テキスト）: 画面では消す (hidden print:block) */}
                                                <span className="hidden print:block text-lg font-bold">{activity.spot_name}</span>
                                            </div>
                                        </div>

                                        {/* メモ */}
                                        <div className="text-gray-600 text-sm pl-1 print:pl-0 print:text-gray-800">
                                            {/* 画面用（入力）: 印刷時は消す (print:hidden) */}
                                            <textarea
                                                value={activity.notes}
                                                onChange={(e) => handleActivityChange(dayIndex, activityIndex, 'notes', e.target.value)}
                                                className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 bg-gray-50 print:hidden"
                                                rows="2"
                                                placeholder="メモ"
                                            />
                                            {/* 印刷用（テキスト）: 画面では消す (hidden print:block) */}
                                            {activity.notes && (
                                                <p className="hidden print:block whitespace-pre-wrap mt-1 pl-24 border-l-2 border-gray-100 italic text-xs text-gray-600">
                                                    {activity.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* 印刷用フッター */}
            <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                Output by AI Travel Planner
            </div>
        </div>
    );
}

export default PlanDisplay;