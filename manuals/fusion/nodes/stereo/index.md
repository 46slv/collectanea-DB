---
title: Stereo 3Dノード
description: 左右眼の画像・視差・Z深度の違いと、Resolve 21.1に掲載される9つのStereo Nodeの選び方・接続順を説明する。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, stereo, disparity]
updated: "2026-10-10"
---

# Stereo 3Dノード

Stereo 3Dは、**同じ場面を左眼と右眼の位置から撮った2枚の画像**を扱います。左右の映像を位置合わせし、画面内の同じ物体のずれを計算したり、立体感を調整したり、表示・納品用の形式へ変換したりします。

DaVinci Resolve 21.1 Reference Manualの**Chapter 118「Stereo Nodes」には9つのNode**が記載されています。**これらのStereo NodeはDaVinci Resolve Studio／Fusion Studio限定**です。単なる1枚の2D画像から、撮影していない視点が自動的に正確に復元されるわけではありません。

## 左右画像、視差、Z深度を区別する

- **左右眼画像（Stereo Pair）**：同じ時刻を左眼用と右眼用の視点から見た2枚の<Term id="image">2D Image</Term>です。
- **視差（Disparity）**：同じ物体が左右の画面内でどれだけ異なる位置に写るかを示す、横・縦方向の**画素移動量**です。[Disparity](./disparity.md)は左右の対応点を解析し、画像の<Term id="auxiliary-channels">補助チャンネル</Term>へ計算結果を格納します。実際の距離や見た目の色そのものではありません。
- **Z深度（Z Depth）**：画素に写った面がどの程度奥にあるかを示す値です。視差から変換する場合も、CGの深度パスから受け取る場合もあります。Z深度だけでは左右眼の画像は生成されません。

**位置合わせ、視差計算、深度変換、出力形式の変更は別々の処理**です。目的に必要な段階を選びます。

## 何をしたいかで選ぶ

| 目的 | Node | 何が変わるか |
| --- | --- | --- |
| 左右画像の大きな位置ずれを直す | [Global Align](./global-align.md) | 全体的な平行移動・回転などを調整し、2枚をそろえる。 |
| 同じ物体の左右の位置差を調べる | [Disparity](./disparity.md) | 左右画像から視差を計算し、X/Yの補助チャンネルを持たせる。 |
| 縦ずれ・輻輳位置・立体感を調整する | [Stereo Align](./stereo-align.md) | 視差情報を使って左右画像を補正する。 |
| 中間の視点を推定する、片眼を再生成する | [New Eye](./new-eye.md) | 視差を使って元画像の画素を移動・補間する。 |
| 視差を深度へ変換する | [Disparity To Z](./disparity-to-z.md) | カメラ情報と視差を使いZ深度を求める。 |
| 既存の深度を視差へ変換する | [Z To Disparity](./z-to-disparity.md) | Z深度とカメラ情報から視差を計算する。 |
| 左右画像を横並び・縦並びにまとめる | [Combiner](./combiner.md) | 2枚の画像を1枚に配置する、またはLayerとしてまとめる。 |
| 1枚に並んだ左右画像を分ける | [Splitter](./splitter.md) | 左右眼の画像をそれぞれ取り出す。 |
| 赤／シアンなどの眼鏡で立体視を確認する | [Anaglyph](./anaglyph.md) | 左右の色成分を組み合わせ、眼鏡で見るための1枚の画像を作る。 |

**Combiner／Splitter／Anaglyphは画像形式・表示のためのNode**で、被写体の対応位置を解析するわけではありません。

## SeparateとStackの違い

Stereo系Nodeの多くは、左右眼を**別々の2入力**として扱うSeparateと、左右を横並び・縦並びで**1枚の画像**に格納するStackに対応します。

Separateでは左右に対応する入力・出力端子を使います。Stackでは左眼側の入力へまとめた画像を入れ、通常は左眼側の出力を後段へ渡します。右眼側の端子が非表示になる場合があるため、**個別NodeのStack Modeと端子表示**を確認してください。

2枚を単に横並びにするだけでは視差の補助チャンネルは生成されません。Stereo AlignやNew Eyeで視差を使うときは、必要な計算を前段で済ませます。

## 運用例：ステレオ撮影のずれを直す

左右2台のカメラで撮影したところ、右眼の映像がわずかに上へずれ、人物の輪郭が二重に見える場合です。

~~~text
左眼画像 ─┐
          ├─ Global Align ── Disparity ── Stereo Align ── 補正後の左右画像
右眼画像 ─┘                                               │
                                            必要なら視差を再計算
~~~

この図は**処理順**を示しています。各Stereo Nodeには、Separateの場合、左右それぞれの画像を対応する2入力へ接続します。

1. 左右の**時刻と色をそろえる**。色差が大きければ、視差計算前にColor Correctorなどで大まかな色合わせをします。
2. **Global Align**で全体の平行移動や回転の差を整えます。
3. **Disparity**で同じ被写体の対応点を求め、視差付きの左右出力をStereo Alignへ渡します。
4. **Stereo Align**で縦ずれ・輻輳位置などを調整し、人物の輪郭、細い髪、画面端の隙間を確認します。
5. 後段でも視差が必要なら**調整後の左右画像から再計算**します。ManualはStereo AlignとNew Eyeの処理で元の視差チャンネルが無効になると説明しています。

視差の計算負荷が高い素材では、視差の補助チャンネルを含む画像をOpenEXRなどへ保存して再利用する手順もManualにあります。ただし視差を変える処理の後には、その結果に対応する視差が必要です。

## 表示用にまとめる場合

**Side-by-Sideの映像を作る**なら[Combiner](./combiner.md)、横並び素材から左右を取り出すなら[Splitter](./splitter.md)、**色付き眼鏡での立体視を確認する**なら[Anaglyph](./anaglyph.md)を使います。アナグリフと横並びは異なる形式です。再生・納品先に合わせて選びます。

## 失敗しやすい点

- **透明な合成物を視差計算より先に重ねない**：レンズフレアやモーションブラー、ぼけた輪郭は、左右の対応点の検出を難しくします。Manualは色合わせや必要なレンズ歪み補正を視差計算の前に行うことを勧めています。
- **隠れた部分は自動で復元されない**：新しい視点へ画素を移動したとき、元画像にない背景は欠落・引き伸ばし・二重像になる場合があります。
- **Optical Flowとは用途が違う**：Disparityは**同時刻の左右2視点**のずれ、Optical Flowは**時間が異なるフレーム間**の動きです。
- **視差は画素単位**：Manualの視差X/Yは非正規化の画素移動量です。Proxy画像では元の大きさとの倍率に注意します。
- **右眼の結果も確認する**：Stereo NodeをViewerで表示すると左眼の出力が選ばれるため、右眼出力を別の後段Nodeにつないで表示する方法がManualに紹介されています。

## Positionは別のNode Family

**Z to World Pos、Volume Fog、Volume Mask**は、21.1 ManualではStereoではなく**Chapter 115「Position Nodes」**です。[Positionノードの案内](../position/)でまとめて扱います。

既存の3記事は内部リンクを壊さないため旧Stereoフォルダーに残していますが、機能分類とカタログ用の`node_family`はPositionです。Z to World PosはZ深度とカメラから**各画素の世界座標（XYZ）**を求め、Volume Fog／Volume Maskはその位置情報を使います。

## 出典と確認範囲

一次資料：Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』、**Chapter 87「Optical Flow and Stereoscopic Nodes」pp.1904–1909、Chapter 118「Stereo Nodes」pp.2770–2800**。Position分類はChapter 115「Position Nodes」p.2704。

**verification: partial**：9 Nodeの掲載、Stereo系のStudio限定、視差・Stack・処理順の基本的な説明はManualで確認しています。21.1実機の全端子名・初期値・範囲・処理結果、特定のステレオ納品機器との適合性は未検証です。
