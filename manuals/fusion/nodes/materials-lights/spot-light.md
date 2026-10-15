---
title: "Spot Light"
description: "Classic 3Dで円錐状の範囲を照らすSpot Lightの接続、Cone Angle、Penumbra、Dropoff、影と制作例。"
doc_type: node
term_id: "spot-light"
term_short: "Spot Lightは、位置と向きを指定して円錐状の範囲を照らすClassic 3Dライト。照射範囲の縁や影を調整できる。"
verification: partial
aliases: ["Spot Light", "Spotlight", "3SL"]
concepts: ["classic-3d", "lighting"]
nodes: ["Spot Light"]
node_family: materials-lights
controls: ["Enabled", "Color", "Intensity", "Decay Type", "Cone Angle", "Penumbra Angle", "Dropoff", "Enable Shadows", "Shadow Color", "Density", "Shadow Map Size", "Shadow Map Proxy", "Multiplicative Bias", "Additive Bias", "Force All Materials Non-Transmissive", "Shadow Map Sampling", "Softness", "Constant Softness", "Softness Falloff", "Min Softness", "Max Softness", "Transform"]
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["shade-3d", "light-3d", "spotlight", "shadow"]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-15"
---

# Spot Light

**Spot Light [3SL]は、3D空間のある位置から特定の方向へ円錐状の光を当てる<Term id="classic-3d">Classic 3D</Term>用のライト**です。舞台照明のように、人物や商品、床の一部を選んで照らすときに使います。

全方向へ光を出す[Point Light](./point-light.md)と違い、**位置・向き・光が広がる角度**をそれぞれ調整できます。円錐の中心部分を明るくし、その外側で徐々に暗くなる境界も作れます。

これは照明計算用の3Dデータです。Spot Light単体をViewerで表示しても完成画像にはならず、ライトの円錐がそのまま空中に可視の光線として描画されるものでもありません。

## 入力・出力と基本接続

| 接続 | 種類 | 動作 |
| --- | --- | --- |
| **SceneInput（オレンジ、任意）** | Classic 3Dシーンまたはジオメトリ | 上流の3D要素を受け取る。接続したシーン全体にこのノードのTransformがかかる |
| **出力** | Classic 3Dシーン | Spot Lightを含む3DシーンをMerge 3Dなどへ渡す |

通常はSceneInputを使わず、物体やカメラとは**独立した入力からMerge 3Dへ接続**します。これならライトだけを動かすつもりで物体まで移動させることを避けられます。

```text
Shape 3D（床・被写体） ─┐
Spot Light ───────────┼→ Merge 3D → Renderer 3D → 2D画像
Camera 3D ────────────┘
```

[Merge 3D](../3d/merge-3d.md)でシーンをまとめ、[Renderer 3D](../3d/renderer-3d.md)でカメラ視点の2D画像に変換します。Merge 3Dの3D Viewerでライトと物体の位置関係を確認できます。別々のMerge 3Dへ照明を分ければ、どの物体へ照明を効かせるかをシーン構造で分離できます。

## 光源の位置・向き・明るさ

| Inspector項目 | 役割 |
| --- | --- |
| **Enabled** | 照明の寄与をON/OFFする |
| **Color** | 光の色を決める |
| **Intensity** | 光の強さ。21.1 Manualは0.2を20%の光として説明 |
| **Transform → Translation** | ライトの位置を変える |
| **Transform → Rotation** | 光を向ける方向を変える |
| **Transform → Use Target** | 指定した3D位置へ向くようライトを回転させる |
| **Decay Type** | 距離によって光が弱まる方式を選ぶ |

Transformの共通設定にはRotation Order、Pivot、Scaleなどもあります。被写体へ光を向ける操作が難しい場合はUse Targetで照らしたい座標を指定し、向きを合わせることができます。

### Decay Type：距離による明るさの変化

距離減衰とは、ライトの近くと遠くで照明の強さに差を付ける仕組みです。

| 方式 | 挙動 | 用途の目安 |
| --- | --- | --- |
| **No Falloff** | 距離による減衰なし。Manual記載の既定値 | 照射範囲の形だけを先に整える |
| **Linear** | 距離に対して線形に減衰する | 近景から遠景へなだらかな明暗差を付ける |
| **Quadratic** | 距離とともにより強く減衰する | ライトに近い物体を際立たせる |

**Decay Typeは距離の設定で、Cone Angleは照射方向と範囲の設定**です。照射範囲が狭くても、No Falloffなら範囲内の遠い物体が自動的に暗くなるわけではありません。まず範囲を決め、その後で距離減衰を調整すると切り分けやすくなります。

## 円錐の中心と縁：Cone Angle・Penumbra Angle・Dropoff

この3項目は同じ「広がり」を別の側面から調整します。

| 項目 | 意味 | 変更したときの見え方 |
| --- | --- | --- |
| **Cone Angle** | 光が最大強度で届く円錐部分の幅 | 大きくすると中心の明るい範囲が広がる |
| **Penumbra Angle** | Cone Angleの**外側**で光が0に向かって弱くなる帯の幅 | 0で境界が硬く、増やすほど縁が広く柔らかくなる |
| **Dropoff** | Penumbra内で強度が下がる速さ | 同じ境界幅でも明暗の変化を調整できる |

例えば暗い床へ丸い光を落としたい場合、**Cone Angleで明るい円の大きさを決める → Penumbra Angleで境界を広げる → Dropoffで境界の明暗変化を調整する**順で確認します。

Cone Angleを「光の一番外側の端」と考えると、Penumbraを増やしたときに予想より光が外側へ広がります。最大強度の範囲と、そこから暗くなる範囲を分けて捉えてください。Penumbra Angleが0の場合は幅のある移行帯がないため、Dropoffだけを変えても柔らかな境界を作れません。

21.1 ManualはCone Angleの最大角度を90度と記載していますが、現行の実機UIでの値域は未確認です。

## Shadows：影を表示・調整する

Spot Lightの**Enable Shadows**をONにすると、物体で遮られた光による影を作れます。Manualの記載では既定値はONです。ライト側だけでなく、Renderer 3Dの**Enable Lighting／Enable Shadows**、3D Viewerの**Lighting／Shadows**表示も確認します。

21.1 ManualのSpot Light節は、3D Viewerで影を確認する場合、Renderer 3DのRendering Typeに**HardwareまたはSoftware Renderer**を使えると説明しています。これはViewerの表示条件についての記述であり、最終画像で利用できる機能の全条件を保証するものではありません。

| Inspector項目 | 意味 |
| --- | --- |
| **Shadow Color** | 影の色。Manualの既定値は黒（0, 0, 0） |
| **Density** | 影の不透明さ。1.0なら不透明、小さくすると透ける |
| **Shadow Map Size** | 影の形を記録する内部画像の解像度。上げるほど細部に有利だが、メモリと描画時間が増える |
| **Shadow Map Proxy** | Proxy／Auto Proxy利用時の影マップ解像度。0.5なら通常の半分 |
| **Shadow Map Sampling** | 影マップを読むときの品質 |
| **Multiplicative Bias / Additive Bias** | 影の深度判定を調整し、自己影の縞や影が浮く症状を補正する |

**Biasが小さすぎる**と、自分自身へ誤って影を落として斑点や縞が出ることがあります。**大きすぎる**と影が接地点から離れて見えます。ManualはMultiplicative Biasを先に、Additive Biasを後に微調整する順序を勧めています。

### Softness：影の輪郭

影マップを参照するときのフィルタで影の輪郭を柔らかくできます。Manualはフィルタを使わない硬い影のほか、次の方法を説明しています。

- **Constant**：影の輪郭を一定幅でぼかす。**Constant Softness**で幅を調整する。
- **Variable**：影を作る物体と影を受ける面の距離に応じてぼかし幅を変える。**Softness Falloff**で変化の速さ、**Min Softness / Max Softness**で最小・最大の幅を決める。

例えば床に接した足の影を比較的鋭く、床から離れた腕の影を柔らかくしたいときはVariableを試します。Shadow Map Sizeは**細部の解像度**、Softnessは**輪郭のぼけ幅**を主に変える設定なので、分けて調整します。フィルタなしのUI選択肢の正確な表示名はManualの該当箇所だけでは確定できません。

### Force All Materials Non-Transmissive

通常の影はRGBAZ Shadow Mapで扱われます。この設定をONにするとZ-only Shadow Mapとなり、色ガラスを透過したような**色付きの透過影が作れなくなります**。Manualは通常方式より高速化でき、メモリを約5分の1に抑えられると説明しています。不透明な物体だけのシーンで速度を優先するときに検討します。

## 制作例：暗い舞台の被写体を照らす

1. [Shape 3D](../3d/shape-3d.md)などで床と被写体を作り、Camera 3DとともにMerge 3Dへ接続します。
2. Spot Lightを別の入力から接続し、高い位置に置きます。RotationまたはUse Targetで被写体へ向けます。
3. Decay TypeをいったんNo Falloffにし、**Cone Angle**で明るい範囲の広さを決めます。
4. **Penumbra Angle**を少しずつ増やし、床に落ちた照明の境界をなじませます。続いて**Dropoff**で縁の変化を調整します。
5. ColorとIntensityを調整します。近くと遠くで明るさを変えたい場合はDecay TypeをLinearまたはQuadraticに切り替え、位置やIntensityを再調整します。
6. Enable Shadowsを確認します。影が粗ければShadow Map SizeとSampling、影が浮く・斑点がある場合はBias、縁が硬い場合はSoftnessを確認します。
7. Renderer 3Dの画像を見て、Enabledを切り替えながらライトの寄与を比べます。

これはManualの仕様に基づく説明用の手順です。21.1実機での完成画像と設定値を検証したものではありません。

## ほかのライトとの違い

| ライト | 照明の特徴 | 選ぶ場面 |
| --- | --- | --- |
| **Spot Light** | 位置と方向を持つ円錐状の光 | スポット照明、商品・人物の局所照明 |
| [Point Light](./point-light.md) | 一点から全方向への光 | 電球・近距離の照明 |
| [Directional Light](./directional-light.md) | 一定方向の平行光 | 太陽光に近い照明 |
| [Ambient Light](./ambient-light.md) | 方向を持たない基礎的な照明 | 暗部の補助 |
| [DomeLight](./dome-light.md) | 環境画像による照明 | HDR／SDR背景由来の光 |

Spot LightはClassic 3Dに属します。USDの`u* Light`とはデータ形式が異なるため、そのままClassic 3DのMerge 3Dに接続するものではありません。

## 表示がおかしい場合

| 症状 | 確認すること |
| --- | --- |
| 単体Viewerが空 | Merge 3DとRenderer 3Dで物体・カメラを合わせて表示 |
| 光が当たらない | Enabled、Intensity、位置・向き、Cone Angle、Renderer 3DのLighting |
| 中心の円は見えるが縁が硬い | Penumbra Angleを増やす |
| Dropoffを変えても縁が変わらない | Penumbra Angleが0ではないか |
| 遠くの物体も明るい | Decay TypeがNo Falloffではないか |
| 影が出ない | ライト／Renderer 3DのShadows、3D Viewerの表示設定 |
| 影が粗い／浮く／斑点が出る | Shadow Map Size・Sampling・Softness・Bias |
| ライトのTransformで物体まで動く | SceneInputに物体のシーンをつないでいないか |

## 出典・確認範囲

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 89「3D Light Nodes」、**Spot Light [3SL]（pp.2039–2042）**および共通Transform（pp.2043–2044）を参照しました。公式資料：[Blackmagic Design Support](https://www.blackmagicdesign.com/support)。

同ManualのSpot Light導入文には「影を落とせる唯一のライト」という表現がありますが、同章のPoint LightもShadows設定を備えています。この記述は**Spot Lightだけが影を落とせるという排他的な仕様の根拠にはしません**。

現行21.1実機のREGID、細かなUI値域、Renderer別の最終結果、Edition差は未検証のため、`verification: partial`を維持します。
