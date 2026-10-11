---
title: Chromatic Adaptation
description: 光源や表示環境の白色点が変わったとき、白だけでなく各色の見え方も合わせるための色順応変換ノード。
doc_type: node
term_id: chromatic-adaptation
term_short: 異なる照明条件や表示白色点の間で、色の見え方を合わせる色順応変換ノード。
verification: partial
aliases: [Chromatic Adaptation, CrA]
concepts: [image-data, color-space, white-balance]
nodes: [Chromatic Adaptation]
node_family: color
controls: [Method, Source Illuminant, Target Illuminant, Current Color Space, Current Gamma]
inputs: [image, mask]
outputs: [image]
tasks: [white-point, color-temperature, color-management]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Chromatic Adaptation

Chromatic Adaptationは、画像が**どのような照明や白色点を前提に作られたか**を指定し、別の照明・白色点を前提とする見え方へ変換するノードです。たとえば、白色点の異なる2つの映像を同じ基準にそろえるときに使います。

「白色点」は、画像のどの色を基準の白として扱うかを示します。基準の白が変わると、白そのものだけでなく、赤・青などの色の見え方も変わります。このノードは人の視覚による色順応（Chromatic Adaptation）をモデル化して、その変化を補正します。単純にRGBの各値へ一定量を足す処理とは異なります。

このノードで指定するのは、主に**変換前と変換後の照明条件**です。RGBの原色やガンマを別形式へ変換すること自体が目的なら、[Color Space Transform](./color-space-transform)を検討します。

## 入力・出力

| 接続 | 役割 |
| --- | --- |
| Input（オレンジ） | 補正対象の2D画像。MediaIn、Loader、Mergeなどから接続します。 |
| Effect Mask（青・任意） | 補正を適用する範囲。PolygonやRectangleなどのマスクで制限できます。 |
| Output | 色順応変換後の2D画像。後続のカラー処理、Merge、MediaOutなどへ渡します。 |

通常の接続は次のとおりです。

```text
MediaIn ──→ Chromatic Adaptation ──→ MediaOut
                     ↑
               Effect Mask（任意）
```

Effect Maskを接続しなければ画像全体が対象になります。21.1マニュアルによると、Effect Maskはノードの処理後に適用されます。マスクを使う場合は、境界を含めて補正範囲を確認してください。

## 主な設定

### Method — 色順応の計算方法

色順応の計算方法を選びます。21.1でマニュアルが説明する代表例は次の3つです。

| Method | 特徴・選び方 |
| --- | --- |
| **CAT02** | 既定値。彩度の非常に高い青が紫へ寄りやすい問題を軽減する非線形成分を持ちます。マニュアルでは、幅広い測定データに対応し、発光ディスプレイや暗めの視聴環境に適すると説明されています。 |
| **Bradford Linear** | 広く使われている方法。暗めの発光ディスプレイ環境だけでなく、暗い劇場での反射型スクリーンにも適します。ただし高彩度の青が紫へ寄る場合があります。 |
| **Von Kries** | 古くから使われている方法。高彩度の青ではBradford Linearと同様の変化が起き得ます。既存の別アプリケーションで使われた方式と結果をそろえたい場合の候補です。 |

**中立色（グレーや白）の変換結果は、どのMethodでも一致します。** 違いが出るのは主に彩度のある色です。白だけを見て方法の優劣を判断せず、高彩度の青や赤なども比較してください。

CAT02を基本にし、別のアプリケーションや既存の納品工程と合わせる必要があるときだけMethodを切り替えると、選択理由を明確にできます。どの方式でもすべての色が同一になるわけではありません。

### Source Illuminant / Target Illuminant — 変換前後の照明条件

- **Source Illuminant**：入力画像が前提としている照明・白色点。
- **Target Illuminant**：変換後に合わせたい照明・白色点。

SourceとTargetのそれぞれについて、マニュアルでは次の指定方法が確認できます。

| Illuminant Type | 指定する内容 |
| --- | --- |
| Standard Illuminant | 定義済みの標準光源から選ぶ |
| Color Temperature | 色温度をスライダーで指定する |
| CIE 1931 xy | 白色点の色度座標をx・yで指定する |

ここでのSourceは、単に撮影現場の照明器具の色ではありません。**ノードに入ってくる画像が、現時点でどの白色点を前提としているか**を確認します。前段のホワイトバランス補正や色管理で白色点をすでに変えている場合、カメラに設定していた色温度をそのままSourceに入れるとは限りません。

SourceとTargetを逆に設定すると、意図と逆向きに補正されます。

### Current Color Space / Gamma — 入力RGBの解釈

- **Current Color Space**：ノードに入る画像の現在の色空間。
- **Current Gamma**：ノードに入る画像の現在のガンマ。

21.1マニュアルでは、どちらも初期状態ではタイムラインの設定を参照すると説明されています。MediaInやLoaderの読み込み設定、前段の変換によって、実際の画像がタイムラインとは異なる状態になっている場合は、その**現在の状態**に合わせます。

これらは「変換後の色空間を選ぶ」という設定ではありません。入力RGBを正しく解釈して色順応を計算するための指定です。

## 実践例1：異なる白色点で作られた映像をそろえる

同じ原色・ガンマを使っていても、一方がD60、もう一方がD65を白色点の基準として作られている場合、そのまま並べると白や彩度のある色が一致しないことがあります。D60側の画像をD65の基準に合わせる例です。

1. ノードに入る画像がD60を基準としていることを確認します。前段ですでにD65へ変換しているなら、同じ処理は繰り返しません。
2. D60側の画像にChromatic Adaptationを接続します。
3. **Source Illuminant**にD60、**Target Illuminant**にD65を指定します。標準光源メニューに必要な選択肢がない場合は、制作工程で確定しているCIE 1931 xy値を使用します。座標を推測して入力しません。
4. **Current Color Space / Gamma**を、そのノードに入る画像に合わせます。
5. **Method = CAT02**を出発点とし、グレーだけでなく高彩度の色も比較します。

この例は白色点の違いを補正するものです。原色やガンマも異なる素材なら、必要な色空間変換を別途設計してください。白色点の補正だけで、異なるカメラ・表示規格のすべての差が解消するわけではありません。

## 実践例2：画像の一部分だけ色順応を変える

背景を補正せず、特定の領域だけ別の照明条件に合わせたい場合はEffect Maskを使えます。

```text
MediaIn ─────────→ Chromatic Adaptation ──→ MediaOut
                          ↑
Rectangle / Polygon ──────┘
```

1. RectangleまたはPolygonで範囲を作ります。
2. そのマスクをChromatic Adaptationの青入力へ接続します。
3. Source / Target Illuminantを設定します。
4. マスク境界で色が不自然に切り替わらないか確認し、必要に応じてマスクの境界を調整します。

このノードは照明の影、反射、明暗の形まで再現するものではありません。部分的な色順応補正と、実際の照明の作り直しは区別してください。

## White Balance / CSTとの違い

| 目的 | 選ぶ候補 |
| --- | --- |
| グレーカードなど、無彩色であるべき部分を基準に画像の色かぶりを直す | [White Balance](./white-balance) |
| 既知のSource / Target照明条件・白色点の間で色順応を変換する | **Chromatic Adaptation** |
| Input / Output Color SpaceやGammaを変え、必要ならTone / Gamut Mappingも行う | [Color Space Transform](./color-space-transform) |
| 色域を出力範囲へ収める処理を調整する | [Gamut Mapping](./gamut-mapping) |

CSTにも**Use White Point Adaptation**があります。色空間の変換と同時に白色点も変えるなら、CST側に任せられる場合があります。RCMや前段のCSTが同じ白色点補正を済ませているときに、このノードで再度適用しないようにしてください。

White Balanceは基準となるグレーや撮影時の色温度を手がかりに、素材の色かぶりを補正する作業に適しています。一方、Chromatic Adaptationは変換元と変換先の照明条件が分かっており、色順応の方式まで明示したい工程に向きます。

## 結果が合わない場合

| 症状 | 確認すること |
| --- | --- |
| 期待と逆方向に色が変わる | SourceとTargetを逆にしていないか。画像がすでに白色点変換済みでないか。 |
| 白は合うが鮮やかな青が不自然 | Methodを確認。21.1マニュアルでは、高彩度の青はMethodによって結果が異なると説明されています。 |
| 全体的な色の変化が予想と違う | Current Color Space / Gammaと、MediaIn・Loader・前段ノードの変換結果が一致しているか。 |
| ほとんど変化しない | SourceとTargetが同じ設定ではないか。Effect Maskで処理範囲が制限されていないか。 |
| CSTやRCMを追加すると色がさらにずれる | 白色点補正や色空間変換の二重適用がないか。 |

## 関連項目

- [Color Space Transform](./color-space-transform) — 色空間・ガンマ変換とWhite Point Adaptation
- [White Balance](./white-balance) — グレー参照や色温度を使う素材補正
- [Gamut](./gamut) — 色空間とガンマ処理
- [マスク（Mask）](../../learn/02-data/mask) — Effect Maskによる適用範囲の限定

## 出典・確認範囲

- Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）、Chapter 93「Color Nodes」、pp.2136–2138。Fusionの入力、Method、Illuminant、Current Color Space / Gammaを確認。
- 同マニュアル、Chapter 9、pp.241–242。Resolve Color ManagementのWhite Point Adaptationと、P3-D60 / P3-D65の使用例を参照。
- 同マニュアル、Chapter 156、pp.3541–3542。Colorページで使用するResolve FX Color版の説明も照合。

説明は21.1の公式記述に基づきます。Fusion実機での内部REGID、各ドロップダウンの全選択肢、数値範囲、処理精度、Edition差はこの改稿では未確認です。ColorページのResolve FX版とFusionノード版でInspectorの全項目が完全一致するとは断定しません。
