---
title: B-Spline Mask
description: 少ない制御点とTensionで滑らかな輪郭を作るMask。接続方法、Inspector、形状アニメーションと具体的な使い方を解説。
doc_type: node
term_id: b-spline-mask
verification: partial
aliases: [B-Spline Mask, BSp]
concepts: [mask-data, spline]
nodes: [B-Spline Mask]
node_family: masks
controls: [Show View Controls, Level, Filter, Soft Edge, Border Width, Paint Mode, Invert, Solid, Center, Size, X Rotation, Y Rotation, Z Rotation, Fill Method, Shape Animation, Tension]
inputs: [mask]
outputs: [mask]
tasks: [create-mask, roto, spline-mask]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# B-Spline Mask

B-Spline Maskは、人物の顔や肩、布など、円や四角では囲みにくい範囲を滑らかな線で指定するMaskノードです。画像を加工するのではなく、**画像処理をどこへ適用するかを表す単一チャンネルのMask**を作ります。動く被写体に合わせて輪郭を変えられるため、ロトスコーピング（フレームごとに輪郭を追う作業）にも使います。

B-Splineでは、輪郭の形を**制御点（Control Point）**の位置と**Tension（張り具合）**で調整します。[Polygon Mask](./polygon-mask)が各点のBézierハンドルを使うのに対し、B-Splineの制御点は周囲の曲線を引き寄せるように働きます。**曲線は必ずしも制御点そのものを通りません。** 少ない点で滑らかな形を作りやすい反面、局所的な角や曲がり方を厳密に合わせたい場合はPolygon Maskが適することもあります。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Effect Mask（青、任意）** | 別のMask | 入力したMaskとB-Spline自身の輪郭を合成する |
| **出力** | 単一チャンネルのMask | 後段ノードへ処理の適用範囲を渡す |

映像をB-Spline Maskへ入力する必要はありません。映像はBlurなどの**画像入力**へ、B-Spline Maskの出力はそのノードの**Effect Mask入力**へ接続します。

~~~text
MediaIn ─────────────→ Blur ─────────────→ MediaOut
                         ↑ Effect Mask
                    B-Spline Mask
~~~

この構成では、B-Spline Maskの白い部分だけBlurが強くかかり、黒い部分にはかかりません。境界のグレーは部分的な適用です。B-Spline自身が映像をぼかしたり切り抜き済み画像を出力したりするわけではありません。[マスクの基礎](../../learn/02-data/mask)も参照してください。

## Viewerで輪郭を描く

B-Spline Maskを追加した直後は**Click Append**モードで、まだ制御点はありません。

1. 対象の映像をViewerに表示した状態でB-Spline Maskを選択します。
2. Viewer上を順にクリックし、輪郭に沿う制御点を置きます。各点は前の点につながりますが、曲線は点に直接沿うとは限りません。
3. 最初の点をもう一度クリックして線を閉じます。
4. 閉じると**Insert and Modify**へ切り替わります。制御点を移動でき、曲線上をクリックして点を追加できます。
5. 輪郭を決めたら**Done**へ切り替え、意図しない点の移動・追加を防ぎます。

点を増やすほど精密になるとは限りません。額・顎・肩など形が変わる場所を中心に置き、滑らかな部分にはできるだけ少数の点を使うと、動いたときの追従修正が容易です。制御点などのViewer表示は**Show View Controls**で切り替えられます。

### Tensionの編集

Viewerで制御点を選択し、**Wキーを押しながらマウスを左右へドラッグ**すると、その点のTensionを増減できます。点を動かす操作とは別に、周囲の曲線の張り具合を変えるものです。

輪郭が外へ膨らみすぎる場合は、点をむやみに追加する前に、点の位置とTensionを調整してみてください。Bézierの左右ハンドルを個別に回す方式ではない点が、Polygon Maskとの大きな違いです。

## Inspectorの主要設定

### 位置・大きさ・輪郭の内部判定

| 設定 | 何が変わるか |
| --- | --- |
| **Center X / Y** | Mask全体の位置 |
| **Size** | 制御点の相対的な形を保ちながら全体を拡大・縮小する |
| **X / Y / Z Rotation** | 各軸に対してMask全体を回転する |
| **Fill Method** | 交差・重複した線の内側をどう判定するか |
| **Show View Controls** | Viewerでの制御点などの表示を切り替える |

**Size**を変えても、21.1マニュアル上は制御点の**Shape Animation**に新しいキーを追加しません。輪郭そのものを直す操作と、輪郭全体を移動・拡大・回転する操作を区別してください。

**Fill Method**には**Alternate**と**Non Zero Winding**があります。線が交差して意図しない穴が現れる場合、Non Zero Windingに切り替えて結果を確認します。

### マスクの濃さと境界

| 設定 | 何が変わるか |
| --- | --- |
| **Level** | Mask値の強さ。下げると後段の効果の適用量も下がる |
| **Soft Edge** | 境界をぼかす。0なら硬い境界になる |
| **Filter** | Soft Edgeを作るフィルタ方式 |
| **Border Width** | 線の幅、または塗りつぶしたMaskの縁の広がり |
| **Solid** | 有効なら輪郭の内側、無効なら輪郭線をMaskにする |
| **Invert** | Mask全体の白黒を反転する |

Filterは**Box、Bartlett、Multi-box、Gaussian**から選びます。**Multi-box**では**Num Passes**で処理回数を調整できます。まずSoft Edgeを0にして輪郭を合わせ、最後に必要な境界ぼかしを加えると、点の位置とぼかし幅を混同せず作業できます。

Solidを無効にするとMaskは輪郭線だけになり、**Border Width**がその太さを決めます。Solidが有効な場合はBorder Widthで輪郭の縁を広げたり狭めたりします。LevelはMask内の画素値そのものを下げるため、別Maskとの合成後の見え方にも注意してください。

### 別のMaskとの合成

青いEffect Mask入力へ別のMaskをつないだ場合、Inspectorに**Paint Mode**が表示されます。入力MaskとB-Spline自身の形をどう組み合わせるかを決める設定です。

| Paint Mode | 結果 |
| --- | --- |
| **Merge / Add** | 2つのMaskを統合する／画素値を加算する |
| **Subtract** | 入力MaskからB-Splineが重なる部分を差し引く |
| **Minimum / Maximum** | 2つの値の小さい方／大きい方を採用する |
| **Average / Multiply** | 平均／積を取る |
| **Replace** | B-Splineがある領域で入力Maskの値を置き換える |
| **Invert** | B-Splineが覆う入力Maskの領域を反転する |
| **Copy / Ignore** | 入力Maskを捨てる／B-Spline自身を無視する |

**Paint ModeのInvert**は入力Maskの一部を反転する演算であり、共通設定の**Invertチェックボックス**によるMask全体の反転とは異なります。詳細な選び分けは[Maskカテゴリ概要](./index)を参照してください。

## 形状をアニメーションする

B-Spline Maskは追加した時点から**Shape Animation**が有効で、最初のキーは追加時のフレームに置かれます。別のフレームで制御点を直すと形状のキーが追加され、間のフレームは補間されます。

1. 形が分かりやすいフレームで輪郭を作ります。
2. 被写体の向きや形が大きく変わるフレームへ移動し、ずれた点を調整します。
3. 中間フレームで補間された輪郭が対象から外れていないか確認し、必要な位置だけキーを追加します。
4. 最後にSoft EdgeとLevelを調整して、適用範囲を自然につなぎます。

Inspectorの**Right-Click Here for Shape Animation**から、形状アニメーションの解除・再追加などを行えます。**制御点の形状キー**と**Center／Rotationなど全体のTransform値**は別なので、輪郭の点を変えていないのに全体が動く場合は両方を確認してください。[キーフレームと時間](../../learn/05-time/keyframes-spline-time)も参照してください。

## 具体的な運用例

### 人物の顔だけをぼかす

MediaIn → Blur → MediaOutと接続し、B-Spline Maskの出力をBlurのEffect Maskへ入れます。顔の外周へ少数の点を置き、頬や顎の形に合わせてTensionを調整します。

顔の向きが変わったらそのフレームで輪郭を直し、中間フレームでも対象からはみ出さないか確認します。**Blurする画像は変わらず、ぼかす範囲だけをMaskで動かす**構成です。耳や髪の輪郭を局所的に詰めたい場合は[Polygon Mask](./polygon-mask)も検討します。

### グリーンバックの不要な領域を除く

グリーンバック素材の端に照明スタンドが写っている場合、人物と残すべき小道具を囲むB-Spline Maskを作り、**Delta KeyerのGarbage Matte入力**へ接続します。Garbage Matteは、キーイング処理で不要な外側の領域を除くためのMaskです。

~~~text
MediaIn ──────────────→ Delta Keyer ───────→ 後段の合成
                             ↑ Garbage Matte
                         B-Spline Mask
~~~

B-Splineは背景色を解析するのではなく、**何を残す範囲とするかを輪郭で指定する補助**です。被写体が動く場合は形状キーを追加して追従させます。

### 既存のMaskから一部を除外する

B-Splineで作った広いMaskから、画面端の看板に重なる部分だけを[Rectangle Mask](./rectangle-mask)で取り除く場合:

~~~text
B-Spline Mask（広い領域） ─→ Rectangle Mask（看板）
                              Paint Mode: Subtract
                                       ↓
                               BlurのEffect Mask
~~~

B-Splineの出力をRectangle Maskの青い入力へ接続し、Rectangle側のPaint ModeをSubtractにします。**入力B-SplineのMask値から矩形と重なる領域が差し引かれた結果**がBlurへ渡されます。看板が動くならRectangle側の位置も調整します。

## 似たノードと選び方

- [Polygon Mask](./polygon-mask)：Bézierハンドルで局所的な曲率を細かく指定したいとき。
- [Ellipse Mask](./ellipse-mask)：円や楕円で十分な範囲を素早く囲うとき。
- [MultiPoly](./multipoly)：複数のPolygon／B-Spline輪郭を1ノード内で管理したいとき。
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)：マスクを画像処理へ接続する基本パターン。

B-Splineは少ない点で滑らかな領域を扱うのに向きますが、どの場面でもPolygonより高精度という意味ではありません。輪郭の形と、フレームをまたぐ編集のしやすさで選びます。

## バージョン・出典・未確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）Chapter 108「Mask Nodes」pp.2468–2471を基準に、入力、Inspector、Fill Method、Shape Animation、制御点の追加・編集、TensionのWキー操作を確認しました。Chapter 79「Rotoscoping with Masks」（p.1725以降）もPolygonとB-Splineの比較に参照しています。

Manualの**[BSp]**は選択用の略号であり、内部REGIDとは断定しません。各パラメータの値域、Free／Studioの差、実機固有の細かな操作は全件確認していないため、verificationはpartialです。
