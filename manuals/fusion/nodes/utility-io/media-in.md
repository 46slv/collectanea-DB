---
title: "MediaIn"
description: "DaVinci ResolveのTimelineやMedia Poolの素材をFusionへ渡す入力Node。取得元、時間、色、音声の違いを説明。"
doc_type: node
term_id: "media-in"
term_short: "MediaInは、ResolveのTimelineやMedia Poolにある素材をFusionの画像として取り込むNode。"
verification: partial
aliases: ["MediaIn", "Media In", "MI"]
concepts: ["image-data", "resolve-integration", "source-boundary"]
nodes: ["MediaIn"]
node_family: "utility-io"
inputs: ["effect-mask"]
outputs: ["image"]
tasks: ["source", "import", "cross-page-workflow"]
level: foundation
product_scope: resolve
suite_surfaces: ["edit", "fusion"]
updated: "2026-10-15"
---

# MediaIn

**MediaInは、DaVinci Resolveが管理する映像・静止画をFusionの2D Imageとして取り出す入口です。** Edit／CutページのTimelineに置いたクリップをFusionで加工するときや、Media Poolに登録した別素材を合成に加えるときに使います。Fusion Studioでディスク上のファイルを読む[Loader](./loader)に近い役割ですが、MediaInは**Resolve専用**で、TimelineやMedia Poolとの関係を持ちます。

通常、TimelineのクリップからFusionページを開くと、次のFlow（Nodeの接続図）が作られます。

```text
MediaIn1 → 加工するNode → MediaOut1
```

MediaInが素材を読み出し、[MediaOut](./media-out)が処理後の画像をResolve側へ返します。MediaInだけではファイルを書き出しません。

## 入力・出力

| 端子 | 役割 |
| --- | --- |
| 青いEffect Mask入力 | PolygonやEllipseなどで作ったMaskを受け、MediaInの画像を表示する範囲を制限する |
| 2D Image出力 | 読み出した画像をTransform、Merge、Keyerなどの後段Nodeへ渡す |

MediaInには**元画像を入れるImage入力端子はありません**。画像の取得元はResolveのクリップ参照によって決まります。

Effect Maskは、画像のどこを見せるかを制御するための白黒・濃淡の領域データです。例えばPolygonで人物の周囲を囲ってEffect Maskへ接続すると、囲った部分だけがMediaInから出力されます。Mask内にまだ形を描いていない場合、全体が透明になり、画像が消えたように見えることがあります。先にMaskの輪郭を完成させてから接続すると確認しやすくなります。

## MediaInを作る4つの経路

| 操作 | 得られるMediaIn |
| --- | --- |
| Edit／CutのTimeline上に再生ヘッドを置いてFusionページを開く | Timelineのクリップを参照するMediaIn。通常はMediaOutへ接続済み |
| FusionのMedia PoolからNode Editorへクリップをドラッグする | Media Poolの素材を参照する別のMediaIn |
| OSのファイルウィンドウからNode Editorへドラッグする | ファイルをResolveのMedia Poolへ登録し、MediaInとして追加 |
| Fusion > Import > PSDでPSDを読み込む | PSDの各レイヤーを個別のMediaInとして追加 |

**Effects LibraryのI/OにあるMediaInを単に追加しても、それだけで任意のファイルを読み込めるわけではありません。** 上記の経路で対象クリップと結び付けます。

Media Poolから空白部分へドラッグしたMediaInは通常、既存のFlowと未接続です。既存の映像に重ねるなら[Merge](../compositing/merge)で合成します。Media Poolから既存の接続線上へドラッグすると、Foregroundとして重ねるMergeが作られる操作もManualで案内されています。

なお、通常の**単独Timelineクリップ**からFusionを開いた場合、素材の解像度はTimeline解像度ではなく**元クリップの解像度**です。解像度が異なる素材を合成する場合は、最終出力だけでなく途中の画像サイズも確認します。

## Imageタブ：どの画像を読むか

### Timelineから開いた場合の主な項目

| 項目 | 内容 |
| --- | --- |
| Clip Name | 関連付けられたクリップ名を表示 |
| Process Mode | Full Framesまたはインターレースのフィールド処理方式を選択 |
| Media Source | Timeline／Background／Media Poolのどこから画像を参照するかを選択 |
| Layer | マルチレイヤー画像、PSD、複数レイヤーから作成したFusion Clipで対象レイヤーを指定 |

**Media Sourceの3種類は同じ映像を示すとは限りません。**

- **Timeline**：EditのTimeline上にあるクリップを参照します。通常の初期値です。
- **Background**：Editの下位ビデオトラックにある画像を取得します。下位トラックを重ね合わせた結果をFusion側で使う場合に選びます。
- **Media Pool**：Timelineを経由せず、Media Poolの元クリップを参照します。Timeline側の編集結果ではなく元素材側を読む点に注意します。

例えば、上位トラックの人物映像をFusionで加工していて、下位トラックの背景映像を一緒に参照したいときはBackgroundが関係します。一方、上位トラックのクリップそのものに加工を加えたいだけなら、通常はTimelineのままで構いません。

Timelineから開いたMediaInは、クリップの配置・長さがEdit／Cut側ですでに決まっているため、後述の時間設定がすべて出るわけではありません。**「InspectorにGlobal Inがない」ことは、必ずしもNodeの不具合ではありません。**

### Media Pool／OSから追加した場合の時間設定

| 項目 | 何を変えるか |
| --- | --- |
| Global In／Global Out | FusionのComposition（合成作業全体）の時間軸で、画像を出し始める／出し終えるフレームを指定 |
| Trim In／Trim Out | 元クリップの先頭・末尾のどの範囲を使うかを指定 |
| Hold First Frame／Hold Last Frame | 使用区間の最初・最後の画像を指定フレーム数だけ静止させる |
| Reverse | 元素材を後ろから前へ再生する |
| Loop | TrimやHoldを反映した使用区間を繰り返す |

**Globalは「合成のいつ表示するか」、Trimは「素材のどこを使用するか」**の設定です。例えば長い背景動画の途中だけを使い、それをタイトル登場のタイミングに合わせたいときは、Trimで使用区間を決めてからGlobal Inで合成内の位置を合わせます。

Globalの長さを短くするとFusionがTrimを自動調整し、逆に長くするとHoldを自動調整する場合があります。元クリップより長く表示する設定は、無条件に後続フレームを生成するものではありません。時間の位置合わせにはKeyframes Editorも利用できます。

時間制御は[Loader](./loader)と似ていますが、**Timeline由来のMediaInとMedia Pool由来のMediaInではInspectorの項目が異なる**ため、両者を同じものとして扱わないでください。

## 色空間・ガンマ・Alpha

MediaInは画像の色空間・ガンマとAlphaを解釈して後段へ渡します。**色空間の指定**、**画素値の変換**、**透明部分のRGBの扱い**は別の操作です。

| 項目 | 何を指定・変更するか |
| --- | --- |
| Source Color Space | 出力画像の色空間。AutoはTimelineの色空間、RCMが有効ならRCMが割り当てた色空間を参照する。Spaceで明示指定もできる |
| Source Gamma Space | 出力画像のガンマ。AutoはTimelineまたはRCMのガンマを参照し、Space／Logで明示指定できる |
| Remove Curve | 指定・取得したガンマ曲線を除去する、またはLogからLinearへ実際に変換する |
| Pre-Divide/Post-Multiply | 必要な場合にStraight AlphaのRGBをPremultiplied Alphaとして後段へ渡す |

**Source Color Spaceを手動で選んでも、それだけで[Gamut](../color/gamut)のような画素値の色空間変換は実行されません。** 色空間の情報を画像へ関連付け、後段が解釈できるようにする設定です。対してRemove Curveはガンマ曲線を除去するため、画素値に影響します。

Resolve Color Management（RCM）が有効なプロジェクトでは、ManualはMediaInからFusionへの画像をLinearへ変換し、MediaOutでTimeline色空間へ戻す経路を説明しています。RCMを使わない場合は素材と作業空間を確認して必要な変換を組みます。どちらの場合も、色が違って見えることだけを理由に同じ変換を二重適用しないでください。

### Clip AttributesのAlpha ModeとMediaInの違い

**Alpha（アルファ）**は画素の透明度です。RGBがAlphaで乗算されていない画像を**Straight（非乗算）**、乗算済みの画像を**Premultiplied（乗算済み）**と呼びます。例えばRGBが1.0、Alphaが0.5の画素をPremultipliedにすると、RGBは0.5になります。乗算をさらに繰り返すとRGBが0.25になり、輪郭が暗くなる原因になります。

素材ファイルにAlphaが収録されている場合、Media Poolの対象クリップで **Clip Attributes > Video > Alpha Mode** を確認します。ここではAlphaを無視するNone、Premultiplied／Straightの解釈、反転を選択できます。利用できる選択肢は素材形式によって異なります。Alphaを持たない一般的な動画では表示されない項目もあります。

MediaInの**Pre-Divide/Post-Multiply**は、必要な場合にStraightの画像をPremultipliedにして後段へ渡すための設定です。一方、Color Correctorなどの色補正Nodeにある**同名の設定**は、すでにPremultipliedの画像を一時的にAlphaで割り、色を補正したあと再乗算する処理です。**同じ名前でも、素材入力時の解釈と色補正時の処理を混同しないでください。**

[Merge](../compositing/merge)の通常の前景合成はPremultipliedを想定します。Straightのまま重ねると明るい縁が出る場合があり、二重に乗算すると暗い縁が出ます。問題があればClip Attributesの解釈、MediaInの設定、途中のAlpha Multiply／Alpha Divideや色補正Nodeを順に確認します。設定を一律にONにする方法ではありません。

### マルチパートEXRのBeauty Pass

**Beauty Pass**はCGレンダリングの色、光、反射、影などを分けた画像成分です。複数のPassを1つのマルチパートEXR連番に保存できます。MediaInは1ノードにつき**1組のRGBA**を出力するため、複数Passを別々に加工したいときは**同じEXRを参照するMediaInをPassごとに用意**します。

MediaInの**Imageタブ > Layer**ではEXR内のPassを選択できます。個々のRed／Green／Blue／Alphaチャンネルを別々に割り当てたい場合は**Channelsタブ**を使います。例えばAmbient Occlusion（物体の接触部などの間接的な陰影を表すPass）にAlphaがなければ、必要に応じて別のPassに含まれるAlphaを割り当てます。Pass名や収録チャンネルは3Dソフトの書き出し設定によって異なります。

[Loader](./loader)では同様の割り当てをFormatタブで行います。**MediaInにChannelsタブがあること**と、**LoaderがEXRファイルを直接指定できること**を区別してください。深度や法線、動きベクトルなど、RGB画像以外の補助データ（AOV）を扱う場合は、使いたいデータの種類と読み込み先チャンネルも確認します。

## Audioタブ：Fusionで聞く音声

MediaInのAudioタブでは、再生する音声トラックやFusion内での再生タイミングを扱えます。Image出力から「音声の線」が出るのではなく、**Fusionで素材の音を確認するための設定**です。

Media Poolから追加したクリップの音は初期状態ではミュートされています。その音を聞くには、対象MediaInのInspectorでAudio Trackを指定し、Fusionツールバーのスピーカーアイコンを右クリックして対象MediaInを選びます。

**Sound Offset**は音声の再生タイミングをサブフレーム単位でずらす設定ですが、影響するのはFusionページ内の再生です。Edit／Cut／Fairlightページの音声配置を変更するものではありません。

Audio Track、Sound Offsetや他ページ側の音量を変更した後にFusionで古い音が聞こえる場合は、Inspectorの**Purge Audio Cache**でキャッシュを更新します。

## 制作例1：Timelineクリップの不要物を消す

1. Editページで対象ショットに再生ヘッドを置き、Fusionページを開きます。
2. `MediaIn1 → MediaOut1`の間にPaintを挿入します。
3. ViewerでMediaInの画像を確認しながら、PaintのCloneなどで不要物を修正します。
4. MediaOutを通した結果をEditページへ戻して確認します。

この場合、MediaInはTimelineのショットを参照し続けます。Fusionだけの作業のために元クリップを別途Loaderで読み直す必要はありません。

## 制作例2：Media Poolの画像をタイトル背景に重ねる

1. Timelineの映像からFusionを開き、元のMediaInを確認します。
2. Media Poolから動くテクスチャ素材をNode Editorの空白へドラッグし、2つ目のMediaInを作ります。
3. 元のMediaInをMergeのBackground、追加素材をForegroundへ接続します。
4. 追加素材のTrimで使用区間を選び、Global Inでタイトル開始フレームに合わせます。
5. Mergeの結果をMediaOutへ接続し、必要ならForegroundのAlphaやMaskで重なる範囲を調整します。

この構成は、**Timeline上の元映像**と、**Media Poolから別途読み出した合成素材**を分けて扱えます。追加素材が表示されない場合は、Globalの範囲、Mergeの接続、素材のAlphaを順に確認します。

## 制作例3：グリーンバックを抜いてEditページの背景を見せる

1. グリーンバックのクリップをEditページで上のビデオトラックに置き、背景用クリップを下のトラックに置きます。
2. 上のクリップからFusionを開き、MediaInとMediaOutの間に[Delta Keyer](../matte-keying/delta-keyer)を挿入します。
3. キーイングにより緑色部分のAlphaを抜き、MediaOutへ渡します。
4. Editページに戻り、下のトラックの背景が透けて見えることを確認します。

この方法では、Fusion側で背景素材を別のMediaInとして読み込まず、Editページの下位トラックと合成できます。MediaOutへ透明度を正しく返せていることが前提です。

## 制作例4：マルチパートEXRのCGをPass別に調整する

1. 複数のBeauty Pass（例：ColorとReflection）を収めたEXR連番をMedia Poolへ登録します。
2. 同じ素材をFusionのNode Editorへ2回ドラッグし、それぞれ別のMediaInを作ります。
3. 一方のImageタブ > LayerでColor、もう一方でReflectionのPassを指定します。Layerで必要なチャンネルを選べない場合はChannelsタブでRGBAを割り当てます。
4. Reflection側の色や明るさを調整してから、CGの書き出し仕様に合った合成演算でColor側と組み合わせます。必要ならAlphaを別Passから割り当てます。
5. CG全体の結果を、実写MediaInをBackgroundとするMergeへ送り、MediaOutからTimelineへ返します。

Passを分けておけば、反射だけを弱めたり色を変えたりしても、元のCGを毎回3Dソフトで再レンダリングする必要がありません。ただし、**Passの合成方法はレンダリング元が出力したデータの意味によって異なる**ため、すべてを単純加算すれば正しく復元できるとは限りません。

## Loaderとの違いと確認ポイント

| 観点 | MediaIn | Loader |
| --- | --- | --- |
| 利用場所 | DaVinci ResolveのFusionページ | Fusion Studio。Resolve内では主にEXRの直接読み込み |
| 素材の取得元 | Timeline／Media Pool／Resolveに登録した素材 | Filenameで指定したディスク上のファイル |
| 時間の管理 | Timeline由来か追加素材かで利用できる設定が異なる | Loader自身のFileタブなどで制御 |
| 通常の用途 | Resolveの編集素材をFusionで加工・合成 | Fusion Studioのファイル入力、ResolveでのEXR素材入力 |

よくある確認事項：

- **MediaInが真っ黒／透明**：Effect Maskに未描画のMaskをつないでいないか、Globalの表示範囲外ではないか、Media Sourceが意図した取得元かを確認します。
- **編集した長さとFusionの表示が合わない**：Timeline由来かMedia Pool由来かを確認し、後者ならGlobal／Trim／Holdを見ます。
- **色がおかしい**：RCMの有無、Source Color Space／Gamma、Remove Curve、Alphaの解釈を分けて調べます。
- **追加素材の音が出ない**：Audio Track、スピーカーアイコンの選択、Purge Audio Cacheを確認します。
- **マルチパートEXRのPassが違う／見つからない**：MediaInのLayer／Channelsタブで選択・割り当てを確認します。直接ファイルを指定するLoaderならFormatタブです。

## 関連ページ

- [MediaOut](./media-out) — Fusionの画像をTimelineやColorページへ返す
- [Loader](./loader) — ファイルから画像・連番を読み込む
- [Merge](../compositing/merge) — 2つの画像を合成する
- [Delta Keyer](../matte-keying/delta-keyer) — キーイングで透明領域を作る
- [Gamut](../color/gamut) — 色空間変換
- [I/O・Graph Utility一覧](./)

## バージョンと出典

**DaVinci Resolve 21.1 Reference Manual（September 2026）**を基準に記述しました。

- Chapter 104「I/O Nodes」pp.2415–2419：MediaInの作成経路、Effect Mask、Image／Audioタブ、時間制御。
- Chapter 64「Getting Clips into Fusion」pp.1332–1333、1339–1345：TimelineとMedia Poolの導入差、単独クリップの解像度、Media Source、Mask、キーイング、色・音声、Loaderとの使い分け。
- Chapter 9「Data Levels, Color Management, and ACES」p.243：RCM時のFusion内Linear処理とMediaOutへの変換。
- Chapter 21「Modifying Clips and Clip Attributes」p.451：Clip AttributesのAlpha Mode。
- Chapter 77「Understanding Image Channels」pp.1678–1685：Premultipliedの扱い、色補正、EXRのBeauty PassとMediaInのChannelsタブ。

正確な内部Parameter ID、Inspector項目の全環境での表示可否、既定値・数値範囲、個別CodecやEditionの動作は21.1実機で総当たり検証していないため断定しません。
