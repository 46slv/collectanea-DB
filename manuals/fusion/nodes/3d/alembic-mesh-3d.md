---
title: "Alembic Mesh 3D"
description: "Alembic（.abc）の3Dメッシュやベイク済みアニメーションをFusionに読み込み、Classic 3D sceneで利用する方法。"
doc_type: node
term_id: "alembic-mesh-3d"
term_short: "Alembic Mesh 3Dは、外部ソフトからAlembic形式のメッシュを読み込み、Fusionの3D sceneへ渡すNode。"
verification: partial
aliases: ["Alembic Mesh 3D", "AlembicMesh3D", "Abc"]
concepts: ["classic-3d"]
nodes: ["Alembic Mesh 3D"]
node_family: "3d"
controls: ["Filename", "Object Name", "Wireframe"]
inputs: ["classic-3d", "image"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Alembic Mesh 3D

Alembic Mesh 3D [Abc]は、BlenderやCinema 4D、Mayaなどで作成した**3DメッシュをFusionへ読み込む**Nodeです。読み込めるのはAlembic形式（`.abc`）で、頂点が時間とともに変わる動きも、事前計算されたアニメーションとして受け渡せます。

Alembicのアニメーションは、元ソフトのリグやシミュレーションをFusionで再計算する方式ではありません。計算後の形状をフレームごとのデータとして保存し、その結果を再生する方式です。このため、布や変形する物体を受け取る用途に適しています。一方、**元のリグやシミュレーションの設定をFusionで編集できるわけではありません**。

出力は<Term id="classic-3d">Classic 3D scene</Term>です。読み込んだメッシュを映像として合成するには、通常は[Merge 3D](./merge-3d.md)でカメラやライトと組み合わせ、[Renderer 3D](./renderer-3d.md)で2D Imageへ変換します。

## 最初に選ぶ：Alembic Sceneを読み込むか、Nodeを追加するか

DaVinci Resolve 21.1では、2つの読み込み方法が説明されています。

- **Fusionページの「Fusion > Import > Alembic Scene」**：ファイル内のメッシュ、カメラ、Transformなどを、利用可能な範囲で**個別のNode**に分けて読み込みます。複数物体の位置を調整したい場合や、必要な物体だけを利用したい場合はこちらを基本にします。
- **Alembic Mesh 3D Nodeを直接追加**：ファイル内のジオメトリを1つのメッシュとして扱う方法です。1つの物体を手早く読み込みたい場合に向きます。個々の物体を独立したNodeとして編集する目的には適していません。

21.1 Manualは、通常は**Importメニューからの読み込みを推奨**しています。Nodeを直接追加した場合と同じ構造が自動的にできるわけではありません。

## 入力と出力

Alembic Mesh 3Dには**2本の任意入力**があります。ファイルからメッシュを読み込むNodeなので、3D入力をつながなくても単体で使えます。

- **SceneInput（orange）**：ほかのClassic 3D object / sceneを追加します。Alembicから読み込んだ形状と、接続した3D geometryが同じ3D出力へまとめられます。
- **MaterialInput（green）**：メッシュ表面へ貼る**2D bitmap Image**を接続します。これはメッシュを生成する画像ではなく、読み込んだ形状の表面に使う画像です。
- **出力（Classic 3D）**：読み込んだメッシュを含む3D sceneを返します。画像やMaskではありません。

~~~text
Alembic Mesh 3D ──┐
Camera 3D ─────────┼→ Merge 3D → Renderer 3D → 2D Image
Light ─────────────┘

2D Image ──→ Alembic Mesh 3DのMaterialInput（任意）
~~~

MaterialInputへ画像をつないでも、元のAlembicファイルに含まれるライトや材質設定がすべて再現されるわけではありません。読み込まれた形状に対して、Fusion側で見た目を組み立てます。

## Inspectorで確認する項目

### Filename

読み込んだ`.abc`ファイルのパスです。リンク先のファイルを変更・更新する際に使用します。

### Object Name

読み込んだメッシュの名前を示す項目です。Nodeの名前にも使われます。

Alembic Mesh 3D Nodeを直接追加し、**Object Nameが空欄の場合はファイル内のジオメトリ全体が1つのメッシュとして読み込まれます**。Importメニューから読み込んだときは、Fusionがこの項目を設定します。

### Wireframe

表示をメッシュの辺だけに切り替えます。有効時にはワイヤーフレームのアンチエイリアス設定も利用できます。**ワイヤーフレームをレンダリング結果として書き出す場合は、Renderer 3DをOpenGL Rendererにします**。Viewer上で形状を確認する操作と、最終出力にワイヤーフレームを描く操作を区別してください。

Visibility、Lighting、Matte、Blend Mode、Normals/Tangents、Object IDなどは多くの3D Nodeに共通する設定です。Alembic専用の読み込み設定と混同しないでください。

## Importダイアログ：どこまで読み込むか

「Import > Alembic Scene」では、ファイル内の構造やアニメーションをどこまでNodeへ展開するか選べます。

| 項目 | 何が変わるか | 使うときの判断 |
| --- | --- | --- |
| **Hierarchy** | 親子関係を複数のTransform 3D Nodeで再構築します。無効ならTransformをメッシュやカメラへまとめ、Node数を減らします。 | アニメーションを含む大きなシーンでは、Manualは無効を勧めています。 |
| **Orphaned Transforms** | Hierarchy有効時に、メッシュやカメラの親となるTransformも読み込みます。 | 元の親子構造が必要なときに確認します。 |
| **Cameras** | カメラの画角、フォーカス面、Near/Far clippingなどを可能な範囲で読み込みます。 | 画角が一致しない場合はCamera 3DのResolution Gate Fitも確認します。 |
| **InverseTransform** | カメラ用の逆Transform（WorldからModelへの変換）を読み込みます。 | カメラの変換情報が必要な構成で確認します。 |
| **Points** | 3D点の位置情報を読み込みます。 | 点として書き出されたParticle等に使えますが、元の向きや進行方向は保持されません。 |
| **Meshes** | 3Dメッシュを読み込みます。有効時にUVとNormalの読み込み項目も表示されます。 | 表面のテクスチャや陰影が必要ならUV・Normalを確認します。 |

**Resample Rate**は、書き出し時のフレームレートとFusion側の読み取り間隔を合わせる項目です。通常はAlembicファイルから検出された値を基準にします。値を変えると再生速度を変えられますが、まず元のアニメーションと同じタイミングで再生されることを確認します。

## 運用例：Blenderの変形アニメーションを合成する

たとえばBlenderで変形させた布や旗を、Fusionの実写映像へ合成する場合です。

1. Blender側で変形後のメッシュをAlembic（`.abc`）として書き出します。Fusion側ではリグを動かすのでなく、**ベイクされた頂点の動き**を受け取ります。
2. Fusionページから「Fusion > Import > Alembic Scene」を選び、ファイルを指定します。複数物体を個別に扱いたい場合は、Alembic Mesh 3D Node単体での読み込みではなくImportメニューを使います。
3. 読み込んだメッシュとTransformのNodeを確認し、元の動きとタイミングが合っているか再生して確かめます。速度が異なる場合はResample Rateを確認します。
4. 必要に応じて2D画像をMaterialInputへ接続するなど、Fusion側で表面の見た目を設定します。
5. [Merge 3D](./merge-3d.md)へカメラやライトとともに接続し、[Renderer 3D](./renderer-3d.md)で2D画像へ変換します。後段で通常の2D合成処理を行います。

複数オブジェクトの位置調整が必要なら、Importで作られた[Transform 3D](./transform-3d.md)も確認します。メッシュの変形アニメーションと、物体全体の位置・回転のアニメーションは別のデータとして扱われる場合があります。

## 読み込めない情報・再読み込み時の注意

**Alembic形式が保存できる情報と、Fusion 21.1が読み込める情報は同じではありません。**

- **Light、Material、Curve、複数UV、Velocity**：21.1 ManualではAlembicからの読み込みに未対応とされています。たとえばAlembic側で材質を設定しても、Fusionに同じ見た目が復元されるとは限りません。
- **Particle由来のPoints**：位置を読み込めても、方向や向きの情報は失われます。
- **Stereo Camera情報**：Alembicからは読み込まれません。カメラのResolution Gate Fitも、書き出し元が適切にメタデータを付けているかに左右されます。
- **任意のユーザーメタデータ**：書き出し元によって形式が異なるため、大部分は利用されません。

また、Importメニューで取り込んだ**TransformのanimationはFusionのSplineやTransform 3Dとしてcompに保存**されます。一方、メッシュ自体はcompを開き直した際にも外部のAlembicファイルから読み直されます。位置の動きだけ残って形状が表示されない場合は、Filenameと元の`.abc`ファイルの所在を確認します。

カメラ、ライト、材質を含むシーン全体を受け渡したい場合、Manualは**FBX形式の利用を推奨**しています。Alembicは主にメッシュ、とくにベイク済み変形の受け渡しに使い、必要な設定はFusion側で組み立てる方が判断しやすくなります。

## 関連

- [Classic 3Dノードの概要](./index.md)：Geometry・Camera・Lightを組み合わせる仕組み。
- [Classic 3D scene](../../learn/02-data/classic-3d.md)：2D Imageと3D sceneの違い。
- [FBX Mesh 3D](./fbx-mesh-3d.md)：別形式で読み込むときの選択肢。
- [Camera 3D](./camera-3d.md)：読み込んだsceneを撮影する視点。
- [Merge 3D](./merge-3d.md)：外部geometryと他の3D要素をまとめる。
- [Renderer 3D](./renderer-3d.md)：3D sceneを2D Imageへ変換する。

## 出典と確認範囲

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 88「3D Nodes」、**Alembic Mesh 3D [Abc]（pp.1913–1916）**。

読み込み方法、Importダイアログ、2本の任意入力、InspectorのFilename / Object Name / Wireframe、データ制限、Transformとgeometryの保存・再読み込みの違いは当該節に基づきます。現在のEffects Library表示、内部REGID、実機でのファイル互換性、各項目のdefault / rangeやedition差は別途検証が必要なため、`verification: partial`を維持しています。
