---
title: "sDuplicate"
description: "入力したShapeを複数コピーし、コピーごとに位置・大きさ・回転などの変化を重ねられるShape Node。"
doc_type: node
term_id: "sduplicate"
term_short: "sDuplicateは、Shapeを複数コピーし、各コピーへ連続的な変化を付けるNode。"
verification: partial
aliases: ["sDuplicate"]
concepts: ["shape-data", "vector-shape", "rasterization"]
nodes: ["sDuplicate"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
tasks: ["build-shape", "procedural-graphics", "repeat-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---

# sDuplicate

sDuplicateは、入力した<Term id="shape-data">Shape</Term>を複数コピーし、コピーを増やしながら位置・大きさ・回転などの変化を重ねていくためのNodeです。

同じ図形を少しずつずらして並べる、回転を加えながら反復する、徐々に大きさが変わる図形列を作る、といった用途に向いています。

## 役割

sDuplicateの役割は、**元のShapeを複数個へ増やし、コピー同士に段階的な変化を付けること**です。

規則正しい横×縦の表を作る `sGrid` と違い、sDuplicateは「次のコピーを前のコピーから少し変える」という考え方で使う場面が中心です。

## 入力

### Shape

複製したい元のShapeを受け取ります。

`sEllipse`、`sRectangle`、`sText` などで作ったShapeや、Shape系Nodeで加工した結果を入力できます。

Fusion 21.1での正確な端子名と端子数は未検証のため、このページではデータ領域と役割を基準に説明します。

## 出力

複製された結果をShapeとして出力します。

そのまま別のShape系Nodeで加工を続けられます。通常のImage系Nodeへ渡す場合は、`sRender` で2D Imageへ変換します。

## 主な設定項目

sDuplicateでは、主に次の種類の値でコピーの作り方を決めます。

- **複製数**: Shapeを何個まで増やすか。
- **位置の変化**: コピーごとにどちらへ、どの程度ずらすか。
- **大きさの変化**: コピーが進むごとに拡大・縮小する量。
- **回転の変化**: コピーごとに加える回転量。

正確なFusion 21.1のInspectorラベル、初期値、数値範囲は実機または現行資料での確認後に固定します。

## 主な用途

- 同じ図形を一定方向へ少しずつずらして並べる。
- コピーごとに回転を加え、放射状・回転感のある反復を作る。
- コピーごとに大きさを変え、奥行き感や収束感のある図形列を作る。
- 位置・大きさ・回転を組み合わせ、単純なShapeからモーショングラフィックス用の反復形状を作る。

## 最小構成

```text
sRectangle → sDuplicate → sRender → Merge
```

`sRectangle` が元になる四角形を作り、`sDuplicate` が複数へ増やし、`sRender` が最終結果を2D Imageへ変換します。

## 運用例

同じ四角形を右方向へ連続して並べたい場合は、`sRectangle` をsDuplicateへ接続します。

複製数を増やし、コピーごとの位置変化を右方向へ設定すると、四角形が一定量ずつずれながら増えていきます。さらに回転の変化を加えると、コピーが進むほど角度も変わる反復になります。

```text
sRectangle
    ↓
sDuplicate   ← 複製数
    │         ← コピーごとの位置変化
    │         ← コピーごとの大きさ・回転変化
    ↓
sRender
    ↓
Merge
```

## 挙動と注意点

- sDuplicateは、コピーごとの変化を積み重ねる反復に向いています。
- 横×縦の行列として等間隔に敷き詰めたい場合は、`sGrid` の方が構成を読みやすくできます。
- 出力はShapeのままなので、複製後に `sMerge` や他のShape系処理を続けられます。
- 通常のImage系Nodeへ渡す位置で `sRender` を使います。
- Resolve 20.1ではShapeのDuplicate処理に改善が加えられた系譜がありますが、21.1の正確なUI差分はこのページでは未固定です。

## 関連する考え方

- [シェイプ（Shape）](../../learn/02-data/shape)
- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 関連する再利用構成

Shapeの反復を扱う専用Patternは今後追加します。

## 似たNode・関連Node

- [sGrid](./sgrid) — 横×縦の規則的なグリッドへ並べる
- [sTransform](./stransform) — Shapeの変形
- [sRender](./s-render) — Shapeを2D Imageへ変換する

## バージョンと検証状況

sDuplicateはResolve 17以降のShape systemとしてBlackmagic Design公式資料で確認されており、コピーごとに位置・大きさ・回転の変化を与える基本的な役割も公式の系譜資料で確認されています。Resolve 20.1ではDuplicate処理の改善が記録されています。

Fusion 21.1の正確な端子名、Inspectorラベル、初期値、数値範囲は未検証です。
