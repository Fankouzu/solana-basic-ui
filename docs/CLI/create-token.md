# 通过spl-token命令创建Token

## 创建Token
```sh
$ spl-token create-token
Creating token AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM
Signature: 47hsLFxWRCg8azaZZPSnQR8DNTRsGyPNfUK7jqyzgt7wf9eag3nSnewqoZrVZHKm8zt3B6gzxhr91gdQ5qYrsRG4
```
令牌的唯一标识符是```AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM```。

最初创建时spl-token没有供应的代币：
## 查询Token供应总量
```sh
$ spl-token supply AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM
0
```
## 铸造Token
在铸造之前，我们需要创建一个账户来保存Token，这是Solana的特殊之处，每个个人账户的Token余额要保存在一个数据账户中。

```sh
$ spl-token create-account AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM
Creating account 7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi
Signature: 42Sa5eK9dMEQyvD9GMHuKxXf55WLZ7tfjabUKDhNoZRAxj9MsnN7omriWMEHXLea3aYpjZ862qocRLVikvkHkyfy
```
```7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi```就是你的账户地址用来保存刚创建的Token数量的账户地址，现在这是一个空帐户：
```sh
$ spl-token balance AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM
0
```
向账户铸造 100 个代币：
```sh
$ spl-token mint AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM 100
Minting 100 tokens
  Token: AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM
  Recipient: 7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi
Signature: 41mARH42fPkbYn1mvQ6hYLjmJtjW98NXwd6pHqEYg9p8RnuoUsMxVd16RkStDHEzcS2sfpSEpFscrJQn3HkHzLaa
```
代币`supply`和账户`balance`现在反映了铸造的结果：
```sh
$ spl-token supply AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM
100
```
```sh
$ spl-token balance AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM
100
```
## 查询你拥有的所有Token代币和数量
```sh
$ spl-token accounts
Token                                         Balance
------------------------------------------------------------
7e2X5oeAAJyUTi4PfSGXFLGhyPw2H8oELm1mx87ZCgwF  84
AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM  100
AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM  0    (Aux-1*)
AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM  1    (Aux-2*)
```

```sh
$ 
```

```sh
$ 
```

```sh
$ 
```

```sh
$ 
```
## 转账
```sh
solana transfer --allow-unfunded-recipient CAA2QJN8KrkZgsiEbvtx2JV6iWpDLBnfeTj9ZXwnujKh 0.01
```