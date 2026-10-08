---
title: "CreateReliefMap"
description: "2Dの高さ画像から、ReliefMapが3D材質の凹凸と自己遮蔽を計算するためのRGBA画像を生成するNode。"
doc_type: node
term_id: "createreliefmap"
term_short: "CreateReliefMapは、高さ画像をReliefMap用のRGBAデータへ変換する2D Filter Node。生成結果をReliefMapへ渡して3D材質に使う。"
verification: partial
aliases: ["CreateReliefMap", "CRM"]
concepts: ["image-data", "classic-3d"]
nodes: ["CreateReliefMap"]
node_family: "materials-lights"
controls: ["Map Type", "Depth Source", "Depth Scale", "Texture Depth", "Pre Blur", "Flip Depth"]
inputs: ["image"]
outputs: ["image"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# CreateReliefMap

CreateReliefMap [CRM]は、**画素の明暗などで高さを表した2D画像から、[ReliefMap](./reliefmap.md)が読み取れるRGBA画像を作るFilter Node**です。文字や図形、傷の模様を3Dオブジェクトの表面に刻まれたように見せるために使います。

このNodeだけで3Dの形状や材質が完成するわけではありません。CreateReliefMapが**凹凸を表す画像を準備**し、後段のReliefMapがその情報を材質へ適用します。Fusionの<Term id="classic-3d">Classic 3D</Term>では、2D Image、3D Material、3D sceneを区別して接続します。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **黄色の入力** | 2D Image | 高さの元になる画像を受け取る。たとえば文字・図形を描いた画像や、明暗に変化のあるテクスチャ。 |
| **出力** | 2D RGBA Image | ReliefMap用に変換した画像を出す。[ReliefMap](./reliefmap.md)の白い**ReliefMap Input**へ接続する。 |

生成画像は完成した表面色ではなく、ReliefMapの計算に使うデータです。公式Manualでは、ReliefMapが受け取る画像の**RGBに法線の値、Alphaに高さ・深さ**が入ると説明しています。RGBは表面が向く方向、Alphaは奥行きの情報を担います。

CreateReliefMapの出力は**2D Image**です。Merge 3Dへ直接渡したり、Blinnの代わりにShape 3DのMaterialへつないだりしません。

## 最小構成：2D図形を表面の凹凸にする

公式Manualには、Shape系Nodeで作った矢印を**sRenderで2D画像に変換し、CreateReliefMapへ入力**する作例があります。3D側ではBlinnとReliefMapを組み合わせます。

```text
2D図形 → sRender ──────→ CreateReliefMap ──→ ReliefMap［白：ReliefMap Input］
Blinn［3D Material］──────────────────────→ ReliefMap［黄：Background Input］
                                              │ 3D Material
                                              ↓
                                        Shape 3D［Material］ ─┐
Camera 3D ────────────────────────────────────────────────────┼→ Merge 3D → Renderer 3D → Image
Point Light ──────────────────────────────────────────────────┘
```

1. [sRender](../shapes/s-render.md)で図形を2D Imageにして、CreateReliefMapへつなぎます。はじめは明暗の境界が分かりやすい図形を使います。
2. CreateReliefMapの出力をReliefMapの**白い入力**へ接続します。
3. Blinnなどの材質をReliefMapの**黄色いBackground Input**へ接続します。
4. ReliefMapのMaterial出力を[Shape 3D](../3d/shape-3d.md)のMaterial入力へ接続します。
5. Shape 3D、Camera 3D、LightをMerge 3Dへまとめ、[Renderer 3D](../3d/renderer-3d.md)で描画します。ライトやカメラを動かして、奥行き感と影の変化を確認します。

CreateReliefMapを単独でViewerへ表示すると、元の図形とは色の異なるRGBA画像が見えます。その画像自体を最終画面へ出すのではなく、**ReliefMapが凹凸を計算するための情報**として使います。

## Inspectorの主な設定

### Map Type

変換方式を**Relief / Relaxed Cone / Cone**から選びます。3方式ともRGBとAlphaを使ったRelief Mapを生成します。Manualでは、Relaxed ConeとConeの方が精度が高くなる場合がある一方、計算負荷が増えると説明されています。

まずReliefで形と深さを確認し、必要に応じて他の方式を比較すると、負荷の増加に見合うか判断しやすくなります。

### Depth Source

高さの元に使う情報を選択するドロップダウンです。**選択肢の全名称は公式Manualの当該箇所だけでは確認できないため、ここでは固定しません**。入力画像で高さを記録したチャンネルを確認して設定します。

### Depth Scale

生成するRelief Mapの**高さ・深さの変化量**を調整します。値を大きくすると凹凸が強調されます。

後段のReliefMapにもDepth Scaleがあります。CreateReliefMapは**凹凸データを生成する段階**、ReliefMapは**材質に適用する段階**なので、どちらを操作しているか区別します。

### Texture Depth

生成するRelief Mapの**画像のビット深度**を合わせたり変更したりします。「彫りの深さ」を変えるDepth Scaleとは別の設定です。滑らかな高さの変化が階調不足で段にならないかも確認します。

### Pre Blur

Relief Mapを生成する**前に入力画像をぼかす**設定です。明暗の境界が急な図形や細い傷を滑らかにできます。強くすると細部が失われるため、後段で見える凹凸を確認して調整します。

### Flip Depth

高さ・深さの解釈を**反転**します。模様の凸凹の向きを変えて比較するときに使います。公式Manualにも同じ図形での切り替え例があります。

## 具体的な運用例

### ロゴや文字を表面に刻む

Text+で白い文字を暗い背景に描き、CreateReliefMapへ入力します。ReliefMapとBlinnを組み合わせ、金属板や壁のMaterialに適用します。**Flip Depth**で盛り上がりと彫り込みの向きを比較し、**Pre Blur**で縁の硬さを調整します。

ただし、文字の輪郭をMeshとして押し出す処理ではありません。実際の立体形状が必要なら[Text 3D](../3d/text-3d.md)などを検討してください。

### 石や塗装面の不規則な凹凸

[Fast Noise](../generators/fast-noise.md)の明暗画像をCreateReliefMapへ入力します。NoiseのScaleやContrastで凹凸の大きさと変化を作り、Depth Scaleで深さを調整します。後段のReliefMapで照明に対する影の変化を確認します。

元画像の生成と凹凸への変換を分けておけば、模様の形と見かけの深さを個別に調整できます。

## Bump Mapとの違い

[Bump Map](./bumpmap.md)は、主に表面の**法線を変えて光の当たり方を変える**仕組みです。Meshの頂点や物体の輪郭を変形しません。

CreateReliefMapとReliefMapの組み合わせは、**高さに基づく奥行き感に加え、凹凸同士が光や見え方を遮る自己遮蔽**を扱えます。細かい傷の反射を変えたいならBump Map、彫り込まれた模様の奥行きと遮蔽まで見せたいならReliefMapが候補です。

見かけの凹凸を、Meshの頂点が実際に移動した結果と同一視しないでください。Geometryを変える用途は[Displace 3D](../3d/displace-3d.md)などと比較します。

## 関連Nodeと確認事項

- [ReliefMap](./reliefmap.md)：2Dの凹凸情報とBlinnなどのMaterialを受け取り、3D材質へ適用する。
- [Blinn](./blinn.md)：ReliefMapの黄色い入力へ接続する基礎Materialの例。
- [Bump Map](./bumpmap.md)：法線による陰影と、ReliefMapの奥行き・遮蔽表現の使い分け。
- [sRender](../shapes/s-render.md)：Shape系の図形をCreateReliefMap用の2D Imageへ変換する。
- [Classic 3Dの仕組み](../../learn/02-data/classic-3d.md)：2D Image、Material、sceneの違い。
- [3D Material / Lightノード一覧](./index.md)：関連Material・Lightを探す。

凹凸が見えない場合は、CreateReliefMapの出力先が**ReliefMapの白い入力**か、黄色い入力へBlinnなどのMaterialを与えているか、Renderer 3Dで照明が有効かを確認します。

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 99「Filter Nodes」、**CreateReliefMap [CRM]（pp.2330–2332）**。2D入力、作例、Map Type、Depth Source、Depth Scale、Texture Depth、Pre Blur、Flip Depthを確認。
- 同Manual、Chapter 91「3D Texture Nodes」、**ReliefMap [3RM]（pp.2098–2099）**。Materialと2D Mapの入力、Blinn・Shape 3Dへの接続、RGB/Alphaの意味、自己遮蔽を確認。
- CreateReliefMap / ReliefMapはResolve 21で導入されたNodeとして公式21系資料に記載されています。本文は21.1 Manualの記述を優先しています。

`verification: partial`は、runtime REGID、Inspectorの初期値と数値範囲、Edition差、実機の描画と性能を未確認としているためです。
