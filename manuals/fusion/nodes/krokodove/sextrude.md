---
title: sExtrude
description: KrokodoveのsExtrudeがShapeに押し出し加工を加える意味と、Extrude 3Dや画像用Extrudeとの違い、実機での確認手順。
doc_type: node
term_id: sextrude
term_short: 接続したShapeへ押し出し加工を加えるKrokodoveツール。出力型は要確認。
verification: partial
aliases: [sExtrude]
concepts: [shape-data]
nodes: [sExtrude]
node_family: krokodove
inputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# sExtrude

**sExtrude**は、前段から受け取った**Shapeに押し出し加工を加える**Krokodoveのツールです。DaVinci Resolve 21.1 Reference Manualでは、Chapter 105の「Shape Tools」に掲載され、接続したShapeを押し出すためのコントロールを備えると説明されています。

ここでいう<Term id="shape-data">Shape</Term>は、円や四角形の輪郭などを**画像のピクセルに変える前の図形データ**として扱うものです。[Shapeの基礎](../../learn/02-data/shape)では、通常の2D Imageとの違いを説明しています。

「押し出し」という名前だけで、**sExtrudeの出力が3Dオブジェクトになるとは判断できません**。公式ManualのsExtrudeの説明は一文で、加工方向・具体的な形状・出力データの種類を特定していないためです。

## 押し出し加工とは

一般に図形の「押し出し」は、元になる輪郭や面をもとに、そこから**延びた部分や厚みを作る**操作を指します。例えば、平面の四角形に奥行きを付けると、正面の四角形に加えて側面が見える板状の立体を考えられます。

ただし、これは**押し出しという言葉の説明**です。sExtrude自身が3Dの側面を作るのか、Shapeを平面内で伸ばすのか、あるいは別の方式なのかは21.1 Manualの一文からは分かりません。具体的な絵やパラメータを既知のものとして説明せず、出力を確認したうえで用途を判断します。

## 入力と出力

| 段階 | 確認できること | まだ確認できないこと |
| --- | --- | --- |
| **入力** | 前段から接続したShapeを加工する。 | 正式な入力端子名・端子数、補助入力の有無。 |
| **処理** | Shapeを押し出すためのコントロールがある。 | 押し出しの方向・方式、個々のInspector項目と値域。 |
| **出力** | 加工結果を後段へ渡すツールである。 | **Shape / Image / Classic 3Dのどれを出力するか**、正式な端子名。 |

入力をShapeとして整理した根拠は、Manualの「connected shape」という記述と「Shape Tools」の分類です。**出力型は一次資料で確定できないため、frontmatterの`outputs`にも推測値を記入していません。** Krokodoveの他のs系ツールがShapeを出力するからといって、sExtrudeも必ず同じとは限りません。

出力の種類によって、その後の接続は変わります。

- **Shape出力の場合**：さらにShape加工を続け、通常の画像へ移る地点で[sRender](../shapes/s-render)を使います。
- **Classic 3D出力の場合**：[Merge 3D](../3d/merge-3d)などの3D系へ渡し、[Renderer 3D](../3d/renderer-3d)で画像化します。
- **2D Image出力の場合**：通常のMergeなど、Image系の接続先を使います。

この三つは**出力を確認した後に選ぶ分岐**であり、sExtrudeが三種類を切り替えられるという説明ではありません。

## 最初に確認する構成

実機では、見慣れた図形を一つだけ使い、加工の前後を比較すると働きを判断しやすくなります。次は**確認用の構成案**で、sExtrudeの端子や描画結果を21.1実機で検証済みという意味ではありません。

```text
sRectangle → sExtrude → ［出力型に合う後段］ → Viewer
  元の四角形   押し出し加工      接続先を確認
```

1. まず[sRectangle](../shapes/srectangle)を[sRender](../shapes/s-render)へ接続し、加工前の四角形を表示します。これを比較の基準にします。
2. sExtrudeを追加し、**Shapeを受け取る端子**を実際のFlowで確認してからsRectangleと接続します。
3. sExtrudeの出力端子とViewerの表示、接続できる後段ノードを確かめます。sRenderへ直接つながらなければ、Shape出力だと決めつけて接続を繰り返さず、データの種類を調べます。
4. Inspectorに実在するコントロールを一つずつ変更し、元の四角形と比較します。**どの部分が延びるか、形がどう変わるか、平面か立体か**を観察します。
5. 次に[sPolygon](../shapes/spolygon)など輪郭の違うShapeでも比較します。元の輪郭の形が効果へどう関わるか、閉じた形と開いた形で挙動が違うかは確認項目です。

変化が見えないときは、まずsExtrudeを外して基準の四角形が表示できる状態へ戻します。その後、**入力・出力の接続、表示しているノード、Inspectorで変更した項目**を別々に見直します。押し出し加工はビューの向きによって分かりにくい可能性もありますが、sExtrudeに3Dカメラが必要だと確認されたわけではありません。

## 制作で検討できる用途

### 図形の厚みや延びを使った装飾

タイトルの背後に置く四角形やロゴの輪郭に、平らな図形とは異なる見え方を加えたい場合の候補です。まず単純なShapeで、押し出し後の形がどのように現れるか調べます。

その結果が狙ったデザインに合うなら、後段の処理で色や合成を整えます。**立体の側面・影・面取りを個別に調整できる機能がsExtrudeに備わる、という意味ではありません。**

### Shapeの種類による差を比べる

同じ設定で、四角形、円、多角形を順に入力して違いを見ます。どの輪郭がどう延びるかを先に知っておけば、複雑な図形で結果を予想しやすくなります。

異なるShapeをまとめた入力でどう処理されるか、塗りと輪郭線の設定が反映されるかは、単一Shapeでの確認後に調べます。複数の図形への一括適用を前提にした手順ではありません。

## 似た名前のノードとの違い

| ノード | 一次資料で確認できる役割 | 接続先の考え方 |
| --- | --- | --- |
| **sExtrude** | KrokodoveのShapeを押し出す。 | **結果のデータ型を確認してから**決める。 |
| [Extrude](./extrude) | Krokodoveの画像用ツール。エッジの変形で奥行き感を作る。 | Imageを扱う処理として、Shape加工とは区別する。 |
| [Extrude 3D](../3d/extrude-3d) | Shapeから**厚みのあるClassic 3D形状**を作り、面取りも付けられる。 | 3Dの形状をMerge 3Dへ渡し、Renderer 3Dで描画する。 |
| [sOffset](../shapes/soffset) | Shapeの**輪郭を広げる・縮める**。 | 輪郭の外側・内側への変化が目的ならこちらを検討する。 |

**確実に3D形状を作りたい場合は、Extrude 3Dの方が仕様を確認しやすい選択肢です。** 21.1 ManualのChapter 88には、`ShapeInput`・`MaterialInput`・`BevelMaterialInput`、`Extrusion Depth`、`Bevel Depth`などが個別に記載されています。例えば次の構成はExtrude 3D向けのものであり、sExtrudeで成立することを示すものではありません。

```text
sRectangle → Extrude 3D → Merge 3D → Renderer 3D → Merge
       Shape            Classic 3D          Image
```

名前に「Extrude」が含まれることだけを根拠に、これらのノードの端子・Inspector項目を共通仕様として扱わないでください。

## 現時点の確認範囲

**21.1 Manualで確認済み**：sExtrudeはKrokodoveの「Shape Tools」に分類され、接続したShapeを押し出すコントロールを持ちます。

**実機で確認が必要**：出力データ型、端子名と数、押し出し方向、形状の生成規則、Inspectorの正式名称・初期値・値域、開いた輪郭や複数Shapeの扱い、アニメーション対応、Resolve Free／Studio／Fusion Studioでの提供差。

同じ「押し出し」でも、見た目だけの奥行き表現、Shapeの輪郭操作、実際の3Dジオメトリ作成は別の処理です。**用途に必要なデータの種類を先に決める**と、別ノードを取り違えずにすみます。

## バージョンと出典

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2437、Shape Tools — sExtrude**。確認できるのは、接続Shapeへの押し出し加工と、そのためのコントロールがあることまでです。
- **比較資料**：同Manual、Chapter 88「3D Nodes」、**pp.1942–1944、Extrude 3D [3Ex]**。こちらは3D出力・入力・面取り関連の機能を具体的に説明しています。
- **関連概念**：[Shapeの基礎](../../learn/02-data/shape)、[sRender](../shapes/s-render)、[Krokodoveツール一覧](./)。

実機で未確認の項目を残しているため、`verification: partial`を維持します。
