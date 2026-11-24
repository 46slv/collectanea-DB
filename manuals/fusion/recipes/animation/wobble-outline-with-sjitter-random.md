---
title: sJitterのRandomとPoint Jitterで円の輪郭を揺らす
description: 1個の円の制御点にランダムな変位を加え、輪郭が時間とともに変化する図形を作る。
doc_type: recipe
verification: partial
aliases: [輪郭の揺れ, ランダム変形, point jitter, shape wobble]
concepts: [shape-data, vector-shape, rasterization]
patterns: [defer-domain-conversion]
nodes: [sEllipse, sJitter, sRender]
tasks: [shape, animate, motion-graphics]
prerequisites: [shape-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-24"
---

# sJitterのRandomとPoint Jitterで円の輪郭を揺らす

## 作るもの

円の輪郭が不規則に変化する図形を作ります。図形全体を移動させたり、複製した円をばらつかせたりするのではなく、輪郭を構成する点を動かします。抽象的なモーショングラフィックスや、手描き風の図形の素材に使う構成です。

## 必要なものと入力条件

- DaVinci Resolve 21.1のFusion Composition。例として1920×1080、フレーム0〜48を使用します。
- sEllipse、sJitter、sRenderを各1個。素材映像や複製ノードは不要です。
- 図形の輪郭が見やすい単色を使用します。

フレーム番号や図形の寸法は制作例の開始条件であり、実機で測定した最適値ではありません。

## 接続

~~~text
sEllipse1 ── Shape ──> sJitter1 ── Shape ──> sRender1 ── Image ──> Viewer / MediaOut
~~~

sJitterのオレンジ色の入力には、sEllipseのShape出力を接続します。画像化はsRenderで行い、その出力をViewerに表示します。

## 手順

### 1. 比較用の円を作る

sEllipseを追加し、ControlsのSolidを有効にします。WidthとHeightを同じ値にして円を作ります。両方を0.30程度から試し、画面の中央に収まる大きさに調整します。

StyleのColorで見やすい色を選び、Alphaを設定します。sEllipseからsJitterを経由してsRenderへ接続し、まだ輪郭に変位を加えていない円を確認します。

### 2. Randomを選び、変位の範囲を設定する

sJitterのControlsでJitter ModeをRandomにします。すべての範囲を初期値のままにした場合、Manualの説明ではランダムアニメーションは発生しません。まず、この状態の円を比較対象にします。

Point JitterのX方向の範囲だけを初期状態から少し広げます。輪郭の変形が確認できる程度にとどめ、必要に応じてY方向にも小さな範囲を設定します。数値の単位や最適な範囲はこのレシピでは固定しません。

Shape X/Y Offset、Size、Rotateには変化を追加せず、sEllipseの位置と寸法もそのままにします。Point Jitterによる変形だけを比較するためです。

### 3. 時間による変化を確認する

フレーム0、12、24、48を順に表示し、輪郭の凹凸や曲がり方を比較します。全体の位置だけが変わっていないか、元の円の輪郭と見比べます。制御点の変位に伴って、見かけ上の中心が変わることはあり得ます。

次にPoint Jitterの範囲を保ったままJitter ModeをFixedへ変更し、同じフレームを比較します。別途キーフレームやModifierを設定していなければ、時間による自動的なランダム変化を止めた状態との比較になります。

最後にRandomへ戻し、Point Jitterの範囲を初期状態に戻すとどう見えるかを確認します。

## 期待する結果

| 条件 | 観察する内容 |
| --- | --- |
| Random・全範囲が初期値 | 元の円が維持され、自動変化しないか |
| Random・X方向のPoint Jitterに変位範囲 | 輪郭の横方向の変形が時間とともに変化するか |
| Random・X/Y方向のPoint Jitterに変位範囲 | 縦方向の変形も加わるか |
| Fixed・同じ変位範囲 | 変形が時間に対して固定されるか |

表は公式Manualの説明に基づく確認項目です。各フレームの輪郭が実際にどの形になるか、連続したフレームで滑らかに動くかは実機で確認していません。

## この構成で動く理由

[sEllipse](../../nodes/shapes/s-ellipse.md)は円のShapeを生成します。[sJitter](../../nodes/shapes/sjitter.md)のPoint Jitterは、その輪郭を構成するベクトルの制御点に変位を与えます。Randomでは指定した範囲に基づいてパラメーターが自動的にアニメーションします。

Shape X/Y Offsetは図形の配置を変える設定であり、Point Jitterとは変化させる対象が異なります。今回は1個の円を入力するので、複製数は増えません。

輪郭を変形させてから[sRender](../../nodes/shapes/s-render.md)で画像化します。画像を生成してから画素を歪ませる処理とは異なります。

## バリエーション

- X方向だけ、Y方向だけ、両方向の順に試し、輪郭の変化に方向性を持たせる。
- Fixedを使用し、変形した静止図形をタイトルの背景などに使う。
- 複製した図形の位置を不規則に配置する場合は、[sGridとsJitterでドットを作るレシピ](../shapes/scatter-dots-with-sjitter-fixed.md)を参照する。
- 特定のフレームで形状を指定したい場合は、[sBSplineの制御点を動かすレシピ](./morph-blob-with-sbspline.md)を検討する。

Randomで指定するのは変位の範囲です。特定のシルエットへの変形や、開始・終了フレームが一致するループを保証する設定としては扱いません。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| 円が表示されない | Shapeの接続、Solid、ColorのAlpha、sRenderのViewer表示を確認する。 |
| Randomにしたのに変化しない | Point Jitterの範囲が初期値のままになっていないか確認する。 |
| 円が平行移動するだけに見える | Shape X/Y OffsetではなくPoint Jitterを変更しているか確認する。 |
| 変形が大きすぎる | Point Jitterの範囲を狭め、片方向ずつ比較する。 |
| 形状を静止させたい | Fixedへ変更し、別途設定したキーフレームやModifierがないか確認する。 |
| 最終フレームで元の円に戻らない | Randomの範囲指定と、開始・終了の形状を指定する操作を区別する。 |

## 関連資料

- [Shapeの基本](../../learn/02-data/shape.md)
- [データ領域の変換を遅らせる](../../patterns/data-domain/defer-domain-conversion.md)

## 出典と検証範囲

Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）, Chapter 117:

- pp.2739–2740：sEllipseのSolid、Width/Height、Color。
- pp.2744–2745：sJitterのShape入力、Fixed/Random、Shape OffsetとPoint Jitter。
- pp.2759–2760：sRenderによるShapeの画像化。

[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)と同版の提供済みPDF本文を2026-11-24に照合しました。既存のsJitterノード記事にあるS172の実機記録はFixedで配列の位置をばらつかせた静止画です。今回の単独図形のPoint Jitterによる時間変化を検証したものではありません。

Randomの実機描画、変位の単位・範囲、時間的な連続性、再現性、Seedの挙動、ループ、Alpha、Edition・OS差および性能は未検証です。verification: partial とします。
