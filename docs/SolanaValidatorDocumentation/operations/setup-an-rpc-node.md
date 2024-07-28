# RPC 节点配置

由于 Solana RPC 服务器的运行过程与共识验证者节点相同，因此首先请按照[如何设置 Solana 验证者节点](https://docs.solanalabs.com/operations/setup-a-validator)的说明开始。请注意，如果你运行的是 RPC 节点，则无需创建投票账户。RPC 节点通常不进行投票。

验证者节点运行后，您可以参考本节 RPC 节点的特定配置说明。

## 简单的 RPC 节点

下面是一个 `testnet` RPC 服务器的 `validator.sh` 文件示例。

您需要注意以下参数：

- `--full-rpc-api`：在此验证者节点上启用所有 RPC 操作。

- `--no-voting`：运行验证者节点时不参与共识。通常情况下，由于资源限制，你不希望验证者节点既作为共识节点又作为完整的 RPC 节点运行。

- `--private-rpc`：不在 `solana gossip` 命令中发布验证者节点的开放 RPC 端口。

  > 有关命令中使用到的参数的更多解释，请参阅 `solana-validator --help` 命令

```
#!/bin/bash
exec solana-validator \
    --identity /home/sol/validator-keypair.json \
    --known-validator 5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on \
    --known-validator dDzy5SR3AXdYWVqbDEkVFdvSPCtS9ihF5kJkHCtXoFs \
    --known-validator eoKpUABi59aT4rR9HGS3LcMecfut9x7zJyodWWP43YQ \
    --known-validator 7XSY3MrYnK8vq693Rju17bbPkCN3Z7KvvfvJx4kdrsSY \
    --known-validator Ft5fbkqNa76vnsjYNwjDZUXoTWpP7VYm3mtsaQckQADN \
    --known-validator 9QxCLckBiJc783jnMvXZubK4wH86Eqqvashtrwvcsgkv \
    --only-known-rpc \
    --full-rpc-api \
    --no-voting \
    --ledger /mnt/ledger \
    --accounts /mnt/accounts \
    --log /home/sol/solana-rpc.log \
    --rpc-port 8899 \
    --rpc-bind-address 0.0.0.0 \
    --private-rpc \
    --dynamic-port-range 8000-8020 \
    --entrypoint entrypoint.testnet.solana.com:8001 \
    --entrypoint entrypoint2.testnet.solana.com:8001 \
    --entrypoint entrypoint3.testnet.solana.com:8001 \
    --expected-genesis-hash 4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY \
    --wal-recovery-mode skip_any_corrupted_record \
    --limit-ledger-size
```

## Solana Bigtable

Solana 区块链每秒能够创建许多交易。由于链上的交易量很大，RPC 节点在机器上存储整个区块链是不现实的。相反，RPC 维护者使用 `--limit-ledger-size` 参数来指定在 RPC 节点上存储多少区块。如果 RPC 节点的用户需要历史区块链数据，那么 RPC 服务器就必须通过 Solana bigtable 实例访问较早的区块。

如果你对建立自己的 bigtable 实例感兴趣，请参阅 Solana GitHub 存储库中的这些文档：[Solana-labs/solana-bigtable](https://github.com/solana-labs/solana-bigtable)

## 已知验证者示例

在这些示例代码中（`--known-validator` 参数）提供的已知验证者的身份是

- `5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on` - Solana Labs
- `dDzy5SR3AXdYWVqbDEkVFdvSPCtS9ihF5kJkHCtXoFs` - MonkeDAO
- `Ft5fbkqNa76vnsjYNwjDZUXoTWpP7VYm3mtsaQckQADN` - Certus One
- `eoKpUABi59aT4rR9HGS3LcMecfut9x7zJyodWWP43YQ` - SerGo
- `9QxCLckBiJc783jnMvXZubK4wH86Eqqvashtrwvcsgkv` - Algo|Stake

## 其他集群示例

其他 Solana 集群特定验证者节点命令的示例可在[集群](https://docs.solanalabs.com/clusters/available)页面上找到。

请记住，您仍然需要定制这些命令以作为RPC节点运行，以及其他维护者的特定配置。

## 账户索引

随着集群中账户的数量增加，扫描整个账户集账户数据的RPC请求（如[`getProgramAccounts`](https://solana.com/docs/rpc/http/getprogramaccounts)和[特定的SPL-token请求](https://solana.com/docs/rpc/http/gettokenaccountsbydelegate)）可能表现不佳。如果您的验证器需要所有这些请求，您可以使用`--account-index`参数来激活一个或多个内存账户索引，这些索引通过按关键字段索引账户来显著提高RPC性能。目前支持以下参数值：

- `program-id`：每个账户按其所属程序进行索引；用于[getProgramAccounts](https://solana.com/docs/rpc/http/getprogramaccounts)
- `spl-token-mint`：每个SPL代币账户按其代币Mint进行索引；用于[getTokenAccountsByDelegate](https://solana.com/docs/rpc/http/gettokenaccountsbydelegate)和[getTokenLargestAccounts](https://solana.com/docs/rpc/http/gettokenlargestaccounts)
- `spl-token-owner`：每个SPL代币账户按代币所有者地址进行索引；用于[getTokenAccountsByOwner](https://solana.com/docs/rpc/http/gettokenaccountsbyowner)和包含spl-token-owner过滤器的[getProgramAccounts](https://solana.com/docs/rpc/http/getprogramaccounts)请求