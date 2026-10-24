---
title: Node同士を接続できない
description: 線がつながらない場合と、つながっても結果が出ない場合を分け、入力端子・データの種類・変換Nodeを順に確認する。
doc_type: diagnostic
verification: partial
aliases: [接続できない, cannot connect nodes, Nodeをつなげない, 入力が合わない]
concepts: [data-domain, typed-connections]
patterns: [defer-domain-conversion]
nodes: [Merge, sRender, pRender, Renderer 3D, uRenderer, Deep to Image]
tasks: [debug, connect-nodes]
symptoms: [cannot-connect, incompatible-input, wrong-input]
prerequisites: [data-domain]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# Node同士を接続できない

Nodeの出力から線をドラッグしても接続できないときは、まず**接続先が受け取れるデータか**を調べます。一方、線はつながるのに映像が変わらないときは、**接続した入力端子が正しいか**を確認します。見た目は似た問題ですが、直す場所が違います。

## まず確認すること

1. **線そのものが接続できない**のか、**線は残るが結果が変わらない**のかを分けます。
2. 接続元Nodeの出力と、接続先Nodeの**どの入力端子**をつなごうとしているか確認します。端子にマウスを置くと、Fusionウィンドウ下部のTooltip barなどに入力の役割が表示されます。
3. 接続元が通常の2D画像（Image）、マスク（Mask）、図形データ（Shape）、粒子（Particle）、3Dシーン、USDシーン、Deep Imageのどれかを確認します。
4. 接続先へ渡す前に、RendererやConverterによる変換が必要ではないか調べます。
5. 元のNodeを左Viewer、接続後のNodeを右Viewerで比べ、同じフレームの結果を確認します。線がつながるだけでは、目的の処理が行われたとは限りません。

ここでは接続操作の診断に絞ります。データの違いを詳しく知るには[接続できるデータ・できないデータ](../../learn/02-data/connection-compatibility)を参照してください。

## 原因を切り分ける

まず、問題の線を1本だけ対象にします。複数のNodeを削除したり、Inspectorの設定を一度に変えたりする必要はありません。

```text
接続元Node ── Output（何のデータ？）
                          ↓
接続先Node ── Input（何を受け取る？）
                          ↓
                 接続できない／できる
                          ↓
                 結果は期待どおり？
```

| 観察した状態 | 最初に調べるもの | 次にすること |
| --- | --- | --- |
| ドラッグしても線が接続されない | 出力と入力のデータの種類 | 変換Nodeが必要か確認する |
| Node本体に落とすと線はつながるが結果が違う | 自動選択された入力端子 | 目的の端子へ直接つなぎ直す |
| Maskをつないだが色付きの図形が出ない | MaskとImageの役割 | 色を作るImageと処理範囲を指定するMaskを分ける |
| Particleだけ通常のMergeにつながらない | pRenderのOutput Mode | 2Dにするか、3D側で処理するか決める |
| 線が正常でも最終映像が空 | 上流Nodeの出力とMediaOutまでの経路 | [Viewerの空表示の診断](../viewer/nothing-visible)へ進む |

### 1. 出力と入力のデータが違う

Fusionでは、Nodeの見た目が似ていても、すべてが同じ種類の情報を扱うわけではありません。たとえば通常のMergeは2D Imageを重ねますが、Merge 3Dは3Dシーンをまとめ、sMergeはShapeをまとめます。

**具体例：3Dの文字を映像に重ねたい**

```text
Text 3D ──→ Renderer 3D ──→ Merge［Foreground］ ──→ MediaOut
MediaIn ──────────────────→ Merge［Background］
```

Text 3Dの出力は、文字を配置した**3Dデータ**であり、そのまま通常のMergeが受け取るRGBA画像ではありません。Renderer 3Dで2D画像にしてから、Mergeの前景へ送ります。3Dのカメラやライトをまとめて使う場合は、Renderer 3Dの前にMerge 3Dなどを配置します。

**具体例：Shapeで作った円を映像に重ねたい**

```text
sEllipse ──→ sRender ──────→ Merge［Foreground］ ──→ MediaOut
MediaIn ──────────────────→ Merge［Background］
```

sEllipseが作るのはピクセル化前の図形（Shape）です。[sRender](../../nodes/shapes/s-render)で画像に変換すると、通常のMergeへ渡せます。**Ellipse Mask**は別のNodeで、通常は「どこを処理するか」という範囲を指定するために使います。円そのものを画像として重ねるのか、円の内側だけBlurを適用するのかで、必要な接続が違います。

### 実機の参考例：Shapeを画像へ変換する

<!-- capture-reuse:R47 -->

次の画像は `sEllipse1 → sRender1 → MediaOut1` という**正常な接続**の例です。sRenderの前と後でデータの種類が変わる場所を確認できます。

[![S04のNode Editor。sEllipseとMediaOutの間にsRenderがある](/img/fusion/captures/S04/graph.png)](/img/fusion/captures/S04/graph.png)

[![S04のViewer。sRenderで描画された図形が表示される](/img/fusion/captures/S04/result.png)](/img/fusion/captures/S04/result.png)

Resolve Studio 21.1.0.14／Windowsの既存撮影S04を再利用しています。**線が拒否される場面を撮影したものではありません**。[撮影条件と確認範囲](/img/fusion/captures/S04/capture.json)を参照してください。

### 2. 接続先の入力端子が違う

線をNodeの**本体**へ落とすと、既定の入力が選ばれる場合があります。Fusion 21.1のManualでは、特定の端子へ落とした場合はその入力が使われると説明されています。意図した端子が選ばれたかは、必ず線の接続先で確認します。

例としてMatte Controlには画像を受け取る入力のほか、Solid Matte、Garbage Matte、Effect Maskなど役割が異なる入力があります。切り抜き用Polygon Maskを使う場合、目的に応じたMatte入力を選ぶ必要があります。**接続が成立しても、違う端子では期待したAlphaにならない**ことがあります。

2D ImageとMaskでも同様です。映像をBlurのメイン入力へ送るのと、別画像をEffect Mask入力へ送るのとでは意味が違います。なお、**Effect MaskはMask Nodeしか受け取れない、と一律に判断してはいけません**。画像チャンネルをMaskとして使える場合もあります。詳しくは[Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)を確認してください。

### 3. pRenderの出力が3Dのまま

Particleの[pRender](../../nodes/particles/p-render)は、**初期のOutput Modeが3D**です。「Renderと名前が付くので2D画像だろう」と考えて通常のMergeへつなぐと、出力の種類が合いません。

```text
2D合成：pEmitter → pRender［Output Mode: 2D］→ Merge → MediaOut
3D合成：pEmitter → pRender［Output Mode: 3D］→ Merge 3D → Renderer 3D
```

映像に粒子を直接重ねたいならOutput Modeを**2D**にします。3D空間でほかの物体と一緒に扱いたいなら**3D**のままMerge 3D側へ接続し、最後にRenderer 3Dで画像化します。Output Modeを変える前に、どちらの完成結果が必要か決めてください。

### 4. USDやDeep Imageを通常の画像へ直接渡そうとしている

| 接続元の種類 | 2D画像へ変える例 | 何が起こるか |
| --- | --- | --- |
| Classic 3D scene | [Renderer 3D](../../nodes/3d/renderer-3d) | カメラから見た3Dシーンを画像として描画する |
| USD scene | [uRenderer](../../nodes/usd/u-renderer) | USDシーンを2D Imageとして描画する |
| Deep Image | [Deep to Image](../../nodes/deep/deep-to-image) | 複数の奥行きサンプルを平坦化し、通常の2D合成に渡す |

これらは**同じ形式を別名で呼んでいるのではありません**。Classic 3DとUSDは別のシーン系統で、Deep Imageは通常のRGBA画像と異なる奥行き情報を持ちます。適切な変換を通したあとはViewerで2D画像を確認してから、MergeやBlurへ送ります。

詳細な出力例は[特殊データが画像として見えない](./non-image-domain-not-visible)に分けています。

## 修正方法と完成判定

1. 接続元だけをViewerへ出し、そもそも期待した出力があるか確認します。
2. 接続先の**入力名**を確認し、メイン画像・Foreground・Background・Effect Maskなどの取り違えがあれば目的の端子へつなぎ直します。
3. 出力の種類が合わない場合は、必要なRenderer / Converterを間に置きます。端子の色だけで型を決めず、Node固有の説明を確認します。
4. 変換Nodeの出力をViewerに表示し、**画像に変わったこと**、および内容が期待どおりであることを確認します。
5. 後段のNodeへ接続し直し、MediaOutまで結果が届くか確かめます。

成功条件は「線を引けた」ことだけではありません。**接続先の役割が正しく、変換後の出力が意図した画像・処理範囲になり、最終出力まで届くこと**です。データの種類を区別する考え方は[データ領域を辿る診断](../../learn/07-debugging/trace-data-domain)で説明しています。

## バージョン・出典・未検証範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）。

- **Chapter 77、pp.1667–1671**：入力端子の選択とTooltip、異なるデータを受け取るNode、Text3DからRenderer 3Dへの変換、Mask入力と2D画像入力の違い。
- **Chapter 117、pp.2759–2760**：sRenderによるShapeから2D Imageへの変換。
- **Chapter 114、pp.2678–2679**：pRenderの2D / 3D出力と、初期値が3Dであること。
- **Chapter 121、p.2911**：uRendererのUSDシーン入力と2D画像出力。
- **Chapter 95、pp.2238–2239**：Deep to ImageによるDeep画像の平坦化。

ここにある接続例は上記の公式仕様に基づく**診断・構成例**です。S04以外について21.1実機での接続拒否表示、全Nodeの端子互換性、Resolve FreeとStudioの差、OSごとの操作差は再現検証していません。そのため `verification: partial` を維持します。
