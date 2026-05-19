# 早稲めしマップ (Waseda Meshi Map)

早稲田・高田馬場・西早稲田エリアの飲食店を、地図中心で探せる MVP です。

- Next.js + TypeScript
- Leaflet + OpenStreetMap
- 投稿データは Google Form → Google Sheet → CSV 公開で取り込み

## 主な機能

- `/`:
  - 地図と店一覧を同時表示
  - フィルタ（予算 / ムード）
  - 「投稿する」ボタン（Google Form へのリンク）
- 店詳細ドロワー:
  - 写真（大きめ表示）
  - 営業時間 / 予算 / ムード / コメント
  - 選択中の店を地図で強調
- `/api/restaurants`:
  - `data/restaurants.json` を常に読み込み
  - `GOOGLE_SHEET_CSV_URL` があれば CSV を取得してマージ
  - `approved=TRUE` の行だけ表示
  - サーバー側メモリキャッシュ（5分）

## 必要環境

- Node.js 20 以上
- npm

## セットアップ（ローカル）

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いて確認します。

## 環境変数

`.env.local` を作成して設定してください。

```bash
# 任意: Google Sheet の CSV 公開 URL
GOOGLE_SHEET_CSV_URL=

# 任意: 地図の初期中心座標（未設定時は早稲田周辺）
MAP_CENTER_LAT=35.708
MAP_CENTER_LNG=139.719

# 任意: 投稿ボタン先（未設定時はプレースホルダ）
NEXT_PUBLIC_GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/EXAMPLE/viewform
```

## Google Form → Sheet → CSV 公開手順

1. Google Form を作成し、質問項目を以下に合わせる
   - `name,budget,open_hours,photo_url,comment,mood,lat,lng`
2. 回答先の Google Sheet を作成
3. Sheet に `approved` 列を追加し、公開する行だけ `TRUE` を設定
4. Sheet を Web 公開（CSV）
   - `ファイル` → `共有` → `ウェブに公開`
   - 対象シートを選び、形式を `CSV` にして公開
5. 公開された URL を `GOOGLE_SHEET_CSV_URL` に設定

> MVP ではジオコーディングを行いません。`lat/lng` は管理者が手動で入力してください。

## 運用フロー

1. ユーザーは「投稿する」ボタンから Google Form を送信
2. 管理者は Google Sheet で内容確認し `approved` を更新
3. アプリは API 経由で CSV を 5 分キャッシュ付きで反映

## Lint / Build

```bash
npm run lint
npm run build
```

## Vercel デプロイ

1. GitHub リポジトリを Vercel に連携
2. Project Settings → Environment Variables に以下を設定
   - `GOOGLE_SHEET_CSV_URL`（任意）
   - `MAP_CENTER_LAT`（任意）
   - `MAP_CENTER_LNG`（任意）
   - `NEXT_PUBLIC_GOOGLE_FORM_URL`（任意）
3. Deploy 実行

Vercel 上でも `/api/restaurants` が同じ仕様で動作します。
