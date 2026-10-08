---
title: "Texture Transform"
description: "3D Materialに使う模様の位置・向き・大きさを、UVWテクスチャ座標の変換で調整するNode。"
doc_type: node
term_id: "texture-transform"
term_short: "Texture Transformは、2D画像または3D Materialを受け取り、UVWテクスチャ座標を変換した3D Materialを出力するNode。"
verification: partial
aliases: ["Texture Transform", "3TT"]
concepts: ["classic-3d", "transform"]
nodes: ["Texture Transform"]
node_family: "materials-lights"
controls: ["Translation", "Rotation", "Rotation Order", "Scale", "Pivot", "Material ID"]
inputs: ["image", "material"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Texture Transform

Texture Transform [3TT]は、3Dオブジェクトに貼る画像や模様の**位置・向き・大きさを変える**Nodeです。たとえば、板に貼ったロゴの位置をずらしたり、縞模様を斜めにしたりできます。オブジェクトそのものを移動・回転させるわけではありません。

Fusionでは、3D表面のどの位置に模様を表示するかを**テクスチャ座標（UV/UVW）**で決めます。UとVは通常、画像の横・縦方向に対応し、Wは立体的な模様などで使う3つ目の座標です。Texture Transformは、この座標を使って模様の見え方を変えます。3Dオブジェクト、Material、画像の違いは<Term id="classic-3d">Classic 3D</Term>の解説も参照してください。

## 役割

入力した画像やMaterialを、3D表面上でどの位置・角度・大きさで参照するかを調整します。頂点を動かして形状を変える処理ではなく、**材質の模様の配置を変える処理**です。

## 入力

- **Material Input（オレンジ）**：2D Imageまたは3D Materialを1つ受け取ります。ロゴ画像などを直接つなぐか、別のMaterial Nodeの出力をつなぎます。

複数の画像やMaterialを重ねるための入力ではありません。模様を合成したい場合は、目的に応じたMaterialや画像側の合成処理を別に用意します。

## 出力

- **3D Material出力**：テクスチャ座標の変換を反映した材質を返します。[Shape 3D](../3d/shape-3d.md)などの**Material入力**へ接続します。

出力は2D ImageでもClassic 3D sceneでもありません。Merge 3Dのscene入力へ直接渡したり、Renderer 3Dへ直接つないで画像化したりするNodeではありません。

## 主な設定項目

| 設定 | 何を変えるか | 使いどころ |
| --- | --- | --- |
| **Translation U/V/W** | テクスチャを各座標方向へずらす。 | ロゴや柄の表示位置を合わせる。 |
| **Rotation U/V/W** | UVWの各軸を基準に模様を回転する。 | 斜めの線や立体的な模様の方向を変える。 |
| **Rotation Order** | UVWの回転を適用する順序を指定する。 | 複数軸を回したときの結果を調整する。 |
| **Scale U/V/W** | 各方向の模様の大きさを変える。 | 模様の幅・高さ・奥行き方向の見え方を調整する。 |
| **Pivot U/V/W** | 回転と拡大縮小の基準点を指定する。 | ロゴの中心など、動かしたくない位置を基準に変形する。 |
| **Material ID** | 材質の識別番号を設定する。 | Renderer 3DでMatID補助チャンネルを出す場合に使う。 |

2D画像では主にU/V方向の変化を観察します。W方向がどう見えるかは、接続したテクスチャやMaterialの種類によって異なります。Inspectorの数値範囲や初期値は、21.1実機では確認していません。

## 主な用途

- **看板やロゴの位置合わせ**：平面に貼った画像が中央からずれているとき、3Dオブジェクトを動かさず模様だけを調整する。
- **斜めのストライプや木目**：画像や3D Materialの模様を回転し、同じ形状のまま模様の方向を変える。
- **立体的なグラデーションの向き変更**：[Gradient 3D](./gradient-3d.md)などのUVWに依存する模様の向きを変える。

## 最小構成

```text
画像 ─→ Texture Transform［Material Input］ ─→ Shape 3D［Material］ ─┐
Camera 3D ───────────────────────────────────────────────────────────┼→ Merge 3D → Renderer 3D → 2D Image
Point Light ─────────────────────────────────────────────────────────┘
```

画像をTexture Transformへ渡すと、結果は**3D Material**になります。Shape 3DでPlaneなどを作り、そのMaterial入力につないでからRenderer 3Dで確認します。CameraとLightを追加すると、3D空間での見え方も確かめられます。

## 運用例：板に貼ったロゴの位置と角度を合わせる

1. 透明部分を含むロゴ画像を読み込み、Texture TransformのMaterial Inputへ接続します。
2. Shape 3DをPlaneにし、Texture Transformの出力をShape 3DのMaterial入力につなぎます。
3. Renderer 3Dで表示し、**Translation U/V**でロゴを移動します。
4. **Rotation**で模様の向きを変えます。回転の中心が意図と違う場合は**Pivot**を調整します。
5. **Scale U/V**でロゴの大きさを整えます。板のサイズは変わらず、表面に表示されるロゴだけが変化します。

ロゴが切れる、周辺が引き伸ばされるといった見え方は、画像の境界外をどう扱うかにも左右されます。Texture Transformの値だけで解決しないときは、入力に使うテクスチャ側の設定も確認します。

## 挙動と注意点

**[UV Map 3D](../3d/uv-map-3d.md)との違い**：UV Map 3Dはオブジェクトの頂点ごとにテクスチャ座標を割り当て直します。一方、Texture TransformはMaterial側でUVWを使った変換を行います。元の3Dモデルの貼り方自体が合わない場合はUV Map 3D、既存の貼り方を保ちながら模様の位置や角度を調整したい場合はTexture Transformを検討します。

**[Transform 3D](../3d/transform-3d.md)との違い**：Transform 3Dは3Dオブジェクトの位置・回転・大きさを変えます。Texture Transformでは物体の輪郭やカメラから見た位置は変わりません。

**Material ID**は材質の識別用です。通常のカラー画像へ番号を描き込むものではなく、Renderer 3Dで該当する補助チャンネルを有効にした場合にMatIDへ出力されます。

## 関連Node・概念

- [3D Material / Lightノード一覧](./index.md)：MaterialとLightの役割、接続先。
- [UV Map 3D](../3d/uv-map-3d.md)：頂点側のUV座標を作り直す。
- [Gradient 3D](./gradient-3d.md)：UVW座標を使ったグラデーション模様。
- [Shape 3D](../3d/shape-3d.md)：Materialを貼る3D形状を生成する。
- [Renderer 3D](../3d/renderer-3d.md)：3D sceneを2D画像へ変換する。
- [Classic 3Dの仕組み](../../learn/02-data/classic-3d.md)：Image、Material、sceneの区別。

## バージョンと検証状況

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 91「3D Texture Nodes」、**Texture Transform [3TT]（pp.2104–2106）**。1つのMaterial Inputが2D Image / 3D Materialを受け取ること、3D Material出力、Translation・Rotation・Scale・Pivot・Material IDを確認しました。UV Map 3Dとの処理単位の違いは同ManualのGradient 3D（p.2095）も参照しています。

`verification: partial`は、内部REGID、Inspectorの初期値・数値範囲、Edition差、実機での描画結果を未検証としているためです。
