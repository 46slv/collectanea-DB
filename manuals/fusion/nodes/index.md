---
title: ノードリファレンス（Node Reference）
description: Fusionのノードと関連要素を、役割・入出力・設定・用途から探す。21.1資料で確認した内容と実機未確認の範囲を区別する。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, inspect-controls]
updated: '2026-10-10'
---

# ノードリファレンス（Node Reference）

Fusionで使うノードと関連要素を、名前だけでなく、何を受け取り、何が起き、何を返し、どの場面で使うかから確認するためのリファレンスです。

名前から探す場合は[ノードA–Z](../index/node-a-z)を使ってください。一般的な仕組みは[Learn](../learn/)に、複数Nodeへ再利用できる組み方は[Patterns](../patterns/)に分けています。

## 掲載範囲

2026-10-05のreader-first completion candidateには、**420のノード・関連要素ページ**があります。カテゴリ案内ページはこの数に含めません。

この420は「Resolve 21.1のAdd Toolに表示される420 Node」という意味ではありません。通常のFlow Nodeだけでなく、Modifier、Paint内部要素、Krokodove、USD、Deep、MediaIn / MediaOut等の関連項目も含むdocumentation inventoryです。

21.1 Reference Manualとの照合で独立sectionを確認できた項目は追加し、既存catalogのlegacy項目は役割・data domainを保ったreader-first形式へ移行しました。正確なruntime Tool registry件数とは分けて扱います。

## 本文passの状態

reader-first本文passは完了しています。

- 旧generated templateのまま残っていた196ページを、役割・入出力domain・使うときの判断・最小構成・Family導線・確認範囲を持つ形式へ移行
- 旧template marker: 0
- `description` と同じ一行をそのまま `主な用途` に繰り返すpattern: 0
- 全Node categoryにFamily Overviewあり
- 21.1 Manualで主要ControlやInputを確認できたNodeは、確認できた内容を具体的に記述
- Manual側の情報が一行要約等に限られる項目は、`source-limited` として未確認Controlを推測しない

つまり、全420ページが同じ情報密度という意味ではありません。**Manualで深く確認できたページ**と**役割・domainまでを安全に説明するsource-limitedページ**を意図的に区別しています。

## Familyから探す

- [合成ノード（Compositing）](./compositing/) — Merge / MultiMerge / Dissolve
- [Transform / Formatノード](./transform/) — 配置・perspective・解像度変換
- [Maskノード](./masks/) — Primitive / Spline / Image由来 / Paint
- [Blur / Filterノード](./blur-filter/) — blur・glow・sharpen・filter
- [Colorノード](./color/) — tone・channel・white balance・color management
- [Matte / Keying](./matte-keying/) — key・matte・Alpha cleanup
- [Trackingノード](./tracking/) — Point / Planar / Camera tracking
- [Optical Flow / Motion](./optical-flow/overview) — motion vector解析とframe生成
- [Generatorノード](./generators/) — Background・noise・text等のsource
- [Shapeノード](./shapes/) — vector Shapeの生成・加工・render
- [Particleノード](./particles/) — emit・force・behavior・pRender
- [Classic 3Dノード](./3d/) — Geometry / Camera / Merge / Renderer
- [3D Material / Lightノード](./materials-lights/) — surface materialとlighting
- [USDノード](./usd/) — load・prim編集・material・light・render
- [Deep / Auxiliary Channelノード](./deep/) — true Deep ImageとAOV post-process
- [Warp / Distort](./warp/) — displacement・grid・lens・vector warp
- [Paint](./paint/overview) — Paint Nodeと内部Stroke / Clone要素
- [Modifier](./modifiers/) — Parameterを式・Spline・Path等で駆動
- [Time / Metadata / Utility](./time-metadata/) — retime・metadata・DoD・bit depth
- [Utility / I/O](./utility-io/) — Loader / Saver / MediaIn / MediaOut / routing
- [Stereo 3D](./stereo/) — 左右眼の位置合わせ・視差・深度変換・立体視形式
- [Position / World Position](./position/) — 各画素のXYZ位置・Volume Fog・Volume Mask（記事のURLは維持）
- [Immersive / 360°](./immersive/) — lat-long・spherical処理
- [LUT](./lut/) — LUT適用・生成・解析
- [Krokodove](./krokodove/) — Image / Shape / 3D / Regionをdomain別に案内

## まずConceptを読むFamily

Node名だけではdata domainが分かりにくいFamilyは、LearnのConceptを先に読むと理解しやすくなります。

- [シェイプ（Shape）](../learn/02-data/shape)
- [パーティクル（Particle）](../learn/02-data/particle)
- [Classic 3D scene](../learn/02-data/classic-3d)
- [USD scene](../learn/02-data/usd)
- [Deep Image](../learn/02-data/deep-image)
- [補助Channel / AOV](../learn/02-data/auxiliary-channels)
- [マスク（Mask）](../learn/02-data/mask)

## 各Nodeページで確認すること

Node Referenceは、分類名と一行要約だけを並べる一覧ではありません。確認できている範囲で、次を判断できることを基準にします。

- **役割** — 入力前と出力後で何が変わるか
- **入力 / 出力** — 何を接続し、何のdata domainが返るか
- **主な設定** — Manualで確認できたControlを変えると何が変わるか
- **最小構成** — 役割を確認できる短いGraph
- **運用例 / 判断** — 何を作るときに使うか、似たNodeとどう選ぶか
- **Family / Concept導線** — 前提となる用語・data domainへ戻れるか
- **出典と確認範囲** — Manual確認、source-limited、runtime未確認を区別

「ShapeをGrid複製」「式で駆動」のような一行だけでは完成扱いにしません。Manualに詳細がないページでも、読者が少なくともdata domainと役割、次の接続先を判断できるところまでは説明します。

## 21.1 Manualで深くした代表例

- Shape: [sGrid](./shapes/sgrid)、[sDuplicate](./shapes/sduplicate)、[sEllipse](./shapes/s-ellipse)、[sRender](./shapes/s-render)
- Compositing: [Merge](./compositing/merge)、[MultiMerge](./compositing/multi-merge)、[Dissolve](./compositing/dissolve)
- Transform: [Transform](./transform/transform)、[Resize](./transform/resize)、[Crop](./transform/crop)
- Masks: Chapter 108掲載の10 Mask Node
- Blur / Filter: Chapter 92 / 99の現行掲載Node
- Color: Chapter 93とSwizzler
- Tracking: Tracker / Planar Tracker / Planar Transform / Camera Tracker
- Particles: Chapter 114掲載20 Node
- Classic 3D / Materials: core scene / renderer / camera / geometry / light
- USD: Chapter 121掲載27 Node
- Deep: Chapter 95のDeep ImageとChapter 96のDeep Pixel / AOV
- Krokodove: Chapter 105の85記名項目をdomain別に整理

## まだ「未完了」とするもの

本文passとruntime verificationは別です。次は本文完成の未達ではなく、別verification waveとして扱います。

- 現行Resolve 21.1実機のvisible tool name / REGID
- native / installed extensionの所属
- exact Input / Output端子
- default / range
- Free / Studio差
- 各最小Graphの実機render結果
- representative Node graph / Inspector / Before-After画像

画像は文章を補う実例として後から追加します。全ページへ空placeholderを置くことはしません。

詳細なManual照合状況は `docs/fusion-211-manual-coverage.md` を参照してください。
