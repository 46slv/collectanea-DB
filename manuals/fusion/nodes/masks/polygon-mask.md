---
title: Polygon Mask
description: ViewerでBézier polylineを描いて任意形状のMaskを作り、形状をframeごとにanimateできる基本Rotoscoping Node。
doc_type: node
term_id: polygon-mask
verification: partial
aliases: [Polygon, Polygon Mask, Ply]
concepts: [mask-data, bezier-path]
nodes: [Polygon Mask]
node_family: masks
controls: [Show View Controls, Level, Filter, Soft Edge, Border Width, Paint Mode, Invert, Solid, Center, Angle]
inputs: [mask]
outputs: [mask]
tasks: [mask, roto, bezier, isolate-effect]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Polygon Mask

Polygon Maskは、Viewer上で点を打ってBézier polylineを描き、任意形状の<Term id="mask">Mask</Term>を作るNodeです。円や四角では囲いにくい人物・物体の輪郭を追うRotoscopingで使います。

## 役割

規則的な図形ではなく、自由な輪郭をMaskとして定義します。

```text
Polygon Mask ──→ Effect Mask input
Image ─────────→ Effect → Output
```

Polygon Mask自体がRGBA Imageを描くのではなく、対象Effectへ渡す単一channelのMaskを作ります。

## Maskを描く

Nodeを追加すると、Viewer上で点をクリックしてpolylineを作れます。新しい点は直前の点とつながり、最初の点を再度クリックすると閉じたShapeになります。

不規則な輪郭を囲う場合は、必要な場所だけに点を置き、後からControl Pointとhandleを調整します。

## 自動Animation

21.1 Manualでは、Polygon MaskはB-Spline Maskと同様に**auto-animate**すると説明されています。

Nodeを追加した現在frameにkeyframeが作られ、別frameでShapeを変更すると新しいkeyframeが追加されます。時間を移動して輪郭を直したときに、意図せずAnimationが増えていないか確認します。

## 入力

### Effect Mask

青色の任意入力です。別のMaskを接続し、Polygon MaskのShapeと組み合わせられます。

組み合わせ方はPaint Modeで決めます。

## 出力

描いたpolylineを基に単一channelのMaskを出力します。

## 主な設定項目

### Show View Controls

Viewer上のpolyline、Center、Angle等のcontrol表示を切り替えます。

### Level

Mask値全体の強さを下げます。

1.0ではMask内部が最大値になり、値を下げるとEffectの適用も部分的になります。

### Soft Edge / Filter

Soft EdgeでMaskの境界をぼかします。FilterはSoft Edgeの計算方式を選びます。

ManualにはBox、Bartlett、Multi-box、Gaussianが記載されています。

### Border Width / Solid

Solidが有効なら閉じたpolyline内部をMaskとして塗ります。

Solidを無効にすると輪郭だけのMaskになり、Border Widthで線の太さを決めます。

### Paint Mode

別MaskがEffect Mask入力へ接続されている場合に、両方のMaskをどう組み合わせるかを決めます。

Merge、Add、Subtract、Minimum、Maximum、Average、Multiply、Replace、Invert、Copy、Ignoreがあります。

### Invert

Mask全体を反転します。

Paint ModeのInvertと、Mask全体を反転するInvert checkboxは別の処理です。

### Center / Angle

描いたPolygon全体の位置・回転を調整します。

個々のControl Pointを編集することと、Shape全体のCenter / Angleを変えることを分けて使えます。

## 最小構成

任意形状だけにColor処理をかける場合:

```text
Image → Color Corrector → Output
           ↑
      Polygon Mask
```

最初は粗い4〜6点程度のShapeで対象を囲い、Soft Edgeなしで範囲を確認します。その後に必要な点とsoftnessを追加すると原因を追いやすくなります。

## 運用例

人物の輪郭をRotoscopeする場合:

1. 基準frameで大まかな輪郭を描きます。
2. Viewer上でControl Pointを調整します。
3. 時間を移動し、ずれたframeだけShapeを修正します。
4. 必要なframeにkeyframeが増えていることを確認します。
5. 最後にSoft EdgeやLevelを調整します。

Shape editingとEffectの強さを同時に変えず、まずMask単体を確認します。

## Ellipse / B-Spline / MultiPolyとの違い

- **Ellipse Mask**: 円・楕円で十分な場合
- **Polygon Mask**: Bézier pointで任意形状を作る
- **B-Spline Mask**: 少ないpointで滑らかな輪郭を作りやすい
- **MultiPoly**: 複数のPolygon / B-Splineを1 NodeのListで管理する

## 関連する考え方

- [マスク（Mask）](../../learn/02-data/mask)
- [キーフレーム / スプライン / 時間](../../learn/05-time/keyframes-spline-time)

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 似たNode・関連Node

- [Ellipse Mask](./ellipse-mask)
- [B-Spline Mask](./b-spline-mask)
- [MultiPoly](./multipoly)
- [Mask Paint](./mask-paint)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 108、pp.2480–2484で、polyline作成、auto-animation、Effect Mask入力、Level、Filter、Soft Edge、Border Width、Paint Mode、Invert、Solid、Center / Angleを確認しました。

詳細なPolyline editing shortcut、tracking連携、実機でのroto性能、Edition差はこのページでは未確認です。
