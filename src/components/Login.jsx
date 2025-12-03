// src/components/Login.jsx
// ログインと新規登録を行うコンポーネント（ユーザー名対応版）

import React, { useState } from 'react';
// 相対パスで正しくインポート
import { auth } from '../firebaseConfig.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { style } from '../constants.js';

function Login() {
    const [isRegistering, setIsRegistering] = useState(false);
    // ユーザー名のステートを追加
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                // 新規登録
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                
                // ユーザー名の保存 (updateProfile)
                if (username) {
                    await updateProfile(userCredential.user, {
                        displayName: username
                    });
                }
            } else {
                // ログイン
                await signInWithEmailAndPassword(auth, email, password);
            }
            // 成功するとApp.jsxのonAuthStateChangedが検知して画面が切り替わります
        } catch (err) {
            console.error("認証エラー:", err);
            let msg = "エラーが発生しました。";
            if (err.code === 'auth/email-already-in-use') msg = "このメールアドレスは既に登録されています。";
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = "メールアドレスまたはパスワードが間違っています。";
            if (err.code === 'auth/user-not-found') msg = "ユーザーが見つかりません。";
            if (err.code === 'auth/weak-password') msg = "パスワードは6文字以上にしてください。";
            if (err.code === 'auth/invalid-email') msg = "メールアドレスの形式が正しくありません。";
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 w-full max-w-md border border-white/20">
                <h2 className="text-3xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    {isRegistering ? 'アカウント作成' : 'ログイン'}
                </h2>
                
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm" role="alert">
                        <p className="font-bold">エラー</p>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 新規登録時のみユーザー名入力欄を表示 */}
                    {isRegistering && (
                        <div>
                            <label className={style.label} htmlFor="username">ユーザー名</label>
                            <input
                                type="text"
                                id="username"
                                className={style.input}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="トラベル太郎"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className={style.label} htmlFor="email">メールアドレス</label>
                        <input
                            type="email"
                            id="email"
                            className={style.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className={style.label} htmlFor="password">パスワード</label>
                        <input
                            type="password"
                            id="password"
                            className={style.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength="6"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className={`${style.buttonPrimary} w-full py-3 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200`}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                処理中...
                            </span>
                        ) : (
                            isRegistering ? '新規登録' : 'ログイン'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">または</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={style.linkButton}
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError('');
                        }}
                    >
                        {isRegistering ? 'すでにアカウントをお持ちの方はこちら' : 'アカウントを新規作成する'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;