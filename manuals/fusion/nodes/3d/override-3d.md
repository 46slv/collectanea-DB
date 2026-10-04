---
title: Override 3D
description: Classic 3D scene内の全objectへVisibility・Lighting・Matte・Wireframe・ID等のproperty overrideを一括適用するNode。
doc_type: node
term_id: override-3d
term_short: Override 3Dは、scene内objectの共通propertyをまとめて上書きするNode。
verification: partial
aliases: [Override 3D, 3Ov]
concepts: [classic-3d, scene-graph]
nodes: [Override 3D]
node_family: 3d
controls: [Do Option, Override Option]
inputs: [classic-3d]
outputs: [classic-3d]
tasks: [override-3d, render-pass, wireframe]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Override 3D

Override 3Dは、入力<Term id="classic-3d">Classic 3D scene</Term>内の全objectへ、object-specific propertyをまとめて上書きするNodeです。

Wireframe、Visibility、Lighting、Matte、Object ID等をscene全体へ同じ設定で適用したいときに使います。

## 入力

オレンジ色のScene Inputへ3D sceneを接続します。

## Overrideの仕組み

各propertyにはDo [Option] checkboxがあります。

1. Do [Option]を有効にする
2. 表示されたOption値を設定する
3. upstream objectの同propertyをまとめてoverrideする

Doを有効にしていないpropertyは元object設定を保持します。

## Particle / Text 3Dで重要な理由

Manualでは、3D particle systemとText 3Dについて、wireframe、visibility、lighting、matte、ID等を設定する手段としてOverride 3Dが使われると説明されています。

## Render pass用途

sceneをbranchし、Override 3Dでlighting等を変更したあとReplace Material 3Dへ通すと、独立したmask / falloff / material passを作れます。

## 最小構成

Merge 3D → Override 3D → Renderer 3D

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 88 pp.1959–1960で、Scene input、Do [Option]によるscene-wide override、Replace Materialとのpass例を確認しました。
