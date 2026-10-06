---
title: Text+をImageへ重ねる
description: Text+で2D文字Imageを作り、Layout / Shadingを整えてMergeのForegroundとして映像へ重ねる最小Recipe。
doc_type: recipe
verification: partial
aliases: [text over image, title overlay]
concepts: [foreground-background, compositing]
patterns: [stack-images-with-merge]
nodes: [Text+, Merge]
tasks: [text, title, composite]
prerequisites: [foreground-background]
level: foundation
product_scope: fusion
updated: "2026-10-04"
---

# Text+をImageへ重ねる

## できあがるもの

Text+で作った2D text Imageを、背景Imageの上へ重ねます。

```text
Text+ ──────┐
            ├─ Merge → Output
Image ──────┘
```

## 必要なもの

- 背景にする2D Image
- Text+
- Merge

## 手順

1. Text+を追加します。
2. Styled Textへ表示する文字を入力します。
3. Font、Size、Colorを決めます。
4. Layout tabで配置方法を選びます。通常のtitleならPoint、一定領域へ収めるならFrameが候補です。
5. Shading Element 1で基本fillを確認します。
6. 背景ImageをMergeのBackgroundへ接続します。
7. Text+をMergeのForegroundへ接続します。
8. Merge OutputをViewerで確認します。

## 配置をどこで持つか

Text+自身のLayoutで位置を持たせる方法と、Text+の後ろへTransformを置く方法があります。

### Text+で配置する

```text
Text+ → Merge
```

単純なtitleならNode数が少なく、Layout Type / CenterをText+だけで管理できます。

### Transformへ分ける

```text
Text+ → Transform → Merge
```

文字内容と、画面内での最終配置・animationを分けたい場合に向きます。

同じpositionをText+ LayoutとTransformの両方で調整すると、後からどちらがoffsetを持っているか分かりにくくなるため、責任を決めます。

## Outlineを追加する

Text+のShading tabでは最大8個のShading Elementを持てます。

基本fillはElement 1です。outlineを追加したい場合は別Elementを有効にし、AppearanceをText Outlineへ設定します。

fillとoutlineを別Elementにすると、色・Opacity・Thickness等を独立して調整できます。

## 文字を順番に出す

単純な表示範囲animationならText tabのWrite Onを使えます。

characterごとに位置・scale・opacityを時間差で変えたい場合はFollowerを使います。

Write OnとFollowerは役割が違うため、まず「表示範囲を伸ばしたい」のか「各文字へanimationを伝えたい」のかを決めます。

## うまくいかないとき

- Text+単体をViewerへ出すと文字が見えるか。
- Text+はMergeのForeground、背景ImageはBackgroundへ入っているか。
- Text+のColor AlphaやShading Opacityが0になっていないか。
- LayoutのCenterがframe外へ出ていないか。
- Text+ Layoutと外部Transformで位置を二重管理していないか。
- MergeへEffect Maskが接続され、文字の合成範囲を制限していないか。

## 関連する考え方

- [Generatorノード](../../nodes/generators/)
- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)
- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)

## 関連パターン

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)
- [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary)

## 関連Node

- [Text+](../../nodes/generators/text-plus)
- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)

## 出典と確認範囲

Text+の2D Image出力、Styled Text / Layout / Shading / Write On / FollowerはDaVinci Resolve 21.1 Reference Manual Chapter 103 pp.2380–2400、MergeのForeground / BackgroundはChapter 94 pp.2211–2219を基にしています。

実機のtitle design結果は未追試のため `verification: partial` を維持します。
