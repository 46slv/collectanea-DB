---
title: Surface Trackerで肌を固定して修正し、元の動きへ戻す
description: 動く頬やあごをSurface Trackerで安定化してPaintで修正し、同じメッシュ追跡データで元映像に戻す。
doc_type: recipe
verification: partial
aliases: [surface stabilize rewarp, skin retouch]
concepts: [tracking, image-data, mesh-warp]
nodes: [Surface Tracker, Paint, MediaIn]
tasks: [stabilize-surface, skin-retouch]
prerequisites: [image-data, mask-data]
level: intermediate
product_scope: fusion
updated: "2026-10-21"
---

# Surface Trackerで肌を固定して修正し、元の動きへ戻す

## 完成するもの

会話中に動く人物のあごにある小さなほくろや傷を、周囲の肌で自然になじませます。顔の向きが変わり、頬が伸び縮みしても、修正位置が肌に追従する合成です。

Surface Trackerで変形する肌を追跡し、**一度止めてPaintで修正した画像を、同じ追跡データで元の動きへ戻す**方法です。看板など単純な平面には[Planar Tracker](../../nodes/tracking/planar-tracker)も候補ですが、表情で曲がる面にはメッシュ追跡が適しています。

## ノードの接続と役割

~~~text
元映像 ─→ SurfaceTracker_A（Stabilize-Warp）─→ Paint ─→ SurfaceTracker_B：Overlay（緑）
   │                                                      ↑
   └──────────────────────────────→ SurfaceTracker_B：Input（黄）
                                                           │
                                         B：Rewarp Stabilized Clip
                                                           │
                                                        MediaOut
~~~

Aの黄Inputは追跡対象の元映像です。Aの出力はメッシュの表面を基準フレームへ逆変形し、傷がほぼ同じ画面位置にある2D画像です。Paintにはこの画像を渡します。

Bの黄Inputには**未変形の元映像**を分岐してつなぎます。Bの緑Overlayには**Paint後の安定化画像**をつなぎます。Bは修正を各フレームの肌の動きに沿って再変形し、元映像へ合成します。

**AとBは同じBounds・Mesh・追跡データを使います。** Bを独立に追跡し直すとメッシュ変形が一致しない可能性があります。Aの出力をBの黄Inputへ直列接続するのも、合成先としての元映像を失うため適切ではありません。

## 手順

### 1. Aで肌を追跡する

元映像をSurface Tracker Aの黄Inputへ接続します。傷が大きく見え、顔がなるべく正面を向くフレームを選び、**Bounds**で頬やあごの同じ肌面を囲みます。背景や服を含めず、目や口など別の大きな動きが混ざる場合は**+ Hole**で避けます。

**Mesh**で肌の曲がり方を追える点の配置を確認します。特徴が乏しい肌に点を大量に増やすだけでは精度は上がりません。**Track**で前後方向へ追跡し、顔が動く複数のフレームで、点が同じ肌の場所を追っているか確認します。失敗区間を直してからResultへ進みます。操作項目は[Surface Tracker](../../nodes/tracking/surface-tracker)を参照してください。

### 2. Aで変形を止める

Aの**Result → Output**を**Stabilize-Warp Input 1**にします。これは画面全体の手ぶれ補正ではなく、メッシュ内の面を基準フレームの位置・形へ逆変形する処理です。

再生し、顔が動いても傷が安定した位置に見えるか確かめます。ずれる場合はPaintで位置を補正する前に、TrackのデータやMeshを見直します。元映像で隠れている部分の画素が復元されるわけではありません。

### 3. Paintで修正する

Aの出力へ**Paint**を接続します。Paintの**Stroke**ツールを選び、Inspectorの**Apply ControlsでClone**を指定します。近くの明るさや肌理が似た場所を参照して、傷を小さく覆います。Paintは入力画像をCloneの参照元にできます。設定は[Paint](../../nodes/paint/paint)の説明も参照してください。

安定化画像では傷の位置が動きにくくなります。ただし、**位置が安定しても照明や肌の質感の変化は残ります**。基準フレーム以外でも色や輪郭が浮かないか確認してください。

### 4. Aの追跡データをBへ引き継ぐ

Aを**追跡データを保持する形で複製**してBを用意します。Bの**Tracked Range**とメッシュ位置をAと比較し、同じ追跡が保持されたことを確かめます。Inspectorの数値だけを手入力しても、各フレームの追跡データの代わりにはなりません。

Bの**Result → Output**を**Rewarp Stabilized Clip**にし、黄Inputへ元映像、緑OverlayへPaint後の画像を接続します。Bの**Overlay/Alpha SourceをEach Frame**にします。修正した各フレームを元の動きへ戻すためです。First Frameでは動画としての各フレームを使いません。

21.1マニュアルChapter 168にはColorページの**Resolve FX版Surface Tracker**を使う類似例があり、そちらのノード複製にはGalleryのStillから**Append Node Graph**する手順が記載されています。**この複製制約をFusionページの通常ノードにそのまま適用できるとは確認できません。** Fusionでは実際に複製したBの追跡データを確認してください。

### 5. 元映像と比べる

Bの出力をMediaOutにつなぎ、元映像と交互に見比べます。あごを上げる、口を開く、横を向くなど、変形が大きい区間を確認します。修正部分が肌とともに動き、境界が二重にならなければ完成です。

## うまくいかない場合

| 症状 | 最初に確認すること |
| --- | --- |
| Aで傷が止まらない | Output、Tracked Range、Bounds・Meshのずれ、Trackの失敗区間。 |
| Bで元の動きに戻らない | BがAと同じ追跡データを持つか。Bの黄Inputが元映像、緑OverlayがPaint後の画像か。 |
| 一部フレームで修正が止まる | BのOverlay/Alpha SourceがEach Frameか。Paintの出力に必要なフレームがあるか。 |
| 修正部の輪郭が二重になる | 追跡精度とメッシュの境界。追跡していない部分を無理に広げていないか。 |
| 口や目の動きでメッシュが崩れる | Boundsが一つの面を囲んでいるか。HoleやOcclusion Maskで解析対象を整理する。 |
| 修正した肌だけ明るさが違う | 安定化しても残る照明変化。別フレームでCloneの参照位置を確認する。 |

## 関連記事

- [Surface Tracker](../../nodes/tracking/surface-tracker)：4入力と6種類のOutput
- [シャツにロゴを貼る](./surface-track-shirt-logo)：動く表面へOverlayを直接合成する方法
- [Maskの基礎](../../learn/02-data/mask)：追跡除外と最終合成のマスク
- [トラッキングがずれるとき](../../troubleshooting/tracking/track-drifts)：追跡不良と適用時のずれの切り分け

## バージョンと確認範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 119「Tracking Nodes」pp.2830–2838（Surface Tracker、Stabilize-Warp、Rewarp、Each Frame）、Chapter 80「Paint」pp.1764–1766（Stroke・Clone）、Chapter 168「Resolve FX Transform」pp.3718–3720（Colorページでの安定化と復帰の接続例）。

このFusion構成は公式マニュアルにある機能を組み合わせた応用手順です。**ColorページのResolve FXの作例をFusionページで実機再現したものではありません。** Fusion 21.1での複製時のデータ保持、Inspectorの細部、Free / Studio差は未検証のため、verificationはpartialです。
