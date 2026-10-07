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

通常はAuto DomainがDoDを自動計算しますが、InspectorのControls tabで**探索する矩形範囲**を制限できます。

### Left

探索範囲の左端です。値を上げるほど左側を除外し、境界が右へ移動します。

21.1 Manualでは0がImage左端、1が右端で、defaultは0です。

### Bottom

探索範囲の下端です。値を上げるほど下側を除外し、境界が上へ移動します。

0がImage下端、1が上端で、defaultは0です。

### Right

探索範囲の右端です。値を下げる方向へ右側を除外できます。

0がImage左端、1が右端で、defaultは1です。

### Top

探索範囲の上端です。値を下げる方向へ上側を除外できます。

0がImage下端、1が上端で、defaultは1です。

Left / Bottom / Right / TopはImageをCropするControlsではなく、Auto Domainが内容を探す範囲を決めるためのControlsです。

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
- runtime REGID、Effects Library上のcurrent表示、edition差、Effect MaskがDoD計算へ与えるexactな挙動は、このページの確認範囲では断定していません。

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

runtime REGID、Effects Library上のcurrent表示、edition差、Effect MaskのDoD計算に対するexactな挙動は別verification対象として残しているため、`verification: partial`を維持しています。
