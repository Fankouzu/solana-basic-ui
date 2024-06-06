# Memo 程序

备忘录程序（Memo 程序）是一个简单的程序，用于验证 UTF-8 编码字符的字符串，并验证提供的任何账户是否是交易的签名者。该程序还会将备忘录以及任何已验证的签名者地址记录到交易日志中，以便任何人可以轻松查看备忘录，并通过查看来自可信提供者的交易日志，来了解它们是否已被零个或多个地址批准。


## 背景

Solana的编程模型以及本文档中使用的Solana术语定义，可从以下链接获取：

+   [https://docs.solana.com/apps](https://docs.solana.com/apps)
+   [https://docs.solana.com/terminology](https://docs.solana.com/terminology)

## 源代码

备忘录程序（Memo Program）的源代码可在[GitHub](https://github.com/solana-labs/solana-program-library)上找到。

## 接口

链上备忘录程序采用Rust语言编写，可以在crates.io上输入[spl-memo](https://crates.io/crates/spl-memo)找到，同时也在[docs.rs](https://docs.rs/spl-memo)上提供了文档说明。

该 crate 包提供了一个 `build_memo()` 方法，可用于轻松创建一个结构正确的指令。

## 操作说明

如果在signed-memo指令中提供了一个或多个账户，所有账户都必须是交易的有效签名者，指令才会成功。

### 日志记录

本节详细说明备忘录指令预期的日志输出情况。

日志记录从进入程序时开始：`ProgramMemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr invoke [1]`

程序将为每个验证的签名者记录一个单独的日志：`Program log: Signed by <BASE_58_ADDRESS>`

然后，程序记录备忘录的长度和 UTF-8 文本：`Program log: Memo (len 4): "🐆"`

如果UTF-8解析失败，程序会记录失败的具体位置：`Program log: Invalid UTF-8, from byte 4`。

日志记录以指令状态结束，可能的状态包括：

`Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr success`

`Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr failed: missing required signature for instruction` 

`Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr failed: invalid instruction data`

有关在节点上公开程序日志的更多信息，请参考[开发者文档](https://docs.solana.com/developing/on-chain-programs/debugging#logging)。


### 计算限制

与所有程序一样，Memo 程序也受集群[计算预算](https://docs.solana.com/developing/programming-model/runtime#compute-budget)的长度和单个指令中可以成功处理的签名者数量。备忘录的 UTF-8 长度越长或越复杂，可以支持的签名者就越少，反之亦然。

截至v1.5.1版本，一个未签名的指令可以支持最多566字节的单字节UTF-8。一个简单的32字节备忘录指令可以支持多达12个签名者。
