---
title: Optical FlowのベクトルをOpenEXRへ保存して再利用する
description: Fusionの前後Motion VectorをEXR連番へ保存し、LoaderとCopy Auxで値を確かめてからFlow補間に利用する手順。
doc_type: recipe
verification: partial
aliases: [Optical Flow EXR cache, Motion Vector EXR roundtrip]
concepts: [auxiliary-channels, motion-vectors, image-data]
nodes: [Optical Flow, Saver, Loader, Copy Aux, Time Speed, Time Stretcher]
tasks: [motion-vectors, intermediate-render, retime]
prerequisites: [auxiliary-channels]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-20"
---

# Optical FlowのベクトルをOpenEXRへ保存して再利用する

長い素材でOptical Flowを何度も解析すると、速度調整を試すたびに待ち時間が生じます。Fusionでは一度求めた**Motion Vector（画素ごとの移動方向と距離）**をOpenEXRの連番へ書き出し、別の構成で読み込んで利用できます。

例えば、走る人物を撮影した120フレームの素材について、一定のスローモーションと途中から減速するバージョンを比較する場面です。解析結果を保存しておけば、毎回元映像から計算し直すのではなく、保存済みのベクトルを再利用する構成を選べます。

## 保存するデータ

[Optical Flow](../../nodes/optical-flow/optical-flow.md)は連続フレームを比較し、元のRGBA画像に次の**補助チャンネル**を付加します。補助チャンネルは色や透明度とは別に画像が持つ数値データです。

| 名前 | 記録される値 | 意味 |
| --- | --- | --- |
| **Vector** | X・Yの2成分 | 現在の画素が次フレームへ移る方向と距離 |
| **Back Vector** | X・Yの2成分 | 現在の画素が前フレームへ移る方向と距離 |

どちらも画素単位の移動を表し、負の値を取る場合があります。**色として表示された赤・緑と、実際の数値は同じものではありません。** 値を調べたり後段へ渡したりするときは、floatの精度とチャンネルの対応を確認します。

## 1. Optical Flowを一度だけ計算して保存する

~~~text
MediaIn（元素材）
  └─ Optical Flow ──┬─ Saver（OpenEXR連番をディスクへ書き出す）
                    └─ Viewer（解析したベクトルを確認する）
~~~

1. 解析したい素材をMediaInから渡します。まず必要な区間だけに限定します。Fusion Studioなら通常のLoaderを入力として使えます。
2. Optical Flowを接続し、動きがある数フレームを表示して解析します。Viewerで**Channel > Vectors**を選ぶとベクトルを確認できます。**Options > Normalize Color Range**は表示上の確認用です。
3. Optical Flowの出力から分岐して[Saver](../../nodes/utility-io/saver.md)を接続し、保存先と末尾が`.exr`のファイル名を指定します。
4. **Fusion > Render All Savers**を実行し、必要なフレーム範囲をEXR連番へ保存します。保存されたファイルの数と開始・終了フレームを確認します。

Saverは映像をディスクへ書き出す終端ノードであり、次のノードへ画像を返す端子ではありません。読み直すときは別途Loaderを置きます。DaVinci ResolveのFusionページでは、このSaverは**EXR書き出し用**です。動画全体の納品はMediaOutとDeliverを使います。

## 2. Loaderで再読込し、必要なチャンネルを割り当てる

~~~text
Loader（書き出したEXR）
  ├─ Copy Aux（確認専用） ── Viewer
  └─ Time Speed / Time Stretcher（Flow） ── MediaOut
~~~

1. [Loader](../../nodes/utility-io/loader.md)で保存済みEXR連番を指定します。ResolveのFusionページでは、Loaderを**Effects Library > Tools > I/O**から追加できます。
2. Loaderの**Format**タブで、EXRに収録された追加チャンネルを確認し、必要なForward / Back VectorがFusionの補助チャンネルへ正しく対応するよう設定します。
3. 元のOptical Flowから直接渡した結果と、Loaderから読み直した結果を同じフレームで比較します。**画像が表示されることだけではベクトルの保持を証明できません。**
4. ベクトルが見つからなければ、保存されたEXRのチャンネル名、Loader側の割り当て、OpenEXRの書き出し条件を見直します。特定のEXRチャンネル名が常に使われるとは限りません。

Optical Flowには**Output Vectors as Layers**もあります。レイヤーとして出力した場合と補助チャンネルとして扱う場合は同じ前提にできません。保存したEXRの実際の構成に合わせてLoaderを設定し、データが期待した場所にあるか確かめます。

## 3. Copy AuxでX・Yの数値を確認する

[Copy Aux](../../nodes/color/copy-aux.md)は、画像の中にある補助チャンネルを通常のRGBAへコピーするノードです。**EXRの別ファイルを読み込む機能ではありません。** この例ではLoaderの後ろに接続し、解析結果と再読込結果を比較するために使います。

1. Loaderから**確認専用の枝**を作り、Copy Auxのオレンジ色のInputへ接続します。
2. **Mode = Aux to Color**、**Aux Channel = Vector**を選びます。2成分のX・YはRGBAの**Red・Green**へコピーされ、Blueは0、Alphaは1になります。
3. **Out Color Depth = Force Float32**を選びます。負のベクトル値を整数形式で失わないためです。
4. **Channel Missing = Fail**にして、対象の補助チャンネルが無いときにエラーで気付けるようにします。
5. **Aux Channel = Back Vector**へ切り替え、前方向・後方向の両方が保存されているか確認します。移動している領域と静止した領域を複数フレームで比べます。

Viewerで見やすくする目的なら**Enable Remapping**で表示範囲を固定できますが、値そのものが変わるため、**数値の照合時は無効**にします。また**Kill Aux Channels**を有効にすると出力から補助チャンネルが削除されます。確認用の枝と、Flow補間へ送る本線は分けておきます。

## 4. 保存したベクトルで速度を変える

一定速度のスローモーションでは[Time Speed](../../nodes/time-metadata/time-speed.md)を使います。例えば**Speed = 0.5**にして**Interpolate Mode = Flow**を選ぶと、前段に用意した動きの情報を利用して中間フレームを作る構成です。途中で速度を変えるなら、[Time Stretcher](../../nodes/time-metadata/time-stretcher.md)の**Source Time**をアニメーションさせます。

~~~text
Loader（RGBA + Vector / Back Vector）
  └─ Time Speed（Flow）またはTime Stretcher（Flow）
       └─ MediaOut
~~~

**重要：** 21.1マニュアルは、Time Speed / Time Stretcherが必要とする前後ベクトルのレイヤー順と、Optical Flow側の生成順に違いがあり、直接接続時に追加解析が必要になる場合があると説明しています。Loaderでベクトルが読めたことだけをもって「再解析なしでFlow補間できた」と判断しないでください。実機では処理時間とベクトルの選択・並びを確認します。

またTime Speed / Time Stretcherは、補間に使ったVector / Back Vectorを**出力時に破棄**します。速度変更後の映像にもベクトルが必要なら、後段でOptical Flowを作り直すなど、出力側の時間に合わせて新たに解析します。

## 問題が起きたとき

| 症状 | 確認すること |
| --- | --- |
| EXRは読めるがFlow補間できない | Loader Formatの補助チャンネル割り当て、Vector / Back Vectorの両方、レイヤー構成と並び |
| Copy Auxで値が出ない | Aux Channel名、Channel Missing、ファイル側の保存データ |
| ベクトルの負値が消える | Out Color Depth、RGBAの整数化、表示用Remappingを本線に混ぜていないか |
| 再生が依然として重い | Flowが追加解析していないか、保存前後のチャンネル構成と処理範囲 |
| 途中からフレームがずれる | 元素材とEXRの開始番号、LoaderのTrim / Globalと尺 |
| 速度変更後の別ノードがベクトルを使えない | Time Speed / Time Stretcherの出力でベクトルが破棄される仕様 |

## 関連記事・出典

- [外部レンダラーのMotion Vectorでブラーを作る](./exr-motion-vector-blur.md) — 別途出力されたベクトル画像をVector Motion Blurへ渡すレシピ。ここで扱うFusion自身の解析結果の保存・再利用とは異なります。
- [補助チャンネル / AOV](../../learn/02-data/auxiliary-channels.md) — RGBA、補助チャンネル、レイヤーの区別。
- [Optical Flow](../../nodes/optical-flow/optical-flow.md)、[Copy Aux](../../nodes/color/copy-aux.md)、[Loader](../../nodes/utility-io/loader.md)、[Saver](../../nodes/utility-io/saver.md) — 各ノードの入力・設定。

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、**Chapter 87 pp.1901–1903**（Vector / Back VectorとEXR再利用）、**Chapter 64 pp.1345–1346, 1354**（EXRのLoader / SaverとFormat）、**Chapter 93 pp.2182–2185**（Copy AuxのMode、精度、Remapping）、**Chapter 111 p.2607**（Time SpeedのFlowと補助チャンネルの破棄）、**Chapter 112 p.2618**（Optical Flowの入出力とViewer）。

[Blackmagic Design公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)

実機でのEXR内の正確なチャンネル配置、保存時の全データ保持、Flow補間が追加解析なしで動く条件、Edition差は未検証です。このため`verification: partial`としています。
