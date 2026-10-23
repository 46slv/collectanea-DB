---
title: Mergeの適用範囲をMaskで限定する
description: MergeのForeground / Background構成を保ったまま、Effect Maskで合成する範囲だけを制限するRecipe。
doc_type: recipe
verification: partial
aliases: [masked merge, Effect Mask]
concepts: [mask-data, effect-mask, foreground-background]
patterns: [limit-effect-with-mask]
nodes: [Merge, Ellipse Mask]
tasks: [mask, composite]
prerequisites: [foreground-background, mask-data]
level: foundation
product_scope: fusion
updated: "2026-10-04"
---


# Mergeの適用範囲をMaskで限定する

## 何ができるか

背景映像に別の画像を重ねるとき、<Term id="merge">Merge</Term>の青い**Effect Mask**入力を使うと、指定した場所だけで前景を合成できます。たとえば画面いっぱいの青い背景に赤い画像を重ねる場合、楕円の中だけを赤くし、外側には青い背景を残せます。

ここで制限するのは**Mergeによる合成処理の範囲**です。前景素材そのものの<Term id="alpha">Alpha</Term>を書き換える操作ではありません。素材を別の場所でも同じ形に切り抜いて使いたい場合は、前景側のAlphaを編集する構成と区別します。

## 最小構成：青い背景に赤い楕円を重ねる

~~~text
Background1（青） ──→ Merge1［Background／オレンジ］
Background2（赤） ──→ Merge1［Foreground／緑］ ──→ MediaOut
Ellipse1 ──────────→ Merge1［Effect Mask／青］
~~~

1. Backgroundを2つ作ります。Background1を青、Background2を赤に設定し、両方のAlphaを1にします。今回は違いを見やすくするため、全面不透明な画像を使います。
2. Mergeを追加し、青いBackground1を**Background（オレンジ）**、赤いBackground2を**Foreground（緑）**へ接続します。Mergeの出力をMediaOutにつなぎます。
3. MergeをViewerに表示します。Maskをつなぐ前は、赤い前景が画面を覆うことを確認します。基本の合成はApply ModeをNormal、OperatorをOverとして考えます。
4. Ellipse Maskを作り、Mergeの**Effect Mask（青）**へ接続します。楕円の内側が赤、外側が青になれば正しく接続されています。
5. Ellipse Maskを選択したままViewerで楕円を移動し、InspectorのWidthとHeightで大きさを調整します。輪郭を自然に混ぜたい場合はSoft Edgeを増やします。
6. Ellipseの接続を一度外して比較します。赤が全面に戻り、つなぐと楕円の中だけに戻るなら、MergeそのものとMaskの働きを別々に確認できています。

MergeのBackground入力は、合成結果の解像度を決める基準でもあります。サイズの異なる素材を重ねる場合も、どちらをBackgroundへ接続したかを先に確認してください。

## 白・黒・灰色はどう見えるか

Effect Maskは、Mergeによる合成結果とBackgroundだけの状態を場所ごとに切り替えるために使われます。この例では次のようになります。

| Maskの値 | Mergeの出力で見えるもの |
| --- | --- |
| 白（1） | 赤いForegroundが青いBackgroundの上に合成される |
| 黒（0） | Mergeの合成を適用せず、青いBackgroundだけが残る |
| 灰色（0.5） | Backgroundのみの状態と合成結果が中間の割合で混ざる |

この表は**赤い前景も青い背景も全面不透明、Normal / Over**という例に対する説明です。Foreground自身に透明な部分がある場合や、Apply Mode・Operatorが異なる場合、白い範囲でも前景が全面不透明になるとは限りません。

楕円の縁はSoft Edgeによって灰色の値を持つため、境界では赤と青が徐々に混ざります。Ellipseの**Level**を下げると、縁だけでなくMask全体の値が小さくなり、中央の赤い部分も薄くなります。

## Mask LevelとMerge Blendの違い

見た目の変化が似る場合もありますが、調整している場所は異なります。

- **Ellipse MaskのLevel**：Maskが送り出す値を弱めます。同じMaskを複数のNodeで利用すると、その値を受け取る処理にも影響します。
- **MergeのBlend**：Mergeの結果を、元のBackgroundへ戻す割合を調整します。このMerge自体の合成量を変える設定です。
- **Ellipse MaskのSoft Edge**：楕円の境界部分に徐々に変化する値を作ります。中央の合成量を下げたい場合とは目的が異なります。

「円の中央まで薄い」ならLevelやMergeのBlend、「円の縁だけ硬い」ならSoft Edgeを先に確認すると、目的に合う設定を選びやすくなります。

## 楕円の外側にだけ合成する

赤い画像を楕円の**外側**にだけ表示したいときは、Ellipse Maskの**Invert**チェックボックスを使います。Maskの白黒が逆転するので、中央には青いBackgroundが残り、外側で赤いForegroundとの合成が行われます。

このInvertチェックボックスは、複数Maskを組み合わせるときの**Paint Mode > Invert**とは異なります。前者はMask全体を反転し、後者は接続されたMaskとの合成方法の一つです。

## 2つの形で合成範囲を作る

「大きな楕円の中だけ赤くする。ただし人物の位置にあたる小さな領域は青のまま残す」という例では、Maskを2つ組み合わせます。

~~~text
Ellipse1 ──→ Polygon1［Effect Mask入力］
                      │
                      └──→ Merge1［Effect Mask］
~~~

1. Ellipse1で大きな領域を作り、その出力をPolygon1の青いMask入力へ接続します。
2. Polygon1で除外したい領域を囲みます。
3. Polygon1のPaint Modeを**Subtract**へ切り替え、Ellipse1のMaskからPolygon1で描いた部分が差し引かれることをViewerで確認します。
4. Polygon1の出力をMerge1のEffect Maskへ接続します。最終Maskの白い場所でだけ前景が合成されます。

**Subtractは接続順に意味があります。** この構成では、先にあるEllipse1が基準のMaskで、後段のPolygon1が差し引く形です。Polygon1の出力を単独でViewerに表示して、狙った部分が黒くなっているか確かめます。

2つのMaskが重なった部分だけにしたい場合は**Multiply**、領域を足したい場合は**Add**などを検討します。演算名だけで結果を決めず、最終Maskの白黒を見てからMergeへ渡すのが確実です。

## 画像の明るさやAlphaで範囲を作る

手描きのEllipseやPolygonではなく、既存の画像に含まれる明るさ・Alphaを使いたい場合は**Bitmap Mask**が候補です。背景の特定の明るさだけを合成に利用したり、別の素材のAlphaを範囲指定に利用したりできます。

~~~text
参照Image ──→ Bitmap Mask ──→ Merge1［Effect Mask］
~~~

画像をそのまま青い入力へ接続する構成と、Bitmap Maskで必要なチャンネルを使ってMaskデータへ変える構成は区別してください。どのチャンネルを使うかは、Bitmap MaskをViewerへ表示して確認します。詳しくは[Bitmap Mask](../../nodes/masks/bitmap-mask.md)を参照してください。

## Effect Maskと前景のAlphaを取り違えない

このレシピの構成では、赤いBackground2を直接Viewerに表示すると、元の赤い画像は全面不透明のままです。楕円形に制限されているのは**Merge1で合成した結果**であり、Background2が円形の切り抜き素材に変わったわけではありません。

また、青いBackground1のAlphaが全面1なら、Merge1の**出力Alphaも全面1になり得ます**。赤い円の外側が青く見えるからといって、そこが透明とは限りません。透明な前景素材を作ることが目的なら、MaskをAlphaへ反映する処理やMatte Controlなどを別に検討します。

この違いは[AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask.md)で詳しく扱っています。

## 意図した結果にならないとき

| 症状 | 確認する場所 |
| --- | --- |
| 全面が赤いまま | EllipseがMergeの青いEffect Maskへ接続されているか。Ellipseの出力が全面白になっていないか |
| 全面が青くなった | Ellipseが黒い領域しか出していないか。Levelが0付近になっていないか。Invertの状態も確認する |
| 円の内外が逆になった | EllipseのInvertを確認する。複数Maskなら最終出力の白黒とPaint Modeを見る |
| 楕円の縁が硬い | EllipseのSoft Edgeを調整する |
| 中央の赤まで薄い | EllipseのLevelとMergeのBlendの両方を確認する |
| 前景の位置が合わない | MergeのCenter / Size / Angle、EllipseのCenter / Width / Heightを別々に確認する |
| 円形の「透明素材」を作ったつもりなのに透けない | MergeのEffect Maskと前景Image Alphaを混同していないか。Merge出力のAlphaもViewerで確認する |
| 2つ目のMaskを足すと形が消える | Maskの接続順、Paint Mode、Level、Invertを確認し、最後のMask Nodeを単独でViewerに表示する |

確認するときは、**MaskなしのMerge → Ellipse単体の白黒 → MaskありのMerge → Merge出力のAlpha**という順に見ると、画像の合成、範囲指定、透明度のどこに問題があるかを切り分けられます。

## 実機でMaskなし・ありとAlphaを見る

Resolve Studio 21.1.0.14、Windows、日本語UIで、青いBase1と不透明な赤いRed1を2つのMergeへ分岐させました。右のMergeMaskedだけにEllipse1をEffect Maskとして接続しています。

[![同じBase1とRed1からMergeFullとMergeMaskedへ別々に分岐し、Ellipse1をMergeMaskedの青い入力だけへ接続した実機Graph](/img/fusion/captures/S28/graph.png)](/img/fusion/captures/S28/graph.png)

[![Ellipse1 Inspector。Width 0.5、Height 0.55、Soft Edge 0.02、Center 0.5と0.5](/img/fusion/captures/S28/inspector.png)](/img/fusion/captures/S28/inspector.png)

[![左ViewerのMaskなしMergeは全面赤、右のMaskありMergeは青い背景へ赤い楕円の範囲だけを合成](/img/fusion/captures/S28/compare.png)](/img/fusion/captures/S28/compare.png)

両Viewerは40%です。左のMergeFullは赤いForegroundが全面を覆い、右のMergeMaskedは楕円の範囲だけ赤を重ねています。緑色の輪郭と赤い軸は選択中Maskの操作表示です。

[![同じ左右MergeをAlpha表示すると、Maskの有無にかかわらず両出力が全面白になる](/img/fusion/captures/S28/alpha.png)](/img/fusion/captures/S28/alpha.png)

Alpha表示では左右とも全面白です。この例は背景も前景も不透明なので、Effect Maskで前景の適用範囲を限定しても、合成結果に透明な穴はできません。1920×1080、フレーム0で撮影し、最後に両ViewerをColor表示へ戻しました。InvertやBlendの段階比較、半透明素材の解釈は含めていません。

[再現用Graph](/img/fusion/captures/S28/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S28/capture.json)

## 関連ページ

- [マスク（Mask）](../../learn/02-data/mask.md)：白黒の単一チャンネルデータとしてのMask。
- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask.md)：Mergeの3入力の違い。
- [Merge](../../nodes/compositing/merge.md)：Apply Mode、Operator、Blendなどの設定。
- [Ellipse Mask](../../nodes/masks/ellipse-mask.md)、[Polygon Mask](../../nodes/masks/polygon-mask.md)：形の作成と複数Maskの合成。
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask.md)：色補正やBlurに同じ考え方を使う方法。

## 出典と確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**（September 2026）、Chapter 94「Composite Nodes」pp.2211–2212：MergeのBackground / Foreground / Effect Mask、基本の接続、出力解像度。
- 同Chapter 94 p.2217：MergeのBlendは合成結果とBackgroundを混ぜるControl。
- 同Chapter 108「Mask Nodes」pp.2472–2474：Ellipse Mask、Level、Soft Edge、Paint Mode、Invert。
- 同Chapter 79「Rotoscoping with Masks」pp.1730–1731：Maskの組み合わせとEffect Maskの役割。

このレシピは公式資料に基づく接続例です。Resolve 21.1の実機で全手順を確認したものではなく、実行時のAlpha解釈・素材条件やEdition差を網羅的に検証していないため、`verification: partial`を維持しています。
