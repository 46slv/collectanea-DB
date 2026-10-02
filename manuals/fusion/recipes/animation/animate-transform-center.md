---
title: TransformをKeyframeで動かす
description: Transformの1つのposition parameterだけをKeyframeし、Splineでmotionを調整する最小Recipe。
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

## Result

Imageを2つの時点のposition間でanimationさせます。

## Requirements

- Image
- Transform

## Steps

1. ImageへTransformを追加します。
2. 最初のframeでposition parameterへKeyframeを作ります。
3. 後のframeへ移動します。
4. positionを変更し、2つ目のKeyframeを作ります。
5. 再生してmotionを確認します。
6. Spline Editorでcurveを確認し、必要なら補間を調整します。

```text
Image → Transform → Output

time A: position A
time B: position B
```

## Why This Works

Keyframeはtimeごとのparameter valueを持ち、Splineはその間の変化を調整します。

## Variants / Alternatives

- base layout用Transformとanimation用Transformを分ける。
- Size / Angle等を別parameterとしてanimationする。
- procedural relationが必要ならExpression / Modifierを使う。

## Failure Checks

- ViewerはTransform outputを見ているか。
- 2つのKeyframeでvalueが本当に違うか。
- current frameはKeyframe range内か。
- Expression / Modifierが同じparameterを駆動していないか。

## Related Pattern

- [Base値とAnimation Offsetを分ける](../../patterns/animation/base-and-animation-offset)

## Related Nodes

- [Transform](../../nodes/transform/transform)
