---
title: sZigZag
description: KrokodoveのsZigZagがShapeの線分を波打たせ、輪郭をギザギザにする仕組みと実用例を解説。
doc_type: node
term_id: szigzag
term_short: 上流Shapeの各線分を波打つ線へ変え、図形の輪郭に凹凸を作るKrokodoveのツール。
verification: partial
aliases: [sZigZag]
concepts: [shape-data]
nodes: [sZigZag]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# sZigZag

**sZigZag**は、図形の輪郭を構成する**線分を波打つ線に変え、縁をギザギザにする**KrokodoveのShapeツールです。DaVinci Resolve 21.1 Reference Manualでは、上流のShapeに含まれる各線分から波打つ線を作り、輪郭を崩す機能として説明されています。

ここでいう<Term id="shape-data">Shape</Term>とは、円や多角形の輪郭などを、まだ画像のピクセルに変換せず保持する**図形データ**です。sZigZagは画像にノイズを重ねるフィルターでも、図形を複数コピーする機能でもありません。元の図形そのものの輪郭を加工します。ShapeとImageの違いは[シェイプ（Shape）](../../learn/02-data/shape)を参照してください。

## 何が変わるのか

四角形を例にすると、加工前の輪郭は4本の直線で構成されています。sZigZagは、その**各線分を波打つ線へ置き換える方向の処理**です。四角形を4枚複製するのではなく、一本一本の辺に凹凸が生まれ、全体の縁がギザギザに見えるようになります。

ただし、ここでいう「波」は**働き方を説明する言葉**です。必ず正弦波になる、三角波になる、一定間隔で山と谷が並ぶなどとは断定できません。ManualにはInspectorの項目名や波の計算式は掲載されていません。凹凸が角をどのようにつなぐか、輪郭の外側と内側のどちらに広がるかも実機で確認が必要です。

sZigZagが扱うのは**輪郭の形**です。輪郭線の色や太さ、図形の塗りの変更を目的とする場合は、別のShapeツールと役割を分けます。

<!-- capture:S285 -->

## 実機例：四角形の縁に凹凸を作る

`sRectangle` を分岐し、一方を `sZigZag` に接続しました。それぞれを `sRender` で画像化すると、この静止画では処理後の縁がギザギザに見えます。Viewerの市松模様は透明部分の表示です。ほかの形やAlpha値、アニメーションは未検証です。[接続と設定の記録](/img/fusion/captures/S285/readback.json)に条件を記載しています。

[![sZigZagの処理前後を比較するノード構成](/img/fusion/captures/S285/graph.png)](/img/fusion/captures/S285/graph.png)

四角形を分岐し処理前後を画像化します。

[![sZigZagのInspector](/img/fusion/captures/S285/controls.png)](/img/fusion/captures/S285/controls.png)

TypeはBy segment、Stepsは3です。

[![処理前の白い四角形](/img/fusion/captures/S285/low.png)](/img/fusion/captures/S285/low.png)

処理前は直線の辺を持つ四角形です。

[![縁がギザギザになった四角形](/img/fusion/captures/S285/high.png)](/img/fusion/captures/S285/high.png)

処理後の縁に凹凸が見えます。

[再現用Graph](/img/fusion/captures/S285/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S285/capture.json)

<!-- /capture:S285 -->


## 入力と出力

| 段階 | データ分類 | 内容 |
| --- | --- | --- |
| 入力 | Shape | 上流の図形と、その輪郭を受け取る。 |
| 処理 | 線分の波形化 | 図形を構成する線分を波打つ線へ変える。 |
| 出力 | Shape | 変形した輪郭を次のShapeツールやsRenderへ渡す。 |

Shape入力／Shape出力は、公式Manualの「Shape Tools」分類とCOLLECTANEAの既存カタログによる整理です。**正式な端子名、端子数、補助入力の有無は未確認**です。Shapeを通常の2D Imageとして扱うには、後段の[sRender](../shapes/s-render)で画像化します。

## 最初に試す構成

以下は、上の実機例でも使用した基本構成です。別の形や設定での結果は未確認です。

~~~text
sRectangle → sZigZag → sRender → MediaOut
 四角形       輪郭の変形    画像化      表示
~~~

1. [sRectangle](../shapes/srectangle)で横長の四角形を作ります。まずsZigZagを入れず、sRectangleからsRenderへ接続してまっすぐな辺を確認します。
2. 間にsZigZagを置き、Shapeの接続が成立するか確かめます。sRenderの解像度とViewer倍率は比較中に固定します。
3. Inspectorの**実際に存在する項目**を確認し、一度に一つだけ値を変えます。波の振幅・周期などがどの名前で用意されているかは未確認なので、特定のスライダーを前提にしません。
4. 元の四角形と見比べ、長い辺・短い辺のどこに凹凸が現れ、角で線がどう接続されるかを観察します。見た目の差だけでなく、外周が元の図形より広がるかも確認します。
5. 次は[sPolygon](../shapes/spolygon)で斜めの辺や鋭角を含む図形を作り、同じ方法で比較します。

sRenderの出力解像度を同時に変えてしまうと、輪郭加工の差と画像化による見た目の差を分けにくくなります。sZigZagの効果を比較するときは、まず画像化の条件を固定します。

## 制作での使い方

### タイトルプレートの縁に凹凸をつける

文字の背後に置く四角形を、均一な直線だけのプレートから、波打つ縁を持つ図形へ変えたい場合に検討できます。

~~~text
sRectangle → sZigZag → sRestyle → sRender → Merge
  元の形       輪郭の形      塗り・線     画像化    背景と合成
~~~

[sRestyle](./srestyle)はShapeの塗りや輪郭線の見た目を変更するツールです。この例ではsZigZagが**外形**を変え、sRestyleが**色や線の外観**を扱う想定です。両者を併用したときの正確な表示結果は実機未確認なので、単純な四角形で確かめてから利用します。

### ロゴや記号の外周を加工する

基本となるロゴ・アイコンの図形を上流で作っておき、後段で縁だけを荒らす表現を試す用途にも向きます。ただし、元の角の位置や外接範囲まで維持されるとは限りません。形状の厳密さが求められるロゴでは、加工前後のシルエットを重ねて比較する必要があります。

### sResampleの前後でどう変わるかを比較する

[sResample](./sresample)はShape輪郭のサンプリングを変える別のツールです。線分単位の波形化に影響があるかは、次の2つの順番を比べることで調べられます。

~~~text
sPolygon → sResample → sZigZag → sRender
sPolygon → sZigZag  → sResample → sRender
~~~

これは**比較のための構成案**です。sResampleの位置を変えることで波の数が増える、必ず滑らかになる、といった効果は確認されていません。元図形と各ツールの設定を固定して結果を観察してください。

## 似たShapeツールとの違い

| ツール | 主に変える部分 | 選ぶ目安 |
| --- | --- | --- |
| **sZigZag** | 輪郭を構成する各線分 | 辺を波打つ線へ変えたい。 |
| [sSmooth](./ssmooth) | 角と角の間にある辺 | 角を残しながら辺を滑らかにしたい。 |
| [sRound](./sround) | 図形の角 | 辺を保ちながら角を丸くしたい。 |
| [sResample](./sresample) | 輪郭のサンプリング | 輪郭の情報の取り方を変えたい。 |
| [sOffset](../shapes/soffset) | 輪郭の広がり | 輪郭を外側へ広げたり内側へ縮めたりしたい。 |
| [sRestyle](./srestyle) | 塗り・輪郭線の外観 | 輪郭の形より色や線の見た目を変えたい。 |

sSmoothも線分を扱いますが、Manualでは**滑らかな辺を作り、角を保持する**機能とされています。sZigZagは各線分を波打たせ、ギザギザの縁を作る機能です。また、sOffsetの目的は輪郭の拡張・収縮であり、波形化とは異なります。

## 注意点と確認範囲

- **21.1 Manualで確認済み**：KrokodoveのShape Toolsに属し、入力Shapeの各線分から波打つ線を作って輪郭をギザギザにすること。
- **既存カタログによる分類**：入力・出力はShape。通常の2D画像処理へ進める場合はsRenderで画像化する。
- **Inspectorの未確認範囲**：実機例以外の設定の意味、初期値、範囲、単位、波形の種類、アニメーション対応。
- **形状ごとの挙動未確認**：鋭角・短い辺・開いた輪郭・複数Shape・自己交差・曲線部分・角の接続、輪郭が外側へどれだけ広がるか。
- **環境差未確認**：Resolve Free／Studio／Fusion Studioでの提供差、内部REGID、別条件での端子表示と描画結果。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2437「Shape Tools — sZigZag」。同ページのsSmooth、sRound、sResample、sOffset、sRestyleの説明も比較のために参照しました。

**関連資料**：同Manual Chapter 117「Shape Nodes」、[シェイプ（Shape）](../../learn/02-data/shape)、[sRender](../shapes/s-render)。実機例は一条件の静止画であり、その他のInspector設定や条件は未確認のためverificationはpartialのままです。
