---
title: "sGrid"
description: "入力したShapeを横・縦の行列へ複製し、規則的な反復パターンを作るShape Node。"
doc_type: node
term_id: "sgrid"
term_short: "sGridは、入力したShapeを横・縦のグリッドへ並べて反復パターンを作るNode。"
verification: partial
aliases: ["sGrid"]
concepts: ["shape-data", "vector-shape", "rasterization"]
nodes: ["sGrid"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
tasks: ["build-shape", "procedural-graphics", "repeat-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---

# sGrid

sGridは、入力した<Term id="shape-data">Shape</Term>を横方向と縦方向へ規則正しく並べ、行列状の反復パターンを作るNodeです。

小さな円をドット柄にする、四角形をタイル状に並べる、同じ図形を等間隔で敷き詰める、といった場面で使います。

## 役割

sGridの役割は、**1つのShapeを基準に、横×縦の規則的な並びへ増やすこと**です。

入力されたShapeそのものを画像へ変換するのではなく、複製された図形もShapeのまま次のShape系Nodeへ渡します。そのため、並べた後にさらに変形・結合してから画像化できます。

## 入力

### Shape

並べたい元のShapeを受け取ります。

たとえば `sEllipse` なら円、`sRectangle` なら四角形を入力できます。複数のShapeを `sMerge` などでまとめた結果を入力する構成も考えられます。

Fusion 21.1での正確な端子名と端子数は未検証のため、このページではデータ領域と役割を基準に説明します。

## 出力

複製後のShapeを出力します。

出力はまだ2D Imageではないため、通常の `Merge`、`Blur`、`Color Corrector` などへ渡す場合は、先に `sRender` で画像へ変換します。

## 主な設定項目

sGridでは、主に次の要素で並び方を決めます。

- **横方向の個数**: 1行にいくつ並べるか。
- **縦方向の個数**: 何行作るか。
- **横・縦の間隔やオフセット**: 複製したShape同士をどの程度離して配置するか。

正確なFusion 21.1のInspectorラベル、初期値、数値範囲は実機または現行資料での確認後に固定します。

## 主な用途

- 小さな円を多数並べてドットパターンを作る。
- 四角形や六角形などを規則的に反復させ、タイル状の背景を作る。
- 同じアイコンや装飾Shapeを行列状に並べる。
- 規則正しいグリッドを作った後、`sJitter` などで崩して不規則なパターンの元にする。

## 最小構成

```text
sEllipse → sGrid → sRender → Merge
```

この構成では、`sEllipse` が元の円を作り、`sGrid` が円を横・縦へ並べ、`sRender` がその結果を通常の2D Imageへ変換します。

## 運用例

背景にドット模様を作る場合は、まず `sEllipse` で小さな円を1つ作ります。

そのShapeをsGridへ接続し、横方向と縦方向の複製数を増やして画面を覆うように並べます。円同士が近すぎる、または離れすぎる場合は横・縦の間隔を調整します。

最後に `sRender` へ接続すると、並べたShapeを通常の画像としてMergeなどへ渡せます。

```text
小さな円
  ↓
sEllipse
  ↓
sGrid       ← 横・縦の数と間隔を調整
  ↓
sRender
  ↓
Merge       ← 映像や背景へ重ねる
```

## 挙動と注意点

- sGridは**規則的な2次元の並び**を作りたいときに向いています。
- 1方向へ連続して複製しながら位置・大きさ・回転を変えたい場合は、`sDuplicate` の方が意図に合うことがあります。
- sGridの出力はShapeです。通常のImage系Nodeへ渡す位置で `sRender` を使います。
- Shapeを画像化した後に同じ数のImageを複製する構成とは、データ領域と処理の組み方が異なります。

## 関連する考え方

- [シェイプ（Shape）](../../learn/02-data/shape)
- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 関連する再利用構成

Shapeの規則的な反復を扱う専用Patternは今後追加します。

## 似たNode・関連Node

- [sDuplicate](./sduplicate) — Shapeを複製し、コピーごとに変化を積み重ねたい場合
- [sEllipse](./s-ellipse) — 円・楕円のShapeを作る
- [sRectangle](./srectangle) — 四角形のShapeを作る
- [sRender](./s-render) — Shapeを2D Imageへ変換する

## バージョンと検証状況

sGridはResolve 17以降のShape systemの系譜としてBlackmagic Design公式資料で確認されています。横・縦へShapeを並べる基本的な役割は確認済みです。

Fusion 21.1の正確な端子名、Inspectorラベル、初期値、数値範囲は未検証のため、確認できていない名称や値は固定していません。
