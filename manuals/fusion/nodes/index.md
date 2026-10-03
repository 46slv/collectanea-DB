---
title: ノードリファレンス（Node Reference）
description: Fusionのノードと関連要素を、役割・入出力・設定・用途から探す。Manual確認と実機確認を区別する。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, inspect-controls]
updated: '2026-10-03'
---

# ノードリファレンス（Node Reference）

Fusionで使うノードと関連要素を、何を受け取り、何を返し、どの場面で使うかから確認するためのリファレンスです。名前から探す場合は[ノードA–Z](../index/node-a-z)を使ってください。

## 掲載範囲

21.0.4基準の357項目とMediaIn・MediaOutによる従来の359ページに、21.1 Manualで確認した25項目と、公式発表で確認したConnect 3Dを追加しています。合計は385のノード・関連要素ページです。カテゴリの案内ページはこの数に含めません。

この数は「21.1のAdd Toolに出るノード数」ではありません。ModifierとPaint内部要素を含み、実機のTool registryとはまだ照合していません。Resolve FX・OpenFX・利用者が追加したFuse、Macro、Template、Reactorの収録内容も、この固定件数には含めていません。

## 21.1 Manualから追記した内容

[Krokodoveの案内](./krokodove/)では、Shapeの生成・輪郭加工、3D生成、Regionによる作用範囲の指定を分けています。Chapter 105の85記名項目には参照先を揃えましたが、全項目の詳細な操作確認が完了したわけではありません。

[OpenPBR](./materials-lights/openpbr)は複数のテクスチャを材質へまとめるノードです。Manualの入力メニューと構成図、主な設定を記述しています。[sChangeStyle](./shapes/schangestyle)も追加し、既存[sOffset](./shapes/soffset)の曖昧な説明と導入版の断定を修正しました。

## 各ページの読み方

役割、扱うデータ、入力と出力、設定、使う場面、類似ノードとの違いを確認します。記述できる深さは出典により異なります。

「構成案」「確認案」と記載した例は、確認できた役割を組み合わせた提案です。「Manualの構成例」は公式資料の図・説明に基づきます。どちらも、本リポジトリで実機追試した結果と混同しないでください。

## 未完了の確認

21.1 Manual全体と従来カタログの照合では、Krokodove以外にも未照合の名称が見つかっています。資料の見出し、同名別機能、別表記を整理してから追加する必要があります。したがって「21.1全ノード網羅完了」とはしていません。

正確なREGID、端子、初期値、範囲、Edition差、実機に登録されたツールの全件一致は、別の確認段階です。`partial`は、資料で確認した内容があっても、重要な未確認項目が残ることを示します。
