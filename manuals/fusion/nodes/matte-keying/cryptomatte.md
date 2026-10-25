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
updated: "2026-10-25"
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

## 選択するlayerと出力するmatteを区別する

**View Layer**は、ObjectやMaterialなど、Pickで選べるIDの種類を決めます。**Selected Matte List**には現在選択している対象が並び、**Matte Layers**はSelected / View / Allで対象layerの範囲を切り替えます。選択内容を整理したい場合、Clearは選択項目、Clear Selected Layerは現在のlayer、Clear Allはlist全体を消す操作です。

**View Mode**はこの3つと別の設定です。ColorsはIDの色分け、Edgesは元画像に重ねた境界、Beautyは元画像を出力します。後段へ白黒matteを渡したいときは**Matte**を選んでください。ColorsやEdgesで対象が表示されても、その表示がそのまま白黒の処理Maskになるわけではありません。

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

### 運用例：3Dレンダーの車体だけ色を変える

ObjectとMaterialのCryptomatte情報を含むEXRから、車体だけを色補正する構成案です。たとえば車体とホイールが別Object IDを持つレンダーなら、車体のIDだけを選び、ホイールには補正を掛けない範囲を作れます。

```text
EXR（Beauty＋Cryptomatte ID） ───────────→ Color Corrector ─→ MediaOut
   └→ Cryptomatte（View Mode: Matte）
       └→ Bitmap Mask（Channel: Luminance）─→ Color Corrector（Effect Mask）
```

1. 同じEXRをColor Correctorの画像入力とCryptomatteのInputへ分岐します。CryptomatteのView LayerをObjectへ切り替え、PickまたはViewerから車体のIDを選びます。
2. View Modeを**Matte**にしてViewerへ出し、車体が白、対象外が黒になっていることを確認します。
3. Cryptomatteの2D Image出力を[Bitmap Mask](../masks/bitmap-mask)のInputへ接続し、Channelを**Luminance**にします。白黒Imageの明るさから単一channelのMaskを作るためです。元のRGBが黒でもAlphaは不透明な場合があるので、Bitmap MaskをAlphaにしたままでは意図した選択にならないことがあります。
4. Bitmap Maskの出力を[Color Corrector](../color/color-corrector)のEffect Maskへ接続します。Color Correctorでは元のEXRを色補正し、車体の範囲だけへ適用します。両方をViewerで確認して、必要なら選択IDを調整します。

これは21.1 ManualのCryptomatte→Bitmap→色補正という構成と、Bitmap MaskのChannel機能から組み立てた**再現用の構成案**です。特定の車体EXRで動作を確認した実機例ではありません。Cryptomatteを使えるのはIDが埋め込まれたEXRに限ります。

## 選べない・意図しない場所が変わるとき

| 症状 | まず確認すること |
| --- | --- |
| Pickへ選択候補が出ない | 元のEXRにCryptomatteのObject / Material IDが含まれているか、View Layerが一致しているか。 |
| Viewerでは色分けされるがMaskにならない | View ModeがColors / Edgesのままになっていないか。後段用はMatteを選ぶ。 |
| 対象外にも色補正がかかる | Bitmap MaskをAlphaで読んでいないか。Cryptomatteの白黒Imageから作る場合はLuminanceを確認する。 |
| 別のObject / Materialまで選ばれる | Selected Matte ListとMatte Layersを確認し、不要な選択をClearする。 |
| IDで区別できない | EXR生成時に対象を分けるIDが保存されているか。見た目のRGBだけからIDは復元できない。 |

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
- [Bitmap Mask](../masks/bitmap-mask) — Cryptomatteの白黒Imageから、色補正などに接続するMaskを作る
- [Color Corrector](../color/color-corrector) — 取り出した対象領域にだけ色補正を適用する

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 109「Matte Nodes」pp.2514–2515で、CryptomatteのStudio限定、2D EXR入力、encoded IDs、各選択・表示Controlと、Color Corrector / Bitmapへ渡す基本構成を確認しています。Bitmap MaskのImage→Mask変換とChannel選択は同Manual Chapter 108 pp.2463–2467も参照しています。公式資料の公開元は[Blackmagic Designサポート](https://www.blackmagicdesign.com/support)です。

車体の色補正と症状別の確認手順はManualの機能から組み立てた構成案です。21.1実機でのCryptomatte→Bitmap Mask→Color Correctorの通し動作、runtime REGID、renderer固有のlayer命名、EXR manifest内部表現、各Mask channelの出力画素値、処理性能は未検証のため、`verification: partial`を維持します。
