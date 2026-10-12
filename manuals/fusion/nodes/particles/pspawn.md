---
title: pSpawn
description: 既存の粒子から別の粒子を発生させるpSpawnの入出力、Velocity Transfer、生成条件、花火・軌跡の接続例を解説する。
doc_type: node
term_id: pspawn
term_short: pSpawnは、既存の粒子を発生源にして子の粒子を作るノード。
verification: partial
aliases: [pSpawn, pSp]
concepts: [particle-data, particle-region]
nodes: [pSpawn]
node_family: particles
controls: [Number, Number Variance, Lifespan, Lifespan Variance, Velocity, Velocity Variance, Angle, Angle Z, Affect Spawned Particles, Velocity Transfer, Style, Conditions, Region]
inputs: [particle, image, region]
outputs: [particle]
tasks: [particles, spawn, fireworks, trail]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# pSpawn

pSpawnは、**すでに存在する粒子を発生源にして、別の粒子を生み出す**ノードです。たとえば、空へ昇る火花から小さな光点を散らしたり、移動する光点の後ろに細かな粒子を残したりできます。

ここでいう<Term id="particle-data">Particle（粒子）</Term>は、位置・速度・寿命・見た目などを持つデータです。画像を複製するだけの処理ではありません。pSpawnの入力と出力はどちらもParticleデータなので、画面に描くには後段に[pRender](./p-render)を接続します。Particleそのものの考え方は[パーティクルの基礎](../../learn/02-data/particle)を参照してください。

## 親の粒子と新しく生まれる粒子

pSpawnへ入ってきた粒子を、このページでは**親粒子**、そこから新しく生まれる粒子を**子粒子**と呼びます。

親粒子はpSpawnを通っても、その場で消えるわけではありません。親は元の寿命が終わるまで存在し続け、子は**自分自身の寿命・速度・見た目を持つ独立した粒子**として後段へ進みます。したがってpSpawnの後には、元の粒子と追加で発生した粒子が含まれます。

たとえば大きな光点を右へ動かしながらpSpawnで小さな光点を発生させると、大きな光点が進み、その移動経路に沿って小さな光点が残る構成を作れます。子の発生後の動きは、子自身に与えた初速や後段のForceでも変えられます。

## 入力と出力

| 接続 | データ | 何を渡すか |
| --- | --- | --- |
| Input（通常表示される橙色の端子） | Particle | [pEmitter](./p-emitter)などが作った親粒子 |
| Style Bitmap Input（条件付き） | 2D Image | 子粒子をBitmap Styleで描く場合、その**一粒の見た目**に使う画像 |
| Region（Bitmap、条件付き） | 2D Image | 子を発生させる領域を、画像の選択チャンネルで指定 |
| Region（Mesh、条件付き） | 3D Mesh | 子を発生させる領域を、3D形状で指定 |
| Output | Particle | 親粒子と新しく生まれた子粒子を後段へ渡す |

通常はParticle入力だけが表示されます。**StyleタブでBitmapを選ぶとStyle Bitmap Inputが追加**されます。画像は大量の子粒子に使われるため、公式マニュアルでは256×256ピクセル程度の小さな正方形を例示しています。

一方、**RegionタブでBitmapまたはMeshを選ぶと、その領域を指定する入力が追加**されます。この2種類のBitmapは別物です。

- **StyleのBitmap**：一つひとつの粒子が、どの画像の姿で描かれるか。
- **RegionのBitmap**：画像のどの部分を、粒子を発生させる場所として使うか。

たとえば白いロゴの範囲から丸い粒子を発生させるなら、**ロゴ画像はRegionのBitmap入力**へ、**丸の画像はStyle Bitmap入力**へ接続します。ロゴ画像がそのまま各粒子の絵柄になるわけではありません。

追加端子の色は設定を有効にした順序で変わる場合があります。色だけで入力型を判断せず、どのタブで表示した端子かを確認してください。

## Inspector：子粒子の数・寿命・初速

pSpawnには、[pEmitter](./p-emitter)と共通する設定が多くあります。違いは、pEmitterが発生源として指定した領域から粒子を作るのに対し、**pSpawnは入力された粒子を発生源として利用する**点です。

| 設定 | 子粒子に起きること | 調整する場面 |
| --- | --- | --- |
| Number / Number Variance | 発生する粒子数とそのばらつきを決める | 軌跡を疎らにする、短時間に粒子を増やす |
| Lifespan / Lifespan Variance | 新しく生まれた粒子の寿命とばらつきを決める | 軌跡をすぐ消す、花火の光を長く残す |
| Velocity / Velocity Variance | 子粒子の発生時の速さとばらつきを決める | 周囲に飛び散る勢いをつける |
| Angle / Angle Z | 子粒子が生まれるときの進行方向を決める | 平面上の放射や奥行き方向の飛散を作る |
| Style | 子粒子の形・色・サイズなどを設定する | 親とは異なる小さな火花や煙にする |
| Conditions / Region | どの親粒子が、いつ・どこで子を生むかを制限する | 寿命の終わりだけ発生させる、範囲を限定する |

**Numberは発生を続ける間の量**として扱います。pSpawnが有効な親粒子は、その作用条件を満たしている間、後続フレームでも子を発生させます。「Numberを大きくしたら一度だけ発生する」とは限りません。単発に近い演出ではConditionsを狭くするほか、**Numberを短い区間だけ上げ、その後0へ戻す**方法を使います。

また、親のLifespanを短くしても、子に指定したLifespanが自動的に同じ長さになるわけではありません。親と子の消える時期を別々に設計できます。

### Velocity Transfer：親の移動をどれだけ引き継ぐか

**Velocity Transfer**は、親粒子の速度と方向を子粒子へどの程度渡すかを決める、pSpawn固有の設定です。21.1マニュアルでの既定値は**1.0**で、親の速度と方向を100%引き継ぎます。値を下げると、親の運動の影響が小さくなります。

たとえば、右へ勢いよく移動する親から火花を出す場合、Velocity Transferが大きいと子も親の移動方向に流れやすくなります。親の進行方向に引っ張られず周囲へ広げたい場合は、この値を下げ、子の**Velocity / Angle**も調整します。

Velocity TransferとVelocityは同じ項目ではありません。前者は**親の運動の継承**、後者は**子の発生時に設定する運動**です。両方を一度に大きく変えると原因が分かりにくいため、最初はVelocity Transferだけを動かして比較するとよいでしょう。

### Affect Spawned Particles：子からも子を生むか

**Affect Spawned Particles**を有効にすると、生成された子粒子も後のフレームでpSpawnの対象になります。親が子を生み、その子がさらに粒子を生む構成です。

これは連鎖的な発光や枝分かれする粒子に使えますが、**粒子数が指数的に増える場合**があります。表示が急に重くなったら、まずこの設定を確認してください。最初はオフにしたままNumberとLifespanを調整し、連鎖が必要な場合だけ有効にする方が挙動を追いやすくなります。

## ConditionsとRegion：いつ、どの粒子から生むか

pSpawnは、条件を満たす親粒子から**繰り返し**子を発生させます。特に花火のような短い発生では、発生対象を先に絞ることが重要です。

### Conditions：粒子を選ぶ

| 設定 | 意味 | 使用例 |
| --- | --- | --- |
| Probability | 粒子に作用する確率。1.0なら100% | 軌跡に欠けを作る |
| Start / End Age | **親粒子の寿命に対する割合**で、発生させる期間を指定 | 寿命の後半だけ子を出す |
| Set Mode / Set # | 対象の粒子グループ（Set）を選ぶ | 特定の発射体だけから火花を出す |

Start / End Ageを**0.8〜1.0**にすると、親粒子の寿命の最後の20%だけを対象にできます。寿命が100フレームの親なら、概ね80フレーム目以降が発生区間です。ここで指定するAgeは、子の寿命ではなく、**pSpawnの作用を受ける親の年齢**を制限するものです。

Set Modeには**Ignore Sets**（Setで絞らない）、**Affect Specified Sets**（指定Setだけ）、**Ignore Specified Sets**（指定Setを除外）があります。SetはpEmitterやpImage Emitter、pChangeStyle、pSpawnなどで割り当てられます。

なお、Probabilityは一度抽選して親を固定する設定ではありません。21.1マニュアルでは**粒子ごと・フレームごと**に判定します。あるフレームで子を生まなかった親が、次のフレームで生むこともあります。

### Region：発生する場所を絞る

Regionは空間的な発生場所を指定します。RectangleやSphereなどの基本形状を使うほか、**Bitmap**で2D画像の選択チャンネルを参照したり、**Mesh**で3D形状を参照したりできます。

たとえば画面中央の領域だけで子を発生させたい場合は、親粒子の通り道へRectangleを置きます。ロゴの形に沿った発生ならRegionをBitmapにしてロゴ画像を接続します。Regionに外部画像を接続しても、子の見た目がその画像になるわけではありません。

Regionだけでタイミングまで1フレームに限定できるとは考えず、必要なら**AgeやNumberのアニメーションと組み合わせて**発生量を制御します。

## 基本の接続

~~~text
pEmitter → pSpawn → pRender（2D）→ Merge → MediaOut
     親を作る  子を追加    画像へ変換      ↑
                                      背景映像
~~~

1. [pEmitter](./p-emitter)で、画面内を移動する少数の親粒子を発生させます。
2. pSpawnを間に置き、親のParticleデータを入力します。
3. pSpawnのNumberを小さめにし、子のLifespanとVelocityを設定します。最初はAffect Spawned Particlesをオフにします。
4. [pRender](./p-render)のOutput Modeを**2D**に切り替え、Viewerで親と子の動きを確認します。
5. 必要に応じてConditions、Region、Velocity Transferを追加調整します。

pSpawnからMergeへ直接接続しても、通常の2D Imageとしては扱えません。pRenderの3D出力を使う場合は、Merge 3DやRenderer 3Dなど、後段も3Dの接続に合わせます。

## 制作例

### 1. 移動する光点の軌跡を作る

右へ動く明るい光点を親とし、その後ろへ小さな光の粒を残します。

まずpEmitterで親粒子の数を少なくし、VelocityとAngleで右方向へ動かします。pSpawnではNumberを控えめに、子のLifespanを親より短めに設定します。子を小さなPointまたはBlobとして描けば、親は進み続け、子は短時間だけ残ります。

子が親と同じ速さで移動して軌跡が伸びない場合は、**Velocity Transferを下げて**親の移動の継承を減らします。反対に、親の進行方向へ伸びる火花にしたければ値を上げて比較します。最後に[pTurbulence](./pturbulence)を後段へ置くと、発生した粒子の進路にも揺らぎを加えられます。

### 2. ロケットの先端から花火を散らす

~~~text
pEmitter（上昇する親）
          ↓
pSpawn（寿命の終盤で子を発生）
          ↓
pRender（2D）→ Merge
~~~

pEmitterで上方向へ飛ぶ少数の親粒子を作り、pSpawnのConditionsで**Start Ageを0.95、End Ageを1.0**など短い期間へ絞ります。子のNumberとVelocityを上げ、AngleやVarianceで飛散方向に差をつけます。

この設定は「寿命の最後の5%で発生させる」という意味で、**必ず1フレームだけ発生することは保証しません**。発生が長く続く場合は親のLifespanに対してAgeの幅をさらに狭くするか、Numberをその区間だけ増やして直後に0へ戻します。

親はその時点で直ちに削除されるわけではありません。爆発と同時にロケット本体を消したい場合は、親のLifespanの終了時点を合わせる、あるいは[pKill](./pkill)などで削除条件を別途設計します。

### 3. ロゴの範囲でだけ子粒子を出す

画面を横切る親粒子が、ロゴに重なる場所を通るときだけ火花を出す例です。

pSpawnのRegionを**Bitmap**にし、透明背景のロゴ画像を追加のRegion入力へ接続します。Regionが参照するチャンネルをロゴのAlphaなどに設定し、親粒子がロゴの位置を通過するようにpEmitterを調整します。

火花自体を小さなイラストにしたければ、別途StyleをBitmapにして、**Style Bitmap Inputへ火花の画像**を接続します。Region画像は発生場所、Style画像は一粒の絵柄です。両者を分けると、ロゴを替えても火花の見た目を維持できます。

## うまく動かないとき

- **子が見えない**：親粒子がpSpawnのParticle入力へ届いているか、Numberが0ではないか、ConditionsのAge・Set・ProbabilityやRegionが狭すぎないかを確認します。pRenderのOutput Modeと後段の接続も確かめます。
- **粒子が際限なく増える**：Affect Spawned Particlesがオンではないか確認し、Number、Lifespan、発生期間を絞ります。親に対する作用を全期間へ広げると、子が発生し続けます。
- **軌跡にならず一緒に移動する**：Velocity Transferと子のVelocity / Angleを分けて調整します。親の動きをそのまま引き継ぐ設定だけでは、望む残像状の軌跡にならない場合があります。
- **花火が一度で終わらない**：Start / End Ageは寿命の割合であり、単発発生のスイッチではありません。Numberのアニメーションと併用します。
- **Bitmapをつないだのに見た目が変わらない**：Region BitmapとStyle Bitmapを取り違えていないか、StyleがBitmapになっているかを確認します。
- **フレームを飛ぶと結果が変わる**：粒子の状態は時間評価に依存します。pRenderのPre-Roll / Automatic Pre-Rollも確認します。

## 関連ノード

- [Particleノード一覧](./index)：粒子を作る・変える・描く流れ。
- [pEmitter](./p-emitter)：親粒子の生成と、Number・Lifespan・Velocityなどの共通設定。
- [pImage Emitter](./pimageemitter)：画像のピクセルから最初の粒子を発生させる別の方法。
- [pChangeStyle](./pchangestyle)：途中で粒子の見た目やSetを変更する。
- [pTurbulence](./pturbulence)：親や子の移動に不規則な揺らぎを加える。
- [pKill](./pkill)：指定条件の粒子を途中で削除する。
- [pRender](./p-render)：Particleデータを2D画像または3D側の出力へ変換する。

## 出典・バージョンと未確認事項

- **一次資料**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）、Chapter 114 pp.2685–2687（pSpawnの入出力、独立した子粒子、Affect Spawned Particles、Velocity Transfer）、pp.2661–2664（pEmitterと共通する生成・速度・寿命の設定）、pp.2697–2703（Conditions、Region、Styleの共通設定）。
- **対象**：DaVinci Resolve 21.1のFusionページ。各制作例は公式記述を基に組み立てた接続案で、21.1実機での全手順の再現は未確認です。
- **未確認**：大量の粒子を連鎖生成した場合の性能上限、追加端子の色・並びの実機表示、Editionごとの細かなUI差、すべてのStyleで利用できるInspector項目。これらは推測で固定しません。
