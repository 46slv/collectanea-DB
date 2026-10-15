---
title: "Directional Light"
description: "Classic 3Dで太陽光のような平行光を作るDirectional Lightの接続、照射方向、Shadow Map、影の調整と制作例。"
doc_type: node
term_id: "directional-light"
term_short: "Directional Lightは、3Dシーン全体を一定方向から照らす平行光。光源の位置ではなく回転で照射方向を決める。"
verification: partial
aliases: ["Directional Light", "3DL"]
concepts: ["classic-3d", "lighting"]
nodes: ["Directional Light"]
node_family: materials-lights
controls: ["Enabled", "Color", "Intensity", "Enable Shadows", "Shadow Color", "Density", "Shadow Map Size", "Shadow Map Proxy", "Multiplicative Bias", "Additive Bias", "Force All Materials Non-Transmissive", "Shadow Map Sampling", "Softness", "Constant Softness", "Softness Falloff", "Min Softness", "Max Softness", "Translation", "Rotation", "Rotation Order", "Use Target", "Pivot", "Scale"]
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["shade-3d", "light-3d", "sun-light", "shadow"]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-15"
---

# Directional Light

**Directional Light [3DL]は、太陽光のように、シーンのどの位置にも同じ方向から光が届く<Term id="classic-3d">Classic 3D</Term>用ライト**です。光の線が互いに平行な照明として計算されるため、遠くの物体も近くの物体も同じ方向から照らせます。

例えば商品CGを斜め上から照らし、床に一方向へ伸びる影を作る場合に使います。光源の距離を近づけて明るくしたり、遠ざけて暗くしたりするライトではありません。**Directional Lightでは位置を移動しても照明の方向や強さは変わらず、Rotationで方向を変えます。**

Directional Lightは光線そのものを空中へ描く効果ではなく、3D物体の表面に当たる照明を計算するための要素です。単体ノードをViewerへ表示しても完成画像にはなりません。

## 入力・出力と基本接続

| 接続 | データ | 何が起きるか |
| --- | --- | --- |
| **SceneInput（オレンジ、任意）** | Classic 3Dシーンまたはジオメトリ | 接続した上流の3D要素を受け取り、ライトと一緒に下流へ渡す |
| **出力** | Classic 3Dシーン | ライトを含む3DシーンをMerge 3Dなどへ渡す |

SceneInputは必須ではありません。通常は物体とライトを別々の入力から[Merge 3D](../3d/merge-3d.md)につなぎます。

```text
Shape 3D（商品・床） ───┐
Directional Light ─────┼→ Merge 3D → Renderer 3D → 2D画像
Camera 3D ─────────────┘
```

[Shape 3D](../3d/shape-3d.md)などで物体を用意し、Camera 3Dで撮影方向を決め、[Renderer 3D](../3d/renderer-3d.md)で3Dシーンを2D画像へ変換します。Merge 3Dを3D Viewerに表示すれば、ライトの操作ハンドルと物体の位置関係を確認できます。

**SceneInputへ物体を直接つなぐと、その物体を含むシーン全体にDirectional LightのTransformが適用されます。** ライトだけを回転させたいのに商品まで回る場合は、SceneInputを外して別々にMerge 3Dへ接続してください。

照明を受ける物体をグループごとに分けたい場合は、Merge 3Dの構造やPass Through Lightsの設定も関係します。光の種類を変える前に、どのMerge 3Dへ物体とライトをまとめているか確認します。

## 光が当たる方向・明るさを決める

| Inspector項目 | 役割 |
| --- | --- |
| **Enabled** | ライトの照明計算への寄与をON/OFFする |
| **Color** | 光の色を設定する |
| **Intensity** | 光の強さを設定する |
| **Transform → Rotation（X / Y / Z）** | シーンのどの方向から光が届くかを変更する |
| **Transform → Rotation Order** | 複数軸の回転を適用する順序を指定する |
| **Transform → Use Target** | 指定したターゲット位置を向くようにライトを回転させる |
| **Transform → Translation（X / Y / Z）** | 画面上のライトの操作位置などを移動する。ただしDirectional Lightの照明効果は位置で変化しない |

Intensityは、21.1 Manualでは「0.2は20%の光」と説明されています。単独で当てた光の見え方は材質や他のライト、レンダリング設定にも左右されるため、必ずRenderer 3Dの結果を見て調整します。

### RotationとTranslationの違い

Directional Lightには画面上の操作ハンドルがありますが、これは光源の実際の距離を表しません。太陽光を近くの電球のように移動させるのではなく、**地面に影が落ちる方向と物体の明るい面が変わるように回転させる**と理解すると操作しやすくなります。

Transformの**Use Target**をONにすると、指定した3D座標を向くように回転を決められます。ただし照明が一点に集中するSpot Lightへ変わるわけではありません。ターゲットは向きを決める補助であり、光は引き続き平行光です。

TransformにはPivotやScaleなどの共通項目もありますが、照明方向の調整ではまずRotationを使います。共通TransformはManual Chapter 89 pp.2043–2044を参照してください。

### 距離による減衰はある？

Directional Lightは平行光をシーンに当てる方式です。同章の[Point Light](./point-light.md)や[Spot Light](./spot-light.md)にあるような**光源からの距離に応じた明るさの変化を作る用途には向きません**。

手前の物体だけを強く照らしたい場合はPoint Lightを、床の特定範囲を照らしたい場合はSpot Lightを検討します。Directional LightのTranslationを変更しても、これらのライトの距離・照射範囲調整の代わりにはなりません。

## Shadows：影の表示と品質

ライトの**Enable Shadows**をONにすると、物体が光を遮ることで、床やほかの物体に影を落とせます。21.1 Manualでは初期状態がONと記載されています。ライト側で有効でも、ViewerやRenderer側で影の表示・計算が無効なら見えません。

### 基本のShadow Map設定

Shadow Mapは、どこが物体によって光を遮られるかを記録して影を計算するための内部画像です。解像度が足りないと細い形状や輪郭を正確に表しにくくなります。

| Inspector項目 | 意味・調整の目安 |
| --- | --- |
| **Enable Shadows** | 影を作るかを切り替える。Manual記載の既定値はON |
| **Shadow Color** | 影の色。Manual記載の既定値は黒（0, 0, 0） |
| **Density** | 影の不透明さ。1.0で完全に不透明、小さくすると透ける |
| **Shadow Map Size** | 影を記録する画像の解像度。高いほど細部の表現に有利だがメモリ・描画負荷が増える |
| **Shadow Map Proxy** | Proxy／Auto Proxy使用時の影マップ解像度。0.5なら通常設定の半分 |
| **Shadow Map Sampling** | 影マップをサンプリングするときの品質 |
| **Multiplicative Bias / Additive Bias** | 影の奥行き判定を補正し、自己影の斑点や影の浮きを抑える |

**Shadow Map SizeとSoftnessは別の調整です。** Map Sizeは影に記録できる細部、Softnessは影の輪郭をどの程度ぼかして見せるかに関係します。輪郭が階段状ならMap SizeやSampling、形は正しいが縁が硬いならSoftnessを優先して確認します。

### Bias：影が浮く・物体に斑点が出る場合

影マップの深度と物体表面の深度が近すぎると、影が自分自身に誤って付くことがあります。これが斑点や縞として見える場合はBiasを少し調整します。

- **小さすぎるBias**：自己影の縞や斑点が出やすい。
- **大きすぎるBias**：床と物体の接地点から影が離れて浮いて見えやすい。

21.1 Manualは**Multiplicative Biasを先に調整し、Additive Biasで微調整**する順番を示しています。影が薄いからといってDensityだけを上げる前に、深度判定が正常か確認してください。

### Softness：硬い影と柔らかい影

Directional Lightでは、Shadow Mapを参照するときのフィルタで影の縁を柔らかくできます。

| 方式 | 見え方 | 関連する設定 |
| --- | --- | --- |
| **フィルタなし** | 輪郭が硬い。Manualによれば影マップの1ピクセルだけを参照するため比較的高速 | 現行UI上の正確な選択肢名は未確認 |
| **Constant** | 影の輪郭を一定幅で柔らかくする | Constant Softness |
| **Variable** | 影を落とす物体と影を受ける面の距離が増すほど、影の輪郭を柔らかくできる | Softness Falloff、Min Softness、Max Softness |

Variableは、例えば床に接した箱の底辺の影を比較的鋭くし、床から離れた突起の影をより柔らかくしたいときに向きます。**Softness Falloff**は距離に応じたぼけ幅の増え方、**Min Softness / Max Softness**はその下限と上限を設定します。

Constant Softnessを大きくすると影は柔らかくなりますが、Manualは描画時間も増えると説明しています。実際の結果を見ながら必要な量に留めます。

### 色付き・透過した影と速度

**Force All Materials Non-Transmissive**は、影の計算で透過材質を扱わない設定です。

通常のRGBAZ Shadow MapをZ-only方式に変えることで、Manualは描画を速くし、メモリ使用を約5分の1へ減らせると説明しています。ただしこの設定をONにすると、色ガラスを通った光のような**色付きの透過影は表現できません**。

不透明な箱や床だけなら速度優先の選択肢になります。半透明な素材が影へ色を付ける演出をする場合はOFFで検討します。速度・メモリの具体的な改善率は実機測定値ではなくManualの説明です。

## 3D ViewerとRenderer 3Dで影が見えないとき

- **3D Viewer**：Lighting／Shadowsの表示を有効にして確認します。
- **Renderer 3D**：Enable Lighting／Enable Shadowsが有効か確認します。
- **Directional Light特有の注意**：21.1 Manual p.2031には、**3D Viewerで影を見るにはRenderer 3DのRendering TypeをHardware Rendererにする必要がある**と記載されています。

最後の条件はあくまでManualが**3D Viewerの影表示**について明記したものです。「最終レンダリングも必ずHardware Rendererでなければ影を出せない」と読み替えないでください。Rendererの種類・設定ごとの差は21.1実機で未検証です。

ライトだけをViewerへ表示しても画像にはなりません。Merge 3Dで物体・カメラ・ライトが同じシーンに入っているかを確認した後、Renderer 3Dの2D出力でも照明と影を確認します。

## 制作例：商品CGへ斜めの日差しを当てる

1. [Shape 3D](../3d/shape-3d.md)などで商品と床を作り、両方をMerge 3Dへ接続します。商品を少し床から浮かせると、影の変化を比較しやすくなります。
2. [Camera 3D](../3d/camera-3d.md)を同じMerge 3Dへ接続し、Renderer 3Dから商品と床が写る構図にします。
3. Directional Lightを**独立した入力**からMerge 3Dへ接続します。SceneInputには商品を接続しません。
4. Directional LightのEnabledを確認してから、**Rotation**を少しずつ動かします。商品の明るい面と床に伸びる影の向きが連動して変化することを見ます。
5. Colorを少し暖色寄りにし、Intensityを調整します。Translationを動かしても照明が強くならないことを確認し、必要ならIntensityで明るさを合わせます。
6. Enable ShadowsをONにし、Renderer 3DのLighting／Shadowsを確認します。影の輪郭が粗ければShadow Map SizeやSampling、影が浮けばBiasを調整します。
7. 影の縁を一定幅で柔らかくするならConstant、床からの距離に応じて柔らかくしたいならVariableを選びます。完成画像を見て比較します。

これは21.1 Manualの仕様から組んだ**説明用の手順**です。実機で特定の設定値・出力画像を検証した完成レシピではありません。

## 他のライトとの使い分け

| ライト | 光の届き方 | 用途 |
| --- | --- | --- |
| **Directional Light** | シーン全体へ同じ方向から平行光を当てる | 太陽光に近い照明、一方向の影 |
| [Ambient Light](./ambient-light.md) | 光源の向きがなく、影を作らない基礎照明 | 暗部全体の補助 |
| [Point Light](./point-light.md) | 1点から全方向へ照らす | 電球、局所的な光 |
| [Spot Light](./spot-light.md) | 位置・向き・円錐状の範囲を持つ | 舞台照明、被写体だけを照らす |
| [DomeLight](./dome-light.md) | SDR／HDR画像を使ってシーンを包む環境照明 | 環境光や反射の表現 |

ここまでのライトはClassic 3D用です。USDの`u* Light`はシーンのデータ形式が異なるため、そのままClassic 3DのMerge 3Dへ接続するものではありません。

## うまくいかない場合

| 症状 | 最初に確認すること |
| --- | --- |
| ライトだけをViewerで見ても真っ黒／何もない | Merge 3Dからシーンを表示し、Renderer 3Dで2D画像を確認する |
| 物体が明るくならない | Enabled、Intensity、Rotation、Renderer 3DのEnable Lighting、物体の材質 |
| Translationを動かしても光の当たり方が変わらない | 正常なDirectional Lightの仕様。方向はRotationで調整 |
| ライトを回すと物体まで回る | SceneInputへ物体がつながっていないか |
| 影が出ない | ライト／Renderer 3DのShadows、Viewer表示、Hardware RendererのManual記載条件 |
| 影が粗い・階段状になる | Shadow Map SizeとSamplingを確認 |
| 影に斑点や縞が出る、影が床から浮く | Multiplicative Bias、次にAdditive Biasを調整 |
| 影が硬い | SoftnessのConstant／Variableと各関連項目を確認 |
| 透過材質の色が影に出ない | Force All Materials Non-TransmissiveがONではないか |

## 出典・確認範囲

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（2026年9月）、Chapter 89「3D Light Nodes」、**Directional Light [3DL]（pp.2030–2033）**、共通Transform（pp.2043–2044）、Chapter 84「3D Compositing Basics」（p.1842）を参照しました。公式資料：[Blackmagic Design Support](https://www.blackmagicdesign.com/support)。

ManualのDirectional Light節でShadowsの説明中に「spotlight」という表現が使われていますが、同じ節にDirectional Lightの影設定が明記されています。この用語の混在を「Directional Lightに影がない」という意味には解釈しません。

実機でのREGID、正確なUI値域、Renderer別の完成画像、Edition差は未検証のため、`verification: partial`を維持しています。
