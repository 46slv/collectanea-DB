---
title: 記録方式・圧縮・4:2:2 / 10bit
description: 記録方式を選ぶときに分けて考える、圧縮方式・ビットレート・カラーサンプリング・ビット深度。
doc_type: concept
verification: partial
updated: 2026-10-21
tags: [camera, codec, recording, 10bit, 4:2:2]
tasks: [choose-recording-format, compositing, color-grading]
product_scope: camera
slug: /camera/concepts/recording-formats
---

# 記録方式・圧縮・4:2:2 / 10bit

カメラの「記録方式」は、1つの数字で画質が決まる設定ではありません。少なくとも、**圧縮方式・ビットレート・カラーサンプリング・ビット深度・解像度・フレームレート**を分けて読みます。

## Long GOPとIntra / ALL-Intra

Long GOPは、複数フレームの時間方向の関係を利用して圧縮します。同程度の画質を比較した場合、ファイル容量を抑えやすい一方、編集時のデコード負荷は構成によって高くなります。

Intra / ALL-Intraは各フレームを独立して圧縮します。ファイルは大きくなりやすいものの、フレーム単位で扱いやすいため、編集・合成を重視するワークフローで選択肢になります。

Sony FX3ではXAVC HS 4K / XAVC S 4KがLong GOP、XAVC S-I 4KがIntraとして整理されています。Panasonic S5IIXはALL-Intra記録に対応します。

## 4:2:2と4:2:0

4:2:2 / 4:2:0は、輝度に対して色差情報をどの密度で記録するかを表します。

4:2:2は4:2:0より水平方向の色情報を多く保持します。キーイングや強い色補正など、色情報を後処理で使う工程では判断材料になります。ただし、4:2:2だけで最終画質が決まるわけではありません。

## 8bitと10bit

8bitは1チャンネルあたり256段階、10bitは1024段階を表現できます。10bitはグラデーションやLog素材の後処理で階調を保持しやすくなります。

Sonyのヘルプガイドも、4:2:2 10bitをコンピューターでの編集を前提とした設定として説明しています。

## ビットレート

ビットレートは1秒あたりに記録するデータ量です。同じコーデック、解像度、フレームレートなどの条件なら、高い値は一般に圧縮を弱くできます。ただし、コーデックやGOP構造が違う数値を単純に大小だけで比較することはできません。

## 2機種で見る違い

| 項目 | Sony FX3 | Panasonic S5IIX |
| --- | --- | --- |
| Long GOP | XAVC HS 4K / XAVC S 4Kなど | H.264 / H.265系の動画記録 |
| Intra系 | XAVC S-I 4K / HD | ALL-Intra、Apple ProRes |
| 4:2:2 10bit | 対応 | 対応 |
| 外付けSSD直接記録 | このページでは対応を確認していない | USB接続SSDへ直接記録対応 |
| 高データレート記録 | XAVC S-I 4K 59.94pで600Mbpsの設定例 | ProRes 422 HQ最大1.9Gbps、4:2:2 10bit ALL-Intra最大800Mbps |

S5IIXの数値はPanasonicが公開している対応条件の最大値です。実際に選べる組み合わせは解像度・フレームレート・記録先などに依存します。

## 機種別操作

- [Sony FX3](../models/sony-fx3/index.md#記録方式を選ぶ)
- [Panasonic S5IIX](../models/panasonic-s5iix/index.md#記録とメディア)

## 出典

- Sony ILME-FX3 Ver.2以降 ヘルプガイド: https://helpguide.sony.net/ilc/2210/v1/ja/print.pdf
- Panasonic S5II / S5IIX「クリエイターの期待に応える映像表現」: https://panasonic.jp/dc/feature/S5M2-S5M2X/expression.html

確認日: 2026-10-21
