---
title: ノードリファレンス（Node Reference）
description: Fusionのノードと関連要素を、役割・入出力・設定・用途から探す。21.1資料で確認した内容と実機未確認の範囲を区別する。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, inspect-controls]
updated: '2026-10-03'
---

# ノードリファレンス（Node Reference）

Fusionで使うノードと関連要素を、名前だけでなく、何を受け取り、何が起き、何を返し、どの場面で使うかから確認するためのリファレンスです。

名前から探す場合は[ノードA–Z](../index/node-a-z)を使ってください。一般的な仕組みは[Learn](../learn/)に、複数Nodeへ再利用できる組み方は[Patterns](../patterns/)に分けています。

## 掲載範囲

21.0.4基準の357項目とMediaIn・MediaOutによる従来の359ページに、September 2026版21.1 Reference Manualで確認した25項目と、公式21.1発表で確認したConnect 3Dを追加しています。現在は**385のノード・関連要素ページ**があります。カテゴリの案内ページはこの数に含めません。

この数は「21.1のAdd Toolに表示されるノード数」ではありません。ModifierとPaint内部要素を含み、実機のTool registryとはまだ全件照合していません。Resolve FX・OpenFX・Fuse・Macro・Template・Reactorも、この固定件数と同じ意味では扱いません。

## Familyから探す

Node名より先にデータ領域や共通構造を知った方が理解しやすいFamilyは、案内ページを用意します。

- [合成ノード（Compositing）](./compositing/) — Merge / MultiMerge / Dissolveを「重ねる・Layer管理・切り替える」で選ぶ
- [Transform / Formatノード](./transform/) — 配置を変える処理と解像度・キャンバスを変える処理を分けて選ぶ
- [Maskノード](./masks/) — 図形・Spline・Image channel・Paintから処理範囲を作る
- [Blur / Filterノード](./blur-filter/) — 均一blur・Defocus・Directional Blurなどを目的から選ぶ
- [Colorノード](./color/) — 基本tone補正・range別補正・white balance・colorspace処理を目的から選ぶ
- [Trackingノード](./tracking/) — Point / Planar / Cameraの解析方法と適用先を目的から選ぶ
- [Shapeノード](./shapes/) — Shapeを作る・変える・増やす・まとめる・画像化する流れ
- [Krokodoveの画像・Shape・3D・Region](./krokodove/) — Krokodove内の異なるデータ領域を分けて探す

Shapeそのものの意味は[シェイプ（Shape）](../learn/02-data/shape)で説明しています。

## 各Nodeページで確認すること

Node Referenceは、分類名と一行要約だけを並べる一覧ではありません。初めてそのNodeを見る場合でも、確認できている範囲で次を判断できることを基準にします。

- **役割** — 入力前と出力後で何が変わるか
- **入力** — 何を接続するか。必須・任意やデータ領域
- **出力** — 何が返り、次にどの種類のNodeへ渡せるか
- **主な設定** — Controlを変えると結果がどう変わるか
- **最小構成** — 役割を確認できる短いGraph
- **運用例** — 何を作るときに使うか
- **似たNodeとの違い** — 最初の選択基準
- **出典と確認範囲** — Manual、公式発表、実機確認、構成案のどこまでか

「ShapeをGrid複製」「色を処理」のように、別の専門語へ言い換えただけの説明は完成扱いにしません。専門語が必要な場合は本文でも最低限の意味を説明し、詳しいConceptへつなぎます。

## 21.1資料から追記した内容

[Krokodoveの案内](./krokodove/)では、Shapeの生成・輪郭加工、3D生成、Regionによる作用範囲の指定を分けています。Chapter 105の85記名項目には参照先を揃えていますが、全項目のInspectorや実機動作まで確認済みという意味ではありません。

[OpenPBR](./materials-lights/openpbr)は、21.1 Manualの入力メニューと構成図を基に、複数のテクスチャから3D材質を組む流れを記述しています。[sChangeStyle](./shapes/schangestyle)もManualのColorとAllow Combiningを説明し、既存[sOffset](./shapes/soffset)は曖昧な説明と裏付けのない導入版断定を修正しました。

[sGrid](./shapes/sgrid)、[sDuplicate](./shapes/sduplicate)、[sEllipse](./shapes/s-ellipse)、[sRender](./shapes/s-render)は、21.1 Manualで確認できるInput・Control・基本Graphまで反映し、Shapeの代表例としてreader-first形式へ改稿しています。

## 根拠の読み方

ページ全体の `verification: partial` は「何も分かっていない」という意味ではありません。Manualで確認できた役割・Control・接続例は具体的に書き、実機で確認していないREGID、Edition差、全端子、全既定値などは別に残します。

「Manualの構成例」は公式資料の図・本文に基づきます。「構成案」「確認案」は、確認済みの役割から組み立てた提案です。実機で再現した結果とは分けます。

## 未完了の確認

21.1 Manual全体と従来カタログの照合では、Krokodove以外にも未照合の名称が残っています。見出し・別名・同名別機能を整理してから追加する必要があるため、現時点では「21.1全ノード網羅完了」としません。

正確なREGID、実機のTool registry、端子、初期値、範囲、Edition差、描画結果は、Manual整理とは別のruntime確認段階で進めます。

詳細な照合状況は `docs/fusion-211-manual-coverage.md` に記録しています。
