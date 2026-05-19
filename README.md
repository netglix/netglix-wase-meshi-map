# 早稲めし — WaseMeshi (MVP)

このリポジトリには早稲田周辺の飲食店をまとめるマップ中心のMVPアプリがあります。

要点:
- Next.js + TypeScript
- マップ: react-leaflet (OpenStreetMap)
- 投稿: Google Form -> Google Sheet の CSV を読み込む（環境変数で指定）

セットアップ

1. クローン
   git clone https://github.com/netglix/netglix-wase-meshi-map.git
2. 依存をインストール
   cd netglix-wase-meshi-map
   npm install
3. ローカル起動
   npm run dev

環境変数
- `NEXT_PUBLIC_GOOGLE_FORM_URL` (任意) — 投稿ボタンがリンクする Google Form。未設定時は `https://forms.gle/hELpM4ZsWbsfdEdU7` を使います。
- `GOOGLE_SHEET_CSV_URL` (任意) — Google Sheet を "ファイル > ウェブに公開 > CSV" にした URL。設定すると /api/restaurants が自動で取得して表示します。

Vercel デプロイ
1. Vercel で `netglix/netglix-wase-meshi-map` を Import する
2. Environment Variables に `NEXT_PUBLIC_GOOGLE_FORM_URL` と `GOOGLE_SHEET_CSV_URL` を設定する
3. `main` を本番デプロイ対象にして Deploy する
4. レビュアーはデプロイ後の URL で「地図表示」「絞り込み」「投稿フォーム遷移」を確認する

Google Form → Sheet → CSV の運用
1. Google Form を作る（項目: name,budget,open_hours,photo_url,comment,mood,lat,lng,approved）
2. 回答をスプレッドシートに保存
3. スプレッドシートを「ファイル > ウェブに公開」でCSV化し、生成されたURLを `GOOGLE_SHEET_CSV_URL` に設定
4. シート上で `approved` 列が TRUE の行だけがサイトに表示されます。

初期データは data/restaurants.json に入っています。
