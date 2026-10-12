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
updated: "2026-10-12"
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

## 最小例

Shape:

```text
sEllipse → sRender → Merge
```

sEllipseの出力は、円の形を保持する<Term id="shape-data">Shape</Term>であり、まだ画像ではありません。sRenderで2D Imageに描画してから通常のMergeのForegroundへ渡します。一方、**Ellipse Mask**は最初から「どこに処理をかけるか」を表すマスクを作るため、BlurなどのEffect Mask入力へ接続します。ShapeとMaskは用途もデータの種類も異なります。

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

pRenderの先が通常のMergeにつながらない場合、Output Modeが3Dのままではないかを確認します。3Dのまま扱うならMerge 3Dなどの3D Nodeへ渡し、Renderer 3Dで最終的に画像化します。[pRender](../../nodes/particle/p-render)も参照してください。

### Classic 3D

Merge 3D → Renderer 3D → 2D。

### USD

uMerge → uRenderer → 2D / AOV。

### Deep

dMerge → Deep to Image → 2D。

## 画像とMaskの接続を取り違えない

~~~text
MediaIn ──────────→ Blur ─→ MediaOut
                     ↑ Effect Mask
                 Ellipse Mask
~~~

MediaInからBlurへ渡すのは**ぼかす画像**、Ellipse Maskから渡すのは**ぼかす場所**です。Maskをつないだだけで元画像のAlphaが書き換わるわけではありません。

ただし、ImageからMaskへの接続を常に禁止とは考えません。21.1 Manual（Chapter 108、p.2497）には、ImageをEffect Mask入力へ直接接続できる場合が示されています。画像のAlphaやLuminanceなどを明示的に選びたい場合は[Bitmap Mask](../../nodes/masks/bitmap-mask)が役立ちます。

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

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 66 pp.1394–1397（Nodeの端子・接続操作）、Chapter 108 p.2497（Image / Effect Mask）、Chapter 114 pp.2678–2680（pRenderの2D / 3Dと既定値）、Shape Nodes p.2759（sRender）、Deep Image p.2238（Deep to Image）、USD Nodes p.2911（uRenderer）を参照しました。実機での全端子の互換性とedition差は未検証のため、verificationはpartialです。

## 次に読む

→ [正規化座標（Normalized Coordinates）](../03-space/normalized-coordinates)
