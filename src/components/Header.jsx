// src/components/Header.jsx
// アプリケーションのヘッダー（タイトルとログアウトボタン）

import React from 'react';
// 相対パスで正しくインポート
import { auth, signOut } from '../firebaseConfig.js';

// ★ props として 'user' オブジェクト全体を受け取るように設計されています
export function Header({ user }) {
    
    // ログアウト処理
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("ログアウトエラー:", error);
        }
    };

    // 表示名の決定ロジック
    // 1. displayNameがあればそれを使う
    // 2. なければメールアドレスの @ の前を使う
    // 3. それもなければ 'ゲスト' とする
    const displayName = user?.displayName || user?.email?.split('@')[0] || 'ゲスト';

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 no-print">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                {/* 左側：ロゴとタイトル */}
                <div className="flex items-center">
                    <span className="text-2xl mr-2">🧭</span>
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:block">
                        AI旅の設計士
                    </h1>
                </div>
                
                {/* 右側：ユーザー情報とログアウトボタン */}
                <div className="flex items-center space-x-4">
                    {user && (
                        <div className="flex items-center space-x-2">
                            {/* ユーザーアイコン風のアバター（名前の頭文字） */}
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-700 font-medium hidden md:block">
                                {displayName} さん
                            </span>
                        </div>
                    )}
                    
                    <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors duration-150 flex items-center ml-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        ログアウト
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;