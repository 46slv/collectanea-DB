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

## USDを再出力する：画像と3Dシーンを別々に検証する

外部で作ったUSDのモデルをFusion内で配置し直し、さらにUSDとして別の工程へ渡す場合は、**映像への描画**と**3Dシーンの書き出し**を分けて確認します。uRendererは2D画像を作り、uExportはUSDシーンをファイルに保存します。同じ結果に見えても、出力されるデータが異なります。

~~~text
uLoader（外部の車.usdc） ──┐
uShape（追加した床） ────────┼→ uMerge ─┬→ uRenderer → 2D画像
uCamera（必要なら） ────────┘          └→ uExport ⇒ shot.usdc
~~~

1. [uLoader](../../nodes/usd/uloader)で車のUSDを読み込み、必要なら[uTransform](../../nodes/usd/utransform)で車の位置を調整します。
2. [uShape](../../nodes/usd/ushape)で床を加え、uCameraなどとともにuMergeへ接続します。**uMergeの入力に入れるのはUSDシーン**です。
3. uMergeの出力を[uRenderer](../../nodes/usd/u-renderer)で描画し、車と床の位置関係を確認します。これは**見た目の確認**であり、USDファイルの保存確認ではありません。
4. 同じuMergeのUSD出力を[uExport](../../nodes/usd/uexport)へつなぎ、Inspectorの**Format**で保存形式（たとえば**USD binary / .usdc**）を選択します。**Export Stage**でファイルの保存先を指定します。
5. 書き出したファイルを**別のuLoader**で開き直し、形状と階層、カメラ・ライト、材質、アニメーションの必要な部分を調べます。別ソフトへ納品する場合は、そのソフトでも同じ点を確認します。

**アニメーションの時間には注意が必要です。** uLoaderの**Trim / Time Scale / Frame Offset / Reverse / Loop**は、読み込んだUSDの再生範囲・タイミングを調整する項目です。21.1 ManualのuExport節はアニメーションを含むシーンの書き出しに触れていますが、**uLoaderで調整した再生範囲や速度が出力ファイルの時間サンプルへどのように反映されるか**までは明記していません。納品時刻の一致が重要なら、書き出し前後の開始・中間・終了フレームを比較します。

また、**USDZを選べば外部画像や別ファイルへの参照がすべて自動で解決する**とは断定できません。テクスチャやMaterialXを使う場合は、書き出したファイルを実際の受け渡し環境で開き、必要な依存ファイルが参照できるか確かめます。

### Classic 3DをそのままUSDにできる？

**FBX Mesh 3D / Merge 3Dの出力と、uExportが受け取るUSDシーンは別のデータ系統**です。21.1 Manualで確認できる書き出し経路は、Classic 3D側が**FBX Exporter 3D（FBX / 3DS / DAE / DXF / OBJ）**、USD側が**uExport（USD / USDA / USDC / USDZ）**です。少なくともこれらの記載から、Merge 3DをuExportへ直接接続する手順や自動変換機能は導けません。

たとえばClassic 3Dで立体タイトルを組み、外部ソフトでUSDとして再利用したい場合は、まずFBX Exporter 3Dで対応形式に書き出し、**別のUSD対応ソフト側で変換できるか**を確認します。このときFBX Exporter 3Dは**材質とテクスチャを書き出せない**ため、外観を同じまま受け渡すには別途調整が必要です。必要なのが映像への重ね合わせだけなら、次節のように両方をそれぞれ2Dへ描画します。

## Classic 3DとUSDは直接つながるのか

Classic 3D用の**Merge 3D / Renderer 3D**と、USD用の**uMerge / uRenderer**は別のデータ系統です。FBX Mesh 3Dの出力をuMergeへ直接接続する手順は確認できません。

2つの系統を1つの映像に重ねたいだけなら、それぞれのRendererで**2D画像に変換した後**、通常のMergeで合成します。

~~~text
Classic 3D → Renderer 3D ─┐
                           ├→ Merge（2D）→ MediaOut
USD scene  → uRenderer ────┘
~~~

この方法では、別々の3Dシーンの間で**影・反射・遮蔽を3Dとして相互計算しません**。立体同士を本当に同じ空間へ置く必要がある場合は、制作するシーン系統を選び、必要なら外部3Dソフトで対応形式へ整えてから読み込みます。ただし**Classic 3D出力をUSDへ直接変換する標準ノードや、変換時にすべての情報を保持できる方法は、参照した21.1 Manualには確認できません**。[接続互換性](./connection-compatibility)も参照してください。

## 材質とアニメーションは、読み込みと再出力で扱いが違う

モデルがFusionで表示できても、そのまま別ソフトへ書き戻せるとは限りません。特に**元の動きが読み込まれたか**、**Fusionで設定した表面の見た目がファイルへ保存されるか**は、別々に確認する必要があります。

| 経路 | アニメーション | 材質・テクスチャ | 再出力時の判断 |
| --- | --- | --- | --- |
| **FBX Mesh 3Dを単体で読み込む** | 元ファイルのアニメーションは無視される | 最初に適用されたテクスチャは、存在すれば読み込まれる場合がある | [FBX Exporter 3D](../../nodes/3d/fbx-exporter-3d)で元の動きが自動復元されるわけではない。材質・テクスチャは書き出せない |
| **FBX Scene Import** | オブジェクトごとの動きを取り込める | 読み込み側と書き出し側の対応範囲は異なる | FBX Exporter 3Dはアニメーションを書き出せるが、**File Per Frame (No Animation)**ではフレーム別ファイルになる。書き出し形式と再生結果を確認する |
| **Alembic Scene Import** | ベイク済みの形状変化やTransformを扱う。**Resample Rate**を確認する | 読み込み時にMaterial・Lightなどは対応外。必要ならFusion側で設定する | FBX Exporter 3DでClassic 3Dを出力することはできるが、**元のAlembicの頂点変形が同等に保存されるかは、この資料からは確定できない** |
| **uLoader → uExport** | USDアニメーションを扱い、uLoaderで再生範囲・速度などを調整できる | USDシーンの材質を扱い、[uReplaceMaterial](../../nodes/usd/ureplacematerial)で変更できる | uExportはUSDの材質・アニメーションを書き出す。ただし**再生時間の変更、MaterialXや外部参照が期待どおり保持されるか**は書き出したファイルで検証する |

### 例：動く車のFBXを別の3Dソフトへ返す

車体とタイヤが別々に動くFBXを受け取り、Fusionで塗装を変更して返す場合、まず**FBX Scene Import**を使います。FBX Mesh 3Dを単体で置くだけでは、元のオブジェクトアニメーションが無視されるためです。タイヤの回転が必要なフレームで再生されることを確認し、車体へ[Replace Material 3D](../../nodes/3d/replace-material-3d)などで材質を設定します。

その後、FBX Exporter 3Dでジオメトリとアニメーションを書き出しても、**Fusionで設定した塗装材質はファイルに含まれません**。別ソフトで編集を続けるなら、画像素材や材質の指定を別途渡し、受け取り側で再設定します。Fusionの見た目そのものが納品物なら、Renderer 3Dで映像として書き出す方が目的に合う場合があります。

USDで渡す場合も「uExportが材質・アニメーションに対応する」ことと「個別のマテリアルや時間変更が完全に再現される」ことは別です。[uLoader](../../nodes/usd/uloader)で保存済みUSDを読み直し、納品先でも材質と開始・中間・終了フレームを比べます。

**資料の根拠：** DaVinci Resolve 21.1 Reference Manual、p.1861（FBXテクスチャの読込・書出制限）、pp.1945–1949（FBXのアニメーションとExporter）、p.1914（Alembic Import）、p.2900（uExport）、pp.2902–2903（uLoader）。Alembic→FBXの頂点変形保持と、uLoaderの時間調整をuExportがどのように記録するかは実機未確認です。

## 受け渡し後に確認すること

形状の個数・大きさ・原点、カメラの画角、ライト、開始・中間・終了フレームでのアニメーション、外部画像の参照、材質、オブジェクトの階層をそれぞれ確認します。スケールが違う場合、FBX Mesh 3Dには**Size**、FBX Exporter 3Dには**Scale Units By**があります。Alembicは**Resample Rate**、USDはuLoaderの時間設定も検査対象です。

形式の名前だけで「材質を保持する」「アニメーションが読める」と判断せず、**読み込み方法と必要な情報**を組にして確認するのが安全です。

<!-- capture:S130 -->

## 書き出したUSDを別のuLoaderで確認する

uRendererが作るのは2D画像、uExportが保存するのはUSD sceneです。書き出し後のファイルを別のuLoaderで読み込み、sceneの再読込と画像への描画を分けて確認します。

1. uLoaderからuMergeへ読み込んだsceneをuRendererへ接続し、元の画像を表示します。
2. 同じuMergeをuExportへ分岐し、InspectorのFormatで「USD UTF-8 (*.usda)」を選んでExport Stageから保存します。
3. 保存したUSDAを別のuLoaderで読み込み、同じframeのuRenderer画像を元の表示と比べます。

この例では2つのViewerに同じ形状のCubeが表示されました。ただしViewerごとに表示倍率が異なるため、画面上の大きさではなく形状を比べます。出力USDAには元ファイルへの相対参照と補助ファイルが含まれるため、参照先も一緒に扱います。別アプリでの参照解決、材質やアニメーションの受け渡しは、この表示だけでは確認できません。

[![左右のViewerで、元USDから描画したCubeと、uExport後のUSDを別uLoaderで読み戻して描画したCubeを比較する](/img/fusion/captures/S130/roundtrip-viewers.png)](/img/fusion/captures/S130/roundtrip-viewers.png)

左はImageRoundtrip、右はImageOriginalです。frame 149で両方に同じ形状の灰色Cubeが表示されています。Viewerの表示倍率が異なるため、画面上の大きさは比較しません。

[![uLoaderからuMergeを経てuRendererへ進む元sceneと、uExportへの書き出し分岐、別uLoaderから再読込したsceneのFusion graph](/img/fusion/captures/S130/usd-graph.png)](/img/fusion/captures/S130/usd-graph.png)

元のsceneはuRendererとuExportへ分岐します。下段は出力USDを別uLoaderで読み込む確認用の経路です。

[![USDExportのInspectorでFormatがUSD UTF-8 (*.usda)と表示されている](/img/fusion/captures/S130/usd-format.png)](/img/fusion/captures/S130/usd-format.png)

Format欄の表示文字列を記録しました。SDKの数値入力との対応付けは未確定です。

[再現用Graph](/img/fusion/captures/S130/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S130/capture.json)

<!-- /capture:S130 -->

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、**Chapter 84 p.1861**（FBX読み込み時の最初のテクスチャ／FBX Exporterの材質・テクスチャ制限）、**Chapter 88 pp.1913–1916**（Alembic Mesh 3DとImport）、**pp.1945–1949**（FBX Exporter / FBX Mesh 3D）、**Chapter 121 pp.2887–2888**（USDの読み込み）、**p.2900**（uExport）、**pp.2902–2903**（uLoader）。公式資料は[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)から入手できます。

本文の制作例はManualの仕様を組み合わせた説明であり、実機でのアプリ間互換性テストではありません。外部形式の完全なデータ保持、Classic 3DとUSDの直接変換、各Edition差は未確認として扱います。
