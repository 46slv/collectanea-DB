---
title: Matte Control
description: 2つのImageのchannelをAlphaへ組み合わせ、既存matteの形、Solid / Garbage領域、spillまで後段で調整するNode。
doc_type: node
term_id: matte-control
term_short: "Matte Controlは、作成済みAlphaや別Imageのchannelを組み合わせてmatteを整えるNode。"
verification: partial
aliases: [Matte Control, MAT]
concepts: [image-data, alpha, premultiplication, matte, compositing]
nodes: [Matte Control]
node_family: matte-keying
controls: [Combine, Combine Operation, Filter, Blur, Clipping Mode, Contract/Expand, Gamma, Threshold, Restore Fringe, Invert Matte, Post-Multiply Image, Spill Color, Spill Suppression, Spill Method, Fringe Gamma, Fringe Size, Fringe Shape]
inputs: [image, image, mask, mask, mask]
outputs: [image]
tasks: [matte, alpha, combine-alpha, refine-matte, despill]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Matte Control

Matte Controlは、新しくscreen keyを作るためのKeyerではなく、すでにImageやMaskが持っているchannelを組み合わせてAlphaを作り直すNodeです。別ImageのAlphaやRGB channelをBackground側のAlphaへ移したり、作成済みmatteのedge、Solid / Garbage領域、spillを後段で調整したりできます。

## 役割

たとえば、別branchで作った白黒matteをForegroundへ接続し、そのAlphaをBackground Imageへコピーできます。結果はBackgroundのRGBを保ちながら、Alphaだけを別のsourceから受け取ったImageになります。

Keyer内部の調整だけではGraphが複雑になる場合に、Alphaの合成と仕上げをMatte Controlへ分けると、どこでmatteを作り、どこで整えているかを追いやすくなります。

## 入力

### Background

オレンジ色のBackgroundへ、最終的にRGBとAlphaを持たせたい2D Imageを接続します。

### Foreground

緑色のForegroundへ、Background側へ適用したいAlphaまたはRGB channelを持つ2D Imageを接続します。どのchannelを使うかはCombineで選びます。

### Garbage Matte

灰色のGarbage MatteへMaskを接続すると、その範囲をtransparentへできます。

### Solid Matte

白色のSolid MatteへMaskを接続すると、その範囲を完全にopaqueへできます。

### Effect Mask

21.1 Manualには、Matte Controlの処理範囲を限定する任意のEffect Maskも記載されています。

Manual本文は「four inputs」と説明した直後にBackground / Foreground / Garbage Matte / Solid Matte / Effect Maskの5種類を列挙しています。本ページでは5種類の役割を記載しています。下の実機例では入力属性とNode EditorでImage2／Mask3の5入力を確認しました。

## 出力

Background Imageを基礎に、指定したchannel合成とmatte調整を反映した2D Imageを出力します。[Merge](../compositing/merge)のForegroundへ接続すれば、更新後のAlphaを合成に使えます。

## CombineでAlphaのsourceを決める

CombineではForegroundのどのchannelをBackground Alphaへ使うか、またはBackground Alphaを強制的にsolid / clearへするかを選びます。

- **Combine Red / Green / Blue**: Foregroundの選択channelをBackground Alphaへ組み合わせる
- **Combine Alpha**: Foreground AlphaをBackground Alphaへ組み合わせる
- **Solid**: Background Alphaを完全にopaqueへする
- **Clear**: Background Alphaを完全にtransparentへする
- **None**: ForegroundをAlpha合成へ使わない

Combine Operationでは、Foreground sourceとBackground Alphaの関係を選びます。CopyならForeground sourceでBackground Alphaを置き換え、Add / Subtract / Maximum / Minimumなどでは2つの値を演算して新しいAlphaを作ります。Merge Over / Merge Underも選択できます。

## matteの形を整える

Matte tabでは、channelを組み合わせた後のAlphaを調整できます。

- **Blur**: matte edgeを柔らかくする
- **Contract/Expand**: matteを縮小・拡大する
- **Gamma**: 半透明領域のAlphaを調整する
- **Threshold**: 低い値をtransparent、高い値をopaqueへ寄せる
- **Restore Fringe**: keyで削れたhair等のedgeを戻す
- **Invert Matte**: opaque / transparentを反転する

Solid / Garbage MatteもここでAlphaへ反映されます。Manualでは、Keyerで使ったものと逆方向のGarbage Matteを後から追加したい場合などに、Matte ControlをKeyerの後段へ置く例が説明されています。

## spillを後段で調整する

Spill tabでは、matte edgeに残ったscreen colorを調整できます。Spill Color、Spill Suppression、Spill Methodに加え、Fringe Gamma / Size / Shapeと色補正Controlを使えます。

つまりMatte ControlはAlphaだけを扱うNodeではなく、key後のedge colorまで同じ場所で仕上げられます。

## 主な用途

- 別branchで作ったAlphaを、合成したいImageへコピーする
- Red / Green / Blue channelのいずれかをAlpha sourceとして利用する
- Keyerの後段でThreshold、Gamma、Blur、Contract/Expandを使いmatteを整える
- Solid / Garbage Matteを後から追加し、残したい領域と消したい領域を明示する
- key後のedgeに残ったgreen / blue spillを補正する

## 最小構成

Alphaを別Imageへコピーする最小例です。

    Image to Composite ─→ Background
                          Matte Control → Merge
    Matte Source ───────→ Foreground

CombineをCombine Alpha、Combine OperationをCopyにすると、Foreground側のAlphaをBackground側へ移す構成になります。

Keyerの結果をそのまま仕上げるだけなら、Keyer出力をBackgroundへ接続し、Foregroundを使わずにmatte controlsやSolid / Garbage Matteを適用する構成も取れます。

## premultiplicationの注意

Post-Multiply Imageを有効にすると、結果のRGBへAlphaを乗算します。21.1 Manualでは通常有効で、既定もOnと記載されています。下の実機例では新規追加時にオフだったため、オンを明示して比較しました。

無効にした結果はpremultiplied Imageとして扱えなくなるため、後段のMerge設定との組み合わせを確認する必要があります。

## 関連Node

- [Delta Keyer](./delta-keyer) — green / blue screenからAlphaを作る
- [Chroma Keyer](./chroma-keyer) — 任意色からAlphaを作る
- [Luma Keyer](./luma-keyer) — channel値からAlphaを作る
- [Difference Keyer](./difference-keyer) — clean backgroundとの差からAlphaを作る
- [Merge](../compositing/merge) — Matte Controlで整えたImageを合成する

## 実機例：AlphaのCopyとGarbage／Solidを使い分ける

<!-- capture-case:S75 -->

Resolve Studio21.1.0.14／WindowsのFusionページで、1920×1080の固定チャートを使いました。通常の比較は左が入力、右が結果で、両ViewerをColor／40%にしています。内部REGIDは`MatteControl`でした。完成例では、Foreground画像から受け取った楕円のAlphaに、中央を消すGarbageと赤い部分を残すSolidを加えています。

[![チャートをMatte ControlのBackgroundへ、楕円画像をForegroundへ、2つのRectangleをGarbageとSolidへ接続した実機Graph](/img/fusion/captures/S75/graph.png)](/img/fusion/captures/S75/graph.png)

[![Combine AlphaとCopy、Invertオフ、Post-Multiply ImageオンのMatte Control Inspector](/img/fusion/captures/S75/inspector.png)](/img/fusion/captures/S75/inspector.png)

[![右は楕円で切り抜いたチャートに中央の透明穴と左の赤い不透明パッチを加えた結果](/img/fusion/captures/S75/compare.png)](/img/fusion/captures/S75/compare.png)

### まず別画像のAlphaをコピーする

チャートをBackgroundへ接続し、Ellipse付きの白いBackgroundをForegroundへ接続します。CombineをCombine Alpha、Combine OperationをCopyにして、Post-Multiply Imageをオンにすると、チャートが楕円で切り抜かれました。下は追加のGarbageとSolidを使わない段階の比較です。

[![Combine AlphaとCopy、Post-Multiply ImageオンにしたInspector](/img/fusion/captures/S75/copy-inspector.png)](/img/fusion/captures/S75/copy-inspector.png)

[![右のチャートはForeground画像の楕円Alphaで切り抜かれる](/img/fusion/captures/S75/copy.png)](/img/fusion/captures/S75/copy.png)

[![左はAlphaの参照にした白い楕円画像、右はそのAlphaを受け取ったチャート](/img/fusion/captures/S75/source.png)](/img/fusion/captures/S75/source.png)

3枚目だけは左に白い楕円画像、右にAlphaを受け取ったチャートを表示しています。Foregroundの白いRGBでチャートを塗り替える操作ではありません。

初期表示ではCombineはNone、Combine OperationはCopy、FilterはFast Gaussianで、Post-Multiply Imageはオフでした。Manualの「通常有効、既定オン」という説明と、この実機で新規追加したときの表示を区別します。この例ではオンを明示してから比較しています。

[![Matte Control初期表示のCombine None、Copy、Fast GaussianとPost-Multiply Imageオフ](/img/fusion/captures/S75/default-inspector.png)](/img/fusion/captures/S75/default-inspector.png)

### 反転とRGBへの乗算を分けて確認する

同じAlpha CopyでInvert Matteだけをオンにすると、楕円の内側が透明になり、外側が残ります。

[![同じAlpha Copyの設定でInvert MatteをオンにしたInspector](/img/fusion/captures/S75/inverse-inspector.png)](/img/fusion/captures/S75/inverse-inspector.png)

[![Invert Matteをオンにすると右は楕円の内側が透明、外側が残る](/img/fusion/captures/S75/inverse.png)](/img/fusion/captures/S75/inverse.png)

Invertをオフに戻し、Post-Multiply Imageだけをオフにすると、Color Viewerでは透明部分にもRGBが残って明るく見えました。これは前景単体の表示比較です。後段Mergeの演算方式や合成結果まで比較したものではありません。

[![Alpha Copyを保ちPost-Multiply ImageだけオフにしたInspector](/img/fusion/captures/S75/post-off-inspector.png)](/img/fusion/captures/S75/post-off-inspector.png)

[![右のColor表示では透明部分にもチャートのRGBが残って明るく見える](/img/fusion/captures/S75/post-off.png)](/img/fusion/captures/S75/post-off.png)

### GarbageとSolidを個別に足す

GarbageのRectangleはCenter0.55／0.5、Width0.14、Height0.4です。SolidのLevelを0にしてGarbageだけ有効にすると、中央に縦長の透明穴ができました。

[![中央に穴を作るGarbage RectangleのCenter0.55と0.5、Width0.14、Height0.4](/img/fusion/captures/S75/garbage-inspector.png)](/img/fusion/captures/S75/garbage-inspector.png)

[![Garbageだけ有効にすると、楕円で切り抜いたチャート中央に縦長の透明穴ができる](/img/fusion/captures/S75/garbage.png)](/img/fusion/captures/S75/garbage.png)

SolidのRectangleはCenter0.15／0.3、Width0.15、Height0.2です。GarbageのLevelを0にしてSolidだけ有効にすると、元の楕円の外側にある赤いパッチを不透明に残せます。両方のLevelを1へ戻すと、冒頭の完成例になります。

[![赤い領域を残すSolid RectangleのCenter0.15と0.3、Width0.15、Height0.2](/img/fusion/captures/S75/solid-inspector.png)](/img/fusion/captures/S75/solid-inspector.png)

[![Solidだけ有効にすると、楕円の外側にある左の赤いパッチが不透明に残る](/img/fusion/captures/S75/solid.png)](/img/fusion/captures/S75/solid.png)

入力属性ではBackgroundとForegroundの2つのImage、Effect Mask・Solid Matte・Garbage Matteの3つのMaskを確認しました。Node Editorでは画像2本とGarbage／Solidの接続、未接続のEffect Mask端子を確認しています。Effect Maskの描画結果は今回の確認範囲に含めません。

最後はCombine Alpha／Copy、Invertオフ、Post-Multiply Imageオン、両RectangleのLevel1へ戻して保存しました。他のCombineや演算、色チャンネル、Gamma／Threshold／Blur、Spill、実写のキーイング素材、画素値の測定と性能は未確認です。

[再現用Graph](/img/fusion/captures/S75/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S75/capture.json)

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2539–2544で、Background / Foreground、Garbage / Solid / Effect Mask、Combine / Combine Operation、matte controls、Post-Multiply Image、Spill tabを確認しています。

S75でREGID、5入力、AlphaのCopy、Invert、Garbage／Solid、Post-Multiplyの表示を確認しました。全Control、実写のキーイング品質、処理性能は未確認です。
