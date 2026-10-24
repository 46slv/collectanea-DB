---
title: Mask共通Controls（Image / Settings）
description: FusionのMaskノードに共通するOutput Size、Clipping Mode、Motion Blur、GPUなどの設定と、変更すべき場面を解説。
doc_type: concept
term_id: mask-common-controls
term_short: Maskの解像度、画面端の処理、動きのブレやGPU使用を調整する共通設定。
verification: partial
aliases: [Mask Common Controls, Image Tab, Settings Tab]
concepts: [mask-data, domain-of-definition, resolution]
tasks: [create-mask, troubleshoot-mask]
product_scope: fusion
updated: "2026-10-11"
---

# Mask共通Controls（Image / Settings）

Ellipse Mask、Polygon Mask、Bitmap MaskなどのMaskノードには、形や選択範囲を決めるControlsのほかに、生成するマスクの**解像度・画像領域・動きのブレ・処理環境**を調整する共通設定があります。Inspectorの**Image**タブと**Settings**タブがその入口です。

マスクは画像の色そのものではなく、後段の効果をどこへ適用するかを表すデータです。白・黒・グレーの意味やEffect Maskへの接続は[マスクの基礎](../../learn/02-data/mask)から確認してください。

## Imageタブ：生成するマスクのサイズと範囲

### Output Size

**Output Size**は、出力するマスクの解像度を決めます。21.1マニュアルには次の3通りが説明されています。

| 選び方 | 出力サイズの基準 | 使う場面 |
| --- | --- | --- |
| コンポジションの既定解像度 | 合成のFrame Format | Ellipse / Rectangleなど、入力画像なしで作るマスクを合成全体に合わせる |
| 入力画像の解像度 | 接続したSource Image | Bitmap / Wandなど、画像を入力するMaskノードで元画像とサイズを合わせる |
| Custom | 個別に設定するサイズ | 最終出力とは異なるサイズでマスクを扱う必要がある |

入力画像を持たないEllipse Maskなどでは、「入力画像に合わせる」という選択はできません。Inputの有無は個別の[Maskノード一覧](./index.md)と各ノード記事で確認します。

Customの関連項目には**Width / Height**（横・縦の画素数）、**Pixel Aspect**（画素の縦横比）、**Depth**（画素の精度）があります。Pixel Aspectが1:1なら正方形画素です。マニュアルでは、Frame Format設定に数値を連動させる場合と、その連動を外して別解像度の合成を作る場合も説明されています。Customの操作表示と連動状態は、選択中ノードのInspectorで確認してください。

Depthを高くすると階調計算の精度を確保できますが、メモリ使用量も増えます。21.1マニュアルは32-bit画素を8-bit画素の約4倍のメモリ使用量として説明しています。すべてのマスクで最大精度が必要という意味ではありません。

### Clipping Mode

**Clipping Mode**は、画像の有効範囲である**DoD（Domain of Definition）**と、画面端の処理の関係を決めます。DoDは「フレームの中で実際に画素データが定義されている領域」です。詳しくは[DoDの基礎](../../learn/03-space/domain-of-definition)を参照してください。

| Mode | 21.1マニュアルで説明される動作 |
| --- | --- |
| **Frame**（マニュアルの既定） | 出力のDoDをフレーム全体として扱う。入力側のDoDがそれより小さければ、残りの部分は黒／透明として扱う |
| **None** | 入力画像のクリッピングを行わない。ただし、処理に必要な位置が上流のDoDの外なら、その領域のデータは黒／透明として扱う |

どちらも「元画像に存在しない画素を自動生成する」設定ではありません。**Soft Edge**で境界をぼかす場合は、輪郭の外側にある画素も計算に使うため、DoDの扱いが結果に影響します。

例えば、画面端ぎりぎりまで楕円マスクを広げてSoft Edgeを強めたとき、境界が不自然なら、まずマスク出力をViewerに表示し、Output SizeとClipping Modeを確認します。マスクの形そのものが誤っているのか、フレームとDoDの関係で切れているのかを分けて調べてください。解像度の基本は[Resolution / Pixel Aspect](../../learn/03-space/resolution-aspect)も参照できます。

## Settingsタブ：動きと実行環境

### Motion Blur

**Motion Blur**は、マスクの形や位置がアニメーションしているときに、その動きに対応したブレをレンダリングする設定です。静止したマスクにオンにするだけで、元映像の被写体に動きのブレが付くわけではありません。

| 設定 | 意味 |
| --- | --- |
| **Motion Blur** | このノードのモーションブラーを有効／無効にする |
| **Quality** | 時間方向のサンプル数に関わる品質。増やすと滑らかになる一方、計算時間が増える |
| **Shutter Angle** | 仮想シャッターの開いている時間に相当する角度。大きいほど動きのブレが増える |
| **Center Bias** | 時間方向のサンプルの中心位置をずらし、ブレの前後の偏りを変える |
| **Sample Spread** | サンプルごとの重みを調整し、ブレの明るさの分布を変える |

マニュアルでは**Shutter Angle = 360**を1フレーム分の露光に相当する設定として説明し、360を超える値も可能としています。大きくすれば常によくなるわけではなく、長い軌跡や高いQualityは結果と描画時間を見ながら決めます。

#### 例：動く楕円マスクの境界を自然につなぐ

~~~text
MediaIn ─────────────────→ Blur ─→ MediaOut
                            ↑ Effect Mask
Ellipse Mask（Centerをアニメーション）
~~~

1. Ellipse MaskのCenterにキーフレームを打ち、ぼかしたい対象の動きに合わせます。
2. Blurの強さはBlur側で決めます。Ellipse Maskの出力はBlurの青いEffect Mask入力へ接続します。
3. 速い移動でマスク境界がフレームごとに飛んで見える場合、Ellipse MaskのSettingsでMotion Blurを有効にし、Shutter AngleとQualityを調整します。
4. Viewerで移動区間の複数フレームを比べ、ぼかしの**適用範囲**が時間方向にどう広がるかを確認します。

これは「移動するマスクの境界」を滑らかにつなぐ用途です。元映像の被写体そのものへ物理的なモーションブラーを追加する処理とは区別してください。

### Use GPU

**Use GPU**は、このノードのGPU処理の利用方針です。

- **Auto**：対応するGPUが使用可能なら使い、使用できなければソフトウェア処理に切り替える。
- **Enabled**：GPUによるハードウェアアクセラレーションを使用する設定。
- **Disable**：GPUアクセラレーションを無効にする。

同じ合成を処理しているのにGPU関連の問題が疑われる場合は、比較のために設定を変えてレンダリング結果を確認できます。ただし、切り替えただけで原因や速度差が確定するわけではありません。実際の性能と互換性は使用環境に依存します。

### Comments / Scripts

**Comments**にはノードの用途や注意点を書けます。コメントを追加すると、Node Editorの通常表示ではノード左下に印が付き、折りたたみ表示では吹き出しのアイコンが出ます。マウスポインターを重ねると内容を確認できます。複数のマスクで人物の部位を分けている場合は、「顔の外側を除外」「窓の反射だけ」など役割を記録すると、あとからFlowを追いやすくなります。

**Scripts**には、レンダリング時に実行するスクリプトのための3つの入力欄があります。通常のマスク作成には不要です。実行内容はComposition全体へ影響し得るため、用途が明確なスクリプト以外は設定しません。個々のイベント名やスクリプト仕様は、このページでは推測せずFusionのScripting documentationを参照してください。

## 症状から確認する項目

| 症状 | 最初に確認する項目 |
| --- | --- |
| 入力画像とマスクの大きさが合わない | Output Size、Source入力の有無、Width / Height、Pixel Aspect |
| 画面端のSoft Edgeが不自然 | マスクをViewerに表示し、Clipping ModeとDoDを確認 |
| 動いている範囲のマスク境界が硬い | Centerなどのアニメーション、Motion Blur、Shutter Angle |
| 描画時間が増えた | Motion BlurのQuality、Shutter Angle、Use GPU |
| 多数のマスクの役割が分からない | Commentsとノード名を整理 |

ここで扱うのは共通の生成・描画設定です。どの領域を選ぶか、複数マスクをどう合成するかは、各ノードの**Controls**と**Paint Mode**で決めます。[Maskカテゴリ概要](./index.md)で目的から選んでください。

## 実機例：Maskの解像度と共通タブを確認する

<!-- capture-case:S81 -->

Resolve Studio21.1.0.14／Windowsで、Rectangle MaskをBackgroundへ接続した静止例を使いました。矩形の位置や形を変えるControlsと、Maskの解像度・描画条件を変えるImage／Settingsを分けて見ます。左右のViewerは40%です。

[![Rectangle Maskの出力をGold BackgroundのEffect Maskへ渡す共通Controls撮影用Graph](/img/fusion/captures/S81/graph.png)](/img/fusion/captures/S81/graph.png)

[![Center0.5と0.5、WidthとHeight各0.5のRectangle Mask Controls](/img/fusion/captures/S81/controls-inspector.png)](/img/fusion/captures/S81/controls-inspector.png)

[![左の白黒Maskと右のオレンジBackgroundを1920×1080、40%で表示した比較](/img/fusion/captures/S81/compare.png)](/img/fusion/captures/S81/compare.png)

最初は左Mask、右Backgroundとも1920×1080でした。ImageタブのOutput SizeはDefault、今回作成したノードのClipping ModeはNoneでした。上の表にあるFrameの既定値は21.1マニュアルの記述であり、この実機例の初期表示とは区別します。

[![ImageタブでOutput Size DefaultとClipping Mode Noneが選ばれている](/img/fusion/captures/S81/image-default-inspector.png)](/img/fusion/captures/S81/image-default-inspector.png)

Output SizeをCustomへ切り替えると、Width1920、Height1080、Pixel Aspect1／1、Frame Format設定を使用オン、Depth Defaultが現れました。この段階では寸法を変えていません。

[![Output Size Customで1920×1080とFrame Format設定を使用オンが現れたImage Inspector](/img/fusion/captures/S81/image-custom-inspector.png)](/img/fusion/captures/S81/image-custom-inspector.png)

Frame Format設定を使用をオフにし、Width960、Height540へ変更しました。下の左Viewerには960×540、右には1920×1080と表示されています。両方40%でも、左のMask画像は小さく表示されます。MaskのOutput Sizeを変える操作で、後段Backgroundや合成全体の解像度まで変わったわけではありません。この接続では右のオレンジの範囲は同じ見た目を保ちました。寸法が異なるMaskの接続すべてで同じ結果になるとは限りません。

[![Frame Format設定の使用をオフにしWidth960とHeight540にしたImage Inspector](/img/fusion/captures/S81/image960-inspector.png)](/img/fusion/captures/S81/image960-inspector.png)

[![左のMaskは960×540、右のBackgroundは1920×1080であり両Viewer40%でも表示寸法が異なる](/img/fusion/captures/S81/custom960.png)](/img/fusion/captures/S81/custom960.png)

Default／1920×1080へ戻し、Settingsタブを開きました。Motion BlurオフではGPUの使用方針がAutoと表示されています。Auto表示の確認であり、GPU切替や速度比較はしていません。

[![SettingsタブのMotion Blurオフ、GPU Auto、Layer設定を示すInspector](/img/fusion/captures/S81/settings-off-inspector.png)](/img/fusion/captures/S81/settings-off-inspector.png)

Motion Blurをオンにすると、Quality2、Shutter Angle180、Center Bias0、Sample Spread1が現れました。今回は静止Maskのため、アニメーションに対するブラーの品質や時間方向の軌跡を確認した例ではありません。

[![Motion BlurオンでQuality2、Shutter Angle180、Center Bias0、Sample Spread1が表示されたInspector](/img/fusion/captures/S81/settings-on-inspector.png)](/img/fusion/captures/S81/settings-on-inspector.png)

最後はOutput Size Default、Mask1920×1080、Frame Format設定を使用オン、Motion Blurオフ、Clipping Mode None、GPU Auto、フレーム0、Controlsタブへ戻して保存しました。設定変更は撮影用のRectangleノードだけで行っています。

入力画像の解像度を使うモード、他のMask種類、Depth／Pixel Aspect／Clipping Modeの変更、動くMaskのMotion Blur、GPU性能、Comments／Scriptsは未確認です。

[再現用Graph](/img/fusion/captures/S81/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S81/capture.json)

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 108「Mask Nodes」**pp.2500–2502「The Common Controls」**。Output Size、Custom / Width / Height / Pixel Aspect / Depth、Clipping Mode（Frame / None）、Motion Blur（Quality / Shutter Angle / Center Bias / Sample Spread）、Use GPU、Comments、Scriptsの説明を基にしています。

S81でRectangle MaskのImage／Settings表示、Custom960×540と復元、Motion Blurの関連Control表示を実機確認しました。上の運用例のアニメーション、個々のMaskの処理差、GPU性能、Free／Studio差は未確認のため、`verification: partial`を維持します。
