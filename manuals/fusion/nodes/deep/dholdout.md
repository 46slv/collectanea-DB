---
title: dHoldout
description: 手前のDeep Imageの奥行きを使い、背後のDeep Imageで隠れるサンプルを処理するNode。入力、半透明の扱い、Z Offsetと実例を解説。
doc_type: node
term_id: dholdout
term_short: "dHoldoutは、手前のDeep Imageを遮蔽物として使い、奥にあるDeep Imageの見え方を深度サンプル単位で調整するNode。"
verification: partial
aliases: [dHoldout, dHld]
concepts: [deep-image, depth, occlusion]
nodes: [dHoldout]
node_family: deep
controls: [Compute Occluded Samples, Holdout Z Offset, Sample, Holdout Center]
inputs: [deep-image, deep-image]
outputs: [deep-image]
tasks: [deep, holdout, occlusion]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# dHoldout

**dHoldout [dHld]は、手前にある物体の奥行き情報を使って、背後の物体で隠れる部分を処理するNodeです。** たとえば建物の柱と、その奥に流れる煙を別々にレンダリングしたとします。柱の輪郭だけで煙を切り取るのではなく、同じ画面位置でも「柱より手前か、奥か」という奥行きを使って、煙のどのサンプルが隠れるかを判断するために使います。

通常の2D画像では、基本的に1画素に1組の色とAlphaが入ります。<Term id="deep-image">Deep Image</Term>には、同じ画素に重なる手前・奥の複数のサンプルを記録できます。**dHoldoutはその深度サンプルを利用して背景を遮る処理**で、2DのMaskで画素全体を隠す方法とは異なります。

「holdout」は、ここでは**手前の形状・奥行きを使って後ろの素材を隠すこと**です。単に2つの画像を重ねたい場合は、[dMerge](./d-merge.md)の役割から確認してください。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Background**（オレンジ） | Deep Image | 隠される側の素材。柱の奥に流れる煙など。 |
| **Foreground**（白） | Deep Image | 手前の遮蔽物として使う素材。柱のDeepレンダーなど。 |
| **出力** | Deep Image | Foregroundの奥行きによる遮蔽処理を受けた結果を後段へ渡す。 |

ManualがdHoldout固有の入力として示すのは**BackgroundとForegroundの2つ**です。Foregroundは一般的な白黒Mask入力ではなく、奥行きサンプルを持つ画像を受けます。dTransformなどにある青いEffect Mask入力を、dHoldoutにも当然あるものとして扱わないでください。

~~~text
背景の煙（Deep EXR） ───── Background ┐
                                  dHoldout → Deep to Image → 確認用Viewer
柱のレンダー（Deep EXR） ─ Foreground ┘
~~~

上図は**遮蔽結果を確認する最小構成**です。dHoldoutは前景のDeepデータを使って背景を隠すためのNodeであり、前景と背景の全要素を完成画として合成する[dMerge](./d-merge.md)と同義ではありません。柱そのものを最終画にどう重ねるかは、出力を確認して別に組み立てます。前景の色がどのように出力へ残るかは、21.1実機で未検証です。

## Inspectorで何を調整するか

### Compute Occluded Samples

**半透明の前景を扱うときの処理**です。21.1 Manualは、チェックすると半透明Foregroundのサンプルを取り除き、残って見えるBackgroundの画素色を「半透明の前景越しに見た場合」に合わせて再計算する、と説明しています。

たとえば手前の薄いガラス越しに背景が見える場合、背景を単純に完全消去してしまう処理では、透けて見える成分を扱えません。この設定は**完全な不透明物の遮蔽だけでは説明できないケース**を扱うためのものです。

ただし、Manualはどのサンプルをどの順番で除去するか、色とAlphaをどの式で計算するかまでは示していません。チェックの有無でどう変化するかは、半透明のDeep素材を使って比較します。通常の2D画像のOpacityを変える設定だと決めつけないでください。

### Holdout Z Offset

**遮蔽物として使う前景サンプルの奥行き位置をずらす**設定です。Manualは次の方向を明記しています。

- 値を**下げる**：Holdoutを**手前へ**動かす。
- 値を**上げる**：その逆で、Holdoutを**奥へ**動かす。

柱と煙の境界で、前後関係がわずかにずれて意図しないサンプルが見えるときに調整できます。ただし、この設定だけで別カメラからのレンダーを正しい3D投影に直すものではありません。まず元のDeep素材が同じカメラ・奥行き基準にあるか確認します。

**Sample**ボタンはViewerへドラッグして値を取得します。見た目だけでZ Offsetを動かす前に、素材のサンプル値を確認する手段です。単位、許容範囲、基準Zはこの節だけでは確定できません。

### Holdout Center

**Foregroundの遮蔽位置をXY方向へ移動**します。背景に対して遮蔽物の位置が少しずれている場合の調整に使います。

Holdout Centerは画面上の位置合わせであり、Z Offsetは奥行き方向の位置合わせです。輪郭がずれているのにZ Offsetだけを動かしても、画面上のXYのずれは解消しません。

## 運用例：柱の奥へ入る煙を隠す

柱と煙を別パスのDeep EXRとしてレンダリングしている場面です。煙は柱の裏へ回り込むため、画面上で重なる煙をすべて消すと、本来柱の**手前**にある煙まで失われる可能性があります。

1. 柱と煙のDeep EXRを読み込みます。両者のカメラ、解像度、深度の前提が一致していることを確認します。
2. **Backgroundに煙、Foregroundに柱**を接続します。何を残し、何を遮蔽物にするかを先に分けます。
3. 後段へ[Deep to Image](./deep-to-image.md)を置き、柱の奥にある煙のサンプルが意図どおり遮られるか確認します。最終画の柱の描画そのものと、Holdout処理を混同しないでください。
4. 柱の画面上の輪郭が煙の遮蔽位置と合わなければ**Holdout Center**を確認します。奥行きの境界が合わなければ**Holdout Z Offset**を小さく動かし、前後の変化を比較します。
5. 柱の一部が半透明なら**Compute Occluded Samples**のオン／オフを比較し、背景色・Alpha・奥のサンプルの残り方を確認します。
6. 後続でDeep合成を続けるならDeepデータのまま処理し、2Dの仕上げへ移る時点でDeep to Imageを使います。

この例は**Manualの機能説明から組み立てた使用例**です。煙・ガラスの実素材を使った21.1実機検証ではなく、半透明サンプルの具体的な再計算結果まで保証するものではありません。

## 似たNodeとどう違うか

| Node | 何をするか | 選ぶ場面 |
| --- | --- | --- |
| **dHoldout** | 前景の奥行きで背景サンプルを遮る | 前後関係に沿って背景を隠したい。 |
| [dMerge](./d-merge.md) | 複数のDeepストリームのサンプルを統合する | 2つ以上のDeep素材を合成したい。 |
| [dCrop](./dcrop.md) | 指定したZ範囲でサンプルを残す・除外する | 別のForegroundを使わず奥行き範囲で選びたい。 |
| [dTransform](./dtransform.md) | Deep画像のXY位置とサンプルZ値を変える | 位置や深度値を調整してから合成したい。 |
| [Deep to Image](./deep-to-image.md) | 複数サンプルを通常の2D画像へまとめる | Deep処理を終え、2Dの合成へ渡したい。 |

特に**dCropとの違い**は重要です。dCropは指定した数値のZ範囲でサンプルを選びます。dHoldoutは**別のDeep画像の前景形状・深度**を遮蔽条件として使います。

## 期待した結果にならないとき

- **煙が隠れない／予想外の部分が隠れる**：BackgroundとForegroundの接続を逆にしていないか、元のサンプルZとレンダーカメラを確認します。
- **遮蔽境界が横にずれている**：Holdout Centerと元レンダーの座標・解像度を確認します。Z OffsetだけではXYは変わりません。
- **遮蔽境界だけが奥行き方向にずれる**：Holdout Z Offsetを確認します。Manual上は下げると手前、上げると奥です。
- **半透明の境界で色が不自然**：Compute Occluded Samplesのオン／オフを比較します。Deep素材自体の色とAlphaも確認します。
- **Foregroundがそのまま完成画に表示されると思った**：dHoldoutは背景の遮蔽処理を目的とするNodeです。前景自体の合成は後段の結果を見て組み立てます。
- **2D Mergeにつなぎたい**：Deep処理を終えてからDeep to Imageを使います。
- **Nodeが見つからない**：21.1 ManualではDeep Image Compositing Toolsetは**Studio Version Only**です。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 95「Deep Image Nodes」。**pp.2245–2246**にdHoldout [dHld]、Background（オレンジ）・Foreground（白）入力、Compute Occluded Samples、Holdout Z Offset、Sample、Holdout Centerの説明があります。**p.2227**にはDeep Imageの複数奥行きサンプル、**Studio限定**、Deep合成で**linear colorspace**が必要であることが明記されています。

以上は21.1 Manualに基づく説明です。実機での出力サンプル構造、半透明の再計算式、設定値の範囲・初期値、前景色の最終出力への残り方は検証していません。このためfrontmatterは `verification: partial` のままです。
