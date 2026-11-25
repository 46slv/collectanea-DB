---
title: Viewerの一部分だけ更新されない
description: RoIによる描画範囲の制限と、画像自体の欠けやViewer全体の更新停止を切り分ける。
doc_type: diagnostic
verification: partial
tasks: [debug, inspect-output]
symptoms: [partial-viewer-update]
---

# Viewerの一部分だけ更新されない

## まず確認すること

パラメータを変更したとき、Viewerの一部分では変更結果が見えるのに、別の部分に古い表示が残る場合があります。最初に対象ViewerのRoI（Region of Interest）が有効かを確認します。RoIはViewerで更新を要求する領域を指定する機能です。

- Viewerに表示されているNode名と現在フレームを確認する。
- 画像全体が見える倍率に戻し、RoIの有効状態と矩形の位置を確認する。
- Viewer全体が更新されない場合は、[Viewerの画像が更新されない](./viewer-does-not-update)の診断を先に行う。
- 画像自体を切り抜くNodeや出力解像度は、表示範囲の問題と区別する。

## 切り分け手順

左右に文字や細い線など、変化を見分けやすい目印がある静止画像を用意します。素材はフレーム全体に画像があるものを使い、途中にMaskを接続せず、次の構成を作ります。

```text
MediaIn → Blur → MediaOut
             └→ Viewerで観察
```

Fusion Studioでは入力にLoaderを使用しても構いません。検証用Compositionで同じフレームのBlur出力を観察します。Viewer Lockを解除し、A/B Bufferの比較表示も解除しておきます。

1. RoIを無効にし、画像全体をViewerに表示する。
2. Blurの量を弱い状態と強い状態で切り替え、左右両方の目印が変化することを確認する。
3. RoIを有効にし、RoIメニューのSetで左側の目印を含む矩形を指定する。
4. もう一度Blurの量を変更し、矩形内の変化と矩形外の表示を別々に観察する。
5. Blurの量はそのままで、RoIを無効にして全体を表示し直す。
6. 左右の目印が同じ設定の結果になっているか確認する。

期待するのは、手順4で更新が要求される範囲が狭くなり、手順5でその制限が解除されることです。矩形外に古い画素が残るかどうかは表示履歴などに依存し得ます。常に同じ残り方をするとは限りません。

## 主な原因

| 観察結果 | 疑う対象 |
| --- | --- |
| RoI内だけ変化が見える | RoIによる更新範囲の制限 |
| 拡大やパンに伴って対象範囲が変わる | RoIのAuto設定 |
| 矩形が移動・変更できない | RoIのLock設定 |
| Viewer全体に変更が反映されない | Viewer Lock、表示対象、更新設定 |
| RoIを解除しても同じ位置で画像が欠ける | 前段の画像、有効領域（DoD）、Cropなど |

RoIのLockは指定した範囲が変更されないようにする設定です。Viewer全体の更新を止めるViewer Lockとは目的が異なります。

## 修正方法

RoIが原因の場合は、対象ViewerのRoIボタンを無効にし、画面全体の更新を確認します。再びRoIを使う場合は作業に必要な範囲を指定します。

- Auto：表示中の範囲に合わせる。
- Set：任意の矩形を指定する。
- Lock：指定済みのRoIを固定する。
- Reset：RoIの範囲をViewer全体へ戻す。

ResetとRoIの無効化は別の操作です。範囲制限自体を切り分けるには、無効化した状態を基準にします。

RoIを解除しても欠ける場合は、Blurの前後のNodeを同じフレームで順に表示し、どの段階から問題があるか確認します。CropやMaskの削除、解像度変更は原因を特定してから行います。

## なぜ起きるか

RoIはViewerが必要とする更新範囲、DoD（Domain of Definition）は有効な画像データが存在する範囲です。公式Manualでは、Nodeの描画時に両者の重なりから処理対象の画素範囲を決めると説明されています。

矩形外に以前の結果が見えていても、それだけで画像データが消失したとは判断できません。まずRoIを解除し、同一フレーム・同一Node・同一パラメータで比較します。

範囲を狭めることは高解像度や重いCompositionの作業時に役立ちますが、処理全体の高速化を保証するものではありません。詳しくは[有効領域（DoD）](../../learn/03-space/domain-of-definition)を参照してください。

## バージョン・例外

Blackmagic Design公式 [Fusion 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/FusionManual.pdf)、Chapter 2「Exploring the Fusion Interface」p.21のROI controlsを、2026年11月25日に索引化本文で照合しました。

確認範囲は、RoIの目的、DoDとの関係、Auto・Set・Lock・Resetおよび有効状態の切替です。上記の検証用Compositionと観察結果は仕様に基づく手順であり、今回の実機測定ではありません。

Resolve 21.1版Manualの対応箇所、PDFページ画像、矩形外の具体的な表示履歴、更新タイミング、処理時間、OS・Edition差は未検証です。

## 関連する症状

- [Viewerの画像が更新されない](./viewer-does-not-update)
- [Flowが重い / 遅い](../performance/graph-is-slow)
- [Resolution / Domain of Definitionを確認する](../../learn/07-debugging/resolution-domain-of-definition)
- [中間結果をViewerで確認する](../../learn/01-flow/intermediate-results-viewer)
