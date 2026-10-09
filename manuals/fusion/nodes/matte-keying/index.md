---
title: Matte / Keyingノード
description: "色、明るさ、背景との差、人物の認識、EXR内のIDなど、素材に応じてマットを作るノードを選ぶための案内。"
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, keying, matte, alpha]
updated: "2026-10-09"
---

# Matte / Keyingノード

人物だけを別の背景に重ねたいときや、画面の一部分だけ色を変えたいときは、**どの画素を残すか**を示すマット（matte）が必要です。一般的なアルファ（Alpha）では、0が透明、1が不透明、中間値は半透明を表します。髪やモーションブラーの縁には、この中間値が必要になります。

Matte / Keyingには、マットを**新しく作る**ノードと、作ったマットや画像のアルファを**整える**ノードがあります。最初に「手元の素材で、何を手掛かりに被写体を区別できるか」を選ぶと、使うノードを絞れます。

基本用語は[画像（Image）](../../learn/02-data/image)と[マスク（Mask）](../../learn/02-data/mask)を参照してください。マットは画素ごとの選択結果、マスクは手描きの形などで範囲を指定する手段として使われることが多く、同じ言葉として扱うと接続を誤ります。

## 素材からノードを選ぶ

| 手元の素材・区別の手掛かり | 最初に試すノード | 得られるもの |
| --- | --- | --- |
| 人物をグリーン／ブルースクリーンで撮った | [Delta Keyer](./delta-keyer) | スクリーン色を透明にし、髪などの半透明の縁も調整できる画像 |
| スクリーンの明るさや色に大きなムラがある | [Clean Plate](./clean-plate) → [Delta Keyer](./delta-keyer) | 背景スクリーンの参照画像を使ったキーイング結果 |
| 特定の色域を抜きたい | [Chroma Keyer](./chroma-keyer) | Viewerで選んだ色域から作るマット |
| 明るさ・RGBなどの値で範囲を選べる | [Luma Keyer](./luma-keyer) | 選択したチャンネルの値に基づくマット |
| 被写体入り映像と、被写体がいない同じ背景の映像がある | [Difference Keyer](./difference-keyer) | 2枚の差から推定したマット |
| 色や明るさだけでは人物・物体を分けにくい | [Magic Mask](./magic-mask) | クリックで対象を指定し、AIによって作る人物・物体のマット |
| 3DレンダーのEXRにCryptomatte IDがある | [Cryptomatte](./cryptomatte) | オブジェクトやマテリアルのIDから選んだマット |
| すでにアルファがあり、形や縁を直したい | [Matte Control](./matte-control) | 既存のアルファを合成・調整した画像 |

表のノードは互換品ではありません。たとえば、Difference Keyerの「被写体がいない背景画像」と、Delta Keyerへ渡すClean Plateは用途が異なります。前者は撮影した画面同士の差を取る参照映像、後者はスクリーンの色や照明ムラを補うための参照画像です。

グリーン／ブルースクリーンでは、[Ultra Keyer](./ultra-keyer)も比較対象になります。[Primatte](./primatte-5)はFusion Studio限定の別方式で、Delta Keyerで処理しづらい素材を試す選択肢です。すべてのショットで同じキーアを使う必要はありません。

## どの入力に何をつなぐか

このカテゴリで扱う中心は2D画像です。キーアは通常、画像を受け取ってアルファを作り、**RGBとアルファを持つ画像**を出力します。後段の[Merge](../compositing/merge)では、その出力をForegroundへ、新しい背景をBackgroundへ接続します。

スクリーンキーアには、画像以外に次の補助入力を持つものがあります。

- **Garbage Matte**：撮影機材や背景の不要な部分など、透明にしたい範囲を指定します。
- **Solid Matte**：スクリーンと似た色の服や目など、消さずに残したい範囲を指定します。
- **Effect Mask**：ノードの効果を適用する範囲を限定します。

これらは役割の違う入力です。端子の有無や名前は各ノード記事で確認してください。特に「被写体を残すマスク」と「背景を消すマスク」を逆に接続すると結果が反転するので、アルファをViewerで確認します。

## 最小構成：スクリーン撮影を別背景へ合成する

    スクリーン素材 → Delta Keyer → Merge（Foreground）→ MediaOut
    別の背景素材 ─────────────────→ Merge（Background）

1. スクリーン素材をDelta KeyerのInputへ接続し、背景色をViewerから選びます。
2. Viewerでアルファを確認します。被写体内部が白、消したい背景が黒、髪などの縁が灰色になるのが確認の目安です。
3. 背景の色ムラが大きければ、**同じスクリーン素材をClean Plateにも分岐**させ、その出力をDelta KeyerのClean Plate入力へ接続します。Clean Plateは元の人物を切り抜いた画像をそのまま背景にするノードではなく、スクリーン色の参照画像を作るノードです。
4. 必要な場所にGarbage / Solid Matteを接続し、MatteやFringeの調整で被写体の内部、半透明の縁、色かぶりを確認します。
5. Delta Keyerの出力をMergeのForegroundへつなぎ、新しい背景上でも縁を確認します。アルファだけが正しく見えても、スクリーン色が髪や服の縁に残ることがあります。

キーイング後に別のマットを足したり、透明部分を縮小・拡大したりする場合は、後段の[Matte Control](./matte-control)に処理を分けます。

## 別の素材ではどう変わるか

### 背景だけの撮影素材がある場合

    被写体入り素材 → Difference Keyer（Foreground）
    被写体なし背景 → Difference Keyer（Background）

[Difference Keyer](./difference-keyer)は2枚の画像の差を利用します。カメラ位置や背景の細部が少し違うだけでも誤検出が出るため、最初から髪まで完全に抜けると考えず、**大まかなマットを作って他のマスクで補う**使い方を検討します。

### 人物・物体をクリックで選びたい場合

[Magic Mask](./magic-mask)では、残したい人物や物体を指定してマットを作ります。色の似た服と背景など、色指定だけでは分離しづらい素材で候補になります。選択後は輪郭やフレーム間の動きを確認し、必要ならマットの仕上げを調整します。21.1ではMagic Mask v2が既定で、旧版プロジェクト向けのLegacy切り替えもあります。

### 3Dレンダーから素材を分けたい場合

[Cryptomatte](./cryptomatte)では、Cryptomatte情報を含むEXRを入力し、Viewerやリストでオブジェクト／マテリアルIDを選びます。これは映像の見た目から被写体を認識する処理ではありません。EXRにIDが記録されていなければ、Cryptomatte側では復元できません。CryptomatteはFusion Studio限定です。

## マットを作った後の処理

- **[Matte Control](./matte-control)**：アルファを別画像から受け取る、縮小・拡大する、不要部分を消す、スクリーンの色かぶり（spill）を整えるときに使います。
- **[Alpha Divide](./alpha-divide) / [Alpha Multiply](./alpha-multiply)**：アルファでRGBを乗算した画像と、乗算前のRGBとの状態を切り替えます。マットを新しく認識・生成するノードではありません。半透明の縁で色補正を行う際、RGBとアルファの関係を確認するために使います。
- **[Clean Plate](./clean-plate)**：Delta Keyerへ渡すスクリーンの参照画像を作ります。完成した被写体マットを仕上げるノードではありません。

[Relight](./relight)は光の見え方を調整する処理で、通常の背景分離キーアとは目的が異なります。[Depth Map](../effects-film/depth-map)は深度情報から処理範囲を作る際の関連ノードですが、スクリーン色を抜く処理とは区別します。

## 結果が不自然なときに見る場所

| 症状 | 最初に確認すること |
| --- | --- |
| 被写体の内部が透ける | Viewerでアルファを表示し、背景色の選択、Solid Matte、MatteのThresholdを確認する |
| 髪やモーションブラーの縁が欠ける | 完全な白黒に潰しすぎていないかを確認し、Restore Fringeなどを検討する |
| 縁が緑／青に見える | アルファだけでなくRGBも確認し、KeyerのFringeやMatte Controlのspill調整を見る |
| Difference Keyerで背景の模様まで残る | 参照背景と被写体入り素材の位置・照明の差を確認し、必要なら補助マスクを使う |
| Cryptomatteで対象を選べない | 入力EXRに対象のIDとCryptomatte layerが含まれているか確認する |
| Merge後に半透明の縁だけ暗い／明るい | アルファ乗算の状態、Alpha Divide / Multiply、後段の合成設定を確認する |

## 出典と確認範囲

DaVinci Resolve **21.1 Reference Manual**, Chapter 109「Matte Nodes」pp.2504–2568を基に、Alpha Divide / Multiply、Clean Plate、Delta Keyer、Difference Keyer、Magic Mask、Matte Control、Primatte、Cryptomatteの選択基準と接続上の役割を整理しています。個々のInspector項目や端子の詳細は各ノード記事を参照してください。

このページは資料上の機能と推奨する組み合わせを説明したもので、Resolve 21.1実機でのREGID、端子表示、処理品質や速度を検証した結果ではありません。
