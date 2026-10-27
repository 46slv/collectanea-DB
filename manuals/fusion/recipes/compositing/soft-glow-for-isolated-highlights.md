---
title: Soft Glowで街灯の光だけを柔らかくにじませる
description: 明るい街灯と看板が同居する映像で、Soft GlowのThreshold・Gain・Glow Sizeを切り分け、Glow Maskで街灯だけを発光元にする。
doc_type: recipe
verification: partial
aliases: [Soft Glow, ソフトグロー, ハイライトのにじみ, glow mask, streetlight bloom]
concepts: [image-data, mask-data, effect-mask, domain-of-definition]
patterns: [limit-effect-with-mask]
nodes: [Soft Glow, Ellipse Mask]
tasks: [soft-glow, glow, isolate-highlight, bloom]
prerequisites: [mask-data, image-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-28"
---

# Soft Glowで街灯の光だけを柔らかくにじませる

## 作るもの

夜景の街灯から周囲へ柔らかい光を広げ、近くにある明るい看板は必要以上ににじませない映像を作ります。**Soft Glow**で明るい画素を発光元にし、**Glow Mask**で発光元の場所を限定する構成です。光の広がりまで楕円の内側へ切り取らないことが目標です。

このページは、実写に元から写っている明部のにじみを調整する手順です。存在しない街灯や光源を生成するものではありません。

## 必要なものと入力条件

- 1920×1080、正方形ピクセルの動画または静止画。例として、画面右寄りに明るい街灯、左寄りに明るい看板があり、周囲は比較的暗いフレームを使います。
- FusionページのMediaIn、Soft Glow、MediaOut。Glow Maskの比較ではEllipse Maskを1つ追加します。
- 街灯と看板が同時に見える同一フレーム。Viewerは前後を同じ倍率で比較します。

以下の値は**操作を比較する出発点**です。素材の輝度、色管理、HDR値、画面寸法により効果の出方が変わるため、すべての夜景で同じ見た目になる値ではありません。

## 最小構成

~~~text
MediaIn1（夜景） ──→ SoftGlow1 ──→ MediaOut1
                        ↑ 白：Glow Mask
                  Ellipse1（街灯を囲む）
~~~

Soft Glowの**オレンジ色のInput**は2D画像を受け取り、出力も2D画像です。**白いGlow Mask**は処理前に発光元を絞り、青い**Effect Mask**は処理後の結果の適用範囲を絞ります。似た名前でも結果は異なります。

## 手順

### 1. マスクなしで明部のにじみを確認する

1. MediaIn1をSoftGlow1のオレンジ色のInputへ接続し、SoftGlow1の出力をMediaOut1へつなぎます。まだMaskは接続しません。
2. SoftGlow1のControlsで**Threshold = 0.6、Gain = 1、Glow Size = 20、Blend = 1**を比較用の開始値にします。Lock X/Yはオンのまま、Clipping ModeはまずFrameを選びます。
3. FilterはGaussian系の項目を選びます。21.1 Manualでは**Gaussian**と記載されていますが、既存のResolve Studio 21.1実機記録S67には**Fast Gaussian**が表示されています。現在のInspectorにある名称を優先し、選んだ方式を控えてください。
4. SoftGlow1の入力と出力を左右のViewerに表示します。街灯の周囲だけでなく、看板など別の明部もにじむかを観察します。

Glow Sizeを増やすと光の**広がる範囲**が大きくなり、Gainを増やすと**光の明るさ**が強くなります。両方を同時に動かすと変化を切り分けにくいため、最初は固定します。

### 2. Thresholdで発光元の明るさを選ぶ

1. Gain = 1、Glow Size = 20、Blend = 1を保ち、Thresholdを**0.6 → 0.9**へ変更します。
2. 街灯と看板のどちらが発光元として残るか比較します。Thresholdを上げるほど、より明るい画素だけが発光処理の対象になります。
3. 変化が見えにくいときはThresholdを**0.6**へ戻し、Glow Sizeだけを変えて効果が有効か確認します。暗い素材では、元画像に十分な明部があるかも確認してください。

**Thresholdだけで「街灯は光らせ、同じ明るさの看板は光らせない」という位置の選択はできません。** 画面内のどこを発光元にするかは次のGlow Maskで指定します。

### 3. Glow Maskで街灯だけを選ぶ

1. SoftGlow1のThresholdを0.6、Gainを1、Glow Sizeを20、Blendを1へ戻します。
2. Ellipse1を追加し、**SoftGlow1の白いGlow Mask入力**につなぎます。青いEffect Mask入力ではありません。
3. Ellipse1でSolidをオン、Invertをオフ、Levelを1にします。開始例として**Center X = 0.65 / Y = 0.45、Width = 0.30、Height = 0.35、Soft Edge = 0.08**とし、実際の街灯の明部を白い楕円が含むようViewerで調整します。
4. Ellipse1を単独でViewerへ表示し、街灯が白い領域内、看板が黒い領域内に入ることを確認します。Soft GlowのRGB値を変える前に、この白黒を確定させます。
5. SoftGlow1の出力へ戻し、**街灯を発光元にしたにじみが楕円の境界より外側まで伸びるか**を比較します。Maskの外へ光が広がるのは、Glow Maskが処理前の発光元を限定するためです。

このCenterとWidth / Heightは右寄りの街灯を想定した**配置例**です。素材が異なる場合、同じ座標を使う理由はありません。

### 4. Effect Maskとの違いを1回だけ比較する

1. Soft Glowの設定値とEllipseの形を変更せず、Ellipse1の接続だけを**白いGlow Maskから青いEffect Maskへ差し替えます**。
2. 出力を比較します。Effect Maskは処理後に適用範囲を制限するため、光のにじみも楕円の外側で切れることがあります。
3. 元の目的が「街灯を発光元にして、外へ光を広げる」ことなら、Ellipse1を**白いGlow Mask**へ戻します。
4. 仕上げにBlendを**1 → 0.5**へ下げ、入力画像の質感がどれほど戻るかを確認します。Blendは発光範囲の選択ではなく、処理後と元画像の混合量を変えます。

| 比較状態 | 発光元の選ばれ方 | 確認する結果 |
| --- | --- | --- |
| Maskなし | 街灯・看板など条件を満たす明部 | 両方から光がにじむ可能性 |
| 白いGlow Maskあり | 楕円内の明部 | 街灯由来の光が楕円外へ広がれる |
| 青いEffect Maskあり | 処理後の表示領域を楕円へ制限 | 楕円の境界で光が切れる可能性 |

この表はManualで確認した処理順から予測できる結果です。ここに指定した夜景素材を使った21.1実機比較を完了したという意味ではありません。

## なぜこの構成で動くか

Soft Glowは明るい画素から柔らかい発光を作って元画像に重ねます。**Thresholdは発光させる画素の明るさ、Gainは発光の強さ、Glow Sizeは広がり、Blendは元画像へ戻す割合**を主に調整します。

街灯と看板が同じくらい明るければ、Thresholdだけでは区別できません。Glow Maskは処理**前**の発光元を選ぶため、看板由来の光を除きながら、街灯のにじみはMaskの外へ広げられます。一方で青いEffect Maskは処理**後**の適用範囲を指定します。

一般的なMaskの使い方は[Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)、2種類のMask入力の正確な役割は[Soft Glow](../../nodes/blur-filter/soft-glow)を参照してください。

## バリエーション

**より広い柔らかな光：** Glow Sizeを先に大きくし、光が強すぎればGainまたはBlendを下げます。FilterがMulti-boxの場合だけNum Passesが使えます。処理が重い場合はPass数とSizeを別々に比較します。

**光の色を調整：** Soft GlowのColor Scale（RGBA）で発光の色成分を調整できます。元の街灯が白色なのか暖色なのかに応じて比較します。Color Scaleは元画像全体のホワイトバランスを調整する機能ではありません。

**Glowではなく範囲内だけを光らせる：** 光を楕円の外へ一切出したくない表現なら、青いEffect Maskの方が目的に合う場合があります。

## うまくいかないときの確認

| 症状 | 確認する順序 | 修正・再確認 |
| --- | --- | --- |
| 光がほとんど出ない | Maskを外す → 明部の有無 → Threshold → Gain → Blend | Thresholdを下げ、GainとBlendを戻して全体に変化が出るか試す |
| 看板まで光る | Ellipseの白黒、Glow Mask接続、街灯と看板の位置 | 看板が黒い領域になるよう形を調整し、**白い端子**へ接続する |
| 楕円の輪郭で光が切れる | 白いGlow Maskか、青いEffect Maskか | 発光元だけを限定したいならGlow Maskへ戻す |
| 全体が白っぽい | Maskなしの状態、Threshold、Gain、Blend | Thresholdを上げるかGain / Blendを下げ、発光元を再選択する |
| フレームの端で光が途切れる | 入力画像の有効領域（DoD）、Glow Size、Clipping Mode | FrameとDomainの違いを比較し、端が必ず直るとは仮定しない |
| Soft Glowを通しても変わらない | MediaOutへの接続、Blend、RGBの処理チャンネル | SoftGlow1自体をViewerに出し、Soft Glow単体から確認する |

端の扱いは[Domain of Definition](../../learn/03-space/domain-of-definition)も参照してください。色やAlphaが不自然な場合は、Soft GlowのColor Channels（RGBA）と、素材のAlpha状態を確認します。

## 関連ページ

- [Soft Glow](../../nodes/blur-filter/soft-glow)：入力端子、各Control、既存の21.1実機チャート比較。
- [Ellipse Mask](../../nodes/masks/ellipse-mask)：白黒の範囲、Soft Edge、Center、Invert。
- [Glow](../../nodes/blur-filter/glow)：発光の別方式とApply Mode。
- [Maskの基本](../../learn/02-data/mask)：Maskが表すデータ。
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)：処理前と処理後のMaskの違い。

## 出典・バージョンと未検証範囲

- Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月）、**Chapter 92、pp.2121–2124**：Soft Glowの3入力、Glow MaskとEffect Mask、Threshold、Gain、Glow Size、Blend、Filter、Clipping Mode、Color Scale。
- 同Manual、**Chapter 108、pp.2472–2475**：Ellipse MaskのCenter、Width / Height、Soft Edge、Invertなど。
- 同Manual、**Chapter 79、pp.1731–1732**：Effect Maskの処理後適用と処理前Maskの違い。
- [Soft Glowの既存実機記録](../../nodes/blur-filter/soft-glow)：Resolve Studio **21.1.0.14 / Windows**、固定チャートS67でThreshold 0.6 / 0.9、Gain 1、Glow Size 20、Blend 0 / 1を比較済み。ただし街灯・看板の素材、Glow MaskとEffect Maskの差し替え、Color Scale、DoDの端、HDRはS67では検証していません。

本レシピの街灯・看板例、楕円の座標、Maskの接続切替とBlend 0.5は、**21.1公式Manualに基づく操作・期待結果**であり、この組み合わせでの新規実機再生・書き出しは **NOT_RUN** です。Free / Studio差、他OS、HDR、非正方形ピクセル、時間変化、性能、信号値の一致も未検証のため、`verification: partial`を維持します。
