---
title: Worm
description: 指定した点をもとに直線と曲線を組み合わせて描くKrokodoveツールの役割、制作例、入出力の確認範囲。
doc_type: node
term_id: worm
term_short: 指定した点をもとに、直線と曲線を組み合わせた線の図柄を作るKrokodoveツール。
verification: partial
aliases: [Worm]
concepts: [image-data]
nodes: [Worm]
node_family: krokodove
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-21'
---

# Worm

**Wormは、指定した点をもとに直線と曲線を組み合わせた線を作る**Krokodoveのツールです。線の位置を決めるための点があり、それらを使って、まっすぐな部分と曲がった部分を持つ図柄を作る、と考えると役割をつかみやすくなります。

DaVinci Resolve 21.1 Reference Manualでは、Wormは「Image Tools」に置かれ、指定点を使って直線と曲線を組み合わせるものと説明されています。ただし、点を画面上で追加する操作、曲線の補間方式、線幅などの設定は、この説明だけでは分かりません。

## 何が起きるのか

点は、線を置きたい場所を考えるための目印です。たとえば、左から右へ進む線の途中に曲がり角を設けたい場合、「どこを通る線にするか」を複数の位置で考えます。Wormでは、そのような指定点を基準として、直線部分と曲線部分を持つ線を生成します。

ここでいう「直線」は曲がらずに進む線、「曲線」は途中で向きが滑らかに変わる線です。両方を組み合わせられる点がWormの特徴ですが、**すべての点をどの順番で結ぶか、角の丸め方を個別に編集できるか**までは21.1 Manualに記載されていません。一般的なベジェパスと同じハンドル操作があると決めつけないでください。

Wormは、画像の輪郭を自動抽出するツールとして説明されているわけではありません。まず「自分で位置を指定して線の形を作る」用途で考え、写真などのエッジ検出とは分けて選びます。

<!-- capture:S287 -->

## 実機例：グラデーションに線を表示する

合成した白黒グラデーションを `Worm` に接続しました。この静止画では白い線の直線部分と曲がった部分が表示されています。Viewerの緑と赤の表示は操作用ガイドです。ほかの曲線設定やAlpha値は未検証です。[接続と設定の記録](/img/fusion/captures/S287/readback.json)に条件を記載しています。

[![グラデーションをWormへつなぐノード構成](/img/fusion/captures/S287/graph.png)](/img/fusion/captures/S287/graph.png)

合成グラデーションをWormへ渡します。

[![WormのControlsページ](/img/fusion/captures/S287/controls.png)](/img/fusion/captures/S287/controls.png)

この例のStartとGlobal Lengthなどを表示しています。

[![入力の白黒グラデーションとガイド](/img/fusion/captures/S287/low.png)](/img/fusion/captures/S287/low.png)

入力には操作用ガイドが重なっています。

[![白い線が重なったWorm出力](/img/fusion/captures/S287/high.png)](/img/fusion/captures/S287/high.png)

出力には白い線と操作用ガイドが見えます。

[再現用Graph](/img/fusion/captures/S287/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S287/capture.json)

<!-- /capture:S287 -->


## 入力と出力

| 項目 | 分かっていること | 未確認の範囲 |
| --- | --- | --- |
| 形状を決める情報 | 指定した点を使って直線と曲線を組み合わせる。 | 点をInspector、Viewer、入力画像のどれで指定するか。点の最大数や順序。 |
| 画像入力 | 21.1 Manualは「Image Tools」に分類。実機例ではグラデーションをSDK上のImage入力に接続した。 | 入力が必須か、Effect Maskなどの有無と端子数。 |
| 生成結果 | 直線部分と曲線部分を含む線の図柄。 | 線色、太さ、Alpha、背景が透明かどうか。 |
| 出力 | 既存COLLECTANEAカタログでは`image`に分類されている。 | 21.1実機での正式な出力端子名・数、接続可能なデータ型。 |

<Term id="image">Image</Term>は、画素を持つ2D画像データです。一方、FusionのShape系ツールが扱うのは、描画前の図形情報です。「点から線を作る」と聞いてShapeデータを出力すると推測せず、WormをViewerに表示し、後段へ接続できる出力を確認してください。

このページの`outputs: [image]`は既存カタログの分類です。公式Manualの短い紹介文だけで、接続口のAPI仕様まで確定したという意味ではありません。また、今回の実機例では画像をImage入力へ接続しましたが、入力が必須かどうかは確認していません。

## 主な用途

### 線で作るタイトル装飾

タイトルの横に、短い直線から曲線へ切り替わる装飾を置く用途が考えられます。最初から文字全体を縁取ろうとせず、線だけをViewerで確認し、文字の読みやすさを損なわない位置に置きます。線の太さや色をWorm自身で調整できるかは未確認なので、必要なら後段の画像処理や合成で見え方を整える方針にします。

### 道筋や動線を示すグラフィック

画面内の複数の場所を通る経路を、直線と曲線を混ぜた線で示す表現の候補です。動線そのものを描くことと、線の先端が進むように見せるアニメーションは別の作業です。**Wormに自動描画アニメーションやWrite On機能があることは確認していません。** 動きを付ける場合は、まず静止した線の形と出力を確認してから方法を選びます。

## 制作例：背景映像に線を重ねる

次はWormの出力を2D画像として取り出せる場合の**概念的な合成例**です。端子の配置を示すWorm固有の接続図ではありません。

```text
Worm ────────────→ Merge（Foreground）
                         ↓
MediaIn ─────────→ Merge（Background）→ MediaOut
```

1. Wormを追加して単体の結果をViewerで見ます。指定点を変更できる操作が表示される場合は、まず少ない点で直線と曲線の違いを観察します。これは動作確認の提案であり、Inspector項目名や点の設定方法の説明ではありません。
2. 元の映像をMediaInからMergeのBackgroundへ接続します。
3. Wormの結果が2D Imageとして接続できることを確認したら、MergeのForegroundへ渡します。
4. 線以外の部分まで映像を覆う場合は、Worm出力のAlpha（透明度）を確認します。**線以外が必ず透明になるとは限りません。** 必要に応じてマット処理やMerge側のBlendなどで重なり方を調整します。
5. 合成後に、線の位置、背景とのコントラスト、文字との重なりを確認します。発光させたい場合は、まず線と背景を正しく合成できてからGlowなどの画像処理を検討します。

MergeのForeground / Background / Blendは標準の[Merge](../compositing/merge)の機能です。Wormに同名の設定があることを示していません。

## 似たツールとの違い

| ツール | 21.1 Manualで確認できる役割 | 選び分け |
| --- | --- | --- |
| **Worm** | 指定した点を使い、直線と曲線を組み合わせる。 | 直線部分と曲線部分を持つ線の図柄を考えるとき。 |
| [Connect](./connect) | 個々の点（waypoint）を一本の連続線で結ぶ。 | 点を経由する連続線を作ることが目的のとき。 |
| [Lines](./lines) | 一組または複数組の線を繰り返してパターンを作る。 | 位置を指定した経路より、反復する線模様が目的のとき。 |
| [Rasterize](./rasterize) | 画像を点・四角形・ひし形などの並びへ変換する。 | もとの画像を網点や図形の集合として描き直すとき。 |

ConnectとWormはどちらも指定した点に関係しますが、Manualの説明は同じではありません。Connectは**点と点を連続線で接続すること**、Wormは**直線と曲線を組み合わせること**に重点があります。両者の点編集UIや線の結び方が同一かどうかは未確認です。

## 注意点と出典

**未確認**：Wormの内部REGID、入力が必須かどうか、補助入力・出力端子、指定点の編集方法、別の曲線、線の設定を変えた結果・Alpha、描画アニメーション、Inspectorの項目の意味・既定値・範囲、DaVinci Resolve Free / StudioとFusion Studioの差、別条件での実機動作。`verification: partial`を維持しています。

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2435「Image Tools / Worm」。同章p.2434のConnect、p.2435のLinesとRasterizeを比較対象として参照しました。

[Krokodove全体](./)と[Imageデータの概念](../../learn/02-data/image)も参照してください。
