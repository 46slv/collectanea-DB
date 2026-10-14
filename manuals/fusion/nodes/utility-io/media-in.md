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

画像が正しく合成されるためには、MediaInが読む素材の色の解釈と、Fusionでの計算空間を区別する必要があります。

| 項目 | 役割 |
| --- | --- |
| Source Color Space | ソース画像の色空間をAutoまたはSpaceから指定する |
| Source Gamma Space | Auto／Space／Logでガンマの解釈を選ぶ |
| Remove Curve | 選択したガンマ曲線を除去する、またはLogからLinearへ変換する |
| Pre-Divide/Post-Multiply | Straight AlphaとPremultiplied Alphaの扱いを必要に応じて調整する |

Source Color Spaceで色空間を選ぶ操作**だけ**では、Gamutによる色空間変換と同じ画素値変換にはなりません。ManualのFusion Fundamentalsでは、色空間の指定が画像メタデータに反映され、後段の[Gamut](../color/gamut)がその情報を参照できると説明されています。一方、**Remove Curveはガンマ曲線を実際に除去する操作**です。

Resolve Color Management（RCM）が有効なプロジェクトでは、MediaInからFusionへ出る画像をLinearへ変換し、MediaOutからTimeline色空間へ戻す管理経路がManualに記載されています。RCMを使わない場合は、素材の色空間・ガンマと必要な変換を個別に確認します。見た目が違うからといって、根拠なく同じ変換を二重に加えないことが重要です。

Alphaは透明度を表すチャンネルです。合成の縁に暗い線や不自然な色が出る場合は、まず素材がStraightかPremultipliedか、後段のNodeがどう解釈しているかを確認します。Pre-Divide/Post-Multiplyを一律に有効化する手順ではありません。

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
- **MediaInでEXR補助チャンネルを明示的に扱いたい**：ResolveのEXR直接入力に使う[Loader](./loader)のFormatタブも検討します。

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

正確な内部Parameter ID、Inspector項目の全環境での表示可否、既定値・数値範囲、個別CodecやEditionの動作は21.1実機で総当たり検証していないため断定しません。
