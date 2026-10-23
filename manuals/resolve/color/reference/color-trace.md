---
title: ColorTrace（旧タイムラインのグレードを新編集版へ移す）
description: DaVinci Resolve 21.1のColorTraceでショットを照合し、Automatic／Manualでグレードを引き継ぐ手順と確認点。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [ColorTrace, Automatic, Manual, Copy Grades, All Versions, Preserve Num Nodes]
tasks: [grade, reuse-grade, match-shots, compare-grades]
level: intermediate
updated: "2026-10-23"
---

# ColorTrace：編集が変わったタイムラインにグレードを引き継ぐ

グレーディング済みのタイムラインにカットの追加、尺の変更、VFXの差し替えが入ったとき、すべてを一から補正する必要があるとは限りません。**ColorTrace**は、旧タイムラインのショットと新タイムラインのショットを対応付け、以前のグレードを転送する機能です。ショットをソースタイムコードなどで照合するため、タイムライン上の配置が変わっても転送候補を探せます。

この記事でいう**Source**はグレードを持つ旧版、**Target**はグレードを受け取る新編集版です。起動時に開いて選択しておくのはTargetです。単一のショットからグレードを再利用する[Gallery／Stills](./gallery-stills)や、一つのショットの複数案を管理する[Versions](./versions-and-grade-comparison)とは、対象の単位が異なります。

以下の操作項目と照合表示は、Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 149、pp.3466–3472で確認しています。21.1実機での転送・画面確認は行っていないため、記事全体の検証状態は partial です。

## AutomaticとManualの使い分け

| モード | 対応方法 | 適した状況 |
| --- | --- | --- |
| Automatic | SourceとTargetの素材情報から対応候補を検索する | 同じソースメディアを再編集した版 |
| Manual | 人がSourceとTargetのクリップを選び、Pasteで転送する | リール名やタイムコードが一致しない素材、フラット化したマスターからの再編集 |

Automaticで緑の一致が見つかっても、別テイクや誤った素材への対応がないとは限りません。Manualでも、元と先のショット数や選択順を間違えれば誤転送になります。**転送する組み合わせと、コピーする属性の両方**を確認します。

## 起動と転送元の指定

1. Mediaページを開き、Media Poolで**転送先のTargetタイムライン**を選択して開きます。
2. メニューで **Timelines > ColorTrace > ColorTrace From Timeline** を選択します。
3. ColorTrace Setupの階層リストから、グレードを受け取りたい**Sourceタイムライン**を探して選択します。別プロジェクトの同名タイムラインと間違えないよう、プロジェクト名まで確認します。
4. **Continue**でColorTrace画面を開き、AutomaticかManualのタブを選びます。

これは21.1 Reference Manual p.3467–3468の操作順に基づきます。旧版がSource、新版がTargetという向きが逆になると、意図していないタイムラインへグレードをコピーするおそれがあります。実行前に両者の名称と採用Versionを確認してください。

## Automatic：一致の色を読み、曖昧なショットを解決する

Automaticでは、Target側のサムネイル枠に対応状況が示されます。

| 枠の色 | 21.1 Manualに記載された意味 | 次にすること |
| --- | --- | --- |
| 緑 | 一致するSourceクリップが見つかった | 別テイクでないか代表ショットを点検する |
| 青 | 重複するタイムコード／リール名などにより複数候補がある | Source候補とClip Infoを比較して選ぶ |
| 赤 | 一致するSourceクリップが見つからない | 新規ショットか、情報が変わった旧ショットか判断する |
| 紫 | Source候補を手動で指定し、対応付けた | 選んだ組み合わせを再確認する |

**青のクリップ**を選ぶと、Matching Source Clipsに候補が表示されます。Clip Infoには、SourceとTargetのリール、ソースタイムコード、レコードタイムコード、クリップ名、プロジェクト名、タイムライン名などの比較情報があります。候補をクリックして情報を見比べ、正しいSourceサムネイルを**ダブルクリック**して対応付けます。候補のどれも正しくない場合は **Set As New Shot** を選びます。

VFXショットやモーショングラフィックスでは、多数の素材が同じ開始タイムコードを持つことがあります。その場合、青の複数候補が出ても不具合とは限りません。タイムコードだけで採用せず、リール名、素材名、実際の映像を照合してください。

**Hide Matching Clips**は正常に一致したクリップを非表示にし、青や赤の確認へ集中するための項目です。**Ignore Reel Names**はリール名を無視してタイムコードのみで対応を探します。リール名に誤りがある場合の選択肢ですが、同じタイムコードを持つ別素材の誤対応が増える可能性があるため、一致結果を改めて調べます。

対応が正しくなったらコピー対象を確認し、**Copy Grades**または**Copy Grades & Exit**で転送します。後者はグレードをコピーしてColorTraceを閉じます。ManualのPasteとはボタン名と操作単位が異なります。

## 何をコピーするかを選ぶ

ColorTraceには、転送に含める属性のチェックボックスがあります。21.1 Reference Manual pp.3469–3470で記載を確認した主な項目は次のとおりです。

| 項目 | 役割 | 選ぶ前に確認すること |
| --- | --- | --- |
| Color | グレードのコピーを有効にする | Target固有の補正を上書きしてよいか |
| Preserve Num Nodes | Target側の先頭から指定数のノードを保護する | 保護するノード数と既存の入力補正を確認する |
| All Versions | Sourceの現在のVersionだけでなく、すべてのVersionをコピーする | Targetへ複数案を持ち込む必要があるか |
| Input Sizing | Input Sizingの属性をコピーする | 新編集版のフレーミングと矛盾しないか |
| Version Camera Raw Settings | Versionに紐付いたCamera Raw設定をコピーする | Targetの素材解釈がSourceと同じか |
| Track Marks | キーフレームをコピーする | 新しい編集点と時間方向の補正が一致するか |
| Flags and Markers | フラグとマーカーをコピーする | 新版側の管理情報を変更してよいか |

これらは**「必ずすべてコピーする」という意味ではありません**。入力変換のノードをTargetに残したい場合にPreserve Num Nodesを検討できますが、保護数を推測で決めず、実際のノード構成を確認してから使用します。

Manualでは、Sourceで使用中のLocal／Remote Versionが転送元になります。ColorTraceはGroup Pre-Clip／Group Post-ClipのグレードおよびFusionコンポジションもコピー対象として扱うとManualに記載されています。したがって、Clipのグレードが一致するだけでは転送結果の全体を確認したことになりません。Group補正の重複、既存のFusion処理、新版固有の入力変換がないかも点検してください。関連：[Group Grading](./group-grading)、[Color Management](../learn/color-management-basics)。

## Manual：一致しないショットを個別に転送する

リール名・タイムコードの対応がない場合はManualを選びます。21.1 Manualでは、個別ファイルから構成したタイムラインと、一本化されたマスターファイルから構成したタイムラインの間で転送する例を挙げています。

1. Manualタブで上側の **Source timeline（Timeline to copy from）** からコピー元のショットを選びます。
2. 下側の **Target timeline（Timeline to paste to）** から転送先のショットを選びます。
3. 転送する属性のチェックボックスを確認し、**Paste**を実行します。
4. 続けて修正する場合は結果を点検します。最後のPasteは **Undo Last**、Manual内で行ったPasteは **Undo All** で戻せます。終了には **Done** を使用します。

連続する複数クリップを転送するときは、SourceとTargetのそれぞれで範囲を指定します。サムネイルの先頭と末尾をShiftクリックするか、Copy Range／Paste Rangeで範囲を入力します。**同じ数の連続したクリップを、選択順に対応させて貼り付ける**仕組みです。Sourceの5～9番目をTargetの11～15番目に移す場合は順番に一対一で対応します。SourceとTargetのショット数が異なる区間では一括Pasteにせず、必要な区間を分けて確認します。

## 実践例：インタビュー再編集とVFX差し替え

A・B二台のカメラで撮影したインタビューを想定します。旧タイムラインは人物の基礎補正と肌の局所補正が完成済みです。新編集版ではAカメラの長い発言が二つに分かれ、途中へBカメラが追加され、冒頭のVFXタイトルも更新されています。

まずAutomaticで新編集版をTargetにします。同じ元素材を使ったAカメラの分割部分は転送候補になりますが、採用していたLocal／Remote Versionが何かを確認します。Bカメラの追加ショットが赤なら、無関係なAカメラの補正を無理に割り当てず、該当するBカメラの素材に対応するSourceが存在するか探します。

VFXタイトルのように開始タイムコードが共通の素材は青の複数候補になる場合があります。映像を見て正しい旧タイトルがあれば手動で対応付け、デザインが大きく変わった新タイトルは新規ショットとして扱います。転送後は[Gallery／Stills](./gallery-stills)で基準フレームと比べ、[Scopes](./scopes)で露出やRGBバランスを確認します。

最後に新編集版を再生し、分割されたAカメラの境界でPower WindowやTrackerが合っているか、Group補正が二重になっていないか、VFX差し替えによって不要になった色処理が残っていないかを確認します。このケースは機能を用いた**想定例**で、実機転送の結果や成功率を報告するものではありません。

## 転送後の問題を切り分ける

| 症状 | 先に確認すること | 対応 |
| --- | --- | --- |
| 別テイクの色が付いた | 青の複数候補、Clip Info、素材の絵 | 対応を訂正して該当グレードを転送し直す |
| 一部だけ転送されない | 赤の未一致、新規素材、リール名 | Manualで対応を指定するか新規グレードを作る |
| 色だけでなく画角も変わった | Input SizingやTargetの既存Sizing | コピー属性を見直し、[Sizing](./color-sizing)を確認する |
| Targetの入力補正が消えた | Color転送先の既存ノード、Preserve Num Nodes | 保護すべき先頭ノードと転送結果を点検する |
| 元と同じ補正のはずなのに色が違う | Source Version、色管理、Group補正 | [Versions](./versions-and-grade-comparison)とGroup段階を比較する |
| Windowが顔から外れた | 別テイク、時間位置、Tracker | [Power Windows](./power-windows)とTrackerを再確認する |
| 補正のタイミングがずれた | Track Marks、編集点、キーの位置 | [Color Keyframes](./color-keyframes)を確認する |

## 出典・対象版・確認範囲

- **対象：DaVinci Resolve 21.1。** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（September 2026）、**Chapter 149「Copying and Importing Grades Using ColorTrace」pp.3466–3472**を2026年10月23日に直接確認。起動メニュー、Automatic／Manual、色別の一致状態、手動照合、属性チェックボックス、Paste／Undoの説明は該当箇所に基づきます。
- **関連公式資料：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)』。ColorページのGallery、Scopes、ノード・グレード運用を参照するための資料です。
- **verification: partial。** 21.1実機でのGUI操作、実素材での転送結果、画面レイアウトの差異、すべてのコピー属性の組み合わせ、Free／Studioの機能差は検証していません。記事の実践例は作業上の判断例です。Manualに記載のない初期設定値や版差は補っていません。

関連：[Gallery／Stills](./gallery-stills)／[Versions](./versions-and-grade-comparison)／[Group Grading](./group-grading)／[Scopes](./scopes)。
