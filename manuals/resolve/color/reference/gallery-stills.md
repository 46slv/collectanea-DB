---
title: GalleryとStills（グレードを保存・比較・再利用する）
description: ColorページでStillを保存し、別ショットへグレードを適用して比較するための基礎。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Gallery, Still, Apply Grade, Image Wipe, Split Screen, Lightbox]
tasks: [grade, match-shots, compare-shots, reuse-grade]
level: beginner
updated: "2026-10-22"
---

# GalleryとStills（グレードを保存・比較・再利用する）

Colorページの**Gallery（ギャラリー）**は、グレードを保存し、別のショットへ適用し、比較する場所です。**Still（スチル）**を作ると、あるフレームの見た目とグレードを基準として扱えます。StillはGallery内のアルバムに整理できます。これは編集プロジェクト全体や素材のバックアップを作る操作とは異なります。

## 目的による使い分け

| 目的 | 操作 | 期待する結果 |
| --- | --- | --- |
| 後でグレードを参照したい | Viewerを右クリックしてStillを作成 | Galleryに基準が残る |
| 別のショットにグレードを使いたい | StillからApply Grade | 適用先にグレードが反映される |
| Filmstrip内の別ショットから素早くコピーしたい | コピー先を選び、コピー元を中クリック | Viewerにあるショットのグレードが変わる |
| 2つのフレームを比較したい | Image Wipe | 明暗や色の違いを同じ画面で確認できる |
| 多数のショットを並べて評価したい | Split ScreenまたはLightbox | シーン内で浮いたカットを見つけやすい |

基本操作はBlackmagic Designの[Color公式ページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)で確認できます。バージョン固有のメニュー配置や数値は、未確認のまま固定しません。

## Stillを保存して基準を作る

同じ場面に正面・斜め・引きの3カットがある場合、最初に照明が安定したショットを基準にします。

1. Colorページで基準ショットを選び、[Primaries](./primaries-color-wheels)と[Scopes](./scopes)を使って露出と色かぶりを整えます。
2. 被写体の顔や背景を評価しやすいフレームへ再生ヘッドを移動します。急な照明変化の瞬間を基準にしない方が比較しやすくなります。
3. Viewerを右クリックしてStillを作成します。これは公式Colorページで案内されている保存操作です。
4. 左上のGalleryで保存したStillを確認し、必要ならアルバムに整理します。どの場面の基準かが分かるように管理します。

Stillは「方向性を見返すための基準」として使えます。保存した後でクリップを修正した場合、保存時点の基準と現在のグレードが異なることがあります。どちらを比較しているのか区別します。

## 保存したグレードを別ショットへ適用する

1. Colorページで**適用先のクリップ**を選択します。
2. Galleryの基準Stillを選び、**Apply Grade（グレードを適用）**を使います。
3. 適用後のViewerと[Node Graph](../learn/color-node-graph)を確認します。コピー元のグレードに[Power Window](./power-windows)や[Tracker](./color-tracker)を使用していた場合、別ショットの被写体位置や動きにそのまま合うと考えないでください。
4. 露出、ホワイトバランス、コントラストを整えてから色味やLookを比較します。WaveformとRGB Parade、必要ならVectorscopeで客観的な差も確認します。
5. ショットを交互に再生し、カットが切り替わるときに肌や背景の印象が不自然に跳ばないか確認します。

**Apply Gradeはマッチングの完成操作ではなく、調整の出発点です。** クリップのInput色空間や露出が異なれば、同じグレードでも見た目は変わります。変換が疑わしい場合は[Color Managementの基礎](../learn/color-management-basics)を参照してください。

## Filmstripから中クリックでコピーする

GalleryへStillを保存する以外に、公式ColorページはFilmstripでの中クリックによるコピーも案内しています。

1. グレードを受け取る**コピー先**のクリップを選び、そのショットがViewerに表示されているか確認します。
2. Filmstrip内の**コピー元**クリップをマウスの中ボタンでクリックします。
3. コピー先のViewerとNode Graphが変化したことを確かめ、ショット固有の調整をやり直します。

左クリックでコピー先を選ぶ操作と、コピー元を中クリックする操作を混同しないでください。中ボタンを持たない機器での代替操作はここでは検証していません。

## Wipe／Split Screen／Lightboxで比較する

**Image Wipe**はViewer内の2つの画像を比較する機能です。公式資料ではViewer左上から開き、水平・垂直・ミックス・アルファ・差分・ピクチャーインピクチャーなどの表示方法を選ぶと案内されています。比較対象が異なるフレームや別ショットであることを考慮して見た目の差を判断します。

**Split Screen**は複数のフルフレームを同時に表示する比較手段です。シーンの異なるショット、Gallery内のグレード、同一クリップのバージョンなどを見比べる際に向きます。1か所の差を細かく見るWipeと、シーン全体の調子を見るSplit Screenを使い分けます。

**Lightbox**ではタイムラインのクリップを、グレード適用済みのサムネイルとして一覧できます。公式ページによれば画面右上から開き、サムネイルを選んでLightboxを閉じるとそのクリップに移動できます。全体の色の流れや、未調整のショットを探す際に使います。

比較時は、同じ数値になるかよりも、露出・肌・背景の関係と、直前直後のカットの連続性を重視します。構図や照明が違う場合に全画素の色を機械的に一致させる必要はありません。静止フレームで似ていても、連続再生で違和感があれば再検討します。

## 実例1：3カメラのインタビューをそろえる

Aカメラの正面ショットが自然で、Bカメラの斜めショットは少し暗く、Cカメラの引きショットは背景が暖かいとします。

まずAを補正してStillに保存し、BへApply Gradeします。Bの顔がまだ暗ければ、[Scopes](./scopes)も見ながらBだけで補正します。CもAを参考にできますが、現場の照明による意図的な色の違いまで消す必要はありません。

最後にSplit ScreenやLightboxで3ショットを比較し、実際の編集順に再生します。完了条件はRGB値の一致ではなく、カット間で不要な明るさや色の跳びが目立たないことです。

## 実例2：Lookの方向性を比較する

同じショットで暖色寄りとニュートラルなLookを検討しているなら、候補ごとにStillを作って区別します。WipeやSplit Screenで、肌、白い衣装、暗部、明るい窓の印象を比較します。

1フレームでは良くても、異なる照明の別ショットに同じLookを適用すると違和感が出ることがあります。シリーズ全体へ適用する前に代表的な別カットでも試し、必要ならLookそのものの色の方向や強さを調整します。

## 期待どおりにならないとき

| 症状 | 先に確認すること |
| --- | --- |
| 適用先の見た目が合わない | 素材固有の露出・色温度・Input変換、元の局所補正 |
| コピー先が意図と違う | Filmstrip中クリック前の選択中クリップ |
| Stillと現在の画が違う | 保存時点と現在のグレード、比較しているフレーム |
| あるフレームだけ一致する | 被写体の動き、照明変化、WindowやTrackerの追従 |
| 静止画では合うのにカットで浮く | 時系列の再生、肌の露出、背景と照明の差 |
| Stillが見つからない | Galleryで選んでいるアルバムと保存場所 |

## 出典・対象版・検証範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design[『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（2026年9月8日公開）。公式公開は確認しましたが、**PDFのGallery該当章と21.1画面を直接照合していません**。
- **操作の直接根拠：** Blackmagic Design[「DaVinci Resolve — Color」公式ページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)の「グレードの保存、コピー、再利用」「ショットの比較」「ミスマッチのショットを見つける」（確認日：2026年10月22日）。
- **verification: partial。** 21.1実機操作、Still内部保存形式、アルバム共有範囲、全メニュー項目、Free／Studio差は未検証。実例は公式機能に基づく想定ケースであり、実素材の受入結果ではありません。

関連：[最初のグレーディング](../learn/first-grade)／[Primaries](./primaries-color-wheels)／[Scopes](./scopes)
