---
title: sTriangulate
description: Shapeに交差する線を描き、図形を三角形に区切るKrokodoveツールの働きと使用例を説明。
doc_type: node
term_id: striangulate
term_short: Shapeに交差線を描き、図形を三角形に区切るKrokodoveツール。
verification: partial
aliases: [sTriangulate]
concepts: [shape-data]
nodes: [sTriangulate]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# sTriangulate

**sTriangulate**は、図形の上に**交差する線を描き、三角形に分かれた見た目を作る**KrokodoveのShapeツールです。DaVinci Resolve 21.1 Reference ManualのChapter 105では、Shapeの上に交差線を描き、図形を三角形に分ける機能として説明されています。

ここでいう<Term id="shape-data">Shape</Term>は、円や四角形、多角形などを、画像のピクセルにする前の**図形データ**として扱うものです。sTriangulateは、完成した2D画像に格子模様を重ねるImageフィルターとは異なります。まず[シェイプ（Shape）](../../learn/02-data/shape)でこの違いを確認できます。

## 「三角形に分ける」とは

四角形を例にすると、元の図形には外周の4辺があります。その内側に斜めの線を引いて交差させると、領域が三角形に区切られて見えるようになります。sTriangulateは、**元の図形に対して交差線を作る**ためのツールです。

ただし、この四角形の例は**三角分割という考え方の説明**であり、sTriangulateが必ず対角線を引くことや、決まった数の三角形を作ることを示していません。線の配置規則、交点の数、線が外周や角へどう接続されるかはManualだけでは分かりません。

また、「三角形に分かれて見える」ことと、**各三角形を独立したオブジェクトとして選択・移動できる**ことは別です。後者は未確認であり、できるものとして制作手順に組み込まないでください。

## 入力と出力

| 段階 | データ | 役割 |
| --- | --- | --- |
| 入力 | Shape | 上流で生成した四角形や多角形などを受け取る。 |
| 処理 | 交差線の生成 | 図形上に線を描き、三角形の区切りを作る。 |
| 出力 | Shape | 後続のShapeツールやsRenderへ渡す。 |

Shape入力・Shape出力という分類は、**COLLECTANEAの既存カタログとManualのShape Tools分類**に基づきます。公式の該当節に、正式な端子名・数・補助入力の有無は示されていません。ポート仕様の実機確認は別途必要です。

通常の画像処理へ接続するときは、[sRender](../shapes/s-render)でShapeを2D Imageに変換します。sTriangulateが形を加工する段階と、sRenderが画像にする段階を分けて考えます。

## 最初に試す構成

次は**ノードの役割から組み立てた実機確認用の構成案**です。21.1実機での接続と出力を検証済みのレシピではありません。

~~~text
sRectangle → sTriangulate → sRender → MediaOut
   四角形       交差線を作る      画像化      表示
~~~

1. [sRectangle](../shapes/srectangle)で大きめの四角形を作ります。最初は`sRectangle → sRender`だけで表示し、加工前の形を確認します。
2. 間にsTriangulateを追加し、Shape同士の接続が成立するかを確かめます。
3. sTriangulateのInspectorに実際に表示されるコントロールを確認します。線の数・間隔・向き・太さなどの設定が**存在すると仮定しない**でください。
4. sTriangulateの有効／無効を比べ、内側の線、交点、外周の変化を確認します。sRenderの画像サイズとViewer倍率は固定します。
5. 次は[sPolygon](../shapes/spolygon)で辺の長さや角の数が異なる図形を作り、分割の見え方を比較します。

線が見えない場合は、まずsTriangulateを外したsRender出力へ戻り、入力Shapeが表示できているかを確認します。図形の設定と出力解像度を同時に変えると、どの工程の影響か分かりにくくなります。

## 制作での使い方

### 三角形で区切られたタイトル背景

文字の背後に置くプレートを、均一な一枚の図形から、三角形の区切りが見えるグラフィックへ変えたい場合に検討できます。

~~~text
sRectangle → sTriangulate → sRender → Merge → MediaOut
   図形         交差線          画像化    背景と合成
~~~

この用途で確認されているのは**区切りを作る線**であり、三角形ごとに異なる色を自動設定する機能ではありません。必要な外観の調整は、[sRestyle](./srestyle)などの別ツールも検討します。ただし、sRestyleがsTriangulateの交差線にどのように作用するかは実機未確認です。

### 多角形に対する線の入り方を調べる

[sPolygon](../shapes/spolygon)で細長い図形、角の多い図形などを作り、元の輪郭を保つか、内部にどのような交差線が現れるかを比較できます。形状によって三角形の数や大きさがどう変わるかは、観察項目です。**一定の分割規則を保証する説明ではありません**。

### Shapeの外観変更との順番を比べる

図形を区切る工程と、図形の塗り・輪郭線の外観を変える工程を分けて確認したい場合は、以下の順番を比較する方法があります。

~~~text
sPolygon → sTriangulate → sRestyle → sRender
sPolygon → sRestyle → sTriangulate → sRender
~~~

これは**比較実験の構成案**です。どちらも同じ表示結果になるか、線の外観を独立して調整できるかは確認されていません。まず単純な図形を使い、どの段階で見た目が変わるか調べます。

## 関連ノードと注意点

| ノード | 主な役割 | 違い |
| --- | --- | --- |
| **sTriangulate** | Shapeの上に交差線を作る | 三角形で区切られた見た目を作る。 |
| [sZigZag](./szigzag) | 輪郭の各線分を波打たせる | 内部の区切りよりも外周の変形が中心。 |
| [sRound](./sround) | Shapeの角を曲線にする | 内部へ交差線を描く機能ではない。 |
| [sResample](./sresample) | 輪郭のサンプリングを変更する | 三角形の分割とは異なる操作。 |
| [sRestyle](./srestyle) | Shapeの塗り・輪郭の外観を上書き | 線の生成と外観の変更を区別する。 |
| [Triangulate 3D](../3d/triangulate-3d) | 3Dメッシュの面を三角形ポリゴンに分ける | Shapeとは異なる3Dデータ領域。 |

特に**sTriangulateとTriangulate 3Dを混同しない**ようにします。sTriangulateについて公式Manualが述べているのは、Shape上に交差線を描く働きです。3Dメッシュのポリゴン構造を変更する操作や、外部向けの三角形メッシュを書き出す機能があるとは説明されていません。

## 確認できていること・いないこと

**21.1 Manualで確認済み**：sTriangulateはKrokodoveのShape Toolsに分類され、図形の上に交差線を描いて三角形に分けます。

**既存カタログによる整理**：Shapeを入力・出力として扱い、通常の2D画像処理へ進むときはsRenderで画像化します。

**実機で未確認**：Inspectorの正式項目名・初期値・値域、端子名と数、分割アルゴリズム、三角形の独立性、塗りと線の関係、複数Shapeでの挙動、キーフレーム対応、Resolve Free／Studio／Fusion Studioでの提供差。

## バージョンと出典

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2437「Shape Tools — sTriangulate」。

関連資料：同Manual Chapter 117「Shape Nodes」、[シェイプ（Shape）](../../learn/02-data/shape)、[sRender](../shapes/s-render)、[Triangulate 3D](../3d/triangulate-3d)。本記事の接続例は動作を確認するための構成案であり、実機検証済みの手順ではありません。したがって`verification: partial`を維持します。
