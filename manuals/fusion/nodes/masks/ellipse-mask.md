---
title: Ellipse Mask
description: 円・楕円の単一channel Maskを作り、Level・Soft Edge・Border・Invert・Paint Modeで範囲を調整する基本Mask Node。
doc_type: node
term_id: ellipse-mask
verification: partial
aliases: [Ellipse, Ellipse Mask, Elp]
concepts: [mask-data, normalized-coordinates]
nodes: [Ellipse Mask]
node_family: masks
controls: [Show View Controls, Level, Filter, Soft Edge, Border Width, Paint Mode, Invert, Solid, Center, Width, Height, Angle]
inputs: [mask]
outputs: [mask]
tasks: [mask, circle, ellipse, isolate-effect]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Ellipse Mask

Ellipse Maskは、円・楕円の<Term id="mask">Mask</Term>を作る基本Nodeです。円形の範囲だけにEffectをかける、顔の周囲を楕円で囲う、柔らかいスポット状のMaskを作る、といった用途に使います。

## 役割

Ellipse MaskはRGBA Imageを生成するNodeではなく、処理範囲を表す単一channelのMaskを作ります。

```text
Ellipse Mask ──→ Effect Mask input
Image ─────────→ Effect → Output
```

## 入力

### Effect Mask

青色の任意入力です。別のMaskを接続すると、Ellipse Mask自身の形と組み合わせられます。

組み合わせ方はPaint Modeで決めます。

## 出力

円・楕円形のMaskを出力します。

白に近いMask値では対象Effectが強く適用され、黒に近い値では適用されません。

## 主な設定項目

### Center X / Y

Ellipse Maskの位置を動かします。

### Width / Height

楕円の横幅・縦幅を個別に調整します。

Viewer上では左右・上下のcontrolをドラッグして変更できます。斜め方向のcontrolを使うと縦横比を保ったまま大きさを変えられます。

### Angle

Ellipse Maskを回転します。

真円では見た目の変化が小さいですが、楕円にすると回転方向を確認しやすくなります。

### Level

Mask値全体の強さを調整します。

1.0ではMask内部が最大値になり、値を下げるとEffectの適用量も部分的になります。

### Soft Edge / Filter

Soft EdgeはMask境界をぼかします。0.0では明確な境界です。

FilterはSoft Edgeに使う計算方法を選び、Box、Bartlett、Multi-box、Gaussianが21.1 Manualに記載されています。

### Border Width / Solid

Solidが有効ならMask内部を塗った領域として使います。

Solidを無効にすると輪郭だけのMaskになり、Border Widthで線の太さを決めます。

### Paint Mode

Effect Mask入力へ別Maskを接続したとき、2つのMaskをどう組み合わせるかを決めます。

Merge、Add、Subtract、Minimum、Maximum、Average、Multiply、Replace、Invert、Copy、Ignoreがあります。

### Invert

Mask全体の白黒を反転します。

Paint ModeのInvertは入力Maskとの重なり方、Invert checkboxは最終Mask全体の反転なので区別します。

## 最小構成

Mergeの合成範囲を円形に限定する場合:

```text
Foreground ─┐
Background ─┼─ Merge → Output
Ellipse ────↑
```

まずSolidの円形Maskで確認し、その後Soft Edgeを増やすと境界の変化だけを観察できます。

## 運用例

人物の顔周辺だけにColor処理をかけたい場合、Ellipse Maskを対象NodeのEffect Maskへ接続します。

1. Centerで顔へ移動
2. Width / Heightで輪郭に合わせる
3. Angleで傾きを合わせる
4. Soft Edgeで境界をなじませる

Mask自体を調整する間は、Effect側の強さを同時に変えない方が原因を追いやすくなります。

## Polygon Maskとの違い

Ellipse Maskは円・楕円で十分な範囲を素早く作る場合に向いています。

人物や物体の複雑な輪郭を正確に囲う場合は[Polygon Mask](./polygon-mask)を使います。

## 関連する考え方

- [マスク（Mask）](../../learn/02-data/mask)
- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 似たNode・関連Node

- [Polygon Mask](./polygon-mask) — 任意形状を描く
- [Rectangle Mask](./rectangle-mask) — 四角形
- [B-Spline Mask](./b-spline-mask) — 滑らかな自由曲線
- [Bitmap Mask](./bitmap-mask) — Image channelからMaskを作る

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 108、pp.2472–2474で、Effect Mask入力、Level、Filter、Soft Edge、Border Width、Paint Mode、Invert、Solid、Center、Width、Height、Angleを確認しました。

内部REGID、全Viewer shortcut、実機でのsoftness性能、Edition差は未確認のため `verification: partial` としています。
