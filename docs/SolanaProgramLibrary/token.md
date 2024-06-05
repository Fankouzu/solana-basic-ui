# Token Program

一种定义在 Solana 区块链上的代币智能合约程序。

该智能合约程序为同质化代币（Fungible Tokens）和非同质化代币（Non-Fungible Tokens）定义了一个通用实现。

## 背景

Solana 的编程模型和本文档中使用的 Solana 术语定义可在以下链接找到：

- [https://docs.solana.com/apps](https://docs.solana.com/apps)
- [https://docs.solana.com/terminology](https://docs.solana.com/terminology)

## 源代码

token 程序的源代码可在 [GitHub](https://github.com/solana-labs/solana-program-library) 上找到。

## 接口

token 程序（Token Program）使用 Rust 编写，并可在 [crates.io](https://crates.io/) 和 [docs.rs](https://docs.rs/) 上找到。

token 程序支持自动生成的 C 语言绑定。

token 程序提供 JavaScript 绑定，可实现将 token 智能合约加载到链上并发出指令。

有关钱包地址到代币账户映射和资金管理的约定，请参见 [SPL 关联代币账户程序](https://spl.solana.com/associated-token-account)。

## 状态

SPL token 程序被视为已完成，目前没有计划添加新功能。可能会进行更改以修复重要或破坏性错误。

## 相关教程

### 设置

`spl-token` 命令行工具可用于操作 SPL 代币。一旦您安装了 [Rust](https://rustup.rs/)，运行以下命令即可安装：

```sh
cargo install spl-token-cli
```


运行 `spl-token --help` 获取可用命令的完整描述。

### 配置

spl-token 与 solana 命令行工具共享相同的配置文件。

### 查看当前配置文件

```sh
$ solana config get

Config File: ${HOME}/.config/solana/cli/config.yml
RPC URL: https://api.mainnet-beta.solana.com
WebSocket URL: wss://api.mainnet-beta.solana.com/ (computed)
Keypair Path: ${HOME}/.config/solana/id.json
```

### 集群 RPC URL

查看 [Solana clusters](https://docs.solana.com/clusters) 获取关于 solana 特定集群 RPC URL 的详细信息。

设置节点配置文件，连接 solana devnet 集群

```sh
solana config set --url https://api.devnet.solana.com
```

### 默认密钥对

如果您还没有密钥对的话，查看[Keypair conventions](https://docs.solana.com/cli/conventions#keypair-conventions) 以获取有关如何设置密钥对的信息。

设置指定的密钥对文件为节点默认密钥对

```sh
solana config set --keypair ${HOME}/new-keypair.json
```

设置硬件钱包为节点默认密钥对 ([URL spec](https://docs.solana.com/wallet-guide/hardware-wallets#specify-a-keypair-url))

```sh
solana config set --keypair usb://ledger/
```

### 空投 SOL

创建代币和账户需要使用 SOL 来支付账户租金押金和交易费用。如果您加入的集群提供水龙头服务，您可以获取少量 SOL 进行测试：

```sh
solana airdrop 1
```

### 示例: 创建同质化代币

```sh
$ spl-token create-token

Creating token AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM
Signature: 47hsLFxWRCg8azaZZPSnQR8DNTRsGyPNfUK7jqyzgt7wf9eag3nSnewqoZrVZHKm8zt3B6gzxhr91gdQ5qYrsRG4
```

`AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM`是代币的唯一标识符.

通过 spl-token 最初创建的代币供应量为 0：

```sh
$ spl-token supply AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM

0
```

为铸造代币`AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM`，首先创建一个账户来持有新代币:

```sh
$ spl-token create-account AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM

Creating account 7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi
Signature: 42Sa5eK9dMEQyvD9GMHuKxXf55WLZ7tfjabUKDhNoZRAxj9MsnN7omriWMEHXLea3aYpjZ862qocRLVikvkHkyfy
```

`7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi` 即为新创建的空账户:

```sh
$ spl-token balance AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM

0
```

向新创建的空账户内铸造 100 枚代币:

```sh
$ spl-token mint AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM 100

Minting 100 tokens
  Token: AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM
  Recipient: 7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi
Signature: 41mARH42fPkbYn1mvQ6hYLjmJtjW98NXwd6pHqEYg9p8RnuoUsMxVd16RkStDHEzcS2sfpSEpFscrJQn3HkHzLaa
```

通过代币供应`supply`和账户余额`balance`可以查看代币铸造的结果：

```sh
$ spl-token supply AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM

100
```

```sh
$ spl-token balance AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM

100
```

### 示例: 查看账户内拥有的全部代币

```sh
$ spl-token accounts

Token                                         Balance
------------------------------------------------------------
7e2X5oeAAJyUTi4PfSGXFLGhyPw2H8oELm1mx87ZCgwF  84
AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM  100
AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM  0    (Aux-1*)
AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM  1    (Aux-2*)
```

### 示例: 封装 SOL

当您想要封装 SOL 时，可以将 SOL 发送到原生铸币的关联代币账户上，并调用 `syncNative` 更新代币账户上的 `amount` 字段，以匹配可用的封装 SOL 数量。这些 SOL 只能通过关闭代币账户并选择希望发送代币账户的 lamports 的地址来检索。

```sh
$ spl-token wrap 1

Wrapping 1 SOL into GJTxcnA5Sydy8YRhqvHxbQ5QNsPyRKvzguodQEaShJje
Signature: 4f4s5QVMKisLS6ihZcXXPbiBAzjnvkBcp2A7KKER7k9DwJ4qjbVsQBKv2rAyBumXC1gLn8EJQhwWkybE4yJGnw2Y
```

解封装 SOL

```sh
$ spl-token unwrap GJTxcnA5Sydy8YRhqvHxbQ5QNsPyRKvzguodQEaShJje

Unwrapping GJTxcnA5Sydy8YRhqvHxbQ5QNsPyRKvzguodQEaShJje
  Amount: 1 SOL
  Recipient: vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg
Signature: f7opZ86ZHKGvkJBQsJ8Pk81v8F3v1VUfyd4kFs4CABmfTnSZK5BffETznUU3tEWvzibgKJASCf7TUpDmwGi8Rmh
```

### 示例: 将代币转移给另一个用户

首先，接收者使用 `spl-token create-account` 创建他们的关联代币账户以接收特定类型的代币。然后，接收者通过运行 `solana address` 来获取他们的钱包地址，并将其提供给发送者。

随后，发送者执行以下操作：

```sh
$ spl-token transfer AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM 50 vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg

Transfer 50 tokens
  Sender: 7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi
  Recipient: vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg
  Recipient associated token account: F59618aQB8r6asXeMcB9jWuY6NEx1VduT9yFo1GTi1ks
Signature: 5a3qbvoJQnTAxGPHCugibZTbSu7xuTgkxvF4EJupRjRXGgZZrnWFmKzfEzcqKF2ogCaF4QKVbAtuFx7xGwrDUcGd
```

### 示例: 将代币转移给另一个用户，发送者支付接收账户的创建费用

如果接收者尚未拥有关联的代币账户，发送者可以选择资助接收者的账户。  
接收者通过运行 `solana address` 获取他们的钱包地址，并将其提供给发送者。  
然后发送者执行以下操作，以自己的费用为接收者的代币关联账户提供资金，随后将 50 个代币转入其中：

```sh
$ spl-token transfer --fund-recipient AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM 50 vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg

Transfer 50 tokens
  Sender: 7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi
  Recipient: vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg
  Recipient associated token account: F59618aQB8r6asXeMcB9jWuY6NEx1VduT9yFo1GTi1ks
  Funding recipient: F59618aQB8r6asXeMcB9jWuY6NEx1VduT9yFo1GTi1ks (0.00203928 SOL)
Signature: 5a3qbvoJQnTAxGPHCugibZTbSu7xuTgkxvF4EJupRjRXGgZZrnWFmKzfEzcqKF2ogCaF4QKVbAtuFx7xGwrDUcGd
```

### 示例: 将代币转移到指定的接收者代币账户

代币可以转移到特定的接收者代币账户，接收者的代币账户必须已经存在且属于同一种代币类型。

```sh
$ spl-token create-account AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM /path/to/auxiliary_keypair.json

Creating account CqAxDdBRnawzx9q4PYM3wrybLHBhDZ4P6BTV13WsRJYJ
Signature: 4yPWj22mbyLu5mhfZ5WATNfYzTt5EQ7LGzryxM7Ufu7QCVjTE7czZdEBqdKR7vjKsfAqsBdjU58NJvXrTqCXvfWW
```

```sh
$ spl-token accounts AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM -v

Account                                       Token                                         Balance
--------------------------------------------------------------------------------------------------------
7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi  AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM  100
CqAxDdBRnawzx9q4PYM3wrybLHBhDZ4P6BTV13WsRJYJ  AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM  0    (Aux-1*)
```

```sh
$ spl-token transfer AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM 50 CqAxDdBRnawzx9q4PYM3wrybLHBhDZ4P6BTV13WsRJYJ

Transfer 50 tokens
  Sender: 7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi
  Recipient: CqAxDdBRnawzx9q4PYM3wrybLHBhDZ4P6BTV13WsRJYJ

Signature: 5a3qbvoJQnTAxGPHCugibZTbSu7xuTgkxvF4EJupRjRXGgZZrnWFmKzfEzcqKF2ogCaF4QKVbAtuFx7xGwrDUcGd
```

```sh
$ spl-token accounts AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM -v

Account                                       Token                                         Balance
--------------------------------------------------------------------------------------------------------
7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi  AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM  50
CqAxDdBRnawzx9q4PYM3wrybLHBhDZ4P6BTV13WsRJYJ  AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM  50  (Aux-1*)
```

### 示例: 创建非同质化代币

创建没有小数位的代币

```sh
$ spl-token create-token --decimals 0

Creating token 559u4Tdr9umKwft3yHMsnAxohhzkFnUBPAFtibwuZD9z
Signature: 4kz82JUey1B9ki1McPW7NYv1NqPKCod6WNptSkYqtuiEsQb9exHaktSAHJJsm4YxuGNW4NugPJMFX9ee6WA2dXts
```

然后创建一个账户来持有这种新类型的代币:

```sh
$ spl-token create-account 559u4Tdr9umKwft3yHMsnAxohhzkFnUBPAFtibwuZD9z

Creating account 7KqpRwzkkeweW5jQoETyLzhvs9rcCj9dVQ1MnzudirsM
Signature: sjChze6ecaRtvuQVZuwURyg6teYeiH8ZwT6UTuFNKjrdayQQ3KNdPB7d2DtUZ6McafBfEefejHkJ6MWQEfVHLtC
```

现在只铸造一个代币到这个账户，

```sh
$ spl-token mint 559u4Tdr9umKwft3yHMsnAxohhzkFnUBPAFtibwuZD9z 1 7KqpRwzkkeweW5jQoETyLzhvs9rcCj9dVQ1MnzudirsM

Minting 1 tokens
  Token: 559u4Tdr9umKwft3yHMsnAxohhzkFnUBPAFtibwuZD9z
  Recipient: 7KqpRwzkkeweW5jQoETyLzhvs9rcCj9dVQ1MnzudirsM
Signature: 2Kzg6ZArQRCRvcoKSiievYy3sfPqGV91Whnz6SeimhJQXKBTYQf3E54tWg3zPpYLbcDexxyTxnj4QF69ucswfdY
```

禁止未来的铸造：

```sh
$ spl-token authorize 559u4Tdr9umKwft3yHMsnAxohhzkFnUBPAFtibwuZD9z mint --disable

Updating 559u4Tdr9umKwft3yHMsnAxohhzkFnUBPAFtibwuZD9z
  Current mint authority: vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg
  New mint authority: disabled
Signature: 5QpykLzZsceoKcVRRFow9QCdae4Dp2zQAcjebyEWoezPFg2Np73gHKWQicHG1mqRdXu3yiZbrft3Q8JmqNRNqhwU
```

现在 `7KqpRwzkkeweW5jQoETyLzhvs9rcCj9dVQ1MnzudirsM` 账户持有唯一的 `559u4Tdr9umKwft3yHMsnAxohhzkFnUBPAFtibwuZD9z` 代币：

```sh
$ spl-token account-info 559u4Tdr9umKwft3yHMsnAxohhzkFnUBPAFtibwuZD9z

Address: 7KqpRwzkkeweW5jQoETyLzhvs9rcCj9dVQ1MnzudirsM
Balance: 1
Mint: 559u4Tdr9umKwft3yHMsnAxohhzkFnUBPAFtibwuZD9z
Owner: vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg
State: Initialized
Delegation: (not set)
Close authority: (not set)
```

```sh
$ spl-token supply 559u4Tdr9umKwft3yHMsnAxohhzkFnUBPAFtibwuZD9z

1
```

### 多签

在使用 `spl-token` 命令行时，引用多重签名账户的主要区别在于指定 `--owner` 参数。通常由此参数指定的签名者直接提供签名以授权其权限，但在多重签名的情况下，它仅指向多重签名账户的地址。然后由 `--multisig-signer` 参数指定的多重签名成员集提供签名。

多重签名账户可以用于 SPL Token 铸造或代币账户上的任何权限。

- 铸币账户的铸币权限：`spl-token mint ...`,`spl-token authorize ... mint ...`
- 铸币账户的冻结权限：`spl-token freeze ...`,`spl-token thaw ...`,`spl-token authorize ... freeze ...`
- 代币账户的所有者权限：`spl-token transfer ...`,`spl-token approve ...`,`spl-token revoke ...`,`spl-token burn ...`,`spl-token wrap ...`,`spl-token unwrap ...`,`spl-token authorize ... owner ...`
- 代币账户的关闭权限：`spl-token close ...`,`spl-token authorize ... close ...`

### 示例: 使用多重签名权限铸币

首先创建密钥对以充当多重签名者集。在现实中，这些可以是任何支持的签名者，如：Ledger 硬件钱包、密钥对文件或纸钱包。为方便起见，本例中将使用生成的密钥对。

```sh
$ for i in $(seq 3); do solana-keygen new --no-passphrase -so "signer-${i}.json"; done

Wrote new keypair to signer-1.json
Wrote new keypair to signer-2.json
Wrote new keypair to signer-3.json
```

为了创建多重签名账户，必须收集签名者集的公钥。

```sh
$ for i in $(seq 3); do SIGNER="signer-${i}.json"; echo "$SIGNER: $(solana-keygen pubkey "$SIGNER")"; done

signer-1.json: BzWpkuRrwXHq4SSSFHa8FJf6DRQy4TaeoXnkA89vTgHZ
signer-2.json: DhkUfKgfZ8CF6PAGKwdABRL1VqkeNrTSRx8LZfpPFVNY
signer-3.json: D7ssXHrZJjfpZXsmDf8RwfPxe1BMMMmP1CtmX3WojPmG
```

现在可以使用 `spl-token create-multisig` 子命令创建多重签名账户。它的第一个位置参数是必须签名的最小签名者数量（`M`），这些签名者必须签名一笔交易，此交易将影响由此多重签名账户控制的代币/铸币账户。其余位置参数是所有被允许（`N`）为多重签名账户签名的密钥对的公钥。本例将使用“2 of 3”多重签名账户。也就是说，三个被允许的密钥对中的两个必须签署所有交易。

注意：SPL Token 多重签名账户限制为最多 11 个签名者的签名者集（1 <= `N` <= 11），且最小签名者数量不得超过 `N`（1 <= `M` <= `N`）

```sh
$ spl-token create-multisig 2 BzWpkuRrwXHq4SSSFHa8FJf6DRQy4TaeoXnkA89vTgHZ \
DhkUfKgfZ8CF6PAGKwdABRL1VqkeNrTSRx8LZfpPFVNY D7ssXHrZJjfpZXsmDf8RwfPxe1BMMMmP1CtmX3WojPmG

Creating 2/3 multisig 46ed77fd4WTN144q62BwjU2B3ogX3Xmmc8PT5Z3Xc2re
Signature: 2FN4KXnczAz33SAxwsuevqrD1BvikP6LUhLie5Lz4ETt594X8R7yvMZzZW2zjmFLPsLQNHsRuhQeumExHbnUGC9A
```

接下来创建代币铸币和接收账户，并将铸币账户的铸币权限设置为多重签名账户

```sh
$ spl-token create-token

Creating token 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o
Signature: 3n6zmw3hS5Hyo5duuhnNvwjAbjzC42uzCA3TTsrgr9htUonzDUXdK1d8b8J77XoeSherqWQM8mD8E1TMYCpksS2r
```

```sh
$ spl-token create-account 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o

Creating account EX8zyi2ZQUuoYtXd4MKmyHYLTjqFdWeuoTHcsTdJcKHC
Signature: 5mVes7wjE7avuFqzrmSCWneKBQyPAjasCLYZPNSkmqmk2YFosYWAP9hYSiZ7b7NKpV866x5gwyKbbppX3d8PcE9s
```

```sh
$ spl-token authorize 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o mint 46ed77fd4WTN144q62BwjU2B3ogX3Xmmc8PT5Z3Xc2re

Updating 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o
  Current mint authority: 5hbZyJ3KRuFvdy5QBxvE9KwK17hzkAUkQHZTxPbiWffE
  New mint authority: 46ed77fd4WTN144q62BwjU2B3ogX3Xmmc8PT5Z3Xc2re
Signature: yy7dJiTx1t7jvLPCRX5RQWxNRNtFwvARSfbMJG94QKEiNS4uZcp3GhhjnMgZ1CaWMWe4jVEMy9zQBoUhzomMaxC
```

为了证明铸币账户现在受多重签名账户的控制，尝试仅使用一个多重签名者进行铸币会失败

```sh
$ spl-token mint 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o 1 EX8zyi2ZQUuoYtXd4MKmyHYLTjqFdWeuoTHcsTdJcKHC \
--owner 46ed77fd4WTN144q62BwjU2B3ogX3Xmmc8PT5Z3Xc2re \
--multisig-signer signer-1.json

Minting 1 tokens
  Token: 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o
  Recipient: EX8zyi2ZQUuoYtXd4MKmyHYLTjqFdWeuoTHcsTdJcKHC
RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: missing required signature for instruction
```

但是，重复使用第二个多重签名者进行操作，则成功

```sh
$ spl-token mint 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o 1 EX8zyi2ZQUuoYtXd4MKmyHYLTjqFdWeuoTHcsTdJcKHC \
--owner 46ed77fd4WTN144q62BwjU2B3ogX3Xmmc8PT5Z3Xc2re \
--multisig-signer signer-1.json \
--multisig-signer signer-2.json

Minting 1 tokens
  Token: 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o
  Recipient: EX8zyi2ZQUuoYtXd4MKmyHYLTjqFdWeuoTHcsTdJcKHC
Signature: 2ubqWqZb3ooDuc8FLaBkqZwzguhtMgQpgMAHhKsWcUzjy61qtJ7cZ1bfmYktKUfnbMYWTC1S8zdKgU6m4THsgspT
```

### 示例: 离线签名与多签

有时，在线签名可能不可行或不受欢迎。例如，当签名者不在同一地理位置或使用未连接到网络的隔离设备时，就会出现这种情况。在这种情况下，我们使用离线签名，它结合了之前的多重签名示例、离线签名和一个随机账户。

本示例将使用与在线示例相同的铸币账户、代币账户、多重签名账户以及多重签名者设置的密钥对文件名，此外还将创建一个随机账户：

```sh
$ solana-keygen new -o nonce-keypair.json

...
======================================================================
pubkey: Fjyud2VXixk2vCs4DkBpfpsq48d81rbEzh6deKt7WvPj
======================================================================
```

```sh
$ solana create-nonce-account nonce-keypair.json 1

Signature: 3DALwrAAmCDxqeb4qXZ44WjpFcwVtgmJKhV4MW5qLJVtWeZ288j6Pzz1F4BmyPpnGLfx2P8MEJXmqPchX5y2Lf3r
```

```sh
$ solana nonce-account Fjyud2VXixk2vCs4DkBpfpsq48d81rbEzh6deKt7WvPj

Balance: 0.01 SOL
Minimum Balance Required: 0.00144768 SOL
Nonce blockhash: 6DPt2TfFBG7sR4Hqu16fbMXPj8ddHKkbU4Y3EEEWrC2E
Fee: 5000 lamports per signature
Authority: 5hbZyJ3KRuFvdy5QBxvE9KwK17hzkAUkQHZTxPbiWffE
```

对于费用支付者和随机授权者角色，将使用位于 `5hbZyJ3KRuFvdy5QBxvE9KwK17hzkAUkQHZTxPbiWffE` 的本地热钱包。

首先，通过指定所有签名者的公钥来构建一个模板命令。运行此命令后，在输出中，所有签名者将被列为“缺席签名者”。每个离线签名者将运行此命令以生成相应的签名。

注意：--blockhash 参数是指定的持久随机账户中的“Nonce blockhash:”字段。

```sh
$ spl-token mint 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o 1 EX8zyi2ZQUuoYtXd4MKmyHYLTjqFdWeuoTHcsTdJcKHC \
--owner 46ed77fd4WTN144q62BwjU2B3ogX3Xmmc8PT5Z3Xc2re \
--multisig-signer BzWpkuRrwXHq4SSSFHa8FJf6DRQy4TaeoXnkA89vTgHZ \
--multisig-signer DhkUfKgfZ8CF6PAGKwdABRL1VqkeNrTSRx8LZfpPFVNY \
--blockhash 6DPt2TfFBG7sR4Hqu16fbMXPj8ddHKkbU4Y3EEEWrC2E \
--fee-payer 5hbZyJ3KRuFvdy5QBxvE9KwK17hzkAUkQHZTxPbiWffE \
--nonce Fjyud2VXixk2vCs4DkBpfpsq48d81rbEzh6deKt7WvPj \
--nonce-authority 5hbZyJ3KRuFvdy5QBxvE9KwK17hzkAUkQHZTxPbiWffE \
--sign-only \
--mint-decimals 9

Minting 1 tokens
  Token: 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o
  Recipient: EX8zyi2ZQUuoYtXd4MKmyHYLTjqFdWeuoTHcsTdJcKHC

Blockhash: 6DPt2TfFBG7sR4Hqu16fbMXPj8ddHKkbU4Y3EEEWrC2E
Absent Signers (Pubkey):
 5hbZyJ3KRuFvdy5QBxvE9KwK17hzkAUkQHZTxPbiWffE
 BzWpkuRrwXHq4SSSFHa8FJf6DRQy4TaeoXnkA89vTgHZ
 DhkUfKgfZ8CF6PAGKwdABRL1VqkeNrTSRx8LZfpPFVNY
```

接下来，每个离线签名者执行模板命令，将他们公钥的每个实例替换为相应的密钥对

```sh
$ spl-token mint 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o 1 EX8zyi2ZQUuoYtXd4MKmyHYLTjqFdWeuoTHcsTdJcKHC \
--owner 46ed77fd4WTN144q62BwjU2B3ogX3Xmmc8PT5Z3Xc2re \
--multisig-signer signer-1.json \
--multisig-signer DhkUfKgfZ8CF6PAGKwdABRL1VqkeNrTSRx8LZfpPFVNY \
--blockhash 6DPt2TfFBG7sR4Hqu16fbMXPj8ddHKkbU4Y3EEEWrC2E \
--fee-payer 5hbZyJ3KRuFvdy5QBxvE9KwK17hzkAUkQHZTxPbiWffE \
--nonce Fjyud2VXixk2vCs4DkBpfpsq48d81rbEzh6deKt7WvPj \
--nonce-authority 5hbZyJ3KRuFvdy5QBxvE9KwK17hzkAUkQHZTxPbiWffE \
--sign-only \
--mint-decimals 9

Minting 1 tokens
  Token: 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o
  Recipient: EX8zyi2ZQUuoYtXd4MKmyHYLTjqFdWeuoTHcsTdJcKHC

Blockhash: 6DPt2TfFBG7sR4Hqu16fbMXPj8ddHKkbU4Y3EEEWrC2E
Signers (Pubkey=Signature):
 BzWpkuRrwXHq4SSSFHa8FJf6DRQy4TaeoXnkA89vTgHZ=2QVah9XtvPAuhDB2QwE7gNaY962DhrGP6uy9zeN4sTWvY2xDUUzce6zkQeuT3xg44wsgtUw2H5Rf8pEArPSzJvHX
Absent Signers (Pubkey):
 5hbZyJ3KRuFvdy5QBxvE9KwK17hzkAUkQHZTxPbiWffE
 DhkUfKgfZ8CF6PAGKwdABRL1VqkeNrTSRx8LZfpPFVNY
```

```sh
$ spl-token mint 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o 1 EX8zyi2ZQUuoYtXd4MKmyHYLTjqFdWeuoTHcsTdJcKHC \
--owner 46ed77fd4WTN144q62BwjU2B3ogX3Xmmc8PT5Z3Xc2re \
--multisig-signer BzWpkuRrwXHq4SSSFHa8FJf6DRQy4TaeoXnkA89vTgHZ \
--multisig-signer signer-2.json \
--blockhash 6DPt2TfFBG7sR4Hqu16fbMXPj8ddHKkbU4Y3EEEWrC2E \
--fee-payer 5hbZyJ3KRuFvdy5QBxvE9KwK17hzkAUkQHZTxPbiWffE \
--nonce Fjyud2VXixk2vCs4DkBpfpsq48d81rbEzh6deKt7WvPj \
--nonce-authority 5hbZyJ3KRuFvdy5QBxvE9KwK17hzkAUkQHZTxPbiWffE \
--sign-only \
--mint-decimals 9

Minting 1 tokens
  Token: 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o
  Recipient: EX8zyi2ZQUuoYtXd4MKmyHYLTjqFdWeuoTHcsTdJcKHC
Blockhash: 6DPt2TfFBG7sR4Hqu16fbMXPj8ddHKkbU4Y3EEEWrC2E
Signers (Pubkey=Signature):
DhkUfKgfZ8CF6PAGKwdABRL1VqkeNrTSRx8LZfpPFVNY=2brZbTiCfyVYSCp6vZE3p7qCDeFf3z1JFmJHPBrz8SnWSDZPjbpjsW2kxFHkktTNkhES3y6UULqS4eaWztLW7FrU
Absent Signers (Pubkey):
 5hbZyJ3KRuFvdy5QBxvE9KwK17hzkAUkQHZTxPbiWffE
 BzWpkuRrwXHq4SSSFHa8FJf6DRQy4TaeoXnkA89vTgHZ
```

最后，离线签名者将他们命令输出中的 `Pubkey=Signature` 对广播到所在集群。广播方修改模板命令后，将按照以下方式运行：

1. 将任何相应的公钥替换为他们的密钥对（在此示例中为 `--fee-payer ...` 和 `--nonce-authority ...`）
2. 移除 `--sign-only` 参数，以及在 `mint` 子命令的情况下，移除 `--mint-decimals ...` 参数，因为这将从集群查询
3. 通过 `--signer` 参数将离线签名添加到模板命令中

```sh
$ spl-token mint 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o 1 EX8zyi2ZQUuoYtXd4MKmyHYLTjqFdWeuoTHcsTdJcKHC \
--owner 46ed77fd4WTN144q62BwjU2B3ogX3Xmmc8PT5Z3Xc2re \
--multisig-signer BzWpkuRrwXHq4SSSFHa8FJf6DRQy4TaeoXnkA89vTgHZ \
--multisig-signer DhkUfKgfZ8CF6PAGKwdABRL1VqkeNrTSRx8LZfpPFVNY \
--blockhash 6DPt2TfFBG7sR4Hqu16fbMXPj8ddHKkbU4Y3EEEWrC2E \
--fee-payer hot-wallet.json \
--nonce Fjyud2VXixk2vCs4DkBpfpsq48d81rbEzh6deKt7WvPj \
--nonce-authority hot-wallet.json \
--signer BzWpkuRrwXHq4SSSFHa8FJf6DRQy4TaeoXnkA89vTgHZ=2QVah9XtvPAuhDB2QwE7gNaY962DhrGP6uy9zeN4sTWvY2xDUUzce6zkQeuT3xg44wsgtUw2H5Rf8pEArPSzJvHX \
--signer DhkUfKgfZ8CF6PAGKwdABRL1VqkeNrTSRx8LZfpPFVNY=2brZbTiCfyVYSCp6vZE3p7qCDeFf3z1JFmJHPBrz8SnWSDZPjbpjsW2kxFHkktTNkhES3y6UULqS4eaWztLW7FrU

Minting 1 tokens
  Token: 4VNVRJetwapjwYU8jf4qPgaCeD76wyz8DuNj8yMCQ62o
  Recipient: EX8zyi2ZQUuoYtXd4MKmyHYLTjqFdWeuoTHcsTdJcKHC
Signature: 2AhZXVPDBVBxTQLJohyH1wAhkkSuxRiYKomSSXtwhPL9AdF3wmhrrJGD7WgvZjBPLZUFqWrockzPp9S3fvzbgicy
```

## JSON RPC 方法

SPL token 程序提供了一套丰富的 JSON RPC 方法：

- `getTokenAccountBalance` - 获取代币账户余额
- `getTokenAccountsByDelegate` - 通过委托人获取代币账户
- `getTokenAccountsByOwner` - 通过所有者获取代币账户
- `getTokenLargestAccounts` - 获取最大的代币账户
- `getTokenSupply` - 获取代币供应量

更多详细信息请查看 [https://docs.solana.com/apps/jsonrpc-api](https://docs.solana.com/apps/jsonrpc-api)。

此外，`getProgramAccounts` JSON RPC 方法可以多种方式获取感兴趣的 SPL 代币账户。

### 查找指定代币铸造的所有代币账户

要查找 `TESTpKgj42ya3st2SQTKiANjTBmncQSCqLAZGcSPLGM` 铸造的所有代币账户，请使用以下方法：

```sh
curl http://api.mainnet-beta.solana.com -X POST -H "Content-Type: application/json" -d '
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getProgramAccounts",
    "params": [
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      {
        "encoding": "jsonParsed",
        "filters": [
          {
            "dataSize": 165
          },
          {
            "memcmp": {
              "offset": 0,
              "bytes": "TESTpKgj42ya3st2SQTKiANjTBmncQSCqLAZGcSPLGM"
            }
          }
        ]
      }
    ]
  }
'
```

"dataSize": 165 过滤器筛选所有的 [代币账户](https://github.com/solana-labs/solana-program-library/blob/08d9999f997a8bf38719679be9d572f119d0d960/token/program/src/state.rs#L86-L106)，"memcmp": ... 过滤器可根据代币账户中的 [铸造](https://github.com/solana-labs/solana-program-library/blob/08d9999f997a8bf38719679be9d572f119d0d960/token/program/src/state.rs#L88)地址进行筛选。

### 查找指定钱包地址包含的所有代币账户

查找`vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg`钱包地址拥有的所有代币账户

```sh
curl http://api.mainnet-beta.solana.com -X POST -H "Content-Type: application/json" -d '
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getProgramAccounts",
    "params": [
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      {
        "encoding": "jsonParsed",
        "filters": [
          {
            "dataSize": 165
          },
          {
            "memcmp": {
              "offset": 32,
              "bytes": "vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg"
            }
          }
        ]
      }
    ]
  }
'
```

"dataSize": 165 过滤器筛选所有的 [代币账户](https://github.com/solana-labs/solana-program-library/blob/08d9999f997a8bf38719679be9d572f119d0d960/token/program/src/state.rs#L86-L106)，"memcmp": ... 过滤器可根据每个代币账户中的[所有者](https://github.com/solana-labs/solana-program-library/blob/08d9999f997a8bf38719679be9d572f119d0d960/token/program/src/state.rs#L90) 地址进行选择。

## 操作概述

### 创建一种新的代币

可以通过使用 `InitializeMint` 指令初始化一个新的代币铸造功能，从而创建新的代币类型。代币铸造功能用于创建或“铸造”新代币，这些代币存储在账户中。每个账户都与特定的铸造账户关联，这意味着此代币类型的总供应量等于所有关联账户的余额之和。

需要注意的是，`InitializeMint` 指令不要求被初始化的 Solana 账户也必须是签名者。通过在同一交易中包含两条指令，可以实现`InitializeMint` 指令与创建 Solana 账户的系统指令一起被原子执行。

一旦代币铸造功能被初始化，`mint_authority` 可以使用 `MintTo` 指令创建新代币。只要 Mint 包含有效的 `mint_authority`，就认为该 Mint 具有非固定供应量，并且 `mint_authority` 可以随时使用 `MintTo` 指令创建新代币。可以使用 `SetAuthority` 指令不可逆地将 Mint 的权限设置为 `None`，从而使 Mint 的供应量固定，将不再能够铸造更多的代币。

通过发出 `Burn` 指令，可以随时减少代币供应量，该指令将从账户中移除并丢弃代币。

### 创建账户

账户持有代币余额，可使用 `InitializeAccount` 指令创建。每个账户都有一个所有者，在某些指令中必须作为签名者出现。

账户的所有者可以使用 `SetAuthority` 指令将账户的所有权转移给另一个人。

需要注意的是，`InitializeAccount` 指令不要求被初始化的 Solana 账户也必须是签名者。`InitializeAccount` 指令应与创建 Solana 账户的系统指令一起被原子处理，通过在同一交易中包含这两个指令来实现。

### 转移代币

可以使用 `Transfer` 指令在账户之间转移余额。当源账户和目标账户不同时，源账户的所有者必须在 `Transfer` 指令中作为签名者出现。

需要注意的是，当 `Transfer` 的源和目的地**相同**时，`Transfer` 将 _总是_ 成功。因此，成功的 `Transfer` 并不一定意味着涉及的账户是有效的 SPL 代币账户，即使移动了任何代币，或者源账户作为签名者出现。我们强烈建议开发者在程序中调用 `Transfer` 指令之前仔细检查源和目的地是否**不同**。

### 燃烧代币

`Burn` 指令减少账户的代币余额，而不将其转移到另一个账户，从而永久地将代币从流通中移除。

链上没有其他方法可以减少供应量。这类似于转账到一个未知私钥的账户或销毁一个私钥。但是，使用 `Burn` 指令进行销毁的行为更为明确，并且可以由任何方在链上确认。

### 权限委托

账户所有者可以使用 `Approve` 指令委托其部分或全部代币余额的操作权限。被委托的权限者可以转移或销毁他们被委托的代币。账户所有者可以通过 `Revoke` 指令撤销权限委托。

### 多重签名

Solana 支持 M of N 多重签名，可在 Mint 权限、账户所有者或代理委托中使用。多重签名权限必须使用 `InitializeMultisig` 指令进行初始化。初始化时需要指定 N 个有效的公钥集合以及合法授权所需的签名者数量 M 。

需要注意的是，`InitializeMultisig` 指令不要求被初始化的 Solana 账户也必须是签名者。`InitializeMultisig` 指令应与创建 Solana 账户的系统指令一起原子处理，通过在同一交易中包含这两个指令来实现。

### 冻结账户

代币铸造时还可以包含 `freeze_authority` 权限，该权限可以用来发布 `FreezeAccount` 指令，使一个账户变得无法使用。与被冻结账户有关的代币指令执行将会失败，直到使用 `ThawAccount` 指令解冻该账户。使用 `SetAuthority` 指令可以更改 `freeze_authority` 权限。如果将 `freeze_authority` 权限设置为 `None`，那么账户的冻结和解冻功能将被永久禁用，并且所有当前冻结的账户也将永久保持冻结状态。

### 封装 SOL

代币程序可以用来封装原生 SOL。这样做可以使原生 SOL 被视为任何其他代币程序代币类型，并且在被其他与代币程序接口交互的程序调用时非常有用。

包含封装 SOL 的账户与一个特定的 铸造账户（称为“原生 Mint”）关联，账户的公钥为 `So11111111111111111111111111111111111111112`。

原生 Mint 账户具有一些独特的行为：

- `InitializeAccount` 将初始化账户的余额，余额被初始化的 Solana 账户的 SOL 余额，使得代币余额等于 SOL 余额。
- 转账不仅修改代币余额，还会从源账户向目标账户转移等额的 SOL。
- 不支持销毁
- 关闭账户时，余额可能是非零的。

无论当前有多少 SOL 被包装，原生 Mint 账户的 SOL 供应量始终显示为 0。

### 租金豁免

为确保网络存储资源的有效管理，Solana 代币账户、铸币账户、多签账户等必须包含足够的 SOL 以达到 [租金豁免](https://docs.solana.com/implemented-proposals/rent) 的最低要求

### 关闭账户

可以使用 `CloseAccount` 指令关闭一个账户。关闭账户时，所有剩余的 SOL 将被转移到另一个 Solana 账户（不必与代币程序关联）。非原生账户必须余额为零才能被关闭。

### 非同质化代币

非同质化代币（NFT）是一种只铸造了一枚代币的代币类型。

## 钱包集成指南

本节描述如何将 SPL Token 集成到已支持原生 SOL 的现有钱包中。它假设了一个模型，其中用户有一个单一的系统账户作为他们的**主钱包地址**，用于发送和接收 SOL。

虽然所有 SPL Token 账户在链上确实都有自己的地址，但没有必要向用户显示这些额外的地址。

钱包使用了两个程序：

- SPL Token 程序：所有 SPL Token 都使用的通用程序
- [SPL 关联代币账户](https://spl.solana.com/associated-token-account)程序：定义了将用户的钱包地址映射到他们持有的关联代币账户的约定和机制。

### 如何获取和显示代币持有情况

可以使用 [getTokenAccountsByOwner](https://docs.solana.com/apps/jsonrpc-api#gettokenaccountsbyowner) JSON RPC 方法来获取某个钱包地址的所有代币账户。

对于每个代币铸造，钱包可能拥有多个代币账户：关联代币账户和/或其他辅助代币账户。

按照惯例，建议钱包将同一代币铸造的所有代币账户的余额合并成单个余额显示给用户，以屏蔽这些复杂性。

有关如何为用户清理辅助代币账户的建议，请参见[回收辅助代币账户](#回收辅助代币账户)部分。

### 关联代币账户

在用户可以接收代币之前，必须在链上创建他们的关联代币账户，这需要少量的 SOL 来将账户标记为免租金。

创建用户的关联代币账户没有限制。它可以由钱包代表用户创建，或者通过空投活动由第三方资助。

创建过程在[此处](https://spl.solana.com/associated-token-account#creating-an-associated-token-account)有描述。

强烈建议钱包在向用户表明他们能够接收该种类的 SPL 代币之前（通常通过向用户显示他们的接收地址来完成），为给定的 SPL 代币自身创建关联代币账户。选择不执行此步骤的钱包可能会限制其用户从其他钱包接收 SPL 代币的能力。

#### 示例：“添加代币”流程

当用户想要接收某种类型的 SPL 代币时，他们应首先为他们的关联代币账户充值，目的是：

1. 最大化与其他钱包实现的互操作性
2. 避免将创建他们的关联代币账户的成本推给首位发送者

钱包应提供一个允许用户“添加代币”的用户界面。用户选择代币类型，并且将被展示添加该代币所需的 SOL 成本。

用户确认后，钱包将按照[此处](https://spl.solana.com/associated-token-account#creating-an-associated-token-account)描述创建相应类型的关联代币账户。

#### 示例：“空投活动”流程

对于每个接收者钱包地址，发送包含以下内容的交易：

1. 代表接收者创建关联代币账户。
2. 使用 `TokenInstruction::Transfer` 来完成转账。

#### 关联代币账户所有权

⚠️ 钱包应该永远不使用 `TokenInstruction::SetAuthority` 来将关联代币账户的 `AccountOwner` 权限设置为另一个地址。

### 辅助代币账户

任何时候，现有的 SPL 代币账户的所有权都可以分配给用户。实现这一点的方式是使用 `spl-token authorize <TOKEN_ADDRESS> owner <USER_ADDRESS>` 命令。钱包应该准备好优雅地管理那些它们自己没有为用户创建的代币账户。

### 钱包之间转移代币

在钱包之间转移代币的首选方法是将代币转移到接收者的关联代币账户中。

接收者必须向发送者提供他们的主钱包地址。然后发送者：

1. 推导出接收者的关联代币账户
2. 通过 RPC 获取接收者的关联代币账户并检查其是否存在
3. 如果接收者的关联代币账户尚未存在，发送者钱包应按照[此处](https://spl.solana.com/associated-token-account#creating-an-associated-token-account)描述创建接收者的关联代币账户。发送者钱包可以选择通知用户，由于账户创建，转账将需要比平常更多的 SOL。然而，选择此时不支持创建接收者关联代币账户的钱包应向用户展示足够的信息，以找到解决方案来实现他们的目标
4. 使用 `TokenInstruction::Transfer` 完成转账

发送者的钱包在允许转账前，不得要求接收者的主钱包地址持有余额。

### 注册代币信息

目前存在一些代币信息注册的解决方案：

- 钱包或 dapp 中硬编码的地址
- Metaplex 代币元数据。在 [Token Metadata Documentation](https://docs.metaplex.com/programs/token-metadata/) 了解更多信息
- 已弃用的 token-list 仓库有[创建自己的元数据的说明](https://github.com/solana-labs/token-list#this-repository-is-eol-)

**一个去中心化的解决方案正在进行中。**

### 回收辅助代币账户

钱包应尽快将辅助代币账户中的资金转移至用户的关联代币账户，以清空这些账户。这样做主要有两个目的：

- 如果用户是辅助账户的关闭权限方，钱包可以通过关闭账户为用户回收 SOL。
- 如果辅助账户是由第三方资助的，一旦账户被清空，该第三方可以关闭账户并回收 SOL。

清理辅助代币账户的一个自然时机是用户下次发送代币时。可以将额外的指令添加到现有交易中，而无需支付额外费用。

清理步骤：

1. 对于所有非空的辅助代币账户，添加 `TokenInstruction::Transfer` 指令，将全部代币转移至用户的关联代币账户。
2. 对于所有空的辅助代币账户，如果用户是关闭权限方，添加 `TokenInstruction::CloseAccount` 指令。

如果添加一个或多个清理指令导致交易超过允许的最大交易大小，去掉那些额外的清理指令。它们可以在下一次发送操作时进行清理。

`spl-token gc` 命令提供了这一清理过程的示例实现。

### 代币解锁

目前有两种解决方案可用于解锁 SPL 代币：

#### 1) Bonfida 解锁

此程序允许您锁定任意 SPL 代币，并根据确定的解锁计划释放锁定的代币。解锁计划由 `unix 时间戳` 和一个代币 `数量` 组成，当初始化归属合约时，创建者可以传递一个任意大小的 `解锁计划` 数组，赋予合约创建者完全控制代币随时间解锁的方式。

通过在智能合约上推动一个无需权限的曲柄来完成解锁，该操作会将代币移动到预先指定的地址。解锁合约的接收地址可以由当前接收地址的所有者修改，这意味着可以交易被锁定的代币。

- 代码：[https://github.com/Bonfida/token-vesting](https://github.com/Bonfida/token-vesting)
- 用户界面：[https://vesting.bonfida.com/#/](https://vesting.bonfida.com/#/)
- 审计：审计由 Kudelski 执行，报告可在[此处](https://github.com/Bonfida/token-vesting/blob/master/audit/Bonfida_SecurityAssessment_Vesting_Final050521.pdf)找到

#### 2) Streamflow 时间锁

使创建、提取、取消和转移基于时间锁定和托管账户的解锁合约成为可能。合约默认可由创建者取消并由接收者转移。

解锁合约的创建者在创建时可以选择各种选项，如：

- 要解锁的 SPL 代及其数量
- 接收者
- 确切的开始和结束日期
- （可选）悬崖日期和数量
- （可选）释放频率

即将推出：

- 合约是否可由创建者/接收者转移
- 合约是否可由创建者/接收者取消
- 主题/备忘录

资源:

- 审计：报告可在[此处](https://github.com/StreamFlow-Finance/timelock/blob/community/TIMELOCK_IMPLEMENTATION_COMMUNITY_REPORT_FINAL.pdf)和[此处](https://github.com/StreamFlow-Finance/timelock-crate/blob/community/TIMELOCK_COMMUNITY_REPORT_FINAL.pdf)找到。
- 带有用户界面的应用程序：[https://app.streamflow.finance/vesting](https://app.streamflow.finance/vesting)
- JS SDK：[https://npmjs.com/@streamflow/timelock](https://npmjs.com/@streamflow/timelock)（[源代码](https://github.com/StreamFlow-Finance/timelock/tree/master/packages/timelock)）
- Rust SDK：[https://crates.io/crates/streamflow-timelock](https://crates.io/crates/streamflow-timelock)（[源代码](https://github.com/streamflow-finance/timelock-crate)）
- 程序代码：[https://github.com/streamflow-finance/timelock](https://github.com/streamflow-finance/timelock)
