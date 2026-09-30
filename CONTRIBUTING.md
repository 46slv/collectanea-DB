# Contributing to COLLECTANEA

COLLECTANEAは、公開技術資料をGitHubで継続的に改善するためのリポジトリです。

## 誤りを見つけた場合

小さな誤字や明確な修正はPull Requestで直接直して構いません。

仕様差、バージョン差、解釈が分かれる内容はIssueから共有してください。可能なら公式資料、実機確認、再現条件などの根拠を添えてください。

## 情報の扱い

- 確認済みの事実と推測を分ける
- バージョン依存の内容は対象バージョンを明記する
- 公式資料を根拠にする場合は出典を残す
- 公式マニュアルの文章を大量に転載せず、独自の説明として書く

## Build

```bash
npm install
npm run build
```

Pull Requestでは、少なくともproduction buildが成功する状態を維持してください。
