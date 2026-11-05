---
title: Pattern
description: 図形を規則的に並べて画面全体に模様を作るKrokodoveの画像生成ツール。タイル状の配置、用途、近いツールとの違いを説明。
doc_type: node
term_id: pattern
term_short: 図形を繰り返し配置し、画面全体に幾何学模様を作るKrokodoveの画像生成ツール。
verification: partial
aliases: [Pattern]
concepts: [image-data]
nodes: [Pattern]
node_family: krokodove
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Pattern

Patternは、**図形を繰り返し並べ、画面全体に模様を作る**Krokodoveのツールです。DaVinci Resolve 21.1 Reference Manualでは「Image Create Tools（画像生成ツール）」に分類され、図形を敷き詰めるように配列して、フレーム全体のパターンを作ると説明されています。

たとえば、同じ形が縦横に繰り返された壁紙のような背景を想像すると、役割が分かりやすくなります。ただし、**三角形・六角形など、どの図形を選べるかはManualの説明だけでは確認できません**。これは配置の考え方を示す例で、Patternの実際のプリセットや描画結果ではありません。

## 「tessellated shapes」は何を意味するか

`tessellated`は、図形をタイルのように繰り返して面を構成することです。ここでの「配列」は、複数の図形が画面内に並ぶ**見た目の配置**を指します。Node Editorに図形ノードが何十個も自動追加されるという意味ではありません。

Patternの説明にある「full-frame pattern」は、模様が画面の一部分だけでなくフレーム全体に広がることを表します。各図形の境界に隙間ができるか、規則的な格子なのか、配置を回転・変形できるかといった詳細は、公式の一覧説明からは確定できません。

同じ「Shape」という言葉でも、Patternが扱うのは**画像として見える図形の模様**です。Fusionの標準Shapeノードが扱う<Term id="shape-data">Shapeデータ</Term>（描画前の図形の輪郭情報）とは区別します。Shapeデータを画素画像にする場合には[sRender](../shapes/s-render)を使用します。

<!-- capture:S253 -->

## 実機例：格子模様を生成する

`Pattern` から画像を生成し、TypeをGrid、Sizeを0.15に設定しました。

この例では青い面に白い格子が見えます。Viewerには操作用オーバーレイが表示されています。ほかのTypeやAlpha値は未検証です。[接続と設定の記録](/img/fusion/captures/S253/readback.json)に条件を記載しています。

[![Krokodove Patternを出力へつなぐ構成](/img/fusion/captures/S253/graph.png)](/img/fusion/captures/S253/graph.png)

Patternの出力をMediaOutへ渡します。

[![PatternのInspector](/img/fusion/captures/S253/controls.png)](/img/fusion/captures/S253/controls.png)

TypeをGrid、Sizeを0.15に設定しています。

[![Patternで生成した格子模様](/img/fusion/captures/S253/high.png)](/img/fusion/captures/S253/high.png)

青い面に白い格子が表示されています。

[再現用Graph](/img/fusion/captures/S253/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S253/capture.json)

<!-- /capture:S253 -->

## 入力と出力

| 段階 | 内容 | 確認範囲 |
| --- | --- | --- |
| 入力 | 外部画像なしで生成した実機例 | 21.1 ManualのPattern説明には入力端子の記述がなく、全端子の条件は未確認です。 |
| 生成 | 図形を配列し、画面全体に広がる模様を作る | Chapter 105のPattern説明で確認できます。 |
| 出力 | 2Dの<Term id="image">Image</Term>として扱う分類 | Manualの「Image Create Tools」と既存カタログに基づきます。正式な端子名、解像度、Alphaの内容は未確認です。 |

上の実機例では外部画像を接続せずにPatternの出力を表示しました。全端子の条件は未確認です。従来の定型説明にあった `Image / Source → Pattern → Result` は、必須入力が確認できていないため確定した配線図として扱いません。

## 主な用途

**繰り返し模様の背景**には、タイトルやテロップの後ろに置く幾何学的なテクスチャーが考えられます。**画面全体に広がる装飾**には、ポスター風の背景や抽象的なモーショングラフィックスが候補になります。また、模様を別の画像と合成して、映像の色味や情報量を調整する素材にもできます。

これらは「図形を画面全体へ配列する」という機能から考えた制作案です。実機例のGrid以外の図形や動きは確認していません。

## 制作例：タイトルの背後に模様を置く

1. FusionでKrokodoveのPatternを追加し、出力をViewerに表示します。入力端子が必要と表示される場合は、その種類を確認してから素材を接続します。
2. Viewerで、画面のどこまで模様が広がるか、同じ形がどのように繰り返されるかを見ます。Inspectorに配置・大きさ・色などの変更項目が存在する場合は、一度に一つだけ変えて結果を比較します。**これらの項目名や調整可否は未確認**です。
3. タイトル用の背景画像を別に用意し、画像合成用の[Merge](../compositing/merge)でPatternと重ねる方法を試します。これはFusionの標準的な画像合成を使った構成案であり、Pattern固有の公式作例ではありません。

```text
Background（背景画像） ───→ Merge（BG） ─→ MediaOut
Pattern（模様の画像） ───→ Merge（FG）
```

4. Patternの出力で背景が完全に隠れる場合は、ViewerでAlphaを確認します。Patternが透明な余白を出力するとは確認できていません。背景全体の模様として薄く混ぜたいだけなら、MergeのBlendで合成量を調整する方法もあります。
5. 模様を動かす場合は、実機でキーフレームを設定できるパラメータを確認します。配置や形状のアニメーション対応、補間方式は21.1 Manualの一覧には書かれていません。

## 似たツールとの違い

| ツール | 公式資料で確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Pattern** | 図形を並べてフレーム全体の模様を作る | 面全体に繰り返されるパターンが必要なとき |
| [Shapes](./shapes) | 同じ中心を共有する円や四角形を複数段作る | 中央から外側へ重なる模様が必要なとき |
| [Pack](./pack) | 特定のカラーチャンネル内に、図形を重ねた模様を作る | 色成分と図形パターンを関係づけたいとき |
| [Lines](./lines) | 一組または複数組の線を繰り返し配置する | 面のタイル模様よりも、反復する線が欲しいとき |
| [Duplicate（Krokodove）](./duplicate) | 入力画像を、選んだパターンや形に沿って複製する | すでにある画像そのものを繰り返したいとき |

PatternとDuplicateの違いは特に重要です。Patternは**図形の模様を作る**ツールとして説明されていますが、Duplicateは**受け取った画像を増やす**ツールです。ロゴ画像を同じ形で繰り返したい場合、Patternの図形に置き換えるのではなくDuplicateを検討します。

## 出典・バージョン・未確認事項

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2435（Image Create Tools／Pattern）。図形を配列し、フレーム全体のパターンを作る役割を確認しました。同ページにShapes、Lines、p.2434にPack、p.2436にDuplicateの説明があります。
- **既存分類**：COLLECTANEAでは出力を2D Imageに分類しています。Krokodoveのデータ種別の違いは[Family Overview](./)を参照してください。
- **確認範囲**：実機例では外部画像なしのGridとSize 0.15を確認しました。他のType、全端子、初期値・範囲、Alphaの数値、キーフレーム対応、Edition差は未確認です。

`verification: partial`は、Manualで確認できる用途と、実機または詳細資料で未確認の仕様を分けるための状態です。
