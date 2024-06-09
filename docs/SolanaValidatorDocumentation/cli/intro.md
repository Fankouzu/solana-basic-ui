# Solana CLI介绍

Before running any Solana CLI commands, let's go over some conventions that you will see across all commands. First, the Solana CLI is actually a collection of different commands for each action you might want to take. You can view the list of all possible commands by running:
在运行Solana CLI 命令之前，让我们先了解所有命令中的一些规则。首先，Solana CLI 实际上是一个针对每个您想执行的操作而设计的不同命令集合。您可以通过运行以下命令来查看所有的可能命令的列表：

```bash
solana --help
```



要深入了解如何使用特定命令，请运行以下命令：

```bash
solana <COMMAND> --help
```


将文本 `<COMMAND>` 替换为要了解详细信息的命令名称。

该命令的用法信息通常包含 `<AMOUNT>` 、 `<ACCOUNT_ADDRESS>` 或 `<KEYPAIR>` 等词。每个词都是您可以用来执行命令的文本类型的占位符。例如，您可以将 `42` 或 `100.42` 等数字替换 `<AMOUNT>` 为 。您可以用您公钥的 base58 编码（例如 `9grmKMwTiZwUHSExjtbFzHLPTdWoXgcg1bZkhvwTrTww` ）替换 `<ACCOUNT_ADDRESS>` .

## 密钥对约定

许多使用 CLI 工具的命令都需要 `<KEYPAIR>`。根据您创建的命令行骗保类型选择相应的密钥对值。
例如，CLI 帮助展示，显示任何钱包地址（也称为密钥对的公钥）的方式是：

```bash
solana-keygen pubkey <KEYPAIR>
```



Below, we show how to resolve what you should put in `<KEYPAIR>` depending on your wallet type.
下面，我们将展示如何根据您的钱包类型确定您应该在`<KEYPAIR>`中填写的内容。

## 纸钱包

In a paper wallet, the keypair is securely derived from the seed words and optional 
在纸质钱包中，密钥对是由您在创建钱包时输入的种子词和可选密码短语中安全地派生出来的。要在示例或帮助文档中显示 `<KEYPAIR>` 文本的任何位置使用纸钱包密钥对，请输入 uri 方案 `prompt://` ，程序将在您运行命令时提示您输入种子词。
要显示纸钱包的钱包地址：

```bash
solana-keygen pubkey prompt://
```

## 文件系统钱包


对于文件系统钱包，密钥对存储在您的计算机上的文件中。将`<KEYPAIR>` 替换为密钥对文件的完整文件路径。

例如，如果文件系统密钥对文件位置为 `/home/solana/my_wallet.json` ，要显示地址，请执行：

```bash
solana-keygen pubkey /home/solana/my_wallet.json
```

## 硬件钱包

如果您选择了硬件钱包，请使用您的密钥对 URL，例如 `usb://ledger?key=0` .

```bash
solana-keygen pubkey usb://ledger?key=0
```