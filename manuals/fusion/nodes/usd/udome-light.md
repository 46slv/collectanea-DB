---
title: uDome Light
description: USDシーン全体を環境画像から照らすuDome Lightの2種類の入力、Texture Format、Guide Radius、向き、運用例をResolve 21.1基準で解説する。
doc_type: node
term_id: udome-light
verification: partial
aliases: [uDome Light, uDo]
concepts: [usd-scene, lighting, image-data]
nodes: [uDome Light]
node_family: usd
controls: [Override Selection, Color, Intensity, Exposure, Color Temperature, Diffuse Response, Specular Response, Normalize, Guide Radius, Texture File, Texture Format, Transform]
inputs: [usd, image]
outputs: [usd]
tasks: [usd, environment-light, hdr-light]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-15"
---

# uDome Light

**uDome Lightは、シーンの周囲を取り囲む画像を使って、3Dの物体を周囲の環境から照らすUSDライト**です。たとえば、室内で撮影した360度の環境画像を使えば、窓や天井がある方向を手掛かりにした照明を組み立てられます。太陽のように一方向から照らすライトではなく、周囲の画像を基にした「環境光」を作りたいときに選びます。

照明に使う画像は、ファイルから読み込む方法と、Fusionの別ノードから直接受け取る方法があります。後者なら映像やGeneratorの出力も扱えるので、時間とともに変化する環境光を試せます。対応する画像の明るさや色を、レンダリング結果へどのように反映するかは、使用する画像・材質・Rendererにも依存します。

<Term id="usd-scene">USDシーン</Term>には物体、カメラ、ライト、材質などの3D情報が入っています。uDome Lightの出力は**照明を追加・編集したUSDシーン**であり、照明済みの2D画像ではありません。画面で確認するには、物体・カメラと統合して[uRenderer](./u-renderer)で描画します。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Scene Input** | USDシーン | 読み込んだシーンに含まれる既存ライトを選び、設定を変更するときに使う |
| **Image Input** | 2D画像 | 環境へ貼り付ける画像をほかのFusionノードから受け取る。動画のフレームも利用できる |
| **出力** | USDシーン | uDome Lightの設定を含むシーンを、uMergeやuRendererへ渡す |

この2つの入力は用途が違います。**Scene Inputへ環境写真をつないでも、Image Inputの代わりにはなりません。** 逆に、Image InputはUSDオブジェクトを統合する端子ではありません。ほかのUSDノードと組み合わせるときは[uMerge](./u-merge)を使います。

## 最小構成：環境画像で立体を照らす

    uShape（立体） ───────────┐
    uCamera（カメラ） ────────┼→ uMerge → uRenderer → 2D画像
    uDome Light（環境光） ────┘
           ↑ Image Input（任意）
         2D画像ノード

1. [uShape](./ushape)で照らす立体を、[uCamera](./ucamera)でカメラを用意します。
2. uDome Lightを追加します。静止した環境写真なら**Texture File / Browse**で画像を指定するか、画像ノードを**Image Input**へつなぎます。
3. uShape、uCamera、uDome LightのUSD出力をuMergeでまとめ、その出力をuRendererへ接続します。
4. 画像に合わせて**Texture Format**を選び、**Rotation**で環境の向きを調整します。
5. **Intensity / Exposure**で明るさを調整し、必要に応じてColorや各Responseを確認します。

画像を接続しただけでは、必ず望みどおりのライティングになるとは限りません。環境画像の投影形式、ライトの向き、3D材質やレンダリング設定を分けて確認します。

## Texture FileとImage Inputを使い分ける

### Texture File / Browse：保存済みの画像を使う

Inspectorの**Texture File / Browse**から、環境に割り当てる画像ファイルを選びます。静止した照明環境を作るときの基本的な方法です。Manualではファイル指定を単一フレームの画像ソースとして説明しています。

環境画像は、単に背景に置く写真というより、**球状の周囲のどの方向にどの明るさ・色があるかを表す画像**として考えると理解しやすくなります。写真の見た目だけでなく、後述するTexture Formatとの組み合わせが重要です。

### Image Input：Fusionの画像・動画を直接使う

**Image Input**へFusionの2D <Term id="image">画像</Term>を出力するノードを接続すると、その画像を環境に使います。Manualは動画素材やGeneratorを含むFusionノードのフレームを利用できると明記しています。これにより、事前に画像を書き出さなくても、時間によって変化する環境を試せます。

**Image Inputの接続はファイル指定より優先**されます。21.1 Manualでは、接続時にInspectorの**File Name**コントロールが隠れ、指定済みファイルも接続画像に置き換えられると説明されています。同じ節で画像選択コントロールを**Texture File / Browse**とも表記しているため、UI名を混同せず「画像入力が接続されている間はファイル設定を参照しない」という動作を基準にしてください。

たとえば動画から周囲の色を変えたい場合は、画像を供給するノードをImage Inputへ接続します。ファイルへ戻したい場合はImage Inputの接続を外し、Texture Fileを確認します。**映像を入力できることと、入力映像が正しい360度環境画像であることは別**です。通常の平面映像では、選んだマッピング方式に応じた歪みや方向の偏りが生じ得ます。

## Texture Format：画像を球状の環境へどう割り当てるか

環境画像には、同じ全周囲の景色でも複数の保存方法があります。**Texture Formatは画像の色を変える設定ではなく、画像のどの位置を球のどの方向に対応させるかを選ぶ設定**です。

21.1 Manualが列挙する主な方式は次のとおりです。

| Texture Format | 画像の考え方 |
| --- | --- |
| **Lat-Long** | 横方向を周囲の角度、縦方向を上下の角度に対応させる、横長の全天周画像 |
| **MirrorBall** | 鏡面球を撮影したような円形の環境画像 |
| **Angular** | 角度を基準に周囲を画像平面へ記録する方式 |
| **Cube Mapped Vertical Cross** | 立方体の各方向の画像を、縦長の十字型に配置した方式 |

これらは**互換なファイル形式名ではなく、画像の並べ方・投影の方式**です。入力画像と違う方式を選ぶと、光の来る方向や環境の見え方が合わなくなる可能性があります。たとえばLat-Longとして書き出した環境画像には、まずLat-Longを選んで確認します。

Manualは上記の方式を紹介していますが、個々のフォーマットの厳密なピクセル配置、必要解像度、HDRファイルの対応拡張子や色管理はこの節だけでは確定できません。出所の分からない環境画像については、画像の書き出し設定も確認してください。

## 環境の向きと大きさ：Rotation / Guide Radius

### Rotation：周囲の明るい方向を回す

uDome Lightには**画面上の操作ハンドル**があり、21.1 Manualはハンドルの**Rotation**によってライトが向く方向を決めると説明しています。

たとえば環境画像の明るい窓がモデルの右から当たる想定なら、Rotationを変えて、どちらから照らしたいかを調整します。uDistant Lightのような独立した方向光と異なり、こちらは**周囲の環境画像を持つ照明**です。単純に一方向のライトを移動する操作とは分けて考えます。

### Guide Radius：環境を取り囲むガイドの大きさ

**Guide Radius**は、シーンを取り囲むドームの大きさを指定します。Manualでは、既定の大きく遠い状態を屋外に近い環境として説明し、値を小さくして部屋ほどの大きさを表現する用途にも触れています。

これは[uSphere Light](./usphere-light)の**Radius（球状の発光面そのものの大きさ）**とは役割が違います。Guide Radiusを小さくするだけで照明が現実の部屋のように減衰する、影の位置が物理的に変わる、とまではManualから断定できません。レンダー結果を確認しながら使います。

### Transform：ライトの位置・回転・スケール

Inspectorの共通**Transform**タブには、Translation、Rotation、Rotation Order、Pivot、Scaleが記載されています。Scaleでは**Lock X/Y/Z**による一括・軸別の調整ができます。環境の方向を合わせたいときはRotationを優先して確認し、TranslationやScaleが最終的な照明へ及ぼす影響は実際のRendererで確かめます。

## Controls：明るさと材質への寄与

| Inspectorの項目 | 何を変えるか |
| --- | --- |
| **Override Selection / Pick** | Scene Inputに接続したUSD内の、編集する既存ライトを選択 |
| **Color** | ライト自体の色 |
| **Intensity** | ライトの強さ |
| **Exposure** | シーンの露光への寄与を調整 |
| **Color Temperature / Enable** | 色温度による指定を有効化。Manual記載の既定値は**6500 K** |
| **Diffuse Response** | 物体の材質の拡散反射に対する寄与 |
| **Specular Response** | 光沢・反射など鏡面反射成分に対する寄与 |
| **Normalize** | ライトの寄与を正規化 |
| **Guide Radius** | 周囲を取り囲むドームの大きさ |
| **Texture File / Browse** | 環境画像ファイルの指定 |
| **Texture Format** | 球への画像の貼り付け方式 |

**IntensityとExposure**はどちらも明るさに関係します。ManualではIntensityの例として0.2を20%の光と説明していますが、現実の照度・光束への換算やExposureとの正確な計算式は示されていません。両方を同時に変えず、一方を固定して比較すると調整しやすくなります。

**Diffuse Response**は物体の地の色に現れる反射、**Specular Response**は表面の光沢や反射ハイライトに現れる成分への寄与です。照らされる物体の材質側にそれらの反射成分がなければ、変化を確認しにくいことがあります。

**Normalize**はライトの寄与を正規化する設定です。ただし具体的な正規化の式や、環境画像の明るさをどのように扱うかはManualのこの節だけでは確定できません。照明比較をするときはON/OFF条件を固定してください。

## 読み込んだUSD内のライトを編集する

別のツールで作成したUSDにすでにライトが含まれる場合、Scene InputとOverride Selectionを使って対象を選べます。

1. [uLoader](./uloader)などで、ライトを含むUSDシーンを読み込みます。
2. uDome Lightの**Scene Input**へ接続します。
3. Inspectorの**Override Selection → Pick**から、変更したいライトを選びます。
4. Intensity、Color、Texture設定などを調整し、後段のuRendererで結果を確認します。

**Pickは対象を選択する操作**であり、USD内のすべてのライトを一括変更することを意味しません。元のUSDファイルを自動上書きする操作とも異なります。変更後のシーンを書き出す場合は[uExport](./uexport)を確認します。別種類のライトをPickした際の変換挙動は、このManual節では保証されていません。

## 制作例1：HDR環境画像を使った商品CGの照明

**目的：** 商品を背景の空気感になじませるため、撮影場所の環境画像を参照して照らす。

1. 商品モデル（uLoaderまたはuShape）とuCameraを用意します。
2. uDome LightのTexture Fileへ、投影方式の分かっているHDR環境画像を指定します。
3. 画像がLat-Longなら、Texture FormatもLat-Longに合わせます。
4. Rotationを調整し、画像内の明るい領域が商品に対して望む方向へ来るようにします。
5. IntensityとExposureを一つずつ調整し、必要ならSpecular Responseで反射の寄与を比較します。
6. uMergeで商品・カメラ・ライトを統合し、uRendererで確認します。

必要なら[uRectangle Light](./urectangle-light)を追加してソフトボックスに相当する光を作ったり、[uDistant Light](./udistant-light)を追加して方向性のある照明を補ったりできます。これらのライトは別のUSD要素としてuMergeへ接続します。

環境画像で**照らすこと**と、その画像を**カメラの背景として表示すること**は同じ機能ではありません。uDome Lightを接続するだけで、画像が必ず背景に映るとは断定せず、必要なら背景表示の構成を別途確認します。

## 制作例2：時間とともに変わる環境光

**目的：** 映像やGeneratorに合わせて、環境の色や明るい領域を時間的に変化させる。

1. Fusionで環境に使う2D画像の出力を作ります。静止画に限らず、動画ソースやアニメーションするGeneratorでも構いません。
2. その画像出力をuDome Lightの**Image Input**へつなぎます。
3. **Texture File指定よりImage Inputが優先**されていることを確認します。
4. 入力画像の形式とTexture Formatを合わせ、Rotationと明るさを調整します。
5. 画面内の異なる時刻をuRendererで比較し、環境光の変化を観察します。

映像が変化すれば照明にも変化を与えられる構成ですが、どの程度リアルタイムに更新されるか、再生性能やキャッシュ動作はManualのこの節だけでは確定できません。結果はホストとRendererで確認します。

## 関連するライトとの使い分け

| ノード | 違い | 向いている用途 |
| --- | --- | --- |
| **uDome Light** | 周囲を囲む環境画像から照らす | HDR環境、周辺光、変化する環境 |
| [uDistant Light](./udistant-light) | 遠方からの一方向の照明 | 太陽のような方向光 |
| [uRectangle Light](./urectangle-light) | 幅と高さを持つ四角い面光源 | 窓・ソフトボックス |
| [uDisk Light](./udisk-light) | 円形の発光面 | 円盤型照明 |
| [uSphere Light](./usphere-light) | 球状の大きさを持つ近接光源 | 小型ランプ |
| [uCylinder Light](./ucylinder-light) | 長さを持つ管状の光源 | 蛍光管型照明 |

名前が似たClassic 3Dの**DomeLight**とは、扱うシーンの種類が違います。uDome LightはUSD系の**uMerge / uRenderer**と組み合わせます。Classic 3DのMerge 3D / Renderer 3Dへ同じデータとして直接接続できるとは考えないでください。

## 思ったように照らされないとき

| 症状 | 確認すること |
| --- | --- |
| 2D画像が出ない | 出力はUSDシーン。uCamera、uMerge、uRendererまで接続できているか |
| 環境画像を変えても見た目が変わらない | Image Inputの有無と優先順位、Texture File、入力ノードのフレームを確認 |
| 明るい方向が合わない | 入力画像のTexture FormatとRotationを確認 |
| 画像が歪む、方向がずれる | 元画像がLat-Longなどどの方式で作られたかを確認 |
| 環境光が弱い | Intensity / Exposureと、物体の材質・Rendererを確認 |
| 反射がほとんど見えない | Specular Responseと物体の反射設定を確認 |
| Color Temperatureの効果が出ない | Enableの状態、Color、元画像の色を確認 |
| Guide Radiusを変えても効果が分からない | ドームのガイド寸法と照明結果を区別し、他条件を固定して比較 |
| 既存USDライトを調整できない | Scene Inputの接続とOverride Selection / Pickの選択先を確認 |
| 画像が背景に見えない | 環境による照明とカメラ背景表示を分けて考え、別途背景構成を確認 |
| Classic 3Dと接続できない | USDとClassic 3Dの入力形式・Rendererを混同していないか |

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 121「USD Nodes」、**pp.2934–2936（uDome Light）、pp.2945–2946（USD共通Transform）**。公式配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

Manualで確認したのはuDome Lightの役割、Scene / Imageの2入力、画像入力の優先順位、Controls一覧、Texture Formatの名称、Guide Radius、オンスクリーンのRotation、USD共通Transformです。上の制作例は、資料で確認できる機能を組み合わせて構成しました。

**出力端子の画面上の厳密な表示名、HDR形式ごとの読み込み・色管理、Normalizeの計算式、Guide Radiusと照明減衰の関係、背景としての可視性、Renderer / editionによる差は実機未確認**です。そのため `verification: partial` のままとしています。
