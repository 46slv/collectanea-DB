---
title: Paintノード：描画要素の使い分け
description: Paintの画像入力・クローン元・マスクの違いと、Stroke、Multistroke、Copy、Fill、Paint Groupの選び方。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, paint, cleanup]
updated: "2026-10-10"
slug: overview
---

# Paintノード：描画要素の使い分け

Fusionの[Paint](./paint)は、映像へ線や図形を描き、別の位置の画素を複製して不要物を隠せる**2D画像処理ノード**です。Flowに配置するPaintは1つですが、Viewer上部のツールバーから用途に応じた描画要素を選べます。

手描きの線を後から修正するならStroke、1フレームの細かなゴミを大量に消すならClone Multistroke、四角い看板の一部を画像で置き換えるならCopy Rectangleを使います。**いずれもPaint内部の描画要素であり、別のFlowノードではありません。** 結果はPaintの画像出力から次のノードへ渡します。

## 画像入力・マスク・コピー元の違い

| 項目 | 入れるもの | 役割 |
| --- | --- | --- |
| **Input（オレンジ）** | MediaInやBackgroundなどの2D画像（必須） | 描画するキャンバス。入力画像の解像度が作業解像度になる |
| **Effect Mask（青）** | 別のMask（任意） | Paintの効果が現れる領域を制限する。クローン元ではない |
| **Source Tool（Inspector）** | コピー元の画像ノード | CloneやCopyでどの画像の画素を参照するか決める |
| **Paintの出力** | 描画後の2D画像 | Merge、MediaOutなどへ渡す |

直接補修するときは、`MediaIn → Paint → MediaOut`とつなぎます。描画だけ別レイヤーにしたい場合は次の構成です。

```text
Background（映像と同解像度、Alpha 0）→ Paint → MergeのForeground
MediaIn ───────────────────────────────────→ MergeのBackground
Merge → MediaOut
```

透明なBackgroundには複製できる映像の画素がありません。**この構成でCloneやCopyを使う場合、PaintのSource Toolへ元映像のノードを別途指定**してください。MergeのBackgroundへMediaInを接続しただけでは、Paintのクローン元は設定されません。また、Copy系の形状では**Fill TypeをImage**にします。

## 目的に合う描画要素を選ぶ

| 作業 | 要素 | 入力画像への作用・編集の特徴 |
| --- | --- | --- |
| 手描きの線を後から位置・経路ごと直したい | [Stroke](./stroke) | ブラシの軌跡に色やクローンを描く。Make Editableで制御点を表示できる |
| 1フレームに多くの細かな線を描く | [Multistroke](./multistroke) | 大量のブラシ操作を効率よく描く。個々の線は後編集できない |
| ゴミやマーカーを画素の複製で手早く消す | [Clone Multistroke](./clone-multistroke) | 参照した画素を別位置へコピーする。多くの短い補修向き |
| 輪郭や文字の経路を正確に描く | [Polyline Stroke](./polyline-stroke) | 点を置いて経路を作り、経路に沿って描く。既存Pathとの接続も可能 |
| 円形の色付き図形を描く | [Circle](./circle-stroke) | 中心と半径を変えられる。画素の複製ではない |
| 四角い色付き図形を描く | Rectangle | 矩形の描画領域を作る。21.1 ManualにあるPaint内部のツール |
| 円・楕円状の範囲へ周囲の画素をコピーする | [Copy Ellipse（Copy Circle系）](./copy-ellipse) | Sourceの画像を円形範囲へ複製する |
| 矩形の範囲へ画素をコピーする | [Copy Rectangle](./copy-rectangle) | 直線状の縁を持つ物体の補修に使う |
| 複雑な輪郭の内側を画像で置き換える | [Copy Polyline](./copy-polyline) | 閉じた自由形状を作り、内部へSourceの画素を複製する |
| 色の近い画素がつながる領域を塗る | [Fill](./fill) | 指定位置から隣接画素を調べ、色が近い領域へ塗る |

Paintのツールバーには、描いた線を選び直す**Select**と、複数の要素をまとめる**[Paint Group](./paint-group)**もあります。Paint Groupは独立したFlowノードではなく、内部の描画をまとめて位置・角度・大きさを調整する機能です。

**FillとCopyはどちらも領域を変えますが、結果が異なります。** Fillは入力画像の色の近さを手掛かりに領域を決め、色を塗ります。Copy系は自分で範囲を定め、元画像の別の位置から明暗や模様を含む画素を複製します。布地のマーカーを質感ごと隠すなら、単色のFillよりCopy系が適します。

## 表示期間と後編集の違い

[Multistroke](./multistroke)と[Clone Multistroke](./clone-multistroke)は、初期状態で**1フレーム**に表示されます。描画後の個々の操作は直接編集できないため、筆先・Apply Mode・**Stroke Duration**は描く前に決めます。Paint Groupで全体を動かせても、個別の軌跡が後編集可能になるわけではありません。

Stroke、Polyline Stroke、Circle、Rectangle、Copy系、Fillは、初期状態で**コンポジション全体**に表示されます。対応する要素の表示期間はKeyframes Editorで変更できます。[Stroke](./stroke)や[Polyline Stroke](./polyline-stroke)は、**Write On／Write Off**で線が描かれる・消える時間変化を作れます。一方、円を大きくする表現ではCircleの半径をアニメーションします。

位置の追従と表示期間は別の設定です。Paint GroupをTrackerへ接続して動かしても、1フレームしか表示されないMultistrokeの期間が自動で伸びるわけではありません。描き終えたらViewerのツールバーをSelectに戻すと、不意の描画を防げます。

## 運用例

### 壁のラベルを消す

`MediaIn → Paint → MediaOut`で[Copy Rectangle](./copy-rectangle)を選び、ラベルを囲む四角形を作ります。Source Toolへ元映像のノードを指定し、Fill TypeをImageにします。Offsetを調整すると、ラベルのない壁の画素が矩形内に複製されます。壁の目地や明暗がつながるか確認し、輪郭が斜めなら[Copy Polyline](./copy-polyline)へ替えます。

### 動く衣服のマーカーをまとめて消す

[Clone Multistroke](./clone-multistroke)でマーカー付近へきれいな布地の画素をコピーします。同じ動きをする補修を[Paint Group](./paint-group)にまとめ、グループのCenterをTrackerの追跡結果につなぎます。Multistrokeの表示期間は描画前に設定してください。追跡だけで布地の伸縮や照明変化は補正されないため、前後のフレームを再生して補修跡を確認します。

### 文字の輪郭を手描きアニメーションにする

透明なBackgroundをPaintへ入力し、[Polyline Stroke](./polyline-stroke)で文字の経路を作ります。Write Onで線が現れるタイミングを設定し、PaintをMergeのForegroundへ接続します。映像本体とは別レイヤーなので、Mergeで合成量や重ね方を調整できます。

### マスクの小さな穴だけを埋める

別ノードのEffect Maskへ渡す範囲を補修したいなら、[Mask Paint](../masks/mask-paint)を使います。例えばBitmap Maskの人物領域に穴が残ったとき、Mask Paintで穴の位置だけ描き、単一チャンネルのマスクを後段へ渡します。Paintによるカラー画像の描画と、マスク値の描画は別です。

## PaintとMask、Shapeの違い

[Paint](./paint)は2D画像へ色や画素コピーを描き、2D画像を出力します。[Mask Paint](../masks/mask-paint)は入力画像がなくても単一チャンネルのMaskを描けます。Paint内部にあるCircleやCopy Polylineは図形を使った描画ですが、**Shapeノード群（s*）のShapeデータ**と同じものではありません。

基礎概念は[Image](../../learn/02-data/image)、[Mask](../../learn/02-data/mask)、[Shape](../../learn/02-data/shape)を参照してください。名称から探す場合は[用語集](../../index/glossary)も使えます。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 80「Paint」pp.1747–1751、およびChapter 113「Paint Node」pp.2638–2643に基づきます。PaintとMask Paint、入出力、透明キャンバスの構成、Source、描画要素の分類、表示期間と後編集の違いを確認しました。

本ページは要素の選択方法を説明するカテゴリ案内です。内部REGID、Inspector全項目の値域、21.1実機での細部、Free／Studio差は全件検証していないため、`verification: partial`を維持します。
