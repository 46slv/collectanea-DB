---
title: Transform
description: 2D Imageを同じ解像度のまま移動・拡大縮小・回転し、PivotやAspect、Edgesも調整する基本Transform Node。
doc_type: node
term_id: transform
verification: partial
aliases: [Transform, XF, 変形]
concepts: [normalized-coordinates, coordinate-space, parameter-data]
patterns: [share-position-across-elements, link-values-with-expression]
nodes: [Transform]
node_family: transform
controls: [Center, Pivot, Use Size and Aspect, Size, Aspect, Angle, Flip, Edges, Filter Method, Invert Transform, Flatten Transform, Reference Size, Auto Resolution]
inputs: [image, mask]
outputs: [image]
tasks: [position, scale, rotate, layout, animate]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
slug: /fusion/nodes/transform/transform
updated: "2026-10-04"
---

# Transform

Transformは、2D <Term id="image">Image</Term>を移動・拡大縮小・回転する基本Nodeです。見た目の位置や大きさを変えても、ImageのWidth / Heightそのものは変更しません。

## 役割

Transformは「同じキャンバスの中でImageをどう配置するか」を担当します。

```text
Image → Transform → Image
```

ResizeやScaleと違い、出力解像度は変わりません。そのため、通常の2D配置やアニメーションでは最初に検討しやすいNodeです。

## 入力

### Input

オレンジ色の入力です。移動・拡大縮小・回転したい2D Imageを接続します。

### Effect Mask

青色の任意入力です。Transformを適用する範囲を限定します。21.1 ManualではEffect MaskはTransform処理後に適用されると説明されています。

## 出力

変形後の2D Imageを出力します。

Imageの解像度自体は入力と同じです。画面外へImageを移動して見えなくなっても、それだけでResizeやCropのように出力Width / Heightが変更されたとは限りません。

## 主な設定項目

### Center X / Y

Imageをどこへ置くかを決めます。既定は0.5 / 0.5で中央です。

Centerは基本的に正規化座標で保持されます。Reference Sizeを設定するとInspector上の表示をピクセル位置として見せられますが、内部値そのものは0〜1を基準とした値のままです。

### Pivot X / Y

回転・拡大縮小の中心を決めます。既定は0.5 / 0.5です。

Centerを動かすとImage全体の位置が変わります。Pivotを動かすと、同じAngleやSizeでも「どこを中心に変形するか」が変わります。

### Use Size and Aspect

有効にすると、1つのSizeとAspectで拡大縮小を調整します。無効にするとX / Yを個別に変更できます。

### Size

Imageの表示サイズを変えます。21.1 Manualでは1軸共通のSizeは0〜5がスライダー範囲ですが、0より大きい値を数値入力できます。

これはImageの見た目を拡大縮小するControlで、Resize / Scaleのように出力解像度そのものを変える処理ではありません。

### Aspect

Use Size and Aspectが有効なときに表示されます。

1.0より大きい値ではX方向へ、0〜1ではY方向へ伸びる形でImageの縦横比を変えます。

### Angle

Pivotを中心にImageを回転します。正方向では反時計回り、負方向では時計回りです。

### Flip Horizontally / Vertically

X軸またはY軸方向にImageを反転します。

### Edges

変形によって元Imageの外側が見える場合の扱いを選びます。

- **Canvas**: Canvas Colorを表示
- **Wrap**: 反対側の端へ回り込ませる
- **Duplicate**: 端の画素を延長する
- **Mirror**: 反射した画素で埋める

繰り返し背景を横へ流す場合などはWrapが候補になります。

### Filter Method

拡大縮小時の補間方法を選びます。Box、Linear、Quadratic、Cubic、Catmull-Rom、Gaussian、Mitchell、Lanczos、Sinc、BesselなどがManualに記載されています。

「常に高品質なfilterが正しい」ではなく、拡大・縮小量と素材の細かさに応じて選びます。

### Invert Transform

位置・回転・scaleのTransformを反転します。Manualでは、Trackerで安定化した動きを後段で戻す用途が例として説明されています。

### Flatten Transform

隣接するTransform NodeとのTransform concatenationを、このNodeの出力側へ引き継がないようにします。

通常の配置では意識しなくても使えますが、複数Transformを連ねた処理順や最適化を調べるときに重要です。

### Reference Size / Auto Resolution

Centerの表示方法を、正規化値ではなくピクセル座標として扱いやすくするための設定です。

たとえば100×100のReference Sizeなら、中央は50 / 50と表示できます。内部のCenter値は同じ正規化値のままです。

Auto Resolutionを有効にすると、Fusion StudioではFrame Format、DaVinci ResolveではTimeline resolutionをReference Width / Heightへ使います。

## 最小構成

```text
MediaIn → Transform → Merge
```

まずCenterだけを動かし、次にSize、Angle、Pivotの順で1つずつ変えると、それぞれの役割を分けて確認できます。

## 運用例

ロゴを映像の右下へ置く場合:

1. ロゴImageの後ろにTransformを追加します。
2. Centerで位置を決めます。
3. Sizeで大きさを調整します。
4. 回転が必要ならAngleを使います。
5. 回転中心をロゴ中央以外へ置きたい場合だけPivotを変更します。

その後、Transformの出力をMergeのForegroundへ接続します。

## Resize / Scaleとの違い

- **Transform**: 同じ出力解像度の中でImageを動かす・大きさを変える
- **Resize**: Width / Heightをピクセル数で指定して出力解像度を変える
- **Scale**: 元解像度に対する倍率で出力解像度を変える

見た目が同じ大きさになっても、後段が受け取るImageのWidth / Heightは同じではありません。

## 関連する考え方

- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)
- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)
- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)

## 関連パターン

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## 似たNode・関連Node

- [Resize](./resize) — ピクセル寸法を指定して解像度を変更
- [Scale](./scale) — 倍率で解像度を変更
- [Crop](./crop) — 切り出し・キャンバス寸法を変更
- [Merge](../compositing/merge) — Foregroundに簡易Transform controlsを持つ

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 120、pp.2879–2883で、Image / Effect Mask入力、解像度を変更しないこと、Center、Pivot、Use Size and Aspect、Size、Aspect、Angle、Flip、Edges、Filter Method、Invert Transform、Flatten Transform、Reference Size、Auto Resolutionを確認しました。

内部REGID、Edition差、Transform concatenationの全最適化条件、実機での描画・性能は未確認のため `verification: partial` としています。
