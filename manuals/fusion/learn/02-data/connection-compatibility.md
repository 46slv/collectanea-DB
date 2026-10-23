---
title: 接続できるdata / 接続できないdata
description: Image・Mask・Shape・Particle・3D・USD・Deep・パラメータのdomain compatibilityから接続可否を読む。
doc_type: concept
term_id: connection-compatibility
term_short: 出力データと接続先の入力端子が扱う種類・役割を照合し、必要な変換を判断すること。
verification: partial
aliases: [connection compatibility, port type, data type]
concepts: [data-domain, typed-connections]
tasks: [connect-nodes, debug, read-graph]
prerequisites: [image-data, mask-data, parameter-data]
level: foundation
product_scope: fusion
updated: "2026-10-24"
---
# 接続できるdata / 接続できないdata

## このページで分かること

Node同士を直接接続できない場合や、renderer / converterが必要になる理由を説明します。

## 基本の考え方

Fusionでは、Outputが渡す**データ領域（data domain）**と、接続先Inputが受け取るデータの種類・役割を照合します。Nodeの名前が似ていても、通常の2D Image、マスク、Shape、Particle set、3Dシーンは同じものではありません。

```text
Output domain
      ↓
compatible?
   yes / no
      ↓
Input domain
```

代表domain:

- 2D <Term id="image">Image</Term>
- <Term id="mask">Mask</Term>
- Shape
- Particle set
- Classic 3D scene
- USD scene
- Deep image
- scalar / Point / text パラメータ

## ShapeをImageに変換する

~~~text
sEllipse ─→ sRender ───────────────→ Merge［Foreground］→ MediaOut
MediaIn ───────────────────────────→ Merge［Background］
~~~

sEllipseの出力は、円の輪郭や配置を保持する**Shapeデータ**です。通常のMergeのForeground入力へ渡すには、[sRender](../../nodes/shapes/s-render)で2D Imageへ描画します。sGridで複製したりsBooleanでくり抜いたりする操作は、sRenderより**前**で行います。画像になった後の出力を、ShapeとしてそのままsBooleanへ渡すことはできません。

### ShapeをMaskとして使いたいとき

円の図形を映像へ重ねたいのではなく、**円の形の範囲だけをぼかしたい**場合は、次のように接続します。

~~~text
MediaIn（ぼかす映像） ──────────────────→ Blur ─→ MediaOut
                                         ↑ Effect Mask
sEllipse → sRender → Bitmap Mask ─────────┘
                         Channel: Alpha
~~~

sRenderが出す**2D Image**から、[Bitmap Mask](../../nodes/masks/bitmap-mask)で**Alpha**を取り出し、単一チャンネルのMaskとしてBlurの青いEffect Mask入力へ渡します。MediaInはBlurのImage入力へ入れるため、出力は「円を表示した画像」ではなく「円形の内側だけぼかされた映像」です。sRenderのAlphaに意図した形があるか、Viewerで確認してください。

単純な円なら**Ellipse Mask → Blur［Effect Mask］**の方が短い構成です。一方、sGridで並べた図形やsBooleanで加工したShapeを選択範囲に使う場合は、この変換経路が役立ちます。詳しくは[Shapeの基本](./shape)と[Maskの基本](./mask)を参照してください。

### 実機の参考例

<!-- capture-reuse:R16 -->

sEllipse1 → sRender1 → MediaOut1の実機接続です。Width 0.5／Height 0.28のShapeをsRenderで1920×1080の画像にしています。

[![S04の実機撮影例。Node Editorの接続](/img/fusion/captures/S04/graph.png)](/img/fusion/captures/S04/graph.png)

[![S04の実機撮影例。Viewerの出力結果](/img/fusion/captures/S04/result.png)](/img/fusion/captures/S04/result.png)

Resolve Studio 21.1.0.14／Windowsで撮影済みのS04を再利用した参考例です。ShapeからImageへの変換例です。Merge合成や、ほかの全データ型の互換性は含めていません。 [元の撮影条件と確認範囲](/img/fusion/captures/S04/capture.json)

## 共通ルール

**端子の色だけでは型を確定できません。** Node Editorで入力端子にカーソルを重ね、表示される入力名を確認します。Nodeの本体に線を落とすと既定のInputへ自動接続される場合があります。Mask Nodeを本体へ落としたときはMask入力が優先されることもあるので、意図した端子につながったか確認してください（21.1 Manual、Chapter 66、pp.1394–1397）。

- Node名だけで接続可否を推測しない。
- port colorだけを型の唯一根拠にしない。
- specialized domainにはdomain-specific 処理がある。
- Renderer / Converterは、データ領域を切り替える明示的な境界です。
- conversion後に失われる情報を意識する。

## 1つずつ変えて確認する

接続できない2 Nodeについて、upstream Output domainとdownstream Input domainだけを書き出します。

## 他のNodeにも応用する

### Particle：pRenderは2Dと3Dで接続先が変わる

pEmitterが出すのは、粒子それぞれの位置・速度・寿命などを保持するParticle setです。**pRenderの初期Output Modeは3D**であり、必ず2D Imageになるわけではありません。DaVinci Resolve 21.1 Manual（Chapter 114、pp.2678–2680）は、次の二通りを説明しています。

~~~text
2D合成:
pEmitter → pRender［Output Mode: 2D］→ Merge［Foreground］
MediaIn ────────────────────────────→ Merge［Background］

3Dシーンで合成:
pEmitter → pRender［Output Mode: 3D］→ Merge 3D → Renderer 3D → 2D Image
~~~

pRenderの先が通常のMergeにつながらない場合、Output Modeが3Dのままではないかを確認します。3Dのまま扱うならMerge 3Dなどの3D Nodeへ渡し、Renderer 3Dで最終的に画像化します。[pRender](../../nodes/particles/p-render)も参照してください。

### Classic 3D：シーンを描画する

~~~text
Shape 3D ─┐
Camera 3D ├→ Merge 3D → Renderer 3D → Merge → MediaOut
Light ────┘
~~~

[Merge 3D](../../nodes/3d/merge-3d)は3Dオブジェクト、カメラ、ライトを**シーンとして**まとめます。通常の2D Mergeが受け取るImageではないため、[Renderer 3D](../../nodes/3d/renderer-3d)でシーンを画像化し、その出力を映像と合成します。3Dのカメラやライトを画像化後のMergeへ追加しても、元の3Dシーンには作用しません。

### USD：USD Sceneを画像にする

~~~text
uLoader / uCamera / USDライト → uMerge → uRenderer → Merge → MediaOut
~~~

uMergeの出力はUSD Sceneです。[uRenderer](../../nodes/usd/u-renderer)のSceneInputに接続すると、シーンのカメラ（または既定のカメラ）から見た2D Imageが出ます（21.1 Manual、Chapter 121、p.2911）。通常のMerge 3Dとは扱うシーン形式が異なります。名前の似たMerge同士を置き換えず、入力がClassic 3DかUSDかを確認します。

### Deep：深度サンプルを平坦化する

~~~text
Deep Image A ─┐
              ├→ dMerge → Deep to Image → Merge → MediaOut
Deep Image B ─┘
~~~

Deep Imageは同じ画素位置に複数の奥行きサンプルを保持できます。dMergeでその情報を使って合成し、[Deep to Image](../../nodes/deep/deep-to-image)で**2D Imageへ平坦化**してから通常のMergeへ渡します。平坦化後のImageは、元の複数深度サンプルをそのまま保持するものではありません（Chapter 95、p.2238）。

## ImageとMaskの接続：例外もある

~~~text
MediaIn A（ぼかす映像） ────────────→ Blur ─→ MediaOut
                                    ↑ Effect Mask
Ellipse Mask ───────────────────────┘
~~~

MediaInからBlurへ渡すのは**加工するImage**、Ellipse Maskから青いEffect Maskへ渡すのは**ぼかす場所**です。Effect Maskを接続しただけで、元ImageのAlphaがその形に書き換わるわけではありません。

ただし、**2D ImageをEffect Maskへ直接接続できる場合があります**。21.1 ManualのBitmap Mask項目（Chapter 108、p.2463）は、画像を直接接続した場合でも、処理を受けるNodeのCommon Settingsでマスクに使うチャンネルを選べると説明しています。

~~~text
MediaIn A（処理対象） ────────────────→ Blur → MediaOut
                                      ↑ Effect Mask
MediaIn B（範囲用画像） ───────────────┘
~~~

この場合、MediaIn Bは映像として合成されず、Blurの適用範囲を決める参照画像として使われます。意図したチャンネルを読んでいるか、Blur側の設定とViewerで確認してください。**「ImageだからMask入力へ接続できない」と一律に判断しません**。

透過素材の文字の形だけを使う場合など、Alphaを明示して抽出したいときは、MediaIn B → **Bitmap Mask［Channel: Alpha］** → Blur［Effect Mask］の構成にします。Bitmap Maskを挟むとThreshold、Soft Edge、別のMaskとの合成も行えます。Garbage MatteやPre-Maskのような別種のMask入力ではBitmap Maskが必要な場合があります。

不透明な黒い図形は、Luminanceでは暗くてもAlphaでは高い値を持ち得ます。白黒の見た目と選択されたChannelを混同しないでください。詳しくは[Image / Mask / Dataを分ける](./image-mask-data)と[Bitmap Mask](../../nodes/masks/bitmap-mask)を参照してください。

## 初見のNodeを読む

1. **どの種類の出力か**：Image、Mask、Shape、Particle set、3D、USD、Deep、パラメータ値を区別します。
2. **接続先の入力名は何か**：ノード本体ではなく目的の端子に接続し、Viewerで上流の出力を確認します。
3. **変換が必要か**：sRender、pRenderのOutput Mode、Renderer 3D、uRenderer、Deep to Imageなどを選びます。
4. **変換後の結果が正しいか**：線がつながっていても画像・Maskの中身やNode設定が原因の場合があります。変換前後をViewerで比べます。

| 症状 | 最初に確認すること |
| --- | --- |
| sEllipseをMergeへ直接送れない | [sRender](../../nodes/shapes/s-render)でShapeを2D Imageへ変換したか |
| Ellipse Maskが色付きの円にならない | Maskは色を作らない。画像を作るBackground等が必要ではないか |
| pRenderとMergeがつながらない | pRenderのOutput Modeが3Dではないか |
| Merge 3DをMediaOutへつなげない | [Renderer 3D](../../nodes/3d/renderer-3d)で画像化したか |
| 色が同じ端子に見えるのにつながらない | 端子名とNode固有の入力データを確認したか |



## よくある誤解

**名前が似たMergeなら同じdomainを扱う**と考えること。

Merge / Merge 3D / uMerge / dMerge / sMergeは別domainです。

## 関連パターン

- [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## 関連Node

- [Connection / Data Types](../../index/connection-data-types)

## 参照と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 66 pp.1394–1397（Nodeの端子・接続操作）、Chapter 108 p.2463（Image / Effect Mask）、Chapter 114 pp.2678–2680（pRenderの2D / 3Dと既定値）、Shape Nodes p.2759（sRender）、Deep Image p.2238（Deep to Image）、USD Nodes p.2911（uRenderer）を参照しました。実機での全端子の互換性とedition差は未検証のため、verificationはpartialです。

## 次に読む

→ [正規化座標（Normalized Coordinates）](../03-space/normalized-coordinates)
