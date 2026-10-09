---
title: "ReliefMap"
description: "2Dの凹凸データと3D Materialを組み合わせ、自己遮蔽を伴う表面の奥行きを表現するNode。"
doc_type: node
term_id: "reliefmap"
term_short: "ReliefMapは、CreateReliefMapで作った凹凸データを3D Materialへ適用し、表面の奥行き感や自己遮蔽を表現するNode。"
verification: partial
aliases: ["ReliefMap", "3RM"]
concepts: ["classic-3d", "image-data"]
nodes: ["ReliefMap"]
node_family: "materials-lights"
controls: ["Depth Scale", "Lock U/V", "Map Type", "Quality"]
inputs: ["image", "material"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# ReliefMap

ReliefMap [3RM]は、**3Dオブジェクトの表面に、画像で指定した凹凸と奥行き感を加えるMaterial系Node**です。文字を板に彫り込んだように見せたり、石や金属の表面に深い溝を表現したりするときに使います。

凹凸の元になる画像は[CreateReliefMap](./createreliefmap.md)で用意します。ReliefMapはその画像と[Blinn](./blinn.md)などの**3D Material**を組み合わせ、[Shape 3D](../3d/shape-3d.md)などのオブジェクトへ渡します。単体で2D画像を加工するFilterでも、3Dの形状を作るGeometry Nodeでもありません。2D Image、Material、3D sceneの違いは<Term id="classic-3d">Classic 3D</Term>の解説で確認できます。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Background Input**（黄色） | 3D Material | Blinn、Phong、Ward、Cook Torranceなど、凹凸を加える元の材質を受け取る。 |
| **ReliefMap Input**（白） | 2D RGBA Image | CreateReliefMapが生成した凹凸データを受け取る。 |
| **出力** | 3D Material | 凹凸を反映した材質を出す。Shape 3Dなどの**Material入力**へ接続する。 |

**白い入力へ通常のカラー画像をつなぐだけでは、意図した凹凸になりません。** 公式Manualでは、ReliefMap用画像の**RGBに法線（表面の向き）、Alphaに高さ・深さ**の情報が入ると説明しています。CreateReliefMapは元画像からこのデータを作る役割です。

ReliefMapの出力は**Materialであり、2D Imageでも3D sceneでもありません**。Renderer 3DやMerge 3Dへ直接つなぐのではなく、形状NodeのMaterial入力へ渡します。

## 仕組みとBump Mapとの違い

[Bump Map](./bumpmap.md)は主に法線を変え、細かな凹凸があるように**光の当たり方**を変えます。ReliefMapは高さの情報も参照し、手前の凹凸が奥の部分を隠す**自己遮蔽（self-occlusion）**を表現できます。たとえば、表面に彫った溝を斜めから見ると、溝の手前側が奥側を隠すような見え方になります。

ただし、これは**Meshの頂点を実際に移動して輪郭を作り替える処理と同じではありません**。物体の外形まで変形させる必要がある場合は、[Displace 3D](../3d/displace-3d.md)などのGeometry操作と比較してください。

## 最小構成：文字を3Dの表面に刻む

次の構成は、公式ManualにあるText+とBlinnを使った例を基にしています。

```text
Text+ ─→ CreateReliefMap ─────────→ ReliefMap［白：ReliefMap Input］
Blinn［3D Material］─────────────→ ReliefMap［黄：Background Input］
                                           │ 3D Material
                                           ↓
                                     Shape 3D［Material］ ─┐
Camera 3D ─────────────────────────────────────────────────┼→ Merge 3D → Renderer 3D → 2D Image
Point Light ───────────────────────────────────────────────┘
```

1. **Text+**で文字を描き、CreateReliefMapへ渡します。まずは輪郭の分かりやすい太字を使うと、結果を判断しやすくなります。
2. **CreateReliefMapの出力を白い入力**へ、Blinnの**Material出力を黄色い入力**へ接続します。
3. ReliefMapの出力をShape 3DのMaterial入力へ接続し、Shape 3DのPlaneなどへ適用します。
4. Camera 3DとLightをMerge 3Dに加え、Renderer 3Dで確認します。ライトや視点を動かすと、単なる平面の文字色との違いを確認できます。

凹凸が弱いときは、CreateReliefMapが作る高さデータと、ReliefMap側のDepth Scaleを分けて調整します。入力画像の輪郭が不鮮明な場合は、CreateReliefMapの[Pre Blur](./createreliefmap.md)なども確認します。

## Inspectorの主な設定

| 設定 | 何を変えるか | 調整するときの目安 |
| --- | --- | --- |
| **Depth Scale** | 適用するReliefの奥行きを拡大・縮小する。 | 溝が浅く見える場合に増やし、不自然に深い場合に下げる。 |
| **Lock U/V** | 有効時はU/V方向の拡大率を連動させる。無効にすると各方向を個別に調整できる。 | 凹凸が一方向へ伸びて見えるとき、テクスチャの縦横比を確かめる。 |
| **Map Type** | **Relief**と**Cone**の処理方式を切り替える。 | 見た目と処理負荷を比較して選ぶ。 |
| **Quality** | Relief表現の計算品質を調整する。公式Manualでは、特に**Relief**方式で違いが見えやすいとされる。 | 輪郭や溝の内側に見える違和感を確認しながら調整する。 |

Map TypeのConeについて、Manualは品質やシェーディング速度への利点と処理コストの増加を併記しています。実機での性能差はシーンと設定に依存するため、ここでは「必ず高速になる」とは扱いません。

このほかTransform / Settingsタブには他の3D Texture Nodeと共通の項目があります。Inspectorの初期値・数値範囲・Edition差はここでは確定していません。

## 具体的な運用例

### 金属板にロゴを彫り込んだように見せる

Text+やロゴ画像をCreateReliefMapへ通し、ReliefMapの白い入力に接続します。黄色い入力へBlinnをつなぎ、金属板に見立てたShape 3DのPlaneへMaterialを適用します。

CreateReliefMapの**Flip Depth**で盛り上がりと彫り込みの向きを比較し、ReliefMapの**Depth Scale**で深さを調整します。最後にLightを斜めから当て、ロゴの内側が自己遮蔽で暗くなる様子を確認します。

### 石材の溝や荒れた表面を作る

[Fast Noise](../generators/fast-noise.md)で濃淡のある画像を作り、CreateReliefMapでRelief用データに変換します。ReliefMapへBlinnと一緒に入力すると、ノイズの濃淡が表面の起伏として表現されます。

細かなざらつきだけならBump Mapでも十分な場合があります。溝の奥行きや自己遮蔽が必要な場合にReliefMapを比較し、不要なときは処理負荷の軽い構成を選びます。

## うまく表示されないとき

- **凹凸が見えない**：白い入力にCreateReliefMapの2D RGBA出力、黄色い入力にBlinnなどの3D Materialが入っているか確認します。ReliefMapの**Material出力**をShape 3Dへ渡しているかも確認してください。
- **ただの模様に見える**：Depth Scale、光の方向、視点を変えて比較します。照明を有効にしてRenderer 3Dで表示します。
- **彫り込みが盛り上がる**：CreateReliefMap側のFlip Depthを試します。
- **物体の輪郭が変わらない**：ReliefMapはMaterial側の表現です。Meshを実際に変形する処理ではありません。

## 関連Nodeと出典

- [CreateReliefMap](./createreliefmap.md)：ReliefMap用のRGB法線・Alpha高さデータを作る2D Filter。
- [Blinn](./blinn.md)：基本の3D Material。ReliefMapの黄色い入力に接続する。
- [Bump Map](./bumpmap.md)：自己遮蔽を扱わない細かな凹凸表現との比較。
- [Shape 3D](../3d/shape-3d.md)：ReliefMapのMaterialを適用する3D形状。
- [Classic 3Dの仕組み](../../learn/02-data/classic-3d.md)：Image、Material、sceneの使い分け。
- [3D Material / Lightノード一覧](./index.md)：材質・照明の関連Node。

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 91「3D Texture Nodes」、**ReliefMap [3RM]、pp.2098–2099**。入出力、自己遮蔽、作例、Depth Scale、Lock U/V、Map Type、Qualityを確認しました。入力画像を作る方法は同Manual Chapter 99「Filter Nodes」、**CreateReliefMap [CRM]、pp.2330–2332**を参照しています。

`verification: partial`は、runtimeの内部REGID、正確な初期値・数値範囲、Edition差、実機レンダリング・性能を未検証としているためです。
