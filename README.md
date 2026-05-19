# WaseMeshi Map (MVP)

早稲田周辺のごはん屋を地図中心でまとめる MVP サイトです。Next.js + TypeScript で構築し、投稿は Google Form、公開データは Google Sheet (CSV) から取り込めます。

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開くと、地図と店舗一覧が表示されます。

## 主要ファイル

- `pages/index.tsx`: 地図 + 店舗リストのホーム画面
- `src/Map.tsx`: `react-leaflet` を使った地図描画コンポーネント
- `pages/api/restaurants.ts`: `data/restaurants.json` + Google Sheet CSV（任意）を統合して返す API
- `data/restaurants.json`: 初期データ（早稲田周辺サンプル）

## 環境変数

- `NEXT_PUBLIC_GOOGLE_FORM_URL`
  - 投稿ボタンの遷移先
  - デフォルト: `https://forms.gle/hELpM4ZsWbsfdEdU7`
- `GOOGLE_SHEET_CSV_URL` (任意)
  - 公開した Google Sheet の CSV URL
  - セット時は API が CSV を取得して `approved=TRUE` 行のみ取り込み
- `NEXT_PUBLIC_MAP_CENTER_LAT` / `NEXT_PUBLIC_MAP_CENTER_LNG` (任意)
  - 地図のデフォルト中心座標。未指定なら早稲田駅周辺。

## Google Form / Google Sheet 運用

1. Google Form を作成して回答先を Google Sheet に紐づける
2. Sheet 側に列を用意（例）
   - `id,name,lat,lng,budget,mood,hours,photo,comment,approved`
3. 承認済みデータのみ `approved` を `TRUE` にする
4. Sheet で **ファイル → 共有 → ウェブに公開** を設定し CSV URL を取得
5. Vercel などの環境変数 `GOOGLE_SHEET_CSV_URL` に CSV URL を登録

> MVP では画像アップロード/ジオコーディングは未対応です。`lat/lng` はフォームやシートで直接入力してください。

## API キャッシュ

`/api/restaurants` は Google Sheet への過剰アクセスを防ぐため、5 分のインメモリキャッシュを使います。

## Vercel デプロイ

1. Vercel で `netglix/netglix-wase-meshi-map` を Import
2. Deploy Branch を `main`（または確認用に `feat/mvp-site`）に設定
3. Environment Variables に以下を設定
   - `NEXT_PUBLIC_GOOGLE_FORM_URL`
   - `GOOGLE_SHEET_CSV_URL`（任意）
   - `NEXT_PUBLIC_MAP_CENTER_LAT` / `NEXT_PUBLIC_MAP_CENTER_LNG`（任意）
4. Deploy 実行で公開 URL を取得

## PR 用メモ（レビュー向け）

- MVP は地図中心 UI と最低限の投稿導線にフォーカス
- 画像アップロードや住所→座標変換は次フェーズ
- シート取り込みは `approved=TRUE` のみ反映
