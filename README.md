# English Diary App

English Diaryは、英語で日記を書き、AI（Gemini）による100ワード以内の英文校正を受けて、元文と校正済みの文をCloud Firestoreに保存するシンプルで使いやすいアプリケーションです。

---

## 目次

- [概要](#概要)
- [主な機能](#主な機能)
- [アーキテクチャ概要](#アーキテクチャ概要)
- [技術スタック](#技術スタック)
- [クイックスタート](#クイックスタート)
  - [前提条件](#前提条件)
  - [ローカルセットアップ](#ローカルセットアップ)
  - [環境変数](#環境変数)
- [データモデル](#データモデル)
- [セキュリティとベストプラクティス](#セキュリティとベストプラクティス)
- [貢献](#貢献)
- [ライセンス](#ライセンス)

---

## 概要

このプロジェクトは、Next.jsをフロントエンドに採用し、Firebase Authentication（Googleログイン）でユーザー認証を行い、Cloud Firestoreに日記データを保存します。日記の校正処理はサーバー側（Next.jsのServer ActionsまたはAPI Routes）からGemini APIへリクエストを行い、AIによる校正結果を受け取って保存・表示します。

ユーザーは100ワード以内の英語テキストを送信でき、AIは校正済みの結果と修正点を返します。オリジナルと校正後のテキストは両方ともFirestoreに保存されます。

---

## 主な機能

- Googleアカウントによるログイン（Firebase Authentication）
- 英語の日記作成／編集（Next.js UI）
- 100ワード以内の英文をGemini APIで校正
- 元のテキストと校正後テキスト、校正メタデータをCloud Firestoreに保存
- サーバー側でのIDトークン検証とワード数制限の実施

---

## アーキテクチャ概要

主要なレイヤー：

- Client Side: Next.js（UI、FirebaseクライアントSDKでのGoogleサインイン）
- Server Side: Next.js Server Actions / API Routes（トークン検証、Gemini呼び出し、Firestoreへの保存）
- External Services: Firebase Auth, Cloud Firestore, Gemini API

詳細な図は docs/architecture.md を参照してください。アプリの処理フローは以下の通りです。

1. ユーザーがGoogleでサインイン（Firebase Auth）
2. 日記を作成し送信
3. フロントエンドがIDトークンと日記テキストをサーバーへ送信
4. サーバーがIDトークンを検証、ワード数をチェック（<=100）
5. Gemini APIへ校正リクエスト、校正結果を受信
6. オリジナル／校正後のデータをFirestoreに保存し、結果をクライアントへ返す

（詳細図: docs/architecture.md）

---

## 技術スタック

- フレームワーク: Next.js
- 認証: Firebase Authentication（Google Login）
- データベース: Cloud Firestore
- AI: Gemini API（サーバー経由で呼び出し）
- 開発言語: JavaScript / TypeScript

---

## クイックスタート

### 前提条件

- Node.js（推奨: 18.x以上）
- npm または yarn
- Firebaseプロジェクト（AuthenticationとFirestoreのセットアップ）
- Gemini APIキー（サーバーサイドで管理）

### ローカルセットアップ

1. リポジトリをクローン

```bash
git clone https://github.com/uedaaya/english-diary-app.git
cd english-diary-app
```

2. 依存関係をインストール

```bash
npm install
# または
# yarn install
```

3. 環境変数を設定（下記参照）

4. 開発モードで起動

```bash
npm run dev
# または
# yarn dev
```

アプリは通常 http://localhost:3000 で動作します。

### 環境変数

以下は推奨する環境変数（例）です。実際のキーやJSONはプロジェクトの実装に合わせてください。

- NEXT_PUBLIC_FIREBASE_CONFIG: クライアント用Firebase設定（JSONをbase64などで格納する運用も可）
- FIREBASE_SERVICE_ACCOUNT: サーバー用Firebase Admin SDKのサービスアカウントJSON（Base64エンコードして格納）
- GEMINI_API_KEY: Gemini APIキー（サーバー側でのみ使用）
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN 等、必要に応じてFirebaseクライアント設定を分割して設定してください。

環境変数を .env.local に配置する例（ローカル開発用、シークレットは絶対に公開しないでください）:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_client_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_SERVICE_ACCOUNT=base64_encoded_service_account_json
GEMINI_API_KEY=your_gemini_api_key
```

---

## データモデル（例）

Firestoreの `diaries` コレクションのドキュメントの例:

```json
{
  "userId": "uid_abc123",
  "createdAt": "2026-03-14T12:34:56Z",
  "originalText": "I write my diary in english.",
  "correctedText": "I write my diary in English.",
  "corrections": [
    { "from": "english", "to": "English", "reason": "capitalization" }
  ],
  "wordCount": 5,
  "aiModel": "Gemini",
  "aiProcessedAt": "2026-03-14T12:34:57Z"
}
```

---

## セキュリティとベストプラクティス

- Gemini APIキーや他のシークレットは必ずサーバー側で管理し、クライアントには公開しないでください。
- Firebase IDトークンはサーバーで検証してください（Firebase Admin SDKを使用）。
- サーバー側でワード数制限を実装し、不正な利用や予期しないコスト発生を防いでください。
- Firestoreのルールを設定して認可を強化してください（ユーザーは自分のドキュメントのみ読み書き可能にする等）。

---

## テストと品質保証

- ユニットテスト: ビジネスロジック（ワード数チェック、データ整形など）をユニットテストでカバー
- 統合テスト: サーバーAPIの認証・検証フロー、Firestoreへの保存処理を統合テストで確認
- E2Eテスト（任意）: UIからログイン→投稿→校正結果取得→保存の流れを自動化して検証
- CI: プルリクエスト時にテストが自動実行されるワークフローを推奨

---

## 貢献

貢献は歓迎します。IssueやPull Requestで変更提案をしてください。主な流れ:

1. Fork を作成
2. ブランチを切る: `git checkout -b feat/your-feature`
3. 変更をコミット
4. Pull Request を作成

コードスタイルやテストの追加に協力いただけると助かります。

---

## ライセンス

このリポジトリのライセンスは明示されていません。READMEにライセンス（例: MIT）を追加するか、プロジェクトルートに LICENSE ファイルを置いてください。

---

## 参考

- ドキュメント: `docs/architecture.md`
- Firebase ドキュメント（Authentication / Firestore）
- Gemini API ドキュメント（サーバーサイド呼び出し・レート制限や利用規約の確認）

---

作成・保守: 植田彩（リポジトリ: uedaaya/english-diary-app）