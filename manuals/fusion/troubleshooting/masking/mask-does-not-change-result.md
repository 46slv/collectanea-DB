---
title: Maskを接続しても結果が変わらない
description: BlurとEllipse Maskを使って、処理側・Mask側・接続先・反転・複数Maskのどこに原因があるかを順に調べる。
doc_type: diagnostic
verification: partial
aliases: [Maskが効かない, mask not working, Effect Maskが無効, マスクをつないでも変わらない]
concepts: [mask-data, effect-mask]
patterns: [limit-effect-with-mask]
nodes: [Blur, Merge, Ellipse Mask, Polygon Mask, Bitmap Mask]
tasks: [debug, mask]
symptoms: [mask-no-effect, mask-not-working]
prerequisites: [mask-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-25"
---

# Maskを接続しても結果が変わらない

Maskをつないでも処理が画面全体にかかったまま、あるいは何も変わらないときは、**処理自体が動くか**、**Maskに白い領域があるか**、**対象NodeのEffect Mask入力へ届いているか**を分けて確認します。複数の設定を同時に変えると、どこで直ったのか分からなくなります。

## まず確認すること

1. Maskの線を一時的に外しても、対象のBlurや色変更が見えるか。**Maskなしでも変化がなければ、処理側を先に直します。**
2. Mask単体をViewerへ表示すると、効果をかけたい位置に白い領域があるか。全面黒、極端に小さい図形、画面外の図形になっていないか。
3. Maskの出力が、**効果を制限したいNode自身**の青いEffect Mask入力につながっているか。
4. Mask側のLevel、Invert、Solid、Soft Edgeに加え、対象NodeのSettingsにあるApply Mask Invertedを確認したか。
5. 複数MaskやBitmap Maskを使っている場合は、いったん1個だけに減らして同じ症状が起きるか。

## 原因を切り分ける：BlurとEllipse Maskの最小例

入力には、**黒い背景に白い細線や文字がある1920×1080の静止画**など、ぼかしを見分けやすい素材を使います。MediaIn1を使う場合、下のようにつなぎます。

    MediaIn1 ───────→ Blur1 ───────→ MediaOut1
                         ↑ Effect Mask（青）
    Ellipse1 ────────────┘

1. まずEllipse1をつながず、MediaIn1 → Blur1 → MediaOut1を作ります。Blur1のBlur Sizeを上げ、**画面全体の文字や細線が明らかにぼける**状態にします。Blur Sizeは元画像と解像度に合わせて調整し、数値を固定する必要はありません。
2. Ellipse1を作り、**Center X/Y = 0.5/0.5、Width/Height = 0.4/0.4、Level = 1.0、Soft Edge = 0、Solid = on、Invert = off**を確認します。数値は中央に円形の診断領域を置くための例であり、初期値を示すものではありません。
3. Ellipse1をViewerに表示します。中央の白い楕円と周囲の黒い領域が見えることを確かめます。
4. Ellipse1の出力をBlur1の**青いEffect Mask入力**へつなぎます。左ViewerにMediaIn1、右ViewerにBlur1を表示し、同じフレームを比べます。
5. **期待する結果：** 中央の楕円内だけ文字や細線がぼけ、楕円の外側は元画像の鮮明さが残ります。Blur1の出力に変化がないなら、処理・Mask・接続のうち、まだ原因が残っています。
6. 診断としてEllipse1のLevelを1.0から0へ下げると、Maskが指定する処理領域の効き方が弱くなります。元へ戻してからInvertをonにすると、効果をかける側が内外で入れ替わります。比較後はLevel = 1.0、Invert = offへ戻します。

この構成では、Blurの**オレンジ色のメイン入力**が2D Image、**青いEffect Mask入力**が処理範囲です。Maskの白いところで処理結果を使い、黒いところでは元画像を残す、という違いを観察します。BlurのEffect Maskは処理後の結果に適用されることが21.1 Manualに明記されています。

### 実機の正常例：Maskの有無を比較する

<!-- capture-reuse:R48 -->

同じチャートから、画面全体をぼかすBlurFullと、Ellipse1をEffect Maskへ接続したBlur1に分岐した例です。次の2枚は**正常動作の参考画像**であり、接続ミスやLevel 0などの不具合を再現した記録ではありません。

[![S07のNode Editor。BlurFullとEllipse Mask付きBlur1に分岐している](/img/fusion/captures/S07/graph.png)](/img/fusion/captures/S07/graph.png)

[![S07の左右Viewer。全体Blurと楕円内だけのBlurを比較している](/img/fusion/captures/S07/compare.png)](/img/fusion/captures/S07/compare.png)

撮影条件：Resolve Studio 21.1.0.14／Windows。使用素材、Node接続と記録の範囲は[撮影データ](/img/fusion/captures/S07/capture.json)を参照してください。

## 症状別の主な原因と修正

| 観察した結果 | 最初に疑う場所 | 1つだけ試す修正 |
| --- | --- | --- |
| Maskを外しても何も変わらない | 対象Nodeの画像入力、Blur Size、Blend | 入力に細線があることを確認し、Maskなしで明瞭なBlurを作る |
| Mask単体が黒い／形が見えない | Level、Solid、形の位置・大きさ | Ellipseを中央に置き、Level = 1.0、Solid = onで表示を確認 |
| Blurが全面に残る | 接続先、Maskの白黒、Apply Mask Inverted | Blur1の青い入力を確認し、Maskと対象Nodeの反転を一旦offにする |
| 内側でなく外側がぼける | Mask側Invertと対象Node側Apply Mask Inverted | 両方を別々にoffにしてから、必要な片方だけをonにする |
| 2個目のMaskを足した途端に効かない | 2個目のPaint Mode | 1個目だけで確認し、2個目のCopy / Ignore / Subtractなどを点検 |
| 画像から作ったMaskだけ効かない | Bitmap Maskの入力画像・Channel・Threshold | Bitmapの元画像と使用チャンネルをViewerで確認し、しきい値を戻す |

### MaskのLevelと処理側Blendは別の設定

Ellipse MaskのLevelは、Maskの白い領域の値を下げます。**Level = 0なら有効な処理領域がなくなります**。一方、BlurなどのBlendは、Nodeで処理した結果と元画像の混合率を制御します。どちらも画面上の効果を弱められますが、意味は異なります。

Maskだけを見て判断しないため、対象NodeのBlendをまず効果が見える状態へ戻し、MaskはLevel = 1.0のまま確認します。Blend = 0では元の画像が出ることが21.1 Manualに記載されています。

### Invertが2か所にある

Mask側の**Invert**はMaskの白黒を反転します。対象NodeのSettingsにある**Apply Mask Inverted**は、そのNodeに接続されたEffect Maskを反転します。

この2つを同時に切り替えると、結果が元へ戻って見える場合があります。両方を一旦offにして「楕円の内側へ処理」が確認できたら、必要な方を**1つだけ**切り替えてください。Apply Mask InvertedはGarbage Matteには適用されないため、違う種類のMatte入力で同じ結果になると想定しないでください。

### 複数Maskを合成したときだけ変わる

例として、Ellipse1をEllipse2のEffect Mask入力へつなぎ、Ellipse2をBlur1へ渡す構成を考えます。

    Ellipse1 ──→ Ellipse2［Effect Mask］──→ Blur1［Effect Mask］

この場合、Ellipse2の**Paint Mode**が2つのMaskの合成方法を決めます。Merge（既定）、Add、Subtract、Multiply、Copy、Ignoreなどは同じではありません。

- **Subtract：** 重なる部分の値を引くため、期待した白い領域がなくなる場合があります。
- **Multiply：** 2つの値を掛けるため、重ならない部分が黒くなります。
- **Copy：** 入力側Maskを捨て、現在のMaskの値だけを使います。
- **Ignore：** 現在のMaskを捨て、入力側Maskの値だけを使います。

まずEllipse1単体で動くか確認し、次にEllipse2を加えてPaint Modeを1つずつ比較します。Paint ModeのInvertは重なる領域に働き、Mask全体を反転する**Invertチェックボックス**とは異なります。

### Bitmap Maskを使う場合と使わない場合

別の画像のAlphaや輝度から処理範囲を作るとき、**Effect Mask入力であればBitmap Maskは必須ではありません**。対象NodeのSettingsで画像のどのチャンネルをMaskとして使うか選べる場合があります。これは「MaskにはMask Nodeしか接続できない」という一般化への例外です。

Bitmap Maskを間に置くと、元画像の色・Alpha・輝度・各種補助チャンネルを元に、Channel選択、Soft Edge、Thresholdなどを調整できます。Bitmap Maskのオレンジ色入力にはMask化する**2D Image**を渡します。チャンネルを間違えたり、Thresholdで必要な白い範囲を消したりしていないか確認してください。Garbage MatteやPre-Maskなど、別種の入力ではBitmap Maskが必要になる場合もあります。

### MergeへMaskを接続した場合

通常のMergeでは、Effect Maskの白い部分でForegroundをBackgroundの上へ合成し、黒い部分ではBackgroundを残します。**Foregroundに画像がない、またはForegroundがBackgroundと見分けられない**場合、Maskが正しくても違いは見えません。

Blurの診断手順と同じく、まずMaskを外してMergeのForeground / Backgroundの違いを確認し、その後にMaskを戻してください。Mergeの入力の役割は[Merge](../../nodes/compositing/merge)で確認できます。

## 修正できたかの判定

1. **Maskなし：** 対象Nodeが画像全体に分かる変化を作る。
2. **Mask単体：** 目的の位置に白い領域、外側に黒い領域がある。
3. **Mask接続後：** 白い範囲だけ処理が現れ、位置やLevelを変えると予測どおりに変化する。
4. **元のGraphへ戻す：** 診断用の設定変更を戻しても、狙った範囲にだけ最終結果が届く。

まだ変化しない場合は、Maskの線を増やす前に[Node同士を接続できない](../connections/nodes-do-not-connect)と[Viewerに何も表示されない](../viewer/nothing-visible)で入力経路を切り分けてください。

## 関連する考え方・Node

- [マスク（Mask）](../../learn/02-data/mask)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)
- [Blur](../../nodes/blur-filter/blur)
- [Ellipse Mask](../../nodes/masks/ellipse-mask)
- [Polygon Mask](../../nodes/masks/polygon-mask)
- [Bitmap Mask](../../nodes/masks/bitmap-mask)
- [Merge](../../nodes/compositing/merge)

## バージョン・出典と未検証範囲

一次資料：[Blackmagic Design「DaVinci Resolve 21.1 Reference Manual」](https://www.blackmagicdesign.com/jp/support)（2026年9月公開、以下はPDF本文のページ番号）。

- **Chapter 92、pp.2109–2111：** Blurの2D Image入力・Effect Mask入力、処理後のMask適用、Blur SizeとBlend。
- **Chapter 108、pp.2472–2475：** Ellipse MaskのLevel、Solid、位置・寸法、Paint Mode、Invert。
- **Chapter 108、pp.2463–2465：** Bitmap Maskの入力・チャンネルとMask合成、Threshold等を使う理由、Paint Modeの各動作。
- **Chapter 69、pp.1501–1502：** BlendとApply Mask Inverted、Garbage Matteとの適用範囲の違い。
- **Chapter 94、p.2211：** MergeのEffect MaskがForegroundとBackgroundの表示範囲を制限すること。

本文の最小Graphと診断操作はManualに基づいて組み立てた**再現手順の提案**です。S07の正常なBlur / Effect Mask比較以外は、21.1実機でLevel = 0、反転の重複、Paint Mode別の消失、Bitmap Channel不一致などを再現していません。Resolve FreeとStudio間の挙動差、OS差、複数Maskのすべての組合せも未検証です。このためfrontmatterは「verification: partial」としています。
