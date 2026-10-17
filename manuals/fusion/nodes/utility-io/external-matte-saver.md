---
title: External Matte Saver
description: Fusion Studioから複数のマットをOpenEXRの別チャンネルへまとめ、ResolveのColorページで個別に使う手順を説明。
doc_type: node
term_id: external-matte-saver
verification: partial
aliases: [External Matte Saver, EMS]
concepts: [image-data, multilayer, file-io]
nodes: [External Matte Saver]
node_family: utility-io
controls: [Filename, Browse, Channels, Channels Name, Node Name, Add]
inputs: [image]
outputs: []
tasks: [save-mattes, exr, resolve-connect]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-15"
---

# External Matte Saver

**External Matte Saverは、Fusion Studioで作った複数のマットを1つのOpenEXRファイルにまとめて保存するノードです。** 書き出したファイルをDaVinci ResolveのColorページで読み込み、人物だけ、空だけ、看板だけ、といった範囲を個別に色補正するときに使います。

マット（matte）は画像のどの部分へ処理を適用するかを表す情報です。たとえば人物が白、背景が黒のマットをColorページの補正ノードへ渡せば、背景を変えずに人物を調整できます。OpenEXR（拡張子 .exr）は1ファイル内に複数の画像チャンネルやレイヤーを保存できる形式です。External Matte Saverは各マットへ名前を付けてEXRに格納する作業を簡単にします。

**このノードを使えるのは単体アプリのFusion Studioです。** DaVinci Resolve StudioのFusionページとは区別してください。Resolve側では、Fusion Studioから書き出したEXRを受け取って使います。

## 入力と出力

| 接続・出力先 | 内容 |
| --- | --- |
| 最初のImage入力（オレンジ） | 保存したい2D RGBA画像を1本受け取る |
| Addで追加するImage入力 | 別の2D RGBA画像を受け取る。増やした端子は識別用に異なる色になる |
| ディスク上のEXRファイル | 各入力から選んだチャンネルを名前付きのマットとしてまとめる |

最初から複数の入力端子が並ぶわけではありません。Inspectorの**MattesタブでAddを押すと、新しい入力端子と、それに対応する設定欄が増えます**。すべての入力は2D RGBA画像用です。端子の色によってデータ型が変わるわけではありません。

**ファイル保存が終点**なので、通常の処理ノードのように後段へ完成画像を流すための出力端子はありません。上表の「出力」はNode Editor内のポートではなく、ディスクに保存されるファイルです。

### 上流で用意する画像

[Delta Keyer](../matte-keying/delta-keyer)などで人物の背景を抜くと、人物の形を表すAlpha（透明度）チャンネルが得られます。そのRGBA画像をこのノードへ接続し、ChannelsでAlphaを選択すれば、人物のマットをEXRへ保存できます。

Polygonのようなマスク形状を作るノードの出力を、External Matte Saverが受け取るRGBA画像と同じものだと決めつけないでください。**保存する形が実際に画像のどのチャンネルへ入っているか**をViewerなどで確認してから接続します。

## Inspectorの設定

### Controlsタブ

| 項目 | 役割 |
| --- | --- |
| **Filename** | 保存するファイルの名前とパス。末尾に **.exr** を指定する |
| **Browse** | ファイルブラウザーから保存先を選ぶ |

Manualは、Filenameの末尾へ .exr を付けてOpenEXRとして保存する方法を指定しています。通常の動画や別形式を出力するための汎用Saverとは目的が異なります。

### Mattesタブ

入力ごとに一組の設定があり、保存チャンネルとマット名を指定できます。

| 項目 | 役割 |
| --- | --- |
| **Channels** | その入力の **Alpha / RGB / RGBA** のどれを保存するか選ぶ |
| **Channels Name** | 書き出すマットの名前を付ける。ResolveのColorページでもこの名前で区別できる |
| **Node Name** | 入力へ接続した元ノードの名前を表示する。接続時に自動入力される |
| **Add** | 新しい入力端子と、それに対応する一組の設定欄を追加する |

**Node Nameは接続元を示し、Channels Nameは保存先で見分けるための名前**です。両者は別の設定です。

Channelsは入力に何が含まれるかで選びます。人物の輪郭がAlphaに入っているならAlpha、マット情報がRGB側にあるならRGBという使い分けです。RGBを選択しただけで別入力のAlphaが作られるわけではありません。

### Settingsタブ

21.1 Manualには、Saverなどと共通するSettingsタブも掲載されています。Blend、Process When Blend Is 0.0、RGBAチャンネル選択、Apply Mask Inverted、Multiply by Maskなどが共通設定として説明されています。

これらはMattesタブの**入力数・マット名・保存チャンネル**とは別の設定です。まずControlsとMattesを設定し、必要がなければ共通項目を変更しない方が、書き出すマットの状態を確認しやすくなります。

## 制作例1：人物のマットをColorページへ渡す

1. Fusion Studioでグリーンバックの人物素材を[Delta Keyer](../matte-keying/delta-keyer)へ接続し、背景が抜けてAlphaが得られることを確認します。
2. Delta Keyerが出す**RGBA画像**をExternal Matte Saverの最初の入力へつなぎます。
3. MattesタブでChannelsを**Alpha**、Channels Nameを **person** などに設定します。
4. Filenameを **shot01_mattes.exr** のように指定し、EXRをレンダリングします。
5. DaVinci Resolveへ渡した後、元のショットとマットのフレーム位置・画面サイズが合っていることを確認します。

これで人物を分離した情報をColorページへ持ち込み、肌の色や明るさだけを調整するためのキーとして利用できます。完成画像は別に用意し、マットは補正する範囲の指定に使います。

## 制作例2：人物・空・看板を個別に補正する

夜景のショットで、人物を明るく、空を青く、店の看板を鮮やかにしたい場合です。それぞれの領域を独立した2D RGBA画像のAlphaへ入れておきます。

~~~text
人物のAlphaを持つRGBA画像 ──┐
空のAlphaを持つRGBA画像   ──┼→ External Matte Saver → shot02_mattes.exr
看板のAlphaを持つRGBA画像 ──┘
~~~

最初の画像を接続したらMattesタブでAddを2回押し、入力を計3本に増やします。各入力のChannelsをAlphaにして、Channels Nameを **person / sky / sign** と区別します。

1つのEXRから必要なマットを選んで別々の補正ノードへ渡せるので、領域ごとのマットを個別の画像ファイルとして管理する手間を減らせます。

## 制作例3：CGの領域別パスを渡す

CGレンダリングで車体・窓・道路の領域を別々に色補正したいときも、各領域の情報を持つ2D RGBA画像を用意して同じように接続できます。ここでいう「パス」は、完成画像とは別にレンダラーから出される素材や領域情報です。

External Matte Saverが画像を見て車体や窓を自動認識するわけではありません。**上流で作った領域情報を名前付きのチャンネルとして保存する**のがこのノードの仕事です。Color側では車体だけの色味調整や窓だけの反射表現調整に利用できます。

## DaVinci ResolveのColorページで使う

Fusion Studioから書き出したEXRは、ResolveのMedia Poolへ取り込んで使います。21.1 ManualではMedia Storageでファイルを右クリックし、**Add to Media Pool as a Matte**を選ぶ方法が説明されています。Clip matteとして特定のショットへ関連付ける方法と、Timeline matteとして別に管理する方法があるため、使用範囲に合わせて登録します。

ColorページのNode Editorで補正対象クリップを開き、ノードを右クリックして**Add Matte**からEXRを選びます。**EXT MATTE**ノードが現れます。複数レイヤーを含むOpenEXRでは、EXT MATTEノードを右クリックして**Select Matte**から、利用するレイヤーを選択します。取り出したキー出力を補正ノードの**Key入力**へつなぐと、そのマットを補正範囲に使えます。

~~~text
EXR → EXT MATTE（personを選択） ── Key → 人物用の補正ノード
EXR → EXT MATTE（skyを選択）    ── Key → 空用の補正ノード
~~~

**レイヤーを選ぶことと、補正ノードへKeyとして接続することは別の操作**です。レイヤーを切り替えただけで全補正へ自動適用されるわけではありません。

### マットが映像とずれる場合

マットの**解像度・位置・尺**は、補正するショットと合わせて書き出すのが基本です。ずれた場合はColorページのEXT MATTEを選択し、Keyパレットの**Lock Matte**を解除してから、**Offset**で時間位置、**Pan / Tilt / Zoom / Rotate / Width / Height / HFlip / VFlip**で位置や形状を調整する方法がManualに掲載されています。

マットの出力段階でショットに正確に合わせておけば、このような追加補正を減らせます。

## Saver・MediaOutとの違い

| ノード | 使用する場所 | 主な出口 |
| --- | --- | --- |
| **External Matte Saver** | Fusion Studio | 複数のマットを格納したEXRファイル |
| [Saver](./saver) | Fusion Studio／ResolveのFusionページ（Resolve内はEXR連番） | Imageをディスクへ書き出す。ResolveではEXRの手動キャッシュなどに使う |
| [MediaOut](./media-out) | DaVinci ResolveのFusionページ | 合成結果をResolve内部のTimelineなどへ渡す |

通常のSaverで複数マットをまとめて保存する場合は、Channel Booleanなどで保存先チャンネルを組み、名称も設定する必要があります。External Matte Saverは**入力の追加とチャンネル名の設定を1か所で行える**のが利点です。

DaVinci Resolve内のFusionページから直接Colorページへマットを渡したい場合は、追加の[MediaOut](./media-out)を使う経路もあります。EXRをファイルとして受け渡す必要があるかで選びます。

## 出典と確認範囲

**DaVinci Resolve 21.1 Reference Manual（September 2026）**を基準としています。

- **Chapter 116「Resolve Connect」pp.2723–2725**：Fusion Studio限定、2D RGBA入力、Addによる動的入力追加、EXR、InspectorのControls／Mattes／Settings。
- **Chapter 17「Adding and Organizing Media with the Media Pool」p.375**：外部マットをMedia Poolへ登録する方法、OpenEXRのマットの扱い。
- **Chapter 146「Combining Keys and Using Mattes」pp.3421–3425**：EXT MATTE、Key接続、Select Matteによるレイヤー選択、時間・位置合わせ。

Inspectorの全初期値、EXR内部の厳密なチャンネル構造、OSごとの細かなUI差、書き出し操作の詳細は、21.1実機で独立検証していません。
