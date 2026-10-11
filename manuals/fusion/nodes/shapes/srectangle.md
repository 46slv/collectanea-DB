---
title: "sRectangle"
description: "四角形のShapeを作り、角丸・輪郭・描画アニメーションを調整するノード。"
doc_type: node
term_id: "srectangle"
term_short: "四角形を生成し、角丸や線の描き始め・描く長さを調整できるShape Generator。"
verification: partial
aliases: ["sRectangle"]
concepts: ["shape-data", "vector-shape", "rasterization"]
nodes: ["sRectangle"]
node_family: "shapes"
outputs: ["shape"]
controls: ["Solid", "Border Width", "Border Style", "Cap Style", "Position", "Length", "X Offset", "Y Offset", "Width", "Height", "Corner Radius", "Angle", "Color", "Allow Combining"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-11"
---

# sRectangle

sRectangleは、四角形を作る<Term id="shape-data">Shape</Term> Generatorです。単色の長方形や角丸の帯を作れるほか、塗りつぶしを外して輪郭だけを表示し、線が少しずつ伸びるアニメーションも作れます。

Shapeは画像のピクセルではなく、形・配置・色などを保持した図形データです。通常の映像へ合成するときは、[sRender](./s-render)で2D Imageに変換します。初めてShapeを扱う場合は[シェイプ（Shape）の基礎](../../learn/02-data/shape)も参照してください。

## 入力と出力

**外部入力はありません。** sRectangle自身が四角形を生成します。以前のカタログにはShape入力があると記載されていましたが、DaVinci Resolve 21.1 Reference Manualの「External Inputs」では入力なしと明記されています。

出力は**Shape**です。四角形をそのまま表示するならsRenderへ、複数の四角形を並べるなら[sGrid](./sgrid)や[sDuplicate](./sduplicate)へ渡します。これらの後段でも、sRenderまではShapeのまま処理されます。

```text
sRectangle → sRender → Merge → MediaOut
                           ↑
                       MediaIn（映像）

sRectangle → sGrid → sRender → Merge
```

ここでの`Merge`は通常の2D画像を合成するノードです。sRectangleのShape出力を直接つなぐのではなく、sRenderの画像出力をつなぎます。

## 主な設定

### Solid / Border Width：塗りと輪郭

`Solid`が有効なら四角形の内部をStyleタブで指定した色で塗ります。無効にすると内部が透明になり、`Border Width`で太さを決めた輪郭だけが残ります。

`Border Width`は塗りつぶし状態でも使える設定ですが、特に線だけの四角形を作るときに使います。枠線を作りたい場合、`Color`のAlphaを下げて内部を消すのではなく、まず`Solid`を無効にします。

### Border Style / Cap Style：角と線端

`Border Style`は輪郭の線が角でつながる形を指定します。

- **Bevel**：角を切り落とす。
- **Round**：角を丸くする。
- **Miter**：尖った角を残す。

`Cap Style`は`Solid`が無効のときに表示される、線の**端**の設定です。Flatは平らな端、Roundedは半円状の端、Squaredは線幅の半分だけ先へ伸ばした端になります。

閉じた四角形の輪郭には端がないため、Cap Styleを比較するなら次の`Length`を1.0未満にして線を途中で切ります。`Border Style`（角のつなぎ方）と`Cap Style`（開いた線の端の形）は別の設定です。

### Position / Length：輪郭の一部を描く

どちらも**Solidを無効にしたとき**に表示されます。

- `Length`：輪郭をどれだけ表示するかを決めます。1.0なら閉じた輪郭になり、それより小さければ輪郭に隙間ができます。キーフレームで値を変えると、線を描いていく表現になります。
- `Position`：輪郭の開始位置を動かします。`Length`と組み合わせると、開いている部分が輪郭のどこに現れるかを調整できます。

たとえば`Length`を開始フレームで小さい値に、終了フレームで1.0にすれば、四角形の枠が伸びて閉じるアニメーションになります。開始位置だけを変えたい場合は`Position`を調整します。

### X / Y Offset、Width / Height、Corner Radius、Angle

`X Offset`と`Y Offset`は四角形を画面内で移動します。ManualではOffsetの座標は**フレーム幅を基準に正規化**され、X Offsetが0.0なら中央、0.5なら四角形の中心がフレーム右端に来ると説明されています。ピクセル単位の指定ではありません。

`Width`と`Height`はそれぞれ図形の横幅・高さを決めます。同じ値なら正方形になり、異なる値なら長方形になります。`Angle`は図形の中心軸を基準に回転させます。

`Corner Radius`は角を丸める設定です。0.0で鋭い角、値を上げるほど丸みが増します。Manualでは正方形の値を1.0にすると円に、長方形なら両端が丸いカプセル形になる例が示されています。これは`Border Style`の角の接合処理とは異なり、**四角形そのものの角丸形状**を変えるものです。

### Styleタブ：Color / Allow Combining

`Color`で塗りまたは輪郭の色とAlpha（透明度）を指定します。色スウォッチ・スポイト・RGBAの数値入力を利用できます。`Solid`を無効にしている場合も輪郭の色をここで変更します。

`Allow Combining`は、後段のsGridやsDuplicateによって**半透明の四角形が重なるとき**のAlphaの扱いに関係します。21.1 ManualではAlphaを0.5にした図形を例に、有効なら重なった場所でもAlpha 0.5を維持し、無効なら重なり部分でAlphaが累積すると説明されています。

同じ薄さの図形を多数並べたい場合と、重なった部分だけ濃くしたい場合では、必要な設定が異なります。

## 具体的な使い方

### 角丸のテロップ背景を映像へ重ねる

sRectangleの`Width`と`Height`で文字に合わせた横長の帯を作り、`Corner Radius`で角を丸めます。`Solid`を有効にしてStyleの`Color`で色とAlphaを決め、`X/Y Offset`で画面下部などに配置します。

```text
sRectangle（角丸の帯） → sRender ──┐
                                 ├→ Merge → MediaOut
MediaIn（背景映像） ───────────────┘
```

この構成は背景の帯だけを作る例です。文字を同じ画面へ入れる場合は、Text+などで作った**画像の文字**を別のMergeで重ねる方法があります。Shapeの文字として構成したい場合は[sText](./stext)が候補になります。

### 四角形の枠を描いてから固定する

sRectangleで`Solid`を無効にし、`Border Width`で枠線の太さを設定します。`Length`を小さい値から1.0へアニメーションさせると、途中で開いていた輪郭が最後に閉じます。`Position`で描き始めの場所を変更できます。

```text
sRectangle（輪郭・Length） → sRender → Glow → Merge
```

`Glow`は2D Imageに対する効果なのでsRenderの後段に配置します。枠全体の位置や大きさも動かす場合は、sRectangleのOffset・Width・Heightをアニメーションさせるか、[sTransform](./stransform)を後段に追加します。

### 規則的な四角形パターンと半透明の重なり

sRectangleで小さな正方形を1個作り、sGridへつないで縦横に並べます。色はsRectangleのStyleタブ、個数と配置はsGridで調整し、最後にsRenderで画像化します。

四角形同士が重なる配置にする場合は、sRectangle側でAlphaを0.5程度にして`Allow Combining`を切り替えると、重複部のAlphaの扱いを比較できます。各コピーへ段階的な回転や移動を与えたいなら、規則的な格子配置を作るsGridではなく[sDuplicate](./sduplicate)が向く場合があります。

この3つはManualにある接続関係・設定の説明を組み合わせた制作例です。表示結果そのものは21.1実機で未検証です。

## 関連ノードと注意点

- [sEllipse](./s-ellipse)は円・楕円の生成向けです。四角形を角丸にしたいならsRectangleの`Corner Radius`で調整します。
- [sPolygon](./spolygon)は頂点を自由に配置して不規則な輪郭を描く用途向けです。軸に沿った長方形ならsRectangleの方が直接的です。
- [sChangeStyle](./schangestyle)は、作成済みのShapeの色・Alphaなどを後段で変更したいときに使います。
- [sGrid](./sgrid)は格子状に増やし、[sDuplicate](./sduplicate)はコピーごとの変化を積み重ねます。
- [sRender](./s-render)はShapeを通常の2D Imageへ変換します。BlurやGlow、通常のMergeへ渡す前に必要です。

Shape全体の流れとほかのノードの一覧は[Shapeノード](./index)を参照してください。

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、pp.2756–2759**を基に、入力なし・Shape出力・Controls/Styleタブの設定・sGrid/sDuplicate/sRenderとの接続を確認しました。

出典： [Blackmagic Design公式サポート（21.1 Manual、2026-09-08公開）](https://www.blackmagicdesign.com/support)。

内部REGID、正確なポート表示名・色、Edition差、Inspectorの初期値、実機描画の細部は確認していません。そのため`verification: partial`を維持しています。
