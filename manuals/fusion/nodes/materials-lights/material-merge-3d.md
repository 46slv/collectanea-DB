---
title: "Material Merge 3D"
description: "2つのMaterialや2D Image由来の材質を混ぜ、1つのMaterialとして3D Objectへ渡すNode。"
doc_type: node
term_id: "material-merge-3d"
term_short: "Material Merge 3Dは、BackgroundとForegroundの材質をBlendで混ぜ、1つの3D Materialを作るNode。"
verification: partial
aliases: ["Material Merge 3D", "3MM"]
concepts: ["classic-3d"]
nodes: ["Material Merge 3D"]
node_family: "materials-lights"
controls: ["Blend", "Material ID"]
inputs: ["material", "image"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-16"
---

# Material Merge 3D

Material Merge 3D [3MM]は、**2つの材質を混ぜ、1つのMaterialとして出力する**Nodeです。色や光沢を決めるBlinn、凹凸を表現するBumpMapなど、別々に作ったMaterialを組み合わせて3D Objectの表面に使います。

Materialは3D Objectの表面をどのように描画するかを決める情報です。Object・Camera・Lightをまとめる[Merge 3D](../3d/merge-3d.md)とも、2D画像のpixelを重ねるMergeとも異なり、Material Merge 3D自体は**3D sceneを作りません**。

<!-- capture:S207 -->

## 実機例：2つの材質を切り替える

赤と青の `Blinn` を `Material Merge 3D` のBackgroundとForegroundに接続し、球に割り当てました。

この例ではBlend 0で赤いBackground、Blend 1で青いForegroundが見えます。[接続と設定の記録](/img/fusion/captures/S207/readback.json)に条件を記載しています。

[![2つのBlinnをMaterial Merge 3Dに接続して球を描画する構成](/img/fusion/captures/S207/graph.png)](/img/fusion/captures/S207/graph.png)

2つの材質をまとめて球へ渡します。

[![Material Merge 3DのBlend 1の設定](/img/fusion/captures/S207/controls.png)](/img/fusion/captures/S207/controls.png)

Blend 1の状態です。

[![Blend 0で描画した赤い球](/img/fusion/captures/S207/low.png)](/img/fusion/captures/S207/low.png)

Blend 0ではBackgroundが見えます。

[![Blend 1で描画した青い球](/img/fusion/captures/S207/high.png)](/img/fusion/captures/S207/high.png)

Blend 1ではForegroundが見えます。

[再現用Graph](/img/fusion/captures/S207/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S207/capture.json)

<!-- /capture:S207 -->

## 入力

### Background Material（オレンジ）

混合の基礎になるMaterialを接続します。3D Materialだけでなく2D Imageも受け取れます。たとえばBlinnを入れれば、その色や光沢の表現が混合の基礎になります。

### Foreground Material（緑）

Background側へ混ぜるもう1つのMaterialを接続します。3D Materialまたは2D Imageを受け取れます。2D Imageを入力した場合は、基本シェーディングモデルの**diffuse texture map（表面色を決める画像）**として扱われます。

**2入力とも接続が必要です。** 画像用のDissolveのように、片方の入力だけで使うことはできません。

## 出力と接続

出力は混合後の**単一の3D Material**です。入力に2D Imageを使っても、出力は2D Imageや3D sceneにはなりません。

出力をShape 3Dなどの3D ObjectのMaterial inputへ渡します。Shape 3DをMerge 3DでCamera・Lightとまとめ、Renderer 3Dで描画すると結果を確認できます。公式Manualが示す「3D sceneやgeometryのmaterial input」は、Merge 3DのScene inputとは別の接続先です。

```text
Blinn ──────(Background)─┐
                         ├─ Material Merge 3D → Shape 3D [Material] ─┐
BumpMap ────(Foreground)─┘                                             ├─ Merge 3D → Renderer 3D → 2D Image
Camera 3D ─────────────────────────────────────────────────────────────┤
Light（必要に応じて）───────────────────────────────────────────────────┘
```

これは接続関係を示す構成例です。BumpMapには必要に応じて凹凸用の画像を前段から渡します。

## MaterialとSceneの合成は別の操作

Material Merge 3DのBlendは、**材質・テクスチャの寄与率**を調整します。完成映像の2つの画像を半透明に重ねたり、別々の3D Objectを同じ空間へ集めたりするものではありません。

| 入力・目的 | 扱い |
| --- | --- |
| Blinn・Cook Torrance・Wardなど | 3D Material同士を混ぜて、1つのMaterialにする |
| 2D Image | Material入力へ接続できる。特にForegroundに接続した画像は、基本シェーディングモデルのDiffuse（表面色）テクスチャとして扱われる |
| Object・Camera・Lightを3D sceneへまとめる | [Merge 3D](../3d/merge-3d.md)を使う |

たとえばBlinnとCook Torranceを2入力へ接続し、Blendを動かして質感の差を比較できます。一方、Redだけ加算してAlphaを維持するような**チャンネル別の演算**はBlendでは指定できません。その場合は[Channel Boolean（3D Material）](./channel-boolean-material.md)を使います。2D Imageの画素同士を混ぜたい場合は2DのMergeやDissolveを使います。

## Inspectorの主な設定

### Blend

BackgroundとForegroundをどの割合で混ぜるかを指定するスライダーです。2D Image用のDissolveに似ていますが、ここで混ぜるのは**材質**であり、完成映像のpixelではありません。

たとえばBackgroundに色や光沢の基礎となるBlinn、Foregroundに別の質感のMaterialを接続し、Blendを調整して1つのObjectに使う表面の見え方を決めます。

### Material ID

合成したMaterialへ数値IDを割り当てます。Renderer 3Dで対応する補助チャンネルの出力を有効にすると、IDを**MatID auxiliary channel**へ出力できます。

Material Merge 3DでIDを設定しただけで、最終画像にMatIDが自動的に出るわけではありません。Renderer 3D側の出力設定も必要です。

Settings tabには他の3D Nodeと共通の設定がありますが、本記事では個別の挙動や既定値を推測しません。

## 主な用途・運用例

### Blinnの基礎材質に凹凸表現を組み合わせる

BlinnをBackgroundに、BumpMapをForegroundに接続します。BumpMapは、表面に細かな凹凸があるような見え方を作るMaterial系Nodeです。

1. BlinnとBumpMapをMaterial Merge 3Dの2つの入力へ接続する。
2. Material Merge 3Dの出力をShape 3DのMaterial inputに接続する。
3. Shape 3DをRenderer 3Dで描画し、Blendを変更して表面の違いを確認する。

この構成では、完成した2D画像へ凹凸画像を重ねているのではありません。**3D Objectを描画する前に、表面の材質を組み立てています。** ManualでもBlinnなどのシェーダとテクスチャ系Materialを組み合わせる構成が示されています。

### 2D Imageを材質へ組み込む

Foreground Materialへ2D Imageをつなぐと、その画像は基本シェーディングモデルのDiffuse texture map（表面色の画像）として扱われます。Backgroundに別のMaterialをつなぎ、Blendで寄与率を調整します。これはObjectを描画する前の材質構成であり、描画済みの映像を重ねる処理とは異なります。

これは画像を板状の3D Objectとして配置するImage Plane 3Dとは違います。Material Merge 3Dは**Objectへ割り当てる材質を作る**Nodeです。

### 材質ごとのIDをレンダリングへ残す

混合後のMaterialへMaterial IDを設定し、Renderer 3D側でMatID出力を有効にします。後段で材質に対応する領域を区別するための補助情報として利用できます。

## 似たNodeとの違い

- **[Channel Boolean（3D Material）](./channel-boolean-material.md)** — RGBAごとに値を選択・加減算できる。Material Merge 3DのBlendは材質全体を混合する。

- **[Replace Material 3D](../3d/replace-material-3d.md)** — 既存scene内のObjectに割り当てられたMaterialを別のMaterialへ差し替える。2つのMaterialそのものを混ぜる役割ではありません。
- **[Merge 3D](../3d/merge-3d.md)** — Object・Camera・Lightを3D sceneへまとめる。Materialの出力をMerge 3DのScene inputへ直接つなぐ構成とは異なります。
- **[Renderer 3D](../3d/renderer-3d.md)** — 3D sceneを2D Imageとして描画する。MatID補助チャンネルの出力もここで有効にします。

Material Merge 3Dの出力はMaterialです。Objectや対応するscene Nodeの**Material input**へ渡します。Merge 3Dの**Scene input**へ直接つなぐものではありません。

## 結果が分かりにくいとき

- **片方の入力が空** — Background・Foregroundの両方が必要です。Dissolveと違い、片方だけでは使えません。
- **2D Imageを入れても画面全体へ表示されない** — 2D映像として合成しているのではなく、材質へ画像を渡しています。Imageを表示したいのか、物体の表面色に使いたいのかを確認します。
- **Blendを変更しても差が小さい** — 比較用に2つのMaterialへ異なる色・光沢を設定し、ObjectからCamera・Light・Renderer 3Dまでの経路を確認します。
- **MatIDが出力されない** — Material IDだけでなく、Renderer 3D側のMatID補助チャンネル出力を有効にします。

## 関連する考え方・Node

- [Classic 3D scene](../../learn/02-data/classic-3d.md) — Geometry、Material、Renderer 3Dの関係。
- [3D Material / Lightノード一覧](./index.md) — 材質を作るNodeとLightを作るNodeの選び方。
- [Blinn](./blinn.md) / [BumpMap](./bumpmap.md) — 入力するMaterialの例。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 90「3D Material Nodes」、**Material Merge 3D [3MM]（pp.2059–2060）**に基づき、2つの入力、各入力が受け取る型、両入力必須、Material出力、Blend、Material ID、MatID出力条件、およびMaterial inputとScene inputの区別を確認しました。

上の実機例ではruntime REGID `MtlMerge3D`と、2つのBlinnを使ったBlend 0・1のレンダリングを確認しました。Blendの初期値・数値範囲、Edition差、画像入力や中間値は未確認のため、`verification: partial`を維持します。
