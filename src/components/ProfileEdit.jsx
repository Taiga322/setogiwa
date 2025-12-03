// src/components/ProfileEdit.jsx
// ユーザープロフィールの編集画面

import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { style } from '../constants.js';

function ProfileEdit({ user, onClose }) {
    const [displayName, setDisplayName] = useState(user.displayName || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!displayName.trim()) return;

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            await updateProfile(user, {
                displayName: displayName
            });
            setMessage({ text: 'プロフィールを更新しました！', type: 'success' });
            
            // 少し待ってから自動で閉じる（オプション）
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (error) {
            console.error("プロフィール更新エラー:", error);
            setMessage({ text: '更新に失敗しました。', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className={`${style.card}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-indigo-800">プロフィール編集</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕ 閉じる
                    </button>
                </div>

                {message.text && (
                    <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className={style.label} htmlFor="displayName">ユーザー名</label>
                        <input
                            type="text"
                            id="displayName"
                            className={style.input}
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="新しいユーザー名"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className={style.label}>メールアドレス</label>
                        <p className="text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            {user.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">※メールアドレスの変更はできません</p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`${style.buttonSecondary} flex-1`}
                            disabled={loading}
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            className={`${style.buttonPrimary} flex-1`}
                            disabled={loading}
                        >
                            {loading ? '保存中...' : '保存する'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfileEdit;