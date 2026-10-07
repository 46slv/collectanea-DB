---
title: B-Spline Mask
description: 少ないcontrol pointとtensionで滑らかな輪郭を描き、rotoやEffect Maskへ使う自動animation対応のSpline Mask。
doc_type: node
term_id: b-spline-mask
verification: partial
aliases: [B-Spline Mask, BSp]
concepts: [mask-data, spline]
nodes: [B-Spline Mask]
node_family: masks
controls: [Level, Filter, Soft Edge, Border Width, Paint Mode, Invert, Solid, Tension]
inputs: [mask]
outputs: [mask]
tasks: [create-mask, roto, spline-mask]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# B-Spline Mask

B-Spline Maskは、少ないcontrol pointから滑らかな<Term id="mask">Mask</Term>輪郭を作るSpline Maskです。

Bézierのような方向handleではなく、各pointの**tension**でcurveの曲がり方を調整します。人の輪郭や有機的な形を少ない点でrotoしたい場合に向きます。

## 入力 / 出力

任意のEffect Mask inputへ別Maskを接続でき、Paint Modeで合成できます。出力はsingle-channel Maskです。

```text
B-Spline Mask → Blur / Color Corrector / Merge Effect Mask
```

## Shapeを描く

追加直後はClick Append modeです。

1. Viewerをclickしてcontrol pointを追加します。
2. 最初のpointをもう一度clickしてshapeを閉じます。
3. 閉じた後はInsert / Modifyでpointを追加・移動できます。
4. Doneへ切り替えると誤編集を防げます。

B-Spline Maskは追加時点からshape animationが有効です。別frameでshapeを変更すると新しいkeyが作られます。

## Tension

B-Splineの滑らかさを決める主要操作です。

pointを選択し、Wを押しながらdragするとtensionを増減できます。Bézier handleを個別に伸ばす代わりに、point周辺のcurve全体へ影響します。

## 共通Mask Control

Level、Filter、Soft Edge、Border Width、Paint Mode、Invert、Solidを持ちます。

- Level — Mask値全体の強さ
- Soft Edge — edge feather
- Border Width — outline幅
- Paint Mode — 前段Maskとの演算
- Invert — Mask全体を反転
- Solid — fill / outlineを切り替え

## Polygon Maskとの違い

- **B-Spline Mask** — tensionで滑らかなcurveを作る。少ないpointでorganicな輪郭を作りやすい
- **Polygon Mask** — Bézier point + handleで局所的なcurveを細かく制御しやすい

どちらもrotoに使えます。shapeの性質と編集しやすさで選びます。

## 運用例

人物の肩や顔の輪郭をrotoする場合、最初からpointを増やしすぎず、輪郭の大きな曲率変化だけへpointを置きます。

frame間で形が変わるときも、同じpoint構造を保ったまま必要なpointだけを調整するとanimationを追いやすくなります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 108 pp.2468–2471とFusion Fundamentals Chapter 79で、B-Spline shape、auto-animation、Click Append、tension、Mask共通Controlを確認しました。

roto shotごとの最適point数や実機performanceは素材依存です。
