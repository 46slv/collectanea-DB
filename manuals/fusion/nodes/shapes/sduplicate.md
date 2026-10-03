---
title: "sDuplicate"
description: "入力したShapeを複数コピーし、コピーごとに位置・大きさ・回転・時間の変化やランダム差を加えられるShape Node。"
doc_type: node
term_id: "sduplicate"
term_short: "sDuplicateは、Shapeを複数コピーし、各コピーへ段階的な変化を付けるNode。"
verification: partial
aliases: ["sDuplicate"]
concepts: ["shape-data", "vector-shape", "rasterization"]
nodes: ["sDuplicate"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Copies", "Copy Probability", "Time Offset", "X Offset", "Y Offset", "X Size", "Y Size", "Axis Mode", "Rotation", "Random Seed"]
tasks: ["build-shape", "procedural-graphics", "repeat-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---

# sDuplicate

sDuplicateは、入力した<Term id="shape-data">Shape</Term>を複数コピーし、コピーが進むごとに位置・大きさ・回転などの変化を積み重ねるNodeです。

同じ図形を少しずつずらして並べる、徐々に小さくする、回転を足しながら反復する、といった構成に向いています。

## 役割

元のShapeを複数へ増やし、コピー同士に段階的な差を付けます。

[sGrid](./sgrid)がX・Yの行列を直接作るのに対し、sDuplicateは「前のコピーから次のコピーへ変化を積み重ねる」使い方が中心です。

## 入力

### Input1

オレンジ色の必須入力です。別のShape Nodeの出力を受け取ります。単一Shapeだけでなく、`sMerge` や `sBoolean` でまとめたShapeも入力できます。

## 出力

複製後のShapeを出力します。別のShape系Nodeで処理を続けるか、`sRender` で2D Imageへ変換します。

```text
sEllipse → sDuplicate → sRender
```

## 主な設定項目

### Copies

作るコピー数です。元のShapeは数に含まれません。Manualの例では5を指定すると、元のShapeに加えて5コピーが作られます。

### Copy Probability

各コピーが生成される確率を調整します。

### Time Offset

上流のShapeにアニメーションがある場合、コピーごとに参照する時間をずらします。コピーが同じアニメーションを同時に再生するのではなく、時間差を持たせる用途です。

### X / Y Offset

各コピーを前のコピーからどれだけずらすかを指定します。Fusionの正規化座標で、X Offset 0.5は各コピーを前のコピーからフレーム幅の半分だけ右へずらす例としてManualに記載されています。

### X / Y Size

前のコピーに対する大きさの倍率です。X/Yが1.0なら同じ大きさ、0.5なら次のコピーが前のコピーの半分になります。

### Axis Mode / Pivot / Rotation

回転中心の決め方と、コピーごとに加える回転を設定します。Axis ModeにはAbsolute、Origin Relative、Origin Absolute、Progressiveがあります。

Progressiveでは、位置・回転・スケールの変化を前のコピーから累積させます。

### Jitter

Jitterタブでは、コピーごとの位置、回転、大きさ、色などにランダムな差を加えられます。Random Seedを変えると別のばらつきになります。

## 主な用途

- 図形を一定方向へ連続して並べる。
- コピーごとに小さくして、収束する反復を作る。
- 回転を加えながら放射状・螺旋状に見える配置を作る。
- Time Offsetで、上流のアニメーションへコピーごとの時間差を付ける。
- Jitterで完全に同じ反復を少し崩す。

## 運用例

四角形を右へずらしながら小さくする場合:

```text
sRectangle
    ↓
sDuplicate   ← Copies
    │         ← X Offset
    │         ← X / Y Size
    ↓
sRender
```

最初はCopiesだけを増やし、次にOffset、最後にSizeを変えると、どのControlが結果のどの部分を担当しているか確認しやすくなります。

## 挙動と注意点

- 規則正しいX×Yの表を作るだけなら[sGrid](./sgrid)の方が直接的です。
- sDuplicateはコピーごとの変化を累積できるため、単純な配列以外の反復に向きます。
- 出力はShapeのままなので、通常のImage系Nodeへ渡す地点で `sRender` を使います。
- StyleやJitterにも追加Controlがあります。このページは主要な役割と選択基準を優先し、全Controlの逐語的な一覧にはしていません。

## 関連する考え方

- [シェイプ（Shape）](../../learn/02-data/shape)
- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)

## 似たNode・関連Node

- [sGrid](./sgrid) — X・Yの行列へ規則的に並べる
- [sTransform](./stransform) — Shape全体へ追加のTransformを加える
- [sRender](./s-render) — Shapeを2D Imageへ変換する

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 117、pp.2735–2738で、Input1、Copies、Copy Probability、Time Offset、X/Y Offset、X/Y Size、Axis Mode、Pivot、Rotation、Style、Jitterの役割を確認しました。

内部REGID、Edition差、実機での描画・処理性能は未確認のため `verification: partial` を維持します。
