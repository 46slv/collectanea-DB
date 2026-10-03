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

## 用語タグ

本文中の用語へ短い解説を付ける場合は、説明元のページに用語IDを持たせます。

```yaml
term_id: alpha
term_short: Imageが合成へどの程度寄与するかを表すalpha channel。
```

本文ではグローバルMDXコンポーネントを使います。

```mdx
<Term id="alpha">Alpha</Term>
```

`term_id` はリポジトリ内で重複させません。`term_short` はhover / focus / tapで出す短い説明で、詳しい内容はリンク先のページを正本にします。

## Build

```bash
npm install
npm run build
```

Pull Requestでは、少なくともproduction buildが成功する状態を維持してください。

## Development workflow

COLLECTANEAでは、実装が最低限buildでき、実際に触って検証できる状態になった時点でmainへ統合し、その後のVisual Acceptanceや細かな調整はmain上で行うのを基本とします。

- 実装途中の大きな変更: task branch / PR
- 検証可能になった変更: mainへ統合
- 日常のUI調整・記事追加・軽微な修正: main上で作業してよい
- 大規模refactor・routing/content model変更・dependency大更新: branch / PRへ戻す
- Heavy Quality workflow: manual-only
- 公開サイトへ影響するmain pushのみPages deploy

mainへpushする前に、対象変更に必要な最小限のbuild / preview確認を行ってください。

