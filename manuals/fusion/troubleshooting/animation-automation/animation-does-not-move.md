---
title: Keyframeを置いたのにAnimationしない
description: current time・parameter source・keyframe range・Viewer targetを分離して診断する。
doc_type: diagnostic
verification: partial
aliases: [Animationしない, keyframe not moving]
concepts: [keyframes, frame-evaluation, parameter-source]
tasks: [debug, animate]
symptoms: [animation-not-moving, keyframe-no-effect]
prerequisites: [keyframes, frame-evaluation]
level: foundation
product_scope: fusion
---

# Keyframeを置いたのにAnimationしない

## Fast Checks

1. 動かしたいparameterにkeyframeがあるか。
2. 2つ以上の異なるtimeで異なるvalueを持っているか。
3. current frameはkeyframe range内か。
4. Viewerは対象Nodeの結果を見ているか。
5. Expression / Modifier等がparameter sourceを置き換えていないか。

## Isolate

1つのparameterだけを対象にします。

```text
frame A: value A
frame B: value B
```

まずこの2点だけで変化が見えることを確認します。

## Likely Causes

### Keyframe間でvalueが同じ

timeは違っても結果が変わりません。

### 別parameterを見ている

CenterとPivot等、似たcontrolを混同している可能性があります。

### Viewer targetが違う

animation対象Nodeではなくupstream NodeをViewerへ出している可能性があります。

### Parameter sourceが別

Expression / Modifier等が最終値を決めている場合があります。

## Fix

1. 1 parameter / 2 keyframeへ縮める。
2. Viewer targetを確認。
3. parameter sourceを確認。
4. Spline Editorでcurveを確認。
5. 徐々に他animationを戻す。

## Why

animationはNode全体ではなく、current timeに対してparameter valueがどう供給されるかの問題です。

→ [Frame Evaluation](../../learn/05-time/frame-evaluation)

## Version / Exception Notes

Spline / Keyframe Editorのexact UIはcurrent Resolve / Fusion versionを確認します。

## Related Symptoms

- Expressionでは動くがkeyframeでは動かない
- Splineが見つからない
- 一部frameだけ値が違う
