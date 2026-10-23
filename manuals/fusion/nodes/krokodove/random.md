---
title: Random
description: 最小値と最大値の間でランダムな値を作り、時間をかけて次の値へ移る変化を制御するKrokodoveのModifier。
doc_type: node
term_id: random
term_short: MinとMaxで範囲を決め、時間的な切り替わりを調整するKrokodoveのランダム値Modifier。
verification: partial
aliases: [Random]
concepts: [parameter-data]
nodes: [Random]
node_family: krokodove
inputs: [parameter]
outputs: [parameter]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# Random

**Random**は、ほかのツールの設定値を不規則に変化させるためのKrokodoveの**Modifier（モディファイア）**です。生成する値の下限と上限を指定し、新しい値へ移るまでの時間的な変化も調整できます。

たとえばタイトルの大きさや図形の透明度に変化を付ける場合に候補になります。ただし、それぞれの設定へ割り当てられるかは実機で確認が必要です。

## 役割

Randomは、主に次の2つの条件で値の変化を作ります。

1. **値の範囲**：Min（最小値）とMax（最大値）によって、生成できる数値の範囲を決めます。
2. **値が移り変わる時間**：新しいランダム値をフレーム範囲に沿って作り、ある値から別の値へ滑らかに変化させることができます。

「ランダム」は「毎フレーム必ず別の値へ瞬間的に飛ぶ」という意味ではありません。21.1 Manualは、値が更新されるフレーム範囲と滑らかな遷移を扱えると説明しています。ただし、更新タイミングの計算方法や補間曲線の種類までは明記していません。

## 入力と出力

Randomは、画像を入力して色や形を加工するNodeではありません。<Term id="parameter-data">パラメータ</Term>（SizeやBlendのような設定値）へランダムな値を供給するModifierです。

    最小値・最大値 / 時間に関する設定
                  ↓
                Random
                  ↓
           対象パラメータの値
                  ↓
           対象ツールの表示結果

この図は**値の供給関係**を示したもので、Flowで画像をRandomへつなぐ配線図ではありません。

- **入力側**：値を変化させる対象Controlと、Random自身の範囲・時間の設定。既存カタログでは入力をparameter領域に分類しています。
- **出力側**：対象Controlに供給するランダム値。画像そのものは出力しません。
- **未確認**：Flow上の端子名・端子数、内部データ型、各Controlへの正確な割り当て手順。

公式ManualにはControlへ追加できるModifierとして説明がありますが、どの型のControlにも同じ操作で割り当てられるとは、このページでは断定しません。

パラメータの意味は[パラメータのデータ](../../learn/02-data/parameter-data)、値の供給方法は[Modifier / パラメータの供給元](../../learn/05-time/modifier-parameter-sources)を参照してください。

## 主な設定

| 機能 | 意味 | 変化を確認するとき |
| --- | --- | --- |
| **Min / Max** | ランダムに生成する値の下限・上限 | 範囲を狭めたり広げたりして見た目を比べる |
| **フレーム範囲による更新** | 新しい値を時間の中で生成する範囲に関わる | 同じMin / Maxのまま時間的な変化を比較する |
| **滑らかな遷移** | ある値から次の値へ連続的に移る変化を扱う | 値が飛ぶ変化との違いを観察する |

21.1 Manualで確認できるのは、これらの**機能**です。Min / Max以外の正確なInspector項目名、既定値、単位、設定範囲、補間方式は、この資料の一覧だけでは確定できません。見つからないControl名を推測で作ることは避けます。

また、最小値と最大値が何を意味するかは対象のパラメータで変わります。Sizeなら拡大率、Blendなら合成への寄与率に関わります。同じ数値をどのControlにも流用せず、制御先の値域から決めます。

## 最小構成と確認手順

以下はManualに記載された役割から考えた**確認用の構成案**です。Krokodove Randomの追加操作や実際の結果を21.1実機で検証したものではありません。

    Background → Transform → MediaOut
                    └ SizeをRandomで制御する想定

1. FusionでBackgroundとTransformをつなぎ、Viewerへ表示します。背景にEllipse Maskを付けて小さな円にすると、拡大率の変化を見分けやすくなります。
2. TransformのSizeのように、値の変化が分かりやすいControlを選びます。
3. 標準Fusion Modifierには、InspectorのControlを右クリックし、Modify Withから追加する方式があります。ただし、**Randomがこのメニューに表示されるか、Sizeへ割り当てられるかは未確認**です。導入済み環境のメニューとModifier一覧を確認します。
4. 割り当てられた場合、確認用にMinを0.8、Maxを1.2相当に設定し、離れた複数フレームの表示を比較します。これらは試験値であり、Randomの初期値ではありません。
5. ランダム値の更新に関わるフレーム範囲を変更し、値の幅はそのままにして、移り変わり方だけを比べます。実際のControl名と操作位置は実機で確認してください。

値が動かなければ、Modifierが対象Controlへ割り当てられているか、正しいNodeを表示しているか、MinとMaxに十分な差があるかを確認します。どのフレームでどの数値が出るかは、このManualの説明だけでは予測できません。

## 主な用途

**タイトルやロゴの拡大率に変化を付ける**：Sizeを制御できる環境なら、たとえば0.95〜1.05の狭い範囲を使い、文字の大きさを少しずつ変える表現を試せます。変化の大きさと移り変わる時間は分けて調整します。

**図形の透明度を不規則に変える**：BlendなどのControlへ適用できれば、図形が薄くなったり濃くなったりする表現を検討できます。これは用途の提案であり、Blendとの互換性は未検証です。

**繰り返す要素へ変化を付ける**：複数の動きが完全にそろいすぎる場合に、個別の設定値へばらつきを与える候補です。ただし、Randomを複数使ったときの独立性や、Seedによる再現方法があるかは確認できていません。

## 似たModifierとの使い分け

| Modifier | 選ぶときの目安 |
| --- | --- |
| **Random（Krokodove）** | Min / Maxとフレーム範囲による値の更新・滑らかな移り変わりを使いたい |
| [Shake](../modifiers/shake) | 標準ModifierのRandom Seed、Minimum / Maximum、Smoothnessを使って数値や位置を揺らしたい |
| [Perturb](../modifiers/perturb) | Perlinノイズによる滑らかな揺れを作り、PolylineやMeshにも変化を加えたい |
| [Beat](./beat) | フレームごとの拍間隔やBPMを基準に値を動かしたい |

RandomとShakeは、ともに値の上下限を指定できる点が似ています。Randomには**新しい値を生成するフレーム範囲**がKrokodove一覧で明示されています。Shakeには標準ModifierとしてSeed、Smoothnessなどの詳細な作例があるため、位置の揺れを作るなら先にShakeと比較すると選びやすくなります。

## 挙動と注意点

- **毎フレーム値が跳ぶとは限らない**：時間をかけた滑らかな遷移が説明されているため、常に不連続なフレーム単位の揺れを作るものとは扱いません。
- **対象のControlの値域に注意**：数値を生成できても、制御先に適さない範囲を指定すると意図した表示にならない可能性があります。
- **再現性は未確認**：Seedの有無、保存・再生後に同じ値が再現されるか、複数インスタンス間でどう異なるかは、21.1 Manualのこの一覧では説明されていません。
- **Edition・実機は未確認**：Resolve Free / Studio / Fusion Studioでの提供差、登録名（REGID）、Inspectorの正式ラベルと数値範囲は、このページでは確定していません。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2438「Modifiers — Random」。Controlへのランダム値の供給、Min / Maxによる出力範囲、フレーム範囲に沿った新しい値の生成と滑らかな遷移が記載されています。

**比較資料**：同Manual Chapter 124「Modifiers」のShake / Perturb。標準Modifierの一般的な追加手順は参考情報であり、Random固有の追加方法を確認したことにはなりません。

メタデータの入力・出力分類parameterは既存COLLECTANEAカタログに基づきます。具体的な数値例や接続案は検証用であり、実機の既定値や動作実績ではありません。未確認のInspector・Edition・実機動作が残るため、verificationはpartialのままにしています。
