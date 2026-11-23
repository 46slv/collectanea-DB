---
title: sEllipseで塗りなしの円形アウトラインを作る
description: ShapeのsEllipseで中央が透明な円を作り、sRenderで2D Imageとして表示する。
doc_type: recipe
verification: partial
aliases: [線だけの円, 円の輪郭, outline circle, sEllipse outline]
concepts: [shape-domain, data-domain]
patterns: [defer-domain-conversion]
nodes: [sEllipse, sRender]
tasks: [shape, outline, circle, graphic]
prerequisites: [data-domain]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-23"
---

# sEllipseで塗りなしの円形アウトラインを作る

## 作るもの

白い輪郭だけを持ち、内側が透明な円を作ります。例えば、人物を囲む目印や、後から動きを付ける円形の図形に使えます。

**sEllipseのSolidをオフにする**のが要点です。画像として表示するには、ShapeをsRenderで2D Imageへ変換します。円の内側を背景色で塗りつぶして隠す方法ではありません。

## 必要なものと入力条件

- DaVinci Resolve / Fusion 21.1のFusionページ。新しいFusion Compositionなど、Shapeを表示できる作業領域を使います。以下は1920×1080を想定した設定案です。
- sEllipse、sRender。MediaOutはタイムライン上で完成結果を使う場合に接続します。
- InspectorとViewer。別のImage素材やマスクは不要です。

数値は**再現を始めるための例**であり、下記の組み合わせを実機で測定した結果ではありません。入力欄の単位や表示が異なる場合は、21.1のInspectorにある同名の項目を確認してください。

## 接続

~~~text
sEllipse（Shape：輪郭のみ）
       │ Shape
       ▼
    sRender
       │ 2D Image
       ▼
  MediaOut（必要な場合）
~~~

sEllipseの出力をsRenderへつなぎ、まずsRenderをViewerへ表示します。sEllipseは画像ではなくShapeを生成するため、輪郭の描画結果を確認する境界がsRenderです。

## 手順

### 1. 円の形を決める

1. sEllipseを作成し、Controlsで**Solidのチェックを外します**。これにより塗りつぶしではなくBorder Widthで作られる輪郭が表示対象になります。
2. **WidthとHeightを同じ値**にします。例としてそれぞれ **0.30** から始めます。幅と高さが異なると楕円になります。
3. **X Offset / Y Offsetを0.0**にして中央に置きます。位置は必要に応じて後から調整します。
4. **Border Width**を増減し、見える太さにします。比較用の開始値は **0.02** としますが、ここでの数値は提案値です。既定値・実機表示上の線幅を保証するものではありません。
5. **Lengthを1.0**にします。21.1公式Manualでは、1.0が閉じた輪郭、1.0未満が一部開いた輪郭と説明されています。

### 2. 色と透明度を決める

1. sEllipseの**Style → Color**で白を選びます。例えばR/G/Bを各1.0に設定します。
2. **Alphaを1.0**にして不透明な輪郭を狙います。これは線の色・透明度を設定する項目です。Solidをオフにしているので中央を塗りつぶしません。

### 3. 表示結果を確かめる

1. sEllipseのShape出力を**sRender**へつなぎ、sRenderをViewerで表示します。
2. 線だけの円が見え、内側には塗りがないことを確認します。Viewerの背景表示によって透明領域の見た目は変わるため、**黒く表示されることだけで塗りつぶしと判断しない**でください。
3. コンポジションから出力したい場合だけ、sRenderの2D ImageをMediaOutへ接続します。

## 期待される結果と確認ポイント

- **Solidオン**：円の内側まで色が付く構成。
- **Solidオフ・Length 1.0**：中央が透明で、閉じた円形の輪郭が出る構成。
- **Solidオフ・Length 1.0未満**：輪郭の一部に隙間ができる構成。

上記は21.1公式Manualに記載された制御の意味から導く期待結果です。本文の例のピクセル値や見た目を実機で測定した結果ではありません。

## この構成で動く理由

sEllipseは輪郭の形状をShapeとして生成します。Solidを切り替えると塗りつぶしか輪郭かを選べ、Border Widthは輪郭の太さを決めます。sRenderがShapeを通常の2D Imageへ変換するので、後段で合成などのImage処理へ渡せます。

データの種類の違いは[Shapeの基本](../../learn/02-data/shape)と[Shapeを必要な場所でImageへ戻す考え方](../../patterns/data-domain/defer-domain-conversion)を参照してください。

## バリエーション

- **円弧・書き出し風のアニメーション**：SolidをオフにしたままLengthを1.0未満にすると開いた輪郭になります。Positionで開口部の位置を調整できます。Lengthを時間変化させると描き進める表現の候補になりますが、この具体例のアニメーション再現は未検証です。
- **線の端を変える**：Lengthを1.0未満にしたときはCap styleでFlat / Rounded / Squaredの端の形状を選べます。閉じた円で端が見えない場合は、Lengthを下げて比べます。
- **楕円にする**：WidthとHeightを別の値にします。色だけを変える場合はStyleで指定します。

## うまくいかないとき

- **中央まで塗りつぶされる**：sEllipseのSolidがオンになっていないか確認します。透明にしたいのはStyleの色ではなく形状の内側です。
- **円ではなく楕円になる**：WidthとHeightが同じか確認します。
- **輪郭が欠けている**：Lengthが1.0未満になっていないか確認します。Positionは隙間の開始位置に関係します。
- **輪郭が見えない**：Border WidthとStyleのAlphaを確認します。その後、sEllipseではなくsRenderの出力をViewerへ表示しているか確認します。
- **後段の合成へつなげない**：sEllipseのShape出力を通常の2D Image用の接続へ直接渡さず、sRenderを経由させます。

## 関連資料

- [Shapeを2D Imageへrenderする最小構成](./basic-shape-render)
- [sEllipseのNode Reference](../../nodes/shapes/s-ellipse)
- [sRenderのNode Reference](../../nodes/shapes/s-render)
- [Shapeの概念](../../learn/02-data/shape)
- [特殊なデータのまま処理して、最後にImageへ戻す](../../patterns/data-domain/defer-domain-conversion)

## 出典と検証範囲

**公式仕様**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（2026年9月）, Chapter 117「Shape Nodes」pp.2738–2741（sEllipse / Solid / Border Width / Length / Position / Width / Height / Style）、同章のsRender説明。参照先：[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。

**既存の実機資料**：[sEllipse → sRenderのS04撮影例](./basic-shape-render)はShapeをImageへ変換する経路の参考です。ただしSolidオフの輪郭設定をこのレシピの値で実証したものではありません。

**未検証**：上記数値のResolve/Fusion 21.1実機再現、Inspector表示単位の環境差、描画結果の画素測定、Free/Studioの差、他OS、実際のLengthアニメーション、GPU・速度はNOT_RUN。確認済みの公式Control説明と、提案した手順・期待結果を区別するため、`verification: partial`を維持します。
