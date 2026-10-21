---
title: 平面追跡した看板のロゴを通行人の背後に隠す
description: Planar Trackerで追従させたロゴを、元映像とPolygonマスクを使って歩く人物の背後に見せる二段Merge構成。
doc_type: recipe
verification: partial
aliases: [planar occlusion, foreground occlusion, sign logo behind person]
concepts: [tracking, coordinate-space]
patterns: [solve-then-apply-track]
nodes: [Planar Tracker, Planar Transform, Transform, Merge, Polygon]
tasks: [track, attach-graphics, screen-replace]
prerequisites: [data-domain]
level: intermediate
product_scope: fusion
updated: "2026-10-21"
---

# 平面追跡した看板のロゴを通行人の背後に隠す

## できあがるもの

横移動するカメラの映像で、看板に貼った新しいロゴの前を人物が歩く場面を作ります。ロゴは看板の遠近変化に追従し、人物が重なった部分だけは**元の人物がロゴより手前に見える**ようにします。

前提は、[平面追跡で看板にロゴを貼る](./planar-track-graphic)の手順で、Planar Trackerの解析とPlanar Transformによるロゴの追従ができていることです。この記事ではその後の前後関係の合成を扱います。看板にもともと書かれている文字を消す処理は別途必要です。

## なぜ二つのマスクを分けるのか

Planar Trackerの**Occlusion Mask**は、人物などが看板の模様を隠したときに、その画素を**追跡計算から除外**する入力です。白い領域を追跡から外しますが、完成画像で人物をロゴの上に描く機能ではありません。

完成画像の前後関係は、別の**PolygonマスクとMerge**で作ります。Polygonは人物の見えている輪郭を指定し、その内側だけ元映像の画素をロゴ合成の上へ戻します。この作業をロトスコープ（時間とともに輪郭を描き直すマスク作業）と呼びます。

追跡除外用のPolygonは**やや広めでよく**、人物の髪や手をきれいに抜くためのPolygonは**輪郭に合わせて**作る必要があります。目的が違うため、同じマスクをそのまま流用する必要はありません。

## 必要な素材とノード

- 看板と、手前を通過する人物が写った元映像。
- アルファ（透明度）のある新しいロゴ画像。
- **Planar Tracker / Planar Transform / Transform**：看板の平面を解析し、ロゴを追従させる。
- **Mergeを二つ**：Merge 1はロゴを看板へ合成し、Merge 2は人物の部分だけ元映像を手前へ戻す。
- **Polygon**：人物の輪郭をフレームに応じて指定する。追跡用の除外マスクとは別に用意する。

## ノードの接続

~~~text
【追跡データを取得】
元映像 ─→ Planar Tracker（Track）
                    └─ Create Planar Transform（Track splineを共有）

【画面の合成】
透明ロゴ → Transform → Planar Transform → Merge 1（Foreground）┐
元映像 ─────────────────────────────→ Merge 1（Background）┴→ Merge 2（Background）┐
元映像 ─────────────────────────────────────→ Merge 2（Foreground）             ├→ MediaOut
人物のPolygon ─────────────────────────────────→ Merge 2（Effect Mask・青）     ┘
~~~

ロゴを載せる**Merge 1**と、人物の画素を戻す**Merge 2**は役割が違います。Merge 2のForegroundへ接続するのは、ロゴを載せる前の**同じ元映像**です。Polygonを接続するのはMerge 2の青い**Effect Mask**で、Planar Trackerの白いOcclusion Maskではありません。

## 手順

### 1. 看板の追跡を先に仕上げる

1. Planar Trackerの**Track**モードで、看板の模様を囲んで必要区間を追跡します。人物が大きく重なる区間でTrackが乱れるなら、別のマスクを白い**Occlusion Mask**へ入れて、追跡から人物を除外します。
2. **Steady**モードで看板の模様が止まって見えるか検査し、問題があればここで追跡を修正します。
3. **Create Planar Transform**で生成したノードへ、透明ロゴをTransform経由で接続します。基準フレームで看板上の位置を合わせ、Merge 1のForegroundに入力します。Merge 1のBackgroundは元映像です。
4. この段階では人物の前にもロゴが表示されます。それで構いません。まずロゴが看板へ追従しているか確認します。

### 2. 元映像の人物を上から戻す

1. Merge 1の出力を**Merge 2のBackground（オレンジ）**へ接続します。
2. Merge 1へ入れたものと同じ時刻・解像度の**元映像をもう一度分岐**し、Merge 2の**Foreground（緑）**へ接続します。
3. Polygonを追加し、人物が看板に重なっているフレームで輪郭を囲みます。
4. Polygonの出力をMerge 2の**Effect Mask（青）**へ接続します。マスクの内側では元映像の人物が上に戻り、マスクの外側ではMerge 1のロゴ合成が残ります。
5. 人物が移動する区間では、輪郭が変わるフレームへ移動してPolygonの頂点を調整します。再生中に人物の端からロゴがはみ出さないか確かめます。

Merge 2のForegroundに**ロゴ合成後の画像**をつなぐと前後関係が変わりません。必ずロゴ合成前の元映像を使用します。また、Foreground側とBackground側で異なる色補正・リタイム・Cropを行うと、マスク境界で差が見えることがあります。ここでは同じ素材から同じタイミングで分岐させます。

### 3. 境界を整える

人物の服や腕の輪郭は、まずPolygonの位置で合わせます。境界が硬すぎる場合はマスク端を必要最小限だけぼかし、輪郭の外へ背景がにじみ出ないか確認します。手や髪が大きく動く場合は、単純な一つのPolygonでは不足することがあります。複数のマスクや、別のキーイング・ロトスコープ処理が必要です。

**検査はMerge 1とMerge 2を個別にViewerへ表示**して行います。Merge 1でロゴが滑るなら追跡の問題、Merge 1で追従するのにMerge 2で人物の縁がおかしいなら前景用マスクの問題です。

## よくある失敗

| 症状 | 確認すること |
| --- | --- |
| ロゴが人物の上に出続ける | Merge 2のForegroundが元映像か、Effect Maskが人物を囲んでいるか |
| ロゴが看板の端から滑る | Merge 1だけを見て、Planar TrackerのSteadyとPlanar Transformの配置を再確認する |
| 人物の外側で古い看板の文字が戻る | Polygonが広すぎる。人物の輪郭へ寄せ、必要なら境界のぼかしを減らす |
| 人物の輪郭からロゴがはみ出す | Polygonのアニメーションを確認し、手・髪など変形の大きい部分を細分化する |
| 人物だけ明るさやサイズが違う | Merge 2へ分岐した元映像と、Merge 1の背景の処理・解像度・時刻を揃える |
| 追跡が人物の動きに引っ張られる | Planar Trackerの**Occlusion Mask**で解析対象から除外する。完成画のマスクとは分ける |

## 関連ページ

- [Planar Tracker](../../nodes/tracking/planar-tracker)：追跡とOcclusion Mask。
- [Planar Transform](../../nodes/tracking/planar-transform)：ロゴへ追跡結果を適用する。
- [Merge](../../nodes/compositing/merge)：Foreground / Background / Effect Mask。
- [Polygon Mask](../../nodes/masks/polygon-mask)：輪郭を描き、時間に合わせて変える。
- [Maskの基本](../../learn/02-data/mask)：アルファとマスクの違い。
- [トラッキング結果がずれる](../../troubleshooting/tracking/track-drifts)：追跡と適用の問題を切り分ける。

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 119「Tracking Nodes」**pp.2820–2822**（Planar Trackerの役割、Occlusion Maskの白い部分を除外する挙動、Steady、Planar Transformの作成）、Fusion Fundamentals Chapter 66 **pp.1402–1403**（Mergeの三入力と分岐）、Chapter 79 **pp.1730–1731**（Polygonなどのマスク、青いEffect Maskの作用範囲）。[公式サポート](https://www.blackmagicdesign.com/jp/support/)。

二段Mergeで元映像の人物を戻す構成は、上記の入力・マスク仕様から組み立てた**制作例**であり、マニュアル掲載の同一手順を再録したものではありません。特定素材での輪郭精度、21.1実機での見た目、Free / Studioの差は未検証のため、`verification: partial`を維持します。
