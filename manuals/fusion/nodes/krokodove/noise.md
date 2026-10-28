---
title: Noise
description: 色をランダム生成または指定してピクセル状の模様を作るKrokodoveのNoise。Generate・Dither・Fast Noiseとの違いと合成例を解説。
doc_type: node
term_id: noise
term_short: ランダム生成した色や指定色を使い、ピクセル状のノイズ模様を作るKrokodoveの画像ツール。
verification: partial
aliases: [Noise]
concepts: [image-data]
nodes: [Noise]
node_family: krokodove
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Noise

Noiseは、**色の付いた細かな画素が目立つ、ピクセル状の模様を作る**Krokodoveのツールです。DaVinci Resolve 21.1 Reference Manualでは、色をランダムに生成する方法と、色を指定する方法があると説明されています。均一な背景とは異なる、不規則で粒立った見た目が欲しいときの候補です。

同じ「Noise」という名前でも、映像に混入したノイズを除去する機能ではありません。また、Krokodoveの[Generate](./generate)やFusion標準の[Fast Noise](../generators/fast-noise)と、生成方式や操作項目が同じだとは限りません。

## 何ができるか

たとえば単色の背景は、同じ明るさ・色が広く続くため平坦に見えます。Noiseの説明にある「pixellated pattern」は、画面を構成する画素の粒が目立つような模様を指します。細部を拡大したときに、不規則な色の並びを見せる表現を考えると理解しやすくなります。

Manualが明記する色の扱いは、次の二つです。

- **ランダムに生成した色**を使う。
- **指定した色**を使う。

これは色の選び方に関する説明です。すべてのピクセルが独立に変化するのか、指定できる色が何色あるのか、モノクロにもできるのか、模様が時間とともに変化するのかは、この短い記述だけでは確定できません。「ランダム」は必ずしも毎フレーム違うという意味ではありません。

KrokodoveのNoiseは、21.1 Manualでは「Image Pixel Tools」に分類されています。画像として見える模様を作る項目であり、FusionのShapeデータや3Dシーン、Regionデータを生成する項目としては説明されていません。

<!-- capture:S263 -->

## 実機例：色付きの格子状ノイズ

合成した白黒グラデーションを `Noise` に接続し、Base Position、Combine Replace、Size Grid、Size X/Yを32、Colors Randomに設定しました。この静止画では色付きの格子状パターンが表示されます。色の指定やアニメーション、Alpha値は未検証です。[接続と設定の記録](/img/fusion/captures/S263/readback.json)に条件を記載しています。

[![グラデーションをNoiseへつなぐノード構成](/img/fusion/captures/S263/graph.png)](/img/fusion/captures/S263/graph.png)

合成グラデーションをNoiseへ渡します。

[![NoiseのInspector](/img/fusion/captures/S263/controls.png)](/img/fusion/captures/S263/controls.png)

Grid、Size X/Y 32、Colors Randomを指定します。

[![入力の白黒グラデーション](/img/fusion/captures/S263/low.png)](/img/fusion/captures/S263/low.png)

入力は黒から白へのグラデーションです。

[![色付きの格子状ノイズ](/img/fusion/captures/S263/high.png)](/img/fusion/captures/S263/high.png)

出力に色付きの格子状パターンが見えます。

[再現用Graph](/img/fusion/captures/S263/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S263/capture.json)

<!-- /capture:S263 -->

## 入力と出力

| 段階 | 扱うもの | 確認できる範囲 |
| --- | --- | --- |
| 入力 | **未確定**。実機例ではグラデーションを接続。接続せず生成できるかは未確認 | Manualには入力端子の説明がありません。「Image Pixel Tools」という分類だけで必須画像入力があるとは断定しません。 |
| 処理 | ピクセル状の模様を作り、ランダム生成または指定した色を使う | 21.1 Manual、Chapter 105、p.2436に記載。 |
| 出力 | 2Dの<Term id="image">Image</Term>として扱う | 公式Manualの画像ツール分類と既存COLLECTANEAカタログに基づく整理。端子の正式名称、Alphaや解像度の扱いは未確認。 |

ここでいうImageは、画面を構成する画素の色・透明度などの情報です。輪郭を描画前の形で保持する<Term id="shape-data">Shapeデータ</Term>とは異なります。Noiseの結果を通常の2D画像合成へ渡したい場合は、まずViewerに表示できる出力を確認してください。

**入力についての注意**：旧カタログでは入力分類をimageとしていましたが、ManualのNoise紹介文から必須入力を裏付けられません。今回の実機例では画像を接続していますが、正式な端子名・数や入力の要否は追加確認が必要です。

## 主な用途

### タイトルやグラフィックの背景

整った文字やロゴの後ろに、色の粒がある背景を作る用途が考えられます。幾何学的なパターンより不規則な印象にしたい場合に向きます。実機例ではGridとSize X/Yを32に設定しました。設定を変えた比較や調整範囲は未確認です。

### 映像に色のざらつきを薄く重ねる

Noiseが画像を出力できれば、標準のMergeで実写に重ねる構成を試せます。ここでの「ざらつき」はグラフィック上の表現であり、撮影用フィルムの粒子特性、センサーのノイズ、時間方向の粒子変化を正確に再現すると確認されたものではありません。

### 色を限定した模様の候補

公式説明には色を選べるとあります。作品の配色に近い模様が必要なら検討できますが、パレット数、色の補間、個別ピクセルへの割当方法といった設定は確認できていません。実際に指定できる範囲をInspectorで確かめます。

## 制作例：映像にピクセル状の模様を重ねる

次は標準の[Merge](../compositing/merge)と組み合わせる**構成案**です。Noise自体の正式な配線手順やプリセットを示す公式作例ではありません。

1. FusionページでNoiseを追加し、単独でViewerに表示できるかを確認します。出力が得られない場合は、ノードタイルの入力を確認します。上の実機例ではBackgroundのグラデーションをつないでいます。
2. Noiseの出力に模様が現れたら、Viewerで色の出方と粒立ちを確認します。Inspectorにランダム色・指定色に相当する設定があるかを確認し、**表示された名称**に従って操作します。今回の実機例で見える項目は上記の設定を参照してください。
3. 別のMediaInで元映像を用意し、MergeのBackground（BG）へ接続します。Noiseの画像出力をForeground（FG）へ接続します。
4. 画面がNoiseの模様で覆われる場合は、Merge側のBlendを下げ、映像が見える比率へ調整します。Noise出力に透明部分があるかは別途Alpha表示で確認します。
5. 模様を画面の一部に限定したければ、MergeのEffect Maskへ適切なマスク画像を渡す方法を検討します。Noise自身にマスク端子があると確認したわけではありません。

この例では、**Noiseが2D画像を出力できることを先に確かめる**点が重要です。もし単体生成できず画像入力が必要なら、実機で確認できた接続構成を採用します。Noiseの色や動きが固定されるかどうかも、数フレームを再生して見比べます。

## 似たツールとの使い分け

| ツール | 21.1 Manualで確認できる役割 | 向いている目的 |
| --- | --- | --- |
| **Noise（Krokodove）** | ピクセル状の模様を作る。色はランダム生成または指定できる | 色付きの粒立ったパターン |
| [Generate（Krokodove）](./generate) | 入力素材に質感を加え、グレースケールのランダム風ノイズを作る | 入力画像に濃淡の変化を加える |
| [Dither（Krokodove）](./dither) | ノイズの模様で陰影を表現し、粗い質感を作る画像フィルター | 元画像の見え方や階調を加工する |
| [Rasterize（Krokodove）](./rasterize) | 入力画像を点・四角形・菱形などの集まりに変える | 写真や映像のハーフトーン化 |
| [Fast Noise（標準）](../generators/fast-noise) | Perlin Noiseを生成。Detail・Scale・Seetheなどの設定と、マップ入力を持つ | 雲、煙、変形用マップ、制御できる滑らかなノイズ |

NoiseとGenerateの違いは、ManualがNoiseについて**ピクセル状の模様と色の選択**を、Generateについて**元の入力に加えるグレースケールのノイズ**を記載している点です。生成アルゴリズムや入力仕様が互換であるという意味ではありません。

同じKrokodoveでも、Ditherは元画像に模様を加えて陰影を表すフィルター、Rasterizeは元画像を図形の集まりで描き直す処理です。どちらも「ざらざらした見た目」になり得ますが、元画像を加工するのか模様自体を作るのかで選びます。

## 注意点・未確認事項

- **色を指定できない**：21.1 Manualは色の選択に言及していますが、具体的なInspector項目名や選択方式は説明していません。使用中の版とノードの表示を確認します。
- **元映像が隠れる**：Noiseの出力Alphaは未確認です。MergeのBlendによる重ね方と、Noiseが出す画像の透明度を混同しないようにします。
- **フィルムグレインのつもりで使う**：粒径の分布、時間相関、チャンネルごとのノイズ特性は確認されていません。撮影ノイズやフィルム粒子の再現が目的なら、別の効果との比較が必要です。
- **Shapeと取り違える**：ここで生成する「ピクセル状の模様」は画像表現です。図形の輪郭を編集するShapeノード群とはデータの種類が違います。

## バージョン・出典

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2436（Image Pixel Tools／Noise）。ピクセル状の模様、ランダム生成または指定色について確認。
- **比較資料**：同Manual p.2434（Dither）、p.2435（Generate・Rasterize）、pp.2363–2365（Fast Noise）。Fast Noiseの詳細項目は標準Generator側の記述であり、Krokodove Noiseへそのまま当てはめません。
- **関連**：[Krokodoveの画像・Shape・3D・Region](./)にFamilyごとのデータの違いを整理しています。

**未確認**：21.1での正式な入出力端子名・数・接続要否、今回の例以外のInspector項目の意味・初期値・範囲、色の指定方式とランダム化の単位、ノイズ生成方式、Alpha・解像度・DoD、時間変化・アニメーション可否、Free / Studio・Fusion StudioのEdition差、実機の他の設定での表示とREGID。

公式Manualで確認した基本機能と、実機で検証する必要のある詳細が混在するため、verificationはpartialです。
