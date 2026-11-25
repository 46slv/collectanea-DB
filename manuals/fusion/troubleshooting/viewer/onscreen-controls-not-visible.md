---
title: Viewerに操作ハンドルが表示されない
description: 画像は表示されるのに操作ハンドルやMaskの輪郭が見えないとき、Nodeの選択とViewerのShow Controlsを切り分ける。
doc_type: diagnostic
verification: partial
aliases: [操作ハンドルが消えた, マスクの線が見えない, onscreen controls, Show Controls]
concepts: [viewer, observation, node-graph]
nodes: [MediaIn, Transform, MediaOut, Polygon Mask]
tasks: [debug, inspect-output]
symptoms: [onscreen-controls-not-visible, wrong-node-selected]
prerequisites: [node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-25"
---

# Viewerに操作ハンドルが表示されない

画像は正常に表示されるのに、移動用のハンドルやMaskの輪郭が見えない場合、画像の出力と編集用の表示を分けて調べます。FusionのViewerは、表示しているNodeとは別に、選択中のNodeの操作ハンドル（Onscreen Controls）を重ねて表示できます。

## まず確認すること

1. Node Editorで、操作したいNodeだけを選択します。Viewerに出しているNodeを選び直す必要はありません。
2. 操作したいViewerのOptionメニューを開き、Show Controlsを有効にします。Viewer上で右クリックしてOptions → Show Controlsを選ぶ方法もあります。
3. 複数のNodeを選択していた場合は、目的のNodeだけに絞ります。
4. Polygonなど、Node単位で操作ハンドルの表示を無効にできる種類では、そのNode側の設定も調べます。

画像自体が表示されない場合は、先に[Viewerに何も表示されない](./nothing-visible)の診断を行います。ここでは画像が見えていることを前提にします。

## 入力と最小確認構成

DaVinci Resolve 21.1のFusionページで、中央から少し離れた場所に文字や目印がある静止画を読み込んだ検証用Compositionを使います。TransformはアニメーションやModifierを設定していない状態とします。

~~~text
MediaIn1 ── Transform1 ── MediaOut1
                 ↑            ↑
             編集対象       Viewer
~~~

MediaOut1をViewerに表示して、同じフレームで確認します。画像の表示先を固定すると、操作ハンドルの表示だけを比較できます。

## 原因を切り分ける

### 1. Nodeの選択を確かめる

ViewerにMediaOut1を表示したまま、Node EditorでTransform1を選びます。InspectorのNode名も確認します。Show Controlsが有効なら、Transformの操作ハンドルが表示されることが期待されます。

MediaOut1の表示を保ったまま、Node Editorの選択をMediaOut1へ変えて比較します。Transformのハンドルが見えなくなることは、TransformがGraphから消えたり無効になったりしたことを意味しません。

### 2. Viewerの表示設定を確かめる

Transform1だけを選択し直して、対象ViewerのShow Controlsを無効、有効の順に切り替えます。接続、パラメータ、フレームは変えません。

期待する結果は、同じ出力画像の上で操作ハンドルだけが消えたり現れたりすることです。Viewerの表示設定が原因なら、Transformの数値をリセットする必要はありません。

左右にViewerを開いている場合は、実際に操作したい側のメニューを確認します。片方でハンドルが見えることだけでは、もう片方の設定を確かめたことにはなりません。

### 3. Node固有の表示設定を確かめる

Show Controlsが有効で、対象Nodeだけを選択しても見えない場合は、そのNodeがViewerで操作できる項目を持つか確認します。

公式ManualではPolygonなど一部のNodeについて、Node単位で操作ハンドルの表示を無効にできると説明されています。すでにMaskを使っているCompositionであれば、そのMaskの表示設定を調べます。この確認のために新しいMaskを追加する必要はありません。

## 主な原因と期待される結果

| 症状 | 確認箇所 | 期待される状態 |
| --- | --- | --- |
| 画像は見えるが移動用ハンドルがない | Transformの単独選択 | 編集対象のハンドルが見える |
| 選択を変えてもハンドルが見えない | 対象ViewerのShow Controls | 編集用の表示が有効になる |
| 複数の輪郭やハンドルが重なる | Nodeの複数選択 | 対象を絞ると操作しやすくなる |
| Polygonだけ輪郭が見えない | Node固有の表示設定 | 無効化されていれば表示を戻せる |

この表は公式Manualから組み立てた診断案であり、今回の実機観測結果ではありません。

## 修正方法

原因が選択や表示設定にあれば、そこだけを修正します。ハンドルの表示を戻しても結果が変わらない場合は、検証用CompositionでInspectorのCenterを少し変更し、目印の位置が変わるか同じフレームで確認してから元の値へ戻します。

Inspectorで数値を変えると画像が移動するのにViewerのハンドルが出ないなら、少なくともその確認条件では画像の変形処理とハンドル表示を別の問題として扱えます。Inspector自体に目的の項目がない場合は、[Inspectorで目的の設定が見つからない](./inspector-controls-not-found)へ進みます。

## なぜ起きるか

Fusionでは、Viewerに割り当てたNodeは観察する処理結果を決め、Node Editorの選択は操作する対象を決めます。さらにShow Controlsは、編集用の表示を重ねるかどうかを決めます。

例えば最終合成を見ながら途中のMaskを調整できるのは、この役割が分かれているためです。操作ハンドルやMaskの輪郭が消えたことだけを根拠に、画像データが失われたと判断しないでください。

## 注意点

- Show Controlsを切り替えるときは画像の出力と編集用表示を混同しないようにします。
- 診断のためにMaskを削除したり、Transformの値を初期化したりする必要はありません。
- Maskの輪郭が見えない症状と、Maskによる効果の制限が機能しない症状は別です。後者ではMaskの出力や接続も確認します。

## バージョン・出典・未検証範囲

一次資料：[Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf?_v=1788850811000)。

- Chapter 63、p.1292：ViewerのOptionメニューとShow Controls。
- Chapter 68、pp.1460–1461：Onscreen Controls、選択と表示対象の関係、表示切り替え、Node単位の表示制御。

公式PDFの索引化された本文を照合しました。PDFページ画像は取得できていません。操作手順は確認済みの仕様をもとにした検証案であり、今回のResolve実機での表示、ハンドル操作、左右Viewer間の設定差、Node固有の設定名、OS・Edition差は未検証です。

## 関連する症状・理解

- [中間結果をViewerで見る](../../learn/01-flow/intermediate-results-viewer)
- [Graphとして考える](../../learn/01-flow/graph-as-flow)
- [Maskを接続しても結果が変わらない](../masking/mask-does-not-change-result)
