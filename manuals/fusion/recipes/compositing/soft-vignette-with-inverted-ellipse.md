---
title: Ellipse Maskで柔らかいビネットを作る
description: 画面中央の明るさを保ち、周辺だけを段階的に暗くする。Background、Merge、反転Ellipse Maskの接続と調整、失敗時の切り分けを示す。
doc_type: recipe
verification: partial
aliases: [ビネット, 周辺減光, vignette, soft vignette, inverted ellipse]
concepts: [mask-data, effect-mask, foreground-background]
patterns: [limit-effect-with-mask]
nodes: [Background, Merge, Ellipse Mask]
tasks: [vignette, composite, darken-edges]
prerequisites: [mask-data, foreground-background]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-27"
---

# Ellipse Maskで柔らかいビネットを作る

## 作るもの

映像の中央は元の明るさに保ち、四隅へ近づくほど暗くなる**ビネット（周辺減光）**を作ります。カメラのレンズによる自然な周辺減光を再現すると断定するものではなく、FusionのMaskを使って画面周辺へ暗い色を重ねる方法です。

今回は元映像を変更せず、**黒いBackgroundを、反転したEllipse Maskの範囲だけMergeで合成する**構成にします。Ellipse Maskの中央は黒（合成しない）、画面外周は白（合成する）になり、その間は灰色（部分的に合成する）です。

## 必要なものと入力条件

- 1920×1080、正方形ピクセルの映像または静止画1枚。明るい中央と四隅を含む画像だと変化が分かりやすくなります。
- FusionページのMediaIn（単独CompositionならLoaderでも可）、Background、Ellipse Mask、Merge、MediaOut。
- フレーム内の位置・明るさを確認できるViewer。最初は位置やMaskをアニメーションさせません。

サンプルの値は**1920×1080の比較用設定**です。素材の解像度・縦横比が違う場合は、同じWidthやHeightでも円の見え方が変わるため、Viewerで形を合わせてください。

## 最小構成

~~~text
MediaIn1（元の映像）──────────→ Merge1［Background／オレンジ］
Background1（黒、Alpha 1） ──→ Merge1［Foreground／緑］ ──→ MediaOut1
Ellipse1（反転マスク） ───────→ Merge1［Effect Mask／青］
~~~

- Mergeの**Background入力**には元映像を入れます。これが出力フレームの解像度の基準です。
- **Foreground入力**には全面黒の画像を入れます。黒い画像の透明度（Alpha）は1にします。
- 青い**Effect Mask入力**は、黒いForegroundをどこへ合成するかだけを制御します。元映像を楕円形に切り抜く入力ではありません。

## 手順

### 1. まず黒を全面に重ねて合成を確認する

1. MediaIn1をMerge1のオレンジ色のBackground入力につなぎ、Merge1の出力をMediaOut1へ送ります。
2. Background1を追加します。ColorタブでTypeを**Solid Color**、RGBを**0 / 0 / 0**、Alphaを**1**にして、Merge1の緑色のForeground入力へ接続します。
3. Merge1のApply Modeを**Normal**、Operatorを**Over**、Blendを**1**にします。まだEllipse1は接続しません。
4. Merge1をViewerへ表示します。**画面全体が黒になる**のがこの段階の確認結果です。元映像がまだ見えるなら、ForegroundのAlpha、Mergeの入力先、Apply Mode、Blendを確認します。

全画面を黒くできたら、次の操作ではMergeのRGBや接続順を変えません。

### 2. 楕円を反転して周辺だけを黒くする

1. Ellipse Mask（Ellipse1）を追加して、Merge1の**青いEffect Mask入力**につなぎます。
2. Ellipse1のSolidを有効にし、Centerを**X 0.5 / Y 0.5**、Widthを**0.75**、Heightを**0.75**、Angleを**0**、Levelを**1**にします。まずSoft Edgeを**0**にして形を確かめます。
3. **Invertをオフ**にしてMerge1を表示します。楕円の**内側が黒く、外側は元映像**になることを確認します。
4. Ellipse1の**Invertチェックボックスをオン**にします。今度は**中央に元映像が残り、外周が黒く**なれば、反転が機能しています。
5. Ellipse1だけを別のViewerへ表示し、中央が黒、外周が白であることも確認します。Invertチェックボックスは、複数のMaskを接続するときの**Paint ModeのInvert**とは別の設定です。

この段階で外周が黒くならない場合、Soft Edgeを増やす前に、Ellipseの白黒と青い入力への接続を直します。

### 3. 境界を柔らかくし、暗さを弱める

1. Ellipse1のSoft Edgeを**0.15**から試し、中央と外周の切り替わりが緩やかになるよう調整します。数値は見た目を比較するための開始値であり、どの素材でも自然になる推奨値ではありません。
2. Merge1のBlendを**1 → 0.35**に変更します。暗い外周に元映像が戻り、中央は引き続き元映像に近い状態になるか確認します。
3. MediaIn1とMerge1を左右のViewerに割り当て、同じフレーム、同じ表示倍率で中央・左右の辺・四隅を比較します。
4. Merge1の出力解像度がMediaIn1と同じ**1920×1080**であることを確認します。最終的にMediaOut1へ接続されているのがMerge1であることも確認します。

**Normal / Over、全面不透明の黒いForeground**という条件での計算例です。Maskが白でBlendが0.35なら、元映像のRGB成分は合成計算上おおむね**65%**残ります。Maskが黒なら元映像のまま、Maskが灰色の0.5付近なら元映像はおおむね**82.5%**残る計算です。この数値は合成比率の説明であり、画面上の見かけの明るさや書き出し後の信号値を保証しません。

| 場所 | 反転EllipseのMask | Mergeで期待する結果 |
| --- | --- | --- |
| 中央 | 黒に近い | 元映像の明るさを保つ |
| 楕円の境界 | 灰色 | 元映像から暗い外周へ徐々に変わる |
| 四隅 | 白に近い | 黒の合成量が最大になる |

<!-- capture:S157 -->

## 実機例：反転とぼかしを比較する

青いBackgroundと白い文字を重ねた生成画像を入力にし、黒いBackgroundをMergeのForegroundへ接続しました。Mask未接続では全面が黒くなります。Ellipseを接続した直後はInvertオフ・Soft Edge 0で中央が黒く、Invertをオンにすると中央が残り外側が黒くなりました。

次にSoft Edgeを0.15にして境界をぼかし、MergeのBlendを1.0から0.35へ下げました。左の入力と右の結果は同じ1920×1080、frame 0です。Ellipse単独のViewerでは中央が黒く、外側が白いMaskを確認できます。設定値と接続はSDKで設定・読み戻し、画面はResolveのViewerとInspectorで確認しました。[接続と設定の記録](/img/fusion/captures/S157/readback.json)も参照できます。

これはWindowsのResolve Studio 21.1.0.14と生成画像を使った静止フレームの例です。実写映像、HDRや書き出し後の数値は検証していません。

[![生成した入力と黒いBackground、反転EllipseをMergeしMediaOutへ渡す接続](/img/fusion/captures/S157/graph.png)](/img/fusion/captures/S157/graph.png)

SourceMergeが比較用の入力、Blackが黒い前景、Ellipse1がVignetteのEffect Maskです。

[![左に生成した入力、右にMask未接続で全面が黒くなったMerge出力](/img/fusion/captures/S157/no-mask.png)](/img/fusion/captures/S157/no-mask.png)

Effect Maskを接続せず、黒のForegroundとBlend 1.0で全面が黒くなることを確認します。

[![InvertオフのEllipseで画面中央が黒くなった比較](/img/fusion/captures/S157/invert-off.png)](/img/fusion/captures/S157/invert-off.png)

Ellipseを接続しInvertをオフにすると、楕円の内側が黒くなります。

[![InvertオンのEllipseで中央の入力を残し外側を黒くした比較](/img/fusion/captures/S157/invert-on.png)](/img/fusion/captures/S157/invert-on.png)

Invertをオンにすると、中央の入力を残して外側を黒くできます。Soft Edgeは0です。

[![EllipseのInvertオン、Soft Edge 0.15、WidthとHeight 0.75のInspector](/img/fusion/captures/S157/ellipse-controls.png)](/img/fusion/captures/S157/ellipse-controls.png)

Invertをオンにしたまま、Soft Edgeを0.15にします。WidthとHeightは0.75です。

[![Soft Edge 0.15で入力と暗い外周の境界が緩やかになった結果](/img/fusion/captures/S157/soft-edge.png)](/img/fusion/captures/S157/soft-edge.png)

Soft Edge 0.15、Blend 1.0では、中央から暗い外周へ緩やかに変化します。

[![MergeのNormal、Over、Blend 0.35を示すInspector](/img/fusion/captures/S157/blend-controls.png)](/img/fusion/captures/S157/blend-controls.png)

MergeのApply ModeはNormal、OperatorはOverのまま、Blendを0.35に下げます。

[![Blend 0.35で外周の暗さが弱まった合成結果](/img/fusion/captures/S157/blend-output.png)](/img/fusion/captures/S157/blend-output.png)

Blend 0.35では外周に元の色が戻り、暗さが弱まります。

[![左に中央が黒く周辺が白い反転Ellipse、右にBlend 0.35の合成結果](/img/fusion/captures/S157/mask-output.png)](/img/fusion/captures/S157/mask-output.png)

左は反転EllipseのMask、右はそのMaskで黒を重ねた出力です。

[再現用Graph](/img/fusion/captures/S157/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S157/capture.json)

<!-- /capture:S157 -->

## なぜこの構成で動くか

MergeはオレンジのBackgroundへ緑のForegroundを重ねます。青いEffect Maskの白い場所では合成後の画像、黒い場所では元のBackgroundを表示するため、**反転Ellipseの白い外周だけ**へ黒い画像を重ねられます。Soft Edgeで作られた灰色は、その境界を段階的に変化させます。

この例では**EllipseのInvertが「場所」**、**Soft Edgeが「境目」**、**MergeのBlendが「暗さの総量」**を主に調整します。中央が暗いのか、境界が硬いのか、全体の減光が強いのかに応じて、まず対応する設定を1つだけ変更すると比較しやすくなります。

青いEffect Maskで制御するのは**このMergeの合成範囲**です。元映像のAlphaを書き換える手順ではありません。詳細は[Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)と[Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)を参照してください。

## バリエーション

### 暗色を黒以外にする

Background1のRGBを暗い青などへ変えると、外周を単純に暗くする代わりに色を重ねられます。例えばRGB **0.01 / 0.02 / 0.04**を出発点とし、実際の映像とプロジェクトの色管理に合わせて調整します。ForegroundのAlphaは1のままにし、まずBlendだけで合成量を比較します。

### 外周を左右非対称にする

Ellipse1のCenterを動かすと、暗くなる範囲の中心も動きます。WidthとHeightは別々に調整できます。左を暗くしたいときも、Center・Width・Height・Angleを同時に変えず、1つずつ結果を確認します。別フレームで中心を動かす場合はKeyframeを追加できますが、このページでは動く人物へ追従する実機例までは検証していません。

### 丸い切り抜き画像が欲しい場合

ビネットは**画面周辺の暗さを変える**効果です。背景を透過させた楕円形の画像を作る目的なら、MergeのEffect Maskではなく、[BackgroundにMaskを接続する構成](../../nodes/generators/background)やAlphaの処理を使います。[Mergeの適用範囲をMaskで限定する](../masking/limit-merge-with-mask)でも違いを説明しています。

## うまくいかないときの確認

| 症状 | 最初に確認すること | 修正・再確認 |
| --- | --- | --- |
| 画面全体が黒い | Ellipseの未接続、MergeのBlend=1、Maskが全面白 | Ellipse単独のViewerで中央が黒・外周が白か確かめる |
| 中央だけ暗い | Ellipse1のInvertがオフ | Invertをオンにして内外を比較 |
| 何も変わらない | MergeのBlendが0、MaskのLevelが0、ForegroundのAlphaが0 | 一度Blend=1、Level=1、Alpha=1へ戻し、結果を確認 |
| 外周が急に暗くなる | Soft Edgeが0付近 | Soft Edgeだけ増やして境界を比較 |
| 画面の外周が左右で不均一 | EllipseのCenter、Width、Height、Angle、元の画面比率 | 中央と大きさを別々に戻し、Maskを単独表示 |
| 暗くなる位置を変えると画像の端が欠ける | Mergeへ接続した映像と前景の向き、出力寸法 | 元映像がオレンジのBackground入力にあるか確認 |
| 透明な素材になったと思ったがAlphaが変わらない | MergeのEffect Maskと画像Alphaの混同 | 出力AlphaもViewerで確認。切り抜きが目的なら別構成にする |
| MediaOutにはビネットが出ない | MediaOutへつながる線 | Merge1の出力をMediaOutへ接続し、同じフレームで確認 |

問題の切り分けは、**MediaIn → 黒いBackground単独 → Ellipseの白黒 → MaskなしMerge → MaskありMerge → MediaOut**の順に表示して行います。設定を一括初期化する必要はありません。

## 関連ページ

- [Ellipse Mask](../../nodes/masks/ellipse-mask)：Invert、Soft Edge、Width／Heightの各設定。
- [Background](../../nodes/generators/background)：Solid ColorとAlpha、生成画像の解像度。
- [Merge](../../nodes/compositing/merge)：3つの入力、Normal / Over、Blendの役割。
- [Maskの基本](../../learn/02-data/mask)：Maskと2D Imageの違い。
- [Mergeの適用範囲をMaskで限定する](../masking/limit-merge-with-mask)：反転しない場合やAlphaとの比較。

## 出典・バージョンと未検証範囲

一次資料：Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月）。

- **Chapter 94、pp.2211–2212、2217：** MergeのBackground / Foreground / Effect Mask、Blendの役割。
- **Chapter 108、pp.2472–2475：** Ellipse MaskのCenter、Width、Height、Invert、Soft Edge、LevelとPaint Modeの区別。
- **Chapter 103、pp.2356–2359：** BackgroundのSolid ColorとAlpha。GeneratorのImageタブは同章pp.2400–2402。
- **Chapter 79、pp.1730–1732：** Maskを組み合わせる仕組みとEffect Maskの適用範囲。

上記の章・ページとNode固有の機能は、既存の21.1公式Manual調査に基づく本サイトのReferenceにも照合しました。WindowsのResolve Studio 21.1.0.14では、生成した1920×1080画像の静止フレームを使い、Invertオン／オフ、Soft Edge=0.15、Blend=0.35の表示を確認しました。実写映像、Free／Studioの差、HDR、非正方形ピクセル、時間変化、書き出しでの数値一致は未検証なので、verificationはpartialです。
