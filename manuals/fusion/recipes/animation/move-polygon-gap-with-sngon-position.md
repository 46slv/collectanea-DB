---
title: sNGonのPositionで多角形の切れ目を移動させる
description: 六角形の輪郭の長さと向きを固定し、Positionで切れ目だけを移動させるHUD風のアニメーションを作る。
doc_type: recipe
verification: partial
aliases: [多角形の切れ目, HUD枠アニメーション, sNGon Position]
concepts: [shape-data, rasterization]
patterns: [defer-domain-conversion]
nodes: [sNGon, sRender]
tasks: [shape, animation, graphic]
prerequisites: [shape-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-24"
---

# sNGonのPositionで多角形の切れ目を移動させる

## 作るもの

中央に六角形の枠を置き、その輪郭の一部を欠けさせます。枠の角の位置や向きを変えず、切れ目だけが輪郭に沿って移動するHUD風のマークを作ります。

輪郭が伸びて完成する演出とは異なり、ここではLengthを一定に保ち、Positionを時間とともに変えます。

## 必要なものと入力条件

- DaVinci Resolve / Fusion 21.1のFusion Composition。1920×1080、フレーム0〜48を例にします。
- sNGon：六角形の輪郭と切れ目を作ります。外部素材は不要です。
- sRender：Shapeを画像化します。

以下の数値は操作例です。実機で動作や寸法を測定して決めた値ではありません。Compositionの開始フレームが0でない場合は、その開始フレームからの相対位置として読み替えてください。

## 接続

~~~text
sNGon（Solid OFF / Length固定 / Positionを動かす）
  │ Shape
  ▼
sRender → MediaOut（必要な場合）
~~~

sNGonは外部入力を持たない図形生成ノードです。sRenderの出力をViewerに表示します。

## 手順

### 1. 六角形の輪郭を作る

1. sNGonを追加し、sRenderへ接続します。
2. 辺数を6にします。21.1 Studioの既存実機資料では日本語UIで「辺の数」、ScriptingではSidesとして確認されています。
3. WidthとHeightをともに0.35程度、X OffsetとY Offsetを0、Angleを0とします。
4. Solidをオフにし、Border Widthを0.015程度に設定します。Border StyleはMiterを選び、StyleのColorを白、Alphaを1.0にします。
5. Lengthを1.0にして、中央が透明な閉じた六角形の輪郭を確認します。
6. Lengthを0.75程度に下げ、輪郭に切れ目ができるか確認します。

Width、Height、Border Widthと画面上の画素数との対応はこのレシピでは測定していません。見え方に合わせて線幅を調整してください。

### 2. PositionとLengthの役割を比較する

まずキーフレームを付けずに操作します。変更前後を同じViewer倍率で比べ、他の値は固定してください。

| 変更する設定 | 比較する値の例 | 観察する点 |
| --- | --- | --- |
| Length | 0.75 → 0.50 | 輪郭の欠ける範囲 |
| Position | 0.0 → 0.25 → 0.50（Length 0.75に固定） | 切れ目の位置と角の位置 |
| Angle | 0 → 20（PositionとLength固定） | 六角形自体の向き |

PositionとAngleは、どちらも動きのある輪郭を作れますが役割が異なります。Positionは輪郭の開始位置を変え、Angleは図形全体を回転させます。切れ目だけを動かしたい場合は、Angleを元の値へ戻してください。

### 3. 切れ目をアニメーションさせる

1. Lengthを0.75、Angleを0、Positionを0.0に戻します。
2. フレーム0でPositionのキーフレームを有効にします。
3. フレーム48でPositionを0.5に変更し、キーフレームを記録します。
4. フレーム0、24、48を順に表示し、六角形の角の位置と輪郭の欠ける位置を見比べます。

Positionの値と実際の移動距離、輪郭を一周するための値、折り返し時の挙動は未検証です。ここでは0.0〜0.5を比較範囲とし、無条件にシームレスループになるとは考えません。必要なら実機で開始位置と終了位置が一致する条件を調べてからループを組みます。

### 4. 線の端と角を調整する

切れ目が見えているフレームでCap StyleをFlat、Rounded、Squaredに切り替えます。Flatは平らな端、Roundedは半円状の端、Squaredは線幅の半分だけ端が伸びる形です。

一方、Border Styleは輪郭が角で接続する形を指定します。Miter、Round、Bevelを比較するときはCap Styleを固定します。Lengthを1.0にすると端が見えなくなるため、Cap Styleの差は開いた輪郭で確認します。

## 期待する結果

フレーム0、24、48で六角形の向きや大きさは変わらず、欠けている位置が移ることを期待します。長さを固定しているため、輪郭が少しずつ完成する演出にはなりません。

線端の見え方はCap Styleや線幅によって変わります。表示される画素数まで常に同一になるとは限りません。上記はManualの各Controlの役割から組み立てた期待結果であり、今回の実機描画の観測ではありません。

## この構成で動く理由

sNGonは図形の輪郭、表示する範囲、回転をそれぞれ調整できます。LengthとPositionを組み合わせると輪郭の一部分だけを表示し、その位置を変更できます。Angleを固定することで、図形自体を回さずに切れ目の動きを作る構成になります。

Shapeの段階で輪郭を編集し、最後にsRenderで2D Imageへ変換します。[Shapeの基礎](../../learn/02-data/shape)と[必要な場所で画像化するパターン](../../patterns/data-domain/defer-domain-conversion)を参照してください。

## バリエーション

- 辺数を8に変えると、角の数が異なる枠で同じ操作を試せます。
- 切れ目を移動させるのではなく輪郭を伸ばしたい場合はLengthをアニメーションさせます。[角丸枠を描き進める例](./animate-rounded-rectangle-outline-with-length)と比較できます。
- 図形自体の回転が必要な場合はAngleやsTransformを使う構成を選びます。[自転と公転の例](./animate-star-spin-and-orbit-with-stransform)では、図形を変形する操作を扱います。
- 円形の枠が必要なら[sEllipseで円の輪郭を作る](../shapes/outline-circle-with-sellipse)を参照してください。

## うまくいかないとき

| 症状 | 最初に確認すること |
| --- | --- |
| PositionやLengthが見当たらない | Solidをオフにしたか |
| 切れ目が見えない | Lengthが1.0未満か |
| 枠の角まで動く | Angleや図形の位置にキーフレームが付いていないか |
| 切れ目が動かない | Positionのフレーム0と48に異なる値が記録されているか |
| 線端の形が変わらない | Lengthが1.0の閉じた輪郭になっていないか |
| 何も表示されない | Border Width、Alpha、sRenderへの接続とViewer表示を確認する |

## 関連資料

- [sNGon](../../nodes/shapes/sngon)
- [sRender](../../nodes/shapes/s-render)
- [Shapeの基礎](../../learn/02-data/shape)
- [必要な場所で画像化するパターン](../../patterns/data-domain/defer-domain-conversion)

## 出典と検証範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 117「Shape Nodes」pp.2747–2750（sNGonの入出力、Solid、Border Width、Border Style、Cap Style、Position、Length、Angle、Style）、pp.2759–2760（sRender）。Libraryに保存された公式Manualの該当ページ本文を直接照合しました。[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。

ManualではWidth/Height節に別の図形を指すと思われる表記があるため、ここでは縦横の大きさの設定としてのみ扱います。既存の[sNGon実機資料](../../nodes/shapes/sngon)は21.1 Studioで六角形と八角形の生成を比較したものであり、今回のPositionアニメーションの成功を証明するものではありません。

未検証：今回のSolid OFFでの描画、Positionのキーフレーム操作と補間、切れ目の移動距離・周回境界、線端の比較、画素数・Alpha、Free/StudioおよびOS/GPU差。したがって verification: partial を維持します。
