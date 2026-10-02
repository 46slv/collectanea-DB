---
title: Tracking結果がずれる / driftする
description: tracking solve・reference・application space・graphic offsetを分けてdrift原因を診断する。
doc_type: diagnostic
verification: partial
aliases: [track drift, trackingずれ, planar drift]
concepts: [tracking, coordinate-space]
patterns: [solve-then-apply-track]
nodes: [Planar Tracker]
tasks: [debug, track, attach-graphics]
symptoms: [tracking-drift, tracking-offset]
prerequisites: [tracking]
level: intermediate
product_scope: fusion
---

# Tracking結果がずれる / driftする

## Fast Checks

1. tracking solve単体でdriftしているか。
2. graphicを付けた後だけずれるか。
3. reference frame / track rangeは意図した範囲か。
4. trackingとgraphicでresolution / spaceが違わないか。
5. graphic側へ追加したmanual offset / animationが競合していないか。

## Isolate

```text
footage
  ↓
tracking solve
  ↓
apply transform
  ↓
graphic
```

solve outputとapplication後の2段階を別々に確認します。

## Likely Causes

### solve自体がdrift

tracking region / source feature / occlusion等、solve側の問題です。

### apply側だけずれる

tracking dataを別space / resolutionへ適用している可能性があります。

### reference offset

reference frameとgraphic初期位置の関係がずれている可能性があります。

### 二重animation

tracking dataとmanual keyframeが同じparameterを動かしている可能性があります。

## Fix

1. graphicを外してsolveを評価する。
2. reference / rangeを確認する。
3. application spaceを確認する。
4. manual offsetを一旦外す。
5. solve → apply → local adjustmentの順に戻す。

## Why

trackingは「motionを解く」と「別要素へmotionを適用する」の2責任に分けるとdiagnoseしやすくなります。

→ [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## Version / Exception Notes

Planar Trackerのexact solve mode / export / transform workflowはFusion 21.1 current documentationを優先します。

## Related Symptoms

- graphicが一定量だけoffsetする
-途中からdriftする
- scale / perspectiveだけ合わない
