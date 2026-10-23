---
title: Shapes
description: 同じ中心を持つ大小の円や四角形を重ねた模様を生成するKrokodoveの画像ツール。Pattern・PackやFusionのShapeデータとの違いを説明。
doc_type: node
term_id: shapes
term_short: 同じ中心を共有する大小の円や四角形を複数重ねた模様を作る、Krokodoveの画像生成ツール。
verification: partial
aliases: [Shapes]
concepts: [image-data]
nodes: [Shapes]
node_family: krokodove
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Shapes

Shapesは、**同じ中心を持つ大小の図形を複数重ねた模様**を作るKrokodoveの画像生成ツールです。DaVinci Resolve 21.1 Reference Manualでは「Image Create Tools」に分類され、円や四角形などの同心図形を複数段生成すると説明されています。

たとえば大小の円が一つの中心を囲む配置なら、的のような模様になります。四角形なら、大きな四角形の内側に小さな四角形が重なる配置です。ただし、輪郭線になるのか塗りつぶしになるのか、各段の間隔を調整できるのかは、Manualの短い説明だけでは確定できません。

## 「同心」と「複数段」の意味

**同心（concentric）**とは、複数の図形が同じ中心を共有していることです。「図形が画面のあちこちに並ぶ」という意味ではありません。

「複数段（multiple levels）」は、中心を共有する図形が何重にも配置されるという説明です。ここでいう段は、FusionのNode Editorに複数のノードやレイヤーを自動作成するという意味ではありません。形の数、重なり順、色、余白をどこまで指定できるかは実機で確認する必要があります。

名前は似ていますが、このShapesはFusionの<Term id="shape-data">Shapeデータ</Term>を作る標準Shapeノードとは区別します。Shapeデータは円や線などの輪郭情報を後段に渡す仕組みで、通常は[sRender](../shapes/s-render)で画像に変換します。一方、KrokodoveのShapesはManual上の**Image Create Tools**に属し、このリポジトリでは出力を<Term id="image">Image</Term>に分類しています。

## 入力と出力

| 段階 | 扱うもの | 確認範囲 |
| --- | --- | --- |
| 入力 | 画像入力が必要か、別の入力を受けるかは未確認 | 21.1 Manualの一覧には入力端子の説明がありません。名称から必須入力を作りません。 |
| 生成 | 共通の中心を持つ、円・四角形などの複数段の図形 | 21.1 Manual、Chapter 105のShapes項目で確認。 |
| 出力 | 2D画像として扱う分類 | Manualの「Image Create Tools」と既存カタログによる分類。正式な端子名、Alphaの内容、画像サイズの決まり方は未確認。 |

最小構成を考える際、前段に画像が必須だと決めつけないことが重要です。まずShapes単体をViewerに表示し、出力が得られるか確認してください。入力が必要と表示された場合は、実際の端子を調べてから接続します。

## 主な用途と制作例

用途として考えられるのは、タイトルの背後に置く幾何学模様、円や四角形を繰り返した抽象的な背景、中心に視線を集めるモーショングラフィックスなどです。これらは**同心図形を生成するという説明から考えた制作案**であり、公式作例や実機検証済みのプリセットではありません。

### 例：タイトル背景用の同心図形を試す

1. FusionでKrokodoveのShapesを追加し、まずShapesの出力だけをViewerで確認します。表示できたら、円や四角形のどちらが使えるか、何重に表示されるかを観察します。
2. Inspectorで図形の種類・数・大きさなどを変更できる項目が見つかった場合は、一度に一つだけ変えます。**項目名や、これらをすべて変更できるかどうかは未確認**です。
3. 模様を別の背景に重ねる場合は、下のように通常の画像用[Merge](../compositing/merge)へ渡す構成を検討します。これはFusionの画像合成機能を使った構成案で、Shapes固有の公式接続例ではありません。

```text
Background ──────────────┐
                         Merge → MediaOut
Shapes ──────────────────┘
```

4. MergeのBackground（BG）には背景画像、Foreground（FG）にはShapesの出力を接続します。模様の周囲まで背景が覆われた場合は、Shapesの**Alpha（透明度）**をViewerで調べます。Shapesが自動的に透明背景を出力するとは確認できていません。
5. 動きを付けたい場合は、実際にキーフレームを設定できるパラメータがあるか確認します。図形の数や大きさのアニメーション可否、変化の補間方法はManualの一覧では説明されていません。

## Pattern・Pack・Shapeノードとの違い

| ツール | 何を作る・扱うか | 選ぶ目安 |
| --- | --- | --- |
| **Shapes** | 同じ中心を共有する円や四角形を複数段作る | 中央から内外へ重なる幾何学模様 |
| [Pattern](./pattern) | 図形をタイルのように敷き詰め、画面全体の模様を作る | 同じ図形を画面に広く繰り返す |
| [Pack](./pack) | 指定したカラーチャンネル内に図形を重ねたパターンを作る | RGBなど色成分と模様の関係を調べたい |
| [sEllipse](../shapes/s-ellipse)などの標準Shapeノード | 図形の輪郭をShapeデータとして作り、他のShapeノードへ渡す | 描画前の輪郭そのものを加工・合成したい |

ShapesとPatternはどちらも画像の模様を作りますが、**中心を共有する入れ子の配置**と**画面に敷き詰める配置**は別です。また、Packの「stacked shapes」は特定のカラーチャンネル内のパターンを指し、Shapesと同じ種類の図形・設定が使えるとは限りません。

## 出典・バージョン・確認できていないこと

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2435。「Image Create Tools」にShapesが掲載され、円・四角形などの複数段の同心図形を生成すると説明されています。
- **既存分類**：COLLECTANEAのFusion Node Referenceでは、Krokodove Shapesの出力を画像に分類しています。詳しくは[Family Overview](./)を参照してください。
- **未確認**：必須入力の有無、正式な端子名・端子数、具体的なInspector項目と初期値・範囲、図形の塗り・輪郭・重なり方、Alphaと画像解像度、アニメーション対応、Edition差、21.1実機での描画結果。

`verification: partial`は、Manualで確認できた役割と、実機または詳細資料で未確認の仕様を区別するための状態です。
