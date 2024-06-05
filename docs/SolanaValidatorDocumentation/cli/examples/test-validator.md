# Solana 测试验证器

在开发的早期阶段，通常需要针对一个比公共网络提供更多配置选项且限制更少的集群进行开发。这可以通过 `solana-test-validator` 二进制文件轻松实现，它能在开发者的工作站上启动一个功能齐全的单节点集群。



## 优势

+ 无RPC速率限制
+ 无空投限制
+ 直接部署[链上程序](https://solana.com/docs/programs)（`--bpf-program ...`）
+ 从公开集群克隆账户，包括程序（`--clone ...`）
+ 从文件加载账户
+ 可配置的交易历史保留大小（`--limit-ledger-size ...`）
+ 可配置的纪元长度（`--slots-per-epoch ...`）
+ 跳转到任意的插槽（`--warp-slot ...`）



## 安装

`solana-test-validator` 二进制文件随 Solana CLI 工具套件一同提供。在继续之前，请先进行[安装](https://docs.solanalabs.com/cli/install)。



## 运行

首先查看配置选项：

```
solana-test-validator --help
```

然后启动测试验证器

```
solana-test-validator
```

默认情况下，基础状态信息会随着进程的运行打印出来。详细信息请参阅[附录1](https://docs.solanalabs.com/cli/examples/test-validator#appendix-i-status-output)。

```
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

让 `solana-test-validator` 在其自己的终端中保持运行状态。当不再需要时，可以通过按下 `ctrl-c` 来停止它。



## 交互操作

打开一个新的终端，使用 Solana CLI 工具套件中的其他二进制文件或您自己的客户端软件与[正在运行的](https://docs.solanalabs.com/cli/examples/test-validator#running) `solana-test-validator` 实例进行交互。

**将 CLI 工具套件配置为默认目标本地集群**

```
solana config set --url http://127.0.0.1:8899
```

**验证 CLI 工具套件配置**

```
solana genesis-hash
```

+ 注意：结果应与 `solana-test-validator` 状态输出中的 `Genesis Hash:` （创世区块哈希）字段匹配。

**检查钱包余额**

```
solana balance
```

+ 注意：`Error: No such file or directory (os error 2)` （没有这样的文件或目录（os错误2））意味着默认钱包还不存在。使用 `solana-keygen new` 命令来创建一个。
+ 注意：如果钱包的 SOL 余额为零，可以通过 `solana airdrop 10` 命令来空投一些本地网络 SOL 。

**执行基本的转账交易**

```
solana transfer EPhgPANa5Rh2wa4V2jxt7YbtWa3Uyw4sTeZ13cQjDDB8 1
```

监视链上程序中的 `msg!()` 输出

```
solana logs
```

+ 注意：此命令需要在目标交易执行时运行。在单独的终端中运行它。



## 附录1：状态输出

```
Ledger location: test-ledger
```

* 账本存储目录的文件路径。这个目录可能会变得很大。可以使用 `--limit-ledger-size ...` 存储较少的交易历史记录，或者使用 `--ledger ...` 重新定位它。

```
Log: test-ledger/validator.log
```

+ 账本存储目录的文件路径。通过传递 `--log` 参数也可以流式传输日志。在这种情况下，状态输出会被抑制。

```
Identity: EPhgPANa5Rh2wa4V2jxt7YbtWa3Uyw4sTeZ13cQjDDB8
```

+ 验证器在 [gossip 网络](https://docs.solanalabs.com/validator/gossip#gossip-overview)中的身份标识。

```
Version: 1.6.7
```

+ 软件的版本

```
Gossip Address: 127.0.0.1:1024
TPU Address: 127.0.0.1:1027
JSON RPC URL: http://127.0.0.1:8899
```

+ 分别代表 [Gossip](https://docs.solanalabs.com/validator/gossip#gossip-overview) ，[交易处理单元](https://docs.solanalabs.com/validator/tpu)和 [JSON RPC](https://solana.com/docs/rpc) 服务的网络地址。

```
⠈ 00:36:02 | Processed Slot: 5142 | Confirmed Slot: 5142 | Finalized Slot: 5110 | Snapshot Slot: 5100 | Transactions: 5142 | ◎499.974295000
```

+ 会话运行时间、三个区块[确认等级](https://solana.com/docs/rpc#configuring-state-commitment)的当前插槽、最近快照的插槽高度、交易计数、[投票权限](https://docs.solanalabs.com/operations/guides/vote-accounts#vote-authority)余额。



## 附录2：运行时功特性

默认情况下，在测试验证器运行时，所有[运行时特性](https://solana.com/docs/core/runtime#features)都会被激活。

您可以使用 [Solana 命令行工具](https://docs.solanalabs.com/cli/install)验证这一点：

```
solana feature status -ul
```

然而，并非总是需要这样，特别是当测试那些要在主网上部署的程序时，CLI 提供了一个选项以停用指定的特性：

```
solana-test-validator --deactivate-feature <FEATURE_PUBKEY_1> --deactivate-feature <FEATURE_PUBKEY_2>
```

