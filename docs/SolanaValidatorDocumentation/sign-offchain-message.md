# 使用 Solana CLI 进行链下消息签名


链下消息签名是一种使用Solana钱包签署非交易消息的方法。此功能可用于验证用户身份或提供钱包所有权证明。(例如: 登录网站的时候使用)

## 签署链下消息

要签署任意链下消息，请运行以下命令：

```
solana sign-offchain-message <MESSAGE>
```

消息将使用CLI的默认私钥进行编码和签名，并将签名打印到输出。如果您想使用其他密钥进行签名，只需使用-k/--keypair选项：

```
solana sign-offchain-message -k <KEYPAIR> <MESSAGE>
```
 
## 验证链下消息签名

要验证链下消息签名，请运行以下命令：

```
solana verify-offchain-signature <MESSAGE> <SIGNATURE>
```

带有 --signer将使用默认 CLI 签名者的公钥。您可以指定另一个 选项的密钥：

```
solana verify-offchain-signature --signer <PUBKEY> <MESSAGE> <SIGNATURE>
```