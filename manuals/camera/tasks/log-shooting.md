---
title: Logで撮影する
description: Log撮影で共通して確認する項目と、FX3 / S5IIXでの違い。
doc_type: task
verification: partial
updated: 2026-10-13
tags: [camera, log, exposure, lut]
tasks: [shoot-log, expose-log, monitor-log]
product_scope: camera
slug: /camera/tasks/log-shooting
---

# Logで撮影する

Log撮影では、Logカーブを選ぶだけでなく、**記録するLog / Gamut、露出の考え方、モニター表示、記録方式**を一緒に確認します。

カメラによってISOを直接変える方式、Base ISOを固定してEIでモニター上の露出意図を管理する方式などがあるため、機能名だけを別機種へ置き換えると設定の意味が変わることがあります。

## 共通して確認する項目

1. Log / Gamutが何に設定されているか
2. ISOまたはEIが何を変更しているか
3. LUTやビューアシストが記録へ焼き込まれるのか、表示だけなのか
4. 記録が8bitか10bitか
5. ホワイトバランスをどう管理するか
6. 収録後のカラー管理で何として解釈するか

## Sony FX3

FX3 Ver.2以降では、［Log撮影設定］に次のモードがあります。

- **Flexible ISO**: ISO感度を変更してS-Log素材を記録する
- **Cine EI Quick**: Base ISOで記録し、EIに連動してBase ISOを自動で切り替える
- **Cine EI**: Base ISOを選び、EIで撮影時のモニター上の露出意図を確認する

操作経路とBase ISO / EIの詳細は[Sony FX3](../models/sony-fx3/index.md#log撮影)にまとめています。

## Panasonic S5IIX

S5IIXはV-Log / V-Gamutに対応します。PanasonicはV-Logで14+ストップのダイナミックレンジを公称しています。

この初期版では、V-Logを有効にする具体的なメニュー階層までは一次資料で再確認していません。そのため、機能対応と記録特性だけを掲載し、操作経路は推測で追加していません。

→ [Panasonic S5IIX](../models/panasonic-s5iix/index.md#v-log--v-gamut)

## 出典

- Sony ILME-FX3 Ver.2以降 ヘルプガイド「Log撮影設定」「Exposure Index」: https://helpguide.sony.net/ilc/2210/v1/ja/print.pdf
- Panasonic S5II / S5IIX「V-Log / V-Gamut撮影機能」: https://panasonic.jp/dc/feature/S5M2-S5M2X/expression.html

確認日: 2026-10-13
