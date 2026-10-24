---
title: Viewerに何も表示されない
description: ViewerへのNode割り当て、表示チャンネル、透明度、Graphの接続を順に確かめ、空表示と画像の欠落を区別する。
doc_type: diagnostic
verification: partial
aliases: [何も表示されない, blank viewer, black viewer, no output, Viewerが真っ黒]
concepts: [node-graph, image-data, alpha]
patterns: [last-good-first-bad]
nodes: [MediaIn, MediaOut, Transform, Merge]
tasks: [debug, inspect-output]
symptoms: [nothing-visible, no-output, black-viewer, transparent-output]
prerequisites: [node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# Viewerに何も表示されない

Viewerが空のとき、**表示先のNodeが選ばれていない**のか、**Nodeの出力はあるが透明・黒に見える**のか、**Graphの途中で画像が失われた**のかを先に分けます。この3つは見た目が似ていても、確認する場所が違います。

## まず確認すること

1. **Viewerの中央にNode名があるか**を見ます。名前がなければ、調べたいNodeを選択して `1`（左）または `2`（右）を押し、明示的に表示します。同じ番号をもう一度押すと表示が解除されるため、繰り返し押し続けないでください。
2. **表示中のチャンネル**を確かめます。Viewerをクリックして `C` でRGB表示、`A` でAlpha表示に切り替えます。Alphaは透明度を白黒で表す情報で、RGBの色そのものではありません。
3. **画面外へ移動していないか**を確認します。Viewerをクリックして `F` でFit表示に戻し、画像の枠と被写体の位置を見ます。
4. **画像の入口**を確認します。`MediaIn`などの元画像Nodeを直接Viewerへ出して、同じフレームで表示されるかを確かめます。
5. **最後に正常だったNode**と**最初に表示が変わったNode**を探します。まずパラメータを変更せず、Viewerに出す地点だけを変えてください。

操作1〜3は、合成内容を変更せずに調べられます。DaVinci ResolveのFusionページはMediaOutが右Viewerに表示されることがありますが、Fusion Studioでは起動直後のViewerにNodeが割り当てられていない場合があります。空のViewerを、必ずしも空のGraphと判断しないでください。

## 症状から分ける

| Viewerで見える状態 | 次に確かめること | 判断できること |
| --- | --- | --- |
| ViewerにNode名が出ない | Nodeを選んで `1` / `2` で割り当てる | 表示先が未指定だったか |
| Node名はあるが真っ黒 | `C` と `A` を切り替え、元画像Nodeと比較する | RGBが黒いのか、透明なのか |
| 市松模様だけが見える | Alpha表示と、画像が実際に透明な範囲を調べる | 色がないことと不透明度がないことを区別できる |
| 元画像は見えるが処理後だけ消える | 直前・直後のNodeを左右Viewerで比べる | 画像が変わった境界を特定できる |
| 個別Nodeは見えるが完成映像に出ない | MediaOutまで接続されているか確認する | Viewerでの試写と最終出力の違いを特定できる |
| ShapeなどのNodeだけ期待した映像にならない | 出力データの種類とRendererの有無を調べる | 通常の2D画像として扱えているか |

市松模様は、Viewerの **Checker Underlay** が有効なとき透明部分の下に表示されます。無効なら、その部分は黒く表示されます。したがって、**黒く見えることだけでは、元画像が消えたと判定できません**。

## 原因を切り分ける

### 1. 入力と出力を別々に見る

例えば、次のGraphを調べるとします。

~~~text
MediaIn1 ──→ Transform1 ──→ MediaOut1
   ↑             ↑
左Viewer      右Viewer
~~~

1. MediaIn1を左Viewerに割り当て、入力画像が見えるか確認します。
2. Transform1を右Viewerに割り当て、**同じフレーム**を比較します。
3. 左に画像があり右が空なら、Transform1への接続、CenterやSize、Maskなどを確認します。左も空なら、先にMediaIn1の素材・フレームを調べます。
4. Transform1は正しく見えるのに完成映像へ反映されない場合は、Transform1からMediaOut1までの接続を確認します。

左右Viewerへ別々のNodeを割り当てても、Graphの配線やMediaOutへの接続は変わりません。診断中にNodeを削除したり、全Controlを初期化したりする必要はありません。

### 実機の参考例：表示地点を分ける

<!-- capture-reuse:R53 -->

左ViewerにLoader1、右ViewerにTransform1を出した正常例です。Viewer上のNode名と、変形前後の画像を見比べる場所を示しています。

[![S06の実機Node Editorの接続](/img/fusion/captures/S06/graph.png)](/img/fusion/captures/S06/graph.png)

[![S06の左右Viewerの比較](/img/fusion/captures/S06/compare.png)](/img/fusion/captures/S06/compare.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS06の参考例です。空表示の原因を再現した画像ではありません。[撮影条件と確認範囲](/img/fusion/captures/S06/capture.json)も参照できます。

### 2. RGBとAlphaを分ける

2D画像にはRGBの色と、重ね合わせ時の透明度を示すAlphaが含まれます。

- RGB表示で黒く、Alpha表示で白い：その場所は**不透明な黒**の可能性があります。元画像も黒いのか、途中の処理で黒くなったのかを比較します。
- RGB表示で色があるのに、Alpha表示で黒い：色情報があっても**合成時には透明**になり得ます。切り抜きやAlphaの処理を確認します。
- Alpha表示が全体的に黒い：期待した不透明な領域が作られているか確認します。透明度を変えるNodeの前後で比較します。

Viewerの `C` / `A` は**表示する情報を切り替える操作**であり、画像の透明度を変更する操作ではありません。RGBが黒い理由とAlphaが0に近い理由を混同しないことが重要です。

詳しくは[Alpha（アルファチャンネル）](../../learn/04-compositing/alpha)を参照してください。

### 3. Maskと合成を分ける

Maskをつないでから結果が消えた場合は、Maskを受け取るNodeをViewerへ出し、元画像の分岐が表示されるかを確かめます。次にMask単体を表示して、白い部分が期待した範囲にあるかを確認します。必要な場合だけMask入力を一時的に切り離し、結果が戻るか比較します。

Maskは「どこに処理を適用するか」を指定することがあり、画像のAlphaそのものと同一ではありません。Mergeの前景（Foreground）と背景（Background）が逆に接続されていないかも確認します。

関連：[Maskを接続しても結果が変わらない](../masking/mask-does-not-change-result)、[Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)。

### 4. 元画像・フレーム・データ種類を確認する

- **MediaIn単体でも画像が出ない**：まず素材が正しく参照されているか、現在位置に表示できるフレームがあるかを確認します。素材の不在と、後段のEffectの設定不良を分けます。
- **途中の2D画像Nodeは見えるがMediaOutは見えない**：MediaOutへの線がつながっているか、別の分岐が接続されていないかを確認します。Viewerに表示しただけでは、そのNodeが最終出力へ送られるわけではありません。
- **Shape・Particle・Deepなどを見ている**：通常の2D Imageとは別のデータを扱う場合があります。適切なRendererや変換Nodeの後でViewerを確認します。3Dシーンなど直接専用Viewerへ表示できる種類もあり、すべてを同じ方法で画像化するわけではありません。

関連：[Shape / Particle / 3D / USD / DeepがImageとして見えない](../connections/non-image-domain-not-visible)。

## 修正方法

原因が分かった箇所だけ変更します。表示先の間違いならViewerを割り当て直し、透明度の問題ならAlphaを変えたNode、画面外への移動なら位置と拡大率、接続の問題なら該当する入力・出力の線を修正します。

修正後は、**問題があったNodeの前後**と**MediaOut**を同じフレームで再確認します。途中だけ表示が戻っても、完成映像まで届かなければ解決ではありません。

診断の基本は[中間結果をViewerで見る](../../learn/01-flow/intermediate-results-viewer)と[Graphとして考える](../../learn/01-flow/graph-as-flow)で説明しています。

## バージョン・出典・未検証範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Fusion Fundamentals。

- Chapter 63、pp.1290–1293：ViewerへのNode割り当て（1 / 2）、表示解除、Fit、RGB / Alpha、Checker Underlay、Time Ruler。
- Chapter 68、pp.1468–1469：Viewerの表示チャンネルとRGB・Alphaの操作。
- Chapter 78、p.1717：キーイング結果のAlpha確認と、黒・白・灰色の透明度の読み方。

**21.1 Manualで確認したこと**：Viewer割り当て、表示チャンネル、Checker Underlay、およびAlphaの基本的な意味。**このページの診断順序**はそれらを組み合わせた作業案です。空表示を再現した実機検証、素材欠落時の警告表示、すべてのNode・OS・Editionでの表示結果は確認していないため、`verification: partial`を維持しています。
