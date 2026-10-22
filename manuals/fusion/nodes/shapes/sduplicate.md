---
title: "sDuplicate"
description: "Shapeを複製し、コピーごとの移動・縮小・回転・アニメーションの時間差を作るFusionのShape Node。"
doc_type: node
term_id: "sduplicate"
term_short: "sDuplicateはShapeを複数コピーし、コピーごとに位置・大きさ・回転などを変化させるNode。"
verification: partial
aliases: ["sDuplicate"]
concepts: ["shape-data", "vector-shape", "rasterization"]
nodes: ["sDuplicate"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Copies", "Copy Probability", "Time Offset", "X Offset", "Y Offset", "X Size", "Y Size", "Axis Mode", "Rotation", "Random Seed"]
tasks: ["build-shape", "procedural-graphics", "repeat-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-23"
---

# sDuplicate

sDuplicateは、入力した<Term id="shape-data">Shape</Term>をコピーし、コピーが増えるたびに位置・大きさ・回転を変えていくNodeです。たとえば、同じ円を右へずらしながら小さくすれば、奥へ続くような円の列を作れます。元の円を描き直す必要はありません。

コピーの数を変えても、元のShapeやその後の処理を組み直さずに済みます。輪郭や配置を扱うShapeデータのまま出力されるため、画像として表示するときは`sRender`につなぎます。

## 入力と出力

- **Input1（オレンジ、必須）**：コピー元となるShapeを受け取ります。`sEllipse`などの単一図形だけでなく、`sMerge`や`sBoolean`でまとめた複数図形も渡せます。
- **出力（Shape）**：元のShapeと複製したShapeを、後段のShape系Nodeや`sRender`へ渡します。通常の2D Imageとは異なります。

~~~text
sEllipse → sDuplicate → sRender → Merge
                                       ↑
                                  MediaIn（背景映像）
~~~

この構成では、円を複製した結果を`sRender`で画像に変換し、`Merge`で映像に重ねます。ShapeをそのままMergeへ接続する構成ではありません。

Shapeと画像の違いは[シェイプ（Shape）](../../learn/02-data/shape)で説明しています。

## コピーはどう増えるか

**Copies**は「追加するコピーの数」です。元のShapeを含む総数ではありません。たとえばCopiesを`5`にすると、元の1個とコピー5個で合計6個になります。

sDuplicateでは、次のコピーに対する移動・拡大縮小・回転を設定します。設定を重ねることで、等間隔の列だけでなく、徐々に小さくなる反復や、回転を伴う配置を作れます。

- **Copy Probability**：各コピーが生成される確率を調整します。すべての位置に必ず図形を置きたい場合は、意図せず欠けていないか確認してください。
- **Time Offset**：上流で設定したアニメーションの参照時刻を、コピーごとにずらします。`-1.0`なら、1つ目のコピーは元より1フレーム前、次はさらに1フレーム前の状態を参照する例がManualに示されています。
- **X / Y Offset**：コピー間の横・縦の移動量です。前のコピーから次のコピーへ指定した量だけずれます。
- **X / Y Size**：前のコピーに対する大きさの倍率です。`1.0`は同じ大きさ、`0.5`は次のコピーが前の半分の大きさになります。
- **Rotation**：コピーごとに加える回転角度です。前のコピーに対する回転の差として計算されます。

Offsetはピクセル数ではなく、Fusionの正規化座標を基準に考えます。ManualではX Offsetを`0.5`にすると、次のコピーが画面幅の半分に相当する距離だけ右へ移動する例を挙げています。座標系そのものは[正規化座標](../../learn/03-space/normalized-coordinates)を参照してください。

## Axis Mode：どこを中心に回転するか

回転の中心（Pivot）をどこに置くかによって、同じRotation値でも見た目が変わります。Axis Modeには次の4つがあります。

| モード | 回転の中心・コピーの扱い |
| --- | --- |
| **Absolute** | 元のShapeの位置を基準に指定したX/Y Pivotを使い、その回転中心もコピーとともにずらします。 |
| **Origin Relative** | コピーそれぞれの中心を回転軸として使います。個々の図形を回す場合の出発点です。 |
| **Origin Absolute** | 元のShapeの中心を、各コピーの回転軸として使います。 |
| **Progressive** | 前のコピーの位置・回転・大きさをもとに、次のコピーへ変形を積み重ねます。 |

**X / Y Pivot**はAxis ModeをAbsoluteにしたときに表示され、回転中心を配置するために使います。他のモードでは、回転中心の決まり方が異なります。

同じ形を同じ角度で一括回転させたいだけなら、複製のRotationを使うのではなく、元のShapeのAngleや後段の[sTransform](./stransform)で全体を変形した方が目的に合います。

## 具体例1：小さくなりながら続く円の列

1. `sEllipse`で小さな円を作り、`sDuplicate`のInput1へ接続します。
2. `sDuplicate`の出力を`sRender`へ接続します。
3. **Copies = 5**にし、元の円を含めて6個表示されることを確認します。
4. **X Offset = 0.12 / Y Offset = 0**を目安に、右方向へ列を伸ばします。
5. **X Size = 0.85 / Y Size = 0.85**を試し、次の円ほど小さくなることを確認します。

~~~text
元の円  ○ → ○ → ○ → ○ → ○ → ○
        大                   小
~~~

値はこの練習用の設定例です。円の初期サイズや位置によっては重なったり画面外へ出たりするため、表示を見ながらOffsetを調整してください。

**Copiesは個数、Offsetは移動、Sizeは倍率**を担当しています。3つを別々に変えると、どの設定が何を変えたか分かりやすくなります。

## 具体例2：回転と縮小を積み重ねる

円では回転の変化が見えにくいため、まず[sNGon](./sngon)や[sStar](./sstar)など、向きが分かる図形を入力します。

1. `Copies`を増やし、`Rotation`に`20`程度の値を入れます。
2. `X / Y Size`を`0.9`程度にして、後のコピーほど小さくします。
3. `Axis Mode`を**Origin Relative**にして、各コピーが自分の中心で回転する状態を確認します。
4. **Origin Absolute**と**Progressive**へ切り替え、回転の基準位置や変形の累積がどう変わるか比べます。
5. 必要ならOffsetや元図形の位置を調整し、図形が重なりすぎない配置へ整えます。

回転の様子は元図形の位置やサイズにも左右されます。「回転値を入れれば必ず螺旋になる」という仕様ではありません。**回転中心と移動量の組み合わせ**を確認して使います。

## 具体例3：同じアニメーションを時間差で繰り返す

元のShapeに位置や回転のキーフレームを設定してから、`sDuplicate`を挿入します。たとえばTime Offsetを`-2`にすると、後続のコピーはそれぞれ2フレーム前の状態を参照する設定になります。

これは「コピーがそれぞれ独立した新しいキーフレームを持つ」という意味ではありません。上流にアニメーションがなければ、Time Offsetを変えてもその時間差は見えません。また、素材の長さや参照先の時間範囲によって表示を確認する必要があります。

## Jitter：整列したコピーに差をつける

Inspectorの**Jitter**タブでは、コピー間にランダムなばらつきを加えられます。Controlsタブで規則的に並べた後、少しだけ均一さを崩したいときに使います。

| 設定 | 変化するもの |
| --- | --- |
| **Random Seed / Reseed** | ランダムな変化の組み合わせを選び直します。 |
| **Center X / Y** | コピーごとの位置のばらつきです。 |
| **Pivot X / Y** | Jitterによる追加回転の中心のばらつきです。ControlsタブのRotationによる回転には作用しません。 |
| **Size / Lock size** | コピーごとの大きさのばらつきと、そのサイズ設定のロックです。 |
| **Angle** | コピーごとのZ回転のばらつきです。 |
| **Gain（RGBA）** | チャンネル値へのランダムな乗算を加えます。 |
| **Blur** | コピー間のBlur量をばらつかせます。 |

Jitterの位置だけを少し変えたいなら、まずCenter X/Yだけ調整し、SizeやAngleはそのままにします。複数の値を同時に大きく変えると、どの設定が原因で図形がずれたのか判断しにくくなります。

Controlsタブには、複製した図形へ色を設定する**Style**もあります。色の扱いをまとめて変更したい場合は、後段の[sChangeStyle](./schangestyle)との役割の違いも確認してください。

## sGridとの違い

[sGrid](./sgrid)は行数・列数を決めて、図形を横と縦へ規則的に並べるNodeです。5列×4行のドット模様ならsGridが直接的です。

sDuplicateはコピーの進行につれて位置・大きさ・回転や参照時刻を変えたいときに適しています。単に並べるだけなら、用途に合わせて使い分けます。

## 表示がおかしいとき

- **何も見えない**：Input1にShapeがつながっているか、結果を`sRender`へ送っているか確認します。Shape出力そのものは通常の画像として表示しません。
- **コピー数が1個多い**：Copiesは追加数です。元の1個も描画対象に含まれます。
- **画面外に飛ぶ**：正規化座標によるOffsetの値と、元のShapeの位置を確認します。
- **回転位置が意図と違う**：Rotation値だけでなくAxis Modeを見直します。AbsoluteではX/Y Pivotも確認します。
- **時間差が出ない**：元のShapeにアニメーションがあるか、Time Offsetで参照する時間がその範囲に入るか確認します。
- **毎回同じ規則的な並びになる**：不規則さが必要ならJitterタブの設定とRandom Seedを確認します。

## 関連Node

- [sGrid](./sgrid) — 行数・列数を指定した整列
- [sJitter](./sjitter) — 既存のShapeや配列へランダムな変化を加える
- [sTransform](./stransform) — 複製結果全体への移動・回転・拡大縮小
- [sRender](./s-render) — Shapeを2D Imageへ変換する

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、**pp.2735–2738**。Input1、Copies、Copy Probability、Time Offset、Offset・Size・Rotation、Axis Mode 4種類、Absolute時のPivot、Style、Jitterの各項目を照合しました。

数値を使った制作手順はManualの仕様をもとにした**練習用の設定例**です。実機描画、処理負荷、内部REGID、Edition別の差異は未検証のため、`verification: partial`を維持します。
