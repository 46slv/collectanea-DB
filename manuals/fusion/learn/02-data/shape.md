---
title: シェイプ（Shape）
description: FusionのShapeを、画像化する前に図形の輪郭や配置を保持して加工するベクターデータとして理解する。
doc_type: concept
term_id: shape-data
term_short: sEllipseやsRectangleなどが扱う、sRenderで画像化する前のベクター図形データ。
verification: partial
aliases: [Shape, Shape data, Shape domain, vector shape]
concepts: [shape-data, vector-shape, rasterization]
tasks: [build-shape, procedural-graphics, read-graph, debug]
prerequisites: [typed-connections]
level: foundation
product_scope: fusion
updated: "2026-10-03"
---

# シェイプ（Shape）

## このページで分かること

FusionのShapeが何なのか、通常の2D ImageやMaskと何が違うのか、Shape系Nodeをどの順番で使うのかを整理します。

## 基本の考え方

Shapeは、円や四角、文字、パスなどの**図形の情報を、まだ画像のピクセルにせず保持しているデータ**です。

たとえば小さな円を100個並べたい場合、最初から100枚の画像として扱うのではなく、円の形や位置をShapeとして持ったまま複製・変形し、最後に `sRender` で2D Imageへ変換できます。

```text
sEllipse → sTransform → sGrid / sDuplicate → sMerge → sRender → Merge
└──────────────── Shape ────────────────┘      └ Image ┘
```

この「画像化する前に図形として扱う」区間がShape系Nodeの仕事です。

## 何が入っていて、何が入っていないか

Shapeには、図形の輪郭や配置、Shape系処理に必要な情報が含まれます。

一方、Shapeは通常の2D Imageではありません。そのため、ShapeをそのままBlurや通常のMergeへ接続するのではなく、一般的な画像処理へ渡す地点で `sRender` を使います。

Maskとも別物です。Shapeは「図形を作って加工するためのデータ」で、Maskは主に「どこへ処理を効かせるか」を指定するためのデータです。

## Shape系Nodeの役割

Shape系Nodeは、大まかに次のように読めます。

- **作る**: `sEllipse`、`sRectangle`、`sText` などで元になる図形を作る。
- **変える**: `sTransform`、`sJitter` などで位置や形の扱いを変える。
- **増やす**: `sDuplicate`、`sGrid` などで同じShapeを複製する。
- **組み合わせる**: `sMerge`、`sBoolean` などで複数のShapeをまとめる。
- **画像にする**: `sRender` でShapeを2D Imageへ変換する。

Node名を覚えるより、「今はShapeを作っているのか、増やしているのか、画像へ変換しているのか」でFlowを見ると役割を判断しやすくなります。

## 最小例

```text
sRectangle → sRender → Merge
```

`sRectangle` が四角形のShapeを作り、`sRender` がそれを2D Imageへ変換します。ここで初めて、通常のMergeなどのImage系Nodeへ渡せる形になります。

## 1つだけ変えて確認する

次の構成を作ります。

```text
sEllipse → sGrid → sRender
```

`sEllipse` では小さな円を1つ作り、`sGrid` 側で横・縦の複製数や間隔を変えます。

円そのものを作り直しているのではなく、入力されたShapeを並べる段階と、それを画像化する段階が分かれていることを確認できます。

## 初見のShape Nodeを読む

初めて見るShape Nodeでは、まず入力と出力を見ます。

- **Shape → Shape**: Shapeのまま生成・変形・複製・結合するNode。
- **Shape → Image**: Shapeを画像へ変換する境界。代表例は `sRender`。
- **ImageやMaskが混ざる**: 別のデータ領域との変換や参照が入るので、そのNode固有の説明を確認する。

この区別だけでも、「なぜ通常のMergeへ繋がらないのか」「どこにsRenderが必要なのか」を判断しやすくなります。

## よくある誤解

### ShapeはMaskの別名ではない

どちらも輪郭を扱うため見た目が似ることがありますが、Flow上の役割とデータ領域は別です。

### Viewerに普通の画像として出ないから壊れている、とは限らない

Shapeのまま処理している途中なら、通常の2D Imageとして扱う前に `sRender` が必要です。

### 早い段階で画像化する必要はない

後段でもShape系の複製や変形を続けるなら、必要になるまでShapeのまま保持した方が構成を読みやすくできます。

## 関連Node

- [sEllipse](../../nodes/shapes/s-ellipse) — 円・楕円のShapeを作る
- [sRectangle](../../nodes/shapes/srectangle) — 四角形のShapeを作る
- [sDuplicate](../../nodes/shapes/sduplicate) — Shapeを複製する
- [sGrid](../../nodes/shapes/sgrid) — Shapeを横・縦へ規則的に並べる
- [sMerge](../../nodes/shapes/smerge) — 複数のShapeをまとめる
- [sRender](../../nodes/shapes/s-render) — Shapeを2D Imageへ変換する

## 次に読む

Shapeを通常の画像処理へ渡す境界を確認するなら、[sRender](../../nodes/shapes/s-render)を参照してください。

## バージョンと検証状況

Shape systemの基本的なデータ領域と `sRender` で2D Imageへ変換する構造は、Blackmagic Designの公式資料で確認された系譜に基づいています。Fusion 21.1の各Shape Nodeの正確な端子名・Inspector項目・初期値・数値範囲は、個別のNode Referenceで確認状況を分けて扱います。
