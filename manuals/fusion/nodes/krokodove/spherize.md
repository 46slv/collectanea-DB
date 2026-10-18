---
title: Spherize
description: Krokodove Spherizeで画像の一部を虫眼鏡のように歪ませる仕組み、入出力、使い方とRadialとの違い。
doc_type: node
term_id: spherize
term_short: 指定した形の領域を虫眼鏡越しに見たように歪ませる、Krokodoveの画像変形ツール。
verification: partial
aliases: [Spherize]
concepts: [image-data]
nodes: [Spherize]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# Spherize

**Spherizeは、画像の一部分を虫眼鏡越しに見たように歪ませるKrokodoveの画像変形ツール**です。DaVinci Resolve 21.1 Reference Manualの「Image Warp Tools」では、指定した形の領域内にへこみ状の変形を加え、虫眼鏡のような効果を作るものと説明されています。

球やレンズの3Dモデルを作るツールではありません。画素の並び方を変えることで、平面の写真や模様の一部分がレンズを通して見えているような印象を作ります。

## 何が変わるのか

格子模様を描いた紙の上に透明な虫眼鏡を置く場面を考えてください。虫眼鏡の外側の線はそのままでも、内側の線は曲がったり、間隔が変わったりして見えます。Spherizeは、こうした**領域内と周囲で見た目の変化が異なる画像変形**を試すためのツールです。

ここでいう「へこみ状」は、公式マニュアルが使うdent-style warpという効果の分類です。必ず画像が手前へ膨らむ、あるいは奥へ沈む方向に変形するという意味ではありません。また「虫眼鏡風」であって、実際の光学レンズの屈折や焦点距離を物理的に再現するという記載でもありません。

「指定した形の領域」の形状や位置を**どのInspector項目で設定するか**、外部のShape・Mask・Regionを端子へ接続できるかは、この一覧説明だけでは分かりません。Fusionの<Term id="shape-data">Shape</Term>データがそのまま入力できる、と解釈しないでください。

## 入力と出力

| 段階 | データ・処理 | 確認範囲 |
| --- | --- | --- |
| 入力 | **2D Image** | 21.1 ManualのImage Warp Tools分類と既存カタログによるデータ分類 |
| 処理 | 指定した形の領域内で、へこみ状・虫眼鏡風に画像を変形 | 21.1 Manualに記載された役割 |
| 出力 | 変形後の**2D Image** | 画像変形ツールとしての出力分類 |
| 未確認 | 正式な端子名・本数、領域指定方法、追加のMask・Shape・Region入力の有無 | Manualの一覧には詳細なし |

<Term id="image">Image</Term>は画素で表された静止画や映像で、通常の写真のほか、画像化された文字やイラストも含みます。SpherizeはこのImageを加工する分類です。図形の輪郭を保持して編集するShapeノードや、立体の位置・形を操作する3Dノードとは役割が異なります。

ページ先頭のinputs / outputsは**データ分類**であり、実際のノードに表示されるポート名や端子数を保証しません。

## 主な用途

### 規則的な模様を部分的に歪ませる

格子、ストライプ、細かい文字の並ぶ背景などは、変形前後の違いを判断しやすい素材です。一部の線だけがレンズ越しに見えるように変わると、背景全体を拡大縮小するのとは違う表情になります。形状を保った部分との境目も観察できます。

### 写真の一部を強調したような表現

商品写真や街の映像などに使えば、ある範囲だけ異なる見え方をする演出を検討できます。ただし、指定領域がどのように決まるか、拡大率を直接指定できるかは未確認です。被写体の一部分を狙った位置で加工できるという保証ではないため、まず単純な画像で挙動を調べます。

### タイトルを変形させず背景だけに使う

タイトルを合成する前に背景へSpherizeを適用すると、文字の読みやすさを保ったまま背景の歪みを使えます。逆に、文字を含めて合成した画像をSpherizeへ通した場合は、文字の画素も加工対象になります。

## 制作例：格子背景に虫眼鏡風の変形を加える

以下は役割を理解するための**接続例**です。Blackmagic Designが設定値まで公開した手順ではなく、Spherize固有のInspector操作を保証するものでもありません。

    MediaIn（格子画像） → Spherize → Merge（Background） → MediaOut
    Text+（タイトル） ────────────────→ Merge（Foreground）

1. 格子やストライプの静止画をMediaInからSpherizeへ渡し、Spherizeの出力だけをViewerに表示します。元画像と見比べ、直線が曲がる場所や間隔の変化を確認します。
2. Inspectorに表示される実際の操作項目を確認します。公式の一覧にない「中心」「半径」「強さ」などを、決まったパラメータ名として扱わないでください。
3. 次に、写真や動画など別の素材へ差し替えます。元の輪郭が分かる被写体の方が、変形の場所と見た目を比較しやすくなります。
4. Spherizeの出力をMergeのBackgroundへ、Text+をForegroundへ接続します。これでタイトルはSpherizeの処理を通らず、背景だけに変形を加えた構成になります。
5. 動画の場合は再生し、領域の境目、被写体の輪郭、画面端、透明部分の変化を確認します。時間的な追従や専用アニメーション設定の存在は未確認なので、ここでは設定方法を指定しません。

**領域を外部のMaskやShapeで指定する作例ではありません。** マニュアルにある「形状領域」という表現だけでは、何をどの入力へ接続できるか判断できないためです。

## 近いノードとの違い

| ノード | 21.1 Manualで確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Spherize** | 指定した形の領域でへこみ状の変形。虫眼鏡風の効果 | 一部分だけレンズ越しに見えるような歪みを試す |
| [Radial](./radial) | へこみ状の変形。追加warp mask入力の記載がある | へこみ風の変形や、追加warp maskの役割を調べたい |
| [Bend](./bend) | 放射状に画像を曲げる | 曲がるような変形を中心に検討する |
| [Directional Scale](./directional-scale) | 指定方向へ画像を伸縮・変形する | 一方向への伸びを作りたい |
| [Warped Transform](./warped-transform) | 画像を伸ばす・押し縮める・回す | 複数種類の変形をまとめて検討する |

RadialとSpherizeは、どちらもマニュアルでdentに近い言葉が使われています。ただし、**Radialには追加warp mask入力**が記され、**Spherizeには指定した形の領域と虫眼鏡風の効果**が記されています。内部の変形式が同じかどうか、互いに同じ仕上がりを再現できるかは不明です。

## 注意点と未確認事項

- **領域の指定**：形状や位置を定める正式なInspector項目名、外部端子の有無、Mask・Shape・Regionとの接続互換性は未確認です。「shape region」をFusionのShape型入力と断定しません。
- **変形の制御**：中心、強さ、変形方向、初期値、値域、補間方式は公式の一覧にはありません。具体的なスライダー名や数値を推測しません。
- **画像の境界とAlpha**：加工範囲の外とのつながり、画像端の画素、透明部分の処理、premultiplyの挙動は確認できていません。透過素材を使う場合は合成後も確認してください。
- **時間とトラッキング**：入力として動画を使うことと、専用の動き追従機能があることは別です。追従・アニメーション方法は実機で確認が必要です。
- **製品差**：21.1 Manual掲載は確認済みですが、Resolve Free / Studio / Fusion StudioのEdition差、内部REGID、現行UIの端子表示は実機未確認です。

## バージョンと出典

一次資料はBlackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2437「Image Warp Tools / Spherize」**です。同章p.2436のRadial・Bend・Directional Scale、p.2437のWarped Transformと比較しました。

以前のページにあった「radial/cylindrical round warp」という説明は、この21.1 ManualのSpherize説明では確認できないため置き換えています。ここに挙げた制作例は、公式の用途説明から組み立てた構成案です。入力・出力のImage分類には既存COLLECTANEAカタログも併用し、Inspector・追加端子・Edition差は未検証なのでverificationはpartialです。

[Krokodoveの全体像](./)と[Imageデータの説明](../../learn/02-data/image)、[Shapeデータの説明](../../learn/02-data/shape)も参照してください。
