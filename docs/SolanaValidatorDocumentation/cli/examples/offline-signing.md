# Solana CLI 的离线交易签名

某些安全模型要求将签名密钥，及签名过程与交易创建和网络广播分离开来。例如：

+ 在[多签方案](https://spl.solana.com/token#multisig-usage)中，从地理上分散的签名者处收集签名
+ 使用[隔离](https://en.wikipedia.org/wiki/Air_gap_(networking))的签名设备签署交易

本文档描述了如何使用 Solana CLI 的单独签名和提交交易。

## 支持离线签名的命令

目前，以下命令支持离线签名：

- [`create-stake-account`](https://docs.solanalabs.com/cli/usage#solana-create-stake-account) （创建质押账户）
- [`create-stake-account-checked`](https://docs.solanalabs.com/cli/usage#solana-create-stake-account-checked) （创建校验过的质押账户）
- [`deactivate-stake`](https://docs.solanalabs.com/cli/usage#solana-deactivate-stake) （停用质押）
- [`delegate-stake`](https://docs.solanalabs.com/cli/usage#solana-delegate-stake) （委托质押）
- [`split-stake`](https://docs.solanalabs.com/cli/usage#solana-split-stake)（分割质押）
- [`stake-authorize`](https://docs.solanalabs.com/cli/usage#solana-stake-authorize)（授权质押）
- [`stake-authorize-checked`](https://docs.solanalabs.com/cli/usage#solana-stake-authorize-checked) （已授权的质押授权）
- [`stake-set-lockup`](https://docs.solanalabs.com/cli/usage#solana-stake-set-lockup) （设置质押锁定期）
- [`stake-set-lockup-checked`](https://docs.solanalabs.com/cli/usage#solana-stake-set-lockup-checked) （设置校验过的质押锁定期）
- [`transfer`](https://docs.solanalabs.com/cli/usage#solana-transfer)（转账）
- [`withdraw-stake`](https://docs.solanalabs.com/cli/usage#solana-withdraw-stake) （提取质押）
- [`create-vote-account`](https://docs.solanalabs.com/cli/usage#solana-create-vote-account) （创建投票账户）
- [`vote-authorize-voter`](https://docs.solanalabs.com/cli/usage#solana-vote-authorize-voter) （投票者授权）
- [`vote-authorize-voter-checked`](https://docs.solanalabs.com/cli/usage#solana-vote-authorize-voter-checked) （校验过的投票者授权）
- [`vote-authorize-withdrawer`](https://docs.solanalabs.com/cli/usage#solana-vote-authorize-withdrawer) （授权提款人）
- [`vote-authorize-withdrawer-checked`](https://docs.solanalabs.com/cli/usage#solana-vote-authorize-withdrawer-checked) （已验证的提款人授权）
- [`vote-update-commission`](https://docs.solanalabs.com/cli/usage#solana-vote-update-commission) （更新委托投票）
- [`vote-update-validator`](https://docs.solanalabs.com/cli/usage#solana-vote-update-validator) （更新投票验证者）
- [`withdraw-from-vote-account`](https://docs.solanalabs.com/cli/usage#solana-withdraw-from-vote-account) （从投票账户提取资金）

## 离线签名交易

要离线签名交易，请在命令行中传递以下参数：

1. `--sign-only`：防止客户端将已签名的交易提交到网络。相反，公钥/签名 对将打印到标准输出（stdout）。
2. `--blockhash BASE58_HASH` ，允许调用者指定用于填充交易 `recent_blockhash` 字段的值。这样做有几个目的，即：消除了通过 RPC 连接到网络并查询最近的 blockhash 的需要，使签名者能够在多签名方案中协调 blockhash。

### 示例：离线签名支付

命令：

```bash
solana@offline$ solana transfer --sign-only --blockhash 5Tx8F3jgSHx21CbtjwmdaKPLM5tWmreWAnPrbqHomSJF \
    recipient-keypair.json 1
```

输出：

```bash
Blockhash: 5Tx8F3jgSHx21CbtjwmdaKPLM5tWmreWAnPrbqHomSJF
Signers (Pubkey=Signature):
  FhtzLVsmcV7S5XqGD79ErgoseCLhZYmEZnz9kQg1Rp7j=4vC38p4bz7XyiXrk6HtaooUqwxTWKocf45cstASGtmrD398biNJnmTcUCVEojE7wVQvgdYbjHJqRFZPpzfCQpmUN

{"blockhash":"5Tx8F3jgSHx21CbtjwmdaKPLM5tWmreWAnPrbqHomSJF","signers":["FhtzLVsmcV7S5XqGD79ErgoseCLhZYmEZnz9kQg1Rp7j=4vC38p4bz7XyiXrk6HtaooUqwxTWKocf45cstASGtmrD398biNJnmTcUCVEojE7wVQvgdYbjHJqRFZPpzfCQpmUN"]}'
```

## 提交离线签名交易到网络

要将离线签名的交易提交到网络，需要在命令行中传入以下参数：

1. `--blockhash BASE58_HASH` ，必须与用于签名的区块哈希（blockhash）相同
2. `--signer BASE58_PUBKEY=BASE58_SIGNATURE`：每个离线签名者一个。直接在交易中包含 公钥/签名 对，而不是使用任何本地密钥对进行签名。

### 示例：提交离线签名支付

命令：

```bash
solana@online$ solana transfer --blockhash 5Tx8F3jgSHx21CbtjwmdaKPLM5tWmreWAnPrbqHomSJF \
    --signer FhtzLVsmcV7S5XqGD79ErgoseCLhZYmEZnz9kQg1Rp7j=4vC38p4bz7XyiXrk6HtaooUqwxTWKocf45cstASGtmrD398biNJnmTcUCVEojE7wVQvgdYbjHJqRFZPpzfCQpmUN
    recipient-keypair.json 1
```

输出：

```bash
4vC38p4bz7XyiXrk6HtaooUqwxTWKocf45cstASGtmrD398biNJnmTcUCVEojE7wVQvgdYbjHJqRFZPpzfCQpmUN
```

## 多会话离线签名

离线签名也可以在多个会话中进行。在这种情况下，为每个角色传递缺席签名者的公钥。所有指定但未生成签名的公钥将在离线签名输出中列为缺席。

### 示例：使用两个离线签名会话的转账

命令（离线会话 #1）：

```bash
solana@offline1$ solana transfer Fdri24WUGtrCXZ55nXiewAj6RM18hRHPGAjZk3o6vBut 10 \
    --blockhash 7ALDjLv56a8f6sH6upAZALQKkXyjAwwENH9GomyM8Dbc \
    --sign-only \
    --keypair fee_payer.json \
    --from 674RgFMgdqdRoVtMqSBg7mHFbrrNm1h1r721H1ZMquHL
```

输出（离线会话 #1）：

```bash
Blockhash: 7ALDjLv56a8f6sH6upAZALQKkXyjAwwENH9GomyM8Dbc
Signers (Pubkey=Signature):
  3bo5YiRagwmRikuH6H1d2gkKef5nFZXE3gJeoHxJbPjy=ohGKvpRC46jAduwU9NW8tP91JkCT5r8Mo67Ysnid4zc76tiiV1Ho6jv3BKFSbBcr2NcPPCarmfTLSkTHsJCtdYi
Absent Signers (Pubkey):
  674RgFMgdqdRoVtMqSBg7mHFbrrNm1h1r721H1ZMquHL
```

命令（离线会话 #2）：

```bash
solana@offline2$ solana transfer Fdri24WUGtrCXZ55nXiewAj6RM18hRHPGAjZk3o6vBut 10 \
    --blockhash 7ALDjLv56a8f6sH6upAZALQKkXyjAwwENH9GomyM8Dbc \
    --sign-only \
    --keypair from.json \
    --fee-payer 3bo5YiRagwmRikuH6H1d2gkKef5nFZXE3gJeoHxJbPjy
```

输出（离线会话 #2）：

```bash
Blockhash: 7ALDjLv56a8f6sH6upAZALQKkXyjAwwENH9GomyM8Dbc
Signers (Pubkey=Signature):
  674RgFMgdqdRoVtMqSBg7mHFbrrNm1h1r721H1ZMquHL=3vJtnba4dKQmEAieAekC1rJnPUndBcpvqRPRMoPWqhLEMCty2SdUxt2yvC1wQW6wVUa5putZMt6kdwCaTv8gk7sQ
Absent Signers (Pubkey):
  3bo5YiRagwmRikuH6H1d2gkKef5nFZXE3gJeoHxJbPjy
```

命令（在线提交）：

```bash
solana@online$ solana transfer Fdri24WUGtrCXZ55nXiewAj6RM18hRHPGAjZk3o6vBut 10 \
    --blockhash 7ALDjLv56a8f6sH6upAZALQKkXyjAwwENH9GomyM8Dbc \
    --from 674RgFMgdqdRoVtMqSBg7mHFbrrNm1h1r721H1ZMquHL \
    --signer 674RgFMgdqdRoVtMqSBg7mHFbrrNm1h1r721H1ZMquHL=3vJtnba4dKQmEAieAekC1rJnPUndBcpvqRPRMoPWqhLEMCty2SdUxt2yvC1wQW6wVUa5putZMt6kdwCaTv8gk7sQ \
    --fee-payer 3bo5YiRagwmRikuH6H1d2gkKef5nFZXE3gJeoHxJbPjy \
    --signer 3bo5YiRagwmRikuH6H1d2gkKef5nFZXE3gJeoHxJbPjy=ohGKvpRC46jAduwU9NW8tP91JkCT5r8Mo67Ysnid4zc76tiiV1Ho6jv3BKFSbBcr2NcPPCarmfTLSkTHsJCtdYi
```

输出（在线提交）：

```bash
ohGKvpRC46jAduwU9NW8tP91JkCT5r8Mo67Ysnid4zc76tiiV1Ho6jv3BKFSbBcr2NcPPCarmfTLSkTHsJCtdYi
```

### 延长签名时间

通常，Solana 交易必须在其 `recent_blockhash` 字段中的区块哈希对应的一定数量的插槽内（截至本文编写时约为 1 分钟）签名并被网络接受。如果您的签名过程需要更长时间，可以使用[持久化交易随机数](https://docs.solanalabs.com/cli/examples/durable-nonce)（Durable Transaction Nonce）来获得所需的额外时间。

