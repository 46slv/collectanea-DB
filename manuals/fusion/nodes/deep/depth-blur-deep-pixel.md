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
updated: "2026-10-24"
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

## 実機例：2つの球で焦点を切り替える

<!-- capture-case:S116 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%、フレーム0で撮影しました。左がRenderer 3Dのカラー出力、右が処理後です。

手前の球はX＝−1.1・Z＝0、奥の球はX＝1.3・Z＝−3、カメラはZ＝10に置いています。Software RendererからRGBAとZを出力しました。GraphのCopyAux1は確認用の分岐で、処理本体の入力ではありません。

[![2つの球とCamera、LightからRGBAとZを出し、Depth Blurへ渡す実機Graph](/img/fusion/captures/S116/graph.png)](/img/fusion/captures/S116/graph.png)

まずBlur Size＝0にして、ぼけを加えていない状態を確認しました。

[![Depth BlurのBlur Size0で左右の球体が同じように鮮明に表示される実機比較](/img/fusion/captures/S116/baseline.png)](/img/fusion/captures/S116/baseline.png)

Filter＝Soften、Blur Channel＝Z、Lock X/Y＝ON、Blur Size＝20、Depth of Field＝1、Z Scale＝1にしました。Focal Point＝−9.5では、手前の大きい球はほぼ鮮明なまま、奥の小さい球がぼけました。このRendererが出すZは負値です。正の9.5では両方がぼけたため、入力のZに合わせて負の焦点値を使っています。

[![Depth BlurでZとSoften、Blur20、焦点マイナス9.5、被写界深度1、Z Scale1を選んだ実機Inspector](/img/fusion/captures/S116/inspector.png)](/img/fusion/captures/S116/inspector.png)

[![右のDepth Blur出力で手前の球をほぼ鮮明に保ち、奥の球をぼかした実機比較](/img/fusion/captures/S116/compare.png)](/img/fusion/captures/S116/compare.png)

ほかの値を保ち、Focal Pointだけを−12.5にすると、奥の球が鮮明になり、手前の球がぼけました。最後は−9.5へ戻して保存しています。

[![焦点だけをマイナス12.5へ変えたDepth Blurの実機Inspector](/img/fusion/captures/S116/far-inspector.png)](/img/fusion/captures/S116/far-inspector.png)

[![焦点の変更で右Viewerの奥の球が鮮明になり、手前がぼける実機比較](/img/fusion/captures/S116/far.png)](/img/fusion/captures/S116/far.png)

確認用のCopy AuxはRendererの出力からZを取り出し、From＝−13〜−9をTo＝0〜1へ変換しています。右の白い球が手前、暗い球が奥です。Channel Missing＝Failで出力できることも確認しました。白黒の表示画像をDepth Blurへつないでいるのではなく、RGBAに含まれる元のZを使っています。

[![Zの存在を確認するCopy Auxの固定再マッピングと欠落時Failの実機Inspector](/img/fusion/captures/S116/depth-inspector.png)](/img/fusion/captures/S116/depth-inspector.png)

[![照明付きカラーとは異なる手前が白く奥が暗いZ診断表示の実機比較](/img/fusion/captures/S116/depth.png)](/img/fusion/captures/S116/depth.png)

この例は不透明な球の表示比較です。光学的な被写界深度の再現精度、透明物・重なった輪郭、外部Blur Image、ほかのFilterやチャンネル、Mask、EXR書き出し、Edition差と性能は未確認です。通常の2D画像と補助Zを使っており、Deep Imageは使っていません。

[再現用Graph](/img/fusion/captures/S116/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S116/capture.json)

## 出典・確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**, Chapter 96「Depth Blur [DBl]」、本文pp.2259–2261。3入力、Blur Imageの優先関係、Filter、Blur Channel、Focal Point、Depth of Field、Z Scaleと接続例を確認。
- 同ManualのChapter 88「Renderer3D」、本文pp.1974–1975。Z出力と補助チャンネルのアンチエイリアスについて確認。

S116でSoftware Rendererの補助Zと焦点を切り替えた表示を実機確認しました。Zの境界、GPU差、外部Blur Imageや全入力組み合わせ、Edition差は未確認のため、`verification: partial`を維持します。
