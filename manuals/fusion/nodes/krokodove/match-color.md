---
title: Match Color
description: Krokodove Match Colorで暗部・中間調・明部などの階調を選び、その領域の色を置き換える考え方と具体的な使い方を説明。
doc_type: node
term_id: match-color
term_short: 画像の暗部・中間調・明部など、選んだ明るさの領域を別の色へ置き換えるKrokodoveの画像ツール。
verification: partial
aliases: [Match Color]
concepts: [image-data]
nodes: [Match Color]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Match Color

Match Colorは、**画像の暗い部分・中くらいの明るさの部分・明るい部分などから対象を選び、その部分の色を置き換える**Krokodoveの画像ツールです。DaVinci Resolve 21.1 Reference Manualでは、シャドウ（Shadows）、中間調（Midtones）、ハイライト（Highlights）などの階調を選択して、色を置き換えるものと説明されています。

たとえば夜景の暗い部分へ青系の色を割り当てたいときの候補になります。ただし、元の陰影をどの程度残すか、色の境界がどれほど滑らかかはManualの短い説明だけでは分かりません。以下では、確認できた働きと制作上の構成案を分けて説明します。

## 役割：場所ではなく明るさの領域を選ぶ

写真には、暗い影、明暗の中間にある壁や服、強い光を受けた部分が混在します。ここでいう**階調（tone）**は、こうした画面の明るさの違いです。

- **シャドウ（Shadows）**：暗い部分。夜景の暗がりや物体の影など。
- **中間調（Midtones）**：暗部と明部の間。一般的な照明下の壁や衣服など。
- **ハイライト（Highlights）**：明るい部分。照明が当たった面や強い光など。

Match Colorは、こうした階調に着目して色を変更します。「画面左側だけ」「看板だけ」といった**物体や位置の選択**とは別の考え方です。暗い看板を例にしても、同じくらい暗い服や背景が影響を受ける可能性があるので、Viewerで範囲を確かめます。

上の区分は意味を説明するためのもので、**Inspectorにこの3つの名前のスイッチがあることや、固定の明度境界を持つことを保証するものではありません**。

<!-- capture:S248 -->

## 実機例：グラデーションの暗い側に青を付ける

合成した白黒グラデーションを `Match Color` に渡し、Shadows MatchとDestination 1を設定しました。Destination 1の青を1に設定した例では、暗い側が青く見えます。

Viewerには市松模様が表示されています。Alphaの数値や別の素材・設定での変化は未検証です。[接続と設定の記録](/img/fusion/captures/S248/readback.json)に条件を記載しています。

[![白黒グラデーションをKrokodove Match Colorへつなぐ構成](/img/fusion/captures/S248/graph.png)](/img/fusion/captures/S248/graph.png)

白黒グラデーションをMatch Colorへ渡します。

[![Match ColorのInspector](/img/fusion/captures/S248/controls.png)](/img/fusion/captures/S248/controls.png)

暗部のDestination 1を青に設定しています。

[![処理前の白黒グラデーション](/img/fusion/captures/S248/low.png)](/img/fusion/captures/S248/low.png)

処理前は黒から白へ変化します。

[![Match Colorで暗い側を青くしたグラデーション](/img/fusion/captures/S248/high.png)](/img/fusion/captures/S248/high.png)

処理後は暗い側が青く見えます。

[再現用Graph](/img/fusion/captures/S248/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S248/capture.json)

<!-- /capture:S248 -->

## 入力と出力

| 段階 | データ | 役割 |
| --- | --- | --- |
| 入力 | 2D Image | 色を変えたい写真・動画・グラフィックの画像。 |
| 処理 | 階調の選択と色の置き換え | シャドウ・中間調・ハイライトなど、対象にする階調を選び、その領域へ色を割り当てます。 |
| 出力 | 2D Image | 色の変更を反映した画像。標準のMergeや次の画像処理ノードへ送る構成を考えられます。 |

ここでいう<Term id="image">Image</Term>は、画素ごとの色を持つデータです。輪郭や塗りの情報を描画前の形で持つShapeデータとは異なります。Match Colorは21.1 Manualの「Image Color Tools」に分類されています。

Frontmatterの `inputs: [image]` と `outputs: [image]` は記事で扱う**データの分類**です。実機で表示される端子名・端子数、追加のMask入力の有無を確認したという意味ではありません。

## 何を決めるか

**対象となる階調**と**置き換え先の色**を決めることが、このノードの基本です。たとえば「暗い部分を青へ寄せたい」という目的なら、まずシャドウ側の階調を対象にし、次に置き換え先として青を選ぶことを考えます。

21.1 Manualで確認できるのは、階調を選んで色を置き換えるという役割までです。正確なInspector項目名、色の指定方法、複数階調の同時指定、変化量の調整、元の輝度を保持するかどうかは説明されていません。操作時は実機の表示を確認してください。

## 主な用途

### 暗部の配色をそろえる

夜の街並みや室内の暗がりへ特定の色を割り当て、映像の暗い部分の印象をそろえたい場面です。黒い衣服や髪など、背景以外の暗い部分まで影響する可能性を確認します。

### 明るい部分をアクセントカラーにする

照明や反射で明るくなった部分を作品のアクセントカラーに寄せる使い方です。光源だけが選ばれるとは限らず、白い服や明るい背景も対象になり得ます。

### グラフィックの階調ごとに配色案を比較する

濃淡のある背景画像を用意し、元画像とMatch Colorの結果をViewerで見比べます。写真のような素材だけでなく、グラデーションのあるタイトル背景でも、どの明るさが変更対象になるか確認する用途が考えられます。

## 最小構成

```text
MediaIn → Match Color → MediaOut
```

これはDaVinci ResolveのFusionページで元映像を加工し、結果をタイムライン側へ返す**構成案**です。公式Manualに掲載された接続図の再現ではありません。

画像の入力をMatch Colorへつなぎ、出力をViewerに表示します。選ぶ階調と置き換え先の色を変えながら、どの画素がどう変わるか観察します。設定する順序や操作名は21.1実機のInspectorに従います。

## 制作例：夜景の暗部を青系にする

元映像と加工結果を比べやすくするため、次のように元画像を2系統へ分けます。

```text
MediaIn ───────────────────→ Merge（Background） ─→ MediaOut
       └→ Match Color ────→ Merge（Foreground）
```

1. 夜景のMediaInをMatch Colorへ接続し、処理前後の画像を別々のViewerに表示します。
2. Match Colorで暗い階調を対象にし、青系の色を割り当てます。上の実機例ではDestination 1を使いました。この制作例の素材での結果は確認してください。
3. 建物の影がどう変わったかとともに、暗い服・車・空など、本来変えたくない部分も見ます。色が置き換わった領域の明暗や細部がどれほど残るかも確認します。
4. 元画像をMergeのBackground、Match Colorの結果をForegroundへつなぎます。標準のMergeのBlendで原画と加工結果を混ぜられます。**Match Color自身にBlend設定があるという意味ではありません**。
5. 加工を画面の一部に限定したい場合は、MergeのEffect Maskで**合成する範囲**を制御します。Match Colorの専用Mask入力があると仮定しない方法です。

動画では別のフレームにも移動し、照明や被写体の動きによって対象領域が変わるか確認します。これらは制作時の確認事項であり、変化のしかたを21.1 Manualが保証しているわけではありません。

## 似たノードとの違い

| ノード | 選択の基準・目的 | 選ぶ目安 |
| --- | --- | --- |
| **Match Color（Krokodove）** | シャドウ・中間調・ハイライトなどの階調を選び、色を置き換える | 元の色名よりも、暗部・中間調・明部の色を変えたい |
| [Recolor（Krokodove）](./recolor) | 1色以上の元の色を指定し、新しい色へ置き換える | 変更したい元の色が分かっている |
| [Replace Color（Krokodove）](./replace-color) | 元の色を指定し、補正に置き換える | 特定の元の色を基準に補正したい |
| [Color Map（Krokodove）](./color-map) | テクスチャを均一な塗り色へ対応づける | 模様や細かな色変化を、少数の色面として扱いたい |
| [Threshold（Krokodove）](./threshold) | 指定チャンネルの色・明るさの狭い範囲を選別する | まず値の範囲を分離したい |
| [Color Corrector（標準Fusion）](../color/color-corrector) | Shadows / Midtones / Highlights別の色・明るさの補正やHistogram Matchを行う | 色を単純に置換するより、各階調を細かく補正したい |

**「Match Color」という名前から、参照画像へ色を自動的に合わせる機能だと解釈しないでください。** 21.1 ManualでのKrokodove Match Colorの説明は、選んだ階調の色を置き換えるものです。参照画像の色分布を合わせる標準Color CorrectorのHistogram Matchとは異なる機能として区別します。

## 注意点・確認が必要な仕様

- **選択される範囲**：各階調の境界・重なり、柔らかさ、選択範囲を微調整するControlは未確認です。位置や物体を直接指定する仕組みとは限りません。
- **色の置き換え方**：元の輝度・彩度・細部を保持するか、単色にするかはManualから断定できません。
- **入力・出力の詳細**：正式な端子名・数、Alphaや補助チャンネルの扱い、解像度への影響は未検証です。
- **環境差**：REGID、Inspectorの全項目と初期値、DaVinci Resolve Free / Studio / Fusion Studioの差は確認していません。

## バージョン・出典

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2435「Image Color Tools / Match Color」。対象のtoneとしてshadows・midtones・highlightsが例示され、色を置き換える役割を確認しました。
- **比較資料**：同Manual p.2435「Recolor / Replace Color / Threshold」、p.2434「Color Map」。標準Color Correctorとの違いは同ManualのColor Corrector節に基づきます。
- **関連**：[Krokodoveの全体像](./)／[画像（Image）](../../learn/02-data/image)／[Merge](../compositing/merge)。

機能の中心は21.1 Manualで確認できています。実機例では暗部のDestination 1を設定した表示を確認しましたが、Alphaの数値、端子の詳細、色の処理アルゴリズム、Edition差は未検証のため、`verification: partial` を維持しています。
