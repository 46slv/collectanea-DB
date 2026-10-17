---
title: Depth Blur (Deep Pixel)
description: Z深度や別画像のチャンネルに応じて、画面内の場所ごとにぼけの強さを変えるFusion Node。接続例とピント位置の決め方を解説。
doc_type: node
term_id: depth-blur-deep-pixel
term_short: Z深度などを参照して、手前と奥でぼけの強さを変える2D処理Node。
verification: partial
aliases: [Depth Blur, DBl, Depth Blur (Deep Pixel)]
concepts: [auxiliary-channels, image-data, depth]
nodes: [Depth Blur]
node_family: deep
controls: [Filter, Blur Channel, Lock X/Y, Blur Size, Focal Point, Depth of Field, Z Scale]
inputs: [image, image, mask]
outputs: [image]
tasks: [aov, depth-of-field, blur]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Depth Blur (Deep Pixel)

Depth Blurは、**画面内の位置によってぼけの強さを変える**Nodeです。3Dシーンを画像化したときに保存されたZチャンネル（カメラからの距離）を使えば、手前の物体にピントを合わせ、奥だけをぼかすような被写界深度を、レンダリング後に調整できます。

このNodeが処理するのは<Term id="image">2D画像</Term>です。<Term id="auxiliary-channels">補助チャンネル</Term>として含まれるZを読み取り、RGBAの画像をぼかします。1画素に複数の奥行きサンプルを保存する<Term id="deep-image">Deep Image</Term>を直接ぼかすNodeではありません。別の画像に記録した明るさなどを使い、奥行きとは無関係に部分ごとのぼけを作ることもできます。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Input**（オレンジ、必須） | 2D画像 | ぼかす元画像。Zによる被写界深度を使う場合はZチャンネルを含める |
| **Blur Image**（緑、任意） | 2D画像 | ぼけ量を制御する別の画像。接続すると、その画像の選択チャンネルが参照元になる |
| **Effect Mask**（青、任意） | マスク | Depth Blurの効果を適用する範囲を制限する |
| **出力** | 2D画像 | 場所ごとに異なるぼけを適用した画像 |

Blur Imageは、ぼかした画像そのものを入力する端子ではありません。**どこをどれだけぼかすか**を指定する情報の入力です。Effect Maskは、その処理結果を画面のどこへ適用するかを制限します。

## 例1：3Dの手前にピントを合わせ、奥をぼかす

```text
Shape 3D ──┐
Camera 3D ─┼→ Merge 3D → Renderer 3D（RGBA + Z）→ Depth Blur ──┐ Foreground
Light ─────┘                                                    ↓
実写映像（MediaIn）──────────────────────────────────────────→ Merge → MediaOut
                                                         Background
```

1. 3Dの物体とCamera 3DをMerge 3Dに接続します。[Renderer 3D](../3d/renderer-3d.md)の**Output Channels**でZを有効にします。色だけを出力しても、Depth Blurは3Dの前後関係を読み取れません。
2. Renderer 3Dの出力をDepth Blurの**Input**に接続します。ZはRGBAと同じ画像の補助チャンネルにあるため、別のZ専用ケーブルは不要です。
3. **Blur Channel**でZを選び、**Focal Point**をピントを合わせたい物体の距離に設定します。Focal PointはZを選択した場合にだけ現れる設定です。
4. **Depth of Field**でピントが合って見える距離の幅を決め、**Blur Size**で外れた場所のぼけを調整します。最後にFilterを切り替えて画質と速度を比較します。
5. 2D Mergeで実写映像に重ねる場合は、Depth Blurの出力をForeground、実写をBackgroundにつなぎます。

例えば、Focal Pointを**300**、Depth of Fieldを**200**に設定すると、マニュアルの例ではZ値が**200～400**の画素がピントの合う範囲に入ります。Focal Pointを大きくすると、ピント位置はカメラから遠ざかります。これらはZチャンネルの値に基づく設定で、画面上のピクセル距離ではありません。

## 例2：Zの代わりに別の画像でぼけ量を制御する

```text
元画像 ────────────→ Depth Blur → 出力
ぼけ量を示す別画像 ─→ Blur Image（緑）
```

例えば、別画像の明るさに応じて一部だけぼかしたい場合は、緑の**Blur Image**へ制御用画像を接続し、**Blur Channel**で使うチャンネルを選びます。マニュアルによれば、緑の入力が接続されているときは、元画像ではなく**Blur Image側のチャンネル**が参照されます。

一方、被写界深度をZで制御する場合は、Zが含まれた画像をInputに接続し、選択したBlur Channelが意図した入力を参照しているか確認します。Effect Maskも併用できますが、ぼけ量の画像と効果範囲を制限するマスクは役割が異なります。

## Inspectorの主要設定

| 設定 | 何が変わるか | 調整の考え方 |
| --- | --- | --- |
| **Filter / Box** | 基本的なボックス型のぼかし | 単純な処理で確認するとき |
| **Filter / Soften** | 一般的な柔らかいぼかし | Boxと見た目を比較する |
| **Filter / Super Soften** | 高品質な柔らかいぼかし | より高い品質が必要なとき |
| **Blur Channel** | ぼけ量を制御するチャンネルを指定 | Zによる被写界深度か、別画像のチャンネルかを決める |
| **Lock X/Y** | 横方向と縦方向のBlur Sizeを連動 | 縦横で異なるぼけにするときは解除 |
| **Blur Size** | 横方向・縦方向のぼけの強さ | ピント外の領域で目標の大きさまで調整する |
| **Focal Point** | ピントを合わせるZ値 | Blur ChannelがZのときのみ表示される |
| **Depth of Field** | ピントが合うZ値の範囲 | Focal Pointを中心に前後へ広がる |
| **Z Scale** | 深度値を拡大・縮小 | 距離による効果の強さやぼけの境界を調整する |

Z Scaleを大きくするとZの距離差が拡大し、小さくすると圧縮されます。マニュアルは**ぼけの境界を和らげる用途**も挙げており、Z値が小さい画像では1未満の値が必要な場合があると説明しています。すべてのシーンで同じ数値を使う設定ではありません。

## うまくぼけない場合

- **全体が一様にぼける／狙った距離でピントが合わない**：Blur ChannelがZか、Focal PointとDepth of Fieldが実際のZ値に合っているかを確認します。Z Scaleを変更している場合は、その影響も比較します。
- **距離によるぼけが出ない**：Renderer 3DでZを出力しているか確認します。見た目が白黒の画像でも、Z補助チャンネルを持っているとは限りません。[Copy Aux](../color/copy-aux.md)で値を確認できます。
- **Zを別ファイルで受け取った**：RGBA画像へZを組み込む必要があります。マニュアルには[Channel Booleans](../color/channel-boolean.md)を使う構成が示されています。Z画像を単にInputへつないでも、RGBA素材と自動で結び付くわけではありません。
- **手前と奥の輪郭が不自然**：Zは境界画素で前後の距離を一つの値として扱います。Renderer 3Dの補助チャンネルのアンチエイリアスと、Depth BlurのZ Scale、Filterを確認します。Zのスーパーサンプリングがすべての奥行き処理を改善するとは限りません。

## 関連Node・概念

- [Renderer 3D](../3d/renderer-3d.md) — 3DシーンをRGBAとZを含む2D画像へ変換する
- [補助Channel / AOV](../../learn/02-data/auxiliary-channels.md) — Zが色画像とどのように併存するか
- [Copy Aux](../color/copy-aux.md) — Zなどの補助データを表示・確認する
- [Channel Booleans](../color/channel-boolean.md) — 別画像のチャンネルを組み合わせる
- [Defocus](../blur-filter/defocus.md) — 距離による奥行き情報が不要な、通常の2Dぼかし

## 出典・確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**, Chapter 96「Depth Blur [DBl]」、本文pp.2259–2261。3入力、Blur Imageの優先関係、Filter、Blur Channel、Focal Point、Depth of Field、Z Scaleと接続例を確認。
- 同ManualのChapter 88「Renderer3D」、本文pp.1974–1975。Z出力と補助チャンネルのアンチエイリアスについて確認。

本文の操作例は21.1マニュアルをもとに組み立てています。21.1実機によるZの境界、GPU差、各入力組み合わせの出力検証は未実施のため、`verification: partial`としています。
