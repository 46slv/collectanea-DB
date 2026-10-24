---
title: 透明エッジ（Edge）を保って色補正する（Color Correct）
description: 透明部分を持つ前景（Foreground）を色補正するとき、プリマルチプライ（Premultiplication）とマット（Matte）を分けて考え、エッジの乱れを避ける構造。
doc_type: recipe
verification: partial
aliases: [color correct transparent edge, premult color correction]
concepts: [alpha, premultiplication, color-adjustment]
patterns: [premult-aware-color-operation]
nodes: [Alpha Divide, Color Corrector, Alpha Multiply]
tasks: [color-correct, transparency, alpha]
prerequisites: [alpha, premultiplication]
level: intermediate
product_scope: fusion
---

# 透明エッジ（Edge）を保って色補正する（Color Correct）

> 必ずAlpha Divide / Multiplyが必要という意味ではありません。Color Node自身のpremult-aware 設定がある場合は、現在のFusion 21.1 挙動を確認して二重処理を避けます。

## 作るもの

透明部分を持つ前景（Foreground）へ色処理（Color operation）を加えつつ、edge RGB / Alpha 関係を壊さない構造を作ります。

## 必要なもの

- Alphaを持つ前景（Foreground）
- 色処理を行うNode
- 参照元とNodeの挙動に応じたプリマルチプライの扱い

## 手順

1. 前景（Foreground）単体でAlphaとedgeを確認します。
2. 色処理（Color operation）を一度適用し、エッジの乱れ（artifact）が出るか確認します。
3. プリマルチプライの関係が原因と判断できる場合、明示的なAlpha Divide / Alpha Multiply構造を検討します。
4. 色処理（Color operation）前へAlpha Divide、後へAlpha Multiplyを置きます。
5. Merge前の前景（Foreground）単体を再確認します。
6. 最終合成でエッジ（Edge）を確認します。

```text
Foreground
  → Alpha Divide
  → Color Corrector
  → Alpha Multiply
  → Merge
```

## 実機例：出力下限を上げて透明部分への影響を比較する

<!-- capture-reuse:R118 -->

1. Backgroundに柔らかいEllipseを接続し、青い前景を作ります。
2. 一方はColor Correctorへ直接、もう一方はAlpha Divide→Color Corrector→Alpha Multiplyへ接続します。
3. 両方のCorrectionをLevels、Master／RGBにし、出力下限を0.2、上限を1へ合わせます。内部Pre-Divide / Post-Multiplyは両方オフにします。
4. 同じ暗い背景へMergeし、左の直接補正では背景まで灰色になり、右では暗い背景を保つことを確認します。

[![共通の楕円前景を直接補正とAlpha DivideからAlpha Multiplyまでの補正へ分け、同じ背景へ合成した実機Graph](/img/fusion/captures/S74/graph.png)](/img/fusion/captures/S74/graph.png)

[![ColorStraightのLevelsでMaster RGBの出力下限0.2、上限1を設定したInspector](/img/fusion/captures/S74/correct-inspector.png)](/img/fusion/captures/S74/correct-inspector.png)

[![左の直接補正では背景が灰色に持ち上がり、右のDivideとMultiplyを通す補正では暗い背景を保つ](/img/fusion/captures/S74/compare.png)](/img/fusion/captures/S74/compare.png)

[![ColorDirectのOptionsで処理前に除算、処理後に乗算のチェックをオンにしたInspector](/img/fusion/captures/S74/builtin-options.png)](/img/fusion/captures/S74/builtin-options.png)

[![左のColor Corrector内蔵前後処理と、右の明示的なDivideとMultiply構成が同じ見た目になる](/img/fusion/captures/S74/builtin.png)](/img/fusion/captures/S74/builtin.png)

補正1つだけで済む場合は、左のColor CorrectorでOptionsのPre-Divide / Post-Multiplyをオンにします。最後の実機比較では、明示的な前後処理と同じ見た目になりました。手元の素材へ適用するときは、読み込み時のAlpha解釈から確認してください。

Resolve Studio21.1.0.14／WindowsのFusionページで、1920×1080の合成を作りました。両ViewerはColor／40%。左のMergeNaiveは直接補正、右のMergeCorrectはAlpha Divide→補正→Alpha Multiplyの結果です。 この固定例の表示と保存Graphを確認しました。実写のキーイング素材、外部OFX、Effect Mask、Alphaが0に近い画素の数値、HDRと性能は未確認です。 詳しい[接続と比較条件](../../nodes/matte-keying/alpha-divide)はAlpha Divideの実機例に記録しています。

[再現用Graph](/img/fusion/captures/S74/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S74/capture.json)

## この構成で動く理由

色処理（Color operation）をストレートRGB（straight RGB）側で行い、合成前にプリマルチプライの関係へ戻すことで、透明エッジ（Edge）のRGBを扱いやすくする構造です。

## 別の方法

- Color Corrector側の前後処理の設定（pre/post 設定）を使う。
- Matte Controlでマット（Matte）の形状を別段階として修正する。
- Keyer後の色かぶり（spill）/ エッジ処理を独立させる。

## うまくいかないとき

- 参照元が本当にpremultipliedか。
- Color Node側ですでにプリマルチプライ対応の処理をしていないか。
- Alpha Divide / Multiplyを二重に使っていないか。
- エッジ（Edge）の問題がマット（Matte）の形状由来ではないか。

## 関連パターン

- [アルファ（Alpha）を保ったまま色処理する](../../patterns/color-alpha/premult-aware-color-operation)

## 関連Node

- [Alpha Divide](../../nodes/matte-keying/alpha-divide)
- [Color Corrector](../../nodes/color/color-corrector)
- [Alpha Multiply](../../nodes/matte-keying/alpha-multiply)
