# 使用本地集群进行开发

使用`solana-test-validator`在本地电脑上运行单节点集群。便于开发

## 优点

* 无 RPC 速率限制
* 无领水限制
* 直接链上程序(--bpf-program ...部署 )
* 从公共集群克隆帐户，包括程序 (--clone ...)
* 从文件加载帐户
* 可配置的交易历史记录保留（--limit-ledger-size ...）
* 可配置的纪元长度（--slots-per-epoch ...）
* 跳转到任意插槽 (--warp-slot ...)

## 安装

包含在CLI的安装里面了, 确认你安装了CLI工具包, 继续阅读. 

## 运行

首先看一下配置选项

```
solana-test-validator --help
```

接下来启动测试验证器
```
solana-test-validator
```

详情请参阅附录一默认情况下，进程运行时会打印基本状态信息。
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

保持终端不要关闭


## 命令行交互

打开一个新终端, 连接本地集群

```
solana config set --url http://127.0.0.1:8899
```

验证 CLI 工具套件配置
```
solana genesis-hash
```

请注意：结果应该与solana-test-validator状态输出中的Genesis Hash字段匹配

查看钱包余额

```
solana balance
```

请注意, 如果报错:`没有这样的文件或目录（操作系统错误2）`意味着默认钱包尚不存在。请用solana-keygen new命令创建钱包.

如果钱包的SOL余额为零，则通过`Solana airdrop 10`来进行一些本地SOL空投

执行基本转账交易

```
solana transfer EPhgPANa5Rh2wa4V2jxt7YbtWa3Uyw4sTeZ13cQjDDB8 1
```

监视来自链上程序的消息输出
```
solana logs
```

请注意：此命令需要在独立的终端中运行。





