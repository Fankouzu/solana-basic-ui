# 使用命令行的文件系统钱包

本文档介绍如何使用 Solana 命令行工具创建和使用文件系统钱包。文件系统钱包以未加密的密钥对文件形式存在于您计算机的文件系统中。

> 文件系统钱包是存储 SOL 代币最不安全的方法。不建议在文件系统钱包中存储大量代币。


## 开始之前

确保您[已安装Solana命令行工具](https://docs.solanalabs.com/cli/install)

## 生成文件系统钱包密钥对

使用 Solana 命令行工具 `solana-keygen` 来生成密钥对文件。例如，从命令行shell以运行下面的命令：

```
mkdir ~/my-solana-wallet
solana-keygen new --outfile ~/my-solana-wallet/my-keypair.json
```

这个文件包含了您的未加密的密钥对。实际上，即便您指定了密码，该密码也适用于恢复助记词，而不是文件本身。不要与任何人分享这个文件。任何能够访问此文件的人都能访问发送到其公钥的代币。相反，您应该仅分享其的公钥。要显示公钥，请运行：

```
solana-keygen pubkey ~/my-solana-wallet/my-keypair.json
```

它将输出一串字符串，例如：
```
ErRr1caKzK8L8nn4xmEWtimYRiTCAZXjBtVphuZ5vMKy
```

这是对应在 `~/my-solana-wallet/my-keypair.json` 中密钥对的公钥。密钥对文件的公钥就是您的钱包地址。

## 验证您的地址与密钥对文件的一致性

要验证您持有给定地址的私钥，请使用 `solana-keygen verify` ：

```
solana-keygen verify <PUBKEY> ~/my-solana-wallet/my-keypair.json
```

其中 `<PUBKEY>` 应替换为您的钱包地址。如果给定地址与您密钥对文件中的地址匹配，命令将输出"Success"，否则输出"Failed"。

## 创建多个文件系统钱包

如需要，您可以创建任意多个钱包地址。只需重新执行[生成文件系统钱包](https://docs.solanalabs.com/cli/wallets/file-system#generate-a-file-system-wallet-keypair)中的步骤，并确保使用 `--outfile` 参数指定一个新的文件名或路径。如果您想出于不同目的在自己的账户中转移代币，拥有多个钱包会非常有用。

 