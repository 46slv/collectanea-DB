---
title: Stereo 3Dノード
description: left / right eyeのalignment・disparity・depth変換・view合成を行うStereo toolを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, stereo, disparity]
updated: "2026-10-05"
---

# Stereo 3Dノード

Stereo系Nodeは、left / right eye Imageの位置関係とdisparityを扱います。

## 役割別

- Stereo Align / Global Align — left / right eyeの位置合わせ
- Disparity — 2眼差からdisparity mapを作る
- Disparity to Z / Z to Disparity — disparityとdepthを変換
- Splitter / Combiner — stereo packingを分離 / 統合
- Anaglyph — red/cyan等の確認用viewを作る
- New Eye — existing disparityから仮想eyeを生成
- Z to World — depthをworld positionへ変換
- Volume Fog / Volume Mask — stereo / depth情報を使うvolume処理

## 注意

2眼のImage、disparity map、Z depthは同じdataではありません。どの表現をInputが要求するかを確認して接続します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference ManualのStereo sectionと旧Fusion Tool Referenceを基に整理します。camera rig / delivery format固有の設定は別途確認が必要です。
