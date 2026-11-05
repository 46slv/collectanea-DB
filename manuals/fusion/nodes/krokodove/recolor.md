---
title: Recolor
description: Krokodove Recolorで画像内の特定の色を別の色に置き換える方法と、近い色変更ツールとの違いを説明。
doc_type: node
term_id: recolor
term_short: 画像内の元の色を1色以上指定し、選ばれた部分を新しい色に置き換えるKrokodoveの画像ツール。
verification: partial
aliases: [Recolor]
concepts: [image-data]
nodes: [Recolor]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Recolor

Recolorは、**画像内で変更したい色を指定し、その色に当たる部分を別の色へ置き換える**Krokodoveのツールです。DaVinci Resolve 21.1 Reference Manualでは、元の色（source color）を1色以上指定し、選ばれた部分を色見本（color swatch）で設定した新しい色へ置き換えると説明されています。

たとえば、赤い看板だけを青くしたいとき、画面内のすべてを青くするのではなく、まず「どの元の色を変更するか」を指定する考え方です。ただし、どれほど近い色まで同時に選ばれるか、境界のぼかし方、複数色の優先順位などは、このManualの説明だけでは分かりません。

## 元の色と置き換え先の色

Recolorでは、色を二つの役割に分けて考えます。

- **元の色（source color）**：画像の中から、変更の対象として指定する色。赤い看板を変えたいなら、対象となる赤がこれに当たります。
- **置き換え先の色**：選ばれた部分へ新しく割り当てる色。Manualでは、色見本（color swatch）を使って指定すると説明されています。

一つの元の色だけでなく、**複数の元の色を指定できる**ことも21.1 Manualに記載されています。ただし、一度に何色まで登録できるか、元の色と新しい色をどのように対応づけるかというInspectorの詳しい操作までは確認できていません。

「赤を青に置き換える」という説明は、赤に近い画素がすべて一律に青くなるという保証ではありません。素材に影や反射、圧縮による色の揺れがあると、同じ物体でも画素の色は少しずつ異なります。Viewerで対象の端や暗い部分も確認します。

<!-- capture:S245 -->

## 実機例：赤い文字を青に置き換える

合成した赤い `Text+` の文字を `Recolor` に渡し、Color From 1を赤、Color To 1を青、Toleranceを0.1に設定しました。

この例では赤い文字が青く表示されます。Viewerには透明部分を示す市松模様が表示されています。複数色やAlpha値の変化は未検証です。[接続と設定の記録](/img/fusion/captures/S245/readback.json)に条件を記載しています。

[![文字画像をKrokodove Recolorへつなぐ構成](/img/fusion/captures/S245/graph.png)](/img/fusion/captures/S245/graph.png)

文字画像をRecolorへ渡します。

[![RecolorのInspector](/img/fusion/captures/S245/controls.png)](/img/fusion/captures/S245/controls.png)

元の色を赤、置き換え先を青に設定しています。

[![処理前の赤い文字](/img/fusion/captures/S245/low.png)](/img/fusion/captures/S245/low.png)

処理前の赤い文字です。

[![Recolorで青くなった文字](/img/fusion/captures/S245/high.png)](/img/fusion/captures/S245/high.png)

処理後は文字が青く表示されます。

[再現用Graph](/img/fusion/captures/S245/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S245/capture.json)

<!-- /capture:S245 -->

## 入力と出力

| 段階 | データ | 確認できる役割 |
| --- | --- | --- |
| 入力 | 2D Image | 色を置き換えたい画像。21.1 ManualのImage Color Toolsに掲載されています。 |
| 処理 | 元の色を1色以上選び、新しい色へ置き換える | 元の色の指定と色見本による置換がManualに記載されています。 |
| 出力 | 色の置換後の2D Image | 画像の色を処理するツールとして扱います。Alphaや解像度の扱いは未確認です。 |

ここで扱うのは、画素ごとの色を持つ<Term id="image">Image</Term>です。輪郭や塗りの情報を描画前に保持する<Term id="shape-data">Shapeデータ</Term>を直接編集するノードではありません。[Krokodoveの全体像](./)では、Image・Shape・3D・Regionの違いを整理しています。

Frontmatterの `inputs: [image]` / `outputs: [image]` はデータ分類です。実際のノードに表示される入力端子名、補助入力の数、出力端子名を確定したものではありません。

## 何に使うか

### 映像内のアクセントカラーを変える

MVや広告で、衣装・小物・背景の一部分にある色だけを作品の配色へ寄せたい場面に使えます。たとえば赤い看板を青へ変えても、被写体の肌色や道路の色まで変えたくない場合です。

ただし、別の場所にも似た赤があれば、そこが同時に変わる可能性を考える必要があります。対象を完全に限定したいときは、Recolor単体で選択範囲を保証するのではなく、後段のMergeとMaskで表示範囲を制限する方法を検討します。

### 色違いのグラフィックを比較する

同じ図案から配色の異なる案を作る場合、元画像を複製してから、各案にRecolorをかける構成が考えられます。ロゴや背景グラフィックの配色検討に向きます。

ただし、複数の色を置換した際の重なり順や処理順は未確認です。置き換え先の色が別の元の色の指定と一致するときも、結果を実際に確認します。

### 色変更の前後を比較する

元映像とRecolor後の画像を同じMergeへ接続すれば、加工を強く出すか、少しだけ混ぜるかを後段で調整できます。これは標準のMergeの機能を使った運用例であり、Recolor自身に混合量の設定があると説明しているわけではありません。

## 制作例：看板の色を変え、元映像と比較する

以下は、標準のFusionノードとRecolorを組み合わせる**構成案**です。KrokodoveのInspector項目を一つずつ示す公式チュートリアルではありません。

    MediaIn（元映像） ──────────────────→ Merge（BG） ─→ MediaOut
             └────────→ Recolor ───────→ Merge（FG）

1. MediaInをRecolorへ接続し、その出力をViewerに表示します。元映像を別のViewerにも表示して、変更前後を比較できるようにします。
2. 21.1実機のRecolorで、変更したい**元の色**を指定します。Manualは1色以上の元の色を指定できると説明していますが、選択操作や正確な設定名は実機で確認してください。
3. Manualに記載された**色見本**を使って、新しく割り当てたい色を設定します。どの画素が変化したか、看板以外にも変化が出ていないかを確認します。
4. 元映像をMergeのBackground（BG）へ、Recolorの結果をForeground（FG）へつなぎます。MergeのBlendで原画と加工結果の割合を調整します。
5. 看板以外にも色変更が出る場合は、MergeのEffect Maskで加工結果を表示する範囲を限定します。ここで使うマスクは**Merge側**の機能であり、Recolor固有のマスク入力の存在を意味しません。

実写素材ではフレームを移動させ、照明や被写体の向きが変わる場面も確認します。あるフレームで狙い通りでも、影や反射で色が変わる別のフレームでは同じ結果になるとは限りません。

## 近いツールとの違い

| ツール | 21.1 Manualで確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Recolor（Krokodove）** | 元の色を1色以上指定し、色見本で設定した新しい色へ置き換える | 変更したい元の色を基準に選びたい |
| [Replace Color（Krokodove）](./replace-color) | 元の色を指定し、補正へ置き換える | 単純な置換以外の色補正も検討したい。ただし補正内容の詳細は未確認 |
| [Match Color（Krokodove）](./match-color) | シャドウ・中間調・ハイライトなどの明るさの帯域を選び、その色を置き換える | 元の色そのものより、明暗の領域を基準にしたい |
| [Color Map（Krokodove）](./color-map) | テクスチャを1色以上の均一な色へ対応づける。手動指定・自動検出が可能 | 画像全体を少数の塗り色で構成する表現を試したい |
| [Threshold（Krokodove）](./threshold) | 指定チャンネルの色・明るさの狭い範囲を、許容幅を調整して取り出す | まず色や明るさの範囲を選別したい |

**RecolorとReplace Colorは名前が似ていますが、21.1 Manualの説明は同じではありません。** Recolorは元の色を複数指定して新しい色へ置換することを明示し、Replace Colorは選んだ元の色を「補正」に置き換えると説明しています。両者のInspectorや結果が等価だとは断定しません。

## 注意点・未確認の仕様

- **似た色の巻き込み**：元の色に対する許容幅、選択の滑らかさ、境界の処理は未確認です。対象外の場所や影の部分もViewerで確認します。
- **複数色の扱い**：指定可能な色数の上限、置換の処理順、複数の指定が重なる場合の動作は未確認です。
- **透明部分**：Alphaの保持、透明領域の色の扱い、解像度の変化は未確認です。
- **正式な設定名**：Manualが明示するのは元の色の指定とcolor swatchによる置換までです。スポイト、ToleranceなどをRecolor固有のInspector項目として推測していません。
- **利用環境**：Fusion 21.1での正式な端子名・数、REGID、DaVinci Resolve Free / Studio / Fusion Studio間の違いは実機で確認していません。

## バージョン・出典

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2435「Image Color Tools / Recolor」。1色以上のsource colorの指定、color swatchによる置き換えを確認。
- **同章の比較項目**：p.2434「Image Tools / Color Map」、p.2435「Image Color Tools / Match Color・Replace Color・Threshold」。
- **関連**：[Krokodoveの画像・Shape・3D・Region](./)。

基本機能は21.1 Manualに基づきます。実機例では一組の色とToleranceを確認しました。入出力端子の詳細やAlpha処理は未検証のため `verification: partial` を維持しています。
