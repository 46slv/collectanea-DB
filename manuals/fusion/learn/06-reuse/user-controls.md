---
title: User Controlsで公開interfaceを作る
description: FusionのInspectorに操作項目を追加・変更し、実際のパラメータへ結び付ける。
doc_type: concept
term_id: user-controls
term_short: ノードのInspectorへ追加・変更・非表示にできる独自の操作項目。
verification: partial
aliases: [User Controls, Edit Control, custom controls]
concepts: [user-controls, interface-design, parameter-ownership]
tasks: [reuse, expose-controls, simplify-interface]
prerequisites: [parameter-data, expressions]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# User Controlsで公開インターフェースを作る

Fusionでは通常、Inspectorの既存パラメータを操作してノードの効果を調整します。しかし、そのままでは利用者に分かりにくい場合や、複数の値を一緒に動かしたい場合があります。**User Controls**は、ノードのInspectorへ新しい操作項目を加えたり、既存項目の名前や表示方法を変えたりする機能です。

たとえばDirectional Blurの「Length（ぼかしの長さ）」と「Angle（方向）」を別々に調整する代わりに、Viewer上の1点を動かして長さと方向を決める操作へ変更できます。**画像処理は元のノードが実行し、User Controlsは操作する側のインターフェースを変えます。**

## User ControlsとMacroの違い

| 機能 | 役割 |
| --- | --- |
| User Controls | **個々のノード**のInspectorに新規・変更・非表示のControlを設ける |
| Expression / Connect To | 追加したControlの値を、実際に画像を処理するパラメータへ渡す |
| [Macro](./macros-templates)のExport | **複数ノードをまとめたMacro**の外から使える端子とControlを選ぶ |
| [Group](./groups) | ノード群を整理し、内部Graphを編集可能なまままとめる |

**Controlを追加するだけでは画像は変化しません。** 値を内部パラメータへ接続・参照させる必要があります。反対に、Controlを非表示にしても元の処理は動き続けます。

21.1 Manualによれば、変更したUser Controlsは**そのノードのインスタンス**に保存されます。コピー／ペースト、Settingとしての保存、BinsやFavoritesへの追加でも引き継げます。同じ種類のすべてのノードの初期UIを書き換える機能ではありません。

## Edit Controlを開く

1. Fusionページで対象ノードを選び、Inspectorに表示します。
2. **Inspectorのヘッダーにあるノード名を右クリック**します。数値欄を右クリックして開くメニューとは違います。
3. **Edit Control**を選び、既存Controlを選択するか新規Controlを定義します。
4. 名前・型・表示タブや入力UIを設定し、必要な内部パラメータへ値を結び付けます。

21.1 Manual Chapter 69にあるダイアログの主な区分は次のとおりです。

- **Input attributes**：既存Controlの選択、新しいControlの追加、名称、型、配置するタブ。
- **Type attributes**：入力UIの種類、初期値・範囲、Viewer上の操作UIの有無。
- **Input Ctrl attributes**：選択した入力UI固有の設定。
- **View Ctrl attributes**：Viewer上の操作UI固有の設定（該当する場合）。

数値だけでなく**Point**、**CheckboxControl**、**MultiButtonControl**などの形を選べる例が載っています。すべての項目が全Controlで利用できるわけではありません。

### IDは内部の参照名、Nameは画面の表示名

既存Controlの**ID**はExpressionなどで参照する識別子です。**Name**はInspectorに表示する文字列です。両者を区別します。

21.1 Manualの作例では、既存のIDを選んだとき**Replace / Hide / Change ID**から選択します。

- **Replace**：元のIDを保ちながら、名前や操作UIを作り直します。
- **Hide**：元のControlをInspectorから隠します。
- **Change ID**：識別子を変更します。式が元のIDを使っているなら参照先を確認します。

表示名だけ変えたい場合にIDを変更する必要はありません。既存のExpressionを保ちたいときは特に重要です。

## 具体例：Directional Blurを1点から操作する

公式Manualのpp.1516–1517では、Directional Blurの**Length**と**Angle**を、**Center**の位置から計算する方法が示されています。

~~~text
入力画像 → Directional Blur → ぼかし済み画像
                  ↑
             Blur Vector
                  │
             ┌────┴────┐
             ↓         ↓
           Length     Angle
          （式で算出）（式で算出）
~~~

1. 元の**Length**と**Angle**へCenterの座標を参照するExpressionを設定します。Centerを動かして、ぼかしの長さと方向が連動するか先に確認します。
2. Edit Controlで既存の**Center**を選び、**Replace**を指定します。
3. 公式作例どおり**NameをBlur Vector、TypeをPoint、PageをControls**とします。**IDはCenterのまま**にして、Expressionの参照を保ちます。
4. 元の**Length**と**Angle**を**Hide**にします。
5. ViewerでBlur Vectorを移動し、入力画像に対するぼかしの変化を確認します。

LengthとAngleに用いる公式の式では、画像の縦横比と座標スケールも考慮します。完全な式は**21.1 Manual p.1516**を参照してください。単に「X座標をAngleへ代入する」だけでは同じ動作になりません。

Blur Vectorは画像端子ではなく、**入力画像のぼかし方を決める操作値**です。この変更でノードの画像入力や出力の種類が変わるわけではありません。

### LinearとCenteredの2択を作る

同じ作例では、Directional BlurのTypeを2択にする方法も紹介しています。

新しいID **Centered**のControlを追加し、Typeを**Number**、Input Ctrlを**CheckboxControl**にします。元のTypeへ次のSimpleExpressionを設定します。

~~~text
iif(Centered==1, 2, 0)
~~~

チェックが入るとTypeへ2、外れると0を渡します。**チェックボックスを作成しただけでは既存のTypeは切り替わりません。** 式で連動させた後、元のTypeを隠します。

21.1 Manual p.1517には、**MultiButtonControl**でLinearとCenteredだけを表示する方法もあります。ここでの0と2はDirectional Blurの作例の値なので、別のノードの選択肢へそのまま使い回さないでください。

<!-- capture:S135 -->

## 実機例：Blur VectorとCenteredを公開する

1920×1080のテストチャートをDirectional Blurへつなぎ、LengthとAngleにCenterを参照する式を設定します。Edit ControlのID欄で `Center` を読み込み、Nameを `Blur Vector`、TypeをPoint、PageをControlsにしました。LengthとAngleは非表示にしています。

Viewer上の点を動かすと、Blur Vectorの座標と、式で計算されるぼかしの長さ・角度が変わります。二枚のViewer画像は、同じ素材・frame 0で点を移動する前後です。

続いて `Centered` をNumberのCheckboxControlとして追加し、元のTypeに `iif(Centered==1, 2, 0)` を設定しました。チェックを入れるとTypeが2、外すと0になることを確認し、その後Typeを非表示にしています。

WindowsのDaVinci Resolve Studio 21.1.0.14で確認した例です。下のGraphは撮影時の構成記録で、別のCompositionへの読み込みとMediaInの素材接続は未確認です。

[![Edit ControlでID CenterのNameをBlur Vectorにし、PointとControlsを選んだ画面](/img/fusion/captures/S135/center-control.png)](/img/fusion/captures/S135/center-control.png)

IDは `Center` のまま、表示名を `Blur Vector` に変更します。

[![Blur VectorがX 0.65、Y 0.6のときに斜めにぼけたテストチャートとInspector](/img/fusion/captures/S135/blur-vector-before.png)](/img/fusion/captures/S135/blur-vector-before.png)

Viewerの点を動かす前。LengthとAngleはInspectorから隠れています。

[![Blur Vectorの点を移動した後、座標とぼかしの向きが変わったテストチャート](/img/fusion/captures/S135/blur-vector-after.png)](/img/fusion/captures/S135/blur-vector-after.png)

点を移動すると、座標とぼかしの向き・長さが連動して変わります。

[![Edit ControlでCenteredをNumber型、Controlsページ、CheckboxControlに設定した画面](/img/fusion/captures/S135/centered-control.png)](/img/fusion/captures/S135/centered-control.png)

`Centered` をチェックボックスとして追加します。

[![Centeredがオンで、Typeにiif式が設定されているInspectorとViewer](/img/fusion/captures/S135/centered-expression.png)](/img/fusion/captures/S135/centered-expression.png)

式でチェック状態を元のTypeへ渡します。

[![Typeを隠した後のBlur VectorとCenteredチェックボックス、ぼかされたテストチャート](/img/fusion/captures/S135/centered-final.png)](/img/fusion/captures/S135/centered-final.png)

Typeを隠した後も、チェックボックスから切り替えられます。

[再現用Graph](/img/fusion/captures/S135/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S135/capture.json)

<!-- /capture:S135 -->

## 複数ノードの調整を一つにまとめたい場合

3つの図形を等間隔に並べたタイトルで、利用者に**Spacing**だけを操作させたいとします。

~~~text
Spacing
  ├─ 図形Aの位置を計算する式
  ├─ 図形Bの位置を計算する式
  └─ 図形Cの位置を計算する式
               ↓
      3つの図形の間隔が変わる
~~~

SpacingというUser Controlを追加したノードから、各図形の位置パラメータがその値を参照する構成です。必要な式は基準位置や図形数によって変わります。User Controlが別のノードを自動的に操作するわけではありません。

一式を別のCompositionで使うなら、[Macro / Template](./macros-templates)として保存し、**Macro Editorで公開するControlと入出力端子をExport**します。User Controlsを追加したことと、Macroの公開設定が終わったことは同義ではありません。作成から配布までの流れは[Resolveで再利用する手順](../../resolve-integration/reusable-fusion-assets)を参照してください。

## 確認とトラブルシューティング

- **操作項目は動くのに映像が変わらない**：内部パラメータへのExpression・接続を確認します。
- **名称を変えたら式が動かない**：NameだけでなくIDを変えていないか調べます。
- **必要なパラメータが見えない**：HideしたControlを確認します。式を作ってから非表示にすると原因を追いやすくなります。
- **新しく追加した同種ノードにControlがない**：User Controlsは元のインスタンスに保存されます。変更済みノードをコピーしたのか区別します。
- **Macroの外から操作できない**：Macro EditorのExport設定を確認します。

公開する項目は多ければよいわけではありません。「利用者が何を変えるか」と「どのパラメータに反映されるか」を対応させます。また非表示にするだけでは、内部の値を保護したり、無効な組み合わせを防いだりすることにはなりません。

## 関連記事

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)
- [Macro / Templateで再利用単位を作る](./macros-templates)
- [GroupでGraphをまとめる](./groups)
- [Fusion assetをResolveで再利用する](../../resolve-integration/reusable-fusion-assets)

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）Chapter 69「Editing Parameters in the Inspector」pp.1515–1517**を参照しました。p.1515にEdit Controlの呼び出し、p.1516に属性とDirectional Blurの式、p.1517にReplace / Hide、Blur Vector、CheckboxControl、MultiButtonControlの例があります。

公式記載の仕様・操作は21.1に基づきますが、全OS・Editionでの実機動作や、複数図形の応用例は未検証のため、verificationはpartialとしています。
