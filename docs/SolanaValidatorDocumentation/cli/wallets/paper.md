# 使用Solana命令界面（CLI）的纸质钱包

本文档将描述如何使用 Solana CLI 工具来创建并使用纸质钱包。

> 我们无意提供关于如何安全地创建或管理纸质钱包的建议。请仔细地研究相关安全方面的问题。


## 概览

Solana提供了一个密钥生成工具，可以从 [BIP39标准](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) 的助记词派生密钥。运行验证节点和质押代币等 Solana CLI 命令均支持通过助记词输入密钥对。

## 纸质钱包的使用

Solana 命令可以在不将密钥对保存到机器磁盘的情况下运行。如果避免将私钥写入磁盘中是您的安全顾虑之一，那么您来对了地方。

> 即便使用了这种安全的输入方式，私钥仍有可能因为未加密的内存交换而被写入磁盘中。防止此类情况的发生是用户的责任。


## 在您使用之前

+ [安装 Solana 命令行工具](https://docs.solanalabs.com/cli/install)


### 检查您的安装

通过运行下面的代码来检查 `solana-keygen` 是否正确安装

```
solana-keygen --version
```

## 创建纸质钱包

使用 `solana-keygen` 工具，可以生成新的助记词以及从现有助记词和（可选）密码短语派生密钥对。助记词与密码短语可以一起用作纸质钱包。只要您安全地保管您的助记词和密码短语，您就可以通过它们连接到您的账户。

> 关于助记词如何运行的更多信息，请参阅此[比特币维基页面](https://en.bitcoin.it/wiki/Seed_phrase)。


### 助记词生成

可以通过 `solana-keygen new` 命令来生成一个新的密钥对。此命令会生成随机的助记词，并要求您输入一个可选的密码短语，随后就会显示为纸质钱包生成的派生公钥与助记词。

复制下助记词后，您可以使用公钥派生说明来确认是否没有犯任何错误。

```
solana-keygen new --no-outfile
```

> 如果省略了`--no-outfile`标志，其默认行为是将密钥对写入`~/.config/solana/id.json`，从而变成创建一个文件系统钱包。


这行代码的输出会显示类似这样的一行：

```
pubkey: 9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b
```

跟在 `pubkey` 后面的值就是您的钱包地址。

**注意：**在处理纸质钱包和文件系统钱包时， “pubkey”和“钱包地址”这两个术语有时可以互换使用。

> 为了增加安全性，可以使用`--word-count`来增加助记词的单词数量。


要获取完整使用详情，请运行：

```
solana-keygen new --help
```

### 公钥派生

如果您选择使用的话，公钥可以从助记词和密码短语中派生出来。这对于使用离线生成的助记词来派生一个有效的公钥十分有用。 `solana-keygen pubkey` 命令将引导您如何使用助记词（以及您选择使用的密码短语）作为签名者，通过 `prompt` URI方案与 Solana 命令行工具一起使用。

```
solana-keygen pubkey prompt://
```

> 请注意，对于不同的助记词您可能潜意识下使用不通过的密钥短语。每个唯一的密钥短语将产生不同的密钥对。

 `solana-keygen` 工具使用与生成助记词相同的BIP39标准英文单词列表。如果您的助记词是通过其他使用了不同单词列表的工具生成的，您依然可以使用 `solana-keygen` ，但是需要传递 `--skip-seed-phrase-validation` 参数并跳过这一验证步骤。

```
solana-keygen pubkey prompt:// --skip-seed-phrase-validation
```

在您使用 `solana-keygen pubkey prompt://` 输入了您的助记词后，控制台将会一串 base-58 字符。这是与你的助记词关联的[派生](https://docs.solanalabs.com/cli/wallets/paper#hierarchical-derivation) Solana BIP44 钱包地址。

> 将派生的地址复制到U盘上，以便在联网的计算机上轻松使用。


如有需要，您可以通过传递 `ASK` 关键字来访问旧式的、原始密钥对的公钥：

```
solana-keygen pubkey ASK
```

>接下来的一个常见步骤是[检查与公钥关联的账户余额](https://docs.solanalabs.com/cli/wallets/paper#checking-account-balance)。


要获取完整使用详情，请运行：

```
solana-keygen pubkey --help
```

### 层次化派生

 Solana 命令行界面通过添加 `?key=` 查询字符串或 `?full-path=` 查询字符串，支持从您的助记词和密码短语中基于 [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) 和 [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) 层次化派生私钥。

默认来说， `prompt:` 将派生 Solana 的基础派生路径 `m/44'/501'` 。要派生一个子密钥，需提供 `?key=<ACCOUNT>/<CHANGE>` 查询字符串。

```
solana-keygen pubkey prompt://?key=0/1
```

若要使用非 Solana 标准 BIP44 的派生路径，您可以提供 `?full-path=m/<PURPOSE>/<COIN_TYPE>/<ACCOUNT>/<CHANGE>` 。

```
solana-keygen pubkey prompt://?full-path=m/44/2017/0/1
```

由于 Solana 使用 ed25519 密钥对，根据 [SLIP-0010](https://github.com/satoshilabs/slips/blob/master/slip-0010.md) ，所有派生路径索引都将提升为硬化索引——例如， `?key=0'/0' `，`?full-path=m/44'/2017'/0'/1'` ——无论查询字符串输入中是否包含斜杠。

## 验证密钥对

要验证您控制的是纸质钱包地址的私钥，请使用 `solana-keygen verify` ：

```
solana-keygen verify <PUBKEY> prompt://
```

其中 `<PUBKEY>` 替换为钱包地址，关键词 `prompt://` 告诉命令行提示您输入密码对的助记词；接受 `key` 和 `full-path` 查询字符串。请注意，处于安全考虑，您在输入助记词时并不会显示出来。输入助记词后，如果给定的公钥与从您的助记词生成的密钥匹配，命令将输出"Success"，否则输出"Failed"。

## 检查账户余额

检查账户余额所需要的时账户的公钥。为了从纸质钱包中安全地检索公钥，请在[无网络连接的计算机](https://en.wikipedia.org/wiki/Air_gap_(networking))上遵循[公钥派生说明](https://docs.solanalabs.com/cli/wallets/paper#public-key-derivation)。公钥可以手动输入或者可以通过U盘来传输到联网的机器上。

接下来，配置`solana`CLI命令行工具以[连接到特定的集群](https://docs.solanalabs.com/cli/examples/choose-a-cluster)：

```
solana config set --url <CLUSTER URL> # (i.e. https://api.mainnet-beta.solana.com)
```

最后，检查账户余额，运行下列指令：

```
solana balance <PUBKEY>
```

## 创建多个纸质钱包地址

如果需要，您可以创建多个钱包地址。只需重新执行[助记词生成](https://docs.solanalabs.com/cli/wallets/paper#seed-phrase-generation)和[公钥生成](https://docs.solanalabs.com/cli/wallets/paper#public-key-derivation)去创建新地址。如果您希望处于不同目的在自己的不同账户间转移代币，拥有多个钱包会很有用。

## 支持与帮助

您可以在 [Solana StackExchange](https://solana.stackexchange.com/) 上找到更多的支持和帮助。