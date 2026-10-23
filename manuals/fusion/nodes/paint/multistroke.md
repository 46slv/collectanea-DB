---
title: Multistroke
description: Paint内で多数のブラシ操作を軽く処理する描画方式。初期表示は1フレームで、描画後に個々の線を編集できない。
doc_type: node
term_id: multistroke
term_short: Paint内部で多数のストロークを効率よく描く方式。表示期間と筆先を描く前に決める。
verification: partial
aliases: [Multistroke]
concepts: [paint, image-data]
nodes: [Multistroke]
node_family: paint
controls: [Brush Shape, Apply Mode, Size, Softness, Duration]
inputs: []
outputs: []
tasks: [paint, cleanup, clone]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Multistroke

Multistrokeは、**Paintノードの中で多数のブラシ操作をまとめて記録する描画方式**です。小さな傷を何十箇所も補修するような作業で、1本ずつ編集可能な[Stroke](./stroke)より処理を軽くできます。その代わり、**描画後に各ストロークの形や位置を個別に修正できません**。

単体のFlowノードとして画像を受け渡すものではありません。Paintを選択したとき、Viewer上部の描画ツールバーから使う内部要素です。

## 入力と出力

Multistroke自体にFlow上の独立した入出力端子はありません。画像を処理するのは[Paintノード](./paint.md)です。

- **PaintのInput（オレンジ）**：必須の2D画像。素材やBackgroundを接続します。解像度はこの画像で決まります。
- **PaintのEffect Mask（青）**：任意。描画の適用範囲を制限するマスクを接続します。クローン元の画像入力ではありません。
- **Paintの出力**：Multistrokeで描いた内容を反映した2D画像。MergeやMediaOutなどへ接続します。

~~~text
MediaIn → Paint（内部でMultistrokeを選択）→ MediaOut
~~~

透明な描画レイヤーを作る場合も、まず透明なBackgroundをPaintへつなぎ、そのPaint出力をMergeのForegroundに接続します。

## Strokeとの違い

| 項目 | Multistroke | Stroke |
| --- | --- | --- |
| 向く作業 | 同じフレーム内に大量の細かな描画をする | 補修線を後で調整したりアニメーションさせたりする |
| 初期の表示期間 | **1フレーム** | コンポジション全体 |
| 描画後の経路修正 | 個々の線は修正できない | Make Editableなどで経路を編集できる |
| 表示期間 | 描く**前**にDurationを設定する | 描いた後もKeyframes Editorで変更できる |
| 多数の線を扱う負荷 | 多数の補修操作に適する | 数百本では処理が重くなることがある |

Multistrokeを描くたびにModifiersへ独立した項目が増えるわけではありません。**多数の線が一つのMultistroke項目にまとめられます**。Keyframes Editorには期間が表示されますが、描画後にその期間を編集する用途には使えません。修正が必要なら適切な設定で描き直すか、最初からStrokeを選びます。

## 操作と主な設定

1. PaintをFlowに追加して2D画像を接続し、Viewerへ表示します。
2. Viewer上部のPaintツールバーから**Multistroke**を選びます。Paintノードを新しく増やす操作ではありません。
3. Inspectorの**Brush Shape**で筆先、**Size**で直径、必要に応じて**Softness**で縁の柔らかさを調整します。
4. **Apply Mode**で描画内容を選びます。Colorなら色を描画し、Cloneなら参照位置の画素を複製します。MultistrokeはClone専用ではありません。
5. **Duration**を描画前に設定します。初期値は1フレームです。複数フレームに同じ修正を表示したい場合は先に期間を決めます。
6. 修正したいフレームで描画し、再生位置とDurationの範囲を確認します。

Cloneを使う場合はAlt / Optionを押しながら参照したい位置をクリックして複製元を選びます。別のノードの画像を参照する場合は、PaintのInspectorで参照画像を指定します。Effect Mask端子へ画像をつなぐ操作ではありません。

## 実際の運用例

### 1フレーム内に多数ある小さな汚れを修正する

~~~text
MediaIn（汚れがある素材）→ Paint → MediaOut
                             └─ Multistrokeで修正
~~~

古いフィルムの傷や撮影時の細かな汚れが大量にある1フレームを想定します。Multistrokeを選び、周囲の画素を使いたいときはApply ModeをCloneに変更します。筆先を汚れより少し大きく設定し、模様が似た場所を参照して複数箇所を描きます。初期Durationが1フレームなので、隣のフレームにはこの修正が残りません。各フレームで汚れの位置が違う修復に向いています。

**複製作業だけ**なら、最初からCloneモードになる[Clone Multistroke](./clone-multistroke)を選ぶ方が操作を減らせます。修正箇所が少なく、後から境界や位置を直したい場合はStrokeの方が適切です。

### 動く物体の上に複数の補修をまとめて置く

被写体上の複数の小さなマーカーを補修し、一定期間同じ補修を使う場合は、**描画前にDurationを必要なフレーム数へ変更**します。描いたMultistrokeの個々の線は動かせませんが、[Paint Group](./paint-group)にまとめればグループ全体の位置・角度・大きさをアニメーションさせたり、追跡データへ接続したりできます。被写体の変形、遮蔽、照明変化まで自動的に直るわけではないため、全区間で補修跡を確認します。

## 注意点と関連項目

- Durationは描画後に自由に延長する設定ではありません。作業範囲が分かっているときは**描く前に**決めます。
- Paint Groupで動かせるのはまとめた補修全体です。Multistroke内部の各線を個別に再編集できるようになるわけではありません。
- ブラシ設定はすべての描画方式で同一表示ではありません。Multistrokeで使う設定を確認してから描きます。
- [Paint全体の解説](./paint.md)と[Paintツールの一覧](./)で、Stroke・Clone・Fillなどの選択基準を確認できます。

## バージョンと出典

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 113「Paint Node」pp.2638–2645（特にp.2639のMultistroke、p.2644のDuration、p.2645のModifiers）、Chapter 80「Paint」pp.1748–1750、1756を確認。独立端子ではなくPaint内部の描画方式であること、初期Duration 1フレーム、描画後の編集制限、Paint Groupとの関係を根拠付きで記載しました。Resolve 21.1実機でのREGID・全パラメータ初期値や挙動の確認は未実施のため、verificationはpartialです。
