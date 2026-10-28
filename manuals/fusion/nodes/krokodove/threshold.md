---
title: Threshold
description: Krokodove Thresholdで指定したチャンネルの色・明るさの狭い範囲を分離する仕組みと、許容幅の考え方、制作例を説明。
doc_type: node
term_id: threshold
term_short: 指定したチャンネルの色・明るさから狭い値の範囲を選び、許容幅を調整できるKrokodoveの画像ツール。
verification: partial
aliases: [Threshold]
concepts: [image-data]
nodes: [Threshold]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# Threshold

Thresholdは、**画像に含まれる色や明るさの値から、指定した狭い範囲を取り出す**Krokodoveの画像ツールです。対象とするチャンネルを指定し、選択する範囲の許容幅を調整できます。

たとえば、暗い部分から明るい部分へ連続して変化する画像のうち、ある明るさに近い部分だけを取り出したいときに使います。ここでの「取り出す」は、元画像のどの画素が条件に一致するかを選別する意味です。**選別結果を透明な画像として返すのか、白黒の画素として返すのか、Alphaをどう扱うのかは、21.1 Manualの記述だけでは確定しません。**

## 何を基準に選ぶのか

画像は、多数の画素（ピクセル）からできています。各画素には赤・緑・青などの色成分や、明るさに関係する値があります。こうした値を分けて扱う単位が**チャンネル（channel）**です。<Term id="image">Image</Term>には、これらの画素情報が保存されています。

Thresholdは、チャンネルの値を手がかりに選別します。これは、画面上で矩形を描いて「この場所だけ」と指定する処理とは異なります。同じ値を持つ画素なら、画面の左上と右下の両方が対象になり得ます。

ここで重要なのは、Krokodove Thresholdが**単に「一定値より明るい部分をすべて残す」ツールとして説明されているわけではない**点です。21.1 Manualは、ある色または明るさについて「狭い値の範囲」を分離し、その選択の許容幅を調整すると説明しています。

## 許容幅（Tolerance）の考え方

画像の明るさや色の値は、ぴったり同じとは限りません。たとえば、同じ壁でも照明の当たり方や圧縮の影響で画素ごとの値が少しずつ異なります。

**許容幅**は、基準に近い値をどこまで選択対象に含めるかを考えるためのものです。狭いほど基準値に近い画素に対象を絞り、広げるほど周辺の値も候補に入ります。

たとえば暗から明へ変化するグラデーションで、ある中間の明るさに注目するとします。概念的には次のように考えられます。

```text
暗い ─────────────── 中くらい ─────────────── 明るい
                      [ 対象範囲 ]
                ← 許容幅を広げる →
```

これは**値の範囲を理解するための模式図**です。実際の内部計算が「基準値 ± 許容幅」であること、境界が直線的に変わること、Inspectorにこの名称の項目が表示されることを保証する図ではありません。正確な項目名、設定可能な範囲、選択境界の滑らかさは実機で確認してください。

<!-- capture:S246 -->

## 実機例：グラデーションの明るさを分ける

合成した横方向の白黒グラデーションを `Threshold` に渡し、Thresholdを0.5、Softnessを0.1に設定しました。

この例では処理後のViewerで透明部分から白へ短く変化します。市松模様はViewerの透明表示です。各チャンネルの数値や他の設定は未検証です。[接続と設定の記録](/img/fusion/captures/S246/readback.json)に条件を記載しています。

[![グラデーションをKrokodove Thresholdへつなぐ構成](/img/fusion/captures/S246/graph.png)](/img/fusion/captures/S246/graph.png)

白黒グラデーションをThresholdへ渡します。

[![ThresholdのInspector](/img/fusion/captures/S246/controls.png)](/img/fusion/captures/S246/controls.png)

Thresholdを0.5、Softnessを0.1に設定しています。

[![処理前の白黒グラデーション](/img/fusion/captures/S246/low.png)](/img/fusion/captures/S246/low.png)

処理前は黒から白へ連続して変化します。

[![Thresholdを通したグラデーション](/img/fusion/captures/S246/high.png)](/img/fusion/captures/S246/high.png)

処理後は透明部分から白へ短く変化します。

[再現用Graph](/img/fusion/captures/S246/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S246/capture.json)

<!-- /capture:S246 -->

## 入力と出力

| 段階 | データ | 役割 |
| --- | --- | --- |
| 入力 | 2D Image | 色・明るさを判定したい写真、映像、グラフィック |
| 処理 | チャンネルの値による選別 | 指定した狭い値の範囲を対象とし、許容幅を調整する |
| 出力 | 2D Image | 選別処理の結果。後段の画像処理ノードやViewerへ接続する候補 |

このページの `inputs: [image]` / `outputs: [image]` は、画像を扱うという**データ分類**です。InspectorやFlowに現れる正式な端子名・端子数を示すものではありません。Krokodove Thresholdは21.1 Manualの「Image Color Tools」に掲載されており、輪郭の頂点を保持するShapeノードとは区別します。

また、**Image出力とMask出力は同じものではありません**。選別後の画像をそのままMergeのEffect Mask入力へ接続できるとは断定しません。Maskが目的なら、後述のLuma KeyerやBitmap Maskとも比較します。

## 主な用途

### グラデーションの一部を選ぶ

背景が暗い青から明るい青へ変化するグラフィックで、明るさが特定の範囲に収まる部分を探す用途です。位置ではなく画素の値で選ぶため、グラデーションの向きや形が変わっても、値が同じ部分が対象になります。ただし、実際の選別結果の表示形式はViewerで確認します。

### 光が当たった部分に近い値を調べる

夜景や光沢のある物体で、ある程度明るい部分のうち、さらに狭い値の範囲だけを対象にしたい場面です。街灯そのものを識別するわけではなく、同じ値の白い服や反射も選ばれる可能性があります。

### 特定の色成分を基準に画像を選別する

指定したチャンネルの値を使って、グラフィック内の一部を抽出する方向の作業に使えます。ただし「赤チャンネルの値が高い」と「赤色の物体である」は同義ではありません。白い画素も赤成分を多く含みます。**色相を指定して特定色だけを選ぶ機能だと決めつけない**ことが重要です。

## 最小構成

```text
MediaIn → Threshold → MediaOut
```

Fusionページで素材を加工して結果を返すための**構成案**です。Manualに掲載された接続図ではありません。

まずThresholdの結果を単独のViewerへ表示し、元画像と比較します。選択対象のチャンネルと値の範囲を調整し、どの場所が残り、どの場所が変わるかを確認します。21.1 Manualで説明されているのはチャンネル指定・狭い範囲の分離・許容幅の調整までで、具体的なInspector上の操作順序は未確認です。

## 制作例：濃淡のある背景から中間の明るさを探す

まず、濃淡の分布が見やすい画像で選択範囲の振る舞いを確認します。複雑な実写を最初から使うより、どの値が選ばれたのかを判断しやすくなります。

```text
Background（グラデーション） → Threshold → MediaOut
```

1. [Background](../generators/background)で暗い色から明るい色へ変化するグラデーションを作ります。
2. BackgroundをThresholdへ接続し、元画像と処理後の画像を別々のViewerで比較します。
3. 実機のInspectorで、使用するチャンネルと選びたい値の範囲を確認します。明るさに関係する値を対象にする場合、どのチャンネルを選べるかは実機の表示に従います。
4. 許容幅を狭くした場合と広げた場合で、結果が変わる場所を比べます。中央付近だけを狙ったのに白い部分も選ばれるなら、選択基準にしているチャンネルを再確認します。
5. 数フレームの動画や明るさが変化する素材でも試し、選択対象が意図せず広がらないか観察します。

元画像と重ねて効果を弱めたい場合は、Thresholdの結果を[Merge](../compositing/merge)のForeground、元画像をBackgroundへ接続する方法があります。実機例のViewerには市松模様が表示されましたが、他の設定やAlphaの数値は未確認です。この配線だけで「選んだところだけ重なる」とは保証できないため、結果に合わせて合成方法を選びます。

## 似たノードとの使い分け

| ノード | 基準・目的 | 選ぶ目安 |
| --- | --- | --- |
| **Threshold（Krokodove）** | 指定チャンネルの色・明るさの狭い範囲を分離する | 値の範囲を絞って取り出したい |
| [Match Color（Krokodove）](./match-color) | 暗部・中間調・明部など階調を選び、色を置き換える | 選んだ階調の**色を変えたい** |
| [Recolor（Krokodove）](./recolor) | 元の色を指定し、別の色へ置き換える | 元の色を手がかりに**新しい配色を作りたい** |
| [Luma Keyer](../matte-keying/luma-keyer) | 明るさなどのチャンネルを使ってAlpha matteを作る | **透明な切り抜き**が必要 |
| [Bitmap Mask](../masks/bitmap-mask) | 画像の各チャンネルなどからMaskを作る | 別ノードの**Effect Mask**へ渡したい |
| [Bounding Box（Krokodove）](./bounding-box) | 選択チャンネルを基に矩形を描く | 選別範囲を囲う**四角形**が欲しい |

「Threshold」という言葉は、一般に値が境界を超えたかどうかで処理を分ける意味でも使われます。しかし、**Krokodove Thresholdの用途を、Luma KeyerのようなAlpha matte生成と同一視しない**でください。入力として選べるチャンネルや出力の扱いが異なる可能性があります。

## 注意点と未確認事項

- **出力の形式**：実機例ではViewerに市松模様と白が表示されました。Alphaの数値や他の設定での出力は未検証です。
- **入力端子**：正式な端子名、追加のMask入力や二枚目のImage入力の有無は確認していません。
- **Inspector**：選択対象を決める正式なパラメータ名、色の指定方法、数値範囲、初期値、境界の滑らかさは不明です。「許容幅を調整できる」という機能説明以上は推測しません。
- **表示・処理精度**：チャンネルの判定がどの色空間・bit深度で行われるか、境界でどのように補間されるかは未確認です。
- **版・製品差**：Resolve Free / Studio / Fusion Studioの利用可否、REGID、Effects Library上の表示名は21.1実機で確認していません。

## バージョンと出典

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2435「Image Color Tools / Threshold」。指定チャンネルの色または明るさについて狭い範囲を分離し、許容幅を調整できることを確認。
- **比較資料**：同Manual Chapter 105、pp.2434–2435「Bounding Box / Match Color / Recolor」。標準Luma Keyer、Bitmap Mask、Mergeは同Manualの各ノード解説と別記事を参照。
- **関連**：[Krokodoveの全体像](./)／[画像（Image）](../../learn/02-data/image)／[Merge](../compositing/merge)。

21.1 Manualで中心的な役割を確認し、実機例ではThresholdとSoftnessを使った表示を確認しました。Alphaの数値、端子構成、版ごとの差は未確認なので `verification: partial` を維持しています。
