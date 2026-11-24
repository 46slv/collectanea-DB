---
title: レシピ（Recipes）
verification: partial
description: 制作目的から具体的な手順へ進む入口。
doc_type: index
product_scope: fusion
slug: /fusion/recipes
---

# レシピ（Recipes）

具体的な完成結果から引く手順です。長い概念説明はここへ複製せず、Learn / Patternsへ戻します。

## 合成（Compositing）

- [2つのImageを重ねる](./recipes/compositing/two-image-merge)
- [複数ImageをMultiMergeでまとめる](./recipes/compositing/multi-merge-layers)
- [Fast NoiseとDisplaceで熱気の揺らぎを作る](./recipes/compositing/heat-shimmer-with-fast-noise-displace)
- [反転したEllipse Maskでソフトビネットを作る](./recipes/compositing/soft-vignette-with-inverted-ellipse)
- [Soft Glowで街灯の光だけを柔らかくにじませる](./recipes/compositing/soft-glow-for-isolated-highlights)

## マスク（Masking）

- [Mergeの適用範囲をMaskで限定する](./recipes/masking/limit-merge-with-mask)
- [OpenEXRのObject IDで車体だけ色補正する](./recipes/masking/exr-object-id-selective-grade)

## Text / Graphics

- [Text+をImageへ重ねる](./recipes/text-graphics/text-over-image)
- [再利用可能なTitle構造を作る](./recipes/text-graphics/reusable-title-structure)

## 配置

- [TransformでImageを移動する](./recipes/layout/move-image-with-transform)

## アニメーション

- [TransformをKeyframeで動かす](./recipes/animation/animate-transform-center)
- [sStarとsTransformで自転・公転する星を作る](./recipes/animation/animate-star-spin-and-orbit-with-stransform)
- [sMergeとsTransformで複数の図形をまとめて動かす](./recipes/animation/move-shape-group-with-stransform)
- [移動するタイトルにTransformのMotion Blurを加える](./recipes/animation/add-motion-blur-to-moving-title)
- [sRenderのMotion Blurで移動する図形に動きぼけを加える](./recipes/animation/add-motion-blur-to-moving-shape-with-srender)
- [sRectangleのLengthで角丸枠を描き進める](./recipes/animation/animate-rounded-rectangle-outline-with-length)
- [sDuplicateのTime Offsetで円の輪郭を順番に描く](./recipes/animation/stagger-ring-drawing-with-sduplicate)
- [sOutlineで複数の図形の輪郭をまとめて描く](./recipes/animation/draw-shape-group-with-soutline)
- [sNGonのPositionで多角形の切れ目を移動させる](./recipes/animation/move-polygon-gap-with-sngon-position)
- [sBSplineで丸い図形を伸び縮みさせる](./recipes/animation/morph-blob-with-sbspline)
- [sJitterのRandomとPoint Jitterで円の輪郭を揺らす](./recipes/animation/wobble-outline-with-sjitter-random)
- [OpenEXRのMotion Vectorで車の動きにブラーを加える](./recipes/animation/exr-motion-vector-blur)
- [Optical FlowのベクトルをOpenEXRへ保存・再利用する](./recipes/animation/optical-flow-exr-roundtrip)

## 自動化

- [2つのTransform位置を連動する](./recipes/automation/link-transform-centers)
- [複数要素を等間隔に配置する考え方](./recipes/automation/equal-spacing-by-index)

## Color

- [透明エッジ（Edge）を保って色補正する（Color Correct）](./recipes/color/transparent-edge-color-correction)

## Matte / キーイング

- [KeyしてBackgroundを置き換える](./recipes/matte-keying/key-and-replace-background)

## トラッキング

- [Trackerで車の動きにテキストを追従させる](./recipes/tracking/point-track-text-callout)
- [平面をtrackしてgraphicへ適用する](./recipes/tracking/planar-track-graphic)
- [Planar Trackerで壁の汚れを固定・補修して元の動きへ戻す](./recipes/tracking/planar-steady-paint-rewarp)
- [Planar TrackerとTime Stretcherで1フレームの補修を追従させる](./recipes/tracking/planar-clean-plate-freeze-track)
- [看板のロゴを通行人の背後に隠す](./recipes/tracking/planar-foreground-occlusion)
- [Surface Trackerでシャツのロゴを追従させる](./recipes/tracking/surface-track-shirt-logo)
- [Surface Trackerで動く肌を修正して元の動きへ戻す](./recipes/tracking/surface-track-stabilize-rewarp-skin-fix)
- [Surface Trackerの追従マスクを色補正へ渡す](./recipes/tracking/surface-track-alpha-effect-mask)

## Particles

- [最小Particle chainを作る](./recipes/particles/basic-particle-chain)

## Shapes

- [Shapeを2D Imageへrenderする](./recipes/shapes/basic-shape-render)
- [sMergeで3色の図形を重ね、前後関係を変える](./recipes/shapes/layer-three-shapes-with-smerge)
- [sRenderで同じ図形を2種類の解像度に画像化する](./recipes/shapes/render-shape-at-two-resolutions)
- [sTextとsGridで文字を格子状に並べた背景を作る](./recipes/shapes/repeat-text-with-stext-sgrid)
- [sEllipseで塗りなしの円形アウトラインを作る](./recipes/shapes/outline-circle-with-sellipse)
- [sPolygonで開いたベジェ曲線の線を描く](./recipes/shapes/draw-open-bezier-curve-with-spolygon)
- [sBooleanで長方形に円形の穴を開ける](./recipes/shapes/cut-circle-from-rectangle-with-sboolean)
- [sBooleanの穴あきカードをsOutlineで縁取る](./recipes/shapes/outline-punched-card-with-soutline)
- [sGridで重なる半透明ドットのAllow Combiningを比較する](./recipes/shapes/compare-allow-combining-on-overlapping-dots)
- [sGridとsJitterのFixedで不規則なドットを作る](./recipes/shapes/scatter-dots-with-sjitter-fixed)
- [sDuplicateで右下へ小さくなる円の列を作る](./recipes/shapes/progressive-shrinking-dots-with-sduplicate)
- [sChangeStyleで図形の配色を部分変更・一括変更する](./recipes/shapes/recolor-icon-group-with-schangestyle)
- [sExpandで星の外側にステッカー風の縁を作る](./recipes/shapes/star-sticker-border-with-sexpand)

## Classic 3D

- [Classic 3D sceneを2Dへrenderする](./recipes/3d/basic-classic-3d-render)
- [Camera Trackerで実写に3Dオブジェクトを固定する](./recipes/3d/camera-track-3d-object)

## USD

- [USD sceneを2Dへrenderする](./recipes/usd/basic-usd-render)

## Deep

- [Deep 合成を2Dへ戻す](./recipes/deep/deep-merge-to-image)

現在 **53 Recipe** です。

## 表現の収集（実機検証待ち）

- [定番VFX表現73件の調査](https://46slv.github.io/collectanea-DB/research/fusion-vfx-expressions/) — 粒子化・文字・遷移・グリッチ・光学・実写合成・時間・3Dを、完成映像から探す候補集です。
- [スクリーンスペース・シルエット粒子化](https://46slv.github.io/collectanea-DB/research/fusion-vfx-expressions/screen-space-silhouette-dissolve/) — UE5の記事の方式とFusionの近似案を区別しています。

これらはまだ記事化していない調査候補です。上の53件のRecipeにも実機未検証のものがあるため、各記事の`verification`と本文に記載された検証範囲を確認してください。

## 検証待ち

公式資料や実機で操作名と挙動を検証し、個別Recipeへの昇格を検討する候補:

- 外周を維持したまま内側を調整する構成
- PNGの内径を広げる

未検証候補を完成手順として本文へ混ぜません。
