---
title: 有効領域（Domain of Definition）
description: Imageの出力サイズと実際にデータを持つ範囲を区別し、DoDの表示・計算・RoIとの違いを理解する。
doc_type: concept
term_id: domain-of-definition
term_short: Image内で有効なデータがあると扱う矩形領域。画面のサイズやViewerの計算範囲とは別。
verification: partial
aliases: [DoD, Domain of Definition, 有効領域, image domain]
concepts: [domain-of-definition, region-of-interest, image-extent]
nodes: [Transform, Resize, Auto Domain, Set Domain, Set Canvas Color, Blur]
tasks: [debug, transform, resize, performance]
prerequisites: [resolution]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# 有効領域（Domain of Definition）

Fusionで画像を右へ動かすと、一部が画面の外へ出ます。しかし、**画面に表示されなくなった部分が、その時点で消去されたとは限りません**。どの範囲に画像データが存在するかを区別するための情報が、**Domain of Definition（DoD、有効領域）**です。

DoDを理解すると、「Transformで戻したのに端が欠ける」「文字の周りをぼかすと途中で切れる」「小さなCG素材なのに全画面を処理している」といった問題を切り分けやすくなります。

## 画像のサイズ・DoD・RoIは別のもの

まず、2D <Term id="image">Image</Term>を扱うときの4つの範囲を分けます。

| 用語 | 何を表すか | 例 |
| --- | --- | --- |
| **Raster / Frame** | 出力する画像の幅と高さ | 1920×1080ピクセル |
| **Canvas** | Imageを配置する作業空間。DoDの外にも、背景として扱う色やAlphaの値がある | 透明な黒を背景として扱う |
| **DoD（Domain of Definition）** | 有効な画像データを含む範囲を囲う矩形 | フレーム中央のタイトルを囲む範囲 |
| **RoI（Region of Interest）** | Viewerが現在計算を要求する範囲 | 拡大表示中の画面右下だけを更新する |

たとえば、1920×1080の透明なフレームに「HELLO」と表示したText+を考えます。出力のRasterは1920×1080でも、DoDは文字の周囲だけになることがあります。Fusionは、その文字と無関係な広い領域を処理せずに済みます。

~~~text
1920×1080 のRaster / Frame
┌──────────────────────────────────┐
│                                  │
│       ┌───────────────┐          │
│       │     HELLO     │ ← DoD    │
│       └───────────────┘          │
│                                  │
└──────────────────────────────────┘
~~~

**DoDは白黒のMaskやAlphaの輪郭そのものではありません。** 画像データが存在する範囲を、軸に平行な矩形（bounding box）で表します。円形の素材でもDoDは円にはならず、円を囲む四角になります。矩形の内側に透明なピクセルが含まれる場合もあります。

## DoDがある理由

### 必要な範囲だけ計算できる

Text+、Mask、透過CG素材などでは、実際の内容がフレームの一部にしかないことがあります。DoDが適切なら、後段の処理が関係のない領域まで計算する必要を減らせます。高解像度の素材や処理の重いGraphでは、処理時間やメモリ使用量にも影響します。

### 画面外へ移動した画像も扱える

DoDは、現在の表示フレームの幅・高さと常に一致する必要はありません。Fusionでは、表示範囲の外側にあるデータを後段の処理が参照できる場合があります。

ただし、**一度Cropや各Nodeのclippingで失われたピクセルがDoDだけで復元されるわけではありません**。DoDはデータの存在範囲を示す情報であり、消えたピクセルを生成する機能ではありません。

## ViewerでDoDを確認する

1. 確認したいNodeをViewerに表示します。
2. Viewer内で右クリックし、**Region > Show DoD**を選びます。
3. 画像の外枠と、DoDを示す矩形を比較します。
4. 同じ表示設定のまま、前後のNodeをViewerへ出して矩形がどう変わるか確認します。

DaVinci Resolve 21.1の公式マニュアルでは、**DoDがフレームサイズと異なる場合、Node EditorでNodeにポインターを重ねたときのtooltipにもDoDが表示される**と説明されています。Viewerの表示と併せて確認できます。

DoDの矩形は通常、Nodeが自動計算します。TransformやMaskなどを通ると、位置が動いたり、広がったり、小さくなったりすることがあります。同じGraphの中でも、すべてのNodeのDoDが一致するわけではありません。

## 実例1：Text+をぼかして端が切れるとき

~~~text
Text+ → Blur → Merge → MediaOut
                 ↑
             背景Image
~~~

Text+は透明な画像を出力し、文字を含む範囲だけをDoDにすることがあります。その後にBlurを加えると、文字の外側までぼかしを広げるために、周辺のピクセルも参照する必要があります。

1. Text+とBlurの出力をそれぞれViewerに表示し、DoDを比較します。
2. Blurの輪郭だけが不自然に途切れているなら、[Blur](../../nodes/blur-filter/blur.md)の**Clipping Mode**を確認します。
3. **Frame / Domain / None**は、DoD境界をどのように扱うかの違いです。たとえばDomainは上流DoDを尊重するため、大きいBlurで境界の切れが出る場合があります。
4. 境界の見た目を比較して設定を選びます。DoDを広くすれば必ず速くなるわけではなく、計算範囲との兼ね合いがあります。

ここでは「Blur Sizeの不足」と「DoD境界でぼけが切られていること」を区別するのが目的です。

## 実例2：フレーム外へ移動して戻す

~~~text
Image → Transform A（外へ移動）→ Transform B（戻す）→ Output
~~~

Aの出力がViewerに見えなくても、後段Bで戻せる場合があります。AとBの間で実際のデータが保持されているためです。

一方、途中でCropなどが画像を切り落としていた場合、Bの位置を戻してもその部分は復元できません。原因を調べるときは、まず**最後に正常だったNodeと、最初に欠けたNode**を探し、DoDとフレームサイズを確認します。

「フレーム外にある」「DoDが変わった」「ピクセルが切り落とされた」は同じ状態ではありません。各Nodeの動作は個別のReferenceを確認してください。

## RoIは『どこを計算して表示するか』を決める

**Region of Interest（RoI）**はDoDに似た矩形ですが、目的が違います。DoDが画像データのある範囲を示すのに対し、RoIはViewerが今回必要としている領域を示します。Fusionは両者を組み合わせ、実際に更新するピクセルの範囲を決めます。

たとえば4Kの映像を合成していて、画面右下の小さな傷だけをPaintで修正する場合、ViewerのRoIを右下へ絞ると、その部分のプレビューを効率よく更新できます。

### ViewerでRoIを設定する

1. 2D Viewerの**RoIボタン**を使うか、Viewerを右クリックして**Region > Show Region**を選びます。
2. 表示された矩形の辺・角をドラッグして大きさを調整します。左上の小さな円から矩形を移動できます。
3. 新しい矩形を描く場合は**Region > Set Region**、表示中の拡大範囲に合わせる場合は**Region > Auto Region**を使います。
4. 全画面へ戻す場合は**Region > Reset Region**、またはRoIを無効にします。

**RoIはViewerのプレビュー用です。** ViewerでRoIを狭めても、通常のMediaOutやSaverの出力がその矩形に切り抜かれるわけではありません。一方、当該Viewerで作るFlipbook PreviewはRoIを反映します。

RoI外に以前のピクセルが残って見えることがあります。これは、その領域が新たに計算されていないことによる表示上の状態であり、元データの欠落を意味しません。特に画面サイズや色深度を変えた後は、RoI外がCanvas colorでリセットされる場合があります。

## 実機でDoDとRoIの矩形を見る

DaVinci Resolve Studio 21.1.0.14、Windows、日本語UIで、Text+の文字だけを表示して比較しました。

[![Text1からMediaOut1へ直接接続した実機Node Editor](/img/fusion/captures/S26/graph.png)](/img/fusion/captures/S26/graph.png)

[![Text1の日本語Inspector。文字列DoD、Arial Bold、Size 0.18](/img/fusion/captures/S26/inspector.png)](/img/fusion/captures/S26/inspector.png)

[![左Viewerは文字DoDの通常表示、右Viewerは文字の周囲にDoDの点線矩形と座標を表示](/img/fusion/captures/S26/dod.png)](/img/fusion/captures/S26/dod.png)

左右とも1920×1080、フレーム0、40%で同じText1を表示しています。右だけDoDを表示すると、フレーム全体より小さい文字周辺の矩形を確認できます。この撮影では矩形の座標が左下722,438、右上1203,621と表示されました。

[![右Viewerに文字を囲むDoDの点線と、それと異なる範囲のRoIの白いハンドル付き矩形を同時表示](/img/fusion/captures/S26/roi.png)](/img/fusion/captures/S26/roi.png)

次に右ViewerでRoIを描きました。白いハンドルの付いたRoIは505,287から1005,738、文字に沿う点線はDoDです。両者の範囲は一致していません。RoIの外にも以前の文字が見えているので、この画面を「RoI外のピクセルが消えた」結果としては扱いません。

範囲表示の確認後はDoD表示とRoIを解除し、通常表示へ戻したことを確認しました。処理時間、RoI外の再計算、BlurやCropを通したDoDの変化はこの固定例には含めていません。

[再現用Graph](/img/fusion/captures/S26/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S26/capture.json)

### 実機の参考例：自動検出でフレーム全体と内容の範囲を分ける

<!-- capture-reuse:R85 -->

S50は透明PNGの固定例です。左のLoaderではフレーム全体、右のAuto Domainでは中央の矩形がDoDになります。画像寸法は両方1920×1080のままです。

[![Auto Domainの左・下・右・上がすべて0の実機Inspector](/img/fusion/captures/S50/inspector.png)](/img/fusion/captures/S50/inspector.png)

[![左LoaderのDoDは0,0から1920,1080、右Auto Domainは640,360から1280,720。画像寸法は両方1920×1080](/img/fusion/captures/S50/compare.png)](/img/fusion/captures/S50/compare.png)

Resolve Studio21.1.0.14／Windows、両Viewer Color／40%。静止PNGのみ。動く素材、Canvas color、Mask、性能は未確認。 [再現用Graph](/img/fusion/captures/S50/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S50/capture.json)

### 実機の参考例：DoDを狭めたときの内容欠落

<!-- capture-reuse:R86 -->

S51ではAdjustの四辺0で入力を保ち、Setの右・上0.5でDoDを0,0から960,540へ変えました。寸法が同じでも内容が欠ける例です。

[![Set DomainのAdjust、四辺0、結合モードCopyを示すInspector](/img/fusion/captures/S51/inspector.png)](/img/fusion/captures/S51/inspector.png)

[![Set DomainのSetで左と下0、右と上0.5を示すInspector](/img/fusion/captures/S51/set-half-inspector.png)](/img/fusion/captures/S51/set-half-inspector.png)

[![Setの右・上0.5ではDoDが0,0から960,540となり矩形が欠ける。画像寸法は1920×1080のまま](/img/fusion/captures/S51/set-half.png)](/img/fusion/captures/S51/set-half.png)

Resolve Studio21.1.0.14／Windows、両Viewer Color／40%。Set Domainの固定例。Transformで戻せるか、BlurやCropでの境界は未確認。 [再現用Graph](/img/fusion/captures/S51/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S51/capture.json)

## DoDを調整するNode

通常は自動計算を使いますが、素材の状態によってはDoDを明示的に扱うNodeが有効です。

- **[Auto Domain](../../nodes/time-metadata/auto-domain.md)**：画像の内容とCanvas colorからDoDを自動検出します。透過CGなど、フレームの一部しか内容がない素材を後段で扱うときの候補です。
- **[Set Domain](../../nodes/time-metadata/set-domain.md)**：DoDの範囲を手動で指定・調整したいときに使います。
- **[Set Canvas Color](../../nodes/color/set-canvas-color.md)**：DoDそのものを設定するのではなく、**DoDの外側を何色・どのAlphaとして扱うか**を指定します。

たとえばEditページやMedia Poolから通常のクリップをFusionへ持ち込むと、DoDは画像全体になるのが一般的です。一方、**OpenEXRはdata windowを保存でき、FusionではLoaderがその情報をDoDとして読み、Saverも書き出せます**。既に適切なDoDを持つEXRへ無条件にAuto Domainを追加する必要はありません。

Canvas colorを変更することと、実際のピクセルを書き換えることも別です。背景色を作って合成したいだけなら、[Background](../../nodes/generators/background.md)と[Merge](../../nodes/compositing/merge.md)を使う方が明確な場合があります。

## どこから調べるか

| 症状 | まず見る項目 |
| --- | --- |
| 画像の端が見えない | Transformで外へ動いているだけか、Cropやclippingで失われたか |
| Blurの輪郭が途中で途切れる | BlurのClipping Modeと前段NodeのDoD |
| 画像の余白が黒くなる | DoD外のCanvas colorとAlpha、合成先の背景 |
| 一部だけプレビューが更新される | ViewerのRoIが有効になっていないか |
| 小さな素材でも全フレームを計算している | 元素材のDoDがフルフレームか、Auto Domainが有効な状況か |

解像度そのものが変わっている疑いがある場合は、[解像度 / アスペクト比（Resolution / Aspect）](./resolution-aspect.md)も確認してください。実際の切り分け手順は[Resolution / Domain of Definitionを確認する](../07-debugging/resolution-domain-of-definition.md)で扱います。

## 出典と確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**（September 2026）、Fusion Fundamentals Chapter 68「Using Viewers」pp.1479–1481：DoDとRoIの定義、表示、計算範囲、Viewer操作、RoIと最終出力の違い、OpenEXR data windowを確認。
- 同マニュアル Chapter 92「Blur Nodes」pp.2109–2111：BlurのClipping Mode（Frame / Domain / None）を確認。
- 同マニュアル Chapter 93「Color Nodes」pp.2198–2199：Set Canvas ColorとDoD外のCanvas colorの関係を確認。
- 同マニュアル Chapter 111「Miscellaneous Nodes」pp.2580–2582：Auto Domainの役割を確認。

この記事は**21.1マニュアルに記載された概念と操作**を説明します。個々のNodeの内部計算や現在のruntime REGID、処理時間の改善率、Edition差は実機で追加検証していないため、検証状態をpartialとしています。
