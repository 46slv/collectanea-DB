---
title: Time / Metadata / Utilityノード
description: retime・frame timing・metadata・domain・bit depth・custom scriptingなど、Imageの時間や付帯情報を変更するNodeを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, retime, metadata]
updated: "2026-10-05"
---

# Time / Metadata / Utilityノード

このFamilyは「見た目のEffect」より、Imageが**いつ評価されるか / どんなmetadataやdomainを持つか / どのprecisionで扱うか**を変更します。

## Time

- Time Speed — speed比率でretime
- Time Stretcher — source timeを直接mapping
- Speed Warp — motion-estimationを使う高品質retime
- Fields — field / interlace処理
- Keyframe Stretcher系はModifier側でparameter timingを扱う

## Metadata / Domain

- Set Metadata / Copy Metadata — metadataを追加 / コピー
- Set Timecode — timecodeを書き換える
- Auto Domain / Set Domain — Domain of Definitionを調整
- Change Depth — Image bit depthを変更

## Custom / External

- Custom Tool — 数式でchannel / pixel処理
- Run Command — 外部commandをtrigger

## 注意

Time系Nodeはframe evaluation、Domain系NodeはDoD、metadata系Nodeは画素そのものと別の情報を扱います。見た目が変わらない場合でもdownstream behaviorが変わることがあります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference ManualのTime / Metadata / Utility sectionと旧Fusion Tool Referenceを基に整理します。
