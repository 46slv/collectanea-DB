---
title: キーフレーム / スプライン / 時間（Keyframe / Spline / Time）
description: Fusionで値をいつ変更するか、キーフレーム間をどう補間するか、動きの長さをどう調整するかを実例で理解する。
doc_type: concept
term_id: keyframes-spline-time
term_short: キーフレームで時刻と値を指定し、スプラインでその間の変化を決めるアニメーションの基本。
verification: partial
aliases: [Keyframe, Spline, animation]
concepts: [keyframes, animation-curve, time]
nodes: [Transform, Merge]
tasks: [animate, timing, interpolate]
prerequisites: [parameter-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# キーフレーム / スプライン / 時間（Keyframe / Spline / Time）

Fusionで文字を拡大したり、画像を移動したり、エフェクトを徐々に強くしたりするには、**どの時点で、どのパラメータを、いくつにするか**を指定します。その値の間をどう変えるかまで決めると、同じ始点と終点でも動きの印象が変わります。

このページでは、まず数値パラメータを一つ動かします。位置のアニメーションには移動経路（Motion Path）特有の扱いもあるため、最初の例には<Term id="transform">Transform</Term>の**Size**を使います。

## Keyframe・Spline・Editorは別のもの

- **Keyframe（キーフレーム）**は、特定のフレームでパラメータが取る値の指定です。たとえば「フレーム0でSizeが0.8」「フレーム12で1.2」がそれに当たります。
- **Spline（スプライン）**は、キーフレーム間を含め、各時刻でパラメータがどの値になるかを表す曲線・関数です。直線にも、緩やかな曲線にも、値を保持して急に切り替える形にもできます。**Splineは編集画面そのものの名前ではありません**。
- **Keyframes Editor**は、どのフレームにキーフレームがあるか、各ノードの効果がいつ有効かをタイムライン状に扱う画面です。主にタイミングの整理に使います。
- **Spline Editor**は、時間に対して値がどう変わるかをグラフで扱う画面です。横軸が時間、縦軸がパラメータ値です。補間や速度の調整に使います。

Inspectorでキーフレームを置くと、そのパラメータには通常アニメーション用のSplineが作られます。Spline Editorはその結果を表示・編集するための画面です。Expressionで計算した値など、通常のキーフレーム曲線以外の時間変化を表示できる場合もあります。

## 時刻の基準を確認する：Global RangeとRender Range

「クリップの先頭から12フレーム後」と「フレーム番号12」は、いつも同じではありません。キーを置く前に、Fusion画面下部の**Time Ruler（時間目盛り）**で再生可能な範囲を確認します。

| 範囲 | 意味 | キーフレームとの関係 |
| --- | --- | --- |
| **Global Range** | コンポジションが扱う全時間範囲 | 再生ヘッドはこの範囲の外へ移動できない |
| **Render Range** | 通常の再生・プレビュー・キャッシュの対象範囲。Time Rulerの黄色い境界で示す | 変更してもキーの時刻が自動で移動するわけではない |
| **Keyframeの時刻** | パラメータに値を指定した実際のフレーム位置 | Render Rangeの先頭が0とは限らない |

**DaVinci ResolveのEdit / Cutページで通常の動画クリップ1つを選んだ場合**、21.1マニュアルでは、FusionページのGlobal Rangeは元素材の長さに基づき、Render Rangeはタイムラインで使うIn / Outに対応します。Render Rangeの前後には、編集で使っていない素材のフレーム（**ハンドル**）が残る場合があります。Fusionクリップや複合クリップの場合は、作業範囲がそのクリップ全体の長さを反映します。

例として、100フレームの素材のうち、20〜59番目の40フレームを編集で使用しているとします。**使用部分の先頭から12フレーム後は32番目**です。「フレーム12」へキーを打つと、クリップで使っている部分より前に置いてしまいます。これは概念を示す数字で、実際のTime Ruler表示や素材のタイムコードが必ず0から始まるという意味ではありません。

以下の0・12・24の操作例は、**0から始まるFusion Composition**を作った場合を前提とします。通常の動画クリップで再現するときは、表示中のRender Rangeの先頭から相対的にキーを配置します。

## 最小例：拡大して少し戻す

まず、フレーム0から24まで使えるFusion Compositionを例にします。開始フレームが異なる場合は、以下の時刻をコンポジションの先頭からの相対位置として読み替えてください。

```text
MediaIn（またはBackground）
  → Transform（Sizeをアニメーション）
  → MediaOut
```

1. Transformを選択し、Inspectorで**Size**を探します。フレーム0へ移動して、Sizeを`0.8`にします。
2. Sizeの右側にある灰色のキーフレームボタンを押します。現在フレームにキーが作られ、ボタンがオレンジ色になります。
3. フレーム12へ移動してSizeを`1.2`に変更します。すでにアニメーションしているパラメータなので、新しいキーフレームが追加されます。
4. フレーム24へ移動し、Sizeを`1.0`にします。
5. 再生すると、最初は小さく、途中で大きくなり、最後に等倍へ戻ります。

| フレーム | Size | 画面で起きること |
| --- | ---: | --- |
| 0 | 0.8 | 元の大きさより小さく表示される |
| 12 | 1.2 | 元の大きさより大きく表示される |
| 24 | 1.0 | 元の大きさに戻る |

この表は説明用の値です。21.1の固定プリセット値ではありません。

**Inspectorのオレンジ色は、再生ヘッドがそのキーフレーム上にあることを示します。** その位置でオレンジのボタンを押すと、そのフレームのキーを削除します。パラメータ全体のアニメーションを削除したい場合は、キーフレームボタンの右クリックメニューから`Remove [パラメータ名]`を選びます。両者は異なる操作です。

## Spline Editorで「途中の動き」を変える

Spline Editorを開き、TransformのSizeに対応する項目を表示します。グラフ上でフレーム0・12・24の点を確認します。曲線が画面外にある場合はグラフの表示範囲を調整してください。

キーフレームの**時刻と値を変えず**に、補間だけを比較してみます。

### Linear：一定の割合で変わる

対象のキーフレームを選び、Spline Editorの**Linear**を使います。前後のキーの間が直線になり、その区間では値が時間に対して一定の割合で変化します。

0.8から1.2へ向かう区間であれば、グラフはまっすぐ右上がりになります。開始時点から値が変わり、停止するときにも傾きが急に変わります。単純な等速変化や比較の基準に向きます。

### Smooth：前後の変化をなめらかにする

同じキーを選んで**Smooth**に切り替えると、キーフレーム付近の曲線がなめらかになります。値の変化が始まる／終わる付近の速さを調整できるため、急な加速・停止を避けたいときに使います。

Bezier Splineでは、キーを選択すると前後に曲線の向きを決めるハンドルが表示されます。ハンドルの傾きや長さを調整すると、始点・終点の値を維持したまま、途中の速度変化を調整できます。

> **補間を変えても、キーフレームの値自体が自動的に別の値になるわけではありません。** ただし、Bezierハンドルの形によっては、キーフレーム間で指定した値の範囲を超える曲線も作れます。表示を確認してください。

### Step In / Step Out：途中の値を補間しない

**Step In / Step Out**は、次のキーフレームまで値を保持し、切り替え位置で急に変えるための補間です。21.1マニュアルでは、Step Inは前のキーの値を保持して次のキーで飛ぶ動作、Step Outは選択したキーの値を次のキーまで保持する動作として説明されています。

たとえばMergeのBlendを`0`から`1`へ瞬時に切り替えたい場合、滑らかな補間ではなくStep系を検討します。なめらかなフェードが欲しいならStepを使いません。

**Smooth・Linear・Stepは「キーの位置」ではなく「キー間の値の変化」に関する選択**です。どのキーを選び、どちらの区間へ適用したかも確認します。

## タイミングを変える：12フレームと24フレームの違い

同じSize値でも、フレーム12のキーをフレーム18へ移動すると、最初の拡大には18フレームかかります。逆にフレーム6へ近づけると6フレームで拡大します。

- **いつ起きるかを変更する**：Keyframes EditorまたはSpline Editorで、キーを左右（時間軸）へ動かす。
- **どの値になるかを変更する**：InspectorまたはSpline Editorで、キーの値を変更する。
- **途中の速さを変更する**：Spline Editorで補間やBezierハンドルを調整する。

Keyframes Editorはツールバーから開けます。ノードのトラックを展開すると、アニメーションしているパラメータごとのキーを確認できます。キーを左右へドラッグすれば時間を変更できます。Spline Editorでは、グラフ右下の**Time Editor**でキーのフレームを数値指定したり、**T Offset**で選択キーをまとめて前後へずらしたりできます。

複数キーの間隔を保ったまま全体を長く・短くしたい場合は**Time Stretch**を使います。選択範囲の時間方向を伸縮する操作であり、個々の値を変更する操作ではありません。

### 範囲・Nodeの有効期間・キーフレームの位置は別々に変わる

「開始を後ろへずらしたい」とき、どこを編集するかで結果が違います。

| 操作 | 変わるもの | 注意点 |
| --- | --- | --- |
| FusionページのRender Rangeを短くする | 通常の再生・プレビュー範囲 | **Edit / Cutページのクリップはトリムされない** |
| Keyframes EditorでMediaInの区間をトリム | コンポジションで使える素材のIn / Out | プレビュー範囲とは別の変更 |
| Keyframes EditorでEffect Nodeの区間をトリム | 効果が有効な時間。範囲外では無効として扱われる | キーを左右へ動かす操作ではない |
| キーフレームを左右へ移動 | パラメータの値が変わる時刻 | 素材の読み出し時刻を直接変更するものではない |
| Time Stretcherの`Source Time`を変更 | 出力時刻に対して読む素材の位置 | キーを一括移動する操作ではない |

FusionページのRender Rangeを変更して作業位置が分からなくなったら、Time Rulerを右クリックして`Auto Render Range`を選び、編集側のクリップIn / Outに戻せます。これは**プレビュー範囲を戻す機能**で、キーフレームを元の位置へ戻す機能ではありません。

Fusion Studioの場合は、Global Start / Endでコンポジション全体の長さを設定でき、Render Rangeは別に指定します。Resolveの通常の編集クリップと同じ操作方法だと決めつけないでください。

アニメーションが途中から始まる・途中で消える場合は、①Time RulerのRender Range、②Keyframes EditorのNode区間、③キーフレームの実際の時刻、④必要ならリタイム設定の順に調べます。素材の読み出し位置については[フレーム評価](./frame-evaluation)で説明します。

### さらに細かいEase調整

Bezierのキーを選択し、グラフの右クリックメニューから`Edit > Ease In/Out`を選ぶと、Spline Easeの数値コントロールを使えます。これは選択キーの前後にあるBezierハンドルの長さを調整する機能です。前後を連動させるLock In/Outもあります。

ハンドルを直接操作しにくいときや、複数キーの減速・加速を調整したいときに使います。

## Splineの種類：見た目の曲線と仕組みを分ける

Fusionの`Animate`から作られるSplineは、初期設定では通常**Bezier Spline**です。ただしFusion Preferencesで既定の種類を変更できます。

| 種類 | 形の調整方法 | 選ぶ目安 |
| --- | --- | --- |
| Bezier Spline | キーの前後にあるハンドルを調整 | 入る速度と出る速度を細かく決めたい |
| B-Spline | 制御点とテンションで曲線を調整 | ハンドルではなく点を中心に形を作りたい |
| Cubic Spline | 制御点を通る滑らかな曲線を自動生成 | 手動ハンドルなしで連続的に補間したい |
| Natural Cubic Spline | 隣接点付近へ影響を抑えた滑らかな補間 | ある点の変更による広い範囲への影響を抑えたい |

Splineの種類は、値の供給方法そのものの違いです。**Spline Editorを開くこと**と**Bezier以外のSplineを選ぶこと**は同じ操作ではありません。Splineの種類を先に選ぶなら、Inspectorのパラメータを右クリックして`Modify With`から選ぶ方法が21.1マニュアルに記載されています。

種類ごとの詳しい説明は[Bezier Spline](../../nodes/modifiers/bezier-spline)、[B-Spline Modifier](../../nodes/modifiers/b-spline-modifier)、[Cubic Spline](../../nodes/modifiers/cubic-spline)を参照してください。

## Centerの移動では「位置」と「経路上の進み具合」を区別する

Transformの<Term id="center-pivot-size-angle">Center</Term>のような2D位置をキーフレーム化すると、Viewerに**Motion Path（移動経路）**が現れ、Spline Editorでは**Displacement Spline**として経路上の進行度が表示される場合があります。

このグラフの`0.0`は経路の始点、`1.0`は終点を意味し、必ずしも画面のX座標やY座標そのものではありません。

- **どこを通るか**：Viewer上のMotion Pathで位置や経路の形を確認します。
- **いつ、経路のどこまで進むか**：Displacement Splineの時間と値を確認します。
- **X・Yを個別にアニメーションしたい**：Motion Pathの右クリックメニューにある`Convert to X/Y Path`など、目的に応じた方式を確認します。

Sizeの数値曲線とCenterの移動経路を同一視すると、「Splineが0から1なのにCenterの座標は0.5付近」といった混乱が起きます。先に**そのグラフの縦軸が何を表しているか**を確かめてください。

## 期待した動きにならないとき

| 症状 | 先に確認すること |
| --- | --- |
| 再生しても値が動かない | Inspectorにキーがあるか、再生ヘッドがその区間を通るか。Render Range外へキーを置いていないか |
| 1つだけキーが消えた | キーの位置でオレンジ色のボタンを押して削除していないか |
| 途中で急に速度が変わる | Linearになっている区間や、Bezierハンドルの傾きが急な点がないか |
| 突然値が切り替わる | Step In / Step Outが設定されていないか |
| 予想より速い／遅い | キー間のフレーム数とTime Stretchの設定 |
| Spline Editorに曲線が見えない | 対象パラメータのSpline表示チェック、選択ノード、グラフの表示範囲 |
| Centerの縦軸が位置座標に見えない | Motion PathのDisplacement Splineを見ていないか |
| Inspectorの値を直しても戻る | Keyframe以外のModifier・Expression・Connect Toが値を供給していないか |
| クリップ先頭とアニメーション開始がずれる | 元素材の先頭ではなく、Render RangeのInを基準にキーを配置しているか |
| 効果が途中で消える | Keyframes EditorでEffect Nodeの有効区間を短くしていないか |

まず「**キーがあるか**」「**何の値を表示しているか**」「**キーの時間と値は正しいか**」「**補間が合っているか**」の順に切り分けます。Nodeの画像接続とパラメータの時間変化は別の問題です。

値の供給元がKeyframe以外にある場合は、[Modifier / パラメータの供給元](./modifier-parameter-sources)へ進みます。Fusionがどの時刻の値を評価しているかを確認したい場合は[フレーム評価](./frame-evaluation)を参照してください。

## 他のNodeでの使い方

- **Transform / Size**：拡大・縮小の速さを調整する。最初の学習例に適しています。
- **Transform / Center**：位置とMotion Path上の進行度を分けて確認する。
- **Merge / Blend**：前景を徐々に現すならSmoothやLinear、急に切り替えるならStep系を比較する。
- **Blurなどの強度**：処理の強さをいつ増減するか、どの速度で増減するかを分ける。

多数のキーフレームを打つより、「他のパラメータから計算したい」「時間に応じて周期的に変化させたい」場合は[式（Expressions）](./expressions)や[Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)も選択肢です。

## バージョンと出典

基準：**DaVinci Resolve 21.1 Reference Manual（2026年9月）**。

- Chapter 63「Exploring the Fusion Interface」pp.1293–1295：FusionページとFusion StudioのGlobal / Render Range、Edit / Cutとの関係、Auto Render Range。
- Chapter 70「Animating in Fusion's Keyframes Editor」pp.1519–1526：Inspectorでのキー追加・削除、Keyframes Editor、MediaIn / Effect Nodeの区間編集。
- Chapter 71「Animating in Fusion's Spline Editor」pp.1535–1546、1549–1551、1556–1562：Splineの定義と種類、補間、Motion PathのDisplacement、Time Stretch、Ease In/Out。
- 公式配布元：[Blackmagic Design Support Center](https://www.blackmagicdesign.com/support)。

説明中のフレーム番号・Size値は操作例です。21.1実機でのUI表示、全ホスト／Editionの差、内部Modifier IDは未検証なので、`verification: partial`を維持しています。
