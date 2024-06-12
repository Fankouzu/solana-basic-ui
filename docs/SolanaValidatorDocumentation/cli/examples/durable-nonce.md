# Solana CLI 中的持久化交易随机数

持久交易随机数（Durable Transaction Nonces）是一种绕过交易的短暂 `recent_blockhash` 生命周期的机制。它们被一个 Solana 程序实现，可以在[提案](https://docs.solanalabs.com/implemented-proposals/durable-tx-nonces)中阅读其机制。

## 使用示例

可以在 [CLI 参考](https://docs.solanalabs.com/cli/usage) 中找到持久随机数的 CLI 命令用法详细信息。

### 随机数权限方

随机数账户的权限可以选择分配给另一个账户。这样，新权限继承了前一个权限的对随机数账户的完全控制，包括账户创建者。此功能使得可以创建更复杂的账户所有权安排和不与密钥对关联的派生账户地址。使用 `--nonce-authority <AUTHORITY_KEYPAIR>` 参数来指定该账户并支持以下命令：

+ `create-nonce-account`
+ `new-nonce`
+ `withdraw-from-nonce-account`
+ `authorize-nonce-account`

### 随机数账户创建

持久交易随机数的功能是使用一个账户来存储下一个随机数值。持久随机数账户必须是[租金豁免](https://docs.solanalabs.com/implemented-proposals/rent#two-tiered-rent-regime)的，因此需要存有最低余额。

首先生成新的密钥对，然后在链上创建帐户来创建随机数帐户

+ 命令

```bash
solana-keygen new -o nonce-keypair.json
solana create-nonce-account nonce-keypair.json 1
```

+ 输出

```bash
2SymGjGV4ksPdpbaqWFiDoBz8okvtiik4KE9cnMQgRHrRLySSdZ6jrEcpPifW4xUpp4z66XM9d9wM48sA7peG2XL
```

> 要是密钥对全程离线，请转而使用[纸钱包](https://docs.solanalabs.com/cli/wallets/paper)密钥对生成[指令](https://docs.solanalabs.com/cli/wallets/paper#seed-phrase-generation)。

> [完整的使用文档](https://docs.solanalabs.com/cli/usage#solana-create-nonce-account)

### 查询储存的随机数值

创建持久随机数交易，需要将存储的随机数值作为 `--blockhash` 参数的值进行签名和提交。使用以下命令获取当前存储的随机数值：

+ 命令

```bash
solana nonce nonce-keypair.json
```

+ 输出

```bash
8GRipryfxcsxN8mAGjy8zbFo9ezaUsh47TsPzmZbuytU
```

> [完整的使用文档](https://docs.solanalabs.com/cli/usage#solana-get-nonce)

### 推进储存的随机数值

尽管通常在有更好用的交易之外不需要使用，但是可以通过以下的方法来推进储存的随机数值：

+ 命令

```bash
solana new-nonce nonce-keypair.json
```

+ 输出

```bash
44jYe1yPKrjuYDmoFTdgPjg8LFpYyh1PFKJqm5SC1PiSyAL8iw1bhadcAX1SL7KDmREEkmHpYvreKoNv6fZgfvUK
```

> [完整使用文档](https://docs.solanalabs.com/cli/usage#solana-new-nonce)

### 展示随机数账户

以更人性化的格式查看随机数帐户

+ 命令

```bash
solana nonce-account nonce-keypair.json
```

+ 输出

```bash
balance: 0.5 SOL
minimum balance required: 0.00136416 SOL
nonce: DZar6t2EaCFQTbUP4DHKwZ1wT8gCPW2aRfkVWhydkBvS
```

> [完整的使用文档](https://docs.solanalabs.com/cli/usage#solana-nonce-account)

### 从随机数账户中提款

使用以下命令从随机数账户中提款：

+ 命令

```bash
solana withdraw-from-nonce-account nonce-keypair.json ~/.config/solana/id.json 0.5
```

+ 输出

```bash
3foNy1SBqwXSsfSfTdmYKDuhnVheRnKXpoPySiUDBVeDEs6iMVokgqm7AqfTjbk7QBE8mqomvMUMNQhtdMvFLide
```

> 通过提取全部余额来关闭随机数帐户

> [完整的使用文档](https://docs.solanalabs.com/cli/usage#solana-withdraw-from-nonce-account)

### 为随机数账户分配新权限人

为创建后的随机数账户重新分配权限，请使用：

+ 命令

```bash
solana authorize-nonce-account nonce-keypair.json nonce-authority.json
```

+ 输出

```bash
3F9cg4zN9wHxLGx4c3cUKmqpej4oa67QbALmChsJbfxTgTffRiL3iUehVhR9wQmWgPua66jPuAYeL1K2pYYjbNoT
```

> [完整的使用文档](https://docs.solanalabs.com/cli/usage#solana-authorize-nonce-account)

## 其他支持持久随机数的命令

要在其他 CLI 子命令中使用持久随机数，需要两个参数：

+ `--nonce` ，指定存储随机数值的账户
+ `--nonce-authority` ，用于指定一个可选的[随机数权限账户](https://docs.solanalabs.com/cli/examples/durable-nonce#nonce-authority)

到目前为止，以下子命令支持此功能：

- [`pay`](https://docs.solanalabs.com/cli/usage#solana-pay)
- [`delegate-stake`](https://docs.solanalabs.com/cli/usage#solana-delegate-stake)
- [`deactivate-stake`](https://docs.solanalabs.com/cli/usage#solana-deactivate-stake)

### 使用持久随机数支付示例

这里我们演示 Alice 使用持久随机数向 Bob 支付 1 SOL。对于所有支持持久随机数的子命令，过程都是相同的。

**- 创建账户**

首先，我们需要为Alice、Alice的随机数账户和Bob创建一些账户。

```bash
$ solana-keygen new -o alice.json
$ solana-keygen new -o nonce.json
$ solana-keygen new -o bob.json
```

**- 为 Alice 的账户充值**

Alice 需要一些资金来创建一个随机数账户并发送给 Bob。给她空投一些SOL

```bash
$ solana airdrop -k alice.json 1
1 SOL
```

**- 创建 Alice 的随机数账户**

现在 Alice 需要一个随机数账户，创建一个。

> 在这里，不使用单独的 [随机数权限](https://docs.solanalabs.com/cli/examples/durable-nonce#nonce-authority) ，因此 `alice.json` 对随机数账户拥有完全权限。

```bash
$ solana create-nonce-account -k alice.json nonce.json 0.1
3KPZr96BTsL3hqera9up82KAU462Gz31xjqJ6eHUAjF935Yf8i1kmfEbo6SVbNaACKE5z6gySrNjVRvmS8DcPuwV
```

**- 第一次尝试向 Bob 支付失败**

Alice 尝试支付 Bob，但签名时间过长。指定的 blockhash 过期，交易失败。

```bash
$ solana transfer -k alice.json --blockhash expiredDTaxfagttWjQweib42b6ZHADSx94Tw8gHx11 bob.json 0.01
[2020-01-02T18:48:28.462911000Z ERROR solana_cli::cli] Io(Custom { kind: Other, error: "Transaction \"33gQQaoPc9jWePMvDAeyJpcnSPiGUAdtVg8zREWv4GiKjkcGNufgpcbFyRKRrA25NkgjZySEeKue5rawyeH5TzsV\" failed: None" })
Error: Io(Custom { kind: Other, error: "Transaction \"33gQQaoPc9jWePMvDAeyJpcnSPiGUAdtVg8zREWv4GiKjkcGNufgpcbFyRKRrA25NkgjZySEeKue5rawyeH5TzsV\" failed: None" })
```

**- 随机数账户来补救！**

Alice 重试交易，这次指定她的随机数账户和存储在那里的 blockhash。

> 记住，在这个例子里，`alice.json` 是随机数权限账户。

```bash
$ solana nonce-account nonce.json
balance: 0.1 SOL
minimum balance required: 0.00136416 SOL
nonce: F7vmkY3DTaxfagttWjQweib42b6ZHADSx94Tw8gHx3W7
```

```bash
$ solana transfer -k alice.json --blockhash F7vmkY3DTaxfagttWjQweib42b6ZHADSx94Tw8gHx3W7 --nonce nonce.json bob.json 0.01
HR1368UKHVZyenmH7yVz5sBAijV6XAPeWbEiXEGVYQorRMcoijeNAbzZqEZiH8cDB8tk65ckqeegFjK8dHwNFgQ
```

**- 成功！**

交易成功！Bob 收到了来自 Alice 的 0.01 SOL，并且 Alice 的存储随机数前进到了一个新值。

```bash
$ solana balance -k bob.json
0.01 SOL
```

```bash
$ solana nonce-account nonce.json
balance: 0.1 SOL
minimum balance required: 0.00136416 SOL
nonce: 6bjroqDcZgTv6Vavhqf81oBHTv3aMnX19UTB51YhAZnN
```
