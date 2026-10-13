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
updated: "2026-10-14"
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

ただしManualのMode一覧には、`Average Use Position Only`や`Minimum Invert Position`のように項目の区切りが読み取りにくい箇所と、`Invert Sugar`という不自然な表記があります。**これらを21.1のUIに存在する選択肢としてそのまま転記することは避けています。** Modeごとの正確な表示名と計算式は、実機で確認が必要です。

挙動を調べるときは、Positionを固定してOffsetだけを動かし、Modeを1つずつ変更します。Angle、Distance、Positionは返す値の種類が異なるため、ある種類で観察した結果を別の種類へ無条件に当てはめないようにします。

### Image Aspect

Projectの**Image Aspect**を補正するためのControlです。Pixel Aspectではありません。21.1 Manualでは、初期値はPreferencesで選択中のFrame Formatに基づくと説明されています。

同Manualには、500 × 500の正方形を`1`、500 × 1000を`2`とする例がある一方、同じ段落でImage Aspectを`width ÷ height`で求めるとも書かれています。後者の式なら500 ÷ 1000は`0.5`であり、数値例の`2`とは一致しません。**実機で確認するまでは、どちらか一方を正しい設定値として推奨しません。**

#### 非正方形Frameで確認する手順

1. テスト用の縦長Frameで、数値Parameterの`Offset Distance`を使い、PositionとOffsetを離れた固定位置へ置く。Path接続やFlip、Time Offsetは使わず、まず2点の距離だけを確認する。
2. 計算結果（対象Parameterの値）と、`Image Aspect`の初期値を記録する。
3. 2点を動かさずに`Image Aspect`だけを`1`、`2`へ変えて、結果を比較する。必要なら横長Frameでも同じ操作を行う。
4. 使用するFrame Formatと、Viewerで意図した方向・距離に近い設定を確認する。`2`はManualに登場する**数値例**であり、すべての縦長Frameへ適用すべき値と決めつけない。

この手順はManualの矛盾を切り分けるための観察方法です。21.1実機でどちらの式が内部的に使われるかを証明するものではありません。

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

## 症状別の確認方法

Offsetで結果が思いどおりにならないときは、先に**どのParameterを動かしたいか**と、**Position / Offsetの2点を何から取得しているか**を分けて確認します。

| 症状 | まず確認する箇所 | 理由・対処 |
| --- | --- | --- |
| `Modify With`に目的のOffsetが出ない | 右クリックしたParameterの種類 | Offset Angle / Distanceは数値、Offset PositionはX / Y位置を返します。出力の種類と対象Parameterが合っているか確認します。 |
| Positionを動かしてもTextのSizeが変わらない | `Offset Distance`がSizeへ付いているか、Modifiers tabのPosition / Offsetが別々の点になっているか | 2点間の距離が変わらなければ結果も変わりません。まずPath接続なしの2点をViewerで離したり近づけたりして確認します。 |
| Textの移動とSizeの変化が連動しない | Modifierの`Position`がTextの`Path1 Position`へ接続されているか | TextのCenterを動かしただけでは、Offset側のPositionがその移動を自動参照するとは限りません。上の作例では明示的に`Connect To`します。 |
| 距離を変えると目的と逆方向に値が動く | 使っているのが`Offset Distance`か、目的が「近いほど大きい」なのか | Offset Distanceが返すのは距離です。近づくほど大きい値が必要なら、距離をそのままSizeへ渡す構成では目的を満たしません。別の数値変換が必要です。 |
| 2点を同じ位置に置いたのに結果が予想と違う | `Mode`、両方の`Flip`、`Image Aspect` | Offsetの種類だけでなく、計算方法や反転・Aspect補正も結果へ影響します。まずModeとFlipを確認してから片方ずつ変えます。 |
| Animationと計算結果のタイミングがずれる | `Position Time Scale / Offset`と`Offset Time Scale / Offset` | 2つの点はそれぞれ別のframeを参照できます。片方だけ時間がずれていないか確認します。 |
| 縦長・横長のCompositionで距離や方向の見え方が違う | `Image Aspect`と現在のFrame Format | Image AspectはPixel Aspectとは別です。Manualの計算式と数値例にも不整合があるため、実画面で結果を確認します。 |

### Time Offsetの符号はModifierごとに確認する

21.1 Reference ManualのOffset節では、`Position Time Offset = 10`の例を「10 frames back」と記しています。一方、同ManualのCalculation節では、正のTime Offsetを未来方向に参照する例が説明されています。

そのため、**Calculationで使った符号をOffsetへそのまま当てはめない**ようにします。符号の向きは、次の短いテストで区別できます。

1. PositionをFrame 0では左、Frame 20では右に置き、X方向だけを一定の向きにアニメーションさせる。OffsetはPositionの開始地点と同じ位置に固定する。
2. `Offset Distance`を数値Parameterへ付け、`Position Time Scale`と`Offset Time Scale`を`1`、`Offset Time Offset`を`0`にする。
3. Frame 5、10、15で、`Position Time Offset = 0`の結果をそれぞれ記録する。
4. Frame 10に戻り、`Position Time Offset`を`-5`と`+5`に変える。各結果が手順3のFrame 5と15のどちらに一致するかで、過去側／未来側の参照を判別する。

ほかのTime ControlやPathを同時に変更しないことが重要です。これは**確認方法**であり、上記の観察結果を21.1実機で取得したという意味ではありません。

### 最小構成で確認してから接続を増やす

複数のPathやParameter参照を一度に接続すると、ずれの原因が分かりにくくなります。最初は上のText Size作例で**静的なPosition / Offsetの2点だけ**を動かし、距離とSizeが連動することを確認します。その後、Positionを`Path1 Position`へ接続し、最後に必要ならTime Scale / Time Offsetを加えると、どの段階で結果が変わったか追いやすくなります。

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
