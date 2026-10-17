---
title: "sPolygon"
description: "Viewerの制御点とBézierハンドルで自由なShapeを作る。描画操作と21.1のInspector設定を解説。"
doc_type: node
term_id: "spolygon"
term_short: "制御点とBézierハンドルで自由な輪郭を作るShape Generator。"
verification: partial
aliases: ["sPolygon"]
concepts: ["shape-data", "vector-shape", "rasterization"]
nodes: ["sPolygon"]
node_family: "shapes"
outputs: ["shape"]
controls: ["Solid", "Border Width", "Border Style", "Cap Style", "Position", "Length", "X Offset", "Y Offset", "Z Offset", "Size", "X Rotation", "Y Rotation", "Z Rotation", "Fill Method", "Color", "Allow Combining"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-11"
---

# sPolygon

sPolygonは、Viewerに点を置いて自由な輪郭を描く<Term id="shape-data">Shape</Term>生成ノードです。直線だけでなく、点の前後へ伸びる**Bézierハンドル**で曲線の向きや丸みを調整できます。ロゴの輪郭、不規則な図形、手描き風の線など、円や四角のプリセットでは作りにくい形に向きます。

Shapeは、まだ画素に変換していない図形データです。映像へ合成するには[sRender](./s-render)で通常の2D Imageへ変換します。基本概念は[シェイプ（Shape）](../../learn/02-data/shape)を参照してください。

## 入力と出力

**外部入力はありません。** sPolygonは入力画像や既存Shapeを加工するのではなく、指定した輪郭から新しいShapeを生成します。旧記事の「入力: shape」は21.1 Manualの記載と一致しないため訂正しました。

出力は**Shape**です。Shape系ノードで複製・変形したり、sRenderで画像化したりできます。

~~~text
sPolygon → sRender → Merge（映像に重ねる）
sPolygon → sDuplicate → sRender → Merge（複製してから重ねる）
~~~

通常のMergeやGlowは2D Imageを扱います。Shapeのまま増やしたい場合は[sDuplicate](./sduplicate)や[sGrid](./sgrid)、複数のShapeをまとめる場合は[sMerge](./smerge)をsRenderの前へ置きます。

## Viewerで輪郭を描く

sPolygonをNode Editorへ追加した直後は、輪郭を構成する点がまだありません。Viewerをクリックすると制御点が追加され、順に線で結ばれます。

1. **Click**モードでViewerを順にクリックし、輪郭を描きます。角だけで構成すれば折れ線や多角形になります。
2. 曲線にしたい点は**Smooth**へ切り替え、Bézierハンドルを動かして曲線の向きを調整します。角を作りたい点は**Linear**に戻します。
3. 図形を閉じる場合は、最初の点をもう一度クリックするか、ツールバーの**Close**を使います。
4. 閉じると**Insert and Modify**モードになり、線上へ新しい点を挿入したり、点を移動したりできます。点の追加を避けて編集だけしたい場合は**Modify Only**にします。
5. 編集後は**Done**に切り替えると、点の追加・移動を防げます。図形全体の移動・回転は引き続き可能です。

開いた線のままでも使用できます。輪郭線を描くアニメーションや、始点と終点をつながない軌跡なら、無理にCloseする必要はありません。

### ツールバーの補助操作

**Draw**は自由に線を描くモードです。開いている線の終端から描き足すこともできます。点が増えすぎたら**Reduce Points**で数を減らすと、その後の編集が楽になります。

**Show All Handles**はBézierハンドル、**Show Key Points**は制御点の表示を切り替えます。**Select All**は全点選択、**Delete Points**は選択点の削除、**Shape Box**は選択した点群を囲んでまとめて変形する操作です。

## Inspectorの主な設定

### Solid / Border Width：塗りと線

**Solid**を有効にすると、Styleタブで指定した色で図形の内部を塗ります。無効にすると内部は透明になり、**Border Width**で指定した太さの輪郭を描きます。Border WidthはSolidが有効なときにも調整できますが、特に線だけを描くときに重要です。

ベタ塗りの背景図形ならSolidを有効に、発光させたい輪郭線なら無効にする、と使い分けます。

### Border Style / Cap Style：角と線端

**Border Style**は線が曲がる角のつなぎ方です。Bevelは角を切り落とし、Roundは丸め、Miterは尖った角を保ちます。

**Cap Style**は線の両端の形です。Flatは平らな端、Roundedは半円状の端、Squaredは線幅の半分だけ伸びる端を作ります。線が閉じていると端が見えないため、違いを確認する場合は開いた線を使うか、次のLengthを1.0未満にします。

### Position / Length：描画範囲と開始位置

**Solidが無効なときだけ表示される**輪郭用の設定です。

- **Length**：1.0なら輪郭全体がつながり、1.0未満では一部が開きます。短い値から1.0へアニメーションすると、線を順に描く表現になります。
- **Position**：輪郭の開始位置をずらします。Lengthと併用すると、線の切れ目の位置を調整できます。

制御点を移動して図形そのものを変形する操作と、Lengthを変えて線の表示範囲を伸ばす操作は区別します。

### X / Y Offset、Size：図形全体の位置と大きさ

**X Offset / Y Offset**は図形を移動します。Manualでは、座標はフレームの**幅を基準に正規化**され、X Offsetが0.0なら中央、0.5なら図形の中心がフレーム右端へ移る例が示されています。ピクセル数をそのまま指定する欄ではありません。

**Size**は制御点同士の相対関係を変えずに図形全体を拡大縮小します。Manualによると、Sizeの調整だけでは形状アニメーションのキーフレームを追加しません。

### Z Offset、Rotation、Fill Method

**Z Offset [3D]**は奥行き方向への移動、**X/Y/Z Rotation**は各軸まわりの回転です。

**Fill Method [3D]**は自己交差した輪郭の塗り判定に関係し、AlternateとNon Zero Windingから選びます。交差部分に意図しない穴が出る場合は切り替えて確認します。これらはManualで3Dに関係する設定を含み、通常の2D合成で常に必要な項目ではありません。

### Style：Color / Allow Combining

**Color**で塗りや輪郭のRGBAを設定します。Alphaを小さくすると半透明になります。

**Allow Combining**は、[sGrid](./sgrid)や[sDuplicate](./sduplicate)で同じ半透明Shapeを重ねたときのAlphaの扱いを決めます。ManualのAlpha 0.5の例では、有効なら重なる部分も0.5のまま、無効なら重なった部分のAlphaが累積します。半透明のパターンが重なって濃く見えるときは、この設定を確認します。

## 形状のアニメーション

sPolygonは**形状の自動キーフレーム化**に対応します。ManualのsBSpline節は、sPolygonと同様に、ノード追加時のフレームにキーフレームが入り、別のフレームで制御点を編集すると形状の動きを作れると説明しています。

たとえば最初に四角に近い輪郭を作り、数十フレーム後に角の点を動かせば、輪郭が変形する動きになります。図形全体の位置だけ変えたい場合はOffsetや[sTransform](./stransform)を使うと、点の編集と配置を分けて管理できます。

## 具体的な運用例

### テロップの背後に斜めの帯を敷く

Viewerで四隅に点を置き、斜めに傾いた閉じた四角形を作ります。Solidを有効にして色を決め、sRenderで画像化します。MediaInの映像を通常のMergeのBackground、sRenderの出力をForegroundにつなぎ、映像の上に帯を重ねます。

~~~text
sPolygon（輪郭・色） → sRender → Merge → MediaOut
                                 ↑
                            MediaIn（映像）
~~~

形を変えたいときはsPolygonの制御点、帯全体を動かしたいときはOffsetやsTransformを調整します。

### 発光しながら描かれる線

開いた線を描き、Solidを無効にします。Border Widthで太さ、Cap Styleで端の形を設定したら、Lengthを短い値から1.0へキーフレームで変化させます。

~~~text
sPolygon（線・Length） → sRender → Glow → Merge
~~~

sRenderの後にGlowを置くと、線が伸びる発光表現を映像へ重ねられます。GlowはImageを処理するので、Shapeの状態では接続しません。

### 不規則な図形を繰り返した背景

sPolygonでひとつの不規則な図形を作り、SolidとColorを設定します。出力をsGridへ渡して並べ、sRenderで画像化します。元の点を動かすとすべての複製へ形の変化が反映されます。半透明の図形同士を重ねる場合はAllow Combiningを切り替え、重複部分の濃さを比べます。

## 関連ノードと注意点

- [sBSpline](./sbspline)は、Bézierハンドルを使わず、制御点の影響でなだらかな曲線を作ります。局所的な曲率を細かく合わせるならsPolygon、少数の点で滑らかな輪郭を作るならsBSplineが候補です。
- [sNGon](./sngon)は規則的な多角形、[sRectangle](./srectangle)は四角形を生成します。頂点を自由に動かす必要がなければ、専用の生成ノードの方が簡単です。
- [sBoolean](./sboolean)は複数Shapeの重なりを演算し、[sMerge](./smerge)はShapeをまとめます。sPolygon自体はほかのShapeを受け取るノードではありません。
- 通常のPolygon Maskは処理範囲を指定する**Mask**、sPolygonは図形を作る**Shape**です。見た目が似ても用途と接続先は異なります。

[Shapeノード一覧](./index.md)では、各ノードの選び分けを整理しています。

## バージョンと出典

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、**pp.2752–2756（sPolygonの入力・Inspector・Viewer操作）**、**pp.2732–2733（sPolygonとの比較と形状アニメーション）**を参照しました。

外部入力なし、Shape出力、主要Inspector項目とViewer操作はManualに基づきます。内部REGID、端子の厳密な表示・色、各Controlの初期値・範囲、Edition差、実機レンダリング結果は未確認のため、verificationはpartialのままとします。
