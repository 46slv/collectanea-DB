---
title: トラッキング結果がずれる / driftする
description: トラッキング solve・reference・application space・graphic offsetを分けてdrift原因を診断する。
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

# トラッキング結果がずれる / driftする

## まず確認すること（Fast Checks）

1. トラッキング solve単体でdriftしているか。
2. graphicを付けた後だけずれるか。
3. reference フレーム / track 範囲は意図した範囲か。
4. トラッキングとgraphicでresolution / spaceが違わないか。
5. graphic側へ追加した手動オフセット / アニメーションが競合していないか。

## 原因を切り分ける（Isolate）

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

## 主な原因（Likely Causes）

### solve自体がdrift

トラッキング region / 参照元 feature / occlusion等、solve側の問題です。

### apply側だけずれる

トラッキング dataを別space / resolutionへ適用している可能性があります。

### 参照オフセット（reference offset）

reference フレームとgraphic初期位置の関係がずれている可能性があります。

### 二重アニメーション

トラッキング dataとmanual keyframeが同じパラメータを動かしている可能性があります。

## 修正方法（Fix）

1. graphicを外してsolveを評価する。
2. reference / 範囲を確認する。
3. application spaceを確認する。
4. 手動オフセットを一旦外す。
5. solve → apply → 個別調整の順に戻す。

## なぜ起きるか（Why）

トラッキングは「動きを解く」と「別要素へ動きを適用する」の2責任に分けるとdiagnoseしやすくなります。

→ [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## バージョン・例外（Version / Exception Notes）

Planar Trackerの正確な solve mode / export / transform 作業の流れはFusion 21.1 現在の 資料を優先します。

## 関連する症状（Related Symptoms）

- graphicが一定量だけoffsetする
-途中からdriftする
- scale / perspectiveだけ合わない
