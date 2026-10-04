---
title: Duplicate
description: 入力2D Imageを複数コピーし、各copyへ連続したCenter・Pivot・Size・Angle・Time Offsetを加えて反復patternを作るNode。
doc_type: node
term_id: duplicate
term_short: 2D Imageを連続変形付きで複製するNode。
verification: partial
aliases: [Duplicate, Dup]
concepts: [image-data, transform, compositing]
nodes: [Duplicate]
node_family: effects-film
controls: [Copies, Time Offset, Center, Pivot, Size, Angle, Apply Mode, Jitter]
inputs: [image, mask]
outputs: [image]
tasks: [duplicate, repeat, array, motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Duplicate

Duplicateは、入力した2D <Term id="image">Image</Term>を複数回コピーし、前のcopyを基準に変形を積み重ねて反復patternを作るNodeです。

同じcircleやlogoを一直線・円弧・spiral状に並べたり、animationをcopyごとに時間差でずらしたりできます。

## 入力

- Input: 複製する2D Image
- Effect Mask: 最終的に複製結果を表示する範囲

## Copies / Time Offset

Copiesでcopy数を決めます。Time Offsetは元Imageのanimationをcopyごとに時間方向へずらします。

## Center / Pivot / Size / Angle

各copyへ繰り返し適用するTransformです。Centerで位置offset、Pivotで変形中心、Sizeでscale、Angleでrotationを加えます。

## Apply Mode / Jitter

Apply Modeはcopy同士が重なる部分の合成方法です。Jitter tabではpositionやsize等へrandomnessを加えられます。

## 最小構成

    Background + Ellipse Mask → Duplicate → Merge

小さなcircleをsourceにし、CopiesとCenterを調整するとdot列を作れます。

## 似たNode

- Duplicate: 2D Image
- sDuplicate: Shape data
- Duplicate 3D: Classic 3D scene

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 97 pp.2272–2277で、2 input、Copies、Time Offset、Center / Pivot / Size / Angle、Apply Mode、Jitterを確認しました。
