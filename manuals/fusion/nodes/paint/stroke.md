---
title: Stroke
description: Paint内部で使う、描いた後から形・位置・時間を編集できるブラシストローク。
doc_type: node
term_id: stroke
term_short: PaintのViewerで描き、線の形や表示期間を後から変えられるブラシストローク。
verification: partial
aliases: [Stroke]
concepts: [paint, image-data]
nodes: [Stroke]
node_family: paint
controls: [Brush Shape, Apply Mode, Stroke Animation, Write On, Make Editable]
inputs: []
outputs: []
tasks: [paint, cleanup, animate]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Stroke

Strokeは、**Paintノード内で描く、後から編集できるブラシの線**です。映像の傷や不要物を隠すほか、動く対象に合わせて位置を変えたり、線が描かれていくアニメーションを作ったりできます。

**Strokeは独立したFlowノードではありません。** Paintを選んだときViewer上部のツールバーから選択する描画方式の一つです。画像の入出力を担当するのは[Paintノード](./)で、Strokeはその内部に保持されます。

## 入力と出力

Stroke自体にFlow上の独立した端子はありません。Strokeを使うPaintノードには次の入出力があります。

- **Input（オレンジ）**：必須の2D画像。MediaInやBackgroundを接続し、この画像の解像度を描画キャンバスとして使います。
- **Effect Mask（青）**：任意のマスク。描画を適用する範囲を制限します。Cloneの参照画像を入れる端子ではありません。
- **Paintの出力**：Strokeで加工された2D画像。MergeやMediaOutなどへ接続できます。

Cloneで別画像を複製する場合は、PaintのInspectorの**Source Tool**へ参照ノードを指定します。透明なBackgroundだけを入力した場合、そのままでは複製元の画素がありません。

## 基本操作

~~~text
MediaIn → Paint → MediaOut
            └─ ViewerでStrokeを選び、映像に描画
~~~

1. PaintをFlowへ置き、画像をオレンジの入力へ接続します。
2. Paintを選択し、Viewer上部の描画ツールから**Stroke**を選びます。初期選択のMultistrokeとは別です。
3. Inspectorで**Brush Shape**（筆先の種類）、**Size**（大きさ）、必要なら**Softness**（縁の柔らかさ）を設定します。
4. **Apply Mode**を選びます。Colorは色を描き、Cloneは参照位置の画素を複製します。CloneではAlt / Optionを押しながら参照場所をクリックし、その後に補修したい場所をなぞります。
5. 描き終えたらPaintツールバーの**Select**へ切り替え、誤って新しい線を描かないようにします。

描いた線はPaintのInspectorの**Modifiers**タブに現れます。通常のStrokeは個別に選択し、描画設定や時間のアニメーションを変更できます。

## 線の形を編集する

Strokeは後から位置や回転を変更できますが、最初は経路上の制御点が隠れています。曲がり方まで修正したい場合は、そのStrokeを選び、Inspectorの**Stroke Controls > Make Editable**を押します。線がポリラインとして編集できる状態になり、Viewerで点を移動・追加・削除できます。

最初から点をクリックして輪郭を作りたい場合は[Polyline Stroke](./polyline-stroke)を選びます。Strokeはペンで自由に描く操作、Polyline Strokeは点を置いて経路を作る操作から始める、という違いです。

## 表示期間とアニメーション

通常のStrokeは、初期状態ではコンポジション全体に表示されます。途中の数フレームだけに現れる傷なら、**Keyframes Editorで表示区間を短く**できます。描画後に期間を変更できるのがMultistrokeとの重要な違いです。

**Stroke Animation**の主な設定は次のとおりです。

| 設定 | 結果 |
| --- | --- |
| All Frames | 全フレームに線を表示します。 |
| Limited Duration | 指定したDurationだけ線を表示します。 |
| Write On | 描いた順序とタイミングで線を出現させます。 |
| Write Off | 線の終端側から始端側へ向けて描画します。 |
| Write On Then Off | 出現した線を続けて消す動きを付けます。 |
| Trail | 始点と終点を時間差で動かし、短い線分を経路上で進ませます。 |

Write On / Write Offでは、描画経路の開始・終了を示す範囲コントロールも使います。タイミングはSpline Editorなどで調整できます。

対象が動く場合はStrokeの**Center**をTrackerへ接続し、線全体を追従させることもできます。ただし、追跡は素材の変形や隠れ方まで自動修正する処理ではありません。

## 運用例

### 衣服に付いたマーカーを隠す

MediaIn → Paint → MediaOutの構成でStrokeを選び、Apply ModeをCloneにします。マーカーに近い、模様が似た画素を複製して隠します。衣服が動く場合はStrokeのCenterを追跡データに接続します。補修が必要な区間だけ表示し、しわや照明が変わるフレームで複製跡を確認します。

### 手描きの矢印を表示する

背景映像とは別に、透明なBackground（Alpha 0）→ Paint → MergeのForegroundと接続します。Strokeで矢印を描き、Stroke AnimationをWrite Onにすると、線を徐々に表示できます。背景映像をMergeのBackgroundへ入れれば、実写の上に手描きの案内線を重ねられます。曲線の形はMake Editableで後から調整できます。

## 関連要素と注意点

- [Multistroke](./multistroke)：大量の細かな修正を軽く処理する方式。初期表示は1フレームで、個々の線は後編集できません。
- [Clone Multistroke](./clone-multistroke)：画素複製用のMultistroke。1フレーム内で多数の小さな不要物を隠す用途です。
- [Paint Group](./paint-group)：複数ストロークをまとめて移動・追従させます。
- [Paintの概要](./index.md)：Paint内の各描画ツールの違いを確認できます。

数百本の独立したStrokeを使うと処理が遅くなることがあります。補修後の細かな編集が不要ならMultistrokeを選びます。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 113「Paint Node」pp.2638–2645、Chapter 80「Paint」pp.1749–1750。Paintの入出力、StrokeとMultistrokeの違い、Make Editable、Stroke Animation、追跡と性能上の注意を確認しました。実機21.1の内部REGIDやInspectorの全初期値・範囲は未検証のため、verificationはpartialです。
