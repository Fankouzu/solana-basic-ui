# 局限性

在 Solana 区块链上开发程序时，存在一些固有的局限性。以下是您可能遇到的一些常见局限性。

## Rust库

由于基于 Rust 的链上程序必须在资源受限的单线程环境中运行，且需要保持其确定性，因此在使用各种库时常有一些局限性。

有关这些局限性的详细信息，请参阅[使用Rust开发 - 局限性](https://solana.com/docs/programs/lang-rust.md#restrictions)。

## 计算预算

为了防止滥用区块链的计算资源，每个交易都会分配一个[计算预算](https://solana.com/docs/terminology.md#compute-budget)。超出此计算预算将导致交易失败。

有关计算预算的具体细节，请参阅[计算约束](https://solana.com/docs/core/fees.md#compute-budget)文档。

## 调用栈深度 - `CallDepthExceeded`错误

Solana程序被限制在快速运行，为了实现这一点，程序的调用栈深度被限制为最大**64帧**。

当程序超出允许的调用栈深度限制时，它将收到`CallDepthExceeded`错误。

## CPI调用深度 - `CallDepth`错误

跨程序调用允许程序直接调用其他程序，但深度目前限制为`4`。

当程序超出允许的[跨程序调用深度](https://solana.com/docs/core/cpi.md)时，它将收到`CallDepth`错误。

## 浮点Rust类型支持

程序支持 Rust 浮点操作的有限子集。如果程序尝试使用不支持的浮点操作，运行时将报告未解决的符号错误。

浮点操作是通过软件库（特别是 LLVM 的浮点内建函数）执行的。由于是软件模拟，它们消耗的计算单元比整数操作更多。一般情况下，建议使用定点操作代替浮点操作。

[Solana数学程序库](https://github.com/solana-labs/solana-program-library/tree/master/libraries/math)测试将反映出一些数学操作的性能。要运行测试，请同步仓库并运行：

```shell
cargo test-sbf -- --nocapture --test-threads=1
```

最近的结果显示，浮点操作相比于整数操作需要更多的指令。定点实现可能有所不同，但也会少于浮点操作：

```text
          u64   f32
Multiply    8   176
Divide      9   219
```

## 静态可写数据

程序共享对象不支持可写共享数据。程序在多个并行执行中共享相同的只读代码和数据。这意味着开发者不应该在程序中包含任何静态可写或全局变量。未来可能会添加写时复制机制来支持可写数据。

## 有符号除法

SBF指令集不支持[有符号除法](https://www.kernel.org/doc/html/latest/bpf/bpf_design_QA.Html#q-why-there-is-no-bpf-sdiv-for-signed-divide-operation)。添加有符号除法指令是一个考虑因素。
