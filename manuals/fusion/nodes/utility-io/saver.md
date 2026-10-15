---
title: "Saver"
description: "Fusion Studioでの画像・動画書き出しと、ResolveのFusionページでのEXR連番出力を説明。"
doc_type: node
term_id: "saver"
term_short: "Saverは、Fusionの処理結果をディスクへ書き出すI/Oノード。Resolve内ではEXR出力に使う。"
verification: partial
aliases: ["Saver", "SV"]
concepts: ["image-data", "file-io"]
nodes: ["Saver"]
node_family: "utility-io"
inputs: ["image"]
outputs: []
tasks: ["output", "intermediate-render"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-15"
---

# Saver

**Saverは、Fusionで作った画像を動画ファイルや画像連番としてディスクに書き出すノードです。** Fusion Studioでは完成したCompositionを出力するほか、処理途中の枝を別ファイルとして保存するためにも使います。

**DaVinci ResolveのFusionページでは、SaverはEXRファイルの書き出し専用です。** ResolveのTimelineへ映像を返すなら[MediaOut](./media-out)、編集した動画全体を一般的な形式で納品するならDeliverページを使います。SaverとMediaOutは同じ「出力」でも保存先が異なります。

## 入力と出力先

| 接続・出力 | 役割 |
| --- | --- |
| オレンジ色のImage入力 | 保存したい2D Imageを受け取る。Merge、Transform、Color処理などの結果を接続する |
| ディスク上のファイル | Inspectorで指定した場所へ画像連番や動画を保存する。後段のノードへ渡す通常のImage出力ではない |

Saverは入力画像を加工するためのノードではなく、**ファイルへの出力条件を決める終端ノード**です。1つのCompositionに複数置けるので、背景素材と完成画を別々に保存できます。

```text
背景生成・加工 ──┬─────────→ Saver1 → 背景の連番
                └─→ Merge ← 前景素材
                       └────→ Saver2 → 完成画の書き出し
```

Fusion Studioでは複数のSaverに異なる形式を指定できます。ResolveのFusionページではEXRの出力という範囲が変わらない点に注意してください。

## Fileタブ：保存先・形式・保存タイミング

### FilenameとOutput Format

**Filename**に保存先とファイル名を設定し、**Output Format**で書き出し形式を指定します。画像連番では各フレームのファイル名に番号が付き、通常は4桁のゼロ埋めが使われます。名前に数字を明示することで番号の桁数を変えられます。

```text
background0001.exr
background0002.exr
background0003.exr
```

**Output Formatを切り替えても、Filenameの拡張子は自動で変わりません。** EXRから別形式へ切り替えた場合はファイル名も確認します。Resolve内のSaverはEXR用途なので、他の一般的な動画ファイルを直接出力する目的で使用しません。

**Frame Offset**はファイル名に付けるフレーム番号の開始位置を指定する項目です。Compositionの時間上のフレームを移動する設定ではありません。別のレンダリング工程が要求する開始番号に連番を合わせたい場合などに使用します。

### Save Frames

| 設定 | 保存のタイミング | 用途 |
| --- | --- | --- |
| **Full Renders Only** | Start Renderで最終レンダリングするとき | 通常の完成出力 |
| **High Quality Interactive** | インタラクティブに処理された各フレームをその都度保存するとき | Paint・Rotoのフレーム単位の作業 |

High Quality Interactiveは通常のRender Cacheとは違います。**保存済みのフレームに影響するSplineアニメーションを後から変更しても、以前のファイルは自動更新されません。** 変更したフレームを再度評価するか、最終レンダリングで書き直す必要があります。確実に現在のCompositionを出すならFull Renders Onlyを基本にします。

## Exportタブ：フレーム、画像領域、色

### Process ModeとExport Mode

**Process Mode**ではFull frames、NTSC fields、PAL/HD fieldsと、そのReversedを含む選択肢からフィールド処理を決めます。Reversedではフィールドの順序が反転します。インターレース出力の指定がなければ、納品条件を確認せず変更する必要はありません。

**Export Mode**では通常の書き出し、または24fpsから30fpsへ変換するSMPTE 3:2 Pulldownを選べます。ファイル名の開始番号を変えるFrame Offsetとは別の処理です。

### Clipping Mode：画面外の画像データをどう扱うか

**DoD（Domain of Definition）**とは、Fusion内で画像データが存在する範囲のことです。見えているフレームより広い範囲にデータが存在する場合もあります。

- **Frame**：表示フレーム内に範囲を切り詰めます。上流のDoDがフレームより小さいところは黒・透明として扱います。
- **None**：この切り詰めを行いません。広い合成空間のデータを含む巨大な画像となり、ファイル容量が増える場合があります。

通常のフレームサイズで出力したいならFrameを基準にします。Noneは画面外を含むデータが必要な場合に限り、実際の画像サイズを確認して使います。

**Save Alpha to Color**は、Alpha（透明度）をグレースケールとしてカラー成分へ書き込みます。**元のRGB色情報は上書きされます。** RGBを残しつつAlphaを追加で保持する設定ではありません。

### Color Space TypeとCurve Type

色の指定では、**画像に付く色空間情報と、ディスクへ保存するときの実際の値の変換**を混同しないことが重要です。

| Control | 何を指定するか |
| --- | --- |
| **Color Space Type** | Autoは入力画像のメタデータを引き継ぎ、Spaceでは出力の色空間を指定する |
| **Curve Type** | Autoは入力側のガンマ情報を引き継ぎ、Spaceでは出力形式に応じたガンマ曲線を選ぶ。LogではLog／Lin用の設定が現れる |
| **Apply Curve** | 選んだガンマ曲線を保存画像に適用し、Linearの作業データを出力用に変換する |

Saverによる出力時の変換は、**Composition内部を流れる画像自体には適用されません。** Fusion Studioで同じ結果を複数のSaverへ分岐すれば、一方はリニアEXR、もう一方は別の視聴用形式、という書き出しが可能です。ただし保存形式と色空間名を選んだだけで目的の見え方が保証されるわけではありません。Curve、Apply Curve、読み込み先の色管理を合わせて確認します。

## Audio・Legal・Formatタブ

**AudioタブはFusion StudioのSaverだけにあります。** Scratch Track（仮の音声トラック）を読み込み、エフェクトを音に合わせるために使います。Source FilenameでWAVを指定し、Sound Offsetで時間位置をずらせます。Fusionは音声ファイル全体をメモリに読むため、Manualでは小さいファイルの使用を推奨しています。最終的な音声納品を、この作業用トラックだけに依存しないでください。

**Legalタブ**では、放送向けの信号範囲を扱います。Video TypeはNTSC／NHK／PAL・SECAM等の基準、ActionはAdjust to Legal／Indicate as Black／Indicate as White／No Changesから選びます。Adjust Based OnとSoft Clipもあります。必要な基準は放送先・納品仕様によって異なるため、値を一律の正解として扱いません。

**Formatタブは保存する形式ごとに項目が変わります。** EXRとMOV、DPXの設定は同じではありません。特にDPXではBypass ConversionとData Is Linearの関係に注意します。元がLogデータなのにヘッダーでLinearと示すと、読み込み側がLog→Linear変換を不要と判断する可能性があります。EXR固有の圧縮・チャンネル設定については、選択したフォーマットの実際の項目を確認します。

## 制作例1：Resolveで処理の重い背景をEXRに固定する

1. ResolveのFusionページで背景処理の最終ノードから枝を分け、Saverを接続します。
2. FilenameにEXR連番の保存先を指定します。
3. **Fusion > Render All Savers**でEXRファイルを書き出します。
4. 背景処理の元のノード群は残しつつ、保存したEXRを[Loader](./loader)で読み直します。
5. Loaderの背景と前景素材を[Merge](../compositing/merge)で合成し、[MediaOut](./media-out)へ送ります。

```text
重い背景処理 ──→ Saver → ディスクのEXR連番
                              ↓ Loaderで再読み込み
背景EXRのLoader ──→ Merge ← 前景素材
                       └──→ MediaOut1 → Timeline
```

これは**手動のディスクキャッシュ**です。背景の元ノードを変更してもEXRには自動反映されないため、必要に応じてSaverで再レンダリングします。処理が重い背景を一度固定し、以後の合成作業を軽くする場合に使えます。

## 制作例2：Fusion Studioから背景と完成画を別々に出す

Fusion Studioで背景処理の出力をSaver1へ、背景と人物をMergeした完成画像をSaver2へ接続します。Saver1で背景のEXR連番、Saver2で完成画用の動画または連番を設定します。

```text
背景ノード ──┬──→ Saver1 → 背景だけのEXR
            └──→ Merge ← 人物
                     └──→ Saver2 → 合成済みの完成画
```

こうすると、後工程で背景だけを差し替えたい担当者にはSaver1の素材を、編集担当者にはSaver2の完成画を渡せます。各SaverでFilename、形式、出力色空間を個別に点検します。

## 制作例3：Rotoの保存済みフレームを確認する

Fusion StudioでPolygon等を使ったRotoの結果をSaverへ送り、Save FramesをHigh Quality Interactiveにします。作業中に評価したフレームを逐次保存できますが、あとからMaskのキーフレームを変更すると、**すでに保存したファイルが古いままになる可能性**があります。納品前に変更した区間を再評価するか、最終レンダリングですべて書き直します。

## Loader・MediaIn・MediaOutとの使い分け

| Node | 主な役割 | データの向き |
| --- | --- | --- |
| [Loader](./loader) | ディスクの画像や連番を読む | ファイル → Fusion |
| [MediaIn](./media-in) | TimelineやMedia Poolの素材を読む | Resolve → Fusion |
| [MediaOut](./media-out) | 完成結果をResolveへ返す | Fusion → Timeline／Color |
| **Saver** | Fusionの処理結果をファイルへ保存 | Fusion → ディスク |

Saverで出したファイルが自動的にTimelineへ切り替わるわけではなく、MediaOutに画像を接続しただけでディスクへ連番が保存されるわけでもありません。

## 問題が起きたとき

- **ファイルができない**：Image入力、Filename、Renderの実行方法、Save Framesを確認します。
- **拡張子が不正**：Output FormatとFilenameの末尾が一致しているか確認します。
- **Roto修正が反映されない**：High Quality Interactiveの古いファイルを再書き出しします。
- **画像が想定より大きい**：Clipping ModeがNoneになっていないか、上流のDoDを見ます。
- **EXRを読み直すと色が違う**：Color Space Type／Curve Type／Apply Curveと、Loader側の色解釈を確認します。
- **Resolveで普通の動画を出したい**：MediaOutからTimelineへ戻してDeliverページを使います。

## 関連ページ

- [Loader](./loader) — ディスクから画像を読み込む
- [MediaIn](./media-in) — Resolveの素材をFusionへ渡す
- [MediaOut](./media-out) — Timelineへ完成画像を返す
- [External Matte Saver](./external-matte-saver) — 複数MatteをEXRチャンネルに保存する
- [Merge](../compositing/merge) — 前景・背景の合成
- [I/O・Graph Utility一覧](./)

## バージョンと出典

**DaVinci Resolve 21.1 Reference Manual（September 2026）**に基づきます。

- Chapter 104「I/O Nodes」**pp.2423–2430**：入力、複数Saver、Fusion StudioとResolveの違い、File／Export／Audio／Legal／Format各タブ、Save Frames、Clipping Mode、Color Space Type、Curve Type。
- Chapter 64「Getting Clips into Fusion」**pp.1345–1346**：ResolveのFusionページでのEXR書き出し、Render All Savers、Loaderでの再読込を使った手動キャッシュ。
- Chapter 62「Fusion Studio」**p.1281**：Fusion StudioでのSaverによるComposition出力。

Inspectorの内部Parameter ID、形式別の全設定値・Default・Range、各Editionでの実機表示差は未確認です。
