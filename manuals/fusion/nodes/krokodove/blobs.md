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

たとえば画面の左上と右下に点を指定した場合、その点を基準に円形の模様を配置する、という考え方です。実機例では3点の座標を設定して同時に表示しました。最大点数や他の入力方法は未確認です。

## 「点」と「円形」の意味

**点（point）**は、画面内で図形を置く位置の目印です。「点そのものを画面に描く」という意味ではありません。Blobsの説明では、その指定位置に**円形の図形**が作られます。実機例では3点の座標を設定して配置しました。

ここでいう「円形」は形の種類を示す言葉です。必ず輪郭のはっきりした真円になるのか、柔らかい縁や塗りつぶしにできるのか、半径や色を変更できるのかといった詳細は、公式の短い説明では確定できません。Blobsという名前から、液体の動き・粒子の物理演算・有機的な変形があるとも判断しません。

KrokodoveのBlobsで作るのは、画像として見える円形の模様です。Fusion標準の<Term id="shape-data">Shapeデータ</Term>（図形の輪郭を描画前のデータとして扱う仕組み）や、Particleノードの粒子とは区別します。Shapeデータを画像にする場合は[sRender](../shapes/s-render)を使います。

## 入力と出力

| 段階 | 扱うもの | 確認できる範囲 |
| --- | --- | --- |
| 入力 | 実機例では外部入力なしで生成 | 他の入力の有無や用途は未確認です。 |
| 生成 | 指定した点を基準に円形の図形を作る | Chapter 105、p.2435で確認できます。 |
| 出力 | 実機例でMediaOutに接続し、円状の領域を表示 | Alpha値や他の解像度での挙動は未確認です。 |

実機例では外部入力なしでBlobsからMediaOutへ接続し、Viewerに表示しました。画像入力を使う他の経路は未確認です。

## 主な用途

位置を指定して円形の模様を作るという役割から、タイトル周辺の丸いアクセント、背景の水玉状の装飾、位置関係を示すグラフィックなどへの利用が考えられます。これらは**機能説明から考えた制作案**で、公式のプリセットや実機で再現した作例ではありません。

円が一定間隔で整列する模様を作りたいのか、個別に場所を決めて円を置きたいのかで、選ぶツールは変わります。Blobsを使う目安は後者です。ただし、点の個別指定の操作方法や個数制限は別途確認が必要です。

<!-- capture:S292 -->

## 実機例：3点に円を配置する

`Blobs` から `MediaOut` へ接続し、3点を横に配置します。General Radiusを0.2から0.05に変えると、この例では重なっていた白い領域が分かれて見えます。

市松模様はViewerの透明表示、点の印は編集ガイドです。[接続と設定の記録](/img/fusion/captures/S292/readback.json)には保存した0.05の値を記載しています。

[![BlobsをMediaOutに接続した構成](/img/fusion/captures/S292/graph.png)](/img/fusion/captures/S292/graph.png)

Blobsを直接MediaOutへつなぎます。

[![BlobsのGeneral Radius 0.05の設定](/img/fusion/captures/S292/controls.png)](/img/fusion/captures/S292/controls.png)

General Radiusを0.05に設定しています。

[![3点に配置された白い円状の領域](/img/fusion/captures/S292/small.png)](/img/fusion/captures/S292/small.png)

3点を横に配置した出力です。

[![General Radius 0.2で重なった白い円状の領域](/img/fusion/captures/S292/large.png)](/img/fusion/captures/S292/large.png)

General Radius 0.2では白い領域が重なっています。

[再現用Graph](/img/fusion/captures/S292/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S292/capture.json)

<!-- /capture:S292 -->

## 制作例：映像に円形のアクセントを重ねる

1. FusionでKrokodoveのBlobsを追加し、まず出力をViewerへ表示します。何も表示されない場合は、実際の入力端子や必要な設定を確認します。
2. 円形の図形が出たら、位置・大きさ・色・縁の見え方を観察します。Inspectorに関連項目があれば一つずつ試します。実機例で確認したGeneral Radius以外の操作は、それぞれの条件で確認します。
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
- **確認範囲**：Studio 21.1.0.14 / Windowsで外部入力なしの3点とGeneral Radius 0.2・0.05の表示を確認しました。他の端子、項目の初期値・範囲、他の点数や設定、Alpha値、アニメーションとEdition差は未確認です。

`verification: partial`は、Manualと既存カタログで確認できる情報と、詳細資料・実機で未確認の仕様を分ける状態です。
