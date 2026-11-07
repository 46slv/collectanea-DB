---
title: sSmooth
description: KrokodoveのsSmoothでShapeの辺を曲線状に整える考え方、角を保つ意味、sRoundとの違いを解説する。
doc_type: node
term_id: ssmooth
term_short: Shapeの角を保ちながら、角と角の間の線分を曲げて滑らかな辺にするツール。
verification: partial
aliases: [sSmooth]
nodes: [sSmooth]
node_family: krokodove
concepts: [shape-data]
inputs: [shape]
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# sSmooth

**sSmooth**は、図形の**角を残しながら、その間にある線分を曲げ、辺を滑らかにする**KrokodoveのShapeツールです。たとえば角張ったロゴの「角は目立たせたいが、角と角を結ぶ線の硬さは和らげたい」というときに検討できます。

DaVinci Resolve 21.1 Reference Manualでは、sSmoothについて「線分を曲げて滑らかな辺を作り、角は保持する」と説明されています。画像全体をぼかしたり、図形の角をすべて丸めたりするノードではありません。

ここでいう<Term id="shape-data">Shape</Term>は、円や多角形などを**画像化する前の図形データ**です。ピクセルの集合である通常の画像とは異なり、Shapeノードを連結して輪郭を加工し、最後に[sRender](../shapes/s-render)で2D画像へ変換できます。先に概念を確認したい場合は[シェイプ（Shape）](../../learn/02-data/shape)を参照してください。

## 「辺を滑らかにする」とは

多角形の輪郭は、一般に角と、その角同士をつなぐ辺から成ります。sSmoothで注目するのは**辺の形**です。辺を構成する線分が曲がることで、直線的・折れ線的だった部分を滑らかな線として扱う方向の処理です。

ここでの「角を保つ」は重要です。**角の位置・角度・数が一切変化しない**と保証する記述ではありません。公式Manualで確認できるのは、角を保持する設計と、線分を曲げて辺を滑らかにする役割までです。曲線の計算方式、制御点の扱い、変更量、端部での挙動はこの説明だけでは判断できません。

同じ輪郭に対しても、目的によって選ぶツールは変わります。

- **角を丸くしたい**：角に曲線を作り、辺を保つ[sRound](./sround)を先に検討します。
- **辺の見え方を滑らかにしたい**：角を残して線分を曲げる**sSmooth**を検討します。
- **輪郭を構成する点の取り方を変えたい**：[sResample](./sresample)はサンプリングを変える処理です。見た目が同じになるとは限りません。

<!-- capture:S277 -->

## 実機例：四角形の辺を曲線にする

`sRectangle` を分岐し、一方を `sSmooth` に接続してSmoothとSmooth Curvatureを1に設定しました。それぞれを `sRender` で画像化すると、この静止画では処理後の輪郭が曲線状に見えます。頂点の厳密な保存は未検証です。Viewerの市松模様は透明部分の表示です。[接続と設定の記録](/img/fusion/captures/S277/readback.json)に条件を記載しています。

[![sSmoothの処理前後を比較するノード構成](/img/fusion/captures/S277/graph.png)](/img/fusion/captures/S277/graph.png)

四角形を分岐し処理前後を画像化します。

[![sSmoothのInspector](/img/fusion/captures/S277/controls.png)](/img/fusion/captures/S277/controls.png)

SmoothとSmooth Curvatureは1です。

[![処理前の白い四角形](/img/fusion/captures/S277/low.png)](/img/fusion/captures/S277/low.png)

処理前は直線の辺を持つ四角形です。

[![輪郭が曲線状に変化した図形](/img/fusion/captures/S277/high.png)](/img/fusion/captures/S277/high.png)

処理後の輪郭は曲線状に見えます。

[再現用Graph](/img/fusion/captures/S277/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S277/capture.json)

<!-- /capture:S277 -->

## 入力と出力

| 段階 | データ | 役割 |
| --- | --- | --- |
| 入力 | Shape | 前段で作った輪郭・図形を受け取る。 |
| 処理 | 線分の変形 | 角を保持する考え方で、辺を滑らかにする。 |
| 出力 | Shape | 加工後の図形を、ほかのShapeツールやsRenderへ渡す。 |

Shape入力／Shape出力という分類はCOLLECTANEAのノードカタログに基づきます。**コネクターの正式ラベル、端子数、追加のマスク入力などは未確認**です。通常の画像用BlurやMergeにそのままつなぐのではなく、[sRender](../shapes/s-render)で画像化する境界を設けます。

## 最初に比較する構成

以下はノードの役割から組み立てた**実機確認用の構成案**であり、各設定値や出力形状を検証済みのレシピではありません。

```text
sPolygon ──→ sSmooth ──→ sRender ──→ MediaOut
  輪郭を作る   辺を滑らかにする  画像化     結果を見る
```

1. [sPolygon](../shapes/spolygon)で、辺の折れ方と角の位置を比較しやすい形を作ります。まず`sPolygon → sRender`だけで元の輪郭を確認します。
2. sPolygonとsRenderの間にsSmoothを追加し、入出力が接続できることを確認します。
3. Inspectorで利用できる項目を確認し、まずは**一つの設定だけ**変更します。公式資料にない名称や推奨値を前提に操作しないでください。
4. sSmoothを通した結果と通さない結果を見比べ、**どの辺が曲がり、どの角が残るか**を観察します。角の保持具合だけでなく、輪郭の広がり・縮みも比較します。
5. 比較が難しければ、図形を単純化して再確認します。曲線や角の増減が意図と異なる場合、sSmoothの有無を切り替えて原因を分けます。

比較対象として[sRectangle](../shapes/srectangle)も使えます。ただし、元から単純な直線で構成される四角形にどの程度の変化が出るかは、このManualの一文だけでは断定できません。

## 制作での使い方

### 角のあるロゴの辺を調整する

エッジの強いロゴで、角の印象は残しつつ、角同士を結ぶ輪郭の線を調整したいときの候補です。元のパスを確定させた後段にsSmoothを置くことで、**作図**と**辺の見た目の調整**を分けて検討できます。

```text
sPolygon → sSmooth → sRestyle → sRender → Merge
```

[sRestyle](./srestyle)はShapeの塗りや輪郭線の見た目を変更するツールです。ここではsSmoothが輪郭の形、sRestyleが色や線の外観を担うという役割分担です。**sRestyleとsSmoothの併用結果は実機未確認**であるため、複雑なShapeを扱う前に一つの図形で確かめます。

### 角丸と辺の曲線を比較して決める

アイコンの輪郭を柔らかく見せたい場合は、最初から「滑らか＝角丸」と決めず、**どこを変えたいのか**で選びます。

- 角だけの印象を和らげたいなら、sRoundを試す。
- 角はデザイン上の基準として残し、辺の形を変えたいなら、sSmoothを試す。
- 図形全体を一回り太く・小さくしたいなら、輪郭の拡張・収縮を担う[sOffset](../shapes/soffset)を検討する。

これらは役割が異なり、同じ数値を入れて同じ結果になる種類の機能ではありません。

## 関連ノードとの違い

| ノード | 主な対象 | 違い |
| --- | --- | --- |
| **sSmooth** | Shapeの辺 | 線分を曲げて滑らかな辺を作り、角を保持する。 |
| [sRound](./sround) | Shapeの角 | 辺を保ちながら角に曲線を作る。 |
| [sResample](./sresample) | 輪郭のサンプリング | 輪郭をどのようにサンプリングするかを変更する。 |
| [sOffset](../shapes/soffset) | 輪郭の広がり | 外側への拡張・内側への収縮を扱う。 |
| [sRestyle](./srestyle) | 塗り・輪郭線の外観 | 図形の色や線の見え方を上書きする。 |
| [sRender](../shapes/s-render) | データ形式 | Shapeを2D画像へ変換する。 |

特に**sSmoothとsRoundの違いは「辺」か「角」か**です。sResampleも輪郭に関係しますが、線分を曲げるツールと同じ操作ではありません。

## 確認済みの範囲と注意点

- **21.1 Manualで確認済み**：KrokodoveのShape Toolsに属すること。線分を曲げて滑らかな辺を作り、角を保持すること。
- **カタログによる分類**：Shapeを入力として扱い、加工後もShapeとして次段へ渡す構成。
- **未確認のInspector仕様**：今回のSmoothとSmooth Curvature以外の項目の意味、初期値、上下限、計算方式、アニメーション対応。
- **未確認の幾何学的挙動**：閉じた輪郭と開いた線の差、複数Shapeへの適用、鋭角・短い辺・自己交差での結果、頂点の移動や増減。
- **未確認の環境差**：Resolve Free／Studio、Fusion Studioの提供差や別環境でのUI表示。

制作例は用途の検討と確認手順です。実機例は四角形の静止画の一条件に限られ、頂点の厳密な保存は未検証です。

## バージョンと出典

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 105「Krokodove Nodes」、p.2437「Shape Tools — sSmooth」。同ページのsRound、sResample、sOffset、sRestyleも、機能の違いを整理する際に参照しました。

Shapeデータの基本は同ManualのShape Nodesに関する章と[シェイプ（Shape）](../../learn/02-data/shape)を参照してください。別の形やInspectorの詳細、頂点の厳密な保存は未確認のため、`verification: partial`を維持します。
