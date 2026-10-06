---
title: MultiMerge
description: Backgroundに複数のForegroundをLayerとして重ね、Layer Listから順序・有効状態・個別Merge設定をまとめて管理する合成Node。
doc_type: node
term_id: multi-merge
verification: partial
aliases: [MultiMerge, Multi Merge, MMrg]
concepts: [compositing, foreground-background, transform-controls]
patterns: [choose-merge-vs-multimerge, stack-images-with-merge]
nodes: [MultiMerge]
node_family: compositing
controls: [Layer List, Merge Controls]
inputs: [image, mask]
outputs: [image]
tasks: [composite, layer, multi-layer]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# MultiMerge

MultiMergeは、Backgroundへ複数のForegroundを重ね、1つのNode内でLayerとして管理する<Term id="image">2D Image</Term>合成Nodeです。

Foregroundを追加するたびに新しい入力とLayer Listの項目が作られ、それぞれに独立したMerge controlsを持ちます。

## 役割

多数の要素を1つのLayer stackとして管理します。

標準の[Merge](./merge)はForegroundを1つだけ受け取るため、要素を増やすほどMerge chainが長くなります。MultiMergeでは複数のForegroundを1 Nodeへ集め、Layer Listで順序や有効状態を管理できます。

## 入力

### Background

オレンジ色の入力です。合成の基準画像になります。

21.1 Manualでは、Foregroundを接続する前にBackgroundを接続する構成が基本として説明されています。

### Foreground

2枚目以降の画像を接続します。

新しいsourceをMultiMergeへ接続すると、新しいForeground入力が自動で作られ、Layer Listにも新しいLayerが追加されます。Foreground入力は白色です。

### Effect Mask

青色の任意入力です。白い部分でForegroundとの合成を適用し、黒い部分ではBackgroundだけを残します。

## 出力

全Layerを合成した2D Imageを出力します。

出力解像度はBackground入力の画像によって決まります。

## Layer List

Layer Listは、上にあるLayerほど前景側、下にあるLayerほど背景側になるstackです。

Layerを選択すると、そのLayerに対応するMerge controlsがInspector下部へ表示されます。Node Graph側では、選択中Layerへ接続しているpipeが少し強調表示されます。

### 選択

単一Layerだけでなく、Shiftで連続範囲、Commandで離れた複数Layerを選択できます。

### 並べ替え

Layer名をドラッグして上下へ移動すると、合成順を変えられます。

### Rename

Layer名は変更できます。接続元Toolの名前に合わせて自動変更する操作もあります。

### Enable / Disable

Layer名横のチェックを切り替えると、そのLayerだけを合成結果から外せます。無効化してもLayerや接続元Toolは削除されません。

### Replace

入力pipeを外してもLayer自体はLayer Listに残り、未接続であることが取り消し線で示されます。同じLayer位置へ別のsourceを接続し直せるため、順序を崩さず素材を差し替えられます。

### Delete Layer

Layerを削除するとMultiMergeからそのLayerと接続を取り除きますが、接続元のTool自体は削除しません。

### Split Here

選択Layerから上側を新しいMultiMergeへ分割し、元のMultiMergeを新しいMultiMergeのBackgroundへ接続します。

Layerが増えすぎたときに、1つの巨大なMultiMergeを複数段へ分けるための操作です。

### Keyframe

Layer ListではLayer順とEnable / Disableをkeyframe化できます。

## 各LayerのMerge controls

選択した各Layerは、独立したMerge controlsを持ちます。

位置、大きさ、合成モードなどはLayerごとに調整できます。具体的なControlの意味は[Merge](./merge)と共通するため、MultiMerge側ではLayer管理との関係を中心に考えます。

## 最小構成

```text
Background ─────┐
Foreground A ───┤
Foreground B ───┼─ MultiMerge → Output
Foreground C ───┤
                ┘
```

## 運用例

複数のタイトル、ロゴ、装飾画像を1つの画面へ重ねる場合、各要素を別のForeground入力へ接続します。

Layer Listで順番を決め、要素ごとにCenter / Size / Apply Mode等を調整します。途中でロゴだけ別素材に差し替える場合も、Layerを残したまま接続先だけ変更できます。

## Merge chainとの違い

MultiMergeが常にMerge chainより良いわけではありません。

**MultiMergeが向く場合**
- 多数のLayerを一覧として管理したい
- 順番を頻繁に入れ替える
- 各LayerのTransform / Merge設定を1か所で調整したい
- 素材を同じLayer位置へ差し替えたい

**Merge chainが向く場合**
- 合成段階ごとに別Effectを挟む
- 各段の中間結果を頻繁にViewer確認する
- 分岐・再利用構造を明確に分けたい

詳しくは[Merge chainとMultiMergeを選ぶ](../../patterns/compositing/choose-merge-vs-multimerge)を参照してください。

## 関連する考え方

- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## 関連Node

- [Merge](./merge) — 1つのForegroundを段階的に合成する
- [Dissolve](./dissolve) — 2入力を混合・切り替える
- Merge 3D — Classic 3D scene用
- uMerge — USD scene用
- dMerge — Deep image用

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 94、pp.2220–2223で、動的Foreground入力、Layer Listの順序、Layer選択、Split、Rename、Delete、Enable / Disable、未接続Layer保持、Layer Listのkeyframe、Layerごとの独立Merge controls、Background基準の出力解像度を確認しました。

実用上扱える最大Layer数、内部REGID、Edition差、大規模Layer stackでの性能は未確認のため `verification: partial` を維持します。
