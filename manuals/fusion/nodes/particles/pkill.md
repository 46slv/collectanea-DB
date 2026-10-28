---
title: pKill
description: ParticleをRegion・寿命・Set・Probabilityの条件で削除するFusionノード。入力、判定条件、具体的な接続、pRenderとの違いを説明する。
doc_type: node
term_id: pkill
term_short: pKillは、指定領域や寿命・Setなどの条件を満たした粒子をParticleデータから削除するノード。
verification: partial
aliases: [pKill, pKI]
concepts: [particle-data, particle-region]
nodes: [pKill]
node_family: particles
controls: [Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, kill, limit-particles]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# pKill

pKillは、指定した領域を横切るなどの条件に合った<Term id="particle-data">Particle（粒子）</Term>を、途中で削除するノードです。たとえば、映像のロゴ部分に入った火花を消す、3Dの障害物へ入った粒子を除去する、寿命の終盤だけ粒子を終了させる、といった用途に使います。

**透明に描くだけではありません。** pKillで削除された粒子は後段へ渡されず、別のForceで引き戻すこともできません。一方、削除されなかった粒子は、位置や速度などの情報を保ったまま後段へ進みます。

ここでいう**Region（領域）**はノードが作用する場所、**Set**は粒子を分類するためのグループです。粒子自体はまだ2D画像ではありません。仕組みの全体像は[パーティクルの基礎](../../learn/02-data/particle)を参照してください。

## 入力と出力

| 接続 | データ | 何を受け渡すか |
| --- | --- | --- |
| Input（橙、通常表示） | Particle | [pEmitter](./p-emitter)や前段のParticleノードが生成・加工した粒子を受け取る |
| Region（条件付きで表示） | 2D Imageまたは3D Mesh | どの場所に来た粒子を削除するか、外部の画像・形状で指定する |
| Output | Particle | 削除対象を取り除いたParticleデータを後段へ渡す |

通常見える入力は橙色のParticle入力だけです。**RegionタブでBitmapまたはMeshを選ぶと、外部素材用のRegion入力が追加**されます。Bitmapなら2D Imageの指定チャンネル、Meshなら3D形状から対象領域を決めます。追加端子の色は緑またはマゼンタで、マニュアルは設定した順によって変わると説明しています。色だけでデータの型を決めないでください。

pKillは粒子を発生させず、画像にも変換しません。可視化するには出力を[pRender](./p-render)へ接続します。2D映像への合成なら、pRenderのOutput Modeを**2D**に設定します。

## Inspector：pKill固有の設定はない

21.1 Reference Manualでは、pKillに固有の効果量やStrengthなどの調整項目はないと説明されています。設定するのは共通の**Conditions**と**Region**です。

- **Region**：どこにいる、またはどこへ入った粒子を削除するか。
- **Conditions**：確率・年齢・Setにより、そのうちどの粒子を対象にするか。

この2つは別の役割です。「特定の場所だけ」という指定と「特定Setだけ」という指定を組み合わせられます。逆に、Conditionsだけを変えてもRegionの空間的な条件が消えるわけではありません。

### Region：削除する場所を決める

**Region Mode**には、All、Bézier、Bitmap、Cube、Line、Mesh、Rectangle、Sphereなどが用意されています。形状によって2D平面上の領域と、厚みを持つ3Dの領域を使い分けます。細かな形状・座標の指定はRegionのモードごとに異なります。

- **Rectangle / Bézier**：画面上で一定の範囲や輪郭を指定したいとき。たとえばロゴの周辺だけから粒子を除去します。
- **Sphere / Cube**：粒子が通る立体的な場所を指定したいとき。奥行きのある煙や破片の制限に使います。
- **Bitmap**：外部画像を読み、選択したチャンネルから領域を作ります。ロゴ画像の不透明部分を対象にするなら、接続した画像のAlphaなど、どのチャンネルを判定に使うか確認してください。
- **Mesh**：3D Meshを領域として使います。複雑な物体内部や表面に関係する処理では、Meshの内外判定と形状の閉じ方も影響します。

**Allは無限空間という意味ではありません。** 21.1マニュアルでのRegionの説明では、2Dは画像範囲、3Dは1×1×1の立方体を表します。粒子の経路がそこに含まれるか、Viewer上で確認してから使ってください。

特にBitmapとMeshは、単にノード名を選ぶだけでは外部素材を使えません。**追加されたRegion入力へ対応するImageまたはMeshを接続**します。

### Conditions：削除する粒子を絞る

| 設定 | 何を指定するか | 例 |
| --- | --- | --- |
| Probability | 各粒子に作用する確率。1.0なら100% | 削除にばらつきを作る |
| Start / End Age | 粒子の寿命を0〜1としたときの対象範囲 | Start 0.8 / End 1.0なら寿命の後半20% |
| Set Mode | Set指定を使うか、指定Setだけ／指定Set以外へ作用させるか | 特定グループだけ削除 |
| Set # | 対象とするSetのチェック | Set 2の粒子を選ぶ |

Set Modeは**Ignore Sets**（Setで絞らない）、**Affect Specified Sets**（指定Setに作用）、**Ignore Specified Sets**（指定Setを除外）の3種類です。SetはpEmitter、pImage Emitter、[pChangeStyle](./pchangestyle)、pSpawnなどから割り当てられます。

**Probabilityは一度だけの抽選ではありません。** 21.1マニュアルでは、粒子ごと・フレームごとに判定すると説明されています。たとえばProbabilityを0.5にしても、「半分の粒子を最後まで残す」と固定されるわけではありません。あるフレームで残った粒子が、次のフレームで削除される可能性があります。

Ageも「何フレーム経ったか」の絶対値ではなく、その粒子の**寿命に対する割合**です。寿命100フレームの粒子にStart 0.8を設定した場合、概ね80フレーム経過以降が対象になります。ただしRegion外にいる粒子まで自動的に削除されるとは考えず、領域設定も合わせて確認します。

## 基本の接続

```text
pEmitter → pKill → pRender（2D）→ Merge → MediaOut
               │                     ↑
          Regionを設定             背景映像
```

1. [pEmitter](./p-emitter)で粒子を発生させ、pKillの橙色入力へ接続します。
2. pKillのRegionで、粒子が通る場所にRectangleなどの領域を置きます。初回はParticleの通り道とRegionが明らかに重なる、広めの設定にすると確認しやすくなります。
3. ConditionsのProbabilityを1.0、Set ModeをIgnore Setsとして、まずRegionの判定だけを確認します。Ageによる制限も不要な範囲にしておきます。
4. pKillからpRenderへ接続し、2Dで表示する場合はpRenderを2D出力へ切り替えます。
5. pKillの前後をViewerで比較し、指定領域へ入る粒子が後段で消えるか確かめます。

pKillの出力だけをMergeへ直接つないでも、通常の2D Imageとしては扱えません。必ずpRenderでParticleを描画結果へ変換します。

<!-- capture:S309 -->

## 実機例：影響確率を変えて表示を比べる

`pEmitter` から `pKill` を通し、`pRender` の2D出力を確認します。この例の48フレームでは、影響確率が0のとき白い粒子が表示され、1のとき粒子は見えませんでした。

静止画だけでは粒子データの削除と透明表示を区別できません。評価開始を揃えたシミュレーション比較、領域による限定や粒子数は未確認です。[接続と設定の記録](/img/fusion/captures/S309/readback.json)に条件を記載しています。

[![pEmitterからpKillとpRenderへ接続した構成](/img/fusion/captures/S309/graph.png)](/img/fusion/captures/S309/graph.png)

粒子をpKillへ送り2D出力を確認します。

[![pKillの影響確率が1の設定](/img/fusion/captures/S309/controls.png)](/img/fusion/captures/S309/controls.png)

影響確率を1に設定します。

[![影響確率1で粒子が見えないViewer](/img/fusion/captures/S309/probability1.png)](/img/fusion/captures/S309/probability1.png)

確率1では粒子が見えません。

[![影響確率0で白い粒子が見えるViewer](/img/fusion/captures/S309/probability0.png)](/img/fusion/captures/S309/probability0.png)

確率0では白い粒子が見えます。

[再現用Graph](/img/fusion/captures/S309/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S309/capture.json)

<!-- /capture:S309 -->

## 制作例

### 1. ロゴを通った光点だけ消す

白いロゴと透明背景の画像を用意し、光点が画面を横切る粒子アニメーションを作る例です。

```text
pEmitter ─→ pKill ─→ pRender（2D）─→ Merge
               ↑
      ロゴ画像 → Region（Bitmap）
```

pKillのRegion Modeを**Bitmap**へ変更し、追加されたRegion入力へロゴ画像を接続します。Regionの判定に使うチャンネルをロゴのAlphaなどに設定し、粒子がロゴを横切るようにpEmitterの位置・速度を調整します。すると、ロゴ領域を通過した光点だけが後段から取り除かれます。**ロゴ画像が粒子に変換されるわけではありません。** ロゴは「削除する場所」の指定に使われます。

最初は単色の大きなロゴで動作を確かめてから複雑な画像へ替えると、チャンネルの選択と粒子の通路のどちらに問題があるか確認しやすくなります。

### 2. 3Dの障害物へ入った粒子を削除する

奥行きのある煙や火花が、見えない除去ゾーンに入ると消える構成です。

```text
pEmitter ─→ pKill ─→ pRender
               ↑
    Shape 3D → Region（Mesh）
```

[Shape 3D](../3d/shape-3d)などで3D形状を作り、pKillのRegionを**Mesh**にして追加端子へ接続します。粒子の移動経路とメッシュの位置・大きさを合わせれば、形状へ入った粒子を取り除けます。これは衝突して反射する[pBounce](./pbounce)とは異なります。**pBounceは粒子の運動を変え、pKillは粒子自体を削除**します。

穴のあるMeshや閉じていない面を領域に使う場合は、意図した内外判定になっているか確認してください。複雑なMeshを使う前にCubeやSphereで成立するか比べると原因を絞れます。

### 3. 寿命の終盤だけ、特定Setを終了させる

2系統の火花を作り、一方だけ早めに消したい場合は、pEmitterなどでSetを分けます。pKillの**Set ModeをAffect Specified Sets**、Set #を対象Setにし、Start Ageを0.8、End Ageを1.0に設定します。

この設定により、Regionと一致する対象Setのうち、寿命の後半に入った粒子が削除されます。たとえば長く漂わせたい煙を別Setにしておけば、火花だけを先に終わらせる構成にできます。寿命だけで終了時期を変えたい場合は、そもそも発生源側のLifespanを調整する方法もあります。pKillは**途中で条件を組み合わせて対象を絞りたい**場合に選びます。

## 似たノード・機能との違い

| 方式 | 粒子に起きること | 向く用途 |
| --- | --- | --- |
| **pKill** | Region・Age・Setなどの条件に合うParticleを削除 | 指定ゾーンへ入った粒子を以後の処理から除外 |
| [pAvoid](./pavoid) | Regionを回避するよう移動方向に作用 | 障害物を避けて進ませたい |
| [pBounce](./pbounce) | Regionとの接触で反射・跳ね返りを作る | 床で弾む破片や衝突表現 |
| [pChangeStyle](./pchangestyle) | 粒子のStyleやSetを変更する | 通過場所で色や後段の処理対象を変える |
| [pRender](./p-render)の**Kill Particles That Leave the View** | 表示境界を出た粒子を自動的に破棄 | 画面外へ出た粒子が戻らない構成の負荷を軽くしたい |

pRenderの**Kill Particles That Leave the View**は、表示範囲外へ出た粒子を自動で削除し、後からForceで戻そうとしても復帰しない機能です。位置ではなくAge・Setや任意のRegionを指定したいならpKillを使います。画面外から再び流れ込む演出では、pRender側の削除設定を使う前に挙動を確認してください。

削除によって計算対象を減らせる場合はありますが、性能改善の程度は粒子数や接続順、レンダリング設定によります。**pKillを置くだけで必ず高速化するとは限りません。**

## うまく動かないとき

- **全部消える**：Regionが広すぎないか、Allを指定していないか、Conditionsが全粒子へ作用する設定になっていないか確認します。
- **何も消えない**：粒子の軌跡がRegionと交差するか、Probabilityが0になっていないか、Start / End AgeとSet Modeが狭すぎないか確認します。
- **Bitmap / Meshで消えない**：Region Modeを切り替えたあとに追加端子へ画像・Meshをつないでいるか確認します。Bitmapでは参照チャンネル、Meshでは形状と位置の一致を確認します。
- **一度は残ったのに後で消える**：Probabilityの判定は毎フレーム行われます。毎回同じ粒子を残す選別にはなりません。
- **表示されない**：pKillの出力はParticleです。pRenderの有無と2D / 3D Output Mode、後段の接続先を確かめます。
- **フレームを飛ぶと結果が違う**：Particle simulationの状態は時間評価の影響を受けます。pRenderのPre-RollやAutomatic Pre-Roll、連続再生時との違いを確認します。

## 関連資料

- [Particleノード一覧](./index.md)：発生・移動・削除・描画の全体像。
- [パーティクルの基礎](../../learn/02-data/particle)：Particleデータと2D Imageの違い。
- [pRender](./p-render)：表示への変換、Pre-Roll、表示領域外の粒子削除。
- [pChangeStyle](./pchangestyle)：Setを変更して後段の対象を振り分ける。
- [pAvoid](./pavoid) / [pBounce](./pbounce)：避ける・跳ね返す場合の代替。

## 出典・バージョンと確認範囲

- **一次資料**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）、Chapter 114 pp.2675–2676（pKillの機能、入力、Region、基本構成）、pp.2697–2701（ConditionsとRegionの共通設定）、p.2682（pRenderの画面外粒子削除）。
- **対象**：DaVinci Resolve 21.1のFusionページ。本文の接続例は公式仕様に基づいた構成例であり、21.1実機でのレンダリングは未検証です。
- **未確認**：現行実機での端子表示とREGID、Regionモードごとの境界判定の細部、Edition差、性能改善量。正確な値や動作を推測で補わないため、`verification: partial`を維持します。
