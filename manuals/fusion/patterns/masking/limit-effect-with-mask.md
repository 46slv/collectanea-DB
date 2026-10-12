---
title: Maskで処理範囲を限定する
description: FusionのEffect Maskで色補正やBlurの適用場所を限定する。接続手順、処理順、複数Mask、Glowとの違いと診断方法。
doc_type: pattern
verification: partial
aliases: [Effect Mask, mask branch]
concepts: [mask-data, effect-mask, alpha, domain-of-definition]
patterns: [limit-effect-with-mask]
nodes: [Color Corrector, Blur, Ellipse Mask, Polygon Mask, Merge, Glow]
tasks: [mask, isolate-effect, color-correct, blur, debug]
prerequisites: [mask-data, image-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Maskで処理範囲を限定する

人物の顔だけをぼかす、空だけ色を変える、合成した前景を画面の一部にだけ表示する。こうした処理では、画像を加工するNodeと「加工をどこに適用するか」を指定するMask Nodeを分けて接続します。

Fusionの<Term id="mask">Mask</Term>は、基本的に白黒の単一チャンネルデータです。白は処理を適用する領域、黒は適用しない領域、灰色は途中の強さを表します。このデータを色補正やBlurなどの**青いEffect Mask入力**へ接続すると、元画像全体を書き換えるのではなく、指定した領域だけにそのNodeの処理結果を反映できます。

## 最小構成：空だけ色を変える

例えば、空と建物が写った映像で、空だけ青を強めたい場合です。

~~~text
MediaIn ───────────→ Color Corrector ─→ MediaOut
                            ↑［青：Effect Mask］
Polygon Mask ───────────────┘
~~~

1. **MediaInをColor Correctorへ接続する。** まずMaskをつながず、Color Correctorで青みや明るさをはっきり変え、画像全体へ補正がかかることを確認します。
2. **Polygon Maskで空を囲む。** Polygonは自由に点を置いて輪郭を作るMaskです。建物との境目に沿って形を閉じ、Mask Nodeを単独でViewerへ表示します。空が白、残したい建物が黒になるようにします。
3. **Polygonの出力をColor Correctorの青いEffect Mask入力へ接続する。** 色補正の設定を変えずに、空の範囲だけ補正されるか確認します。
4. **境目を調整する。** 建物との境界が不自然に見えるときは、PolygonのSoft EdgeなどでMaskの縁を調整します。Maskを大きくぼかしすぎると、建物にも補正がかかります。
5. **Maskを外して比較する。** Maskなしでは全画面、Maskありでは空だけが変わるなら、色補正と範囲指定の両方が機能しています。

ポイントは、Polygonが「青い空を生成する」のではないことです。Color Correctorが色を変え、Polygonがその結果を表示する範囲を決めています。[Color Corrector](../../nodes/color/color-corrector.md)と[Polygon Mask](../../nodes/masks/polygon-mask.md)の詳しい設定は各Node記事を参照してください。

## 白・黒・灰色は何を変えるのか

通常のEffect Maskでは、Maskが白い部分に加工後の結果を反映し、黒い部分には加工前の画像を残します。Soft Edgeで作った灰色の領域では、加工前と加工後が中間の割合で混ざります。

| Maskの値 | Color Correctorの例 | 見える結果 |
| --- | --- | --- |
| 白（1） | 彩度を下げる | 彩度を下げた画像を使う |
| 黒（0） | 彩度を下げる | 元画像の彩度を保つ |
| 灰色（例：0.5） | 彩度を下げる | 元画像と補正結果の中間になる |

この例は処理範囲を説明するためのものです。Color Corrector自体の補正量や他の入力条件は別に作用します。

また、**Effect Maskを使っただけで、元画像の<Term id="alpha">Alpha</Term>がPolygonの形に切り抜かれるとは限りません。** 色を変更する範囲と、前景が透ける範囲は別です。画像の透明部分を作りたい場合は[AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask.md)を参照してください。

## 実例：人物の顔だけをぼかす

Blurでも接続の考え方は同じです。

~~~text
MediaIn ────────→ Blur ─────────→ MediaOut
                    ↑［Effect Mask］
Ellipse Mask ───────┘
~~~

1. Blurを挿入し、Maskがない状態で画面全体がぼける強さに調整します。
2. Ellipse Maskを作り、Viewerで顔の大きさと位置に合わせます。
3. Ellipse MaskをBlurの青いEffect Mask入力へ接続します。
4. 境界が丸く浮く場合は、Ellipse MaskのSoft Edgeを広げ、ぼかし部分が周囲へ自然につながるようにします。
5. 顔が動くカットでは、Maskの位置や形を時間に合わせて動かします。特定フレームだけ合っていても、カット全体で顔を覆っているとは限りません。

**Maskは「どこにBlur結果を表示するか」を決めます。** Blurが参照する画素まで、その領域の内側だけに隔離する仕組みではありません。境界の外側の色がBlur結果へ混ざることがあります。

Ellipseは円形・楕円形に向き、Polygonは人物の輪郭や建物など不規則な範囲に向きます。[Blur](../../nodes/blur-filter/blur.md) / [Ellipse Mask](../../nodes/masks/ellipse-mask.md)で個別の操作を確認できます。

## Effect Maskは原則として「処理後」に適用される

DaVinci Resolve 21.1 Reference ManualのChapter 79では、Effect Maskは原則として**post-effect**の仕組みとして説明されています。処理Nodeがまず入力画像に効果を計算し、その後でMaskを使って「効果を適用しない部分へ元の画像を戻す」という考え方です。

例えばBlurの場合、次の2つは同じ処理ではありません。

- **BlurのEffect MaskへPolygonをつなぐ**：Blurの結果が見える領域を限定する。
- **Blurする前に元画像の一部を透明に切り抜く**：Blurが受け取る画像そのものを変える。

前者は通常の局所ぼかしに使います。後者は透明部分との境界でBlurの広がり方が変わり得ます。目的に応じて、Maskを接続する位置を選びます。

なお、Effect Maskは多くのNodeにありますが、**すべてのNodeで同じように使えるわけではありません。** 21.1 ManualではSaver、Time系、Resize、Scale、Cropなどを例外として挙げています。青い端子が見つからないときは、Node固有のReferenceを確認してください。

### Glowで光をMaskの外へ広げたいとき

Glowには、一般的な青い**Effect Mask**とは別に、発光元を指定する**Glow Mask**入力があります。

- **Effect Mask**：Glowを計算した後、表示する範囲を制限する。広がった光がMaskの境界で切れる場合があります。
- **Glow Mask（pre-mask）**：先に発光元の領域を選ぶ。その領域から生じた光をMaskの外へ広げられます。

ネオン文字だけを発光元にして、周りの壁まで光を広げたいなら、Glow Mask側を検討します。光を円の中だけに収めるならEffect Maskが適します。接続の詳細は[Glow](../../nodes/blur-filter/glow.md)を参照してください。

## 複数のMaskを組み合わせる

一つのMaskで足りなければ、Mask Node同士を接続します。例えば「楕円の中を補正するが、その一部だけは補正から除外する」構成です。

~~~text
MediaIn ──────────────→ Color Corrector ─→ MediaOut
                              ↑［Effect Mask］
Ellipse Mask → Polygon Mask ──┘
                 ［Paint Mode］
~~~

Ellipseが作った領域へPolygonを重ね、Polygonの**Paint Mode**で2つをどう組み合わせるか選びます。Subtractなら入力側のMaskから新しいMaskの領域を差し引く方法になります。Multiplyは両方の値を掛け合わせるので、重なった部分を残したい場合に使います。

Mask Node間の接続は、画像とMaskを合成するMergeとは別の操作です。Paint ModeはMaskデータ同士の計算を指定します。どちらのMaskが前段で、どちらが後段かによって結果が変わるため、接続後に**最終MaskをViewerへ表示して白黒を確認**します。

詳しいモードやInvertの扱いは[Maskの基本](../../learn/02-data/mask.md)および[Polygon Mask](../../nodes/masks/polygon-mask.md)を参照してください。

## MergeのMask入力にも応用できる

前景を背景へ重ねる<Term id="merge">Merge</Term>でも、青いEffect Maskでその合成が適用される範囲を制限できます。

~~~text
背景Image ───────→ Merge［Background］
前景Image ───────→ Merge［Foreground］ ─→ 出力
Ellipse Mask ────→ Merge［Effect Mask］
~~~

この接続は、**前景Image自体へ楕円形のAlphaを保存する操作ではありません。** そのMergeでの合成範囲を制限しています。ほかの合成へ使い回す前景素材に透明部分を作りたい場合は、前景側のAlphaを別途作成・編集します。具体的な手順は[Mergeの適用範囲をMaskで限定する](../../recipes/masking/limit-merge-with-mask.md)を参照してください。

## 効かないときの確認順

| 現象 | 先に確認すること |
| --- | --- |
| Maskをつないでも変化がない | Maskを外して、Color CorrectorやBlur本体が画像を変えるか確認する |
| 画面全体が変わる | 青いEffect Mask入力へ接続されているか。Maskの出力が全面白でないか確認する |
| 逆の範囲が変わる | MaskのInvert、最終Maskの白黒、複数MaskのPaint Modeを確認する |
| 何も変わらなくなった | Maskが全面黒になっていないか。形を描いたか、接続先を間違えていないか確認する |
| 境界がくっきり見える | Ellipse / PolygonのSoft EdgeとMaskの位置を確認する |
| GlowがMaskの縁で切れる | 発光元を選びたいのか、Glowの出力範囲を制限したいのかを分ける |
| 透明な切り抜きを作ったはずなのに透けない | Effect MaskとImage Alphaを混同していないか、処理前後のAlphaを確認する |
| 一部のNodeだけMask入力を使えない | そのNodeがEffect Maskに対応しているか、専用Mask入力が別にあるか調べる |

切り分ける順番は**加工Nodeを単独で確認 → Mask単体を白黒表示 → 接続後のRGBを確認 → 必要ならAlphaも比較**です。この順に調べると、「効果が効いていない」のか「Maskが間違っている」のかを区別できます。

## 関連ページ

- [マスク（Mask）](../../learn/02-data/mask.md)：白黒の単一チャンネルデータとしてのMask。
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data.md)：Nodeが受け渡すデータの種類。
- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask.md)：Mergeの入力を区別する。
- [Bitmap Mask](../../nodes/masks/bitmap-mask.md)：既存画像の色やAlphaなどからMaskを生成する。
- [AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask.md)：透明にならない・輪郭がおかしい問題の切り分け。

## 出典と確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**（September 2026）、Fusion Fundamentals Chapter 79、pp.1725–1730：Polygon / EllipseなどのMask、白黒データ、複数MaskとPaint Mode。
- 同Chapter 79、pp.1731–1732：Effect Maskのpost-effect適用、対応しないNodeの例、pre-maskとの違い、Glowの発光元指定。
- 同Chapter 77、pp.1665–1669：Image AlphaとMaskのデータの違い。
- 個別Nodeの動作・入力端子は21.1 Manualと既存Node Referenceを参照しています。記載したGraphは基本的な接続例であり、Resolve 21.1実機で全手順を通した検証ではありません。Node固有の初期値やEdition差は断定していないため、`verification: partial`を維持しています。
