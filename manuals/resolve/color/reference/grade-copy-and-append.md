---
title: グレードのコピーと追記（Apply Grade／Append Node Graph）
description: Colorページで補正済みショットを守り、保存したグレードを全体適用する方法と必要なLookだけ転用する方法を区別する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Gallery, Still, Apply Grade, Append Node Graph, Node Editor, Versions, Scopes]
tasks: [grade, reuse-grade, match-shots, node-order, troubleshoot]
level: intermediate
updated: "2026-10-22"
---

# グレードのコピーと追記：必要な補正を別ショットに使う

Colorページで整えたグレードを別のクリップに使う際、最も速い方法が常に安全とは限りません。同じカメラの素材でも、入力変換、露出、肌のマスク、照明はショットごとに異なります。**全体を適用する（Apply Grade）方法と、既存グラフに追記する（Append Node Graph）方法**を分けて考えると、残すべき補正を守りやすくなります。

本記事はGallery／Stillを中心にした転用方法を説明します。Stillの作成と比較は[GalleryとStills](./gallery-stills)、個々のノードの役割は[Colorノードグラフ](../learn/color-node-graph)で確認できます。

## 何をコピーしたいかで方法を選ぶ

| 目的 | 手段 | 注意すること |
| --- | --- | --- |
| 他クリップのグレードを素早く利用 | Filmstripのコピー元を中クリック | **コピー先を先に選択**する。コピー先の現状を残す目的には向かない |
| 保存済みグレード全体を出発点にする | Stillから**Apply Grade** | 既存のコピー先グレードを先に保存・比較しておく |
| 現在の補正を残してノード群を足す | Stillから**Append Node Graph** | 元ショット専用のBalance、CST、Windowも含まれ得る |
| 複数クリップのLookを連動させる | [Shared Node](./shared-nodes) | 後からの修正がほかのクリップにも伝わる |
| 同条件の多数のショットを段階別に扱う | [Group](./group-grading) | Pre-Clip／Post-Clipの適用範囲を意識する |

Filmstripの中クリック、GalleryへのStill保存、Apply GradeはBlackmagic Designの[Color公式ページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)が案内しています。Append Node Graphについての具体的な説明は公式『DaVinci Resolve 20 Colorist Guide』に基づきます。**21.1のメニュー階層や属性コピー範囲まで検証したものではありません。**

部分転用とは「一部だけを選択する」コマンドの名称ではありません。**追記したノード群から必要なLookを残し、ショット固有の補正を外す**ことでも実現できます。どこまでが再利用可能な処理かは、ノードの内容を見て判断します。

## 先に保存すべきもの

1. コピー先を選択し、ViewerとNode Editorで現在のグレードを確認します。Filmstripの選択を取り違えていないか確認します。
2. 現在のグレードを保持したい場合は[Versions](./versions-and-grade-comparison)で別案を作るか、GalleryにStillを保存します。Stillは比較基準であり、Undo履歴やプロジェクト全体のバックアップと同一ではありません。
3. Clip／Group Pre-Clip／Group Post-Clip／Timelineのどこに補正があるか確認します。Clipノードだけが見た目のすべてとは限りません。[Timeline Grading](./timeline-grading)も参照してください。
4. コピー元・コピー先の入力色域とGamma、RCM／CST、LUTの適用場所を確認します。異なるカメラ素材に入力変換まで複製すると、変換が重複することがあります。[色管理](../learn/color-management-basics)、[CST](./color-space-transform)、[LUT](./luts)を参照します。

**同じ色にしたいのはLookか、それとも元のショットに合わせたBalanceまでか。** ここを区別しないまま全ノードを転用しないことが重要です。

## Apply Grade：保存したグレードを使う

Blackmagic DesignのColor公式ページでは、Viewerの右クリックでStillを作成し、Galleryの**Apply Grade**で別ショットへグレードを適用する方法が紹介されています。

1. 基準ショットを選び、露出・色バランスを整え、ViewerからStillを保存します。
2. 適用先を選び、残したい既存グレードがあるなら別VersionまたはStillとして保存します。
3. Galleryで基準Stillを選び、**Apply Grade**を実行します。
4. Node EditorとViewerで適用結果を調べ、露出・肌・背景をコピー先の素材に合わせ直します。
5. [Scopes](./scopes)で明暗やRGBバランスを比較し、前後のカットを連続再生して違和感を確認します。

全体コピーは「他ショットの完成状態を、そのまま転用すれば完成する」という意味ではありません。入力信号の違いや被写体位置の違いによって、同じ値でも結果が変わります。**コピー先の既存ノードを保持して追加することが目的なら、Apply Gradeではなく追記を検討**します。Apply Gradeが21.1でどの属性まで置換・継承するかは未照合です。

## Append Node Graph：既存グレードに追加する

Blackmagic Design『[The Colorist Guide to DaVinci Resolve 20](https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-20-Colorist-Guide.pdf)』Lesson 6「Managing Grades Across Clips and Timelines」では、Stillを右クリックして**Append Node Graph**を選ぶ手順が掲載されています。

公式の実例では、コピー先の**Match**ノードを残し、Stillの**Balance／Split tone／Contrast**のノード群を追記しています。その後、元ショット専用だったBalanceがコピー先に合わないため、Balanceノードを取り除きます。これは**追記は必要なノードだけを自動判定して取り出す処理ではない**ことを示す具体例です。

1. コピー先のNode Editorで、既に調整したInput、Balance、Lookの各段階を把握します。
2. Galleryで利用したいLookを含むStillを選び、現行画面で**Append Node Graph**を実行します。
3. 追加されたグラフから、元ショット専用の入力変換・露出補正・Window・不要なエフェクトを特定します。
4. 不要なノードを除いた後、処理の接続と順序が意図どおりか確認します。必要ならコピー前のVersionと比較します。
5. Viewer／Scopesだけでなく動くフレームも検査します。マスク境界や追跡のずれは静止フレームだけでは見逃すことがあります。

同Guideには、**StillからApply Gradeする場合はWindowの追跡データがリセットされ、Append Node Graphでは保持される**旨の注意があります。これはResolve 20の資料に記載された挙動で、21.1の全環境・全クリップ条件に対する実機確認ではありません。したがって、転用した[Power Window](./power-windows)や[Tracker](./color-tracker)は、新しいクリップの動きに合うか必ず確認します。

また、この方式を**単一ノードを指定してコピーする機能**と混同しないでください。21.1の個別ノードコピー操作・ショートカットはこの資料では直接確認できていないため、未検証の操作を追加しません。

## 判断例：2カメラの共通Lookだけを転用する

同じインタビューをAとBのカメラで撮影し、それぞれの入力変換と露出を補正したとします。Aで作った暖色LookだけをBに移したい場合です。

```text
A: Input A → Balance A → Warm Look → Face Window A
B: Input B → Balance B
```

Aのグレード全体をBに適用すると、B側で合わせたInput BとBalance Bを失ったり、重複変換を起こしたりする可能性があります。Append Node Graphを使用する場合は、Aのノード群を足した後、Bには必要のないInput A、Balance A、Face Window Aを特定して除きます。最終的に狙う構成は次のとおりです。

```text
B: Input B → Balance B → Warm Look
```

これは**作業方針の仮想例**で、Resolve 21.1実機での追記結果を示したものではありません。Bの肌が赤くなり過ぎるなら、まずInput変換・Balance・Lookの順序を確認します。AとBで被写体の位置が違えば、Face Window Aの形状や追跡をそのまま流用しません。

複数ショットのLookをその後も**同時に変更したい**なら、コピーよりもShared NodeやGroupが適する場合があります。ただし共有範囲が広がるため、どのショットに作用するか明確にしてから採用します。

## 失敗時の切り分け

| 症状 | 最初の確認点 |
| --- | --- |
| 追記後にLogのような表示や過大なコントラストになる | 入力変換と出力変換、CST／LUTの重複 |
| 追記したLookが別のカットで合わない | コピー元専用のBalance、照明差、ノード順序 |
| 顔だけ変な色になる | Qualifier、Window、Trackerの領域と追従 |
| 元のグレードが消えたように見える | Apply GradeとAppend Node Graphを取り違えていないか |
| 別のショットも変化した | Shared Node、Group、Remote Versionの共有範囲 |

原因が確定しなければ[ノードの無効化とバイパス](../troubleshooting/node-bypass-diagnostics)で処理を段階的に比較します。グレード転用後は、変更したノード・バイパス・グラフ接続を確認した上で前後のカットを再生します。

## 出典・対象版・確認範囲

- **対象：DaVinci Resolve 21.1。** Blackmagic Design[『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（[公式サポート](https://www.blackmagicdesign.com/support)）。公開を確認しましたが、PDF容量制限のため該当章を直接照合できず、21.1実機も未検証です。
- **直接確認した一次資料：** Blackmagic Design[「DaVinci Resolve — Color」](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)（2026年10月22日確認）。Gallery、Still、Apply Grade、Filmstripの中クリック、GroupとShared Nodeの説明。
- **追記の一次資料：** Blackmagic Design[『The Colorist Guide to DaVinci Resolve 20』](https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-20-Colorist-Guide.pdf)、Lesson 6「Managing Grades Across Clips and Timelines」内「Appending Grades and Nodes」（2026年10月22日確認）。元ショット専用Balanceの除去例とWindow追跡の注意。**Resolve 20資料であり、21.1への完全な同一性は未確認。**
- **verification: partial。** 21.1のメニュー配置、全属性の転用範囲、単一ノードの具体的なコピー方法、各バージョンの追跡差、Free／Studio差は未確認です。2カメラ例は仮想例です。

関連：[Gallery／Stills](./gallery-stills)／[Versions](./versions-and-grade-comparison)／[Scopes](./scopes)／[納品前Color QC](../recipes/pre-delivery-color-qc)。
