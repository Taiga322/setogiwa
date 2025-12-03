// src/constants.js
// プロジェクト全体で使う定数を管理します

// 🎨 スタイル設定 (Tailwind CSS)
export const style = {
    card: "bg-white/80 backdrop-blur-sm shadow-2xl rounded-xl p-6 mb-6 border border-gray-100",
    buttonPrimary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-70",
    buttonSecondary: "bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg transition-all duration-100 border border-gray-300",
    input: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150",
    label: "block text-sm font-medium text-gray-700 mb-1",
    // ★ 追加: リンク風ボタンのスタイル
    linkButton: "text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline focus:outline-none"
};

// 🌏 Step 1: 地域の定義
export const travelRegions = [
    { value: 'hokkaido', label: '北海道' },
    { value: 'tohoku', label: '東北' },
    { value: 'kanto', label: '関東' },
    { value: 'chubu', label: '中部' }, // 北陸は中部に含めます
    { value: 'kansai', label: '関西' },
    { value: 'chugoku', label: '中国' },
    { value: 'shikoku', label: '四国' },
    { value: 'kyushu', label: '九州・沖縄' },
];

// 🎨 Step 3: テーマの定義
export const travelThemes = [
    { value: 'relax', label: '癒やし・リラックス' },
    { value: 'active', label: 'アクティブ・冒険' },
    { value: 'gourmet', label: 'グルメ・食の探求' },
    { value: 'culture', label: '文化・歴史探訪' },
    { value: 'photogenic', label: 'フォトジェニック・映え' },
];

// 💰 Step 4: 予算の定義
export const travelBudgets = [
    { value: '3万円', label: '〜 3万円' },
    { value: '5万円', label: '〜 5万円' },
    { value: '10万円', label: '〜 10万円' },
    { value: '15万円', label: '〜 15万円' },
    { value: '20万円以上', label: '20万円以上' },
];

// 🚗 Step 4: 移動手段の定義
export const travelTransports = [
    { value: '車（レンタカー）', label: '車（レンタカー）' },
    { value: '公共交通機関（電車・バス）', label: '公共交通機関（電車・バス）' },
    { value: '徒歩・自転車', label: '徒歩・自転車' },
    { value: '指定なし', label: '指定なし' },
];