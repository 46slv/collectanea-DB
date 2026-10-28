---
title: Generate
description: 入力素材へグレースケールのノイズ模様を加えるKrokodoveの画像ツール。Fast NoiseやNoiseとの違い、接続例、確認事項を説明。
doc_type: node
term_id: generate
term_short: 入力素材に濃淡のあるノイズ模様を加え、グレースケール画像を生成するKrokodoveのツール。
verification: partial
aliases: [Generate]
concepts: [image-data]
nodes: [Generate]
node_family: krokodove
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Generate

Generateは、**入力された素材に細かな濃淡の模様（ノイズ）を加える**Krokodoveのツールです。DaVinci Resolve 21.1 Reference Manualでは「Image Create Tools」に分類され、元の入力へテクスチャーを加え、ランダムに見えるグレースケールのノイズパターンを生成すると説明されています。

「ノイズ」とは、画面の明るさが場所ごとに不規則に変わる模様のことです。ここでのグレースケールは、色相の異なる粒ではなく、暗い値から明るい値までの濃淡を使うという意味です。**粒の大きさ、分布、動き、元画像との混ざり方まではManualの短い説明だけでは分かりません。**

## 何をするツールか

単色の画像を思い浮かべると、Generateの用途を捉えやすくなります。全面が均一な灰色なら、すべての場所がほぼ同じ明るさです。そこへノイズが加わると、場所によって明るい部分と暗い部分が現れ、均一だった面に細かな変化が生まれます。実際の模様が滑らかか、粒状か、どれほど不規則かはViewerで確認します。

Manualの説明には「source inputへテクスチャーを追加する」という記述があります。このため、入力画像に作用するツールとして考える根拠はあります。ただし、**入力画像を内部でどのように処理するか**、元画像をそのまま残して上に重ねるのか、出力がノイズ画像へ置き換わるのかは明示されていません。画像がどのように変わるかを作例の結果として断定しないようにします。

このGenerateは、プログラミングで一般に使う「生成」という言葉でも、Fusionの標準Generator全体の名前でもありません。Krokodoveというツール群に含まれる個別のノード名です。

<!-- capture:S259 -->

## 実機例：濃淡の模様を見る

合成した白黒グラデーションを `Generate` に渡し、BaseをPosition、Scaleを16に設定しました。

この例では濃淡のある不規則な模様が表示されます。Viewerには操作用オーバーレイが表示されています。ほかのBaseや時間変化、Alpha値は未検証です。[接続と設定の記録](/img/fusion/captures/S259/readback.json)に条件を記載しています。

[![グラデーションをKrokodove Generateへつなぐ構成](/img/fusion/captures/S259/graph.png)](/img/fusion/captures/S259/graph.png)

白黒グラデーションをGenerateへ渡します。

[![GenerateのInspector](/img/fusion/captures/S259/controls.png)](/img/fusion/captures/S259/controls.png)

BaseはPosition、Scaleは16です。

[![入力の白黒グラデーション](/img/fusion/captures/S259/low.png)](/img/fusion/captures/S259/low.png)

入力は黒から白へ連続して変化します。

[![Generateで表示された濃淡の模様](/img/fusion/captures/S259/high.png)](/img/fusion/captures/S259/high.png)

出力には濃淡のある不規則な模様が見えます。

[再現用Graph](/img/fusion/captures/S259/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S259/capture.json)

<!-- /capture:S259 -->

## 入力と出力

| 段階 | 内容 | 根拠と確認範囲 |
| --- | --- | --- |
| 入力 | テクスチャーを加える元の素材（source input） | 21.1 Manualにsource inputへの言及があります。端子の正式名称、個数、必須かどうか、受け付ける正確な型は未確認です。 |
| 処理 | グレースケールの、ランダムに見えるノイズ模様を作る | Chapter 105、p.2435のGenerate説明に記載されています。 |
| 出力 | 2Dの<Term id="image">Image</Term>として扱う | Manual上のImage Create分類と既存COLLECTANEAカタログに基づきます。Alpha、画像サイズ、正式な出力端子名は未確認です。 |

Imageは、画面を構成する画素の情報です。Fusionの<Term id="shape-data">Shapeデータ</Term>は図形の輪郭などの情報を描画前の形で保持するため、両者は同じではありません。Generateのノイズは画像を扱う用途として整理しており、Shapeを複製する機能としては説明されていません。

## 主な用途

**背景に質感を付けたい場合**は、均一な色の画像に濃淡を加える素材として使えます。ポスター風のタイトル背景や、幾何学模様の上にわずかな明暗の変化を置きたいときの候補になります。

**別の映像と合成したい場合**は、生成されたノイズ画像を別のレイヤーとして扱う構成が考えられます。ただし、ノイズ画像が透明部分を持つとは確認できていません。背景を透かして重ねる必要があれば、後段の合成で表示量を調整します。

これらはManualが説明する「ノイズ模様を作る」という役割から導いた制作例です。フィルムグレインの物理特性の再現、時間的なランダム性、特定の質感プリセットが備わっているとまでは確認できません。

## 制作例：単色の背景に濃淡を加え、映像へ薄く重ねる

1. Fusionで標準のBackgroundを用意し、単色画像を作ります。
2. KrokodoveのGenerateを追加します。まずGenerateをViewerへ表示し、入力を必要とする場合は端子と受け付けるデータを確認します。Manualのsource inputの説明に沿い、接続できる画像入力があればBackgroundの出力を渡します。
3. Generateの前後をViewerで見比べ、均一な面にどのような濃淡が加わるかを確かめます。ノイズの形、明暗、色、Alphaが期待どおりかを確認してください。
4. 生成結果を映像の上に重ねたい場合は、標準の[Merge](../compositing/merge)を使います。元の映像をBackground（BG）、Generateから得た画像をForeground（FG）へつなぎます。

    Background（単色） → Generate ─┐
                                   Merge → MediaOut
    MediaIn（映像） ───────────────┘

5. Generateが不透明な画像を出して背景を隠す場合、MergeのBlendを下げるとForegroundの合成量を減らせます。ノイズがどの程度見えるかは出力の明暗・Alphaによって異なります。

この配線は構成案です。上の実機例では白黒グラデーションを入力しましたが、端子の全構成や内部合成方式を示す公式の配線図ではありません。

## Fast Noise・Noiseとの違い

| ツール | 21.1 Manualで確認できる役割 | 選ぶときの目安 |
| --- | --- | --- |
| **Generate** | source inputへテクスチャーを加え、グレースケールのノイズ模様を作る | 入力素材に濃淡の変化を加える処理を調べたいとき |
| [Fast Noise](../generators/fast-noise) | Perlin Noiseを生成する標準Generator。雲・霧などに使い、別ノードへノイズ画像を渡せる | 素材入力なしにノイズ画像を生成し、DetailやScaleなどの制御を使いたいとき |
| [Noise（Krokodove）](./noise) | ピクセル状の模様を作り、色をランダム生成または選択できる | グレースケール以外の色やピクセル状の模様を検討するとき |
| [Pattern](./pattern) | 図形をタイル状に敷き詰めた模様を作る | 不規則な濃淡よりも規則的な図形の配置が必要なとき |

Fast Noiseは標準のGeneratorで、ManualのChapter 103に詳しい入力とInspectorの解説があります。一方、KrokodoveのGenerateにはChapter 105の短い一覧説明しかありません。**Fast NoiseのDetail、Scale、SeetheなどがGenerateにもあるとは推測しません。** また、Generateの模様がFast Noiseと同じPerlin Noise方式で作られるとも確認できていません。

## バージョン・出典・未確認事項

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2435（Image Create Tools／Generate）。source inputに質感を加え、グレースケールのランダム風ノイズを作るという概要を確認しました。
- **比較資料**：同Manual、Chapter 103「Generator Nodes」、pp.2363–2364（Fast Noise）、Chapter 105、p.2436（Krokodove Noise）。Fast NoiseはPerlin Noise Generatorで、Noiseは色を選べるピクセル状のパターンとして説明されています。
- **関連資料**：[Krokodove Family Overview](./)にはImage、Shape、3D、Regionの区別を掲載しています。

**確認範囲**：実機例ではグラデーションを入力し、Base Position、Scale 16の濃淡模様を確認しました。端子の全構成、入力の必須性、生成アルゴリズム、初期値・範囲、RGB・Alphaの数値、時間変化、Edition差は未確認です。

このページのverificationはpartialです。Manualで確認した役割と、実機での検証を必要とする仕様を分けています。
