---
title: "Immersive Patcher"
description: "360°・イマーシブ映像の一部分を平面画像へ展開して修正し、元の球面映像へ戻すFusion Node。2段構成、入出力、Mode、Rotation、Angle of Viewを21.1基準で解説。"
doc_type: node
term_id: "immersive-patcher"
term_short: "Immersive Patcherは、360°映像の一部を編集しやすい平面画像に変換し、修正後に元の球面映像へ戻すNode。"
verification: partial
aliases: ["Immersive Patcher", "ImP"]
concepts: ["image-data"]
nodes: ["Immersive Patcher"]
node_family: "immersive"
controls: ["Mode", "Rotation", "Angle of View"]
inputs: ["image", "metadata"]
outputs: ["image"]
tasks: ["process-immersive"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-10"
---

# Immersive Patcher

Immersive Patcherは、**360°・イマーシブ映像の一部分を、通常の平面映像のように編集できる形へ一時的に変換し、修正後に元の映像へ戻す**Nodeです。球面映像に映り込んだ機材を消したい、特定の場所へグラフィックを合成したい、といった作業に使います。

360°映像で一般的なLatLong（正距円筒図法）は、地球儀を世界地図に展開するように、周囲の方向を横長の画像へ配置します。画面の場所によって引き伸ばされ方が異なるため、通常の2D PaintやTransformだけで修正すると、元の360°表示へ戻したときに形が合わないことがあります。

Immersive Patcherを使うと、**作業したい方向を正面から見た平面に取り出して修正**できます。最後に逆変換して元の360°素材へ重ねるのが基本です。3D空間へカメラを置くNodeではなく、入出力はどちらも2D画像です。

## まず理解すること：なぜ2つ使うのか

球面映像の一部分を修正する場合、編集しやすい平面に変換する処理と、元の球面映像へ戻す処理が必要です。

- **Undistort**：360°素材の指定方向を、通常の平面画像として取り出す。ここでトラッキング、ペイント、マスク、合成などを行う。
- **Distort**：平面上で行った修正を、元の球面映像に対応する位置・形へ戻す。

これらは**2つのImmersive Patcher**で行います。最初のNodeの設定を複製して2つ目を作り、Modeだけを反対にする構成が基本です。21.1 Manualも、この2段の**RotationとAngle of Viewを一致させること**を重要な条件として挙げています。片方だけ値を変えると、戻した修正の位置や形が合わなくなります。

「平面にする」といっても、360°素材全体を歪みのない1枚の平面へ変換するわけではありません。修正したい**局所的な範囲**を取り出して、その部分を作業しやすくする処理です。

## 入力と出力

21.1 Reference ManualのImmersive Patcher節には、Node Editor上の**2入力**が明記されています。

| 端子 | 受け取るもの | 何に使うか |
| --- | --- | --- |
| **Input**（オレンジ） | イマーシブ映像、または通常の2D画像 | Undistort側では元のイマーシブ素材、Distort側では平面上で加工した画像を渡す |
| **Metadata** | 別Nodeからのメタデータ | 他Nodeが持つメタデータを入力する。Manualのこの節では対応するフィールドや必須条件は規定されていない |
| **出力** | 2D Image | Modeに応じて、平面化した画像または元のイマーシブ配置へ戻した画像を出力する |

ここでいうメタデータは**映像そのものとは別の付随情報**です。Metadata端子を通常のEffect Maskや、別画像を重ねるためのForeground端子と取り違えないでください。公式記述は「別Nodeからのメタデータを受け取る」までで、値の一覧・自動継承条件は確認できていません。

本Nodeは3D SceneやParticle Setを出すものではありません。平面化の前後ともデータ領域は[2D Image](../../learn/02-data/image.md)で、後段に通常の画像処理Nodeを接続できます。

## Inspector：主要な設定

### Mode：どちら向きに変換するか

| Mode | 動作 | 使用する段階 |
| --- | --- | --- |
| **Undistort** | イマーシブ映像の対象部分を通常の平面画像として扱える形へ変換する | 修正作業の前 |
| **Distort** | 修正した平面画像をイマーシブ映像へ戻す | 修正作業の後 |

通常は、前段がUndistort、後段がDistortです。順序を逆にしたり、両方を同じModeにしたりすると、取り出した場所へ修正を戻すという目的に合いません。

### Rotation：作業したい場所を正面へ向ける

**Rotation**は、イマーシブ映像を回して**どの方向を平面画像の中心として扱うか**を決めます。

たとえば、360°映像の背後側に撮影用の機材が写り込んでいる場合、Rotationを調整して機材のある方向を修正しやすい位置に移します。これにより、正距円筒画像の端をまたぐ場所や、極に近い部分をそのまま2D Paintで扱うより、対象物の形を把握しやすくなります。

Rotationは、最初と2つ目のPatcherで**同じ値**にします。どちらか一方だけを後から回しても、補正先の位置は追従しません。

### Angle of View：平面として取り出す視野を決める

**Angle of View**は、その変換で扱う視野の広さを調整します。公式Manualでは、VRヘッドセットに表示する視野角を調整するControlとして説明されています。

小さな対象の修正と、広い範囲にまたがる合成では、確認したい範囲が異なります。Rotationで中心方向を決めたうえで、Angle of Viewを調整し、対象と作業に必要な周辺がViewerへ収まっているか確認します。

**2つのPatcherでAngle of Viewも一致させます。** これは単なるViewerの表示倍率ではなく、平面から球面へ戻す対応関係に関わる設定です。Manualの当該節にはデフォルト値や許容範囲の数値はないため、ここでは断定しません。

## 実際の接続例：360°映像から機材を消す

360°映像の一部に写った撮影機材を消すケースを想定します。平面へ変換した後、MultiPolyなどで対象領域を指定して修正し、元の360°映像に戻します。

~~~text
360°素材 ──────────┬──────────────────────────────┐
                   │                              │
          Immersive Patcher ①                     │
             Mode: Undistort                      │
             Rotation / Angle of View             │
                   │                              │
             平面化した画像                        │
                   │                              │
             マスク・ペイント・合成                 │
                   │                              │
          Immersive Patcher ②                     │
             Mode: Distort                        │
             ①と同じRotation / Angle of View     │
                   │ 修正部分（前景）               │ 元の素材（背景）
                   └──────────→ Merge ←──────────┘
                                   │
                                360°出力
~~~

この図の「マスク・ペイント・合成」は**修正部分が分かるように画像を作る工程**をまとめたものです。使うNodeは作業内容によって異なり、すべてを必ず追加するという意味ではありません。

1. MediaInやLoaderで元のイマーシブ素材を読み込み、一方を後段のMerge用に分岐します。
2. もう一方をImmersive Patcher ①の**Input**へつなぎ、**Mode: Undistort**にします。
3. **Rotation**で機材のある方向を正面へ向け、**Angle of View**で修正する範囲を調整します。
4. Viewerで平面化された映像を見ながら、マスク、ペイント、Transform、合成などを使って目的の修正を行います。
5. Patcher ①をコピーしてPatcher ②を作り、後段へ接続します。**RotationとAngle of Viewは変えず、ModeだけをDistort**に切り替えます。
6. 再変換した修正を、Mergeで元のイマーシブ素材の上に重ねます。修正範囲外まで二重合成しないよう、必要なマスクやAlphaを確認します。
7. 最後に360°表示へ切り替え、修正位置、継ぎ目、動きに破綻がないか確認します。

ManualのBasic Node Setupには、平面化→Rotation／Angle of View調整→通常の画像処理→再変換→元素材へMergeする流れが示されています。また、図の例にはMultiPolyとTransformを使った修正があります。上の接続はその考え方を読みやすく描き直したもので、**Resolve 21.1実機での動作検証結果ではありません**。

## 使う場面と失敗しやすい点

### 向いている作業

- **360°撮影で映り込んだ機材の除去**：周囲の一部だけを取り出し、Paintやマスクで修正する。
- **イマーシブ映像への看板・ラベルの合成**：平面側で位置合わせと合成を行い、球面へ戻す。
- **局所的なトラッキング**：極端な引き伸ばしや継ぎ目のある位置を、平面化して追跡しやすくする。

いずれも、元画像の**一部分だけを処理する**のが中心です。360°映像全体の向きを安定させたい場合は[Spherical Stabilizer](./spherical-stabilizer.md)、球面画像の投影方式を変えたい場合は[PanoMap](./panomap.md)の役割を先に確認します。

### 修正が元の場所へ戻らない

まず、2つのPatcherの**RotationとAngle of Viewが同じか**を比較します。Manualが明示する一致条件です。設定値を目視で再入力するより、最初のNodeをコピーし、Modeだけを変える方が取り違えを減らせます。

### 平面側では正しく見えるのに、360°表示では不自然

平面化したViewerの見え方だけで完成を判断しないでください。局所的な修正でも、球面へ戻すと対象の大きさや周辺の継ぎ目が違って見えることがあります。**後段のDistortを通した映像と、360°表示での最終結果**を確認します。

### 直した場所の外側まで変化する

Distort後の画像を元素材に重ねる構成では、**どの領域を合成するか**も重要です。作業領域外の画素を不用意に上書きしないよう、マスクやAlphaを確認してください。これは一般的な合成上の注意であり、Immersive Patcherが修正領域だけを自動的に透明化するという仕様を意味しません。

### メタデータを接続しないと動かない？

Manualでは**InputとMetadataの2端子**を説明していますが、Metadataに何を渡すべきかや、必須かどうかまではこの節で規定していません。未接続時の動作、メタデータの内容、処理への影響は実機確認が必要です。Metadataに画像やマスクを入れて動作を推測するのは避けます。

## 関連Nodeとの使い分け

| Node | 何をしたいときに使うか |
| --- | --- |
| **Immersive Patcher** | イマーシブ映像の一部分を平面化して修正し、元の球面映像へ戻す |
| **[LatLong Patcher](./latlong-patcher.md)** | LatLong形式の360°画像の特定領域をExtract／Applyして修正する |
| **[PanoMap](./panomap.md)** | LatLong、Cubeなどの球面画像形式を変換したり、球面画像を回転したりする |
| **[Spherical Stabilizer](./spherical-stabilizer.md)** | 撮影済み360°映像の回転方向の揺れを追跡して安定化する |
| **[Spherical Camera](./spherical-camera.md)** | 3Dシーンを全方向から撮影し、Renderer 3Dで球面画像として出力する |

LatLong Patcherも平面化と再適用を行いますが、Manualでは**LatLong（正距円筒）画像用**と明示されています。Immersive Patcherの方はイマーシブ映像を平面化して戻す説明になっており、両者の入力形式、端子、再適用方法を混同しないでください。Node群の入口は[Immersive / 360° Family](./index.md)を参照してください。

## バージョン・出典・未確認範囲

**一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月8日公開）、Chapter 122「VR Nodes」、Immersive Patcher [ImP]（pp.2949–2950）。** 2入力（Input／Metadata）、ModeのUndistort／Distort、Rotation、Angle of View、2つのPatcherを同一設定にする条件、最後にMergeで元素材と合成する手順を確認しました。球面画像の基本概念は同章p.2948を参照しています。公式資料の入口は[Blackmagic Design Support](https://www.blackmagicdesign.com/support)です。

**verification: partial**：本文は21.1のManualに基づきますが、実機でのREGID、端子内部ID、Metadataの具体的な内容と未接続時の挙動、Inspectorの初期値・数値範囲、VR180／Apple Immersiveの入力互換性、画質・処理負荷は未確認です。また、Manualのこの個別節はImmersive Patcher単体のFree／Studio対応を明記していません。VRカテゴリの他NodeにStudio限定の注記があることだけから、本Nodeのedition差を断定していません。
