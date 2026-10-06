---
title: TransformでImageを移動する
description: TransformのCenterを使い、出力解像度を変えずに2D Imageの位置を動かす最小Recipe。
doc_type: recipe
verification: partial
aliases: [move image, position image]
concepts: [normalized-coordinates, coordinate-space]
patterns: [share-position-across-elements]
nodes: [Transform]
tasks: [position, move, layout]
prerequisites: [normalized-coordinates]
level: foundation
product_scope: fusion
updated: "2026-10-04"
---

# TransformでImageを移動する

## できあがるもの

2D <Term id="image">Image</Term>の後ろに<Term id="transform">Transform</Term>を追加し、出力解像度を変えずに画面内の位置を動かします。

```text
Image → Transform → downstream
```

## 必要なもの

- 移動したい2D Image
- Transform

## 手順

1. 移動したいImageの後ろにTransformを追加します。
2. TransformのOutputをViewerへ表示します。
3. Center Xだけを変更し、左右へ動くことを確認します。
4. Center Yを変更し、上下へ動くことを確認します。
5. 必要な位置へCenter X / Yを調整します。

Centerの既定値は0.5 / 0.5で、Imageを中央に置きます。

## ピクセル単位で考えたい場合

TransformのCenterは内部では正規化座標で保持されます。

Reference SizeへWidth / Heightを設定すると、Inspector上のCenterをpixel位置として表示できます。DaVinci ResolveではAuto Resolutionを使うとTimeline resolutionをReference Width / Heightへ使えます。

Reference Sizeを変えても、Transformの内部Center値そのものがpixel値へ変換されるわけではありません。

## 大きさと回転も調整する

位置を決めた後、必要ならSizeとAngleを変更します。

- **Size**: 見た目の大きさ
- **Angle**: Pivotを中心に回転
- **Pivot**: 回転・scaleの中心

CenterとPivotを同時に変更せず、最初はCenterだけで位置を決めると役割を追いやすくなります。

## この構成にする理由

TransformはImageのWidth / Heightを変えません。

そのため、単純な位置アニメーションや配置を「出力解像度の変更」と分けて管理できます。

```text
Resize / Scale / Crop = Image自体の解像度を変える
Transform             = 同じ解像度内で配置を変える
```

## MergeのCenterを使う方法

MergeにもForeground用のCenter / Size / Angleがあります。

Foregroundを1回だけ配置するならMerge内部で済ませられます。配置を独立してAnimation / Expression / reuseしたい場合や、Mergeへ入る前のImage位置を明確にしたい場合はTransformを分けるとGraphを追いやすくなります。

## うまくいかないとき

- ViewerはTransformのOutputを見ているか。
- CenterではなくPivotを動かしていないか。
- Imageがframe外へ移動しているだけではないか。
- upstreamにCrop / Resize / Scaleがあり、想定したキャンバス寸法が変わっていないか。
- EdgesがCanvas以外になっていて、frame外のpixelがWrap / Duplicate / Mirrorで見えていないか。

## 関連する考え方

- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)
- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)
- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)

## 関連パターン

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)

## 関連Node

- [Transform](../../nodes/transform/transform)
- [Resize](../../nodes/transform/resize)
- [Scale](../../nodes/transform/scale)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 120、pp.2879–2883でCenter、Pivot、Size、Angle、Reference Size、Auto Resolutionと「Transformは解像度を変更しない」ことを確認しています。

実機でのAnimation / Expression運用は未追試のため `verification: partial` としています。
