---
title: Channel Shifter（Krokodove）
description: RGBAの各成分を個別にずらす・ぼかす・拡大縮小するKrokodoveノード。色ずれ表現、接続例、Alphaの注意点を解説。
doc_type: node
term_id: channel-shifter
term_short: 画像のRGBA成分を分けて扱い、各成分の位置・ぼけ・大きさを変えるKrokodoveの画像加工ノード。
verification: partial
aliases: [Channel Shifter, Krokodove Channel Shifter]
concepts: [image-data]
nodes: [Channel Shifter]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# Channel Shifter（Krokodove）

**Channel Shifter**は、画像の赤・緑・青・透明度を表す4つの成分（RGBA）を分けて扱い、それぞれの**位置をずらす・ぼかす・拡大縮小する**ためのKrokodoveノードです。元の絵柄を大きく動かさずに、色だけがわずかにずれた輪郭や、色ごとにぼけ方が違う表現を作るときに使えます。

たとえば白い文字の赤成分を右、青成分を左へ少しずらすと、文字の縁に赤や青系の色が現れることが期待できます。これは**RGBを別々に加工した結果を重ねて見る**という考え方です。以下の構成例は制作・検証の提案であり、公式Manualの作例や実機での再現結果ではありません。

## RGBAを分けると何が起こるか

<Term id="image">2D Image</Term>は、画素ごとに赤（Red）、緑（Green）、青（Blue）の色成分と、<Term id="alpha">Alpha</Term>（透明度に関わる成分）を持ちます。通常、白い図形の輪郭はこれらの成分が同じ位置に重なって見えます。

Channel Shifterで色成分ごとの位置や大きさを変えると、**成分が再び同じ位置にそろわなくなり**、輪郭付近で色の違いが見えることがあります。色成分をぼかせば、ぼかした成分が周囲へ広がるため、元の輪郭とは異なる色のにじみを作る方向にも利用できます。

ここでの「分ける」は、**4つの画像ファイルや独立した出力端子を生成する**という意味ではありません。21.1 Manualが確認できるのは「RGBAを分離して、offset / blur / scaleを操作する」という機能の概要です。独立出力の数や内部処理の順序は、これだけでは分かりません。

## 入力と出力

| 段階 | データ | 接続・結果 |
| --- | --- | --- |
| 入力 | 2D Image | Text+の文字、Backgroundで作った図形、画像素材などを渡す。 |
| 処理 | RGBA成分の調整 | 各成分に位置ずれ・ぼかし・拡大縮小を加える。 |
| 出力 | 2D Image | 変化した画像をViewerで確認し、Mergeなどの画像合成へ渡す。 |

21.1 Manualでは**Image Pixel Tools**に分類され、既存のCOLLECTANEAカタログでも入力・出力はimageとして整理されています。Shapeや3D Sceneを直接処理するためのノードではありません。

**正式な入力端子名・出力端子名・補助入力の有無・端子数は未確認**です。表はデータの種類と接続時の役割を説明しており、ポート構成を実機認証したものではありません。

## 主な調整の意味

公式Manualに書かれている操作の種類は次の3つです。ここに示す英語は機能の説明であり、**Inspectorに表示される正式なパラメータ名ではありません**。

| 操作 | 何が変わるか | 表現の例 |
| --- | --- | --- |
| Offset（位置ずれ） | 色成分の位置をずらす。 | 文字や図形の輪郭に色のずれを作る。 |
| Blur（ぼかし） | 色成分の輪郭をやわらかくする。 | 赤成分だけが周辺に広がるような色のにじみを試す。 |
| Scale（拡大縮小） | 色成分の大きさを変える。 | 画像の中心付近と外側で色の輪郭がそろわない表現を試す。 |

Offsetがどの座標系を使うか、Scaleの基準点、ぼかしの方式、RGBAの処理順や初期値は、Manualの一覧表からは分かりません。Inspectorに実際に表示された項目を確認して操作してください。

## 最小構成：白い文字で色ずれを観察する

最初は写真ではなく、**輪郭のはっきりした白い文字**を使うと変化を見つけやすくなります。

```text
Text+（白文字・透明背景） → Channel Shifter → Merge（Foreground）→ MediaOut
                                              ↑
                                       Background（背景色）
```

この構成は、効果の変化を観察するための**提案手順**です。

1. Text+で太めの白い文字を作り、背景が透明であることを確認します。元のText+とChannel Shifterの出力を別々のViewerへ表示します。
2. Channel ShifterのInspectorを開き、実際にある色成分の位置調整項目を探します。赤成分を一方向、青成分を反対方向へ**小さく**移すことを目標に、一度に1項目だけ変えてみます。
3. 元画像と比べ、文字の中心だけでなく**左右の縁**に注目します。色の縁が見えたら、移動量を戻すとどう変わるかも確認します。
4. 次にぼかし、拡大縮小に関わる項目を一つずつ試します。どの色がどの部分へ広がるかを比べ、最初から複数の操作を同時に重ねないようにします。
5. 結果をMergeの前景（Foreground）へ、背景色のBackgroundを背景（Background）へ接続し、暗い背景と明るい背景の両方で確認します。

「赤を右へ数ピクセル、青を左へ数ピクセル」というのは**目指す見た目の具体例**です。移動単位、軸の符号、チャンネル別の操作方法を21.1実機で確定した設定値ではありません。

## 運用例：RGB Split風の短いアクセント

MVの文字が現れる数フレームだけ、色の輪郭を一瞬広げて元へ戻す演出を考えます。

まず文字の読みやすさを保った状態を作り、Channel Shifterで少し色ずれを加えた状態を比較します。使う位置が決まったら、Inspectorの**実際にアニメーション可能な項目**だけを使って変化を付けるか、元画像と加工画像を別の経路で切り替えます。Channel Shifterのすべての項目がキーフレーム対応であると、この説明だけから断定はできません。

同じ手法は、ロゴの短い登場演出、字幕の強調、色ずれのあるグラフィックにも応用候補になります。ただし「色収差」「グリッチ」と呼ばれる表現を**自動的に生成する専用プリセット**があるという意味ではありません。

## Alphaを含むため確認したい点

Channel ShifterはRGBだけでなく**A（Alpha）も扱う**と記載されています。Alphaは合成時に画像をどの程度見せるかに関わるため、色成分の輪郭とAlphaの輪郭が一致しなくなると、Merge後の見た目が予想と異なる可能性があります。

- 加工前後でViewerの**Alpha表示**も確認し、透明領域と色の輪郭がどう変わるかを観察します。
- 黒背景では気付かない縁が、明るい背景や別映像へ合成すると目立つことがあります。背景を切り替えて比較します。
- どの操作がAlphaにどう作用するか、premultiplyを内部でどう扱うかは未確認です。「Alphaは変更されない」「必ず縁が欠ける」のどちらも断定しません。
- 画面外や端での色成分の扱い、補間、処理負荷も実機で確認が必要です。

## 似たノードとの違い

| ノード | 主な役割 | 選ぶ目安 |
| --- | --- | --- |
| **Channel Shifter** | RGBAの成分ごとに位置・ぼけ・大きさを調整する。 | 1枚の画像の中で、色成分の見え方をずらしたい。 |
| [Channel Booleans](../color/channel-boolean) | 別のImageやchannelを選んでCopy・Addなどで組み替える。 | どの成分をどの出力channelへ送るかを制御したい。 |
| [Chromatic Aberration Removal](../color/chromatic-aberration-removal) | レンズ由来の色ずれを見つけて補正する。 | 撮影素材の色収差を減らしたい。 |
| [Transform](../transform/transform) | 画像全体の位置・回転・大きさを変える。 | RGBをばらさず、画像をまとめて動かしたい。 |

Channel ShifterとChannel Booleansはいずれも「チャンネル」を扱いますが、**位置を動かすこと**と**成分の割り当て・演算を変えること**は別の作業です。また、撮影レンズの実際の色収差と同じ物理現象を再現するとまでは確認されていません。

関連する基礎概念は[画像（Image）](../../learn/02-data/image)、Krokodoveの分類と他のツールは[Family Overview](./)を参照してください。

## バージョンと出典

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2435、Image Pixel Tools — Channel Shifter**。RGBAチャンネルの分離とoffset / blur / scaleが記載されています。

**関連資料：** 同Manual Chapter 93（Channel Booleans、Chromatic Aberration Removal）。比較ノードの具体的な役割は、リンク先の各記事に記載したManual根拠を参照してください。

本記事のチャンネルの説明と用途は確認済みの機能から組み立てたものです。制作例は再現結果ではなく**操作・観察の提案**です。21.1実機での正式ポート、Inspector名、初期値、範囲、Alpha処理、製品・エディション差は未確認のため、`verification: partial`を維持しています。
