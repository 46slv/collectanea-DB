---
title: Bevel（Krokodove）
description: KrokodoveのBevelで2D画像の内側に面取り風の奥行き感を加える。入力・出力、確認手順、Extrude・Plasticとの違いを解説。
doc_type: node
term_id: bevel
term_short: 画像の輪郭の内側に面取りのような見え方を作り、平面に奥行き感を加えるKrokodoveの画像処理ツール。
verification: partial
aliases: [Bevel, Krokodove Bevel]
concepts: [image-data]
nodes: [Bevel]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# Bevel（Krokodove）

**Bevel**は、画像の輪郭の**内側に面取りのような見え方**を作り、平らな画像に奥行きがあるように見せるKrokodoveのツールです。DaVinci Resolve 21.1 Reference Manualでは、「Image Pixel Tools」の一つとして掲載されています。

たとえば単色のロゴやタイトルプレートの縁を、切り立った境界ではなく、少し傾いた面があるように見せたいときの候補です。見た目に立体感を与える**2D画像処理**であり、側面をカメラで撮れる3Dモデルを生成するものではありません。

## 「内側の面取り」とは

実物の板を考えると、表面と側面が直角に交わる角を削り、斜めの面にする加工を「面取り（bevel）」と呼びます。画面上では、縁から少し内側へ向かう部分の見え方を変えることで、同じような厚みや起伏を感じさせられます。

Krokodove Bevelについて公式Manualが説明しているのは、**画像の内側にbevelを作り、奥行きを模した見え方にする**という役割です。どの画素を輪郭として検出するか、光と影をどのように生成するか、面取りの幅をどう計算するかまでは、この記載だけでは分かりません。ここでは具体的な画素処理方式を決めつけず、実際の画像で効果を比較する方法を示します。

## 入力と出力

| 段階 | データの種類 | 何が起きるか |
| --- | --- | --- |
| 入力 | <Term id="image">2D Image</Term> | ロゴ、文字、単色図形など、加工前の画像を渡す。 |
| 処理 | 画像内部の縁の表現 | 輪郭の周辺に面取り風の見え方を加え、奥行き感を作る。 |
| 出力 | 2D Image | 結果をMergeなど通常の画像処理・合成へ渡す。 |

入出力をImageと整理する根拠は、21.1 Manualの「Image Pixel Tools」という分類と既存のCOLLECTANEAカタログです。これは**データの分類**であり、正式なポート名、入力端子の数、Maskなどの補助入力の有無を実機で確認したものではありません。

<Term id="shape-data">Shape</Term>は輪郭や図形を画像化する前の別形式のデータです。Shape系のノードを起点にする場合は、[sRender](../shapes/s-render)で画像に変えてからBevelへ渡します。[Shapeの基礎](../../learn/02-data/shape)も参照してください。

## 最小構成：四角形に面取り風の縁を作る

最初は写真より、**背景が透明な単色の四角形**を使うと違いを見比べやすくなります。

```text
Rectangle ──→ Background（Effect Mask）
                    │
                Background → Bevel → Merge（Foreground）→ MediaOut
                                         ↑
                                 別のBackground
```

この図は**確認用の構成案**で、Krokodove BevelのInspector設定値を含む公式作例ではありません。

1. Backgroundを用意し、Rectangle MaskをそのEffect Maskにつないで、画面中央に単色の四角形を表示します。四角形以外が透明になる状態を確認します。
2. BackgroundをBevelにつなぎ、元のBackgroundとBevelの結果を別々のViewerで比較します。
3. BevelのInspectorに**実際に表示されている項目を一つだけ**変更し、四角形の外周付近と中央部分の見え方を観察します。ここでは未確認のスライダー名や既定値を指定しません。
4. Bevelの出力をMergeのForegroundへ、別に用意した背景画像をBackgroundへつなぎます。暗い背景と明るい背景の両方で、面取り風の縁がどう見えるか確認します。
5. Rectangleを円に変える、細長い長方形にする、文字へ差し替えるなどして、**輪郭の形による違い**を比較します。

効果が分かりにくいときは、まず入力のAlphaと透明部分を確かめ、Bevelを通さない画像と比べます。**Alpha境界に必ず反応するという保証ではありません**。色差・輝度差のどれを参照しているかは、表示結果を変えながら調べる必要があります。

## 制作での使い方

### タイトルプレートやアイコンの縁

単色の角丸プレートやアイコンに、さりげない厚みを感じさせたい場合に使います。形の大きさ、角丸、配置は元の図形側で決め、その後にBevelを置いて**縁の見え方だけを比較**します。

```text
図形を描いた2D Image → Bevel → Merge → MediaOut
```

面取りが強すぎると小さな文字や細い線で視認性が落ちる可能性があるため、最終的な表示サイズで確かめます。これは制作上の注意であり、Bevel固有のアルゴリズムに関する確認結果ではありません。

### 文字・ロゴの質感を比較する

Text+で文字を作り、その画像をBevelへ渡して、平坦な文字と比較します。奥行き感だけで足りなければ、[Plastic](./plastic)の光沢感や[Extrude](./extrude)の縁の変形も候補です。細い文字、太い文字、角の多いロゴで結果を見比べると、どの効果が目的に近いか判断できます。

## Extrude・Plastic・3Dとの違い

| ツール | 21.1 Manualで確認できる中心的な役割 | 選ぶときの目安 |
| --- | --- | --- |
| **Bevel（このページ）** | 画像の**内側**に面取りを作り、奥行き感を模す。 | 平面の図形や文字の縁を面取り風に見せたい。 |
| [Extrude（Krokodove）](./extrude) | 画像の縁を変形し、奥行き感を作る。 | 面取りそのものより、縁の変形を試したい。 |
| [Plastic（Krokodove）](./plastic) | 合成的な面取りと、プラスチック状の膜・光沢を表現する。 | 光沢・コーティングのような質感も比較したい。 |
| [sExtrude](./sextrude) | 接続したShapeを押し出す。 | 画像ではなくShape系の処理を続けたい。ただし、出力型・処理の詳細は未確認。 |
| [Extrude 3D](../3d/extrude-3d) | Classic 3Dの形状に厚みを付ける。 | 3D空間の中で側面やカメラ角度を扱いたい。 |

同じ「立体的」という目的でも、**2D画像の見た目を変えたいのか、3D形状が必要なのか**で選択が変わります。Bevelに実際の3Dジオメトリやライトを生成する機能があると解釈しないでください。

## 注意点と未確認事項

- **縁の判定方式は未確認。** Alpha、RGB、輝度のどれを参照するか、完全に不透明な画像でどの境界が対象になるかは明記されていません。
- **Inspector項目は未確認。** 面取り幅、照明方向、明るさなどの項目が存在するものとして名前・初期値・範囲を創作しません。
- **ImageとShapeは別のデータ。** Krokodove BevelをShape系ノードと同じ入出力だと扱いません。
- **ポートとEdition差は未確認。** 正式な端子名・補助入力、Resolve Free / Studio / Fusion Studioでの提供差、内部REGIDについて実機検証はありません。
- **加工結果の見た目は画像ごとに確認する。** 細い文字、柔らかいAlpha、細かな模様では、単純な図形と同じ見え方になるとは限りません。

## バージョンと出典

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2435、Image Pixel Tools — Bevel**。画像内側のbevelによって奥行き感を模す機能として説明されています。

**比較に用いた資料：** 同Manualの**p.2436**（Krokodove Extrude・Plastic）、**p.2437**（sExtrude）。Classic 3DのExtrude 3Dとは目的とデータ形式を区別します。

関連：[画像データの基礎](../../learn/02-data/image)／[Shapeの基礎](../../learn/02-data/shape)／[Krokodoveの全体像](./)。

21.1実機のInspector・正式ポート・Edition差は確認できていないため、`verification: partial`を維持します。
