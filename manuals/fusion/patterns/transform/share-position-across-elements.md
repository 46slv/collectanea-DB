---
title: 複数要素の位置関係を共有する
description: Fusionの複数Transformを一つのCenterに連動させ、個々の画像を保ちながら相対位置とOffsetを一括管理するPattern。
doc_type: pattern
verification: partial
aliases: [shared position, linked center, relative layout]
concepts: [normalized-coordinates, parameter-linking, parameter-ownership]
patterns: [share-position-across-elements, master-follower-parameters]
nodes: [Transform, Merge, Text+]
tasks: [align, layout, link-values, automate]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# 複数要素の位置関係を共有する

タイトル、アイコン、説明文を一緒に移動したいのに、三つの`Transform`の`Center`を個別に調整していると、位置を変更するたびに間隔が崩れます。**一つのCenterを基準にし、ほかのCenterをその位置からの差として求める**と、各要素の内容を独立させたまま位置関係を保てます。

ここでは三つの2D Imageを別々に合成する例で、どの値を共有し、どの値を独立させるかを整理します。二つのTransformを直接連動させる操作は[基本Recipe](../../recipes/automation/link-transform-centers)、五つ以上を等間隔に並べる場合は[等間隔配置のRecipe](../../recipes/automation/equal-spacing-by-index)も参照してください。

## 共有するのは画像ではなく位置

- **Master（基準）**：利用者が調整する一つの位置。ここでは`Transform1.Center`。
- **Follower（追従先）**：Masterから位置を求める`Transform2.Center`と`Transform3.Center`。
- **Offset（位置差）**：Masterを動かしても保ちたい相対的な距離。XとYに別々の値を持てます。

`Center`はXとYを持つPoint型のParameterです。標準的な正規化座標では`(0.5, 0.5)`が中央で、Xは右へ、Yは上へ増えます。`+0.20`は20ピクセルではなく、幅を1としたときの20%相当の距離です。詳しくは[正規化座標](../../learn/03-space/normalized-coordinates)を確認してください。

`Transform`の`Center`だけを連動させても、各要素の文字内容、色、Alpha、`Size`、`Angle`は自動的には共有されません。画像の接続線とParameter値の参照を混同しないことが重要です。

## 三つの画像で構成する

三つの`Text+`を独立した`Transform`へ入れ、`Merge`で順番に重ねます。`Text+`は透過PNGやロゴ画像へ置き換えて構いません。

~~~text
Text1 → Transform1 ─────────────→ Merge1（Foreground）
Background1 ───────────────────→ Merge1（Background）
                                       ↓
Text2 → Transform2 ─────────────→ Merge2（Foreground）
Merge1 ────────────────────────→ Merge2（Background）
                                       ↓
Text3 → Transform3 ─────────────→ Merge3（Foreground）
Merge2 ────────────────────────→ Merge3（Background）
                                       ↓
                                    MediaOut1

Parameterの参照（画像の接続線とは別）:
Transform1.Center ─┬─→ Transform2.Center（右へOffset）
                   └─→ Transform3.Center（下へOffset）
~~~

この例では、三つの`Text+`と合成用`Background1`が同じ解像度の2D Imageを扱います。`Merge`はBackground入力側の画像を出力解像度の基準にするため、前景と背景のサイズが違う構成ではレイアウトの基準も確認してください。

### 1. Masterを決める

最初のタイトルを`Transform1`で配置し、Inspectorの`Center`を`X = 0.35`、`Y = 0.55`にします。この位置が後続の二つの基準です。

式中の`Transform1`などはNode名です。名前を変更している場合は実際の名前へ読み替えてください。

### 2. 二つ目を右へずらす

`Transform2`の`Center`へSimpleExpressionを追加します。DaVinci Resolve 21.1 Manualには、Parameterの数値欄で`=`を入力してReturnを押し、表示された式欄へLua式を入力する方法が記載されています。

~~~lua
Point(Transform1.Center.X + 0.20, Transform1.Center.Y)
~~~

`Point(X, Y)`はXとYを一つの位置として返します。Masterが`(0.35, 0.55)`なら、`Transform2.Center`は`(0.55, 0.55)`になります。Masterを変更しても横方向の差`0.20`は保たれます。

### 3. 三つ目を下へずらす

`Transform3`の`Center`へ次を設定します。

~~~lua
Point(Transform1.Center.X, Transform1.Center.Y - 0.15)
~~~

Y方向は下へ移動するときに値を減らします。Masterが`(0.35, 0.55)`なら、三つ目は`(0.35, 0.40)`です。二つ目の位置を経由せず、**二つのFollowerが同じMasterを直接参照**する構成にします。

| `Transform1.Center`（Master） | `Transform2.Center` | `Transform3.Center` |
| --- | --- | --- |
| `(0.35, 0.55)` | `(0.55, 0.55)` | `(0.35, 0.40)` |
| `(0.45, 0.60)` | `(0.65, 0.60)` | `(0.45, 0.45)` |

表の二行目へMasterを動かし、二つの位置差が維持されるか確認します。MasterへKeyframeを付けた場合も、各Followerは現在フレームの値を参照する設計です。動きを確認する場合はSpline Editorも利用できます。

式欄左の`+`（Pick Whip）をMasterの`Center`へドラッグして参照を作り、その後で`Point(...)`とOffsetを追加する方法もあります。SimpleExpressionは一方向の参照です。FollowerからMasterへ戻る式を作らないようにしてください。

## Offsetも一箇所から変える

上の例では`0.20`と`0.15`を式に直接書いています。複数のFollowerが同じ間隔を使うなら、Master側に数値のUser Controlを追加して、位置差そのものも一箇所から管理できます。

`Transform1`のInspectorでNode名を右クリックし、`Edit Controls`から数値型のControlを追加します。例として内部IDを`OffsetX`と`OffsetY`にして、初期値をそれぞれ`0.20`、`0.15`にします。**この二つのControlは標準のTransformに最初から備わっているものではありません。** Inspectorに表示される`Name`と、式で参照する`ID`は区別します。

`Transform2.Center`では次を使います。

~~~lua
Point(Transform1.Center.X + Transform1.OffsetX, Transform1.Center.Y)
~~~

`Transform3.Center`では次を使います。

~~~lua
Point(Transform1.Center.X, Transform1.Center.Y - Transform1.OffsetY)
~~~

これで`Center`は全体の位置、`OffsetX`と`OffsetY`は要素間の距離を担当します。User Controlを追加しただけでは表示が変わるわけではなく、追従先の式で値を参照する必要があります。詳しい作成・保存方法は[User Controls](../../learn/06-reuse/user-controls)、さらに値を整理する設計は[親・追従パラメータ](../automation/master-follower-parameters)を参照してください。

## 同じ位置を共有するときの選択肢

二つのCenterを同じ座標へ置くだけなら、Followerへ次の式を設定するだけで構いません。

~~~lua
Transform1.Center
~~~

Offsetを計算せず、適合するParameter同士で同じ値を共有したい場合は、`Publish / Connect To`という別の方法もあります。21.1 Manualでは、基準ParameterをPublishした後、別のParameterの`Connect To`メニューから接続する操作を説明しています。この接続は双方向に値が連動するため、どちらを編集してもほかに反映されます。

**完全に同じ値を共有**するなら`Publish / Connect To`、**基準から別の値を計算**するならSimpleExpressionを使います。`Instance`は同種Nodeの多くの設定を一緒に共有する仕組みで、Centerだけを連動させたい場合には共有範囲が広すぎることがあります。[Instance](../../learn/06-reuse/instances)を参照してください。

## Centerが揃っても余白は揃わない

`Center`は画像の配置基準点であり、文字の左端や不透明部分の外形を示す値ではありません。二つのタイトルで文字列の幅が異なれば、Center間隔をそろえても文字の輪郭同士の隙間は同じになりません。透過PNGの透明余白、`Pivot`、`Size`にも注意が必要です。

また、`Transform`の`Reference Size`はInspectorでのCenterの表示方法をピクセル表示へ切り替える設定で、内部の正規化値や画像そのものの解像度を変えません。違う解像度の前景を混ぜる場合は[解像度 / アスペクト比](../../learn/03-space/resolution-aspect)と[解像度を跨ぐ配置](./resolution-aware-positioning)を参照してください。

全体の移動だけが必要で、各要素の個別移動は不要なら、合成後の一枚の2D Imageへ共通のTransformを置く方法もあります。ただし、全体の`Size`や`Angle`を変えると要素間の距離も変形されます。各要素を独立に調整する要件があるかで選びます。

## うまく動かないとき

| 状態 | 確認すること |
| --- | --- |
| Followerが動かない | `Center`へ式を設定しているか。Node名と`Center.X`／`Center.Y`の参照は正しいか。 |
| 上下の移動が逆になる | Yが増えると上方向、減ると下方向。 |
| 片軸だけ動く | Center全体を返すPoint式ではなく、XまたはYだけのNumberへ式を入れていないか。 |
| Offsetが想定したピクセル数と違う | 正規化座標、画像解像度、Reference Sizeの表示単位を混同していないか。 |
| User Controlの変更が反映されない | Controlの内部`ID`とFollowerの参照名が一致しているか。 |
| 循環参照になる | FollowerからMasterへ戻る式や、Follower同士の相互参照がないか。 |

SimpleExpressionを取り除く場合は、21.1 ManualにあるParameter名の右クリック→`Remove Expression`を使います。

## 関連Nodeと出典

- [Transform](../../nodes/transform/transform)：2D Imageを入力し、Center・Pivot・Size・Angleで変形した2D Imageを出力します。Effect Mask入力は任意です。
- [Merge](../../nodes/compositing/merge)：Foreground／Backgroundの2D Imageを合成し、2D Imageを出力します。Effect Mask入力は任意です。
- [式（Expressions）](../../learn/05-time/expressions)：SimpleExpression、Point型、別Node参照、Pick Whipの基本。

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（2026年9月）。

- Chapter 73「Using Modifiers, Expressions, and Custom Controls」**pp.1583–1589**：Publish / Connect To、SimpleExpression、`Point(Text1.Center.X, Text1.Center.Y-.1)`、Pick Whip、Edit Controls。
- Chapter 120「Transform Nodes」**pp.2879–2883**：Center、Reference Size、入力と出力。
- Chapter 94「Composite Nodes」**pp.2211–2218**：MergeのForeground / Backgroundと出力解像度。

ここで示した`Point(Transform1.Center.X + 0.20, Transform1.Center.Y)`などは、21.1 Manualに記載された構文を応用した制作例です。三要素のGraph全体や追加Controlの内部IDは21.1実機で動作確認していないため、`verification: partial`としています。
