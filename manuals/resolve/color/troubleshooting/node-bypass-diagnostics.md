---
title: ノード無効化とグレードバイパスで原因を切り分ける
description: Colorページの個別ノード無効化、全ノード無効化、Color／Fusionバイパスの違いを理解し、補正の問題箇所を診断する。
doc_type: troubleshooting
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Node Editor, Enable/Disable Nodes, Bypass Color Grades and Fusion Effects, Scopes]
tasks: [grade, troubleshoot, node-order, quality-control]
level: intermediate
updated: "2026-10-22"
---

# ノード無効化とグレードバイパスで原因を切り分ける

Colorページで突然コントラストが強くなったり、肌だけ不自然に見えたりした場合、補正値を重ねて打ち消す前に、**どの処理を通過したときに結果が変わるか**を確認します。各ノードの有効／無効を切り替える方法と、Colorグレード全体をバイパスする方法では、比較する範囲が異なります。

本記事は診断の順序と、比較後に元の状態へ戻す手順を扱います。ノードグラフの基本は[Node Graph](../learn/color-node-graph)、変換の重複は[CST](../reference/color-space-transform)を参照してください。

## 4種類の比較を区別する

| 操作の範囲 | 調べられること | 注意 |
| --- | --- | --- |
| 選択した1ノードを無効化 | 特定の明暗・色・マスク・エフェクトの寄与 | 後段のノードの入力も変わり得る |
| 複数ノードを無効化 | 補正のある段階をまとめて除いた場合の変化 | 選択中のノードを取り違えない |
| 現在のグレードの全ノードを無効化 | そのノードグラフ全体の寄与 | RCMの変換まで外れるとは限らない |
| Color／Fusionのバイパス | 大きな処理群を除外した表示比較 | ノードの個別無効化、Resetと同一視しない |

Blackmagic Design公式Colorページは、映像がノードエディターを左から右へ流れ、それぞれの補正や効果が順に処理されることを説明しています。あるノードを切って結果が変わっても、必ずしもそのノード単独の設定ミスとは限りません。**後段が受け取る画像も変化する**ためです。

## 比較前に固定するもの

1. 問題が見えるクリップとフレームを決めます。動くWindowやキーアニメーションがある場合は同じ再生区間も確認します。
2. Node EditorがClip、Group Pre-Clip、Group Post-Clip、Timelineのどこを表示しているか確認します。[Group Grading](../reference/group-grading)と[Timeline Grading](../reference/timeline-grading)で作用範囲を整理できます。
3. すでに無効なノード、CST／LUTの位置、Shared Nodeの利用、Color／Fusionバイパス状態を記録します。比較用の[Gallery Still](../reference/gallery-stills)やノードグラフのスクリーンショットは診断前後の参照に使えます。
4. Viewerと[Scopes](../reference/scopes)は同じフレーム、表示条件で比べます。調査中に色管理や出力設定を同時に変更しません。

画面の保存だけではノード値を復元できない場合があります。既存の無効状態を記録するのは、**最初からOFFだったノードを誤ってONにしないため**です。

## 1. 個別ノードのON／OFFで範囲を絞る

次のシリアル構成を考えます。

```text
入力 → [01 BALANCE] → [02 SKIN] → [03 LOOK] → 出力
```

顔が赤く見える場合、03 LOOKだけを一時的に無効化し、同じフレームの肌と背景、Scopesを比較します。赤みが収まるなら、03の処理または03と前段の組み合わせが関係している可能性があります。03を元へ戻して02 SKINだけを切り、肌の領域やマスク境界がどう変わるか確認します。

DaVinci Resolve 21 Reference Manualの**非公式HTML掲載版**「Node Editing Basics」には、ノード番号のクリックや、Color > NodesのEnable/Disable Selected Nodesで個別ノードを切り替える方法が載っています。これは21.1公式PDFの直接照合ではありません。21.1での画面名・ショートカットを断定せず、実機の該当メニューと切替結果を確かめてください。

Qualifier、Power Window、Trackerを含むノードでは、画像の変化だけでなく選択領域の動きも確認します。マットが不安定な場合は[二次補正のちらつき](./secondary-matte-flicker)を参照してください。

## 2. 複数ノードをまとめて外す

例えば01＝入力変換、02＝露出、03＝共通Look、04＝Glowの構成なら、03と04を一時的に外すと「演出段階の処理を除いた状態」を確認できます。その後03だけ、04だけを比較すればさらに絞れます。

非公式のResolve 21マニュアル掲載版には複数選択して有効／無効を切り替える操作も記載されています。ただし選択中のノードも処理対象になるため、意図しないCST等を含めないことが重要です。技術変換をOFFにしたLog映像を、正しい完成表示だと判断しないでください。[Color Management](../learn/color-management-basics)と[LUTの適用位置](../reference/luts)を確認し、比較の前後で同じ出力条件を使います。

## 3. 全ノード無効化とColor／Fusionバイパスの違い

Resolve 21の非公式HTML掲載版は、Enable/Disable All NodesとViewerのBypass Color Grades and Fusion Effectsを別の機能として説明しています。後者はColorとFusionの対象を選ぶ比較方法が記載されていますが、**21.1のメニュー名、処理範囲、Free／Studio差は未照合**です。

全ノードの一括OFF／ONでは、もともと個別に無効化していたノードも有効化される可能性があります。Resolve 21の非公式掲載版にはこの注意書きがあります。したがって、現状を確実に戻す必要がある案件では、初期状態を記録せずに一括切替を使わない方が安全です。

ColorとFusionを同時にバイパスして正常に見えた場合、Colorノードだけが原因とは断定できません。比較できる環境ならColorだけ、Fusionだけ、それぞれの状態で観察します。これによってFusionの内部ノードをColorの機能として説明するものではありません。

RCMを利用している場合、グレードの全ノードをOFFにした映像でも、素材のデコードやプロジェクトの色管理が残る可能性があります。「すべてOFF＝カメラからの未処理映像」とみなさず、[Color Management](../learn/color-management-basics)の入力・出力条件を確認します。

## 4. Clipで直らない場合は共通補正を確認する

Clipノードを切っても全編の色かぶりが残るなら、Group Post-ClipやTimelineの共通Lookを調べます。カメラBのショットだけに問題があるなら、まずそのカメラのInput解釈やGroup Pre-Clipを確認します。

Shared Nodeを利用している場合、一つのクリップで値を書き換えると別のクリップにも影響し得ます。[Shared Node](../reference/shared-nodes)で共有範囲を確認してから診断します。共有ノードの有効状態が他クリップにどう伝わるかは21.1実機で別途確認が必要です。

## 判断例：特定カメラの窓だけ白くなる

2台のカメラを使ったインタビューで、カメラBの窓だけ不自然に白くなる場合を想定します。

1. 同じ照明条件のフレームを決め、BのWaveformとRGB Paradeを確認します。
2. Bの入力色域・GammaとInput CST、RCMのInput解釈を点検します。Log表示に戻っただけで改善と判断しません。
3. 共通Lookを一時的に外し、AとBの両方にどう影響したかを比較します。Bだけ改善するなら、Lookに入る前のBの状態も調べます。
4. Clipだけで原因が分からなければ、GroupとTimelineの共通処理を調べます。
5. 変更した有効状態とバイパス状態をすべて復元し、再度同じフレームと動く区間を比較します。

これは処理順を用いた**仮想の診断例**です。具体的なカメラやResolve 21.1実機で再現した結果ではありません。

## 調査の終了条件

診断前からOFFだったノードはOFFのまま、試験のために切ったノードは元へ戻します。Color／Fusionバイパスを解除したかを確認し、Clip／Group／Timelineそれぞれに意図しない変更がないか確認します。最後にViewerとScopesで同じフレームを見直します。

**Reset NodeやReset All Gradesは診断用のON／OFFと別です。** 値やノード構成を失い得るため、原因切り分けの代用として使いません。納品前は[Color QC](../recipes/pre-delivery-color-qc)で、バイパスを残したままの状態や補正漏れを再確認します。

## 出典・対象版・確認範囲

- **対象：DaVinci Resolve 21.1。** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（[公式サポート](https://www.blackmagicdesign.com/support)）。この環境ではPDF容量制限によりNode Editing Basicsの該当章を直接照合できず、21.1実機操作も未検証です。
- **直接確認した一次資料：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)』（2026年10月22日確認）。Node Editorの処理順、Scopes、Group／Shared Nodeの機能概要を確認。
- **操作の補助資料：** [DaVinci Resolve 21 Reference Manualの非公式HTML掲載版「Ch. 143 Node Editing Basics」](https://docs.imaster.org/davinci-resolve-21-manual/part-10-color/ch.-143-node-editing-basics)（2026年10月22日確認）。個別・複数・全ノードの切替、バイパスとリセットの違いを参照。**Blackmagic Design公式サイトではなく、21.1との一致は未検証**です。
- **verification: partial。** 21.1の具体的なUIとショートカット、レンダー反映、RCM処理境界、Free／Studio差は未確認。未検証の既定値や数値は提示しません。

関連：[ノードグラフ](../learn/color-node-graph)／[Group](../reference/group-grading)／[Scopes](../reference/scopes)。
