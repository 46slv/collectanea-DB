---
title: GalleryとStills（グレードを保存・比較・再利用する）
description: Resolve 21.1のGalleryでStillを保存・整理し、PowerGrade、Live Preview、比較、グレード適用、DRX書き出しを使い分ける。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Gallery, Still, Album, PowerGrade, Live Preview, Image Wipe, Apply Grade, Memories, Export]
tasks: [grade, match-shots, compare-shots, reuse-grade]
level: beginner
updated: "2026-10-28"
---

# GalleryとStills：グレードの保存・比較・再利用

Colorページの**Gallery**は、フレームの画像と、その時点のグレードを**Still**として保存し、比較・再利用する場所です。Stillには画像だけでなくグレーディング情報も含まれます。ただし、Stillの保存は元動画やプロジェクト全体のバックアップではありません。

操作の主な根拠はDaVinci Resolve **21.1 Reference Manual Chapter 141「Using the Gallery」（pp.3333–3348）**、グレードの適用はChapter 142「Grade Management」（pp.3363–3366）です。説明中の作例は判断例で、21.1実機で再現した結果ではありません。

## 目的に応じて選ぶ

| 目的 | 使うもの | 注意点 |
| --- | --- | --- |
| 現在の補正を比較基準にする | Grab Still | 保存後の変更に自動追従しない |
| 別ショットにグレードを移す | Apply Grade／中クリック | 適用先の既存グレードを上書きする |
| 適用前に見た目を確かめる | Live Preview | Node Editorで現在選んだノードもプレビューに影響する |
| 2つの画像を比較する | Image Wipe | 対応するフレーム・照明・構図の違いに注意 |
| 複数ショットを比較する | [Split Screen](./split-screen-comparison)／[Lightbox](./lightbox) | 色の流れや補正漏れを探す |
| 同じプロジェクト内の基準を整理する | Still Album | 現在開いているAlbumへ保存される |
| 別プロジェクトで共通Lookを使う | PowerGrade Album | 同一Project Library内で共有する |
| 画像・グレードを別環境へ渡す | Still Export／DRX | 参照画像とグレードデータは別の役割 |

## Stillを保存する

1. Colorページで基準にするクリップを選び、Viewerと[Scopes](./scopes)で露出・色・階調を確認します。
2. 被写体や照明を評価しやすいフレームへ再生ヘッドを移動します。
3. Viewerを右クリックして**Grab Still**を選びます。21.1 Manual p.3333には**Color > Stills > Grab Still**も記載されています。
4. Galleryの現在開いているAlbumに保存されたStillを確認します。必要なら名前を付け、どのショット・Lookの基準か分かるようにします。

タイムライン全体を保存するときは、Viewerの右クリックから**Grab All Stills > From First Frame／From Middle Frame**を使えます。まだStillを持たないクリップに限定する**Grab Missing Stills**もあります（p.3333）。一括保存前に対象と保存先のAlbumを確認します。

### Gallery Stillの保存場所

21.1 Manual p.3335によれば、通常のGallery Stillは標準で**DPX形式**となり、保存先は**Project Settings > Master Settings > Working Folders > Gallery stills location**で定義されます。初期位置はSystem PreferencesのMedia Storage設定に由来する隠し **.gallery** ディレクトリです。Stillを作っただけで、指定の納品フォルダへ画像を書き出したことにはなりません。

PowerGrade用にはGallery Optionメニューの**Change PowerGrades Path**があります。実際の保存先は使用中のProject Libraryと実機設定によって確認します。

## AlbumとPowerGradeを使い分ける

通常のStill Albumは、現在のプロジェクトの基準ショットやLook候補を整理する場所です。新規プロジェクトでは**Stills 1**が既定のAlbumです（21.1 Manual p.3341）。

Gallery左上の**Album**ボタンで一覧を開き、一覧を右クリックして**Add Still Album**または**Add PowerGrade Album**を選びます。Stillを別Albumへ移すときはドラッグします。**Remove Current Album**は中のStillも削除する操作なので、名前を整理するだけのつもりで実行しません（p.3341）。

**PowerGrade Album**のStillは、同じProject Libraryに保存された別プロジェクトからも利用できます。通常のAlbumのStillは基本的にそのプロジェクト内のものです。異なるProject LibraryへPowerGradeが自動共有されるとは限りません（p.3342）。

別プロジェクトのStillを取り込む場合は、Gallery右上の**Gallery View**または**Workspace > Gallery**でGalleryウィンドウを開きます。Stills Navigatorで元のProject Library・Projectを選び、Stillを現在のProject Stills側のAlbumへドラッグできます（pp.3343–3345）。

### ラベル、検索、Timelines Album

Stillには初期状態で**Track.Shot.Version**の番号が付きます。Stillを右クリックして**Change Label**から、ショット名・カメラ・Lookなどのラベルを付けられます（pp.3337–3338）。Galleryの検索は**現在選択したAlbum**を絞り込むため、見つからない場合はAlbumの選択を見直します（p.3339）。

Galleryの**Timelines Album**では、現在のタイムラインと同じプロジェクト内の他タイムラインにあるグレードを参照できます。すべてのクリップを事前にStill保存する必要はありません（p.3343）。

## Live Previewで適用前の見た目を確かめる

21.1 Manual p.3335の**Live Preview**は、Gallery Stillへポインタを重ねたとき、そのグレードを現在のクリップに使った見た目をViewerで確認する機能です。

1. GalleryのOptionメニューで**Live Preview**を有効にします。
2. Node Editorでプレビュー位置に関係するノードを選択します。Manualは**選択中ノードがプレビュー結果に影響する**と明記しています。
3. GalleryのStillへポインタを重ねてViewerを確認します。**Hover Scrub Preview**では、サムネイルとViewerの両方をスクラブするか、サムネイルだけを動かすかなどを選べます（pp.3335–3336）。
4. 方向が合うと判断してから、必要に応じてApply Gradeなどで明示的に転用します。

選択ノードや設定によって見え方が異なるため、プレビューが良好だったことだけで、時間変化や別ショットのマスクまで合うとは判断しません。

## Image Wipe／Split Screen／Lightboxで比較する

GalleryのStillを**ダブルクリック**すると、現在のクリップとStillのImage Wipe比較を表示できます。Stillを選んでViewer上部の**Image Wipe**ボタンを押す方法もあります（21.1 Manual p.3336）。

Wipeの境界はViewer内でドラッグでき、**Horizontal／Vertical／Mix／Alpha／Box／Difference**などの表示方法があります。位置や照明の異なる2つのフレームを重ねたとき、画素が一致しないことだけを問題にせず、肌・白・背景の相対的な明るさと色を確認します。

タイムライン内の別クリップをStillに保存せず比較するときは、比較元クリップのThumbnailを右クリックして**Wipe Timeline Clip**を使えます（p.3337）。複数カットを並べるなら[Split Screen](./split-screen-comparison)、全体を一覧するなら[Lightbox](./lightbox)が適しています。比較後は実際の編集順に再生します。

## 別ショットにグレードを適用する

21.1 Manual pp.3364–3366では、**先に適用先クリップを選択する**ことが共通手順です。

1. ColorページのThumbnail Timelineで適用先を選びます。既存のグレードを残したい場合は、先に[Versions](./versions-and-grade-comparison)やStillで比較可能な状態にします。
2. Galleryのコピー元Stillを右クリックして**Apply Grade**を選ぶか、Stillを中クリックします。StillをViewerへドラッグする方法もManualに記載されています。
3. ViewerとNode Editorで、入力変換・Balance・Window・Trackerなどが意図どおりか確認します。
4. [Scopes](./scopes)と前後のカットの再生で露出・色・肌の連続性を確かめます。

**Apply Gradeは適用先の既存グレードを上書きします**（21.1 Manual p.3365）。既存ノードを残して追加したい場合は、[グレードのコピーと追記](./grade-copy-and-append)で**Append Node Graph**や個別ノードコピーを選ぶ方が適切なことがあります。

時間変化するグレードでは、Gallery背景の**Apply Grades Using**で**No Keyframes／Keyframes Aligning Source Timecode／Keyframes Aligning Start Frame**を選びます。コピーする内容を制御する**All／Color／Sizing**も含め、操作と注意点は[グレードのコピーと追記](./grade-copy-and-append)と[Color Keyframes](./color-keyframes)を参照してください。

### Memoriesを使う

**Memories**はStillと同様の情報を保持し、よく使うグレードを呼び出しやすくする仕組みです。Galleryの**Memories**ボタンで表示し、StillをMemory Bankへドラッグできます（pp.3347–3348）。

21.1 Manualには**Color > Memories > Save Memory A–H**、Memoryの右クリックからの**Apply Grade**が記載されています。既存Memoryへの保存は前の内容を上書きします。長期のLook整理はAlbumやPowerGrade、繰り返し呼び出すものはMemoriesと使い分けます。

## 画像とグレードをファイルで渡す

Galleryの灰色背景を右クリックし、**Import**で画像を読み込めます。同じ場所に対応する**DRX**がある場合は、グレーディング情報も取り込めます（21.1 Manual p.3346）。

Gallery Stillを選んで**Export**すると、通常は**画像**とグレーディング情報の**.drx**ファイルが書き出されます。ファイル形式に**.drx**を選べば、画像を出さずグレードだけをエクスポートできます（p.3347）。

**Export With Display LUT**は現在のプロジェクトのVideo Monitor LUTを画像へ反映する選択肢です。通常のExportとの表示差を考慮し、受け渡す相手の表示条件を確認します。画像だけを送ればノード情報も移るわけではありません。

## 判断例：3カメラのインタビュー

Aカメラの正面ショットを基準に、Bは暗め、Cは背景照明が暖かいとします。Aでグレードを整えてStillへ保存し、Bへの適用前に**Live Preview**で方向を確認します。

Aのグレード全体をBへApply Gradeすると、B固有の入力変換やBalanceも置き換わる場合があります。Bの既存ノードを残すなら[Append Node Graph](./grade-copy-and-append)や単一ノードコピーを検討します。Cの背景が暖かいのは照明演出かもしれず、Aと機械的に一致させる必要はありません。

Wipeや[Split Screen](./split-screen-comparison)で比較し、最後にカット順で再生します。目的は全画素のRGB値を同じにすることではなく、意図しない明るさや色の跳びを減らすことです。これは操作の組み立て例であり、実素材での成功事例ではありません。

## 期待どおりにならないとき

| 症状 | 先に確認すること |
| --- | --- |
| 保存したStillが見つからない | 現在のAlbum、検索、Show Current Timeline Only |
| 同じクリップの古いStillが消える | Gallery背景の**One Still Per Scene**設定（p.3340）。有効時は古いStillが置き換わり得る |
| 別プロジェクトでPowerGradeが見つからない | 同じProject Libraryか、Galleryの参照先とAlbum |
| Live Previewが想定と違う | Node Editorで選択したノード、Live Preview／Hover Scrub Preview |
| Apply Gradeで補正が消えた | 上書き操作と保存済みVersion、Append Node Graphの必要性 |
| 動くグレードがずれる | Apply Grades Using、source timecode／start frame |
| Exportした画像の色が違う | Display LUT、ExportとExport With Display LUTの違い |
| Stillでは合うのに動画で浮く | 比較フレーム、照明変化、WindowやTracker、カット順の再生 |

## 出典・対象版・未検証範囲

- **一次資料：** Blackmagic Design, [*DaVinci Resolve 21.1 Reference Manual*](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（September 2026）、**Chapter 141 “Using the Gallery”, pp.3333–3348**。Still保存・保存先（3333–3335）、Live Preview／Wipe（3335–3337）、ラベル・Album・PowerGrade（3337–3345）、Import／Export／Memories（3346–3348）を確認。
- **グレード適用：** 同Manual **Chapter 142 “Grade Management”, pp.3363–3366**。コピー範囲、Keyframes、適用手順と上書きの注意を確認。
- **補助資料：** [Blackmagic Design公式Colorページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)（Split Screen／Lightbox等の概要）。

**検証状況：partial。** 2026-10-28に21.1公式Manualの上記本文を直接照合。21.1実機UI、実際の保存先、Live Previewの視覚結果、Windows/macOSの修飾キー差、Free／Studioのedition差、画像・DRXの往復と実素材での再現は未検証です。
