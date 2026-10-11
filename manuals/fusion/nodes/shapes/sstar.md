---
title: "sStar"
description: "星形をShapeとして生成し、突起の数・深さ・塗り・輪郭や描画アニメーションを調整するノード。"
doc_type: node
term_id: "sstar"
term_short: "星形を生成し、輪郭や突起の形を調整できるShape Generator。"
verification: partial
aliases: ["sStar"]
concepts: ["shape-data", "vector-shape", "rasterization"]
nodes: ["sStar"]
node_family: "shapes"
outputs: ["shape"]
controls: ["Points", "Depth", "Solid", "Border Width", "Border Style", "Cap Style", "Position", "Length", "X Offset", "Y Offset", "Width", "Height", "Angle", "Color", "Allow Combining"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-11"
---

# sStar

sStarは、複数の突起を持つ星形を作る<Term id="shape-data">Shape</Term> Generatorです。星の突起の数や深さを変えるだけでなく、塗りつぶしと輪郭線を切り替え、輪郭を途中から描いていくアニメーションも作れます。

Shapeは、まだ画像の画素に変換されていない図形データです。通常の映像に重ねる場合は、後段で `sRender` を使って2D Imageに変換します。Shapeの基本は[シェイプ（Shape）](../../learn/02-data/shape)を参照してください。

## 入力と出力

**外部入力はありません。** sStar自身が星形を生成します。旧カタログにあった `inputs: ["shape"]` はDaVinci Resolve 21.1 Reference Manualの説明と一致しないため、入力ありとは扱いません。

出力は**Shape**です。そのまま[sRender](./s-render)で画像にするか、[sDuplicate](./sduplicate)や[sGrid](./sgrid)に渡して星を増やしてから画像化します。

```text
sStar → sRender → Merge（実写映像に星を重ねる）
sStar → sDuplicate → sRender → Merge（複数の星を重ねる）
```

どちらも `sRender` より前はShape、後ろは2D Imageです。通常の `Merge` にsStarのShape出力を直接つなぐ構成ではありません。

## 主な設定

### Points / Depth：突起の数と深さ

- `Points`：星の突起（腕）の数を設定します。
- `Depth`：中心から突起の間へ向かう凹みの深さ、つまり内側半径に関わります。Manualでは、0.001付近で非常に細い突起になり、1.0では角張った円に近づくと説明されています。

突起を増やすだけでは必ずしも鋭い星になりません。突起の数を `Points` で決め、突起と谷の形を `Depth` で調整します。

### Solid / Border Width：塗りか輪郭か

`Solid` を有効にすると、Styleタブで指定した色で星の内部を塗りつぶします。無効にすると内部は透明になり、`Border Width` による輪郭を表示します。

`Border Width` はSolidが有効な場合にも使えますが、線だけの星を作るときに特に重要です。塗りつぶした星から線の星へ変えたい場合は、色やAlphaを消すのではなく、まず `Solid` を切り替えます。

### Border Style / Cap Style：角と線端

`Border Style` は輪郭の角のつなぎ方です。

- **Bevel**：角を切り落とす。
- **Round**：角を丸くする。
- **Miter**：尖った角を維持する。

`Cap Style` は、**Solidが無効のとき**に表示される線の端の形状です。Flatは平らな端、Roundedは半円状の端、Squaredは端を線幅の半分だけ延長した形です。輪郭が閉じたままでは端の違いが見えないため、確認する場合は `Length` を1.0未満にします。

### Position / Length：輪郭を途中まで描く

この2項目も**Solidが無効のとき**に表示されます。

- `Length`：1.0で輪郭が閉じ、値を下げると輪郭の一部が開きます。キーフレームを付けると、線が順に描かれるアニメーションになります。
- `Position`：輪郭の開始位置を動かします。`Length` と併用すると、線の切れ目が現れる場所を調整できます。

例えば開始フレームでは `Length` を小さく、終了フレームでは1.0に設定します。線が伸び始める位置を変えたいときは `Position` を調整します。

### X / Y Offset、Width / Height、Angle

`X Offset` / `Y Offset` は星の位置を動かします。Manualによれば、Offsetは**フレーム幅を基準に正規化**されています。`X Offset = 0.0` は中央、`0.5` は星の中心をフレーム右端に置く例です。ピクセル数を直接入力するものではありません。

`Width` / `Height` は星の横方向・縦方向の大きさを設定します。両方を同じ値にすると突起の長さが均等になり、異なる値にすると横長・縦長の星になります。`Angle` は星を中心軸まわりに回転させます。

### Style / Color / Allow Combining

Styleタブの `Color` は塗り・輪郭の色とAlpha（透明度）を指定します。RGBAを数値で設定するほか、色スウォッチやスポイトでも指定できます。

`Allow Combining` は、[sDuplicate](./sduplicate)や[sGrid](./sgrid)で半透明の星を重ねるときのAlphaの扱いに関係します。Manualの例では、星のAlphaを0.5にした場合、有効なら重なった領域でも0.5を維持し、無効なら重なった領域のAlphaが累積します。星を重ねて明るくしたいか、均一な透過率を保ちたいかで使い分けます。

## 具体的な使い方

### 星の輪郭が描かれるHUD風のマーク

sStarで `Points` と `Depth` を調整し、`Solid` を無効にします。 `Border Width` で線を太くし、`Length` を小さい値から1.0へアニメーションさせます。描画開始位置を変えたい場合は `Position` を調整します。

```text
sStar（輪郭・Lengthのアニメーション） → sRender → Glow → Merge
                                                         ↑
                                                   MediaIn（映像）
```

`Glow` は2D Imageを処理するので、`sRender` の後段に置きます。輪郭が閉じた後に `Angle` をアニメーションさせれば、描き上がった星を回転させる構成にもできます。

### 星を増やして背景パターンにする

1個のsStarで形と色を決め、出力を `sGrid` に渡して行と列に並べます。最後に `sRender` で画像化し、必要なら通常の `Merge` で背景映像と合成します。

```text
sStar → sGrid → sRender → Merge → MediaOut
                             ↑
                        MediaIn（映像）
```

星の種類を変えたいときはsStar、配置数や間隔を変えたいときはsGridを調整します。各コピーを順番に回転・縮小したい場合は、規則的な行列を作るsGridより `sDuplicate` が適する場合があります。

### 半透明の星を重ねて模様を作る

sStarのStyleタブでAlphaを0.5程度にし、`sDuplicate` で少しずつ位置をずらして重ねます。重なる部分だけAlphaを濃くするなら `Allow Combining` を無効に、同じAlphaを維持するなら有効にして結果を比べます。

これは21.1 Manualが説明するAlphaの重複動作に基づく構成例であり、実機レンダリングでの見た目までは検証していません。

## 関連ノードと注意点

- [sNGon](./sngon)は正多角形、sStarは突起と谷を持つ星形に向きます。突起の数と凹みを調整したいならsStarを選びます。
- [sPolygon](./spolygon)は手動で頂点を配置して自由な輪郭を描く用途向けです。規則的な星ならsStarの方が直接的です。
- [sDuplicate](./sduplicate)はコピーごとに変化を加え、[sGrid](./sgrid)は規則的な行列に並べます。
- [sRender](./s-render)はShapeを2D Imageへ変換します。通常のMerge、Glow、Blurなどへ進む前に必要です。
- `Cap Style`、`Position`、`Length` を調整したいときは、`Solid` が無効になっているか確認します。

Shape系全体の使い分けは[Shapeノード一覧](./)を参照してください。

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、pp.2762–2765**に基づき、外部入力なし・Shape出力・Controls/Styleの各設定と `sRender` / `sDuplicate` / `sGrid` の基本的な接続を確認しました。

内部REGID、Edition差、端子の表示名・色、実機での描画結果、設定のデフォルト値は確認していません。このため `verification: partial` を維持しています。
