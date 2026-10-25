---
title: Fusionで解像度が合わない
description: ViewerとEditの寸法が一致しない場合に、素材解像度・TransformとResize・Mergeの背景・タイムライン設定を分けて調べる。
doc_type: diagnostic
verification: partial
aliases: [Resolutionが合わない, 解像度が合わない, wrong resolution, size mismatch, 4K素材がHDになる]
concepts: [resolution, aspect-ratio, domain-of-definition]
nodes: [MediaIn, MediaOut, Transform, Resize, Scale, Crop, Merge]
tasks: [debug, resize, format]
symptoms: [resolution-mismatch, wrong-size]
prerequisites: [resolution]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-25"
---

# Fusionで解像度が合わない

FusionのViewerで画像が小さく見える、出力が意図せず960×540になる、Fusionでは4KなのにEditではHDに見える。これらは同じ「サイズが合わない」症状でも、調べる場所が異なります。**画像のピクセル寸法**と**フレーム内での見た目の倍率**、**タイムラインへの収まり方**を別々に確認します。

## まず確認すること

1. **どこで違うか。** MediaIn、問題のNode直後、MediaOutを順にViewerへ表示し、Viewer右上の幅×高さ（Width × Height）を控えます。Viewerの拡大率（表示倍率）とは区別します。
2. **どんなクリップか。** タイムラインの通常クリップか、複数クリップをまとめたFusion Clipかを確認します。両者ではFusionに渡る解像度の基準が異なります。
3. **解像度を変更するNodeはあるか。** Resize、Scale、Crop、Letterboxと、Mergeのオレンジ色のBackground入力を確認します。TransformのSizeだけなら通常、出力画像のピクセル寸法は変わりません。
4. **Editだけで見た目が違うか。** FusionのMediaOutとEditのタイムラインを比較し、Project SettingsのImage ScalingおよびFusionのDownscale設定を確認します。
5. **縦横比だけおかしいか。** Width × Heightは同じでも、Pixel Aspect Ratio（ピクセルの縦横比）やTransformのAspectによって形が違って見える場合があります。

この順で、最初に**幅×高さが変わったNode**を特定します。画面内の被写体が小さくなっただけなら、解像度変更とは区別してください。

## 原因を切り分ける：1920×1080の最小比較

白い文字・細線・外枠がある1920×1080の静止画を用意し、同じ入力から3つの枝を作ります。入力にはMediaInまたはLoaderを使えます。各枝を**別々にViewerへ出し、右上の寸法表示**を確認してください。

    1920×1080 Image
      ├─ Transform1（Size = 0.5）────────→ A
      ├─ Scale1（Lock X/Y = on, Size = 0.5）→ B
      └─ Resize1（Auto Resolution = off,
                    Width = 960, Height = 540）→ C

| 比較する出力 | 期待する幅×高さ | Viewerで確かめる違い |
| --- | --- | --- |
| A：Transform1 | **1920×1080** | 同じフレームの中で内容だけ半分の大きさになる |
| B：Scale1 | **960×540** | Imageのピクセル寸法そのものが半分になる |
| C：Resize1 | **960×540** | 指定したWidth・Heightへ再サンプリングされる |

Resize1では元の16:9を保つため、必要ならKeep Frame Aspectを有効にします。この例の数値は、どのNodeが物理解像度を変えるか比較するための設定です。Scale・Resize後の表示倍率が自動調整されると、Viewer上ではA・B・Cが似た大きさに見える場合があります。

### 21.1実機の比較例

<!-- capture-reuse:R51 -->

以下は同じ1920×1080チャートからTransform、Scale、Resizeへ分岐し、上記の寸法を比較した**正常動作の参考例**です。

[![S24のNode Editor。1つのチャートからTransform、Scale、Resizeへ分岐](/img/fusion/captures/S24/graph.png)](/img/fusion/captures/S24/graph.png)

[![S24の左右Viewer。Transformは1920×1080、Resizeは960×540](/img/fusion/captures/S24/compare.png)](/img/fusion/captures/S24/compare.png)

[![S24のScaleとResizeの出力寸法を比較](/img/fusion/captures/S24/scale-compare.png)](/img/fusion/captures/S24/scale-compare.png)

撮影条件はResolve Studio 21.1.0.14／Windows、Viewer表示倍率40%。Pixel Aspect、Fusion Clipやタイムライン設定を変更した再現例ではありません。[撮影条件・使用素材・確認範囲](/img/fusion/captures/S24/capture.json)も参照してください。

## 症状ごとの原因と修正

| 観察した症状 | 調べる場所 | 最初に試す修正 |
| --- | --- | --- |
| Transformで被写体を半分にしたのに幅×高さが変わらない | TransformのSize | **正常な動作**。出力解像度を変更したい場合だけResizeまたはScaleを使う |
| 途中から960×540などに変わる | Resize・Scale・Crop・Letterbox | 最初に寸法が変わったNodeを見つけ、その設定と必要性を確認する |
| MergeのForegroundだけ高解像度なのに出力が小さい | MergeのBackground入力 | **目標解像度を持つImage**をBackgroundへつなぐ |
| 4Kの通常クリップをHDタイムラインで開いたらFusionは4K | MediaInの解像度 | 原則として**正常な動作**。タイムラインとFusionの処理解像度を混同しない |
| Fusion Clipにまとめると処理解像度が変わる | 通常クリップとFusion Clipの違い | Fusion Clipはタイムライン解像度が基準になると理解した上で比較する |
| Fusionは4KだがEditではHDに収まる | EditのImage Scaling | MediaOutの寸法とタイムラインの表示・書き出し寸法を別に確認する |
| 幅×高さは合うが画像が横に伸びる | Pixel Aspect、Transform Aspect | Clip AttributesとTimeline FormatのPARを先に点検する |

### Mergeで小さいフレームになる場合

Mergeの**Background（オレンジ入力）が出力解像度を決めます**。Foreground（緑入力）の解像度ではありません。二つの入力を入れ替えると、合成結果の幅×高さが変わる場合があります。

    Background（1920×1080）──→ Merge1［Background / 橙］
    Foreground（960×540） ────→ Merge1［Foreground / 緑］
                                     ↓
                               1920×1080

一度、1920×1080・Alpha = 0のBackgroundを作り、Mergeのオレンジ入力につないでください。Foregroundを960×540のImageへ変更しても、**Mergeの出力フレームは1920×1080**のままです。背景を透明にしても、この出力寸法の基準は変わりません。

反対に、960×540のImageをBackgroundへ入れると、Mergeの出力も960×540になります。Foreground側にフレーム外のピクセルが残っていても、現在のViewerに表示される枠は小さくなります。枠外へ移動した画素がすべて失われたとは限らず、Cropによる切り捨てとも区別が必要です。

### 通常クリップとFusion Clip、Editへの受け渡し

たとえば3840×2160の素材を1920×1080のタイムラインに置いた場合、通常のタイムラインクリップをFusionで開くと、原則として**ソースの3840×2160**を基準に処理します。一方、Fusion Clipでは**タイムラインの1920×1080**が基準になります。

ただしProject Settings > Fusionの**Downscale Timeline Resolution for Timeline Clip Compositions**を使うと、通常クリップをタイムライン解像度へ縮小して処理できます。この設定の有無も確認してください。

Fusionが最終的にCut/Editへ渡す有効なソース解像度は、最後の出力Nodeの幅×高さに依存します。EditでHDに表示されることだけを根拠に、Fusion内部もHDで処理されたとは判断できません。EditのImage Scalingでは、タイムラインへのFitなど別の配置処理が行われます。

### 縦横比だけが合わない場合

1920×1080のImageでも、非正方形ピクセルの**Pixel Aspect Ratio（PAR）**によって表示上の形が変わります。まず素材のClip AttributesとProject SettingsのTimeline Formatを確認します。

- **ResizeのKeep Frame Aspect：** 画像の幅・高さを変更するとき、元のフレーム比率を保つ設定です。
- **Resize・ScaleのChange Pixel Aspect：** ピクセルそのものの表示比率に関わる設定です。Width × Heightの変更とは別です。
- **TransformのAspect：** フレーム内で画像を横・縦に伸ばして見せる操作で、Width × Heightを変更する機能ではありません。

画面の横伸びを直すために三つを同時に操作せず、まず元データのPARが正しいかを調べます。

## 修正できたかの判定

1. **MediaIn：** 入口で期待する幅×高さと、通常クリップ／Fusion Clipの基準が一致している。
2. **中間Node：** 最初に解像度が変わるNodeが特定でき、Resize・Scale・Crop・Merge Backgroundのどれによる変化か説明できる。
3. **MediaOut：** 最終的なImageの幅×高さが、意図した有効ソース解像度になっている。
4. **Edit：** タイムライン上の見え方と書き出し解像度を、FusionのMediaOutとは分けて確認できる。

意図しない低解像度化を直したい場合は、問題のResizeやScaleをいったん外し、**元の高解像度Imageを保持したまま**Transformで配置を調整します。すでにCropで取り除いた画素や、Resizeで失われた細部が、後段のTransformだけで完全に復元されるわけではありません。

Viewerの表示倍率と実寸が混同されている場合、フレーム外の端が欠ける場合は、[Transform後にImageの端が消える](./image-cut-off-after-transform)も確認してください。

## なぜ起きるか

FusionのImageには、**Width × Heightというピクセル寸法**と、フレーム内の配置・Scaleが別々にあります。Transformは主に後者を変え、ResizeとScaleは前者を変更します。MergeはForegroundではなくBackgroundを基準にフレーム寸法を決めます。詳細な説明は[解像度 / アスペクト比](../../learn/03-space/resolution-aspect)を参照してください。

有効領域（DoD）も解像度とは別です。黒や透明で見えない部分と、Imageに含まれる有効データ範囲は同一ではありません。[有効領域（Domain of Definition）](../../learn/03-space/domain-of-definition)で確認できます。

## 関連Node

- [Transform](../../nodes/transform/transform)：出力解像度を変えず、フレーム内の位置や大きさを調整
- [Resize](../../nodes/transform/resize)：WidthとHeightを指定して解像度を変更
- [Scale](../../nodes/transform/scale)：入力の解像度を倍率で変更
- [Crop](../../nodes/transform/crop)：ピクセル範囲を切り出してフレーム寸法を変更
- [Merge](../../nodes/compositing/merge)：Background入力の解像度が合成フレームを決める

## バージョン・出典と未検証範囲

一次資料：Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://www.blackmagicdesign.com/jp/support)』（2026年9月公開、以下はManual本文のページ番号）。

- **Chapter 11、pp.289–290：** 通常クリップとFusion Clipの解像度、Cut/Editへの受け渡し、TransformとResizeの違い。
- **Chapter 75、pp.1643–1644：** Fusion内の解像度管理、Merge Background、Downscale Timeline Resolution for Timeline Clip Compositions、Image Scalingとの関係。
- **Chapter 94、pp.2211–2212：** Mergeの入力の意味と出力解像度。
- **Chapter 120、pp.2873–2879、2880–2883：** Resize、Scale、Transformの入力・Control・解像度への影響、Reference Size。
- **Chapter 11、p.287：** Pixel Aspect Ratio、Timeline Format、Clip Attributesの関係。

最小比較の設定と症状別の切り分け順はManualを根拠に構成した**診断手順**です。S24はTransform／Scale／Resizeの正常な寸法差を示す実機例であり、4K素材のFusion Clip化、Project SettingsのDownscale切替、非正方形Pixel Aspect、Edit出力、Merge入力の入れ替えを現行21.1実機で再現・検証した記録ではありません。これらのOS差・Edition差・素材依存条件も未確認のため、検証状態はpartialとしています。
