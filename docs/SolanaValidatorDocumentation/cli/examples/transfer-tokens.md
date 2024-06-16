# 使用 Solana CLI 发送与接收代币

本页说明如何使用命令行工具（如[纸质钱包](https://docs.solanalabs.com/cli/wallets/paper)、[文件系统钱包](https://docs.solanalabs.com/cli/wallets/file-system)或[硬件钱包](https://docs.solanalabs.com/cli/wallets/hardware/)）接收和发送 SOL 代币。在开始之前，请确保您已创建一个钱包并有访问其地址（公钥）和签名密钥对的权限。查看我们[关于不同类型钱包的密钥对输入规范](https://docs.solanalabs.com/cli/intro#keypair-conventions)。

## 测试你的钱包

在与别人分享公钥以前，您可能想要验证一下该密钥有效，并且您确实拥有相应的私钥。

在本示例中，我们将在您的第一个钱包之外创建第二个钱包，然后将一些代币转移到该钱包。这将确认您可以在选择的钱包类型上发送和接收代币。。

此测试示例使用我们的开发测试网，称为开发网（devnet）。开发网上发行的代币没有价值，所以如果丢失了也不用担心。

### **从空投一些代币以开始**

首先，在 开发网上给自己*空投*一些测试代币。

```shell
solana airdrop 1 <RECIPIENT_ACCOUNT_ADDRESS> --url https://api.devnet.solana.com
```

将 `<RECIPIENT_ACCOUNT_ADDRESS>` 替换为您的 base58 编码的公钥/钱包地址。

将返回一个包含交易签名的响应。如果地址的余额没有按预期变化，请运行以下命令以获取可能出错的更多信息：

```shell
solana confirm -v <TRANSACTION_SIGNATURE>
```

### **检查您的余额**

通过检查账户余额确认空投成功。输出应为 `1 SOL`：

```bash
solana balance <ACCOUNT_ADDRESS> --url https://api.devnet.solana.com
```

### **创建第二个钱包地址**

我们需要一个新的地址来接收我们的代币。创建第二个密钥对并记录其公钥：：

```shell
solana-keygen new --no-passphrase --no-outfile
```

输出将在文本 `pubkey:` 后包含地址。复制该地址。我们将在下一步中使用它。

```shell
pubkey: GKvqsuNcnwWqPzzuhLmGi4rzzh55FhJtGizkhHaEJqiV
```

您也可以以任何形式（如[纸质钱包](https://docs.solanalabs.com/cli/wallets/paper#creating-multiple-paper-wallet-addresses)、[文件系统钱包](https://docs.solanalabs.com/cli/wallets/file-system#creating-multiple-file-system-wallet-addresses)或者[硬件钱包](https://docs.solanalabs.com/cli/wallets/hardware/#multiple-addresses-on-a-single-hardware-wallet)）创建第二个（或更多的）钱包。

### **用第一个钱包中向第二个钱包转账**

接下来，通过转移代币证明您拥有空投的代币。Solana 集群只有在您使用与交易中的发送方公钥相对应的私钥对签名时，才会接受转移。

```shell
solana transfer --from <KEYPAIR> <RECIPIENT_ACCOUNT_ADDRESS> 0.5 --allow-unfunded-recipient --url https://api.devnet.solana.com --fee-payer <KEYPAIR>
```

将 `<KEYPAIR>` 替换为第一个钱包中密钥对的路径，并将 `<RECIPIENT_ACCOUNT_ADDRESS>` 替换为第二个钱包的地址。

使用 `solana balance` 确认更新后的余额：

```shell
solana balance <ACCOUNT_ADDRESS> --url http://api.devnet.solana.com
```

其中 `<ACCOUNT_ADDRESS>` 是您的密钥对公钥或接收者的公钥。

### **转移代币的完整测试示例**

```shell
$ solana-keygen new --outfile my_solana_wallet.json   # Creating my first wallet, a file system wallet
Generating a new keypair
For added security, enter a passphrase (empty for no passphrase):
Wrote new keypair to my_solana_wallet.json
==========================================================================
pubkey: DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK                          # Here is the address of the first wallet
==========================================================================
Save this seed phrase to recover your new keypair:
width enhance concert vacant ketchup eternal spy craft spy guard tag punch    # If this was a real wallet, never share these words on the internet like this!
==========================================================================

$ solana airdrop 1 DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK --url https://api.devnet.solana.com  # Airdropping 1 SOL to my wallet's address/pubkey
Requesting airdrop of 1 SOL from 35.233.193.70:9900
1 SOL

$ solana balance DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK --url https://api.devnet.solana.com # Check the address's balance
1 SOL

$ solana-keygen new --no-outfile  # Creating a second wallet, a paper wallet
Generating a new keypair
For added security, enter a passphrase (empty for no passphrase):
====================================================================
pubkey: 7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv                   # Here is the address of the second, paper, wallet.
====================================================================
Save this seed phrase to recover your new keypair:
clump panic cousin hurt coast charge engage fall eager urge win love   # If this was a real wallet, never share these words on the internet like this!
====================================================================

$ solana transfer --from my_solana_wallet.json 7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv 0.5 --allow-unfunded-recipient --url https://api.devnet.solana.com --fee-payer my_solana_wallet.json  # Transferring tokens to the public address of the paper wallet
3gmXvykAd1nCQQ7MjosaHLf69Xyaqyq1qw2eu1mgPyYXd5G4v1rihhg1CiRw35b9fHzcftGKKEu4mbUeXY2pEX2z  # This is the transaction signature

$ solana balance DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK --url https://api.devnet.solana.com
0.499995 SOL  # The sending account has slightly less than 0.5 SOL remaining due to the 0.000005 SOL transaction fee payment

$ solana balance 7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv --url https://api.devnet.solana.com
0.5 SOL  # The second wallet has now received the 0.5 SOL transfer from the first wallet

```

## 接收代币

要接收代币，您需要一个地址供他人发送代币。在 Solana 中，钱包地址是密钥对的公钥。生成密钥对的方法多种多样。您选择的方法将取决于如何存储密钥对。密钥对存储在钱包中。接收代币之前，您需要[创建一个钱包](https://docs.solanalabs.com/cli/wallets/)。完成后，您应该为每个生成的密钥对获得一个公钥。公钥是一个长的 base58 字符串，其长度从 32 到 44 个字符不等。

## 发送代币

如果您已经持有 SOL 并希望向他人发送代币，您将需要密钥对的路径、对方的 base58 编码公钥和转账金额。收集这些信息后，您可以使用 `solana transfer` 命令转账：

```shell
solana transfer --from <KEYPAIR> <RECIPIENT_ACCOUNT_ADDRESS> <AMOUNT> --fee-payer <KEYPAIR>
```

通过 `solana balance` 来检查更新后的余额：

``` shell
solana balance <ACCOUNT_ADDRESS>
```
