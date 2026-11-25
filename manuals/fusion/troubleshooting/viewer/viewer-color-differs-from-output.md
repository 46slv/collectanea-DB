---
title: FusionのViewerと最終出力で色が違う
description: Viewer LUTによる表示変換と、Nodeによる画像処理、Colorページ以降の色変換を切り分ける。
doc_type: diagnostic
verification: partial
aliases: [Viewer LUT, 表示LUT, プレビューの色が違う, viewer color mismatch]
concepts: [viewer, observation, color-management]
nodes: [MediaIn, MediaOut]
tasks: [debug, inspect-output]
symptoms: [viewer-color-mismatch]
prerequisites: [node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-25"
---

# FusionのViewerと最終出力で色が違う

## まず確認すること

Fusionで見た画像とEdit・Colorページや書き出した画像で、明るさや彩度が異なることがあります。Viewer LUT（表示用の色変換）を使っている場合、画面上の見え方とNodeが出力する画像データは一致するとは限りません。

- FusionのViewerでMediaOutを表示しているか、Node名とフレームを確認する。
- ResolveではMediaOutのInspectorにあるColor Grade（None／Color／Mix）の設定も確認する。Fusion内の出力を比較するときはNoneを基準にする。
- 2D ViewerでRGBを表示しているか確認する。
- Viewer LUTの有効状態と選択中の変換を記録する。
- Colorページのグレーディングやプロジェクトのカラーマネジメントの有無を確認する。

## 原因を切り分ける

DaVinci ResolveのFusionページで、色と明るさの差が分かる静止画を使い、検証用Compositionで次の構成を作ります。可能なら、グレーの階調と色の付いた領域を含む素材を選びます。

~~~text
MediaIn → MediaOut → Resolveの後段処理
             └→ Fusion Viewer（表示用LUT）
~~~

1. MediaOutをViewerへ表示し、同じフレームを固定する。
2. Viewer LUTの現在の種類と有効状態を控える。
3. Viewer上部のLUTボタンで表示変換だけを無効にし、見た目を確認する。
4. 同じLUTを有効に戻し、明るさや色が変わるか観察する。Nodeの設定や接続は変更しない。
5. Resolveでは同じフレームをEditまたはColorページでも確認する。後段の色補正や出力色空間が異なる場合は、その条件を記録する。

手順3と4で見え方が変わる場合、少なくとも表示用の変換が差の一因になっています。公式Manualの説明では、このViewer LUTの切替によって画像そのものに色補正が焼き込まれるわけではありません。

元からLUTが無効、または選択中のLUTが入力に対して実質的に変化を与えない場合、切替だけでは差が見えないこともあります。必要なら検証用Compositionで、入力の色空間に対応する表示変換を一つ選んで試します。

## 主な原因

| 観察結果 | 次に確認すること |
| --- | --- |
| 同じNodeでもLUTの切替で色が変わる | Viewer LUTとその変換設定 |
| 左右のViewerで色が異なる | 表示Node、フレーム、表示用変換 |
| MediaOutより前のNodeを表示している | 後段のNodeで行われる色変換や補正 |
| FusionとColorページだけで差がある | Colorページのグレーディング、カラーマネジメント |
| 書き出した画像でも差が残る | 出力色空間、書き出し設定、再生側の色管理 |

## 修正方法

Viewerだけの見え方が問題なら、入力画像の色空間に合う表示変換を選びます。比較するときは両Viewerの表示条件を揃えます。表示変換を無効にした画像が常に正しい見た目とは限りません。リニア画像を合成している場合などは、表示用の変換が必要なことがあります。

実際の出力に色変換が必要な場合は、Nodeで行う変換とResolveの出力変換の役割を確認します。Viewerの見た目を合わせる目的だけで、同じ変換をNodeへ追加すると、意図しない二重変換につながる可能性があります。

Colorページの補正やプロジェクト全体の色管理を変更する前に、どの段階で見え方が変わったのか特定します。診断後は記録したViewer設定に戻します。

## なぜ起きるか

ViewerはNodeの出力を観察するための画面です。表示用の色変換は、その画像をモニターで確認するための処理であり、Graph内の画像処理とは役割が異なります。詳しくは[中間結果をViewerで見る](../../learn/01-flow/intermediate-results-viewer)を参照してください。

Resolveでは通常、FusionページのViewerはColorページのグレーディング前の画像を表示します。MediaOutを見ていても、書き出しまでのすべての処理を確認しているとは限りません。[MediaOut](../../nodes/utility-io/media-out)をGraphの出力境界として捉え、表示変換と後段処理を別々に確認します。

## バージョン・例外・出典

Blackmagic Design公式 [Fusion 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/FusionManual.pdf)（2026年9月）、Chapter 2「Exploring the Fusion Interface」p.21のViewer LUTとColor controlsを2026年11月25日に索引化本文で確認しました。

確認した内容は、Viewer LUTの有効・無効の切替、表示用の色空間変換の選択、画像へ補正を恒久適用しないこと、およびResolveの通常の処理順です。

上記の手順はManualに基づく確認方法であり、実機で測定した結果ではありません。Resolve版21.1 Manualの該当ページ、PDFページ画像（取得失敗）、具体的なRCM・ACES設定での表示、OS・Edition差、書き出しファイルの画素値は未検証です。特定のLUTやプロジェクト設定をすべての素材に適用することは推奨しません。

## 関連する症状・確認方法

- [Viewerの画像が更新されない](./viewer-does-not-update)：色以前に表示が古い場合。
- [ViewerのA/B Bufferで処理前後を比較する](../../recipes/compositing/compare-before-after-with-viewer-wipe)：表示条件を揃えたうえで画像処理の前後を確認する場合。
- [症状ではなくGraphを診断する](../../learn/07-debugging/diagnose-graph-not-symptom)：問題が発生する処理段階を特定する考え方。
