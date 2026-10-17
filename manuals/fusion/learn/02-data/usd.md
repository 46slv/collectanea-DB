---
title: USD scene
description: FusionのUSDを、Classic 3Dとは別のscene domainとして理解し、uLoaderからuMerge・uRendererまでの流れとPrim Selectionを読む。
doc_type: concept
term_id: usd-scene
term_short: uLoaderやuShapeなどのu* Nodeが扱い、uRendererで2D Image / AOVへrenderするUSD scene data。
verification: partial
aliases: [USD, USD scene, Universal Scene Description]
concepts: [data-domain, scene-graph, material, rendering]
nodes: [uLoader, uMerge, uRenderer, uShape, uCamera]
tasks: [usd, understand-domain, build-usd-scene]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-18"
---

# USD scene

USDは、geometry、camera、light、material、animation等をsceneとして記述するUniversal Scene Descriptionの仕組みです。

FusionではuLoader、uShape、uCamera、uMerge、uRenderer等の`u*` Nodeが<Term id="usd-scene">USD scene</Term>を扱います。Classic 3Dとは別のscene domainです。

## 最小構成

USD fileを読む場合:

```text
uLoader ────┐
uCamera ────┼─ uMerge → uRenderer → 2D Image / AOV
uDistant Light ─┘
```

primitiveをFusion内で作る場合:

```text
uShape → uMerge → uRenderer
```

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

## Material

USD material workflowでは、uTexture → uNormalMap / uTextureTransform → uShader → uReplaceMaterialという構成を作れます。

MaterialX fileをそのまま使う場合はuMaterialXからuReplaceMaterialへ渡します。

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
- Material: uMaterialX / uTexture / uNormalMap / uTextureTransform / uShader / uReplaceMaterial
- Render: uRenderer

## 関連Node

- [USDノード](../../nodes/usd/)
- [uLoader](../../nodes/usd/uloader)
- [uMerge](../../nodes/usd/u-merge)
- [uRenderer](../../nodes/usd/u-renderer)
- [uTransform](../../nodes/usd/utransform)
- [uVisibility](../../nodes/usd/uvisibility)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 121 pp.2887–2888（USD読み込み・Scene Tree）、pp.2923–2924（uTransform）、pp.2927–2928（uVisibility）を中心に、USD file、Prim Selection、u* toolset、material / lighting / render flowを整理しています。

USD SDK内部仕様、Hydra内部実装、runtime REGID、external USD asset互換性は別途実機確認が必要です。
