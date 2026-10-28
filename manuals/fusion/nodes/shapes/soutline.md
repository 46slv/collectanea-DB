---
title: sOutline
description: 複数のShapeの輪郭を線として描き、線幅・角・端・描画範囲をまとめて調整する。
doc_type: node
term_id: soutline
term_short: sOutlineはShapeの輪郭を線にし、太さや描画範囲を設定するNode。
verification: partial
aliases: [sOutline]
concepts: [shape-data]
nodes: [sOutline]
node_family: shapes
inputs: [shape]
outputs: [shape]
controls: [Thickness, Border Style, Cap Style, Position, Length]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# sOutline

sOutlineは、<Term id="shape-data">Shape</Term>の輪郭を太さのある線に変えるNodeです。単独の円や多角形だけでなく、`sMerge`や`sBoolean`でまとめた複数のShapeへ、共通の線幅や線端の設定を適用できます。

複数の図形を入力しても、それぞれの色・位置・大きさなどは保持されます。sOutlineは図形の色を一括変更するNodeではなく、**輪郭線の描き方を一括変更するNode**です。

## 入力と出力

**Input1（オレンジ、必須）**にShapeを接続します。単独の`sEllipse`、`sPolygon`だけでなく、`sMerge`や`sBoolean`が出力する複合Shapeも受け取れます。

出力もShapeです。後段でほかのShape系Nodeへ渡せますが、通常の2D Image処理へ接続するには`sRender`で画像化します。

```text
sEllipse ──┐
           ├─ sMerge → sOutline → sRender → Merge
sStar ─────┘
```

`sMerge`が複数Shapeをまとめ、sOutlineがその輪郭を加工し、`sRender`が画像に変換する順序です。[Shapeの基本](../../learn/02-data/shape)も参照してください。

sOutlineにはShapeの入力が1つしかありません。円と星を両方扱う場合は、先に`sMerge`などで一つの複合Shapeとして渡します。複数の図形を**別々のまま重ねる**ならsMerge、重なった領域の形を**演算して変える**ならsBooleanを選びます。どちらを入力したかによって、sOutlineが輪郭を描く対象も変わります。

## InspectorのControls

### Thickness

輪郭線の太さです。複合Shapeなら含まれる図形にまとめて適用されます。たとえば円と星の線を同じ太さにしたいとき、各Generatorの`Border Width`を個別に直す代わりに、両方をまとめた後段のsOutlineでThicknessを調整できます。

外形を押し広げたり縮めたりする[sExpand](./sexpand)のAmountとは目的が異なります。sOutlineで線を太くする操作は、元Shapeの位置や大きさを一律に拡大する操作でもありません。

### Border Style

輪郭線が角で曲がるときのつなぎ方です。

- **Bevel**：角を斜めに切り落とします。
- **Round**：角を丸くします。
- **Miter**：尖った角を保ちます。

角の鋭い星や多角形で違いがよく分かります。

### Cap Style

開いた線の両端の形を選びます。

- **Flat**：端を平らに切ります。
- **Round**：半円状の端にします。
- **Square**：端を線幅の半分だけ延長した四角い形にします。

**Lengthが1.0未満のときだけ線端が見えます。** 輪郭が閉じている状態でCap Styleだけ切り替えても、通常は違いが分かりません。

### Position / Length

**Position**は輪郭線の開始位置を動かします。**Length**は線をどこまで描くかを指定します。`1.0`で閉じた輪郭になり、小さくすると開いた部分（隙間）ができます。PositionとLengthを組み合わせれば、隙間の位置を調整できます。

Lengthをキーフレームで変えると、輪郭が伸びる**write-onアニメーション**を作れます。どこから描画が始まるかはShapeの経路とPositionで確認してください。

複合Shapeを入力した場合、PositionとLengthは含まれる図形の輪郭へ共通に適用されます。これは、複数の図形を一筆書きのようにつなげたり、一つずつ順番に描いたりする機能ではありません。図形ごとに描画タイミングを変えるなら、sOutlineを合流前の各経路に配置してそれぞれのLengthをアニメーションします。

### Settings

SettingsタブはShape系Nodeの共通設定です。上記のThickness・Border Style・Cap Style・Position・LengthはsOutline固有のControlsです。このページでは共通Settingsの未確認の項目名・初期値を推測しません。

<!-- capture:S169 -->

## 実機例：円の輪郭を線にする

`sEllipse` のShapeを `sOutline` に接続し、元のShapeと処理後のShapeをそれぞれ `sRender` で画像化します。Thicknessを0.03に固定し、Lengthを1と0.5に変えて同じframeで比較しました。

Length 1では円周全体、0.5では半周が表示されます。市松模様はViewerの透明表示です。撮影後はLength 1へ戻して保存しました。[接続と設定の記録](/img/fusion/captures/S169/readback.json)に条件を記載しています。

[![sEllipseからsOutlineを経てsRenderで画像化する構成](/img/fusion/captures/S169/graph.png)](/img/fusion/captures/S169/graph.png)

元ShapeとsOutline後のShapeをそれぞれsRenderで画像化します。

[![sOutlineのThickness 0.03とLength 1を示すInspector](/img/fusion/captures/S169/controls.png)](/img/fusion/captures/S169/controls.png)

Thicknessは0.03、Lengthは1です。

[![塗りの円と全周の輪郭線を比較](/img/fusion/captures/S169/full.png)](/img/fusion/captures/S169/full.png)

左は元の円、右はLength 1の輪郭線です。

[![塗りの円とLength 0.5の半周の輪郭線を比較](/img/fusion/captures/S169/half.png)](/img/fusion/captures/S169/half.png)

右のLengthを0.5にすると、半周が表示されます。

[再現用Graph](/img/fusion/captures/S169/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S169/capture.json)

<!-- /capture:S169 -->

## 実際の使い方

### 複数の図形の線幅をそろえる

```text
sEllipse ──┐
           ├─ sMerge → sOutline → sRender
sStar ─────┘
```

円と星を異なる色で作成し、`sMerge`で重ねます。その後段のsOutlineでThicknessを調整すると、図形ごとに線幅を設定することなく共通の輪郭線を描けます。

重なりから一つの外周を作りたい場合は、`sMerge`の代わりに[sBoolean](./sboolean)でUnionなどを計算し、得られたShapeへsOutlineを適用します。`sMerge`の重ね合わせとBoolean演算は同じ処理ではありません。

### 線を描いていくアニメーション

```text
sPolygon → sOutline → sRender → Merge
```

`sPolygon`で経路を作り、sOutlineのThicknessとCap Styleで線の見た目を決めます。開始フレームでLengthを小さくし、終了フレームで`1.0`にするキーフレームを設定すると、線が徐々に伸びる表現を作れます。Positionで開始位置を調整し、途中フレームで線の方向と端の形を確かめます。

### 複数の輪郭を同時に描く

```text
sEllipse ──┐
           ├─ sMerge → sOutline → sRender
sStar ─────┘
```

円と星を作って`sMerge`へ入れ、sOutlineの`Length`を開始時の短い値から終了時の`1.0`へアニメーションします。両方の輪郭が同じ設定で伸びるので、複数のアイコンを同時に出現させるアニメーションに向いています。一方、円を描き終わってから星を描きたい場合は、sOutlineをそれぞれの枝へ置き、キーフレームの時刻をずらしてから`sMerge`でまとめます。

### 一つの図形から太線と細線を重ねる

```text
              ┌─ sOutline（太）→ sChangeStyle ─┐
sRectangle ───┤                                ├─ sMerge → sRender
              └─ sOutline（細）→ sChangeStyle ─┘
```

元の四角形からShapeの流れを2本に分け、異なるThicknessを設定します。`sChangeStyle`で線の色を分けてから`sMerge`で合成すれば、元Shapeの形を一度直すだけで二重線の両方へ反映できます。

## 関連Nodeとの違い

- [sMerge](./smerge)：複数Shapeを重ねてまとめます。
- [sBoolean](./sboolean)：重なりをUnion / Subtractなどで計算して形そのものを変えます。
- [sExpand](./sexpand)：Shapeの領域を膨張・収縮します。
- [sRender](./s-render)：Shapeを2D Imageへ変換します。

Shape全体の流れは[Shapeノード一覧](./)から確認できます。

## バージョンと出典

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、**pp.2750–2752**。Input1、複合Shapeへの適用、Thickness、Border Style、Cap Style、Position、Lengthを確認しました。

上記固定例以外の接続例はマニュアル上の仕様に基づく制作例です。全パラメータの初期値と範囲、Edition差は未確認のため、`verification: partial`を維持します。
