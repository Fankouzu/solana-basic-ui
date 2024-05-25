# 使用 Solana CLI 进行离线交易签名

某些安全模型要求将签名密钥和签名过程与交易创建和网络广播分开。示例如下：

* 在多重签名方案中收集地理位置分散的签名者的签名
* 使用隔离签名设备签名交易

本文描述了如何使用Solana的CLI分别签名和提交交易。

## 离线签名交易

要离线签名交易，请在命令行上传递以下参数

--sign-only，防止客户端将已签名的交易提交到网络。相反，公钥/签名对将打印到标准输出。

--blockhash BASE58_HASH，允许调用者指定用于填充交易的recent_blockhash字段的值。这有几个用途，主要是：跳过查询最近区块哈希，使签名者能够在多重签名方案中协调区块哈希。


### 示例：离线签名付款


Command命令

```
solana@offline$ solana transfer --sign-only --blockhash 5Tx8F3jgSHx21CbtjwmdaKPLM5tWmreWAnPrbqHomSJF \
    recipient-keypair.json 1
```

4qKmpQpwyHSMJBfch289LJfoa7kdCMXLtBkCsgHZZANS


Output输出
```

Blockhash: 5Tx8F3jgSHx21CbtjwmdaKPLM5tWmreWAnPrbqHomSJF
Signers (Pubkey=Signature):
  FhtzLVsmcV7S5XqGD79ErgoseCLhZYmEZnz9kQg1Rp7j=4vC38p4bz7XyiXrk6HtaooUqwxTWKocf45cstASGtmrD398biNJnmTcUCVEojE7wVQvgdYbjHJqRFZPpzfCQpmUN

{"blockhash":"5Tx8F3jgSHx21CbtjwmdaKPLM5tWmreWAnPrbqHomSJF","signers":["FhtzLVsmcV7S5XqGD79ErgoseCLhZYmEZnz9kQg1Rp7j=4vC38p4bz7XyiXrk6HtaooUqwxTWKocf45cstASGtmrD398biNJnmTcUCVEojE7wVQvgdYbjHJqRFZPpzfCQpmUN"]}'
```


## 提交离线签名交易

要向网络提交离线签名的交易，请在命令行中传递以下参数

--blockhash BASE58_HASH，必须与用于签名的块哈希相同

--signer BASE58_PUBKEY=BASE58_SIGNATURE，每个离线签名者一个。这包括将公钥/签名对直接包含在交易中，而不是使用任何本地密钥对进行签名。



### 示例：提交离线签名付款

Command命令

```
solana@online$ solana transfer --blockhash 5Tx8F3jgSHx21CbtjwmdaKPLM5tWmreWAnPrbqHomSJF \
    --signer FhtzLVsmcV7S5XqGD79ErgoseCLhZYmEZnz9kQg1Rp7j=4vC38p4bz7XyiXrk6HtaooUqwxTWKocf45cstASGtmrD398biNJnmTcUCVEojE7wVQvgdYbjHJqRFZPpzfCQpmUN
    recipient-keypair.json 1
```

Output输出
```
4vC38p4bz7XyiXrk6HtaooUqwxTWKocf45cstASGtmrD398biNJnmTcUCVEojE7wVQvgdYbjHJqRFZPpzfCQpmUN```
