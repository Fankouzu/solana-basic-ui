# 快速入门指南

Token-2022 程序通过加密转账扩展提供加密转账功能。

本指南解释了如何使用加密转账扩展。

请参阅 [Token-2022 介绍](https://spl.solana.com/token-2022) 了解更多关于 Token-2022 及其扩展概念的信息。

## 设置

参考[SPL Token设置指南](https://spl.solana.com/token#setup)来安装客户端工具。Token-2022为了最大限度的兼容性，共享相同的CLI和NPM包。

这里所有的命令都在一个[辅助脚本](https://github.com/solana-labs/solana-program-library/tree/master/token/cli/examples/confidential-transfer.sh)中，该脚本位于[TOKEN CLI 示例](https://github.com/solana-labs/solana-program-library/tree/master/token/cli/examples)目录下。

### 示例：创建带有加密转账功能的铸币厂

要创建一个启用了加密转账的新铸币厂，运行：

```bash
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-confidential-transfers auto
```


`auto` 关键词意味着任何代币用户都可以无须许可地配置他们的账户以执行加密转账。

如果你想限制加密转账功能仅对特定用户开放，你可以将批准策略设置为 `manual`。采用这种批准策略，所有用户必须手动获得批准才能执行加密转账。即便如此，任何人仍然可以非加密的方式使用该代币。

需要注意的是，你必须在创建代币时就配置好加密转账功能，之后无法再添加此项功能。

### 示例：为加密转账配置一个代币账户

账户创建过程如下：

```bash
$ spl-token create-account <MINT_PUBKEY>
```

一旦用户创建了他们的账户，他们就可以配置该账户以支持加密转账：

```bash
$ spl-token configure-confidential-transfer-account --address <ACCOUNT_PUBKEY>
```

请注意，只有账户所有者可以为他们的账户配置加密转账：他们应该为自己的账户设置加密密钥。这与普通账户（如关联代币账户）不同，在这种账户类型中，其他人有可能创建另一个人的账户。

### 示例：存入加密代币

一旦用户为其账户配置了加密转账功能并且拥有非加密的代币余额，他们必须将代币从非加密状态存入到加密状态：

```bash
$ spl-token deposit-confidential-tokens <MINT_PUBKEY> <AMOUNT> --address <ACCOUNT_PUBKEY>
```

需要注意的是，存入加密余额的代币将不再出现在账户的非加密余额中：它们已经被完全转移到了加密余额里。


### 示例：待定余额

每当账户通过转账或存款收到加密代币时，余额将显示在“待定”余额中，这意味着用户不能立即访问这些资金。

运行以下命令，将余额从“待定”状态变为“可用”状态：

```bash
$ spl-token apply-pending-balance --address <ACCOUNT_PUBKEY>
```

### 示例：转账加密代币

一旦账户有了可用余额，用户最终可以将这些代币转到另一个已经配置好加密转账功能的账户！

```bash
$ spl-token transfer <MINT_PUBKEY> <AMOUNT> <DESTINATION_PUBKEY> --confidential
```

因为它需要多个相互依赖的交易，这个操作会稍微花费更长一点的时间，但即便如此，也只需几秒钟的时间。

### 示例：提取加密代币

一个账户里有可用加密余额的用户，可以将这些代币撤回到他们的非加密余额中。

```bash
$ spl-token withdraw-confidential-tokens <MINT_PUBKEY> <AMOUNT> --address <ACCOUNT_PUBKEY>
```

在运行命令前，应转换所有待处理的余额，以确保所有代币都可用。

