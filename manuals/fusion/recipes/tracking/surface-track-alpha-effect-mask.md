---
title: Surface Trackerの追従マスクで色補正の範囲を動かす
description: 変形するシャツを追跡し、メッシュから作ったAlphaまたは手描きPolygonを後段Color CorrectorのEffect Maskとして利用する。
doc_type: recipe
verification: partial
aliases: [surface tracker alpha mask, tracked mesh matte, warp input 1 alpha]
concepts: [tracking, mask-data, image-data, mesh-warp]
nodes: [Surface Tracker, Bitmap Mask, Polygon, Color Corrector]
tasks: [surface-track, isolate-effect, color-correct]
prerequisites: [mask, data-domain]
level: intermediate
product_scope: fusion
updated: "2026-10-21"
---

# Surface Trackerの追従マスクで色補正の範囲を動かす

## できあがるもの

人物が動いてシャツにしわが寄っても、胸の布だけに色補正が追従する構成を作ります。元映像を直接変形するのではなく、**Surface Trackerで作った動くアルファを、別のColor CorrectorのEffect Maskとして使います。**

アルファは画素ごとの不透明度を表す値です。ここでは白い範囲ほど色補正がかかり、黒い範囲にはかかりません。色補正の内容はColor Corrector、処理する範囲はSurface Trackerから来たマスクが決めます。[Maskの基礎](../../learn/02-data/mask)も参照してください。

Surface Trackerには二つの使い方があります。

| ResultのOutput | 何がマスクの形を決めるか | 向いている処理 |
| --- | --- | --- |
| **Create Mesh Alpha Mask** | 追跡メッシュの外周 | 胸の布面など、追跡した領域全体の色・明るさを補正する |
| **Warp Input 1's Alpha** | 青いEffect Maskへ渡したPolygonなどのアルファ | 胸のプリントの周囲など、メッシュより小さい指定形状だけを追従させる |

どちらもロゴや素材を貼り付ける出力ではありません。ロゴを変形・合成する場合は[シャツへのロゴ合成](./surface-track-shirt-logo)を使います。

## 用意するもの

- 胸の模様やしわが追跡できるシャツの元映像。
- **Surface Tracker**：同じ布面の動きをメッシュで解析する。
- **Bitmap Mask**：Surface Trackerの画像出力からAlphaを明示的に取り出し、マスクとして後段へ渡す。
- **Color Corrector**：元映像へ色補正をかける。青いEffect Maskへマスクを接続すると補正範囲を制限できる。
- **Polygon**：メッシュの輪郭とは別に補正範囲を描きたい場合だけ使う。

### 接続：メッシュ全体を使う場合

~~~text
元映像 ─┬→ Surface Tracker（Input・黄）
        │     Result：Create Mesh Alpha Mask
        │           ↓
        │      Bitmap Mask（Input・橙／Channel：Alpha）
        │           │
        │           └─────────→ Color Corrector（Effect Mask・青）
        │                                  ↑
        └──────────────────────────→ Color Corrector（Input・橙）→ MediaOut
~~~

**元映像は二本に分岐**します。Surface Tracker側はマスク生成用で、Color CorrectorのImage入力には加工前の元映像を渡します。Surface Trackerの出力をColor CorrectorのImage入力へ直列につなぐと、色を補正すべき元映像ではなくマスク用画像を渡してしまいます。

## 手順

### 1. 同じ布面を追跡する

1. シャツの胸が比較的正面を向き、模様が見えるフレームを選びます。
2. Surface Trackerの黄色いInputへ元映像を接続します。
3. **Bounds**で胸の同じ布面の内側を囲みます。腕・首・背景など、別の動きをする領域を含めません。
4. **Mesh**で追跡点の分布を確認し、**Track**で必要な区間を前後へ解析します。各フレームで点が同じ布の特徴を追っているか確認してください。

メッシュがずれていると、そこから作るマスクもずれます。色補正や境界のぼかしでは追跡ミスは直りません。追跡自体の手順は[Surface Tracker](../../nodes/tracking/surface-tracker)を参照してください。

### 2. メッシュの外周からマスクを作る

Surface Trackerの**Result → Output**を**Create Mesh Alpha Mask**にします。この方式では、追跡したメッシュの外周がアルファの範囲になります。元映像中の白い模様やシャツの色から自動選択するわけではありません。

Surface Trackerの出力をViewerで確認します。布の動きに合わせて選択範囲が移動・変形しているかを見てください。公式マニュアルがいう「入力画像・アルファを無視する」は、**出力するマスク形状を別の入力画像のアルファから決めない**という意味です。メッシュを追跡するための元映像は必要です。

### 3. 後段のEffect Maskへ渡す

1. Surface Trackerの出力を**Bitmap Maskのオレンジ色のInput**へ接続します。
2. Bitmap Maskの**ChannelをAlpha**にします。RGBのLuminanceを選ぶと、画像の明暗から別の範囲を作ってしまうことがあります。
3. Bitmap Maskの出力を単独でViewerへ表示し、補正したい布の内側が白、外側が黒になっているか確認します。
4. 元映像を分岐して**Color CorrectorのImage入力（橙）**へ渡し、Bitmap Maskの出力を**Effect Mask（青）**へ接続します。
5. Color CorrectorでSaturationなどを変え、シャツの胸だけに補正がかかるか確認します。胸の位置が変わる複数フレームで同じように確認してください。

21.1マニュアルでは、**通常のEffect Mask入力には2D Imageを直接渡せるためBitmap Maskは必須ではありません**。この例ではどのチャンネルを使用するかを明示し、後からSoft Edgeなどを調整できるように挟んでいます。接続先が別種のMask入力の場合はBitmap Maskが必要になることもあります。

### 4. 必要なら境界を調整する

メッシュの外周で補正が急に途切れる場合は、Bitmap Maskの**Soft Edge**を少し増やして境界をなじませます。**Level**を下げるとマスク全体の値が下がり、色補正の効きが弱まります。Levelは境界だけをぼかす操作ではありません。

補正が胸から袖へ広がる場合は、まずBoundsと追跡を見直します。Bitmap Maskで境界を広げるだけでは、その外側の布の動きを新たに追跡できません。

## 応用：描いたPolygonの形を追従させる

胸の布面全体ではなく、胸の小さなプリント付近だけ補正したい場合は**Warp Input 1's Alpha**を使います。

~~~text
元映像 ─┬→ Surface Tracker（Input・黄）
        │        ↑ Effect Mask・青
        │     Polygon（基準フレームで補正範囲を描く）
        │        Result：Warp Input 1's Alpha
        │        ↓
        │     Bitmap Mask（Channel：Alpha） ──→ Color Corrector（Effect Mask・青）
        │                                             ↑
        └───────────────────────────────────────→ Color Corrector（Input・橙）→ MediaOut
~~~

1. **Bounds → Mesh → Track**でプリントを含むシャツの布面を追います。Boundsは追跡する布面の指定であり、プリントを切り抜く境界ではありません。
2. 追跡の基準フレームで**Polygon**を描き、プリント付近の必要な補正範囲を囲みます。PolygonをSurface Trackerの**Effect Mask（青）**へ接続します。
3. Resultの**OutputをWarp Input 1's Alpha**にします。選んだPolygonのアルファが、メッシュの追跡結果に従って変形します。
4. **Overlay/Alpha Source**は、静止した基準形状を使うか、各フレームのアルファを使うかに応じて選びます。初期形状の時間位置を基準フレームへ合わせるときは**Reference Frame**、フレームごとに変わるアルファを渡すときは**Each Frame**が対象です。意図せずマスクを二重にアニメーションさせないようにします。
5. 出力をBitmap Maskへ渡し、以後は「後段のEffect Maskへ渡す」と同じ接続でColor Correctorへ適用します。

**Warp Input 1's Alpha**は、Polygonを自動生成する機能ではありません。描いた形を追跡メッシュに従って動かす機能です。対して**Create Mesh Alpha Mask**は、別のPolygonなしでメッシュ外周を使います。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| 色補正が画面全体へかかる | Color Correctorの青いEffect Mask接続と、Bitmap Maskの出力を確認する。 |
| マスクが真っ白または真っ黒 | Bitmap MaskのChannelがAlphaか、Surface TrackerのResult Outputが目的の方式かを確認する。 |
| 胸以外の領域にも補正がかかる | Boundsが布の同じ面だけを囲んでいるか。小さい領域ならPolygonをWarp Input 1's Alphaで追わせる。 |
| 動くとマスクが滑る | Surface Tracker単体のメッシュを確認し、失敗フレームから追跡を修正する。 |
| 描いたPolygonが追従しない | PolygonがSurface TrackerのEffect Mask入力にあるか、OutputがWarp Input 1's Alphaかを確認する。 |
| 境界が硬い | Bitmap MaskのSoft Edgeを調整する。Levelと混同しない。 |
| 前景の腕まで色補正される | 追跡除外用のOcclusion Maskと完成画用の補正マスクは別。必要なら腕を避ける形を作る。 |

## 関連資料

- [Surface Tracker](../../nodes/tracking/surface-tracker)：4入力、追跡手順と6つのOutput。
- [Bitmap Mask](../../nodes/masks/bitmap-mask)：Alphaの取り出し、Soft Edge、Level。
- [Color Corrector](../../nodes/color/color-corrector)：色補正とEffect Mask。
- [Polygon Mask](../../nodes/masks/polygon-mask)：描いた範囲を追跡させる。
- [Maskの基礎](../../learn/02-data/mask)：Image AlphaとEffect Maskの違い。
- [シャツへロゴを合成する](./surface-track-shirt-logo)：追跡した素材自体を変形・合成する別用途。

## バージョン・出典・確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 119 pp.2830–2838（Surface Trackerの入力、追跡、Result Output、Overlay/Alpha Source）、Chapter 108 pp.2463–2467（Bitmap MaskのImage入力、Channel、Soft Edge、Level、Effect MaskへのImage直接接続）、Chapter 79 p.1731（Effect Maskの適用）。[公式サポート](https://www.blackmagicdesign.com/jp/support/)。

この記事の二本に分岐した合成構成は、マニュアル掲載の接続仕様を組み合わせた制作例です。**21.1実機での個別素材の追従精度、Viewerのチャンネル表示、Free / Studio差は未検証**のため `verification: partial` としています。
