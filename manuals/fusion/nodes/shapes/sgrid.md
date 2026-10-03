---
title: "sGrid"
description: "入力したShapeをX・Y方向の行列へ複製し、行・列の数と間隔を調整して規則的な反復を作るShape Node。"
doc_type: node
term_id: "sgrid"
term_short: "sGridは、ShapeをX・Y方向のグリッドへ並べ、行列状の反復パターンを作るNode。"
verification: partial
aliases: ["sGrid"]
concepts: ["shape-data", "vector-shape", "rasterization"]
nodes: ["sGrid"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Grid Cells X", "Grid Cells Y", "X Offset", "Y Offset"]
tasks: ["build-shape", "procedural-graphics", "repeat-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---

# sGrid

sGridは、入力した<Term id="shape-data">Shape</Term>をX・Y方向へ並べ、行列状の反復パターンを作るNodeです。円を規則正しいドットにする、四角形をタイル状に並べる、といった用途に使えます。

## 役割

1つのShape、または複数Shapeをまとめた結果を受け取り、横方向と縦方向へ複製します。出力もShapeのままなので、並べた後に別のShape処理を続けるか、最後に `sRender` で2D Imageへ変換できます。

## 入力

### Input1

オレンジ色の必須入力です。別のShape Nodeの出力を受け取ります。

単一Shapeだけでなく、`sMerge` や `sBoolean` で組み合わせたShapeも入力できます。

## 出力

グリッド状に複製されたShapeを出力します。

```text
sEllipse → sGrid → sRender
```

この構成では、円のShapeをsGridで並べ、sRenderで通常の画像として表示・合成できる状態へ変換します。

## 主な設定項目

### Grid Cells X / Y

横方向と縦方向にいくつのセルを作るかを指定します。

たとえばXとYをそれぞれ5にすると、Shapeは5列×5行に並びます。

### X / Y Offset

列同士・行同士の間隔を調整します。

0.0では各行・列が同じ位置へ重なります。21.1 Manualでは、X Offsetを1.0にすると列がフレーム幅相当まで広がる例が示されています。

## 主な用途

- 円を規則正しく並べてドット背景を作る。
- 四角形などを反復してタイル状の模様を作る。
- 同じ装飾Shapeを行列状に配置する。
- 規則的な配列を作った後、`sJitter` で位置・大きさ・回転を崩す元にする。

## 運用例

ドット背景を作る場合は、`sEllipse` で小さな円を1つ作り、sGridへ接続します。

```text
sEllipse
  ↓
sGrid       ← Grid Cells X / Y
  │         ← X / Y Offset
  ↓
sRender
  ↓
Merge
```

まずGrid Cellsで数を決め、その後Offsetで円同士の距離を調整すると、どの設定が「数」、どの設定が「間隔」を担当しているか分けて確認できます。

## 挙動と注意点

- sGridはX・Yの**2次元の規則的な配列**を作るNodeです。
- コピーごとに位置・大きさ・回転を段階的に変えたい場合は、[sDuplicate](./sduplicate)の方が意図に合います。
- 不規則なばらつきを加える場合は、後段の `sJitter` が候補になります。
- sGridの結果はShapeであり、通常のImage系Nodeへ渡す境界で `sRender` を使います。

## 関連する考え方

- [シェイプ（Shape）](../../learn/02-data/shape)
- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 似たNode・関連Node

- [sDuplicate](./sduplicate) — コピーごとに変化を積み重ねながら複製する
- [sEllipse](./s-ellipse) — 円・楕円のShapeを作る
- [sRender](./s-render) — Shapeを2D Imageへ変換する

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 117、pp.2743–2744で、Input1、X/Yグリッドへの複製、Grid Cells X/Y、X/Y Offset、sRenderへ渡す構成を確認しました。

このページではManualで確認できたControl名と基本挙動を記述しています。内部REGID、全設定、Edition差、実機での描画結果は未確認のため `verification: partial` を維持します。
