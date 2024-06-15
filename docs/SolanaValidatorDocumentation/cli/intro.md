# Solana CLI介绍

在运行任何 Solana CLI 命令之前，让我们了解一下在所有命令中会看到的一些约定。首先，Solana CLI 实际上是为每个您可能想执行的操作提供的一组不同命令。您可以通过运行以下命令查看所有可能命令的列表：

```bash
solana --help
```

要详细了解如何使用特定命令，请运行：

```bash
solana <COMMAND> --help
```


将文本 `<COMMAND>` 替换为要了解详细信息的命令名称。

该命令的用法信息通常包含 `<AMOUNT>` 、 `<ACCOUNT_ADDRESS>` 或 `<KEYPAIR>` 等词。每个词都是您可以用来执行命令的文本类型的占位符。例如，您可以将 `42` 或 `100.42` 等数字替换 `<AMOUNT>` 为 。您可以用您公钥的 base58 编码（例如 `9grmKMwTiZwUHSExjtbFzHLPTdWoXgcg1bZkhvwTrTww` ）替换 `<ACCOUNT_ADDRESS>` 

## 密钥对的规定

使用 CLI 工具的许多命令需要提供 `<KEYPAIR>` 的值。您应该为 `<KEYPAIR>` 使用的值取决于[您创建的命令行钱包 ](https://docs.solanalabs.com/cli/wallets/)的类型。

例如，CLI 帮助显示显示任何钱包地址（也称为 keypair 的公钥）的方式是：

```bash
solana-keygen pubkey <KEYPAIR>
```

下面，我们展示了根据您的钱包类型应如何在 `<KEYPAIR>` 中填写内容。

## 纸钱包

在纸钱包中，keypair 是从创建钱包时输入的种子词和可选密码短语中安全派生的。要在示例或帮助文档中使用 `<KEYPAIR>` 文本时使用纸钱包 keypair，请输入 `prompt://` 方案，并且程序将在您运行命令时提示您输入种子词。
要显示纸钱包的钱包地址：

```bash
solana-keygen pubkey prompt://
```

## 文件系统钱包


对于文件系统钱包，密钥对存储在您的计算机上的文件中。将`<KEYPAIR>` 替换为密钥对（keypair）文件的完整文件路径。

例如，如果文件系统密钥对文件位置为 `/home/solana/my_wallet.json` ，要显示地址请执行命令：

```bash
solana-keygen pubkey /home/solana/my_wallet.json
```

## 硬件钱包

如果您选择了硬件钱包，请使用您的密钥对 URL，例如 `usb://ledger?key=0` .

```bash
solana-keygen pubkey usb://ledger?key=0
```

