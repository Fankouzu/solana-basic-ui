# 使用 Solana CLI 质押 SOL

接收到 SOL 后，你可以考虑将其用于委托给验证者。Stake 是我们在 stake 账户中称为的代币。Solana 通过委托给验证者的 stake 数量来权衡验证者的投票权，从而使这些验证者在确定区块链中下一个有效交易块时具有更多的影响力。Solana 然后定期生成新的 SOL 以奖励委托者和验证者。你委托的 stake 越多，就可以获得更多的奖励。

## 创建质押账户


如果您想委托质押, 您需要两步操作: 

1. 您需要将一些token转入stake账户。 
2. 要创建stake帐户，您将需要密钥对, 公钥将作为stake账户的地址。 这里不需要密码或加密；创建完之后, 这个密钥对就会被丢弃.

#### 第一步: 生成密钥对
```
solana-keygen new --no-passphrase -o stake-account.json
```

输出公钥(stake账户地址):

```
pubkey: GKvqsuNcnwWqPzzuhLmGi4rzzh55FhJtGizkhHaEJqiV
```

复制公钥并妥善保管。后面要用. 

#### 第二步: 创建一个stake账户,并转入代币：

```
solana create-stake-account --from <KEYPAIR> stake-account.json <AMOUNT> \
    --stake-authority <KEYPAIR> --withdraw-authority <KEYPAIR> \
    --fee-payer <KEYPAIR>
```

`KEYPAIR`: 你的密钥对

`AMOUNT`: 转移的代币数量

`stake-account.json`: 你的stake账户的公钥文件路径

现在可以删除 `stake-account.json` 文件了。要授权其他操作，您可以使用 --stake-authority 或 --withdraw-authority 密钥对，而不是 `stake-account.json`。

使用 solana stake-account 命令查看新的权益账户：

```
solana stake-account <STAKE_ACCOUNT_ADDRESS>
```

输出将类似于以下内容：

```
Total Stake: 5000 SOL
Stake account is undelegated
Stake Authority: EXU95vqs93yPeCeAU7mPPu6HbRUmTFPEiGug9oCdvQ5F
Withdraw Authority: EXU95vqs93yPeCeAU7mPPu6HbRUmTFPEiGug9oCdvQ5F
```

## 设置质押和取款权限


质押和取款权限可以在创建账户时通过 --stake-authority 和 --withdraw-authority 选项来设置，或者后面通过 solana stake-authorize 命令来设置。

例如，要设置一个新的质押权限，运行:

```
solana stake-authorize <STAKE_ACCOUNT_ADDRESS> \
    --stake-authority <KEYPAIR> --new-stake-authority <PUBKEY> \
    --fee-payer <KEYPAIR>
```

`KEYPAIR`: stake账户的权限所有者

`STAKE_ACCOUNT_ADDRESS`: stake账户地址

`PUBKEY`: 新的权限所有者

这里做了一个质押的权限的移交. 


## 委托质押

要将您的质押委托给验证人，您需要知道它的投票账户地址。通过使用`solana validators`命令查询群集以获取所有验证人及其投票账户列表来找到它：

```
solana validators
```

每行的第一列包含验证人的身份，第二列是投票账户地址。

选择一个验证人

运行以下命令, 把你的质押委托给验证人: 

```
solana delegate-stake --stake-authority <KEYPAIR> <STAKE_ACCOUNT_ADDRESS> <VOTE_ACCOUNT_ADDRESS> \
    --fee-payer <KEYPAIR>
```

`VOTE_ACCOUNT_ADDRESS`: 验证人地址

`KEYPAIR`: 你的密钥对

`STAKE_ACCOUNT_ADDRESS`: 你的stake账户

委托后，使用solana stake-account观察stake账户的变化：

```
solana stake-account <STAKE_ACCOUNT_ADDRESS>
```

您将在输出中看到新的字段"代币委托"和"代币委托账户地址"。 输出将类似于这样：
```
Total Stake: 5000 SOL
Credits Observed: 147462
Delegated Stake: 4999.99771712 SOL
Delegated Vote Account Address: CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1
Stake activates starting from epoch: 42
Stake Authority: EXU95vqs93yPeCeAU7mPPu6HbRUmTFPEiGug9oCdvQ5F
Withdraw Authority: EXU95vqs93yPeCeAU7mPPu6HbRUmTFPEiGug9oCdvQ5F
```


## 取消委托

您可以使用 solana deactivate-stake 取消委托：

```
solana deactivate-stake --stake-authority <KEYPAIR> <STAKE_ACCOUNT_ADDRESS> \
    --fee-payer <KEYPAIR>
```

请注意，刚刚委托的权益账户有冷却期, 不能马上取消委托. 

## 取出质押

```
solana withdraw-stake --withdraw-authority <KEYPAIR> <STAKE_ACCOUNT_ADDRESS> <RECIPIENT_ADDRESS> <AMOUNT> \
    --fee-payer <KEYPAIR>
```

`RECIPIENT_ADDRESS`: 取出到哪个地址

`KEYPAIR`: 你的密钥对

`STAKE_ACCOUNT_ADDRESS`: 现在的stake账户
