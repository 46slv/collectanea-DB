---
title: dMerge
description: Deep sample-aware 合成を行うDeep image domainのMerge Node。
doc_type: node
term_id: d-merge
verification: partial
aliases: [dMerge, Deep Merge]
concepts: [data-domain, deep-image, compositing]
nodes: [dMerge]
node_family: deep
inputs: [deep-image]
outputs: [deep-image]
tasks: [deep, composite, merge]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
---

# dMerge

Deep image domainでsample-aware 合成を行うMerge Nodeです。

## 概要

- **分類（Family）**: Deep
- **入力データ（Input domain）**: Deep image
- **出力データ（Output domain）**: Deep image
- **関連概念（Core concepts）**: per-ピクセル depth samples、front/back 関係
- **よく使う作業（Common tasks）**: Deep 合成、depth-aware merge

## 入力

Deep imageを受け取るNodeとしてResolve 20以降のBlackmagic Design公式のバージョン資料系で確認されています。

正確な入力数・補助PortはFusion 21.1 現在の資料または実機での確認待ちです。

## 出力

Deep imageを出力します。

通常の2D Imageではありません。

## 主な設定項目

Deep 合成 operatorやsample 扱いに関するcontrolを持つ系統ですが、正確な 21.1 UI / 初期値は未検証です。

## 挙動と注意点

Deep imageは1 ピクセルに複数depth sampleを保持できるため、通常2D Mergeのalpha 合成とは同じ問題ではありません。

```text
Deep A ─┐
        ├─ dMerge → Deep to Image → 2D
Deep B ─┘
```

dMergeを「通常Mergeの高品質版」として扱わないことが重要です。

## 最小例

2つのDeep imageをdMergeで合成し、必要ならDeep to Imageで2Dへflattenします。

## 関連する考え方

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)
- [Alpha](../../learn/04-compositing/alpha)

## 関連パターン

Deep-specific Patternは今後追加します。

## 似たNode・関連Node

- Merge — 2D Image
- Merge 3D — Classic 3D scene
- uMerge — USD scene

## バージョンと検証状況

dMergeはResolve/Fusion 20以降のDeep toolsetとしてBlackmagic Design公式バージョン資料で確認。Fusion 21.1での正確な設定項目 / sample rulesは未検証です。
