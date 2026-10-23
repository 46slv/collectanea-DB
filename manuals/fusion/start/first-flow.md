---
title: 最初のFlow
description: Source → Transform → Merge → Outputの最小構造を使ってFusion Flowの読み方を体験する。
doc_type: start
verification: partial
aliases: [first flow, 最初のノード]
tasks: [learn, build-first-flow, inspect-flow]
level: foundation
product_scope: fusion
---
# 最初のFlow

## このページで分かること

Nodeの追加操作より先に、<Term id="graph-as-flow">Flow</Term>の次の4点を読みます。

- どこから<Term id="image">Image</Term>が来るか
- どこで処理が変わるか
- どこで合成するか
- どのNodeを<Term id="intermediate-results-viewer">Viewer</Term>で見ているか

## まずやること

最小構造を次のように考えます。

```text
Source A ───────┐
                ├─ Merge → Output
Source B → XF ──┘
```

1. まずSource AをViewerで確認します。
2. 素材B（Source B）をViewerで確認します。
3. 素材B（Source B）をTransformへ通し、Transformの出力（Output）を確認します。
4. Mergeで2つを合成します。
5. Merge outputを確認します。
6. 各Nodeを順番にViewerへ出し、どこで見た目が変わるか確認します。

Resolve内Fusionでは、timeline clipがMediaInとしてFlowへ入る構成が代表的です。

## 実機でSourceからMergeまでを読む

DaVinci Resolve Studio 21.1.0.14、Windows、日本語UIで撮影しました。外部素材を使わず、青いBackgroundをSourceA、Text+をSourceBという名前にしています。

[![SourceBからTransform1を通ってMerge1のForegroundへ、SourceAからBackgroundへ接続しMediaOut1へ送る実機Node Editor](/img/fusion/captures/S23/graph.png)](/img/fusion/captures/S23/graph.png)

SourceBの文字だけを動かしてから、Merge1でSourceAへ重ねます。下のInspectorではTransform1のCenterをX 0.65／Y 0.60に設定しました。Sizeは1、Angleは0です。

[![Transform1 Inspector。Center X 0.65、Y 0.60、Size 1、Angle 0](/img/fusion/captures/S23/inspector.png)](/img/fusion/captures/S23/inspector.png)

[![左ViewerのSourceBは中央のFUSION文字、右ViewerのTransform1は右上へ移動した同じ文字](/img/fusion/captures/S23/compare.png)](/img/fusion/captures/S23/compare.png)

左はSourceB、右はTransform1です。市松模様は透明部分です。両Viewerを40%に揃え、位置の変化を見ています。緑色の線や赤い軸はTransformの操作表示です。

[![左ViewerはSourceAの青一色、右ViewerはMerge1で青い背景へFUSION文字を重ねた結果](/img/fusion/captures/S23/final.png)](/img/fusion/captures/S23/final.png)

最後に左をSourceA、右をMerge1へ切り替えました。同じ接続のまま、素材、処理後、合成後を順に確認できます。1920×1080、フレーム0の静止例です。MediaInの取り込みやキーフレーム操作はこの撮影には含めていません。

[再現用Graph](/img/fusion/captures/S23/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S23/capture.json)

## 見るポイント

### Node配置ではなく接続を見る

Nodeが左や右にあることより、OutputがどのInputへ繋がっているかを見ます。

### Mergeには役割がある

2つのImage入力を「上・下」だけで覚えず、前景（Foreground）/ 背景（Background）という役割で読みます。

### 中間結果をViewerで見る

最終Outputだけを見るより、途中NodeをViewerへ出す方が問題箇所を特定しやすくなります。

### 1回に1つだけ変える

Center、Mask、Blend等を同時に変えず、変化と原因の対応を保ちます。

## 次に読む

Flowの一般則:

→ [Graphとして考える](../learn/01-flow/graph-as-flow)

Image / Mask / パラメータの違い:

→ [Image / Mask / Dataを分ける](../learn/02-data/image-mask-data)

Mergeを詳しく引く:

→ [Merge](../nodes/compositing/merge)

---
検証メモ: Node tree / Viewer / Mergeの基本役割は、現行Blackmagic Design Fusion資料とこのマニュアル内の関連ページに基づきます。
