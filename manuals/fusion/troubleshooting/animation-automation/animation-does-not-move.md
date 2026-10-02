---
title: Keyframeを置いたのにアニメーションしない
description: 現在の time・パラメータの供給元・keyframe 範囲・Viewer 対象を分離して診断する。
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

# Keyframeを置いたのにアニメーションしない

## まず確認すること（Fast Checks）

1. 動かしたいパラメータにkeyframeがあるか。
2. 2つ以上の異なるtimeで異なる値を持っているか。
3. 現在の フレームはkeyframe 範囲内か。
4. Viewerは対象Nodeの結果を見ているか。
5. Expression / Modifier等がパラメータの供給元を置き換えていないか。

## 原因を切り分ける（Isolate）

1つのパラメータだけを対象にします。

```text
frame A: value A
frame B: value B
```

まずこの2点だけで変化が見えることを確認します。

## 主な原因（Likely Causes）

### Keyframe間で値が同じ

timeは違っても結果が変わりません。

### 別パラメータを見ている

CenterとPivot等、似たcontrolを混同している可能性があります。

### Viewer 対象が違う

アニメーション対象Nodeではなくupstream NodeをViewerへ出している可能性があります。

### パラメータの供給元が別

Expression / Modifier等が最終値を決めている場合があります。

## 修正方法（Fix）

1. 1 パラメータ / 2 keyframeへ縮める。
2. Viewer 対象を確認。
3. パラメータの供給元を確認。
4. Spline Editorでcurveを確認。
5. 徐々に他アニメーションを戻す。

## なぜ起きるか（Why）

アニメーションはNode全体ではなく、現在の timeに対してパラメータ 値がどう供給されるかの問題です。

→ [フレーム 評価](../../learn/05-time/frame-evaluation)

## バージョン・例外（Version / Exception Notes）

Spline / Keyframe Editorの正確なUI表記は現在の Resolve / Fusion versionを確認します。

## 関連する症状（Related Symptoms）

- Expressionでは動くがkeyframeでは動かない
- Splineが見つからない
- 一部フレームだけ値が違う
