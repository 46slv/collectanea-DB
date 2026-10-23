---
title: "Set Domain"
description: "Imageの物理サイズを変えずに、Domain of Definition（DoD）を明示的に設定・調整するNode。"
doc_type: node
term_id: "set-domain"
term_short: "Set Domainは、ImageのDomain of Definition（DoD）を手動で設定・調整するNode。"
verification: partial
aliases: ["Set Domain", "DOD"]
concepts: ["image-data", "domain-of-definition"]
nodes: ["Set Domain"]
node_family: "time-metadata"
controls: ["Mode", "Left", "Bottom", "Right", "Top"]
inputs: ["image", "image"]
outputs: ["image"]
tasks: ["domain-of-definition", "performance"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Set Domain

Set Domain [DOD]は、2D Imageの**Domain of Definition（DoD）を明示的に設定または調整する**Nodeです。Imageのwidth / heightは変えず、「どの範囲に有効なdataがあると扱うか」だけを変更します。

DoDは、Image内で実際にdataが存在するとFusionが扱う矩形領域です。後段NodeはDoDの外側を処理しないため、適切なDoDを設定すると計算量を減らせる場合があります。DoDそのものの考え方は[有効領域（Domain of Definition）](../../learn/03-space/domain-of-definition.md)を参照してください。

## 何をするNodeか

Set Domainには、DoDを座標で決める**Set**と、現在のDoDを基準に広げたり狭めたりする**Adjust**があります。

- **Set**: Left / Bottom / Right / TopでDoDの境界を直接指定する。
- **Adjust**: 既存DoDの各辺を相対的に移動する。実機では正の値で左・下が内側へ、右・上が外側へ動きました。

Set Domainが変更する中心的な情報はDoDです。retime、metadataの書き換え、bit depth変更を行うNodeではありません。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualでは、2つの2D Image入力が記載されています。

- **Input**（orange / Background）: 必須。DoDを設定・調整したい2D Imageを接続します。
- **Foreground**（green）: 任意。接続すると、Background側ImageのDoDをForeground側ImageのDoDへ置き換えます。
- **Output**: 物理的なImage dimensionsを保ったまま、設定されたDoDを持つ2D Imageを返します。

Foreground入力は、別Imageがすでに持っているDoDを基準として使いたい場合に利用できます。

## 主な設定項目

### Mode

`Set`は境界座標を直接指定し、`Adjust`は入力のDoDから各辺を相対的に動かします。S51の初期状態はAdjust、4項目すべて0でした。0では入力のDoDを保ちます。

Setでは左端・下端を0、右端・上端を1とする座標を使います。左・下0、右・上1ならフレーム全体です。S51では右・上を0.5にすると右上が960,540になり、寸法1920×1080は保ったまま内容が欠けました。

### Left / Bottom

Setでは左端・下端の座標を指定します。Adjustでは、正の値で左端が右へ、下端が上へ動き、負の値でそれぞれ左・下へ広がりました。撮影例の±0.1は、横192px、縦108pxの変化に対応します。

### Right / Top

Setでは右端・上端の座標を指定します。1から0.5へ下げると、右端は左へ、上端は下へ移りました。

Adjustでは、正の値で右端が右へ、上端が上へ広がり、負の値では内側へ狭まりました。左・下と同じ符号で同じ「拡大／縮小」になるわけではありません。

21.1 Manualには、Adjustで正の値はDoDを狭めるとする説明や、SetのRight / Topの座標と増減方向が一致しない説明があります。本ページは下の実機例を基準に、撮影環境で確認した方向を記載しています。

## 実機でAdjustとSetを比べる

Resolve Studio 21.1.0.14、Windows、日本語UIで、透明PNGをAuto Domainへ通してからSet Domainへ接続しました。入力のDoDは640,360から1280,720、画像寸法は1920×1080です。出力フレーム0、両ViewerはColor／40%、RoIは無効です。

[![Loader、AutoDomain1、SetDomain1、MediaOut1の順に接続した実機Graph](/img/fusion/captures/S51/graph.png)](/img/fusion/captures/S51/graph.png)

[![Set DomainのAdjust、四辺0、結合モードCopyを示すInspector](/img/fusion/captures/S51/inspector.png)](/img/fusion/captures/S51/inspector.png)

[![左右ともDoDが640,360から1280,720。Adjustの四辺0で入力のDoDを保つ](/img/fusion/captures/S51/compare.png)](/img/fusion/captures/S51/compare.png)

Adjustの4値が0なら、右ViewerのDoDは左と一致します。runtime REGIDは`SetDomain`です。結合モードはCopyのままで、Foregroundは接続していません。

### Adjustの正負を四辺で比べる

右・上をともに0.1へ、次に−0.1へ変更しました。

[![Set DomainのAdjustで右と上を0.1にしたInspector](/img/fusion/captures/S51/adjust-plus-inspector.png)](/img/fusion/captures/S51/adjust-plus-inspector.png)

[![Adjustの右・上0.1でDoDの右上が1472,828へ広がる](/img/fusion/captures/S51/adjust-plus.png)](/img/fusion/captures/S51/adjust-plus.png)

[![Set DomainのAdjustで右と上をマイナス0.1にしたInspector](/img/fusion/captures/S51/adjust-minus-inspector.png)](/img/fusion/captures/S51/adjust-minus-inspector.png)

[![Adjustの右・上マイナス0.1で右上が1088,612になり、矩形が欠ける](/img/fusion/captures/S51/adjust-minus.png)](/img/fusion/captures/S51/adjust-minus.png)

右上は1472,828へ広がり、負値では1088,612へ狭まりました。次は右・上を0へ戻し、左・下だけを0.1、−0.1へ変更しています。

[![Set DomainのAdjustで左と下を0.1にしたInspector](/img/fusion/captures/S51/left-bottom-plus-inspector.png)](/img/fusion/captures/S51/left-bottom-plus-inspector.png)

[![Adjustの左・下0.1でDoDの左下が832,468へ移り、矩形の左側と下側が欠ける](/img/fusion/captures/S51/left-bottom-plus.png)](/img/fusion/captures/S51/left-bottom-plus.png)

[![Set DomainのAdjustで左と下をマイナス0.1にしたInspector](/img/fusion/captures/S51/left-bottom-minus-inspector.png)](/img/fusion/captures/S51/left-bottom-minus-inspector.png)

[![Adjustの左・下マイナス0.1でDoDの左下が448,252へ広がる](/img/fusion/captures/S51/left-bottom-minus.png)](/img/fusion/captures/S51/left-bottom-minus.png)

左下は正値で832,468へ移り、矩形の左側と下側が欠けました。負値では448,252へ広がります。どの状態でも画像寸法は1920×1080です。

### Setで境界座標を指定する

GUIでSetへ切り替えると、左・下0、右・上1になりました。画像の内容にかかわらず、DoDをフレーム全体へ指定した状態です。

[![Set DomainをSetに切り替え、左と下0、右と上1を示すInspector](/img/fusion/captures/S51/set-full-inspector.png)](/img/fusion/captures/S51/set-full-inspector.png)

[![Setの右・上1では、右ViewerのDoDは0,0から1920,1080。画像内容は中央の矩形のまま](/img/fusion/captures/S51/set-full.png)](/img/fusion/captures/S51/set-full.png)

[![Set DomainのSetで左と下0、右と上0.5を示すInspector](/img/fusion/captures/S51/set-half-inspector.png)](/img/fusion/captures/S51/set-half-inspector.png)

[![Setの右・上0.5ではDoDが0,0から960,540となり矩形が欠ける。画像寸法は1920×1080のまま](/img/fusion/captures/S51/set-half.png)](/img/fusion/captures/S51/set-half.png)

右・上を0.5にすると、DoDは0,0から960,540になり、オレンジ矩形の一部が欠けました。出力比較の画像ではMediaOutを選択して、Set Domain選択中に重なる赤い操作ガイドを外しています。元の画像は撮影条件から確認できます。

最後はAdjust、四辺0、Set側の右・上1へ戻し、DoD表示とRoIを解除して保存しました。ForegroundからのDoD参照、他の結合モード、後段BlurやCrop、性能、Free editionや他OSは未確認です。

[再現用Graph](/img/fusion/captures/S51/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S51/capture.json)

## 主な用途

### 処理する範囲を明示的に限定する

有効なpixelがframeの一部にしかないことが分かっている場合、Set DomainでDoDをその範囲へ合わせると、後段の重い処理が不要な領域まで計算するのを避けられます。

```text
Image → Set Domain → Blur / Color / other downstream node
```

Set Domain自体はImageをCropしません。width / heightはそのままで、Fusionが有効dataとして扱う範囲を指定します。

### 既存DoDを少し広げる / 狭める

すでにDoDを持つImageで、境界だけを調整したい場合はAdjustを使います。

撮影環境では、余白を広げるには左・下を負、右・上を正へ動かしました。狭める際はその逆です。必要な内容が欠けない範囲で、各辺をViewerで確認します。

### 別ImageのDoDを使う

Foregroundへ2D Imageを接続すると、そのImageのDoDをBackground側へ適用できます。

```text
Image A ──(orange Input)──────┐
Image B ──(green Foreground)──┴→ Set Domain → Result
```

Image AのDoDを、Image Bが持つDoDへ揃えたい構成で使えます。

## DoDを確認する

Viewerで右クリックし、`Region > Show DoD`を有効にすると現在のDoDを表示できます。

frame sizeとDoDが異なる場合は、Node EditorでNodeへpointerを置いたときのtooltipにもDoDが表示されます。Set / Adjustの変更前後を比較すると、Image dimensionsを変えずにDoDだけが変化していることを確認できます。

## Auto Domainとの違い

- **[Auto Domain](./auto-domain.md)**: Image内容とCanvas colorを調べ、frameごとにDoDを自動計算する。
- **Set Domain**: DoDを数値で明示的に設定・相対調整する。または別ImageのDoDをForegroundから受け取る。

contentの範囲へ自動追従させたい場合はAuto Domain、固定範囲や既存DoDからの調整が必要な場合はSet Domainが向いています。

## 注意点

- Set DomainはImageのwidth / heightを変更しません。[Crop](../transform/crop.md)やResizeとは役割が異なります。
- DoDを必要以上に狭くすると、その外側は後段Nodeの処理対象になりません。Viewerの`Show DoD`で意図した範囲になっているか確認します。
- DoDとRegion of Interest（RoI）は別の概念です。DoDは「Imageにdataがある範囲」、RoIは「今回renderを要求する範囲」を表します。
- S51で確認したREGIDと境界の方向は撮影環境のものです。Effects Library上の表示、edition差、他環境の動作は未確認です。

## 関連する考え方

- [有効領域（Domain of Definition）](../../learn/03-space/domain-of-definition.md)
- [Resolution / Domain of Definitionを確認する](../../learn/07-debugging/resolution-domain-of-definition.md)

## 関連Node

- [Auto Domain](./auto-domain.md): Image内容からDoDを自動設定する。
- [Crop](../transform/crop.md): Image領域を切り出す。DoDだけを設定するSet Domainとは目的が異なる。
- [Time / Metadata / Utility Family Overview](./index.md)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 111「Miscellaneous Nodes」の`Set Domain [DOD]`（pp.2602–2604）と、Fusion Fundamentals Chapter 68「Using Viewers」のDomain of Definition / Region of Interest説明（pp.1479–1480）を基準にしています。

確認した項目は、Image dimensionsを変更しないこと、Background / Foregroundの2入力、`Set` / `Adjust`、`Left` / `Bottom` / `Right` / `Top`、DoD外を後段Nodeが処理しないこと、ViewerでのDoD表示です。

S51では、Adjustの四辺0と正負、Setのフルフレームと右・上0.5、画像寸法を実機確認しました。ManualのAdjustに関する一律の符号説明とは一致しないため、辺ごとの方向を本文に記載しています。Foreground、他の結合モード、後段処理、性能、版別の差は未確認のため、`verification: partial`を維持します。
