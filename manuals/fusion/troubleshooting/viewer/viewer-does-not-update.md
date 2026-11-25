---
title: Viewerの画像が更新されない
description: Inspectorの値を変えてもViewerの画像が止まったままのとき、表示のロック、Selective Updates、表示対象を切り分ける。
doc_type: diagnostic
verification: partial
aliases: [Viewerが止まる, プレビューが更新されない, stale viewer, Locking the Viewer, Selective Updates]
concepts: [viewer, observation, evaluation-flow]
nodes: [MediaIn, Transform, MediaOut]
tasks: [debug, inspect-output]
symptoms: [stale-viewer, no-update]
prerequisites: [node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-25"
---

# Viewerの画像が更新されない

Inspectorの値を変更しても、Viewerに以前の画像が残る場合があります。画像が変わらないことだけでは、Nodeの処理が止まっているとは判断できません。まず、Viewerの表示だけが止まっているのか、画像の計算が止まっているのか、変更したNodeの結果を見ていないのかを分けます。

## まず確認すること

- Viewerに表示されているNode名を確認する。変更したNode自身か、その後段を表示しているか。
- Viewerをロックしていないか確認する。
- Selective UpdatesがNone（No Update）になっていないか確認する。
- 再生を止め、同じフレームでInspectorの値を一つだけ変更する。

画像が最初から表示されていない場合は、[Viewerに何も表示されない](./nothing-visible)の診断を先に行います。

## 原因を切り分ける

次の小さなFlowを、元の作業を壊さない検証用Compositionに用意します。

~~~text
MediaIn1 → Transform1 → MediaOut1
                 ↑
           左右のViewer
~~~

中央から離れた位置に、文字や目印のある静止画をMediaIn1へ入力します。Transform1はアニメーションを設定していない状態にします。

1. Selective UpdatesをSomeにし、両方のViewerをロックしていない状態にする。
2. Transform1を左右のViewerへ表示する。Nodeの下にある表示先のボタンを確認し、必要な側に割り当てる。すでに表示している側を再度切り替えて解除しないようにする。
3. 同じフレームでTransform1のCenterのXを0.5から0.65へ変更する。両方で目印が移動することを確認する。
4. Centerを元の値に戻す。片方のViewerだけをロックし、同じ変更を繰り返す。もう片方はロックしない。
5. ロックを解除した後、両方のViewerで現在のTransform1の結果を比較する。

手順3が成立しない場合は、まず表示先と更新設定を調べます。手順4では、ロックした側が以前の画像を保持し、ロックしていない側が更新されることが公式Manualの説明から期待されます。実際に観察した結果と区別して扱ってください。

## 主な原因

### Viewerのロック

Viewerのロックは、Viewerへ新しい画像を表示する更新を止めます。公式Manualでは、表示対象のNodeは処理を続け、新しい画像は表示待ちになると説明されています。

Viewerに古い画像が残っていても、Inspectorの設定変更が無効になったとは限りません。

### Selective UpdatesがNone

Selective Updatesは、どのNodeを更新するかに関わる設定です。

| 設定 | 公式Manualで説明されている動作 |
| --- | --- |
| All（Update All） | 現在のNodeツリーの全Nodeを描画する |
| Some（Selective） | 現在表示する画像に必要なNodeを描画する。既定の設定 |
| None（No Update） | 描画を停止する |

Noneは重いCompositionで多数の変更を行う際などに使えますが、変更結果を確認するときには更新を再開する必要があります。Viewerをロックする機能とは区別します。

### 表示対象が異なる

Transform1の値を変更しているのにMediaIn1を見ている場合、移動後の画像は表示されません。また、ViewerのFollow Activeが有効だと、Nodeの選択を変えた際にViewerの表示対象も変わります。

この場合は表示されているNode名を調べることが先であり、Nodeの設定を初期化する必要はありません。

## 修正方法

Viewerのロックが原因なら、該当するViewerのロックだけを解除します。21.1のManualにはLocking the Viewerの項目とCommand-Lの表記があります。Windowsでの対応キーや表示位置は今回未確認です。

Selective UpdatesがNoneの場合は、通常の確認ではSomeへ戻します。ResolveのFusionページでは、Fusion > Fusion Settings > GeneralのProxyセクションにSelective Updatesの設定があります。

表示先が原因なら、Transform1またはMediaOut1を明示的に割り当てます。表示先を固定したい場合はFollow Activeの状態も確認します。

変更後は同じフレームでCenterを再度動かし、目印が新しい位置に移動することを確認します。検証用の変更値と設定は作業終了時に戻します。

## なぜ起きるか

Nodeの評価、Viewerへの画像の割り当て、Viewer上の表示更新は、それぞれ確認する対象が異なります。

- ロック中のViewerでは、新しい画像の表示が止まる。
- Selective UpdatesのNoneでは、描画そのものが止まる。
- 前段のNodeを表示している場合、後段の処理結果はそのViewerには現れない。

この違いを意識すると、画像が更新されないという同じ症状に対して、無関係なパラメータやキャッシュを変更せずに原因を絞れます。詳しくは[中間結果をViewerで見る](../../learn/01-flow/intermediate-results-viewer)と[Graphが評価される依存関係](../../learn/01-flow/evaluation-dependency)を参照してください。

## バージョン・出典・確認範囲

- Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月）
  - Chapter 63、p.1291：ViewerへのNodeの割り当て。
  - Chapter 63、p.1298：Selective Updatesと3つの更新設定。
  - Chapter 68、p.1491：ViewerのロックとFollow Active。

2026年11月25日に公式PDFの索引化本文を照合しました。PDFのページ画像は取得できていません。上記Flowは仕様に基づく検証手順であり、Resolve 21.1実機での表示更新、ロック操作、解除後の表示タイミング、OS・Edition差は未検証です。

## 関連する症状

- [Flowが重い / 遅い](../performance/graph-is-slow)：更新はされるが、結果が出るまでに時間がかかる場合。
- [Keyframeを置いたのにアニメーションしない](../animation-automation/animation-does-not-move)：フレームを移動してもパラメータや画像が変化しない場合。
