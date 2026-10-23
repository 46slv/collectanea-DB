---
title: sResample
description: KrokodoveのsResampleがShapeの輪郭のサンプリングを変更する意味と、画像解像度との違い、接続例、関連ツールを解説。
doc_type: node
term_id: sresample
term_short: 図形の輪郭を扱うときのサンプリングを変更するKrokodoveのShapeツール。
verification: partial
aliases: [sResample]
concepts: [shape-data]
nodes: [sResample]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# sResample

**sResample**は、**Shapeの輪郭のサンプリングを変更する**Krokodoveのツールです。DaVinci Resolve 21.1 Reference Manualでは、この役割が簡潔に説明されています。ただし、点の数をどのように変更するか、点が等間隔になるか、どのような設定項目があるかまでは示されていません。

ここで扱う<Term id="shape-data">Shape</Term>とは、円や多角形の輪郭などを、まだ画像のピクセルに変換せずに持っている**図形データ**です。図形の形をShapeのまま加工し、最後に[sRender](../shapes/s-render)で通常の2D画像へ変換します。[シェイプ（Shape）](../../learn/02-data/shape)で、画像やMaskとの違いを先に確認できます。

## 「輪郭をサンプリングする」とは

図形の輪郭には直線の部分も曲線の部分もあります。この輪郭を計算で扱う際、輪郭上の**どこを読み取って形を評価するか**を考える必要があります。「サンプリング」とは、その位置の取り方を表す言葉です。

たとえば円の輪郭上の数か所を調べる場合と、多数の位置を調べる場合では、取り出せる情報が異なります。ただし、これは**サンプリングの概念を説明する例**です。sResampleが必ず点を増やす、点を等間隔に並べ直す、曲線を直線の集合へ変えるなどの動作をする、という意味ではありません。

**画像の解像度を変更する操作とは異なります。** sRenderのWidth / Heightは出力する画像の画素数を指定します。一方、sResampleは画像化する前のShapeの輪郭に関わります。最終画像の縦横サイズだけを変えたいなら、sResampleではなく画像化・解像度の設定を確認します。

## 入力と出力

| 段階 | データ分類 | 役割 |
| --- | --- | --- |
| 入力 | Shape | 前段の図形が持つ輪郭を受け取る。 |
| 処理 | 輪郭のサンプリング | 輪郭を評価するための取り方を変更する。 |
| 出力 | Shape | 後段のShapeツールやsRenderへ渡す。 |

Shape入力・Shape出力という分類は、COLLECTANEAの既存カタログとManualの「Shape Tools」分類による整理です。**正式な端子名・数、補助入力の有無は未確認**です。映像を入力して画素を加工する通常のImage Nodeと同一には扱いません。

## 最初の確認手順

次の構成は、ノードの役割から組み立てた**実機確認用の構成案**です。Inspector設定や表示結果まで確認されたレシピではありません。

```text
sPolygon → sResample → sRender → MediaOut
 図形を作る   輪郭を扱う    画像化      表示
```

1. [sPolygon](../shapes/spolygon)で角が見分けやすい多角形を作り、まず`sPolygon → sRender`で表示します。
2. sPolygonとsRenderの間にsResampleを追加し、実機で接続が成立することを確かめます。sRenderの出力画像サイズは固定します。
3. sResampleのInspectorで実際の項目名と設定可能な値を確認します。Manualから確定できないスライダー名や推奨値は仮定しません。
4. 設定を一つずつ変え、sResampleの有無による違いを同じViewer倍率で比較します。角・曲線・輪郭の位置・途切れなどを観察します。
5. 角ばった図形で違いが見えなければ、[sEllipse](../shapes/s-ellipse)のような曲線を持つ図形でも試します。画面上で変化が見えなくても、内部の情報が不変だとは断定できません。

比較するのは**何を変えると、どの輪郭にどのような差が現れるか**です。公式Manualの一文だけでは、頂点数や曲線精度の変化を予測できません。

## 制作での使い方

### 後続のShape加工との関係を確かめる

輪郭を作ってから、別のツールで線を変形する場合に、sResampleの前後で結果が異なるかを検討できます。たとえば、線分を波の形へ変える[sZigZag](./szigzag)との組み合わせを比べます。

```text
sPolygon → sResample → sZigZag → sRender
sPolygon ────────────→ sZigZag → sRender
```

これは**比較案**です。sResampleを挟むと波の数が増える、形が安定するなどの具体的な効果は、まだ確認されていません。サンプリングがすべての後続処理に影響するとも限りません。

### 輪郭の問題と画像化の問題を切り分ける

図形の端が荒く見える場合、原因がShapeの輪郭なのか、sRenderで作った画像の解像度やViewer倍率なのかを区別します。sResampleの有無だけを比べた後、**別の比較として**sRenderのWidth / Heightを変更します。両方を同時に変更すると、どちらの工程によって表示が変わったか分かりにくくなります。

### 角や辺を加工する前後で比較する

図形の角を残して辺を曲げたい場合は[sSmooth](./ssmooth)、辺を保ちながら角に曲線を作りたい場合は[sRound](./sround)が候補です。それらの前後へsResampleを配置する検証はできますが、**処理順序による改善が保証されるわけではありません**。まず各ノードを単独で比べます。

## 関連ノードとの違い

| ノード | 変える対象 | 主な用途 |
| --- | --- | --- |
| **sResample** | 輪郭のサンプリング | 輪郭の扱われ方を比較する。 |
| [sSmooth](./ssmooth) | 角と角の間の辺 | 角を保ち、辺を曲げて滑らかにする。 |
| [sRound](./sround) | 角 | 辺を保ち、角を曲線にする。 |
| [sOffset](../shapes/soffset) | 輪郭の広がり | 図形の輪郭を広げる・縮める。 |
| [sRestyle](./srestyle) | 塗り・輪郭線の外観 | 色や線の見た目を上書きする。 |
| [sRender](../shapes/s-render) | データ形式 | Shapeを2D画像へ変える。 |

sResampleの目的は、**「角を丸める」「辺を滑らかにする」ことと同じではありません**。形を変えたい部分に応じて、sRoundやsSmoothなどの役割が明示されたツールを先に検討します。

## 注意点と確認範囲

- **21.1 Manualで確認済み**：KrokodoveのShape Toolsに属し、Shapeの輪郭のサンプリングを変更すること。
- **カタログに基づく分類**：Shapeを受け取り、加工したShapeを後段へ渡す構成。
- **未確認のInspector仕様**：正確な項目名、初期値、設定範囲、単位、アニメーション、点数や間隔を指定できるか。
- **未確認の形状処理**：開いた輪郭・閉じた輪郭、複数Shape、鋭角、自己交差、曲線端部での挙動。点数・位置・形状精度がどう変わるか。
- **未確認の環境差**：Resolve Free / Studio / Fusion Studioの提供範囲、内部REGID、21.1実機での接続結果。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2437「Shape Tools — sResample」。同ページのsSmooth・sRound・sOffsetなどとの違いも参照しました。

**関連資料**：同ManualのChapter 117「Shape Nodes」、[シェイプ（Shape）](../../learn/02-data/shape)、[sRender](../shapes/s-render)。本文のサンプリングの例と接続手順は理解・検証のための説明であり、未確認の計算方式や実機結果を確定仕様とは扱いません。そのため`verification: partial`を維持しています。
