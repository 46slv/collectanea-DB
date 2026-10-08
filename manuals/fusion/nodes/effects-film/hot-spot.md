---
title: "Hot Spot"
description: "指定した光源位置からレンズフレアや反射を作り、遮蔽物による見え隠れも制御する2D Effect Node。"
doc_type: node
term_id: "hot-spot"
term_short: "Hot Spotは、画像上の光源位置に発光やレンズ内反射を加え、別画像でその光を遮ることもできるNode。"
verification: partial
aliases: ["Hot Spot", "Hot"]
concepts: ["image-data", "mask-data"]
nodes: ["Hot Spot"]
node_family: "effects-film"
controls: ["Primary Center X/Y", "Primary Strength", "Hot Spot Size", "Aspect", "Aspect Angle", "Secondary Strength", "Secondary Size", "Apply Mode", "Occlude", "Lens Aberration", "Aberration", "Color Mode", "Color Splines", "Mix Spline", "Radial On", "Radial Mode", "Radial Length", "Radial Density", "Radial Repeat", "Length Angle", "Density Angle", "Lens Reflect 1-3", "Element Strength", "Element Size", "Element Position", "Element Type", "Lens Color"]
inputs: ["image", "mask", "image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Hot Spot

Hot Spot [Hot]は、**画像内の指定した位置を光源として、まぶしい発光やレンズ内で反射したような光の像を作る**Nodeです。太陽や車のヘッドライトに光を足すほか、周囲を暗くして特定の場所だけを照らすスポットライト風の処理にも使えます。

実際のレンズフレアは、強い光がレンズ内部で反射・散乱することで現れます。Hot Spotはその見た目を画像上で組み立てる効果であり、レンズの光学系を物理的に測定・再現する仕組みだとは限りません。主光源の位置を指定し、その周囲の光、反対側に現れる反射、追加の反射要素を調整します。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualで確認できる入力は3本です。

- **Input（オレンジ、必須）**：光を追加する2D <Term id="image">Image</Term>。Hot Spotは単独の画像生成Nodeではなく、加工する画像が必要です。
- **Effect Mask（青、任意）**：効果を表示する範囲を制限する<Term id="mask">Mask</Term>。Hot Spotの処理後に適用されるため、マスクの外側へ伸びた光も最終的には制限されます。
- **Occlusion（緑、任意）**：光を隠す位置を示す別の2D Image。**白い部分で光を隠し、灰色では一部を弱める**ため、人物や建物の後ろへ光源が入る表現に使います。InspectorのOccludeでAlphaまたはR/G/Bのどのチャンネルを読むか選びます。

出力はHot Spotを適用した2D Imageです。次のMergeやMediaOutへそのまま接続できます。Effect MaskとOcclusionはどちらも光の見え方に影響しますが、**前者は完成した効果の表示範囲を制限し、後者は遮蔽物として光を隠す**点が異なります。

~~~text
MediaIn ──────────────→ Hot Spot → MediaOut
                           ↑
              Occlusion（任意の2D Image）
~~~

## 発光の位置・強さ・形（Hot Spotタブ）

- **Primary Center X / Y**：光源の位置。追加した反射要素も、この主光源の位置を基準に配置されます。移動するライトを追わせる場合は、位置をアニメーションさせます。
- **Primary Strength**：中心にある主光源の明るさ。
- **Hot Spot Size**：主光源の直径。Manualでは1.0を画像の全幅に相当する円として説明しています。
- **Aspect / Aspect Angle**：光の縦横比と回転。Aspectが1.0なら円形で、1.0より大きいと横長、小さいと縦長になります。
- **Secondary Strength / Secondary Size**：主光源と画像の反対側に現れる副次的な反射の明るさと大きさ。

**Apply Mode**は、効果を元画像へどう適用するかを切り替えます。

| Mode | 画像の変化 | 使いどころ |
| --- | --- | --- |
| **Add (Burn)** | 光の部分を明るくする | 太陽・ヘッドライトなどのフレア |
| **Subtract (Dodge)** | 光の部分を暗くする | 減光した円形の効果 |
| **Multiply (Spotlight)** | 一部を照らすように残し、周囲を暗くする | スポットライト風の演出 |

名称だけではAddとSubtractの結果を取り違えやすいため、まずこの3方式を切り替えて確認します。

### Lens Aberration / Aberration

**Lens Aberration**では発光の形を円から引き伸ばしたり、輪状にしたりできます。**Aberration**はその変形の強さです。

- **In / Out**：光を画像中央方向、または画面の角方向へ伸ばします。
- **Flare In / Flare Out**：光源が中央へ近づくほど、または端へ近づくほど変形を強めます。
- **Lens**：輪のあるレンズ風の形にします。

同じ光でもPrimary Centerを動かすと、反射要素との位置関係や一部のAberration modeによる伸び方が変わります。

## 色の変化（Colorタブ）

Hot Spotには、単色を指定するだけでなく、**中心から外側へ向かう明るさと色の変化**を設定するカーブがあります。

**Red / Green / Blue / Alpha Splines**は、それぞれのチャンネルが半径方向にどう弱まるかを指定します。たとえば中心を白く、外側を赤みのある薄い光にしたい場合は、色チャンネルごとのカーブを変えます。

**Color Mode**のNoneは時間で変わらないカーブ、Animated Pointsはカーブのポイントをキーフレームで動かす設定です。Dissolveは旧構成との互換性のために残る方式として説明されています。

**Mix Spline**は、後述するRadialタブで作った形とColor側の光をどの程度混ぜるかを決めます。Manualでは0がRadial側、1がColor側です。単純な透明度のMixとは異なります。

## 方向ごとに光の形を変える（Radialタブ）

Colorタブが主に中心から外側への変化を扱うのに対し、Radialタブは**光源の周囲を一周したとき、方向ごとに光の長さや明るさを変える**ためのものです。

**Radial On**を有効にして、次のカーブを調整します。

- **Radial Length**：方向ごとの光の長さ。片側へだけ伸びる光を作る場合に使います。
- **Radial Density**：方向ごとの光の明るさ。光の筋を出す方向と抑える方向を分けられます。
- **Radial Repeat**：カーブによる模様を一周の中で繰り返す回数。たとえば2なら半周ごとに同じ変化が現れます。
- **Length Angle / Density Angle**：長さと明るさの模様をそれぞれ回転させます。

カーブの横軸は半径ではなく、光源を一周する角度です。0が0度、1.0が360度に対応します。Colorタブの半径方向のカーブと混同しないようにします。

Radial ModeのAnimated Pointsでは、カーブの形を時間とともに変えられます。旧方式のInterpolated Valuesは互換性用です。Radial Onを無効にしていると、Radialの形もColor側のMix Splineも効果へ反映されません。

## 追加のレンズ内反射（L1 / L2 / L3タブ）

L1・L2・L3の3タブでは、主光源・副光源とは別の反射要素を作れます。各タブの**Lens Reflect 1–3**は、1項目につき一対の反射要素を有効にします。

各タブで調整できる主な項目は次のとおりです。

- **Element Strength / Element Size**：反射の明るさと大きさ。
- **Element Position**：光源の位置と画像中央を結ぶ軸を基準にした、反射要素の配置距離。
- **Element Type**：柔らかな円、輪、角のある多角形、星形など。Circular、Soft Circular、Circle、NGon系から選びます。
- **NGon Angle / Sides / Starriness**：多角形の向き、辺数、星形への変形を調整します。
- **Lens Color**：反射要素の色へ影響するレンズ色を調整します。

フレアを大きな1つの白い丸で済ませず、弱い反射や輪を複数重ねると、光源から画面中央へ伸びるレンズ内反射らしい構成を作れます。

## 運用例：車のヘッドライトを光らせ、車体で隠す

1. 実写をInputへ接続し、**Apply Mode = Add (Burn)**にします。
2. **Primary Center**をヘッドライトの位置へ合わせ、Primary StrengthとHot Spot Sizeを小さめから調整します。
3. Secondary Strengthを弱めに加え、必要な場合だけL1–L3で輪状・多角形状の反射を足します。
4. 車体や通行人が光を遮るカットでは、**遮蔽物を白、その他を黒にした2D Image**をOcclusionへ接続します。
5. Occludeで使うチャンネルを合わせ、遮蔽物が移動する場合はOcclusion画像の位置・形も追従させます。

~~~text
実写映像 ─────────────→ Hot Spot → 最終合成
                          ↑
白い車体領域 / 黒い背景 → Occlusion
~~~

光源の位置だけを動かしても、遮蔽物の前後関係は再現されません。**Occlusionを与えない場合、フレアが車体の上に重なったまま見える**ことがあります。逆にEffect Maskで全体を狭く囲うと、遮蔽物の後ろに光を隠すだけでなく、伸ばしたかった反射まで切り落とすことがあります。

## 使い分けと注意点

- **[Highlight](./highlight.md)**：入力画像の明るい部分から星状の光を作る。Hot SpotはPrimary Centerで指定した位置を軸に反射要素を組み立てる。
- **[Rays](./rays.md)**：画像のAlphaや明るい領域をもとに、放射状の光条を伸ばす。輪や複数の反射要素を作るHot Spotとは用途が異なる。
- **Effect MaskとOcclusion**：前者は適用後の表示範囲、後者は白黒画像による遮光。どちらも任意入力だが役割は同じではない。
- **素材との一致**：反射の色・大きさ・向きは、元映像の実際の光源やレンズの見た目に合わせて調整します。特定の実在レンズの完全な光学再現や、自動的な3D遮蔽を保証するNodeではありません。

## 関連

- [Effect / Filmノード一覧](./index.md)：光・フィルム表現を選ぶ入口。
- [画像（Image）の基礎](../../learn/02-data/image.md)：2D ImageとAlpha。
- [マスク（Mask）の基礎](../../learn/02-data/mask.md)：効果を表示する範囲。
- [Highlight](./highlight.md) / [Rays](./rays.md)：似た光の効果との比較。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 97「Effect Nodes」、**Hot Spot [Hot]（pp.2281–2287）**を一次資料としています。3入力、Primary / Secondary、Apply Mode、Occlusion、Lens Aberration、Color / Radial spline、L1–L3のLens Reflect設定は該当節で確認しています。

上の運用例は、Manualで確認できる機能を組み合わせた接続案です。現在の21.1実機での描画結果、正確なInspectorの初期値・数値範囲、内部REGID、edition差は未確認のため、verificationはpartialのままとしています。
