---
title: "LatLong Patcher"
description: "正距円筒形式の360°映像から修正箇所を平面画像として取り出し、ペイントや合成の結果を球面画像へ戻すFusion Node。Extract／Apply／Apply180、入力端子、Rotation、Alpha合成を解説。"
doc_type: node
term_id: "latlong-patcher"
term_short: "LatLong Patcherは、360°の正距円筒画像から指定方向を平面画像として取り出し、修正後に元の球面画像へ戻すNode。"
verification: partial
aliases: ["LatLong Patcher", "Lat Long Patcher", "LLP"]
concepts: ["image-data"]
nodes: ["Lat Long Patcher"]
node_family: "immersive"
controls: ["Mode", "Rotation Order", "Rotation", "Angle of View"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["process-immersive"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-10"
---

# LatLong Patcher

**LatLong Patcher**（公式Manualの表記は *Lat Long Patcher*）は、360°映像の一部分を取り出して通常の平面画像として修正し、その修正を元の360°映像の位置へ戻すNodeです。球面映像の端や上下の極に近い場所は平面画像として大きく引き伸ばされるため、普通のPaintやTransformだけでは修正しにくいことがあります。LatLong Patcherは、対象を見やすい方向へ向けて歪みを補正した画像を作り、作業後に逆変換します。

ここでいう**LatLong（正距円筒図法／equirectangular）**は、周囲の方向を長方形に配置する映像形式です。横方向が経度0〜360°、縦方向が緯度−90〜＋90°に対応します。地球儀を世界地図へ展開するのと似ており、画像内の場所によって見かけの形が変わります。LatLong Patcherはこの形式の画像を前提にします。Fusionの通常の2D ImageやAlphaの意味は[画像（Image）](../../learn/02-data/image.md)も参照してください。

**対応Edition**：DaVinci Resolve 21.1 Reference Manualは、VRカテゴリとLat Long Patcherを**DaVinci Resolve Studio／Fusion Studio限定**と明記しています。無償版での使用を前提とした手順ではありません。

## 何をするNodeか

通常はLatLong Patcherを2つ使用します。1つ目で修正対象を平面化し、2つ目で画像を元の球面画像の座標へ戻します。

- **Extract**：360°画像の指定方向から、歪みを補正した**視野90°の正方形画像**を取り出す。ここで位置確認、トラッキング、ペイント、合成を行います。
- **Apply**：平面の正方形画像を球面へ沿う形に変形し、LatLong画像上の該当位置へ戻す。入力画像の**Alpha**が使われるため、透明背景の上に描いた修正だけを重ねる構成が可能です。
- **Apply180**：VR180形式の映像を修正するための選択肢。ManualはVR180画像へのパッチの抽出・再適用に使うと説明していますが、この節だけではExtract／Applyとの詳細な入出力差を確定できません。

**90°の正方形**とは、通常の動画の90ピクセル四方という意味ではなく、球面上で一定の視野角を切り取った平面画像を指します。360°画像全体を歪みのない平面へ変換する機能ではありません。

## 入力と出力

21.1 ManualのLat Long Patcher節は、Node Editor上の入力を次の**2つ**と明記しています。

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Image Input**（オレンジ） | 正距円筒形式の2D RGBA画像 | Extract側は元の360°画像、Apply側は平面上で編集した画像を渡す |
| **Effect Mask** | 効果を制限するマスク | 標準的なEffect Mask端子。公式ManualではVR Nodeで使う機会は少ないと説明 |
| **出力** | 2D Image | Modeに応じた平面化画像、またはLatLong配置へ戻した画像 |

このNodeの2つ目の入力は、[Immersive Patcher](./immersive-patcher.md)の**Metadata入力ではなくEffect Mask**です。目的が似ていても同じ端子構成ではありません。また、Applyで修正領域を重ねる際に重要な**画像のAlpha**と、Node全体の効果範囲を制限する**Effect Mask**は区別してください。

## Inspector：主な設定

### Mode — Extract／Apply／Apply180

**Extract**で取り出した画像は普通の平面画像として扱えます。例えば、画像の外側で繋がるはずの360°映像の左右の境目や、上下端に近い部分を、一時的に中央付近へ持ってきて修正できます。

**Apply**は修正した平面画像を対応するLatLong領域へ戻します。透明部分を持つ画像であれば、元画像全体を一度平面化して再変換するのではなく、**必要なストロークや文字だけ**を戻せます。公式Manualは、これによって元素材の不要な再フィルタリングを避けられると説明しています。

**Apply180**はVR180でのパッチ処理向けです。360°向けのExtract／Applyと何が同じで何が異なるか、使用する映像のレイアウト、片眼／両眼の取り扱いは、該当素材とResolve 21.1の実機で確認してください。Manualの短い説明だけでステレオ映像の詳細動作までは断定しません。

### Rotation Order — 回転の順番

球面画像の方向を変えるとき、X・Y・Z軸の回転をどの順番で行うかを指定します。3軸の回転は一般に**順番によって最終的な向きが変わる**ため、各軸の数値が同じでも、順序が異なると別の場所を取り出す場合があります。

Manualにある例の**XYZ**は、最初にX軸（Pitch／Tilt、上下へ傾ける動き）、次にY軸（Pan／Yaw、左右へ向きを変える動き）、最後にZ軸（Roll、視線方向を軸に回す動き）の順です。Inspectorでは3軸の**6通りの順序**から選択できます。

同じ修正を元の位置へ戻すには、Extract側とApply側で回転角だけでなく**Rotation Orderも一致**させます。

### Rotation — どの方向を修正するか

X・Y・Zのダイヤルで、LatLong画像を回転させて修正対象のある方向を選びます。例えば360°画像の背後にスタンドが写り込んでいれば、Rotationでスタンドが取り出した平面画像の中央近くに来るよう調整します。

ExtractとApplyで異なるRotationにすると、戻す場所がずれます。Manualは**同じRotationを使用**することを明記しており、設定を手入力するより最初のNodeをコピーまたはインスタンス化し、必要なModeだけ変更する方法が確実です。なお、インスタンスでどのパラメータが連動するかは実際のGraphで確認してください。

### Angle of View — 表示する視野角

Manualでは、VRヘッドセットの画角に合わせるスライダーとして説明されています。Inspector上にある設定ですが、**Extractの「90°の正方形」というモードの説明と、Angle of Viewの機能を同じ意味だと決めつけない**でください。

具体的な初期値、数値範囲、Mode別の影響はManualのこの節に記載されていません。2つのPatcherを使うときは、意図しない違いがないよう、設定値を揃えて比較します。

### Settings — 共通設定

SettingsタブはVR Node群に共通する項目を含みます。個別項目と初期値は、Manual同章末尾の**The Common Controls**を参照してください。このページではLat Long Patcherに固有の設定として扱いません。

## 運用例：360°映像の中の機材を消す

撮影時に床の近くへ写り込んだスタンドを消す例です。まず位置合わせ用に平面画像を取り出し、必要な部分だけを修正します。

~~~text
LatLong元映像 ─────┬─────────────────────────→ Merge [Background]
                   │                                   ↑
                   ↓                                   │
        Lat Long Patcher ① [Extract]                   │
                   │                                   │
           平面画像を見て修正                           │
                   │                                   │
        透明部分を残した修正レイヤー                    │
                   │                                   │
        Lat Long Patcher ② [Apply]                     │
                   │                                   │
                   └────────────────────────→ Merge [Foreground]
                                                       │
                                                    360°出力
~~~

上図は**接続の考え方**を示したもので、すべての修正工程を1本のFlowとして確定させた図ではありません。平面化した元画像をそのままApplyへ通すと、変更していない画素まで再変換される可能性があります。合成内容に応じて、**修正部分だけをAlpha付き画像として分離する**ことが重要です。

1. LoaderまたはMediaInからLatLong形式の360°素材を読み込み、元素材は最終合成用に分岐しておきます。
2. Lat Long Patcher ①を**Extract**にし、**Rotation／Rotation Order**を調整して機材のある領域を平面画像へ取り出します。
3. 取り出した画像をViewerで確認し、必要に応じてトラッキングします。機材を隠すペイント、クローン、合成などを平面上で行います。
4. 元画像の非修正部分まで上書きしないよう、修正領域だけを取り出した**Alpha付きレイヤー**を作ります。文字や描画ストロークなら透明なBackground上へ描く構成が考えられます。
5. Lat Long Patcher ②を**Apply**にし、①と**同じRotation／Rotation Order**で修正レイヤーを球面画像の該当位置へ戻します。
6. 必要に応じてMergeでApply後の修正画像を**Foreground**、元のLatLong映像を**Background**に重ねます。修正がない領域のAlpha、境界の継ぎ目、歪みを確認します。
7. 最後はViewerの360°表示などで一周を見回し、元の視点でも自然に修正できているか確認します。

公式Manualは**Extract→画像処理→Apply**を基本構成とし、透明背景に描いたPaintや文字を適用する例を挙げています。ここではMergeによる元画像との合成と、Alphaを利用した非修正画素の保護を、読者が再現しやすい形に分けて説明しました。実機でのFlowと端子挙動は未確認です。

## よくある問題と確認箇所

**元の位置とずれる**場合は、2つのPatcherのRotationおよびRotation Orderが一致しているか確かめます。平面側のTransformで画像をずらした場合も、戻したときの位置へ影響するため注意してください。

**周囲がにじむ／二重に加工される**場合は、元素材の広い部分をExtractからApplyへそのまま往復させていないか、修正レイヤーのAlphaが必要な部分だけにあるかを確認します。Manualが説明する透明背景の上のPaintや文字の適用は、この問題を避ける方法の一つです。

**VR180で想定どおりに動かない**場合は、素材の形式がVR180か、ModeがApply180か、Viewer表示と出力が一致しているかを確認します。左右の眼の対応やVR180素材の各レイアウトは、この節の仕様だけでは確定できません。

**Effect Maskの挙動が分からない**場合は、修正画像のAlphaと混同していないか確認します。前者はNode処理の効果範囲を制限する入力、後者は画像自体の透明度です。VR NodeではEffect Maskの使用頻度が低いというManualの記載は、非対応を意味しません。

## 関連Nodeとの使い分け

| Node | 役割 |
| --- | --- |
| **Lat Long Patcher** | LatLong形式の360°画像から一部分をExtractし、修正画像をApplyして元の位置へ戻す |
| **[Immersive Patcher](./immersive-patcher.md)** | イマーシブ画像の局所をUndistort／Distortして修正する。2番目の入力はMetadata |
| **[PanoMap](./panomap.md)** | LatLongやCube Mapなどの球面画像形式を変換する |
| **[Spherical Stabilizer](./spherical-stabilizer.md)** | 球面画像の回転方向の揺れを追跡・補正する |
| **[Spherical Camera](./spherical-camera.md)** | Fusionの3Dシーンを全方向から撮影する仮想カメラ。2Dパッチ処理とは役割が異なる |

LatLong Patcherは**既存の球面画像を修正するためのNode**です。3Dシーンから球面画像を生成するカメラや、映像全体の向きを安定化するNodeとは使い分けます。[Immersive / 360° Family](./index.md)も参照してください。

## バージョン・出典・未確認範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』、Chapter 122「VR Nodes」、Lat Long Patcher [LLP]（pp.2951–2952）。Studio限定、Image InputとEffect Mask、Mode（Extract／Apply／Apply180）、Rotation Order、Rotation、Angle of View、Alphaを使ったパッチ再適用を確認しました。公式資料の入口は[Blackmagic Design Support](https://www.blackmagicdesign.com/support)です。

**verification: partial**：本文のNode名・主なControls・対応Editionは21.1 Manualによる確認済みですが、端子内部ID、Controlのデフォルト値や数値範囲、Apply180の内部動作・片眼／両眼の扱い、Effect Maskの詳細挙動、実機での画質・実行負荷は未確認です。Manualだけでは読み取れない値を推測していません。
