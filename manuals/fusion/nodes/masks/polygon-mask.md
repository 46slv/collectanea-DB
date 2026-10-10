---
title: Polygon Mask
description: Bézierの制御点で自由な輪郭を作るMaskノード。点の編集、形状アニメーション、Fill Method、部分的なSoft Edge、複数Maskの合成を解説。
doc_type: node
term_id: polygon-mask
term_short: 自由なBézier輪郭を描き、映像の処理範囲をフレームごとに変えられるマスクノード。
verification: partial
aliases: [Polygon, Polygon Mask, Ply]
concepts: [mask-data, bezier-path]
nodes: [Polygon Mask]
node_family: masks
controls: [Show View Controls, Level, Filter, Soft Edge, Border Width, Paint Mode, Invert, Solid, Center, Size, X Rotation, Y Rotation, Z Rotation, Fill Method, Shape Animation]
inputs: [mask]
outputs: [mask]
tasks: [mask, roto, bezier, isolate-effect]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Polygon Mask

Polygon Maskは、映像の中で処理したい範囲を、点を結んだ自由な輪郭で指定するノードです。円や長方形では合わない人物の肩、車の窓、動く物体などを囲うときに使います。輪郭をフレームごとに変えられるため、動く対象を切り抜く**ロトスコーピング（Rotoscoping）**にも使えます。

輪郭を表す線を**Bézier（ベジェ）曲線**と呼びます。線上の点がControl Point（制御点）、点から伸びる方向と曲がり具合を調整するものがHandle（ハンドル）です。点を置くだけで輪郭が完成するわけではなく、点同士の間の曲線も編集して対象の形に合わせます。

## 入力と出力

Polygon MaskはRGBA画像を作るノードではありません。白を「処理する」、黒を「処理しない」として表す、単一チャンネルの[マスク](../../learn/02-data/mask)を出力します。

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Effect Mask（青、任意）** | 別のマスク | 入力したマスクとPolygon自身の輪郭を合成する |
| **出力** | 単一チャンネルのマスク | Blurなど、マスク入力を持つノードの処理範囲を指定する |

例えば、映像の中の人物だけをぼかすなら、映像はBlurの画像入力へ、Polygon Maskの出力はBlurの青いEffect Mask入力へ接続します。

~~~text
MediaIn ─────────→ Blur ─────────→ MediaOut
                    ↑ Effect Mask
               Polygon Mask
~~~

Polygon Maskへ映像そのものを入力する必要はありません。どこに処理をかけるかをPolygonで指定し、処理の強さや種類はBlur側で調整します。

## Viewerで輪郭を描く

1. Polygon Maskを追加して選択し、加工対象の画像をViewerに表示します。
2. Viewerをクリックして輪郭上にControl Pointを順に置きます。新しい点は直前の点と線でつながります。
3. 最初の点を再度クリックすると輪郭が閉じます。閉じた線の内側がマスクの対象になります。
4. 輪郭がずれているところは点やBézier Handleを動かして合わせます。直線的な部分はLinear、滑らかな部分はSmoothを使い分けます。

初期状態は点を追加する**Click Append**モードです。閉じた後は**Insert and Modify**に切り替わり、線の途中へ点を足したり、既存の点を動かしたりできます。点を誤って増やしたくないときは**Modify**、形ができて点の移動も防ぎたいときは**Done**を使います。Doneでも輪郭全体の移動・回転は可能です。

Viewer上部のPolylineツールバーには、点を順に置く**Click**のほか、手描きする**Draw**、点を追加する**Insert**、編集する**Modify**、編集を防ぐ**Done**、線を閉じる**Closed**などがあります。大量の点を打つより、少数の点でまず輪郭を作り、必要な場所だけ追加した方が後から直しやすくなります。

## Inspectorの主要設定

### 形状・位置

| 設定 | 何が変わるか |
| --- | --- |
| **Show View Controls** | Viewer上の制御点や位置・回転ハンドルの表示を切り替える |
| **Center X / Y** | 輪郭全体の位置 |
| **Size** | 制御点同士の相対的な形を保ったまま、輪郭全体を拡大・縮小する |
| **X / Y / Z Rotation** | それぞれの軸に対する輪郭全体の回転 |
| **Fill Method** | 線が交差・重複した場合に内側をどう判定するか |

**Size**による拡大縮小は、個々の点を編集する操作とは異なり、マニュアル上は輪郭のShape Animationへキーフレームを追加せずに行えると説明されています。形状の微調整をしたいのか、輪郭全体を動かしたいのかで使い分けます。

**Fill Method**には**Alternate**と**Non Zero Winding**があります。輪郭が交差したときに、内部へ意図しない穴ができる場合はNon Zero Windingへ切り替えて結果を確認します。どちらが常に正しいという設定ではありません。

### マスクの濃さと境界

| 設定 | 何が変わるか |
| --- | --- |
| **Solid** | 有効なら閉じた輪郭の内側、無効なら線の周囲をマスクにする |
| **Border Width** | Solid無効時の輪郭の太さ。Solid有効時はマスクの縁を太らせたり細らせたりする |
| **Level** | マスクの値を下げ、後段の効果がかかる割合を弱くする |
| **Soft Edge** | マスク境界をぼかす。0.0なら硬い境界になる |
| **Filter** | Soft Edgeの処理方式をBox、Bartlett、Multi-box、Gaussianから選ぶ |
| **Invert** | マスク全体の白黒を反転する |

Filterの**Multi-box**では**Num Passes**が表示されます。値を増やすとぼかしの品質を調整できます。輪郭を確認するときは先にSoft Edgeを0へ戻し、輪郭が合ってから必要なぼかしを加えると原因を切り分けやすくなります。

### 別のマスクとの合成

Polygon Maskの青い**Effect Mask入力**へ別のマスクをつないだ場合、Inspectorに**Paint Mode**が表示されます。これは入力マスクとPolygon自身の形をどのように組み合わせるかを選ぶ設定です。

例えば**Subtract**は、入力マスクからPolygonと重なる部分を差し引きます。**Multiply**は2つの値の積、**Minimum / Maximum**は小さい方／大きい方を採用します。**Copy**は入力を捨てPolygon自身のみ、**Ignore**はPolygon自身を捨て入力のみを使います。**Invert（Paint Mode）**はPolygonと重なる入力領域を反転する演算で、上表の**Invertチェックボックス**によるマスク全体の反転とは異なります。その他のモードは[Maskカテゴリ概要](./index)で説明しています。

## 時間を動かして輪郭を追う

Polygon Maskは、追加した時点のフレームに最初の**Shape Animation**キーフレームが作られます。その後、別のフレームで制御点や曲線を変更すると新しいキーフレームが追加され、フレーム間の輪郭が補間されます。

1. 対象の形が見やすい基準フレームで輪郭を描きます。
2. 対象が大きく動くフレームへ移動し、ずれた点だけを修正します。
3. 中間のフレームへ戻り、補間された輪郭が対象から外れていないか確認します。
4. ずれが残る箇所へキーフレームを追加し、必要になってからSoft Edgeを調整します。

Inspectorの**Right-Click Here for Shape Animation**から、形状アニメーションを外したり付け直したりできます。時間を移動して点を直す操作は、新しいShapeキーを作る可能性があるため、静止形状を編集するつもりなら現在フレームを先に確認してください。

### 複数のフレームを一緒に直す

Viewerの**Multiframe**は、一つの制御点の変更を複数キーフレームへ反映するためのモードです。初期の**None**は現在のキーフレームのみ、**All**は全キーフレーム、**Prev / Next**は現在と前／次のキーフレームを対象にします。1フレームだけ修正したいときにAllへしていると、ほかのキーも変わってしまうため注意してください。

**Onion Skinning**は異なるフレームの輪郭をViewerに重ねて表示する機能です。対象の移動を見比べながら点を調整できます。

### 部分的に境界を柔らかくする

**Double Poly**では内側と外側の2本の輪郭を使います。元の輪郭に相当する内側の線と、ぼかしの広がりを決める外側の線の距離を変えることで、線の一部だけSoft Edgeを広くできます。全周のSoft Edgeを一律に増やしたくない場合に有効です。元のShape Animationも保持されます。

## 運用例

### 歩く人物の顔だけをぼかす

1. MediaIn → Blur → MediaOutを接続し、Blurで必要なぼかし量を決めます。
2. Polygon MaskをBlurの青いEffect Mask入力へつなぎ、顔の外形へ少数の点を打って閉じます。
3. 顔の向きが変わるフレームで輪郭を修正します。中間フレームも見て、補間された線が顔からはみ出していないか確認します。
4. 髪の毛など不規則な部分では必要な点だけ増やし、最後にSoft Edgeを調整します。輪郭の片側だけ柔らかくしたければDouble Polyを検討します。

この構成では、動くのはBlurの適用範囲です。Blurに入力した画像の位置や大きさをPolygonが変えるわけではありません。

### マスクから一部分だけ除外する

人物全体を囲ったマスクから、手前にある標識の領域だけを除外する例です。

~~~text
Polygon A（人物全体） ─→ Polygon B（標識）
                         Paint Mode: Subtract
                                  ↓
                              BlurのEffect Mask
~~~

先に人物全体のPolygon Aを作り、Polygon Bでは除外したい標識を囲みます。Polygon Aの出力をPolygon Bの青い入力へ接続して、BのPaint ModeをSubtractにします。出力をBlurのEffect Maskへ接続すると、人物をぼかす範囲から標識に重なる部分が外れます。

標識が動く場合はPolygon Bの輪郭もフレームに合わせて編集します。2つの輪郭を別ノードに分けると、それぞれのキーフレームと役割を追いやすくなります。

## 似たノード・関連する概念

[Ellipse Mask](./ellipse-mask)は円・楕円、[Rectangle Mask](./rectangle-mask)は四角形で素早く範囲を指定します。[B-Spline Mask](./b-spline-mask)は少ない点で滑らかな自由曲線を作る場合の候補です。[MultiPoly](./multipoly)はPolygonとB-Splineを同じノードのリスト内で管理したい場合に使います。

- [マスク（Mask）の基礎](../../learn/02-data/mask)
- [キーフレーム / スプライン / 時間](../../learn/05-time/keyframes-spline-time)
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)
- [Mask Paint](./mask-paint) — 手描きでマスクを補修する

## バージョン・出典・未確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 108「Mask Nodes」pp.2480–2484を基準にしました。Effect Mask入出力、Shape Animation、Center／Size／X・Y・Z Rotation、Fill Method、Click・Modify・Done、Multiframe、Onion Skinning、Double Polyを確認しています。

マニュアルの**[Ply]**は選択用の略号であり、内部REGIDとは断定しません。実機での詳細ショートカット、個々の値の有効範囲、Free／Studioの差は未検証のため、verificationはpartialです。
