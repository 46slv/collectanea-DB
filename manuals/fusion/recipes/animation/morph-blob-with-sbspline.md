---
title: sBSplineで丸い図形を伸び縮みさせる
description: 少数の制御点で閉じた図形を描き、別のフレームで点を動かして輪郭そのものを変形させる。
doc_type: recipe
verification: partial
aliases: [Bスプラインの変形, シェイプのモーフィング, blob morph, 形状アニメーション]
concepts: [shape-data, vector-shape, keyframes, rasterization]
patterns: [defer-domain-conversion]
nodes: [sBSpline, sRender]
tasks: [shape, animate, motion-graphics]
prerequisites: [shape-data, keyframes]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-24"
---

# sBSplineで丸い図形を伸び縮みさせる

## 作るもの

丸みのある不定形を、横に伸びて再び元の形に戻る図形にします。図形全体を拡大するのではなく、右側の輪郭だけが外へ膨らむように変形させます。柔らかいタイトル背景や抽象的なモーショングラフィックスの素材に使えます。

## 必要なものと入力条件

- DaVinci Resolve 21.1のFusion Composition。例として1920×1080、フレーム0〜48を使用します。
- sBSplineとsRenderを各1個。素材映像は不要です。
- 最初に制御点を4つ用意し、後のフレームでも同じ点を移動します。

フレーム番号、点の数、移動距離は制作例の開始条件です。この組み合わせの実機アニメーションを測定した値ではありません。コンポジションの開始フレームが異なる場合は、同じ相対間隔で読み替えてください。

## 接続

~~~text
sBSpline1 ── Shape ──> sRender1 ── Image ──> Viewer / MediaOut
~~~

輪郭を編集するのはsBSpline1、画像として確認するのはsRender1です。sBSplineを選択したまま、sRenderの出力をViewerに表示して作業します。

## 手順

### 1. フレーム0で元の輪郭を描く

フレーム0へ移動してからsBSplineを追加し、sRenderへ接続します。Viewerの中央付近に、上・右・下・左の順で制御点を4つ置きます。最初の点をもう一度クリックして閉じるか、ViewerのツールバーのCloseで閉じます。

ControlsのSolidを有効にし、StyleのColorで見やすい単色とAlphaを設定します。点は曲線の通過位置ではなく、曲線を引く位置です。点の並びを調整して、丸い輪郭になるようにします。

~~~text
       P1
        •
P4 •         • P2
        •
       P3
~~~

これは制御点の配置を示す概念図です。実際の輪郭は各点の間を滑らかにつなぐように変化し、上図の線や点そのものが出力されるわけではありません。

### 2. フレーム24で右側だけを伸ばす

フレーム24へ移動します。sBSplineのViewer編集ツールをModify Onlyにして、右側の制御点P2だけを右へ動かします。移動量は画面幅の1割程度を目安にし、輪郭の見え方で調整します。ほかの3点やSolid、Size、Offsetは変更しません。

sBSplineは形状を自動的にキーフレーム化するので、別のフレームで制御点を編集すると、形状の新しいキーフレームが作られます。フレーム0に戻って元の形が保持されているか確認します。

### 3. フレーム48で元へ戻す

フレーム48へ移動し、P2をフレーム0で置いた位置へ戻します。元の位置は事前にViewerの表示を参考として控えておきます。正確に一致するループが必要なら、形状キーフレームの複製や値の一致を実機で確認してから使用してください。

フレーム0、12、24、36、48を順に表示して変化を確認します。途中のフレームでは点の位置が補間され、輪郭が次の形へ移ることを期待します。補間の種類や速度曲線はこのレシピでは指定しません。

## 期待する結果

| フレーム | 操作・観察 |
| --- | --- |
| 0 | 元の丸い図形 |
| 12 | 右側へ伸びる途中の形 |
| 24 | 右側が最も伸びた形 |
| 36 | 元の形へ戻る途中 |
| 48 | 元の輪郭に近い形 |

右側の点だけを動かしても、その周囲の曲線は連続して変化します。右半分だけを独立した画像として伸ばす処理ではありません。表はManualの形状補間の説明から導く確認項目であり、実機の測定結果ではありません。

## この構成で動く理由

[sBSpline](../../nodes/shapes/sbspline.md)は点の位置から滑らかな輪郭を生成します。制御点を編集したフレームごとに形状の状態を持たせることで、その間の形状変化を作れます。[sRender](../../nodes/shapes/s-render.md)はその時点のShapeを画像化します。

全体の位置や大きさを変えるだけならOffsetやSizeを使う方が適しています。今回は点の相対位置を変えるので、形状の変形と全体の移動・拡大を分けて管理できます。[Transformの位置アニメーション](./animate-transform-center.md)とは動かす対象が異なります。

## バリエーション

- 上側の点を動かして、縦方向へ膨らむ図形にする。
- 色やAlphaを変え、画像化後にMergeでタイトルの背面へ重ねる。
- 曲線が特定の点を通ることを重視する場合は、[sPolygon](../../nodes/shapes/spolygon.md)のベジェ曲線を検討する。ベジェの線を描く手順は[こちらのレシピ](../shapes/draw-open-bezier-curve-with-spolygon.md)を参照。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| 点だけ表示されて図形が見えない | 閉じた輪郭になっているか、SolidとColorのAlpha、sRenderのViewer表示を確認する。 |
| 点と輪郭が一致しない | B-Splineの点は曲線を引く位置であり、必ず通過する位置ではない。 |
| 点が意図せず増える | Modify Onlyに切り替え、既存の点だけを動かす。 |
| 元の形が変わった | フレーム0で編集していないか、形状キーフレームを確認する。 |
| 静止図形のつもりなのに形が変わる | 別のフレームで点を編集して自動キーフレームが追加されていないか確認する。 |
| 形ではなく全体が移動している | OffsetやSizeではなく個々の制御点を編集しているか確認する。 |

## 関連資料

- [Shapeの基本](../../learn/02-data/shape.md)
- [データ領域の変換を遅らせる](../../patterns/data-domain/defer-domain-conversion.md)

## 出典と検証範囲

Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）, Chapter 117:

- pp.2732–2733：sBSplineの制御点と曲線の関係、形状の自動キーフレーム化と補間。
- pp.2753–2756：sPolygonと共通する塗り・色・位置・サイズ、点の追加・閉じ方、Viewer編集モード。
- pp.2759–2760：sRenderのShape入力と画像出力。

[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)の同版の提供済みPDF本文を2026-11-24に照合しました。既存のsBSplineノード記事には4点を置いて閉じた静止画の実機記録S295がありますが、本レシピの時間変化を検証したものではありません。

フレーム0/24/48での実際の形状キー、途中の補間・速度、点の正確な復帰、ループの連続性、出力Alpha、Edition・OS差および性能は未検証です。verification: partial とします。
