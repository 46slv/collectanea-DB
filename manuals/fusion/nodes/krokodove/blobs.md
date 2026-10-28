---
title: Blobs
description: 指定した位置に円形の図形を作るKrokodoveの画像生成ツール。点の意味、用途、他の模様生成ツールとの違い、合成例を説明。
doc_type: node
term_id: blobs
term_short: 指定した点を基準に円形の図形を生成するKrokodoveの画像ツール。
verification: partial
aliases: [Blobs]
concepts: [image-data]
nodes: [Blobs]
node_family: krokodove
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Blobs

Blobsは、**指定した点の位置に円形の図形を作る**Krokodoveの画像生成ツールです。DaVinci Resolve 21.1 Reference Manualの「Image Create Tools」に掲載されており、原文では「Blobs generates circular shapes at specified points」と説明されています。

たとえば画面の左上と右下に点を指定した場合、その点を基準に円形の模様を配置する、という考え方です。実機例では二つの位置を指定しました。点数の上限や外部入力による指定は未確認です。

## 「点」と「円形」の意味

**点（point）**は、画面内で図形を置く位置の目印です。「点そのものを画面に描く」という意味ではありません。Blobsの説明では、その指定位置に**円形の図形**が作られます。点の位置を変えれば、円形の模様を置く場所が変わると考えられますが、位置をどの操作で変更するかは実機で確かめます。

ここでいう「円形」は形の種類を示す言葉です。必ず輪郭のはっきりした真円になるのか、柔らかい縁や塗りつぶしにできるのか、半径や色を変更できるのかといった詳細は、公式の短い説明では確定できません。Blobsという名前から、液体の動き・粒子の物理演算・有機的な変形があるとも判断しません。

KrokodoveのBlobsで作るのは、画像として見える円形の模様です。Fusion標準の<Term id="shape-data">Shapeデータ</Term>（図形の輪郭を描画前のデータとして扱う仕組み）や、Particleノードの粒子とは区別します。Shapeデータを画像にする場合は[sRender](../shapes/s-render)を使います。

<!-- capture:S254 -->

## 実機例：二つの円形を生成する

`Blobs` のCountを2とし、二つの位置を（0.35, 0.5）と（0.65, 0.5）に設定しました。

この例では白い円形が二つ重なって見えます。Viewerには市松模様と位置の操作用オーバーレイが表示されています。他の設定やAlpha値は未検証です。[接続と設定の記録](/img/fusion/captures/S254/readback.json)に条件を記載しています。

[![Krokodove Blobsを出力へつなぐ構成](/img/fusion/captures/S254/graph.png)](/img/fusion/captures/S254/graph.png)

Blobsの出力をMediaOutへ渡します。

[![BlobsのInspector](/img/fusion/captures/S254/controls.png)](/img/fusion/captures/S254/controls.png)

General Radiusなどの設定が表示されています。

[![Blobsで生成した二つの円形](/img/fusion/captures/S254/high.png)](/img/fusion/captures/S254/high.png)

白い円形が二つ重なって見えます。

[再現用Graph](/img/fusion/captures/S254/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S254/capture.json)

<!-- /capture:S254 -->

## 入力と出力

| 段階 | 扱うもの | 確認できる範囲 |
| --- | --- | --- |
| 入力 | 外部画像なしで生成した実機例 | 21.1 ManualのBlobsの項目には入力端子の種類・数が書かれておらず、全端子の条件は未確認です。 |
| 生成 | 指定した点を基準に円形の図形を作る | Chapter 105、p.2435で確認できます。 |
| 出力 | 2Dの<Term id="image">Image</Term>として扱う分類 | Manualの「Image Create Tools」と既存カタログに基づきます。正式な端子名、Alpha、解像度は未確認です。 |

上の実機例では外部画像を接続せずに二つの円形を表示しました。全端子の条件は未確認です。旧記事の `Image / Source → Blobs → Result` は、未確認の画像入力を前提にしているため、確定した接続図としては使いません。

## 主な用途

位置を指定して円形の模様を作るという役割から、タイトル周辺の丸いアクセント、背景の水玉状の装飾、位置関係を示すグラフィックなどへの利用が考えられます。これらは**機能説明から考えた制作案**で、公式のプリセットや実機で再現した作例ではありません。

円が一定間隔で整列する模様を作りたいのか、個別に場所を決めて円を置きたいのかで、選ぶツールは変わります。Blobsを使う目安は後者です。ただし、点の個別指定の操作方法や個数制限は別途確認が必要です。

## 制作例：映像に円形のアクセントを重ねる

1. FusionでKrokodoveのBlobsを追加し、まず出力をViewerへ表示します。何も表示されない場合は、実際の入力端子や必要な設定を確認します。
2. 円形の図形が出たら、位置・大きさ・色・縁の見え方を観察します。Inspectorに関連項目があれば一つずつ試します。**これらの語は観察する性質であり、確認済みのInspector項目名ではありません**。
3. Blobsから2D画像が得られる場合、映像に重ねるには標準の[Merge](../compositing/merge)を使えます。映像をBackground（BG）、Blobsの画像をForeground（FG）へ接続する構成案です。

```text
映像・背景画像 ─────────────────→ Merge（BG） ─→ MediaOut
Blobs（画像出力を確認後） ─────→ Merge（FG）
```

4. 円の外側も背景を覆ってしまう場合は、Blobsの出力Alpha（透明度）をViewerで確認します。透明な余白があるとは限りません。全体の模様を薄く重ねるだけなら、Mergeの`Blend`を下げる方法があります。
5. 円の位置を時間に沿って変えたい場合は、21.1実機で対象の位置指定にキーフレームを使えるかを確かめます。Manualの一覧にアニメーション設定の記載はありません。

この配線はFusionの標準合成を利用した**利用例**であり、Blobs固有の端子や位置制御を保証する公式作例ではありません。

## 似たツールとの違い

| ツール | 何を作るか | 選ぶ目安 |
| --- | --- | --- |
| **Blobs** | 指定した点に円形の図形を作る | 点を基準に置かれる円形の模様が欲しい |
| [Shapes](./shapes) | 同じ中心を共有する大小の円・四角形を何重にも作る | 同心円や入れ子状の図形を使いたい |
| [Pattern](./pattern) | 図形を敷き詰めて画面全体の模様にする | 規則的に繰り返す背景が欲しい |
| [Lines](./lines) | 線の組を繰り返した模様を作る | 円よりも線や縞を使いたい |
| [Duplicate（Krokodove）](./duplicate) | 入力画像を指定した配置・形に沿って複製する | 既存のロゴや画像をそのまま増やしたい |

特にBlobsとShapesは、どちらも円を作る可能性がありますが、**Blobsは指定した点、Shapesは中心を共有する何重もの図形**に着目したツールです。別のFamilyのParticle「Blob」スタイルとは名前が似ていても同一機能とは限りません。

## 出典・バージョン・未確認事項

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2435（Image Create Tools／Blobs）。指定した点に円形の図形を生成するとの説明を確認しました。同ページにはGenerate、Lines、Pattern、Shapesも掲載されています。
- **既存分類**：COLLECTANEAではBlobsの出力を2D Imageに分類しています。Krokodove内のImage / Shape / 3D / Regionの違いは[Family Overview](./)を参照してください。
- **確認範囲**：実機例では二つの位置を指定し、重なる円形を表示しました。点数の上限、全端子、初期値・範囲、Alphaの数値、アニメーション可否、Edition差は未確認です。

`verification: partial`は、Manualと既存カタログで確認できる情報と、詳細資料・実機で未確認の仕様を分ける状態です。
