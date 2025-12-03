// src/components/PlanList.jsx
// 保存されたプランの一覧を表示し、読み込み・削除を行います

import React from 'react';
import { style } from '../constants.js'; // 共通のスタイルをインポート

function PlanList({ plans, onSelectPlan, onDeletePlan, currentPlanId }) {
    
    if (plans.length === 0) {
        return (
            <div className={`${style.card} text-center text-gray-500`}>
                保存されているプランはありません。
            </div>
        );
    }

    return (
        <div className={`${style.card} no-print`}> {/* 印刷時には非表示 */}
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">保存したプラン一覧</h2>
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2"> {/* 高さを制限してスクロール */}
                {plans.map((plan) => (
                    <div 
                        key={plan.planId} 
                        className={`p-4 rounded-lg flex justify-between items-center transition-all ${
                            currentPlanId === plan.planId 
                            ? 'bg-indigo-100 border-indigo-400' 
                            : 'bg-white hover:bg-gray-50'
                        } border shadow-sm`}
                    >
                        <div>
                            <h3 className="font-bold text-gray-800">{plan.area}への旅</h3>
                            <p className="text-sm text-gray-500">{plan.region} / {plan.theme}</p>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                            {/* 読み込みボタン */}
                            <button 
                                className={`${style.buttonSecondary} py-1 px-3`}
                                onClick={() => onSelectPlan(plan)}
                            >
                                読込
                            </button>
                            {/* 削除ボタン */}
                            <button 
                                className="bg-red-100 text-red-600 hover:bg-red-200 font-bold py-1 px-3 rounded-lg transition-all"
                                onClick={(e) => {
                                    e.stopPropagation(); // 親のクリックイベントを発火させない
                                    // 削除確認
                                    if (window.confirm(`「${plan.area}への旅」を本当に削除しますか？`)) {
                                        onDeletePlan(plan.planId);
                                    }
                                }}
                            >
                                削除
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PlanList;