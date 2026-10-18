---
title: "3Dファイルの受け渡し：FBX・Alembic・USD"
description: "DaVinci Resolve Fusion 21.1における外部3Dシーンの読込・書出、アニメーションと材質の制限、Classic 3DとUSDの違い。"
doc_type: concept
term_id: file-interchange-3d
term_short: "Fusionと外部3Dソフト間で形状・動き・カメラなどのシーン情報をファイルで受け渡すこと。"
verification: partial
aliases: ["3Dファイルの受け渡し", "3D file interchange"]
concepts: [classic-3d, usd-scene, data-domain]
nodes: ["FBX Mesh 3D", "FBX Exporter 3D", "Alembic Mesh 3D", "uLoader", "uExport"]
tasks: [understand-domain, build-3d-scene, usd]
prerequisites: [classic-3d, usd-scene]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-19"
---

# 3Dファイルの受け渡し：FBX・Alembic・USD

Blenderなどで作ったモデルをFusionへ読み込む場合、**ファイル形式と読み込み方の両方**を選びます。たとえば同じFBXファイルでも、単体のFBX Mesh 3Dと、メニューからのFBX Scene Importでは、扱えるオブジェクトやアニメーションの単位が異なります。

Fusionには[Classic 3D scene](./classic-3d)と[USD scene](./usd)という別の3Dデータ系統があります。対応するノードも異なり、3D出力を相互にそのまま接続できるとは限りません。

## 用途別の選び方

| 目的 | Fusion 21.1の入口 | データ系統と注意点 |
| --- | --- | --- |
| 外部モデルの形だけを使う | [FBX Mesh 3D](../../nodes/3d/fbx-mesh-3d) | Classic 3D。単体でファイルを読むと形状が1メッシュにまとめられ、元のアニメーションは無視される |
| FBXの複数部品、ライト、カメラ、動きを使う | **Fusion > Import > FBX Scene** | Classic 3D。個別ノードが作られ、オブジェクトアニメーションも保持できる |
| 布やキャラクターなどベイク済みの頂点変形 | **Fusion > Import > Alembic Scene** | Classic 3D。材質やライトなどは読み込みの対応外 |
| USD内の形状・ライト・材質・カメラ・動きを使う | [uLoader](../../nodes/usd/uloader) | USDシーン。uMergeからuRendererへ渡す |
| Fusionで組んだClassic 3Dを書き出す | [FBX Exporter 3D](../../nodes/3d/fbx-exporter-3d) | FBXなど。材質・テクスチャは書き出せない |
| FusionのUSDシーンを書き出す | [uExport](../../nodes/usd/uexport) | USD / USDA / USDC / USDZ。受け取り側での再現確認は別途必要 |

## FBXを読み込む：単体ノードとScene Import

**FBX Mesh 3D**は、FBXやOBJ、3DS、DAE、DXFなどからポリゴンモデルを取り込みます。Nodeを単体で追加してファイルを指定すると、元のジオメトリは共通の基点とTransformを持つ1つのメッシュとして扱われ、アニメーションは無視されます。静止した建物や小道具ならこの方法が分かりやすいでしょう。

一方、別々に回る歯車とそれを撮影するカメラを受け取りたいなら、**Fusion > Import > FBX Scene**を使用します。メッシュ、ライト、カメラに対応した個別のノードが作られ、オブジェクトのアニメーションも扱えます。単体FBX Mesh 3Dへ読み込んでから同じ構成へ自動的に切り替わるわけではありません。

**テクスチャは、読み込みと書き出しで扱いが違います。** 21.1 Manual（p.1861）では、FBX読み込み時にメッシュへ最初に適用されたテクスチャを、存在すれば取り込むと説明しています。一方、**FBX Exporter 3Dは材質とテクスチャを書き出せません**。Fusionで加工したモデルを再度FBXへ保存しても、元の表面設定が残るとは限りません。外部ソフトとの往復では画像ファイルも別途管理し、再読込後に見た目を確認します。

~~~text
静止したモデル：
FBX Mesh 3D ─┐
Camera 3D ────┼→ Merge 3D → Renderer 3D → 2D画像
Light ────────┘

複数部品の動くシーン：
FBXファイル ⇒ Fusion > Import > FBX Scene
            ⇒ 個別のメッシュ・Camera・Lightなど
            ⇒ Merge 3D → Renderer 3D
~~~

**FBX Exporter 3D**は逆向きの処理です。Classic 3Dのシーンを入力し、**Filename**と**Format**を指定してツールバーの**Render**で書き出します。FBXのほかに3DS、DAE、DXF、OBJを選択できます。**Geometry / Lights / Cameras**で出力対象を選び、アニメーションを渡す場合は**Frame Rate**や**File Per Frame (No Animation)**を確認します。後者を有効にすると、アニメーションを含む単一ファイルの代わりに、フレームごとの連番ファイルが出ます。OBJ形式自体にはアニメーションを保存できません。

**重要な制限：FBX Exporter 3Dは材質・テクスチャを書き出せません。** Fusion上で立体タイトルに画像を貼っていても、別の3Dソフトで開くときには素材を別に渡して材質を設定し直す必要があります。

## Alembicを読み込む：変形の結果を渡す

Alembic（.abc）は、布・旗・変形するメッシュなど、あらかじめ計算した頂点の動きを渡すのに向きます。元のリグやシミュレーションをFusionで再計算するわけではありません。

たとえばBlenderで揺れる旗をベイクして受け渡す場合は、次の流れになります。

1. Blenderから、頂点アニメーションを含むAlembicを書き出します。
2. **Fusion > Import > Alembic Scene**で読み込みます。メニューからのImportでは、メッシュやTransformを個別のノードとして扱えるため、単体の[Alembic Mesh 3D](../../nodes/3d/alembic-mesh-3d)より後の編集がしやすくなります。
3. **Resample Rate**をファイルのサンプリングレートと照合します。動きの速さが違う場合は、最初にこの値を確認します。
4. メッシュをCamera 3Dやライトと[Merge 3D](../../nodes/3d/merge-3d)でまとめ、[Renderer 3D](../../nodes/3d/renderer-3d)で映像へ変換します。表面の画像や材質はFusion側で用意します。

~~~text
Blenderの旗.abc ⇒ Alembic Scene Import
メッシュとTransform ──┐
Camera 3D ────────────┼→ Merge 3D → Renderer 3D
Light ────────────────┘
~~~

21.1 Manualによれば、Alembic Importでは**Light / Material / Curve / 複数UV / Velocity**を読み込めません。Pointsは位置を取り込めますが、粒子の方向や向きは失われます。ImportしたTransformのアニメーションはFusionコンポジションに保存される一方、メッシュ本体は外部Alembicから再読込されます。Compを開き直して形状が消えたときは、外部ファイルの所在を確かめます。

## USDを読み込む：uLoaderからuRendererまで

USDのファイルは**uLoader**で読み込みます。対応する拡張子は**.usd / .usda / .usdc / .usdz**です。読み込む対象には形状・ライト・カメラ・材質・アニメーションが含まれますが、受け取り側で個々の機能がどこまで再現されるかはファイルによります。

~~~text
uLoader（外部USD） ─┐
uCamera ────────────┼→ uMerge → uRenderer → 2D画像
uDistant Light ─────┘

uMerge ─→ uExport ⇒ USDファイル
~~~

uLoaderの**Trim / Time Scale / Frame Offset / Reverse / Loop**は、読み込んだUSD内のアニメーションを映像の時間へ合わせる項目です。**uExport**では**Format**を指定し、**Export Stage**で保存先を選びます。Manualではジオメトリ・材質・アニメーション・照明の書き出しが説明されています。ただし、保存したファイルの外部参照や材質が別のソフトでも完全に解決されるという保証ではありません。

## Classic 3DとUSDは直接つながるのか

Classic 3D用の**Merge 3D / Renderer 3D**と、USD用の**uMerge / uRenderer**は別のデータ系統です。FBX Mesh 3Dの出力をuMergeへ直接接続する手順は確認できません。

2つの系統を1つの映像に重ねたいだけなら、それぞれのRendererで**2D画像に変換した後**、通常のMergeで合成します。

~~~text
Classic 3D → Renderer 3D ─┐
                           ├→ Merge（2D）→ MediaOut
USD scene  → uRenderer ────┘
~~~

この方法では、別々の3Dシーンの間で**影・反射・遮蔽を3Dとして相互計算しません**。立体同士を本当に同じ空間へ置く必要がある場合は、制作するシーン系統を選び、必要なら外部3Dソフトで対応形式へ整えてから読み込みます。ただし**Classic 3D出力をUSDへ直接変換する標準ノードや、変換時にすべての情報を保持できる方法は、参照した21.1 Manualには確認できません**。[接続互換性](./connection-compatibility)も参照してください。

## 受け渡し後に確認すること

形状の個数・大きさ・原点、カメラの画角、ライト、開始・中間・終了フレームでのアニメーション、外部画像の参照、材質、オブジェクトの階層をそれぞれ確認します。スケールが違う場合、FBX Mesh 3Dには**Size**、FBX Exporter 3Dには**Scale Units By**があります。Alembicは**Resample Rate**、USDはuLoaderの時間設定も検査対象です。

形式の名前だけで「材質を保持する」「アニメーションが読める」と判断せず、**読み込み方法と必要な情報**を組にして確認するのが安全です。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、**Chapter 84 p.1861**（FBX読み込み時の最初のテクスチャ／FBX Exporterの材質・テクスチャ制限）、**Chapter 88 pp.1913–1916**（Alembic Mesh 3DとImport）、**pp.1945–1949**（FBX Exporter / FBX Mesh 3D）、**Chapter 121 pp.2887–2888**（USDの読み込み）、**p.2900**（uExport）、**pp.2902–2903**（uLoader）。公式資料は[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)から入手できます。

本文の制作例はManualの仕様を組み合わせた説明であり、実機でのアプリ間互換性テストではありません。外部形式の完全なデータ保持、Classic 3DとUSDの直接変換、各Edition差は未確認として扱います。
