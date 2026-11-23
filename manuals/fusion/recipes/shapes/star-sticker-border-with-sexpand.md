---
title: sExpandで星の外側にステッカー風の縁を作る
description: 1つの星形を2つの枝に分け、外側だけを膨張させて別の色で重ねる。元の星を保ったまま縁の太さと角の形を調整する。
doc_type: recipe
verification: partial
aliases: [ステッカー風の縁取り, Shapeの外側余白, sExpand 外枠]
concepts: [shape-data, rasterization]
patterns: [defer-domain-conversion]
nodes: [sStar, sExpand, sChangeStyle, sMerge, sRender]
tasks: [shape, graphic, build-shape]
prerequisites: [shape-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-24"
---

# sExpandで星の外側にステッカー風の縁を作る

## 作るもの

青い星の外側に白い縁が付いたステッカー風のマークを作ります。星そのものの大きさや色は変えず、縁の広がりだけを調整できる構成にします。最後に角を丸くした場合と尖らせた場合を比べます。

## 必要なものと入力条件

- DaVinci Resolve / Fusion 21.1。1920×1080のFusion Compositionを想定します。
- sStar ×1：中央に置く塗りつぶしの星。外部素材は不要です。
- sExpand ×1：星の領域を外側へ広げます。
- sChangeStyle ×1：広げた星だけを白くします。
- sMerge ×1：白い星の上に元の青い星を重ねます。
- sRender ×1：結果を2D Imageとして表示します。

数値は操作を始めるための提案値です。この構成を実機で計測して決めた値ではありません。

## 接続

~~~text
       ┌─ sExpand ─ sChangeStyle ─→ sMerge Input1（下）
sStar ─┤                            sMerge ─→ sRender
       └──────────────────────────→ sMerge Input2（上）
~~~

同じsStarの出力を2方向へ分けます。sMergeの最初の入力（オレンジ）には広げて白くした星、2番目の入力（緑）には元の星を接続します。

## 手順

### 1. 元になる星を作る

1. sStarを追加し、Pointsを5、Depthを0.5程度に設定します。
2. Solidをオンにし、WidthとHeightを0.30程度にそろえ、X/Y Offsetは0にします。Border Widthは0を比較の基準にします。
3. StyleのColorを青（例：R=0.1、G=0.35、B=0.8）、Alphaを1.0にします。
4. sRenderを一時的に直接接続して、画面中央に青い星が表示されることを確認します。

### 2. 外側の星を作る

1. sStarから分岐してsExpandに接続します。
2. Amountを正の小さな値（例：0.02）にし、Border StyleをRoundにします。
3. sExpandの出力にsChangeStyleを接続し、Colorを白（RGB=1、Alpha=1）にします。
4. まずこの枝だけをsRenderで見て、元の青い星よりも外側へ広がった白い星が得られるかを確認します。

Amountの値をピクセル数と同一視せず、Viewerで元の星との境界の差を見ながら調整してください。

### 3. 元の星を重ねる

1. 白い星の出力をsMergeのInput1へ、元のsStarをInput2へ接続します。
2. sMergeの出力をsRenderへつなぎ、Viewerに表示します。
3. 青い星が白い星の中央を覆い、外側だけ白い縁として見えることを確認します。
4. sExpandのAmountを0、0.02、0.04の順に変え、青い星を変えずに白い部分が広がるかを比べます。

ここでは透明度やAllow Combiningを比較途中で変えず、両方の星を不透明に保ちます。

### 4. 縁の角の形を選ぶ

Amountを同じ正の値に固定し、sExpandのBorder Styleだけを変更します。

| Border Style | 観察する場所 |
| --- | --- |
| Round | 星の先端の丸み |
| Bevel | 先端の切り落とし方 |
| Miter | 尖った角の伸び方 |
| Miter Clip | 長い突起の先端が制限される様子 |

MiterとMiter ClipではMiter Limitが表示されます。尖りが長すぎる場合は、Amountを固定したままMiter Limitを調整します。RoundやBevelを選んだときにMiter Limitが表示されなくても異常ではありません。

## 期待する結果

- Amountが0のときは、同じ形状の青い星が白い星を覆うため、明瞭な白い縁はほとんど見えないことが期待されます。
- 正のAmountでは、元の星の外側に白い領域が現れます。
- Border Styleを変えると外側の角の形が変わりますが、元の青い星の設定はそのままです。

これらはManualの領域膨張・重なり順に基づく期待結果です。アンチエイリアスによる境界画素も含めた実測結果ではありません。

## この構成で動く理由

sExpandは星の中心から単に拡大する処理ではなく、Shapeの領域を外側へ広げる処理です。sChangeStyleで広げた枝だけを白くし、sMergeで元の不透明な星をその上へ重ねると、白いShapeのうち元の星が覆わない部分が縁として見えます。

1つのsStarを両方の枝で使うため、PointsやDepthを変更すると両方に反映される構成です。輪郭を別々に描き直す必要がありません。

この方法で得られるのは2つの図形を重ねた見た目です。白い図形から青い領域を実際にくり抜いているわけではありません。中央を透明にしたい場合は別の領域演算が必要です。Shapeのまま処理し、最後に画像化する理由は[Shapeの基礎](../../learn/02-data/shape)と[必要な場所で画像化するパターン](../../patterns/data-domain/defer-domain-conversion)を参照してください。

## バリエーション

- sStarのPointsやDepthを変え、星の種類が変わっても同じ構成で縁を作れるか確認します。細い谷や鋭い先端は、広げる量によって見え方が大きく変わる場合があります。
- 縁をアニメーションしたいときはsExpandのAmountにキーフレームを付ける構成を試せます。ただし途中フレームの描画は別途確認してください。
- sChangeStyleの色を変えれば、同じ構成で暗い縁や別のアクセント色にできます。[配色の部分変更レシピ](./recolor-icon-group-with-schangestyle)も参照してください。

## うまくいかないとき

| 症状 | 最初に確認すること |
| --- | --- |
| 青い星が見えない | 元の星がsMergeのInput2、白い星がInput1に入っているか |
| 白い縁が現れない | Amountが正か、白い枝がsExpandとsChangeStyleを通っているか |
| 両方が白くなる | sChangeStyleを分岐前やsMergeの後に置いていないか |
| 先端が極端に伸びる | Miter系のBorder StyleとMiter Limitを確認する |
| Viewerに画像が出ない | 最後にsRenderがあるか、両方のAlphaが1か |

## 関連資料

- [sStar](../../nodes/shapes/sstar)
- [sExpand](../../nodes/shapes/sexpand)
- [sChangeStyle](../../nodes/shapes/schangestyle)
- [sMerge](../../nodes/shapes/smerge)
- [sRender](../../nodes/shapes/s-render)
- [Shapeの基礎](../../learn/02-data/shape)
- [必要な場所で画像化するパターン](../../patterns/data-domain/defer-domain-conversion)
- [図形の部分変更・一括配色](./recolor-icon-group-with-schangestyle)

## 出典と検証範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 117「Shape Nodes」pp.2741–2742（sExpand、Amount、Border Style、Miter Limit）、pp.2733–2734（sChangeStyle）、pp.2746–2747（sMerge）、pp.2762–2765（sStar）。Libraryに保存された公式Manualの該当ページ本文を直接照合しました。[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。

確認済み：各ノードの入出力・設定項目、領域膨張の方向、角の処理、重なり順。既存Node Referenceの単体sExpand実機例は円の膨張・収縮を示しますが、この星の縁取り構成そのものの証拠ではありません。

未検証：今回の分岐構成のResolve 21.1実機描画、各Border Styleの比較画像、縁の画素幅・Alpha、アニメーション、Free / Studio差、OS・GPU差。したがって **verification: partial** を維持します。
