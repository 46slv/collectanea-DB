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
