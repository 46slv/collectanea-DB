---
title: Rasterize
description: 入力画像を点・四角形・菱形などの集まりに変換する、Krokodoveのハーフトーン風画像フィルター。用途と合成例、未確認の設定を整理。
doc_type: node
term_id: rasterize
term_short: 入力画像を点・四角形・菱形などの図形で表現し、印刷の網点に似た見た目へ変換する画像フィルター。
verification: partial
aliases: [Rasterize]
concepts: [image-data]
nodes: [Rasterize]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Rasterize

Rasterizeは、**入力画像を点・四角形・菱形などの図形の集まりに変換し、ハーフトーン風の見た目にする**Krokodoveの画像フィルターです。人物写真や映像を、印刷物の網点や幾何学模様で描き直したような表現にしたいときの候補になります。

DaVinci Resolve 21.1 Reference Manualでは、入力画像を受け取って形の連なりへ変換するフィルターとして紹介されています。ただし、選べる形の一覧、図形の大きさ、色の決まり方など、Inspectorの詳細はその説明だけでは分かりません。

## ハーフトーンとは何か

ハーフトーンは、細かな点などの集まりで明るさや階調を表現する方法です。たとえば新聞や印刷物を拡大すると、連続した灰色に見える部分が小さな点の集まりになっていることがあります。離れて見ると濃淡に見え、近づくと一つひとつの形が分かります。

Rasterizeも、入力画像をそのままぼかしたり、同じ画像を何枚も並べたりするのではなく、**画像の見た目を図形の並びへ置き換える**方向のツールです。Manualは点（dots）、四角形（squares）、菱形（diamonds）を例示しています。各図形の面積や間隔が元画像の明るさとどう対応するか、色をどう保持するかまでは記載されていないため、特定の変換式や操作項目はここでは断定しません。

ここでいう「図形」は、結果の画像に見える丸や四角のことです。Fusion標準の<Term id="shape-data">Shapeデータ</Term>を生成するという意味ではありません。Shapeデータは描画前の輪郭などを扱う別の種類のデータで、必要に応じて[sRender](../shapes/s-render)で2D画像へ変換します。

また、一般的な「ラスタライズ」という言葉には、ベクターの輪郭をピクセル画像へ変換する意味もあります。このページのRasterizeは**Krokodove固有のハーフトーン風フィルター**を指し、あらゆるベクターデータを画像へ変換する汎用機能ではありません。

<!-- capture:S267 -->

## 実機例：濃淡を点で表す

合成した白黒グラデーションを `Rasterize` に接続しました。この静止画では左から右へ白い点が大きくなる並びが表示されます。Viewerには透明部分の市松模様と操作用オーバーレイが表示されています。ほかの形やAlpha値は未検証です。[接続と設定の記録](/img/fusion/captures/S267/readback.json)に条件を記載しています。

[![グラデーションをRasterizeへつなぐノード構成](/img/fusion/captures/S267/graph.png)](/img/fusion/captures/S267/graph.png)

合成グラデーションをRasterizeへ渡します。

[![RasterizeのInspector](/img/fusion/captures/S267/controls.png)](/img/fusion/captures/S267/controls.png)

Sizeは0.01、Grid Size X/Yは2です。

[![入力の白黒グラデーション](/img/fusion/captures/S267/low.png)](/img/fusion/captures/S267/low.png)

入力は黒から白へのグラデーションです。

[![白い点が並ぶRasterize出力](/img/fusion/captures/S267/high.png)](/img/fusion/captures/S267/high.png)

右へ向かって点が大きく見えます。

[再現用Graph](/img/fusion/captures/S267/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S267/capture.json)

<!-- /capture:S267 -->

## 入力と出力

| 段階 | 扱うもの | 確認できる範囲 |
| --- | --- | --- |
| 入力 | 2Dの<Term id="image">Image</Term> | 21.1 Manualには画像を受け取るフィルターとある。正式な入力端子名、補助入力の数は未確認。 |
| 処理 | 画像を点・四角形・菱形などの図形の集まりとして表現する | Chapter 105、p.2435のRasterize説明で確認できる。 |
| 出力 | 変換結果の2D Image | Krokodoveの「Image Tools」分類とフィルターとしての説明に基づく。正式な出力端子名、Alphaや解像度の扱いは未確認。 |

最初は画像をRasterizeへ接続し、その出力をViewerに表示します。入力と出力を同じ表示倍率で見比べると、画像のどの部分が図形へ変換されているかを確認できます。

画像のAlpha（透明度）がそのまま維持されるか、図形以外の部分が透明になるかは、Manualの短い説明からは確定できません。別の映像へ重ねる場合は、通常のカラー表示に加えてViewerのAlpha表示も確認します。

## 主な用途

**写真や映像の印刷物風加工**では、被写体の輪郭や明暗を点・四角形などで表現する見せ方が考えられます。元の映像と切り替えれば、実写からポスター調へ変化する演出の候補になります。

**タイトルやMVの背景**では、ハーフトーン化した映像を薄く重ねたり、背景の一部に使ったりできます。被写体が読み取りにくくなる場合は、処理後の画像と元映像の合成量を調整する構成にすると比較しやすくなります。

これらはManualにある基本機能から考えた**制作上の利用例**です。今回の例ではSizeとGrid Size X/Yを設定していますが、値を変えた比較やアニメーション方式は未検証です。

## 制作例：元映像とハーフトーン映像を混ぜる

次は、Rasterizeの変換結果をそのまま出力する方法と、元映像へ混ぜる方法を比較する例です。

1. Fusionで映像のMediaInをKrokodoveのRasterizeへ接続し、Rasterizeの出力をViewerに表示します。まず画像が変換されているか確認します。
2. 入力と出力を見比べ、画面内の細部がどのような形へ変わるかを観察します。Inspectorに図形や見た目を調整する項目がある場合は、実際に表示される名称を確認してから変更します。実機例ではSizeとGrid Size X/Yの値を示しています。
3. 元画像と処理後の画像を比較しながら混ぜたいときは、標準の[Merge](../compositing/merge)を追加します。元映像をBackground、Rasterizeの出力をForegroundへ接続します。

    MediaIn（元映像） ───────────────────→ Merge（BG） ─→ MediaOut
           └────────→ Rasterize ───────→ Merge（FG）

4. MergeのBlendで元映像と処理後の映像の混ざり方を調整します。これはMerge側の合成設定であり、Rasterize固有の設定ではありません。
5. 画面の一部分だけに効果を出す場合は、MergeのEffect Mask入力へ適切なマスクを接続する構成を検討します。Rasterize自身に専用マスク入力があると確認したわけではありません。

この配線は、確認できている2D Image処理と標準Mergeを組み合わせた**構成案**です。Krokodove固有の端子名やAlphaの扱いを保証する公式作例ではありません。

## 似たツールとの違い

| ツール | 何をするか | 選ぶ目安 |
| --- | --- | --- |
| **Rasterize（Krokodove）** | 入力画像を点・四角形・菱形などの集まりへ変換する | 実写や写真の見た目をハーフトーン風に変えたい |
| [Pattern](./pattern) | 図形を敷き詰めて画面全体の模様を作る | 元画像の階調よりも、規則的な背景模様を作りたい |
| [Duplicate（Krokodove）](./duplicate) | 入力画像を選んだ配置・形に沿って繰り返す | ロゴや絵柄そのものを複製したい |
| [Noise（Krokodove）](./noise) | ピクセル状の模様を作り、ランダムまたは指定色を利用する | 元画像の形状変換より、ノイズ模様が欲しい |
| [sRender](../shapes/s-render) | FusionのShapeデータを2D Imageへ描画する | 編集可能な輪郭データを画像処理へ渡したい |

特にPatternとの違いは、**Rasterizeは入力した画像の表現を変えるフィルター、Patternは図形の模様を作る画像生成ツール**という点です。画像から被写体の明暗を生かした表現を作りたいのか、最初から規則的な模様を作りたいのかで選びます。

## 確認したい点と注意

- **元画像が見えなくなった**：Rasterizeの出力は元画像と同じ見た目ではありません。元画像を残したい場合は、Mergeで原画像との合成を試します。
- **背景が透けない**：Rasterizeが透明な余白を出力するとは確認できません。元画像・処理後画像のAlphaをそれぞれ確認し、MergeのBlendと切り抜き処理を区別します。
- **細かな模様が読めない**：小さな図形はViewerの表示倍率や最終出力の解像度で見え方が変わります。等倍表示と実際の視聴サイズで比較します。これは一般的なハーフトーン表現の制作上の注意です。
- **期待する形に変わらない**：Manualで例示されるのは点・四角形・菱形ですが、それらをどの操作で切り替えるかは未確認です。実機のInspectorと出力を照合します。

Krokodoveには2D ImageのほかにShape・3D・Region系のツールもあります。データの種類から探す場合は[Family Overview](./)を参照してください。

## 出典・バージョン・未確認事項

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2435（Image Tools／Rasterize）。入力画像を点・四角形・菱形などの連なりへ変換し、ハーフトーン風の画像を作るフィルターであることを確認しました。
- **比較対象**：同Manual p.2435のPattern（Image Create Tools）、p.2436のDuplicate・Noise（Image Pixel Tools）。各項目の記述に基づく用途の違いを整理しました。
- **未確認**：正確な入力・出力端子名と数、今回の例以外のInspector項目の意味・初期値・数値範囲、図形の選択方法と描画規則、色とAlphaの変換方法、DoD・解像度、アニメーション可否、Free / StudioなどのEdition差、別条件での実機描画結果と内部REGID。

`verification: partial`は、公式Manualで確認できる基本機能と、実機または詳細資料で追加確認が必要な仕様を区別するための状態です。
