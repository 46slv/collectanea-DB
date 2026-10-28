---
title: Shuffle（Krokodove）
description: 分割された画像の区画を再配置するKrokodove Shuffleの仕組み、実用例、Segment Transformとの違い。
doc_type: node
term_id: shuffle
term_short: 画像を区画に分け、その区画の配置を変えて見せるKrokodoveの画像変形ツール。
verification: partial
aliases: [Shuffle]
concepts: [image-data, transform]
nodes: [Shuffle]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-20'
---

# Shuffle（Krokodove）

**Shuffleは、画像を複数の区画として扱い、画面内でその配置を変えるKrokodoveの画像変形ツール**です。DaVinci Resolve 21.1 Reference Manualでは「Image Warp Tools」に分類されています。

一枚の写真を小さな紙片に区切り、紙片の場所を入れ替えたときのような変化を考えると、目的が分かりやすくなります。ただし、これは**見た目を説明する例**です。Shuffleが編集可能な紙片やレイヤーを生成するわけではありません。

同じKrokodoveの[Segment Transform](./segment-transform)も画像を区画として扱いますが、**Shuffleは区画の配置**、Segment Transformは**区画に加える角度・スケールの変形**に焦点があります。

## 「区画を再配置する」とは

### 画像全体を、部分ごとに扱う

ここでの「区画」は、元画像の一部分を表す領域です。たとえば格子を描いた画像なら、線で区切られた部分を一つずつ取り出して考えられます。Shuffleについて21.1 Manualが述べているのは、**分割したフレームを画像の内部で再配置する**という役割です。

元の画面で隣り合っていた柄や輪郭が、出力では異なる位置関係に見える、と考えると使いどころを想像できます。ただし、分割数、区画の大きさ、位置の決まり方、再配置の順序は、Manualの説明だけでは分かりません。隣に掲載されたSegment Transformには「正方形の区画」と明記されていますが、**Shuffleも必ず正方形へ分けるとは断定できません**。

どの位置がどこへ移るか、区画が重なったり隙間を生んだりするかは、実際の出力で確かめます。

### RGBやAlphaの並べ替えではない

「Shuffle」という名前でも、本記事で扱うのは**KrokodoveのImage Warp ToolsにあるShuffle**です。赤・緑・青・Alphaといった色のチャンネルを入れ替えるという説明ではなく、分割された**画面の領域を再配置する**という説明が公式Manualにあります。

また、[Duplicate](./duplicate)のように元画像のコピーを複数作ることとも異なります。Shuffleについて確認できる中心的な機能は、あくまで入力画像内の区画の配置変更です。

<!-- capture:S255 -->

## 実機例：数字の一部を移動する

合成した `Text+` の数字を `Shuffle` に渡し、TypeをSwap、Horizontal / Vertical Subdivisionsを4、Random Seedを3に設定しました。

この例では最後の数字の一部が別の位置に見えます。Viewerには透明部分を示す市松模様が表示されています。ほかの分割数や乱数、Alpha値は未検証です。[接続と設定の記録](/img/fusion/captures/S255/readback.json)に条件を記載しています。

[![数字画像をKrokodove Shuffleへつなぐ構成](/img/fusion/captures/S255/graph.png)](/img/fusion/captures/S255/graph.png)

数字画像をShuffleへ渡します。

[![ShuffleのInspector](/img/fusion/captures/S255/controls.png)](/img/fusion/captures/S255/controls.png)

TypeはSwap、水平・垂直の分割数は4です。

[![処理前の数字](/img/fusion/captures/S255/low.png)](/img/fusion/captures/S255/low.png)

処理前は数字が一列です。

[![Shuffleで一部が移動した数字](/img/fusion/captures/S255/high.png)](/img/fusion/captures/S255/high.png)

処理後は最後の数字の一部が別の位置に見えます。

[再現用Graph](/img/fusion/captures/S255/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S255/capture.json)

<!-- /capture:S255 -->

## 入力と出力

| 段階 | データ分類 | 内容 |
| --- | --- | --- |
| 入力 | 2D <Term id="image">Image</Term> | 写真、動画、画像化した文字や図形など、再配置したい画面を受け取る。 |
| 処理 | Shuffle | 画像を区画として扱い、それらの配置を画面内で変える。 |
| 出力 | 2D Image | 加工後の画面を後段の画像処理やMergeへ渡す。 |

Imageとは、画素ごとの色や透明度などを持つ画像データです。Shuffleは画像を加工するツールであり、区画それぞれを自由に編集できる個別のShapeオブジェクトへ変換するものとしては説明されていません。

ページ先頭の入力・出力は、既存COLLECTANEAカタログに基づく**データ分類**です。21.1 Manualの当該一覧だけでは、正確な端子名や端子数、Maskなどの補助入力の有無、Alphaの演算方式は特定できません。

## 主な用途

### 幾何学的な背景の組み替え

タイル、窓、格子、ストライプなど、規則的な模様を持つ画像は、配置の変化が分かりやすい素材です。連続していた線のつながり方が変わるなら、背景を分割して組み直したような表現に利用できます。

これは**機能から考えた制作案**です。特定のランダム化機能や、すべての区画を必ず別の場所に移す設定があるとは断定していません。

### 写真を断片的に見せる

建築写真や街並みなど、輪郭を追いやすい素材で試すと、どこが再配置されたように見えるかを確認しやすくなります。顔や商品ロゴなど意味を読ませたい被写体では、区画の境界が重要部分を分断していないか確かめます。

### タイトルは加工せず、背景だけを変える

背景をShuffleに通した後でText+をMergeすれば、タイトルの文字を加工対象から外せます。逆に、背景と文字を先に合成してからShuffleへ送れば、文字も入力画像の一部として処理されます。

「背景だけ」「文字も含めて」の切り分けは、**Shuffleの設定を探す前に、Mergeの配置を考える**と実現しやすくなります。

## 制作例：番号付きの格子で位置の変化を調べる

写真だけを入力するより、各部分が元のどこにあったか分かる画像を使うと、Shuffleの出力を理解しやすくなります。次は**観察のための作例**であり、Blackmagic Designによる設定値付きチュートリアルではありません。

    MediaIn（番号付き格子） → Shuffle → Merge（Background） → MediaOut
    Text+（タイトル） ─────────────────→ Merge（Foreground）

1. 色の異なる複数のマスへ番号やアルファベットを記した一枚の画像を用意します。番号は元の位置を追跡する目印です。**素材に描いた格子と、Shuffle内部の区画の境界が一致するとは限りません**。
2. FusionページでMediaInからShuffleへ接続し、元画像と加工後の画像を別々のViewerに表示します。
3. Inspectorに実際に表示されるコントロールを一つずつ変え、どの部分がどこに移って見えるか観察します。ここでは未確認のパラメータ名や数値を指定しません。
4. Shuffleの結果をMergeのBackgroundへ、Text+をForegroundへつなぎます。タイトルがShuffleを通らず、そのまま表示される構成を確認します。
5. 実際の写真や動画へ入力を置き換えたら、区画の境界、細線のちらつき、被写体の読みやすさを再生して確かめます。透明な入力は背景へ合成した状態でも確認してください。

確認すべきなのは、番号の**位置関係の変化**です。「指定したマス数で分割される」「区画を個別選択できる」「必ず無作為に入れ替わる」といった動作は、21.1 Manualの短い説明だけでは保証できません。

## 似たノードとの違い

| ノード | 21.1 Manualに書かれた役割 | 選ぶときの視点 |
| --- | --- | --- |
| **Shuffle** | 分割された画像の区画を再配置する。 | 区画の**位置関係**を変えたい。 |
| [Segment Transform](./segment-transform) | 正方形の区画へ角度・スケールの歪みを加える。 | 区画の**向きや大きさ**を変えたい。 |
| [Shear](./shear) | 画像へ角度を伴うシアー変形を加える。 | 斜めにずらしたような変形を試したい。 |
| [Warped Transform](./warped-transform) | 画像を伸ばす・押し縮める・回す操作を提供する。 | 区画の再配置以外の画像変形をしたい。 |
| [Duplicate](./duplicate) | 入力画像を指定したパターンや形状に沿って複製する。 | 元画像の**コピーを増やしたい**。 |

ShuffleとSegment Transformを見分けるには、「部分が別の位置へ移ったように見えるか」「部分の向きや大きさが変わったように見えるか」を分けて考えます。両ツールのInspector項目や境界処理が共通するかどうかは確認できていません。

## 注意点・未確認事項

- **分割方法：** 区画の形、寸法、個数、原点、端数の扱いはManualの一覧から分かりません。
- **配置方法：** 並べ替えの規則、移動量、ランダム化、区画ごとの個別制御の有無は不明です。
- **境界と透明度：** 区画間の隙間や重なり、画像の外側をどう補うか、Alphaとpremultiplyの処理は未確認です。
- **時間変化：** 動画を入力できることと、専用の自動シャッフルアニメーションを設定できることは別です。後者は実機未確認です。
- **Version / Edition：** 実機例ではSwap、分割数、Random Seedを使用しました。Resolve Free・Studio・Fusion Studioの提供差、端子の全構成、初期値・範囲は未確認です。

## バージョンと出典

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2437「Image Warp Tools / Shuffle」**。比較対象のSegment Transform、Shear、Warped Transformも同ページ、Duplicateはp.2436に記載されています。

**公式に確認した役割**は、分割された画像の領域を再配置するImage Warp Toolであることです。実機例では数字の一部の移動を確認しました。格子素材や合成の手順は制作案です。未確認項目が残るため、検証状態はpartialです。

[Krokodoveノード一覧](./)、[Imageデータの説明](../../learn/02-data/image)も参照してください。
