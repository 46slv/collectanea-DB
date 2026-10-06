---
title: Relight
description: 2D footageからSurface Mapを生成し、仮想lightの影響範囲をAlphaとして作ってgradeを曲面に沿わせるNode。
doc_type: node
term_id: relight
term_short: 2D footageのsurface解析から、追加lightingに使うlight mapを作るNode。
verification: partial
aliases: [Relight, RLT]
concepts: [image-data, alpha, lighting, mask-data]
nodes: [Relight]
node_family: matte-keying
controls: [Surface Map, Output Surface Map, Directional, Point Source, Spotlight, Relighting Map Preview, Brightness, Reach, Contrast, Glossiness, Specularity, Shadow Softness, Azimuth/Elevation XY, Beam Angle, Edge Softness, Light Position, Rescale Oversaturated, Reinterpret Left/Right, Reinterpret Up/Down]
inputs: [image, mask, image]
outputs: [image]
tasks: [relight, lighting, day-for-night, shot-matching]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Relight

Relightは、2D footageに写った人物や物体の表面方向を解析し、「仮想lightを置いたとき、画面のどこへどの程度lightが当たるか」を表すmapを作るNodeです。

重要なのは、Relight単体でRGBを直接明るくするNodeではないことです。通常はRelightが作ったAlphaをMaskとして使い、Color CorrectorやBrightness/Contrastなどで作った明るさ・色の変更を、そのAlphaに沿って合成します。固定したPolygonやgradientをMaskにする場合と違い、推定したsurfaceの向きに応じてlightの分布を変えられます。

## Surface Mapとは

Surface Mapは、画面内のsurfaceがどちらを向いているかを色で表したmapです。Relightはこのmapと仮想lightの位置関係から、lightが強く当たる部分と弱く当たる部分を作ります。

これは実際の3D geometryやDepth Mapではありません。21.1 Manualでは、scene内のobject同士の3D relationshipを計算せず、objectから別objectへshadowを落としたり、depth informationを生成したりできないと説明されています。

## 入力

Relightには3つの入力があります。

- **Input** — オレンジ。relightしたい2D Imageを接続します。
- **Effect Mask** — 青。optional。Maskを接続するとRelightの適用範囲を限定できます。MaskはNodeの処理後に適用されます。
- **Normals** — 緑。外部で作ったnormal map / Surface Mapを使うときに接続します。InspectorのSurface Mapを**Use Normals Input**へ切り替えて使います。

## Relightの出力をどう使うか

通常のRelightでは、仮想lightが当たる範囲がImageのAlpha channelへ入ります。**Relighting Map Preview**を有効にすると、その分布を直接確認できます。明るい部分ほどRelightの影響が強い領域です。

21.1 Manualの基本構成では、元footage、gradeしたfootage、RelightをMergeへ次のように接続します。

```text
MediaIn ───────────────→ Merge (Background) ─→ MediaOut
   ├─→ ColorCorrector ─→ Merge (Foreground)
   └─→ Relight ─────────→ Merge (Effect Mask)
```

1. MediaInをRelight、Color Correctorなどのgrade Node、MergeのBackgroundへ分岐します。
2. grade側でGainや色など、「lightが当たった場所に適用したい変化」を作ります。
3. grade側の出力をMergeのForegroundへ接続します。
4. Relightの出力をMergeのEffect Maskへ接続します。
5. Relightでlightの方向や位置を調整すると、gradeが見える範囲がsurfaceに沿って変化します。

この構成では、Relightが「どこへgradeを見せるか」、Color Correctorなどが「そこをどう変えるか」を担当します。

## Surface Mapの使い方

**Use Internal**では、Relight自身がInput ImageからSurface Mapを生成してlighting calculationへ使います。まず試すならこの方法です。

外部mapを使う場合は**Use Normals Input**へ切り替え、緑のNormals inputへ接続します。Resolve FX側の説明では同種のmodeが**Use Input 2**と表記されていますが、このページではFusion Node側の表記を使います。

**Output Surface Map**を有効にすると、Relightは解析したmulti-color Surface Mapを出力します。この出力を別のRelightのNormals inputへ渡せるため、1つ目をsurface解析、2つ目をlighting調整として分ける構成も取れます。

## Light Type

Relightには3種類のlightがあります。

- **Directional** — 無限遠から一定方向に来るlight。**Azimuth/Elevation XY**で方向を調整します。
- **Point Source** — 1点から広がるlight。**Light Position**をInspectorまたはViewer上で動かします。
- **Spotlight** — Point Sourceをcone状の範囲へ絞ったlight。**Light Position**でsource位置、**Beam Angle**でconeの広さ、**Edge Softness**でedgeを調整します。

別shotのkey light方向へ寄せたい場合はDirectional、局所的なlight sourceを作りたい場合はPoint Source、照射範囲を絞りたい場合はSpotlightから試せます。

## Light / Surface Properties

- **Brightness** — RelightのAlphaを使って適用するgradeの強さを調整します。Relight単体のRGBを直接明るくするControlではありません。
- **Reach** — light sourceから離れたsurfaceでreflectionがどの程度弱くなるかを調整します。
- **Contrast** — lightが当たる領域と当たらない領域のtransitionを調整します。
- **Glossiness** — reflective surfaceにsheenがあるような見え方を加えます。
- **Specularity** — Glossinessがあるとき、reflectionのshinyさを調整します。
- **Shadow Softness** — ambient reflectionとしてshadow側へlightが回り込む量を調整します。

## 外部Surface Mapの向きが合わない場合

外部mapは生成元によってscaleや方向の解釈が異なる場合があります。

- **Rescale Oversaturated** — 極端にsaturatedで、一部が暗い形式のSurface Mapを再解釈します。
- **Reinterpret Left/Right** — convex / concaveの見え方が左右方向で逆の場合に切り替えます。
- **Reinterpret Up/Down** — lightの上下方向が逆に見える場合に切り替えます。

外部mapでlight方向が直感と逆に動く場合は、light positionを無理に反転する前にここを確認します。

## shot matchingの例

別shotの人物には右側からkey lightが入っているのに、対象shotではその方向性が弱い場合を考えます。

1. MediaInをRelightとColor Correctorへ分岐します。
2. Color Corrector側でGainを上げ、必要ならlight色へ寄せます。
3. RelightをDirectionalにし、Azimuth/Elevation XYでreference shotと同じ方向へ合わせます。
4. RelightをMergeのEffect Maskへ接続します。
5. Mergeを見ながらgrade量とRelightのBrightness / Contrastを調整します。

screen-spaceのgradientだけで作るより、顔や衣服のsurfaceに沿ってgradeの分布を変えられます。

## day-for-nightの例

21.1 Manualでは、Relightが作るAlphaを反転し、lightが当たっていない領域を暗くするday-for-night手法も紹介されています。

元shotのlight方向に合うmapを作り、そのAlphaを使って暗いgradeを適用すると、scene全体を一律に暗くするよりも元のlighting方向を残しやすくなります。

## 3D Lightとの違い

FusionのDirectional Light / Point Light / Spotlightは、Classic 3D scene内のgeometryとmaterialへ作用する3D Lightです。

Relightは2D footageを解析してSurface Mapを推定し、そのmap上でlight maskを作ります。実際の3D geometry、object間のocclusion、cast shadow、depthを必要とする処理では、Relightを3D lightingの代わりとして扱えません。

## 関連Node

- [Merge](../compositing/merge) — gradeしたbranchと元footageをRelightのAlphaで合成する
- [Magic Mask](./magic-mask) — 人物など対象領域を分離し、RelightのEffect Maskとして使う
- [Depth Map](../effects-film/depth-map) — Imageからdepth方向の情報を推定する。surfaceの向きを扱うRelightとは用途が異なる

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 109 pp.2557–2560で、3入力、基本Node構成、Surface Map、3種類のlight、Relighting Map Preview、Light / Surface Properties、外部Surface Mapの再解釈Controlを確認しています。

同Manual Chapter 162 pp.3626–3628も照合し、RelightのAlphaをgradeへ使う考え方とday-for-nightの例を確認しました。Chapter 162はResolve FX側の説明で一部のUI表記がFusion Nodeと異なるため、このページのControl名はChapter 109のFusion Node表記を優先しています。

current runtime REGID、実機上のport表示順、実処理性能はこのrunでは確認していません。
