---
title: sPolygonでベジェ曲線の線を描く
description: sPolygonの制御点とBézierハンドルで開いた曲線を作り、Solidオフの輪郭をsRenderで表示する。
doc_type: recipe
verification: partial
aliases: [ベジェ線, ベジェ曲線, 開いた曲線, open Bézier curve]
concepts: [shape-domain, data-domain]
patterns: [defer-domain-conversion]
nodes: [sPolygon, sRender]
tasks: [shape, curve, outline, graphic]
prerequisites: [data-domain]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-23"
---

# sPolygonでベジェ曲線の線を描く

## 作るもの

左から右へゆるやかに曲がる、**両端がつながっていない一本の線**を作ります。角を持つ折れ線と、滑らかな曲線を同じ制御点から描き分けるのが目的です。図形の内部を塗るのではなく、sPolygonの輪郭を使います。

このページは、曲線を作って画像として表示する最小手順です。線を時間とともに描くアニメーションやGlowを加える方法は、最後のバリエーションで分けて扱います。

## 必要なものと入力条件

- DaVinci Resolve / Fusion 21.1のFusionページ。新しいFusion Compositionなど、Viewerで図形を編集できる作業領域を用意します。
- **sPolygon**：制御点とBézierハンドルで線の形を作ります。
- **sRender**：Shapeを通常の2D Imageへ変換し、Viewerに描画結果を表示します。
- **MediaOut**：タイムラインへ結果を送る場合のみ接続します。

1920×1080のCompositionを例に説明します。制御点の位置は画面を見ながら決め、初期値や座標の数値一致は前提にしません。以下の線幅などの数値は再現開始用の提案であり、実機測定値ではありません。

## 接続

~~~text
sPolygon（開いた曲線・Solid OFF）
         │ Shape
         ▼
      sRender
         │ 2D Image
         ▼
  MediaOut（必要な場合）
~~~

sPolygonは入力を持たず、Shapeを生成します。通常の2D画像として確認したいときは、sRenderの出力をViewerに表示します。

## 手順

### 1. 閉じていない3点の線を作る

1. sPolygonをNode Editorに追加し、sRenderへ接続します。
2. sPolygonを選んでViewerに表示し、**Click**モードで画面左寄りに1点、中央上寄りに1点、右寄りに1点を順に置きます。これらは形の目安で、正確な座標の指定ではありません。
3. **最初の点をもう一度クリックしない**でください。始点へ戻って閉じる操作と、開いた線を作る操作は別です。ツールバーの**Close**も使いません。
4. 点の追加を終えたら**Modify Only**へ切り替えます。誤って点を増やさず、既存の点を調整できます。

この段階では、直線的に折れた経路を確認します。Viewerの編集ガイドと、最終的な描画結果は区別してください。

### 2. 中央の点を滑らかにする

1. 中央の制御点を選び、ツールバーの**Smooth**を使います。
2. 必要なら**Show All Handles**を有効にし、現れたBézierハンドルの向きや長さを調整して、線の曲がり方を変えます。
3. いったん**Linear**へ戻して折れ線と比較し、再びSmoothへ切り替えます。違いを観察するため、他の設定はそのままにします。
4. 調整を終えたら**Done**へ切り替えると、制御点の意図しない追加・移動を防げます。

Smoothは点の前後を滑らかにつなぎ、Linearは角を持つ接続に戻す操作です。曲線の見た目そのものはViewerで調整します。

### 3. 塗りのない線として描画する

1. sPolygonのInspectorの**Controls → Solid**をオフにします。
2. **Border Width**を増やして線の太さを付けます。比較の開始値として0.02を試せますが、数値と画素上の太さの関係はこのレシピでは未測定です。
3. **Style → Color**で白などの見やすい色を選び、Alphaを不透明側へ設定します。
4. sRenderをViewerへ表示し、曲線の輪郭と周囲の透明領域を確認します。タイムラインで使うときだけsRenderからMediaOutへつなぎます。

Solidオンは面の塗り、SolidオフはBorder Widthで作る輪郭に対応します。透明かどうかは、Viewerの背景の色だけではなくAlphaの表示も見て判断します。

## 期待される結果と確認ポイント

- **Linear**：中央の点が角として見えやすい線。
- **Smooth**：中央の点の前後を滑らかにつないだ曲線。
- **Solidオフ**：面全体の塗りではなく、Border Widthに応じた線。
- **sRenderの出力**：Shapeが2D ImageとしてViewerや後段の画像合成へ渡せる状態。

これらは21.1公式Manualの制御の説明から導く期待結果です。特定の3点配置・線幅での実際の見た目、透明部分の画素値、開いた線の端の処理は今回の実機再現で確認していません。

## この構成で動く理由

sPolygonは制御点で形を定義するShape生成ノードです。SmoothとBézierハンドルで線の曲率を編集でき、Solidオフにすると塗りを使わず輪郭を描く構成になります。sRenderがShapeを2D Imageへ変換するので、通常のMergeやImage系エフェクトに渡せます。

図形のまま扱う理由は[Shapeの基本](../../learn/02-data/shape)と[必要な場所でImageへ変換する考え方](../../patterns/data-domain/defer-domain-conversion)にまとめています。

## バリエーション

- **自由に描き足す**：ツールバーのDrawでは自由な線を描けます。公式Manualは開いたスプラインの終端から描き足す操作も説明しています。点が多すぎたらReduce Pointsが候補です。
- **輪郭を描き進める**：Solidオフで表示されるLengthとPositionは、輪郭の表示範囲と開始位置に関係します。公式ManualではLengthを1.0未満にして隙間を作り、キーフレームで書き出し風の動きを作れると説明しています。ただし、この開いた曲線を使ったアニメーションの再現は未検証です。
- **輪郭ではなく閉じた図形にする**：最初の点を再クリックするかCloseを使い、Solidをオンにすれば内部の塗りを持つ構成へ切り替えられます。これはこのレシピの「開いた線」とは別の結果です。
- **円形の線だけが欲しい**：自由曲線ではなく既定の円形が目的なら、[sEllipseで塗りなしの円を作る](./outline-circle-with-sellipse)方が少ない操作で済みます。

## うまくいかないとき

- **点を打っても線が見えない**：sPolygonの編集ガイドを見ているだけではないか確認します。Solid、Border Width、StyleのAlphaを確認し、描画結果はsRenderの出力で見ます。
- **曲線ではなく角になっている**：中央の点を選択してSmoothへ切り替え、Show All Handlesでハンドルを確認します。
- **閉じた図形になっている**：最初の点への再クリックやCloseを使っていないか見直します。開いた線を作る場合は、その操作を避けて点の編集を終えます。
- **点が勝手に増える**：Click / Insert and Modifyのままではなく、Modify OnlyまたはDoneへ切り替えます。
- **Image系ノードへ接続できない**：sPolygonのShapeをそのまま通常のMergeに入れず、sRenderを挟みます。
- **端の形を比べたいのに変わらない**：公式ManualではCap styleの差はLengthが1.0未満のときに現れると説明されています。まず表示範囲を変えて比較します。開いたパスの端での実際の見え方は未確認です。

## 関連資料

- [ShapeからImageへ変換する最小構成](./basic-shape-render)
- [sPolygonのNode Reference](../../nodes/shapes/spolygon)
- [sBSplineのNode Reference](../../nodes/shapes/sbspline)
- [sRenderのNode Reference](../../nodes/shapes/s-render)
- [Shapeの概念](../../learn/02-data/shape)
- [Shapeを必要な場所でImageへ戻す考え方](../../patterns/data-domain/defer-domain-conversion)

## 出典と検証範囲

**公式仕様**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（2026年9月）、Chapter 117「Shape Nodes」pp.2752–2756。sPolygonの入力と出力、Solid / Border Width / Style、Click・Draw・Modify Only・Done・Close・Smooth・Linear・Show All Handles・Reduce Points、Lengthを確認しました。[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。

**既存の実機資料**：[sPolygonのNode Reference](../../nodes/shapes/spolygon)には、21.1上で開いた3点の編集画面と、閉じた4点の塗りを作った撮影例があります。ただし本レシピのSmooth＋Solidオフによる曲線の完成画像を実証したものではありません。

**未検証**：具体的な3点配置、Bézierハンドルの操作後の見た目、開いた線でのLengthとCap styleの表示差、Border Widthの画素換算、透明画素測定、実機でのアニメーション、Free/Studio差、他OS/GPU、production build、ブラウザ、公開結果はNOT_RUNです。このためverificationはpartialのままです。
