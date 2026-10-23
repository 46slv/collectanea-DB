---
title: TextのContent / 配置 / 見た目 / 動きを分ける
description: Text+を1つの巨大設定として扱わず、文字内容・配置・見た目・アニメーション・公開controlの責任を分離するPattern。
doc_type: pattern
verification: partial
aliases: [text architecture, motion graphics text]
concepts: [parameter-ownership, reuse, animation]
patterns: [separate-content-layout-style]
nodes: [Text+, Transform, Merge]
tasks: [text, title, motion-graphics, template, reuse]
level: intermediate
product_scope: fusion
---

# Textの内容 / 配置 / 見た目 / 動きを分ける

## 使う場面

Text+だけで文字・位置・見た目・アニメーションを全部調整し続け、後からtemplate化したときに何を触ればよいか分からなくなる問題です。

## 前提となる考え方

- [User Controlsで公開インターフェースを作る](../../learn/06-reuse/user-controls)
- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)
- [キーフレーム / スプライン / 時間（Keyframe / Spline / Time）](../../learn/05-time/keyframes-spline-time)

## 基本構成

Text systemを次の責任へ分けます。

```text
Content
  text string
      ↓
Layout
  position / box / alignment
      ↓
Style
  shading / color / appearance
      ↓
Motion
  time / expression / transform
      ↓
Composite
  Merge
```

実装上すべてがText+内部にある場合でも、**設計上の責任**は分けて考えます。

## 保つべき条件

- 内容と配置を同じ意味controlにしない。
- 見た目とアニメーションを独立して変更できるようにする。
- public controlsは利用者が変更すべきintentだけを見せる。
- position責任をText+とTransformの両方へ無秩序に持たせない。
- repeated titleでは基準となる値を明示する。

## バリエーション

### Simple title

Text+だけで内容 / 見た目 / basic 配置を持ちます。

#### 実機の参考例

<!-- capture-reuse:R58 -->

S08はText+のStyled TextとFontをTextタブで設定し、Shadingの別Elementで赤いアウトラインを追加した固定タイトルです。内容と見た目を別の設定面で扱っています。

[![S08の実機撮影。Inspectorの設定](/img/fusion/captures/S08/inspector.png)](/img/fusion/captures/S08/inspector.png)

[![S08の実機撮影。Text+のShading設定](/img/fusion/captures/S08/shading.png)](/img/fusion/captures/S08/shading.png)

[![S08の実機撮影。Viewer出力](/img/fusion/captures/S08/result.png)](/img/fusion/captures/S08/result.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS08の参考例です。未確認の範囲：FollowerやWrite Onの時間変化、Macroの公開項目、フォント全般。 [撮影条件と確認範囲](/img/fusion/captures/S08/capture.json)

### Separate transform

Text+は内容 / 見た目、Transformはposition / scale / rotationを持ちます。

#### 実機の参考例

<!-- capture-reuse:R59 -->

S23ではText+のSourceBをTransform1で配置し、Merge1で青いSourceAへ重ねます。文字を作るNodeと位置を変えるNodeを分けた静止例です。

[![S23の実機撮影。Node Editorの接続](/img/fusion/captures/S23/graph.png)](/img/fusion/captures/S23/graph.png)

[![S23の実機撮影。Inspectorの設定](/img/fusion/captures/S23/inspector.png)](/img/fusion/captures/S23/inspector.png)

[![S23の実機撮影。左右Viewerの比較](/img/fusion/captures/S23/compare.png)](/img/fusion/captures/S23/compare.png)

[![S23の実機撮影。背景へ合成した結果](/img/fusion/captures/S23/final.png)](/img/fusion/captures/S23/final.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS23の参考例です。未確認の範囲：キーフレームやExpressionによるMotion、User ControlsやTemplate公開。 [撮影条件と確認範囲](/img/fusion/captures/S23/capture.json)

### Template-ready

User ControlsへText、Color、Position等の意味controlを集約し、内部GraphをMacro / Templateにします。

## Nodeの選び方

- Text+ — text image generation
- Transform — 配置 役割を独立させる候補
- Merge — backgroundとの合成

## 失敗しやすい点

- Text+とMergeの両方でpositionを調整し、管理元が分からない。
- アニメーション用offsetを内容/配置のbase 値へ混ぜる。
- templateに内部controlを大量公開する。
- titleごとに同じ見た目を手入力し、再利用関係がない。

## この構成を使う手順

- [Text+をImageへ重ねる](../../recipes/text-graphics/text-over-image)
- [再利用可能なTitle構造を作る](../../recipes/text-graphics/reusable-title-structure)

## 関連Node

- [Text+](../../nodes/generators/text-plus)
- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)
