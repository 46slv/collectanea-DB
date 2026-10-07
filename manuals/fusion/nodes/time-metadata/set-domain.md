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
- **Adjust**: 既存DoDの各辺を相対的に移動する。正の値でDoDを狭め、負の値で外側へ広げる。

Set Domainが変更する中心的な情報はDoDです。retime、metadataの書き換え、bit depth変更を行うNodeではありません。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualでは、2つの2D Image入力が記載されています。

- **Input**（orange / Background）: 必須。DoDを設定・調整したい2D Imageを接続します。
- **Foreground**（green）: 任意。接続すると、Background側ImageのDoDをForeground側ImageのDoDへ置き換えます。
- **Output**: 物理的なImage dimensionsを保ったまま、設定されたDoDを持つ2D Imageを返します。

Foreground入力は、別Imageがすでに持っているDoDを基準として使いたい場合に利用できます。

## 主な設定項目

### Mode

`Set`と`Adjust`を切り替えます。

**Set**では、Image左端 / 下端を0、右端 / 上端を1とする正規化座標でDoDを指定します。初期状態はImage全体です。

```text
Left   = 0
Bottom = 0
Right  = 1
Top    = 1
```

**Adjust**では、4つの値が0の状態で現在のDoDを維持します。正の値は対応する辺を内側へ動かしてDoDを狭め、負の値は外側へ動かしてDoDを広げます。

### Left

DoDの左端を決めます。

Setでは値を上げるほど左端が右へ移動し、左側のdataをDoDから外します。既定値は0です。

### Bottom

DoDの下端を決めます。

Setでは値を上げるほど下端が上へ移動し、下側のdataをDoDから外します。既定値は0です。

### Right

DoDの右端を決めます。

21.1 Manualでは、Set modeの座標scaleについて「0がImage左端、1が右端、既定値は1」と記載されています。一方、同じControlの説明には「値を上げるほど右端が左へ移動する」とあり、座標scaleの説明と増減方向の説明が一致しません。

そのため、Set modeで右端を狭める際の値の増減方向は実機確認前に断定しません。ViewerでDoDを表示し、境界の動きを確認しながら調整してください。

Adjust modeについては、Manualが「正の値でDoDを狭め、負の値で広げる」と明記しています。Rightへ正の値を入れると右端側からDoDを狭めます。

### Top

DoDの上端を決めます。

21.1 Manualでは、Set modeの座標scaleについて「0がImage下端、1が上端、既定値は1」と記載されています。一方、同じControlの説明には「値を上げるほど上端が下へ移動する」とあり、座標scaleの説明と増減方向の説明が一致しません。

そのため、Set modeで上端を狭める際の値の増減方向は実機確認前に断定しません。ViewerでDoDを表示し、境界の動きを確認しながら調整してください。

Adjust modeについては、Manualが「正の値でDoDを狭め、負の値で広げる」と明記しています。Topへ正の値を入れると上端側からDoDを狭めます。

## 主な用途

### 処理する範囲を明示的に限定する

有効なpixelがframeの一部にしかないことが分かっている場合、Set DomainでDoDをその範囲へ合わせると、後段の重い処理が不要な領域まで計算するのを避けられます。

```text
Image → Set Domain → Blur / Color / other downstream node
```

Set Domain自体はImageをCropしません。width / heightはそのままで、Fusionが有効dataとして扱う範囲を指定します。

### 既存DoDを少し広げる / 狭める

すでにDoDを持つImageで、境界だけを調整したい場合はAdjustを使います。

たとえば後段処理に必要な余白を確保したい場合は負の値でDoDを広げ、不要な外周を処理対象から外したい場合は正の値で狭められます。

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
- runtime REGID、Effects Library上のcurrent表示、edition差は、このページの確認範囲では断定していません。

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

`Right` / `Top`は、21.1 Manual内でSet modeの座標scale説明と値を増やしたときの移動方向が一致していません。このページでは一方を推測で採用せず、Set modeの増減方向を実機確認待ちとして扱います。Adjust modeの「正の値でDoDを狭め、負の値で広げる」はManual本文に明記されているため、その説明は維持しています。

runtime REGID、Effects Library上のcurrent表示、edition差、`Right` / `Top`のSet modeにおける実機上の増減方向は別verification対象として残しているため、`verification: partial`を維持しています。
