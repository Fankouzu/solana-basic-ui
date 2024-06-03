# Solana CLI 中的持久化交易随机数

持久化交易随机数是一种机制，用于规避交易的近期区块哈希 [`recent_blockhash`](https://solana.com/docs/core/transactions#recent-blockhash) 典型较短生命周期的问题。它们被实现为一个Solana 程序，其工作原理可在[提案](https://docs.solanalabs.com/implemented-proposals/durable-tx-nonces)中阅读。

## 使用示例

持久化随机数 CLI 命令的完整使用细节可在 [CLI 参考](https://docs.solanalabs.com/cli/usage)中找到。



### 随机数权限方

随机数账户的权限可以分配给另一个账户。通过这样做，新权限方从之前权限方继承了对随机数账户的完全控制，包括账户创建者。此特性允许创建更复杂的账户所有权安排以及不与密钥对相关联的衍生账户地址。`--nonce-authority <AUTHORITY_KEYPAIR>` 参数用于指定此账户并被如下命令支持：

+ `create-nonce-account`
+ `new-nonce`
+ `withdraw-from-nonce-account`
+ `authorize-nonce-account`



### 随机数账户创建

持久化交易随机数功能使用一个账户来储存下一个随机数值。持久化随机数账户必须是[租金豁免](https://docs.solanalabs.com/implemented-proposals/rent#two-tiered-rent-regime)的,因此需要持有达到这一目的最低余额。

创建随机数账户首先生成一个新的密钥对，然后在链上创建账户。

+ 命令

```
solana-keygen new -o nonce-keypair.json
solana create-nonce-account nonce-keypair.json 1
```

+ 输出

```
2SymGjGV4ksPdpbaqWFiDoBz8okvtiik4KE9cnMQgRHrRLySSdZ6jrEcpPifW4xUpp4z66XM9d9wM48sA7peG2XL
```

> 要是密钥对全程离线，请转而使用[纸质钱包](https://docs.solanalabs.com/cli/wallets/paper)密钥对生成[指令](https://docs.solanalabs.com/cli/wallets/paper#seed-phrase-generation)。

> [完整使用文档](https://docs.solanalabs.com/cli/usage#solana-create-nonce-account)



### 查询储存的随机数值

创建一个持久化交易随机数需要在签名和提交的时候将储存的随机数值作为 `--blockhash` 参数 

的值传递。使用下面的命令获得当前储存的值:

+ 命令

```
solana nonce nonce-keypair.json
```

+ 输出

```
8GRipryfxcsxN8mAGjy8zbFo9ezaUsh47TsPzmZbuytU
```

> [完整使用文档](https://docs.solanalabs.com/cli/usage#solana-get-nonce)



### 推进储存的随机数值

尽管在更有用的交易之外不需要，但是可以通过以下的方法来推进储存的随机数值：

+ 命令

```
solana new-nonce nonce-keypair.json
```

+ 输出

```
44jYe1yPKrjuYDmoFTdgPjg8LFpYyh1PFKJqm5SC1PiSyAL8iw1bhadcAX1SL7KDmREEkmHpYvreKoNv6fZgfvUK
```

> [完整使用文档](https://docs.solanalabs.com/cli/usage#solana-new-nonce)



### 显示随机数账户

以更易于人类阅读的格式检查随机数账户：

+ 命令

```
solana nonce-account nonce-keypair.json
```

+ 输出

```
balance: 0.5 SOL
minimum balance required: 0.00136416 SOL
nonce: DZar6t2EaCFQTbUP4DHKwZ1wT8gCPW2aRfkVWhydkBvS
```

> [完整使用文档](https://docs.solanalabs.com/cli/usage#solana-nonce-account)



### 从随机数账户中提款

使用以下命令从随机数账户中提款：

+ 命令

```
solana withdraw-from-nonce-account nonce-keypair.json ~/.config/solana/id.json 0.5
```

+ 输出

```
3foNy1SBqwXSsfSfTdmYKDuhnVheRnKXpoPySiUDBVeDEs6iMVokgqm7AqfTjbk7QBE8mqomvMUMNQhtdMvFLide
```

> 通过提取全部余额以关闭一个随机数账户

> [完整使用文档](https://docs.solanalabs.com/cli/usage#solana-withdraw-from-nonce-account)



### 为随机数账户分配新权限

为创建后的随机数账户重新分配权限，请使用：

+ 命令

```
solana authorize-nonce-account nonce-keypair.json nonce-authority.json
```

+ 输出

```
3F9cg4zN9wHxLGx4c3cUKmqpej4oa67QbALmChsJbfxTgTffRiL3iUehVhR9wQmWgPua66jPuAYeL1K2pYYjbNoT
```

> [完整使用文档](https://docs.solanalabs.com/cli/usage#solana-authorize-nonce-account)



## 其他支持持久化随机数的命令

为了能在其他 CLI 子命令中使用持久化随机数，必须提供以下两个参数：

+ `--nonce` ，用于指定储存随机数的账户
+ `--nonce-authority` ，用于指定一个可选的[随机数权限账户](https://docs.solanalabs.com/cli/examples/durable-nonce#nonce-authority)

到目前为止，以下子命令支持此功能：

- [`pay`](https://docs.solanalabs.com/cli/usage#solana-pay)
- [`delegate-stake`](https://docs.solanalabs.com/cli/usage#solana-delegate-stake)
- [`deactivate-stake`](https://docs.solanalabs.com/cli/usage#solana-deactivate-stake)



### 使用持久化随机数支付示例

此处演示了 Alice 使用持久化随机数向 Bob 支付了 1 SOL 。所有支持持久化随机数的子命令都遵循相同的步骤。

+ 创建账户

创建账户 首先，我们需要为Alice、Alice的随机数账户和Bob创建一些账户。

```
$ solana-keygen new -o alice.json
$ solana-keygen new -o nonce.json
$ solana-keygen new -o bob.json
```

+ 为 Alice 的账户充值。Alice 需要一些资金来创建随机数账户并向 Bob 发送。给她空投一些SOL

```
$ solana airdrop -k alice.json 1
1 SOL
```

+ 创建 Alice 的随机数账户

现在 Alice 需要一个随机数账户，创建一个。

> 此处，没有使用单独的随机数权限账户，因此 `alice.json` 对随机数账户拥有完全权限。

```
$ solana create-nonce-account -k alice.json nonce.json 0.1
3KPZr96BTsL3hqera9up82KAU462Gz31xjqJ6eHUAjF935Yf8i1kmfEbo6SVbNaACKE5z6gySrNjVRvmS8DcPuwV
```

+ 第一次尝试向 Bob 支付失败

Alice 尝试支付给 Bob，但是由于签名时间过长，指定的区块哈希过期，导致交易失败。

```
$ solana transfer -k alice.json --blockhash expiredDTaxfagttWjQweib42b6ZHADSx94Tw8gHx11 bob.json 0.01
[2020-01-02T18:48:28.462911000Z ERROR solana_cli::cli] Io(Custom { kind: Other, error: "Transaction \"33gQQaoPc9jWePMvDAeyJpcnSPiGUAdtVg8zREWv4GiKjkcGNufgpcbFyRKRrA25NkgjZySEeKue5rawyeH5TzsV\" failed: None" })
Error: Io(Custom { kind: Other, error: "Transaction \"33gQQaoPc9jWePMvDAeyJpcnSPiGUAdtVg8zREWv4GiKjkcGNufgpcbFyRKRrA25NkgjZySEeKue5rawyeH5TzsV\" failed: None" })
```

+ 随机数账户来支援！

Alice 重试了交易，这次制定了她的随机数账户以及其中存储的区块哈希。

> 记住，在此次例子中，`alice.json` 是随机数权限账户。

```
$ solana nonce-account nonce.json
balance: 0.1 SOL
minimum balance required: 0.00136416 SOL
nonce: F7vmkY3DTaxfagttWjQweib42b6ZHADSx94Tw8gHx3W7
```

```
$ solana transfer -k alice.json --blockhash F7vmkY3DTaxfagttWjQweib42b6ZHADSx94Tw8gHx3W7 --nonce nonce.json bob.json 0.01
HR1368UKHVZyenmH7yVz5sBAijV6XAPeWbEiXEGVYQorRMcoijeNAbzZqEZiH8cDB8tk65ckqeegFjK8dHwNFgQ
```

+ 成功！

交易成功了！Bob 从 Alice 那里收到了0.01个 SOL ，并且 Alice 储存的随机数推进到了一个新的值。

```
$ solana balance -k bob.json
0.01 SOL
```

```
$ solana nonce-account nonce.json
balance: 0.1 SOL
minimum balance required: 0.00136416 SOL
nonce: 6bjroqDcZgTv6Vavhqf81oBHTv3aMnX19UTB51YhAZnN
```

