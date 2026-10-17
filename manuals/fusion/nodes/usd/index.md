---
title: USDノード
description: FusionのUSDシーンを読み込む・編集する・2D画像へ描画する手順と、目的別のu*ノードの選び方。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, usd, build-usd-scene, render-usd]
updated: "2026-10-18"
---

# USDノード

USDノードは、3Dモデル、カメラ、ライト、マテリアルなどを**一つの3Dシーンとして扱う**ためのノード群です。外部のUSDファイルを読み込むだけでなく、シーン内の特定の物体を動かしたり、表示するものを選んだり、別の材質へ差し替えたりできます。

USDシーン内の個々の要素を**Prim（プリム）**と呼びます。たとえば車全体、そのドア、道路、カメラなどを階層的に整理できます。**Scene Tree**はその階層を表示する画面です。まずデータの仕組みを知りたい場合は[USD sceneの基礎](../../learn/02-data/usd)を参照してください。

**USDシーンは2D画像ではありません。** 3Dの編集を終えてから[uRenderer](./u-renderer)で描画し、通常のMergeやMediaOutへ送ります。従来のFusionの**Classic 3D**も3D合成用ですが、Merge 3D / Renderer 3DとUSDのuMerge / uRendererでは扱うシーンのデータが異なります。

## 最初に覚える接続

```text
uLoader（USDファイル） ──┐
uCamera（必要なら） ─────┼→ uMerge → uRenderer → 2D画像
uDistant Light（任意） ──┘
```

1. [uLoader](./uloader)でUSDファイル（`.usd`、`.usda`、`.usdc`、`.usdz`）を読み込みます。外部ファイルを使わない場合は[uShape](./ushape)で立体を生成できます。
2. 別に用意したカメラやライトを使うなら、それぞれ[uCamera](./ucamera)や[uDistant Light](./udistant-light)で作ります。[uMerge](./u-merge)は、これらのUSDデータを**同じ3Dシーンへまとめる**役割です。
3. uMergeの出力をuRendererへ接続します。uRendererでカメラを確認し、配置したUSDライトを使う場合は**Lighting: Scene**を選びます。
4. uRendererが出力した**2D画像**を、必要に応じて通常のMergeで実写と合成し、MediaOutへ送ります。

読み込んだUSDにカメラやライトが含まれている場合、必ずしも別ノードで追加する必要はありません。uRendererの**Camera**のDefaultはシーン内で最初に見つかったカメラを使用し、存在しない場合は既定のPerspective視点を使用します。思いどおりの構図にならなければ、どのカメラで描画しているかを確認します。

## 制作例：街並みから看板を消して車を移動する

建物・看板・車が別々のPrimとして保存されている街並みのUSDを使う例です。**看板を隠す操作**と**車の位置を変える操作**を分ければ、他の建物を変更せずにショットを調整できます。

```text
uLoader（街並み）
  ↓
uVisibility（看板Primを非表示）
  ↓
uTransform（車Primを移動） ─┐
uCamera ────────────────────┼→ uMerge → uRenderer ─→ Merge（前景）
uDistant Light ────────────┘                   ↑
MediaIn（実写） ───────────────────────→ Merge（背景）
                                              ↓
                                           MediaOut
```

1. uLoaderへUSDを指定し、[uVisibility](./uvisibility)を接続します。Inspectorの**Pick**を押すとScene Treeが開くので、看板のPrimを選びます。**Selected Prims**で対象を確認し、**Visible**をオフにします。
2. 後段の[uTransform](./utransform)でも**Pick**で車のPrimを選び、**Translation**を変更します。車全体ではなく一部だけが動く場合は、どの階層のPrimを選んだかを確認します。
3. カメラ・ライトを必要に応じてuMergeに加え、uRendererで描画します。実写と重ねる場合は、uRendererの出力を2D Mergeの前景へ、MediaInを背景へ接続します。

この手順は**看板や車が選択可能なPrimとして分かれている**ことが前提です。USD内で一体化していれば、Scene Treeで選ぶだけで部品を分離することはできません。また、uMerge自身のTransformは接続された要素全体に作用します。**車だけ動かすなら、合流前のuTransformで対象を指定する**と範囲を把握しやすくなります。

## 目的からノードを選ぶ

### ファイルや形状を用意する

- [uLoader](./uloader) — USDファイルを読み込み、後段へUSDシーンを渡します。
- [uShape](./ushape) — 立方体、球、平面などの基本形状をUSDシーン内に作ります。
- [uImage Plane](./uimage-plane) — 2D画像をUSD空間の板状オブジェクトとして配置します。
- [uVolume](./uvolume) — VDB形式のボリュームデータをUSDシーンへ取り込みます。
- [uExport](./uexport) — 編集したUSDシーンをファイルとして書き出します。

### 複数の要素をまとめる・候補を切り替える

- [uMerge](./u-merge) — 物体、カメラ、ライトなどの**複数のUSD入力を同時に使う**ためにまとめます。
- [uSwitch](./uswitch) — **別々のUSD入力から一つ**を選びます。複数のモデルファイルA/Bを比較する場合などに使います。
- [uDuplicate](./uduplicate) — 同じUSDオブジェクトを繰り返し配置します。

### シーン内の特定の要素を編集する

これらのノードでは、Inspectorの**Pick**からScene Treeを開き、変更したいPrimを選びます。**Selected Prims**は選択した対象の確認欄です。

| ノード | 変更するもの | 使い分けの例 |
| --- | --- | --- |
| [uTransform](./utransform) | 選択したPrimの位置・回転・大きさ | 建物はそのままで車だけ動かす |
| [uVisibility](./uvisibility) | 選択したPrimの表示・非表示 | 街並みから看板だけを隠す |
| [uVariant](./uvariant) | **同一USD内に定義済み**のバリエーション | 車に保存済みの屋根の仕様を選ぶ |
| [uReplaceMaterial](./ureplacematerial) | 対象Primへ割り当てる材質 | 壁だけ別の材質へ変更する |

**uVariantとuSwitchは似ていても、候補の置き場所が違います。** uVariantはアセット内にあらかじめ用意された**Variant Set**から候補を選びます。Variant SetのないUSDへ新しい形状を自動生成する機能ではありません。一方、uSwitchはノードに接続した別々のUSD入力から一つを選びます。単に物体を隠す場合はuVisibilityで十分です。

### カメラ・照明・投影

- [uCamera](./ucamera) — 3Dシーンをどの位置・画角から見るかを設定します。
- [uDistant Light](./udistant-light) / [uDome Light](./udome-light) — 方向性のある光や環境光を加えます。
- [uCylinder Light](./ucylinder-light) / [uDisk Light](./udisk-light) / [uRectangle Light](./urectangle-light) / [uSphere Light](./usphere-light) — 形状の異なるUSDライトです。
- [uProjector](./uprojector) — 2D画像をUSDの3Dオブジェクトへ投影する場合に使います。
- [uCatcher](./ucatcher) — 投影した画像をマテリアルのテクスチャとして扱う構成で使います。

### 材質を設定する

- [uTexture](./utexture) / [uTextureTransform](./utexturetransform) — テクスチャ画像とその配置を扱います。
- [uNormalMap](./unormalmap) — 表面の細かな凹凸を法線マップとして扱います。
- [uShader](./ushader) — USD用のマテリアルを組み立てます。
- [uMaterialX](./umaterialx) — MaterialX（`.mtlx`）の定義を読み込みます。
- [uReplaceMaterial](./ureplacematerial) — 生成・読み込みした材質を、指定したUSDオブジェクトへ割り当てます。

**MaterialXを読み込むことと、シーン内の物体へ材質を割り当てることは別の段階**です。対象のPrimを限定したいときはuReplaceMaterialのPrim Selectionも確認します。

### 2D画像へ描画する

- [uRenderer](./u-renderer) — USDシーンを2D画像へ変換します。カメラ・照明・出力解像度に加え、AOV（追加のレンダーパス）を設定できます。

uRendererの**Color**は通常のカラー画像です。ほかに、フレームごとに正規化される**Depth**、Primごとの識別値を持つ**PrimID**、32-bit floatの距離データである**Camera Depth**などがあります。**Output AOVs As Layers**を有効にすると、複数のAOVをレイヤーで出力できます。奥行きの白黒画像と実距離の数値を混同しないでください。

## 接続・表示で迷ったら

| 状況 | 確認するところ |
| --- | --- |
| USDノードを通常の2D Mergeへつなげない | その出力はUSDシーンです。[uRenderer](./u-renderer)で2D画像へ変換します。 |
| uRendererで物体が見えない | Scene Inputの接続、Camera、被写体の位置、Lighting設定を順に確認します。 |
| 一部だけ動かすつもりが全体が動く | uMergeのTransformを操作していないか、uTransformのPickで親Primを選んでいないか確認します。 |
| Visibleを切り替えても変化がない | uVisibilityのSelected PrimsとInvert Prim Selectionを確認します。 |
| Variantの候補が出ない | uVariantで正しいPrimを選んだか、USDにVariant Setが定義されているか確認します。 |
| 2つのUSDを同時に使いたい | 一つだけ選ぶuSwitchではなく、uMergeでまとめます。 |

## Classic 3Dとの違い

```text
Classic 3D: Shape 3D → Merge 3D → Renderer 3D → 2D画像
USD:        uShape   → uMerge   → uRenderer   → 2D画像
```

どちらも最終的には2D画像にできますが、途中のシーンデータは互換であると仮定しないでください。Classic 3DのMerge 3D出力をUSDのuMergeへ直接つなぐ構成ではありません。Classic 3Dについては[Classic 3Dの基礎](../../learn/02-data/classic-3d)を参照してください。

## 出典・確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 121「USD Nodes」。**pp.2887–2888**の基本接続とScene Tree、**pp.2902–2906**のuLoader・uMerge、**pp.2911–2913**のuRenderer、**pp.2923–2928**のPrim Selection・uTransform・uVariant・uVisibilityを参照しました。公式資料の配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

接続図と街並みの例は、Manualの仕様に基づいて組み立てた運用例です。**21.1実機での操作結果、エディション差、USDファイルごとの互換性やレンダリング性能は未確認**のため、`verification: partial`を維持しています。
