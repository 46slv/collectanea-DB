---
title: "Replace Normals 3D"
description: "Classic 3D meshのper-vertex Normal / Tangentを再計算し、smooth / faceted shadingを整えるNode。"
doc_type: node
term_id: "replace-normals-3d"
term_short: "Replace Normals 3Dは、Classic 3D meshの頂点Normal / Tangentを再計算し、表面のsmooth / faceted shadingを調整するNode。"
verification: partial
aliases: ["Replace Normals 3D", "3RpN"]
concepts: ["classic-3d"]
nodes: ["Replace Normals 3D"]
node_family: "3d"
controls: ["Pre-Weld Position Vertices", "Recompute", "Smoothing Angle", "Ignore Smooth Groups", "Flip Normals"]
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Replace Normals 3D

Replace Normals 3D [3RpN]は、**Classic 3D geometryの頂点NormalとTangentを再計算し、lightingやbump mappingに使われる表面方向を整える**Nodeです。

Normalは、surfaceがどちらを向いているかを表すvectorで、lightの当たり方やsmooth shadingの見え方に影響します。geometryのPositionを変形した後も古いNormalが残っていると、形状と陰影が一致しないことがあります。Replace Normals 3Dは、そのようなmeshのNormal / Tangentを作り直したいときに使います。

このNodeが処理するのは**per-vertex Normal / Tangent**です。Light、Camera、Point Cloud、Locator、Materialなどのnon-mesh要素は、そのまま通過します。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualでは、入力は1本です。

- **SceneInput**（orange）: Normal / Tangentを処理したい3D geometryまたはClassic 3D sceneを受け取ります。
- **Output**: 処理後のClassic 3D geometry / sceneを返します。

基本的には、Normalを直したいgeometryの直後へ挿入します。

```text
3D Geometry
    ↓
Replace Normals 3D
    ↓
Merge 3D → Renderer 3D → Image
```

Scene全体を入力した場合でも、Normal / Tangentを持つmesh geometryが処理対象です。CameraやLightまで別のdataへ変換されるわけではありません。

## Recompute

**Recompute**は、Normal / Tangentをいつ再計算するかを決めます。

- **Always**: meshのNormalを常に再計算します。
- **If Not Present**: Normalが存在しない場合だけ再計算します。
- **Never**: Normalを再計算しません。21.1 Manualでは、animation時に使える選択肢として説明されています。

importしたmodelにNormalがない場合だけ補いたいならIf Not Present、変形後のNormalを作り直したい場合はAlwaysが候補になります。

一方、元model用に調整されたNormalを維持したい場合は、無条件にAlwaysへするべきではありません。特にbump mapと元Normalが組み合わせて作られているmodelでは、Normalを再計算すると見え方が変わる場合があります。

## Pre-Weld Position Vertices

同じ位置に重なったPosition vertexが別vertexとして存在すると、Normal / Tangentの計算が分断されることがあります。

**Pre-Weld Position Vertices**は、Normal / Tangentを計算する前に、そのようなvertexを一時的にweldして計算しやすくするControlです。

このpre-weldは計算用で、Manualでは**output geometryのPosition vertex自体は変更しない**と説明されています。geometryそのものをweldしたい場合に使う[Weld 3D](./weld-3d.md)とは役割が異なります。

## Smoothing Angle

**Smoothing Angle**は、隣り合うfaceの境界をsmoothにつなぐかどうかを角度で決めます。

隣接faceの角度が設定値より小さい場合、そのedgeをまたいでNormalがsmoothになります。角度の差が大きいedgeは、輪郭を残したままにできます。

21.1 Manualでは、20〜60度程度を典型的な値として挙げています。また、0ではfacetedなNormalになると説明されています。

- 小さい角度: hard edgeを残しやすい
- 大きい角度: より広い範囲をsmoothにつなぎやすい
- 0: facetedな表面表現

ただし、実際にどのedgeをsmoothにするかはSmooth Groupの扱いにも影響されます。

## Ignore Smooth Groups

3D modelには、隣り合うfaceをsmoothにつなぐかを示す**Smooth Group**が含まれている場合があります。

**Ignore Smooth Groups**がoffの場合、異なるSmooth Groupに属するfaceはSmoothing Angleだけではsmoothにつながりません。

onにするとSmooth Groupの区切りを無視し、Smoothing Angleを基準に再計算できます。Manualでは、十分大きなSmoothing Angleと組み合わせればCubeのface間もsmoothにできる例を挙げています。

読み込んだ3Dモデルの既存Smooth Groupを尊重したいのか、Fusion側で角度基準に作り直したいのかで切り替えます。

## TangentとFlipの注意

Tangentは、主にbump mappingでsurface方向を扱うために使われます。

21.1 Manualでは、Fusionの多くのprimitiveは最初からTangentを持たず、必要になった時点でRenderer 3Dが生成してcacheすることがあると説明されています。Replace Normals 3Dを使えば、Renderer任せにせずNormal / Tangentを前段で計算できます。

Tangentを計算するには、入力geometryにtexture coordinateが必要です。UV等が存在しないgeometryでは、Tangentを期待どおり計算できない場合があります。

Manualの**Flip Normals**節では、meshにTangentがまだ存在しない状態でFlipU / FlipVを操作しても、Viewer上で変化が見えない場合があることも説明されています。後段のRenderer 3DがあとからTangentを生成する場合があるため、Flipの結果を判断するときは「現在そのmeshにTangentが存在するか」も確認します。

## Custom Vertex 3DやDisplace 3Dの後で使う

[Custom Vertex 3D](./custom-vertex-3d.md)や[Displace 3D](./displace-3d.md)でvertex Positionを大きく変形すると、元のNormalが新しいsurface方向と一致しなくなることがあります。

その場合は、変形の後ろにReplace Normals 3Dを置いてNormalを再計算します。

```text
Geometry
   ↓
Custom Vertex 3D / Displace 3D
   ↓
Replace Normals 3D
   ↓
Merge 3D → Renderer 3D
```

見た目としては、geometryは曲がっているのにlightの当たり方だけ変形前の面を向いているような違和感を直す用途です。

## importしたmeshのNormalを整える

FBX等のimport geometryで、Normalが欠けていたり、vertexの重複によってshading seamが出ていたりする場合にも使えます。

Manualでは、FBX importerもNormalが存在しない場合に再計算しますが、Replace Normals 3Dを使うとより高品質な結果を得られる場合があると説明されています。

典型的には次を順に確認します。

1. RecomputeをIf Not PresentまたはAlwaysにする。
2. 必要ならPre-Weld Position Verticesを使う。
3. Smoothing Angleでhard / smoothの境界を調整する。
4. import時のSmooth Groupを残すならIgnore Smooth Groupsをoffにする。

bump mapを使うmodelでは、元Normalとの組み合わせを変えて問題が出ていないかも確認します。

## non-uniform scaleの注意

21.1 Manualでは、Normal / Tangentの計算はReplace Normals 3D Node自身の座標系ではなく、**各geometryのlocal coordinates**で行われると説明されています。

そのため、Replace Normals 3Dより前でgeometryへnon-uniform scaleをかけている場合、Normal計算に問題が出ることがあります。

```text
Geometry → non-uniform scale → Replace Normals 3D
```

このような構成でshadingが不自然な場合は、scaleとNormal再計算の順序を確認します。

## Replace Normals 3Dを使う判断

次のような場合に使います。

- vertex変形後のlightingがgeometryの形と合わない
- import meshのNormalが欠けている、またはsmooth shadingを作り直したい
- Smooth GroupよりSmoothing Angleを優先してsurfaceのsmooth / facetedを調整したい
- Renderer 3Dが自動生成する前にTangentを明示的に作りたい
- duplicate position vertexがNormal計算を分断している疑いがある

単にgeometryのvertexを結合したい場合はWeld 3D、Position自体を変形したい場合はCustom Vertex 3DやDisplace 3Dなど、目的に合うNodeを使います。Replace Normals 3Dは**geometryの形そのものではなく、そのsurface方向のdataを整える**Nodeです。

## 関連

- [Classic 3D Family Overview](./index.md)
- [Classic 3D scene](../../learn/02-data/classic-3d.md)
- [Custom Vertex 3D](./custom-vertex-3d.md): vertex属性を式で変更します。
- [Displace 3D](./displace-3d.md): Imageを使ってvertex Positionを変位させます。
- [Weld 3D](./weld-3d.md): geometryのPosition vertex自体をweldします。
- [Renderer 3D](./renderer-3d.md): Classic 3D sceneを2D Imageへ変換します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 88「3D Nodes」のReplace Normals 3D [3RpN]（pp.1981–1983）を基準にしています。

確認した項目は、SceneInput、per-vertex Normal / Tangent、Pre-Weld Position Vertices、Recompute、Smoothing Angle、Ignore Smooth Groups、Flip / Tangentに関する注意、texture coordinate要件、bump mapとの関係、local coordinatesとnon-uniform scaleの注意です。

runtime REGID、現在のEffects Library表示、edition差、RendererごとのTangent生成差、exact default / rangeは実機確認していないため、verification: partialを維持しています。
