---
title: "sPolygon"
description: "制御点とBézierハンドルで直線・曲線を組み合わせ、自由な輪郭をShapeとして描く生成Node。"
doc_type: node
term_id: "spolygon"
term_short: "sPolygonは、制御点とハンドルを使って自由な輪郭を描くShape生成Node。"
verification: partial
aliases: ["sPolygon", "sPly"]
concepts: ["shape-data", "rasterization"]
nodes: ["sPolygon"]
node_family: "shapes"
outputs: ["shape"]
controls: ["Solid", "Border Width", "Border Style", "Cap Style", "Position", "Length", "X Offset", "Y Offset", "Z Offset", "Size", "X Rotation", "Y Rotation", "Z Rotation", "Fill Method", "Color", "Allow Combining"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---

# sPolygon

sPolygonは、Viewerに点を置き、その点を結ぶ直線や曲線から**自由な図形の輪郭を描く**Nodeです。角のあるロゴ、曲線を含む飾り枠、線が伸びて現れるアニメーションなど、円や四角形だけでは作れない形に使います。

sPolygonで作るのは、まだピクセル画像になっていない<Term id="shape-data">Shape</Term>です。点と輪郭を後段でも加工でき、[sRender](./s-render)を通したときに通常の2D Imageとして描画されます。Shapeそのものの意味は[シェイプ（Shape）](../../learn/02-data/shape)を参照してください。

## 入力と出力

**外部入力はありません。** sPolygonは既存のShapeを加工するのではなく、自分で輪郭を生成します。出力は**Shapeデータ**であり、通常のMergeやGlowへ直接つなぐ画像出力ではありません。

    sPolygon → sRender → Merge
       Shape       Image

複製したい場合は、画像化する前にShape系Nodeを挟みます。

    sPolygon → sDuplicate → sRender → Merge

この例では、描いた形をsDuplicateで複数に増やしてから、sRenderでひとつの画像として描画します。sPolygonの出力をsGridにつなげば、同じ図形を行と列に並べる構成にもできます。

## 図形の描き方

1. sPolygonを追加し、sRenderにつなぎます。sRenderの結果をViewerに表示して、線や塗りの見え方を確認します。
2. sPolygonを選択し、Viewer上で点を順にクリックします。点を追加するたびに、その点同士がつながって輪郭になります。
3. 閉じた面を作る場合は、最後に**最初の点をもう一度クリック**して輪郭を閉じます。PolylineツールバーのCloseでも開いた輪郭を閉じられます。
4. 点を動かして外形を調整します。曲線にしたい箇所はSmooth、角を保ちたい箇所はLinearを使い、必要に応じてBézierハンドルを調整します。
5. 塗りつぶすならSolidを有効に、輪郭線だけにするならSolidを無効にし、Border WidthとColorを調整します。

**点は形の変化を指定するための場所**です。曲線部分では、点の位置に加えてハンドルの方向や長さも輪郭に影響します。点を大量に増やす前に、少ない点で曲がり方を調整すると修正しやすくなります。

## Viewerの編集モード

21.1 Manualでは、PolygonとB-Splineに共通のPolylineツールバーが説明されています。

| 操作 | 何が起こるか |
| --- | --- |
| Click | クリックした位置へ制御点を追加し、輪郭を伸ばす |
| Draw | ペンでなぞるように線を描き、点を作る |
| Insert and Modify | 既存の輪郭へ点を挿入し、位置や形を調整する |
| Modify Only | 新しい点を作らず、既存の点と曲線を調整する |
| Done | 点の追加や移動を防ぎ、輪郭の誤編集を減らす |
| Close | 開いた輪郭の始点と終点をつなぐ |
| Smooth / Linear | 選択点を滑らかな曲線用／直線的な角用に切り替える |
| Show All Handles | Bézierハンドルの表示・非表示を切り替える |
| Shape Box | 複数点や図形全体をまとめて変形する枠を表示する |

輪郭を整えるときに意図せず点が増えるなら、**Modify Only**へ切り替えます。手描きの点が多すぎる場合は、Manualに記載されたReduce Pointsも利用できます。

## 主なInspector設定

### Solid / Border Width：塗りと輪郭

**Solid**を有効にすると、閉じた図形の内側をStyleタブの色で塗ります。無効にすると内側は透明になり、**Border Width**で指定した太さの輪郭線を表示します。

Border Widthは塗りの状態でも使えますが、輪郭線だけを作るときに違いが分かりやすい設定です。

### Border Style / Cap Style：角と線の端

**Border Style**は、輪郭が折れ曲がる角のつなぎ方です。Bevelは角を切り落とし、Roundは丸くつなぎ、Miterは尖った角を保ちます。

**Cap Style**は線の両端の形を決めます。Flatは平らな端、Roundedは半円状の端、Squaredは線幅の半分ほど先へ伸びる四角い端です。Capの違いは**Lengthが1.0未満で、線に切れ目があるとき**に確認できます。

### Position / Length：輪郭を部分的に表示する

この2つは**Solidが無効のとき**に表示される設定です。

- **Length**は輪郭の表示範囲を決めます。1.0より小さくすると、表示されない区間が生まれます。
- **Position**は表示区間の開始位置を移動します。Lengthと組み合わせると、切れ目を輪郭に沿って動かせます。

Lengthを時間とともに増やせば、線が順番に描かれていく**Write-on風のアニメーション**になります。これは輪郭の表示範囲を変える操作であり、制御点の数を増やす操作ではありません。

### X / Y Offset・Size・Rotation：形を保ったまま動かす

**X / Y Offset**は図形全体の位置を変えます。Manualでは正規化された座標として説明され、X Offsetが0.0で中央、0.5で図形の中心がフレーム右端に来る例が示されています。

**Size**は図形全体の大きさを変えます。点同士の相対的な配置を変更したり、輪郭の点アニメーションに新しいキーフレームを作ったりせずに拡大・縮小できます。

**X / Y / Z Rotation**は各軸方向の回転です。輪郭の細部を直すときは点を編集し、完成した形を移動・回転するときはこれらの設定を使い分けます。

**Z Offset**と**Fill Method**は3Dの利用に関係する設定です。Fill MethodにはAlternateとNon Zero Windingがあり、輪郭が自分自身と重なって意図しない穴が出た場合に方式を切り替えます。2Dの基本制作では先に輪郭・塗り・位置を整えれば十分です。

### Style：Color / Allow Combining

**Color**は塗り・輪郭の色を決めます。RGBAで各色成分とAlpha（透明度）を設定できます。

**Allow Combining**は、sDuplicateやsGridで増やした図形が**同じ場所に重なるときのAlpha**に関係します。有効なら設定したAlpha値を保ち、無効なら重なった部分のAlphaが累積して濃くなることがあります。たとえば半透明の図形を多数重ねる場合に、重なりを濃くしたいのか、元の透明度を保ちたいのかで選びます。

## 運用例1：直線と曲線を混ぜたロゴ

1. sPolygonで外形のおおまかな点を置き、最初の点をクリックして閉じます。
2. 鋭い角を残す点はLinearに、丸く曲げたい点はSmoothにして輪郭を調整します。
3. Solidを有効にしてColorを設定し、sRenderで形を表示します。
4. 図形のサイズや配置はSize・X / Y Offsetで調整します。完成した形を繰り返し使うなら[sDuplicate](./sduplicate)をsRenderの前に追加します。

    sPolygon → sRender → Merge

点の配置と図形全体のTransformを分けておくと、ロゴの輪郭を保ったまま別の位置へ動かせます。

## 運用例2：線を描きながら表示する

1. sPolygonで線の経路を描きます。
2. Solidを無効にし、Border Widthで線を見える太さにします。
3. 開始フレームでLengthを小さく、終了フレームで1.0にするキーフレームを設定します。
4. 必要ならPositionで開始位置をずらし、Cap Styleで線の端を調整します。
5. sRenderで画像化し、Mergeで背景映像へ重ねます。

この方法は、あらかじめ描いた経路の**見せる長さ**を変えるものです。線の通る場所そのものを動かしたい場合は、Viewerの制御点の編集や別のTransformを使います。

## 似たNodeとの使い分け

- [sBSpline](./sbspline) — 少ない制御点から滑らかな曲線を作る。曲線は必ずしも点を通らず、Bézierハンドルを個別に操作する必要がありません。
- [sNGon](./sngon) — 規則的な多角形を作る。頂点を1つずつ配置する必要がなければ、こちらが簡単です。
- [sGrid](./sgrid) / [sDuplicate](./sduplicate) — 描いた輪郭を繰り返し配置する。
- [sTransform](./stransform) — sPolygonの後段で位置・大きさ・回転を追加して制御する。
- [sRender](./s-render) — Shapeを通常の2D Imageへ変換する。

## 表示・編集時の確認ポイント

- Viewerに何も見えない場合は、**点を置いて輪郭を作っているか**、sRenderへ接続しているか、ViewerでsRenderを表示しているか確認します。
- 塗りが出ない場合は、輪郭が閉じているかとSolidの状態を確認します。輪郭線だけの場合はBorder Widthも確認します。
- 点を動かそうとして新しい点が増える場合は、PolylineモードをModify Onlyへ切り替えます。
- 線端が変わらない場合は、Solidを無効にし、Lengthを1.0未満にして切れ目を作ります。
- 通常のMergeへ直接接続できない場合は、ShapeとImageのデータ形式が違います。sRenderを挟んでください。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、pp.2752–2756で、sPolygonの入力なしの生成Nodeという扱い、sRenderへの出力、Polylineツールバー、Controls・Style各項目を確認しました。

本文はManualの記載をもとに独自に整理したものです。現在の実機でのInspector表示、内部REGID、Free / Studioでの差、全既定値と操作時の細かな挙動は未検証のため、`verification: partial`を維持します。
