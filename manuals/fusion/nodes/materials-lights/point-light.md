---
title: "Point Light"
description: "1点から全方向へ照らすClassic 3Dライト。接続、距離減衰、影の調整、Renderer 3Dでの確認方法を説明。"
doc_type: node
term_id: "point-light"
term_short: "Point Lightは、Classic 3D空間の1点から全方向へ光を出すライト。位置、距離減衰、影を調整できる。"
verification: partial
aliases: ["Point Light", "3PL"]
concepts: ["classic-3d", "lighting"]
nodes: ["Point Light"]
node_family: materials-lights
controls: ["Enabled", "Color", "Intensity", "Decay Type", "Enable Shadows", "Shadow Color", "Density", "Shadow Map Size", "Shadow Map Proxy", "Multiplicative Bias", "Additive Bias", "Force All Materials Non-Transmissive", "Shadow Map Sampling", "Softness", "Constant Softness", "Softness Falloff", "Min Softness", "Max Softness", "Transform"]
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["shade-3d", "light-3d", "point-light", "shadow"]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-15"
---

# Point Light

**Point Light [3PL]は、電球のように3D空間の1点から全方向へ光を出す<Term id="classic-3d">Classic 3D</Term>用のライト**です。光源から物体までの距離で明るさを変えたり、物体が光を遮る場所に影を作ったりできます。

光が広がる方向は360°なので、**Rotationを変えても照射方向は変わりません**。光源のPositionと物体との距離を調整します。光を特定の方向や範囲に絞りたい場合は[Spot Light](./spot-light)を選びます。

<!-- capture:S199 -->

## 実機例：光源の位置を変える

`Shape 3D` の球と `Point Light` を `Merge 3D` でまとめ、照明を有効にした `Renderer 3D` で画像化しました。

ライトのZ位置を2に固定し、X位置を−0.75から0.75へ変えると、球の明るい位置が左から右へ移動します。距離減衰は無効です。[接続と設定の記録](/img/fusion/captures/S199/readback.json)に条件を記載しています。

[![球とPoint LightをMerge 3Dでまとめレンダリングする構成](/img/fusion/captures/S199/graph.png)](/img/fusion/captures/S199/graph.png)

球とライトを同じシーンへ接続します。

[![Point Lightの色と強度と距離減衰を示すInspector](/img/fusion/captures/S199/controls.png)](/img/fusion/captures/S199/controls.png)

白いライトで距離減衰を無効にしています。

[![ライトのX位置がマイナス0.75の球](/img/fusion/captures/S199/left.png)](/img/fusion/captures/S199/left.png)

X位置−0.75では左側が明るくなります。

[![ライトのX位置が0.75の球](/img/fusion/captures/S199/right.png)](/img/fusion/captures/S199/right.png)

X位置0.75では右側が明るくなります。

[再現用Graph](/img/fusion/captures/S199/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S199/capture.json)

<!-- /capture:S199 -->

## 入力・出力と基本接続

| 接続 | 種類 | 役割 |
| --- | --- | --- |
| **SceneInput（オレンジ・任意）** | Classic 3Dシーン／3Dジオメトリ | 上流の3D要素を受け取る。入力したシーンにもPoint LightのTransformが作用する |
| **出力** | Classic 3Dシーン | ライトを含む3DデータをMerge 3Dなどへ渡す |

通常はSceneInputを空けて、物体やカメラと**別の入力でMerge 3Dへ接続**します。ライトのTransformで意図せず物体まで動かすのを避けられます。

```text
Shape 3D（物体） ────┐
Point Light ─────────┼→ Merge 3D → Renderer 3D → 2D画像
Camera 3D ───────────┘
```

Point Light単体をViewerに表示しても完成画像は出ません。[Merge 3D](../3d/merge-3d.md)でシーンをまとめ、[Renderer 3D](../3d/renderer-3d.md)で画像に変換します。3D ViewerではMerge 3Dのシーンを表示してライト位置を確認します。

## 明るさと距離を決める

| Inspector項目 | 役割 |
| --- | --- |
| **Enabled** | ライトを有効／無効にする。ON/OFFで寄与を比較できる |
| **Color** | 光の色を指定する |
| **Intensity** | 光の強さ。21.1 Manualでは0.2を20%の光として説明 |
| **Transform → Position** | 光源の位置。物体との距離や影の向きが変わる |
| **Decay Type** | 距離に応じて明るさがどの程度下がるかを指定する |

### Decay Type

**距離減衰**は、同じライトに照らされた近くの物体と遠くの物体の明るさの差です。次の3方式を選びます。

| 方式 | 挙動 | 判断の目安 |
| --- | --- | --- |
| **No Decay** | 距離が変わっても同じ強さ。Manual記載の既定値 | 奥行きによる明るさの差を付けたくない |
| **Linear** | 距離とともに線形に減衰 | 近くと遠くの明るさを段階的に変える |
| **Quadratic** | 距離に対してさらに強く減衰 | 電球のそばを明るく、遠くを暗くしたい |

例えば机上のランプを表現するなら、Quadraticにして近くの小物と遠くの壁の差を確認します。見え方はシーンのスケールにも依存するため、方式を選んだ後でPositionとIntensityを調整します。No DecayのままIntensityだけを下げても、距離による明暗差は生まれません。

## Shadows：影を出すための設定

**Enable Shadows**はPoint Light側の影のON/OFFです。Manualでは既定でONですが、**Renderer 3DのEnable Lighting／Enable Shadows**と、3D ViewerのLighting／Shadows表示も確認してください。

21.1 Manualのp.2037には、**3D ViewerでPoint Lightの影を見るにはRenderer 3DのRendering TypeをHardware Rendererにする必要がある**と記されています。これはViewerで影を確認する際の注意であり、最終描画をすべてHardwareに限定する説明ではありません。Software／OpenGLの機能差については[Renderer 3D](../3d/renderer-3d.md)を参照してください。

| Inspector項目 | 影への作用 |
| --- | --- |
| **Shadow Color** | 影の色。Manualでの既定値は黒（0, 0, 0） |
| **Density** | 影の不透明度。1.0で不透明、値を下げると透ける |
| **Shadow Map Size** | 光が遮られる場所を記録する内部画像の解像度。上げると細部を表せるが、メモリと処理負荷が増える |
| **Shadow Map Proxy** | Proxy／Auto Proxy時の影マップ解像度の割合。0.5ならShadow Map Sizeの半分 |
| **Shadow Map Sampling** | 影マップを参照する品質 |
| **Multiplicative Bias / Additive Bias** | 表面が自分自身を誤って遮蔽する、影が浮くなどの深度判定を補正する |

**Biasが小さすぎる**と自己影の斑点や縞が出ることがあり、**大きすぎる**と影が物体の接地点から離れて見えます。Manualは**Multiplicative Biasを先に変更し、Additive Biasで微調整する**順序を勧めています。

### Softness：輪郭の柔らかさ

Softnessは影マップを読み取るときのフィルタ処理です。21.1 Manualでは、フィルタを使わない硬い輪郭に加え、次の方法を説明しています。

- **Constant**：影の輪郭を一定幅でぼかす。**Constant Softness**で幅を調整する。
- **Variable**：影を落とす物体と影を受ける面の距離によって、ぼかしを変える。**Softness Falloff**で変化の速さ、**Min Softness / Max Softness**で上下限を調整する。

例えば小物が床に接している部分の影は鋭く、床から離れた部分の影は柔らかく見せたい場合はVariableを試します。フィルタ処理を強めるほど一般に描画負荷が増えます。Manualのフィルタなしの説明はNOTEに配置されているため、**そのUI選択肢の正確な表示名までは断定しません**。

### Force All Materials Non-Transmissive

通常のShadow MapはRGBAZ情報を使います。この設定をONにすると、材質を光を通さないものとして扱い、**Z-onlyのShadow Map**を使います。Manualでは処理を速くでき、メモリを約5分の1に抑えられる可能性を説明しています。

代わりに、**色ガラスを透過した光で着色された影**のような表現はできなくなります。透過影が必要なら使わず、単純な不透明物体の影で速度を優先したい場合に検討します。

## 制作例：机の上のランプ

1. [Shape 3D](../3d/shape-3d.md)で机と小物を置き、[Camera 3D](../3d/camera-3d.md)を追加してMerge 3Dへ接続します。
2. Point Lightを同じMerge 3Dへ別入力としてつなぎ、Positionを机の上、照らしたい小物の近くに置きます。
3. Colorを暖色にし、Intensityを調整します。Decay TypeをNo DecayとQuadraticで切り替えて、近くの小物と遠くの壁の明るさを比較します。
4. ライトとRenderer 3DのShadowsを有効にし、影の細部が不足するときだけShadow Map Sizeを上げます。
5. 影が浮く場合はBias、輪郭を柔らかくしたい場合はSoftnessを調整します。ライトのEnabledを切り替え、寄与を確認します。

Point Lightは**光を計算するための3D要素**なので、画面に発光する電球の形を出すには別の3Dジオメトリとマテリアルが必要です。これはManualの仕様に基づく説明用の手順で、21.1実機での完成画像を検証したものではありません。

## 関連ライトと注意点

| ライト | 光の特徴 | 使い分け |
| --- | --- | --- |
| **Point Light** | 1点から全方向 | 電球、局所照明、距離減衰 |
| [Ambient Light](./ambient-light) | 方向を持たない。自身では影を作らない | シーンの基礎的な明るさ |
| [Directional Light](./directional-light) | 一方向の平行光 | 太陽のような照明 |
| [Spot Light](./spot-light) | 方向と円錐状の照射範囲を持つ | 舞台・スポット照明 |
| [DomeLight](./dome-light) | SDR／HDR画像に基づく環境光 | 周囲の画像から照らす |

Point LightはClassic 3D用です。USDの`uSphere Light`と同じデータを出力するわけではなく、Classic 3DのMerge 3DへUSDライトを直接接続するものではありません。

## 表示がおかしいとき

| 症状 | 確認箇所 |
| --- | --- |
| ライト単体で画像が見えない | Merge 3Dに物体とカメラを含め、Renderer 3Dへ接続 |
| 光が当たらない | Enabled、Intensity、Renderer 3DのEnable Lighting、材質と位置 |
| 距離を変えても差が出ない | No Decayになっていないか、Positionとシーンの大きさ |
| 回転しても光の向きが変わらない | Point Lightは全方向照射。方向を絞るならSpot Light |
| 影が出ない | Enable Shadows、Renderer 3D側の影設定、3D ViewerでのHardware Renderer条件 |
| 影が粗い／浮く／斑点が出る | Shadow Map Size、Sampling、Softness、Bias |
| ライトを動かすと物体も動く | 任意のSceneInputにシーンを接続していないか |

## 出典・確認範囲

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』**（September 2026）、Chapter 89「3D Light Nodes」、**Point Light [3PL]（pp.2035–2038）**。入力、照射方向、距離減衰、InspectorとShadow Map、3D Viewerの影表示条件を照合しました。公式資料：[Blackmagic Design Support](https://www.blackmagicdesign.com/support)。

実機例ではREGID `LightPoint` と2つの位置での出力を確認しました。細かな値域、Renderer別の最終画像、Edition差は未検証です。そのため`verification: partial`を維持します。
