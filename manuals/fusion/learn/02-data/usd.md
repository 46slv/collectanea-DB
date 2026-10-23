---
title: USD scene
description: FusionのUSDを、Classic 3Dとは別のscene domainとして理解し、uLoaderからuMerge・uRendererまでの流れとPrim Selectionを読む。
doc_type: concept
term_id: usd-scene
term_short: uLoaderやuShapeなどのu* Nodeが扱い、uRendererで2D Image / AOVへrenderするUSD scene data。
verification: partial
aliases: [USD, USD scene, Universal Scene Description]
concepts: [data-domain, scene-graph, material, rendering, time]
nodes: [uLoader, uMerge, uRenderer, uShape, uCamera, uSwitch, uVariant, uVisibility, uExport]
tasks: [usd, understand-domain, build-usd-scene]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# USD scene

USDは、geometry、camera、light、material、animation等をsceneとして記述するUniversal Scene Descriptionの仕組みです。

FusionではuLoader、uShape、uCamera、uMerge、uRenderer等の`u*` Nodeが<Term id="usd-scene">USD scene</Term>を扱います。Classic 3Dとは別のscene domainです。

## 最小構成

USD fileを読む場合:

```text
uLoader ───────────┐
uCamera ───────────┼→ uMerge → uRenderer → 2D Image / AOV
uDistant Light ────┘
```

primitiveをFusion内で作る場合:

```text
uShape → uMerge → uRenderer
```

ここで使う[uDistant Light](../../nodes/usd/udistant-light)は、太陽光のように一定方向からシーンを照らすUSDライトです。uCameraは撮影視点を決め、uDistant Lightは照明を加えます。両方ともuMergeで同じUSDシーンにまとめ、uRendererで2D画像にします。配置したライトをレンダリングに使う場合は、uRendererの**Lighting: Scene**を確認します。

壁や立体に**2D画像を投影**したい場合は、照明用のuDistant Lightではなく[uProjector](../../nodes/usd/uprojector)を使います。uProjectorは画像を光として投影するLightモードと、uCatcherを使って表面テクスチャとして扱うTextureモードを持ちます。

### 実機の参考例

<!-- capture-reuse:R20 -->

外部ファイルを使わず、uShape1 → uMerge1 → uRenderer1 → MediaOut1で描画しました。uRendererはStorm、Output AOVはColor、出力は1920×1080です。

[![S12の実機撮影例。Node Editorの接続](/img/fusion/captures/S12/graph.png)](/img/fusion/captures/S12/graph.png)

[![S12の実機撮影例。Viewerの出力結果](/img/fusion/captures/S12/result.png)](/img/fusion/captures/S12/result.png)

Resolve Studio 21.1.0.14／Windowsで撮影済みのS12を再利用した参考例です。プリミティブのColor出力例です。uLoader、Scene Tree、Prim Selection、保存後の再読込、非Color AOVは別の撮影対象です。 [元の撮影条件と確認範囲](/img/fusion/captures/S12/capture.json)

## uLoader

`.usd`、`.usda`、`.usdc`、`.usdz`を読み込み、USD sceneを作ります。

animationを含むUSDではTrim、Time Scale、Frame Offset、Reverse、Loopを使ってtimeを調整できます。

## Scene Tree / Prim Selection

USD scene内の個々の構成要素を**prim（プリム）**と呼びます。建物、車、Cameraなどを親子関係で並べたものがScene Treeです。たとえば、次は説明用に簡略化した階層です。実際のprim名とパスは読み込むUSD fileによって異なります。

```text
/World
 ├─ Building
 ├─ Car
 └─ Camera
```

`/World/Car`はこの例の車を指す**prim path**です。画像の座標やMaskの範囲ではなく、scene内のどの要素を操作するかを指定します。

uVisibility、uTransform、uVariant、uReplaceMaterialなどのInspectorでは、**Prim SelectionのPick**からScene Treeを開いて対象を選べます。Scene Treeでは要素の種類を確認し、複数のprimを選択することもできます。

### 例：読み込んだ車だけを非表示にする

```text
uLoader → uVisibility → uMerge → uRenderer → MediaOut
```

1. uLoaderで建物と車を含むUSD fileを読み込み、uVisibilityのScene Inputへ接続します。必要なCameraやLightはuMergeに追加します。
2. uVisibilityのInspectorで**Pick**を押し、Scene Treeから車のprimを選びます。上の例なら`/World/Car`です。**Selected Prims**に選択対象が表示されたことを確認します。
3. **Visible**をオフにします。uVisibilityの出力をuRendererまでつなぐと、車を隠した状態でsceneを描画できます。建物は選択していないため、この操作の対象になりません。

**Invert Prim Selection**をオンにすると、選択したprimとそれ以外のprimの扱いを反転できます。大量の要素から「この車以外」を対象にしたい場合に使います。VisibleとInvert Prim Selectionは、21.1 Manualではキーフレームでアニメーションできる項目として説明されています。

### 例：車だけを移動する

車を消さずに位置だけ変えたいときは、`uLoader → uTransform → uMerge → uRenderer`とつなぎます。uTransformの**Pick**で車のprimを選び、**Translation**で位置を変更します。uTransformは入力scene内の選択した要素に変形を追加するため、建物を含むscene全体を動かすuMergeのTransformとは目的が異なります。

Prim Selectionは「何を対象にするか」、uVisibilityやuTransformは「選んだ対象に何をするか」を決める機能です。

## uMerge

複数USD object、camera、light、sceneを同じUSD environmentへまとめます。

inputは動的に増え、uMerge自身のTransformは接続したobject全体へ作用するため、group / parenting相当のmovementにも使えます。

## uRenderer

USD sceneを2D Imageへrenderするdomain boundaryです。

ColorだけでなくDepth、PrimID、Camera Depth等のAOVを出せます。Output AOVs As Layersを有効にすると、1つのuRendererから複数AOVをlayerとして扱えます。

## アニメーションを扱うとき：時間・切り替え・保存を分ける

USDシーンの動きには、**元ファイルの時間をどう再生するか**、**どのモデル・Primを見せるか**、**別ファイルに何を保存するか**という別々の操作があります。画面で動いて見えることだけでは、書き出したUSDでも同じ時間変化が残るとは限りません。

| 操作 | ノードと設定 | 何を変えるか／何を変えないか |
| --- | --- | --- |
| 読み込んだ動きの区間・速度・開始時刻 | [uLoader](../../nodes/usd/uloader)の**Trim / Time Scale / Frame Offset** | USD内にあるアニメーションの再生範囲・速さ・開始位置を調整する。編集ページ上のクリップ長や、ほかのノードの時間までは変更しない |
| 逆再生・繰り返し | uLoaderの**Reverse / Loop** | 読み込んだ動きを逆向き・反復で評価する。元のファイルに新たな動きを作る機能ではない |
| 複数のUSD入力から採用モデルを選ぶ | [uSwitch](../../nodes/usd/uswitch)の**Source** | 後段に渡す入力を1つ選ぶ。21.1 Manualは**Sourceのキーフレーム可否**を明記していない |
| 1つのUSDに用意された仕様を選ぶ | [uVariant](../../nodes/usd/uvariant)の**Variant Set / Variant** | 元のUSD内に存在する候補から選ぶ。**Variant選択そのもののアニメーション可否**は同節からは確定しない |
| 一部のPrimを出し入れする | [uVisibility](../../nodes/usd/uvisibility)の**Visible** | 選んだPrimの表示・非表示を変える。21.1 Manualは**VisibleとInvert Prim Selectionのキーフレーム対応**を明記している。透明度を連続的にフェードする設定ではない |
| 別ソフトへ3Dデータを渡す | [uExport](../../nodes/usd/uexport)の**Export Stage / Format** | USDシーンをファイルに保存する。アニメーションの書き出しには対応するが、上記の時間操作や切り替えの**保存後の評価・保持条件**まではManualに書かれていない |

### 制作例：動く車と看板の表示をショットに合わせる

外部ソフトから、走行アニメーションと道路沿いの看板を含むUSDを受け取ったとします。車の動き出しをショットの途中に合わせ、指定のタイミングで看板を隠す例です。

~~~text
uLoader（車・看板のUSD、Trim / Time Scale / Frame Offset）
  → uVisibility（看板Prim、Visibleをキーフレーム）
  → uMerge（必要なカメラ・照明を追加）
       ├→ uRenderer → MediaOut（映像を確認）
       └→ uExport ⇒ shot.usdc（USDを保存する場合）
~~~

1. uLoaderで元のUSDを読み、**Trim**で使用区間を選びます。**Time Scale**で速度を調整し、**Frame Offset**で動き始めを合わせます。ショットのクリップ自体を短くする操作とは分けて考えます。
2. uVisibilityの**Pick**で看板のPrimを選びます。**Visible**を動かして表示状態を変える場合は、切り替え前後にキーフレームを置き、uRenderer側で実際のフレームを確認します。看板が徐々に透ける演出を作る操作ではありません。
3. 車のモデル自体を別候補に替える場合はuSwitch、同じアセット内で屋根の仕様などを選ぶ場合はuVariantが候補です。**いずれもSource / Variantを時間で自動切替できるとManualだけからは断定しません**。
4. 映像だけが必要ならuRendererの結果を使います。USDを受け渡すならuExportで保存し、**新しいuLoaderで再読込**して、開始・中間・終了と表示切り替え前後のフレームを比較します。元の車の動き、看板Primの存在、表示状態の時間変化を別々に検査してください。

**確認範囲：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 121、p.2900（uExport）、pp.2902–2903（uLoader）、pp.2921–2922（uSwitch）、pp.2925–2926（uVariant）、pp.2927–2928（uVisibility）。各設定の機能と明記されたキーフレーム対応を根拠にした説明です。**uLoaderの複合時間評価順序、uSwitch Source・uVariant Variant選択のアニメーション、uExportによる時間サンプル・Variant候補・表示アニメーションの保持は実機未検証**です。ファイル形式をまたぐ確認手順は[3Dファイルの受け渡し](./3d-file-interchange)も参照してください。

## 材質を変える：USDシーンと材質の入力を分ける

**材質（Material）**は、物体の表面を何色に描くか、光をどの程度反射させるかなどを決める情報です。車の形・位置・カメラを含む**USDシーン**とは役割が異なります。Fusionでは、変更したいモデルを[uLoader](../../nodes/usd/uloader)から、適用する材質を[uShader](../../nodes/usd/ushader)や[uMaterialX](../../nodes/usd/umaterialx)から用意し、[uReplaceMaterial](../../nodes/usd/ureplacematerial)で組み合わせます。

### 例：読み込んだ車のボディだけ塗装を替える

~~~text
MediaIn / 画像ファイル → uTexture → uShader ─┐ Material Input
                                           ↓
uLoader（車のUSD） ───────────────→ uReplaceMaterial → uMerge → uRenderer
                                  Scene Input                ↑
                                                uCamera・USDライト（必要なら）
~~~

1. **uLoader**で車のUSDを読み込み、uReplaceMaterialの**Scene Input**へつなぎます。車体・タイヤ・窓が個別のPrim（USDシーン内の要素）になっていれば、変更する部品を選び分けられます。
2. 画像を塗装に使う場合は、[uTexture](../../nodes/usd/utexture)で読み込みます。静止画像なら**File Name**でファイルを選び、動画やFusion内で生成した画像なら**Image Input**にMediaInなどを接続します。Image InputをつなぐとFile Nameの画像より優先され、アニメーションするテクスチャにもできます。uTextureを**uShader**の目的の材質項目につなぎ、接続時の入力候補を確認します。凹凸の法線マップなら[uNormalMap](../../nodes/usd/unormalmap)を挟み、uTextureの**Source Color Space**も確認します。
3. **uShaderの出力**をuReplaceMaterialの**Material Input**へつなぎます。uReplaceMaterialでは、Inspectorで使う材質の種類・参照先も確認します。材質の線を接続しただけで、必ず意図した材質が自動選択されるとは限りません。
4. **Prim Selection → Pick**で車体のPrimを選びます。タイヤやガラスを変えたくなければ、選択範囲と**Invert Prim Selection**の状態を確認してください。**材質の用意**と**適用先の選択**は別の操作です。
5. 必要に応じて**uMerge**でカメラやUSDライトを加え、**uRenderer**で2D画像として確認します。車体が変わらない場合は、まずMaterial Input、材質の選択、Prim Selectionを切り分けて確認します。

### 外部のMaterialXを使う場合

別の3Dソフトで作った`.mtlx`ファイルを使うなら、**uMaterialX**の**Material File**で読み込み、その出力をuReplaceMaterialのMaterial Inputへ渡せます。uMaterialXにはシーンをつなぐ入力はなく、**材質だけを含むUSDデータ**を用意する役割です。モデルは引き続きuLoaderからScene Inputへ渡します。もう一つの方法として、uReplaceMaterial自身の**Type = MaterialX**から`.mtlx`ファイルを直接指定することもできます。

画像・動画をFusionのノードから直接材質へ渡したい場合は、uReplaceMaterialの**Image Input**も利用できます。21.1 Manualでは、Image Inputに接続した画像が**Diffuse Texture**に使われ、ファイル選択欄の画像より優先されると説明されています。これは**USDシーンを2D画像へ変換する入力**ではなく、物体の表面へ貼る画像の入力です。

**出典・確認範囲：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 121、p.2904（uMaterialX）、pp.2915–2916（uReplaceMaterialの入力・Type・Prim Selection）、pp.2940–2941（uNormalMap・uShader）、p.2944（uTextureのFile Name / Image Input）。説明中の車体の塗装交換は各ノードの機能を組み合わせた例で、特定のUSDアセットにおける材質互換性・描画結果は実機未検証です。

## Classic 3Dとの違い

```text
Classic 3D: Shape 3D → Merge 3D → Renderer 3D
USD:        uShape   → uMerge   → uRenderer
```

似た目的でもscene representationとNode familyが違います。

Classic 3DのGeometryをそのままuMergeへ接続できると仮定せず、現在扱っているdomainを確認します。

## 21.1のUSD family

21.1 Manual Chapter 121には、scene / transform / selection / material / light / renderまでUSD専用Nodeがまとめられています。

代表的な役割:

- Load / Export: uLoader / uExport
- Generate: uShape / uImage Plane / uVolume
- Combine: uMerge
- Transform / visibility / variant: uTransform / uVisibility / uVariant
- Duplicate / switch: uDuplicate / uSwitch
- Camera / projection: uCamera / uProjector / uCatcher
- Lighting: uDistant Light / uDome Light / uDisk Lightなど
- Material: uMaterialX / uTexture / uNormalMap / uTextureTransform / uShader / uReplaceMaterial
- Render: uRenderer

## 関連Node

- [USDノード](../../nodes/usd/)
- [uLoader](../../nodes/usd/uloader)
- [uMerge](../../nodes/usd/u-merge)
- [uRenderer](../../nodes/usd/u-renderer)
- [uDistant Light](../../nodes/usd/udistant-light)
- [uProjector](../../nodes/usd/uprojector)
- [uTransform](../../nodes/usd/utransform)
- [uVisibility](../../nodes/usd/uvisibility)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 121 pp.2887–2888（USD読み込み・Scene Tree）、pp.2923–2924（uTransform）、pp.2927–2928（uVisibility）、pp.2933–2934（uDistant Light）を中心に、USD file、Prim Selection、u* toolset、material / lighting / render flowを整理しています。

USD SDK内部仕様、Hydra内部実装、runtime REGID、external USD asset互換性は別途実機確認が必要です。
