---
title: 透明Edgeの色や縁がおかしい
description: matte形状・RGB・Alpha・premultiplicationを分離して透明エッジの乱れ（artifact）を診断する。
doc_type: diagnostic
verification: partial
aliases: [黒縁, 白縁, alpha fringe, transparent edge]
concepts: [alpha, premultiplication, matte]
nodes: [Merge, Color Corrector, Delta Keyer]
tasks: [debug, transparency, color-correct, key]
symptoms: [alpha-fringe, dark-edge, bright-edge]
prerequisites: [alpha, premultiplication]
level: intermediate
product_scope: fusion
---
# 透明Edgeの色や縁がおかしい

## まず確認すること

1. 参照元単体ですでにエッジの乱れ（artifact）があるか。
2. <Term id="alpha">Alpha</Term> shape自体は正しいか。
3. color correction前は正常か。
4. Merge前の前景（<Term id="foreground-background-mask">Foreground</Term>）単体で問題があるか。
5. straight / premultipliedの前提を混同していないか。

## 原因の切り分け

```text
source
  → matte / key
  → color operation
  → composite
```

各段階を<Term id="intermediate-results-viewer">Viewer</Term>で確認し、どこからedgeが変わるか特定します。

## 主な原因

### Matte shapeが不十分

key / matte refinementの問題です。

### RGB edgeとAlphaの関係が不適切

premultiplicationを疑います。

### 色処理で透明部分のRGBが変化

alpha-awareな処理順を確認します。

### Merge後だけ問題が出る

Foreground / Background / Operator側へ調査範囲を移します。

## 修正方法

原因段階を1つに絞り、その責任だけを修正します。

premultiplicationを直すためにkey thresholdを無理に変更する、など別責任で補正しないようにします。

## なぜ起きるか

Alpha shapeとedge RGBは別情報で、premultiplicationはその関係を扱います。

→ [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)

## 実機例：色補正で背景まで持ち上がる場合

<!-- capture-reuse:R119 -->

最初は両方の色補正の出力下限0、次は0.2です。楕円マットとMergeの背景は固定しています。下限0では両方とも暗い背景ですが、0.2へ変えると直接補正した左だけが背景まで灰色になります。

[![両方のColor Correctorの出力下限を0にすると、左右とも暗い背景に青い楕円が合成される](/img/fusion/captures/S74/baseline.png)](/img/fusion/captures/S74/baseline.png)

[![左の直接補正では背景が灰色に持ち上がり、右のDivideとMultiplyを通す補正では暗い背景を保つ](/img/fusion/captures/S74/compare.png)](/img/fusion/captures/S74/compare.png)

この場合はマットの形状を削る前に、色補正前後のRGBとAlphaの関係を調べます。右のDivide→補正→Multiply構成では暗い背景を保ちました。この1例で黒縁・白縁の全原因を診断できるとはしていません。

Resolve Studio21.1.0.14／WindowsのFusionページで、1920×1080の合成を作りました。両ViewerはColor／40%。左のMergeNaiveは直接補正、右のMergeCorrectはAlpha Divide→補正→Alpha Multiplyの結果です。 この固定例の表示と保存Graphを確認しました。実写のキーイング素材、外部OFX、Effect Mask、Alphaが0に近い画素の数値、HDRと性能は未確認です。 詳しい[接続と比較条件](../../nodes/matte-keying/alpha-divide)はAlpha Divideの実機例に記録しています。

[再現用Graph](/img/fusion/captures/S74/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S74/capture.json)

## バージョン・例外

Node固有のpre-divide / post-multiply等の設定は現在の 21.1 Referenceで確認します。

## 関連する症状

- keyは抜けているが縁だけ暗い
- color correction後だけ縁が変わる
- Mergeしたときだけhaloが出る
