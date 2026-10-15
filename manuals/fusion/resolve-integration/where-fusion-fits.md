---
title: FusionはResolveのどこにいるか
description: "DaVinci Resolve 21.1のクリップとFusion Compositionの関係。Node Graph、MediaIn/MediaOut、Viewer、時間、解像度の受け渡しを理解する。"
doc_type: concept
term_id: where-fusion-fits
term_short: "ResolveのクリップからFusionへ画像を渡し、Nodeで処理した結果をTimelineへ戻す関係。"
verification: partial
product_scope: resolve
suite_surfaces: [edit, fusion, color]
tasks: [choose-surface, composite, motion-graphics, vfx]
level: foundation
updated: "2026-10-16"
---

# FusionはResolveのどこにいるか

**FusionはDaVinci ResolveのTimelineから画像を受け取り、Nodeをつないで合成・加工し、その結果を同じTimelineへ返す作業ページです。** 通常のクリップをFusionで開くために、一度ファイルを書き出す必要はありません。

Fusionで扱うのは、切り抜き、追跡、複数画像の合成、不要物除去、モーショングラフィックス、2D・3Dの処理などです。どの作業をFusionへ置くかは[どの作業ページを使うか](./choose-working-surface)で比較しています。ここでは、**ResolveのクリップとFusion内のCompositionが何を受け渡しているか**を中心に説明します。

## クリップとNode Graphは担当が違う

EditやCutのTimelineでは、クリップを並べて「いつ、どの映像を使うか」を決めます。FusionのNode Graphは、各画像を「どの順番で加工し、どう重ねるか」を表す接続図です。

通常の単独クリップをFusionページで開くと、次のような構成から始まります。

~~~text
Edit / Cut の映像クリップ
           │
           ▼
        MediaIn1 ──→ [加工するNode] ──→ MediaOut1
                                          │
                                          ▼
                              Edit / Cut のTimeline
                                          │
                                          ▼
                                  Colorでの仕上げ
~~~

- **[MediaIn](../nodes/utility-io/media-in)** は、Resolve側で参照している素材をFusionの画像として渡します。通常はTimelineの対象クリップが参照元です。
- **加工するNode** では画像の位置、形、色、透明度、合成を操作します。Maskは残す領域を表し、Mergeは背景と前景を重ねます。
- **[MediaOut](../nodes/utility-io/media-out)** は、出来上がった画像をResolveへ返す終端です。途中のNodeをViewerに表示できていても、MediaOutにつながっていなければその画像はTimelineへ返りません。

Nodeはすべて同じ種類のデータを流すわけではありません。例えばPolygonのMaskデータと、MediaInが流す2D画像データは役割が違います。[Graphとして考える](../learn/01-flow/graph-as-flow)と[データ領域を辿って診断する](../learn/07-debugging/trace-data-domain)をあわせて参照してください。

## Fusionへ入る方法で、渡される素材が変わる

### 1. 単独クリップをそのまま開く

EditまたはCutで対象クリップに再生ヘッドを置き、Fusionページを開くと、通常はMediaIn1 → MediaOut1が表示されます。

**複数の映像トラックが重なっている場合、通常Fusionへ渡されるのは表示中の最上位クリップだけです。** 下位トラックが自動的にすべてMediaInになるわけではありません。別の素材を使う場合は、FusionのMedia PoolからNode Editorへドラッグして追加のMediaInを作れます。

例えば、カメラが固定されたショットで背景の小物を消したいなら、MediaInとMediaOutの間にPaintを挿入し、Cloneで必要な部分を修正できます。Editでそのクリップを移動しても通常はFusionの処理もクリップに付いて移動します。一方、尺や編集点を変えた後は、アニメーションと追跡の範囲が合っているか確認します。

### 2. 複数クリップをFusion Clipへまとめる

人物、背景、前景グラフィックをEditで重ねて時間を合わせ、対象クリップを選んで **New Fusion Clip** を作成します。Fusionでは複数のMediaInと、それらを合成するMergeの接続が初期状態から用意されます。

例えば背景をV1、人物をV2、差し替えたいグラフィックをV3へ置いてからFusion Clipにすれば、Fusion内で前後関係を調整できます。ただし、**Fusion Clipの各素材はTimeline解像度へ合わせられます**。元素材の細部を使いたい場合は、単独クリップをFusionで開き、別素材をMedia Poolから追加する方法も選べます。

**Referenced Composition** はさらに別の仕組みです。同じ合成を複数のクリップやTimelineへリンクでき、元素材の解像度を維持しますが、異なるフレームレートや速度変更済みのクリップには制限があります。詳しい比較は[MediaIn / MediaOutの境界](./media-in-out-boundary)を参照してください。

### 3. 空のFusion Compositionから作る

映像クリップのないタイトルやグラフィックなら、EditのEffects Libraryにある **Fusion Composition** をTimelineに配置するか、Media PoolのBinで **New Fusion Composition** を作成します。空のCompositionは通常、MediaOutだけの状態です。そこへText+などの画像を生成するNodeをつなぎます。

**Fusion Composition（空の生成クリップ）と、複数の既存クリップをまとめるFusion Clipは同じものではありません。** タイトルやGraphの再利用は[Fusion assetをResolveで再利用する](./reusable-fusion-assets)で扱います。

## FusionのViewerとEditの完成画面は違う

FusionのViewerは、選んだNodeの出力を確認する画面です。2つのViewerに異なるNodeを出して、Keyerの結果とMerge後の合成結果を比べることもできます。

通常の単独クリップでは、画像処理は概ね次の順序です。

~~~text
素材のデコード／RAW現像
  → Clip Attributes
  → Fusion
  → Edit / Cut のInspector調整とエフェクト
  → Color
~~~

**Edit/CutのLens Correction（Resolve Studioのみ）は例外的にFusionより前に反映されます。** また、Editのリタイミングも通常の単独クリップのFusion入力へそのままは引き継がれません。

例えばEditでZoomをかけても、その単独クリップのFusion Viewerには通常、Zoom前の元素材が表示されます。Fusionで追跡した物体がEditでずれて見えれば、追跡結果だけでなく後段のEdit Transformも確認します。Colorで肌の色を調整しても、通常のFusion Viewerがそのグレードを含んだ表示にはなりません。

Fusion ClipやCompound Clipにまとめた場合は、内部に含まれたEditの調整やColorのグレードがFusion入力に反映される場合があります。処理順序の条件は[Edit ↔ Fusionの境界](./edit-fusion-boundary)、色の見え方は[Color ↔ Fusionの境界](./color-fusion-boundary)を参照してください。

## Fusionの処理解像度は常にTimelineと同じではない

通常の単独クリップでは、MediaInは**元素材の解像度**を使います。4K素材をHD Timelineに置いても、Fusionで4K画像を扱えます。一方、Fusion ClipやCompound Clipを作ると、素材はTimeline解像度へ合わせられます。

Composition全体に固定の解像度が必ずあるわけではありません。Backgroundなどの生成画像のサイズ、Resize・Crop、Mergeの背景入力のサイズによって、Nodeの出力画像サイズも変わります。Editへ戻す際の表示サイズにはResolveのImage Sizing設定も影響します。

ただし、Project Settings > Fusionの **Downscale to Timeline Resolution for Timeline Clip Compositions** を有効にすると、通常のTimeline Clip CompositionもTimeline解像度へ縮小して処理できます。「単独クリップなら設定に関係なく常に4Kを維持する」とは考えないでください。ManualはEXRについて、このDownscale設定では縮小できない制限も記載しています。

## 具体例：人物をFusionで抜き、背景をEditで差し替える

V2にグリーンバックの人物、V1に別の背景映像を置きます。

1. V2の人物クリップだけをFusionで開き、MediaIn1 → MediaOut1を確認します。
2. 間にDelta Keyerを入れ、緑の背景を取り除いて透明度（<Term id="alpha">Alpha</Term>）を作ります。
3. Delta Keyerの出力をMediaOut1へつなぎます。
4. Editへ戻れば、V2の透明部分にV1の背景が見えます。背景を別のショットに変える作業はEditで行えます。

~~~text
V2 人物: MediaIn1 → Delta Keyer → MediaOut1
                                         │ Alphaつき画像
V1 背景: ───────────────────── Editで下のトラックを表示
~~~

この例では、背景をFusionに取り込む必要はありません。一方、背景の一部を追跡して変形する、人物の前後へ複数の物を配置する、といった合成なら、背景も別のMediaInとしてFusion内に入れる方がNodeの接続で関係を管理しやすくなります。

## 受け渡しがうまくいかないとき

| 症状 | まず確認すること |
| --- | --- |
| Node Editorで見える画像がEditに出ない | 最後の画像がMediaOutにつながっているか |
| 下のトラックの背景がFusionで見えない | 単独クリップを開いていないか。素材の追加が必要か |
| FusionとEditで画面上の位置が違う | EditのTransformやその他の後段処理 |
| Fusion Clipにしたら細部が甘くなった | Timeline解像度へ変わっていないか |
| ColorとFusionの色が違う | Viewerの表示段階、Colorのグレード、RCM／ACES |
| 編集点変更後に動きがずれた | キーフレーム、追跡、追加MediaInの時間範囲 |

## 次に読む

- [どの作業ページを使うか](./choose-working-surface) — 制作目的から作業ページを選ぶ
- [MediaIn / MediaOutの境界](./media-in-out-boundary) — 素材とAlphaの受け渡し
- [Edit ↔ Fusionの境界](./edit-fusion-boundary) — 時間、画像処理の順序、解像度
- [Color ↔ Fusionの境界](./color-fusion-boundary) — 色管理とViewer
- [Graphとして考える](../learn/01-flow/graph-as-flow) — Nodeの接続の基本

## バージョンと出典

基準はBlackmagic Design『DaVinci Resolve 21.1 Reference Manual』です。

- Chapter 1「Introduction to DaVinci Resolve」pp.33–35：各ページの役割、FusionのViewerとNode Editor。
- Chapter 62「Introduction to Compositing in Fusion」pp.1278–1281：FusionとEdit／ColorのVFX作業の違い。
- Chapter 64「Getting Clips into Fusion」pp.1332–1341：単独クリップ、Fusion Clip、Referenced Composition、空のFusion Composition。
- Chapter 75「Controlling Image Processing and Resolution」pp.1641–1645：処理順序、Lens Correction、Viewer、Downscaleを含む解像度。

制作例とページ選択は上記の仕様に基づく運用例です。すべてのEdition差・特殊なTimeline構成を実機確認したわけではないため、`verification: partial` を維持します。
