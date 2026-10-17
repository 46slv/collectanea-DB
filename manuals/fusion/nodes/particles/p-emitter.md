---
title: pEmitter
description: Particle setを生成し、Number・Lifespan・Velocity・Rotation・Style・Regionでparticleの誕生時の状態を決める基本Emitter。
doc_type: node
term_id: p-emitter
verification: partial
aliases: [pEmitter, Particle Emitter, pEm]
concepts: [particle-data, time, data-domain]
nodes: [pEmitter]
node_family: particles
controls: [Random Seed, Number, Number Variance, Lifespan, Lifespan Variance, Color, Position Variance, Temporal Distribution, Velocity, Velocity Variance, Inherit, Angle, Angle Z, Rotation Mode, Rotation XYZ, Spin XYZ, Sets, Style, Region]
outputs: [particle]
tasks: [particles, emit, procedural-motion]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-13"
---

# pEmitter

pEmitterは、Fusion Particle systemの出発点になるNodeです。

新しい<Term id="particle-data">Particle set</Term>を生成し、particleの数、寿命、初速、方向、回転、見た目、発生範囲を決めます。pEmitterの出力はImageではないため、Viewerで結果を見るにはpRenderを後ろへ接続します。

## 入力

既定では入力を持ちません。

ただしStyleをBitmapにすると、particle画像として使う2D Image入力が追加されます。RegionをBitmapまたはMeshにすると、そのregionを定義する2D Image / 3D Mesh入力も追加されます。

## 出力

Particle setを出力します。

```text
pEmitter → particle modifiers / forces → pRender
```

BlurやColor Corrector等の2D Image Nodeへ直接つなぐのではなく、pRenderでdomainを変換してから使います。

## Controls tab

### Random Seed

varianceやrandom generationのseedです。

同じ設定と同じseedなら同じparticle systemを再現できます。見た目だけ別patternへ変えたい場合はRandomizeを使います。

### Number / Number Variance

1 frameごとに生成するparticle数と、そのばらつきを決めます。

Numberをanimationすると、一定期間だけparticleを発生させるburstや、一度だけ大量に生成する構成を作れます。

### Lifespan / Lifespan Variance

particleが誕生してから消えるまでのframe数です。

多くのOver Life ControlはLifespanに対する0〜100%で作用するため、Lifespanを変えるとSize Over LifeやColor Over Lifeの実時間も変わります。

### Color

Style側のColorを使うか、Bitmap Regionの色をparticleへ引き継ぐかを選びます。

Bitmap Regionを使ってImageの色からparticleを作る場合に重要です。

### Position Variance

Region境界から少し外れた位置にもparticleを生成できるようにし、発生regionのedgeをsoftにします。

### Temporal Distribution

particle birthをframe境界だけへ集中させず、subframeへ分散できます。

速いparticleが一定間隔の塊に見える場合など、time方向の発生distributionを滑らかにしたいときに使います。

## Velocity

### Velocity / Velocity Variance

誕生時のspeedと、そのばらつきを決めます。

0なら外部Forceがなければ発生位置に留まります。

### Inherit

Emitter Region自体が動いている場合、そのmovementをparticleへどの程度引き継ぐかを決めます。

### Angle / Angle Z

Velocityの進行方向をXYとZで決めます。

2Dだけでなく3D particle systemでも初期方向を持たせられます。

## Rotation / Spin

### Rotation Mode

- **Absolute Rotation** — movement directionに関係なく指定rotationを使う
- **Rotation Relative To Motion** — velocity方向を基準にparticleをorientする

矢印や葉のように「進行方向を向いてほしい」particleではRelative To Motionが候補になります。

### Rotation XYZ / Variance

誕生時のrotationとばらつきを設定します。

### Spin XYZ / Variance

誕生後、frameごとに回転を続けるspinを設定します。

## Style tab

particleの見た目を決めます。

Point、Bitmap等のStyleを選び、SizeやColor、Over Life Controlを設定します。Bitmap Styleでは2D Image inputが追加されます。

## Region tab

particleがどこから生まれるかを決めます。

Point / Line / Rectangle等のregionに加え、Bitmapや3D Meshを使える構成があります。2D pRenderでは基本的にflat plane上、3D systemではdepthを持つregionとして生成できます。

## Sets tab

particleをSet 1〜32へ割り当てます。

後段のForce / Behavior Nodeで「Set 1だけgravityを効かせる」など、同じParticle stream内で対象を分けるために使います。

## 最小構成

```text
pEmitter → pRender
```

最初はNumber、Lifespan、Velocityの3つだけで動きを作り、その後にStyle / Region / Forceを増やすと原因を追いやすくなります。

## 運用例

上向きに飛ぶ火花を作る場合:

1. Numberで発生量を決めます。
2. Lifespanで消えるまでの長さを決めます。
3. Velocityを上げます。
4. Angleで上方向へ向けます。
5. Styleで小さなPoint / Bitmapを選びます。
6. 後段にpDirectionalForceを入れ、下向きのforceで落下させます。
7. pRenderで結果を確認します。

## pImage Emitterとの違い

- **pEmitter** — RegionとEmitter Controlからparticleを生成
- **pImage Emitter** — source Imageのpixel grid自体をparticle generationへ使う

Imageの輪郭やpixel位置をparticle化したい場合はpImage Emitterを検討します。

## 発生数と寿命を設計する

pEmitterの**Number**は「いま画面にある粒子の総数」ではなく、**1フレームで新しく生む粒子数**です。Lifespanは一粒が何フレーム存在するかを決めます。この二つを別々に調整します。

たとえばフレーム0〜4でNumberを5、フレーム5以降を0にすると、合計25粒だけを発生させる構成です。すでに生まれた粒子がすぐ消えるわけではなく、各粒子はLifespanが終わるまで残ります。pEmitterのNumberだけを後から0へ変更しても、既存粒子を削除する命令にはなりません。

Number Varianceは毎フレームの発生数にばらつきを付けます。21.1マニュアルではNumber 10、Number Variance 2を9〜11粒／フレームの例として説明しています。Lifespanの既定値は100フレームで、Lifespan 100、Lifespan Variance 20は90〜110フレームの寿命のばらつきとして説明されています。

Size Over LifeやColor Over Lifeは、実時間ではなく**各粒子の寿命に対する割合**を基準に変化します。したがってLifespanを短くすれば、同じ曲線でも色やサイズの変化はフレーム上で速く進みます。負荷が大きいときは、発生数と寿命の両方を確認します。

## Temporal Distributionとサブフレーム

高速で移動する粒子を毎フレームの境界でまとめて生むと、等間隔の点列や断続的な筋に見える場合があります。**Temporal Distribution**は、一つのフレーム内で各粒子をいつ誕生させるかを決めます。

| 設定 | どのように発生するか |
| --- | --- |
| **At The Same Time** | フレームの境界でまとめて発生。マニュアル記載の既定 |
| **Randomly Distributed** | フレーム内のランダムな時刻へ分散 |
| **Evenly Distributed** | フレーム内の等間隔な時刻へ分散 |

たとえば1フレームで10粒発生させる場合、Evenly Distributedでは各粒子の誕生時刻が約0.1フレームずつずれます。ランダムな位置に飛び散らせる設定ではなく、**発生する時刻を変える**設定です。

結果は[pRender](./p-render)の**Sub-Frame Calculation Accuracy**にも影響されます。精度を上げればフレーム間の粒子計算は細かくなりますが、処理時間は長くなるため、動きの見え方を比較して調整します。

## 動く発生源：VelocityとInheritを分ける

**Velocity**は、誕生時に粒子自身へ与える初速です。**Inherit**は、動いているEmitter Regionの移動速度を、誕生した粒子へどの程度引き継ぐかを指定します。

21.1マニュアルではInheritが1なら発生源の速度と同程度、2ならそれ以上、負の値なら発生源と逆向きの移動を作る例が示されています。画面内を移動する物体から火花を出す場合、発生位置を動かすだけの状態とInheritを1にした状態とでは、軌道が変わります。

**Angle / Angle Variance**はXY方向の初速の角度とばらつき、**Angle Z / Angle Z Variance**はZ方向の角度とばらつきを指定します。Velocityが0の状態では角度だけ変えても初速による移動は発生しません。発生後に粒子を加速したい場合は、後段の[pDirectionalForce](./pdirectionalforce)などで力を加えます。

## Region：どこから粒子が生まれるか

pEmitterのRegionは、**粒子を生み出す場所**です。ForceノードのRegionが「力を適用する場所」を決めるのとは役割が違います。外部画像の形を使う場合は**Bitmap**、3D Meshを使う場合は**Mesh**を選択し、追加されたRegion入力へ接続します。Style Bitmap Inputは一粒の絵柄なので、このRegion入力と混同しません。

21.1マニュアルのRegion Modeの説明には「seven types」と書かれていますが、列挙されている名称は次の**8種類**です。数の食い違いはそのまま明記します。

| Region Mode | 粒子を発生させる場所 |
| --- | --- |
| **All** | 2Dなら画像範囲内、3Dなら1×1×1単位の立方体内 |
| **Bézier** | 描いたポリラインに基づく領域。輪郭の作成は2Dで行う |
| **Bitmap** | 2D画像の指定チャンネルによる領域 |
| **Cube** | 幅・高さ・奥行きを指定できる3D立方体 |
| **Line** | 二つの端点を結ぶ線。PathやTrackerにも接続可能 |
| **Mesh** | 外部の3D Meshに基づく領域 |
| **Rectangle** | Z方向に厚みのない長方形。Z空間内で移動・回転可能 |
| **Sphere** | 球形の3D領域。マニュアル記載のpEmitter既定 |

**Position Variance**はRegionの境界の少し外側にも粒子を発生させる設定です。既定の0なら指定領域に制限され、値を上げると境界が不規則になります。画像そのものにBlurを掛ける機能ではありません。

**Color**のUse Color From Regionは、Bitmap Regionに指定した画像の色を粒子へ引き継ぐ設定です。Bitmap以外のRegionで選ぶと、マニュアルでは粒子が白く表示されると説明されています。Styleタブで決めた色を使うならUse Style Colorを選びます。

Mesh Regionでは、表面から生むか内部の体積から生むかをRegion Typeで指定できます。閉じていないMeshでは内外の判定が難しくなるため、Winding RuleとWinding Ray Directionの設定も関係します。

## Style：一粒の見た目と時間変化

Regionで発生場所を決めたら、**Style**で粒子一個の絵柄を決めます。21.1マニュアルにある主な種類は次のとおりです。

| Style | 見た目 |
| --- | --- |
| **Point** | 1ピクセルの点。Sizeは調整できない |
| **Point Cluster** | 複数の小さな点をひとまとまりにする |
| **Bitmap** | 別の2D Imageを一粒の絵柄にする |
| **Brush** | Brushesディレクトリ内の画像を使用する |
| **Blob** | 柔らかい球状。Noiseで質感を変えられる |
| **Line** | 線状。Fadeで線の長さに沿う減衰を調整する |

Bitmap Styleを選択すると、Style Bitmap Inputへ小さな画像を接続できます。画像が大量に複製されるため、マニュアルは256×256ピクセル程度を例に挙げます。ただし、拡大して描く粒子に小さすぎる画像を使うと画質が低下するため、粒子数と最終的な表示サイズの両方を考慮します。

### Bitmapに動画を使う場合

動画や画像シーケンスを一粒の絵柄にする場合は、次の時間参照を使い分けます。

- **Over Time**：すべての粒子がCompositionの現在フレームに対応する画像を共有します。
- **Particle Age**：それぞれの粒子が誕生した時点から元画像の先頭を再生します。
- **Particle Birth Time**：誕生時刻に対応する画像のフレームを、その粒子の寿命中は固定して使います。

たとえば炎の短いアニメーションをBitmapとして入力し、Particle Ageを選ぶと、各粒子の炎が誕生後に個別のタイミングで動きます。Over Timeでは全粒子の絵柄が同時に切り替わります。

**Color Over Life**は誕生から寿命終了までの色をGradientで設定します。**Size Over Life**は寿命に対する割合でサイズを変えます。**Fade In / Fade Out**は寿命の開始・終了部分でAlphaを変える設定です。Lifespan 100フレーム、Fade In 0.1なら、最初の10フレームで徐々に出現する例になります。なお、Styleの一部のMerge・Blur制御は2D描画でのみ作用します。

## RotationとSpinの違い

**Rotation Mode**のAbsolute Rotationでは粒子の向きを速度から独立して指定します。Rotation Relative To Motionなら移動方向を基準に向きを決められます。**Rotation X/Y/Z**は粒子の向き、**Spin X/Y/Z**は誕生後の回転速度です。Varianceを使うと粒子ごとに回転角や速度を散らせます。

たとえば葉のBitmapを進行方向へ向けるにはRotation Relative To Motionを検討し、落下しながら葉を回転させたいならSpinを調整します。丸い粒子では向きが変わっても見分けにくいため、最初は非対称な画像を使って確認します。

## 実際の組み立て例

### 透過ロゴの形から発光点を放出する

~~~text
透過ロゴ画像 ──→ pEmitter［Region: Bitmap］
小さな光点画像 ──→ pEmitter［Style: Bitmap］→ pTurbulence → pRender［2D］→ Merge
~~~

ロゴ画像のAlphaをRegionに使って**発生する位置**を指定し、小さな光点をStyle Bitmapに使って**一粒の形**を決めます。ColorをUse Color From Regionにすれば、ロゴ画像の色を粒子へ引き継げます。Position Varianceで輪郭の外にも少し散らし、後段のpTurbulenceで動きを不規則にできます。

これはロゴの形の中からランダムに粒子を放出する構成です。ロゴの全ピクセルを規則的に粒子へ置き換えたい場合は[pImage Emitter](./pimageemitter)を使います。

### 移動する線から火花を出す

~~~text
pEmitter［Region: Line］→ pDirectionalForce → pRender［2D］→ Merge
~~~

Line Regionの始点と終点を、動く物体の位置へ合わせてアニメーションします。Numberで発生数を、VelocityとAngleで飛び出す速さと方向を決めます。Inheritを0と1で比較すれば、発生源の移動が粒子にどれだけ伝わるかを確認できます。発生時刻が揃いすぎて見える場合はTemporal DistributionとpRenderのサブフレーム精度を調整し、pDirectionalForceで落下する動きを付けます。

### Setごとに違う力を適用する

~~~text
pEmitter A［Set 1］─┐
                    ├─ pMerge → pDirectionalForce［Set 1だけ］→ pRender
pEmitter B［Set 2］─┘
~~~

pEmitterではSetsタブからSet 1〜32のグループを指定でき、**一つのEmitterを複数Setに所属**させることもできます。二つのEmitterを[pMerge](./pmerge)でまとめてもSetは保持されるため、後段のForceノードのConditionsでSet 1だけを対象にできます。セットは粒子の描画順ではなく、処理対象を区別するための情報です。

## うまく動かないとき

- **粒子が見えない**：NumberとLifespan、pRenderの接続と2D／3D Output Modeを確認します。
- **粒子が多すぎる**：Numberは毎フレームの発生数です。LifespanとNumber Varianceも確認します。
- **Angleを変えても動かない**：Velocityが0なら初速による移動は発生しません。
- **動く発生源からの飛び方がおかしい**：VelocityとInherit、Regionの位置のアニメーションを分けて確認します。
- **Bitmapを入れたのに形が変わらない**：Region入力とStyle Bitmap Inputを取り違えていないか確認します。
- **Styleの色が白くなる**：Use Color From Regionを選んでいるのにBitmap Regionを使っていない可能性があります。
- **Pointのサイズが変わらない**：Pointは1ピクセル固定です。別のStyleを使います。

## 関連する考え方

- [パーティクル（Particle）](../../learn/02-data/particle)
- [最小Particle chainを作る](../../recipes/particles/basic-particle-chain)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2660–2664で、入力、Number / Lifespan、Velocity、Angle、Rotation、Spin、Sets、Style、Regionを確認しました。

Style / Region共通tabの全選択肢、全default / range、実機性能は未確認のため `verification: partial` としています。
