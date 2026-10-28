---
title: Mirror
description: Krokodove Mirrorで画像を指定した線に沿って反転する考え方、入出力、映像合成例、KaleidoscopeやSeamlessとの違い。
doc_type: node
term_id: mirror
term_short: 指定した線を基準に2D画像を鏡映のように反転するKrokodoveの画像変形ツール。
verification: partial
aliases: [Mirror]
concepts: [image-data]
nodes: [Mirror]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# Mirror

**Mirrorは、画像を指定した線に沿って反転する**Krokodoveのツールです。DaVinci Resolve 21.1 Reference Manualでは「Image Warp Tools（画像の変形）」に分類され、線を基準に画像を裏返す働きが説明されています。

鏡に文字を映すと左右が逆に見えるように、元の画像と反転後の画像では配置の向きが変わります。重要なのは、Mirrorが**画面全体を一律に明るくしたり、画像の輪郭を抽出したりする処理ではない**ことです。画像の位置関係そのものを変える変形です。

## 「線に沿って反転」とは

画像の中に基準となる線を置き、その線を鏡の位置と考えるとイメージしやすくなります。縦方向の線で反転する場合と、斜めの線で反転する場合では、反転後の向きが異なります。

ただし、21.1 Manualの記述は *Flips the image along a specified line* という短い説明です。基準線の座標指定方法や、線の片側を保持してもう片側へ複写するのか、入力画像全体を反転するのかといった**出力範囲の厳密な挙動までは、この記述だけで確定できません**。対称模様が必ず生成されると考えず、Viewerで結果を確かめます。

<!-- capture:S233 -->

## 実機例：文字を線に沿って反転

合成した `Text+` の文字を `Mirror` に渡しました。

この設定では水平な基準線に沿って文字の一部が反転します。Viewerの操作用オーバーレイも画像に写っています。他の線の位置やAlphaの数値は未検証です。[接続と設定の記録](/img/fusion/captures/S233/readback.json)に条件を記載しています。

[![文字画像をKrokodove Mirrorへつなぐ構成](/img/fusion/captures/S233/graph.png)](/img/fusion/captures/S233/graph.png)

文字画像をMirrorへ渡します。

[![MirrorのInspector](/img/fusion/captures/S233/controls.png)](/img/fusion/captures/S233/controls.png)

この例の基準線の設定です。

[![処理前の文字](/img/fusion/captures/S233/low.png)](/img/fusion/captures/S233/low.png)

処理前の文字です。

[![Mirrorで反転した文字](/img/fusion/captures/S233/high.png)](/img/fusion/captures/S233/high.png)

処理後は基準線に沿って一部が反転します。

[再現用Graph](/img/fusion/captures/S233/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S233/capture.json)

<!-- /capture:S233 -->

## 入力と出力

| 項目 | 役割と確認範囲 |
| --- | --- |
| 入力 | 既存のCOLLECTANEAカタログでは **2D Image** を入力する画像変形ツールに分類されています。 |
| 処理 | 指定した線を基準に、入力画像を反転します。 |
| 出力 | 同カタログでは **2D Image** に分類されています。反転結果は画像として後段の合成処理へ渡す想定です。 |
| 未確認 | 出力端子の詳細、基準線の設定範囲、既定値の普遍性。実機SDKではImage、EffectMask、WarpMask入力を確認しました。 |

<Term id="image">Image</Term>はピクセルを持つ画像データです。Mirrorは、線で構成された図形を保持するShapeデータを出力するツールとしては案内されていません。ここでいう「線」は、**画像を反転する基準**であり、線そのものを描き出すという意味ではありません。

frontmatterの `inputs: [image]` と `outputs: [image]` はカタログの**データ種別**を表します。実機のコネクタ名や接続可能な全データ型を証明するものではありません。

## 主な用途

### グラフィックの向きを変える

左右の位置関係を入れ替えたタイトル背景や模様を作りたいときに候補になります。たとえば、画面の左に寄った図形が反転後にどこへ現れるかをViewerで比較すると、基準線による変化が分かります。

### 同じ映像から別の構図を試す

人物や建物を含む画像の向きを反転すると、画面の重心や視線の流れが変わります。元画像と結果を見比べて選べます。ただし、文字やロゴも反転の影響を受け得るため、読める向きを保つ必要がある素材では注意します。

### 鏡像を使う切り替えや合成

反転させた画像を元映像と合成し、画面の一部分だけに使う構成も検討できます。**Mirror単体が左右の2画面を作る、あるいは自動でワイプする**とは資料で確認できていません。必要な領域指定や切り替えは、後段の合成処理と分けて考えます。

## 制作例：元映像と反転映像を比較して重ねる

次は標準の[Merge](../compositing/merge)を組み合わせる**構成案**です。Mirrorの正式な端子図ではありません。

```text
MediaIn ────────────────→ Merge（Background）→ MediaOut
       └─→ Mirror ─────→ Merge（Foreground）
```

1. MediaInの画像をMirrorへつなぎ、まずMirror単体をViewerに表示します。基準線に沿って何が反転するかを確認します。
2. 同じMediaInをMergeの**Background**にも接続します。背景側には未加工の画像が残ります。
3. Mirrorの出力が2D Imageとして利用できることを確認し、Mergeの**Foreground**へ接続します。
4. Merge側の**Blend**で元画像と反転画像の混ざり方を比較します。Mirrorの画像が不透明なら、通常合成では元画像を全面的に隠すことがあります。
5. 部分的な鏡像表現が必要なときは、MergeのEffect Maskなど、**合成側の機能**で表示範囲を制御します。

実機SDKではMirrorのBlendとEffectMask入力を確認しました。合成量やマスクの説明は[Merge](../compositing/merge)の機能です。

## 似たツールとの違い

| ツール | 21.1 Manualで確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Mirror** | 指定した線に沿って画像を反転する | 画像の向きや鏡映の構図を変えたい |
| [Kaleidoscope](./kaleidoscope) | 放射状の鏡映で万華鏡のような見た目を作る | 反射を繰り返した放射状の模様が欲しい |
| [Seamless](./seamless) | 反対側の端を鏡映しにして元画像とブレンドする | 画像の端をつなぐ加工を検討したい |
| [Lines](./lines) | 1組または複数組の線で繰り返し模様を作る | 元画像を反転するのではなく、線模様を生成したい |

Mirrorの「基準線」は反転の軸です。Linesが作る「描画された線の模様」とは役割が違います。また、Mirrorを一回適用することと、Kaleidoscopeのような複数方向への繰り返し反射は同じ処理ではありません。

## 使用時の注意点

- **文字・ロゴ**：画像と一緒に反転すると文字の向きも変わり得ます。必要なら文字を後段で合成します。
- **画面外と境界**：反転後に画像外へ出る部分の扱い、端の補間、基準線付近の表示は、掲載文だけでは確定できません。
- **アルファ**：透明部分の扱い、プリマルチプライの有無、補助チャンネルの変換は未確認です。ほかの画像と重ねる際は境界を確認します。
- **Inspector**：実機ではMirror LeftとMirror Rightの座標、Mirror Allの表示を確認しました。初期値の普遍性・可変範囲は未確認です。
- **バージョンとエディション**：21.1 Manualへの掲載は確認済みですが、Resolve Free / Studio / Fusion Studioごとの利用条件は未確認です。実機のREGIDはKD_Mirrorです。

## 出典と確認範囲

一次資料はBlackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2436、Image Warp Tools / Mirror**です。資料から確認できる中心的な役割は「指定された線に沿って画像を反転する」です。

画像の入出力分類は既存COLLECTANEAカタログに基づきます。上記の文字画像の反転は実機で確認しました。その他の制作例と用途は役割から組み立てた運用案です。端子・Inspector・アルファ・製品別の詳細が未確認のため、`verification: partial`を維持しています。

[Krokodoveの全体像](./)と[画像（Image）](../../learn/02-data/image)も参照してください。
