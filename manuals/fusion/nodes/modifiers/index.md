---
title: Modifier
description: Parameterへ値を供給し、Expression・Spline・Path・Shake・Follower等で時間変化や関係を作るModifierを目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, animate, drive-parameter]
updated: "2026-10-05"
---

# Modifier

Modifierは、Imageを直接処理するNodeではなく、別NodeのParameterへ値・animation・path・関係を供給します。

```text
Modifier → Parameter
```

## まず選ぶ

- Expression — 式で値を計算
- Bezier / Cubic Spline — animation curve
- Path / XY Path — Positionをpathで動かす
- Shake / Perturb — proceduralな揺れ
- Tracker / Track — tracking結果をParameterへ渡す
- From Image / Probe — Imageの値をParameterへ変換
- Offset / Vector — 値やvectorを加工
- Follower — Text+の文字ごとに時間差animation
- MIDI Extractor / Sound — 外部signalやaudioから値を作る

## 読み方

Modifierページでは「何のParameterへ、どんな値を返すか」を先に確認します。画像端子のようなInput / Outputを想定せず、Inspector内のControl connectionとして読むのが基本です。

## 出典と確認範囲

現行21.1 Manualと旧Fusion Tool ReferenceのModifier sectionを基に整理します。現行Manualで具体Controlが確認できないlegacy Modifierは、役割・値型を説明し、exact default / rangeは推測しません。
