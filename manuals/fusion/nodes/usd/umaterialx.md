---
title: uMaterialX
description: MaterialX .mtlx definition fileを読み込み、USD material dataとしてuReplaceMaterial等へ渡すNode。
doc_type: node
term_id: umaterialx
term_short: uMaterialXは、.mtlx fileを読み込みUSD materialとして使うNode。
verification: partial
aliases: [uMaterialX, uMX]
concepts: [usd-scene, material, materialx]
nodes: [uMaterialX]
node_family: usd
controls: [Material File]
outputs: [usd-material]
tasks: [usd, material, materialx, load-material]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uMaterialX

uMaterialXは、MaterialXの`.mtlx` definition fileを読み込み、USD material dataを作るNodeです。

外部で作ったMaterialX materialをFusion内のUSD sceneへ適用したい場合に使います。

## 入力 / 出力

Node inputはありません。

Material File selectorで`.mtlx`を選び、そのmaterial outputをuReplaceMaterial等へ渡します。

```text
uMaterialX ───────→ uReplaceMaterial
USD scene ─────────↑
```

## Material File

唯一の主要Controlです。

Browseから`.mtlx` fileを読み込みます。

## uShaderとの違い

- **uMaterialX** — 外部`.mtlx` definitionを読み込む
- **uShader** — Fusion内でUSD / MaterialX shader controlsを組み立てる

既存MaterialX assetをそのまま使う場合はuMaterialX、Fusion内でtexture接続やproperty調整をしたい場合はuShaderを検討します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2904–2905で、inputなし、Material File selector、uReplaceMaterialへの基本構成を確認しました。

MaterialX version / node graph compatibilityは未確認です。
