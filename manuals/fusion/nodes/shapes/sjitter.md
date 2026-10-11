---
title: sJitter
description: Shapeの位置・大きさ・回転や輪郭の制御点にばらつきを与え、規則的な配列や単独の図形を崩すShapeノード。
doc_type: node
term_id: sjitter
term_short: sJitterは、Shapeの配置や輪郭にランダムな変化を加えるノード。
verification: partial
aliases: [sJitter]
concepts: [shape-data]
nodes: [sJitter]
node_family: shapes
inputs: [shape]
outputs: [shape]
controls: [Jitter Mode, Shape X Offset, Shape Y Offset, Shape X Size, Shape Y Size, Shape Rotate, Point Jitter]
tasks: [build-shape, procedural-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# sJitter

sJitterは、入力した<Term id="shape-data">Shape</Term>の位置・大きさ・回転をランダムに変えたり、図形を構成する制御点をずらして輪郭を崩したりするノードです。きれいに並んだ円へ少しずつ違いを付けるほか、単独の図形を不規則に変形させることもできます。

ここでいうShapeは、ピクセル画像になる前の図形データです。[Shapeの基本](../../learn/02-data/shape)で、画像やMaskとの違いを確認できます。

## 入力と出力

**Input1（オレンジ、必須）**には別のShapeノードの出力を接続します。入力したShapeの配置や制御点に変化を加え、**Shapeのまま出力**します。

```text
sEllipse → sGrid → sJitter → sRender → Merge
```

この構成では、`sEllipse`が円を作り、`sGrid`が円を行列状に並べ、`sJitter`が個々の円を不規則にずらします。最後に`sRender`で通常の2D画像へ変換します。結果を画像として合成するときは[sRender](./s-render)を接続してください。

[sDuplicate](./sduplicate)や`sGrid`を挟まず、単独のShapeを直接接続することもできます。制御点を動かすPoint Jitterは、図形そのものの輪郭を変形させたいときに使います。

## Inspectorの主な設定

### Jitter Mode：ばらつきを固定するか、動かすか

- **Fixed**：配置や大きさなどに固定のばらつきを与えます。必要なら通常のキーフレームやModifierによってアニメーションできます。
- **Random**：範囲スライダーで指定した値の間で対象のパラメータを自動的にランダムアニメーションさせます。

21.1 ManualではFixedが初期選択です。Randomを選んだだけでは必ず動くとは限りません。**範囲スライダーを初期状態のままにするとランダムアニメーションは発生しません。** 動かしたい項目の範囲を広げてください。

公式資料には、ランダム値の更新間隔や再現性を保証する設定までは示されていません。Seedの有無や時間方向の細かい挙動はここでは断定しません。

### Shape X / Y Offset：位置のばらつき

Xは横方向、Yは縦方向のずれ幅です。同じ配列のShapeが一斉に同じ方向へ動くのではなく、**個々のShapeに異なる量のずれ**が加わります。

例えば[sGrid](./sgrid)で横8列・縦6行に並べた小さな円へX/Y Offsetを少し付けると、格子状の配置を保ちながら不揃いにできます。列数と行数を増やす操作は`sGrid`側で行います。

### Shape X / Y Size：大きさのばらつき

配列に含まれる各Shapeの横・縦方向の大きさを変えます。範囲スライダーの左側は小さくする方向、右側は大きくする方向を担当します。

同じ円を並べた背景で、位置に加えて大きさも少し変えると、各ドットの形や密度が均一になりすぎるのを避けられます。XとYの範囲を変えれば、横長・縦長の違いも付けられます。

### Shape Rotate：回転のばらつき

配列内の各Shapeの回転を変えます。円では回転差が分かりにくいため、星や三角形など向きのある図形で効果を確認すると分かりやすくなります。

配列全体を一括回転する設定とは異なります。全体を揃えて回転・移動するなら[sTransform](./stransform)を使います。

### Point Jitter：輪郭の制御点を動かす

**X / Y Point Jitter**は、Shapeを形作るベクトル制御点をそれぞれの方向へずらします。オブジェクトの位置を変えるのではなく、**図形そのものの輪郭を変形**します。

例えば楕円に少し加えると、整った曲線を不規則な縁に変えられます。Randomと組み合わせれば、輪郭が時間とともに変形する構成を作れます。元の形を保ちたい図形には、小さい値から適用してください。

## 具体的な使い方

### 1. 不揃いなドット背景

```text
sEllipse → sGrid（8列×6行）→ sJitter（Fixed）→ sRender → Merge
```

1. `sEllipse`で小さな円を作ります。
2. `sGrid`のGrid Cells X/Yを8列×6行にして、X/Y Offsetで間隔を調整します。
3. `sJitter`をFixedにし、Shape X/Y Offsetの範囲を少し広げます。
4. 必要ならShape X/Y Sizeにも小さなばらつきを加えて`sRender`で画像化します。

`sGrid`は数と規則的な配置を決め、`sJitter`がその規則性を崩します。配置が大きく乱れる場合は、まず位置の範囲を狭くしてください。

### 2. 揺らぐ不規則な輪郭

```text
sEllipse → sJitter（Random + Point Jitter）→ sRender
```

単独の円を入力し、Jitter ModeをRandomに変更します。X/Y Point Jitterの範囲を広げると、制御点が動いて輪郭が変形します。大量のキーフレームを手で追加せず、ゆがみ続ける装飾図形や背景素材を作りたいときに使えます。

これはManualが説明する自動アニメーションと制御点変形を組み合わせた構成例です。実機での変形速度・滑らかさ・細部の表示結果は未確認です。

### 3. 星を繰り返しながら向きを変える

```text
sStar → sDuplicate → sJitter（Fixed）→ sRender
```

`sStar`で星を作り、`sDuplicate`で複製した後、`sJitter`のShape RotateとShape X/Y Sizeを調整します。同じ星でも向きと大きさに違いがある装飾を作れます。

`sDuplicate`自体にもJitter設定があります。複製時にばらつきを決めるなら`sDuplicate`内で、**複製後に独立した工程として**調整したいなら`sJitter`を使うと編集しやすくなります。

## 関連ノードと注意点

- **[sGrid](./sgrid)**：行列状の配置と複製数を決めます。sJitterは複製数を増やすノードではありません。
- **[sDuplicate](./sduplicate)**：コピーごとの変化とJitterを設定できます。sJitterはその後に追加する別の処理です。
- **[sTransform](./stransform)**：Shape全体を移動・拡大縮小・回転させます。sJitterは個々のShapeへ異なる変化を付けられます。
- **[sRender](./s-render)**：Shapeを2D Imageに変換します。通常の画像処理へ進む前に使います。

輪郭を崩したいのにShape Offsetだけを調整しても、図形は元の形のまま移動します。逆に整列を少し乱すだけなら、Point Jitterで制御点まで動かす必要はありません。

[Shapeノード一覧](./)には、生成・複製・加工・描画の各ノードをまとめています。

## バージョンと出典

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 117「Shape Nodes」、**pp.2744–2745**を参照。Input1（オレンジ、必須）、配列へのランダム変化、Jitter ModeのFixed / Random、Shape X/Y Offset・Size、Shape Rotate、Point Jitterの役割を確認しました。

入力と出力のデータ種類、主要Controlの説明はManualに基づきます。Exact REGID、数値範囲、Randomの時間方向の細部、Edition差、21.1実機の結果は未確認のため、`verification: partial`を維持します。
