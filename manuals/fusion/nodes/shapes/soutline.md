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
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
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

## InspectorのControls

### Thickness

輪郭線の太さです。複合Shapeなら含まれる図形にまとめて適用されます。外形を押し広げたり縮めたりする[sExpand](./sexpand)のAmountとは目的が異なります。

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

### Settings

SettingsタブはShape系Nodeの共通設定です。上記のThickness・Border Style・Cap Style・Position・LengthはsOutline固有のControlsです。このページでは共通Settingsの未確認の項目名・初期値を推測しません。

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

接続例はマニュアル上の仕様に基づく制作例であり、21.1実機でレンダリングした結果ではありません。正確なREGID、全パラメータの初期値と範囲、Edition差は未確認のため、`verification: partial`を維持します。
