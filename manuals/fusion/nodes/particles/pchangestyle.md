---
title: pChangeStyle
description: Particleが指定領域に入ったとき、見た目のStyleやSetの割り当てを変更するFusionノード。pBounceとの順序と具体的な接続例を解説する。
doc_type: node
term_id: pchangestyle
term_short: pChangeStyleは、指定領域を通る粒子の見た目やSet割り当てを変えるノード。
verification: partial
aliases: [pChangeStyle, pChange Style, pCS]
concepts: [particle-data, particle-region]
nodes: [pChangeStyle]
node_family: particles
controls: [Random Seed, Change Sets, Style, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, change-style, event]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# pChangeStyle

pChangeStyleは、<Term id="particle-data">Particle（粒子）</Term>が指定した領域に入ったとき、粒子の**見た目（Style）**や**Setの割り当て**を変更するノードです。火花が壁に触れたところから赤くなる、一定の範囲を通った粒子だけ別の力を受ける、といった表現に使います。

ここでいう**Region（領域）**は、ノードの処理が作用する場所です。**Set**は粒子を分類するためのグループ番号で、色や形を表すStyleとは別の情報です。基本的なデータの流れは[パーティクルの基礎](../../learn/02-data/particle)を参照してください。

pChangeStyleは粒子の発生や移動・衝突そのものを担当しません。前段から来たParticleデータの属性を変更して後段へ渡します。**pChangeStyleの出力は2D画像ではないため、画面へ表示するにはpRenderが必要**です。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| Input（橙、通常表示） | Particle | pEmitterなどから位置・速度・寿命・Styleを持つ粒子を受け取る |
| Region（条件付き） | 2D Imageまたは3D Mesh | StyleやSetを変更する場所を外部データで指定する |
| Output | Particle | 変更後のStyleやSetを含むParticleデータを後段へ渡す |

通常表示されるのは橙色のParticle入力です。**Region**タブで**Bitmap**を選ぶと2D画像用、**Mesh**を選ぶと3Dメッシュ用のRegion入力が追加されます。マニュアルはこれらの端子色を緑またはマゼンタと説明しており、選択順で色が変わる場合があります。色だけで入力データの型を判断しないでください。

Bitmapでは、接続した画像の選択チャンネルによって領域を定義します。たとえばロゴ画像の形の範囲を通過した粒子だけ、見た目を変える用途です。Meshでは、[Shape 3D](../3d/shape-3d)などの3D形状を領域として使います。

外部画像・メッシュが不要な場合は、RegionタブにあるRectangleやSphereなどの基本形状を使用できます。**RegionのBitmapは作用する場所を指定するもの**です。StyleのBitmap（粒子自身に表示する画像）とは役割が異なります。

## 主な設定

### Change Sets — 後段で対象にする粒子グループを変える

**Change Sets**は、粒子が所属するSetを変更するための設定です。

Setを変更しても、それだけでは粒子の位置・速度・色が直接変わるわけではありません。後段のForceノードなどでConditionsのSet指定を使うと、**領域を通過した粒子だけに別の処理を適用**できます。

たとえば、最初はSet 1として進む粒子をpChangeStyleの領域でSet 2に変更し、後段の[pDirectionalForce](./pdirectionalforce)をSet 2だけへ適用すると、その領域を通過した粒子だけが方向を変える構成になります。Setは「見た目の種類」ではなく、後段の処理対象を分ける仕組みです。

### Style — 色・形・サイズなどを変える

**Style**は粒子の表示方法を指定します。pChangeStyleのStyleタブは、[pEmitter](./p-emitter)などと共通する粒子の外観設定です。

21.1マニュアルが挙げる主なStyleには、1ピクセルの点で描く**Point**、柔らかい粒状の**Blob**、線状の**Line**、画像を粒子の絵柄に使う**Bitmap**、ブラシ画像を使う**Brush**、複数の点をまとめた**Point Cluster**があります。選ぶStyleによって表示される項目は異なります。

- **Color / Color Variance**：粒子の色や粒子ごとの色のばらつきを調整します。
- **Color Over Life**：粒子の寿命の進行に沿って色を変えます。左端が誕生時、右端が寿命の終わりを表します。
- **Size / Size Variance / Size Over Life**：大きさやその変化を調整します。ただしPointは1ピクセル固定で、一般的なSize調整の対象外です。
- **Fade In / Fade Out**：粒子の生存期間の最初と最後に透明度の変化を付けます。

これらはStyleに共通する項目の例で、**どのStyleでも全項目が出るわけではありません**。また、2D専用の合成・ぼかし系項目は、3D出力で同じ結果になるとは限りません。最初はStyleとColorの変更だけで動作を確認し、必要に応じてサイズや寿命に沿った変化を加えると原因を追いやすくなります。

### Random Seed / Randomize — ランダムな差を再現する

粒子ごとのばらつきなど、ランダム計算を使う場合の値です。同じSeedなら同じランダム結果を再現し、**Randomize**で別のSeedを選べます。これは「必ず粒子をランダムに動かす」設定ではありません。

### Conditions — どの粒子に適用するかを絞る

**Conditions**タブは、Regionで決める「どこで」と別に、「どの粒子へ処理を適用するか」を制限します。

| 設定 | 意味 | 使用例 |
| --- | --- | --- |
| Probability | 粒子に作用する確率。既定の1.0は100% | 一部だけ色を変える |
| Start / End Age | 粒子の寿命に対する割合 | 寿命の後半20%なら0.8〜1.0 |
| Set Mode / Set # | 作用させるSetを選ぶ | Set 1だけを見た目変更する |

Set Modeには、Setを区別しない**Ignore Sets**、指定Setだけへ作用する**Affect Specified Sets**、指定Setを除外する**Ignore Specified Sets**があります。Probabilityはマニュアル上、粒子ごと・フレームごとに判定されます。値を小さくしても「その粒子は一生変更されない」と固定する設定ではありません。

## 基本的な接続

```text
pEmitter → pChangeStyle → pRender（2D）→ Merge → MediaOut
                  │                         ↑
                Region                    背景映像
```

1. [pEmitter](./p-emitter)で粒子を作り、pChangeStyleのParticle入力に接続します。
2. pChangeStyleの**Region**に、粒子が通過するRectangleなどの領域を設定します。BitmapやMeshを使う場合は追加Region入力にも素材を接続します。
3. **Style**で、変更後の色や描画方法を設定します。
4. [pRender](./p-render)を**2D出力**に設定し、Mergeで背景映像に重ねます。

まずは粒子の経路とRegionを重ね、Styleを変更したことが画面で分かる状態にします。その後、Conditionsで適用対象を狭めます。pChangeStyleを入れても粒子の通る場所が変わらないのは正常です。

## 制作例

### 壁に当たった光点を別の色へ変える

粒子が壁に当たって跳ね返り、その瞬間から色が変わったように見せる例です。

```text
pEmitter → pChangeStyle → pBounce → pRender
                ↑             ↑
             同じRegionを両方へ指定
```

1. pEmitterから壁へ向かう粒子を発生させます。
2. [Shape 3D](../3d/shape-3d)などで壁の形状を作り、**pChangeStyleと[pBounce](./pbounce)の両方のRegion**に指定します。
3. pChangeStyleのStyleで、衝突後に見せたい色を設定します。
4. pBounceで同じ壁との接触を処理し、粒子を反射させます。

**順番はpChangeStyle → pBounceです。** 21.1の公式例では、先にpBounceを置くと粒子が領域に到達した時点で反射され、後段のpChangeStyleが領域との交差を検出できません。pChangeStyleが「衝突イベントの通知」を受けるのではなく、同じRegionを使って**反射より前に交差を評価する**ことがポイントです。

### ロゴの形を通過した粒子だけ色を変える

白いロゴと透明な背景を持つ2D画像を用意し、pChangeStyleのRegionを**Bitmap**にします。追加されたRegion入力にロゴ画像を接続し、領域の判定に使うチャンネルを確認します。

pEmitterの粒子を画面の左から右へ流し、ロゴを横切る位置へRegionを合わせます。pChangeStyleのStyleで色を変えると、ロゴ部分を通る粒子だけ見た目が変わる表現に利用できます。**画像そのものがParticleに変換されるわけではありません**。画像は変化が起きる場所を指定するために使います。

### 通過した粒子だけ別の力を受ける

```text
pEmitter（Set 1）
    ↓
pChangeStyle（Regionを通る粒子をSet 2へ）
    ↓
pDirectionalForce（Conditions：Set 2だけに作用）
    ↓
pRender
```

pChangeStyleで**Change Sets**を使い、特定領域を通る粒子をSet 2へ切り替えます。後段のpDirectionalForceでは、Conditionsの**Affect Specified Sets**とSet 2を指定します。領域を通った粒子だけが後段の力を受けるため、見た目を変えずに進路の分岐にも使えます。

Setの切り替えを確認する際は、最初から複数のForceを重ねず、Set 2にだけ明確な方向の力を一つ加えて動きを比べると分かりやすくなります。

## うまく動かないとき

- **見た目が変わらない**：粒子の軌道がRegionと重なるか確認します。Bitmap/Meshでは追加Region入力と、Bitmapで選択したチャンネルを確認してください。
- **pBounceを使うと変化しない**：pChangeStyleをpBounceの**前**に置き、両方で同じRegionを使っているか確認します。
- **一部の粒子だけ変わる**：ConditionsのProbability、Age、Set Modeを確認します。Setの指定とChange Setsは別の設定です。
- **Setを変えたのに進路が変わらない**：後段のForce側で、変更後のSetへ作用するConditionsになっているか確認します。Setの割り当て変更だけでは力は発生しません。
- **Viewerで見えない／背景に合成できない**：pChangeStyleの出力はParticleです。後段にpRenderを置き、画像合成なら2D出力を選びます。
- **フレーム移動で結果が違って見える**：粒子の状態は時間評価に依存します。pRenderのPre-Roll等を確認し、連続再生でも再現するか切り分けます。

## 関連ノード

- [pEmitter](./p-emitter)：粒子の初期状態とSetを作る。
- [pBounce](./pbounce)：指定Regionに接触した粒子を反射する。
- [pDirectionalForce](./pdirectionalforce)：指定したSetへ方向性のある力を加える。
- [pCustom](./pcustom)：式による個別のParticle属性変更を行う。
- [Particleノード一覧](./index.md)：ほかのForce・Behaviorノードとの使い分け。

## 出典・バージョンと未確認事項

- **一次資料**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）、Chapter 114 pp.2651–2652（pChangeStyleの役割・入力・Change Sets・ノード順）、pp.2692–2696およびpp.2701–2703（共通Style）、pp.2697–2700（Conditions・Region）。
- **対象**：DaVinci Resolve 21.1のFusionページ。制作例は公式記述を基に組み合わせた手順であり、21.1実機での再現は未確認です。
- **未確認**：Styleの種類を切り替えた際の全ての追加端子・パラメータ表示、Set変更の内部実装、REGID、Edition差、実機レンダリング結果。推測で固定値やポート名を補わず、`verification: partial`を維持します。
