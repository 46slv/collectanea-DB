---
title: "uProjector"
description: "2D画像をUSD geometryへ投影。Light/Ambient Light/Texture系モード。SceneInput + required ProjectiveImage。"
doc_type: node
term_id: "uprojector"
term_short: "uProjectorは、2D画像をUSD geometryへ投影。Light/Ambient Light/Texture系モード。SceneInput + required ProjectiveImage。"
verification: partial
aliases: ["uProjector"]
concepts: ["usd"]
nodes: ["uProjector"]
node_family: "usd"
controls: ["Projection Mode", "Color", "Intensity", "Exposure", "Shadows"]
inputs: ["usd"]
outputs: ["usd"]
tasks: ["build-usd-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---

# uProjector

2D画像をUSD geometryへ投影。Light/Ambient Light/Texture系モード。SceneInput + required ProjectiveImage。

## 概要

- **種別**: Node / Tool
- **分類**: USD (18.5+)
- **主なデータ領域**: USD scene / asset
- **導入・系譜**: 21 [uPj]
- **根拠レベル**: Resolve 21のBlackmagic Design公式資料で確認

## 入力と出力

この項目はカタログ上、**USD scene / asset**を主なデータ領域として扱います。上のfrontmatterにある入出力は領域を検索するための分類であり、Fusion 21.1の正確な端子数や端子名を断定するものではありません。

実際に組むときはFlow上の端子ラベルとInspectorを確認し、2D Image、Mask、Shape、Particle、Classic 3D、USD、Deep、パラメータ値を取り違えないようにします。

## 主な用途

2D画像をUSD geometryへ投影。Light/Ambient Light/Texture系モード。SceneInput + required ProjectiveImage。

## 使うときの判断

USD系の`u*`ノードはClassic 3Dノードと別のデータ領域です。通常は`uRenderer`で画像へ変換します。

## 最小構成

```text
uLoader / uShape → uProjector → uRenderer → Image
```

## 主に確認する設定

- `Projection Mode`
- `Color`
- `Intensity`
- `Exposure`
- `Shadows`

上記は公式資料で役割が確認できた主要項目です。表示名や配置はFusion 21.1のホストで再確認します。

## 注意点

- このページはノードを選ぶための役割・データ領域・系譜を先に揃えています。
- exactな内部ID、端子名、初期値、数値範囲、Edition差は、確認できたものだけ今後追記します。

## バージョンと検証状況

Resolve 21のBlackmagic Design公式資料で役割を確認しています。Fusion 21.1の実機差、端子名、初期値、範囲は必要に応じて再確認します。

このリファレンスのinventory基準はDaVinci Resolve / Fusion 21.0.4です。Manual全体は21.1基準へ更新中のため、21.1で差がある箇所は現行資料または実機確認後に更新します。
