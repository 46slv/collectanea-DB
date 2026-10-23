---
title: Particleノード
description: Particleを作る・動かす・まとめる・2D/3Dへrenderする流れと、各p* Nodeの選び分けを整理する。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, particles, emit, force, render]
updated: "2026-10-13"
---

# Particleノード

FusionのParticle系Nodeは、雨・煙・火花・群れなど、多数の要素を自動生成して動かすための仕組みです。

途中では通常の2D Imageではなく、各particleの位置・速度・寿命・回転・size・colorなどを持つ<Term id="particle-data">Particle set</Term>を扱います。最後にpRenderで2D Imageまたは3D geometryへ変換します。

## 最小構成

```text
pEmitter → pRender
```

pEmitterがparticleを生成し、pRenderが見える結果へ変換します。

## Nodeを選ぶ

| やりたいこと | Node | 何が変わるか |
| --- | --- | --- |
| particleを生成 | [pEmitter](./p-emitter) | 数、寿命、初速、region、style |
| Imageのpixelからparticleを生成 | [pImage Emitter](./pimageemitter) | pixel位置・色・Alphaをparticle generationへ利用 |
| particleからparticleを増やす | [pSpawn](./pspawn) | 既存particleをemitter化 |
| 2つのparticle streamをまとめる | [pMerge](./pmerge) | 2 streamを1 streamへ統合 |
| 一定方向へ加速 | [pDirectionalForce](./pdirectionalforce) | gravityのようなforce |
| 1点へ引き寄せる / 反発させる | [pPoint Force](./ppointforce) | point中心のattract / repel |
| 渦を作る | [pVortex](./pvortex) | rotational force |
| motionへ乱れを加える | [pTurbulence](./pturbulence) | frequency-based chaos |
| velocity / spinを減衰 | [pFriction](./pfriction) | movementやrotationをslow down |
| regionを避ける | [pAvoid](./pavoid) | regionへ近づく前に進行方向を変える |
| regionで跳ね返す | [pBounce](./pbounce) | collision-like bounce |
| targetへ追従させる | [pFollow](./pfollow) | animated follow pointへspring-likeに追従 |
| 群れ行動 | [pFlock](./pflock) | attraction / repulsion / following |
| 見た目を途中で変える | [pChangeStyle](./pchangestyle) | styleやparticle set assignmentを変更 |
| 条件で消す | [pKill](./pkill) | region / age / set等でparticleをdestroy |
| Alpha gradientでforceを作る | [pGradientForce](./pgradientforce) | ImageのAlpha gradient方向へ加速 |
| 独自式でparticle属性を変更 | [pCustom](./pcustom) | position / velocity / color等をexpressionで操作 |
| 独自式でforceを作る | [pCustomForce](./pcustomforce) | position / torqueへcustom force |
| tangent方向のforce | [pTangent Force](./ptangentforce) | regionに対する接線方向へforce |
| 最終結果をrender | [pRender](./p-render) | Particle set → 2D Image / 3D geometry |

## 処理順を読む：生成 → 作用 → 描画

ParticleデータはpEmitterからpRenderまで接続をたどって流れます。Force系の効果を順に適用するなら、次のように**直列**へ挿入します。

```text
pEmitter → pDirectionalForce → pTurbulence → pFriction → pRender
```

pDirectionalForceが設定した方向へ加速し、pTurbulenceが不規則な動きを加え、pFrictionが速度を減衰させます。Nodeを別々の枝へ置いただけでは結果は自動で合流しません。

2種類の粒子を別々に処理して統合するには、Particle専用の[pMerge](./pmerge)を使います。

```text
pEmitter（火花） → pDirectionalForce ─┐
                                    ├→ pMerge → pRender
pEmitter（煙）   → pTurbulence ──────┘
```

この順なら火花と煙に異なる動きを付けた後で、一緒に描画できます。pMergeの**後**にForceを挿入すれば、統合済みのParticle全体が対象になります。対象を火花だけに限定したい場合は、後述のSetとConditionsを使います。

**pMergeはParticle同士の統合**、通常のMergeは**描画後の2D画像同士の合成**、Merge 3Dは**3Dシーン要素の統合**です。似た名前でも入出力は異なります。

## 2Dで重ねるか、3Dシーンへ渡すか

[pRender](./p-render)のOutput Modeは2D Imageか3D Geometryを選ぶ設定で、21.1マニュアルでは初期値が3Dと記載されています。

**2D画像として実写へ合成する場合：**

```text
pEmitter → pRender（2D） ──→ Merge（Foreground）→ MediaOut
MediaIn（実写） ──────────→ Merge（Background）
```

pRenderが粒子を画像にしてからMergeで実写へ重ねます。画像用Blurなどの後処理もこの描画後の経路へ置きます。

**3Dシーンの一部として描画する場合：**

```text
pEmitter → pRender（3D） ──→ Merge 3D → Renderer 3D → Merge（2D）
Shape 3D / Light 3D ─────→ Merge 3D
```

3D出力は最終的な2D画像ではなくGeometryです。別の3D形状やLightと合わせ、Renderer 3Dで画像へ変換します。21.1マニュアルには、Output Modeを決めてInspectorの操作をした後はモードを切り替えられない場合があるとの注意があります。後段に合わせて最初に出力方法を選びます。実機での制限条件は未検証です。

## Conditions・Region・Styleの違い

### Conditions：どのParticleに作用させるか

Conditionsは、後段のForceやBehaviorが**どの粒子に適用されるか**を限定します。21.1マニュアルには次の設定があります。

- **Probability**：各粒子がそのフレームで影響を受ける確率。0.6なら約60%です。**毎フレーム判定**されるため、生まれた時点で60%を選び、以後ずっと固定する設定ではありません。
- **Start/End Age**：生存時間のどの割合で作用させるか。Start 0.8、End 1.0なら最後の20%だけが対象です。
- **Set Mode / Set #**：番号付きSetで対象を指定。Ignore SetsはSetを区別せず、Affect Specified Setsは選択Setだけ、Ignore Specified Setsは選択していないSetだけへ適用します。

SetはpEmitter、pImage Emitter、pSpawn、pChangeStyleなどで割り当てられます。例えば煙をSet 2、火花をSet 1で作り、pMergeで統合した後の[pFriction](./pfriction)をSet 1だけに作用させられます。

### Region：どこで発生／作用させるか

pEmitterでは粒子を**発生させる場所**、Force系では**力が働く場所**を指定します。BitmapをRegionに使えば画像由来の領域、Meshなら3D Geometryで領域を定義できます。BitmapまたはMeshへ切り替えた際に入力が追加されるNodeもあります。

ロゴの輪郭から火花を生むなら、ロゴ画像をpEmitterの発生Regionに渡します。右半分に来た粒子だけ減速させるならpFriction側の作用Regionに画像を渡します。見た目のためのStyle Bitmapとは異なる入力です。

### Style：どんな姿で描画するか

21.1マニュアルの共通「Style Tab」節（p.2692）は、**pEmitter・pSpawn・pChangeStyle・pImage Emitter**の4つを対象として明記しています。一方、[pGradientForce](./pgradientforce)の個別節（p.2672）にはStyleを共通タブに含める説明があり、記述が一致しません。したがって、4つ以外のNodeにStyleタブが表示されるかは本資料だけでは断定できません。pGradientForceの実機表示は未確認です。

Styleで選ぶPointは点、Bitmapは画像、Blobは柔らかい塊、Lineは線状の粒子です。画像を粒子の見た目に使う場合は、StyleをBitmapにしたノードの**Style Bitmap入力**へ2D Imageを接続します。

[pGradientForce](./pgradientforce)にもImage入力がありますが、こちらは**Alphaの濃淡から力を計算する**ための入力です。同じ画像であっても「粒子の姿」と「動かす方向」は別に設定します。

## 端子を選ぶ：Particle・Image・Regionの例外

Particle系でも、**端子の色だけで入力データを決めない**ことが重要です。とくにpImage Emitterの橙色の主入力は、一般的なParticle処理ノードとは異なり**2D Image**を受け取ります。

| Node | 主入力・追加入力 | 出力と接続判断 |
| --- | --- | --- |
| [pEmitter](./p-emitter) | 既定では入力なし。StyleをBitmapにすると一粒の絵柄用Image入力、RegionをBitmap／Meshにすると発生場所用の入力が追加 | Particleを新たに生成する |
| [pImage Emitter](./pimageemitter) | **橙色の主入力が2D Image**。その画素位置・色を粒子化する。Style Bitmap入力とRegion入力は別用途 | 画像を受け取るが、出力はParticle |
| [pGradientForce](./pgradientforce) | 橙色はParticle、緑色のImageはAlphaの勾配から力を作るための2D画像。Regionは作用範囲を限定する別入力 | 粒子を新たに作らず、入力Particleの動きを変える |

たとえば透過ロゴを粒子へ分解するなら、ロゴを**pImage Emitterの主入力**へ渡します。一方、ロゴの形の範囲内でランダムに粒子を生みたいなら、**pEmitterのRegion Bitmap入力**へロゴを渡します。前者は画像の画素を格子状に粒子化し、後者は画像の領域を発生場所として使います。

pImage Emitterで透明な余白が広い画像を扱うときは、**Alpha Threshold**にも注意します。21.1マニュアルでは既定の0.0で透明画素からも不可視の粒子が発生すると説明し、完全透明部分を除く目安に約0.004（1/255）を挙げています。動画の色を既存の粒子格子へ反映したいだけなら、毎フレーム新たな粒子を作る必要はありません。詳しい設定は[pImage Emitter](./pimageemitter)を参照してください。

## Particleの時間：Pre-RollとPre-Generate

Particleは前のフレームの状態から現在の動きを計算します。フレームを大きく飛ぶと、途中の計算不足で結果が違って見えることがあります。

- **Pre-Roll**：render rangeの開始から現在フレームまで計算し直します。飛ばした先で粒子の位置や数がおかしい場合に使います。
- **Automatic Pre-Roll**：大きく時間を移動しても自動で再計算します。重いシミュレーションでは処理時間に注意します。
- **Pre-Generate Frames**：最初の有効フレームより前に指定フレーム数を生成し、冒頭から煙などが存在する状態を作ります。
- **Restart**：現在フレームからParticle systemを開始し直します。

Pre-Rollは**途中の状態の計算し直し**、Pre-Generate Framesは**開始時点の状態の用意**です。混同しないようにします。

## 制作例

### 1. 実写映像へ火花を加える

pEmitterで寿命の短い火花を生成し、pDirectionalForceで落下方向へ加速、pFrictionで減速します。pRenderを2DにしてMergeのForegroundへ渡し、MediaInの実写をBackgroundへ接続します。画像として見えない場合は、pRenderのOutput ModeとMergeの入出力を確認します。

### 2. 火花と煙を異なる動きで合成する

2つのpEmitterを用意し、火花だけをpDirectionalForce、煙だけをpTurbulenceへ通します。それぞれのParticleをpMergeで統合し、pRenderで描画します。統合後に共通のForceを加える場合は、SetとConditionsで影響対象を制限できます。

### 3. 3Dシーンの冒頭から煙を漂わせる

pEmitterで煙を生成し、pRenderを3Dに設定します。Merge 3Dで別の3Dオブジェクトと合わせ、Renderer 3Dで画像へ変換します。撮影カットの開始時から煙を見せたい場合はPre-Generate Framesで事前の状態を作ります。途中のフレームへ移動した際の位置が不正確ならPre-Rollを確認します。

## 接続・表示の確認

| 症状 | 確認すること |
| --- | --- |
| pEmitterから通常のMergeへ接続できない | Particleは未描画。pRender（2D）で画像へ変換する |
| pRenderからMerge 3Dへ接続できない | Output Modeが3Dか確認する |
| Forceが効かない | 直列経路にあるか、Strength・Conditions・Regionが対象外にしていないか |
| Bitmapを入れても意図と異なる | Style Bitmap・Image・Regionのどの入力か |
| 一部の粒子にしか効果が出ない | Probability・Start/End Age・Set Mode・Set番号 |
| フレームを飛ぶと粒子数が変わる | Pre-Roll・Automatic Pre-Roll |
| 冒頭で煙が出始めてしまう | Pre-Generate Frames |

## 関連する考え方

- [パーティクル（Particle）](../../learn/02-data/particle)
- [フレーム評価](../../learn/05-time/frame-evaluation)
- [データ領域を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 86「Particle Systems」pp.1891–1895、Chapter 114「Particle Nodes」pp.2678–2681・2697–2702を基に整理しています。

各Node固有Controlは個別ページで説明します。内部particle representation、solver / simulation実装、実機性能は未確認です。
