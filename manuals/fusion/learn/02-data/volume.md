---
title: ボリューム（Volume / VDB）
description: FusionでVDBの密度・温度・フィールド・連番を扱う基礎と、uVolumeからUSDシーン、2D合成までの接続を説明する。
doc_type: concept
term_id: volume-data
term_short: Volumeは、煙や炎のように3D空間の各位置で密度などが変化するデータ。FusionではuVolumeでVDBをUSDシーンへ読み込む。
verification: partial
aliases: [Volume, VDB, volumetric data, ボリューム, ボリュームデータ]
concepts: [usd-scene, data-domain, time]
nodes: [uVolume, uMerge, uRenderer]
tasks: [usd, volume, vdb, smoke, fire, understand-domain]
prerequisites: [usd-scene]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-18"
---

# ボリューム（Volume / VDB）

煙や炎を3Dで扱うとき、輪郭のある立体を一つ作るだけでは、内部の濃さや場所ごとの変化を表しきれません。**ボリューム（Volume）は、空間の位置ごとに密度などの値を持たせるためのデータ**です。VDBは、そのような立体的な分布を保存するファイル形式として使われます。

たとえば煙なら、濃い部分と薄い部分が立体の内部に混在します。温度のデータも含まれていれば、高温の部分と低温の部分を別の分布として扱えます。ただし、**すべてのVDBに密度・温度の両方が入っているわけではありません**。ファイルごとに、含まれる情報を確かめる必要があります。

## 2D画像・ポリゴン・ボリュームの違い

| データ | 主に保持するもの | 例 |
| --- | --- | --- |
| **2D Image** | 平面上の画素ごとの色やAlpha | 撮影映像、煙を描いた2D素材 |
| **ポリゴン形状** | 立体の表面を構成する頂点や面 | 建物、車、球体 |
| **Volume / VDB** | 3D空間内で変わる密度や温度などの値 | 立ち上る煙、雲、爆発の内部 |

ボリュームは「表面を半透明にしたポリゴン」と同じ意味ではありません。密度などの分布を使って、内部の濃淡まで描画するためのデータです。一方、**VDBファイルだけで完成映像になるわけではありません**。Fusionではシーンへ取り込み、カメラから描画する工程が必要です。

## フィールド（Field）とは

**Fieldは、VDBの中で保存される値の分布**です。たとえば、煙の濃さを表す分布と、温度を表す分布では役割が異なります。「Fieldを選ぶ」とは、ファイルに含まれるどの分布を表現へ使うかを選ぶことです。

[uVolume](../../nodes/usd/uvolume)では、主に次の二つを分けて調整します。

- **DensityのScale**：煙の濃さなど、体積の密度を調整する値です。
- **EmissionのMode**：読み込んだボリュームの色や発光の表し方を選びます。

DaVinci Resolve 21.1ではEmissionに**Color / Field / Blackbody / Gradient**の四つのModeが記載されています。Colorは全体へ色を付け、Fieldは指定したEmission Fieldを使います。Blackbodyは温度に基づいて色と強度を決め、Gradientは指定したFieldの値に色を対応させます。

Blackbodyを選んだだけで、どんなVDBも炎として表示できるわけではありません。必要な温度情報が元ファイルにあるか、表示に使う設定が合っているかを確認します。また、21.1 Manualには**Colorを白に設定したVDBにはUSDライトが影響しない**という注意があります。一般のポリゴン材質と同じ照明反応を前提にしないでください。

## VDBから画像になるまで

Fusion 21.1では、**uVolumeがVDBファイルまたはVDB連番を読み込み、USDシーンとして後段へ渡します**。その段階では通常の2D画像ではありません。

```text
VDBファイル／連番 → uVolume ───────┐
USDモデル → uLoader ──────────────┤
uCamera ──────────────────────────┼→ uMerge → uRenderer → 2D Image
uDistant Light（必要に応じて） ────┘
```

[uMerge](../../nodes/usd/u-merge)は、煙、ほかの3Dモデル、カメラ、ライトを同じUSDシーンへまとめます。[uRenderer](../../nodes/usd/u-renderer)がそのシーンを2D画像へ描画します。通常の[Merge](../../nodes/compositing/merge)へ映像を重ねる場合は、**uRendererの後**に接続します。

このUSD経路と[Classic 3D](./classic-3d)のMerge 3D / Renderer 3D経路は別です。uVolumeの出力をClassic 3DのMerge 3Dや通常の2D Mergeへ直接つなぐ構成としては説明されていません。[USDシーンの基礎](./usd)も参照してください。

## 静止VDBと連番VDB

**単一のVDB**は、基本的にそのファイルに保存された一つの状態を読み込みます。**VDBシーケンス**は、時間ごとに保存した複数の状態を読み込む方法です。たとえば、爆発の形がフレームごとに変化する素材に使います。

uVolumeは読み込んだシーケンスの**Trim、Loop、再生速度の変更**に対応します。ただし、これは既存のデータをどの時間に表示するかを調整する処理です。新しい流体シミュレーションを実行したり、物理的に正しい中間フレームを生成したりする機能と混同しないでください。個々の時間パラメータの正確な名称や補間方法は、21.1 ManualのuVolume節だけでは確定できません。

## 制作例：実写の建物から煙を出す

1. 実写をMediaInへ入れ、3D側では建物などの位置合わせに必要なUSDモデルを[uLoader](../../nodes/usd/uloader)で読み込みます。
2. [uVolume](../../nodes/usd/uvolume)で煙のVDBシーケンスを指定します。煙の大きさと位置は**Transform**で合わせます。
3. uCameraと必要なUSDライトを追加し、uLoaderとuVolumeも含めてuMergeへつなぎます。
4. uRendererで画像にし、実写をBackground、レンダリング結果をForegroundとして通常のMergeで合成します。
5. **DensityのScale**で煙の濃さ、**EmissionのMode**で色の付け方を調整し、開始フレーム・速度・Loopの継ぎ目を確認します。

最初は煙がカメラの視野に入るかを確認し、その後で密度や色を調整します。Transformにある**立体のScale**と、Densityの**濃さのScale**は目的が異なります。煙が映らない原因が位置なのか濃さなのかを切り分けられます。

この手順はManualの機能を組み合わせた**構成例**です。個々のVDBのフィールド互換性、実写との深度遮蔽や照明の一致、21.1実機での最終描画は別途確認が必要です。

## 関連する説明

- [uVolume](../../nodes/usd/uvolume)：ファイル選択、EmissionのMode、時間・Transformの操作。
- [USDシーン](./usd)：uMerge、uCamera、uRendererの役割。
- [USDノード一覧](../../nodes/usd/)：材質・カメラ・ライトを含むUSDノードの選び方。

## 出典・確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 121「USD Nodes」**pp.2928–2929**（uVolumeのVDB読み込み、単一ファイル・連番、Trim / Loop / 速度、Density、Emission、Transform、白いColorとUSDライトの注意）および**p.2887**（uLoader → uMerge → uRendererのUSD描画経路）。公式配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

本記事は21.1 Manualの動作説明と制作上の基本概念をまとめたものです。VDBのフィールド命名、すべてのInspector項目と初期値、Edition差、実機での描画結果は未確認のため`verification: partial`としています。
