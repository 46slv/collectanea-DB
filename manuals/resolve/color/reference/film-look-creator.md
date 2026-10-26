---
title: Film Look Creator（フィルムルック）
description: ColorページのFilm Look Creatorで色のLookと粒子・光学的効果を分けて調整し、カラー管理やLUT化の制約も確認する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Film Look Creator, Presets, Film Look Blend, Color Blend, Effects Blend, 3D LUT Compatible, Color Space Overrides, Split Tone, Halation, Bloom, Grain, Film Gate]
tasks: [look-development, film-emulation, color-grade, troubleshoot]
level: intermediate
updated: "2026-10-26"
---

# Film Look Creator：色のLookとフィルムの質感を分けて調整する

**Film Look Creator**は、色や階調の変化と、フィルムらしい粒子・光のにじみ・画面の揺れを一つにまとめたResolve FXです。DaVinci Resolve **21.1ではStudio版のみ**の機能です。メーカーやフィルム銘柄を厳密に再現するためのプロファイルではなく、Blackmagic独自の基本フィルムルックを出発点に、作品に合わせて調整するためのツールです。

例えばMVで、肌や暗部の色の関係は変えたい一方、光源の周囲だけに控えめなにじみを与え、粒子を足したいとします。Film Look Creatorなら一つのエフェクト内でそれらを調整できます。個別のResolve FXほど細部を追い込む必要が出た場合は、対応するモジュールを切り、別のFXをノードへ追加する方法もあります。

以下の項目名と挙動は、Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 157、pp.3560–3564、およびColorページへのFX適用方法を扱うChapter 151、pp.3487–3491に基づきます。操作例は手順設計であり、21.1実機で再生・レンダー確認した結果ではありません。

## 適用前にカラー管理を確かめる

Film Look Creatorは**scene-referred（シーン基準）**のワークフローを想定しています。Resolve Color Management（RCM）やACESで管理している場合、公式マニュアルによればエフェクトは既定でタイムラインの色空間を入出力に利用します。

手動のDaVinci YRGBなど、表示基準で管理する構成では、Film Look Creator内の**Color Space Overrides**で入力・出力のColor SpaceとGammaを指定する必要があります。ここにはInput Color Space／Input Gamma／Output Color Space／Output Gamma／Output White Pointがあり、既定の「Use timeline」はプロジェクトのColor Management設定に従います。**Overridesを変更してもトーンマッピングが自動追加されるわけではありません。**

先に[カラーマネージメントの基礎](../learn/color-management-basics)で現在の変換経路を確認してください。入力色域やGammaが不明なまま、見た目だけを頼りにOverridesを選ばないようにします。Film Look Creatorを有効にするためだけに、既存のRCM／ACESや[CST](./color-space-transform)の設定を重複させる必要はありません。

## Colorページで適用する手順

1. Colorページで対象クリップを選び、まずViewerと[Scopes](./scopes)で露出、白の階調、肌の状態を確認します。
2. Node Editorでフィルムルック用の**独立したCorrector Node**を用意します。基本補正とエフェクトの前後を比較できるようにするためです。
3. 画面右側の**FX／Effects**からEffects Libraryを開き、検索欄で「Film Look Creator」を探します。
4. エフェクトをノードへドラッグし、FXバッジの付いたノードを選択してSettingsを表示します。Effects Libraryから接続線や空白へドラッグして、新しいCorrector Nodeを作る方法もあります。
5. 既存ノードに別のOpen FXが付いている場合、そこへドラッグすると前のプラグインが**置き換わる**ため、専用ノードを使います。21.1 Manualでは一つのCorrector Nodeに設定できるOpen FXは一つです。

後でルックだけを比較したい場合は、そのノードを一時的に無効にして確認します。ノード順序が変わればエフェクトへ入る信号も変わり得るため、複数の処理位置を同時に変更しないようにします。

## Presetsと三つのBlendを区別する

Film Look Creatorは追加効果をすべてオフにしても、既定の**Blackmagicの基本フィルムルック**を適用します。これは内部の多数の調整で構成され、個別の内部パラメータは公開されていません。追加モジュールをすべてオフにした状態を「元素材と同じ」と誤認しないことが大切です。

| 項目 | 役割 | 判断の目安 |
| --- | --- | --- |
| **Clean Slate** | 基本フィルムルックを適用せず、調整のない状態から始めるPreset | 元の画像に近い出発点と比較したい |
| **Default No Effects** | 基本フィルムルックは適用し、追加の効果は無効にするPreset | 色の基準ルックだけを確かめたい |
| **Film Look Blend** | 初期の基本フィルムルックの強さを調整 | 既定ルックが強すぎる |
| **Color Blend** | 基本ルック、Color Settings、Split Toneによる色のLookを混ぜる | 色の変更量をまとめて調整したい |
| **Effects Blend** | 空間的なエフェクト群の強さを調整 | にじみ・粒子などの強さをまとめて抑えたい |

Effects Blendは0%で対象エフェクトがオフ、100%でその出力が完全に適用されます。**Film Look Blend、Color Blend、Effects Blendは同じ領域を薄める三つの呼び名ではありません。** 比較時は何を弱めたかを記録します。

## 色と階調を作るColor Settings

| Control | 働き | 確認すること |
| --- | --- | --- |
| **Exposure** | 露出をstop単位で調整 | 人物と背景の明暗の関係、白い部分の余裕 |
| **Contrast** | Sカーブで全体のコントラストを調整 | 中間調と黒・白側のつながり |
| **Highlights** | Sカーブ上端のロールオフを調整 | 光源・窓・反射の階調 |
| **Fade／Fade Rolloff** | Sカーブ下端と黒側の止まり方を調整 | 黒の浮き方、暗部の階調 |
| **White Balance／Tint** | 色温度方向および緑／マゼンタ方向のバランス | 肌、グレー、意図した照明色 |
| **Skin Bias** | 肌色の暖かさ、明るさ、彩度傾向を調整 | 肌の変化が背景色から独立して見えるか |
| **Subtractive Sat／Richness** | 減法混色に似た彩度の調整、および高彩度域の調整 | 強い赤・青が過度にならないか |
| **Bleach Bypass** | 彩度を落とし、コントラストの高い画像を重ねた表現 | 肌や暗部の情報を犠牲にしていないか |

これはどの順番で必ず触るべきかを示す表ではありません。例えば「画面が寒色だからTintを上げる」と一つの数値に置き換える前に、カメラの入力解釈や照明が目的通りか判断します。各項目は実機で固定値を測っていないため、推奨プリセット値はここでは指定しません。

**Split Tone**では影とハイライトに対向する色方向を加えます。Enable Split Toneをオンにし、Natural／StrongのMode、Amount、Hue Angle、Pivotを使います。Amountが0のままでは効果が現れません。顔の暗い側と背景の影が同時に着色されることもあるため、[Scopes](./scopes)とViewerを併用し、Neutralな壁や衣装も確認します。

## 質感を作るモジュール

| モジュール | 作用と主なコントロール | 注意点 |
| --- | --- | --- |
| **Vignette** | 画面周辺を落とす。Amount／Sizeを調整 | 周辺にいる人物まで暗くしていないか |
| **Halation** | 明るい境界付近に着色したにじみを作る。Highlights Only、Amount、Radius、Saturation、Hue | 光源以外の輪郭へも作用する可能性がある |
| **Bloom** | 明部の周辺へ柔らかい光を広げる。Amount／Radius | ハイライトを均一にぼかしすぎないか |
| **Grain** | 粒子を加える。Preset、Amount、Size、Softness、Saturation | 停止画だけでなく再生中の細部も確認する |
| **Flicker** | 露出の周期的な脈動を加える。Amount／Rate | 意図しない明るさのちらつきに見えないか |
| **Gate Weave** | フィルム搬送由来の縦横方向のわずかな画面揺れを模す。Amount／Rate | 画面端・文字・固定物で揺れを確認する |
| **Film Gate** | フィルム枠やアスペクト比を模す。Preset、Ratio H/V、Curvature、Softness、Padding | フレームを満たさない映像では予期しない枠の出方になる |

これらの有効化スイッチは別々です。まず色だけを調整し、目的があるモジュールを**一つずつ**足す方が、想定外の変化の原因を追いやすくなります。

Grainの**Image Defocus**は元画像の解像感を弱める調整で、マニュアル上は粒子自体には作用しません。粒子を大きくするSizeとは役割が違います。また、Halation、Bloom、Grainの詳細をもっと調整したいときは、Film Look Creator内の該当モジュールを切り、専用のResolve FXを別のノードへ適用する方法を検討します。

## 判断例：夜のMVで光のにじみと粒子を加える

屋内で人物を撮影し、背景に明るい照明と暗い壁がある架空のワンカットを考えます。狙いは「肌を見失わず、光の周囲に軽いにじみを加える」ことです。

1. まず基本補正を終えたショットで、入力変換とタイムラインの色空間を確認します。基準フレームの肌、照明、黒側をViewerとWaveform／Paradeで観察します。
2. 独立ノードへFilm Look Creatorを置き、**Default No Effects**で基本ルックだけの変化を確認します。元の画像と比較し、強ければFilm Look Blendを調整します。
3. ContrastとHighlightsで明暗のまとまりを確かめ、必要ならSkin Biasを試します。照明に意図的な色がある場合、White BalanceやTintで機械的に中和しません。
4. Halationだけを有効にして明るい輪郭の変化を確認します。広がりが足りないからと即座にBloomも重ねず、HalationのRadiusやHighlights Onlyの違いを見ます。
5. Bloomを加える場合は、Halationとの重なりで輪郭の判別が弱まっていないか比較します。照明の近くだけでなく人物の白い衣服なども確認します。
6. GrainはPresetsを出発点にAmount／Size／Softnessを調整し、実際の再生速度で確認します。必要がなければFlickerやGate Weaveを追加しません。
7. 最後にEffects BlendとColor Blendを**別々に**調整し、ベースの色と空間的効果のどちらが変わったか確かめます。前後のショットや[納品前Color QC](../recipes/pre-delivery-color-qc)も比較します。

効果が意図通りかは元素材や表示条件にも依存します。この手順は効果量の正解を数値で保証するものではありません。

## 3D LUTに持ち出せるもの・持ち出せないもの

**3D LUT Compatible**を有効にすると、3D LUTでは表現できない空間的効果のオプションが取り除かれます。マニュアルはColor SettingsとSplit Toneの変更を、3D LUTへ渡せる部分として説明しています。

したがって、別ソフトやカメラ用のLUTとして持ち出す場合、**Halation／Bloom／Grain／Film Gate／時間変化するFlickerやGate Weaveまで焼き込めるわけではありません**。必要な場合は、受け側でも別のエフェクト工程を用意します。[LUTの適用位置と管理](./luts)にあるように、LUT化した色のLookにも入力色域・Gammaと出力条件があります。別環境で同じ見え方になるかは、実際の色管理と表示条件で確認が必要です。

## 想定外の結果が出たとき

| 症状 | 最初に確認すること | 次の判断 |
| --- | --- | --- |
| 有効にしただけで色や階調が大きく変わる | 選んだPreset、基本フィルムルック、Color Space Overrides | 元の入力状態や二重変換の有無を確認する |
| 追加効果をすべてオフにしても色が変わる | **Default No Effects**では基本ルックが残る | **Clean Slate**と比較してどの層が作用したか分ける |
| 光源だけでなく輪郭全体がにじむ | HalationのHighlights Only／Amount／Radius、Bloomとの併用 | 一方のモジュールを切って比較する |
| 粒子が細部を隠し、再生でも目立つ | GrainのAmount／Size／Softness、Image Defocus | 粒子と元画像のぼかしを分けて調整する |
| Film GateやHalationの位置がおかしい | 元映像がフレーム全体を埋めているか | Node Sizingなどで拡大を検討する。プロジェクト共通のScaling設定は意図を確認してから変更する |
| LUT書き出し後に粒子やにじみが消える | 3D LUT Compatibleと、LUTで表現できる処理の範囲 | 空間・時間変化する効果は別工程で再現する |
| エフェクト後の再生が重い | 同時に有効なモジュール、解像度、素材、キャッシュ状況 | 必要ならSmart／User Cacheを検討する。固定の処理速度は保証しない |

## 出典・版・未検証範囲

- Blackmagic Design, **DaVinci Resolve 21.1 Reference Manual**（September 2026）, Chapter 157 *Resolve FX Film Emulation*, pp.3560–3564。Film Look CreatorのStudio制限、scene-referred設計、Presets、Blend、Color／Spatial／Temporalモジュール、3D LUT Compatible、Film Gateの注意点。[公式21.1 PDF](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)
- 同Manual、Chapter 151 *Using Open FX and Resolve FX*, pp.3487–3491。ColorページでのEffects Library、Corrector Nodeへの適用・置換、FX Settings、Cache。[公式サポート](https://www.blackmagicdesign.com/support)

**検証状態：partial。** 21.1公式マニュアルの対象箇所は確認しました。Resolve 21.1 Studioの実機UI、各Presetの見た目、映像・音との再生同期、レンダー差、キャッシュ速度、他ソフトでのLUT互換性は未検証です。Free版で利用できるという主張はしていません。

関連：[Primaries](./primaries-color-wheels)／[Scopes](./scopes)／[カラーマネージメント](../learn/color-management-basics)／[Colorページ索引](../)
