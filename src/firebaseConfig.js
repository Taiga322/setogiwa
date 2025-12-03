// src/firebaseConfig.js
// Firebaseの初期化と、必要なサービスのexportを担当します

import { initializeApp } from 'firebase/app';
// ★ 変更: signOut を追加
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    onSnapshot, 
    collection, 
    query, 
    updateDoc,
    deleteDoc 
} from 'firebase/firestore';

// =================================================================
// 🚨 [重要] Firebase接続設定
// =================================================================

// お客様のFirebaseプロジェクト設定値（埋め込み済み）
const YOUR_FIREBASE_CONFIG = {
    apiKey: "AIzaSyA5zPgjWI8BUgj4Qz4CSqm3EV1lHSP9fTw",
    authDomain: "travel-planner-app-27976.firebaseapp.com",
    projectId: "travel-planner-app-27976",
    storageBucket: "travel-planner-app-27976.firebasestorage.app",
    messagingSenderId: "397120237333",
    appId: "1:397120237333:web:d158b9b5cb5db0edd6431c",
    measurementId: "G-PP040VVCS6"
};

// =================================================================

const firebaseConfig = YOUR_FIREBASE_CONFIG;
export const appId = firebaseConfig.projectId || 'default-app-id';
export const initialAuthToken = window.__initial_auth_token || null;

// Firebaseサービスの初期化
let app, db, auth;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (e) {
    console.error("Firebase初期化エラー:", e);
}

// ★ 変更: signOut も export します
export {
    app,
    db,
    auth,
    // 認証関数
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged,
    signOut, // ★ 追加
    // Firestore関数
    doc,
    setDoc,
    onSnapshot,
    collection,
    query,
    updateDoc,
    deleteDoc 
};