---
title: Duplicate 3D
description: Classic 3D objectを複数copyし、copyごとの累積/線形Transform・Time Offset・Jitterでarrayや反復motionを作るNode。
doc_type: node
term_id: duplicate-3d
term_short: Duplicate 3Dは、3D objectを連続Transform付きで複製するNode。
verification: partial
aliases: [Duplicate 3D, 3Dp]
concepts: [classic-3d, duplication, transform]
nodes: [Duplicate 3D]
node_family: 3d
controls: [Copies, Time Offset, Transform Method, Transform Order, Translation, Rotation, Pivot, Scale, Random Seed, Jitter Probability, Translation Jitter, Rotation Jitter, Scale Jitter, Region]
inputs: [classic-3d, classic-3d]
outputs: [classic-3d]
tasks: [duplicate-3d, array, repeat]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Duplicate 3D

Duplicate 3Dは、<Term id="classic-3d">Classic 3D</Term> objectを複数copyし、copyごとにposition・rotation・scaleを順次変えてarrayや反復構造を作るNodeです。

## 入力

### Scene Input

オレンジ色の必須入力です。複製するobject / sceneを接続します。

### Mesh Input

RegionをMeshにすると現れる任意入力です。Meshをregionとしてcopy placementを制限できます。

## 主な設定

### Copies

何個copyを作るかを設定します。First Copyを0より大きくするとoriginalを表示せずcopyだけを使えます。

### Time Offset

source geometryにanimationがある場合、copyごとに時間をずらします。

同じanimated clip / objectの異なるframeを並べる表現に使えます。

### Transform Method

- **Linear** — copy番号に応じてtransform量を掛け合わせる
- **Accumulated** — 前のcopy位置を出発点に次のtransformを積み上げる

### Translation / Rotation / Pivot / Scale

copyごとに加えるtransformです。

### Jitter

position、rotation、scaleへrandom variationを追加します。Random Seedでpatternを変え、Jitter Probabilityでどのcopyへrandomnessを適用するか制御できます。

## 最小構成

Cube 3D → Duplicate 3D → Merge 3D → Renderer 3D

## Replicate 3Dとの違い

- **Duplicate 3D** — copyごとのTransformで規則的 / jittered arrayを作る
- **Replicate 3D** — 別geometryのvertexやparticle位置へsource objectを配置する

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1938–1941で、Scene / Mesh input、Copies、Time Offset、Linear / Accumulated、Transform、Jitter、Regionを確認しました。
