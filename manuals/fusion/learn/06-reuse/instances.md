---
title: Instanceで設定を共有する
description: 同じNode設定を複数分岐で共有し、必要なパラメータだけ独立させる考え方。
doc_type: concept
verification: partial
aliases: [Instance, Paste Instance, Deinstance]
concepts: [instancing, shared-parameters, reuse]
tasks: [reuse, synchronize, branch]
prerequisites: [parameter-data, node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Instanceで設定を共有する

## このページで分かること

同じ種類のNodeを複数箇所で使いながら、設定変更を同期する方法と単純なcopyの違いを整理します。

## 基本の考え方

Instanceは、**Graph上では別の場所に置けるNode同士が、パラメータ設定を共有する関係**です。

```text
original node
  ├─ shared settings → instance A
  └─ shared settings → instance B
```

通常のcopyはその時点の値を複製します。Instanceは、その後の設定変更も共有する前提で使います。

Fusion 18.6の公式Manualでは、Paste Instanceで作成したNodeは元Nodeとsettingsを共有し、変更がoriginalと他instanceへ反映されると説明されています。また、Node全体ではなく個別パラメータだけをDeinstance / Reinstanceできる操作も記載されています。21.1での正確なUI表記は再確認対象です。

## 最小例

同じBlur設定を2つの分岐で使う状況を考えます。

```text
Image A → Blur original ─┐
                         ├─ downstream
Image B → Blur instance ─┘
```

Blur量を1箇所で変えたとき、両方へ同じ調整を保ちたいならInstanceが候補になります。

## 共通ルール

- Graph上の配置とパラメータの管理関係は別の問題。
- Instanceは「同じNodeが1個しかない」のではなく、複数Nodeが共有設定を持つ関係として読む。
- 独立させたいパラメータだけを切り離せる場合がある。
- 接続関係まで同一になるとは考えず、各分岐の入出力はGraphとして個別に読む。

## 1つずつ変えて確認する

1つのパラメータだけをDeinstanceし、他のパラメータは共有したままにします。

「何を共有し、何を個別にするか」が明示できれば、Instanceを単なる便利copyではなく管理関係の仕組みとして扱えます。

## 他のNodeにも応用する

### Repeated effects

複数素材へ同じ補正を与えたい場合、同じ値を手入力する代わりに共有設定を検討できます。

### 配置 variants

共通見た目は共有し、positionだけ個別化するような構成へ応用できます。

### 診断

意図せず複数Nodeが同時に変わる場合は、ExpressionだけでなくInstance関係も確認します。

## 初見のNodeを読む

複数Nodeに似た値があるとき、次を判断できます。

1. これは偶然同じ値なのか。
2. 常に同期すべき関係なのか。
3. 一部パラメータだけ独立させる必要があるか。
4. InstanceよりMacro / Group / User Controlの方が責任に合うか。

## よくある誤解

**Instance = copyを少し便利にしたもの**とだけ考えること。

本質は、複数のGraph位置にあるNodeへ共有パラメータの管理関係を作ることです。再利用単位が複数Nodeの構造そのものなら、Group / Macro側を検討します。

## 関連パターン

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## 関連Node

Instanceは特定NodeではなくNode Editor上の再利用機構です。

## 次に読む

→ [User Controlsで公開インターフェースを作る](./user-controls)

---

検証メモ: Instanceの共有settings、Deinstance、パラメータ単位のDeinstance/ReinstanceはBlackmagic Design公式Fusion 18.6 Manualで確認。Fusion 21.1でのmenu label・shortcut・例外は未確認です。
