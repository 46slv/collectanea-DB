---
title: "Set Timecode"
description: "2D ImageへFPS基準のタイムコードメタデータを付与するFusion Metadata Node。"
doc_type: node
term_id: "set-timecode"
term_short: "Set Timecodeは、FPSとcomposition開始位置から計算したタイムコードを2D Imageのメタデータへ書き込むNode。"
verification: partial
aliases: ["Set Timecode", "TCMeta"]
concepts: ["image-data"]
nodes: ["Set Timecode"]
node_family: "time-metadata"
inputs: ["image"]
outputs: ["image"]
controls: ["FPS", "Hours", "Minutes", "Seconds", "Frames", "Print to Console"]
tasks: ["metadata"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# Set Timecode

Set Timecode [TCMeta]は、入力した2D Imageへ**タイムコードのメタデータを追加する**Metadata Nodeです。設定したFPSと、composition開始frameからのオフセットを基に、frameごとのtimecode値を計算してmetadata tableへ書き込みます。

Time SpeedやTime Stretcherのように、別のsource frameを読み直して映像の速度や時間位置を変えるNodeではありません。Set Timecodeが変更するのは、Imageに付随するtimecode metadataです。

## 入力と出力

21.1 Manualで記載されているImage入力は1系統です。

- **Background Input**: orange input。timecode metadataを付けたい2D Imageを接続します。
- **Output**: Background InputのImageに新しいtimecode metadataを埋め込んだ結果。

基本構成は次のようになります。

```text
MediaIn / Loader → Set Timecode → 後段処理
```

画面の見た目を変えるEffectではないため、Viewer上のpixelが変わらなくても正常です。確認したい場合は、metadataを表示できるViewer subviewや後段のmetadata処理を使います。

## 何を設定するNodeか

Set Timecodeは、FPSを基準にframe番号とtimecodeを対応させ、compositionの開始frameからのオフセットを加えてtimecode metadataを生成します。

たとえば24 fpsで`00:00:08:15`は、

```text
8秒 × 24 frame + 15 frame = 207 frame
```

に相当します。21.1 Manualでも、Timecode / Frames変換の例として`00:00:08:15`と`207`が示されています。

ここで設定しているのはImageに埋め込まれるmetadataです。Edit pageのclip attributesやtimeline自体のstart timecodeを変更する操作とは分けて考えます。

## 主なControls

### FPS

timecodeとframe数を相互に換算するときのframe rateを指定します。

21.1 Manualに記載されている標準のFuseでは、`24 / 25 / 30 / 48 / 50 / 60`の選択肢が用意されています。またManualは、このNodeをFuseとして説明しており、必要ならFuse code内のbuttonとrate定義を編集できるとしています。

制作物の基準frame rateと異なるFPSを指定すると、同じframe数でもtimecode表記が変わります。素材やcompositionで意図しているframe rateに合わせて設定します。

### Hours / Minutes / Seconds / Frames

compositionのstarting frameを基準に、timecodeへ加えるオフセットを指定します。

たとえば「compositionの開始位置を00:00:00:00ではなく、別のtimecodeから数えたい」という場合に、Hours / Minutes / Seconds / Framesで開始位置を設定します。

これらはsource映像を前後にずらすControlではありません。映像自体の時間位置を変える場合はTime SpeedやTime Stretcherを使います。

### Print to Console

現在のTimecode / Frames変換結果をConsoleへ出力します。

設定したFPSとオフセットが意図したframe数になっているかを数値で確認したい場合に使えます。

## 実機で時刻とFPSによる表示の違いを見る

Resolve Studio 21.1.0.14、Windows、日本語UIで、青いBackgroundへタイムコードを追加しました。両ViewerはColor／40%です。右ViewerのMetadata subviewには、FrameRateとTimeCodeが表示されます。

[![青いBackgroundからSetTimecode1を経由してMediaOut1へ接続した実機Graph](/img/fusion/captures/S45/graph.png)](/img/fusion/captures/S45/graph.png)

[![開始オフセットを加える前のMetadata subview。FrameRate24、TimeCode00:00:00:00](/img/fusion/captures/S45/zero-metadata.png)](/img/fusion/captures/S45/zero-metadata.png)

[![Set TimecodeのFPS24、Hours0、Minutes0、Seconds8、Frames15。Print to Consoleはオフ](/img/fusion/captures/S45/inspector.png)](/img/fusion/captures/S45/inspector.png)

[![出力0で左右の青い画像は変わらず、右SubviewはFrameRate24とTimeCode00:00:08:15を表示](/img/fusion/captures/S45/compare.png)](/img/fusion/captures/S45/compare.png)

[![Set TimecodeのMetadata subview。FrameRate24、TimeCode00:00:08:15](/img/fusion/captures/S45/metadata.png)](/img/fusion/captures/S45/metadata.png)

FPSを24、開始オフセットをSeconds 8／Frames 15にすると、出力0のTimeCodeは00:00:08:15になりました。同じ設定のまま出力24へ進めると00:00:09:15です。

[![同じFPS24と開始オフセットで出力24へ進めると、右のTimeCodeは00:00:09:15になる](/img/fusion/captures/S45/frame24.png)](/img/fusion/captures/S45/frame24.png)

出力24と開始オフセットを保ったまま、実際のInspectorでFPSを25へ切り替えました。FrameRateは25、TimeCodeは00:00:09:14になり、出力画像は青のままです。撮影用Timelineの24fpsは変更していません。

[![出力24でFPSだけ25へ切り替えたInspector。Seconds8、Frames15は同じ](/img/fusion/captures/S45/fps25-inspector.png)](/img/fusion/captures/S45/fps25-inspector.png)

[![出力24、FPS25のMetadata subviewはFrameRate25とTimeCode00:00:09:14を表示](/img/fusion/captures/S45/fps25.png)](/img/fusion/captures/S45/fps25.png)

| 出力フレーム | NodeのFPS | Seconds / Frames | MetadataのTimeCode |
| ---: | ---: | --- | --- |
| 0 | 24 | 8 / 15 | 00:00:08:15 |
| 24 | 24 | 8 / 15 | 00:00:09:15 |
| 24 | 25 | 8 / 15 | 00:00:09:14 |

最後はFPS24、出力0、開始オフセット8秒15フレームへ戻しました。この環境のruntime REGIDは`Fuse.SetMetaDataTC`です。Print to Console、他のFPS、drop-frame、最終ファイルへの保持、Free editionや他OSは未確認です。

[再現用Graph](/img/fusion/captures/S45/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S45/capture.json)

## 具体的な使い方

### composition内で独自の開始timecodeを持たせる

```text
MediaIn → Set Timecode → 後段のmetadata対応処理
```

Set TimecodeでFPSと開始オフセットを設定すると、入力Imageへframeに応じたtimecode metadataが追加されます。

たとえばVFX用のcompositionを特定の開始timecode基準で扱いたい場合、pixel processingとは別にtimecode情報を持たせられます。

ただし、Set TimecodeがImage metadataへ値を書き込むことと、そのmetadataが最終fileのcontainer timecodeとして保存されることは同じではありません。書き出しformatやSaver / Deliver側がどのmetadataを保持するかは、出力経路ごとに確認します。

### arbitrary metadataではなくtimecodeだけを設定する

任意のmetadata fieldを作る場合は[Set Metadata](./set-metadata.md)を使います。別Imageが持つmetadataを移す場合は[Copy Metadata](./copy-metadata.md)を使います。

Set Timecodeは、この2つより目的が限定されており、**FPSとframe位置に応じて変化するtimecode metadataを作る**ためのNodeです。

## Set Metadata / Copy Metadataとの違い

- **Set Timecode**: FPSとcomposition-relative offsetからtimecode metadataを生成する。
- **Set Metadata**: 任意のField NameとField Valueを使ってmetadataのName = Value pairを作る。
- **Copy Metadata**: Foreground ImageのmetadataをBackground Imageへmerge / replaceする。

「固定した任意の値を追加したい」のか、「別Imageのmetadataを引き継ぎたい」のか、「frameに応じたtimecodeを作りたい」のかで選び分けます。

## 注意点

- Set Timecodeはretime Nodeではありません。映像の再生速度やsource frame mappingは変更しません。
- timecodeとframe数の対応は`FPS`に依存します。意図したframe rateと一致しているか確認します。
- Hours / Minutes / Seconds / Framesは、current compositionのstarting frameからのoffsetとして扱われます。
- 21.1 ManualはSet TimecodeをFuseとして記載していますが、実機例ではruntime REGIDを確認しました。installed Fuseのpathやcodeの編集は確認していません。
- 最終fileへtimecodeがどの形式で保持されるかは、Set Timecodeだけでは保証されません。出力formatと書き出し経路を別途確認します。

## 関連Node

- [Time / Metadata / Utility Family Overview](./index.md)
- [Set Metadata](./set-metadata.md)
- [Copy Metadata](./copy-metadata.md)
- [Time Speed](./time-speed.md): 一定速度のretimeやframe offsetを行う場合。
- [Time Stretcher](./time-stretcher.md): source timeをanimationして可変retimeする場合。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、Chapter 110「Metadata Nodes」の`Set Timecode [TCMeta]`（pp.2575–2576）を基準にしています。

確認した項目は、single orange Background Input、Background Imageへtimecode metadataを追加して出力すること、`FPS`、Hours / Minutes / Seconds / Framesによるcomposition開始frameからのoffset、`Print to Console`、FPSに基づくTimecode / Frames変換、FuseとしてFPS選択肢を編集できることです。

実機例で扱っていないFPSやdrop-frame、edition差、各Controlの全default / min / maxは確認範囲に含めていないため、`verification: partial`を維持しています。
