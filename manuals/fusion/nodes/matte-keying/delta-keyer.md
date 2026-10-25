---
title: Delta Keyer
description: green / blue screenからAlpha matteを作り、screenのムラ、edge、spillまで段階的に整える主要Keyer。
doc_type: node
term_id: delta-keyer
term_short: "Delta Keyerは、green / blue screenから被写体を分離する主要Keyer。"
verification: partial
aliases: [Delta Keyer]
concepts: [image-data, alpha, premultiplication, keying]
nodes: [Delta Keyer]
node_family: matte-keying
controls: [View Mode, Background Color, Pre-Blur, Gain, Balance, Lock Alpha/Spill Removal Color Balance Reference, Color Balance Reference, Soft Range, Pre Matte Range, Lock Color Picking, Reset Pre Matte Ranges, Erode, Blur, Threshold, Restore Fringe, Erode/Dilate, Clean Foreground, Clean Background, Replace Mode, Replace Color, Spill Method, Spill Suppression, Fringe Gamma, Fringe Size, Fringe Shape, Cyan/Red, Magenta/Green, Yellow/Blue, Range Controls, Simple/Smooth, Lock Alpha/Spill Removal Tuning, Shadows, Midtones, Highlights, Solid Source Alpha, Solid Replace Mode, Solid Replace Color, Solid Mask Invert, Garbage Mask Invert]
inputs: [image, mask, mask, image, mask]
outputs: [image]
tasks: [create-matte, keying, green-screen, blue-screen, despill]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-25"
---

# Delta Keyer

Delta Keyerは、green / blue screenの色差から被写体のAlpha matteを作るNodeです。screen colorを選んだ後、照明ムラの大きい背景、髪や半透明edge、screen colorの映り込みを別々の段階で調整できます。

## 役割

入力ImageのRGBを直接切り抜くのではなく、背景色との差からAlphaを作り、被写体を別のBackgroundへ合成できる状態にします。

21.1 Manualでは、Key、Pre Matte、Matte、Fringe、Tuningという複数の処理段階を持つadvanced color difference keyerとして説明されています。green / blue screenでは最初に試すKeyerとして扱われています。

## 入力

### Input

オレンジ色のInputへ、keyしたいgreen / blue screen素材を接続します。

### Garbage Matte

灰色のGarbage MatteへMaskを接続すると、その範囲をAlphaから除外して透明にできます。frame端の機材や、screen colorだけでは消せない領域を先に落とす用途に使います。

### Solid Matte

白色のSolid MatteへMaskを接続すると、その範囲を完全に不透明へできます。screenと似た色を持つ被写体の一部など、keyから保護したい範囲を指定できます。

### Clean Plate

Clean Plate入力には[Clean Plate](./clean-plate) Nodeで作ったscreen Imageを接続できます。screenの照明ムラや色のばらつきが大きいshotで、より均一な背景参照を与えるための入力です。

### Effect Mask

青色のEffect MaskへMaskを接続すると、Delta Keyer自体を適用する範囲を限定できます。ManualではNode処理の後に適用されるMaskとして説明されています。

## 出力

生成したAlphaと、spill処理を含むImageを出力します。Final Resultを[Merge](../compositing/merge)のForegroundへ接続すれば、透明になったscreen部分へ別のBackgroundを合成できます。

### View Modeで処理段階を確認する

View Modeは、調整したい箇所に応じて切り替えます。最終画像を見ながら全項目を一度に変更するより、問題のある段階を確認できます。

- **Pre Matte**: 最初の背景選択で取り除けた領域を確認します。screenのムラが残るときに使います。
- **Matte**: Solid / Garbage Matteと合成する前のAlphaを表示します。ViewerもAlpha表示へ切り替え、key本体で何が抜けたかを見ます。
- **Tuning Ranges**: Shadowが赤、Midtoneが緑、Highlightが青の疑似カラーになります。どの明暗域へ調整が効くかを確認します。
- **Status**: 不透明・透明・半透明の領域と、ThresholdやErode/Dilate、Solid Matteの調整が作用した領域を確認します。
- **Intermediate Result**: 元素材のRGBに、完成したmatteを組み合わせた中間結果です。spillを除去した最終画像とは区別します。
- **Final Result**: spill除去を含む最終結果です。合成する場合はこの出力をMergeへ渡します。

特に「Matte表示では問題がないのに合成するとedgeの色が浮く」場合は、Alphaとspill補正を別問題として確認します。

## screen colorを選ぶ

Key tabのBackground Colorで、Viewerからgreen / blue screenの代表色を選びます。

**Pre-Blur**はAlpha生成前のImageをぼかし、sourceのnoiseやedge enhancementがkeyへ入りすぎるのを抑えます。**Gain**を上げるとscreen colorの影響が強まり、その色がより透明になりやすくなります。

**Balance**は、選択したscreen colorの優勢なchannelと、残り2 channelとの色差をどう計算するかを調整します。21.1 Manualでは、値0は残り2 channelの小さい方、値1は大きい方、0.5は双方を半分ずつ用いると説明しています。screen色を選び直す操作とは異なります。

### Alphaとspillの色基準を分ける

**Lock Alpha/Spill Removal Color Balance Reference**を解除すると、Alphaを作るときの基準と、screen colorをRGBから除去するときの基準を分けられます。

**Color Balance Reference**は、照明やホワイトバランスによってscreen色の純度・彩度が下がっている場合に使います。中立色の被写体を基準に補正し、key計算と背景色減算の参照を調整します。screen色そのものを別の色へ塗り替えるControlではありません。

たとえば被写体の白い衣服がscreen照明を受けて緑がかっている場合は、Alphaを作る基準だけを強めず、色基準とspill除去の結果を分けて確認します。具体的な有効値はshotごとに異なり、ここでは固定しません。

## Pre Matteでscreenのムラをならす

Pre Matteは、本体のcolor difference keyより前にbackground selectionを整える段階です。最初に選んだscreen colorと照明条件が異なる領域を追加で選び、Soft Rangeでselectionの広がりを調整します。

ErodeでPre Matteのedgeを内側へ寄せ、Blurで境界を柔らかくできます。selectionが決まったらLock Color PickingでViewerからの追加選択を止められます。

外部のClean Plate入力と、Delta Keyer内のPre Matteは同じものではありません。前者はClean Plate NodeのImageを受け取る入力、後者はDelta Keyer内でscreen selectionを整える処理段階です。

## Matteを整える

Matte tabでは最終Alphaを調整します。

- **Threshold**: 低いAlphaをtransparent、高いAlphaをopaqueへ寄せる
- **Restore Fringe**: keyで削れた髪などのedgeを戻す
- **Erode/Dilate**: matteを縮小・拡大する
- **Blur**: matte edgeを柔らかくする
- **Clean Foreground / Clean Background**: foreground側の薄いAlphaやbackground側の残りを整理する

**MatteのThreshold**は左右2つの境界を持ちます。下限より低いAlphaは透明、上限より高いAlphaは不透明になり、その間の値は相対的な透明度が残ります。**Clean Foreground**は薄く透けた前景を不透明側へ補い、**Clean Background**は背景側の暗いmatte値を切り詰めます。両者を強く使うと髪やmotion blurの半透明部分も失いやすいため、Alpha Viewerで確認します。

**Replace Mode**はmatte調整で失ったRGBをどのように戻すかの設定です。**None**はRGBを置換しません。**Source**は元画像の色、**Hard Color**は指定した単色、**Soft Color**は元の背景色除去量に応じた重み付きの単色を使います。Hard / Softを選ぶ場合に**Replace Color**が適用されます。matteを白くしたからといって失われたRGBも自動で正しく復元されるわけではありません。

Solid / Garbage Matteもこの段階で最終Alphaへ組み合わされます。前述のView Mode **Matte**はこの合成前なので、最終Alphaとの違いを確認するときはFinal ResultやViewerのAlpha表示も見ます。

## Fringeとspillを整える

Fringe tabでは、半透明edgeへ透過したgreen / blueのscreen colorを除去します。**Spill Method**は強度の異なる処理方式、**Spill Suppression**は選んだ方式を適用する量です。Suppressionが0ならspill除去はかかりません。

21.1 Manualに記載されたSpill Methodの目安は、**None**が補正なし、**Rare**が最も軽い補正、**Medium**がgreen screen向け、**Well Done**がblue screen向け、**Burnt**が特に問題の大きいblue screen向けです。これらは試す順序の目安であり、素材を見ずに強い方式を固定するものではありません。

**Fringe Gamma**はedgeの明るさ、**Fringe Size**は補正する縁の幅、**Fringe Shape**はその補正を内側と外側のどちらへ寄せるかを調整します。**Cyan/Red**、**Magenta/Green**、**Yellow/Blue**は残った色かぶりを3つの色軸で補正します。Alphaを変える項目とは区別して調整します。

### Tuningで明暗域ごとに分ける

Tuning tabでは、**Range Controls**でShadow / Midtone / Highlightの範囲を分けます。**Simple**は直線的、**Smooth**は滑らかな範囲の移行です。View ModeをTuning Rangesにすると、どの階調域へ効くかを疑似カラーで確認できます。

**Lock Alpha/Spill Removal Tuning**を解除すると、Alpha生成用のTuningとscreen色除去用のTuningを別々に調整できます。たとえば暗いscreenの除去だけを強めた結果、被写体の暗部の色まで変わった場合は、Shadow側のAlpha処理とspill処理を分けて見直します。

## Mask tabで既存Alphaと保護領域を組み合わせる

**Solid Source Alpha**は、source画像にすでにAlphaがある場合に、そのAlphaをSolid Matteへどう反映するかを選びます。

- **Ignore**: sourceのAlphaをSolid Matteへ合成しません。
- **Add**: sourceの不透明部分をSolid Matteの不透明部分へ加えます。
- **Subtract**: sourceの透明部分をSolid Matteの透明部分へ反映します。

**Solid Replace Mode**は、Solid Matteで不透明に保護する領域のRGBを戻す方法です。**None / Source / Hard Color / Soft Color**の選択肢があり、Hard / Softでは**Solid Replace Color**で色を指定します。Matte tabのReplace Modeとは、処理する場所と目的が異なります。

Solid Maskの**Invert**は、sourceのAlphaと組み合わせる前にSolid Matteを反転します。Garbage Maskの**Invert**は、通常なら消される不透明領域ではなく透明領域を除外対象にします。

screen色と同じ緑色の衣服をSolid Matteで保護したいときは、Alphaだけでなく、その保護部分へどのRGBを残すかも確認します。

## 主な用途

- green / blue screenの人物を抜き、別背景へ合成する
- screenの照明ムラをPre MatteやClean Plateで補いながらkeyする
- 髪、motion blur、半透明素材のedgeを残しながらscreenを透明にする
- Solid / Garbage Matteを併用し、screen色と似た被写体部分を保護したり撮影機材を除外したりする

## 最小構成

    MediaIn → Delta Keyer → Merge → MediaOut
                              ↑
                       Background

まずBackground Colorを選び、ViewerをAlpha表示またはView ModeのMatteへ切り替えてmatteを確認します。最終的なedgeとspillは、実際の合成Backgroundを接続した状態でも確認します。

## 複雑なshotでの使い方

21.1 Manualでは、1つのKeyerだけで完全な結果にならない例として、2つのDelta Keyerを使う構成も示しています。1つ目で硬いcore matteを作り、その結果を2つ目のSolid Matteへ渡し、2つ目で柔らかいedgeを拾う構成です。

たとえば緑背景で撮影した人物の胴体は安定しているのに、髪の先端は半透明になっているshotを考えます。1つ目のDelta Keyerで胴体の硬いcore matteを作り、そのAlphaを2つ目のSolid Matte入力へ接続します。2つ目では髪のedgeを優先してscreen color、Matte、Fringeを調整します。これにより、髪の繊細なkeyで胴体に穴が開いても、core側で不透明部分を保持できます。

Manualは、spill suppressionを含む色補正をmatte作成とは別branchに分け、Graph上で担当を見分けやすくする構成も推奨しています。ただしIntermediate ResultとFinal ResultではRGBへの処理が異なるため、どちらを色補正branchへ渡すかは意図を確認します。

これは「Delta Keyerを増やせば必ず良くなる」という意味ではありません。screenの問題がcoreとedgeで異なるときに、役割を分けて調整する例です。

## 関連Node

- [Clean Plate](./clean-plate) — screen colorのムラをならした参照Imageを作る
- [Ultra Keyer](./ultra-keyer) — Pre-Matteとcolor differenceを組み合わせる別Keyer
- [Primatte](./primatte-5) — Fusion Studioで利用できる別のscreen keyer
- [Chroma Keyer](./chroma-keyer) — green / blueに限らず任意色からmatteを作る
- [Matte Control](./matte-control) — 作成済みAlphaを後段で組み合わせ、調整する
- [Merge](../compositing/merge) — keyed ImageをBackgroundへ合成する

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 109「Matte Nodes」pp.2516–2524を直接参照し、5入力、6種類のView Mode、Key / Pre Matte / Matte / Fringe / Tuning / Mask各tab、Alphaとspillの基準分離、Replace Mode、Spill Method、Solid Source AlphaとMaskの反転を照合しています。本文の2-Keyerと照明ムラの運用例はManualに記載された機能に基づく構成案で、実機の比較結果ではありません。

このページではManualで確認できないruntime REGID、実機上の端子表示、処理性能は断定していません。
