---
title: TransformをKeyframeで動かす
description: Transformの1つのposition パラメータだけをKeyframeし、Splineで動きを調整する最小Recipe。
doc_type: recipe
verification: partial
aliases: [animate transform, keyframe center]
concepts: [keyframes, frame-evaluation, transform-controls]
patterns: [base-and-animation-offset]
nodes: [Transform]
tasks: [animate, move, motion-graphics]
prerequisites: [keyframes, transform-controls]
level: foundation
product_scope: fusion
---

# TransformをKeyframeで動かす

## できあがるもの

Imageを2つの時点のposition間でアニメーションさせます。

## 必要なもの

- Image
- Transform

## 手順

1. ImageへTransformを追加します。
2. 最初のフレームでposition パラメータへKeyframeを作ります。
3. 後のフレームへ移動します。
4. positionを変更し、2つ目のKeyframeを作ります。
5. 再生して動きを確認します。
6. Spline Editorでcurveを確認し、必要なら補間を調整します。

```text
Image → Transform → Output

time A: position A
time B: position B
```

## この構成にする理由

Keyframeはtimeごとのパラメータ 値を持ち、Splineはその間の変化を調整します。

## 別の方法

- base 配置用Transformとアニメーション用Transformを分ける。
- Size / Angle等を別パラメータとしてアニメーションする。
- procedural 関係が必要ならExpression / Modifierを使う。

## うまくいかないとき

- ViewerはTransform outputを見ているか。
- 2つのKeyframeで値が本当に違うか。
- 現在の フレームはKeyframe 範囲内か。
- Expression / Modifierが同じパラメータを駆動していないか。

## 関連パターン

- [基準値とアニメーションのオフセット（Offset）を分ける](../../patterns/animation/base-and-animation-offset)

## 関連Node

- [Transform](../../nodes/transform/transform)
