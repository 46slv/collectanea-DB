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

## 入力と出力

| 段階 | 内容 | 確認範囲 |
| --- | --- | --- |
| 入力 | 画像などの外部入力が必須かは未確認 | 21.1 ManualのPattern説明には入力端子の記述がありません。入力画像を必須とは断定しません。 |
| 生成 | 図形を配列し、画面全体に広がる模様を作る | Chapter 105のPattern説明で確認できます。 |
| 出力 | 2Dの<Term id="image">Image</Term>として扱う分類 | Manualの「Image Create Tools」と既存カタログに基づきます。正式な端子名、解像度、Alphaの内容は未確認です。 |

「画像生成」という分類は、Patternが必ず入力なしで動作する証拠ではありません。まず単体でViewerへ表示できるか調べ、入力が要求された場合は実際の端子を確認します。従来の定型説明にあった `Image / Source → Pattern → Result` は、必須入力が確認できていないため確定した配線図として扱いません。

## 主な用途

**繰り返し模様の背景**には、タイトルやテロップの後ろに置く幾何学的なテクスチャーが考えられます。**画面全体に広がる装飾**には、ポスター風の背景や抽象的なモーショングラフィックスが候補になります。また、模様を別の画像と合成して、映像の色味や情報量を調整する素材にもできます。

これらは「図形を画面全体へ配列する」という機能から考えた制作案です。特定の図形、密度、色、動きをPatternだけで実現できるという実機確認ではありません。

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
- **未確認**：必須入力の有無、正式な端子名・端子数、利用可能な図形の種類、配列方法・隙間・密度、Inspectorの項目名・初期値・範囲、Alphaと解像度、キーフレーム対応、Edition差、21.1実機での描画結果。

`verification: partial`は、Manualで確認できる用途と、実機または詳細資料で未確認の仕様を分けるための状態です。
