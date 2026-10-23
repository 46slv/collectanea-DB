---
title: uDisk Light
description: 円盤状のUSDライトを追加・編集するuDisk Lightの入出力、明るさ、照射範囲、Transformと具体例をResolve 21.1に基づいて解説する。
doc_type: node
term_id: udisk-light
term_short: uDisk Lightは、円形の面から光を出すUSDライトを作成・編集し、明るさと照射範囲を調整するノード。
verification: partial
aliases: [uDisk Light, uDi]
concepts: [usd-scene, lighting]
nodes: [uDisk Light]
node_family: usd
controls: [Override Selection, Color, Intensity, Exposure, Color Temperature, Diffuse Response, Specular Response, Normalize, Shaping Focus, Shaping Cone Angle, Radius, Transform]
inputs: [usd]
outputs: [usd]
tasks: [usd, lighting, area-light, soft-light]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-15"
---

# uDisk Light

**uDisk Lightは、円形の平らな面から光を出すUSDライトを、シーンに追加したり既存のライトを調整したりするノード**です。撮影用のアンブレラやソフトライトのように、光が一点からではなく一定の広さを持った面から届く表現を作るときに使います。

<Term id="usd-scene">USDシーン</Term>とは、立体、カメラ、ライトなどの情報をまとめて扱う3Dデータです。uDisk Lightはその中にライトを加えるノードで、**光が当たった完成画像を直接出力するわけではありません**。照らす物体とカメラを合わせ、[uRenderer](./u-renderer)で描画すると結果を確認できます。

円形のライトが必要ならuDisk Light、長い蛍光灯のような形なら[uCylinder Light](./ucylinder-light)、太陽のような遠方からの方向光なら[uDistant Light](./udistant-light)が比較対象になります。

## 入力・出力

| 接続 | データ | 何のために使うか |
| --- | --- | --- |
| **Scene Input（黄色）** | USDシーン | 既存ライトを含むUSDシーンを受け取り、そこにあるライトを編集する場合に使う |
| **出力** | USDシーン | ライトの情報を含むシーンを後段のuMergeやuRendererへ渡す |

21.1 Manualは**黄色のScene Inputを1つ**記載しています。これは2D画像を明るくするための画像入力ではありません。また、複数ライトの配線を直接合成するための入力でもありません。別のUSDオブジェクト、カメラ、ライトとまとめるには、[uMerge](./u-merge)を使います。

```text
uShape ─────────┐
uDisk Light ─────┼→ uMerge → uRenderer → 2D画像
uCamera ────────┘
```

この例では[uShape](./ushape)で立体を作り、uDisk Lightを追加して[uCamera](./ucamera)とともにuMergeへ接続します。立体が暗いままなら、ライトが物体を向いているか、明るさの設定、カメラとレンダラーの接続を順に確認します。

## まず調整する3つの要素

### 1. Transform：ライトをどこに置き、どこへ向けるか

**Transformタブ**でライトの位置、向き、スケールを調整します。uDisk Lightには円形の発光面があるため、ライトを置くだけでなく、**その面を被写体の方向へ向ける**必要があります。

- **Translation**：ライトを被写体の上、横、手前などへ移動する。
- **Rotation**：円盤の向きを回し、どの方向を照らすか変える。
- **Scale**：ライトの変形・大きさに関わる。後述のRadiusとの併用結果は実際のシーンで確認する。

一般のUSDノードと共通するTransformには、Rotation Order、Pivot、ScaleのLock X/Y/Zなどもあります。Rotation Orderは各軸の回転を適用する順序、Pivotは回転の中心です。設定名と基本的な意味は21.1 Manualの共通Controlsに基づきます。

### 2. Intensity・Exposure：明るさを決める

**Intensity**と**Exposure**はどちらも光量に関係します。ManualはIntensityをライトの強さ、Exposureをシーンへ与える露光量に関係する設定として説明しています。両者の内部計算や単位の完全な対応関係はこの節だけでは分かりません。

初めて調整する場合は、片方を固定してもう片方を動かすと変化を追いやすくなります。**Intensityの数値を実在する照明器具のルーメン値やカメラのF値へそのまま換算しない**でください。

### 3. Radius・Shaping：光源の大きさと広がりを変える

| 設定 | 21.1 Manualで確認できる役割 | 調整の目的 |
| --- | --- | --- |
| **Radius** | 円形ライトの大きさを決める項目。Manual本文では「diameter（直径）」を定義すると説明 | 発光面の見た目のサイズを変える |
| **Shaping Focus** | ライトのレンズ効果の焦点を定義する項目 | 光の集中具合を調整するときに試す |
| **Shaping Cone Angle** | 光の広がりを定義する項目 | 照射する方向の範囲を調整する |

**RadiusというUI名だけで、値が数学的な半径を表すと決めつけないでください。**21.1 Reference ManualのuDisk Light節は、この項目を「直径を定義する」と説明しています。数値と実際のワールド空間寸法の対応、Transform Scaleとの掛け合わせは実機確認が必要です。

ライトのサイズと光の広がりは同じ設定ではありません。例えば、被写体の近くに置いた大きな円盤でも、Shapingで照射方向を絞れば、広い面からの光を一定方向へ集める設定になります。一方、Shapingを広げても、それだけで発光面の大きさが変わるわけではありません。

一般的には面光源のサイズと位置が影やハイライトの見え方に影響しますが、**影の柔らかさや形が必ず特定の値になることを21.1 Manualのこの節だけから保証することはできません**。材質やレンダー設定も含めて確認します。

## Controls：色と素材への影響

| 項目 | 機能 |
| --- | --- |
| **Color** | ライト自体の色を指定する |
| **Color Temperature / Enable** | 色温度による指定を有効にして値を調整する。Manualが挙げる既定値は**6500 K** |
| **Intensity** | 光の強さを指定する |
| **Exposure** | シーンへの露光に関係する明るさを調整する |
| **Diffuse Response** | 物体の拡散反射成分へ、ライトがどの程度寄与するか調整する |
| **Specular Response** | 物体の鏡面反射成分へ、ライトがどの程度寄与するか調整する |
| **Normalize** | シーンへの光の寄与を正規化する設定 |

**Diffuse**は物体表面の色が広く見える反射、**Specular**は光沢面などで見える反射成分のことです。Diffuse ResponseとSpecular Responseを分ければ、物体全体の明るさとハイライトへの寄与を別々に調整できます。ただし、実際の変化は接続された材質とレンダリング条件に依存します。

**Normalize**はManualに正規化設定として記されていますが、どの入力値をどの係数で補正するか、Radius変更時にどの程度光量を維持するかまでは記載されていません。光源の大きさを変更した前後で明るさが変わる場合、Normalizeのオン・オフを比較し、結果から判断します。

色を決めるときは、Colorの値と色温度の設定を一度に大きく動かさず、どちらが見た目の変化に関与しているかを確かめながら調整すると原因を追いやすくなります。

## 既存のUSDライトを調整する：Override Selection

外部USDファイルにライトが含まれている場合は、uDisk Lightの**Scene Input**へそのシーンを接続し、**Override SelectionのPick**から対象ライトを選べます。Manualはこの操作を、読み込んだシーンの既存ライトを調整する方法として説明しています。

1. [uLoader](./uloader)などで、ライトを含むUSDシーンを読み込みます。
2. uDisk Lightの黄色いScene Inputへ接続します。
3. Inspectorの**Override Selection → Pick**で、変更したいライトを選びます。
4. Color、Intensity、Exposureなどを少し動かし、後段で結果を確認します。

Scene Inputに接続しただけで目的のライトが必ず選ばれるとは限りません。選択対象が異なる場合はPickを見直してください。また、別種のUSDライトを選んだときの変換・編集可能範囲は、ManualのuDisk Light節では明示されていません。対象の型が異なるときは実機で挙動を確かめます。

## 制作例1：商品を上から柔らかく照らす

**目的：** 机に置いた商品のCGを、円形ライトで明るく見せる。

1. uShapeやuLoaderで商品・机に相当するUSDオブジェクトを準備します。
2. uDisk Lightを商品より上の位置へ置き、**Rotation**で発光面を商品へ向けます。
3. Colorを白に近い色から始め、IntensityまたはExposureを少しずつ上げます。
4. **Radius**を変えて発光面の大きさによる違いを確認します。
5. 必要なら**Shaping Cone Angle**を変え、光が届く範囲を調整します。
6. uMergeへ商品・ライト・カメラを接続し、uRendererで結果を確認します。

商品が明るいのに背景まで均一に明るくなりすぎる場合は、最初にライトの位置・向き・Shapingを確認します。明るさだけを下げると商品の見え方まで同時に暗くなるためです。

## 制作例2：複数のライトを役割別に置く

**目的：** 正面から主に照らす光と、反対側の暗さを補う光を別々に調整する。

1. 1つ目のuDisk Lightを被写体の斜め前に置き、主光源として明るさと向きを決めます。
2. 2つ目のuDisk Lightを反対側へ置き、最初のライトより弱い寄与になるようIntensityなどを調整します。
3. 2つのライトと被写体、カメラをuMergeにまとめます。
4. 1つずつライトの寄与を確認し、光が重なったときの反射・ハイライトを調整します。

uDisk Light単体が「二灯を自動的に組む」機能を持つわけではありません。**1つのノードで1つの照明設定を管理し、複数をuMergeで同じUSDシーンへ集める**構成例です。

## ほかのUSDライトとの違い

| ノード | 発光の考え方 | 比較するときの目安 |
| --- | --- | --- |
| **uDisk Light** | 円形の平らな面 | 円盤型ソフトライト、アンブレラに近い光源 |
| [uRectangle Light](./urectangle-light) | 四角い面 | 窓や長方形のライト面を想定する場合 |
| [uCylinder Light](./ucylinder-light) | 長さと太さのある円柱状 | 蛍光管のような長い光源 |
| [uSphere Light](./usphere-light) | 球形の光源 | 球状に広がるライトを使いたい場合 |
| [uDistant Light](./udistant-light) | 遠方の方向光 | 太陽光のように方向を中心に考える場合 |
| [uDome Light](./udome-light) | 周囲を囲む環境光 | HDR画像などによる周囲からの照明 |

形の異なるライトへ、同じ数値を入れれば同じ見た目になるとは限りません。ライトの位置・サイズ・方向と、物体の材質を含めて比較してください。

## 表示や照明が期待どおりにならないとき

| 状況 | 確認すること |
| --- | --- |
| 物体が暗い | uDisk LightがuMergeへ含まれているか、Rotationが被写体側を向いているか、Intensity / Exposureが極端に低くないか確認 |
| uDisk Lightをつないでも2D画像が出ない | 出力はUSDシーン。カメラとuRendererまでの経路を確認 |
| ライトを動かしても照射方向が変わらない | TranslationだけでなくRotationを調整し、発光面の向きを確認 |
| Radius変更が思ったように見えない | RadiusのUI名とManualの「直径」説明を区別。Transform Scaleも確認し、寸法の換算は実機で検証 |
| 照らす範囲が広すぎる・狭すぎる | Shaping Cone Angle、Shaping Focus、位置・向きを切り分ける |
| 白いライトの色が意図どおりにならない | ColorとColor Temperature / Enableを別々に確認 |
| ハイライトだけ不自然に強い | Specular Responseと材質の反射設定を確認 |
| 既存ライトを変更できない | Scene Inputの接続、Override SelectionのPickで選んだ対象を確認 |
| サイズを変えると明るさの変化が読めない | Normalizeの有無を比較し、同じ露光・レンダー条件で確認 |
| 2灯以上を置いたのに片方の効果がない | 両方のライトが同じuMergeへ届いているか、各ライトの向き・光量を個別に確認 |

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 121「USD Nodes」、**pp.2931–2933（uDisk Light）およびpp.2945–2946（USD共通Transform）**。ノード名、Scene Input、Controls、Override Selection、Radius、Shaping Focus / Cone Angle、Transformの記載を確認しています。公式資料の配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

制作例や調整順は、資料で確認した機能を用いた運用例であり、公式Manualが保証する固定の照明結果ではありません。**出力端子の厳密な画面表示名、Radiusのワールド単位への換算、Shaping Focusの内部計算、Normalizeの具体的な正規化式、ライトと材質による影の出方、Edition差は実機未確認**です。このためFrontmatterの**verification: partial**を維持しています。
