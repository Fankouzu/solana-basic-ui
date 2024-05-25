# Solana CLI 中的持久交易nonce

持久交易nonce是一种绕过交易的近期区块哈希短生命周期的机制。它们作为一个Solana程序实现，具体机制可以在提案中了解。

## 使用示例

有关持久nonce CLI 命令的完整使用细节，请参阅 CLI 参考文档。

### 创建nonce账户

持久nonce功能使用一个账户来存储下一个nonce值。持久nonce账户必须免租金，因此需要保持最低余额以实现这一点。


通过首先生成新的密钥对来创建nonce帐户，然后链上创建账户

Command命令


```
solana-keygen new -o nonce-keypair.json
solana create-nonce-account nonce-keypair.json 1
```

Output输出

```
2SymGjGV4ksPdpbaqWFiDoBz8okvtiik4KE9cnMQgRHrRLySSdZ6jrEcpPifW4xUpp4z66XM9d9wM48sA7peG2XL
```


### 查询存储的Nonce值

创建一个持久的随机交易需要在签名和提交时将存储的随机值作为 --blockhash 参数的值传递。通过以下方式获取当前存储的随机值。


Command命令

```
solana nonce nonce-keypair.json
```

Output输出

```
8GRipryfxcsxN8mAGjy8zbFo9ezaUsh47TsPzmZbuytU
```


### 显示nonce帐户

以更人性化的格式检查nonce帐户


Command命令

```
solana nonce-account nonce-keypair.json
```

Output输出


```
balance: 0.5 SOL
minimum balance required: 0.00136416 SOL
nonce: DZar6t2EaCFQTbUP4DHKwZ1wT8gCPW2aRfkVWhydkBvS
```

### 从nonce账户中提取资金


Command命令

```
solana withdraw-from-nonce-account nonce-keypair.json ~/.config/solana/id.json 0.5
```

Output输出

```
3foNy1SBqwXSsfSfTdmYKDuhnVheRnKXpoPySiUDBVeDEs6iMVokgqm7AqfTjbk7QBE8mqomvMUMNQhtdMvFLide
```

### 为 Nonce 账户分配新权限

创建后重新分配nonce帐户的权限

Command命令


```
solana authorize-nonce-account nonce-keypair.json nonce-authority.json
```
Output输出

```
3F9cg4zN9wHxLGx4c3cUKmqpej4oa67QbALmChsJbfxTgTffRiL3iUehVhR9wQmWgPua66jPuAYeL1K2pYYjbNoT
```













