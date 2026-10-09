---
title: "Run Command"
description: "renderの開始・終了・各frame完了時に、外部コマンドやscriptを実行するFusion Node。"
doc_type: node
term_id: "run-command"
term_short: "Run Commandは、renderの特定タイミングで外部コマンドやscriptを実行し、保存後処理や外部tool連携を組み込むNode。"
verification: partial
aliases: ["Run Command", "Run"]
concepts: ["image-data"]
nodes: ["Run Command"]
node_family: "time-metadata"
controls: ["Hide", "Wait", "Frame Command", "Interactive", "Number A", "Number B"]
inputs: ["image"]
outputs: ["image"]
tasks: ["automation", "render-pipeline", "external-command"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Run Command

Run Command [Run]は、Fusionのrenderに合わせて外部コマンド、batch file、script、command-line toolを実行するNodeです。処理を走らせるタイミングは、render開始時、render終了時、または各frameのrender後から選べます。

Imageの見た目を加工するNodeではありません。Saverで書き出したfileを別の処理へ渡すなど、render pipelineの自動化に使います。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualでは、次の2D Image接続が記載されています。

- **Input**（orange）: 任意。2D Imageをpass-throughする入力です。接続しなくてもRun Command自体は動作します。
- **Output**: 接続した2D Imageを後段へ渡します。

Inputを接続した場合、Run Commandは接続元Nodeのrenderが完了してから外部コマンドを起動します。

この順序が重要なのがSaverとの組み合わせです。

```text
Image → Saver → Run Command
```

Saverの後ろへRun Commandを置くと、そのframeの保存が終わった後にFrame Commandを実行できます。保存中のfileを外部toolが先に処理しない構成にしたいときに使えます。

Manualでは、起動したapplicationがnon-zero resultを返した場合、Run Command Nodeもfailすると説明されています。

## 実行タイミング

Run Commandには、用途の異なる3つの実行タイミングがあります。

### Frame

各frameのrender後にコマンドを実行します。連番fileを1枚ずつ後処理するような用途向けです。

### Start

compositionのrender開始時にコマンドを実行します。render前の準備処理を外部scriptへ任せたい場合に使えます。

### End

compositionのrender完了時にコマンドを実行します。全frameのrender完了後に行いたい後処理をまとめる用途に向きます。

Start / End tabについて、21.1 Manualはそれぞれrender開始時・完了時に実行するcommandをfile browserで指定すると説明しています。このページでは、Manualに明記されていない追加Control名は推測していません。

## Frame tab

### Hide

有効にすると、実行したapplicationやscriptのwindowを表示しないようにします。

### Wait

有効にすると、起動したapplicationやtoolが終了するまでRun Commandが待機します。無効の場合、Fusionは外部applicationの終了を待たずrenderを続行します。

次のframeへ進む前に外部処理が完了している必要がある場合はWaitを使います。

### Frame Command

各frameのrender後に実行するcommandのpathやcommand lineを指定します。ManualではBrowse buttonからpathを指定できると説明されています。

### Interactive

有効にすると、起動したapplicationをinteractiveに実行し、ユーザー入力を受け取れるようにします。

無人renderやbatch処理では、外部application側が入力待ちにならない構成かも確認してください。

### Number A / Number B

Frame Command内では次のwildcardを使えます。

- `%a`: Number Aの値
- `%b`: Number Bの値
- `%t`: 現在のframe番号
- `%s`: text entry fieldの文字列

render時にwildcardが実際の値へ置き換えられます。

## frame番号をzero paddingする

`%t`はそのままではzero paddingされません。21.1 Manualでは、桁数を付けたwildcardでzero paddingできると説明されています。

4桁のframe番号なら、次のように記述します。

```text
test%04t.tga
```

render時には`test0000.tga`、`test0001.tga`、`test0009.tga`、`test0010.tga`のような名前になります。同じpadding指定は`%a`と`%b`にも使えます。

## 具体的な使い方

### Saverで保存したframeを外部処理へ渡す

代表的な構成は次のとおりです。

```text
Image
  ↓
Saver
  ↓
Run Command
```

1. Saverで連番fileを書き出す。
2. Run CommandをSaverの後ろへ接続する。
3. Frame Commandへ外部scriptやtoolのcommandを設定する。
4. 必要なら`%t`を使って現在frameを識別する。
5. 外部処理の完了を待つ必要がある場合はWaitを有効にする。

Manualでは、保存した各frameのcopy、FTP転送、print、custom image-processing toolの実行などが用途として挙げられています。

### render全体の前後に処理を入れる

frameごとではなくrender session全体の前後に処理したい場合は、Start / Endを使います。

```text
Start command
    ↓
Fusion render
    ↓
End command
```

毎frame実行する必要がない初期化や完了後処理をFrame Commandへ入れず、実行回数を分けられます。

## 実行対象

Run Commandは単純なbatch fileだけに限定されません。21.1 Manualでは例としてFusionScript、VBScript、JScript、CGI、Perl fileも挙げられています。

実際に起動できるcommand / interpreter / scriptは、Resolveを実行しているOSと環境に依存します。path、quoting、権限、利用可能なinterpreterは対象環境で確認してください。

## 注意点

- Run Commandは外部processを起動します。実行内容と対象pathを確認してからrenderします。
- Inputは任意です。画像処理が目的ではなく、render順序へ外部commandを組み込むためのNodeです。
- Saverの出力fileへ依存する処理は、Saverの後ろへ接続して保存完了との順序を明確にします。
- Waitを有効にすると外部processの終了を待つため、そのprocessが終了しない限りrenderも先へ進みません。
- Start / Frame / Endで実行回数が変わります。1回だけでよい処理をFrameへ置かないようにします。
- command pathやshellの書式はplatform依存です。対象環境のpath / command syntaxへ合わせます。
- runtime REGID、Effects Library上のcurrent表示、edition差、各platformでのshell起動方法は、このページの確認範囲では断定していません。

## 関連

- [Time / Metadata / Utility Family Overview](./index.md)
- Saver: Image sequenceやmovieを書き出した後の処理をRun Commandへ接続する代表的な組み合わせ。
- [Wireless Link](./wireless-link.md): cableを引かずに2D Imageを参照するNodeで、外部process実行とは役割が異なる。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 111「Miscellaneous Nodes」の`Run Command [Run]`（pp.2599–2602）を基準にしています。

確認した項目は、render開始 / 終了 / 各frame後のcommand実行、任意のorange 2D Image input、upstream render完了後にcommandを起動する順序、non-zero result時のfailure、`Hide`、`Wait`、`Frame Command`、`Interactive`、`Number A` / `Number B`、`%a` / `%b` / `%t` / `%s` wildcard、zero padding、Start / End tab、Saver後へ置く基本構成です。

runtime REGID、Effects Library上のcurrent表示、edition差、platform別のshell / interpreter挙動は別verification対象として残しているため、`verification: partial`を維持しています。
