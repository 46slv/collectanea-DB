---
title: uSphere Light
description: 球状のUSDライトを作るuSphere Lightの入出力、Radius、Treat as Point、明るさ、既存ライトの編集と具体例をResolve 21.1基準で解説する。
doc_type: node
term_id: usphere-light
verification: partial
aliases: [uSphere Light, uSL]
concepts: [usd-scene, lighting]
nodes: [uSphere Light]
node_family: usd
controls: [Override Selection, Color, Intensity, Exposure, Color Temperature, Diffuse Response, Specular Response, Normalize, Treat as Point, Radius, Transform]
inputs: [usd]
outputs: [usd]
tasks: [usd, lighting, sphere-light, point-light]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-15"
---

# uSphere Light

**uSphere Lightは、球状の大きさを持つ光源をUSDシーンに追加するノード**です。点から光を出すPoint Lightに似ていますが、球の大きさを**Radius**で設定できる点が異なります。室内の小さなランプや、被写体の近くに置く照明を作るときに使えます。

<Term id="usd-scene">USDシーン</Term>は、3Dの物体・カメラ・ライト・材質などを保持するデータです。uSphere Lightが出すのは照明情報を含む**USDシーン**であり、照明済みの2D画像ではありません。物体とカメラを一緒に[uMerge](./u-merge)でまとめ、[uRenderer](./u-renderer)で描画して初めて画面上の明るさを確認できます。

これは**光源の設定**であって、光る球体の外観を直接作る機能ではありません。電球そのものを映す場合は、電球の形状と材質を持つオブジェクトを別に用意します。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Scene Input（黄色）** | USDシーン | 既存のライトを含むシーンを受け取り、対象ライトの設定を調整する |
| **出力** | USDシーン | 設定した球状ライトを含むシーンを後段に渡す |

21.1 Reference Manualが記載する入力は、黄色の**Scene Inputが1つ**です。画像やマスクを入力する端子ではありません。外部USDのライトを編集する場合に使用し、新しいライトを作るだけなら、この入力を使わずほかのUSD要素とuMergeで合流させられます。

## 最小構成

~~~text
uShape（立体） ──────────┐
uCamera（カメラ） ──────┼→ uMerge → uRenderer → 2D画像
uSphere Light（照明） ──┘
~~~

1. [uShape](./ushape)で照らす立体を、[uCamera](./ucamera)で撮影するカメラを作ります。
2. uSphere Lightを追加し、3つのUSD出力をuMergeへつなぎます。
3. uMergeをuRendererへ接続し、Viewerで結果を確認します。
4. **Transform**でライトの位置を調整し、**Intensity / Exposure**で明るさを決めます。
5. **Radius**と**Treat as Point**を変更して、光源サイズの扱いによる違いを比較します。

同じ数値でも、ライトと物体の距離、物体の材質、Rendererの設定によって見た目は変わります。最初はほかのライトの寄与を抑えると、何を調整しているか判断しやすくなります。

## 球状光源の大きさと点光源への切り替え（Radius / Treat as Point）

**Radius**は、球状ライトのサイズを設定します。Manualにはその説明がありますが、ワールド座標の単位への厳密な換算や、内部でどのように発光面積を扱うかは記載されていません。

**Treat as Point**を有効にすると、Manualの説明ではライトを**単純な従来型の点光源**として扱います。点光源は、広がりを持った球ではなく、一つの点からの光として考えるモデルです。

| 設定 | 比較の目安 |
| --- | --- |
| **Treat as Point：OFF** | Radiusを持つ球状ライトとして扱う |
| **Treat as Point：ON** | 単純なPoint Lightとして扱う |
| **Radius** | 球状ライトのサイズを決める。Pointモードでの内部的な扱いは実機未確認 |

例えば卓上ランプを想定するなら、光源を被写体の近くに置き、ほかの条件を固定してRadiusを段階的に変えます。Treat as PointのON/OFFも同じ構図で比較します。**影の柔らかさやハイライトが必ず一定の法則で変わるとまでは断定できません。** Renderer、材質、距離なども影響するからです。

Radiusを変えることと、実際に表示する3Dの球体を拡大することは別です。前者は照明設定、後者は物体の形状変更です。

## 明るさと色（Controls）

| Inspectorの項目 | 機能 |
| --- | --- |
| **Override Selection / Pick** | Scene Inputに接続されたUSD内の既存ライトを選び、編集対象を決める |
| **Color** | ライトの色 |
| **Intensity** | 光の強さ |
| **Exposure** | シーンへの露光寄与を変更する |
| **Color Temperature / Enable** | 色温度による指定を有効化する。Manual記載の既定値は6500 K |
| **Diffuse Response** | 材質の拡散反射成分への寄与 |
| **Specular Response** | 材質の鏡面反射成分への寄与 |
| **Normalize** | ライトの寄与を正規化する |
| **Treat as Point** | 点光源として扱う |
| **Radius** | 球状光源のサイズ |

**IntensityとExposure**は、どちらも明るさに関係します。ManualはIntensityを光の強さ、Exposureを露光への寄与として説明しますが、相互の計算式までは示していません。まず片方を固定し、もう片方を変更して比較します。現実の電球のワット数やルーメンへ直接換算できるとは限りません。

**Color Temperature**を使うときは**Enable**の状態も確認します。Manualの既定値は6500 Kです。Colorと色温度をどう合成するかについて、該当節だけから内部計算を決めつけないようにします。

**Diffuse Response**は、広がって見える拡散反射への寄与、**Specular Response**は、光沢面などに現れる反射・ハイライトへの寄与を調整します。ライト側の設定を変更しても、照らされる物体の材質によって結果は異なります。

**Normalize**は照明寄与の正規化です。ただしManualは、正規化の式や「Radiusを変えても明るさが必ず一定になる」といった条件まで規定していません。効果を調べる際は、Radius・Intensity・Exposureを固定してON/OFFを比較してください。

<!-- capture:S334 -->

## 実機例：ライトの位置を変える

`uShape`のCapsuleと`uSphere Light`を`uMerge`でまとめ、uRendererのLightingをSceneに設定しました。ライトのX位置を0から2へ変えると、Capsule上の明暗が変わりました。比較画像はそれぞれ0フレームと1フレームで撮影し、位置はSDKで読み戻しています。Radiusによる影の柔らかさ、Treat as Pointの比較や物理照度の測定は行っていません。市松模様はViewerの透明表示です。[接続と設定の記録](/img/fusion/captures/S334/readback.json)に条件を記載しています。

[![uShapeとuSphere LightをuMergeへ接続する構成](/img/fusion/captures/S334/graph.png)](/img/fusion/captures/S334/graph.png)

形状と球状ライトを同じUSD sceneにまとめています。

[![Intensity 10とRadius 0.5を設定したuSphere Light](/img/fusion/captures/S334/controls.png)](/img/fusion/captures/S334/controls.png)

Intensity 10、Radius 0.5の設定です。

[![ライトをX 2に移動した描画](/img/fusion/captures/S334/moved-result.png)](/img/fusion/captures/S334/moved-result.png)

ライトX 2、1フレームの表示です。

[![ライトX 0での描画](/img/fusion/captures/S334/original-result.png)](/img/fusion/captures/S334/original-result.png)

ライトX 0、0フレームの表示です。

[再現用Graph](/img/fusion/captures/S334/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S334/capture.json)

<!-- /capture:S334 -->

## 位置と方向を調整する（Transform）

Transformタブでライトの位置・回転・拡大縮小を調整します。ManualはuSphere Lightに**画面上の操作ハンドル**があり、そのRotationがライトの向く方向を示すと説明しています。球状なので回転が必ず無意味とは扱いません。一方、Rotationが配光計算へ具体的にどう影響するかは実機未検証です。

| 設定 | 意味 |
| --- | --- |
| **Translation** | 3D空間でライトを移動する |
| **Rotation / Rotation Order** | 回転と、X・Y・Z軸を適用する順序 |
| **Pivot** | 回転の中心を調整する |
| **Scale / Lock X/Y/Z** | 一括または軸ごとの拡大縮小 |

これらはUSDノード共通のTransformです。[uTransform](./utransform)にも同系統の操作がありますが、uSphere Lightでは光源自体の位置や向きを扱います。RadiusとScaleの組み合わせで最終的なサイズがどのように計算されるかは、このManual節だけでは確定できません。

## 既存のUSDライトを編集する

外部USDにすでにライトが含まれている場合は、次のように対象を指定します。

1. [uLoader](./uloader)などでライトを含むUSDシーンを読み込みます。
2. その出力をuSphere Lightの黄色の**Scene Input**へ接続します。
3. Inspectorの**Override Selection → Pick**から編集対象のライトを選びます。
4. Color、Intensity、Radiusなどを変え、uRendererで結果を確認します。

**Pickは編集対象を選ぶ操作**です。USDに含まれるすべてのライトを自動的に一括変更する機能でも、元のUSDファイルを直接上書きする操作でもありません。別種類のライトを選んだときの変換や編集可能範囲は実機で確認してください。

## 制作例1：室内のランプの光

**目的：** テーブル上にある小さな光源で、近くの小物を照らす。

1. テーブルと小物のUSDオブジェクト、カメラを用意します。
2. uSphere Lightを想定するランプの位置に置きます。
3. ほかのライトを弱めた状態でIntensityまたはExposureを調整します。
4. Treat as PointをOFFにし、Radiusを段階的に変更します。
5. ColorまたはColor Temperatureで光の色味を決めます。
6. uMergeで物体・カメラ・ライトを統合し、uRendererで確認します。

画面内に電球のガラスやランプシェードも映すなら、それらの3Dモデルは別途必要です。**光を当てることと、光って見える物体を作ることを分ける**と構成を理解しやすくなります。

## 制作例2：点光源と球状ライトの比較

**目的：** 光源が一つの点として扱われる場合と、サイズを持つ場合を同じ条件で比較する。

1. 反射の見える材質の物体を置き、ライトとカメラの位置を固定します。
2. Treat as PointをONにして描画結果を確認します。
3. OFFに戻してRadiusを変え、同じ構図で比較します。
4. Intensity、Exposure、Colorを固定し、必要ならNormalizeのON/OFFも比較します。
5. 明暗、反射、影の見え方を観察し、用途に合う設定を選びます。

これは**各コントロールの違いを切り分けるための手順**で、どのRendererでも同じ影が出ると保証するものではありません。

## 関連するUSDライト

| ノード | 光源の考え方 | 適した用途 |
| --- | --- | --- |
| **uSphere Light** | Radiusを持つ球状光源。点光源への切替も可能 | 小さな近接ライト |
| [uDisk Light](./udisk-light) | 円形の平らな面 | 円盤型ライト |
| [uRectangle Light](./urectangle-light) | WidthとHeightを持つ四角い面 | 窓やソフトボックス |
| [uCylinder Light](./ucylinder-light) | 長さと太さのある円柱状の光源 | 管状のライト |
| [uDistant Light](./udistant-light) | 遠方からの方向光 | 太陽光に相当する照明 |
| [uDome Light](./udome-light) | シーンを囲む環境光 | HDR環境などによる照明 |

uSphere Lightは球状光源を扱いますが、光源の形状が違うノードに同じIntensityを入れても、同じ見た目になるとは限りません。

## 表示・照明のトラブル

| 症状 | 確認すること |
| --- | --- |
| 2D画像が出ない | 出力はUSD。uMerge・カメラ・uRendererまでの接続を確認 |
| 物体が暗い | uMergeへライトが届いているか、位置とIntensity / Exposureを確認 |
| Radiusの効果が分からない | Treat as Point、物体との距離、材質、Rendererを確認 |
| 回転させても結果が変わらない | 操作ハンドルの向きと実際の照明変化を区別して確認 |
| 色温度を変えても変化しない | Color TemperatureのEnableとColorを確認 |
| ハイライトが弱い | Specular Responseと物体側の材質を確認 |
| 明るさの比較が難しい | Normalizeを固定し、Intensity・Exposureを一つずつ変える |
| 読み込んだライトを調整できない | Scene Inputの接続とOverride Selection / Pickの対象を確認 |
| Classic 3Dノードにつながらない | USDとClassic 3Dを混同せず、USD系のuMerge / uRendererを使う |

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 121「USD Nodes」、**pp.2938–2939（uSphere Light）、pp.2945–2946（共通Transform）**。公式配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

確認したのはuSphere Lightの説明、黄色のScene Input、Override Selection / Pick、Controls一覧、Treat as Point、Radius、オンスクリーン操作ハンドル、共通Transformです。制作例と接続例はこれらの機能から構成しています。

**出力端子の画面上の厳密な名称、Radiusの単位換算、Normalizeの式、PointモードとRadiusの内部的な関係、Rotationの配光への影響、Renderer・Edition差は21.1実機で未確認**です。したがって`verification: partial`を維持します。
