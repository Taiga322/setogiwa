// src/App.jsx
// アプリケーションの全体レイアウトと状態管理を担当します

import React, { useState, useEffect } from 'react';
// 相対パスでインポート
import { 
    auth, 
    db, 
    appId, 
    onAuthStateChanged, 
    collection, 
    query, 
    onSnapshot, 
    deleteDoc, 
    doc      
} from './firebaseConfig.js'; 

// コンポーネントをインポート
import PlanGeneratorForm from './components/PlanGeneratorForm';
import AIChat from './components/AIChat';
import PlanDisplay from './components/PlanDisplay';
import PlanList from './components/PlanList';
import Login from './components/Login';
import Header from './components/Header';

function App() {
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    
    const [allPlans, setAllPlans] = useState([]); 
    const [currentPlan, setCurrentPlan] = useState(null); 

    // 1. 認証状態の監視
    useEffect(() => {
        if (!auth) {
            setIsAuthReady(true);
            return;
        }
        
        // ユーザーのログイン状態の変化を監視
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthReady(true);
        });

        return () => unsubscribeAuth();
    }, []);

    // 2. データベースの監視（ログイン時のみ）
    useEffect(() => {
        if (!isAuthReady || !user || !db) return;

        console.log(`Firestore監視開始: artifacts/${appId}/users/${user.uid}/travel_plans`);

        const planCollectionRef = collection(db, `artifacts/${appId}/users/${user.uid}/travel_plans`);
        const q = query(planCollectionRef); 

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setAllPlans([]); 
                setCurrentPlan(null); 
                return;
            }
            
            const plans = snapshot.docs.map(doc => ({
                planId: doc.id,
                ...doc.data()
            }));
            
            // 更新日時が新しい順にソート
            plans.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
            setAllPlans(plans); 
            
            // 表示するプランの更新
            setCurrentPlan(prevCurrentPlan => {
                if (prevCurrentPlan) {
                    // 現在表示中のプランがまだリストに存在するか確認
                    const exists = plans.some(p => p.planId === prevCurrentPlan.planId);
                    if (exists) {
                        // 存在すれば最新情報で更新
                        const updatedCurrent = plans.find(p => p.planId === prevCurrentPlan.planId);
                        return updatedCurrent || prevCurrentPlan;
                    }
                }
                // 選択中のプランがない、または削除された場合は、最新のプランを表示
                // データ構造を新しいものに合わせる
                return plans[0] ? {
                    planId: plans[0].planId,
                    itinerary: plans[0].itinerary,
                    theme: plans[0].theme,
                    region: plans[0].region,
                    prefecture: plans[0].prefecture,
                    startDate: plans[0].startDate,
                    endDate: plans[0].endDate,
                    budget: plans[0].budget,
                    transport: plans[0].transport
                 } : null;
            });
            
        }, (error) => {
            console.error("Firestore error:", error);
        });

        return () => unsubscribeSnapshot();
    }, [isAuthReady, user]);

    // イベントハンドラ: プラン一覧から選択
    const handleSelectPlan = (plan) => {
        console.log("プラン読込:", plan.planId);
        setCurrentPlan(plan); 
    };
    
    // イベントハンドラ: プラン削除
    const handleDeletePlan = async (planIdToDelete) => {
        if (!user || !db || !planIdToDelete) return;
        
        try {
            const planDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/travel_plans`, planIdToDelete);
            await deleteDoc(planDocRef);
            
            // 表示中のプランを削除した場合は表示をクリア（useEffect側でも処理されますが念のため）
            if (currentPlan && currentPlan.planId === planIdToDelete) {
                setCurrentPlan(null);
            }
        } catch (error) {
            console.error("プラン削除エラー:", error);
        }
    };

    // ローディング画面
    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // ★ 未ログイン時はログイン画面を表示
    if (!user) {
        return <Login />;
    }

    // ★ ログイン済みならメインアプリを表示
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-sans">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap'); 
                body { font-family: 'Noto Sans JP', sans-serif; }
                
                @media print {
                    .no-print, .no-print * { display: none !important; }
                    .print-area, .print-area * { display: block; visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 1.5rem; background: #ffffff; }
                }
                `}
            </style>
            
            {/* ヘッダー */}
            <Header user={user} />
            
            <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[80vh]">
                    {/* 左カラム: 入力フォーム・一覧・チャット */}
                    <div className="h-full flex flex-col space-y-8 no-print">
                        <PlanGeneratorForm userId={user.uid} setPlanData={setCurrentPlan} />
                        <PlanList 
                            plans={allPlans}
                            onSelectPlan={handleSelectPlan}
                            onDeletePlan={handleDeletePlan}
                            currentPlanId={currentPlan?.planId} 
                        />
                        <AIChat currentPlan={currentPlan} userId={user.uid} />
                    </div>
                    
                    {/* 右カラム: プラン表示（印刷対象） */}
                    <PlanDisplay 
                        currentPlan={currentPlan} 
                        userId={user.uid} 
                        // currentPlanIdがnullの場合はundefinedを渡さないように制御
                        currentPlanId={currentPlan ? currentPlan.planId : null}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;