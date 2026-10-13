---
title: pCustom
description: Particle属性を式で操作するpCustom。入出力、式の評価順、画像参照、Region、具体的な制作例をResolve 21.1基準で説明する。
doc_type: node
term_id: pcustom
term_short: pCustomは、式で粒子ごとの位置・速度・色・大きさなどを計算するParticleノード。
verification: partial
aliases: [pCustom, pCu]
concepts: [particle-data, expressions, particle-region]
nodes: [pCustom]
node_family: particles
controls: [Number 1-8, Position 1-8, Setup 1-8, Inter 1-8, Particle, Conditions, Region]
inputs: [particle, image, image, region]
outputs: [particle]
tasks: [particles, expressions, custom-particle]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-13"
---

# pCustom

pCustomは、粒子（<Term id="particle-data">Particle</Term>）の位置、速度、回転、色、大きさなどを式で計算するノードです。寿命に応じて光点を透明にする、画像を参照して粒子の属性を変える、特定の領域に入った粒子だけ色を変える、といった処理を設計できます。

pEmitterが粒子を作り、pCustomが**粒子の値を計算し直し**、pRenderが画像または3D出力に変換します。pCustomは粒子を生成せず、通常の2D画像も出力しません。粒子とImageの違いは[Particleの基本](../../learn/02-data/particle)を参照してください。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Input（オレンジ）** | Particle | pEmitterや別のParticleノードから粒子を受け取る |
| **Image 1（緑）** | 2D Image | 式で値を参照する1枚目の画像 |
| **Image 2（マゼンタ）** | 2D Image | 式で値を参照する2枚目の画像 |
| **Region（必要時）** | Bitmap（2D Image）またはMesh（3D） | 処理の作用範囲を制限する。Regionタブで種類を選ぶと端子が現れる |
| **出力** | Particle | 計算後の粒子を後段のParticleノードやpRenderへ渡す |

**Image入力とRegion入力は別物です。** Image 1/2は画素値を式から読むための入力です。Regionは、たとえばロゴの内部など、処理を適用する場所を定めます。Imageに画像をつないだだけでは、その明るさや色が自動的に粒子へ反映されません。

```text
pEmitter ─(Particle)─→ pCustom ─(Particle)─→ pRender (2D) → Merge
                         ↑   ↑
                      Image 1  Region（必要時）
```

[pRender](./p-render)を2D出力にすればImageとしてMergeなどに接続できます。3Dで使う場合はpRenderの出力モードと後段の3Dシーンを合わせます。

## NumberとPosition

### Number 1–8

NumberはアニメーションやModifierで変えられる数値コントロールです。式から `n1` ～ `n8` として参照します。例えばNumber 1を「処理の強さ」と決めておけば、計算式を編集せずに値だけを調整できます。

21.1マニュアルには、現在時刻の値 `n1` だけでなく、指定時刻の値を読む `n1_at(float t)` なども記載されています。通常は現在値から使い始める方が、時間依存の挙動を理解しやすくなります。

### Position 1–8

PositionはXYZ座標を式へ渡すコントロールです。アニメーションする目標点の位置などに使えます。マニュアルはPosition 1–8と記載していますが、式変数の一覧ではPosition 4まで（`p1x` / `p1y` / `p1z` ～ `p4x` / `p4y` / `p4z`）しか例示していません。5–8番の変数名を未確認のまま補いません。

## Particleの属性と参照変数

pCustomのParticleタブでは、粒子ごとの属性に対応する式を扱います。式から参照できる主な値は次のとおりです。

| 変数 | 意味 | 利用の考え方 |
| --- | --- | --- |
| `px`, `py`, `pz` | 現在位置（XYZ） | 位置に応じて値を変える |
| `vx`, `vy`, `vz` | 速度（XYZ） | 速度に応じた変化 |
| `rx`, `ry`, `rz` | 回転 | 向きに応じた処理 |
| `sx`, `sy`, `sz` | Spin | 回転運動に応じた処理 |
| `size` | 粒子の大きさ | 大きさの計算 |
| `r`, `g`, `b`, `a` | 粒子のRGBA | 色と不透明度の計算 |
| `id` | 粒子識別子 | 粒子の区別 |
| `age`, `lifespan` | 年齢と寿命 | 時間経過に応じた変化 |
| `rgnhit`, `rgndist` | Region接触・距離 | 接触や接近に応じた処理 |
| `condscale` | 粒子位置でのRegionの強さ | 領域による影響量の調整 |

このほか、Regionとの接触位置 `rgnix` / `rgniy` / `rgniz`、Region表面の法線 `rgnnx` / `rgnny` / `rgnnz`、Image 1/2のアスペクト補正座標 `pxi1` / `pyi1` / `pxi2` / `pyi2`、画像サイズ `w1` / `h1` / `w2` / `h2` も記載されています。法線は面に垂直な向きです。

**入力として参照する変数と、計算結果を書き込む属性は別です。** どの属性の式を編集しているか確認してください。

## Setup、Intermediate、Particleの使い分け

処理の流れを次のように分けると、複数の式を管理しやすくなります。

1. **Setup**：フレームごとに先に一度計算する共通値。結果を `s1` などで後段の式から参照できます。Numberや時刻など、粒子ごとの値に依存しない計算に使います。
2. **Intermediate**：Setupの後に中間値を計算する場所。結果を `i1` などでParticle側から参照できます。
3. **Particle**：位置、速度、色などの粒子属性へ結果を反映する式。粒子ごとに変わる値はここで扱います。

たとえばNumber 1の値をSetup 1で共通利用したいなら、Setup 1へ `n1` と入力し、後段から `s1` を参照する構成です。値の意味を「色変化の強さ」と決めておけば、Number 1をアニメーションさせるだけで制御できます。

**マニュアルには記載の食い違いがあります。** Setup / Intermediateの項目数は各1–8なのに、Setupの説明とParticle変数一覧は `s1` ～ `s4`、Particle変数一覧は `i1` ～ `i4` だけを列挙しています。Intermediateの説明には `i1` ～ `i8` の記載があります。本記事では `s1` と `i1` のように確認できる範囲に限って例示します。

## Image 1/2から値を読む

21.1マニュアルでは、pCustomはCustom Toolと共通の演算子、関数、条件式を使えると説明しています。画像読み取り関数として `getr1w(x,y)` や `getz2b(x,y)` が例示されています。Image 1/2の画素値を式で読むことで、粒子へ個別の変化を与える構成を作れます。

粒子の位置に対応する画像の明るさを取得し、それをサイズへ反映する場合、画像をつなぐだけでは不十分です。どのチャンネルを読むか、どの座標を渡すか、結果をどの属性に書き込むかまで設計します。マニュアルは `pxi1` / `pyi1` をImage 1のアスペクトを考慮した粒子座標として説明していますが、読み取り関数にそのまま渡した際の結果までは実機で検証していません。未確認の完成式を断定して掲載しません。

## 制作例

### 1. 光点を寿命に沿ってフェードアウトする

```text
pEmitter → pCustom → pRender (2D) → Merge
```

pEmitterで光点を発生させ、正のLifespanを設定します。pCustomで不透明度を計算する式を `1 - age / lifespan` とする考え方です。発生直後は1、寿命に近づくほど0に向かいます。計算後の粒子をpRenderが2D Imageへ変換します。

この式は元のAlphaに倍率を掛けるのではなく、寿命比から**直接Alphaを決める**例です。元のAlphaも残す設計とは異なります。またLifespanが0にならない設定が必要です。式を入力するInspector欄と境界フレームの実際の結果は、21.1実機での確認対象です。

### 2. ロゴ内部の粒子だけ色を変える

```text
ロゴのAlpha画像 ──────→ pCustom (Region: Bitmap)
pEmitter ─(Particle)──→ pCustom ───────────────→ pRender (2D)
```

まず、ロゴ内部を不透明、外側を透明にした画像を作ります。pCustomのRegionタブでBitmapを選び、現れたRegion入力にその画像を接続します。次にParticleタブで色成分の計算を設定します。ロゴ内部で赤成分が増える式にすれば、対象領域に入った粒子だけ見た目を変える構成になります。

Regionは色を計算する入力ではなく、処理範囲を指定する入力です。Regionのチャンネル、座標の一致、Conditions側の絞り込みも確認します。Styleそのものの切り替えなら[pChangeStyle](./pchangestyle)との使い分けを検討してください。

### 3. 画像の明暗で粒子の大きさを変える

```text
白黒画像 ────────────→ pCustom (Image 1)
pEmitter ─(Particle)─→ pCustom ───────────────→ pRender (2D)
```

明るい場所と暗い場所のある2D画像をImage 1へ接続します。各粒子に対応する画素の値を式で読み、明るい場所では大きく、暗い場所では小さくなるようサイズへ反映する計算を設計します。元のpEmitterによる発生位置や寿命を変えず、画像だけ差し替えて模様を変える用途に使えます。

実際には読み取り関数、参照座標、チャンネル、サイズへ変換する式が必要です。画像をつないだだけで変化しないときは、まず一定数値でサイズが変わることを確認し、次に画像参照を追加します。

## Conditions / Regionと関連ノード

Conditionsは、Age、Probability、Setなどを使って**どの粒子を対象とするか**を決めます。Regionは**どの場所で処理するか**を決めます。詳しくは[Particleノード](./index.md)を参照してください。

| ノード | 適する操作 |
| --- | --- |
| **pCustom** | 粒子の属性を式で直接計算する |
| [pCustomForce](./pcustomforce) | 式でForceとTorqueを求め、運動へ力として加える |
| [pFriction](./pfriction) | 速度・Spinを減衰させる |
| [pChangeStyle](./pchangestyle) | 条件や接触でStyle・Setを変える |

単純な減速、衝突、Style変更は既存ノードを優先すれば、式が少なくなりグラフを読みやすくできます。

## 動かない・結果が違うとき

- **何も見えない**：Particle入力とpRenderの接続、2D/3D出力モードを確認します。
- **式の効果がない**：変更する属性の欄、変数名、Number、Conditions、Regionを確認します。
- **画像をつないでも変化しない**：ImageとRegionの端子の違い、読み取り関数、座標、色チャンネルを確認します。
- **変化が時間とともに強くなる**：現在値へ毎フレーム倍率を掛ける計算は累積し得ます。年齢や時刻から値を直接求める設計と区別してください。
- **途中から再生すると結果が違う**：前フレームの粒子状態が必要な場合は、[pRender](./p-render)のPre-Rollと[フレーム評価](../../learn/05-time/frame-evaluation)を確認します。

## 出典と確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**（September 2026）、Chapter 114「Particle Nodes」pp.2653–2656：pCustomの役割、入力、Number、Position、Setup、Intermediate、Particle変数。
- 同Chapter pp.2697–2699：ConditionsとRegionの共通設定。Chapter 111 pp.2584–2586：Custom Toolの式と画像入力の背景。
- 制作例は確認した機能に基づく説明・設定案です。Resolve 21.1の実機Inspector、画像サンプリング座標、式の境界挙動、5–8番の結果変数、Edition差・性能は未検証です。
