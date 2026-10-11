---
title: "sDuplicate"
description: "Shapeを連続複製し、位置・大きさ・回転・アニメーションの時間差やランダムな変化をコピーごとに付けるノード。"
doc_type: node
term_id: "sduplicate"
term_short: "sDuplicateは、入力したShapeを連続複製し、コピーごとに移動・拡大縮小・回転などを加えるノード。"
verification: partial
aliases: ["sDuplicate"]
concepts: ["shape-data", "vector-shape", "rasterization"]
nodes: ["sDuplicate"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Copies", "Copy Probability", "Time Offset", "X Offset", "Y Offset", "X Size", "Y Size", "Axis Mode", "X Pivot", "Y Pivot", "Rotation", "Random Seed"]
tasks: ["build-shape", "procedural-graphics", "repeat-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-12"
---

# sDuplicate

sDuplicateは、入力した<Term id="shape-data">Shape</Term>を繰り返し複製し、コピーごとに位置、大きさ、回転などを変えるノードです。小さくなりながら続く図形、回転しながら並ぶ装飾、時間差で動く図形群などを、一つの元Shapeから作れます。

Shapeは円やパスなどの図形情報で、通常のピクセル画像とは異なります。初めて扱う場合は[Shapeの基礎](../../learn/02-data/shape)を確認してください。sDuplicate自体は画像を描画せず、[sRender](./s-render)を通すと通常の2D Imageになります。

## 入力と出力

**Input1（オレンジ、必須）**はShape入力です。[sEllipse](./s-ellipse)や[sRectangle](./srectangle)が作った単独の図形を接続できます。[sMerge](./smerge)で複数の図形をまとめたものや、[sBoolean](./sboolean)で重なりを加工した複合Shapeも受け取れます。複合Shapeを入れた場合は、その組み合わせを複製元として使います。

**出力**は複製されたShapeです。後段のShapeノードで処理を続けるか、sRenderへ渡して画像化します。通常のImage用Mergeに重ねるときは、まずsRenderで変換します。

~~~text
sRectangle → sDuplicate → sRender → Merge
                                     ↑
                               背景画像と合成
~~~

## Controlsタブ

### Copies：元の図形に何個追加するか

Copiesは**追加するコピーの数**で、元のShapeを含みません。例えばCopiesを5にすると、元のShapeが1個、追加コピーが5個の計6個になります。まずほかの設定を変えずにCopiesだけを増やすと、同じ位置に重なる図形と複製数の関係を確認できます。

### Copy Probability：コピーの生成確率

Copy Probabilityは複製されるShapeの生成確率を調整します。すべての位置に図形を置くのではなく、一部が抜けた反復模様にしたいときに使います。Manualは確率の役割を説明していますが、内部的な抽選順序や各コピーへの適用方式までは示していません。

### X Offset / Y Offset：コピー間の距離

X OffsetとY Offsetは、**直前のコピーから次のコピーをずらす距離**です。Xを正にすると右方向、負にすると左方向の反復を作れます。両方に値を与えると斜めに並びます。

値はFusionの[正規化座標](../../learn/03-space/normalized-coordinates)で解釈されます。Manualの例では、X Offsetを0.5にすると各コピーがフレーム幅の半分だけ右へ、-1.0ならフレーム幅の分だけ左へ移動します。**0.5ピクセルという意味ではありません。**

見た目の間隔を決める際は、複製元の図形の大きさも合わせて調整します。Copiesだけを増やしても、Offsetが0のままなら重なって一つに見える場合があります。

### X Size / Y Size：段階的な拡大・縮小

X SizeとY Sizeは、前の図形に対する次のコピーの大きさの倍率です。両方1.0なら同じ大きさを保ち、両方0.5なら**次のコピーが直前のコピーの半分**になります。例えば最初の複製が元の半分、その次はさらに半分という関係です。

XとYを異なる値にすれば横方向と縦方向で変化率を分けられます。これは「完成した全コピーをまとめて縮小する」操作とは異なり、コピー列の中で大きさを変化させます。

### RotationとAxis Mode：回転量と回転中心

Rotationは各コピーに加える回転量です。回転は前のコピーから引き継ぐ差分として計算されます。**すべての図形を同じ角度に回転させる**のであれば、元ShapeのAngleなどを変更するか、後段に[sTransform](./stransform)を置きます。

Axis Modeはコピーの回転中心の扱いを選びます。

- **Absolute**：元Shapeを基準としてX/Yの回転中心を指定します。指定した軸もコピーとともに移動します。
- **Origin Relative**：各コピー自身の中心を回転中心にします。
- **Origin Absolute**：各コピーが元Shapeの中心を回転中心にします。
- **Progressive**：直前のコピーの位置・回転・スケールをもとに、次のコピーへ変形を重ねます。

**X Pivot / Y Pivot**はAxis ModeがAbsoluteのときに表示され、回転軸の位置を指定します。回転中心の違いにより、同じRotationでもその場で向きが変わる並びと、中心を回り込むような並びでは結果が異なります。最初は元Shapeと少数のコピーで比較すると違いを追いやすくなります。

### Time Offset：上流の動きに時間差を付ける

Time Offsetは、**複製元のShapeに設定されたアニメーション**をコピーごとに別の時刻で参照するための設定です。例えば上流の円の位置や大きさをアニメーションさせた場合、コピーを同時に同じ姿で表示する代わりに、動きが順々に伝わる構成を作れます。

Manualには-1.0を与えると最初のコピーが1フレーム前、次のコピーがさらに1フレーム前の動きを示す例があります。ただしこの例の説明にはShape以外の立体物も登場するため、**この値があらゆるShape構成で同じ視覚効果になるとは扱いません**。時間差が効いているかは、上流へキーフレームを付けて数フレーム進めて確認します。

### Style：複製した図形の色

Styleには複製Shapeへ色を指定するためのコントロールがあります。色の設計を複製元へ持たせるか、複製後に変えるかは、どの段階で色を統一したいかによって決めます。複数図形のスタイルを後段で一括変更したい場合は[sChangeStyle](./schangestyle)も参照してください。

## Jitterタブ：コピーごとの差をランダムにする

Jitterは、Controlsで作ったコピーごとに不規則な差を加える設定群です。単純な等間隔配置が整いすぎて見えるときに使います。

- **Random Seed / Reseed**：ばらつきの出発点を変更します。ほかの設定が同じでも、Seedが異なれば異なる配置になり得ます。
- **Center X / Y**：各コピーの位置に与えるばらつき量を調整します。
- **Pivot X / Y**：Jitterによる追加回転の中心をばらつかせます。ControlsタブのRotationによる回転には作用しない、とManualに明記されています。
- **Size / Lock Size**：コピーのスケールのばらつきを調整し、Lock Sizeでサイズの扱いを制限します。
- **Angle**：コピーのZ軸回転へランダムな差を加えます。
- **Gain（RGBA）/ Blur**：Manualではチャンネル値の倍率とコピーごとのぼかしのばらつきとして説明されています。Shape出力を画像へ変換する前後の具体的な描画結果については21.1実機確認を行っていません。

JitterのCenter X/Yは基本となるX/Y Offsetを置き換えるものではありません。まずControlsで反復の方向と規模を決め、次に必要な分だけJitterを加えると、意図した配置から外れすぎるのを避けられます。

## 具体的な制作例

### 1. 右に進むほど小さくなる図形の列

~~~text
sRectangle → sDuplicate → sRender → Merge
~~~

1. sRectangleで最初の四角形を作ります。
2. sDuplicateのCopiesを5にします。元の四角形と追加5個が対象です。
3. X Offsetを正の値にして、次の図形を右へ移動させます。重なりすぎるならOffsetを増やすか、元の四角形を小さくします。
4. X SizeとY Sizeをそれぞれ0.8など1.0未満にします。右へ進むほど段階的に小さくなります。
5. sRenderで画像に変え、Mergeで映像に重ねます。

単に同じ大きさの四角形を複数並べるのではなく、**距離とサイズがコピーごとに変わる**連続的な装飾を作る例です。背景の罫線、タイトル周囲のリズムを付ける図形などに使えます。

### 2. 回転の中心を変えた反復模様

~~~text
sStar → sDuplicate → sRender
~~~

1. [sStar](./sstar)で小さな星を作り、複製後の変化が追える位置に置きます。
2. Copiesを少数に設定し、Rotationに値を入れます。
3. Axis ModeをOrigin Relativeにすると、各コピーがそれぞれの中心を基準に回転します。
4. Origin Absoluteへ切り替えると、元Shapeの中心を共有する回転になります。必要ならAbsoluteでX/Y Pivotを動かして比較します。
5. Progressiveでは前のコピーの変形をもとに次の位置・向きを作るため、単純な等間隔の列とは別の配置を試せます。

星がどこを中心に動くかを決める例です。装飾を放射状に配置したい場合や、連続した図形の向きに変化を付けたい場合に使います。最終的な模様は元Shapeの位置と各Offsetにも依存するため、単一パラメータだけで特定の形になるとは限りません。

### 3. アニメーションを時間差で連ねる

~~~text
sEllipse（位置またはサイズをキーフレームで動かす）
    ↓
sDuplicate（Copies / Offset / Time Offset）
    ↓
sRender → Merge
~~~

1. sEllipseの位置またはサイズをキーフレームで変化させ、まず一つの円だけが動く状態を作ります。
2. sDuplicateで少数のコピーを作り、X/Y Offsetでコピー同士を離します。
3. Time Offsetを0以外にして再生し、各コピーに時間差が生じるか確認します。
4. 動きのずれを見ながら値を調整し、sRenderで映像に合成します。

同じ動きを少しずつ遅らせて繰り返す装飾や、連続する円の動きに順番を付けたい場合の構成です。**Time Offsetは新しいアニメーションを自動生成する設定ではありません**。上流が静止したShapeなら、位置やサイズのキーフレームを用意して初めて時間差を観察できます。

### 4. 一部が欠けた不揃いな反復

~~~text
sEllipse → sDuplicate → sRender → Merge
~~~

まずCopiesとX Offsetで一列の円を作ります。次にCopy Probabilityで生成されるコピーの量を変え、JitterのCenter X/YとSizeを少し加えます。元の等間隔の列を基準にしながら、円が存在しない箇所や微妙な位置・大きさの差を持つパターンを試せます。

ばらつきの配置を変えたいときはRandom Seedを変更します。Copy Probabilityの抽選とSeedの関係はManualに明記されていません。特定の乱数分布や欠ける順序は断定せず、結果をsRenderのViewerで確認してください。

## sGrid・sJitter・sTransformとの違い

**[sGrid](./sgrid)**は列数と行数を直接指定し、同じ間隔の格子に並べることが主目的です。例えば同じ大きさの円を6列×4行にするならsGridが分かりやすくなります。一方、次のコピーほど小さくなる、回転角が積み重なる、といった**コピー間の連続した変化**にはsDuplicateが向きます。

**[sJitter](./sjitter)**は、入力されたShapeや配列にばらつきを加えるための別ノードです。sDuplicateにもJitterタブがあるため、複製とランダム化を一つのノードで扱うか、後段のsJitterで分けて管理するかを選べます。

**[sTransform](./stransform)**はShapeの位置・サイズ・回転を変えますが、Copiesのような複製数の指定はありません。複製元だけを変えたいならsDuplicateより前、できあがった図形群をまとめて動かしたいなら後に置きます。

## 想定と違うとき

- **Copiesを増やしても一つに見える**：X/Y Offsetが0に近く、図形が同じ位置へ重なっていないか確認します。
- **コピーが小さくなりすぎる**：X/Y Sizeが1.0未満だと、コピーが進むごとに小さくなります。元ShapeのサイズとCopiesを合わせて見直します。
- **回転の軌道がおかしい**：Rotationだけでなく、Axis Modeと、Absolute時のX/Y Pivotを確認します。
- **Time Offsetを変えても違いがない**：複製元にアニメーションがあるかを先に確認し、数フレーム進めて比較します。
- **通常のMergeに接続できない**：出力はShapeです。sRenderで2D Imageへ変換します。

[Shapeノード一覧](./)では、生成・加工・複製・結合・画像化の各役割からノードを探せます。

## バージョンと出典

**出典**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、**pp.2735–2738**。Input1、Shape出力、Copies、Copy Probability、Time Offset、X/Y Offset、X/Y Size、Axis Mode、X/Y Pivot、Rotation、Style、Jitterの各項目を参照しました。

制作例はManualに記載された挙動を組み合わせた運用例で、本文の具体的な設定値による描画結果を21.1実機で確認したものではありません。内部REGID、正確な性能特性、Edition差、各乱数設定の詳細な計算方法は未検証です。そのためverificationはpartialのままです。
