---
title: ColorページのSerial・Parallel・Layerノード
description: Serialの処理順、Parallelの共通入力、Layerの重なりの優先関係を、局所補正の具体例で比較する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Serial Node, Parallel Mixer, Layer Mixer, Node Editor, Power Window, Qualifier]
tasks: [node-order, secondary-grading, combine-corrections, grade]
level: intermediate
updated: "2026-10-22"
---

# ColorページのSerial・Parallel・Layerノード

顔を明るくする補正と背景の色を変える補正を別ノードにしたのに、一方を変えたら他方の選択範囲まで変わる。あるいは二つのWindowが重なるところだけ、不自然な色になる。こうしたときは補正の数値より先に、**各ノードがどの画像を入力し、結果がどこで合成されるか**を確認します。

Colorページのノード構成には、順番に処理する**Serial**、同じ段階から複数の補正へ分岐する**Parallel**、重なった補正の優先順位を扱う**Layer**があります。ColorのCorrector／Mixerの仕組みであり、FusionのノードやEditページのトラック合成とは別です。

## 三つの構造の選び分け

| 構造 | 各補正が受け取る画像 | 適した目的 |
| --- | --- | --- |
| Serial（シリアル） | 直前のノードで処理済みの画像 | 基本補正→二次補正→Lookのように処理順が重要 |
| Parallel（パラレル） | 共通の上流画像。複数の結果をParallel Mixerでまとめる | 肌と背景などの二次補正で、一方の結果が他方の色抽出へ直結しないようにする |
| Layer（レイヤー） | 共通入力からの複数結果をLayer Mixerで重ねる | 補正が重なった領域の優先順位や合成方式を選ぶ |

どの構造でも、**上流の補正を変えれば後続の見た目は変わります**。「Parallelなら完全に独立」「LayerならMatteの精度が不要」という意味ではありません。ノード数やMixerの種類を画質向上の保証として扱わず、必要な処理関係から選びます。

## Serial：前の結果が次の選択条件にもなる

```text
入力 → [01 基本の露出・WB] → [02 肌の二次補正] → [03 Look] → 出力
```

この構成では02の[Qualifier](./hsl-qualifier)は、01で明るさや色が変わった画像から対象を抽出します。03が受け取るのも02の補正後の画像です。詳細は[Color Node Graphの基礎](../learn/color-node-graph)を参照してください。

たとえば01で青い光を弱めた後、02で青い衣装を選択すると、02は「弱めた後の青」を基準にします。01を再調整した途端に02のKey範囲が変わっても、必ずしも02が故障したわけではありません。**入力画像が変わった**ために起こり得る現象です。

Serialは基本となる構造です。撮影素材の色を整え、その結果を見ながら次の補正を決めるときには直列が自然です。順序を変えると結果が変わるため、処理の責任をノードごとに区別します。

## Parallel：同じ入力画像に二つの二次補正を適用する

```text
                         ┌→ [02 肌] ────────┐
入力 → [01 基本補正] ────┤                    ├→ [Parallel Mixer] → [04 Look] → 出力
                         └→ [03 背景] ──────┘
```

Parallelの02と03は、01の出力をそれぞれ入力に取ります。02で肌を暖かくした結果が03のQualifierへ直列に流れ込まないため、複数の独立した二次補正を管理しやすくなります。二つの結果はParallel Mixerで統合されます。

Blackmagic Designの旧版公式Reference Manualは、複数の重なる補正結果をParallel Mixerで混合する構造を説明しています。**21.1の内部合成式や重みをこの資料だけで確定することはできません**。実際の重なり方はViewerで確認してください。

### 操作例：人物と背景を同時に調整する

1. Colorページで対象ショットを選び、[Primaries](./primaries-color-wheels)で露出・ホワイトバランスを整えます。[Input／Timeline／Output](../learn/color-management-basics)の設定に不整合がある場合は先に解消します。
2. Node Editorで基本補正の後にParallel構造を追加し、二つのCorrectorが共通入力から分岐してParallel Mixerへつながることを確認します。旧版公式資料では、既存ノードからParallelノードを追加するとMixerも生成される流れです。**21.1固有のメニュー名・ショートカットは未照合**です。
3. 一方で顔を[Power Window](./power-windows)で囲み、明るさを少し上げます。もう一方で背景をQualifierまたはWindowで限定して色を変えます。
4. 顔だけ、背景だけ、**両方の選択範囲が重なった境界**の三か所を確認します。片方ずつノードを無効化して各補正の影響を見た後、両方有効に戻して結果を比較します。
5. [Scopes](./scopes)で信号の大きな変化を見て、動きがある場面ではWindowの追従も確認します。必要なら[Color Tracker](./color-tracker)で調整してください。

**採否例：** 人物の移動で顔用Windowが背景まで広がり、境界に色の段差が出た場合、Mixerだけを変える前にWindowのSoftnessと位置、補正量、[Keyの強度](./key-matte)を確認します。Parallelは誤った選択範囲を自動で補修しません。

## Layer：重なる場所の優先関係を指定する

```text
                         ┌→ [02 背景] ─────┐
入力 → [01 基本補正] ────┤                   ├→ [Layer Mixer] → 出力
                         └→ [03 人物] ─────┘
```

Layer Mixerも複数のCorrectorを合成します。Blackmagic Designの旧版公式Reference Manualによれば、通常の重ね合わせでは、**Layer Mixerのより下側の入力に接続された補正が、重複領域で優先**されます。合成モードを変えて結果を組み合わせる方式も説明されています。

ここでの「下側」は画像の下半分でも、自由に配置したノードの画面座標でもありません。**Mixerに接続した入力の重なり順**です。ノードを単に画面上で上下に動かしただけで優先順位が切り替わったと考えず、Mixerの入力と接続を確認します。

### 操作例：背景を大きく変えても顔を守りたい

1. 上流で基本補正を行い、背景用と人物用の補正を別のCorrectorに用意します。
2. 背景を青くする補正が、人物の髪や頬へどれだけかかっているか確認します。
3. 二つの結果をLayer Mixerで扱い、人物側が優先される重なり順を確認します。並びだけで判断せず、Viewerで変化を観察してください。
4. 顔や髪の縁が不自然なら、Layer Mixerの優先順位だけで直そうとせず、[Qualifier](./hsl-qualifier)、[Window](./power-windows)のSoftness、[Key](./key-matte)の強度を見直します。
5. 静止画だけでなくショット全体を再生し、背景と人物の境界に色の段差やちらつきがないことを確かめます。

**判断例：** 人物用の補正が背景用の補正より下に隠れるような見え方なら、Layer Mixerの入力順が意図と違う可能性があります。入力順を変えても細い髪の縁が青く残るなら、Matteの分離精度や補正量を疑います。

## ParallelとLayerを同じ素材で比較する

空と人物が一部重なって写るショットを用意し、空用Windowで青を少し強め、人物用Windowで暖色を足します。**比較する二つのノードで、Window位置、Softness、補正量を固定**します。

まずParallel Mixerで合成し、境界がどんな色になるかを見ます。次に、同じ二つの補正をLayer Mixerで扱い、入力の優先順を変えてみます。旧版公式資料には、Parallelでは重なりを混合し、Layerでは優先関係で結果が変わる作例があります。ただし本記事の比較は**実機で再現した結果ではなく、21.1で試すための確認手順**です。

評価を残すときは[Gallery／Stills](./gallery-stills)を使い、前後比較でどのMixerを使ったか分かるようにしてください。比較途中でカラーマネージメントや上流の露出まで変更すると、Mixerの違いを評価できません。

## 21の「レイヤーリストビュー」とLayer Mixerの違い

DaVinci Resolve 21の[公式新機能ページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/whatsnew/)では、ColorページのNode Editorに**レイヤーリストビュー**が追加されたと説明されています。これはノードを番号順の行として見やすく表示し、ラベル・バイパス・削除などの管理をしやすくする機能です。

**レイヤーリストビューは表示方式、Layer Mixerは画像の合成方式**です。表示を切り替えただけで補正の演算がLayer Mixerへ変わるわけではありません。21.1における表示切替の正確な操作位置は未照合です。

## 症状別の確認

| 症状 | 確認すること |
| --- | --- |
| 前段を変えたら後段Qualifierの選択が変わった | Serialで前の補正結果を入力していないか |
| Parallelなのに補正が干渉して見える | 共通の上流補正、Mixerの重なり、後段のLook |
| Layerで意図した補正が前面に来ない | Layer Mixerの入力順、接続、Matteの範囲 |
| 重なる部分だけ色が濃い | 二つのWindow、Keyの強度、合成方法 |
| ノードを画面上で移動しても結果が変わらない | 見た目の配置でなく、入力／出力の接続を確認 |
| 動画再生中だけ境界が揺れる | [二次補正がちらつく場合](../troubleshooting/secondary-matte-flicker)のTracker／Qualifier切り分け |
| ParallelからLayerに変えたら色が変わった | 合成の優先関係が変わった可能性。重なりを小さくして比較 |

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design [『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)は[公式サポート](https://www.blackmagicdesign.com/support)で**2026年9月8日公開**を確認しました。ただしPDFは約183MBで取得制限にかかり、**21.1の該当章・UI・ショートカットは直接照合できていません**。
- **現行の公式機能説明：** Blackmagic Design [Colorページ「ノードの使用」](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)（確認日：2026年10月22日）。左から右への処理フロー、ノード接続、基本補正と局所補正の分担を確認。[公式21新機能ページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/whatsnew/)（同日）でレイヤーリストビューがNode Editorの表示・管理機能であることを確認しました。
- **合成方式の公式説明（旧版）：** Blackmagic Design [『DaVinci Resolve 11 Reference Manual』「Node Tree Structures」](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_11_Reference_Manual.pdf)。Serial／Parallel／Layer構造、Parallel Mixerによる重なりの混合、Layer Mixerの優先順・合成モードを説明しています。**11の記述から21.1の合成式やUIが完全に同じとは断定していません**。
- **verification: partial。** 操作例は一次資料の構造を基にした想定例で、21.1実機での比較画像・Mixer演算値・Free／Studio差・性能は未検証です。

関連：[Color Node Graph](../learn/color-node-graph)／[Power Windows](./power-windows)／[HSL Qualifier](./hsl-qualifier)／[Color Warper](./color-warper)／[Scopes](./scopes)
