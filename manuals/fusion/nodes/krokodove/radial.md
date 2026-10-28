---
title: Radial
description: Krokodove Radialのへこみ状の画像変形、追加warp mask入力、具体的な使い方を説明。
doc_type: node
term_id: radial
term_short: 画像にへこみのような歪みを加える、追加warp mask入力を持つKrokodoveの画像変形ツール。
verification: partial
aliases: [Radial]
concepts: [image-data]
nodes: [Radial]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# Radial

**Radialは、画像にへこみができたような歪みを加えるKrokodoveの画像変形ツール**です。DaVinci Resolve 21.1 Reference Manualでは「Image Warp Tools」に分類され、へこみ状の変形（dent distortion）と、追加の「warp mask」入力があることが説明されています。

たとえば格子を描いた紙の一部を指で押したように、線の間隔や形が変わって見える表現を考えると理解しやすくなります。ただし、ここで扱うのは**画像の画素の配置を変えて得られる見た目**です。実際に紙や3Dモデルの表面がへこむわけではありません。

## 「へこみ状の歪み」とは

通常のTransformによる移動では、基本的に画像全体を同じ方向へずらします。拡大・縮小では、円や直線の位置関係を比較的規則的に変えます。

それに対して**画像変形（warp）**では、画面の場所によって画素の移動の仕方が変わります。まっすぐな線が曲がったり、格子の目の大きさが部分ごとに違って見えたりします。Radialは、そうした変形の中でも「へこみ」に見える効果として公式マニュアルに記載されています。

「Radial」という名前から、必ず中心から外へ広がる、円形の範囲にだけかかる、といった挙動までは判断できません。中心位置、形状、変形量をどの設定で操作するかも、公式マニュアルの一覧説明だけでは確定できません。

<!-- capture:S235 -->

## 実機例：文字を放射状に変形

合成した `Text+` の文字を `Radial` に渡し、Radial Offsetを0.2に設定しました。

この例では中央付近の文字が大きく曲がります。Viewerの操作用オーバーレイも画像に写っています。Warp MaskやAlphaの数値は未検証です。[接続と設定の記録](/img/fusion/captures/S235/readback.json)に条件を記載しています。

[![文字画像をKrokodove Radialへつなぐ構成](/img/fusion/captures/S235/graph.png)](/img/fusion/captures/S235/graph.png)

文字画像をRadialへ渡します。

[![RadialのInspector](/img/fusion/captures/S235/controls.png)](/img/fusion/captures/S235/controls.png)

Radial Offsetを0.2に設定しています。

[![処理前の文字](/img/fusion/captures/S235/low.png)](/img/fusion/captures/S235/low.png)

処理前の文字です。

[![Radialで変形した文字](/img/fusion/captures/S235/high.png)](/img/fusion/captures/S235/high.png)

処理後は文字が曲がります。

[再現用Graph](/img/fusion/captures/S235/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S235/capture.json)

<!-- /capture:S235 -->

## 入力と出力

| 項目 | 扱うデータ・役割 | 確認範囲 |
| --- | --- | --- |
| 主な入力 | **2D Image** | 21.1 Manualの「Image Warp Tools」分類と既存カタログに基づく画像データ分類。 |
| 処理 | 画像にへこみ状の歪みを与える | Manualが直接説明するRadialの役割。 |
| 追加の入力 | **warp mask** | Manualに追加入力の存在が記載されている。実機SDKではWarpMaskはMask型。計算への作用方法は未確認。 |
| 出力 | 変形後の**2D Image** | 画像変形ツールとしての入出力分類。正式な出力端子名は未確認。 |

ここでの<Term id="image">Image</Term>は、静止画・映像・画像化された文字など、画素で表されるデータです。輪郭を保ったまま編集するShapeデータや、3D空間に置いた立体そのものを変形する処理とは区別します。

ページ先頭の入力・出力メタデータは**データの分類**です。接続端子の正確な本数や名前を示すものではありません。とくに追加warp mask入力があるからといって、一般的な青色のEffect Mask端子と同一であるとは限りません。

### 追加warp mask入力の読み方

マニュアルには「追加のwarp mask入力」とあります。これは**画像のへこみ状の変形に加えて、別の入力を扱える**ことを示しています。ただし、その入力を使って歪みの強さを場所ごとに変えるのか、変形の形を指定するのか、どのチャンネルを読むのかは、この短い記述からは特定できません。

一般的なEffect Maskは、エフェクトを適用する範囲を制限するための入力です。一方、Radialの「warp mask」がまったく同じ働きをするという根拠はありません。実際に接続するときは、ノード上の端子表示とInspectorを見て受け取るデータ型を確認してください。白黒のImage、FusionのMask、KrokodoveのRegionを名前だけで同一視しないことが重要です。

## 主な用途

### 抽象背景に局所的な変化を作る

規則的な格子やストライプにへこみ状の変形を加えると、直線のまま動かすだけでは得られない輪郭の変化を作れます。MVやタイトル映像の背景を検討する際に、単なる拡大縮小との見た目の違いを確認しやすい素材です。

### 実写の一部が歪んだような表現を試す

窓枠や道路の白線など、元の形が分かる部分を含む映像なら、どこがどの程度歪んだかを比較しやすくなります。人物の顔などの複雑な素材では、狙った変形なのか不自然な崩れなのか判別しづらいため、まず直線の多いテスト画像で性質を確認します。

### 文字の読みやすさを維持する

背景素材だけをRadialへ通し、その後にText+をMergeで重ねると、タイトル文字を変形させずに背景の歪みを利用できます。文字を先に合成した画像へRadialを適用した場合は、文字も画素データとして変形の対象になります。

## 制作例：格子背景を歪ませ、文字を重ねる

以下は**効果を理解するための構成案**です。Blackmagic Designが公開した設定値付き作例ではなく、Radial固有のInspector操作や追加入力の配線を保証するものではありません。

    MediaIn（格子画像） → Radial → Merge（Background） → MediaOut
    Text+（タイトル） ──────────→ Merge（Foreground）

1. まず規則的な格子、同心円、ストライプなどを用意し、MediaInからRadialへ渡します。Radialの出力だけをViewerに表示します。
2. 元画像とRadial後の画像を比較します。線が曲がる場所、間隔が変わる場所、画面端の欠けを見ます。Inspectorの設定項目名は実際のUIに表示されたものを確認します。
3. 次に、格子とは別の写真や動画を入力して、同じ変形がどのように見えるか比べます。画面のどこに歪みが現れるかは、素材の内容によっても判断しやすさが変わります。
4. Radialの結果をMergeのBackgroundへ接続し、Text+をForegroundへ重ねます。これで背景を加工する段階と、文字を合成する段階を分けられます。
5. 動画として使う場合は再生して、変形部分が被写体に重なるタイミング、端の欠け、文字の可読性を確認します。

**追加warp maskを使いたい場合**は、この基本構成が動くことを先に確認します。その後、実機で入力端子の型と動作を確かめてから、別のデータを接続して変形前後を比較します。受け取れると確認していないMaskノードやRegionノードを、確定した接続例としてここには記載しません。

## 近いノードとの違い

| ノード | 21.1 Manualで確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Radial** | へこみ状の画像変形。追加warp mask入力の記載がある | へこみのような歪みや、その追加入力を検討するとき |
| [Bend](./bend) | 放射状に画像を曲げる | 直線を曲げたような変形を試したいとき |
| [Spherize](./spherize) | 指定した形状領域内のへこみ型変形。虫眼鏡風の効果 | 領域を決めた拡大鏡風の見た目を試すとき |
| [Directional Scale](./directional-scale) | 指定方向に伸縮・変形する | 一方向への伸びを重視するとき |
| [Warped Transform](./warped-transform) | 画像を伸ばす、押し縮める、回す | 複数の種類の変形を試したいとき |

RadialとSpherizeは、どちらもManualで「dent」に類する表現が使われています。違いとして**Radialには追加warp mask入力、Spherizeには指定した形状領域と虫眼鏡風の効果**が明記されています。ただし、この説明だけで二つの変形方式が内部的にどう異なるかまでは分かりません。

標準FusionのDisplaceも、別の画像を変形マップとして使える画像変形ノードです。ただし、DisplaceのRefraction MapとRadialのwarp maskが同じ入力仕様だとは確認されていません。標準のDisplaceの詳細は21.1 ManualのChapter 123「Warp Nodes」を参照してください。

## 注意点と確認できていない仕様

- **Inspectorの項目名**：実機ではCenterとRadial Offsetを確認しました。初期値の普遍性・値域や補間方法は未確認です。「Radial」という名称からパラメータを推測しません。
- **warp maskの型と動作**：追加の入力が記載されていることは確認済みです。ただし、SDK一覧ではWarpMaskはMask型でした。反転や濃淡の意味、処理順序は未確認です。通常のEffect Maskと同じものとして説明しません。
- **Alphaと画像端**：透明部分、premultiply、画像範囲外の画素、境界の補間方法は未確認です。透過素材なら合成後も確認してください。
- **時間変化**：入力に動画を使うことと、Radial自身に専用の速度制御があることは別です。専用の時間パラメータの有無は確認していません。
- **製品差と内部名**：21.1 Manualへの掲載は確認済みですが、Resolve Free / Studio / Fusion Studioでの利用条件は未確認です。実機のREGIDはKD_Radialです。実機の端子表示は個別に確認する必要があります。

## バージョンと出典

一次資料はBlackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2436「Image Warp Tools / Radial」**です。同じ章のBend・Directional Scale（p.2436）、Spherize・Warped Transform（p.2437）を比較しました。標準Displaceとの違いの検討には、同ManualのChapter 123「Warp Nodes」（pp.2967–2968）も参照しています。

このページの画像データ分類には、公式カテゴリと既存COLLECTANEAカタログを併用しています。上記の文字画像の変形は実機で確認しました。その他の具体例は公開資料の役割説明から組み立てた制作案です。正式な端子・Inspector・Edition差を検証できていないため、`verification: partial`を維持します。

[Krokodove全体像](./)と[画像（Image）](../../learn/02-data/image)も参照してください。
