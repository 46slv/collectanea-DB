---
title: uLoader
description: .usd / .usda / .usdc / .usdzをFusionへ読み込み、Trim・Time Scale・Frame Offset・Reverse・Loopでanimation timingを調整するUSD Loader。
doc_type: node
term_id: uloader
verification: partial
aliases: [uLoader, uLd]
concepts: [usd-scene, time]
nodes: [uLoader]
node_family: usd
controls: [Filename, Trim, Time Scale, Frame Offset, Reverse, Loop, Reload]
outputs: [usd]
tasks: [usd, load-usd, import-scene]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uLoader

uLoaderは、USD fileをFusionへ読み込み、<Term id="usd-scene">USD scene</Term>として出力するNodeです。

21.1 Manualでは `.usd`、`.usda`、`.usdc`、`.usdz`を読み込めます。

## 入力 / 出力

外部Node inputはありません。

FilenameでUSD fileを指定し、scene outputをuMergeや他のUSD Nodeへ渡します。

```text
uLoader → uMerge → uRenderer
```

## Filename / Reload

Filenameでsource USD fileを選びます。

外部DCCでUSDを更新した後はReloadで同じpathを読み直せます。Node graphを作り直さずsource assetを更新できます。

## Animation timing

### Trim

USD内animationの使う範囲を指定します。

### Time Scale

animation speedを速く / 遅くします。

### Frame Offset

animation開始位置をTimeline上でずらします。

### Reverse / Loop

Reverseで逆再生、Loopで繰り返します。

## MaterialXとの関係

ManualではuLoaderからMaterialX fileを読み込み、uReplaceMaterialでsceneのmaterialへ適用するworkflowも説明されています。

material fileだけを明示的にloadする場合は[uMaterialX](./umaterialx)も使えます。

## 最小構成

```text
uLoader ───┐
uCamera ───┼─ uMerge → uRenderer → MediaOut
uLight ────┘
```

## 関連Node

- [uMerge](./u-merge)
- [uRenderer](./u-renderer)
- [uTransform](./utransform)
- [uExport](./uexport)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2902–2903で、対応format、inputなし、Filename、Trim、Time Scale、Frame Offset、Reverse、Loop、Reloadを確認しました。

payload / layer compositionの詳細、external asset互換性、runtime性能は未確認です。
