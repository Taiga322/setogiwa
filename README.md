
# setogiwa

# 旅の設計士 AIプランナー (Travel Architect AI Planner)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
![Gemini API](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📖 概要

**「計画の悩みはAIに任せて、あなたは旅を楽しむだけ。」**

「旅の設計士 AIプランナー」は、旅行の計画段階から旅行中のサポートまでをシームレスに行う、生成AI活用型のWebアプリケーションです。
ユーザーは「癒やし」「グルメ」などのテーマを選ぶだけで、Googleの最新AIモデル（Gemini 2.5 Flash）が最適な目的地と3日間の詳細な旅程を自動生成します。さらに、旅ナカ（旅行中）においては、現在の現在地や予定を把握した「AIコンシェルジュ」がチャット形式でリアルタイムにサポートを提供します。

## ✨ 主な機能

### 1. テーマから旅程を自動生成
* **ステップバイステップ生成**: 「リラックス」「アクティブ」などのテーマを選択するだけで、AIが最適な目的地を提案。
* **構造化データの生成**: Gemini APIに対しJSON Schemaを適用することで、揺らぎのない正確なスケジュールデータ（JSON）を生成し、UIに反映します。
* **曖昧な要望に対応**: 「おしゃれなカフェに行きたい」といったフリーテキストの要望もプランに反映されます。

### 2. インタラクティブなプラン編集
* 生成されたタイムライン形式のプランは、ユーザーが自由に編集可能。
* 時間、スポット名、メモなどを修正し、自分だけのプランにカスタマイズできます。

### 3. 文脈理解型 AIコンシェルジュ（旅ナカ・チャット）
* **コンテキスト認識**: 単なるチャットボットではなく、システムプロンプトに「現在のプラン内容」と「シミュレーションされた現在地・時刻」を動的に注入。
* 「次の予定はどこ？」「ここから近いおすすめのランチは？」といった質問に対し、**現在の状況を踏まえた的確なアドバイス**が可能です。

### 4. リアルタイム同期
* Firebase Firestoreを活用し、作成したプランやチャット履歴をリアルタイムに保存・同期します。

## 🛠 使用技術

* **Frontend**: React, Tailwind CSS
* **Backend / DB**: Firebase (Authentication, Firestore)
* **AI Model**: Google Gemini API (`gemini-2.5-flash-preview`)
* **Architecture**: Serverless SPA



[Image of React Firebase architecture diagram]


## 💡 技術的なこだわり

### 堅牢なプロンプトエンジニアリング
Gemini APIの `responseSchema` 機能を活用し、AIの出力を厳密なJSON形式に強制しています。これにより、生成AI特有のハルシネーションやフォーマット崩れを防ぎ、アプリケーションとしての信頼性を担保しています。

### エラーハンドリングとリトライロジック
API通信部には `Exponential Backoff`（指数関数的バックオフ）アルゴリズムを採用したリトライ機能を実装。一時的なネットワークエラーやAPIのレート制限が発生しても、自動的に再試行を行い、ユーザー体験を損なわない設計にしています。

```javascript
// 実装コード例（一部抜粋）
const fetchWithRetry = async (url, options, retries = 3) => {
  // ... 指数関数的バックオフによるリトライ処理 ...
};
