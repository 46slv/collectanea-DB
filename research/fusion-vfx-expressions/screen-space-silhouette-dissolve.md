---
title: スクリーンスペース・シルエット粒子化の調査
description: UE5 NiagaraのScreen Space × Stencil Dissolveと、Resolve 21.1 / Fusionでの2D近似案・未確認点を区別する。
doc_type: research
verification: partial
product_scope: fusion
aliases: [screenspace dissolve, stencil particle dissolve, silhouette particles, 粒子消滅]
nodes: [pImageEmitter, pEmitter, pRender, pTurbulence, pDirectionalForce, Dissolve, Fast Noise, Magic Mask]
tasks: [dissolve, disintegration, particle-reveal, subject-compositing]
updated: "2026-10-23"
---

# スクリーンスペース・シルエット粒子化の調査

**対応ID: D-01 / D-02 / D-04 / D-10**。対象は人物・ロゴ・文字。ここは**方式調査**であり、Resolve/Fusion上で完成したRecipeではありません。

## 調査の問い

人物を砂のような粒子へ変えて消すとき、単純な「人物から粒子を飛ばす」以外に、輪郭の密度を一定に保つ方法はあるか。UE5の記事で示された考え方を、Fusion 21.1では何に置き換えられるか。

## 原記事から確認できること（UE5）

出典: [HeyYo CG / Beyond Skeletal Mesh Location: A “Silhouette Cutout” Approach to Dissolve Effects](https://heyyocg.link/en/ue5-screenspace-dissolve-overview/)（公開 2026-10-20、確認 2026-10-23）。

記事は、メッシュ表面へ粒子を直接撒く `Skeletal Mesh Location` 方式では、ポリゴン密度の差が粒子密度に反映され、髪や手に粒が集まり、胴体が疎になり得ると説明しています。

代替として示されるのは次の**画面空間（Screen Space）を使ったシルエット切り抜き**です。

1. 対象人物が画面のどこに映るか、画面上の矩形範囲（Screen Bounds）を求める。
2. その矩形領域を粒子で埋める。
3. Custom StencilとDepthの情報で人物の領域だけを残す。記事ではNiagaraのScratch Pad、G-Buffer、Particle Attribute Reader等を扱っています。

**重要な区別:** 元記事の主眼は「粒子を画面上のシルエットへ均等に配置する」ことです。**「消える輪郭の帯から粒子を発生させる」方式そのものを説明した記事ではありません。** 消失境界からの放出は、ここで別途立てるFusion側の追加仮説です。

## Fusion 21.1で確認できる機能

下表の**Node単体の役割は公式Reference Manualで確認した内容**です。接続した最終演出の動作は未検証です。

| Node / 処理 | マニュアルで確認できたこと | 参照 |
| --- | --- | --- |
| `pImage Emitter` | 入力2D画像の画素を一定の格子として粒子化し、元画像の色を扱う。密度、Alpha Threshold、色の固定、毎フレーム粒子生成を制御できる | Chapter 114, pp.2672–2674 |
| `pEmitter` | BitmapのRegionを粒子発生範囲にでき、Region由来の色も使用できる | Chapter 114, pp.2660–2664 |
| `pTurbulence` | 粒子位置へ不規則な動きを加える | Chapter 114, pp.2689–2690 |
| `pDirectionalForce` | 粒子へ一定方向の力を加える | Chapter 114, pp.2658–2659 |
| `pRender` | 粒子を2D画像または3Dに変換。2D出力なら通常のMergeへ渡せる | Chapter 114, pp.2678–2679 |
| `Dissolve` | `Gradient Wipe` で画像の輝度マップによる表示切替ができ、Fast Noise等を使える | Chapter 94, pp.2208–2210 |
| `Magic Mask` | クリック指定と追跡で人物／物体のマットを作成する | Chapter 109, pp.2534–2536 |

一次資料: [Blackmagic Design Support / DaVinci Resolve 21.1 Reference Manual](https://www.blackmagicdesign.com/support)（2026年9月版）。

## Fusionで試す構成案 A：人物の見える範囲を2D粒子化

人物のRGBA画像（背景は透明）を作った上で、粒子系と人物の消去系を分岐します。

```text
映像 ──→ 人物の切抜き（Magic Maskなど） ─┬─→ pImage Emitter
                                      │        ↓
                                      │    pTurbulence
                                      │        ↓
                                      │   pRender (2D) ──┐
                                      │                  │
                                      └─→ Dissolve ──────┤→ Merge → 出力
                                         (浸食/透明化)   │
背景（クリーンプレートなど）────────────────┘
```

- まず**静止した文字／アルファ付きPNG**で粒子の密度を確認する。人物マットや背景除去は別工程として追加する。
- `pImage Emitter` は画素に基づく粒子生成なので、UE5の「スクリーン上の領域で密度を揃える」という狙いに近づけられる可能性がある。
- 透過画素から無駄な粒子を作らないよう `Alpha Threshold` を確認する。公式Manualでは、完全透明な画素を取り除く目安として `1/255 ≈ 0.004` を示す。
- `Lock Particle Color to Initial Frame` を使うか否かは、元画像の色が時間変化してほしいかで決める。
- `pImage Emitter` の初期動作は**最初に一組の粒子を生成**する方法。毎フレーム粒子を追加すると短時間で粒子数が増えるため、消去中の短い期間に限定する案を比較する。

**未確認:** この構成はあくまで2D近似です。UE5のCustom Stencil / G-Buffer DepthをFusionのマスクへそのまま変換できるわけではなく、映像だけから隠れた3D位置は得られません。人物が回転・移動する場合の粒子追従も、実機で確認する必要があります。

## 構成案 B：消える境界からだけ粒子を出す

こちらは原記事の手法ではなく、**消失過程の見え方を強める追加案**です。

1. 同じ被写体へ、少し進行度の異なる2種類のノイズワイプを作る。
2. そのAlphaの差から「直前まで見えていて今消えた細い帯」を抽出する。
3. 帯をBitmap Regionとして `pEmitter` に渡し、消失の進行と同期して粒子を発生させる。
4. 静的な粒子化（A）と、逐次発生する粒子（B）の結果を比較する。

正しい閾値・差分演算、境界抽出Nodeの組み方、消失と粒子の同期は**未検証**です。差分から人物の色も持たせる際は、元RGBとアルファの扱いを分けて確認します。

## UE5とFusionで揃うこと／揃わないこと

| 比較軸 | UE5原記事 | Fusionの今回の近似案 |
| --- | --- | --- |
| 粒子の分布基準 | スクリーン上の人物範囲 + Stencil | アルファ付き2D画像を画素サンプリング／Bitmap Region |
| 形状の取得 | エンジン内のメッシュとStencil | Magic Mask、Keyer、Roto、PNG |
| 奥行きと遮蔽 | Depth / G-Bufferを利用 | 2Dでは自動取得不可。別Depth素材や3D再構築が必要 |
| 発生の時間制御 | Niagara側のカスタム処理 | pImage Emitterの初回／毎フレーム生成とマスク時間変化を実験 |
| 使う素材 | ゲーム内3Dオブジェクト | 撮影動画・透過画像・生成テキスト |

## 最初に試す実験

| 順番 | 入力 | 見る点 | 合格条件（提案） |
| --- | --- | --- | --- |
| 1 | 透過PNGの円・Text+ | アルファ閾値と格子密度 | 輪郭外に不要粒子が出ず、形を判別できる |
| 2 | 同じ素材 | pTurbulence / pDirectionalForce | 発生直後の形が読み取れ、時間経過で狙い通り散る |
| 3 | ノイズで消す文字 | 消失時間と粒子発生時間 | 消える箇所と粒子の出生位置が一致する |
| 4 | 移動する人物クリップ | Magic Mask追従、色、背景復元 | 人物の位置から粒子が生まれ、背景の破綻が目立たない |
| 5 | 長めのコンポジション | Pre-Roll、再生開始位置、密度 | 途中フレームへ飛んでも同じ結果が再現できる |

検証で記録する項目は [実機検証計画](./verification-plan) にまとめます。現時点では**全実験未実施**です。

## 参照先

- [全73候補の索引](./index)
- [実機検証計画](./verification-plan)
- [外部・公式資料の出典一覧](./sources)
- [COLLECTANEA: pImage Emitter](https://46slv.github.io/collectanea-DB/manuals/fusion/nodes/particles/pimageemitter/)
- [COLLECTANEA: 最小Particle chain](https://46slv.github.io/collectanea-DB/manuals/fusion/recipes/particles/basic-particle-chain/)
