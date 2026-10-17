---
title: 3D Material / Lightノード
description: Classic 3Dの材質・テクスチャ・照明を選び、物体への接続、影の確認、Merge 3Dでのライトの作用範囲を理解する。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, shade-3d, light-3d]
updated: "2026-10-15"
---

# 3D Material / Lightノード

ここでは、<Term id="classic-3d">Classic 3D</Term>で物体をどのように見せ、照らすかを扱います。

**Material（材質）**は物体の表面の色や光沢、反射などを決めます。同じ球体でも、つや消しのプラスチックにするか、磨いた金属に見せるかが変わります。**Light（ライト）**は、その表面へどの方向から、どれくらいの強さで光を当てるかを決めます。形を作る[Shape 3D](../3d/shape-3d)とは役割が異なります。

Materialは物体の**Material入力**へ接続します。一方、ライトは物体やカメラと同じ[Merge 3D](../3d/merge-3d)へまとめます。この出力はまだ3Dシーンなので、[Renderer 3D](../3d/renderer-3d)で2D画像に変換します。

```text
Phong（材質） ─→ Shape 3DのMaterial入力 ──┐
Point Light ─────────────────────────┤
Camera 3D ───────────────────────────┤
                                     └→ Merge 3D → Renderer 3D → 2D画像
```

## Materialを選ぶ

「表面を何に見せたいか」から選びます。Materialは形状を増やすのではなく、3D物体が光を受けたときの見え方を調整します。

- [OpenPBR](./openpbr) — 色・反射・透過・コーティングなどを一つの材質で調整
- [Phong](./phong) / [Blinn](./blinn) — 明るい反射部分（ハイライト）を持つ基本的な材質
- [Cook Torrance](./cook-torrance) — 表面の細かな凹凸による反射の広がりを扱う材質
- [Ward](./ward) — 一方向に伸びた光沢など、方向性のある反射
- [Bumpmap](./bumpmap) — 画像で表面の細かな凹凸感を付ける。実際の形状は増やさない
- [Reflect](./reflect) — 物体表面への映り込みを扱う
- [Material Merge 3D](./material-merge-3d) — 複数の材質を組み合わせる
- [Texture](./texture) / [Texture Transform](./texture-transform) — 画像の模様を使い、貼り付ける位置・向きを調整

**2D Imageと3D Materialは別のデータです。** Shape 3DなどはMaterial入力に画像を接続すると組み込み材質のテクスチャとして使い、専用Materialを接続すると組み込み材質を置き換える構成があります。画像をMerge 3Dへ直接つないでも3D物体にはなりません。

## Lightを選ぶ

| Light | 何が起きるか | 適した場面 |
| --- | --- | --- |
| [Ambient Light](./ambient-light) | 特定の方向を持たず暗い面にも明るさを足す。自分では影を作らない | 全体の暗部を補う |
| [Directional Light](./directional-light) | シーンを同じ方向から平行な光で照らす。位置より回転が重要 | 日差し、一方向に伸びる影 |
| [Point Light](./point-light) | 1点から周囲の全方向へ照らす | 電球、局所的な光 |
| [Spot Light](./spot-light) | 決まった方向へ円錐状に照らし、照射範囲を絞る | 舞台照明、被写体へのスポット |
| [DomeLight](./dome-light) | HDR／SDR画像でシーンの周囲から照らす | 環境画像に合わせた照明 |

これらはClassic 3D用です。[USDノード](../usd/)のライトは異なるシーン形式を使い、Merge 3DとUSDのuMergeをそのまま接続しません。

## 照明や影が見えないとき

1. ライトが物体と同じMerge 3Dに入っているかを確かめます。ライト単体をViewerに表示しても完成画像にはなりません。
2. **3D Viewer**ではLighting／Shadowsの表示を、**Renderer 3D**ではEnable Lighting／Enable Shadowsを確認します。Viewerでの表示切り替えと最終的な2Dレンダリングの設定は別です。
3. 物体側のLighting設定も確認します。Shape 3Dなどには**Affected by Lights**（光を受ける）、**Shadow Caster**（影を落とす）、**Shadow Receiver**（影を受ける）があります。
4. ライトのIntensityや向き、影の個別設定を確認します。Manualでは、Lightingを無効にすると100%のAmbient Lightで照らしたような表示になると説明されています。「ライトが効かないのに明るい」ときもLightingの設定を確認してください。

## 複数のMerge 3Dで照明を分ける

背景と手前の物体を別々のライトで照らしたい場合、Merge 3Dの**Pass Through Lights**で光の作用範囲を分けられます。

```text
Object A + Light A → Merge 3D A ─┐
                                 ├→ Merge 3D B → Renderer 3D
Object B ────────────────────────┘
```

Manualによれば**Pass Through Lightsは既定でOFF**です。**上流のMerge 3D A**でOFFなら、Light Aは下流のMerge 3D Bで追加したObject Bを照らしません。ONにすると、Light AがObject Bにも届きます。設定を変える場所は、ライトを含んだ上流側のMerge 3D Aです。複数のシーンを結合して照明の範囲が変わった場合、この設定を確認します。

## 関連する考え方

- [Classic 3D scene](../../learn/02-data/classic-3d) — 3Dシーンとレンダリングの基礎
- [Classic 3Dノード](../3d/) — 物体・カメラ・Merge 3D・Renderer 3D
- [USDノード](../usd/) — 別の3Dシーン形式

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）のChapter 84「3D Compositing Basics」pp.1824–1826、1842–1843、1851–1852とChapter 89「3D Light Nodes」、Chapter 90「3D Material Nodes」を参照しました。Material入力、照明の有効化、各ライトの基本動作、Pass Through Lightsの既定状態と作用範囲はManualに基づきます。

材質ごとの細かなInspector項目、ライトの正確なruntime端子・REGID、Renderer間の差、Edition差はこの一覧だけで断定せず、各ノードの記事や21.1実機で確認します。
