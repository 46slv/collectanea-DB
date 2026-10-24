---
title: 同じ素材の別カットまで色が変わるとき（Remote Grades）
description: Colorページで一つのカットを補正すると同じ素材の別カットにも反映される症状を、Local／Remote Versionsと共通補正に分けて調べる。
doc_type: troubleshooting
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Local Versions, Remote Versions, Common Media Pool Clips, Copy to Local]
tasks: [grade, troubleshoot, match-shots]
symptoms: [grade-changes-across-clips, remote-grade-linking]
level: intermediate
updated: "2026-10-24"
---

# 同じ素材の別カットまで色が変わるとき

Colorページでインタビューの一部分だけを明るくしたのに、同じ収録素材から切り出した別のカットも明るくなることがあります。まず、そのクリップが**Remote Version（リモートバージョン）**を使用しているか確認します。Remote Versionでは、Media Pool上の同じ元クリップを参照するカットが、同じバージョンのグレードを共有します。

この症状は、Group、Shared Node、Timelineグレーディングでも似た見え方になります。補正をリセットする前に、どの範囲で変更が共有されているかを調べます。

## 確認用の素材と期待する結果

例として、25分間続けて撮影した1本のインタビュー素材を、次の3カットに編集したタイムラインを想定します。

| カット | 元素材 | 撮影時の状態 | 目的 |
| --- | --- | --- | --- |
| A1（序盤） | Camera Aの同じMedia Poolクリップ | 露出が安定 | 現状の補正を維持 |
| A2（中盤） | 同上 | 途中で露出が下がる | A2だけ明るくする |
| A3（終盤） | 同上 | 露出が戻る | 現状の補正を維持 |

A2のグレードを調整しても、A1とA3が変化しない状態を目指します。これは**操作を説明するための仮想素材**であり、実機で収録・検証した結果ではありません。

同じファイル名に見えても、Media Poolで別々のクリップに分割・再リンクされている場合は、Remote Versionの自動共有条件が異なることがあります。

## 最初に確認すること

1. ColorページでA2を選び、タイムラインのクリップサムネイルを右クリックして、Local Versions／Remote Versionsの項目と現在使用中のバージョンを確認します。
2. サムネイル下部の表示を切り替えると、Remote Version使用中のクリップには **(R)** が表示されます。ラベルが見えないだけでLocalだと判断せず、右クリックメニューも確認します。
3. ColorページのTimeline Filteringにある **Common Media Pool Clips** は、選択中のクリップとリンクするカットの確認に使えます。同じ元素材の別タイムラインにもRemote Versionを使うカットがあるか調べます。
4. A1、A2、A3で実際に共有されているのが同じRemote Versionか確認します。同じソースでも別のRemote Versionが選ばれていれば、同じ補正結果とは限りません。

21.1 Reference ManualのChapter 142によると、自動共有には「Remote Versionを使用している」「同じMedia Poolの元クリップを参照している」の両方が必要です。違う素材間で同じ変化が起きる場合、Remote Version以外の共通補正も調べます。

## 原因を切り分ける

### A2だけ変えたいのにA1とA3も変わる

3カットが同じRemote Versionを使っていれば、どれか1つの補正が他のカットにも反映されます。まず、この共有が意図した設定か確認してください。ほかのタイムラインに同じ素材を使っている場合、そちらにも影響する可能性があります。

**A2の現在のグレードを保ったまま独立させたい場合**は、A2のサムネイルを右クリックし、該当するRemote Versionsのサブメニューから **Copy to Local** を選びます。マニュアルでは、選択したRemote VersionのグレードがA2のLocal Versionへコピーされ、そのLocal Versionが現在のグレードになります。その後、A2に必要な露出補正を加えます。

期待する結果は、A2だけに露出補正が加わり、A1とA3のRemote Versionは元のグレードを維持することです。変更後はA1、A2、A3をそれぞれ選び直し、Viewerと[Scopes](../reference/scopes)で確認します。

### 同じ素材で共通補正も残したい

全カットを独立させる必要はありません。まずRemote Versionで同じ撮影条件のカットをそろえ、露出が変わったA2だけをLocal Versionにする方法があります。

別のRemote Versionを作って分ける方法も公式Manualに記載されています。ただし、**同じ元素材で同じRemote Versionを選ぶカット同士は再びリンク**します。A2を完全に独立して調整したい場合、Local Versionの方が目的を説明しやすくなります。[Versionsの扱い](../reference/versions-and-grade-comparison)も参照してください。

### タイムライン全体をLocalへ移したい

たとえば、本編と予告編で同じ素材を使うが、予告編だけ別の明るさやLookを付けたい場合です。

サムネイルの右クリックメニューには次の異なる操作があります。

| 操作 | Manualに記載された結果 | 注意点 |
| --- | --- | --- |
| **Use Local Grades** | タイムラインの各カットを既存のLocal Versionへ切り替える | Local Versionがまだなければ未グレーディング表示になる |
| **Copy Remote Grades to Local** | 各カットの現在のRemote VersionのグレードをLocal Versionへコピーする | 既存のLocal Versionを上書きする場合がある |
| **Use Remote Grades** | タイムラインをRemote Versionへ戻す | 同じ素材・同じRemote Version間の共有が再開し得る |

**Use Local GradesとCopy Remote Grades to Localを同じ操作と考えないでください。** Manualでは、この2つのタイムライン単位の操作はUndoで取り消せないと説明されています。既存のLocal補正を残す必要がある場合、現在のLocal／Remoteの状態と内容を先に確認し、コピーによる上書きを避けます。

逆向きの **Copy Local Grades to Remote** は、同じ元素材を使う複数カットがあると、タイムラインの最後の該当カットのグレードが共有Remote Gradeとして残る場合があるため、問題の切り分け中には実行しません。

### Localにしたのに複数カットが同時に変わる

Local Versionは、グレードの自動共有を止めるためのものです。それでも複数カットが変わる場合は、別の共有処理を確認します。

- **Group Pre-Clip／Post-Clip：** グループ共通補正が原因になっていないか[Groupグレーディング](../reference/group-grading)を確認します。
- **Shared Node：** 複数クリップで同じノードを共有していないか[Shared Node](../reference/shared-nodes)を確認します。
- **Timeline：** [Timelineグレーディング](../reference/timeline-grading)による全編共通の変化か調べます。

これらはRemote Versionの動作と区別して確認する候補です。「Localにしたのに同じ結果になる」だけで原因を断定せず、共通の処理を一つずつ比較します。

## 設定変更が効かない場合

Project Settings → General Options → Colorの **Use local version for new clips in timeline** をOFFにすると、以後追加するクリップでRemote Versionが既定になります。**すでにタイムラインへ配置済みのクリップは、この設定変更だけでは切り替わりません。** 既存クリップの状態は、サムネイルから直接確かめます。

同じ素材から派生したクリップがメディア管理で別々のファイルへ整理されている場合は、そもそもRemote Versionの自動共有条件を満たさない可能性があります。元ファイルとMedia Pool上の参照関係を確認します。

## 修正後の確認

A2だけをLocalへ分けた場合、同じフレームや同程度の照明条件を使ってA1／A2／A3を比較します。A2で意図した明るさになり、A1とA3のグレードが維持されていることを確認してください。

さらに、別タイムラインの同じ元素材を使うショットも確認します。Colorページでは[Image Wipeによる比較](../recipes/image-wipe-two-shot-comparison)や[ショットマッチング](../recipes/matching-multicamera-interview)を併用できます。比較中は、カラーマネージメントや出力設定まで同時に変更しないようにします。

## 出典・版・未検証範囲

- **公式一次資料：** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』、Color Chapter 142「Grade Management」、pp.3351–3357。2026年10月24日に公式21.1 Manualの本文を直接確認。Local／Remote Versionsのリンク条件、Copy to Local、タイムライン切替とUndo不可、既定設定の適用範囲を参照。
- **対象版：** DaVinci Resolve 21.1。操作名と共有条件は上記Manualの該当ページに基づきます。
- **verification: partial。** この手順を21.1の実機で操作・書き出し検証したわけではありません。メニューのローカライズ表示、実際のプロジェクトにおけるGroup／Shared Nodeとの相互作用、Free／Studio差は未検証です。表中の素材や補正後の結果はManualから導いた確認例です。
