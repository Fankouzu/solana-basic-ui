# 基准集群

Solana Git 仓库包含了你可能需要的所有脚本，以便你搭建自己的本地测试网。根据你想要实现的目标，你可能需要运行不同的变体，因为完整的、高性能的多节点测试网比仅使用 Rust 的单节点测试网要复杂得多。如果你想开发高级功能，比如实验智能合约，可以选择 Rust-only 单节点 demo，避免一些设置上的麻烦。如果你在进行交易流水线的性能优化，可以考虑增强版的单节点 demo。如果你在做共识工作，你至少需要一个 Rust-only 多节点 demo。如果你想复制我们的 TPS 指标，运行增强版的多节点 demo。

对于这四种变体，你都需要最新的 Rust 工具链和 Solana 源代码：

首先，按照 Solana [README](https://github.com/solana-labs/solana#1-install-rustc-cargo-and-rustfmt) 中的描述设置 Rust、Cargo 和系统包。

然后从 GitHub 克隆代码：

``` bash
git clone <https://github.com/solana-labs/solana.git>
cd solana
```

由于我们在各个发布版本之间会添加新的低级特性，因此演示代码有时会被破坏，所以如果这是你第一次运行演示，你可以在继续之前检出[最新的发布版本](https://github.com/solana-labs/solana/releases)，以提高成功率：

``` bash
TAG=$(git describe --tags $(git rev-list --tags --max-count=1))
git checkout $TAG
```

## 配置设置

在启动任何节点之前，确保重要的程序（例如投票程序）已经构建完成。注意，我们这里使用的是 release 版本以获得良好的性能。如果你想要调试版本，只需使用 `cargo build` 并省略命令中的 `NDEBUG=1` 部分。

``` bash
cargo build --release
```

通过运行以下脚本生成初始账本来初始化网络。

``` bash
NDEBUG=1 ./multinode-demo/setup.sh
```

## 水龙头

为了让验证者和客户端正常工作，我们需要启动一个水龙头来分发一些测试代币。水龙头提供弗里德曼式的“空投”（免费代币给请求的客户端），用于测试交易。

启动水龙头：

``` bash
NDEBUG=1 ./multinode-demo/faucet.sh
```

## 单节点测试网

在启动验证者之前，确保你知道要作为演示引导验证者的机器的 IP 地址，并确保你要测试的所有机器上的 UDP 端口 8000-10000 是开放的。

现在在一个单独的终端中启动引导验证者：

``` bash
NDEBUG=1 ./multinode-demo/bootstrap-validator.sh
```

等待几秒钟让服务器初始化。当它准备接收交易时会打印“leader ready...”。如果引导验证者没有代币，它会请求一些代币。水龙头在随后的引导启动时不需要运行。

## 多节点测试网

要运行多节点测试网，在启动引导节点后，在不同的终端中启动一些额外的验证者：

``` bash
NDEBUG=1 ./multinode-demo/validator-x.sh
```

要在 Linux 上运行高性能验证者，系统必须安装 [CUDA 10.0](https://developer.nvidia.com/cuda-downloads)：

``` bash
./fetch-perf-libs.sh
NDEBUG=1 SOLANA_CUDA=1 ./multinode-demo/bootstrap-validator.sh
NDEBUG=1 SOLANA_CUDA=1 ./multinode-demo/validator.sh
```

## 测试网客户端演示

现在你的单节点或多节点测试网已经启动并运行，让我们发送一些交易！

在一个单独的终端中启动客户端：

``` bash
NDEBUG=1 ./multinode-demo/bench-tps.sh # 默认情况下运行在 localhost
```

刚才发生了什么？客户端演示启动了多个线程，以尽可能快地向测试网发送 500,000 笔交易。然后客户端会定期 ping 测试网，查看在这段时间内处理了多少交易。请注意，演示故意用 UDP 数据包淹没网络，这样网络几乎肯定会丢失一些数据包。这确保了测试网有机会达到 710k TPS。客户端演示在确信测试网不会处理更多交易后完成。你应该会看到屏幕上打印的多个 TPS 测量值。在多节点变体中，你会看到每个验证节点的 TPS 测量值。

## 测试网调试

代码中有一些有用的调试信息，你可以按模块和级别启用它们。在运行引导节点或验证节点之前，设置常规的 RUST_LOG 环境变量。

例如

- 要在所有地方启用 `info`，并仅在 solana::banking_stage 模块中启用 `debug`：

``` bash
export RUST_LOG=solana=info,solana::banking_stage=debug
```

- 要启用 SBF 程序日志记录：

``` bash
export RUST_LOG=solana_bpf_loader=trace
```

通常我们将 `debug` 用于不频繁的调试信息，将 `trace` 用于可能频繁的信息，将 `info` 用于与性能相关的日志记录。

你还可以使用 GDB 附加到正在运行的进程。引导节点的进程名为 solana-validator：

``` bash
sudo gdb
attach <PID>
set logging on
thread apply all bt
```

这将把所有线程的堆栈跟踪记录到 gdb.txt 中。

## 开发者测试网

在此示例中，客户端连接到我们的公共测试网。要在测试网上运行验证者，你需要打开 UDP 端口 8000-10000。

``` bash
NDEBUG=1 ./multinode-demo/bench-tps.sh --entrypoint entrypoint.devnet.solana.com:8001 --faucet api.devnet.solana.com:9900 --duration 60 --tx_count 50
```

你可以在我们的[指标仪表板](https://metrics.solana.com:3000/d/monitor/cluster-telemetry?var-testnet=devnet&orgId=1)上观察客户端交易的效果。
