---
title: Lines
description: 線を繰り返し並べて模様を作るKrokodoveの画像生成ツール。線の組、反復の意味、Patternとの違い、合成例を説明。
doc_type: node
term_id: lines
term_short: 線の組を一つまたは複数使い、繰り返し配置した線模様を生成するKrokodoveのツール。
verification: partial
aliases: [Lines]
concepts: [image-data]
nodes: [Lines]
node_family: krokodove
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Lines

Linesは、**線を何本も繰り返し配置して模様を作る**Krokodoveのツールです。DaVinci Resolve 21.1 Reference Manualでは「Image Create Tools（画像生成ツール）」に分類され、線の組を一つまたは複数用いて、何段にも繰り返す線のパターンを作ると説明されています。

たとえば一定の方向へ並ぶ線は、縞模様のような背景になります。複数の線の組を組み合わせれば、単一の縞とは異なる重なりを持つ模様も考えられます。ただし、**縦線・横線・斜線の選択、線幅、間隔、組の重ね方をどこまで調整できるかは、Manualの一覧説明だけでは確認できません**。これらは仕組みを理解するための例であり、特定のプリセットや描画結果を確認したものではありません。

## 「line set」と「multiple levels」の意味

`line set`は、一つのまとまりとして扱う**線の組**を指します。一組に線が一本しかないという意味ではありません。Linesは一組または複数組の線でパターンを生成すると説明されています。

`multiple levels of repeating lines`は、線の繰り返しが複数段あるという説明です。ただし、この「段」が独立したレイヤー、入れ子の反復、異なる設定の線の組のいずれを意味するかは、短い資料から確定できません。Node Editorに複数のノードが自動作成されるという説明でもありません。

ここでの「線」は**画像に描かれる線模様**で、Fusionの標準Shape系が扱う<Term id="shape-data">Shapeデータ</Term>（図形の輪郭などを保持し、描画前に加工できる情報）とは区別します。Shapeデータを画素画像に変換するときは[sRender](../shapes/s-render)を使用します。

<!-- capture:S250 -->

## 実機例：繰り返し線を生成する

`Lines` から画像を生成し、FirstのAngle 1を45、Spacing 1を0.1に設定しました。

この例では白い繰り返し線が見えます。Viewerには市松模様と操作用オーバーレイが表示されています。他の線の組やAlphaの数値は未検証です。[接続と設定の記録](/img/fusion/captures/S250/readback.json)に条件を記載しています。

[![Krokodove Linesを出力へつなぐ構成](/img/fusion/captures/S250/graph.png)](/img/fusion/captures/S250/graph.png)

Linesの出力をMediaOutへ渡します。

[![LinesのInspector](/img/fusion/captures/S250/controls.png)](/img/fusion/captures/S250/controls.png)

Angle 1を45、Spacing 1を0.1に設定しています。

[![Linesで生成した白い線模様](/img/fusion/captures/S250/high.png)](/img/fusion/captures/S250/high.png)

白い繰り返し線が表示されています。

[再現用Graph](/img/fusion/captures/S250/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S250/capture.json)

<!-- /capture:S250 -->

## 入力と出力

| 段階 | 扱うもの | 確認できる範囲 |
| --- | --- | --- |
| 入力 | 外部画像なしで生成した実機例 | 21.1 ManualのLinesの説明には入力端子の記述がなく、全端子の条件は未確認です。 |
| 生成 | 一つまたは複数の線の組による、複数段の反復模様 | Chapter 105、p.2435で確認できます。 |
| 出力 | 2Dの<Term id="image">Image</Term>として扱う分類 | Manualの「Image Create Tools」と既存カタログによります。正式な端子名、Alpha、画像サイズは未確認です。 |

「画像生成」という分類は、入力なしで必ず動作することの証明にはなりません。まずLines単体の出力をViewerで確認し、入力が必要と表示されたら実際の端子を調べてから接続します。旧記事の`Image / Source → Lines → Result`という図は、必須入力を根拠なく仮定していたため採用しません。

## 主な用途

- **線模様の背景**：タイトルやテロップの背後に反復する線を置く。
- **幾何学的な装飾**：ロゴの周辺や画面端のアクセントとして使う。
- **合成用テクスチャー**：別の映像と重ね、合成量を減らして薄い模様にする。

これらは線の反復パターンを作るという役割から考えた制作案です。上の実機例ではAngle 1とSpacing 1を設定しました。アニメーションや他の線・色の設定は未確認です。

## 制作例：映像の上に線模様を薄く重ねる

1. FusionでKrokodoveのLinesを追加し、出力をViewerへ表示します。線の繰り返し方、模様が画面全体を覆うかを確認します。
2. Inspectorに線の見た目に関係する項目があれば、一項目ずつ変更して結果を比較します。**線幅・間隔・方向・組数は観察項目の例であり、確認済みのInspector項目名ではありません**。
3. 映像や背景画像に重ねたい場合は、標準の[Merge](../compositing/merge)を使う構成を検討します。映像をBackground（BG）、Linesから得た画像をForeground（FG）に接続します。

```text
映像・背景画像 ─────→ Merge（BG） ─→ MediaOut
Linesの出力 ────────→ Merge（FG）
```

4. 線模様が背景をすべて覆う場合は、Linesの出力でAlpha（透明度）がどうなっているかをViewerで確認します。透明な余白があるとは限りません。薄く重ねるだけならMergeの`Blend`で合成結果と元のBackgroundの割合を調整します。
5. 線模様に動きを付けるときは、実機でキーフレームを設定できる項目を調べます。Manualの一覧にはアニメーション可能なControlや補間方式の説明はありません。

これはFusion標準の合成機能を使った**制作案**です。Lines固有の入出力端子やAlpha処理を実証する公式作例ではありません。

## 似たツールとの違い

| ツール | Manualに記載された役割 | 選ぶ目安 |
| --- | --- | --- |
| **Lines** | 一つまたは複数の線の組で、複数段の反復模様を作る | 繰り返す線そのものが欲しい場合 |
| [Pattern](./pattern) | 図形をタイル状に敷き詰め、フレーム全体に模様を作る | 面を図形で埋めたい場合 |
| [Shapes](./shapes) | 同じ中心を共有する円や四角形を複数段作る | 同心の図形が欲しい場合 |
| [Blobs](./blobs) | 指定した点に円形の図形を作る | 点を基準にした円形の模様が欲しい場合 |
| [Duplicate（Krokodove）](./duplicate) | 入力画像をパターンや形状に沿って複製する | 既存のロゴ・画像そのものを繰り返したい場合 |

LinesとPatternはどちらも規則性のある背景を作れますが、**Linesは線の反復、Patternは図形の敷き詰め**です。同じ配置や制御項目を持つとは確認されていません。

## 出典・バージョン・未確認事項

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2435、「Image Create Tools／Lines」。線の組を一つまたは複数用い、複数段の繰り返し線パターンを生成する説明を確認しました。同ページにBlobs、Pattern、Shapesが掲載されています。
- **既存分類**：COLLECTANEAはLinesを2D Image出力として整理しています。KrokodoveのImage・Shape・3D・Regionの違いは[Family Overview](./)を参照してください。
- **確認範囲**：実機例では外部画像なしで線を生成し、Angle 1とSpacing 1を設定しました。端子の全構成、複数の線の組、初期値・範囲、Alphaの数値、アニメーション、Edition差は未確認です。

`verification: partial`は、Manualで確認できる役割と、詳細資料・実機で未確認の仕様を分けるための状態です。
