---
title: uDuplicate
description: USDの物体を並べて複製するuDuplicateのCopies、変形、Jitter、Region、Instancing、Time Offsetを21.1基準で解説する。
doc_type: node
term_id: uduplicate
term_short: uDuplicateは、USDシーン内の物体を繰り返し複製し、間隔や回転、ばらつき、配置範囲を調整するノード。
verification: partial
aliases: [uDuplicate, uDp]
concepts: [usd-scene, transform, procedural-layout]
nodes: [uDuplicate]
node_family: usd
controls: [USD Instancing, Copies, Time Offset, Transform Method, Transform Order, Translation, Rotation, Pivot, Scale, Random Seed, Randomize, Jitter Probability, Translation Jitter, Rotation Jitter, Pivot Jitter, Scale Jitter, Region Mode, Region, Limit by Object ID, Object ID]
inputs: [usd, mesh]
outputs: [usd]
tasks: [usd, duplicate, array, scatter]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-19"
---

# uDuplicate

**uDuplicateは、1つのUSDモデルやシーンを繰り返し複製し、列・輪・渦のような配置を作るノード**です。同じ建物を道路沿いに並べる、複数のオブジェクトを少しずつ回転させる、位置や大きさを不規則にして自然な分布に近づける、といった用途に使います。

<Term id="usd-scene">USDシーン</Term>は、立体の形状や配置、材質などを保持できる3Dデータです。uDuplicateが作るのも**複製された3Dシーン**であり、完成した2D画像ではありません。画像として見るには[uRenderer](./u-renderer)で描画します。

uDuplicateは、単に「Copiesで個数を増やす」だけのノードではありません。**各複製に同じ変形をどう繰り返すか、どれだけランダムに変えるか、どの範囲に表示するか**を別々に決められます。

## 入力・出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Scene Input（オレンジ、必須）** | USDシーン／USDオブジェクト | 複製したい立体やシーンを受け取る |
| **Mesh Input（緑、条件付き）** | 3Dメッシュ | **RegionをMeshにした場合だけ**現れ、複製を表示する領域の形として使う |
| **出力** | USDシーン | 複製・変形・表示範囲の設定を反映したUSDデータを後段へ渡す |

最初はScene Inputだけで使えます。Mesh Inputは「2個目の複製元」ではありません。任意の3Dモデルの形を**表示領域の判定に利用するための入力**です。Mesh Inputへ渡せるデータの具体的な相互接続条件は、使用する生成・読み込みノードと21.1実機で確認してください。

~~~text
uShape（立方体） ─→ uDuplicate ───────┐
uCamera ────────────────────────────┼→ uMerge → uRenderer → 2D画像
uDistant Light ─────────────────────┘
~~~

この例では[uShape](./ushape)が1個の立方体を作り、uDuplicateが複数に増やします。[uMerge](./u-merge)でカメラ・照明と合流させると、同じ画面の中で複製結果を確認できます。外部の建物などを使う場合は、uShapeの代わりに[uLoader](./uloader)からUSDファイルを読み込みます。

## Controls：複製の数と変形

### Copies：範囲を決める

**Copiesは単純な「総数」欄ではなく、First CopyからLast Copyまでの範囲を指定するコントロール**です。Manualの例は [0, 3] で、元のオブジェクトを基点に、その後の複製へ順に変形を加えます。

- **First Copy = 0** なら、元のオブジェクトを含む配置を作れます。
- **First Copyを0より大きくする**と、元のオブジェクトは表示対象から外れ、後続の複製だけになります。
- **Last Copy**は範囲の終点です。First Copyと合わせて、どの番号の複製を表示するかを決めます。

「元のモデルも見せたいのか」「元の位置は空け、一定距離移動したコピーから見せたいのか」でFirst Copyの設定が変わります。見えている個数が想定より1つ多い・少ないときは、まずこの範囲を確認します。

### Transform Method：LinearとAccumulated

**Transform Method**は、番号の異なる複製へ移動・回転・拡大縮小をどのように適用するかを選びます。

| 方法 | 変形の考え方 | 見た目の例 |
| --- | --- | --- |
| **Linear** | 複製番号に応じて変形量を計算し、ほかのコピーの結果から独立して適用する | 間隔をそろえた列や、一定の規則で変形する配置 |
| **Accumulated** | 前のコピーの変形後の位置・姿勢を次のコピーの出発点として、さらに変形を重ねる | 曲がりながら続く列や、繰り返すほど変形が積み重なる配置 |

例えばTranslationだけを変えた単純な直線配置では、両方式の差が分かりにくいことがあります。RotationやScaleも組み合わせると、**「元を基準に番号分の変形を計算する」のか、「前の結果に次の変形を積み重ねる」のか**が配置に現れます。複製結果が思いがけず湾曲した場合は、方法を切り替えて比較してください。

### Translation・Rotation・Pivot・Scale

| 設定 | 何が変わるか |
| --- | --- |
| **Translation：X / Y / Z Offset** | コピーごとの位置のずれ。例えばXを1にするとX方向へ1単位ずつずらす設定になる |
| **Rotation：X / Y / Z** | コピーごとに加える回転角 |
| **Rotation Order** | X・Y・Zの回転をどの順に適用するか。XYZならX→Y→Zの順 |
| **Pivot** | 回転の中心として扱う位置 |
| **Scale** | コピーごとに適用する拡大・縮小 |
| **Lock XYZ** | Scaleを3軸まとめて調整するか、X・Y・Zを個別に調整するか |

**Transform Order**は移動・回転・拡大縮小そのものを計算する順序です。21.1 Manualに記載された既定順序は**Scale–Rotation–Transform（SRT）**です。**Rotation Order**は回転の3軸の順序なので、両者は別の設定です。順序を変えると、同じ数値でも最終的な物体の位置が変わることがあります。

**Pivot**を変える場合は、単なる位置移動と、どこを中心に回すかを区別してください。例えば縦方向へ延びる物体を端から回転させたい場合は、Pivotが見た目に大きく影響します。

### Time Offset：動いている元モデルを時間差で並べる

元のUSDジオメトリにアニメーションがある場合、**Time Offset**で複製ごとに参照する時間をずらせます。21.1 Manualは、Y軸回転するCubeを元にして**-1.0**を設定すると、最初の複製が1フレーム前、次がさらに1フレーム前の状態を示す例を挙げています。

静止したモデルをただ並べる場合には、Time Offsetを変えても見た目の差が出ないことがあります。歩行動作を持つ複数のキャラクター、回転するオブジェクト、時間とともに変わるテクスチャ付き平面など、**元に時間変化がある**ときに役立ちます。

ManualではControlsとJitterの両方にTime Offsetの説明が登場します。両欄の値の合成方法や、特定の接続・アニメーション方式での評価順序までは、この節だけでは確定できません。

### uLoaderと組み合わせる：全体の再生時刻とコピーごとの時間差

外部USDのアニメーションを時間差で並べたい場合は、[uLoader](./uloader)で**元のアニメーションをいつ・どの速さで読むか**を決め、uDuplicateで**コピーごとの参照時刻の差**を付けます。名前が似ていますが、uLoaderの**Frame Offset**とuDuplicateの**Time Offset**は作用する範囲が違います。

| 設定 | 影響する対象 | 使う場面 |
| --- | --- | --- |
| **uLoader：Trim** | 入力USDから使うアニメーションの区間 | 長い歩行アニメーションの一部分だけを利用する |
| **uLoader：Time Scale** | 読み込んだUSDアニメーションの再生速度 | すべてのコピーに使う元の歩行速度を変える |
| **uLoader：Frame Offset** | 読み込んだUSDアニメーションの開始位置 | ショット内で動き始めるタイミングを合わせる |
| **uDuplicate：Time Offset** | その入力から作る**各コピーの参照時刻** | 隣り合うコピーのポーズを1フレームずつずらす |

例えば、歩行アニメーションを持つ1体のキャラクターを道路沿いに4体並べるとします。全員が同時に同じポーズになる状態から、時間差のある列へ変える例です。

~~~text
uLoader（歩行アニメーション入りUSD、Trim / Time Scale / Frame Offset）
  → uDuplicate（Copies [0, 3]、X Offsetで間隔、Time Offsetで時間差）
  → uMerge（必要に応じてカメラ・ライトを追加）
  → uRenderer → MediaOut
~~~

1. まず**Time Offset = 0**で4体を並べ、同じフレームでのポーズを見ます。元のUSDにアニメーションがなければ、時間をずらしてもポーズは変わりません。
2. uDuplicateの**Time Offset = -1.0**を試します。Manualの回転する立方体の例では、後続のコピーほど1フレームずつ前のアニメーションを参照します。キャラクターでも同じ考え方でポーズの時間差を確認します。
3. 全員の動きが速すぎる場合はuLoaderの**Time Scale**、列全体の開始タイミングが合わない場合はuLoaderの**Frame Offset**を調整します。コピー間の差だけを変えるならuDuplicateのTime Offsetを使います。
4. Trimの区間端やLoopの切れ目付近では、最初と最後のコピーを含めて複数フレームを確認します。区間外の評価方法、uLoaderとuDuplicateの複合時間計算順序、Controls/Jitter両方に表示されるTime Offsetの関係は、Manualだけでは確定できません。

**確認範囲：** 21.1 Reference Manual、uDuplicateのTime Offset（pp.2896、2898）とuLoaderのTrim / Time Scale / Frame Offset / Loop（p.2903）。上の歩行キャラクターはこれらの記載から組み立てた運用例であり、実機での評価順序・個々のUSDファイルとの互換性は未検証です。

### USD Instancing：同じデータを共有する

**USD Instancing**を有効にすると、各コピーが共通のUSDデータを利用でき、メモリや処理の効率改善が期待できます。一方、コピー同士の差が大きい状況では、かえって効率が下がる場合があると21.1 Manualに記載されています。

これはコピーの「数」や「表示位置」を決める機能ではありません。まず必要な見た目を作り、複製数が多い場面で処理性能を比較するときに、Instancingのオン・オフを検討します。**各コピーを完全に独立編集できるか、どの属性まで共有されるか**は、このManual節の記述だけからは断定しません。

### Time OffsetとUSD Instancingを同時に使う場合

**Time Offset**は複製ごとの参照時刻を変える設定、**USD Instancing**は複製が参照するUSDデータを共有して処理効率を調整する設定です。役割は異なりますが、**共有したデータを時間差のある各コピーとしてどう評価するか**は、21.1 ManualのuDuplicate節だけでは確定できません。「Instancingを有効にすれば時間差が消える」「必ず別ポーズのまま高速化できる」のどちらも、ここでは仕様として断定しません。

例えば、1体の歩行アニメーションを読み込み、4体の行列を時間差で歩かせる場合、次のように**見た目と処理負荷を分けて**確認します。

1. [uLoader](./uloader)からアニメーション付きUSDを読み、uDuplicateの**Copiesを [0, 3]**、TranslationのX Offsetをモデルが重ならない値に設定します。まず**Time Offset = 0**にして、4体の配置と再生が成立することを確かめます。
2. **USD Instancingをオフ**にし、Controlsの**Time Offset = -1.0**へ変更します。時間差が最も見えやすい動作中のフレームで、隣のコピーのポーズがずれているか確認します。Manualの-1.0の例は複製ごとに1フレーム前を参照するものです。
3. **Time Offset・Copies・カメラ・照明を変えずに、USD Instancingだけをオン**にします。同じフレームを表示して各コピーのポーズと位置を比較し、続けて動作の開始・中間・終了付近を確認します。違いがあれば、そのUSDアセットと設定における挙動として記録します。
4. 両設定で見た目が一致した場合に限り、必要な複製数まで増やしてViewerの応答やレンダリング時間を比べます。ManualはInstancingが**常に速いとは限らない**と説明しています。複製数・アセット・環境をそろえずに速度を比較しても、切り替えの効果を判断できません。
5. シーンを外部へ渡す場合は[uExport](./uexport)で保存し、**新しいuLoaderで読み直して、複製の数・各コピーの位置・時間差のあるポーズを複数フレームで比較**します。FusionのViewerで違って見えたことだけでは、書き出し先のUSDに時間差やInstancingの構造が保持されるとは言えません。

Jitterタブにも**Time Offset**がありますが、21.1 Manualの説明はControlsタブとほぼ同じです。Jitter側の値がランダムな時間差になるか、Controls側とどう合成されるかは、同節からは判断できません。上の比較では**Jitter側のTime Offsetを初期値のまま固定**し、まずControls側とInstancingの組み合わせだけを検証します。

**出典・確認範囲：** DaVinci Resolve 21.1 Reference Manual、Chapter 121、p.2896（USD Instancing、ControlsのTime Offset）、p.2898（JitterのTime Offset）、p.2900（uExport）。上記はManualで説明される機能を切り分ける**検証手順**です。Instancingと時間差の実際の互換性、複数Time Offsetの評価順序、書き出し後の保持条件は21.1実機未確認です。

## Jitter：配置を規則から少し崩す

**Jitter**は、同じ変形でそろっているコピーの位置・回転・大きさに、コピーごとのランダムな差を加える仕組みです。例えば電柱を一直線に並べた後、建物や樹木だけに少し位置・向きの違いを付ける、といった表現に向きます。

| 項目 | 役割 |
| --- | --- |
| **Random Seed** | ランダムな変化の出方を決める値。同じ設定でもSeedを変えると配置パターンが変わる |
| **Randomize** | 別のRandom Seedを自動生成するボタン |
| **Jitter Probability** | Jitterの影響を受けるコピーの割合。1.0で100％、0.5で50％が基準 |
| **Translation Jitter** | X・Y・Z方向の位置のばらつき |
| **Rotation Jitter** | X・Y・Z方向の回転のばらつき |
| **Pivot Jitter** | Jitterによる追加回転の中心のばらつき |
| **Scale Jitter** | コピーの大きさのばらつき。Lock XYZを外すと軸ごとに調整できる |

**Jitter Probability = 0.5**は「全コピーを半分の距離に動かす」という意味ではありません。**約半数のコピーに、設定したばらつきを適用する**ための割合です。少数のコピーで厳密に半数になることまで保証する値として扱わないでください。

**Pivot Jitterが作用するのはJitterで追加する回転**です。Controlsタブの通常のRotationに対するPivotをランダム化する設定とは区別します。

一度作った不規則な配置を保持したまま別のパラメータを比較したいときは、Random Seedを固定すると条件をそろえやすくなります。

## Region：コピーを表示する場所を絞る

**Regionは、複製された物体をどの空間領域で表示するか決める機能**です。複製物を作る元モデルを変更するのではなく、コピーの**位置が指定領域の内側か外側か**で表示対象を制限します。

### Region Mode

| モード | 結果 |
| --- | --- |
| **Ignore region** | 領域による表示制限をかけない |
| **When inside region** | コピーの位置が領域の**内側**にあるときだけ表示する |
| **When not inside region** | コピーの位置が領域の**外側**にあるときだけ表示する |

Regionを円形や立方体の境界に設定しても、物体の一部だけを切り抜くマスクとは限りません。Manualが説明するのは**コピーの位置による表示判定**です。立体そのものを境界で分割する処理と混同しないでください。

### Regionの形

**Region**では、Cube、Sphere、Rectangle、Mesh、Allを選べます。直方体の範囲、球状の範囲、平面状の範囲、任意メッシュの形、シーン全体、といった使い分けです。

**Mesh**を選んだ場合、緑色のMesh Inputが現れます。ここへ接続した3Dモデルを表示領域として使います。複数メッシュを含む入力では、**Limit by Object ID**を有効にすると**Object ID**で特定のメッシュを選べます。無効なら複数のメッシュが領域判定に使われます。

**All**はシーン全体を表す領域です。Region Modeを時間で切り替えるような使い方で、複製全体の表示をまとめて変える用途が説明されています。

Regionの形や設定はアニメーションでき、場所に入ってきたコピーが現れたり消えたりする演出にも利用できます。ただし、各フレームの境界上での厳密な判定や補間方法は実機未確認です。

## 制作例1：道沿いに建物を並べる

1. [uLoader](./uloader)で建物のUSDモデルを読み込み、uDuplicateのScene Inputにつなぎます。
2. **Copiesを [0, 5]**に設定し、元の建物と後続のコピーが見える配置から始めます。
3. **TranslationのX Offset**を建物同士が重ならない値に調整します。まずRotationとScaleは変えず、直線に並ぶことを確認します。
4. **Transform MethodをLinear**にして基準の列を作り、必要ならAccumulatedへ切り替えて配置がどう変わるか比較します。
5. 向きや大きさを少し変えたい場合だけ、Jitter ProbabilityとRotation / Scale Jitterを加えます。
6. uMergeにカメラと照明を加えて[uRenderer](./u-renderer)で描画し、交差・隙間・規則性を確認します。

同じ建物が完全に同じ間隔・角度で並ぶのが不自然に感じられる場合でも、最初から強いJitterをかけると道路からはみ出しやすくなります。**基本間隔を確定してから、必要な項目だけに小さなばらつきを加える**と調整しやすくなります。

## 制作例2：球状の範囲にだけオブジェクトを残す

1. uShapeで小さな立体を作り、uDuplicateへ接続します。
2. CopiesとTranslation・Rotationで広い範囲にコピーを配置します。
3. Regionを**Sphere**、Region Modeを**When inside region**にします。
4. Regionの大きさと位置を変え、球状の範囲にあるコピーだけが残ることを確認します。
5. 必要に応じてRegionの設定をアニメーションさせ、コピーが順に現れたり消えたりする様子を確認します。

これは物体を球の表面に「吸着して並べる」操作ではありません。**すでに作ったコピーのうち、指定範囲にあるものを残す**操作です。球面上に等間隔で配置したい場合は、複製の変形とRegionの表示制限を別々に設計します。

## 関連ノードとの使い分け

| ノード | 何をするか | 向いている用途 |
| --- | --- | --- |
| **uDuplicate** | 1つのUSDソースから複数のコピーを作る | 建物の列、反復オブジェクト、少し不規則な配置 |
| [uTransform](./utransform) | USDシーン内の対象を移動・回転・拡大縮小する | 既存の1物体や特定Primの位置・向きを変える |
| [uMerge](./u-merge) | 複数のUSD入力を同じシーンへまとめる | 車と道路、カメラ、ライトを同時に使う |
| [uSwitch](./uswitch) | 複数のUSD入力から1つを選ぶ | 異なるモデル候補を切り替える |
| [uVariant](./uvariant) | USD内部に定義済みのバリエーションを選ぶ | 1アセット内の外観・パーツの候補を切り替える |

uMergeは接続された**別々の入力を統合**し、uDuplicateは**1つの入力からコピーを生成**します。uSwitchは候補を1つ選ぶため、複数コピーを同時に表示する用途の代わりにはなりません。

## 思ったように表示されないとき

| 症状 | 確認すること |
| --- | --- |
| コピーが1つしか見えない | CopiesのFirst / Last範囲、Translationなどのオフセットを確認。複数あっても同じ位置に重なっている可能性がある |
| 元の物体が消えた | First Copyが0より大きくなっていないか |
| 予想外の曲線・渦になる | Transform MethodのLinear / Accumulated、Transform Order、Rotation Order、Pivotを切り分ける |
| Jitterを変更しても変化しない | Jitter Probability、該当Jitter量、Seed、複製数を確認 |
| Jitterの配置が変わって比較できない | Random Seedを固定してから他の設定を比較する |
| Regionを設定しても全体が表示される | Region ModeがIgnore regionになっていないか |
| Mesh Inputが見つからない | RegionをMeshにしたときだけ緑の入力が現れる |
| Mesh領域が期待どおりでない | 複数メッシュ入力ならLimit by Object IDとObject IDを確認 |
| 時間差が見えない | 元モデルのアニメーションの有無とTime Offsetの設定を確認 |
| 大量コピーで処理が重い | Copiesの範囲を一度減らし、USD Instancingのオン・オフで処理を比較する |
| Viewerに2D画像が出ない | uDuplicateの出力はUSD。uMerge、カメラ、uRendererまでの接続を確認する |

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 121「USD Nodes」、**pp.2895–2899**。Inputs、Controls、Copies、Transform Method / Order、Time Offset、USD Instancing、Jitter、Region Mode / Region、Limit by Object IDを照合しています。uLoaderとの時間制御の比較には**p.2903**も参照しています。公式資料の配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

制作例とトラブル対処はManualに記載された機能から組み立てた説明です。**出力端子の厳密な表示名、Mesh Inputが受け取る全データ形式、内部Instancingの共有範囲、Time Offsetの重複表示の評価関係、Region境界の厳密な判定、Edition差は21.1実機で未確認**です。未確認事項を確認済み仕様として扱わないため、**verification: partial**を維持しています。
