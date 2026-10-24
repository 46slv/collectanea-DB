---
title: Alphaを保ったまま色処理（Color operation）する
description: transparent edgeを持つImageでpremultiplicationを意識し、color処理とAlpha 関係を分離するPattern。
doc_type: pattern
verification: partial
aliases: [premult aware color, alpha divide multiply]
concepts: [alpha, premultiplication, color-adjustment]
patterns: [premult-aware-color-operation]
nodes: [Alpha Divide, Alpha Multiply, Color Corrector]
tasks: [color-correct, transparency, alpha, debug]
level: intermediate
product_scope: fusion
---

# Alphaを保ったまま色処理（Color operation）する

## 使う場面

透明エッジ（Edge）を持つ前景（Foreground）へ強い色処理（Color operation）を行うと、黒縁・白縁・ハロー（Halo）が出る問題です。

## 前提となる考え方

- [Alpha](../../learn/04-compositing/alpha)
- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)

## 基本構成

必要な場合のconceptual 構造:

```text
premultiplied Image
      ↓
 Alpha Divide
      ↓
 color operation
      ↓
 Alpha Multiply
      ↓
 composite
```

## 保つべき条件

- 参照元のpremult状態を確認する。
- color operationの前後でRGB / Alpha 関係を意識する。
- Node自身にpre-divide / post-multiply相当機能がある場合は二重処理しない。
- マット（Matte）の形状の問題とpremultiplication問題を分ける。
- effect maskでエッジの乱れ（artifact）を隠して原因解決としない。

## バリエーション

### Node-managed

Color Node自身のpremult-aware 設定を使う。

### 明示的に前後処理する方法

Alpha Divide → color → Alpha Multiplyを明示する。

### キーイング pipeline

Keyer / Matte Control後にcolor operationを行い、Merge前でpremult 関係を確認する。

## 失敗しやすい点

- straight / premult状態を確認せずpairを挿入する。
- Alpha Divideだけ入れて再premultiplyせず合成する。
- Node側の自動処理とexplicit pairを二重に使う。
- エッジのマット（Matte）の問題をpremultだけで直そうとする。

## 実機例：前後処理をGraph上で分ける

<!-- capture-reuse:R117 -->

同じ青い前景を上段の直接補正と、下段のAlpha Divide→補正→Alpha Multiplyへ分岐しました。どちらもColor CorrectorのMaster RGB出力下限0.2ですが、左は背景まで持ち上がり、右は暗い背景を保ちます。

[![共通の楕円前景を直接補正とAlpha DivideからAlpha Multiplyまでの補正へ分け、同じ背景へ合成した実機Graph](/img/fusion/captures/S74/graph.png)](/img/fusion/captures/S74/graph.png)

[![左の直接補正では背景が灰色に持ち上がり、右のDivideとMultiplyを通す補正では暗い背景を保つ](/img/fusion/captures/S74/compare.png)](/img/fusion/captures/S74/compare.png)

この例は補正1つで処理順を見える形にしたものです。複数補正や外部OFXの動作をまとめて確認した例ではありません。下段のColor Corrector内蔵前後処理はオフです。

Resolve Studio21.1.0.14／WindowsのFusionページで、1920×1080の合成を作りました。両ViewerはColor／40%。左のMergeNaiveは直接補正、右のMergeCorrectはAlpha Divide→補正→Alpha Multiplyの結果です。 この固定例の表示と保存Graphを確認しました。実写のキーイング素材、外部OFX、Effect Mask、Alphaが0に近い画素の数値、HDRと性能は未確認です。 詳しい[接続と比較条件](../../nodes/matte-keying/alpha-divide)はAlpha Divideの実機例に記録しています。

[再現用Graph](/img/fusion/captures/S74/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S74/capture.json)

## この構成を使う手順

- [透明エッジ（Edge）を保って色補正する（Color Correct）](../../recipes/color/transparent-edge-color-correction)

## 関連Node

- [Alpha Divide](../../nodes/matte-keying/alpha-divide)
- [Alpha Multiply](../../nodes/matte-keying/alpha-multiply)
- [Color Corrector](../../nodes/color/color-corrector)
