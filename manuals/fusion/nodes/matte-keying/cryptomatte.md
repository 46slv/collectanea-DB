---
title: "Cryptomatte"
description: "3D render EXRに埋め込まれたobject / material IDを読み、選んだ要素のmatteを取り出すStudio限定Node。"
doc_type: node
term_id: "cryptomatte"
term_short: "Cryptomatteは、3D render EXRのobject / material IDから選択した要素のmatteを取り出すNode。"
verification: partial
aliases: ["Cryptomatte", "Cry"]
concepts: ["image-data", "alpha"]
nodes: ["Cryptomatte"]
node_family: "matte-keying"
controls: ["View Layer", "View Mode", "Select Matte", "Selected Matte List", "Expression", "Matte Layers"]
inputs: ["image"]
outputs: ["image"]
tasks: ["create-matte"]
level: intermediate
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Cryptomatte

Cryptomatteは、3D rendererがEXRへ埋め込んだobject / material IDを読み、Viewerで選んだ要素だけのmatteを取り出すFusion Studio限定Nodeです。

green / blue screenの色を抜いたり、手作業で輪郭を描いたりするのではなく、render時に記録されたIDを使います。3D renderから「このobjectだけ」「このmaterialだけ」を後から選び、color correctionやcompositeの処理範囲を分けたい場合に使います。

## 何を手掛かりにmatteを作るか

Cryptomatte対応のrenderでは、EXR内にobjectやmaterialを識別するIDが埋め込まれています。Cryptomatte NodeはそのIDを読み、Viewerまたはlistから選んだ要素をmatteとして出力します。

見た目が似た色でも別IDなら分けて選べます。反対に、通常の撮影素材やCryptomatte情報を持たないEXRから、見た目だけを解析してmatteを作るNodeではありません。

## 入力

Node Editor上の入力は1つです。

### Input

オレンジ色のInputへ、Cryptomatte情報を埋め込んだ2D EXR Imageを接続します。

source EXRに対応するmatte layerが含まれていなければ、object / materialを選択できません。3D renderer側で必要なID matteがEXRへ出力されていることが前提です。

## 出力とView Mode

Cryptomatteは2D Imageを出力し、**View ModeによってNodeの出力内容自体が変わります**。

- **Colors** — layer内のIDを別々の色で表示
- **Edges** — source EXR上へmatte境界を重ねて表示
- **Beauty** — source EXRを表示
- **Matte** — 選択したmatteを白黒Imageとして出力

ManualではViewerだけの表示切り替えではなく、Cryptomatte toolのoutputを変更するControlとして説明されています。後段へmatteを渡す場合は、View Modeが意図した状態か確認します。

## View Layer

**View Layer**では、どのCryptomatte layer / matte typeから選ぶかを切り替えます。ManualではObject、Material等が例として挙げられています。

同じsceneでも、object単位で全体を選ぶのか、material単位で一部分だけを選ぶのかで参照するlayerが変わります。

## matteを選ぶ

### Select Matte

**Pick**を使うとmatte listが開き、click-and-dragやCmd / Control-clickで複数のmatteを選択できます。

Viewer側の選択Controlでは、eyedropper cursorを使ってmatteを追加または除外できます。名前が分かっている対象はlist、画面上で見ながら選ぶ場合はViewerから選べます。

### Selected Matte List

選択したmatteは**Selected Matte List**へ表示され、Viewer上では選択範囲がyellowでhighlightされます。

- **Clear** — 選択中のmatteを削除
- **Clear All** — Selected Matte Listをすべて削除
- **Clear Selected Layer** — 現在のlayerに属するmatteをまとめて削除

複数objectや複数materialを1つの処理範囲として扱いたい場合は、必要なmatteを複数選択できます。

## ExpressionとMatte Layers

**Expression** fieldにはregular expressionを入力でき、tool内のlayer選択に使えます。

**Matte Layers**では、対象範囲をSelected / View / Allから切り替えます。

具体的なlayer名や命名規則はsource EXRを生成したrendererとscene設定に依存するため、このページでは特定rendererの名前を共通仕様として固定しません。

## 主な用途

- 3D render後に特定objectだけを選び、色や明るさを個別調整する
- material IDを使い、塗装、glass、metal等の処理範囲を分ける
- 複数object / materialをまとめて1つのmatteとして扱う
- rotoを描き直さず、render時に埋め込んだIDをcompositeの選択範囲に使う

## 基本的な使い方

1. Cryptomatte情報を含むEXRをInputへ接続します。
2. View ModeをColorsまたはEdgesへ切り替え、IDが入っているか確認します。
3. View LayerでObjectまたはMaterial等、目的に合うmatte typeを選びます。
4. PickのlistまたはViewerから対象を選択します。
5. Selected Matte Listで選択内容を確認します。
6. View ModeをMatteへ切り替え、必要な領域がwhite、その他がblackになっているか確認します。
7. そのmatteを後段のcomposite処理へ渡します。

    EXR source → Cryptomatte → matteを使う後段処理

## Keyerとの違い

[Delta Keyer](./delta-keyer)や[Chroma Keyer](./chroma-keyer)はpixelの色を手掛かりにforeground / backgroundを分離します。Cryptomatteはrender IDを手掛かりに選択するため、green / blue screen素材を抜く用途とは仕組みが異なります。

撮影素材に対して人物を自動認識してmaskを作るNodeでもありません。3D render由来のID選択が目的です。

## 注意点

- Fusion Studio限定です。
- InputはCryptomatte情報を含む2D EXRを前提とします。
- source EXRに必要なlayer / IDがなければ、Node側だけでは復元できません。
- View Modeはoutputを変更するため、後段へ接続した状態では設定を確認します。

## 関連Node

- [Delta Keyer](./delta-keyer) — green / blue screenの色差からAlphaを作る
- [Chroma Keyer](./chroma-keyer) — 任意の色域からmatteを作る
- [Luma Keyer](./luma-keyer) — luminanceやchannel値からmatteを作る
- [Matte Control](./matte-control) — 作成済みAlphaやmatteを後段で整理する

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 109 Matte Nodes pp.2514–2515で、CryptomatteがFusion Studio限定であること、2D EXRの1入力、embedded mattes / encoded IDs、View Layer、View Mode、Select Matte、Selected Matte List、Expression、Matte Layersを確認しています。

このページではManualで確認できないruntime REGID、renderer固有のlayer命名、Cryptomatte manifestの内部表現、実機上の処理性能は断定していません。
