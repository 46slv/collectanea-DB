---
title: Sony FX3
description: Sony FX3の記録方式、動画設定、Log / Cine EIを中心にした機種別操作ガイド。
doc_type: model
verification: partial
updated: 2026-10-21
tags: [camera, Sony, FX3, XAVC, S-Log3, Cine-EI]
tasks: [choose-recording-format, shoot-log]
product_scope: camera
aliases: [ILME-FX3]
slug: /camera/models/sony-fx3
---

# Sony FX3

このページはILME-FX3の動画撮影操作を、共通知識から参照できる形で整理します。Log撮影については**Ver.2以降**のSony公式ヘルプガイドを基準にしています。FX3Aは別機種として扱い、同じ操作と確認できるまでは混同しません。

## 記録方式を選ぶ

FX3の動画記録では、記録方式を先に選び、その後でフレームレートと記録設定を選びます。

代表的な違い:

| 記録方式 | 圧縮 | 主な特徴 |
| --- | --- | --- |
| XAVC HS 4K | HEVC / Long GOP | 4Kの圧縮効率を重視した選択肢 |
| XAVC S 4K | Long GOP | 4Kの標準的なXAVC S記録 |
| XAVC S HD | Long GOP | Full HD記録 |
| XAVC S-I 4K | Intra | 4Kをフレーム内圧縮で記録 |
| XAVC S-I HD | Intra | Full HDをフレーム内圧縮で記録 |

圧縮方式や4:2:2 / 10bitの意味は[記録方式・圧縮・4:2:2 / 10bit](../../concepts/recording-formats.md)を参照してください。

### フレームレートと記録設定

操作:

1. `MENU → 撮影 → 画質/記録 → 動画設定 → 記録フレームレート`
2. `MENU → 撮影 → 画質/記録 → 動画設定 → 記録設定`

画面に表示される `200M 4:2:2 10bit` のような表記は、ビットレート、カラーサンプリング、ビット深度を組み合わせたものです。

代表例:

| 記録方式 | フレームレート | 記録設定 | 圧縮 |
| --- | ---: | --- | --- |
| XAVC HS 4K | 59.94p | 200M 4:2:2 10bit | Long GOP |
| XAVC S 4K | 59.94p | 200M 4:2:2 10bit | Long GOP |
| XAVC S-I 4K | 59.94p | 600M 4:2:2 10bit | Intra |
| XAVC S-I 4K | 23.98p | 240M 4:2:2 10bit | Intra |

NTSC / PAL設定や記録方式によって選択肢は変わります。全組み合わせはSony公式ヘルプガイドの表を参照してください。

## Log撮影

Log撮影設定:

`MENU → 撮影 → 画質/記録 → Log撮影設定`

［Log撮影］では次を選択できます。

- 切
- Flexible ISO
- Cine EI Quick
- Cine EI

色域は `S-Gamut3.Cine / S-Log3` または `S-Gamut3 / S-Log3` を選択できます。

### Flexible ISO

撮影シーンに合わせてISO感度を変更しながらS-Log素材を記録します。

### Cine EI Quick

記録自体はBase ISOで行います。EIを変更すると、それに合わせてBase ISOが自動的に切り替わります。

### Cine EI

Base ISOを選択したうえで記録し、EIでモニター上の露出意図を確認します。EIを変えても、記録時のISO感度そのものをEI値へ変更する操作ではありません。

### Base ISO

操作:

`MENU → 露出/色 → 露出 → Base ISO`

### Exposure Index

操作:

`MENU → 露出/色 → 露出 → Exposure Index`

Sony公式ヘルプガイドでは、Base ISOがISO 800のとき200EI〜3200EI、ISO 12800のとき3200EI〜51200EIを選択できます。

### 設定後の画面確認

Cine EI / Cine EI Quickでは、動画撮影画面のISO表示位置にEI値、ラチチュード、Base ISOの状態が表示されます。低感度側Base ISOは `L`、高感度側は `H` と表示されます。

Log撮影全体の考え方は[Logで撮影する](../../tasks/log-shooting.md)を参照してください。

## 今後このページへ統合する操作

AF、ホワイトバランス、XLRハンドル、S&Q、タイムコード、HDMI / RAW出力は、公式資料で操作経路とファームウェア差を確認した順に追記します。未確認のメニュー階層は推測で埋めません。

## 出典

- Sony ILME-FX3 Ver.2以降 ヘルプガイド: https://helpguide.sony.net/ilc/2210/v1/ja/print.pdf
- Sony ILME-FX3 製品仕様: https://www.sony.jp/pro-cam/products/ILME-FX3/spec.html

確認日: 2026-10-21
