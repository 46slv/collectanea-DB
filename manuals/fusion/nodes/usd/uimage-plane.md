---
title: uImage Plane
description: 写真や動画を、画像の縦横比に合わせたUSDの平面として3D空間に配置するノード。入力、接続、用途と注意点を説明する。
doc_type: node
term_id: uimage-plane
term_short: uImage Planeは、2D画像を3D空間の平らなカードに貼り、USDシーンとして出力するノード。
verification: partial
aliases: [uImage Plane, uImagePlane, uIm]
concepts: [usd-scene, image-data, geometry]
nodes: [uImage Plane]
node_family: usd
controls: [Filename, Size, Transform]
inputs: [image]
outputs: [usd]
tasks: [usd, image-card, set-extension]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uImage Plane

uImage Planeは、写真や動画などの**2D画像を、3D空間に置ける平らな板（カード）に貼り付けるUSDノード**です。画像を貼った平面を奥や手前に配置し、カメラを動かすことで、背景画や看板を立体的なシーンの一部として扱えます。

このノードが出力するのは完成した2D映像ではなく、**平面とその表面に使う画像を含む<Term id="usd-scene">USD scene</Term>**です。<Term id="image">Image</Term>としてViewerや通常のMergeへ渡すには、[uRenderer](./u-renderer)で描画します。[USDシーンの基礎](../../learn/02-data/usd)も参照してください。

## 入力・出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Image Input（黄色）** | 2D Image | MediaInやGeneratorなどの画像を受け取り、平面の表面に貼る |
| **出力** | USD scene | 画像付きの平面を、uMergeなどのUSDノードへ渡す |

**Image Input**は3Dモデルの入力ではありません。画像そのものを材質として使うための入力です。画像を線で接続しない場合も、Inspectorの**Filename**からファイルを指定して平面を作れます。

## 最初の接続例：画像を3D空間に配置する

~~~text
MediaIn（画像） → uImage Plane ─┐
uCamera ───────────────────────┼→ uMerge → uRenderer → 2D Image
                               ┘
~~~

1. MediaInなどの2D画像を**uImage Planeの黄色いImage Input**へ接続します。
2. uImage Planeと[uCamera](./ucamera)を[uMerge](./u-merge)に接続します。ここでは画像とカメラを同じUSDシーンにまとめています。
3. uImage PlaneのTransformでカードの位置・向き・大きさを調整します。
4. uMergeから[uRenderer](./u-renderer)へ接続し、レンダリング後の**2D画像**をViewerで確認します。

uImage Planeの出力を通常の2D Mergeへ直接つなぐのではなく、**USDシーン → uRenderer → 2D画像**という順序にします。ほかの映像と通常のMergeで合成するのは、uRendererの後です。

## Inspector：画像・大きさ・配置を分けて考える

### Filename：接続せずに画像を使う

**Filename**ではBrowseから画像ファイルを選び、パスを指定します。一方、**Image Input**を使えば、Fusion上流のMediaInやGeneratorの出力を直接渡せます。

この2つは画像の渡し方の違いです。動画やFusionで時間変化する画像を試す場合は、まずImage Inputに接続し、異なるフレームで結果を比較してください。**FilenameとImage Inputを同時に設定した場合の優先順位**は、21.1 Reference ManualのuImage Plane節では明記されていません。両方が設定された状態で意図しない画像が出たら、片方ずつ指定して切り分けます。

### 画像の縦横比とSize

uImage Planeは、**入力画像の縦横比を平面の形に反映**します。たとえば横長の画像なら横長のカードとして配置でき、正方形へ無理に引き伸ばすことを前提にしません。

**Size**はUSD空間に置く平面の大きさを変える設定です。画像の画素数や出力解像度を変更する設定ではありません。カードが小さすぎる場合はSize、画面内の見える大きさや遠近感を調整したい場合はカメラとの距離も確認します。

画像の縦横比に関する上記の説明はManual記載の仕様です。非正方形ピクセルや特殊な画像メタデータが与える影響、Sizeの数値とワールド単位の厳密な対応までは実機で確認していません。

### Transform：どこに、どの向きで置くか

共通の**Transform**タブで、カードの位置・回転・スケールを調整します。カードは3D空間にあるため、正面から見る場合と斜めから見る場合では画面上の形が変わります。画像自体の縦横比が正しくても、カメラに対して傾いていると台形に見える場合があります。

## 制作例1：背景を複数の奥行きに並べる

1. 背景画を**前景・中景・遠景**などに分け、それぞれMediaInから別のuImage Planeへ入力します。
2. 各カードのTransformで奥行きを変え、uMergeへまとめます。
3. uCameraを接続してuRendererで描画し、カメラを少し横へ動かして確認します。

手前のカードと奥のカードは、カメラが動くと画面上の移動量が異なります。これにより、平面画像の組み合わせでも奥行きのある**2.5D表現**を作れます。uImage Plane自体が画像から距離情報を推定するわけではありません。前後関係や切り抜きは素材側で準備します。

## 制作例2：動画を看板やスクリーンに使う

1. MediaInで映像を読み込み、その**2D Image出力をImage Input**に接続します。
2. uImage Planeを看板やスクリーンの位置へ移動・回転します。
3. uMergeにカメラとカードをまとめ、uRendererで描画します。
4. 異なるフレームを表示し、入力の映像とレンダリング結果の両方が変化するかを確認します。

この例は、画像入力を3Dカードに貼る基本仕様を動画へ応用したものです。**動画の更新挙動やレンダリング結果をResolve 21.1の実機で確認済みという意味ではありません**。静止して見える場合は、入力MediaInのフレーム、Image Inputの接続、レンダリングしたフレームを順に確認します。

## uShape / Image Plane 3Dとの使い分け

| ノード | 出力の種類 | 主な用途 |
| --- | --- | --- |
| **uImage Plane** | USD scene | 画像の縦横比に合わせたカードを素早く配置する |
| [uShape（Plane）](./ushape) | USD scene | 平面の形状・大きさや内蔵Materialの設定から組み立てる |
| [Image Plane 3D](../3d/image-plane-3d.md) | Classic 3D scene | 従来のMerge 3D / Renderer 3Dで画像カードを使う |

**uShapeのPlane**も画像を表面へ使えますが、uShapeは平面以外の立体も作るノードで、形状やMaterialの設定を持ちます。画像をその比率のまま配置することが目的なら、まずuImage Planeを検討できます。材質を細かく組み立てたい場合はuShapeや関連USD Materialノードを検討します。

**Classic 3DとUSDは別のデータ形式**です。Image Plane 3DはMerge 3D / Renderer 3D、uImage PlaneはuMerge / uRendererへ接続します。名前が似ていても、両方をそのまま同じ3D Mergeへ混在させるものではありません。

## 表示されない・想定と異なる場合

| 症状 | 確認すること |
| --- | --- |
| uImage Planeを通常のMergeへ接続できない | 出力はUSD sceneです。uMergeへまとめてuRendererで2D Imageへ変換します。 |
| 画像が表示されない | Image Inputに画像が来ているか、またはFilenameに有効なパスを指定しているかを、片方ずつ確認します。 |
| カードが見えない | uCameraから見える位置・向きにあるか、uMergeへつながっているか、uRendererで描画しているかを確認します。 |
| 画像が不自然に細長い・台形に見える | 入力画像の比率とカードの回転・カメラ角度を分けて確認します。 |
| カードの表示サイズが合わない | Size、Transform、カメラとの距離を分けて調整します。画像の画素数を変える操作とは異なります。 |
| 動画が静止している | 入力MediaInがフレームごとに変わるか、Image Inputが接続されているか、出力を別フレームで描画しているかを確認します。 |
| Materialや複雑な形状設定が見つからない | uImage Plane固有のControlは主にFilename / Sizeです。詳細な形状・材質設定にはuShape等を検討します。 |

## 関連ノード

- [uMerge](./u-merge)：カード・カメラ・ほかのUSDオブジェクトを同じシーンにまとめる。
- [uCamera](./ucamera)：シーンをどの位置・角度から見るか決める。
- [uRenderer](./u-renderer)：USDシーンを通常の2D画像へ描画する。
- [uShape](./ushape)：平面・箱・球などの形状と、その表面のMaterialを作る。
- [Image Plane 3D](../3d/image-plane-3d.md)：Classic 3Dで同様の画像カードを作る。

## バージョン・出典と確認範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 121「USD Nodes」、**uImage Plane [uIm]（pp.2901–2902）**。画像の入力、入力画像のaspectを平面へ反映すること、Filename、Size、共通Transform / Settingsを照合しました。

制作例はManualで確認できる機能を組み合わせた説明です。動画入力の実機更新挙動、FilenameとImage Inputを同時に指定した場合の優先順位、非正方形ピクセルでの比率、内部REGID、正確な既定値・数値範囲、Edition差、実機レンダリング結果は未確認です。このため**verification: partial**を維持しています。
