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

## 実機の参考例

<!-- capture-reuse:R65 -->

Text+→TransformAnimatedのS35です。Centerをフレーム0で(0.25, 0.5)、48で(0.75, 0.5)へ動かしました。左Viewerは元のText+、右が移動結果です。SplineにはCenter Xの数値ではなくPathのDisplacement 0〜1が表示されています。

[![S35の実機撮影。画像の接続Graph](/img/fusion/captures/S35/graph.png)](/img/fusion/captures/S35/graph.png)

[![S35の実機撮影。フレーム0のCenterのキー](/img/fusion/captures/S35/frame0-inspector.png)](/img/fusion/captures/S35/frame0-inspector.png)

[![S35の実機撮影。フレーム0の入力と移動結果](/img/fusion/captures/S35/frame0.png)](/img/fusion/captures/S35/frame0.png)

[![S35の実機撮影。フレーム48のCenterのキー](/img/fusion/captures/S35/inspector.png)](/img/fusion/captures/S35/inspector.png)

[![S35の実機撮影。フレーム48の入力と移動結果](/img/fusion/captures/S35/compare.png)](/img/fusion/captures/S35/compare.png)

[![S35の実機撮影。Path1のDisplacement曲線0から1](/img/fusion/captures/S35/spline.png)](/img/fusion/captures/S35/spline.png)

Resolve Studio 21.1.0.14／Windows、1920×1080、両Viewer 40%。緑の線と赤い軸は操作表示です。2キーと中間フレーム24のCenter(0.5, 0.5)を確認した例です。再生の滑らかさや、Splineで補間を変更した比較は未確認です。 [撮影条件と確認範囲](/img/fusion/captures/S35/capture.json)

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
