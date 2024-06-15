# Solana 测试验证器

在开发的早期阶段，通常需要针对一个比公共网络提供更多配置选项且限制更少的集群进行开发。这可以通过 `solana-test-validator` 二进制文件轻松实现，它能在开发者的工作站上启动一个功能齐全的单节点集群。

## 优势

+ 无RPC速率限制
+ 无空投限制
+ 直接部署[链上程序](https://solana.com/docs/programs)（`--bpf-program ...`）
+ 从公共集群克隆账户，包括程序（使用 `--clone ...`）
+ 从文件加载账户
+ 可配置的交易历史保留（`--limit-ledger-size ...`）
+ 可配置的纪元长度（`--slots-per-epoch ...`）
+ 跳转到任意的插槽（`--warp-slot ...`）

## 安装

`solana-test-validator` 二进制文件随 Solana CLI 工具套件一同提供。在开始前，请先[安装](https://docs.solanalabs.com/cli/install)。

## 运行

首先查看配置选项：

```bash
solana-test-validator --help
```

然后启动测试验证者节点

```bash
solana-test-validator
```

默认情况下，运行时会打印基本状态信息。详细信息见[附录1](https://docs.solanalabs.com/cli/examples/test-validator#appendix-i-status-output)。

```bash
Ledger location: test-ledger
Log: test-ledger/validator.log
Identity: EPhgPANa5Rh2wa4V2jxt7YbtWa3Uyw4sTeZ13cQjDDB8
Genesis Hash: 4754oPEMhAKy14CZc8GzQUP93CB4ouELyaTs4P8ittYn
Version: 1.6.7
Shred Version: 13286
Gossip Address: 127.0.0.1:1024
TPU Address: 127.0.0.1:1027
JSON RPC URL: http://127.0.0.1:8899
⠈ 00:36:02 | Processed Slot: 5142 | Confirmed Slot: 5142 | Finalized Slot: 5110 | Snapshot Slot: 5100 | Transactions: 5142 | ◎499.974295000
```

让 `solana-test-validator` 在其的终端中保持运行。当不再需要它时，可以通过`Ctrl-C` 停止。

## 交互

打开一个新的终端，使用 Solana CLI 工具套件中的其他二进制文件或您自己的客户端软件与[正在运行的](https://docs.solanalabs.com/cli/examples/test-validator#running) `solana-test-validator` 实例进行交互。

**将 CLI 工具套件配置为默认目标本地集群**

```bash
solana config set --url http://127.0.0.1:8899
```

**验证 CLI 工具套件配置**

```bash
solana genesis-hash
```

+ **注意：**结果应与 `solana-test-validator` 状态输出中的 `Genesis Hash:` （创世区块哈希）字段匹配。

**检查钱包余额**

```bash
solana balance
```

+ **注意：**如果显示错误 `No such file or directory (os error 2)`，表示默认钱包尚不存在。使用 `solana-keygen new` 命令创建它。
+ **注意：**如果钱包的 SOL 余额为零，可以通过 `solana airdrop 10` 命令来空投一些本地网络 SOL 。

**执行基本的转账交易**

```bash
solana transfer EPhgPANa5Rh2wa4V2jxt7YbtWa3Uyw4sTeZ13cQjDDB8 1
```

**监视链上程序中的 `msg!()` 输出**

```bash
solana logs
```

+ **注意：**此命令需要在目标交易执行时运行。且在一个单独的终端中运行它。

## 附录1：状态输出

```bash
Ledger location: test-ledger
```

* 账本存储目录的文件路径。这个目录可能会变得很大。可以使用 `--limit-ledger-size ...` 存储较少的交易历史记录，或者使用 `--ledger ...` 重新设置它。

```bash
Log: test-ledger/validator.log
```

+ 验证器文本日志文件的文件路径。也可以通过传递 `--log` 来流式传输日志。在这种情况下，状态输出将被禁止。

```bash
Identity: EPhgPANa5Rh2wa4V2jxt7YbtWa3Uyw4sTeZ13cQjDDB8
```

+ 验证者在 [gossip 网络](https://docs.solanalabs.com/validator/gossip#gossip-overview)中的身份标识。

```bash
Version: 1.6.7
```

+ 软件的版本

```bash
Gossip Address: 127.0.0.1:1024
TPU Address: 127.0.0.1:1027
JSON RPC URL: http://127.0.0.1:8899
```

+ 分别代表 [Gossip](https://docs.solanalabs.com/validator/gossip#gossip-overview) ，[交易处理单元](https://docs.solanalabs.com/validator/tpu)和 [JSON RPC](https://solana.com/docs/rpc) 服务的网络地址。

```bash
⠈ 00:36:02 | Processed Slot: 5142 | Confirmed Slot: 5142 | Finalized Slot: 5110 | Snapshot Slot: 5100 | Transactions: 5142 | ◎499.974295000
```

+ 会话运行时间、三个区块[确认等级](https://solana.com/docs/rpc#configuring-state-commitment)的当前插槽、高度为上次快照的插槽高度、交易计数、[投票权限](https://docs.solanalabs.com/operations/guides/vote-accounts#vote-authority)余额。

## 附录2：运行时功能

默认情况下，测试验证器在所有[运行时功能](https://solana.com/docs/core/runtime#features)激活的情况下运行。

您可以使用 [Solana 命令行工具](https://docs.solanalabs.com/cli/install)验证这一点：

```bash
solana feature status -ul
```

由于这可能并不总是需要的，特别是在测试打算部署到主网的程序时，CLI 提供了一个选项来停用特定功能：

```bash
solana-test-validator --deactivate-feature <FEATURE_PUBKEY_1> --deactivate-feature <FEATURE_PUBKEY_2>
```
