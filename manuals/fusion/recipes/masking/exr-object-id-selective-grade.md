---
title: OpenEXRのObject IDで車体だけ色補正する
description: EXRに記録されたObject IDをBitmap Maskへ変換し、車体だけにColor Correctorを適用する手順。補助チャンネルと画像レイヤーの違いも確認する。
doc_type: recipe
verification: partial
aliases: [OpenEXR Object ID mask, ID matte, Object ID selective grade]
concepts: [auxiliary-channels, mask-data, image-data]
patterns: [limit-effect-with-mask]
nodes: [Loader, Bitmap Mask, Color Corrector]
tasks: [aov, create-mask, color-correct, composite]
prerequisites: [auxiliary-channels, mask-data]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-20'
---

# OpenEXRのObject IDで車体だけ色補正する

3Dでレンダリングした車と建物が、同じ画像に写っているとします。車体だけを明るくしても建物の色は変えたくない場合、OpenEXRに記録した**Object ID（物体の識別番号）**を使って色補正の範囲を指定できます。

必要なのは、通常のカラー画像（Beauty / RGBA）と、画素ごとに物体を区別するObject IDです。**色が似ている物体でもIDが異なれば分けられる**一方、IDを出力していない画像からBitmap Maskだけで物体の番号を復元することはできません。

## 作るもの・前提

完成形は「車体は色補正され、建物と背景は元のまま」という2D合成です。

- 車と建物を含むRGBA画像、および対応する**Object ID**を格納したOpenEXR。別々の物体に異なるIDが割り当てられていること。
- **Loader**：EXRを読み込み、必要な補助チャンネルをFusionへ割り当てる。
- **Bitmap Mask**：Object IDで選んだ物体を、白い領域を持つMaskへ変換する。
- **Color Corrector**：Maskが白い範囲にだけ明るさや色の補正をかける。

Object IDは「車」「建物」という文字列ではなく数値です。例えば車体のIDが7であれば、その値を持つ画素を選びます。**7は説明用の例で、Fusionが車に自動的に割り当てる番号ではありません。**

## 最小構成

~~~text
Loader（Beauty RGBA + Object ID） ──┬──→ Color Corrector ──→ MediaOut
                                   │          ↑
                                   └→ Bitmap Mask ──→ Effect Mask（青）
                                        Use Object
~~~

上側の経路は**何を色補正するか**、下側は**どの画素へ適用するか**を担当します。Bitmap Maskの出力は色付きの画像ではなく、白・黒・灰色で処理範囲を示すMaskです。

## 手順

### 1. EXR内のObject IDを割り当てる

1. FusionページでOpenEXRを**Loader**から読み込みます。メディアとして扱う場合はMediaInでも構いません。
2. Loaderの**Format**、またはMediaInの**Channels**に相当する設定で、EXRに入っている物体IDのパスをFusionの**Object ID補助チャンネル**へ割り当てます。ファイル側のAOV名とFusion側の認識名が最初から一致するとは限りません。
3. Viewerのチャンネル選択でObject IDが参照できるか確かめます。値を確かめるときは**Color Inspector SubView**も使用できます。
4. 車体と建物で異なるIDが入っているか確認します。通常のRGB表示が正しくても、補助チャンネルが読み込まれているとは限りません。

単にEXRの中に「IDのように見える白黒レイヤー」があるだけでは、FusionのObject IDとして扱えるとは限りません。**画像レイヤーと補助チャンネルは別の仕組み**です。

### 2. 車体のIDをMaskへ変える

1. Loaderから枝を二つに分け、一方を**Bitmap Maskのオレンジ色のInput**へつなぎます。
2. Bitmap Maskで**Use Object**を有効にします。表示されたSample Controlsから対象のObject IDを指定します。IDが分からない場合は、**Sampleボタンを押したままViewerの車体へドラッグ**して値を拾います。
3. Bitmap Maskを単独でViewerに表示し、車体が白、建物と背景が黒になるか調べます。
4. 境界が硬すぎるときは**Soft Edge**を少し調整します。ただし、ぼかし過ぎると隣の物体へ補正がはみ出します。補助の**Coverage / Background Color**が含まれる素材なら、**Correct Edges**も確認できます。両チャンネルがない場合、Correct Edgesだけでは輪郭のエイリアシングを改善できないことがあります。

Bitmap Maskの**Channel: Luminance**は「明るい部分を選ぶ」設定であり、Object IDによる選択とは異なります。車と建物が同じ明るさでも、Use ObjectならIDによる区別ができます。

### 3. 色補正を車体に限定する

1. Loaderのもう一方の枝を**Color Correctorの画像入力**へ接続します。
2. Bitmap Maskの出力を、Color Correctorの**青いEffect Mask入力**へ接続します。
3. 車体の変化が分かるようにColor Correctorの明るさや色味を調整します。
4. Bitmap Maskの接続を一度外して全画面への適用を確認し、再接続して**車体だけ**変わることを比べます。
5. Bitmap MaskとColor CorrectorをそれぞれViewerで見て、選択範囲と色補正結果を別々に確認します。

Effect Maskは**Color Correctorを適用する場所**を指定します。元画像のAlphaやObject IDを、色補正のために書き換える必要はありません。

## 材質で選ぶ場合

車体と窓ガラスが別の**Material ID**を持っているなら、Bitmap Maskの**Use Material**を使って材質単位で選ぶ方法もあります。逆に、車体と建物の両方で同じ材質IDを共有していれば、それらが一緒に選ばれる場合があります。

Object IDは物体、Material IDは材質を区別するための情報です。どちらも**元のEXRに該当するチャンネルがあり、Fusionで正しく割り当てられていること**が前提です。

## 複数レイヤーのEXRを使う場合（Studio版）

上記のObject ID補助チャンネルとは別に、OpenEXRには複数の**画像レイヤー**が含まれることがあります。DaVinci Resolve 21.1 Manualは、Fusionの多層画像のレイヤー選択・処理を**Studio版のみ**としています。

たとえばEXRにすでに白黒の**マット用レイヤー**が含まれている場合、同じLoaderをColor Correctorの画像入力とEffect Mask入力に接続し、Inspectorの**Settings > Layer > Effect Mask Layer**から使うレイヤーを選択する構成が考えられます。画像本体に適用されるレイヤーは**Process Layers**、元画像の参照先は**Input Layer**で確認します。

この方法は**あらかじめマスクとして使える値が収められたレイヤー**向けです。数値のObject IDやPrimIDが入ったレイヤーを選ぶだけで、「車体だけ白いMask」に自動変換されるわけではありません。IDで選別したい場合は、まずその形式に合うチャンネル割り当てとMask生成を確認してください。Free版に同じレイヤー操作があるとは扱いません。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| Use Objectを有効にしても車が選べない | Loader / MediaInでEXR側のパスをFusionのObject IDへ割り当てたか。実際のID値が一致するか |
| 車体と建物が同時に白くなる | 両者に同じObject IDが付いていないか。必要なら出力元3D側のIDを分ける |
| マスクが画像全体に広がる | Bitmap MaskのChannelがLuminance / Alphaのままになっていないか。Use Objectを確認する |
| 境界だけ色がにじむ | EXRのRGBAとIDの解像度・境界処理、Bitmap MaskのSoft Edgeを比べる |
| 色補正が全面にかかる | Bitmap Maskの出力がColor Correctorの**Effect Mask**に接続されているか |
| Merge後にObject IDが消える | Fusionの**Mergeは補助チャンネルをBackground入力側から伝搬**する。Object IDを持つ画像をForegroundに置いていないか確認する |
| EXRにはレイヤーがあるがID選択できない | レイヤー選択とObject ID補助チャンネルの割り当てを混同していないか |

## なぜこの構成で動くか

EXRの**Object ID**は元画像に付属する画素単位のデータです。Bitmap MaskはそのIDを手掛かりに単一チャンネルのMaskを作り、Color CorrectorはそのMaskの値に応じて処理範囲を限定します。画像の色に依存せず物体を分けられる理由は、RGBとは別にIDが保持されているためです。

関連する説明は[補助チャンネル / AOV](../../learn/02-data/auxiliary-channels.md)と[マスク](../../learn/02-data/mask.md)にまとめています。個別設定は[Bitmap Mask](../../nodes/masks/bitmap-mask.md)、別々の画像から補助データを組み直す場合は[Channel Booleans](../../nodes/color/channel-boolean.md)、共通のMask接続は[Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask.md)を参照してください。

USDシーンをレンダリングしてEXRに渡す段階は[USDシーンを2D画像・OpenEXRに出力する](../usd/basic-usd-render.md)を参照してください。**uRendererのPrimIDをClassic 3DのObject IDと同じチャンネル・番号規則だと決めつけず**、出力ファイルの内容を確かめてから、このレシピに接続します。

## 出典と検証範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）。

- Chapter 77「Understanding Image Channels」**pp.1688–1693**：Loader / MediaInでの補助チャンネル割り当て、Viewer表示、Object ID / Material ID、別ファイルのZを使う場合のチャンネル操作。
- 同Chapter 77 **pp.1697–1698**：Mergeの補助チャンネル伝搬とOpenEXR内の任意チャンネル。
- Chapter 108「Bitmap Mask [Bmp]」**pp.2463–2467**：2D Image入力、Use Object / Use Material、Soft Edge、Effect Mask。
- Chapter 69「Editing Parameters in the Inspector」**pp.1502–1503**：Object/Material IDのSample ControlsとCorrect Edges、Coverage / Background Colorの前提。
- Chapter 66「Working in the Node Editor」**pp.1410–1413**：Studio版の多層画像、Process Layers / Input Layer / Effect Mask Layerの選択。

本文は21.1 Manualの記述を組み合わせた制作手順です。**特定の外部EXRに含まれるIDの命名・データ型・境界処理、Free版の動作、実機による往復検証は未確認**のため、`verification: partial`としています。
