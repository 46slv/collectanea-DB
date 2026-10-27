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
updated: "2026-10-28"
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

レイヤーの入力元を確認したいときは、対象を右クリックして**Go To Source**を選びます。接続元のToolが選択され、InspectorにそのToolの設定が表示されます。特に似た名前の画像を何枚も接続している場合に、どの素材がそのLayerを作っているかを確かめられます。

### 選択

単一Layerだけでなく、Shiftで連続範囲、Commandで離れた複数Layerを選択できます。

### 並べ替え

Layer名をドラッグして上下へ移動すると、合成順を変えられます。

### Rename / Reset

Layer名はダブルクリックで変更できます。右クリックの**Rename Layer X**からも編集でき、**Rename Layer to Match Source**を選ぶと接続元Toolの名前に合わせられます。名前を変えても元Toolの名前や画像の内容が書き換わるわけではありません。

**Set Layer X to Default**は、選択LayerのMerge controlsを既定の設定へ戻す操作です。接続元の画像を削除したり、Layer List全体の順番をリセットする操作ではありません。意図しない位置や合成モードになったLayerを見直す際は、どのLayerを選んでいるか確認してから使用します。

### Enable / Disable

Layer名横のチェックを切り替えると、そのLayerだけを合成結果から外せます。無効化してもLayerや接続元Toolは削除されません。

### Replace

入力pipeを外してもLayer自体はLayer Listに残り、未接続であることが取り消し線で示されます。同じLayer位置へ別のsourceを接続し直せるため、順序を崩さず素材を差し替えられます。

### Delete Layer

Layerを削除するとMultiMergeからそのLayerと接続を取り除きますが、接続元のTool自体は削除しません。

### Split Here

選択Layerから上側を新しいMultiMergeへ分割し、元のMultiMergeを新しいMultiMergeのBackgroundへ接続します。

Layerが増えすぎたときに、1つの巨大なMultiMergeを複数段へ分けるための操作です。

たとえばLayer Listが上から「光の装飾／字幕／ロゴ／人物」の順なら、**字幕を選んでSplit Here**を実行します。元のMultiMergeには人物とロゴが残り、字幕と装飾は新しいMultiMergeへ移ります。元のMultiMergeの出力が、新しいMultiMergeの**Background**へ自動接続されます。

```text
背景 ───────┐
人物 ───────┤ MultiMerge A ──→ MultiMerge B（Background）──→ MediaOut
ロゴ ───────┘                    ↑ 字幕・光の装飾
```

これは21.1 Manualにある分割規則を用いた構成例です。**Split Hereを21.1実機で操作した結果ではありません。** 分割後は、両方のLayer順と合成結果をViewerで確認します。

### Keyframe

Layer Listでは**Layer順**と**Enable / Disable**をkeyframe化できます。InspectorのLayer List右側にある通常のキーフレーム操作を使います。

たとえば、フレーム0では「字幕をオフ／ロゴを前面」、フレーム24では「字幕をオン／字幕を前面」にする演出を想定できます。これは**設定方法を考えるための確認案**であり、実機でフレーム24の切り替え方や補間・表示結果を検証したものではありません。Layer内のCenterやSizeのアニメーションとは設定対象が違うため、どの操作にキーを置いたか確認します。

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

### 素材を差し替え、あとから処理を分割する

1. 背景と4枚のForeground（人物・ロゴ・字幕・装飾）を接続し、Layer Listで重なり順を決めます。
2. 各Layerに役割の分かる名前を付け、必要なら**Go To Source**で接続元を確認します。
3. ロゴの素材を差し替えるときは該当Layerの入力pipeを外します。取り消し線付きで残ったLayerへ新しいロゴの出力を接続し直します。**Delete Layer**は使いません。
4. 字幕と装飾を別の編集単位にしたくなったら、字幕のLayerで**Split Here**を使い、上側2Layerを新しいMultiMergeへ移す構成を検討します。
5. 分割前後の同じフレームでViewerを比べ、順番、透明度、各LayerのMerge controls、Effect Maskを確認します。

これはManualに記載されたLayer List操作を組み合わせた**制作手順案**です。実機例S27で確認したのは順序変更と有効状態だけであり、差し替え、Split、Layer Listのキーフレームは未実施です。

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

## 実機でLayerの有効状態と順序を比べる

Resolve Studio 21.1.0.14、Windows、日本語UIで撮影しました。青いBase1をBackgroundにし、赤い長方形のRed1とオレンジの楕円のGold1を別のForegroundへ接続しています。

[![RectangleとEllipseで形を作った2つのBackground画像をMultiMergeの別Foregroundへ、Base1をBackgroundへ接続する実機Graph](/img/fusion/captures/S27/graph.png)](/img/fusion/captures/S27/graph.png)

[![MultiMerge Inspector。Layer ListでGold1が上、Red1が下、両方のチェックがオン](/img/fusion/captures/S27/inspector.png)](/img/fusion/captures/S27/inspector.png)

[![左はRed1だけの赤い長方形、右は青い背景上でGold1の楕円が長方形の前に重なるMultiMerge出力](/img/fusion/captures/S27/compare.png)](/img/fusion/captures/S27/compare.png)

最初はLayer Listの上がGold1、下がRed1です。右Viewerでは楕円が長方形の前に見えます。左は接続元のRed1だけを表示しています。

[![Layer ListにGold1を残したままチェックを外し、Red1だけを有効にしたInspector](/img/fusion/captures/S27/disabled-inspector.png)](/img/fusion/captures/S27/disabled-inspector.png)

[![Gold1の接続を残して無効にした結果。右Viewerは青い背景と赤い長方形だけになる](/img/fusion/captures/S27/disabled.png)](/img/fusion/captures/S27/disabled.png)

Gold1のチェックを外すと、Nodeや配線を削除せずに楕円だけを合成から外せます。

[![両Layerを有効に戻し、Layer ListでRed1をGold1より上へ並べ替えたInspector](/img/fusion/captures/S27/order-inspector.png)](/img/fusion/captures/S27/order-inspector.png)

[![Layer順を変えたMultiMerge出力。右Viewerでは赤い長方形がオレンジの楕円の前に重なる](/img/fusion/captures/S27/order.png)](/img/fusion/captures/S27/order.png)

Gold1を有効に戻し、Red1を上へ並べ替えると、今度は長方形が前に重なります。Node Editorの配置と接続は同じです。1920×1080、フレーム0、両Viewer 40%で比較しました。緑の線や赤い軸は操作表示です。再現用Graphは最後のRed1が上の状態です。Rename、Go To Source、Set Layer X to Default、素材差し替え、Split Here、Layer削除、順序のKeyframe化は確認していません。

[再現用Graph](/img/fusion/captures/S27/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S27/capture.json)

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

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 94、pp.2220–2223で、動的Foreground入力、Layer Listの順序、Layer選択、Go To Source、Split Hereの分割規則、Rename、Set Layer X to Default、Delete、Enable / Disable、未接続Layer保持、Layer Listのkeyframe、Layerごとの独立Merge controls、Background基準の出力解像度を確認しました。

実用上扱える最大Layer数、Edition差、大規模Layer stackでの性能は未確認のため `verification: partial` を維持します。
