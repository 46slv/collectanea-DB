---
title: "ViewerのA/B Bufferで処理前後を比較する"
description: "同じViewerに処理前後の画像を割り当て、Split Wipeで境界や細部を比較する。"
doc_type: recipe
verification: partial
aliases: ["A/B Buffer", "Split Wipe", "処理前後比較"]
concepts: ["Viewer", "Buffer", "Split Wipe"]
patterns: ["Last Good / First Bad"]
nodes: ["MediaIn", "Blur", "MediaOut"]
tasks: ["compare", "inspect"]
prerequisites: ["Viewerにノードの出力を表示できる"]
level: beginner
product_scope: fusion
suite_surfaces: ["DaVinci Resolve Fusion", "Fusion Studio"]
updated: 2026-11-25
---

# ViewerのA/B Bufferで処理前後を比較する

ViewerのA/B Bufferに異なるノードの出力を割り当てると、同じViewer内で処理前後を切り替えたり、画面を分割して比較したりできる。例えばBlurによる輪郭の変化を観察する場合、ノードの有効・無効を繰り返し切り替える必要がなくなる。

## 作るもの

同一フレームの未処理画像とBlur適用後の画像を、Viewer内のSplit Wipeで比較する。分割線は確認用の表示であり、完成映像に分割線を合成する手順ではない。

## 必要なもの

- 細い線、文字、輪郭などを含む映像または静止画。
- FusionページのMediaIn、Blur、MediaOut。
- 入力と出力の違いを視認できる程度のBlur設定。

## ノード構成

~~~text
MediaIn1 ──→ Blur1 ──→ MediaOut1
   │            │
   A            B
   └── 同じViewerの表示バッファ ──┘
~~~

下段のA/Bはノードの接続端子ではなく、Viewerへの表示割り当てを示している。MediaOut1へはBlur1の出力だけを接続する。

## 手順

### 1. 比較する画像を用意する

MediaIn1とMediaOut1の間にBlur1を挿入する。輪郭の差が分かる程度にぼかしを設定し、動きのある素材なら比較したいフレームで停止する。

### 2. Buffer Aに処理前を割り当てる

比較に使うViewerを決め、そのViewerのBufferメニューでSwitch to A Viewを選ぶ。MediaIn1の出力をそのViewerへ表示する。以降も同じViewerを使用する。

### 3. Buffer Bに処理後を割り当てる

同じViewerのBufferメニューからSwitch to B Viewを選び、Blur1の出力を表示する。Aへ戻して未処理画像が見えること、Bへ戻してぼけた画像が見えることを確認する。

### 4. Split Wipeを有効にする

ViewerのSwitch to Split Wipe Viewを選ぶ。公式Manualにはスラッシュキーでも切り替えられると記載されている。ショートカットが反応しない場合はViewerのメニューを使用する。

分割線中央のハンドルを移動して、文字や輪郭を横切る位置に合わせる。線自体をドラッグすると角度を変更できる。公式ManualではShiftを押しながら角度を変更すると45度刻みに制限できる。

### 5. 同じ位置で違いを観察する

輪郭の一方が鮮明で、もう一方がぼけていることを確認する。Viewerを拡大して細線も観察する。Split Wipe中のパンとズームは両方のバッファに適用される。

確認後はSplit Wipeを解除する。MediaOut1の接続やBlur1のパラメータを変更する必要はない。

## 期待される結果

| 表示 | 観察する内容 |
| --- | --- |
| A単独 | 入力画像の細部や輪郭 |
| B単独 | Blurによる細部の減衰や輪郭の広がり |
| Split Wipe | 同じViewer内の分割境界をまたいだ変化 |

入力画像の特徴によって差の見え方は変わる。均一な領域だけではBlurの変化を判別しにくいため、輪郭をまたぐ位置を選ぶ。

## なぜこの構成で動くか

A/B BufferはViewerが比較する出力を保持するための表示機能である。ノードグラフの処理経路を二つ作る必要はない。今回のように直前と直後のノードを割り当てれば、特定の処理によって生じた差に注目できる。

ただし表示設定も比較に影響する。Split Wipeでは各側を選択してチャンネルやLUTを変更できるため、処理差だけを見たい場合は両側の表示条件を揃える。

## バリエーション

- 複数の処理がある場合は、疑わしいノードの直前と直後をA/Bに割り当て直す。
- 同じノードを両方に割り当て、表示チャンネルなどの違いを観察する。その場合はノード処理の前後比較ではなく、表示設定の比較になる。

## うまくいかないときの確認

| 症状 | 確認すること |
| --- | --- |
| 両側とも同じ画像に見える | A/Bそれぞれを単独表示し、割り当てたノードとBlur設定を確認する。 |
| 期待しない色の差がある | A/BのチャンネルやViewer LUTの設定が一致しているか確認する。 |
| 分割線が見えない | 同じViewerでA/Bを設定したか、Split Wipeが有効かを確認する。 |
| 完成映像にも分割を残したい | Viewerの比較表示ではなく、別途ノードで分割合成を作る必要がある。 |

## 関連パターン

- [Viewerで中間結果を確認する](../../learn/01-flow/intermediate-results-viewer.md)
- [Last Good / First Bad](../../patterns/debugging/last-good-first-bad.md)

## 関連ノード

- [MediaIn](../../nodes/utility-io/media-in.md)
- [Blur](../../nodes/blur-filter/blur.md)
- [MediaOut](../../nodes/utility-io/media-out.md)

## 出典・検証範囲

- Blackmagic Design, [Fusion 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/FusionManual.pdf)（2026年9月版）、Chapter 1 p.7（対象製品）、Chapter 7 pp.194–196（Viewer A/B Buffer、Split Wipe）。
- 照合日：2026-11-25。公式PDFの索引化された本文で機能名、切り替え、分割線操作、表示条件を照合した。ページ画像は取得制限により未確認。
- DaVinci Resolve 21.1 Reference Manual本体の該当箇所の直接照合、Resolve/Fusion実機での表示・操作、OSやEditionごとのショートカット差は未検証。本記事のグラフと観察結果はManualの機能記述に基づく再現手順であり、実機観測値ではない。
