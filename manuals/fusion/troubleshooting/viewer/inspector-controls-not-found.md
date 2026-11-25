---
title: Inspectorで目的の設定が見つからない
description: Viewerの表示対象、Nodeの選択、ToolsとModifiers、Node内のタブを区別して目的の設定を探す。
doc_type: diagnostic
verification: partial
aliases: [Inspectorに設定がない, Modifierが見つからない, wrong inspector, missing controls]
concepts: [node-graph, parameter-source, modifier]
nodes: [MediaIn, MediaOut, Transform, Polygon]
tasks: [debug, inspect-output]
symptoms: [inspector-controls-not-found, wrong-node-selected]
prerequisites: [node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-25"
---

# Inspectorで目的の設定が見つからない

完成映像は表示されているのに、移動や揺れの設定を編集できない場合、**観察しているNode、選択しているNode、Inspector内で開いている設定の種類**を別々に確認します。

## まず確認すること

1. Viewerの表示名を確認します。完成映像を観察したい場合は、その表示を保ちます。
2. Node Editorで、設定を変更したいNodeを単独で選択します。Inspectorの見出しが目的のNode名か確認します。
3. 通常のNode設定はTools、追加したModifierの設定はModifiersを調べます。
4. Tools内でも、Nodeごとに複数のタブがある場合は目的のタブを開きます。

この段階では接続、数値、Keyframe、Modifierを変更しません。

## 入力と最小確認構成

DaVinci Resolve 21.1のFusionページで、模様や文字など位置を判別しやすい素材を読み込んだ検証用Compositionを想定します。

~~~text
MediaIn1 ── Transform1 ── MediaOut1
                 ↑            ↑
             編集対象       Viewer
~~~

最終結果をMediaOut1で観察したまま、Transform1の設定を調べる例です。接続が成立していることを先に確認し、同じフレームで比較します。

## 原因を切り分ける

### 1. 表示対象と編集対象を分ける

MediaOut1をViewerへ表示します。その表示先を変更せずにNode EditorでTransform1を選択し、InspectorのToolsを開きます。

期待する状態は、ViewerではMediaOut1の結果を観察しながら、InspectorではTransform1の設定を調べられることです。次にMediaOut1を選択し、Inspectorの対象が切り替わることを確認します。両者を取り違えると、Transform1を探しているのにMediaOut1の設定を調べ続けることになります。

Viewerを左右に分ける場合は、入力側と最終結果など、比較したい地点をそれぞれ割り当てます。

### 2. ToolsとModifiersを分ける

通常のNode設定を探している場合はToolsを開きます。

すでにModifierが付いているNodeを調べる場合は、Nodeを選択してModifiersを開き、対象パラメータのModifierが表示されるかを確かめます。検証用CompositionにModifierがない場合、この確認は省略して構いません。表示を得ることだけを目的にModifierを追加する必要はありません。

揺れなどの設定を変更したい場合は、画像処理Node自体の設定と、そのパラメータの値を供給するModifierの設定を混同しないようにします。

### 3. Node内のタブを分ける

Toolsの中でも、設定のまとまりが複数のタブに分かれているNodeがあります。例えば公式ManualのPolygonの例にはControls、Image、Settingsが示されています。

目的の項目が見当たらなければ、Node名が合っていることを確かめてから、タブを一つずつ開きます。別のNodeと同じタブ構成だと決めつけないでください。

## 主な原因と期待される結果

| 症状 | 確認箇所 | 期待される状態 |
| --- | --- | --- |
| 最終映像が表示されるがTransformの設定がない | Node EditorでTransform1を選択 | Viewerを観察しながらTransform1の設定を確認できる |
| 通常の設定が見つからない | InspectorのTools | 選択したNodeの設定を探せる |
| 追加したModifierの設定が見つからない | 対象NodeのModifiers | 既存Modifierの設定を確認できる |
| Node名は正しいが項目がない | Node内のタブ | 目的の設定群を開ける場合がある |

この表は公式Manualの画面構造から組み立てた診断例で、今回の実機測定結果ではありません。

## 修正方法

対象の選択やタブが違う場合は、該当する選択・表示だけを修正します。見つからない項目が実際にそのNodeに存在するか不明な場合は、Node Referenceや対象バージョンのManualで仕様を確かめます。

目的の設定を発見した後に効果まで確かめる場合は、検証用Compositionの固定値のパラメータを一つだけ変更して同じフレームの結果を比較し、元の値へ戻します。KeyframeやExpressionで制御されている値は、直接変更する前に供給元を調べます。

## なぜ起きるか

Viewerは処理結果を観察する場所、Inspectorは選択したNodeや追加したModifierの設定を操作する場所です。さらにTools内のタブは、操作する設定群を絞り込む役割を持ちます。

これらを独立に確認すれば、項目が存在しないのか、単に現在の表示対象・選択対象・タブが異なるのかを切り分けられます。

## 注意点

- 複数Nodeを同時選択するとInspectorに複数の設定が表示される場合があるため、診断中は単独選択を基準にします。
- Modifierを削除したりNodeを置き直したりする前に、選択とタブを確認します。既存のアニメーションを壊さないためです。
- 正しい項目を開けても値が期待どおり変化しない場合は、パラメータの供給元を調べる別の診断へ移ります。

## バージョン・出典・未検証範囲

一次資料：[Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf?_v=1788850811000)、Chapter 1「Introduction to DaVinci Resolve」。

- p.35：Viewers、各Viewerの表示対象の割り当て。
- p.36：Node Editorの役割。
- p.37：Inspector、ToolsとModifiers、およびNode内の複数タブ。

上記ページの公式PDF本文を照合しました。PDFページ画像はファイルサイズ制限により取得できていません。最小構成と診断順序は本記事の作業案であり、今回のResolve実機での操作、表示遷移、Modifierごとの表示、OS・Edition差は未検証です。

## 関連する症状・理解

- [Viewerに何も表示されない](./nothing-visible)
- [中間結果をViewerで見る](../../learn/01-flow/intermediate-results-viewer)
- [Modifier / パラメータの供給元](../../learn/05-time/modifier-parameter-sources)
- [KeyframeとExpressionが競合している](../animation-automation/keyframe-expression-conflict)
- [Graphとして考える](../../learn/01-flow/graph-as-flow)
