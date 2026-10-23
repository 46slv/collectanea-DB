---
title: uDistant Light
description: USDシーンを太陽光のような一定方向から照らすuDistant Lightを、接続方法、照射方向、明るさ、Angular Size、既存ライトの調整例から解説する。
doc_type: node
term_id: udistant-light
term_short: uDistant Lightは、太陽のような遠方光源を模し、主に回転で光の向きを設定するUSDライト。
verification: partial
aliases: [uDistant Light, uDL]
concepts: [usd-scene, lighting]
nodes: [uDistant Light]
node_family: usd
controls: [Override Selection, Color, Intensity, Exposure, Color Temperature, Diffuse Response, Specular Response, Normalize, Angular Size, Transform]
inputs: [usd]
outputs: [usd]
tasks: [usd, lighting, sun-light]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uDistant Light

**uDistant Lightは、太陽のように遠くにある光源を模して、3Dシーンを一定の方向から照らすためのノード**です。日中の屋外を思わせるライティングや、建物・人物・車の立体感を出すための主な光源に使えます。

このノードは<Term id="usd-scene">USDシーン</Term>で使うライトです。USDは、物体、カメラ、照明などを一緒に扱える3Dシーンのデータ形式です。uDistant Lightの出力をそのまま2D映像として表示するのではなく、[uMerge](./u-merge)でほかのUSD要素と合わせ、[uRenderer](./u-renderer)で画像にします。

## まず理解したいこと：光の「位置」と「向き」

近くの電球は、置いた場所によって照らされ方が大きく変わります。一方、太陽はシーンにある物体から非常に遠いため、**「光がどちらから来るか」を主に指定して照らす**のが自然です。uDistant Lightはこの後者に近いライトです。

- **Rotation（回転）**：光が差し込む方向を変える。画面内のどちら側に明るい面が出るかを決める基本操作。
- **Color / Color Temperature**：光の色味を変える。
- **Intensity / Exposure**：光がシーンにどれくらい寄与するかを調整する。
- **Angular Size**：遠方光源の見かけの広がりを調整する。

FusionのViewerにはこのライトの操作用表示があり、**その回転が光の向きを決める**と21.1の公式Manualに記載されています。Transformタブには位置やスケールもありますが、まず照射方向を合わせたいときは回転から調整します。

## 入力・出力と基本接続

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Scene Input（黄色）** | USDシーン | 既存のライトを含むUSDシーンを受け取り、そのライトを選んで調整する用途にも使う |
| **出力** | USDシーン | 設定したUSDライトを後段のUSDシーンへ渡す。出力ポートの厳密な表示名は21.1実機で未確認 |

Scene Inputは、**画像を投影するための入力ではありません**。外部USDファイルに含まれる照明を編集する場合は、この入力と後述の**Override Selection**を使います。新しいライトをシーンに加える場合は、次の構成でuMergeへ接続するのが基本です。

```text
uShape（立体） ─────────────┐
uCamera（カメラ） ─────────┼→ uMerge → uRenderer → 2D画像
uDistant Light（照明） ────┘
```

[uShape](./ushape)が物体、[uCamera](./ucamera)が撮影位置、uDistant Lightが照明を担当します。uMergeに集める段階ではいずれもUSDシーン側のデータです。2D画像へ変換するのはuRendererです。

### 既存のUSDライトを調整する場合

[uLoader](./uloader)などから読み込んだUSDシーンにライトが既に含まれる場合、**Scene Input**を接続し、**Override SelectionのPick**から対象ライトを選べます。これは、読み込んだUSD全体のすべてのライトを一律に変更する操作ではなく、対象を選んで設定を調整するための方法です。

Manualは「既存ライトの選択と調整」を説明していますが、**選択後の階層構造の変化、同名ライトが複数あるときの解決規則、上流ファイルへの書き戻し**までは、この節では確定できません。上流のUSDファイル自体が更新される操作と誤解しないようにしてください。

## Inspector：明るさと光の性質

21.1 ManualのControlsタブ（pp.2933–2934）には、次の設定が記載されています。

| 設定 | 調整する内容 | 実務での見方 |
| --- | --- | --- |
| **Override Selection / Pick** | 入力したUSDシーン内の既存ライトを選択 | どのライトを変更しているか、対象選択を確認する |
| **Color** | 光源の色 | 朝夕の暖かい光、寒色寄りの光など |
| **Intensity** | ライトの強さ | まず暗すぎる・明るすぎる状態を調整する |
| **Exposure** | シーンへの光の寄与量を変える、Intensityに近い明るさの調整 | Intensityと重ねて極端な明るさにしない |
| **Color Temperature / Enable** | 色温度の使用と値。Manual記載の既定値は**6500 K** | 白に近い昼光を基準に色味を検討する |
| **Diffuse Response** | 材質の拡散反射成分への寄与 | 物体の面全体の明るさを確認する |
| **Specular Response** | 材質の鏡面反射成分への寄与 | ハイライトの出方を確認する |
| **Normalize** | ライトの寄与を正規化する設定 | ON/OFFで寄与がどう変わるか、対象シーンで比較する |
| **Angular Size** | 光源の見かけの広がり | 平行光の広がり方を調整する |

**IntensityとExposureを完全に同じ数値体系だと考えない**ことが重要です。Manualはどちらも明るさに関連するものとして説明していますが、両者の正確な換算関係や内部評価順序までは記載していません。調整するときは片方を基準にし、もう片方を必要な場合だけ使うと結果を比較しやすくなります。

### Diffuse ResponseとSpecular Response

物体の表面が照らされると、面全体に広がって見える明るさと、光沢として局所的に強く現れるハイライトが生じます。

- **Diffuse Response**は前者、つまり拡散反射への光の寄与を調整します。
- **Specular Response**は後者、つまり鏡面反射への光の寄与を調整します。

どちらかを変えても、**材質がもともとどの程度光を反射する設定なのか**によって見た目は異なります。ハイライトが出ない場合はライトだけでなく、[uShader](./ushader)などの材質設定と[uRenderer](./u-renderer)側の条件も確認します。

### Angular Size

Angular Sizeは**遠方光源がどれくらいの角度的な広がりを持つか**を決める設定です。21.1 Manualは「lightのspreadを定義する」と説明しています。

光の向きだけを変えたいならRotation、見かけの広がりを調整したいならAngular Sizeという順に分けて考えると、設定の意図が明確になります。Angular Sizeによる影の輪郭やハイライトの具体的な変化は、使用するRendererや材質、影の設定によっても結果が変わり得ます。**Manualの短い説明だけから、どの設定値で何ピクセル影が柔らかくなるかまでは断定しません。**

## Transform：光の向きを変える

TransformタブはUSD系ノードに共通する位置・回転・スケールなどの設定を持ちます。uDistant Lightの場合、特に**Rotation**が照射方向を変える操作として重要です。

1. uDistant LightをViewerで確認できる状態にします。
2. TransformタブまたはViewer上の操作表示でライトを回転させます。
3. 物体の明るい面が意図した方向に移るか確認します。
4. 方向が決まってから、ControlsタブでIntensity、Color、Angular Sizeを調整します。

回転の各軸に対するRotation Orderなどの一般的なTransformの説明は、[uTransform](./utransform)にもあります。数値の軸方向やViewerの操作ハンドルの見え方は、実際に使っているシーン・座標系で確認してください。

## 制作例1：屋外の建物に日中の光を当てる

1. [uShape](./ushape)や[uLoader](./uloader)から、建物のUSDモデルを用意します。
2. uCameraを用意して、物体が画面に入るようにします。
3. uDistant Lightを追加し、モデル・カメラ・ライトをuMergeへ接続します。
4. uRendererで画像を確認します。最初はライトのColorを白に近くし、IntensityとExposureは過度に上げない状態から始めます。
5. **Rotation**を変えて、建物の正面・側面・屋根のどこが明るくなるかを確認します。
6. 必要に応じてColor TemperatureやAngular Sizeを調整し、求める時間帯の印象へ近づけます。

この手順では**ライトの設置位置を何度も変えるより、光の向きを先に決める**ことが要点です。方向と明るさを同時に大きく変えると、どちらが見た目の変化を生んだか分かりにくくなります。

## 制作例2：外部USDファイルのライトを調整する

1. uLoaderでライト入りのUSDシーンを読み込みます。
2. uDistant Lightの**黄色いScene Input**へ接続します。
3. **Override SelectionのPick**でScene Treeから編集したいライトを選びます。
4. ControlsタブのColor、Intensityなどを変更し、意図したライトだけが変わるか確認します。
5. 後段にuMergeやuRendererをつないで表示し、元シーンと比較します。

Pickはライトを選択するための操作です。**USDファイルに保存された元データそのものの上書き保存を意味しません。**外部ファイルへ結果を書き出したい場合は、[uExport](./uexport)の機能・制約を別途確認します。

## ほかのライトとどう使い分けるか

| ノード | 何を模すか | 向いている例 |
| --- | --- | --- |
| **uDistant Light** | 遠方から一定方向に届く光 | 太陽光、屋外の主光源 |
| [uDome Light](./udome-light) | シーンを包む環境光。画像による照明も使用できる | HDRI環境を使った全体照明 |
| [uDisk Light](./udisk-light) | 円盤状の光源 | 円形面光源を置いた照明 |
| [uRectangle Light](./urectangle-light) | 長方形の面を持つ光源 | 窓やソフトボックスを想定した照明 |

Classic 3D側にもDirectional Lightに相当するノードがありますが、**Classic 3DとUSDでは扱うシーンのデータ形式が異なります**。USDノードの接続例でClassic 3DのライトをそのままuMergeに入れられると仮定しないでください。

## 思ったように照らされないとき

| 症状 | 確認すること |
| --- | --- |
| ライトを置いたのに2D画像が出ない | uDistant LightはUSD系。カメラ・物体とuMergeで合成し、uRendererへ接続しているか |
| 光が反対側から来る | RotationとViewer上の照明方向表示を確認する |
| 全体が明るすぎる | IntensityとExposure、ほかに接続したライトの寄与を確認する |
| Color Temperatureを変えても意図した色にならない | Enableの状態、Color設定、材質やレンダー側の色処理を確認する |
| 面の明るさは変わるがハイライトが目立たない | Specular Responseと材質側の鏡面成分を確認する |
| 既存USDライトを編集できない | Scene Inputの接続とOverride Selection / Pickの選択対象を確認する |
| Angular Sizeを変えても差が分かりにくい | まず光の方向・材質・影の状態を固定し、比較可能なシーンで変化を確認する |
| Classic 3Dライトと接続できない | 入力がUSDかClassic 3Dかを確認し、対応するMerge・Rendererを使う |

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 121「USD Nodes」、**pp.2933–2934**（uDistant Light）。Transformの共通操作は**pp.2945–2946**も参照しています。公式の資料配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

21.1 Manualで確認できるのは、黄色いScene Input、Pickによる既存ライト選択、Color / Intensity / Exposure / Color Temperature / Diffuse Response / Specular Response / Normalize / Angular Size、回転による照射方向と共通Transformです。制作例とトラブル対処は、それらの機能から組み立てた運用説明です。

**出力ポートの厳密な表示名、各パラメータの全数値範囲、IntensityとExposureの換算、Angular Sizeによる影への定量的影響、実機のEdition差は未確認**です。現行Manualだけで埋められない範囲を残すため、`verification: partial`を維持しています。
