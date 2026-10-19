---
title: uExport
description: USDシーンをFusionから書き出すuExportの入力・形式・Inspector操作と、uLoaderでの往復確認、他ソフトへ渡す際の注意点を解説する。
doc_type: node
term_id: uexport
term_short: uExportは、Fusionで作ったUSDシーンを外部で使えるUSDファイルとして保存するノード。
verification: partial
aliases: [uExport, uEx]
concepts: [usd-scene, file-io]
nodes: [uExport]
node_family: usd
controls: [Export Stage, Format]
inputs: [usd]
tasks: [usd, export-usd, interchange]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uExport

**uExportは、Fusion内の<Term id="usd-scene">USDシーン</Term>を、別の3Dソフトや別の作業工程で利用できるファイルとして保存するノード**です。

USDは、立体物の形や配置だけでなく、カメラ・ライト・材質・アニメーションなどを扱える3Dシーンのデータ形式です。uExportで保存するのは、画面に見える画像の1フレームではなく、この**3Dシーンの情報**です。完成した2D画像が必要な場合は[uRenderer](./u-renderer)を使います。USDについて詳しくは[USDシーンの基礎](../../learn/02-data/usd)を参照してください。

## 入力・出力と役割

| 項目 | 内容 | 役割 |
| --- | --- | --- |
| **USD Scene入力** | USDシーンを受け取る端子。21.1 Manualでは1つと説明される | 保存したいシーンを渡す |
| **Export Stage** | Inspectorの保存ボタン | ファイルブラウザーから保存先を指定する |
| **書き出し結果** | ディスクに保存されたUSDファイル | 他のUSD対応ソフトへ渡す、後でuLoaderから読み込む |

**21.1 Manualは、uExportの出力端子の有無や出力するデータ型を明記していません。** そのため、uExportの先に別ノードをつなぐパススルー機能は、ここでは確認済みの仕様として扱いません。書き出し前のシーンを別の処理にも使う場合、利用中のFusionで接続方法を確認してください。

~~~text
uLoader（読み込んだ3Dモデル） ─┐
uShape（Fusionで作った立体） ──┼→ uMerge → uExport ⇒ USDファイル
uCamera（カメラ） ───────────┤
uDistant Light（照明） ───────┘

同じシーンを映像にする場合：
USDシーン → uRenderer → 2D Image → MediaOut
~~~

図の「⇒ USDファイル」は**ディスクへの保存結果**を示し、Fusion内の出力端子ではありません。複数のUSD要素は[uMerge](./u-merge)でひとつのシーンにまとめます。通常の画像用Mergeに、USDシーンのまま直接つなぐ構成とは区別します。

## Inspector：Export StageとFormat

uExportのInspectorで、21.1 Manualに明記されている書き出し項目は**Export Stage**と**Format**です。

**Format**で保存するUSDファイルの形式を選び、**Export Stage**を押してファイルブラウザーから保存先を指定します。保存先を選ぶ操作と、シーンのファイル形式を決める操作は別です。

| Format | 拡張子 | 主な選び方 |
| --- | --- | --- |
| **USD** | `.usd` | 受け渡し先から通常のUSDファイルを指定されている場合 |
| **USD UTF-8** | `.usda` | シーンの記述をテキストとして確認したい場合 |
| **USD binary** | `.usdc` | バイナリ形式が求められる場合 |
| **USD packaged** | `.usdz` | パッケージ形式での受け渡しが必要な場合 |

`.usd`という拡張子だけから、そのファイルがテキスト形式かバイナリ形式かを断定しません。また、**`.usdz`を選ぶだけで外部テクスチャや参照先の全ファイルが必ず期待どおり収録されるとは限りません**。受け渡し先でも依存データを確認します。

## 制作例：Fusionで作ったシーンを引き渡す

車の3Dモデルに、簡単な背景立体とカメラ・照明を加え、別の作業工程へ渡す例です。

1. [uLoader](./uloader)で車のUSDモデルを読み込みます。必要なら[uShape](./ushape)で床や別の立体を作ります。
2. [uTransform](./utransform)でモデルの位置や向きを調整し、[uCamera](./ucamera)と照明を用意します。
3. [uMerge](./u-merge)でシーンをひとつにまとめます。
4. [uRenderer](./u-renderer)で代表的なカメラ視点から描画し、モデルや配置が意図したものか確認します。ここで確認しているのは**Fusion上での見た目**であり、まだ書き出しファイルの互換性ではありません。
5. uMergeのUSDシーンをuExportの入力につなぎ、Inspectorの**Format**を選びます。
6. **Export Stage**で保存先とファイル名を指定して書き出します。
7. 出力ファイルを受け渡し先で開き、モデルの階層、位置、材質、ライト、カメラ、アニメーションの必要な要素を確認します。

画面上で正しくレンダリングされていても、**他ソフトが同じようにUSDファイルを解釈するとは限りません**。特に外部画像・材質定義・参照ファイルを使うシーンでは、受け渡し先の環境で依存データが解決されるか確認します。

## Variantと表示状態を変更して書き出す

USDアセットに複数の仕様が用意されている場合、[uVariant](./uvariant)で使用する仕様を選び、[uVisibility](./uvisibility)で不要なオブジェクトを隠してから、uExportへ渡す構成が考えられます。例えば、車の屋根を「閉じた状態」に切り替え、背景に含まれる看板を非表示にして、ショット用のUSDを受け渡す場合です。

~~~text
uLoader（屋根のVariantを持つ車と街並み）
  → uVariant（車の屋根の仕様を選ぶ）
  → uVisibility（看板のPrimを隠す）
  → uExport ⇒ shot.usdc
~~~

1. **uVariant**のPickで屋根の設定を持つPrimを選び、**Variant Set**と**Variant**を指定します。ここで選べるのは元のUSDに定義済みの候補だけです。
2. **uVisibility**のPickで看板のPrimを選び、**Invert Prim Selection**が意図どおりか確認してから**Visible**をオフにします。これはPrimの表示制御であり、形状データの削除を意味しません。
3. 書き出し前のUSDシーンを[uRenderer](./u-renderer)で描画し、屋根の仕様と看板の表示状態を確認します。uExportの出力端子によるパススルーはManualでは確定しないため、描画経路は**uExportの手前のUSDシーン**から構成してください。
4. uExportで保存したファイルを新しい[uLoader](./uloader)へ読み込み、同じカメラ・照明・代表フレームで描画して比較します。必要ならScene TreeでPrim階層も確認します。

**書き出せることと、編集可能な状態がそのまま残ることは別です。** 21.1 ManualはuExportがジオメトリ・材質・アニメーション・照明をUSDへ保存できると説明していますが、**uVariantで選んだ候補だけが保存されるのか、元のVariant Setと全候補も残るのか**、また**uVisibilityの設定やそのキーフレームがどの形で保存されるか**までは明記していません。納品先で再び仕様を切り替える必要がある場合は、選択結果の見た目だけでなく、Variant Setと候補が残っているかも調べます。

Visibleをアニメーションしたシーンなら、開始・切り替え付近・終了のフレームを読み直して比較してください。単一フレームで看板が消えていることだけでは、時間変化まで保持された証明にはなりません。形式ごとの詳しい受け渡し条件は[3Dファイルの受け渡し](../../learn/02-data/3d-file-interchange)を参照してください。

**根拠：** DaVinci Resolve 21.1 Reference Manual、p.2900（uExport）、pp.2925–2926（uVariant）、pp.2927–2928（uVisibility）。上記の組み合わせはManual記載のノード機能に基づく構成例であり、書き出し後の保持結果は21.1実機未確認です。

## uLoaderで読み直す：簡単な往復確認

書き出しを検査するには、保存したファイルを**新しい[uLoader](./uloader)**で読み直します。

~~~text
元のUSDシーン → uExport ⇒ scene.usdc（保存）
                                  ↓
                              新しいuLoader → uRenderer
~~~

元のシーンと読み直したシーンで、**立体の数・配置・材質の見え方・代表的なアニメーションフレーム**を比べます。材質を差し替えていた場合は、[uReplaceMaterial](./ureplacematerial)で変更した部分も確認してください。

この確認で確かめられるのは「保存したファイルをFusionが読み込めるか」です。**他の3Dソフトでの完全な再現、USD規格の全機能の保持、全フレームの時間サンプルが同一であることまでは証明できません**。実際の納品先でも再確認します。

## シーンの一部分を別ファイルにしたい場合

21.1 Manualには、**ソースツリー内の特定ノードを、リンクされたUSDファイルの階層として書き出すことも可能**と記載されています。ただし、同じuExport節に載るInspectorの具体的な項目はExport StageとFormatだけで、**対象の選び方やリンク付き階層の書き出し操作は説明されていません**。

階層を分割して引き渡す必要がある場合は、実機で選択方法を確認したうえで、出力ファイルの参照関係とPrimの構造を検査します。未確認のメニュー名や操作を推測で補いません。

## uExport・uLoader・uRendererの違い

| ノード | 操作する対象 | 用途 |
| --- | --- | --- |
| [uLoader](./uloader) | ディスク上のUSDファイル → Fusion内のUSDシーン | 外部の3Dデータを読み込む |
| **uExport** | Fusion内のUSDシーン → ディスク上のUSDファイル | 3Dシーンを保存・受け渡しする |
| [uRenderer](./u-renderer) | USDシーン → 2D画像 | 映像に描画する |

後から立体の位置や材質を編集したいなら、USDシーンをファイルに残す目的を先に考えます。**完成した映像だけを渡す**場合、uRendererによる2D画像の描画が別途必要です。

## うまくいかないとき

| 症状 | まず確認すること |
| --- | --- |
| 書き出し先を選べない・保存に失敗する | **Export Stage**で指定したパス、ファイル名、保存先の権限、実際に出ているエラーを確認する |
| 別ソフトでファイルが開かない | 保存されたファイルの実在、拡張子と**Format**、受け側ソフトの対応形式を確認する |
| 必要な立体が入っていない | uExportのUSD入力が期待したuMergeのシーンになっているか確認する |
| カメラや照明が違う | 書き出す前のUSDシーンに含まれているか、読み込み側がそのPrimを扱えるかを調べる |
| 材質・テクスチャが違う | [uMaterialX](./umaterialx)などの外部定義、参照画像、[uReplaceMaterial](./ureplacematerial)の変更後シーンを確認する |
| アニメーションが止まる・速度が違う | 元データのアニメーションと、読み込み先の再生範囲・時間設定を分けて調べる |
| `.usdz`なのに画像が見つからない | パッケージ内外の参照関係を確認する。拡張子だけで依存ファイルの完全な同梱は保証しない |
| uExportの次を画像用Mergeへつなぎたい | 画像にするなら**uRenderer**が必要。uExportの出力端子については21.1 Manualの記載がない |
| 特定のPrimだけを階層別に渡したい | Manualはリンク付き階層の書き出しに触れるが操作は説明していない。実機で操作・結果を検証する |

## 関連ノード

- [uLoader](./uloader)：USDファイルをFusionへ読み込み、保存結果の確認にも使う。
- [uMerge](./u-merge)：複数のUSD要素をひとつのシーンにまとめる。
- [uRenderer](./u-renderer)：USDシーンを2D映像として描画する。
- [uCamera](./ucamera)：シーンの視点を用意する。
- [uShape](./ushape)：書き出し対象の基本立体を作る。
- [uTransform](./utransform)：USDシーンの配置を調整する。
- [uReplaceMaterial](./ureplacematerial)：選択したPrimの材質を置き換える。

## バージョン・出典と未確認事項

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月8日公開）、Chapter 121「USD Nodes」、**p.2900「uExport [uEx]」**。USDシーン入力1つ、Export Stage、Formatの4形式、ジオメトリ・材質・アニメーション・照明の書き出し、リンク付きUSD階層について確認しました。入手先：[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support/)。

Manualの入力説明に「Background node」とありますが、節の見出しも周囲の説明もuExportです。他ノードからの文章流用と考えられるため、**Background入力を使うという意味には読み替えません**。

この節では**ノード出力端子、リンク付き階層の具体的操作、外部参照の保持範囲、アニメーションの時間サンプル、受け渡し先ソフトとの互換性、Edition差**は十分に確定できません。制作例はManualにある機能を使った作業手順であり、実機確認は未実施です。そのため`verification: partial`を維持します。
