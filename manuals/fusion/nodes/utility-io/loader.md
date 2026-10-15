---
title: "Loader"
description: "Fusion Studioで画像・連番を読み込み、時間と画像の解釈を管理する。ResolveのFusionページではEXR用。"
doc_type: node
term_id: "loader"
term_short: "Loaderは、ディスク上の画像・連番をFusionへ読み込むNode。ResolveではEXRの直接読み込みに使う。"
verification: partial
aliases: ["Loader", "LD"]
concepts: ["image-data"]
nodes: ["Loader"]
node_family: "utility-io"
inputs: ["effect-mask"]
outputs: ["image"]
tasks: ["route-data"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-15"
---

# Loader

Loaderは、**ディスク上の画像・連番をFusionの2D Imageとして読み込むNode**です。ファイルを指定するだけでなく、使用するフレーム範囲、Composition上の表示時間、欠番時の動作、Alphaや色の解釈も管理します。

**Fusion Studioでは対応する各種画像・映像ファイルの入力に使いますが、DaVinci ResolveのFusionページではLoaderはEXRの直接読み込み用**です。Resolveの通常のTimeline／Media Pool素材には[MediaIn](./media-in)を使います。この区別によって、素材の保管場所と管理方式が変わります。

## 入力と出力

| 接続 | 内容 |
| --- | --- |
| 青いEffect Mask入力 | EllipseやPolygonなどのMaskで、読み込んだ画像の表示領域を制限する |
| 2D Image出力 | ファイルから読み込んだ画像をTransformやMergeへ送る |

Loaderは元画像をImage端子から受け取るNodeではありません。**Filenameで指定したファイルからImageを作る**Nodeです。Effect MaskはLoaderによる読み込み・処理後に適用され、Mask範囲の画像を表示します。

Fusion StudioではLoader → Transform／Color処理 → [Saver](./saver)が基本形です。ResolveでCGを実写に重ねる場合は、実写MediaInをMergeのBackground、CGのEXRを読み込んだLoaderをForegroundにつなぎ、MergeからMediaOutへ送ります。

## Fileタブ：ファイルと時間を指定する

**Filename**は読み込むファイルのパスです。Loaderを追加するとファイル選択ダイアログが開き、後からInspectorでも変更できます。Fusion StudioではEffects Library／ツールバーから追加する、OSからファイルをNode Editorへドラッグする、File > Import > Footageで取り込むという方法があります。最後の方法は新しいCompositionも作成します。

### 連番の認識

ファイル名の拡張子直前に番号が付いていると、Fusionはフォルダを探索して連番として扱います。

    shot.0001.exr
    shot.0002.exr
    shot.0003.exr

最初の番号のファイルを選ぶ必要はありません。Fusionは見つかった最初と最後の番号から連番の長さを判断します。**0001と0100しかない場合も100フレームの連番として認識します。** 中間の欠番を詰めて再生するわけではなく、Missing Framesの設定に従います。

Fusion Studioで番号付きのファイルを連番ではなく1枚の静止画として読みたいときは、OSウィンドウからShiftを押しながらNode Editorへドラッグする方法がManualに記載されています。

### GlobalとTrimは違う

- **Global In／Global Out**：Compositionの時間軸で画像を出力する開始・終了フレーム。範囲外は画像を出しません。
- **Trim In／Trim Out**：読み込んだソースのどの区間を使うか。先頭と末尾の不要なフレームを除きます。
- **Hold First Frame／Hold Last Frame**：使用区間の最初／最後のフレームを指定した数だけ静止させます。
- **Reverse**：再生順序を逆にします。
- **Loop**：使用区間を繰り返します。TrimやHoldで変わった長さもループに含まれます。

Globalを短くしたときはFusionがTrimを自動調整し、長くしたときはHoldを自動調整する場合があります。**Globalは「Compositionのどこに置くか」、Trimは「素材のどこを使うか」**です。CG連番の冒頭を使わずタイムライン途中で登場させる場合は、まずTrimでソースを切り、次にGlobalで登場位置を調整します。

### Missing Frames：欠番の処理

| 設定 | 動作 | 注意 |
| --- | --- | --- |
| Fail | 画像を出さず、Renderを中断する | 完成した連番の欠番検出に向く |
| Hold Previous Output | 前の有効フレームを保持する | **最初のフレームが欠けると保持元がなく失敗** |
| Output Black | 有効フレームが現れるまで黒を出す | 欠番が黒画像として表示される |
| Wait | 数秒おきにファイルを探して待つ | **出現するまでRender全体が停止** |

3Dレンダラーが連番を書き出している途中にFusionで後段の合成を進めるなら、Waitが役立つ場合があります。ただしファイルが作られなければ処理が止まったままになります。完成した連番の確認ではFailを使う方が、欠番を明示的に発見できます。

### Proxy Filename：低解像度の代替素材

**Proxy Filename**は、元素材とは別の低解像度ファイルを指定する欄です。CompositionのProxyモードが有効になると代替素材を読み込みます。例えばネットワーク上の8K EXRを参照する代わりに、ローカルの軽量な連番で作業する運用です。

**Proxyは元素材とフレーム数、開始番号、終了番号を一致させる必要があります。** Manualでは同じ形式と形式固有設定に揃えることも推奨しています。番号がずれると、本素材とProxyで異なる時点の画像を確認することになります。

## Importタブ：画像をどう解釈するか

Fileタブと異なり、ImportタブではField、色深度、Pixel Aspect、Alpha、色の解釈を設定します。

| Control | 役割 |
| --- | --- |
| Process Mode | Full Frames、NTSC fields、PAL/HD fieldsなどのField処理。reversedでは空間上のField順も変更する |
| Depth | Formatはファイル形式に従い、DefaultはComposition設定。Int 8／16 Bit、Float 16／32の指定も可能 |
| Pixel Aspect | From Fileはファイル内の情報、DefaultはComposition設定、CustomはX/Yを手動指定 |
| Import Mode | Normal／Pull Up／Pull Downで3:2変換。Pull Up／DownではFirst Frameなどが関係する |
| Make Alpha Solid | 元のAlphaを完全に不透明へ置き換える |
| Invert Alpha | Alphaを反転する |
| Post-Multiply by Alpha | RGBをAlphaで乗算する |
| Swap Field Dominance | Fieldの時間順だけを反転する。Process Modeのreversedとは異なる |

21.1 ManualではDepthをFormatにした場合、EXRはFloatとして読み込まれると説明されています。

### Post-Multiplyを適用するか判断する

**Straight Alpha**はRGBが透明度で乗算されていない状態、**Premultiplied Alpha**はすでに乗算された状態です。Loaderの**Post-Multiply by Alpha**はStraightのRGBをPremultipliedに変える項目であり、常に有効にする設定ではありません。

例えば、RGB 0.8、Alpha 0.5の画素に一度乗算するとRGBは0.4です。**すでに0.4として保存された画素に再びPost-Multiplyをかけると0.2となり、Mergeで暗い輪郭が出る**場合があります。素材の書き出し仕様を確かめ、すでに乗算済みなら再適用しません。

LoaderのPost-Multiplyと、[Color Corrector](../color/color-corrector)などの**Pre-Divide/Post-Multiply**は異なります。後者はPremultipliedなRGBを一時的にAlphaで割って色補正し、最後に再乗算します。連続する複数の補正では、[Alpha Divide](../matte-keying/alpha-divide)と[Alpha Multiply](../matte-keying/alpha-multiply)で補正区間を挟む方法もあります。

### 色空間の指定だけでは変換されない

**Color Space Type**は、ソースの色空間に関するメタデータを保持または指定します。21.1 Manualは、**この設定自体では色空間変換を行わない**と明記しています。そのメタデータを後段の[Gamut](../color/gamut)でFrom Imageとして参照することができます。

**Curve Type**はガンマ曲線の解釈を指定します。一方、**Remove Curve**を有効にすると、対応するガンマ曲線の除去またはLog→Linear変換を実行します。「メタデータを指定した」ことと「画素値を実際に変換した」ことを区別してください。

## Formatタブ：OpenEXRの追加チャンネル

Formatタブの項目は指定したファイル形式によって変わります。OpenEXRでは、RGBA以外の**名前付きチャンネルをFusion側のチャンネルへ割り当てる**ことができます。

例えばCGから出したマルチチャンネルEXRに、深度やMaskに相当する追加データが入っている場合、実際のファイルに収録されているチャンネル名を調べ、Formatタブで対応付けます。チャンネル名と格納内容は書き出し元に依存するため、特定の名前が必ず存在すると決めつけません。

Manualには他の形式に固有のFormat設定もありますが、**それはResolveのFusionページでLoaderが任意の動画形式を読めることを意味しません。** ResolveのLoaderはEXR向けです。

### マルチパートEXRのBeauty Passを別々に扱う

CGレンダリングの**Beauty Pass**は、色・反射・照明などを分けて書き出した画像成分です。1つのEXRに複数のPassを収録できますが、Loaderの画像出力は1組のRGBAです。たとえばColorとReflectionを個別に加工するには、**同じEXRを指定したLoaderを2つ用意**し、それぞれのFormatタブで異なるチャンネルをRGBAへ割り当てます。

Color側とReflection側を別々に補正し、元の3Dレンダラーが定義した方式で合成します。**Passはすべて加算すれば正しく復元できるわけではありません。** PassごとにAlphaがあるとも限らないため、必要なら別Passから適切なAlphaを割り当てます。21.1 Manualでは同一EXRを複数Loaderで読む際、ファイルの読み込みを共用できると説明されています。

[MediaIn](./media-in)でも1ノードにつき1組のRGBAを扱いますが、Passの選択や割り当てはImageタブのLayer／Channelsタブで行います。Loaderの場合は**Formatタブ**です。

## 制作例1：EXRのCGを実写へ合成する（Resolve）

1. 実写クリップのFusionページを開き、MediaInを確認します。
2. Loaderを作り、3Dソフトから書き出したCGのEXR連番を指定します。
3. MergeのBackgroundへMediaIn、ForegroundへLoaderを接続し、MergeからMediaOutへつなぎます。
4. Global／Trimで素材の時間を合わせ、必要ならHoldを調整します。
5. EXRのAlpha、Post-Multiply、色空間メタデータ、Remove Curveや後段の色変換を確認します。
6. 結果を再生して、透明部分の縁、色、フレーム欠番を確認します。

この例では実写は**ResolveクリップのMediaIn**、CGは**ディスク上のEXRを読むLoader**です。

## 制作例2：書き出し途中のEXR連番を確認する

3DソフトがEXR連番を書き出している途中にFusionで後半のフレームを確認する必要があれば、Missing FramesをWaitにしてファイルの出現を待ちます。出力が完了した後はFailに変更して欠番を点検します。Waitは欠番を無視して次へ進む設定ではなく、**そのフレームが現れるまで処理を止める設定**です。

## 制作例3：Saver→LoaderでEXRとAlphaを検査する

別のCompositionへ人物CGを渡すなら、処理後のRGBAを[Saver](./saver)でEXRとして保存し、新しいLoaderで読み直します。Saverの**Save Alpha to Color**はAlphaをグレースケールとしてRGBへ書き込む機能で、元のRGBを上書きします。色付きのRGBA素材を渡す目的では有効にしません。

読み直したEXRを実写背景へMergeで重ね、輪郭が暗い場合はPremultiplied素材へのPost-Multiply二重適用、輪郭が明るい場合はStraightのままの合成を疑います。Alphaの解釈を変更する前に、元ファイル側の仕様を確認します。

色の不一致は、Saver側の**Color Space Type／Curve Type／Apply Curve**と、Loader側の**Color Space Type／Curve Type／Remove Curve**を分けて調べます。LoaderのColor Space Typeは色空間メタデータの指定で、それ自体は変換を行いません。表示用ガンマや色空間の変換を往復で二度適用しないようにします。

## Fusion Studioの相対パス

Fusion Studioには**Comp: Path Map**があり、保存したCompositionファイルを基準とした相対パスでLoader／Saverの素材を参照できます。Compositionと素材フォルダの相対関係を維持して別PCへコピーするときに役立ちます。Path Map PreferencesのEnable Reverse Mapping of Pathsで自動使用する方法もあります。ResolveのMedia Pool管理とは別の仕組みです。

## 困ったときの確認箇所

| 症状 | 確認すること |
| --- | --- |
| Resolveで一般の動画をLoaderに指定できない | ResolveのLoaderはEXR向け。通常クリップはMediaInに渡す |
| 連番の途中が黒くなる／止まる | 欠番、Missing Frames、Global／Trim／Holdを確認 |
| CGの縁が暗くなる | Alphaの書き出しとPost-Multiplyの二重適用を確認 |
| Proxyだけ動きがずれる | 元とProxyの開始・終了番号、フレーム数を確認 |
| 色が合わない | Color Space Typeはメタデータ指定。Remove CurveやGamutで実変換したか確認 |
| EXRの追加データが見つからない | 元EXRのチャンネル名とFormatタブの割り当てを確認。別Passは別Loaderに割り当てる |

## 関連ページ

- [MediaIn](./media-in) — Resolveの通常素材の入口
- [Saver](./saver) — ディスクへのファイル出力
- [I/O・Graph Utility一覧](./)
- [Gamut](../color/gamut) — 色空間変換

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）**Chapter 104「I/O Nodes」pp.2407–2415**を基準に、端子、環境差、連番、File／Import／Format各タブ、Proxy、Missing Frames、Color Space TypeとRemove Curveの違いを確認しました。**Chapter 77「Understanding Image Channels」pp.1679–1683**はAlphaの二重乗算、Beauty Passと複数LoaderによるEXR読込の根拠です。Saverへの出力については**Chapter 104 pp.2423–2426**、Fusion StudioのLoader→Saver構成はChapter 62（p.1281）を参照しています。

個別のEXRチャンネル名、現在の実機のInspector Default値・Range、内部Parameter ID、細かなEdition差は未確認のため断定しません。
