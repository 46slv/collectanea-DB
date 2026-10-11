---
title: 画像（Image）
description: Fusionの2D Imageを、RGB・Alpha・解像度・DoD・補助チャンネルを持つデータとして理解し、接続とViewerで確認する。
doc_type: concept
term_id: image
term_short: RGB・Alphaなどのチャンネルと、画像サイズ・有効領域を持つ2D画像データ。
verification: partial
aliases: [Image, 2D Image, RGBA]
concepts: [image-data, rgba, resolution]
tasks: [read-graph, composite, debug]
prerequisites: [typed-connections]
level: foundation
product_scope: fusion
updated: "2026-10-12"
---

# 画像（Image）

FusionのNodeをつなぐ線は、画面に見える「絵」だけを渡しているわけではありません。2D Imageには色、透明度、画像サイズ、有効なデータ範囲などが含まれます。必要に応じて、奥行きや物体の識別番号なども一緒に流れます。

この違いを知っておくと、画像が透明にならない、Maskをつないでも切り抜けない、Transform後に端が欠ける、といった問題を原因ごとに調べられます。

## 2D Imageに含まれる情報

| 情報 | 何を表すか | 確認すると役立つ場面 |
| --- | --- | --- |
| **RGB** | 赤・緑・青の3つの色チャンネル。各チャンネル単独では濃淡の画像として表せる | 意図した色が入力されているか |
| **Alpha** | 画像の不透明度を表すチャンネル。通常は0が透明、1が不透明 | 背景が透けない、輪郭が不自然 |
| **Width / Height** | 画像のピクセル寸法 | 画面の大きさやMerge出力の解像度が合わない |
| **<Term id="domain-of-definition">DoD（Domain of Definition）</Term>** | 画像データが存在すると扱う矩形範囲 | 画面外の画像、ぼかしの境界、計算範囲 |
| **補助チャンネル（必要な場合）** | Z（奥行き）、Normal（面の向き）、ObjectID（物体の識別番号）など | 3Dレンダリング後の奥行き処理や部分選択 |

RGB・Alpha・補助チャンネルは、画素ごとに値を持つ情報です。幅・高さ・DoDは、個々の画素の色ではなく、Image全体の寸法や範囲を表す情報です。これらを同じ「チャンネル」として数えません。

例えば1920×1080のImageで中央に小さな文字だけを描いても、画像全体のサイズは1920×1080のままです。一方、文字を含むDoDはフレームより小さくなる場合があります。

Imageは時間によっても変わります。動画素材やアニメーションしたNodeでは、同じ接続でも評価するフレームによって画素やDoDが変わり得ます。「時間」はRGBAに追加される色チャンネルではなく、どの時点のImageを評価するかという条件です。

## RGBとAlphaは別々に確認する

RGBの値は色を、<Term id="alpha">Alpha</Term>は合成時にどの程度不透明として扱うかを表します。例えば赤い円を透明背景の上に描く場合、円の内側は赤いRGBと高いAlphaを持ち、円の外側はAlphaが0になります。円の輪郭には、なめらかな縁を作るために0と1の間のAlphaが入る場合があります。

ここで重要なのは、**Alphaが0でもRGBの値まで必ず0になるわけではない**ことです。画像がStraight Alphaとして保持されているか、Premultiplied Alphaとして保持されているかによって、透明部分のRGBの持ち方は変わります。

- **Straight（非プリマルチプライ）**：RGBはAlphaで乗算されていません。
- **Premultiplied（プリマルチプライ済み）**：RGBへAlphaが乗算された状態です。

両者を間違えてMergeすると、半透明の輪郭が明るくなったり暗くなったりします。これはMaskを足すだけでは直りません。詳しくは[プリマルチプライ（Premultiplication）](../04-compositing/premultiplication.md)で扱います。

## 1本の接続で複数チャンネルを運べる

~~~text
MediaIn ──→ Color Corrector ──→ Merge
                                ↑
                            背景Image
~~~

このMediaInからの1本の接続で、RGBとAlphaをまとめて次のNodeへ渡せます。素材に補助チャンネルが含まれていれば、同じ接続がそれらの値も運ぶ場合があります。RGBを3本の線でつなぎ直す必要はありません。

ただし、**どの入力へ接続するかによって、渡したデータの使われ方は変わります**。例えばMergeには2枚のImageを重ねるためのBackground入力とForeground入力があり、別に合成範囲を制限するEffect Mask入力があります。

- **Background（オレンジ）**：合成の基準となる2D Image。Mergeの出力解像度もこの入力が基準です。
- **Foreground（緑）**：Backgroundの上へ重ねる2D Image。
- **Effect Mask（青）**：Mergeによる合成処理を適用する範囲。

青いEffect Mask入力へ通常の前景Imageをつないでも、「画像をもう1枚重ねる」という意味にはなりません。Nodeの入力が何を要求しているかを確認します。

## 実例1：青い円を赤い背景へ重ねる

色とAlpha、ImageとMaskの違いを確認できる最小構成です。

~~~text
Background A（赤） ─────────────→ Merge（Background）→ MediaOut
                                  ↑ Foreground
Background B（青） ────────────────┘
        ↑ Effect Mask
    Ellipse Mask
~~~

1. Background Aを赤、Background Bを青にします。最初は両方ともAlphaを1に設定します。
2. Ellipse Maskの出力をBackground Bの青いEffect Mask入力へ接続します。Bは円の範囲だけに青を持つImageになります。
3. Background AをMergeのBackground（オレンジ）、BをForeground（緑）へ接続します。
4. MergeをViewerで確認します。赤い背景に青い円が重なって見えます。
5. Ellipse Maskを一時的に外し、BのImageを再確認します。Maskを外す前後で、どこに青が残るかを比較します。

ここでは**Ellipse Mask自体をMergeのForegroundへつないでいません**。Ellipseは適用範囲を示す単一チャンネルのMaskを作り、その範囲を使ってBackground BがRGBAのImageを出力しています。

## 実例2：画像を消さずに一部分だけ色補正する

~~~text
MediaIn ──→ Color Corrector ──→ Merge（Foreground）
                  ↑                ↑ Background
              Polygon Mask       背景Image
~~~

この例でPolygon MaskをColor CorrectorのEffect Maskへ接続すると、Polygonで囲んだ範囲だけ色補正の効果を適用できます。**Polygonの外側が透明になって消えるとは限りません**。元の画像を残し、効果のかかり方を制御する接続だからです。

人物だけを切り抜いて別の背景へ重ねたいなら、画像のAlphaを作成・変更する処理と、Effect Maskによる効果の制限を分けて考えます。[AlphaとMaskを分けて診断する](../07-debugging/alpha-vs-mask.md)も参照してください。

## Viewerでチャンネルを調べる

同じImageでも、通常の色表示だけではAlphaや補助チャンネルの状態は分かりません。

1. 確認するNodeの出力をViewerへ表示します。
2. Viewerの**Colorドロップダウン**からRed / Green / Blueなど、表示したいチャンネルを選びます。
3. Alphaを表示し、不透明にしたい部分が白、透明にしたい部分が黒、その中間が灰色になっているか確認します。
4. 3Dレンダリングの補助チャンネルを確認する場合も、素材とNodeが保持しているチャンネルをViewerで個別に確認します。
5. 元のカラー表示に戻し、RGB・Alpha・合成結果を同じNodeで見比べます。

MediaInやLoaderは通常RGBAを扱えますが、実際に透明情報を持つ素材とは限りません。Alphaが全面不透明に見える場合は、参照元の画像に透明度が含まれるか、読み込み側でAlphaを無視していないかを先に調べます。

## Imageの大きさとDoDは一致しなくてよい

~~~text
1920×1080のImage
┌─────────────────────────────┐
│                             │
│       ┌─────────────┐       │
│       │    Text+    │       │
│       └─────────────┘       │
│             DoD             │
│                             │
└─────────────────────────────┘
~~~

上の外枠はフレームの大きさ、内側の矩形は文字のデータがあると扱う範囲の一例です。**DoDはAlphaの輪郭そのものではなく、データを含む範囲の四角い境界**です。画像の端が欠ける問題では、Transformで外へ移動しただけなのか、Cropなどで画素が切り落とされたのかを分けて確認します。

また、Viewerの**RoI（Region of Interest）**はプレビューで計算を要求する範囲で、DoDとは別です。詳しくは[有効領域（Domain of Definition）](../03-space/domain-of-definition.md)と[解像度 / アスペクト比](../03-space/resolution-aspect.md)を参照してください。

## Image以外のデータと混同しない

- **[Mask](./mask.md)**：画像のどこへ効果を適用するかなどを示す単一チャンネルのデータ。Alphaと似た見た目で表示できても、画像内部のAlphaチャンネルと同一ではありません。
- **[補助チャンネル / AOV](./auxiliary-channels.md)**：RGBAと一緒に同じ2D Imageで扱える、奥行き・表面方向・IDなどの情報。通常の色表示だけでは読めないことがあります。
- **[Shape](./shape.md)・Particle・3D・USD・Deep Image**：それぞれ別のデータ領域です。通常の2D Imageとして処理するには、sRender・pRender・Renderer 3D・Deep to Imageなど、目的に合う変換が必要です。

特に**Z（奥行き）チャンネルを持つImageとDeep Imageは別物**です。前者は画素に補助的な深度値を持つ2D Image、後者は同じ画素位置に複数の深度サンプルを保持できる別のデータ形式です。[接続できるdata / 接続できないdata](./connection-compatibility.md)で接続の境界を確認できます。

## 症状から調べる

| 症状 | 最初に確認すること |
| --- | --- |
| 前景を重ねても背景が見えない | 前景のAlphaが全面1になっていないか、MergeのForeground / Background入力が正しいか |
| 透明なはずの縁に黒・白の輪郭が出る | Straight / Premultipliedの扱い、色補正の前後でRGBとAlphaがどう変わったか |
| Maskをつないでも人物が切り抜けない | Effect Maskで補正範囲だけを変えていないか、Image Alphaを変更する処理が必要か |
| Transform後に画面の端が欠ける | ImageのWidth / Height、DoD、途中のCropやclipping |
| Depth Blurなどが期待どおり動かない | 入力Imageに必要なZなどの補助チャンネルがあるか |

## 関連Node・次に読むページ

- [Background](../../nodes/generators/background.md)：新しいRGBA Imageを作る。
- [Transform](../../nodes/transform/transform.md)：Imageを移動・拡大縮小・回転する。
- [Merge](../../nodes/compositing/merge.md)：2枚のImageを合成する。
- [Alpha](../04-compositing/alpha.md)：透明度の基本。
- [Image / Mask / Dataを分ける](./image-mask-data.md)：Nodeに渡すデータの種類からGraphを読む。

## 出典と確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**（September 2026）、Fusion Fundamentals Chapter 77「Understanding Image Channels」pp.1665–1668：RGB・Alpha・Mask・Auxiliary Channelの違い、1本の接続が複数チャンネルを運ぶこと、Viewerでのチャンネル確認、Nodeの入出力を確認。
- 同Chapter 77 pp.1677–1681：Straight / Premultiplied AlphaとMerge・色補正の関係を確認。
- 同Chapter 68「Using Viewers」pp.1479–1480：ImageのDoDとRoIを確認。
- 同マニュアル Chapter 94「Merge Nodes」およびChapter 103「Generator Nodes」：合成の入力とBackground / Effect Maskの使い方を参照。

この記事は2D Imageの基本構造と読み方を扱います。すべてのNodeの補助チャンネル保持、内部REGID、各Controlの数値範囲、Edition差、現在の実機動作は一括検証していないため、`verification: partial`を維持します。
