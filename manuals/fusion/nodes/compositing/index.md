---
title: 合成ノード（Compositing）
description: 2D Imageを重ねる・多数Layerをまとめる・2入力を切り替える基本Nodeを、役割の違いから選ぶ。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, composite, layer]
updated: "2026-10-24"
---

# 合成ノード（Compositing）

このFamilyでは、複数の<Term id="image">2D Image</Term>を1つの結果へまとめる基本Nodeを扱います。

最初に区別すると分かりやすいのは、**重ねる**のか、**複数Layerを1か所で管理する**のか、**2入力を時間的・連続的に切り替える**のかです。

## まず選ぶ

| やりたいこと | Node | 考え方 |
| --- | --- | --- |
| 2枚を前景・背景として重ねる | [Merge](./merge) | 1回の合成判断を1 Nodeで行う |
| 多数の画像をLayerとしてまとめる | [MultiMerge](./multi-merge) | Layer Listで順序と個別Merge設定を管理する |
| 2入力をクロスフェードやWipeで切り替える | [Dissolve](./dissolve) | Background/Foregroundの混合率を動かす |

## Merge

```text
Foreground ─┐
            ├─ Merge → Image
Background ─┘
             ↑
           Mask
```

Mergeは、Backgroundを基準にForegroundを合成します。必要ならEffect Maskで合成範囲を限定します。

21.1 Manualでは、Backgroundへ接続した画像の解像度がMerge出力の解像度になります。Foreground側にはCenter、Size、Angleがあり、単純な配置なら別のTransformを追加せず調整できます。

### 実機の参考例

<!-- capture-reuse:R29 -->

Background1をBackground入力、Text1をForeground入力へ接続し、文字を背景へ重ねています。青いEffect Maskは未接続です。

[![S02の実機撮影例。Node Editorの接続](/img/fusion/captures/S02/graph.png)](/img/fusion/captures/S02/graph.png)

[![S02の実機撮影例。Viewerの出力結果](/img/fusion/captures/S02/result.png)](/img/fusion/captures/S02/result.png)

Resolve Studio 21.1.0.14／Windowsで撮影済みのS02を再利用した参考例です。Mergeの固定例です。MultiMergeのLayer ListやDissolveの解像度挙動は別途確認します。 [元の撮影条件と確認範囲](/img/fusion/captures/S02/capture.json)

## MultiMerge

```text
Background ─────┐
Foreground A ───┤
Foreground B ───┼─ MultiMerge → Image
Foreground C ───┤
                ┘
```

MultiMergeは、Foregroundを追加するたびに新しい入力とLayer Listの項目を増やします。上にあるLayerほど前景側です。

各Layerは独立したMerge controlsを持つため、位置・大きさ・合成方法などをLayer単位で管理できます。

### 実機の参考例

<!-- capture-reuse:R64 -->

MultiMergeではInspectorのLayer Listで重なり順を確認できます。掲載例はRed1をGold1より上にした状態で、右Viewerでは赤い長方形が楕円の前に重なります。

[![S27の実機撮影。Inspectorの設定](/img/fusion/captures/S27/inspector.png)](/img/fusion/captures/S27/inspector.png)

[![S27の実機撮影。Layer順を変えた出力](/img/fusion/captures/S27/order.png)](/img/fusion/captures/S27/order.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS27の参考例です。2つのLayerを使う固定例です。Split HereやLayer順のアニメーションは未確認です。 [撮影条件と確認範囲](/img/fusion/captures/S27/capture.json)

## Dissolve

```text
Background ─┐
            ├─ Dissolve → Image
Foreground ─┘
Gradient Map ──→ optional
```

Dissolveは、2枚を「上下へ重ねる」より、どちらをどの割合で出すかを切り替えるNodeです。

標準のDissolveだけでなく、Additive Dissolve、Erode、Random Dissolve、Random Noise Dissolve、Gradient Wipe、SMPTE Wipeを選べます。Gradient Wipeでは3つ目のGradient Map入力を使います。

## 解像度の違い

MergeとMultiMergeでは、Background入力が出力解像度の基準です。

Dissolveは挙動が異なります。両入力の解像度が違う場合、完全に片方へ振り切った状態ではその入力の解像度になり、中間で混ぜると大きい方の解像度になります。解像度が途中で変わる可能性があるため、Dissolveでは入力の解像度とPixel Aspectを揃える方が扱いやすくなります。

## MergeとMultiMergeの選び分け

Mergeを段階的につなぐと、中間結果をViewerで確認しやすく、各段へ別の処理も挟めます。

MultiMergeは、多数のLayerを1か所で並べ替えたり有効・無効を切り替えたりする場合に向いています。単にNode数を減らすことだけを理由に選ぶ必要はありません。

詳しい構成判断は[Merge chainとMultiMergeを選ぶ](../../patterns/compositing/choose-merge-vs-multimerge)を参照してください。

## 関連する考え方

- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)
- [合成量と演算（Blend / Operator）](../../learn/04-compositing/blend-operator)
- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 94、pp.2208–2223を基に、Dissolve / Merge / MultiMergeの入力、基本構成、解像度処理、主要Inspector項目を整理しています。

内部REGID、全Apply Modeの実機結果、GPU性能、Edition差はこのFamily Overviewでは確定していません。
