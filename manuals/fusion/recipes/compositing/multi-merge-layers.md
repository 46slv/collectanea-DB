---
title: 複数ImageをMultiMergeでまとめる
description: Backgroundと複数ForegroundをMultiMergeへ接続し、Layer Listで順序・有効状態・個別設定を管理するRecipe。
doc_type: recipe
verification: partial
aliases: [multi layer composite, MultiMerge layers]
concepts: [compositing, foreground-background]
patterns: [choose-merge-vs-multimerge]
nodes: [MultiMerge]
tasks: [composite, layer, multi-layer]
prerequisites: [foreground-background]
level: intermediate
product_scope: fusion
updated: "2026-10-04"
---

# 複数ImageをMultiMergeでまとめる

## できあがるもの

Backgroundの上へ、複数のImageをLayerとして重ねます。

```text
Background ─────┐
Title ──────────┤
Logo ───────────┼─ MultiMerge → Output
Graphic ────────┤
                ┘
```

## 必要なもの

- Background Image
- 2枚以上のForeground Image
- MultiMerge

## 手順

1. Backgroundをオレンジ色Background入力へ接続します。
2. 1枚目のForegroundをMultiMergeへ接続します。
3. 追加のForegroundを順番にMultiMergeへ接続します。
4. InspectorのLayer Listで、接続した要素がLayerとして増えていることを確認します。
5. Layerを上下へドラッグして合成順を決めます。
6. Layerを1つ選び、Inspector下部のMerge controlsで位置・大きさ・合成方法を調整します。
7. 一時的に外したいLayerはチェックを外してDisableします。
8. OutputをViewerで確認します。

## Layer順を読む

Layer Listでは、上にあるLayerほど前景側です。

Node Graph上の上下位置ではなく、Layer Listの順番がMultiMerge内の重なり順になります。

### 実機の参考例

<!-- capture-reuse:R61 -->

青いBase1の上へ、赤い長方形のRed1とオレンジの楕円のGold1を重ねた例です。最初はGold1が上で、無効にすると楕円だけが消えます。有効に戻してRed1を上へ並べ替えると、長方形が前に重なります。

[![S27の実機撮影。Node Editorの接続](/img/fusion/captures/S27/graph.png)](/img/fusion/captures/S27/graph.png)

[![S27の実機撮影。Inspectorの設定](/img/fusion/captures/S27/inspector.png)](/img/fusion/captures/S27/inspector.png)

[![S27の実機撮影。左右Viewerの比較](/img/fusion/captures/S27/compare.png)](/img/fusion/captures/S27/compare.png)

[![S27の実機撮影。Layer無効時の出力](/img/fusion/captures/S27/disabled.png)](/img/fusion/captures/S27/disabled.png)

[![S27の実機撮影。Layer順を変えた出力](/img/fusion/captures/S27/order.png)](/img/fusion/captures/S27/order.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS27の参考例です。Rename、素材差し替え、Split Here、順序のKeyframe化は含めていません。再現用Graphは最後のRed1が上の状態です。 [撮影条件と確認範囲](/img/fusion/captures/S27/capture.json)

## 素材を差し替える

入力pipeを外してもLayerは削除されず、Layer名に取り消し線が表示されます。

その位置へ別のImageを接続し直せるため、Layer順や設定を残したまま素材だけ差し替えられます。

## Layerが増えすぎた場合

Layerを右クリックして `Split Here` を使うと、選択位置から上側を新しいMultiMergeへ分割できます。

1つの巨大なLayer Listへ全部押し込むより、意味の違うまとまりを分割した方がGraphを追いやすい場合があります。

## うまくいかないとき

- Backgroundが意図したImageか。
- Layer Listの上下順が想定どおりか。
- LayerがDisableされていないか。
- 入力を外したLayerが取り消し線のまま残っていないか。
- Layer側のMerge controlsと、上流のTransformで同じ位置・大きさを二重管理していないか。
- Layerごとに別Effectが必要なら、MultiMergeへ入る前の分岐へEffectを置いた方が追いやすくないか確認する。

## Merge chainを使う方がよい場合

各合成段階へ別Effectを挟む、途中結果を頻繁にViewer確認する、分岐構造を明確にしたい場合はMerge chainの方が適しています。

→ [Merge chainとMultiMergeを選ぶ](../../patterns/compositing/choose-merge-vs-multimerge)

## 関連Node

- [MultiMerge](../../nodes/compositing/multi-merge)
- [Merge](../../nodes/compositing/merge)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 94、pp.2220–2223で、入力追加、Layer List、並べ替え、Rename、Enable / Disable、素材差し替え、Split Here、LayerごとのMerge controlsを確認しています。実機追試は未実施のため `verification: partial` を維持します。
