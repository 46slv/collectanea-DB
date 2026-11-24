---
title: sMergeで3色の図形を重ね、前後関係を変える
description: 3つのShapeを入力順に重ね、接続先だけを交換して前後関係を比較する。
doc_type: recipe
verification: partial
aliases: [shape layer order, sMerge input order]
concepts: [shape-data, rasterization]
patterns: [defer-domain-conversion]
nodes: [sRectangle, sEllipse, sMerge, sRender]
tasks: [shape, compositing, motion-graphics]
prerequisites: [shape-data]
level: beginner
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-24"
---

# sMergeで3色の図形を重ね、前後関係を変える

## 作るもの

青い四角形、赤い円、黄色い円を少しずつ横にずらして重ねた図形を作ります。赤と黄の入力先だけを交換し、図形の位置や大きさを変えずに、重なり部分の色が切り替わることを比較します。

画像を3枚作って合成するのではなく、Shapeの段階で前後関係を決め、最後に1つのsRenderで画像化します。

## 必要なものと入力条件

- 空のFusion Composition。素材画像は不要です。
- sRectangle 1つ、sEllipse 2つ、sMerge 1つ、sRender 1つ。
- 比較するフレームは固定し、キーフレームは設定しません。
- 比較用の出力は1920×1080、正方形ピクセルを想定します。比較前後で解像度を変更しません。

各図形のControlsでSolidを有効にし、Styleの色のAlphaを1にします。以下の数値は重なりを作るための設定例であり、初期値や推奨値ではありません。

| 図形 | 色 | Width | Height | X Offset | Y Offset |
| --- | --- | ---: | ---: | ---: | ---: |
| 四角形 A | 青 | 0.24 | 0.20 | -0.10 | 0 |
| 円 B | 赤 | 0.22 | 0.22 | 0 | 0 |
| 円 C | 黄 | 0.18 | 0.18 | 0.10 | 0 |

## 接続

~~~text
sRectangle A ─→ Input1 (橙) ┐
sEllipse B   ─→ Input2 (緑) ├─ sMerge ─→ sRender ─→ Viewer
sEllipse C   ─→ Input3 (桃) ┘
~~~

sMergeには最初は2つの入力が表示されます。Shapeを接続すると追加の空き入力が現れるため、3つ目も同じsMergeへ接続できます。

## 手順

1. sRectangleと2つのsEllipseを作り、区別できるようにそれぞれA、B、Cとします。
2. 表のWidth、Height、Offset、色を設定します。角丸など、比較に不要な設定は変更しません。
3. sMergeの最初の入力にA、2番目にB、3番目にCを接続します。
4. sMergeの出力をsRenderへ接続します。sRenderのImage設定で出力サイズを確認し、Viewerへ表示します。
5. 円Bと円Cの重なり部分を確認します。
6. BとCの接続を交換し、BがInput3、CがInput2になるようにします。AはInput1のままです。再接続によって空き入力が変わる場合は、実際の端子番号を確認してから比較します。
7. 同じフレームをsRenderのViewerで確認します。上流の図形設定とsRender設定は変更しません。

## 期待される結果と確認ポイント

Manualに記載された入力順から予想される前後関係は次のとおりです。

| 比較 | 奥から手前への順序 | BとCの重なり部分 |
| --- | --- | --- |
| 交換前 | A → B → C | 黄 |
| 交換後 | A → C → B | 赤 |

円が重ならない部分では、それぞれ元の色と輪郭が残ることも確認します。色の比較はアンチエイリアスのかかる輪郭ではなく、重なり領域の内側で行います。

結果が変わったとき、図形の位置・寸法が同じままであれば、移動ではなく重ね順を変えた結果として切り分けられます。

## この構成で動く理由

sMergeは最初の入力を一番下に置き、後続の入力をその上へ重ねます。図形を配置する座標と、どの図形が手前になるかは別の設定です。

sMergeの出力はまだShapeです。sRenderで初めて通常の2D Imageへ変換するため、途中で図形ごとに画像化する必要はありません。

Shapeの意味は[シェイプ（Shape）](../../learn/02-data/shape)、変換の位置を決める考え方は[特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)を参照してください。

## バリエーション

円Cを奥に回したい場合は、Aを含めた入力順を変更してみます。まずは全図形を不透明にして比較し、その後に1つだけAlphaを下げると、前後関係の変化と透過による見え方の変化を分けて観察できます。

このレシピは複数図形を重ねる用途です。重なり領域そのものを切り抜いた新しい形状を作る手順ではありません。

## うまくいかないとき

- 図形が見えない場合：sMergeではなくsRenderの出力をViewerで確認します。上流のSolid、Alpha、寸法も確認します。
- 交換しても差が分からない場合：2つの円が実際に重なっているか、色が異なるか、端子の入力順が交換されているかを確認します。
- 四角形が円を隠す場合：四角形が最初の入力に接続されているかを確認します。
- 図形の端が切れる場合：sRenderの出力サイズと各ShapeのOffset、寸法を確認します。
- 比較中はOverride Axisを変更せず、下流に追加の変形処理を入れないでください。重ね順以外の要因を増やさないためです。

## 関連資料

- [sRectangle](../../nodes/shapes/srectangle) — 四角形を作る
- [sEllipse](../../nodes/shapes/s-ellipse) — 円や楕円を作る
- [sMerge](../../nodes/shapes/smerge) — 入力順の仕様と、既存の2円による実機比較例
- [sRender](../../nodes/shapes/s-render) — Shapeを画像化する
- [Shapeを2D Imageへrenderする](./basic-shape-render) — 最小の画像化手順

## 出典と検証範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」を参照しました。

- pp.2739–2740：sEllipseの塗り、寸法、Offset、Style。
- pp.2746–2747：sMergeの動的入力、入力順による重なり、Override Axis。
- pp.2757–2758：sRectangleの寸法、Offset、塗りと色。
- pp.2759–2760：sRenderによる画像化とImage設定。

本記事の3図形の設定値と比較手順は、Manualの仕様から組み立てた再現用の構成例です。既存のsMergeノード記事には2つの円の実機撮影例がありますが、今回の3図形の結果を撮影したものではありません。

Resolve実機での3入力の再接続、設定値による具体的な輪郭・画素色、Alphaのバリエーション、Edition差は未検証です。このため verification は partial とします。
