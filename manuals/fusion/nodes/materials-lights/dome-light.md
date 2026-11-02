---
title: "DomeLight"
description: "HDR・SDR画像を3Dシーンの周囲へ配置して環境光を作るClassic 3DのDomeLight。DomeTexture入力、接続、明るさ、制作例を解説。"
doc_type: node
term_id: "dome-light"
term_short: "DomeLightは、HDR・SDR画像を3Dシーンの周囲へ配置し、画像に基づいた環境照明を作るClassic 3Dライト。"
verification: partial
aliases: ["DomeLight", "Dome Light", "3Do"]
concepts: ["classic-3d", "lighting", "image-data"]
nodes: ["DomeLight"]
node_family: materials-lights
controls: ["Color", "Intensity", "Transform"]
inputs: ["classic-3d", "image"]
outputs: ["classic-3d"]
tasks: ["shade-3d", "environment-light", "hdr-light"]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-15"
---

# DomeLight

**DomeLight [3Do]は、HDRまたはSDRの画像を3Dシーンの周囲へ球状に配置し、画像をもとに環境光を作る<Term id="classic-3d">Classic 3D</Term>用のライト**です。例えば、窓が明るく、反対側が暗い室内の環境画像を使うと、単色のライトとは異なる周囲の明るさを照明の手掛かりにできます。

ここでいう「環境光」は、**シーンの周囲にある環境を画像で表し、その画像を照明に使うこと**です。HDR画像とは、一般的なSDR画像より広い明るさの情報を保存できる画像を指します。ただしHDR画像をつなげば必ず現実の照明と一致するわけではありません。素材の投影方式、明るさの値、マテリアル、Renderer 3Dの設定によって見え方は変わります。

DomeLightの出力は**照明を含む3Dシーン**であり、完成した2D画像ではありません。周囲の画像を背景として画面に表示する操作とも区別します。

<!-- capture:S216 -->

## 実機例：単色画像で照明する

単色の `Background` を `DomeLight` のDomeTextureへ接続し、`OpenPBR` の球とまとめてレンダリングしました。

この例ではIntensity 0で暗い球が、Intensity 2で明るくなります。入力は合成した単色SDR画像で、HDR素材の例ではありません。[接続と設定の記録](/img/fusion/captures/S216/readback.json)に条件を記載しています。

[![単色BackgroundをDomeLightへ接続し球を照らす構成](/img/fusion/captures/S216/graph.png)](/img/fusion/captures/S216/graph.png)

2D画像をDomeTextureへ渡します。

[![DomeLightのIntensity 2の設定](/img/fusion/captures/S216/controls.png)](/img/fusion/captures/S216/controls.png)

Intensity 2の状態です。

[![Intensity 0で描画した暗い球](/img/fusion/captures/S216/low.png)](/img/fusion/captures/S216/low.png)

Intensity 0の状態です。

[![Intensity 2で照らされた球](/img/fusion/captures/S216/high.png)](/img/fusion/captures/S216/high.png)

Intensity 2では球が明るくなります。

[再現用Graph](/img/fusion/captures/S216/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S216/capture.json)

<!-- /capture:S216 -->

## 入力と出力

| 接続 | 受け取るもの | 役割 |
| --- | --- | --- |
| **SceneInput（オレンジ、任意）** | Classic 3Dのシーンやジオメトリ | 上流の3D要素を受け取る。接続したシーンにもDomeLightのTransformが適用される |
| **DomeTexture（白）** | 2D画像 | 環境照明に使うHDRまたはSDR画像を受け取る |
| **出力** | Classic 3Dシーン | ライトを含むシーンをMerge 3Dなどへ渡す |

2つの入力は別の役割を持ちます。**HDR画像はSceneInputではなくDomeTextureへ接続**します。SceneInputへ3Dの物体やカメラをつないだ場合、Transformを操作すると上流の要素も一緒に変形されます。通常はSceneInputを空け、ライト・物体・カメラを別々に[Merge 3D](../3d/merge-3d.md)へ接続すると扱いやすくなります。

```text
Loaderなど（HDR / SDR画像） ──→ DomeTexture入力
                                     ↓
                                DomeLight ─────┐
Shape 3D（照らす物体） ──────────────────────────┼→ Merge 3D → Renderer 3D → 2D画像
Camera 3D ─────────────────────────────────────┘
```

画像を読み込むLoaderなどは**2D画像を供給するノード**で、DomeLight自体がHDRファイルを選択するためのファイルブラウザーだと考えないでください。この接続では、[Renderer 3D](../3d/renderer-3d.md)がClassic 3Dシーンを2D画像へ変換します。

## 画像を使った照明の考え方

一方向から平行光を当てる[Directional Light](./directional-light.md)や、1点から全方向へ照らす[Point Light](./point-light.md)と違い、DomeLightは**周囲のさまざまな方向に分布する明るさを画像で与えます**。単色の[Ambient Light](./ambient-light.md)とも異なり、どの方向が明るいかを画像に持たせられる点が特徴です。

例えばスタジオを撮影した環境画像には、明るいソフトボックスや暗い壁が写っていることがあります。DomeLightではその画像を環境として使います。ただし、**画像内の白い長方形が必ず同じ形の反射ハイライトになる**、あるいは**画像がそのまま背景に描画される**とまでは、21.1 ManualのDomeLight節からは保証できません。表示結果は材質・Renderer・画像の投影方法に依存します。

HDRとSDRのどちらも入力できますが、画像を用意するときは撮影・書き出し時の投影方式や明るさの扱いを確認してください。DomeLightの同節には、対応する全天球画像の厳密な投影形式やピクセル配置、色空間変換の規則までは記載されていません。**横長の写真なら何でも正しい360度環境画像になる、とは考えない**ことが重要です。

## Inspectorで調整する項目

21.1 Reference ManualのDomeLight節で個別に説明されているControlsは、**Color**と**Intensity**です。TransformはClassic 3Dライトと共通のタブを使用します。

| 項目 | 何が変わるか | 調整の目安 |
| --- | --- | --- |
| **Color** | ライト全体に与える色 | 環境画像の色に対して、全体の色味を調整したいとき |
| **Intensity** | ライト全体の強さ | 照明が明るすぎる・暗すぎるとき |
| **Transform → Rotation** | 3D空間でのライトの向き | 環境画像の明るい方向と物体の位置関係を確認するとき |

ManualはIntensityの説明として**0.2を20%の光**と記載しています。これはDomeLightの操作説明上の割合で、現実の照度（lux）や光源の出力（lumen）と直接対応する値としては扱いません。

Transformタブには、3Dノードに共通する**Translation、Rotation、Rotation Order、Pivot、Scale、Use Target**などの説明があります。照明の方向を調整したいときはまずRotationを検討します。ただし、各Transform値がDomeLightの画像投影と最終照明へどのように影響するかは、**この節に個別の計算規則が示されていないため、実際の画像で比較して判断**します。

### 画像の向きを合わせるとき

明るい窓が画像の左にあるのに、レンダリングでは想定外の方向から照らされているように見える場合、最初に入力画像の向きと投影方式を確認します。次にDomeLightを回転させ、同じカメラと材質のまま照明結果を比較します。

画像のファイル形式、投影形式、色管理、回転を一度に変更すると原因が分からなくなります。**一度に変える条件を一つに絞る**と、画像の解釈と照明の向きを区別できます。

## 制作例：商品モデルを室内の環境光で照らす

1. [Shape 3D](../3d/shape-3d.md)などで商品を作り、[Camera 3D](../3d/camera-3d.md)とともにMerge 3Dへ接続します。マテリアルを付け、カメラから物体が見える状態にします。
2. 室内を記録したHDRまたはSDRの環境画像をLoaderなどで読み込み、**その2D画像出力をDomeLightのDomeTextureへ接続**します。
3. DomeLightの**3D出力**を物体やカメラと同じMerge 3Dへ別入力として接続します。続いてMerge 3DをRenderer 3Dへつなぎます。
4. Renderer 3Dの**Enable Lighting**を確認し、まずDomeLightのIntensityを変えて、ライトが物体へ寄与しているか比較します。
5. 必要ならColorとTransformを調整します。画像内の明るい領域の方向に注目し、ライトの向きが意図と合うかレンダリング結果で判断します。
6. 最終的に背景画像も見せたい場合は、**照明として使う画像**と**カメラに映る背景**を別の要件として扱い、適切な背景表示・合成の構成を用意します。

これはManualに記載された入出力とControlsを組み合わせた**説明用の制作手順**です。DaVinci Resolve 21.1実機で特定のHDR素材をレンダリングして、反射や色管理まで確認した完成レシピではありません。

## ほかのライトとの違い

| ライト | 光の作り方 | 適した場面 |
| --- | --- | --- |
| **DomeLight** | 周囲を囲む画像に基づく環境照明 | 室内・屋外の環境画像に合わせる |
| [Ambient Light](./ambient-light.md) | 方向を持たない一様な照明 | シーン全体の暗部を持ち上げたい |
| [Directional Light](./directional-light.md) | 一定方向からの平行光 | 太陽のような方向性を与える |
| [Point Light](./point-light.md) | 1点から全方向へ照射 | 電球など局所的な光源 |
| [Spot Light](./spot-light.md) | 位置・向き・円錐状の範囲を持つ | 限られた範囲を照らす |
| [uDome Light](../usd/udome-light.md) | USDシーンへ環境画像によるライトを設定する | USDノードで組んだシーン |

**DomeLightはClassic 3D、uDome LightはUSD**です。名前は似ていますが、出力されるシーンの種類と接続先が違います。DomeLightはMerge 3D／Renderer 3Dと組み合わせ、uDome LightはUSD側のuMerge／uRendererなどと組み合わせます。

uDome Lightの記事にはTexture File、Texture Format、Exposure、Guide Radiusなどの項目がありますが、**それをClassic 3DのDomeLightにもあるInspector項目として転記してはいけません**。21.1 ManualのDomeLight節で確認できるControlsを基準にします。

## うまく照らされないとき

| 症状 | 確認すること |
| --- | --- |
| DomeLight単体をViewerに置いても完成画像にならない | ライトは3D要素。物体・カメラとMerge 3Dにまとめ、Renderer 3Dで描画する |
| HDR画像をつないでも照明に使われない | **DomeTexture（白）**へ2D画像を接続しているか。SceneInputと取り違えていないか |
| 照明が効いていないように見える | Intensity、Renderer 3DのEnable Lighting、物体のマテリアルを確認 |
| 期待した方向から照らされない | 入力画像の投影方式・向き、DomeLightのTransformを一つずつ確認 |
| HDR画像の明るさや色が想定と違う | 画像素材の値・色空間・レンダリング設定を確認。自動変換を推測で決めつけない |
| 画像が背景に現れない | DomeTextureは環境照明用入力。背景表示は別に構成する |
| USDのノードと接続できない | DomeLightはClassic 3D用。USDではuDome Lightを使う |

## 出典と確認範囲

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 89「3D Light Nodes」pp.2033–2034（DomeLight）、pp.2043–2044（ライト共通Transform）、Chapter 89の各Classic 3D Light節**を参照しました。入力の種類、環境画像による照明、Color・Intensity、Merge 3Dへの組み込みはこの資料に基づきます。

なお、p.2034のDomeLight Inspector節には「uDome light」という表記がありますが、同じページの見出し・入力説明はClassic 3DのDomeLightです。その語だけを根拠にUSDのuDome Lightのパラメータを同一視しません。

**未確認：** 画像の投影形式・色空間ごとの厳密な解釈、使用Rendererによる照明・反射の違い、HDR素材を使った実際の完成画像。上の単色SDR画像を使う実機例ではREGID `LightDome`と照明の変化を確認しました。
