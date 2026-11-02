---
title: Plastic（Krokodove）
description: KrokodoveのPlasticで画像に合成的な面取りとプラスチック状の艶を加える。入力・出力、比較手順、Bevelとの違いを解説。
doc_type: node
term_id: plastic
term_short: 2D画像に合成的な面取りと、プラスチックの薄い膜を重ねたような艶を与えるKrokodoveのフィルタ。
verification: partial
aliases: [Plastic, Krokodove Plastic]
concepts: [image-data]
nodes: [Plastic]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# Plastic（Krokodove）

**Plastic**は、2D画像をプラスチックで覆ったように見せるKrokodoveの画像フィルタです。DaVinci Resolve 21.1 Reference Manualでは、**合成的な面取り（synthetic bevel）**と、画像に薄いプラスチックの膜があるような**艶（sheen）**を作るツールとして紹介されています。

たとえば単色のロゴやタイトルプレートを、樹脂製のステッカーやコーティングされた部品のように見せたいときの候補です。ここでいう「プラスチック」は素材を3D空間に作ることではありません。**元の2D画像の見え方を加工する**という意味です。

## 面取りと艶の意味

面取りは、実物の板の表面と側面が交わる鋭い角を削り、斜めまたは丸みのある縁にする加工です。画像の縁に明暗や色の変化を与えると、平らな図形も厚みがあるように感じられます。

艶は、滑らかな表面に光が当たっているような見え方です。Plasticの説明にある「膜」は、実際に透明な板や別の画像レイヤーを作ることを意味するとは限りません。**入力画像にコーティングがあるような質感を加える効果**として理解すると、Bevelとの使い分けを考えやすくなります。

公式Manualが述べるのは「合成的な面取り」と「プラスチック状の艶」という役割までです。実際に光の反射を計算するか、輪郭をAlpha・色・輝度のどれから検出するか、どのように画素を変えるかは、掲載された説明から特定できません。

<!-- capture:S240 -->

## 実機例：文字の縁に光を付ける

合成したグレーの `Text+` を `Plastic` に渡し、Bump Channelをアルファ、Blur Sizeを0.02に設定しました。

この例では文字の縁に明るい線が見えます。Viewerには市松模様と操作用オーバーレイが表示されています。ほかの設定やAlpha値の変化は未検証です。[接続と設定の記録](/img/fusion/captures/S240/readback.json)に条件を記載しています。

[![文字画像をKrokodove Plasticへつなぐ構成](/img/fusion/captures/S240/graph.png)](/img/fusion/captures/S240/graph.png)

文字画像をPlasticへ渡します。

[![PlasticのInspector](/img/fusion/captures/S240/controls.png)](/img/fusion/captures/S240/controls.png)

Bump Channelをアルファ、Blur Sizeを0.02に設定しています。

[![処理前の文字](/img/fusion/captures/S240/low.png)](/img/fusion/captures/S240/low.png)

処理前のグレーの文字です。

[![Plasticで縁に明るい線が付いた文字](/img/fusion/captures/S240/high.png)](/img/fusion/captures/S240/high.png)

処理後は文字の縁に明るい線が見えます。

[再現用Graph](/img/fusion/captures/S240/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S240/capture.json)

<!-- /capture:S240 -->

## 入力と出力

| 段階 | データ | 意味 |
| --- | --- | --- |
| 入力 | <Term id="image">2D Image</Term> | Text+で作った文字、透明背景のロゴ、単色図形などの画像。 |
| 処理 | Image Pixel Tool | 面取り風の見え方とプラスチック状の艶を与える。 |
| 出力 | 2D Image | 加工結果をMergeなどの画像合成へ渡す。 |

21.1 ManualでPlasticは「Image Pixel Tools」に分類され、既存のCOLLECTANEAカタログも入力・出力をimageとして整理しています。これはデータの種類についての確認です。**正式なポート名、端子数、補助Mask入力の有無**を実機で確認したという意味ではありません。

Imageは、色や透明度を持つ画素データです。輪郭や図形を画像化する前のShapeとは異なります。データの基本は[Imageの基礎](../../learn/02-data/image)を参照してください。

## 最小構成：透明な四角形で比べる

最初は写真より、**背景が透明な単色の四角形**を使うと、どこに質感が加わるか確認しやすくなります。

    Rectangle → Background（Effect Mask）
                     │
                Background → Plastic → Merge（Foreground）→ MediaOut
                                            ↑
                                      別のBackground

この構成は**効果を比較するための制作例**で、21.1 Manualに記載された公式作例やInspector設定値ではありません。

1. Backgroundを1つ置き、RectangleをそのEffect Maskへ接続します。中央に単色の四角形ができ、外側が透明であることをViewerで確認します。
2. Backgroundの出力をPlasticへつなぎます。元のBackgroundとPlasticの出力を別々のViewerで表示し、加工前後を比較します。
3. Inspectorに実際に表示されている項目を一つだけ変更します。**縁・中央の面・透明部分**のどこが変わったか観察します。未確認の項目名や値は指定しません。
4. Plasticの出力をMergeのForeground、別のBackgroundをMergeのBackgroundへつなぎます。暗い背景と明るい背景の両方で見比べます。
5. Rectangleを角丸にする、細長くする、入力色を変えるなど、一度に一条件だけ変えて、質感の現れ方を比較します。

見た目が変わらない場合は、まずPlasticの前後で同じフレームを見ているか、入力に透明部分があるか確認します。Alphaの境界に必ず反応するとも、完全不透明な写真では効果が出ないとも断定できません。

## Text+とロゴへの応用

文字を使う場合はText+の画像出力をPlasticへ送り、元の文字と見比べます。

    Text+ → Plastic → Merge（Foreground）→ MediaOut
                           ↑
                       Background

ロゴやタイトルでは、艶の印象と同じくらい**文字の読みやすさ**が重要です。太い見出しでは効果が分かりやすくても、細い文字や縮小されたアイコンでは輪郭が読み取りにくくなる可能性があります。実際に使用する表示サイズで確認します。

UIのボタンやタイトルプレートにも試せます。色と形を上流のText+や図形で決め、Plasticは質感を変える工程として分けておくと、元のデザインを維持しながら仕上げを比較できます。樹脂の薄い膜が独立した透明レイヤーとして生成されるとは考えないでください。

## BevelやExtrudeとどう使い分けるか

| ツール | 21.1 Manualに基づく役割 | 使い分け |
| --- | --- | --- |
| **Plastic（このページ）** | 画像に合成的な面取りとプラスチック状の膜・艶を作る。 | 縁に加えて、コーティングされたような質感も試したい。 |
| [Bevel（Krokodove）](./bevel) | 画像の内側に面取りを作り、奥行き感を模す。 | 内側の面取りを中心に作りたい。 |
| [Extrude（Krokodove）](./extrude) | 画像の縁を変形して奥行きの錯覚を作る。 | 面取りより、縁の変形を試したい。 |
| [sExtrude](./sextrude) | Shapeに押し出し処理を加える。 | 画像ではなくShapeの加工を続けたい。出力型など詳細は未確認。 |
| [Extrude 3D](../3d/extrude-3d) | 3Dの形状に厚みを付ける。 | 3D空間で側面、カメラ、ライトを扱いたい。 |

PlasticとBevelはどちらも「bevel」という語を含みますが、Plasticには**プラスチック状の艶**という役割が加わります。これはManualにおける説明の差であり、内部アルゴリズムの比較実験に基づくものではありません。

実制作では、同じ入力をPlastic、Bevel、Extrudeにそれぞれ通してViewerで並べると、表面の質感を変えたいのか、縁の奥行き感を変えたいのか判断しやすくなります。同じパラメータを持つ、あるいは同じ結果を出せると仮定しないでください。

## 注意点と未確認事項

- **Inspector：** 実機例ではBump ChannelとBlur Sizeを確認しました。その他の項目の初期値・範囲は未確認です。
- **縁の検出方式は未確認。** Alpha、色差、輝度のどれを参照するか、完全に不透明な写真にどう作用するかは実機での比較が必要です。
- **Alphaへの作用は未確認。** 透明背景の画像で加工後の透明度や縁がどう変わるかは、Viewerで確認します。
- **3Dモデルは作らない前提で選ぶ。** Manualでは2DのImage Pixel Toolとして掲載されています。実際の立体形状が必要なら3D系のノードを選びます。
- **ポートと製品差は未確認。** 正式な端子名・補助入力、内部REGID、Resolve Free・Studio・Fusion Studio間の提供差は現行環境での確認が必要です。

## バージョンと出典

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2436、Image Pixel Tools — Plastic**。合成的な面取りと、画像上のプラスチック状の膜・艶を模すフィルタとして紹介されています。

**比較資料：** 同Manualのp.2435（Krokodove Bevel）、p.2436（Krokodove Extrude）、p.2437（sExtrude）。関連：[Krokodoveノードの全体像](./)。

本記事ではManualで確認できる役割と、実機例・その他の接続例を区別しています。正式ポートやEdition差は未確認のため、verificationはpartialを維持します。
