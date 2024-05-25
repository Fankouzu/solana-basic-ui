# 使用 Solana CLI 发送和接收代币


本页面介绍如何使用命令行工具在命令行钱包（如纸钱包、文件系统钱包或硬件钱包）中接收和发送SOL代币。在开始之前，请确保已创建钱包并可以访问其地址（公钥）和签名密钥对。

## 测试你的钱包


首先，在开发网络上空投给自己一些游戏代币。

```
solana airdrop 1 <RECIPIENT_ACCOUNT_ADDRESS> --url https://api.devnet.solana.com
```

将 <RECIPIENT_ACCOUNT_ADDRESS> 替换为您的 base58 编码 公钥/钱包地址。

返回带有交易签名。如果地址的余额未变，请运行以下命令以获取可能出错的更多信息：
```
solana confirm -v <TRANSACTION_SIGNATURE>
```

### 检查您的余额
请通过检查账户余额来确认空投是否成功。余额应显示为1 SOL。
```
solana balance <ACCOUNT_ADDRESS> --url https://api.devnet.solana.com
```

### 创建第二个钱包地址

我们需要一个新地址来接收我们的代币。创建第二个密钥对并记录其公钥：

```
solana-keygen new --no-passphrase --no-outfile
```


输出将包含文本 pubkey: 后面的地址。复制 地址。我们将在下一步中使用它。

```
pubkey: GKvqsuNcnwWqPzzuhLmGi4rzzh55FhJtGizkhHaEJqiV
```

### 将代币从您的第一个钱包转移到第二个地址

接下来，通过转移空投的代币来证明您拥有这些代币。只有当您使用与交易中发送者公钥对应的私钥对交易进行签名时，Solana集群才会接受转账。

```
solana transfer --from <KEYPAIR> <RECIPIENT_ACCOUNT_ADDRESS> 0.5 --allow-unfunded-recipient --url https://api.devnet.solana.com --fee-payer <KEYPAIR>
```

确认更新后的余额：
```
solana balance <ACCOUNT_ADDRESS> --url http://api.devnet.solana.com
```

其中 <ACCOUNT_ADDRESS> 是您的密钥对中的公钥或接收者的公钥。


### 测试转账的完整示例

```
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








