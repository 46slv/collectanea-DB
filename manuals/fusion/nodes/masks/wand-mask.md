---
title: Wand Mask
description: 画像の1点から周囲へつながる近い色を選び、その範囲をMaskとして出力するFusionノード。
doc_type: node
term_id: wand-mask
term_short: 選択点の色に近い画素を、つながっている範囲だけマスクにする。
verification: partial
aliases: [Wand Mask, Wnd]
concepts: [mask-data, image-data, color-selection]
nodes: [Wand Mask]
node_family: masks
controls: [Show View Controls, Level, Filter, Soft Edge, Paint Mode, Invert, Selection Point, Color Space, Channel, Range, Range Soft Edge]
inputs: [image, mask]
outputs: [mask]
tasks: [create-mask, select-color, isolate-color]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Wand Mask

Wand Maskは、画像の中から1点を指定し、その点と色が近い画素を周囲へたどって、<Term id="mask">Mask</Term>を作るノードです。たとえば青い壁をクリックすると、壁につながる近い色の領域を選べます。画面の離れた場所に同じ青色の服があっても、その服まで壁とつながっていなければ原則として選択されません。

Photoshopの「自動選択（Magic Wand）」に近い働きですが、結果は切り抜いた画像ではなく、**後段の効果をどこに適用するかを示すマスク**です。色を変えたり、ぼかしたりする処理はColor CorrectorやBlurなど別のノードが行います。

## 役割と入出力

| 端子 | 受け取る・渡すもの | 役割 |
| --- | --- | --- |
| Input（オレンジ） | 2D Image入力 | 色を調べる元画像。選択点の画素を読み、その周囲で色の近い領域を探します。 |
| Effect Mask（青） | 任意のMask入力 | 別のMaskとWand Maskで作った結果を組み合わせます。方法はPaint Modeで指定します。 |
| Output | Mask出力 | 選択した範囲のマスク値をColor Corrector、BlurなどのEffect Mask入力へ渡します。 |

2D <Term id="image">Image</Term>のRGBなどを直接加工するのではなく、画像からマスクを生成します。白い部分には後段の効果が強くかかり、黒い部分にはかからず、グレーの部分には部分的にかかります。画像のAlphaチャンネルを直接書き換えるためのノードではありません。

## 主な設定項目

### Selection Point

Viewerに表示される十字の位置です。この画素の色を基準に、周辺の画素を調べます。クリックした点と近い色が連続している限り選択が広がり、条件に合う隣接画素がなくなると止まります。

InspectorではX・Y座標を調整できます。Tracker、Path、Expressionなどから位置を動かすこともできます。被写体が動く場合は、選択点が毎フレーム狙った色の場所に残っているか確認します。

### Color Space / Channel

**Color Space**は、色の近さを判定する際の色空間です。21.1マニュアルにはRGB、YUV、HLS、LABが記載されています。同じ画像でも選択に使う色空間によって、似ていると判定される画素が変わります。

**Channel**は比較する情報を選びます。全3色チャンネル、Alpha、または個別チャンネルを使えます。個別チャンネル名はColor Spaceに連動し、RGBではR/G/B、YUVではY/U/Vです。たとえば明るさだけで区別したいなら、色の全成分で比較する場合との違いをViewerで確かめます。

### Range / Range Soft Edge

この2つは、選択点の色と「どのくらい近ければ選ぶか」を調整します。

- **Range**：この範囲内の色はマスク値100%の選択対象になります。0.0では選択点と同じ色だけが対象で、大きくすると近い色まで完全選択に含めます。
- **Range Soft Edge**：Rangeから少し外れた色を、グレーのマスク値で段階的に含めます。0.0では範囲外の色を追加しません。

壁に照明のムラや圧縮ノイズがあるとき、Rangeが小さすぎると色の違う小さな穴が残ります。Rangeを広げると穴を減らせますが、床や衣服など別の物体へ同じ色がつながっていると選択が広がりすぎます。Range Soft Edgeは色の類似度の境界を滑らかにする設定で、輪郭を空間的にぼかすSoft Edgeとは役割が異なります。

### Level / Soft Edge / Filter

- **Level**：マスク全体の強さを調整します。下げると白い領域もグレーに近づき、後段の効果が弱くなります。輪郭だけを変える設定ではありません。
- **Soft Edge**：選択後のマスクの輪郭を空間的にぼかします。0.0なら輪郭を明瞭に保ちます。
- **Filter**：Soft Edgeのぼかし方式です。Box、Bartlett、Multi-box、Gaussianがあります。Multi-boxを選ぶとNum Passesで計算回数を調整できます。
- **Show View Controls**：Viewer上の選択点などの操作表示を切り替えます。非表示にしてもマスクの処理自体は無効になりません。

色の選択が間違っているときは先にSelection PointとRangeを直し、輪郭の硬さだけを変えたいときにSoft Edgeを使います。Soft Edgeを大きくしても、選択していない別の物体を正しく識別できるようになるわけではありません。

### Paint Mode / Invert

別のマスクを青いEffect Mask入力に接続すると、**Paint Mode**で2つのマスクを合成できます。

- **Multiply**：両方のマスクが白いところを残したい場合に使います。
- **Subtract**：入力マスクからWand Maskで新しく作った範囲を引きたい場合に使います。
- **Add / Merge / Maximum**：それぞれの規則で領域を足す・まとめる用途です。
- **Minimum / Average / Replace / Invert / Copy / Ignore**：入力マスクと新しいマスクの値を別の規則で扱います。

Paint Modeの**Invert**は、入力マスクに新しいマスクが重なる部分の値を反転する演算です。別にある**Invertチェックボックス**はマスク全体を反転します。両者を混同しないでください。各演算の入口は[Maskカテゴリ概要](./index)にあります。

### Image / Settingsタブの共通設定

ほかのMaskノードと同様、ImageタブではOutput Size（合成のサイズ・入力画像のサイズ・カスタムサイズ）やClipping Modeなどを調整できます。元画像とマスクの解像度が異なる構成や、Soft Edgeが画面端で切れて見える構成ではここも確認します。詳しい制御項目は21.1マニュアルのChapter 108「The Common Controls」を参照してください。

## 最小構成：画像の一部分だけを色補正する

青い壁と人物が写った映像で、壁の色だけを変える例です。

```text
MediaIn ─────────────────→ Color Corrector ─→ MediaOut
   └→ Wand Mask ──────────→ Color CorrectorのEffect Mask（青）
```

1. MediaInの画像をColor Correctorへ送り、同じ画像からWand MaskのInputへ分岐します。
2. Wand Maskを選択し、ViewerのSelection Pointを青い壁の内側に置きます。
3. Wand Maskの結果をViewerで表示し、壁が白く、人物が黒く見えるようにRangeとRange Soft Edgeを調整します。
4. Wand MaskのOutputをColor Correctorの青いEffect Mask入力へ接続します。Color Correctorで色を変えると、主に壁だけに補正がかかります。
5. 輪郭が硬ければSoft Edgeで整えます。人物側へ選択が漏れる場合はRangeを見直します。

この構成ではMediaInからColor Correctorへ進む線が「加工する画像」、Wand Maskから青い入力へ進む線が「加工する場所」を担当します。Wand MaskだけをMediaOutへつないでも、補正済みの映像にはなりません。

## 運用例

### 床へ選択が広がるときは矩形で限定する

青い壁と床の色が近く、色の選択が床までつながる場合を考えます。Wand Maskの出力を[Rectangle Mask](./rectangle-mask)の青いEffect Mask入力へ接続し、Rectangle Maskを壁のおおよその範囲へ合わせ、Rectangle Mask側のPaint ModeをMultiplyにします。

```text
MediaIn → Wand Mask → Rectangle Mask（Paint Mode: Multiply）
                          ↓ Mask
MediaIn ──────────────→ Color Corrector ─→ MediaOut
```

結果は「壁と色が近く、かつ矩形内にある部分」です。矩形は大まかな範囲の制限、Wand Maskはその中の色の判定を担当します。矩形の位置やサイズを変えれば、同じ色がほかの場所に現れても補正対象を絞れます。

### 動く色付きの物体を追う

画面内を動く赤い小物だけにGlowなどを適用したい場合は、選択点を小物の色が安定して見える位置へ置き、TrackerなどからSelection Pointの位置を動かします。

追跡によって十字が小物から外れなくなっても、照明変化や反射で色が変わるとマスクの形も変わります。重要なフレームで選択結果を見直し、必要に応じてRangeや補助マスクを調整します。Trackerをつなぐだけで完全なロトスコープになるわけではありません。

### 画面の離れた同色領域まで選びたい場合

Wand Maskは選択点から連続する色領域を探します。離れた場所の同色部分を同時に選びたい場合は、選択点を増やした別のWand Maskを合成するか、[Bitmap Mask](./bitmap-mask)や[Ranges Mask](./ranges-mask)のような画像全体の値からマスクを作る方法を検討します。

## 使い分けと注意点

| 方法 | 選択の基準 | 向いている場合 |
| --- | --- | --- |
| **Wand Mask** | 1点から連続する近い色 | 背景の壁など、まとまった色領域を一部分だけ選びたい |
| [Bitmap Mask](./bitmap-mask) | 画像のチャンネル値やID | 離れた位置も含め、同じ条件の画素を画像全体で選びたい |
| [Ranges Mask](./ranges-mask) | 明暗域・色の範囲 | Shadows / Midtones / Highlightsなどの階調域を選びたい |
| [Polygon Mask](./polygon-mask) | 手動で描く輪郭 | 被写体と背景の色が似ていて、色だけでは分離できない |

色が似ていて隣接する物体の境界、モーションブラーで混ざった画素、極端なノイズでは、Wand Maskの色判定だけで正確な境界を得られない場合があります。その場合は選択範囲を別マスクで制限するか、手動の輪郭指定に切り替えます。

## 関連する考え方

- [マスク（Mask）](../../learn/02-data/mask)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 108「Mask Nodes」pp.2496–2499で、連続色領域の探索、Image / Effect Mask入力、Selection Point、Color Space、Channel、Range、Range Soft Edge、Level、Soft Edge、Filter、Paint Mode、Invertを確認しました。Image / Settingsタブの共通項目は同Chapter pp.2500–2502に基づきます。

運用例は確認済みの機能から組み立てた接続例です。21.1実機での描画結果、内部REGID、すべての既定値・数値範囲、Free / Studioの差は未検証のため、`verification: partial` としています。
