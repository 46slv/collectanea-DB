---
title: "sEllipse"
description: "円・楕円のShapeを生成し、塗り・線幅・円弧・配置・重なり方を調整するノード。"
doc_type: node
term_id: "s-ellipse"
term_short: "円や楕円のShapeを作り、輪郭を途中まで表示するアニメーションにも使えるGenerator。"
verification: partial
aliases: ["sEllipse", "Shape Ellipse"]
concepts: ["shape-data", "vector-shape", "rasterization"]
nodes: ["sEllipse"]
node_family: "shapes"
outputs: ["shape"]
controls: ["Solid", "Border Width", "Cap Style", "Position", "Length", "X Offset", "Y Offset", "Width", "Height", "Angle", "Color", "Allow Combining"]
tasks: ["build-shape", "ellipse", "procedural-graphics"]
level: intermediate
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-12"
---

# sEllipse

**sEllipse**は、円や楕円を作る<Term id="shape-data">Shape</Term> Generatorです。塗りつぶした円、輪郭だけの楕円、途中が開いた円弧を作れます。輪郭の長さをアニメーションすれば、リングが少しずつ描かれていく表現にも使えます。

ここでのShapeは、画像のピクセルではなく、形状や見た目を保持した図形データです。映像に重ねたりGlowなどの画像処理を加えたりするには、後段の[sRender](./s-render)で2D Imageへ変換します。Shapeの仕組みは[シェイプ（Shape）の基礎](../../learn/02-data/shape)を参照してください。

## 入力と出力

**外部入力はありません。** sEllipse自身が図形を生成するため、MediaInや別のShapeを受け取って加工するノードではありません。

**出力はShapeです。** この出力を[sGrid](./sgrid)や[sDuplicate](./sduplicate)へ送って円を並べたり、[sTransform](./stransform)で変形したりできます。通常のMergeやGlowへ使う時点でsRenderを挟みます。

~~~text
sEllipse → sRender → Merge（映像に重ねる）
sEllipse → sGrid → sRender → Merge（円を格子状に並べる）
sEllipse → sDuplicate → sRender → Merge（コピーごとに変化を付ける）
~~~

sRenderより前で扱うのはShape、後ろで扱うのは2D Imageです。通常のEllipse Maskとは接続先とデータの種類が異なります。

## Inspectorの主な設定

### Solid / Border Width：塗りと輪郭

`Solid`を有効にすると、Styleタブで指定した色で楕円の内部を塗ります。無効にすると内部は透明になり、`Border Width`で指定した輪郭だけが残ります。

`Border Width`は境界の幅を広げたり狭めたりする設定です。Solidが有効なときにも作用しますが、線だけのリングを作る場合は**Solidを無効にしてから**太さを調整します。Alphaを0にして内部だけを消そうとする操作とは異なります。

### Cap Style：開いた輪郭の端

`Solid`を無効にすると、`Cap Style`から線端の形を選べます。

- **Flat**：輪郭の端が平らに切れます。
- **Rounded**：輪郭の端が半円状に丸くなります。
- **Squared**：輪郭の端が線幅の半分だけ先まで伸びます。

`Length`が1.0で輪郭が閉じていると端がないため、Cap Styleの違いは見えません。端の形を比べるときは、Lengthを1.0未満にして円弧を開きます。

### Position / Length：円弧の開始位置と表示範囲

この2項目も**Solidが無効な場合だけ**表示されます。

`Length`は、輪郭をどれだけ表示するかを決めます。1.0なら閉じた楕円の輪郭となり、1.0未満では途中が開きます。短い値から1.0へキーフレームで変化させると、線が伸びて一周するような描画アニメーションになります。

`Position`は輪郭の開始位置を調整します。Lengthが1.0未満の状態で動かすと、切れ目の場所が移ります。**円弧そのものを回転させたい場合のAngleとは役割が異なります。** Lengthで線の長さを決め、Positionでどこから描き始めるかを調整する、と分けると扱いやすくなります。

### X / Y Offset：画面内での位置

`X Offset`と`Y Offset`は楕円を左右・上下へ移動します。Manualでは、中心を基準にした座標が**フレーム幅で正規化**されると説明されています。たとえば`X Offset = 0.0`は中央、`0.5`は楕円の中心がフレーム右端に来る位置です。値はピクセル数ではありません。

画面の縦方向も含めて座標を考える場合は、[正規化座標](../../learn/03-space/normalized-coordinates)を参照してください。

### Width / Height / Angle：大きさと回転

`Width`と`Height`で楕円の横幅と縦幅を調整します。同じ値なら円、異なる値なら楕円です。`Angle`は図形の中心を軸に回転します。

塗りつぶした真円を回しても見た目はほとんど変わりません。一方、横長の楕円やLengthを短くした円弧なら、Angleを変えたときに向きの変化を確認できます。AngleとPositionを混同しないようにしてください。

### Styleタブ：Color / Allow Combining

`Color`で塗りまたは輪郭の色とAlpha（透明度）を決めます。色スウォッチ、スポイト、RGBAのスライダー・数値欄を利用できます。Solidを無効にして輪郭だけを残した場合も、輪郭の色はここで設定します。

`Allow Combining`は、sGridやsDuplicateで半透明の円が重なった場合のAlphaの扱いに関係します。21.1 Manualの例では、**Alphaが0.5の円**を重ねるとき、有効なら重なっても0.5を維持し、無効なら重なった部分のAlphaが累積します。円を多数複製した背景では、重複部分を均一な濃さにしたいか、重なるほど濃くしたいかで比較します。

## 具体的な使い方

### 1. 輪郭が描かれる円形HUDを作る

sEllipseを追加し、`Solid`を無効にします。`Width`と`Height`を同じ値にして円を作り、`Border Width`で線の太さを決めます。角のない線端にしたいなら`Cap Style = Rounded`にします。

開始フレームでは`Length`を小さくし、終了フレームで1.0へキーフレームを付けます。円をどの位置から描き始めるかは`Position`で調整します。表示結果を見るためにsRenderへ接続し、発光させたい場合はその後段にGlowを置きます。

~~~text
sEllipse（Solidオフ・Lengthをアニメーション）
  → sRender（Shapeを画像化）
  → Glow（画像の線に発光を追加）
  → Merge（映像と合成）
~~~

この構成では、円の形と描画範囲はsEllipse、発光はGlowが担当します。GlowをsEllipseとsRenderの間に入れる構成ではありません。

### 2. 円のドット背景を作る

sEllipseで小さな塗りつぶし円を1つ作り、`Solid`を有効にして色・大きさを調整します。出力をsGridへ接続し、行と列の個数、間隔を調整してからsRenderで画像にします。

~~~text
sEllipse（小さな円） → sGrid（縦横に配置）
                     → sRender → Merge
~~~

**sEllipseは1個の円の形と色、sGridはその円の配列、sRenderは画像化**を担当します。円の大きさを変えれば配列全体の見た目が変わります。半透明の円が重なる配置にしたときは、sEllipseの`Allow Combining`を切り替えると重なり方を比較できます。均等な格子ではなく、コピーが少しずつ移動・拡大する列を作りたい場合は[sDuplicate](./sduplicate)が候補です。

### 3. 楕円の動くアクセントを映像に重ねる

`Solid`を有効にし、`Width`と`Height`を異なる値にして横長の楕円を作ります。`Angle`で斜めに傾け、`X/Y Offset`で画面内の位置を決めます。`Color`で色とAlphaを設定してsRenderへつなぎ、MediaInの映像と通常のMergeで合成します。

~~~text
sEllipse → sRender ─────────→ Merge（Foreground）→ MediaOut
MediaIn（背景映像）─────────→ Merge（Background）
~~~

この例では円弧を開かないため`Length`は使いません。楕円の配置だけを変えるならOffsetやAngleをアニメーションし、図形の生成と追加の変形を分離したいなら後段に[sTransform](./stransform)を置きます。文字の背景装飾として使う場合は、Text+の画像を別のMergeで合成するか、Shape文字が必要なら[sText](./stext)を検討します。

これらは21.1 Manualで確認できる接続・Controlを組み合わせた運用例です。個々の完成画を21.1実機で検証した記録ではありません。

## 関連ノードと注意点

- [sRectangle](./srectangle)：四角形・角丸形状を作ります。真円や楕円を直接生成するならsEllipseです。
- [sNGon](./sngon)：規則的な多角形を作ります。角がある図形が必要ならこちらを使います。
- [sGrid](./sgrid) / [sDuplicate](./sduplicate)：円を繰り返します。規則的な行列はsGrid、コピーごとの変化はsDuplicateを使います。
- [sChangeStyle](./schangestyle)：生成したShapeの色・Alphaを後段で変更します。複数のShapeをまとめて見た目だけ変更したい場合に使えます。
- [sRender](./s-render)：Shapeを2D Imageに変換します。通常のMergeやGlowに渡すときに必要です。
- **Ellipse Mask**：画像処理の適用範囲を指定するマスクです。見た目が同じ円でも、sEllipseのShape出力とは用途と接続領域が異なります。

[Shapeノード一覧](./index.md)では、ほかのGeneratorやShape処理ノードとの関係を整理しています。

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、pp.2738–2741**を参照しました。外部入力なし、Shape出力とsGrid・sDuplicate・sRenderへの接続、Solid / Border Width / Cap Style / Position / Length / X/Y Offset / Width / Height / Angle / Color / Allow CombiningはManual本文で確認しています。

参照先：[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support)。

内部REGID、正確な端子表示名・色、Edition差、Inspectorの初期値・範囲、21.1実機での描画結果は確認していません。そのため`verification: partial`を維持しています。
