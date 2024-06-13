# 将 Solana 添加到您的交易所

本指南介绍了如何将 Solana 的原生代币 SOL 添加到您的加密货币交易所。

## 节点设置

我们强烈建议在高性能计算机或云实例上至少设置两个节点，及时升级到新版本，并使用捆绑的监控工具监控服务运行情况。

这种设置使您能够:

- 自行管理连接到 Solana 主网Beta版 集群的网关，以获取数据并提交提现交易
- 完全控制保留的历史区块数据量
- 即使一个节点故障也能保持服务可用性

Solana 节点需要相对较高的计算能力来处理快速的区块和高 TPS。具体要求请查看
[硬件推荐](https://docs.solanalabs.com/operations/requirements).

运行 API 节点:

1. [安装 Solana 命令行工具套件](https://docs.solanalabs.com/cli/install)
2. 使用以下参数启动验证者：

```shell
solana-validator \
  --ledger <LEDGER_PATH> \
  --identity <VALIDATOR_IDENTITY_KEYPAIR> \
  --entrypoint <CLUSTER_ENTRYPOINT> \
  --expected-genesis-hash <EXPECTED_GENESIS_HASH> \
  --rpc-port 8899 \
  --no-voting \
  --enable-rpc-transaction-history \
  --limit-ledger-size \
  --known-validator <VALIDATOR_ADDRESS> \
  --only-known-rpc
```

自定义 `--ledger` 到你所需的账本存储位置，并将 `--rpc-port` 设置为你想要暴露的端口。

`--entrypoint` 和 `--expected-genesis-hash` 参数都是针对你要加入的集群而定的。
[当前主网参数](https://docs.solanalabs.com/clusters/available#example-solana-validator-command-line-2)

`--limit-ledger-size` 参数允许你指定节点在磁盘上保留多少账本分片（shreds）。如果不包括此参数，验证者将保留整个账本，直到磁盘空间耗尽。默认值会尝试将账本磁盘使用量保持在500GB以下。可以通过为 `--limit-ledger-size` 添加参数来请求更多或更少的磁盘使用量。如果需要，请查看 `solana-validator --help` 以获取 `--limit-ledger-size` 使用的默认限制值。有关选择自定义限制值的更多信息，请参阅[此处](https://github.com/solana-labs/solana/blob/583cec922b6107e0f85c7e14cb5e642bc7dfb340/core/src/ledger_cleanup_service.rs#L15-L26)

指定一个或多个 `--known-validator` 参数可以保护您免受从恶意快照启动的风险。
[关于使用已知验证者启动的参数值的更多信息](https://docs.solanalabs.com/operations/guides/validator-start#known-validators)

可选参数供参考:

- `--private-rpc` 防止您的 RPC 端口被其他节点公开使用。
- `--rpc-bind-address` 允许您指定一个不同的 IP 地址来绑定 RPC 端口。

### 自动重启和监控

我们建议配置每个节点在退出时自动重启，以确保尽可能少地丢失数据。将 Solana 软件作为 systemd 服务运行是一个不错的选择。

用于监控，我们提供
[`solana-watchtower`](https://github.com/solana-labs/solana/blob/master/watchtower/README.md),
对于监控，我们提供 solana-watchtower，可以监控你的验证者并检测 solana-validator 进程是否不健康。它可以直接配置为通过 Slack、Telegram、Discord 或 Twilio 向你发出警报。详细信息请运行 `solana-watchtower --help`。

```shell
solana-watchtower --validator-identity <YOUR VALIDATOR IDENTITY>
```

::: tip INFO
更多关于[Solana Watchwer 的最佳实践](https://docs.solanalabs.com/operations/best-practices/monitoring#solana-watchtower)信息，请参见文档。
:::

#### 新软件发布公告

我们频繁发布新软件（大约每周 1 次）。有时更新版本会包含不兼容的协议更改，因此需要及时更新软件以避免处理区块时出错。

我们所有发布类型的官方公告（正常和安全）通过名为 `#mb-announcement`（`mb` 代表 `mainnet-beta`）的 [Discord](https://solana.com/discord) 频道进行沟通的。

像质押的验证者一样，我们期望任何交易所运营的验证者在正常发布公告后的一两个工作日内尽快更新。对于与安全相关的发布，可能需要采取更紧急的措施。

### 账本连续性

默认情况下，你的每个节点都会从你的已知验证者之一提供的快照启动。这个快照反映了链的当前状态，但不包含完整的历史账本。如果其中一个节点退出并从新的快照启动，该节点上的账本可能会出现缺口。为了防止此问题，可以在 `solana-validator` 命令中添加 `--no-snapshot-fetch` 参数，以接收历史账本数据而不是快照。

不要在初始启动时传递 `--no-snapshot-fetch` 参数，因为无法从创世区块完全启动节点。相反，先从快照启动，然后重新启动时添加 `--no-snapshot-fetch` 参数。

需要注意的是，您的节点在任何时候能够从网络其余部分获得的历史账本数量是有限的。一旦运行，如果您的验证者出现明显的停机时间，那它们可能无法赶现有上网络，将需要从已知验证者节点下载新的快照。这时，您的验证者现在在其历史账本数据中将有一个无法填补的缺口。

### 最小化验证者端口暴露

验证者需要打开各种 UDP 和 TCP 端口以接收来自所有其他 Solana 验证者的入站流量。虽然这是最有效的操作模式，并且强烈推荐，但也可以限制验证者只接收来自另一个 Solana 验证者的入站流量。

首先添加 `--restricted-repair-only-mode` 参数。这将使验证者在一个受限模式下运行，它不会从其他验证者接收推送，而是需要不断地从其他验证者轮询区块。验证者将仅使用 **Gossip** 和 **ServeR**（"提供修复"）端口向其他验证者传输 UDP 数据包，并且只在其 **Gossip** 和 **Repair** 端口接收 UDP 数据包。

**Gossip** 端口是双向的，允许您的验证者与集群的其余部分保持联系。您的验证者通过 **ServeR** 发送数据，以便向其他网络节点发出修复请求，以获取新区块，因为 Turbine 现在已被禁用。然后，您的验证者将在 **Repair** 端口从其他验证者接收修复响应。

为了进一步限制验证者仅从一个或多个验证者请求区块，首先确定该验证者的身份公钥，然后为每个 PUBKEY 添加 `--gossip-pull-validator PUBKEY --repair-validator PUBKEY` 参数。这将导致你的验证者成为每个添加的验证者的资源消耗，因此请谨慎使用，并在与目标验证者协商后才这样做。

您的验证者现在应该只与明确列出的验证者通信，并且只在 **Gossip**、**Repair** 和 **ServeR** 端口上进行通信。

## 设置存款账户

Solana 账户不需要任何链上初始化；一旦它们包含一些 SOL，它们就存在了。要为您的交易所设置存款账户，只需使用我们的任何[钱包工具](https://docs.solanalabs.com/cli/wallets)生成一个 Solana 密钥对。

我们建议为每个用户提供一个唯一的存款账户。

Solana 账户必须通过包含足够两年的 [租金](https://solana.com/zh/docs/core/fees.md#rent) 的 SOL 来免除租金。为了找到您的存款账户的最小免租金余额，请查询 [`getMinimumBalanceForRentExemption` 端点](https://solana.com/zh/docs/rpc/http/getMinimumBalanceForRentExemption.mdx)：

```shell
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getMinimumBalanceForRentExemption",
  "params": [0]
}'
```

#### 返回结果

```json
{ "jsonrpc": "2.0", "result": 890880, "id": 1 }
```

### 离线账户

您可能希望为了更高的安全性，将一个或多个收集账户的密钥保持离线状态。如果是这样，您将需要使用我们的[离线方法](https://docs.solanalabs.com/cli/examples/offline-signing)将 SOL 转移到热钱包账户。

## 监听存款

当用户想要将 SOL 存入你的交易所时，指示他们将转账发送到相应的存款地址。

### 版本化交易迁移

当主网 beta 版网络开始处理版本化交易时，交易所**必须**进行更改。如果不进行更改，存款检测将不再正常工作，因为获取版本化交易或包含版本化交易的区块将返回错误。

- `{"maxSupportedTransactionVersion": 0}`

  必须将 `maxSupportedTransactionVersion` `getBlock` 参数添加到`getBlock`和 `getTransaction` 请求中，以避免对存款检测造成中断。最新的事务版本是 `0` 并且应该指定为支持的最大事务版本值。

理解版本化交易的重要性在于，它允许用户创建使用从链上地址查找表加载的另一组账户密钥的交易。

- `{"encoding": "jsonParsed"}`

  当获取区块和交易时，现在推荐使用 `"jsonParsed"` 编码，因为它在消息的 `"accountKeys"` 列表中包含了所有交易账户密钥（包括来自查找表的那些）。这使得解析 `preBalances` / `postBalances` 和 `preTokenBalances` / `postTokenBalances` 中详细列出的余额变化变得简单直接。

  如果使用 `"json"` 编码，则 `preBalances` / `postBalances` 和 `preTokenBalances` / `postTokenBalances` 中的条目可能指向不在 `"accountKeys"` 列表中的账户密钥，需要使用交易元数据中的 `"loadedAddresses"` 条目来解析。

### 轮询区块

要跟踪交易所的所有存款账户，请使用 Solana API 节点的 JSON-RPC 服务轮询每个已确认的区块并检查感兴趣的地址。

- 为了确定哪些区块可用，请发送一个 [`getBlocks`](https://solana.com/zh/docs/rpc/http/getBlocks.mdx) 请求，将您已经处理过的最后一个区块作为起始插槽（ start-slot ）参数传递：

```shell
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getBlocks",
  "params": [160017005, 160017015]
}'
```

##### 返回结果

```json
{
  "jsonrpc": "2.0",
  "result": [
    160017005, 160017006, 160017007, 160017012, 160017013, 160017014, 160017015
  ],
  "id": 1
}
```

不是每个插槽都会产生一个区块，因此整数序列中可能存在间隙。

- 对于每个区块，请使用 [`getBlock`](https://solana.com/zh/docs/rpc/http/getBlock.mdx) 请求来请求其内容：  

### 区块获取技巧

- `{"rewards": false}`

默认情况下，获取的区块将返回每个区块上的验证者费用信息以及在周期边界上的质押奖励。如果您不需要这些信息，请使用 "rewards" 参数禁用它。

- `{"transactionDetails": "accounts"}`

默认情况下，获取的区块会返回大量交易信息和元数据，这些对于跟踪账户余额并非必要。设置 "transactionDetails" 参数以加快区块获取速度。

```shell
curl https://api.devnet.solana.com -X POST -H 'Content-Type: application/json' -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getBlock",
  "params": [
    166974442,
    {
      "encoding": "jsonParsed",
      "maxSupportedTransactionVersion": 0,
      "transactionDetails": "accounts",
      "rewards": false
    }
  ]
}'
```

##### 返回结果

```json
{
  "jsonrpc": "2.0",
  "result": {
    "blockHeight": 157201607,
    "blockTime": 1665070281,
    "blockhash": "HKhao674uvFc4wMK1Cm3UyuuGbKExdgPFjXQ5xtvsG3o",
    "parentSlot": 166974441,
    "previousBlockhash": "98CNLU4rsYa2HDUyp7PubU4DhwYJJhSX9v6pvE7SWsAo",
    "transactions": [
      ... (omit)
      {
        "meta": {
          "err": null,
          "fee": 5000,
          "postBalances": [
            1110663066,
            1,
            1040000000
          ],
          "postTokenBalances": [],
          "preBalances": [
            1120668066,
            1,
            1030000000
          ],
          "preTokenBalances": [],
          "status": {
            "Ok": null
          }
        },
        "transaction": {
          "accountKeys": [
            {
              "pubkey": "9aE476sH92Vz7DMPyq5WLPkrKWivxeuTKEFKd2sZZcde",
              "signer": true,
              "source": "transaction",
              "writable": true
            },
            {
              "pubkey": "11111111111111111111111111111111",
              "signer": false,
              "source": "transaction",
              "writable": false
            },
            {
              "pubkey": "G1wZ113tiUHdSpQEBcid8n1x8BAvcWZoZgxPKxgE5B7o",
              "signer": false,
              "source": "lookupTable",
              "writable": true
            }
          ],
          "signatures": [
            "2CxNRsyRT7y88GBwvAB3hRg8wijMSZh3VNYXAdUesGSyvbRJbRR2q9G1KSEpQENmXHmmMLHiXumw4dp8CvzQMjrM"
          ]
        },
        "version": 0
      },
      ... (omit)
    ]
  },
  "id": 1
}
```

`preBalances` 和 `postBalances` 字段允许您跟踪每个账户的余额变化，而无需解析整个交易。它们列出了每个账户的起始余额和结束余额，以 [lamports](https://solana.com/zh/docs/terminology.md#lamport) 为单位，并根据 `accountKeys` 列表进行索引。例如，如果感兴趣的存款地址是 `G1wZ113tiUHdSpQEBcid8n1x8BAvcWZoZgxPKxgE5B7o`，那么这笔交易代表了 1040000000 - 1030000000 = 10,000,000 lamports = 0.01 SOL 的转移。

如果您需要有关交易类型或其他具体信息的更多信息，您可以以二进制格式从 RPC 请求区块，并使用我们的 [Rust SDK](https://github.com/solana-labs/solana) 或 [Javascript SDK](https://github.com/solana-labs/solana-web3.js) 进行解析。

### 地址历史

您也可以查询特定地址的交易历史。通常来说，这并**不是**追踪所有槽位上您的存款地址的有效方法，但对于在特定时间段内检查几个账户而言，可能是有用的。


- 发送[`getSignaturesForAddress`](https://solana.com/zh/docs/rpc/http/getSignaturesForAddress.mdx)请求到 API 节点:  

```shell
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getSignaturesForAddress",
  "params": [
    "3M2b3tLji7rvscqrLAHMukYxDK2nB96Q9hwfV6QkdzBN",
    {
      "limit": 3
    }
  ]
}'
```

##### 返回结果

```json
{
  "jsonrpc": "2.0",
  "result": [
    {
      "blockTime": 1662064640,
      "confirmationStatus": "finalized",
      "err": null,
      "memo": null,
      "signature": "3EDRvnD5TbbMS2mCusop6oyHLD8CgnjncaYQd5RXpgnjYUXRCYwiNPmXb6ZG5KdTK4zAaygEhfdLoP7TDzwKBVQp",
      "slot": 148697216
    },
    {
      "blockTime": 1662064434,
      "confirmationStatus": "finalized",
      "err": null,
      "memo": null,
      "signature": "4rPQ5wthgSP1kLdLqcRgQnkYkPAZqjv5vm59LijrQDSKuL2HLmZHoHjdSLDXXWFwWdaKXUuryRBGwEvSxn3TQckY",
      "slot": 148696843
    },
    {
      "blockTime": 1662064341,
      "confirmationStatus": "finalized",
      "err": null,
      "memo": null,
      "signature": "36Q383JMiqiobuPV9qBqy41xjMsVnQBm9rdZSdpbrLTGhSQDTGZJnocM4TQTVfUGfV2vEX9ZB3sex6wUBUWzjEvs",
      "slot": 148696677
    }
  ],
  "id": 1
}
```

- 对于返回的每个签名，通过发送[`getTransaction`](https://solana.com/zh/docs/rpc/http/getTransaction.mdx) 请求来获取交易详情：

```shell
curl https://api.devnet.solana.com -X POST -H 'Content-Type: application/json' -d '{
  "jsonrpc":"2.0",
  "id":1,
  "method":"getTransaction",
  "params":[
    "2CxNRsyRT7y88GBwvAB3hRg8wijMSZh3VNYXAdUesGSyvbRJbRR2q9G1KSEpQENmXHmmMLHiXumw4dp8CvzQMjrM",
    {
      "encoding":"jsonParsed",
      "maxSupportedTransactionVersion":0
    }
  ]
}'
```

##### 返回结果

```json
{
  "jsonrpc": "2.0",
  "result": {
    "blockTime": 1665070281,
    "meta": {
      "err": null,
      "fee": 5000,
      "innerInstructions": [],
      "logMessages": [
        "Program 11111111111111111111111111111111 invoke [1]",
        "Program 11111111111111111111111111111111 success"
      ],
      "postBalances": [1110663066, 1, 1040000000],
      "postTokenBalances": [],
      "preBalances": [1120668066, 1, 1030000000],
      "preTokenBalances": [],
      "rewards": [],
      "status": {
        "Ok": null
      }
    },
    "slot": 166974442,
    "transaction": {
      "message": {
        "accountKeys": [
          {
            "pubkey": "9aE476sH92Vz7DMPyq5WLPkrKWivxeuTKEFKd2sZZcde",
            "signer": true,
            "source": "transaction",
            "writable": true
          },
          {
            "pubkey": "11111111111111111111111111111111",
            "signer": false,
            "source": "transaction",
            "writable": false
          },
          {
            "pubkey": "G1wZ113tiUHdSpQEBcid8n1x8BAvcWZoZgxPKxgE5B7o",
            "signer": false,
            "source": "lookupTable",
            "writable": true
          }
        ],
        "addressTableLookups": [
          {
            "accountKey": "4syr5pBaboZy4cZyF6sys82uGD7jEvoAP2ZMaoich4fZ",
            "readonlyIndexes": [],
            "writableIndexes": [3]
          }
        ],
        "instructions": [
          {
            "parsed": {
              "info": {
                "destination": "G1wZ113tiUHdSpQEBcid8n1x8BAvcWZoZgxPKxgE5B7o",
                "lamports": 10000000,
                "source": "9aE476sH92Vz7DMPyq5WLPkrKWivxeuTKEFKd2sZZcde"
              },
              "type": "transfer"
            },
            "program": "system",
            "programId": "11111111111111111111111111111111"
          }
        ],
        "recentBlockhash": "BhhivDNgoy4L5tLtHb1s3TP19uUXqKiy4FfUR34d93eT"
      },
      "signatures": [
        "2CxNRsyRT7y88GBwvAB3hRg8wijMSZh3VNYXAdUesGSyvbRJbRR2q9G1KSEpQENmXHmmMLHiXumw4dp8CvzQMjrM"
      ]
    },
    "version": 0
  },
  "id": 1
}
```

## 发起提款

为了满足用户提现 SOL 的请求，您必须生成一个 Solana 转账交易，然后将其发送到API节点，以便转发到您的集群。

### 同步的

向 Solana 集群发送同步转账可以轻松确保转账成功并获得集群的最终确认。

Solana的命令行工具提供了一个简单的命令 `solana transfer`，用于生成、提交和确认转账交易。默认情况下，此方法会等待并跟踪stderr上进度，直到交易被集群最终确认。如果交易失败，它将报告所有交易错误。

```shell
solana transfer <USER_ADDRESS> <AMOUNT> --allow-unfunded-recipient --keypair <KEYPAIR> --url http://localhost:8899
```

[Solana Javascript SDK](https://github.com/solana-labs/solana-web3.js) 为 JavaScript 生态系统提供了一种类似的方法。使用 `SystemProgram` 构建一个转账交易，并使用 `sendAndConfirmTransaction` 方法提交它。

### 异步的

为了更大的灵活性，您可以异步提交提款转账。在这些情况下，您有责任验证交易是否成功并获得集群的最终确认。

**注意：** 每个交易都包含一个 [recent blockhash](https://solana.com/zh/docs/core/transactions.md#recent-blockhash) 以表明其生存时间。在重试一个似乎没有被集群确认或最终确定的提款转账之前，**必须**等待该区块哈希过期。否则，您将面临双重支付的风险。有关 [区块哈希过期](#blockhash-expiration) 的更多信息，请参见下文。

首先，使用[`getFees`](https://solana.com/zh/docs/rpc/deprecated/getFees.mdx) 端点或 CLI 命令获取最近的区块哈希：

```shell
solana fees --url http://localhost:8899
```

在命令行工具中，传递`--no-wait`参数以异步发送转账，并使用`--blockhash`参数包含您最近的区块哈希：

```shell
solana transfer <USER_ADDRESS> <AMOUNT> --no-wait --allow-unfunded-recipient --blockhash <RECENT_BLOCKHASH> --keypair <KEYPAIR> --url http://localhost:8899
```

你还可以手动构建、签名和序列化交易，并使用 JSON-RPC `sendTransaction` 端点将其发送到集群。

#### 交易确认和最终性

使用 `getSignatureStatuses` JSON-RPC 端点获取一批交易的状态。`confirmations` 字段报告自交易处理以来经过的[已确认的](https://solana.com/zh/docs/terminology.md#confirmed-block)区块数。如果 `confirmations: null`，则表示已[最终确认](https://solana.com/zh/docs/terminology.md#finality)。。

```shell
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '{
  "jsonrpc":"2.0",
  "id":1,
  "method":"getSignatureStatuses",
  "params":[
    [
      "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW",
      "5j7s6NiJS3JAkvgkoc18WVAsiSaci2pxB2A6ueCJP4tprA2TFg9wSyTLeYouxPBJEMzJinENTkpA52YStRW5Dia7"
    ]
  ]
}'
```

##### 返回结果

```json
{
  "jsonrpc": "2.0",
  "result": {
    "context": {
      "slot": 82
    },
    "value": [
      {
        "slot": 72,
        "confirmations": 10,
        "err": null,
        "status": {
          "Ok": null
        }
      },
      {
        "slot": 48,
        "confirmations": null,
        "err": null,
        "status": {
          "Ok": null
        }
      }
    ]
  },
  "id": 1
}
```

#### 区块哈希过期

你可以透过发送一个带有该块哈希作为参数的 [`getFeeCalculatorForBlockhash`](https://solana.com/zh/docs/rpc/deprecated/getFeeCalculatorForBlockhash.mdx) 请求来检查特定块哈希是否仍然有效。如果响应值为 `null`，则表明该块哈希已过期，使用该块哈希的提款交易将永远不会成功。

### 验证用户提供的提款账户地址

由于提款操作不可逆，为了防止因错误而导致用户资金损失，在授权提款前验证用户提供的账户地址是一个很好的习惯。

#### 基本验证

Solana 地址是一个32字节的数组，使用比特币 base58 字母表进行编码。这将得到一个符合以下正则表达式的 ASCII 文本字符串：

```text
[1-9A-HJ-NP-Za-km-z]{32,44}
```

仅此检查是不够的，因为Solana地址未经`校验和`处理，所以无法检测到输入错误为了进一步验证用户的输入，可以解码字符串并确认结果字节数组的长度为 32。然而，一些地址在存在拼写错误（例如缺少字符、字符反转或忽略大小写）的情况下仍然可以解码为 32 字节。

#### 高级验证

针对上述提及的易受输入错误影响的问题，建议对候选的提款地址查询其余额。如果发现非零余额，则应提示用户确认其意图。这样做可以防止因误输入地址而导致资产误转至他人账户的风险，增强交易安全性。

#### 验证有效的 ed25519 公钥

在 Solana 中，普通账户的地址是 256 位 ed25519 公钥的 Base58 编码字符串。并非所有位模式都是 ed25519 曲线的有效公钥，因此可以确保用户提供的账户地址至少是正确的 ed25519 公钥。

#### Java示例

以下是验证用户提供的地址是否为有效 ed25519 公钥的 Java 示例：

以下代码示例假设您正在使用Maven作为项目管理工具。

`pom.xml`:

```xml
<repositories>
  ...
  <repository>
    <id>spring</id>
    <url>https://repo.spring.io/libs-release/</url>
  </repository>
</repositories>

...

<dependencies>
  ...
  <dependency>
      <groupId>io.github.novacrypto</groupId>
      <artifactId>Base58</artifactId>
      <version>0.1.3</version>
  </dependency>
  <dependency>
      <groupId>cafe.cryptography</groupId>
      <artifactId>curve25519-elisabeth</artifactId>
      <version>0.1.0</version>
  </dependency>
<dependencies>
```

```java
import io.github.novacrypto.base58.Base58;
import cafe.cryptography.curve25519.CompressedEdwardsY;

public class PubkeyValidator
{
    public static boolean verifyPubkey(String userProvidedPubkey)
    {
        try {
            return _verifyPubkeyInternal(userProvidedPubkey);
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean _verifyPubkeyInternal(String maybePubkey) throws Exception
    {
        byte[] bytes = Base58.base58Decode(maybePubkey);
        return !(new CompressedEdwardsY(bytes)).decompress().isSmallOrder();
    }
}
```

## 最小存款和提款金额

每笔 SOL 的存款和提现必须大于或等于钱包地址账户的最低免租余额（一个不包含数据的基本 SOL 账户），当前为：0.000890880 SOL

同样，每个存款账户必须至少包含此余额。

```shell
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getMinimumBalanceForRentExemption",
  "params": [0]
}'
```

##### 返回结果

```json
{ "jsonrpc": "2.0", "result": 890880, "id": 1 }
```

## 优先费和计算单元

在需求高峰期，如果验证者选择了具有更高经济价值的其他交易，可能会导致交易在被包含在区块之前过期。如果没有正确实施优先费，可能会导致有效交易被延迟或丢弃。

[优先费](https://solana.com/zh/docs/terminology.md#prioritization-fee)是在[基础交易费](https://solana.com/zh/docs/core/fees.md#transaction-fees)之上可以添加的额外费用，以确保交易被包含在区块中，并在这些情况下帮助确保交付。

这些优先费通过添加一个特殊的计算预算指令来添加到交易中，该指令设置了要支付的期望优先费。

::: warning IMPORTANT NOTE
未能实现这些指令可能会导致网络中断和交易丢弃。强烈建议每个支持 Solana 的交易所使用优先费以避免中断。
:::

### 什么是优先费？

优先费以每计算单位的micro-lamports（例如少量 SOL）为单位定价，预先添加到交易中，使其在经济上对验证者节点具有吸引力，以包含在网络的区块中。

### 优先费应该是多少？

设置您的优先费的方法应该包括查询最近的优先费，以设定一个可能对网络有吸引力的费用。使用 [`getRecentPrioritizationFees`](https://solana.com/zh/docs/rpc/http/getrecentprioritizationfees) RPC 方法，您可以查询最近区块中完成交易所需的优先费。

这些优先费的定价策略将根据您的用例而有所不同。没有统一的标准方法。设置优先费的一种策略可能是计算您的交易成功率，然后根据对最近交易费用API的查询增加您的优先费，并相应调整。优先费的定价将根据网络活动和其它参与者的出价动态变化，只有在事后才能知晓。

使用`getRecentPrioritizationFees` API调用的一个挑战在于，它可能只返回每个区块的最低费用。这个费用通常为零，这对于避免被验证节点拒绝而需使用的优先费来说，并不是一个完全有用近似值。

`getRecentPrioritizationFees` API 接口接受账户的公钥作为参数，然后返回这些账户的最低优先费中的最高值。如果没有指定任何账户，API将返回进入区块所需的最低费用，这通常为零（除非区块已满）。

交易所和应用程序应在交易将要执行写锁定操作的账户上查询RPC端点。RPC端点将返回`max(account_1_min_fee, account_2_min_fee, ..., account_n_min_fee)`，即这些账户的最小费用的最大值，这应该是用户为该交易设置优先费的基准点。

有多种设置优先费的方法，并且有一些[第三方API](https://docs.helius.dev/solana-rpc-nodes/alpha-priority-fee-api) 可用于确定应用的最佳费用。鉴于网络的动态特性，将不会有“完美”的方法来定价您的优先费，在选择前进的道路之前应进行仔细的分析。

### 如何实现优先费

在交易中添加优先费用，包括在给定交易上预先添加两个计算预算指令：

- 一个用于设置计算单元价格，
- 另一个用于设置计算单元限制

::: tip INFO
在这里，您还可以找到有关[如何使用优先权费](https://solana.com/zh/developers/guides/advanced/how-to-use-priority-fees)的更详细的开发人员指南，其中包括有关实施优先权费的更多信息。
:::

创建一个 `setComputeUnitPrice` 指令，在基础交易费（5,000 Lamports）之上添加优先费。

```typescript
// import { ComputeBudgetProgram } from "@solana/web3.js"
ComputeBudgetProgram.setComputeUnitPrice({ microLamports: number });
```

所提供的micro-lamports值将乘以计算单元（CU）预算，以确定以micro-lamports计的优先费。例如，如果你的 CU 预算是1百万 CU，并且你添加了`1 micro-lamports/CU`，那么优先费将是1拉姆波特（100万 * 0.0001）。总费用则为5001拉姆波特。

为了给交易设置一个新的计算单元预算，创建一个`setComputeUnitLimit`指令。

```typescript
// import { ComputeBudgetProgram } from "@solana/web3.js"
ComputeBudgetProgram.setComputeUnitLimit({ units: number });
```

提供的`units`值将替换 Solana 运行时的默认计算预算值。

::: warning SET THE LOWEST CU REQUIRED FOR THE TRANSACTION
交易应请求执行所需的最小计算单元 （CU） 数量，以最大限度地提高吞吐量并最小化总体费用。

您可以通过在不同的 Solana 集群上发送交易来获取交易消耗的 CU。例如，一个[简单的代币转账](https://explorer.solana.com/tx/5scDyuiiEbLxjLUww3APE9X7i8LE3H63unzonUwMG7s2htpoAGG17sgRsNAhR1zVs6NQAnZeRVemVbkAct5myi17) 需要300 CU。

:::

```typescript
// import { ... } from "@solana/web3.js"

const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
  // note: set this to be the lowest actual CU consumed by the transaction
  units: 300,
});

const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 1,
});

const transaction = new Transaction()
  .add(modifyComputeUnits)
  .add(addPriorityFee)
  .add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: toAccount,
      lamports: 10000000,
    }),
  );
```

### 优先费和持久化Nonce

如果你的设置中采用了持久化 Nonce 交易（Durable Nonce），恰当地结合持久化 Nonce 实施优先费（Prioritization Fees）以确保交易成功。否则，将导致该交易将无法被识别为持久化交易类型。

如果您正在使用持久化交易 Nonce，那么在指令列表中必须首先指定`AdvanceNonceAccount`指令，即使使用计算预算指令来指定优先费也是如此。

你可以在本开发人员指南中的[使用持久化 Nonce 和优先费结合的特定代码示例](https://solana.com/zh/developers/guides/advanced/how-to-use-priority-fees#special-considerations)找到详细信息。

## 支持SPL代币标准

[SPL 代币](https://spl.solana.com/token) 是在 Solana 区块链上创建和交换包装/合成代币的标准。

SPL 代币的工作流程与原生 SOL 代币类似，但有一些差异，将在本节中讨论。

### 代币铸造

每种**类型**的 SPL 代币都是通过创建一个**铸造账户**来声明的。这个账户存储描述代币特性的元数据，如供应量、小数位数，以及对铸造过程有控制权的各种权限。每个 SPL 代币账户引用其关联的铸造账户，并且只能与该类型的 SPL 代币进行交互。

### 安装 `spl-token` 命令行工具

使用 `spl-token` 命令行工具查询和修改 SPL 代币账户。本节中提供的示例依赖于在本地系统上安装了此工具。

`spl-token` 是通过 Rust 的 `cargo` 命令行工具从 [crates.io](https://crates.io/crates/spl-token) 分发的。可以使用 [rustup.rs](https://rustup.rs) 上的便捷一行命令为您的平台安装最新版本的 `cargo`。一旦安装了 `cargo`，就可以使用以下命令获取 `spl-token`：

```shell
cargo install spl-token-cli
```

随后您可以检查已安装的版本以进行验证。

```shell
spl-token --version
```

这应该会得到类似于以下的结果：

```text
spl-token-cli 2.0.1
```

### 账户创建

SPL Token 账户的要求比原生系统程序账户更多：

1. SPL Token 账户必须在可以存入代币之前创建。可以使用 `spl-token create-account` 命令显式创建代币账户，或通过 `spl-token transfer --fund-recipient ...` 命令隐式创建。
1. SPL代币账户在其存在期间必须保持[免租金](https://solana.com/zh/docs/core/fees.md#rent-exempt)状态，因此需要在账户创建时存入少量的原生 SOL 代币。对于SPL代币账户，这个金额是0.00203928 SOL（2,039,280 个 lamports）。

#### 命令行

要创建一个具有以下属性的 SPL 代币账户：

1. 与给定的铸造账户关联
1. 归资金账户的密钥对所有

```shell
spl-token create-account <TOKEN_MINT_ADDRESS>
```

#### 示例

```shell
spl-token create-account AkUFCWTXb3w9nY2n6SFJvBV6VwvFUCe4KBMCcgLsa2ir
```

提供的输出类似于：

```
Creating account 6VzWGL51jLebvnDifvcuEDec17sK6Wupi4gYhm5RzfkV
Signature: 4JsqZEPra2eDTHtHpB4FMWSfk3UgcCVmkKkP7zESZeMrKmFFkDkNd91pKP3vPVVZZPiu5XxyJwS73Vi5WsZL88D7
```

或者用特定的密钥对创建一个 SPL 代币账户：

```shell
solana-keygen new -o token-account.json

spl-token create-account AkUFCWTXb3w9nY2n6SFJvBV6VwvFUCe4KBMCcgLsa2ir token-account.json
```

提供的输出类似于：

```shell
Creating account 6VzWGL51jLebvnDifvcuEDec17sK6Wupi4gYhm5RzfkV
Signature: 4JsqZEPra2eDTHtHpB4FMWSfk3UgcCVmkKkP7zESZeMrKmFFkDkNd91pKP3vPVVZZPiu5XxyJwS73Vi5WsZL88D7
```

### 检查账户余额

#### 命令行

```shell
spl-token balance <TOKEN_ACCOUNT_ADDRESS>
```

#### 示例

```shell
solana balance 6VzWGL51jLebvnDifvcuEDec17sK6Wupi4gYhm5RzfkV
```

提供的输出类似于：

```
0
```

### 代币转账

转账操作中的源账户是实际含有金额的代币账户。

收款地址可以是一个普通的钱包账户。如果该钱包还没有与给定铸造账户相关联的代币账户，那么在提供了 `--fund-recipient` 参数的情况下，转账操作将会创建它。

#### 命令行

```shell
spl-token transfer <SENDER_ACCOUNT_ADDRESS> <AMOUNT> <RECIPIENT_WALLET_ADDRESS> --fund-recipient
```

#### 示例

```shell
spl-token transfer 6B199xxzw3PkAm25hGJpjj3Wj3WNYNHzDAnt1tEqg5BN 1
```

提供的输出类似于：

```shell
6VzWGL51jLebvnDifvcuEDec17sK6Wupi4gYhm5RzfkV
Transfer 1 tokens
  Sender: 6B199xxzw3PkAm25hGJpjj3Wj3WNYNHzDAnt1tEqg5BN
  Recipient: 6VzWGL51jLebvnDifvcuEDec17sK6Wupi4gYhm5RzfkV
Signature: 3R6tsog17QM8KfzbcbdP4aoMfwgo6hBggJDVy7dZPVmH2xbCWjEj31JKD53NzMrf25ChFjY7Uv2dfCDq4mGFFyAj
```

### 存款

由于每个 `(wallet, mint)` 组合都需要在链上有一个单独的账户，建议使用 [关联代币账户](https://spl.solana.com/associated-token-account)（ATA）方案从 SOL 存款钱包派生这些账户的地址，并且**只**接受来自ATA地址的存款。

监控存款交易应遵循上述的[区块轮询](#poll-for-blocks)方法。每个新区块都应被扫描，以查找引用用户代币账户派生地址的成功交易。然后必须使用交易元数据中的 `preTokenBalance` 和 `postTokenBalance` 字段来确定有效的余额变化。这些字段将识别受影响账户的代币铸造地址和账户所有者（主钱包地址）。

请注意，如果在交易期间创建了接收账户，它将没有 `preTokenBalance` 条目，因为不存在现有的账户状态。在这种情况下，可以假定初始余额为零。

### 提款

用户提供的提现地址必须是他们的 SOL 钱包地址。

在执行提现[转账](#token-transfers)之前，交易所应该如[上文所述](#validating-user-supplied-account-addresses-for-withdrawals)检查地址。此外，此地址必须由系统程序所有，并且没有任何账户数据。如果地址上没有 SOL 余额，在继续提现之前应获得用户确认。所有其他提现地址都必须被拒绝。

从提款地址，可以推导出正确的铸造账户的[关联代币账户](https://spl.solana.com/associated-token-account)（ATA），然后通过 [TransferChecked](https://github.com/solana-labs/solana-program-library/blob/fc0d6a2db79bd6499f04b9be7ead0c400283845e/token/program/src/instruction.rs#L268) 指令将转账指令发布到该账户。请注意，有可能 ATA 地址尚不存在，在这种情况下，交易所应代表用户为账户提供资金。对于 SPL 代币账户，为提现账户提供资金需要 0.00203928 SOL（2,039,280 lamports）。

`spl-token transfer` 命令模板用于提款：

```shell
spl-token transfer --fund-recipient <exchange token account> <withdrawal amount> <withdrawal address>
```

### 其他考虑因素

#### 冻结权限

由于监管合规的原因，SPL 代币发行实体可能会选择性地持有与其铸造账户相关联的所有账户的“冻结权限”。这允许他们随意[冻结](https://spl.solana.com/token#freezing-accounts)特定账户中的资产，直到解冻前该账户将无法使用。如果使用此功能，冻结权限的公钥将在 SPL 代币的铸造账户中注册。

### 对SPL Token-2022（Token-Extensions）标准的基本支持

[SPL Token-2022](https://spl.solana.com/token-2022) 是 Solana 区块链上用于包装/合成代币创建和交换的最新标准。

也被称为“Token Extensions”，这个标准包含了许多新功能，代币创建者和账户持有人可以选择性启用。这些功能包括保密转账、转账费用、关闭铸造、元数据、永久代表、不可变所有权等。更多信息，请查看[扩展指南](https://spl.solana.com/token-2022/extensions)。

如果您的交易所支持SPL代币，支持SPL Token-2022不需要做很多额外的工作：

- 命令行工具从3.0.0版本开始可以与两个程序无缝协作。
- `preTokenBalances` 和 `postTokenBalances` 包括 SPL Token-2022 的余额。
- RPC 索引包含 SPL Token-2022 账户，但必须使用程序 ID `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` 单独查询它们。

关联代币账户（Associated Token Account）的工作原理相同，并且能够正确计算新账户所需的 SOL 存款金额。

由于扩展功能的存在，账户可能大于165字节，因此可能需要超过 0.00203928 SOL 的资金来创建。

例如，关联代币账户程序始终包含“不可变所有者”扩展，因此账户至少需要170字节，这需要 0.00207408 SOL。

### 扩展特定考虑因素

上一节概述了对 SPL Token-2022 的最基本支持。由于扩展修改了代币的行为，交易所可能需要更改处理代币的方式。

可以查看铸币或代币账户上的所有扩展：

```shell
spl-token display <account address>
```

#### 转账费用

代币可以设置转账费，这意味着在转账过程中，一部分代币会被预留在目标地址，用于未来的收集。

如果你的交易所转移这些代币，请注意它们可能不会全部到达目的地址，因为有扣留的部分。

可以在转账期间指定预期费用以避免任何意外：

```shell
spl-token transfer --expected-fee <fee amount> --fund-recipient <exchange token account> <withdrawal amount> <withdrawal address>
```

#### 关闭铸造权限

使用此扩展，代币创建者可以在代币供应量为零时关闭铸币。

当铸币关闭时，可能仍然存在空的代币账户，它们将不再与有效铸币关联。

可以安全地关闭这些代币账户：

```shell
spl-token close --address <account address>
```

#### 保密转账

铸币可以配置保密转账，以便代币金额被加密，但账户所有者仍然公开。

交易所可以配置代币账户以发送和接收保密转账，以隐藏用户金额。不要求在代币账户上启用保密转账，因此交易所可以强制用户公开发送代币。

要启用保密转账，必须为账户配置：

```shell
spl-token configure-confidential-transfer-account --address <account address>
```

并且进行转账：

```shell
spl-token transfer --confidential <exchange token account> <withdrawal amount> <withdrawal address>
```

在进行保密转账时，`preTokenBalance` 和 `postTokenBalance` 字段将不会显示变化。为了清空存款账户，您必须解密新余额以提取代币：

```shell
spl-token apply-pending-balance --address <account address>
spl-token withdraw-confidential-tokens --address <account address> <amount or ALL>
```

#### 默认账户状态

铸造可以配置默认账户状态，使所有新代币账户默认冻结。这些代币创建者可能要求用户通过一个单独的流程来解冻账户。

#### 不可转让

一些代币被设置为不可转让，但它们仍然可以被销毁，并且账户可以被关闭。

#### 永久委托

代币创建者可以为他们的所有代币指定一个永久委托人。这个永久委托人可以从任何账户转移或销毁代币，有可能盗取资金。

这是某些司法管辖区对稳定币的法律要求，或者可以用于代币回收计划。

请注意，这些代币可能会在您的交易所不知情的情况下被转让。

#### 转账钩子 (Hook)

代币可以配置一个额外的程序，在转账时必须调用，以验证转账或执行任何其他逻辑。

由于 Solana 运行时要求所有账户明确传递给程序，并且转账钩子需要额外的账户，因此交易所需要为这些代币以不同的方式创建转账指令。

CLI和指令创建工具（如`createTransferCheckedWithTransferHookInstruction`）会自动添加额外的账户，但也可以显式指定这些额外的账户：

```shell
spl-token transfer --transfer-hook-account <pubkey:role> --transfer-hook-account <pubkey:role> ...
```

#### 转账时需要的备忘信息（Memo）

用户可以配置他们的代币账户，在转账时需要附上一条备忘（memo）信息。

交易所在将代币转回给用户之前，可能需要在转账指令前添加一条备忘指令，或者可能要求用户在发送到交易所之前添加一条备忘指令：

```shell
spl-token transfer --with-memo <memo text> <exchange token account> <withdrawal amount> <withdrawal address>
```

## 测试集成

在将系统迁移到 mainnet-beta 上的生产环境之前，请确保在Solana开发网和测试网[集群](https://solana.com/zh/docs/core/clusters.md)上测试您的完整工作流程。开发网是最开放和灵活的，非常适合初始开发，而测试网提供更现实的集群配置。开发网和测试网都支持水龙头服务，运行`solana airdrop 1`以获取一些开发网和测试网 SOL 用于开发和测试。
