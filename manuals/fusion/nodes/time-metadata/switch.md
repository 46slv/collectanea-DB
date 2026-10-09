---
title: Switch
description: 複数の入力から1本のデータを選んで後段へ渡すSwitch Node。2D ImageだけでなくShapeやClassic 3Dでの用途、Sourceと入力数の設定を説明する。
doc_type: node
term_id: switch
term_short: 複数の入力のうち1本を選んで後段へ渡すNode。2D Image、Shape、Classic 3Dなどに対応する。
verification: partial
aliases: [Switch, Swi]
concepts: [image-data, shape-data, classic-3d]
nodes: [Switch]
node_family: time-metadata
controls: [Source, Number of Inputs, Name X]
inputs: [image, shape, classic-3d]
outputs: [image, shape, classic-3d]
tasks: [switch-input, alternate-source]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-09"
---

# Switch

**Switch [Swi]は、複数の入力のうち1本を選び、そのデータを後段へ渡すNode**です。入力を合成したり、時間方向に補間したりするのではなく、現在どの入力を使うかを切り替えます。

たとえば、1つのタイトルの背景を昼と夜の2種類から選ぶ場合、2本のBackgroundをSwitchへつなぎ、Switchの出力だけを後段の合成へ渡します。後段のTransformやMergeを二重に作る必要がなくなります。

Switchは2D <Term id="image">Image</Term>専用ではありません。DaVinci Resolve 21.1 Reference Manualでは、<Term id="shape-data">Shape</Term>や3Dを含む、多くのToolのデータを切り替えられると説明されています。どの種類のデータを扱うかによって、後段に接続できるNodeも変わります。

## 入力と出力

### 入力：選択肢を増やせる

入力端子には候補となるデータを接続します。通常の2D映像なら、MediaIn、Background、Text+などのImage出力を使えます。

```text
MediaIn（素材A） ──┐
MediaIn（素材B） ──┼─ Switch → Transform → MediaOut
Background（代替） ┘
```

3つの入力を混ぜるのではなく、**Sourceで指定した1つだけ**がTransformへ進みます。選ばれなかった素材を画面に重ねる機能はありません。

Inspectorの**Config**タブにある **Number of Inputs**で入力数を変更できます。スライダーでは最大9本まで追加でき、それ以上必要なら数値欄へ直接入力します。**Name X**では入力ごとに表示名を付けられるため、単なる番号ではなく「昼」「夜」「仮素材」のように区別できます。

### 出力：選んだ入力と同じ種類のデータを渡す

2D Imageを選んだSwitchの出力は、TransformやMergeなどの2D処理へ接続します。Shapeを選ぶ構成ならShape系の後段へ、Classic 3Dの構成なら3D系の後段へ接続します。

```text
sRectangle ──┐
sText ───────┼─ Switch → sRender → 2D Image
sEllipse ────┘
```

この例では、Switchの段階ではまだShapeデータです。**sRenderで初めて2D Imageに変換**します。2DのSwitchと違って見えても、「候補から1本を選ぶ」という役割は共通です。

3Dでも同様に、複数の3D出力から1つを選び、Merge 3Dなどへ渡す構成を取れます。ただし、**Image・Shape・3Dを相互変換するNodeではありません**。異なるデータ型を1本のSwitchで混在させた場合の接続互換性は、この資料だけでは保証できません。後段が期待するデータ型に合わせて構成してください。

→ [Image](../../learn/02-data/image) / [Shape](../../learn/02-data/shape) / [Classic 3D](../../learn/02-data/classic-3d)

## Inspectorの主な設定

### Controls：Source

**Source**は、どの入力を出力へ通すかを選択するコントロールです。接続した候補を選び直すと、後段に渡るデータも切り替わります。

カットごとに素材を切り替えたい場合は、Sourceをキーフレームで変化させる構成を使います。これは2つの映像をフェードで混ぜる操作ではなく、選択先そのものの変更です。切り替え位置の前後でViewerを確認し、意図しない素材が選ばれていないかを確かめます。

### Config：Number of Inputs / Name X

- **Number of Inputs**：入力端子の数を決めます。9本を超える場合はスライダーではなく数値入力を使います。
- **Name X**：各入力の表示名を変更します。用途が分かる名前にしておくと、後からSourceを切り替える際に候補を見分けやすくなります。

名称を変えても、入力データの種類や画素そのものが変わるわけではありません。

## 運用例

### 1. 2種類の背景を同じタイトル演出へ渡す

昼景と夜景で共通のタイトル演出を使い、背景だけを差し替える場合です。

```text
昼の背景 ──┐
夜の背景 ──┴─ Switch ──→ Merge（Background）
Text+ ─────────────────→ Merge（Foreground）
```

Switchで使う背景を選び、同じText+をMergeへ重ねます。後から文字のアニメーションや位置を変更しても、両背景に対して同じ結果を使えます。背景を重ねて合成したい場合はSwitchではなくMergeを使います。

### 2. Shapeのバリエーションを1つの描画処理にまとめる

円、四角形、文字を別々のShape Nodeで作り、Switchから1つを選んでsRenderへ渡します。

```text
sEllipse ───┐
sRectangle ─┼─ Switch → sRender → Merge
sText ──────┘
```

sRender以降の2D合成は共通のまま、元のShapeだけを入れ替えられます。複数のShapeを**同時に表示したい**場合は、[sMerge](../shapes/smerge)などでShapeを統合してから描画します。

### 3. 3Dのモデル候補を同じシーンへ置く

Shape 3DとText 3Dなど、出力がClassic 3Dの候補をSwitchで選び、同じMerge 3Dのシーンへ渡す構成です。モデルの見え方を比べるとき、後段のカメラやライトを組み直さずに候補を差し替えられます。

ただしSwitch自体は3D要素を結合しません。**複数のオブジェクトを同時に配置する**ときは[Merge 3D](../3d/merge-3d)、**最終的に画像を出す**ときは[Renderer 3D](../3d/renderer-3d)を使います。

## DissolveやMergeとの違い

| やりたいこと | 使うNode | 入力の扱い |
| --- | --- | --- |
| 複数候補から1つだけを使う | **Switch** | 指定された入力を通す |
| 2本の2D映像を徐々に切り替える | [Dissolve](../compositing/dissolve) | 2つのImageを混合してクロスフェードやWipeを作る |
| 2Dの前景を背景に重ねる | [Merge](../compositing/merge) | BackgroundとForegroundを合成する |
| 複数のShapeを同時に残す | [sMerge](../shapes/smerge) | Shapeデータを1つのShape treeへまとめる |
| 複数の3D要素を同じシーンへ置く | [Merge 3D](../3d/merge-3d) | 3Dシーン要素を結合する |

「一方を選ぶ」のか「同時に使う」のかを先に決めると、Nodeを選びやすくなります。

## Switch Modifierとの違い

21.1 Manualには、Flow上のSwitch Nodeとは別に**Switch Modifier**も記載されています。対応するコントロールのコンテキストメニューにある **Modify With**または**Insert**から利用でき、値や接続元の切り替えをコントロールへ適用するための仕組みです。

Flowに置くSwitch NodeがImage・Shape・3Dなどの**データの通り道**を選ぶのに対し、Switch Modifierは**コントロール側**に関連します。この記事のNumber of InputsやShape / 3Dの配線例はFlow Nodeについての説明です。

## 注意点

- Switchはデータを合成しません。切り替え前後を滑らかにつなぐ用途ではDissolveなどを検討します。
- 選択した入力の種類と、後段Nodeが受け取れる種類を合わせます。Switchを通しても、Shapeが自動的に2D Imageになるわけではありません。
- 入力名は候補の識別用です。実際に出力される入力はSourceで選びます。
- 入力数を増やすことと、未接続の入力を選んだ際の動作は別問題です。未接続時の表示・fallbackは21.1 Manualの該当節から確定できないため、実際の構成で確認してください。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 111「Miscellaneous Nodes」、**Switch [Swi]（pp.2606–2607）**を確認しました。複数入力から1本を選択する動作、Shapeと3Dを含む対応範囲、ControlsタブのSource、ConfigタブのNumber of InputsとName X、スライダーで9入力まで追加できること、Switch Modifierのメニュー経路が一次資料で確認できた内容です。

Sourceのキーフレーム運用例はFusionの一般的なコントロール操作を前提にした使用例です。混在するデータ型の互換性、未接続入力時の挙動、runtime REGID、edition差、Sourceの既定値は未検証のため、`verification: partial`としています。
