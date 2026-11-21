---
title: uCylinder Light
description: 細長い円筒形のUSDライトを作るuCylinder Lightの入出力、Length・Radius・Treat As Line、配置と具体例をResolve 21.1基準で解説する。
doc_type: node
term_id: ucylinder-light
verification: partial
aliases: [uCylinder Light, uCL]
concepts: [usd-scene, lighting]
nodes: [uCylinder Light]
node_family: usd
controls: [Override Selection, Color, Intensity, Exposure, Color Temperature, Diffuse Response, Specular Response, Normalize, Treat As Line, Length, Radius, Transform]
inputs: [usd]
outputs: [usd]
tasks: [usd, lighting, area-light]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-15"
---

# uCylinder Light

**uCylinder Lightは、長さと太さを持つ円筒形の光源をUSDシーンに追加するノード**です。蛍光灯や細長いチューブ照明のように、一点ではなく線に沿って広がる光源を想定するときに使います。光源の長さを**Length**、太さを**Radius**で調整でき、**Treat As Line**でより単純な線状光源として扱うこともできます。

<Term id="usd-scene">USDシーン</Term>は、3Dの物体・カメラ・ライト・材質などを保持するデータです。uCylinder Lightが出力するのも、ライト情報を含んだUSDシーンです。完成した2D画像を直接生成するわけではありません。カメラと照らす物体を[uMerge](./u-merge)でまとめ、[uRenderer](./u-renderer)で描画して結果を確認します。

このノードが作るのは**照明**です。蛍光管やネオン管そのものの姿までカメラに映したい場合は、発光する外観を持つ3Dモデルを別に用意し、照明設定とは分けて調整します。

## 入力・出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Scene Input（黄色）** | USDシーン | 読み込んだシーンの既存ライトを選び、設定を変更する際に使用する |
| **出力** | USDシーン | 円筒形ライトの情報を含むシーンを後段へ渡す |

21.1 Reference Manualで確認できる入力は**黄色のScene Inputが1つ**です。背景画像やマスクを差し込むための入力ではありません。新しいライトを追加するだけなら、Scene Inputを使わずuCylinder LightをuMergeへ接続する構成から始められます。既存USDファイルのライトを調整する場合は、シーンをScene Inputへ接続し、Inspectorで対象を選びます。

## 最小構成

~~~text
uShape（照らす物体） ───────┐
uCamera（撮影するカメラ） ─┼→ uMerge → uRenderer → 2D画像
uCylinder Light（照明） ───┘
~~~

1. [uShape](./ushape)で照らす立体、[uCamera](./ucamera)でカメラを作ります。
2. uCylinder Lightを配置し、3つのUSD出力をuMergeへ接続します。
3. uRendererの結果をViewerへ表示し、ライトの**Transform**で位置と向きを決めます。
4. **Length**で照明の長さ、**Radius**で太さを調整します。
5. **Intensity / Exposure**を調整して明るさを決め、必要なら**Treat As Line**のON/OFFを比較します。

物体の材質やほかのライトが結果に影響します。新しいライトの効果を確かめるときは、最初に構成を簡単にし、一つの値ずつ変更すると違いを判断しやすくなります。

## 光源の形を決める（Length / Radius / Treat As Line）

**Length**は円筒形ライトの長さを決めます。細長い天井照明を表現するなら、まずLengthで光源の広がりを調整します。

**Radius**は名称だけを見ると「半径」を意味しますが、**21.1 Reference ManualのuCylinder Light節では「光源の直径を定義する」と説明されています**。この記事ではManualの説明をそのまま採用し、画面上の数値がワールド単位の半径にどう変換されるかは断定しません。円筒を太くしたい場合はこの値を調整し、Viewerで結果を確認します。

**Treat As Line**を有効にすると、円筒形の広がりを持つ光源ではなく、より単純な**線状光源**として扱います。Lengthを伸ばすこととTreat As Lineを有効にすることは別の操作です。前者は長さの設定、後者は光源モデルの切り替えです。

| 操作 | 変えるもの | 確認すること |
| --- | --- | --- |
| Lengthを変える | 光源の長さ | 被写体に対して照明がどの範囲に広がるか |
| Radiusを変える | Manualが「直径」と説明する値 | 円筒形光源の太さの違い |
| Treat As Lineを切り替える | 円筒形と単純な線状光源の扱い | 同じ配置・明るさ設定で描画結果がどう変わるか |

光源の形を変更しても、影や反射が必ず一定の割合で変化するとは限りません。Rendererの設定、材質、距離、Normalizeなどにも依存するため、具体的な差は使用するシーンで比較します。

## 色と明るさ（Controls）

| Inspectorの項目 | 何を設定するか |
| --- | --- |
| **Override Selection / Pick** | Scene InputにあるUSDファイルから、調整する既存ライトを選ぶ |
| **Color** | ライトの色 |
| **Intensity** | ライトの強さ |
| **Exposure** | シーンに対する露光の寄与 |
| **Color Temperature / Enable** | 色温度による設定を有効にする。Manual記載の既定値は**6500 K** |
| **Diffuse Response** | 材質の拡散反射への照明の寄与 |
| **Specular Response** | 材質の鏡面反射への照明の寄与 |
| **Normalize** | ライトの寄与を正規化する |
| **Treat As Line** | 単純な線状光源として扱う |
| **Length / Radius** | 光源の長さと太さを指定する |

**Intensity**と**Exposure**はどちらも明るさに関係します。ManualはIntensityの例として「0.2は20％」と説明していますが、実際のワット数やルーメンへ換算する関係式は示していません。最初は片方を固定し、もう片方だけを動かして比較します。

**Normalize**は光の寄与を正規化する項目です。Manualは内部計算式や、Length・Radiusとの厳密な依存関係までは説明していません。光源サイズの違いを比較するときはNormalizeの状態をそろえてください。

<!-- capture:S337 -->

## 実機例：ライトの位置を変える

`uShape`のCapsuleと`uCylinder Light`を`uMerge`でまとめ、uRendererのLightingをSceneに設定しました。ライトのX位置を0から2へ変えると、Capsule上の明暗が変わりました。比較画像はそれぞれ0フレームと1フレームで撮影し、位置はSDKで読み戻しています。LengthやRadius、Treat As Lineの効果、影の比較や物理照度の測定は行っていません。市松模様はViewerの透明表示です。[接続と設定の記録](/img/fusion/captures/S337/readback.json)に条件を記載しています。

[![uShapeとuCylinder LightをuMergeへ接続する構成](/img/fusion/captures/S337/graph.png)](/img/fusion/captures/S337/graph.png)

形状と円柱状ライトを同じUSD sceneにまとめています。

[![Intensity 10を設定したuCylinder Light](/img/fusion/captures/S337/controls.png)](/img/fusion/captures/S337/controls.png)

Intensity 10の設定です。

[![ライトをX 2に移動した描画](/img/fusion/captures/S337/moved-result.png)](/img/fusion/captures/S337/moved-result.png)

ライトX 2、1フレームの表示です。

[![ライトX 0での描画](/img/fusion/captures/S337/original-result.png)](/img/fusion/captures/S337/original-result.png)

ライトX 0、0フレームの表示です。

[再現用Graph](/img/fusion/captures/S337/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S337/capture.json)

<!-- /capture:S337 -->

## 位置と方向（Transform）

uCylinder LightにはFusionのUSD系ノードと共通の**Transform**タブがあります。シーン内のどこに細長い光源を置き、どちらへ向けるかを決めます。Manualは、画面上の操作ハンドルを**TranslationとRotation**で動かし、光源を配置することを説明しています。

- **Translation**はライトの位置を調整します。例えば天井付近や被写体の斜め上へ移動します。
- **Rotation**は光源の向きを変えます。ライトを横長に設置したいのか、縦長に置きたいのかを、Viewerのハンドルと描画結果で確認します。
- **Rotation Order**はX・Y・Z軸の回転を適用する順番です。同じ角度でも順序により最終的な向きが変わることがあります。
- **Pivot**は回転の中心です。光源を特定の端や支点のまわりで動かしたいときに調整します。
- **Scale**は3D空間内での拡大・縮小です。光源そのもののLength / Radiusの設定と混同せず、まず専用項目でサイズを決めると違いを追いやすくなります。

これらはUSD共通Controlsの説明に基づくものです。**光源のローカル軸と照射の厳密な内部計算、LengthとScaleの合成順序**は21.1実機で未確認です。

## 読み込んだUSDライトを調整する

既存のUSDファイルにすでにライトが入っている場合は、ノードを新規作成用ではなく**ライトの調整用**に使えます。

1. [uLoader](./uloader)でUSDファイルを読み込み、uCylinder Lightの**Scene Input**につなぎます。
2. Inspectorの**Override Selection / Pick**から、接続したシーン内の対象ライトを選びます。
3. Color・Intensity・Lengthなど、変更したい項目を調整します。
4. 後段のuRendererで結果を確かめます。

選択できるライトの種類や、異なるUSD Light型の属性がどこまで編集可能かは、このManual節だけでは確認できません。対象を選べない場合は、まずScene Inputの接続とScene Treeでの選択対象を調べます。

## 制作例1：天井に細長い照明を置く

1. uShapeで室内を想定した立体を置き、uCameraとuCylinder LightをuMergeでまとめます。
2. uCylinder Lightを被写体の斜め上へ移動します。
3. **Length**を伸ばして横長の照明にし、**Rotation**で設置方向をそろえます。
4. **Radius**を調整し、細い管として扱う場合と太めの光源として扱う場合を比較します。
5. 色温度のEnableを有効にして白色照明の色を調整し、Intensityで明るさを決めます。
6. Treat As LineのON/OFFを比べ、被写体の見え方に応じて選びます。

この照明の**発光面そのものを映像に表示したい**なら、照明のほかに管の形状・材質も作成します。uCylinder Light単体で蛍光管の3Dモデルが完成するわけではありません。

## 制作例2：同じ位置で光源モデルだけを比較する

1. 同じuShape・uCamera・uRendererの構成を用意します。
2. uCylinder LightのTransform・Length・Radius・Intensity・Exposureを固定します。
3. **Treat As LineをOFF**にした画像を確認します。
4. **Treat As LineをON**にして、光源モデルだけを変更します。
5. 比較しにくい場合は別のライトの影響を減らし、Normalizeの状態もそろえます。

この手順で、線状として扱うことによる違いを観察できます。ただし、結果を「必ず影が硬くなる」「必ず明るくなる」などの一般則として解釈しないでください。

## 関連するUSDライト

| ノード | 光源の考え方 | 向いている場面 |
| --- | --- | --- |
| **uCylinder Light** | 長さと太さを持つ円筒形の光源 | 蛍光灯、細長いチューブ照明 |
| [uSphere Light](./usphere-light) | 大きさを持つ球状光源。Treat as Pointで点光源として扱える | 小さなランプ、球状の光源 |
| [uDisk Light](./udisk-light) | 平たい円盤状の光源 | 円形のソフトライト |
| [uRectangle Light](./urectangle-light) | 幅と高さを持つ平面状の光源 | 窓からの光、長方形のソフトボックス |
| [uDistant Light](./udistant-light) | 遠方からほぼ同じ方向に届く光源 | 太陽に相当する照明 |
| [uDome Light](./udome-light) | 周囲からの環境光 | 屋外や環境画像に基づく照明 |

同じ「細長い」光でも、円筒形の光源と長方形の面光源は別のモデルです。立体的な管を想定するならuCylinder Light、窓やソフトボックスの発光面を想定するならuRectangle Lightから試すと整理しやすくなります。

## 期待した光にならないとき

| 症状 | 確認すること |
| --- | --- |
| 画像が出ない | uCylinder Lightの出力はUSD。uMerge・カメラ・uRendererへの接続を確認する |
| 光を置いたのに物体が暗い | Transformの位置、Intensity / Exposure、ほかのUSD要素との合流を確認する |
| Lengthを変更しても分からない | 物体との距離、カメラ位置、Treat As Line、Rendererを切り分ける |
| Radiusの値が想定と違う | 21.1 ManualはRadiusを「直径」と説明している。数値からの寸法換算を断定しない |
| Treat As Lineの差が見えない | Length・Radius・Normalize・Intensityを固定し、条件をそろえる |
| 回転方向が合わない | Rotation OrderとViewerのハンドルを確認する |
| Color Temperatureが効かない | Enableが有効か確認する |
| ハイライトが弱い | Specular Responseと材質の鏡面反射設定を確認する |
| 読み込んだライトが編集できない | Scene Inputの接続とOverride Selection / Pickの対象を確認する |
| Classic 3Dのノードと接続できない | USDはuMerge / uRenderer、Classic 3DはMerge 3D / Renderer 3Dを使う |

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 121「USD Nodes」、**pp.2930–2931（uCylinder Light）、pp.2945–2946（USD共通Transform）**。公式配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

確認した項目は黄色のScene Input、Override Selection / Pick、Color、Intensity、Exposure、Color Temperature、Diffuse / Specular Response、Normalize、Treat As Line、Length、Radius、Transformです。制作例と比較手順は、これらの機能から組み立てています。

**出力端子の画面上の厳密な名称、半径と直径の数値換算、Treat As Line時のRadiusの内部扱い、Normalizeの計算式、TransformとLengthの合成、Renderer・Edition差は21.1実機で未確認**です。未確認事項を断定しないため`verification: partial`を維持します。
