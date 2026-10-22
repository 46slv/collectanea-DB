---
title: "sChangeStyle"
description: "Shapeの色と透明度、複製が重なったときのAlphaの扱いをまとめて上書きするNode。"
doc_type: node
term_id: "schangestyle"
term_short: "Shapeの色・Alpha・Allow Combiningを上流の設定に代わって指定するNode。"
verification: partial
aliases: ["sChangeStyle", "sCS"]
concepts: ["shape-data"]
nodes: ["sChangeStyle"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Color", "Allow Combining"]
tasks: ["build-shape", "style-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-23"
---

# sChangeStyle

sChangeStyleは、入力した図形の**色・透明度と、複製が重なった部分の透明度の扱い**をまとめて指定するNodeです。たとえば、赤い円と青い星を組み合わせた後で全体を白くしたり、半透明の図形を並べたときに重なり部分だけ濃くなるかどうかを切り替えたりできます。

ここで扱う<Term id="shape-data">Shape</Term>は、円・文字・パスなどの形を、画像のピクセルへ変換する前に保持したデータです。sChangeStyleは**図形の形や配置を作り直すのではなく、見た目の設定を上書き**します。結果もShapeのため、最後に[sRender](./s-render)で2D Imageへ変換します。

## どんなときに使うか

[sEllipse](./s-ellipse)や[sRectangle](./srectangle)のような生成Nodeにも色の設定があります。図形ごとに別の色を使うなら、それぞれのNodeで設定できます。

一方、複数の図形を[sMerge](./smerge)でまとめ、**最終的には全部同じ色にしたい**ときは、その後ろにsChangeStyleを置くと編集箇所が1つになります。上流の色を個別に変更せず、合成したShapeツリーのスタイルをまとめて置き換えます。

sChangeStyleは輪郭の位置・太さ・形を調整するNodeではありません。輪郭線の加工は[sOutline](./soutline)、図形の変形は[sTransform](./stransform)など、別のShape Nodeが担当します。

## 入力と出力

- **入力：Shape（1つ）** — 色を変更したいShapeを受け取ります。単一の円や四角形だけでなく、sMergeなどでまとめた図形の出力も接続できます。
- **出力：Shape** — ColorとAllow Combiningを上書きしたShapeを後段へ渡します。画像用のColor Correctorや通常のMergeへ直接渡す出力ではありません。

~~~text
sEllipse → sChangeStyle → sRender → 2D Image
~~~

21.1 Reference Manualにも、sEllipseのShapeをsChangeStyleへ渡し、sRenderで画像化する構成が示されています。

## Inspectorの主な設定

### Color：図形の色と透明度

Shapeの塗り・輪郭に使われる色を、後段のsChangeStyle側で指定します。

- **色見本**：色を選びます。
- **スポイト**：Viewer内の画像から色を拾います。
- **RGBAのスライダー・数値欄**：各色成分とAlpha（透明度に関わる値）を調整します。

Alphaは、同じ色でもどれだけ背景が透けて見えるかに関わります。半透明の模様を作る場合は、色とAlphaを分けて確認します。

ここで説明しているのは、Manualに掲載されたColorの操作です。塗りと輪郭を別々に選択する追加スイッチや、未掲載の数値範囲があるとは断定しません。

### Allow Combining：Shapeのコピーが重なる場合のAlpha

**Allow Combiningは、図形を重ねてよいかどうかの許可スイッチではありません。** 後段の[sGrid](./sgrid)や[sDuplicate](./sduplicate)で同じShapeのコピーが重なった場合に、重複部分のAlphaをどう扱うかを決めます。

| 設定 | コピーが重なる部分の扱い |
| --- | --- |
| **オン** | 元のShapeで指定したAlphaを維持する |
| **オフ** | 重なった場所でAlphaが積み重なり、より不透明になる場合がある |

Manualの例は**Alpha = 0.5**の長方形です。Allow Combiningをオンにすると、複製した長方形同士が重なってもAlpha 0.5が維持されます。オフでは、重なった箇所のAlphaが累積します。

この設定が扱うのは**Shapeツリー内での重なり**です。sRenderの後で通常のMergeを使って映像と合成するときのBlend値や、画像を何枚も重ねたときのAlpha合成ルールを変更する機能として説明してはいけません。

## 制作例1：複数の図形を一色にまとめる

円と星を組み合わせたロゴを、図形ごとの色に関係なく白いシルエットとして表示する例です。

~~~text
sEllipse ──┐
           ├─ sMerge → sChangeStyle〔Color〕→ sRender
sStar ─────┘
~~~

1. sEllipseで円、[sStar](./sstar)で星を作ります。それぞれの色は違っていても構いません。
2. 2つのShapeをsMergeへ接続し、円と星の位置・重なり順を決めます。
3. sMergeの出力をsChangeStyleの入力へ接続します。
4. sChangeStyleのColorで白などの一色を指定します。
5. sRenderをViewerに表示し、円と星が共通の色になっているか確認します。

**sMergeは図形を重ねる役割、sChangeStyleはその見た目を統一する役割**です。Shape同士を切り抜いて1つの領域へ演算する場合は、sMergeの代わりに[sBoolean](./sboolean)を使い、その後ろにsChangeStyleを置く構成も考えられます。

この手順はManualに記載された上書きの仕様から組み立てた制作例であり、Resolve 21.1実機での完成画像は未確認です。

## 制作例2：半透明の長方形を重ねて違いを見る

Allow Combiningの意味は、コピーを意図的に重ねると確認しやすくなります。

~~~text
sRectangle → sChangeStyle〔Alpha 0.5 / Allow Combining〕→ sGrid → sRender
~~~

1. sRectangleで横長の長方形を1つ作ります。
2. sChangeStyleを接続し、Colorの**Alphaを0.5**に設定します。
3. sGridを後段に接続し、**Grid Cells Xを2、Yを1**にして、横方向に2つ並べます。
4. sGridの**X Offset**を調整し、2つの長方形が一部重なるようにします。
5. sRenderをViewerに表示し、重なった部分を拡大して確認します。
6. sChangeStyleのAllow Combiningをオン／オフして、重複部分の濃さがどう変わるか比較します。

この例では、**sChangeStyleをsGridより前へ置く**ことに意味があります。Manualは、sChangeStyleで指定したAlphaとAllow Combiningが、その後段の複製・グリッドによる重なりへ作用することを説明しています。すでに複製した後ろへ移動しても同じ結果になる、とはここでは保証しません。

なお、長方形が重なっていなければ差が出ません。Grid Cellsだけでなく、元の長方形の幅とX Offsetも確認してください。

## 主な用途

- 複数のShapeをまとめたロゴやアイコンを、仕上げ段階で一色に統一する。
- アニメーション中に、形状の設定を触らず図形全体の色やAlphaを変える。
- 同じShapeを反復する背景で、重複部分が不自然に濃くなるのを抑える。
- 逆にAllow Combiningをオフにして、半透明の図形が重なる場所を濃く見せる構成を試す。

## 似たNodeとの違いと注意点

- **[sMerge](./smerge)**：複数のShapeを1つの出力へまとめます。後段のsChangeStyleは、その出力の色・Alphaの扱いを一括で変更できます。
- **[sBoolean](./sboolean)**：図形同士の重なりから切り抜き・結合などの新しい領域を作ります。sBoolean自身にもStyle設定があるため、後段で再度上書きする意図がある場合にsChangeStyleを追加します。
- **[sOutline](./soutline)**：輪郭線の太さ、角、線端、描画区間を調整します。sChangeStyleは輪郭の形を編集しません。
- **[sRestyle](../krokodove/srestyle)**：Krokodoveに属する別のShapeスタイル変更Toolです。sChangeStyleと同じ全パラメータ・同じ挙動だとは確認していません。

### うまくいかないとき

- **Viewerに何も見えない**：出力がまだShapeなら、sRenderの後段をViewerへ表示します。ColorのAlphaも確認します。
- **色が予想と違う**：sChangeStyleより後ろにスタイルを再指定するNodeがないか、Flowの順序を確認します。
- **Allow Combiningを変えても同じ**：後段に複製があるか、コピー同士が実際に重なっているか確認します。
- **異なる色を残したい部分まで同じ色になる**：一括上書きする位置が広すぎる可能性があります。色を残す図形は別枝に分け、sChangeStyleを適用する範囲を狭めます。
- **通常の画像エフェクトへ接続できない**：sChangeStyleの出力はImageではなくShapeです。sRenderで変換します。

## 関連ページ

- [シェイプ（Shape）](../../learn/02-data/shape) — Shapeと2D Imageの違い。
- [sGrid](./sgrid) / [sDuplicate](./sduplicate) — Shapeを規則的に並べる／段階的に複製する。
- [sRender](./s-render) — Shapeを2D Imageへ変換する。
- [Shapeを映像へ重ねる基本レシピ](../../recipes/shapes/basic-shape-render) — sRenderから通常のMergeへ渡すまで。

## バージョン・出典・検証状況

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、**pp.2733–2734**。入力が1つであること、上流のShapeツリーに設定されたColorとAllow Combiningを上書きすること、RGBAとスポイト、Alpha 0.5の重複例、sEllipse → sChangeStyle → sRenderの構成を確認しました。[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support)からマニュアルを参照できます。

**確認できていないこと：** Resolve 21.1実機での描画・各Controlの初期値と厳密な数値範囲・内部REGID・Free / Studio間の差です。sCSはManualの略号で、内部REGIDを示す証拠ではありません。上記の制作例は資料に基づく試行手順なので、Frontmatterのverificationはpartialを維持します。
