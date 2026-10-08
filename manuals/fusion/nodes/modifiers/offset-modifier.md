---
title: "Offset"
description: "2つの位置Controlの関係からAngle・Distance・Positionを計算し、数値または位置Parameterへ渡す3種類のModifier。"
doc_type: node
term_id: "offset-modifier"
term_short: "Offsetは、PositionとOffsetの2点から角度・距離・位置を計算し、Parameterへ渡すModifier。"
verification: partial
aliases: ["Offset", "Offset Angle", "Offset Distance", "Offset Position"]
concepts: ["parameter-data"]
nodes: ["Offset"]
node_family: "modifiers"
controls: ["Position X and Y", "Offset X and Y", "Flip Position Horizontal and Vertical", "Flip Offset Horizontal and Vertical", "Mode", "Image Aspect", "Position Time Scale", "Position Time Offset", "Offset Time Scale", "Offset Time Offset"]
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "animate"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# Offset

Offsetは、**PositionとOffsetという2つの位置Controlの関係から、角度・距離・新しい位置を計算するModifier**です。DaVinci Resolve 21.1には、返す値が異なる3種類があります。

- **Offset Angle** — 2点を結ぶ方向を0〜360の数値で返す
- **Offset Distance** — 2点の距離を数値で返す
- **Offset Position** — 2点の関係からX / Y位置を返す

Imageを加工するNodeではありません。数値や位置のParameterへ付け、Viewer上の2つの位置や、別Parameter・Pathから受け取った位置関係を、そのParameterの値へ変換します。

## 3種類の違い

### Offset Angle

PositionとOffsetの2点が作る**角度**を0〜360の値として返します。

PositionとOffsetは固定位置にするだけでなく、別のPosition Parameterへ接続したり、それぞれにPathを持たせたりできます。2点が動けば、その位置関係に応じてAngleの出力も変化します。

「2つの位置の向きに応じて数値Parameterを動かしたい」ときに使う種類です。

### Offset Distance

PositionとOffsetの2点間の**距離**を数値として返します。

たとえばSizeへOffset Distanceを付けると、Viewer上の2つのControlを近づける／離す操作をSizeの値へ変換できます。21.1 Manualの作例もこの使い方で、TextのSizeを2点間の距離から決めています。

### Offset Position

PositionとOffsetの関係から**X / Yの位置**を返します。

21.1 ManualではCalculation Controlに近い役割と説明されていますが、通常のCalculationが1つの数値を返すのに対し、Offset PositionはX / Y座標を返します。位置Parameterそのものを2点の関係から作りたい場合に使います。

## 追加方法

対象Controlを右クリックし、`Modify With > Offset`から追加します。

21.1 ManualのOffset Distance作例では、TextのSizeを右クリックして`Modify With > Offset Distance`を選んでいます。どのOffsetを選べるかは対象Parameterの型に依存するため、このページではManualで確認できていない組み合わせまで一般化しません。

## 入力と出力

OffsetはNode Editor上でImage端子を接続するNodeではなく、**Parameterへ付けるModifier**です。計算に使う中心は2つの位置です。

~~~text
Position ─┐
          ├─ Offset Modifier ─→ 対象Parameter
Offset ───┘
~~~

返す値の型は選んだ種類で変わります。

| Modifier | 2つの位置から求めるもの | 主な出力 |
| --- | --- | --- |
| Offset Angle | 方向 | 0〜360の数値 |
| Offset Distance | 距離 | 数値 |
| Offset Position | 位置関係 | X / Y位置 |

PositionとOffsetは静的な値だけでなく、別の位置ParameterやPathへ接続できます。そのため「Viewerで置いた2点の関係を使う」だけでなく、「動く2点の関係を別Parameterへ渡す」構成にもできます。

## Offset tab

3種類のOffset Modifierは、21.1 Manualでは同じInspector構成を使います。

### Position X / Y

計算の基準になるPositionのX / Yです。

ViewerではPosition側のonscreen controlとして操作できます。ManualのOffset Distance作例ではcrosshairで表示されます。

### Offset X / Y

Positionと比較するもう1つの位置です。

同作例ではX形のonscreen controlとして表示され、Positionとの距離を変えることでSizeの値が変化します。

### Flip Position Horizontal / Vertical

PositionをImageの水平軸または垂直軸に対して反転させてから計算へ使います。

### Flip Offset Horizontal / Vertical

Offset側の位置をImageの水平軸または垂直軸に対して反転させてから計算へ使います。

### Mode

PositionとOffsetをどの関係で計算するかを選びます。

21.1 Manualでは、Offset、2方向のDifference、Average、Positionのみ／Offsetのみ、Maximum、Minimum、Invert Position、Invert Offset、Random Offsetが列挙されています。

Mode名から未記載の数式まで推測せず、必要な処理はViewerや対象Parameterの値を見ながら確認します。

### Image Aspect

Projectの**Image Aspect**を補正するためのControlです。Pixel Aspectではありません。

21.1 Manualには、500 × 500の正方形を`1`、500 × 1000を`2`とする例がある一方、同じ段落でImage Aspectを`width ÷ height`で求めるとも書かれています。この2つは通常の計算では一致しません。

ここではどちらかを推測で訂正しません。非正方形のFrameでOffsetの角度や距離が意図した見え方にならない場合は、現在のFrame FormatとViewer上の結果を確認して調整します。

## Time tab

Offsetは、PositionとOffsetを**現在frameそのものではなく、別の時間位置から参照して計算**できます。

### Position Time Scale

Positionを、現在時刻へTime Scaleを掛けた時刻から取得します。Manualの例では`0.5`なら現在frameの半分の時刻にあるPositionを参照します。

### Position Time Offset

Positionを現在frameからずらした時刻で参照します。Manualの例では`10`を「10 frames back」と説明しています。

### Offset Time Scale / Offset Time Offset

Offset側にも同じTime Scale / Time Offsetがあります。Position側とOffset側で異なる時間を参照できるため、同じ動きの時間差から距離・角度・位置関係を作る構成にも使えます。

## 運用例: Path上を動くTextのSizeを距離で変える

21.1 Manualには、Offset DistanceとPathを組み合わせる100-frameの作例があります。

~~~text
Background ─┐
            ├─ Merge
Text ───────┘
  │
  └─ Size ← Offset Distance
              ├─ Position ← Path1 Position
              └─ Offset   = Viewer下中央の固定点
~~~

作例の流れは次のとおりです。

1. 100-frameのCompositionを作り、黒いBackgroundとTextをMergeへ接続する。
2. TextのLayoutでCenter Xを左から右へAnimationする。
3. TextのSizeへ`Offset Distance`を追加する。
4. Viewerに現れるPositionのcrosshairとOffsetのX形Controlを動かし、距離でSizeが変わることを確認する。
5. Offset側のX形ControlをViewer下中央へ置く。
6. Modifier側のPositionを、既存Pathの`Path1 Position`へ接続する。
7. 再生して、Path上を動くPositionと固定Offsetの距離に応じてText Sizeが変わることを確認する。

この構成では、Textが固定Offsetへ近づく区間で距離が小さくなり、Sizeも小さくなります。固定Offsetから離れる区間では距離が大きくなり、Sizeも大きくなります。

単にSizeへKeyframeを打つのではなく、**別の位置関係そのものをSizeの入力値にする**のがOffset Distanceの使い方です。

## Vectorとの違い

[Vector](./vector)も位置関係を使うModifierですが、値の作り方が異なります。

- **Offset** — PositionとOffsetという2つの位置を比較し、Angle・Distance・Positionを求める
- **Vector** — Originを基準に、DistanceとAngleを指定して2D Positionを作る

「2点の現在の関係を測って値にしたい」ならOffset、「基準点から距離と角度を指定して位置を作りたい」ならVectorが候補になります。

## Pathとの組み合わせ

[Path](./path)は位置を経路に沿って動かすModifierです。OffsetはPathそのものを作るのではなく、Pathから得た位置をPositionまたはOffsetへ接続し、**その位置ともう1点の関係を別の値へ変換**できます。

ManualのSize作例では、Pathが「どこを動くか」、Offset Distanceが「その位置と固定点がどれだけ離れているか」を担当します。

## 注意点

Offset Angle / Distance / Positionは同じInspectorを持ちますが、返す値の型と意味は同じではありません。AngleやDistanceの説明をOffset Positionへそのまま当てはめないようにします。

また、Manualに記載されたMode名から内部のexactな計算式、未記載のdefault / range、内部Parameter ID、REGID、edition差までは確定していません。Image Aspectには前述の記述上の不整合もあるため、非正方形Frameで厳密な値が必要な場合はcurrent runtimeでの確認が必要です。

## 関連ページ

- [Modifier Family Overview](./)
- [Vector](./vector)
- [Path](./path)
- [Calculation](./calculation)
- [XY Path](./xy-path)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.3016–3019、およびFusion Fundamentals Chapter 73 p.1585を基準にしています。

同Manualで、Offset Angle / Offset Distance / Offset Positionの3種類、各出力の役割、共通するPosition / Offset / Flip / Mode / Image Aspect Control、Time Scale / Time Offset、Text SizeへOffset Distanceを適用してPathとの距離でSizeを変える作例を確認しています。

current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差、Image Aspectの実際の計算式はこのrunでは確定していません。
