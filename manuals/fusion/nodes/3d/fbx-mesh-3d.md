---
title: "FBX Mesh 3D"
description: "FBX・OBJなどのポリゴンモデルをFusionのClassic 3Dへ読み込むNode。シーン単位のImportとの違い、材質の入力、アニメーションの扱いを説明する。"
doc_type: node
term_id: "fbx-mesh-3d"
term_short: "FBX Mesh 3Dは、FBXなどの外部3Dモデルを読み込み、Fusionの3Dシーンへ渡すNode。単体読み込みとシーンImportではアニメーションの扱いが異なる。"
verification: partial
aliases: ["FBX Mesh 3D", "FBX Mesh", "FBX"]
concepts: ["classic-3d", "material"]
nodes: ["FBX Mesh 3D"]
node_family: "3d"
controls: ["Size", "FBX File", "Object Name", "Take Name", "Wireframe"]
inputs: ["classic-3d", "image", "material"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# FBX Mesh 3D

FBX Mesh 3D [FBX]は、BlenderやMayaなどの3Dソフトで作った**ポリゴンモデル（頂点と面でできた形状）をFusionへ取り込む**Nodeです。Fusion標準の球や箱では作りにくい建物、小道具、機械部品などを、<Term id="classic-3d">Classic 3Dシーン</Term>のオブジェクトとして配置できます。

Nodeが返すのは、完成した2D画像ではなく3Dの形状情報です。カメラやライトと組み合わせ、[Renderer 3D](./renderer-3d.md)で2D画像に変換してから映像へ合成します。

## 先に選ぶ：Node単体か、FBX SceneのImportか

**モデルの形だけが必要なら、FBX Mesh 3Dを単体で追加する方法**が簡単です。ただし、DaVinci Resolve 21.1 Reference Manualでは、単体でファイルを読み込むと、ファイル内のジオメトリは**共通の基点（pivot）とTransformを持つ1つのメッシュ**にまとめられ、モデルに付けられたアニメーションは無視されると説明されています。

**複数オブジェクトやカメラ・ライト、アニメーションを扱うなら、Fusionページの［Fusion > Import > FBX Scene］**を使います。この方法では、ファイル内のカメラ・ライト・メッシュに対応した個別のNodeを作成でき、オブジェクトのアニメーションも保持できます。

たとえば「建物の3Dモデルを背景に置きたい」なら単体Node、「複数の歯車を別々に動かしたアニメーションを読み込みたい」ならFBX SceneのImportを最初の候補にします。**同じFBXファイルでも、読み込み方法で編集できる単位が変わります。**

## 入力と出力

FBX Mesh 3Dはファイルから形状を作るため、**ほかのNodeからの入力がなくても使用できます**。Manualに記載されている入力は次の2本です。

- **SceneInput（オレンジ、任意）**：別のClassic 3Dオブジェクトやシーンを受け取り、読み込んだメッシュと同じ3D出力へまとめます。既存シーンと別々に構成したい場合は、この端子を使わずMerge 3Dで合流させても構いません。
- **Material Input（緑、任意）**：読み込んだ形状の表面へ使う2D画像、または3D Materialを受け取ります。2D画像は内蔵の基本Materialの**Diffuse Texture（表面の色模様）**になり、3D Materialを接続すると内蔵の基本Materialタブは無効になります。
- **出力（Classic 3Dシーン）**：読み込んだメッシュとSceneInputから受け取った3D要素を出力します。通常の2D Mergeへ直接つなぐ画像出力ではありません。

ここでいうMaterialは、3Dの表面をどの色・質感で描くかを決めるデータです。**Material Inputへ2D画像を入れても、その画像から3Dの形を生成するわけではありません。** 形はFBXなどのファイルから、見た目はMaterialから受け取ります。

## Inspectorの主な設定

### ファイルと大きさ

- **FBX File**：読み込むモデルファイルの場所を指定します。Browseから選び直せます。
- **Size**：取り込んだ形状全体の大きさを調整します。外部ソフトとFusionでモデルの大きさが合わない場合に確認します。

21.1 Manualでは、Node名に反してFBX以外も読み込めるとされています。ファイル選択の対象には、FBX ASCII／FBX 5.0 binary（`.fbx`）、AutoCAD DXF（`.dxf`）、3D Studio（`.3ds`）、Alias OBJ（`.obj`）、Collada（`.dae`）が挙げられています。**拡張子が対象でも、個々のファイルの全要素が完全再現されるという保証ではありません。**

### Importに関わる表示項目

- **Object Name**：読み込むメッシュの名前を示します。空欄なら、ファイル内の形状は1つのメッシュとして読み込まれます。この欄は手入力で変更するのではなく、［Import > FBX Scene］から読み込んだ際にFusionが設定します。
- **Take Name**：FBXファイルに複数のアニメーションTake（動きの記録）がある場合、その名前を示します。空欄ならアニメーションを読み込みません。これもImportメニューからの読み込みによって設定される読み取り専用の項目です。

Node単体で追加してからTake Nameを編集し、元ファイルのアニメーションを自由に選ぶ操作はできません。動きを引き継ぎたい場合は、**最初からFBX SceneとしてImportする**ことを検討します。

### ワイヤーフレーム

**Wireframe**を有効にすると、面を塗る代わりにメッシュの辺を線として描く設定になります。ただし、Manualは**Renderer 3DのOpenGL Rendererだけがワイヤーフレーム描画に対応する**と明記しています。Software Rendererで同じ出力になる前提にはしないでください。

Visibility、Lighting、Matte、Blend Mode、Normals/Tangents、Object IDや、Materials・Transform・Settingsタブは他のClassic 3D Nodeにもある共通設定です。FBX固有のファイル読み込み設定とは分けて考えます。

## 最小構成と具体的な運用例

Blenderで作った建物のモデルを、Fusionの合成シーンへ配置する例です。

1. BlenderなどでモデルをFBXとして用意します。形状のみを使う場合は、FBX Mesh 3Dを追加して**FBX File**でファイルを指定します。
2. まずFBX Mesh 3Dの3D Viewerで形を確認します。極端に大きい・小さい場合は**Size**を調整します。
3. 表面の色を調整したい場合は、Materialを緑の**Material Input**へ接続します。2D画像を使うなら、その画像が形状の表面の色として適切に配置されるかViewerで確認します。
4. [Camera 3D](./camera-3d.md)、必要に応じてLightとともに[Merge 3D](./merge-3d.md)へ接続し、[Renderer 3D](./renderer-3d.md)から2D画像を出力します。
5. 映像素材と重ねる際は、Renderer 3Dの出力を通常の2D合成側へ接続します。

```text
FBX Mesh 3D ─┐
Camera 3D ───┼→ Merge 3D → Renderer 3D → 2D Image
Light ───────┘

2D Image / 3D Material → FBX Mesh 3DのMaterial Input（任意）
```

別の用途として、OBJで受け取った小道具モデルをシーンへ加えたり、FBX Sceneとして読み込んだ複数部品の位置や動きを個別に調整したりできます。**FBX Mesh 3D単体とFBX SceneのImportは、後者が複数Nodeやアニメーションを扱える点で使い分けます。**

## 期待した表示にならないとき

- **モデルが見つからない**：FBX Fileのパスとファイルの所在を確認します。保存したcompを別のPCで開く場合も、参照先ファイルが必要です。
- **モデルが極端に大きい・小さい**：最初にSizeを確認し、カメラの位置や画角と合わせます。
- **アニメーションが動かない**：Node単体での読み込みではアニメーションを無視します。FBX SceneのImportで取り込み直す方法を検討してください。
- **モデルの個々の部品を選べない**：単体読み込みでは1つのメッシュにまとめられます。個別Nodeが必要ならFBX SceneをImportします。
- **ワイヤーフレームが最終出力に出ない**：Renderer 3DがOpenGL Rendererになっているか確認します。

## 似たNode・関連する考え方

- [Alembic Mesh 3D](./alembic-mesh-3d.md)：ベイク済みの頂点変形など、形状が時間とともに変わるデータを受け取る場合の候補。FBXのシーンImportとは目的が異なります。
- [Shape 3D](./shape-3d.md)：外部モデルを使わず、球・箱・平面などの基本形状をFusion内で作ります。
- [FBX Exporter 3D](./fbx-exporter-3d.md)：Fusionの3Dシーンを外部ファイルに書き出すNode。読み込み用のFBX Mesh 3Dとは逆方向の役割です。
- [Classic 3Dノード一覧](./index.md)：ほかの形状生成・加工・レンダリングNodeを選ぶ入口。
- [Classic 3D sceneの基礎](../../learn/02-data/classic-3d.md)：3Dの形状・カメラ・ライトと、2D画像の違い。

## 出典と確認範囲

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 88「3D Nodes」、**FBX Mesh 3D [FBX]（pp.1947–1949）**。

対応形式、単体NodeとFBX Scene Importの違い、SceneInput／Material Input、Size／FBX File／Object Name／Take Name／Wireframe、およびOpenGL Rendererの制約はこの節に基づきます。上の建物合成は、確認された機能から構成した**運用例**であり、Manualに掲載された作例の再現ではありません。

現在のResolve 21.1実機での個別ファイル互換性、内部REGID、詳細な初期値・数値範囲、Free／Studioの差は未検証です。これらを確定済みとして扱わず、`verification: partial`を維持しています。
