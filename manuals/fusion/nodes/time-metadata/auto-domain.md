---
title: "Auto Domain"
description: "ImageのCanvas colorから有効領域（DoD）を自動検出し、frameごとに処理範囲を絞るNode。"
doc_type: node
term_id: "auto-domain"
term_short: "Auto Domainは、Image内容からDomain of Definition（DoD）を自動設定するNode。"
verification: partial
aliases: ["Auto Domain", "ADoD"]
concepts: ["image-data", "domain-of-definition"]
nodes: ["Auto Domain"]
node_family: "time-metadata"
controls: ["Left", "Bottom", "Right", "Top"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["domain-of-definition", "performance"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# Auto Domain

Auto Domain [ADoD]は、入力Imageの**背景Canvas colorと異なるpixelが存在する範囲を調べ、Domain of Definition（DoD）を自動設定する**Nodeです。Imageそのもののwidth / heightは変えず、「実際にdataがあるとみなす矩形領域」だけを調整します。

DoDは、FusionがImage全体ではなく必要な範囲だけを処理するために使う有効領域です。詳しくは[有効領域（Domain of Definition）](../../learn/03-space/domain-of-definition.md)を参照してください。

## 何をするNodeか

たとえば、透明背景にCG characterだけが置かれたImageでは、characterが占める範囲はframe全体よりかなり小さくなることがあります。

Auto Domainは入力ImageをCanvas colorと比較し、characterなど実際の内容を含む範囲を矩形のDoDとして設定します。characterがcameraへ近づくなどして占有範囲が変われば、DoDもframeごとに更新されます。

```text
大きなframeのImage
┌────────────────────────────┐
│                            │
│        ┌──────────┐        │
│        │  content │        │
│        └──────────┘        │
│                            │
└────────────────────────────┘

          ↓ Auto Domain

DoD = contentを含む矩形領域
```

この処理はCropとは異なります。Auto Domainを通してもImageの物理的なdimensionsは変わりません。後段Nodeが処理対象とする有効領域を狭めることで、重い処理の計算量やmemory使用量を減らせる場合があります。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualでは、次の接続が記載されています。

- **Input**（orange）: DoDを自動検出したい2D Image。
- **Effect Mask**（blue）: Mask shapeを接続する入力。
- **Output**: Image dimensionsを保ったまま、計算されたDoDを持つ2D Image。

ManualのAuto Domain節にはEffect Maskの端子が記載されていますが、その説明文には他Node由来と思われる`blur`表現も含まれます。そのため、このページでは**Effect Maskが存在すること**までは記載し、DoD計算へどう作用するかの詳細は実機確認前に断定しません。

## Canvas colorとDoDの関係

Auto Domainは、入力Imageの背景にあたる**Canvas color**を基準に内容の範囲を探します。

Canvas colorを別途設定していない場合、21.1 Manualでは既定のCanvas colorはblackと説明されています。premultiplied Alphaを持つImageでは、この既定状態で扱いやすいケースがあります。

一方、Alpha channelがなく、characterやrender passがsolid background上にある素材では、先に[Set Canvas Color](../color/set-canvas-color.md)で「背景として扱うcolor」とsolid Alphaを設定してからAuto Domainへ渡す構成が使えます。

```text
Alphaあり / premultiplied Image
Image ─────────────────→ Auto Domain → Result

Alphaなし / solid backgroundのImage
Image → Set Canvas Color → Auto Domain → Result
```

たとえばblack背景上のspecular passやshadow passなら、Set Canvas ColorでblackをCanvasとして定義してからAuto Domainへ渡すことで、背景ではなく実際のrender内容を含む範囲へDoDを絞れます。

## 主な設定項目

21.1 Manualでは、Left / Bottom / Right / Topを内容の探索範囲として説明し、Right / Topの既定値を1としています。ただし、撮影したResolve Studio 21.1.0.14では4項目とも初期値が0で、検出済みDoDの境界を相対的に動かしました。Manualの説明と、この環境で見えた動作を分けて扱います。

### Left / Bottom

Manualでは、Leftを増やすと左端が右へ、Bottomを増やすと下端が上へ動くと説明されています。S50では両方を0のままにしており、この2項目の増減は未確認です。

### Right / Top

この実機例では、Rightを0から0.1にすると右端が右へ広がり、−0.1では左へ狭まりました。Topも、0.1では上へ広がり、−0.1では下へ狭まります。変化量は入力フレームの幅・高さを基準とし、1920×1080の例で0.1は横192px、縦108pxに対応しました。

DoDを内容より狭くすると、その外側の矩形がViewerから欠けます。値の符号だけで判断せず、DoD表示と画像内容を確認してください。

## 実機で自動検出と境界の変化を見る

Resolve Studio 21.1.0.14、Windows、日本語UIで、1920×1080の透明PNGにオレンジの矩形を置きました。矩形は左下640,360から右上1280,720の範囲です。出力フレーム0、両ViewerはColor／40%、RoIは無効にしています。

[![透明PNGをLoaderからAutoDomain1、MediaOut1へ接続した実機Node Editor](/img/fusion/captures/S50/graph.png)](/img/fusion/captures/S50/graph.png)

[![Auto Domainの左・下・右・上がすべて0の実機Inspector](/img/fusion/captures/S50/inspector.png)](/img/fusion/captures/S50/inspector.png)

[![左LoaderのDoDは0,0から1920,1080、右Auto Domainは640,360から1280,720。画像寸法は両方1920×1080](/img/fusion/captures/S50/compare.png)](/img/fusion/captures/S50/compare.png)

左のLoaderはフレーム全体のDoD、右のAuto Domainは矩形を囲むDoDになりました。点線枠と座標が変わっても、画像情報は両方とも1920×1080のままです。runtime REGIDは`AutoDomain`でした。

まず「右」をGUIで0.1へ変更し、続いて−0.1と比較しました。

[![Auto Domainの右を0.1にしたInspector](/img/fusion/captures/S50/right-plus-inspector.png)](/img/fusion/captures/S50/right-plus-inspector.png)

[![右0.1でDoDの右端が1280から1472へ広がり、オレンジ矩形の外にも点線枠がある](/img/fusion/captures/S50/right-plus.png)](/img/fusion/captures/S50/right-plus.png)

[![Auto Domainの右をマイナス0.1にしたInspector](/img/fusion/captures/S50/right-minus-inspector.png)](/img/fusion/captures/S50/right-minus-inspector.png)

[![右マイナス0.1でDoDの右端が1088になり、矩形の右側が欠ける](/img/fusion/captures/S50/right-minus.png)](/img/fusion/captures/S50/right-minus.png)

0.1では右端が1472へ広がり、−0.1では1088へ狭まりました。後者では矩形の右側も欠けています。左端640と下端360は変えていません。

右を0へ戻し、今度は「上」を0.1、−0.1へ変更しました。

[![Auto Domainの上を0.1にしたInspector](/img/fusion/captures/S50/top-plus-inspector.png)](/img/fusion/captures/S50/top-plus-inspector.png)

[![上0.1でDoDの上端が720から828へ広がる](/img/fusion/captures/S50/top-plus.png)](/img/fusion/captures/S50/top-plus.png)

[![Auto Domainの上をマイナス0.1にしたInspector](/img/fusion/captures/S50/top-minus-inspector.png)](/img/fusion/captures/S50/top-minus-inspector.png)

[![上マイナス0.1でDoDの上端が612になり、矩形の上側が欠ける](/img/fusion/captures/S50/top-minus.png)](/img/fusion/captures/S50/top-minus.png)

上端は720から828、612へ変わりました。最後は4項目を0へ戻し、DoD表示とRoIを解除して保存しています。これは静止PNGの固定例です。動く素材への追従、Canvas colorの変更、Mask、左・下の増減、処理時間、Free editionや他OSは未確認です。

[再現用Graph](/img/fusion/captures/S50/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S50/capture.json)

## 主な用途

### CG characterやelementの処理範囲を自動で絞る

frame全体に対して小さいCG elementを処理するとき、contentを含む範囲だけをDoDにして後段の計算範囲を減らします。

```text
CG pass → Auto Domain → Blur / Color / composite
```

特に高解像度素材や重い後段処理では、不要な背景領域まで毎回計算しない構成にできます。

### frameごとに大きさが変わるelementへ追従する

被写体が移動・拡大してcontentのboundsが変化する素材でも、Auto Domainは各frameの内容からDoDを再計算します。

手動で固定DoDを決めるより、動くelementへ合わせて有効領域を変えたい場合に向いています。

### DoDを持たない素材を最適化する

OpenEXRはdata windowをDoDとして保持でき、FusionはLoader / Saverでその情報を扱えます。一方、ResolveのEdit page timelineやMedia Poolから来る一般的なclipでは、DoDがsource frame全体になることがあります。

すでに適切なDoDを持つEXRならAuto Domainが不要な場合があります。DoDがframe全体の素材で、実際のcontentが一部にしかない場合にAuto Domainを検討します。

## 最小構成

premultiplied Alphaを持つImageなら、まず次の構成でDoDが変わるか確認できます。

```text
MediaIn / Loader → Auto Domain → Viewer / 後段Effect
```

Viewerで右クリックし、`Region > Show DoD`を有効にすると、frame全体とDoDの違いを確認できます。

## Auto DomainとSet Domainの違い

- **Auto Domain**: Image内容とCanvas colorからDoDを自動検出する。
- **[Set Domain](./set-domain.md)**: DoDの範囲を手動で設定・調整する。別ImageのDoDをForegroundから受け取ることもできる。

contentのboundsへ自動追従させたいならAuto Domain、明示的な範囲や既存DoDからの相対調整が必要ならSet Domainを選びます。

## 注意点

- Auto DomainはImageのwidth / heightを変更しません。解像度変更やCropの代替ではありません。
- Canvas colorの設定が素材と合っていないと、意図したcontent boundsを検出できない可能性があります。
- すでに適切なDoDを持つ素材では、追加する意味が小さい場合があります。
- DoDは「Imageに有効dataがある範囲」、Region of Interest（RoI）は「今回renderを要求する範囲」で別の概念です。
- S50で確認したREGIDと境界の変化は撮影環境のものです。Effects Library上の表示、edition差、Maskの作用は未確認です。

## 関連する考え方

- [有効領域（Domain of Definition）](../../learn/03-space/domain-of-definition.md)
- [Resolution / Domain of Definitionを確認する](../../learn/07-debugging/resolution-domain-of-definition.md)

## 関連Node

- [Set Domain](./set-domain.md): DoDを明示的に設定・調整する。
- [Set Canvas Color](../color/set-canvas-color.md): DoD外として扱うCanvas color / Alphaを定義する。
- [Time / Metadata / Utility Family Overview](./index.md)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 111「Miscellaneous Nodes」の`Auto Domain [ADoD]`（pp.2580–2582）と、Fusion Fundamentals Chapter 68「Using Viewers」のDomain of Definition説明（pp.1479–1480）を基準にしています。

確認した項目は、Canvas colorを基準にしたDoDの自動計算、Image dimensionsを変更しないこと、frameごとの更新、Input / Effect Mask、`Left` / `Bottom` / `Right` / `Top`、Set Canvas Colorを使う構成、OpenEXRと一般clipのDoDの扱いです。

S50では、初期値、DoDの自動検出、Right / Topの正負による境界の変化と画像寸法を実機確認しました。ManualのRight / Topの既定値・増減方向とは一致しないため、本文に環境と値を明記しています。動く素材、Canvas color、Mask、左・下、性能、版別の差は未確認のため、`verification: partial`を維持します。
