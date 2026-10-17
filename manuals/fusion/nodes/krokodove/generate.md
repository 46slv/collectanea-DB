---
title: Generate
description: Krokodove Generateで入力画像に不規則なグレースケール模様を加える仕組みと、Noise・Fast Noiseとの使い分け。
doc_type: node
term_id: generate
term_short: 入力画像へランダムな明暗の模様を加えて質感を作るKrokodoveの画像ツール。
verification: partial
aliases: [Generate]
concepts: [image-data]
nodes: [Generate]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# Generate

Generateは、**元の画像へ不規則な明暗の模様を加え、質感を作る**Krokodoveのツールです。DaVinci Resolve 21.1 Reference Manualでは「Image Create Tools」に分類され、入力画像へテクスチャを追加して、グレースケールのランダムに見えるノイズ模様を作ると説明されています。

ここでの**テクスチャ**は、表面がざらついて見えるような細かな濃淡や模様のことです。たとえば均一な色の背景に濃淡が加わると、平らな塗りとは異なる印象になります。ただし、Generateが紙の繊維やフィルム粒子を物理的に再現する機能だと確認されたわけではありません。

名前が「Generate」でも、入力なしで画像を一から作る標準の[Fast Noise](../generators/fast-noise)と同じではありません。21.1 Manualは**source input（元画像）へテクスチャを加える**と記載しています。

## グレースケールのノイズとは

グレースケールは、白・黒・その間の灰色で明るさを表す方法です。赤や青など色の付いた画素を並べるのではなく、明暗を使って模様を作ることが特徴です。

ノイズは規則的な格子や線とは異なる、不規則に見える変化を指します。Manualの説明は「一見ランダムな模様」という範囲で、具体的な乱数生成法までは説明していません。また、**模様を入力画像にどう重ねるか、元の色・輪郭をどう保持するか**もManualの短い記述だけでは確定できません。

## 入力と出力

| 段階 | データ | 何をするか |
| --- | --- | --- |
| 入力 | 2D Image | 質感を加える元画像。Manualがsource inputに言及しています。 |
| 処理 | グレースケールのノイズ模様 | 明暗の不規則な変化を作る。合成方法の詳細は未確認です。 |
| 出力 | 2D Image | 加工結果をViewerや後段の画像処理へ渡します。 |

ここでいう<Term id="image">Image</Term>は、画素でできた画像データです。図形の輪郭だけを持つShapeや3Dオブジェクトのデータではありません。Frontmatterの `inputs: [image]` / `outputs: [image]` は**データの分類**を示し、実際の入力端子名・数を保証するものではありません。補助Mask端子の有無も未確認です。

## 主な用途

### 単色に近い背景へ細かな質感を加える

画面の広い部分が同じ色の背景や図形に、明暗の変化を加えたい場合の候補です。元画像にもともと模様があると違いが分かりにくいので、最初は平坦な画像を入力してGenerateの出力と比較します。

### 元画像と加工結果を混ぜる

画像を二つに分け、一方だけをGenerateへ通して標準の[Merge](../compositing/merge)で重ねる方法です。MergeのBlendで混合量を調整すれば、Generate固有のMix設定が存在すると仮定しなくても加工の強さを比較できます。

### 動画の背景にノイズ模様を使う

時間とともに変化する映像へテクスチャを加える使い方を検討できます。ただし模様が毎フレーム変わるのか、静止するのかはManualからは分かりません。アニメーション用のノイズとして使う前に、離れた時刻のフレームを確認してください。

## 制作例：背景映像の質感を比較する

次は**標準Fusionノードとの組み合わせ案**であり、Generateの正式な端子図を示すものではありません。

```text
MediaIn ───────────────────→ Merge（Background）→ MediaOut
   └────→ Generate ────────→ Merge（Foreground）
```

1. MediaInに映像を読み込み、同じ映像をGenerateにも接続します。色や模様が比較的均一なフレームを選びます。
2. MediaInとGenerateの出力をそれぞれViewerに表示し、どこに明暗の模様が加わるか確認します。
3. MediaInをMergeのBackgroundへ、Generateの結果をForegroundへ接続し、**MergeのBlend**で元画像と加工結果を比較します。これはGenerate固有のInspector操作ではありません。
4. 画面の一部だけに加工を重ねたい場合は、MergeのEffect Maskを使う方法を検討します。Generateに専用Mask入力があるとは断定していません。
5. 動画なら数フレーム離れた位置でも見比べます。模様の時間変化と、意図しないちらつきの有無を観察します。

加工結果が予想と異なる場合は、まずGenerate単体の出力を確認してください。とくにAlpha（透明度）の保持・変更については未確認なので、半透明や透明な入力画像でも結果を確かめる必要があります。

## 似たノードとの違い

| ノード | 21.1 Manualで確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Generate（Krokodove）** | 入力画像にテクスチャを追加し、グレースケールの不規則な模様を作る | 元画像へ明暗の質感を加えたい |
| [Noise（Krokodove）](./noise) | ピクセル状の模様。ランダムまたは指定した色を使う | 色付きのピクセル模様を作りたい |
| [Fast Noise](../generators/fast-noise) | Perlin Noiseを画像として生成する標準Generator | 入力画像なしで雲・霧・変形用マップを作りたい |
| [Dither（Krokodove）](./dither) | ノイズ模様を使い、陰影や粗い質感を作るフィルター | 画像の階調を粒状の模様で見せたい |
| [Rasterize（Krokodove）](./rasterize) | 画像を点・四角・菱形などの集合へ変換する | 網点やハーフトーンを作りたい |

見た目が似ていても、**元の画像へ加工を追加する**Generateと、**独立したノイズ画像を作る**Fast Noiseは目的が異なります。画像のどこへ接続するかを先に考えると選びやすくなります。

## 注意点と未確認事項

- **Inspector**：強度、粒の大きさ、乱数Seed、時間変化などの設定の存在・名称・初期値・範囲は未確認です。Fast NoiseのScaleやSeetheがGenerateにもあるとは仮定しません。
- **RGBとAlpha**：入力画像へどんな計算で模様を重ねるか、透明度を保持するかは未確認です。
- **端子**：source input以外の接続口、正式な入力・出力端子名・数、Mask入力の有無は未確認です。
- **時間**：フレームごとのパターン更新、Seedの固定、ループの仕組みは未確認です。
- **解像度・色管理**：HDRやscene-linearでの値、画像サイズが模様に与える影響は未確認です。
- **製品差**：Resolve Free / Studio / Fusion Studioでの使用可否、Effects Library上の表示、REGIDは実機未確認です。

## バージョンと出典

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2435「Image Create Tools / Generate」。元画像へのテクスチャ追加とグレースケールの不規則な模様という役割を確認しました。
- **比較資料**：同Manual p.2434「Dither」、p.2435「Rasterize」、p.2436「Noise」。Fast NoiseはChapter 103を参照してください。
- **関連**：[Krokodoveの全体像](./)、[画像（Image）](../../learn/02-data/image)、[Merge](../compositing/merge)。

Manualで確定できるのは機能の概要までです。正確な端子とパラメータ、内部処理、Edition差を実機で確認していないため、`verification: partial`を維持しています。
