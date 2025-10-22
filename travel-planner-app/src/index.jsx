//アプリの起動とFirebaseの模擬設定
// index.jsx: アプリケーションのエントリポイント

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Tailwind CSSの読み込みなど
import App from './App';

// =================================================================
// 🚨 [重要] ローカル実行用のグローバル変数の模擬 (ここを修正します)
// =================================================================

// ⚠️ 注意: 以下の YOUR_FIREBASE_CONFIG の値を、あなたのFirebaseプロジェクトの設定値に置き換えてください。
// この情報は、Firebase Consoleの設定ページから取得できます。
const YOUR_FIREBASE_CONFIG = {
    apiKey: "YOUR_FIREBASE_API_KEY", // <--- 取得したFirebaseのAPIキーに置き換え
    authDomain: "your-project-id.firebaseapp.com", // <--- プロジェクトIDを含むドメインに置き換え
    projectId: "your-project-id", // <--- あなたのプロジェクトIDに置き換え
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "...",
    appId: "1:..."
};

// グローバル変数に設定値を格納 (App.jsxが参照します)
// この処理により、App.jsxがローカル環境でもFirebaseに接続できるようになります。
window.__firebase_config = JSON.stringify(YOUR_FIREBASE_CONFIG);
window.__app_id = YOUR_FIREBASE_CONFIG.projectId; // projectIdをappIdとして利用
window.__initial_auth_token = null; // 匿名認証を使用するため、トークンはnull

// =================================================================
// Reactのレンダリング
// =================================================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
