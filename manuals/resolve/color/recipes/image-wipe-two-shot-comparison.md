---
title: Image Wipeで2ショットの明るさと色を比較する
description: Galleryの基準Stillと現在のショット、またはTimeline上の2ショットをWipeで見比べ、色合わせの差を判断する手順。
doc_type: recipe
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Gallery, Grab Still, Image Wipe, Reference Wipe Mode, Wipe Timeline Clip, Primaries, Scopes]
tasks: [compare-shots, shot-matching, grade, troubleshoot]
level: intermediate
updated: "2026-10-24"
---

# Image Wipeで2ショットの明るさと色を比較する

同じ人物の前後ショットを交互に見ても、肌の明るさや背景の色の違いは判断しにくいことがあります。Colorページの**Image Wipe**は、現在のフレームと比較用の画像をViewer内で分けて表示する機能です。境界を動かしながら、同じ被写体のどこが違うのかを確かめられます。

このレシピでは**基準ショットをGalleryのStillに保存し、調整対象と比較する**方法を中心に扱います。Stillを作らずにTimeline上の別ショットと比較する方法も紹介します。Wipeは比較表示であり、表示を切り替えるだけでグレードがコピーされるわけではありません。

## 用意する素材と完成条件

例として、同じ部屋の会話をA（正面）→B（斜め）で編集している状況を想定します。Aは顔と白いシャツの明るさが自然で、Bは顔が少し暗く、壁が青く見えます。照明と被写体が極端に変わらないフレームを両方から選びます。AとBの構図は一致していなくても構いません。

比較の前に[カラーマネージメント](../learn/color-management-basics)を確認します。入力色空間やGamma、技術LUT、RCM／CSTの適用位置が異なるままでは、色合わせより先に変換の違いを見ている可能性があります。比較時の出力変換と表示モニターも共通にします。

完成条件は、AとBの肌と共通の無彩色部分に不要な明暗・色かぶりの跳びがなく、背景の照明差や陰影は演出として残り、**Wipeを閉じてA→Bを通常再生しても違和感が小さい**ことです。全画素のRGB値を一致させる必要はありません。

## 手順1：GalleryのStillを基準にする

1. Colorページで基準にしたいAのクリップを選び、顔と白いシャツが見えるフレームへ移動します。[Scopes](../reference/scopes)のWaveformとRGB Parade、Viewerで基準の明暗と色を確認します。
2. Viewerの右クリックメニューから**Grab Still**を使い、AのフレームをGalleryに保存します。複数のStillがある場合は、今回の基準がどれか分かるように整理します。
3. 調整するBのクリップを選び、Aに近い照明のタイミングと顔の向きが見えるフレームへ移動します。Bを選んだ状態が、これから補正を受ける対象です。
4. GalleryでAのStillを選び、Viewer上部の**Image Wipe**を有効にします。21.1 Manualには、Stillをダブルクリックして表示する方法も記載されています。表示中の参照画像がAであることを確認します。
5. Viewer上でポインターをドラッグしてWipeの境界を動かします。まず左右に分ける**Horizontal**、上下に分ける**Vertical**を比べ、顔、シャツ、壁など共通の物体がそれぞれどう見えるか確認します。Manualには**Mix／Alpha／Box／Difference**の表示方式も記載されています。比較目的に合う方式を選びますが、ここでは各方式の21.1実機上の細部動作を保証しません。
6. [Primaries](../reference/primaries-color-wheels)でBの明るさと色の偏りを少しずつ補正し、そのたびにWipeで基準と比較します。Bの顔を明るくして壁まで白っぽくなる場合は、顔だけでなく背景への影響を確認します。Scopesも併用し、Viewer内の位置や面積の違いを数値差と混同しません。
7. Image Wipeを終了して通常表示へ戻し、A→Bの順で再生します。静止画を並べたときの一致と、カットを切り替えたときの自然さは別の確認です。

ここでの比較は**保存済みStillの画像と現在のBの画像**です。Galleryから**Apply Grade**を実行する操作とは異なります。グレードを実際にコピーしたい場合は[Gallery／Stills](../reference/gallery-stills)の適用手順を参照してください。

## 手順2：Stillを作らずTimelineの2ショットを比べる

繰り返し登場する同じ場所のショットなど、別のTimelineクリップをそのまま参照したい場合は**Timeline Wipe**を使えます。21.1 Reference Manual Chapter 141は、現在選択中ではないクリップのサムネイルを右クリックして**Wipe Timeline Clip**を選ぶ操作を説明しています。

1. 比較・補正したいBを現在のクリップとして選びます。
2. ColorページのTimelineで、参照したいAのサムネイルを右クリックして**Wipe Timeline Clip**を選びます。B自身のサムネイルを右クリックしてもこの項目は表示されないとManualは説明しています。
3. ViewerでAとBの比較になっていることを確認し、境界を動かしながら共通の被写体を比べます。基準側のフレーム位置と現在のBのフレーム位置が異なることを意識します。
4. 連続する複数クリップを同じ時間的な間隔で比較したい場合は、Viewerのオプションにある**Gang Timeline Wipe With Current Clip**が候補です。Manualは、これを有効にすると現在のクリップ選択を移動したときに参照側との時間オフセットを維持すると説明しています。まず単一の2ショットで比較を終え、必要になった段階で試します。
5. 比較を終えたら通常表示へ戻し、A→Bのカットを再生して確認します。

Viewerの**Reference Wipe Mode**にはGallery／Timeline／Offlineがあります。ここで使ったGalleryとTimelineでは**参照画像の出所が異なる**だけで、どちらもWipe自体が色補正を自動実行する機能ではありません。

## 比較中に見る順序

| 見るもの | 比較の仕方 | 判断 |
| --- | --- | --- |
| 顔の明るさ | AとBの同じ人物の中間調を見る | 不必要な露出の跳びを減らす |
| 白い衣装・無彩色部分 | 肌とは別に色の偏りを見る | 背景照明をすべて無彩色へ戻さない |
| 窓・照明 | 明部の階調と色を見る | 白飛びや不自然なハイライトの変化を探す |
| 暗部・背景 | 黒の深さと見せたい細部を見る | 影を一律に持ち上げない |
| カットのつながり | Wipeを閉じて通常再生する | 静止比較で気づけない跳びを探す |

**Difference**などの比較表示でも、構図・被写体の位置・動きが異なれば画像差が出ます。差が見えることだけで色補正の失敗とは判断できません。同じフレーム位置の厳密な画素比較が必要なら、素材の時間位置・フレーミング・表示変換を先にそろえる必要があります。より多数のショットを並べる場合は[Split Screen](../reference/split-screen-comparison)、編集全体を見る場合は[納品前Color QC](./pre-delivery-color-qc)に進みます。

## うまく比較できないとき

| 症状 | 先に確認すること |
| --- | --- |
| 期待したStillが出ない | Galleryで選んだStill、ViewerのReference Wipe ModeがGalleryになっているか |
| 別のショットと比較される | 現在選択中のクリップ、Timeline Wipeの参照クリップ、Reference Wipe Mode |
| **Wipe Timeline Clip**が見つからない | 現在のクリップ自身ではなく、別クリップのサムネイルを右クリックしているか |
| 2画像の差が大きすぎて判断できない | 入力変換／出力変換、参照したフレーム、顔の向きと照明条件 |
| Difference表示で輪郭が目立つ | 2画像の位置や時間がずれていないか。輪郭差を色差と混同しない |
| Wipeでは自然でもカット時に浮く | 通常再生のテンポ、前後のフレーム、照明の時間変化 |
| 外部表示とViewerの色が違う | [外部モニタリング](../reference/external-monitoring)の表示経路と変換 |

## 出典・対象版・未検証範囲

- **直接確認した一次資料：** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月8日公開）、**Chapter 141「Using the Gallery」pp.3336–3337**。2026年10月24日に公式PDFの該当ページから本文を抽出し、StillのImage Wipe表示、境界ドラッグ、Gallery／Timeline／OfflineのReference Wipe Mode、Wipe方式、Wipe Timeline Clip、Gang Timeline Wipeを確認しました。
- **公式機能説明：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/products/davinciresolve/color)』（2026年10月24日確認）。「Save, Copy and Re-use Grades」「Compare Shots」等を参照しました。
- **verification: partial。** 上記の操作名と役割は21.1 Manualで照合済みですが、21.1実機の操作結果、OS別ショートカット、ボタン表示位置の全レイアウト、Free／Studio差、各Wipe方式の詳細な描画挙動、色管理方式ごとの表示同一性、実素材での最終グレードは未検証です。AとBの例および完成判定は実制作のために組み立てた仮想ケースです。

関連：[Gallery／Stills](../reference/gallery-stills)／[3カメラのショットマッチング](./matching-multicamera-interview)／[グレードの複数案を比較する](../reference/versions-and-grade-comparison)。
