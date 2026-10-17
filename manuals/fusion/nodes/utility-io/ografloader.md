---
title: "OGrafLoader"
description: "OGraf（.json）とLottie（.lottie）のアニメーションをFusionに読み込み、時間・ループ・表示領域を制御する。"
doc_type: node
term_id: "ografloader"
term_short: "OGrafLoaderは、外部のOGrafやLottieアニメーションを読み込み、2D画像として出力するNode。"
verification: partial
aliases: ["OGrafLoader", "OGL"]
concepts: ["image-data", "effect-mask"]
nodes: ["OGrafLoader"]
node_family: "utility-io"
controls: ["Global In", "Global Out", "Template Path", "Trim In", "Trim Out", "Time Scale", "Hold First Frame", "Hold Last Frame", "Loop", "Play", "Stop"]
inputs: ["mask"]
outputs: ["image"]
tasks: ["route-data"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-15"
---

# OGrafLoader

**OGrafLoaderは、外部で作ったOGrafやLottieのアニメーションをFusionへ読み込み、2D画像として出力するNode**です。動くロゴ、タイトル、放送用グラフィックを実写映像へ重ねたい場合に使います。Text+のようにFusion内で文字を一から組み立てるNodeとは異なり、制作済みのファイルを読み込むための入口です。

OGrafは、欧州放送連合（EBU）が異なる制作・送出システムの間で放送用グラフィックを扱えるよう定めたHTML5ベースの仕様です。DaVinci Resolve 21.1はOGraf（.json）とLottie（.lottie）のアニメーションを扱えます。Manualが対応OSとして挙げているのはmacOSとWindowsであり、Linuxやすべての外部テンプレートでの動作は本記事では保証しません。

## 入力・出力

| 接続・設定 | 扱うもの | 役割 |
| --- | --- | --- |
| **Template Path**（Inspector） | OGrafまたはLottieのファイルパス | 読み込む素材を指定する。Nodeの入力端子ではない |
| **Effect Mask**（青い入力、任意） | 2D Mask | 読み込んだ画像のうち、表示する領域を制限する |
| **出力** | 2D Image | 各フレームの画像をほかの画像処理NodeやMergeへ渡す |

**画像をつなぐ必須入力端子はありません。** ファイルをTemplate Pathで指定し、必要なときだけEffect Maskをつなぎます。Effect Maskは読み込み・処理後の画像に適用され、元のファイルを書き換えるものではありません。Maskと透明度の違いは[Maskの基本](../../learn/02-data/mask)も参照してください。

実写映像に動くロゴを重ねる最小構成は次のとおりです。

    OGrafLoader ────────→ Merge（Foreground）──→ MediaOut
    MediaIn（実写） ────→ Merge（Background）

Foregroundは前景、Backgroundは背景です。[Merge](../compositing/merge)が2枚の画像を合成します。透明部分（Alpha）を持つ素材なら背景映像がそこから見えます。公式ManualはOGraf/Lottie素材のAlphaを認識し、透明度を保持できると説明しています。

## 主な設定項目

### 素材の指定と表示期間

| Inspector項目 | 変更すると何が起きるか |
| --- | --- |
| **Template Path** | 取り込むOGraf/Lottieファイルを選ぶ。Browseまたはパス入力で指定 |
| **Global In / Global Out** | Composition上で画像を出力する開始・終了フレームを決める。範囲外では出力しない |
| **Trim In / Trim Out** | 素材の先頭・末尾から使わない部分を除く |
| **Time Scale** | アニメーションの再生速度を調整する。Global Rangeの長さにも影響する |
| **Hold First Frame / Hold Last Frame** | 最初・最後の静止フレームを指定したフレーム数だけ引き延ばす |
| **Loop** | 指定した使用範囲をプロジェクトの終端まで繰り返す |

**Global In/OutはFusion上の配置、Trim In/Outは素材内部の使用部分**を指定します。たとえば素材冒頭の待機時間をTrim Inで除いても、完成した区間がCompositionの何フレーム目から現れるかはGlobal Inで決まります。

Global In/Outの間隔を素材より短くすると、FusionはTrimを自動調整します。素材より長くすると、Hold First/Last Frameを使って長さを補います。長さを変えずに時間位置だけ移動したい場合は、範囲バーの中央をドラッグするかGlobal Inの値を変更します。表示期間を変えた後は、TrimとHoldも確認してください。

**Holdで引き延ばした静止フレームもLoopの対象**です。ループの途中で同じ絵が長く止まる場合、意図しないHoldが入っていないか確認します。

通常の[Loader](./loader)と似た時間制御がありますが、**OGrafLoaderにReverse（逆再生）の項目はありません**。一般的な動画Loaderと同一の操作を前提にしないでください。

### Scheduled Actions：Play / Stop

対応するOGrafテンプレートにEase In / Ease Outなどの動きがある場合、Scheduled Actionsの**Play**と**Stop**でアニメーションを開始・停止するフレームを指定できます。これはNodeそのものの表示期間を決めるGlobal In/Outとは別です。

Manualでは、**single-step templateのPlayは先行するStopがなければ効果を持たない**と説明されています。Playを設定しても動作が始まらない場合は、テンプレートがScheduled Actionsに対応するか、StopとPlayの順序が適切かを確認してください。すべてのLottieファイルに同じ再生制御が備わっているわけではありません。

## 具体的な運用例

### Lottieのロゴを実写に重ねる

1. OGrafLoaderを追加し、Template Pathで透明背景のLottieロゴを指定します。
2. Viewerで動きとAlphaを確認します。読み込んだ素材の背景が透明なら、映像と合成できます。
3. ロゴを[Merge](../compositing/merge)のForeground、映像の[MediaIn](./media-in)をBackgroundに接続します。
4. Global Inで表示開始位置を決め、素材の不要な冒頭があればTrim Inで除きます。
5. ロゴが完成形になってから数秒間残したい場合はHold Last Frameを設定し、Merge後の映像で終了位置を確認します。

OGrafLoaderとMergeの間へTransformなどを入れれば、読み込んだロゴの位置や大きさを調整できます。元の動画クリップへロゴを直接書き込む必要はありません。

### 放送用テロップの登場・退場

1. 登場・退場アニメーションを備えたOGrafテンプレートをTemplate Pathで指定します。
2. Global In/Outでテロップ全体の表示期間を決めます。
3. テンプレートの機能に応じてPlay/Stopを指定し、登場と退場のタイミングを確認します。
4. 動きが止まった場合は、Play/Stopに加えてHoldとLoopの設定も確認します。
5. MergeのForegroundとして実写映像へ重ねます。

この例では、**テロップが画面に存在する期間**と**テロップ内部のアニメーションの開始・停止**を別々に調整します。テンプレートがScheduled Actionsに対応していなければ、その機能を使う前提で制御しないでください。

### Maskで表示領域を限定する

1. OGrafLoaderでアニメーションを読み込みます。
2. [Rectangle Mask](../masks/rectangle-mask)で画面の一部分を囲みます。
3. Rectangle Maskの出力をOGrafLoaderの青いEffect Mask入力につなぎます。
4. OGrafLoaderの出力をMergeで映像へ重ねると、指定した領域だけに動く画像を表示できます。

たとえば実写内のディスプレイやパネル部分にだけ動く模様を見せる場合に使えます。Maskは表示領域を制限するもので、OGraf/Lottie内の文字やアニメーションそのものを編集する機能ではありません。

## 関連Node・注意点

- [Loader](./loader)：通常の画像・動画・連番を読み込むためのNode。OGrafLoaderはOGraf/Lottieを対象にします。
- [MediaIn](./media-in)：ResolveのTimelineやMedia Pool由来の映像をFusionへ渡すNode。
- [Merge](../compositing/merge)：OGrafLoaderの2D Imageを背景映像へ合成するNode。
- [Generatorの一覧](../generators/)：新しい画像を作るNode群。OGrafLoaderは21.1 ManualのGenerator Nodes章に載っていますが、本DBでは外部ファイルの読み込み役としてI/Oに分類しています。

Inspector共通のImage/Settings項目、数値の既定値と範囲、実機REGID、Edition差、外部アセットを含むテンプレートの互換性は、この資料だけでは確定できません。

## バージョン・出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）**を参照しました。

- Chapter 103、pp.2376–2378：OGrafLoader [OGL]の入力、OGraf Tab、Global In/Out、Trim、Time Scale、Hold、Loop、Scheduled Actions、Reverse非対応。
- Chapter 64、p.1352：OGraf（.json）/ Lottie（.lottie）の読み込み、macOS/Windows対応、Alpha保持。

Manualの仕様記述に基づく記事であり、21.1実機で端子名・既定値・素材互換性を検証した結果ではありません。そのためfrontmatterのverificationはpartialのままです。
