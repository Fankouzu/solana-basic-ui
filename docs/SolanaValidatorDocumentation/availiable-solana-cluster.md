# Solana 可用集群

Solana 维护着几个不同用途的集群。

在开始之前，请确保您 [已安装 Solana 命令行工具](https://docs.solanalabs.com/cli/install)。

浏览器：

- <http://explorer.solana.com/>
- <http://solanabeach.io/>

## Devnet（开发网）

- Devnet 是一个供任何人测试 Solana 的游乐场，无论是用户、代币持有者、应用开发者还是验证者。
- 应用开发者应以 Devnet 为目标。
- 潜在的验证者应首先以 Devnet 为目标。
- Devnet 和 Mainnet Beta（主网测试版）之间的主要区别：
  - Devnet 代币不是真实的
  - Devnet 包含用于应用测试的空投代币水龙头
  - Devnet 可能会进行账本重置
  - Devnet 通常运行与 Mainnet Beta 相同的软件发布分支版本，但可能会运行比 Mainnet Beta 新的次要版本。
- Devnet 的 Gossip 入口点：`entrypoint.devnet.solana.com:8001`
- Devnet 的指标环境变量：

``` shell
export SOLANA_METRICS_CONFIG="host=<https://metrics.solana.com:8086,db=devnet,u=scratch_writer,p=topsecret>"
```

- Devnet 的 RPC URL：`https://api.devnet.solana.com`

`Solana` 命令行配置示例：

``` shell
solana config set --url https://api.devnet.solana.com
```

`Solana` 验证者命令行示例：

``` shell
$ solana-validator \
    --identity validator-keypair.json \
    --vote-account vote-account-keypair.json \
    --known-validator dv1ZAGvdsz5hHLwWXsVnM94hWf1pjbKVau1QVkaMJ92 \
    --known-validator dv2eQHeP4RFrJZ6UeiZWoc3XTtmtZCUKxxCApCDcRNV \
    --known-validator dv4ACNkpYPcE3aKmYDqZm9G5EB3J4MRoeE7WNDRBVJB \
    --known-validator dv3qDFk1DTF36Z62bNvrCXe9sKATA6xvVy6A798xxAS \
    --only-known-rpc \
    --ledger ledger \
    --rpc-port 8899 \
    --dynamic-port-range 8000-8020 \
    --entrypoint entrypoint.devnet.solana.com:8001 \
    --entrypoint entrypoint2.devnet.solana.com:8001 \
    --entrypoint entrypoint3.devnet.solana.com:8001 \
    --entrypoint entrypoint4.devnet.solana.com:8001 \
    --entrypoint entrypoint5.devnet.solana.com:8001 \
    --expected-genesis-hash EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG \
    --wal-recovery-mode skip_any_corrupted_record \
    --limit-ledger-size
```

这些 [`--known-validator`](https://docs.solanalabs.com/operations/guides/validator-start#known-validators) 由 Solana Labs 运营。

## Testnet（测试网）

- Testnet 是 Solana 核心贡献者在实际集群上对最近发布的功能进行压力测试的地方，特别关注网络性能、稳定性和验证者行为。
- Testnet 代币不是真实的
- Testnet 可能会进行账本重置
- Testnet 包含用于应用测试的空投代币水龙头
- Testnet 通常运行比 Devnet 和 Mainnet Beta 更新的软件发布分支
- Testnet 的 Gossip 入口点：entrypoint.testnet.solana.com:8001
- Testnet 的指标环境变量：

``` shell
export SOLANA_METRICS_CONFIG="host=<https://metrics.solana.com:8086,db=tds,u=testnet_write,p=c4fa841aa918bf8274e3e2a44d77568d9861b3ea>"
```

- Testnet 的 RPC URL：`https://api.testnet.solana.com`

`Solana` 命令行配置示例：

``` shell
solana config set --url https://api.testnet.solana.com
```

`Solana` 验证者命令行示例：

``` shell
$ solana-validator \
    --identity validator-keypair.json \
    --vote-account vote-account-keypair.json \
    --known-validator 5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on \
    --known-validator dDzy5SR3AXdYWVqbDEkVFdvSPCtS9ihF5kJkHCtXoFs \
    --known-validator Ft5fbkqNa76vnsjYNwjDZUXoTWpP7VYm3mtsaQckQADN \
    --known-validator eoKpUABi59aT4rR9HGS3LcMecfut9x7zJyodWWP43YQ \
    --known-validator 9QxCLckBiJc783jnMvXZubK4wH86Eqqvashtrwvcsgkv \
    --only-known-rpc \
    --ledger ledger \
    --rpc-port 8899 \
    --dynamic-port-range 8000-8020 \
    --entrypoint entrypoint.testnet.solana.com:8001 \
    --entrypoint entrypoint2.testnet.solana.com:8001 \
    --entrypoint entrypoint3.testnet.solana.com:8001 \
    --expected-genesis-hash 4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY \
    --wal-recovery-mode skip_any_corrupted_record \
    --limit-ledger-size
```

这些 `[--known-validator](https://docs.solanalabs.com/operations/guides/validator-start#known-validators)` 的身份为：

- `5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on` - Solana Labs
- `dDzy5SR3AXdYWVqbDEkVFdvSPCtS9ihF5kJkHCtXoFs` - MonkeDAO
- `Ft5fbkqNa76vnsjYNwjDZUXoTWpP7VYm3mtsaQckQADN` - Certus One
- `eoKpUABi59aT4rR9HGS3LcMecfut9x7zJyodWWP43YQ` - SerGo
- `9QxCLckBiJc783jnMvXZubK4wH86Eqqvashtrwvcsgkv` - Algo|Stake
  
## Mainnet Beta（主网测试版）

一个为 Solana 用户、构建者、验证者和代币持有者提供的无许可的持久集群。

- 在 Mainnet Beta 上发行的代币是真实的 SOL
- Mainnet Beta 的 Gossip 入口点：`entrypoint.mainnet-beta.solana.com:8001`
- Mainnet Beta 的指标环境变量：

```shell
export SOLANA_METRICS_CONFIG="host=https://metrics.solana.com:8086,db=mainnet-beta,u=mainnet-beta_write,p=password"
```

- Mainnet Beta 的 RPC URL：`https://api.mainnet-beta.solana.com`

`Solana` 命令行配置示例：

```shell
solana config set --url https://api.mainnet-beta.solana.com
```

`Solana` 验证者命令行示例：

``` shell
$ solana-validator \
    --identity ~/validator-keypair.json \
    --vote-account ~/vote-account-keypair.json \
    --known-validator 7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2 \
    --known-validator GdnSyH3YtwcxFvQrVVJMm1JhTS4QVX7MFsX56uJLUfiZ \
    --known-validator DE1bawNcRJB9rVm3buyMVfr8mBEoyyu73NBovf2oXJsJ \
    --known-validator CakcnaRDHka2gXyfbEd2d3xsvkJkqsLw2akB3zsN1D2S \
    --only-known-rpc \
    --ledger ledger \
    --rpc-port 8899 \
    --private-rpc \
    --dynamic-port-range 8000-8020 \
    --entrypoint entrypoint.mainnet-beta.solana.com:8001 \
    --entrypoint entrypoint2.mainnet-beta.solana.com:8001 \
    --entrypoint entrypoint3.mainnet-beta.solana.com:8001 \
    --entrypoint entrypoint4.mainnet-beta.solana.com:8001 \
    --entrypoint entrypoint5.mainnet-beta.solana.com:8001 \
    --expected-genesis-hash 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d \
    --wal-recovery-mode skip_any_corrupted_record \
    --limit-ledger-size
```
