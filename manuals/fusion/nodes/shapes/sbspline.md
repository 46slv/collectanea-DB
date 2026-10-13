---
title: "sBSpline"
description: "制御点から滑らかな自由形状を生成。点の編集、主要設定、描画アニメーションを解説。"
doc_type: node
term_id: "sbspline"
term_short: "少数の制御点で滑らかな輪郭を生成するShapeノード。"
verification: partial
aliases: ["sBSpline"]
concepts: ["shape-data", "vector-shape", "rasterization"]
nodes: ["sBSpline"]
node_family: "shapes"
outputs: ["shape"]
controls: ["Solid", "Border Width", "Border Style", "Cap Style", "Position", "Length", "X Offset", "Y Offset", "Size", "Color", "Allow Combining"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-11"
---
# sBSpline

sBSplineは、Viewer上に制御点を置き、滑らかな輪郭の図形を生成する<Term id="shape-data">Shape</Term>ノードです。制御点が曲線を引っ張るように形を決めるため、雲や液体のような丸みのある図形を、少ない点で描きたいときに向きます。

Shapeは画素に変換される前の図形データです。映像に重ねるには後段のsRenderで2D Imageへ変換します。詳しくは[シェイプ（Shape）](../../learn/02-data/shape)を参照してください。

## 入力と出力

**外部入力はありません。** sBSpline自身が輪郭を生成します。旧メタデータのShape入力という分類は修正します。21.1 Manualでは、sBSplineは曲線方式を除いてsPolygonと同等とされ、sPolygonは入力を持たないGeneratorと明記されています。

**出力はShape**です。ほかのShapeノードで加工するか、[sRender](./s-render)で画像にします。

~~~text
sBSpline → sRender → Merge（映像へ重ねる）
sBSpline → sDuplicate → sRender → Merge（複製して重ねる）
~~~

通常のMergeは2D Imageの合成ノードです。Shapeを直接つなぐのではなく、sRenderで画像にします。

## 制御点を置いて描く

ノードを追加した直後、Viewerには中心（Center）の操作点だけが表示されます。Viewerをクリックすると制御点が増え、各点の位置に引っ張られるように滑らかな曲線ができます。

**B-Splineの曲線は、通常、制御点そのものを通りません。** 目的の輪郭へ点を厳密に置くより、表示結果を見ながら動かして調整します。最初は少数の点で形を作り、細部に必要な点だけ追加すると扱いやすくなります。

### Viewerの編集ツール

21.1 Manualは、PolygonとB-Splineに共通するツールバーとして次の操作を説明しています。

- **Click**：Viewerをクリックして点を追加します。
- **Draw**：曲線を手描きします。開いた線の終端から続きを描くこともできます。
- **Insert and Modify**：線上へ点を挿入し、既存の点を編集します。
- **Modify Only**：誤って点を増やさず、既存の点を調整します。
- **Close**：開いた線を閉じます。
- **Done**：点の追加・移動を防ぎます。図形全体の移動・回転はできます。

ほかに点の一括選択・削除、Reduce Points（点の数を減らす）、Shape Box（複数点をまとめて変形）もあります。編集対象の点が多くなったときに使います。

## 主な設定

21.1 ManualではsBSplineとsPolygonの違いを曲線方式のみとしています。以下は同ManualのsPolygonのInspector説明（pp.2753–2755）も参照した共通設定です。

### Solid / Border Width：塗りと輪郭

**Solid**を有効にすると、Styleタブで選んだ色で図形内部を塗ります。無効なら内部が透明になり、**Border Width**で指定した太さの輪郭を描きます。

背景の丸い図形を作るならSolidを有効に、線で描きたいなら無効にしてBorder Widthを調整します。

### Border Style / Cap Style：角と線端

**Border Style**では角をBevel（切り落とす）、Round（丸める）、Miter（尖らせる）から選びます。**Cap Style**では開いた線の端をFlat（平ら）、Rounded（半円）、Squared（線幅の半分だけ延ばす）から選びます。

閉じた輪郭では線端が見えません。Cap Styleを確認したい場合は輪郭を開くか、次のLengthを下げます。

### Position / Length：線が伸びるアニメーション

Solidを無効にしたときに表示される輪郭用の項目です。

- **Length**：1.0なら輪郭全体がつながった状態で、値を下げると切れ目ができます。値をアニメーションさせると、線が順に描かれる表現になります。
- **Position**：輪郭の開始位置を移動し、Lengthと組み合わせて切れ目の位置を変えます。

制御点を移動して**形そのものを変える**動きと、Lengthで**線の表示範囲を変える**動きは分けて考えます。

### X / Y Offset、Size：全体の配置

**X Offset / Y Offset**は図形全体を移動します。Manualではフレーム幅を基準に正規化した座標と説明されており、ピクセル数ではありません。

**Size**は点同士の相対関係を変えず、図形全体を拡大縮小します。形状アニメーションのキーフレームを追加せず大きさを調整する設定です。

### Style：Color / Allow Combining

**Color**は塗りと線の色、Alpha（透明度）を指定します。**Allow Combining**は複製した半透明のShape同士が重なる際のAlphaに関係します。有効なら元のAlphaを維持し、無効なら重なる領域のAlphaが累積すると説明されています。

## 形状アニメーション

sBSplineはsPolygonと同様に**形状の自動キーフレーム化**に対応します。ノードを追加したフレームにキーフレームが入り、別のフレームで点を編集すると新しいキーフレームが作られ、間の形が補間されます。

例えば最初は丸い図形を描き、20フレーム後に右側の点だけ動かして横長にすれば、形が伸びる動きになります。図形全体を動かしたいだけなら、点ではなくOffsetや[sTransform](./stransform)を調整すると、形の編集と配置を分離できます。

## 具体的な運用例

### 丸い不定形を並べた背景

sBSplineで丸みのある形を描き、Solidを有効にして色を決めます。そのShapeを[sDuplicate](./sduplicate)へ渡し、位置や大きさを変えながら複製します。最後にsRenderで画像化し、必要なら実写映像にMergeで重ねます。

~~~text
sBSpline（輪郭と色） → sDuplicate（複製・配置） → sRender → Merge
~~~

元のsBSplineの点を動かせば、複製した全要素の輪郭を一度に変更できます。

### 線が描かれる発光演出

開いた曲線を描き、Solidを無効にします。Border WidthとCap Styleで線を整え、Lengthを短い値から長い値へアニメーションさせます。sRenderでImageに変換した後にGlowを加えると、発光する線を映像に重ねられます。

~~~text
sBSpline（線・Length） → sRender → Glow → Merge
~~~

Glowは2D Imageを処理するため、ShapeのままではなくsRenderの後段へ接続します。

### ゆっくり変形する模様

時間を変えて制御点を移動し、丸い図形が伸び縮みする動きを作ります。複数を行列状に並べたい場合は[sGrid](./sgrid)へ接続してからsRenderへ送ります。Manualの形状補間とShape接続を組み合わせた制作例であり、実際のレンダリング結果までは検証していません。

## sPolygonとの違い・注意点

- [sPolygon](./spolygon)はBézier曲線を使い、ハンドルで局所的な曲率を細かく調整できます。
- **sBSpline**は制御点が周辺の曲線へ影響するため、少ない点で滑らかな輪郭を作りやすい一方、点の位置を線が必ず通るわけではありません。
- [sMerge](./smerge)は複数のShapeをまとめ、[sBoolean](./sboolean)は重なりを論理演算し、[sRender](./s-render)はShapeを2D Imageへ変換します。

全体の選び分けは[Shapeノード一覧](./)を参照してください。

## バージョンと出典

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、**pp.2732–2733（sBSpline）およびpp.2752–2756（sPolygonと共通の操作・設定）**を参照しました。

点の働き、自動アニメーション、外部入力なし、主な設定はManualに基づきます。端子の表示名・色、内部REGID、各設定の初期値・範囲、Edition差、実機のレンダリング結果は未確認です。verificationはpartialのままとします。
