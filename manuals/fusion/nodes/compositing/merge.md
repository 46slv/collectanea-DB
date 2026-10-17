---
title: Merge
description: Backgroundを基準にForegroundをAlpha・合成モード・Operatorで重ね、必要ならMaskやZ-Depthで合成範囲と前後関係を制御する基本Node。
doc_type: node
term_id: merge
verification: partial
aliases: [Merge, 合成]
concepts: [foreground-background, effect-mask, compositing, premultiplication, normalized-coordinates]
patterns: [stack-images-with-merge, limit-effect-with-mask, choose-merge-vs-multimerge]
nodes: [Merge]
node_family: compositing
controls: [Center, Size, Angle, Reference Size, Use Frame Format Settings, Apply Mode, Operator, Subtractive/Additive, Alpha Gain, Burn In, Blend, Filter Method, Edges, Invert Transform, Flatten Transform, Perform Depth Merge, Foreground Z-Offset]
inputs: [image, image, mask]
outputs: [image]
tasks: [composite, layer, mask]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-17"
---

# Merge

Mergeは、Backgroundを基準にForegroundを重ね、1枚の<Term id="image">2D Image</Term>へまとめる基本Nodeです。必要なら<Term id="mask">Effect Mask</Term>で合成範囲を限定できます。

## 役割

Mergeの基本は「何を、何へ重ねるか」です。

- **Background**: 合成の基準になる画像
- **Foreground**: Backgroundへ重ねる画像
- **Effect Mask**: Mergeを適用する範囲

Foreground / Backgroundの役割はNodeの見た目の上下ではなく、どの入力へ接続したかで決まります。

## 入力

### Background

オレンジ色の入力です。2枚を合成するときの基準画像になります。

Backgroundだけを接続した場合、MergeはそのBackgroundを出力します。

### Foreground

緑色の入力です。Backgroundへ重ねる画像を接続します。

Foregroundだけを接続し、Backgroundを接続していない場合は、21.1 ManualではMergeは画像を出力しないと説明されています。

### Effect Mask

青色の任意入力です。白い部分ではForegroundとの合成を適用し、黒い部分ではBackgroundだけを残します。

## 出力

ForegroundとBackgroundを合成した2D Imageを出力します。

出力解像度はBackground入力の画像によって決まります。Foregroundが別解像度でも接続できますが、キャンバスの基準はBackground側です。

## 主な設定項目

### Center / Size / Angle

ForegroundをMerge内部で配置するためのControlです。

- **Center X / Y**: Foregroundの位置。既定は0.5 / 0.5で中央
- **Size**: Foregroundの大きさ。1.0でpixel-for-pixel
- **Angle**: Foregroundの回転

単純な配置なら、Mergeの前へTransformを追加しなくても調整できます。


### Reference Size / Use Frame Format Settings

**MergeのCenterは、ForegroundをBackgroundのフレーム内でどこに置くか**を表します。通常は正規化座標で、Xの`1.0`はBackgroundの幅、Yの`1.0`は高さに相当する距離です。

`Reference Size`では、Centerの数値欄だけをピクセル座標として表示できます。たとえばBackgroundが1920×1080で、Reference Width / Heightも1920 / 1080にすると、内部Centerが`(0.5, 0.5)`のときInspectorの表示は`(960, 540)`です。Xに`1008`を入力すると、内部のXは`1008 ÷ 1920 = 0.525`になり、Foregroundは背景幅の2.5%（48px）だけ右へ移動します。

**Reference Sizeの変更だけでは画像は動かず、BackgroundやForegroundの解像度も変わりません。** Centerをスクリプトで取得する場合や、ほかのNodeへPublishする場合に受け取るのは、Inspectorのピクセル表示値ではなく正規化された値です。

`Use Frame Format Settings`は、コンポジションの現在のFrame FormatからReference Width / Heightを設定します。**Transformの`Auto Resolution`とは名称が異なる**ため、同じ項目名を探さないでください。Frame FormatとMergeのBackgroundの解像度が違う場合は、ピクセル数として位置を読めるよう、Reference Width / HeightをBackgroundに合わせて指定します。

Reference Sizeは位置の**表示と入力の単位**を扱う設定です。出力サイズを指定する設定ではありません。[正規化座標](../../learn/03-space/normalized-coordinates)と[解像度 / アスペクト比](../../learn/03-space/resolution-aspect)も参照してください。

### Apply Mode

ForegroundとBackgroundの色をどの計算で組み合わせるかを選びます。

21.1 ManualにはNormal、Screen、Dissolve、Darken、Multiply、Color Burn、Lighten、Color Dodge、Overlay、Soft Light、Difference、Hue、Color、Luminosityなど、多数のmodeが記載されています。

すべてを暗記するより、「Alphaを使う通常合成か」「明るさ・色を別の演算で混ぜるか」を先に判断すると選びやすくなります。

### Operator

Apply ModeがNormalまたはScreenのときに表示され、ForegroundとBackgroundのAlpha関係を選びます。

代表例:

- **Over**: ForegroundをBackgroundの上へ置く基本合成
- **In**: BackgroundのAlphaでForegroundを切り抜く
- **Held Out**: Background Alphaの反転側でForegroundを残す
- **Atop**: Backgroundにmatteがある範囲へForegroundを置く
- **XOr**: 片方だけにmatteがある領域を残す
- **Mask / Stencil / Under**なども用意されています

OperatorはApply Modeと別の役割です。Apply Modeは色の混ぜ方、Operatorは主にAlphaを使った前景・背景の組み合わせ方として読むと整理しやすくなります。

### Subtractive / Additive

Foregroundが<Term id="premultiplication">プリマルチプライ（Premultiplication）</Term>されているかどうかに応じて、合成方法を調整します。

21.1 Manualでは、一般的なpremultiplied素材ではAdditive側が基本で、non-premultiplied素材ではSubtractiveが必要になると説明されています。間をブレンドして、明るすぎる・暗すぎるエッジを調整する用途もあります。

### Alpha Gain / Burn In / Blend

- **Alpha Gain**: Foreground Alphaの強さを調整
- **Burn In**: Backgroundを暗くするAlpha量を調整
- **Blend**: Merge結果とBackgroundを混ぜ、Merge全体の効き具合を下げる

Blendは「ForegroundのOpacity」と完全に同じ意味ではなく、Merge処理後の結果をBackgroundへ戻すControlとして扱います。

### Filter Method / Edges

Foregroundを拡大縮小するときの補間方法と、画像外側の扱いを決めます。

EdgesにはCanvas、Wrap、Duplicate、Mirrorがあります。


### Invert Transform / Flatten Transform

`Invert Transform`はMerge内のForeground配置に使う移動・回転・拡大縮小を反転します。Trackerで得た移動を一度打ち消し、後段で戻す構成などで使われます。

`Flatten Transform`は、このMergeによる変形を後続Nodeと連結して処理する動作（Transform concatenation）を出力側で止めるControlです。画像の配置を決めるCenterとは役割が異なるため、複数の変形を接続する場合に検討します。

### Perform Depth Merge

ForegroundとBackgroundの両方にZ-channelがある場合、Z値で前後関係を決める合成を有効にできます。Alphaは透明度に使い、Z-Depthが前後順を決めます。どちらか一方にZ-channelがない場合、この設定は無視され、Depth Mergeは行われません。

`Foreground Z-Offset`はForeground側のZ値に加えるオフセットです。値を大きくするとForegroundがZ軸方向の遠方へ、小さくすると手前へ移動します。単にForegroundの位置を画面内で動かしたい場合はZ-OffsetではなくCenterを使います。

## 最小構成

```text
Foreground ─┐
            ├─ Merge → Output
Background ─┘
```

Maskを加える場合:

```text
Foreground ─┐
Background ─┼─ Merge → Output
Mask ───────↑
```

## 運用例

タイトル画像を映像へ重ねる場合は、映像をBackground、タイトルをForegroundへ接続します。

まずApply ModeをNormal、OperatorをOverの基本状態で確認し、その後にCenter / Sizeで配置します。合成範囲だけを制限したい場合はEffect Maskを追加します。

複雑な合成では、1段ごとにMergeを分けると中間結果をViewerで確認できます。


### 実例：背景幅に対して48pxだけ右へ置く

1920×1080の背景映像へ、960×540の透過ロゴを重ねるとします。MergeのBackgroundに背景、Foregroundにロゴを接続します。Foregroundを中央に置いたまま、**背景の座標で**右へ48px移動させる例です。

1. MergeをViewerへ表示し、`Use Frame Format Settings`をオフにして、Reference Width / Heightを1920 / 1080に設定します。
2. Centerを`(960, 540)`にしてForegroundを中央に置きます。内部の正規化値では`(0.5, 0.5)`です。
3. Center Xを`1008`、Yを`540`にします。内部座標では`(0.525, 0.5)`になり、背景の横幅を基準に48px右へ移動します。
4. Reference Width / Heightを3840 / 2160に変更します。Center欄が`(2016, 1080)`と表示される一方、Backgroundの解像度もForegroundの画面上の位置も変わらないことを確認します。

この例の48pxは**背景1920px幅を基準にした距離**です。Backgroundを3840×2160へ替えて内部Centerを`0.525`のままにすると、横方向の移動は96px相当になります。同じ48pxを保ちたいなら`48 ÷ 3840 = 0.0125`なので、Xは`0.5125`です。固定ピクセル余白と相対位置を両立する式は[解像度を跨ぐ配置](../../patterns/transform/resolution-aware-positioning)で説明しています。

画像や文字の見える端から48px空けたい場合は別問題です。CenterはForegroundの座標上の位置なので、ロゴ内の透明余白やPivot相当の支点によって、輪郭とCenterは一致しません。輪郭からの余白はViewerで確認してください。

## 挙動と注意点

- Background入力が出力解像度の基準です。
- Foreground / Backgroundを入れ替えると、同じ2枚でも合成結果と役割が変わります。
- Apply Mode、Operator、premultiplicationは別の論点です。一度に全部変えず、基本のOverから確認すると原因を追いやすくなります。
- 多数Layerを1か所で管理したい場合は[MultiMerge](./multi-merge)も候補になります。
- 2入力をクロスフェードやWipeで切り替えたい場合は[Dissolve](./dissolve)の方が直接的です。

## 関連する考え方

- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)
- [合成量と演算（Blend / Operator）](../../learn/04-compositing/blend-operator)
- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)
- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle) — MergeにはCenter / Size / Angleがあり、Pivotを個別に指定する構成にはTransformを使う

## 関連パターン

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)
- [Merge chainとMultiMergeを選ぶ](../../patterns/compositing/choose-merge-vs-multimerge)
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)
- [解像度を跨ぐ配置](../../patterns/transform/resolution-aware-positioning) — 背景解像度が変わるときの固定ピクセル余白

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 94、pp.2211–2219で、Background / Foreground / Effect Mask、解像度処理、Foreground sizing、Apply Mode、Operator、Subtractive/Additive、Alpha Gain、Burn In、Blend、Filter Method、Edges、Invert Transform、Flatten Transform、Reference Size / Use Frame Format Settings、Z-Depth compositing / Foreground Z-Offsetを確認しました。Reference Sizeの実例はp.2218の仕様に基づく計算例です。

全Apply Modeの数式・画作り、内部REGID、Edition差、実機での描画結果・性能は未確認のため `verification: partial` を維持します。
