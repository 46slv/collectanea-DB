---
title: Shared Node（複数クリップで同じ補正を共有する）
description: ColorページのShared Nodeを作成・再利用し、複数ショットの共通Lookとクリップ固有の補正を管理する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Node Editor, Corrector Node, Shared Node, Group Pre-Clip, Group Post-Clip, Timeline Grade]
tasks: [shared-node, reuse-grade, grade, match-shots, node-order, troubleshoot]
level: intermediate
updated: "2026-10-22"
---

# Shared Node：複数クリップの補正を連動させる

同じインタビューの正面・寄り・引きに共通するLookを使いたい。ただし、露出やホワイトバランスはカットごとに調整したい。完成したグレードを毎回コピーすると、後から共通Lookを変更した際に各ショットへ修正を繰り返す必要があります。

**Shared Node（共有ノード）**は、ColorページのCorrectorノードを複数クリップのグレード内で共有する方法です。同じShared Nodeを配置した複数のクリップでは、ロックを解除して共有内容を修正すると、ほかの使用クリップにも変更が反映されます。通常のノードも同じNode Graph内に残せるため、共有する補正だけを切り出せます。

Blackmagic Designの[Color公式ページ](https://www.blackmagicdesign.com/products/davinciresolve/color)「Share Grades on Multiple Clips」は、Correctorの共有、ラベルを付けた保存、別クリップへの追加、初期ロック、ロック解除後の変更共有を明示しています。本記事はその機能説明を基本根拠とし、DaVinci Resolve 21.1実機で確認していない細かなUI項目は断定しません。

## 共有する単位を選ぶ

| 方法 | 適用範囲 | 使い分け |
| --- | --- | --- |
| 通常のCorrectorノード | 選択したクリップのグレード内 | そのカットだけの露出、肌、追跡やWindow |
| Shared Node | 同じ共有ノードを置いた複数クリップ | 離れたカットに共通のLookや補正 |
| Group Pre-Clip／Post-Clip | 同じグループに所属するクリップ | グループ単位の前段補正や共通Look |
| Timelineグレード | 現在の編集タイムライン全体 | 全編に共通の仕上げ |

[Group Grading](./group-grading)では、グループに所属するクリップすべてへPre-Clip／Post-Clip段階の補正が作用します。Shared Nodeはグループの所属とは別に、**配置したクリップだけ**で一つのノードを共有します。たとえば、同じカメラの素材に一つのShared Nodeを使い、その一部のシーンにだけ別のShared Nodeを追加する、といった重複した適用範囲を設計できます。

[Timelineグレーディング](./timeline-grading)は全編への共通補正に向きます。対象が作品の一部なら、Shared NodeやGroupの方が副作用の範囲を読み取りやすい場合があります。特定のクリップだけを直したいときは、共有ノードを書き換える前に通常ノードでの調整を検討します。

## Shared Nodeの作成と再利用

公式Colorページに記載された基本操作を、補正の影響範囲を確認しやすい順に整理します。21.1の細かなサブメニュー名・座標・ショートカットは実機未照合です。

1. Colorページで対象クリップを選び、Node Editorが**Clip**段階のグレードを扱っているか確かめます。GroupやTimeline段階のノードと混同しないようにします。
2. 共有したい処理を通常のCorrectorノードに分けます。各クリップで調整する露出やホワイトバランスと、作品共通のLookを一つのノードへ混在させない構成です。
3. そのCorrectorを右クリックして**Shared Nodeとして保存**する操作を使い、用途を識別できる固有のラベルを付けます。公式ページはこの保存方法を紹介しています。
4. 別のクリップを選び、Node Editorを右クリックして**Add Node**から既存のShared Nodeを追加します。ラベルの似た通常ノードを新規作成したのではなく、同じ共有ノードを使っているか確認します。
5. それぞれのクリップで、共有ノードの前後にある通常ノードと処理順を見比べます。同じShared Nodeでも、入力素材や前段の補正が異なれば結果は一致しません。
6. Shared Nodeは**初期状態でロック**されていると公式ページに記載されています。共通補正を更新したい場合だけ、影響先を把握してからロック解除して調整します。ほかの使用クリップにも反映されるので、代表ショットだけでなく副作用が出やすいショットも確認します。

ロック解除は、変更を一つのカットだけに限定するための操作ではありません。共有内容を編集する場面では、共通変更が本当に必要かを先に判断します。Shared Node以外の設定や効果に対する詳細な同期範囲は、21.1実機で未確認です。

## 同じノードでも結果が変わる理由

[Color Node Graph](../learn/color-node-graph)のSerial構成では、上流で変更された画像が下流の入力になります。各クリップで共有ノードを置く順番や、上流の明暗・色の調整が異なれば、同じ共有内容を通っても最終的な色は変わります。[Serial／Parallel／Layer](./serial-parallel-layer-nodes)の合成構成を扱う場合も、共有範囲とは別に入力と処理順を確認します。

とくに[カラーマネージメント](../learn/color-management-basics)が異なる素材へ共通のCSTやカメラ固有LUTを使うと、同じ設定が適切な変換になるとは限りません。RCMで変換済みの画像に同じCSTを重ねることも避けます。異なるカメラの素材に共通Lookを当てる場合は、入力の色域・ガンマと表示変換を確認したうえで、各素材の露出と色をそろえてから適用します。

**判断例：** AカメラのLog素材ではShared NodeのLookが自然でも、Bカメラでは肌が極端に赤くなる。まずBの入力変換、前段の露出・ホワイトバランス、共有ノードの処理順を確認します。共有ノード自体を修正するとAも変わるため、原因がB固有ならBの通常ノードか共有対象の分離で対処します。

## 操作例1：3台のインタビュー映像へ共通Look

正面・斜め・引きの3カメラで撮影したインタビューを考えます。各カメラの入力条件が整っていても、顔の露出や背景の明るさには差が残っています。一方、作品としては全カットに落ち着いた暖色Lookを加えたい状態です。

1. 各クリップの通常ノードで露出・色かぶりを整え、[Scopes](./scopes)とViewerで比較します。撮影時の光の方向やシーンの意図まで同じにしません。
2. 基準カットで、共通Look専用のCorrectorノードを作り、肌、白い服、暗部が不自然にならない程度に調整します。
3. そのノードを「Interview common look」などのラベルでShared Nodeとして保存し、残る2カットにも追加します。
4. 斜めカットだけ顔が暗いなら、斜めカットの通常ノードで補正します。3カットすべてのLookを変えると判断したときだけ、共有ノードのロックを解除して変更します。
5. [Gallery／Stills](./gallery-stills)などを使ってカットを比較し、編集順に再生します。肌、背景、ハイライトの連続性を確かめます。

採否はShared Nodeが3カットに配置されていることだけでは決めません。共通変更が3カットとも意図した方向へ作用し、切り替わりで明暗や色が不自然に跳ばないことを確認します。

## 操作例2：対象が重なる共通補正

室内の4カットには「Room look」を共有し、そのうち顔の寄り2カットにだけ、控えめな肌の補正を追加したい場面を想定します。4カットへ一つ目のShared Nodeを、寄り2カットへ二つ目のShared Nodeを追加する構成が考えられます。廊下のカットなど対象外のショットには追加しません。

ただし、[Power Window](./power-windows)や[Tracker](./color-tracker)を使う局所処理は、構図や被写体の動きが違えば同じ選択範囲で成立するとは限りません。共有ノードには共通の色調だけを入れ、位置や追跡を各クリップの通常ノードで扱う構成も検討します。共有Windowの座標やトラッキングデータが21.1でどのように同期されるかは、本記事では未検証です。

## 変更前後に確認すること

共有ノードを編集する前に、「そのノードを使っているクリップ」と「今回変更したい範囲」が一致しているか確かめます。代表的なショットと、素材・照明・構図が異なるショットを比較し、共有内容を変更した後で両方の結果を見ます。

通常ノードとShared Nodeの取り違え、Clip／Group／Timeline段階の取り違え、入力変換の違い、Node Graph内での順番の違いを分けて点検します。[Versionsとグレード比較](./versions-and-grade-comparison)やScopesは、変更前後の評価に利用できます。

## よくある症状

| 症状 | 先に確認すること | 対応の方向 |
| --- | --- | --- |
| 1カットを変更したら他カットも変わった | Shared Nodeを編集していないか | 共通変更か個別変更かを判定し、後者なら通常ノードへ分離 |
| 共有ノードの補正を変更できない | ロック状態 | 使用先を確認してから解除の要否を判断 |
| 同じ共有ノードでも色が合わない | 入力素材、色管理、前段補正、ノード順 | 各クリップの処理条件をそろえて比較 |
| 一部のカメラだけ色が異常 | カメラ固有変換・LUTの誤用 | 共有対象か入力変換を見直す |
| 顔や背景に境界が見える | Window／Qualifierと各カットの構図 | 選択範囲をクリップ固有にすることを検討 |
| 共通変更が一部のカットに反映されない | 同じShared Nodeを配置しているか | 共有状態とNode Graphを再確認 |
| 予定外の全カットへ変更が及んだ | ClipではなくGroup／Timeline段階ではないか | 現在のグレード段階を確認 |

## 出典・対象版・検証範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design[『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（2026年9月8日公開）。該当章の本文と21.1実機操作は直接照合できていません。詳細なメニュー配置、内部同期処理、全パラメータ値域、Free／Studio差を断定しません。
- **基本操作の直接根拠：** Blackmagic Design[『DaVinci Resolve — Color』](https://www.blackmagicdesign.com/products/davinciresolve/color)「Share Grades on Multiple Clips」（2026年10月22日確認）。Shared Nodeの作成、固有ラベル、Add Nodeからの再利用、初期ロックとロック解除後の変更共有を確認。
- **verification: partial。** 操作例は公式資料に基づく想定例です。21.1の実機画面、ロックに伴う詳細挙動、共有Window／Tracker、Edition差は未検証です。

関連：[Color Node Graph](../learn/color-node-graph)／[Group Grading](./group-grading)／[Timeline](./timeline-grading)／[Gallery／Stills](./gallery-stills)