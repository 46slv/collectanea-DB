---
title: Versions（Local／Remote／Groupのグレード案を管理する）
description: DaVinci Resolve 21.1のVersionsでグレード案を作成・切り替え・比較し、Local／Remoteの連動範囲やGroup Versionsを判断する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Versions, Local Versions, Remote Versions, Group Versions, Split Screen, Gallery, Still]
tasks: [compare-grades, manage-grade-variants, grade, reuse-grade]
level: intermediate
updated: "2026-10-28"
---

# Versions：同じショットの複数のグレード案を扱う

人物の肌を自然に保つ案と、コントラストを強める案を比べるとき、既存グレードを上書きし続ける必要はありません。Colorページの **Versions** は、クリップに複数のグレードを保持し、使用するものを切り替える機能です。**一度に有効になるのは各クリップで1つのVersion**です。

Versionsが保持するのはColorページのグレード案です。編集タイムラインそのものの別案や、Galleryに保存したStillとは区別します。以下の機能とメニューは、Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 142（pp.3351–3360、3382）を直接確認したものです。実機での操作・表示・書き出しは未検証です。

## Local／Remote／Groupの使い分け

| 種類 | 共有範囲 | 選ぶ場面 |
| --- | --- | --- |
| **Local Version** | そのタイムラインのクリップで独立。ほかのクリップやタイムラインに自動共有しない | 本編の特定カットだけ別のLookにする |
| **Remote Version** | Media Pool内の同一ソースを参照し、Remoteを使用するクリップ間でグレードを共有 | 同一インタビュー素材の複数カットに共通の基礎補正を与える |
| **Group Version** | 同じグループに属する全クリップの共通グレード | グループ全体のPre-Clip／Post-Clip Lookを切り替える |
| **Gallery Still** | 保存したフレームとグレードを比較・再利用する参照 | 別素材との比較、別ショットへのグレード受け渡し |

新規プロジェクトの通常設定では、最初のグレードは **Local Version「Version 1」** です（設定プリセットを変更している場合を除く）。LocalとRemoteは一つのクリップに共存でき、どちらの系統のVersionを使うか選べます。Remoteの共有は単にファイル名が似ていることではなく、**同じMedia Poolソースへの参照**と、クリップ側でRemoteを使っていることに依存します。（Manual pp.3351–3353）

[Gallery／Stills](./gallery-stills)は保存・転用する参照、[Group Pre-Clip／Clip／Post-Clip](./group-grading)は補正の適用段階、[Shared Nodes](./shared-nodes)はノード自体の共有を扱います。Versionsでグレード案を分けたことと、これらの共有が解除されることは同義ではありません。

## 1. 既存案を残して新しいVersionを作る

すでに露出とホワイトバランスを整えた人物ショットで、別のLookを試す例です。

1. Colorページで対象クリップを選び、Node GraphとViewerで現在の補正を確かめます。先にLocal／RemoteのどちらのVersionが使われているか確認します。
2. Colorページのクリップサムネイルを右クリックし、**Local Versions > Create New Version** を選びます。Remoteの案を作りたいときは **Remote Versions > Create New Version** を選びます。
3. 新しいVersionに「Natural」「Warm Contrast」など内容が分かる名前を付けます。作成ダイアログの **Copy all marks** と **Copy the first mark only** で、元のVersionからキーフレームを引き継ぐ範囲を選びます。Manualでは、**モーショントラッキングはこの選択にかかわらずコピーされる**と説明されています。
4. 新しいVersionが選択されていることを確かめ、[Primaries](./primaries-color-wheels)や[Custom Curves](./custom-curves)でLookを調整します。肌の赤み、白い衣装、暗部の色を見て、変更の影響を評価します。
5. 比較するときはクリップを右クリックし、目的のLocal／Remote Versionのサブメニューから **Load** を選び、元案へ切り替えます。採用案を決める前に両方を見直します。

ショート操作として **Color > Grade Version > Add** もあります。こちらは現在使用しているLocal／Remoteの種類で新しいVersionを作り、以前のVersionの**キーフレームとモーショントラッキングをコピー**します。キーフレームのコピー範囲を選ぶなら右クリックから作成する方法を使います。（Manual pp.3357–3358）

Versionの名前は、対象Versionのサブメニューにある **Rename** から変更できます。複数のクリップを選んでVersionの作成・改名・読み込みをまとめて行う機能もありますが、同じ名前のVersionを同じ補正とみなさず、各クリップの実際の結果を確認してください。

## 2. Viewerで比較して採用案を選ぶ

1. まず同じフレーム位置で元案と新案を順番にLoadし、肌、中間調、ハイライト、背景の色がどのように変わるかを観察します。
2. 画面を同時比較したい場合はViewerの **Split Screen** を有効にし、Versionsを比較する表示対象を選びます。21.1の各表示項目の全名称や選択順序は本記事では実機確認していません。
3. 顔の明るさを上げた案が白い衣装を失っていないか、コントラストを強めた案が暗部のディテールを潰していないかを比較します。必要に応じて[Scopes](./scopes)も使います。
4. 採用したVersionをLoadした後、Split Screenを解除して前後のカットを再生します。同一ショットで好ましい案でも、カット間で色が飛ぶことがあります。

同一クリップの複数VersionをSplit Screenで比較できることは[Blackmagic DesignのColor公式紹介](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)でも案内されています。Stillと現フレームを重ねて比較する場合は[Gallery／Stills](./gallery-stills)のImage Wipeを参照してください。

## 3. Remoteの共有を止めて個別調整する

Remote Versionを使う複数のカットが**同一Media Poolソース、同じRemote Version**を参照していると、そのVersionのグレード変更は連動します。ただし、**どのVersionを表示するかというクリップごとの選択は自動で連動しません**。例えば本編のVersion 1を調整するとVersion 1を使用中の別カットにも反映されますが、別カットがVersion 2を使用していればそのままVersion 2を使い続けます。（Manual pp.3355–3356）

共有を外す選択肢は二つあります。

- **一部のカットだけ別のRemote Versionにする：** 対象クリップで新しいRemote Versionを作り、そのVersionを選びます。同じソースの別カットが同じVersionを使えば、そこでは再び連動します。
- **そのカットのグレードを独立させる：** サムネイルのRemote Versionサブメニューで、対象Versionの **Copy to Local** を選びます。現在のRemoteグレードをLocalへコピーし、そのLocalを使用できます。

タイムライン全体を対象とする右クリックコマンドでは、次の違いが重要です。（Manual pp.3356–3357）

| コマンド | 結果と注意 |
| --- | --- |
| **Use Local Grades** | タイムライン内のクリップを既存のLocalへ切り替える。Localが存在しないクリップは未グレードの状態になる場合がある |
| **Copy Remote Grades to Local** | 各クリップで現在選択されているRemoteのグレードをLocalへコピーする。既存Localを上書きし得る |
| **Use Remote Grades** | タイムラインのクリップをRemoteへ戻す。Localで作業した補正をRemoteへ自動転送する操作ではない |
| **Copy Local Grades to Remote** | 現在のタイムラインのLocalグレードをRemoteへコピーする。同一Media Poolソースを複数カットで使っていると、最後の共有クリップのグレードに集約され得る |

Manualは **Use Local Grades** と **Copy Remote Grades to Local** を通常のUndoで元に戻せない操作として説明しています。切替とコピーを混同せず、使う前にLocalに残すべき案を確認してください。

新しくタイムラインへ配置するクリップをRemote既定にしたい場合は、**Project Settings > General Options > Color > Use local version for new clips in timeline** をオフにします。これは**変更後に追加するクリップ**へ適用する設定で、既存クリップを一斉にRemoteへ変える設定ではありません。（Manual p.3352）

## 4. 「Version 1」と書き出し時のVersion

「Version 1」は番号だけの飾りではなく、**先頭のdefault Version**です。Manualによると、Remote前提で別タイムラインを読み込むときやタイムライン全体をLocal／Remoteに切り替えるときに、現在選択していた案ではなくdefault Versionが使用される場合があります。再編集・コンフォームを前提にする場合、最終的に必要なグレードがdefaultへ反映されているか確認します。（Manual p.3359）

通常のDeliverページでは、各クリップで**現在選択しているVersion**がレンダリングされます。最終案をLoadしてからDeliverへ進み、出力時にも意図したVersionかを確かめてください。Commercial Workflowなど複数Versionを扱う特別な出力設定は、この通常の書き出しと区別します。（Manual p.3360）

## 5. Group Versionsはクリップ単位の案と別に管理する

DaVinci Resolve 21.1では、**Clip Groupの共通グレードにもVersion**を持たせられます。グループ化されたクリップのサムネイルを右クリックし、**Groups** とそのサブメニューから作成・切り替えます。Node Stack Layersを使う場合は、Pre-Clip／Post-Clipのノードグラフにも複数のVersionを持てます。

重要なのは、**同じグループに属するクリップごとに別のGroup Versionを選ぶことはできない**点です。グループのVersionを切り替えると、グループ内の全クリップに影響します。（Manual p.3382）

例えば3台のカメラで同じスタジオを撮影しているなら、各カメラの露出・ホワイトバランスはClip単位で整え、共通の暖色LookだけをGroupのPre-Clip／Post-Clipで管理します。「本編用」「告知用」の共通LookをGroup Versionsとして比較できますが、あるカメラだけの問題をGroup Versionで直すとほかのカメラにも影響するため、Clip側の調整に分けます。

## 判断例：本編と告知映像に同じインタビュー素材がある

同じMedia Poolのインタビュー素材から本編と短い告知映像を編集したとします。両方の基礎補正をそろえたいならRemote Versionが候補です。ただし、本編だけ肌を自然に保ち、告知だけ寒色の演出を加えたい場合、告知の該当カットはRemoteの **Copy to Local** などで独立させて調整します。

同じ素材でも、撮影途中に露出が変わった部分を一律に共有すると、あるカットだけ暗くなることがあります。その部分だけ別のVersionへ分けるかLocalへ移し、前後のショットを比較してください。最終採用時にはVersionの種類・名前・対象タイムラインを確かめ、複数カットに意図しない変更が及んでいないか確認します。

## 期待と異なる結果になったら

| 症状 | 確認すること |
| --- | --- |
| 元の案へ戻れない | 新Versionを作成してから編集したか、Local／RemoteのどちらをLoadしているか |
| 別タイムラインの同素材まで変化した | そのクリップがRemoteで同一Media Poolソースと同じVersionを使用していないか |
| Localへ切り替えたら補正が消えた | Use Local Gradesを使用し、コピー元RemoteからLocalを作っていなかったか |
| RemoteからLocalへコピーしたら前の案が消えた | Copy Remote Grades to Localで既存Localを上書きしていないか |
| 複数カットで案が連動しない | Remoteでも選択されているVersionが異なっていないか |
| Groupの切替で全カメラが変わった | Group VersionsとClip Versionsを取り違えていないか |
| Deliver後に意図しないLookになった | 書き出し対象Version、default Version、タイムラインの切替履歴 |

## 出典・対象版・未検証範囲

- **対象：DaVinci Resolve 21.1。** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月版）、**Chapter 142「Grade Management」pp.3351–3360およびp.3382**を2026年10月28日に直接確認。Local／Remoteの共有、作成・読み込み、Copy to Local、タイムライン単位の切替、default Version、Deliver、Group Versionに関する操作説明の出典。
- **比較表示：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)』。同じクリップのVersionをSplit Screenで比較できる機能の出典。
- **verification: partial。** 公式Manualの記載との文書照合は完了。Resolve 21.1実機のメニュー表示・Windowsのショートカット、複数クリップ一括操作、Group VersionとNode Stack Layersの挙動、キーフレーム／トラッキングの複製結果、Free／Studio差、Deliverの実出力は未検証。ここで示した本編／告知・3カメラの判断例は仮想例であり、操作の実測ではありません。

関連：[Gallery／Stills](./gallery-stills)／[グループ補正](./group-grading)／[Split Screen](./split-screen-comparison)／[Scopes](./scopes)。
