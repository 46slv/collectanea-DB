---
title: uRectangle Light
description: 四角い発光面を持つUSDライトの入力・出力、Width・Height、明るさ、Shaping、既存ライトの編集を21.1基準で解説する。
doc_type: node
term_id: urectangle-light
verification: partial
aliases: [uRectangle Light, uRL]
concepts: [usd-scene, lighting]
nodes: [uRectangle Light]
node_family: usd
controls: [Override Selection, Color, Intensity, Exposure, Color Temperature, Diffuse Response, Specular Response, Normalize, Shaping Focus, Shaping Cone Angle, Width, Height, Transform]
inputs: [usd]
outputs: [usd]
tasks: [usd, lighting, area-light, softbox]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-15"
---
# uRectangle Light

**uRectangle Lightは、四角い面から光を出すライトを<Term id="usd-scene">USDシーン</Term>に追加するノード**です。窓から差す光や、長方形のソフトボックスのような照明を作りたいときに使います。Width（横幅）とHeight（高さ）を別々に変えられるため、縦長の窓、横長の撮影用ライト、正方形に近い光源を作り分けられます。

USDシーンは、3Dの物体、カメラ、ライト、材質などの情報をまとめたものです。このノードが出すのは**ライトの情報を含んだUSDシーン**であり、ライトを当てた2D画像そのものではありません。物体とカメラを合わせて[uRenderer](./u-renderer)で描画すると、照らされた見た目を確認できます。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Scene Input（黄色）** | USDシーン | 既存のライトがあるシーンを接続し、対象を選んで編集するときに使う |
| **出力** | USDシーン | 設定したライトを含むシーンをuMergeやuRendererへ渡す |

21.1 Reference Manualは黄色のScene Inputを**1つ**記載しています。これは画像を直接明るくする2D画像入力ではありません。複数のUSD要素をまとめるには[uMerge](./u-merge)を使います。Classic 3DのMerge 3Dや2DのMergeとは扱うデータが異なります。

## 最小構成

    uShape（立体） ────────────┐
    uCamera（カメラ） ─────────┼→ uMerge → uRenderer → 2D画像
    uRectangle Light（照明） ──┘

1. [uShape](./ushape)で立体を、[uCamera](./ucamera)でカメラを用意します。
2. uRectangle Lightを加え、3つのUSD出力をuMergeでまとめます。
3. uMergeをuRendererへつないで表示します。
4. Transformで**位置と向き**を、Controlsで**明るさと発光面の大きさ**を調整します。

位置を移動しただけでは発光面が被写体に向くとは限りません。物体が暗ければ、Intensityだけを上げる前にRotationを確認してください。この配線は確認済みの機能から組み立てた基本例であり、特定の初期値で一定の照明結果を保証するものではありません。

## 形を決める：WidthとHeight

**Widthは発光面の横幅、Heightは高さ**を決めます。Manualはそれぞれ、ライトがどれくらい広く、高く見えるかを指定する項目として説明しています。

- **縦長の窓**：HeightをWidthより大きくし、縦方向に長い発光面を想定する。
- **横長のソフトボックス**：WidthをHeightより大きくし、横に広がった発光面にする。
- **正方形に近い照明**：WidthとHeightを近い値にする。

この2つは**光源自体の形**に関係する設定です。照らす向きはRotation、光の広がる角度はShaping Cone Angleで調整します。幅と高さの数値が現実の長さにどう換算されるか、Transform Scaleと厳密にどう組み合わさるかは、このManual節では確定できません。

## Transform：照らす位置と向き

TransformタブにはUSDノード共通の設定があります。

| 項目 | 意味 |
| --- | --- |
| **Translation** | ライトを3D空間内で移動する |
| **Rotation** | 四角い発光面の向きを変える |
| **Pivot** | 回転の中心となる位置を調整する |
| **Rotation Order** | X・Y・Z軸をどの順で回転させるか選ぶ |
| **Scale** | 全体または軸別に拡大縮小する |

ScaleではLock X/Y/Zを使って一括調整と軸別調整を切り替えられます。これらは21.1 Manual pp.2945–2946の共通Transform説明に基づきます。**Width・Heightを変更することとTransformでライトを移動・回転させることを区別**すると、目的の結果へ近づけやすくなります。

## Controls：明るさ、色、照射範囲

| 設定 | 21.1 Manualに記載された機能 |
| --- | --- |
| **Override Selection / Pick** | Scene Inputに接続したUSD内の既存ライトを選択 |
| **Color** | ライトの色 |
| **Intensity** | ライトの強さ |
| **Exposure** | 照明の露光への寄与を変える |
| **Color Temperature / Enable** | 色温度による指定を有効化。Manual記載の既定値は6500 K |
| **Diffuse Response** | 材質の拡散反射成分への寄与 |
| **Specular Response** | 材質の鏡面反射成分への寄与 |
| **Normalize** | ライトの寄与を正規化する |
| **Shaping Focus** | ライトのレンズ効果の焦点を定義する |
| **Shaping Cone Angle** | 光が広がる角度を定義する |
| **Width / Height** | 発光面の横幅・高さ |

**Intensity**と**Exposure**はどちらも明るさに関係しますが、相互換算や内部の計算式はManualの該当箇所に記載されていません。初めて調整するときは片方を固定し、もう片方の値を変えて差を比較する方法が分かりやすいです。現実の照明機器のルーメン値へ直接換算できると仮定しないでください。

**Diffuse**は面全体に広がる反射成分、**Specular**は光沢面などのハイライトとして現れる成分です。Responseの値を変えても、照らされる物体の材質やRendererの設定によって見た目は変わります。

**Normalize**は寄与を正規化する機能ですが、どの数値を基準にどの補正をするかはManualに示されていません。光源の大きさを変更したときに明るさが一定になると断定せず、ON／OFFを同条件で比較します。

**Shaping Cone Angle**は光の広がる角度、**Shaping Focus**はライトのレンズ効果の焦点を定義すると説明されています。ライトのWidth・Heightを変えることとは別の調整です。Shaping Focusの内部的な光の分布や、値による影の変化を実機未確認で決めつけないでください。

## 既存のUSDライトを編集する

外部から読み込んだUSDにライトが含まれる場合は、次の手順で対象を指定します。

1. [uLoader](./uloader)などでライトを含むUSDシーンを読み込みます。
2. uRectangle Lightの**黄色いScene Input**へ接続します。
3. Inspectorの**Override Selection → Pick**を使い、編集対象のライトを選びます。
4. Width、Height、Intensity、Colorなどを調整し、後段のuRendererで結果を確認します。

Pickは編集対象を選ぶ操作で、**すべてのライトを一括して変更する操作ではありません**。読み込んだUSDファイルそのものの上書き保存とも異なります。書き出したい場合は[uExport](./uexport)を確認してください。異なる種類のライトを選んだ場合の変換や編集範囲は、このManual節だけでは保証できません。

## 制作例1：縦長の窓から差し込む光

**目的：** 室内の机や家具を、縦長の窓に相当する場所から照らす。

1. uShapeやuLoaderで室内の物体を用意します。
2. uRectangle Lightを窓に近い位置へ置き、**HeightをWidthより大きく**して縦長の発光面にします。
3. Rotationでライトの面を室内側へ向けます。
4. ColorまたはColor Temperatureで色味を決め、IntensityまたはExposureで明るさを調整します。
5. 物体、カメラ、ライトをuMergeでまとめ、uRendererで表示します。
6. 発光面の縦横比を変えるならWidth・Height、照らす範囲を変えるならShapingを別々に操作します。

これは窓ガラスや太陽光の物理特性を完全に再現する機能ではなく、**窓に似た面光源を配置する構成例**です。影の形や明るさは物体・材質・レンダー条件にも依存します。

## 制作例2：横長のソフトボックスで商品を照らす

**目的：** 商品CGの上方斜めから、大きな長方形の光源で照らす。

1. 商品モデルとuCameraを用意します。
2. uRectangle Lightを商品より斜め上へ置き、**WidthをHeightより大きく**して横長にします。
3. Rotationで発光面を商品に向け、Intensityで明るさを決めます。
4. 光沢を観察し、必要ならSpecular Responseを調整します。
5. 発光面の形と照射範囲を区別して調整し、uRendererで比較します。

追加の補助光には別のuRectangle Lightや[uDome Light](./udome-light)を用意し、uMergeへまとめます。uRectangle Light一つが複数の照明を自動生成するわけではありません。

## 似たUSDライトとの違い

| ノード | 発光面の考え方 | 選ぶ目安 |
| --- | --- | --- |
| **uRectangle Light** | 幅と高さを持つ四角い面 | 窓、長方形ソフトボックス |
| [uDisk Light](./udisk-light) | 円形の平らな面 | 円盤型の照明 |
| [uCylinder Light](./ucylinder-light) | 円柱状の面 | 蛍光管のような光源 |
| [uSphere Light](./usphere-light) | 球形の光源 | 球状の照明 |
| [uDistant Light](./udistant-light) | 遠方から一定方向に来る光 | 太陽のような主光源 |
| [uDome Light](./udome-light) | シーンを囲む環境光 | 周囲からの照明や環境画像 |

四角い発光面を直接設定したいならuRectangle Lightが第一候補です。同じIntensityを入れても、光源の形・位置・材質が違えば同じ結果になるとは限りません。

## 思ったように照らされないとき

| 状況 | 確認すること |
| --- | --- |
| 2D画像が出ない | 出力はUSD。uMergeとuRenderer、カメラへの接続を確認 |
| 物体が暗い | uMergeへライトが届いているか、Rotationが物体を向くか、Intensity・Exposureを確認 |
| Width・Heightの効果が分かりにくい | 発光面の方向、Scale、材質、Rendererを一つずつ切り分ける |
| 照射範囲が広すぎる／狭すぎる | Shaping Cone Angle、Shaping Focus、位置と向きを確認 |
| 色温度を変えても色が変わらない | EnableとColor、材質側の設定を確認 |
| 光沢への寄与が見えない | Specular Responseと物体側の反射設定を確認 |
| 読み込んだライトを変更できない | Scene InputとOverride Selection / Pickの対象を確認 |
| サイズを変えると明るさが変わる | NormalizeのON／OFFを同条件で比較 |
| Classic 3Dとつながらない | USDとClassic 3Dは別のデータ形式。uMerge / uRendererへそろえる |

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 121「USD Nodes」、**pp.2936–2938（uRectangle Light）、pp.2945–2946（USD共通Transform）**。配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

Manualで確認したのは黄色のScene Input、Override Selection / Pick、Controls一覧、Width・Height、Shapingと共通Transformです。**p.2937のControls Tab冒頭にはuDome lightと記載されていますが、該当節の見出しと図はuRectangle Lightです。**この不一致を別ノードの仕様としては解釈せず、uRectangle Lightの節に列挙された設定を記載しています。

制作例は資料にある機能を組み合わせた運用例であり、実機でレンダー結果を検証したものではありません。**出力端子の厳密なUI表示名、Width・Heightとワールド寸法の換算、Scaleとの合成、Shaping FocusやNormalizeの内部計算、Edition差**は未確認です。よってverificationはpartialのままにしています。
