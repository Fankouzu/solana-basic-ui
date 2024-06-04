# 备忘录程序

备忘录程序是一个简单的程序，可用于验证一串UTF-8编码的字符，并确认所提供的任何账户都是交易的签署方。该程序还会将备忘录和经过验证的签署方地址记录到交易日志中，这样一来，任何人都能轻易查看备忘录，并通过检查来自可信节点的交易日志，了解到备忘录已被零个或多个地址批准。


## 背景

Solana的编程模型以及本文档中使用的Solana术语定义，可从以下链接获取：

+   [https://docs.solana.com/apps](https://docs.solana.com/apps)
+   [https://docs.solana.com/terminology](https://docs.solana.com/terminology)

## 源代码

备忘录程序（Memo Program）的源代码可在[GitHub](https://github.com/solana-labs/solana-program-library)上找到。

## 接口

链上备忘录程序采用Rust语言编写，可以在crates.io上输入[spl-memo](https://crates.io/crates/spl-memo)找到，同时也在[docs.rs](https://docs.rs/spl-memo)上提供了文档说明。

该 crate 包提供了一个 build_memo() 方法，可用于轻松创建一个结构正确的指令。

## 操作说明

对于带有签名的备忘录指令，如果未提供任何账户，当备忘录内容为有效的UTF-8格式时，程序将会成功执行，并将备忘录内容记录到交易日志中。

如果向签名备忘录指令提供了一个或多个账户，那么为了指令的成功执行，所有这些账户都必须是交易的有效签署方。

### 日志记录

本节详细说明备忘录指令预期的日志输出情况。

日志记录从进入程序时开始：“Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr invoke [1]”

对于每个经验证的签署者，程序会包含一条独立的日志：“Program log: Signed by <BASE_58_ADDRESS>”

接着，程序会记录备忘录的长度和UTF-8文本内容：“Program log: Memo (len 4): "🐆"”

如果UTF-8解析失败，程序会记录失败的具体位置：“Program log: Invalid UTF-8, from byte 4”。

日志记录以指令的状态结束，可能是以下几种之一：
- “Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr success”
- “Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr failed: missing required signature for instruction”
- “Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr failed: invalid instruction data”

若想了解更多关于节点提供的程序日志信息，可以参考[开发者文档](https://docs.solana.com/developing/on-chain-programs/debugging#logging)。


### 计算限制

与所有程序一样，备忘录程序受到集群[计算预算](https://docs.solana.com/developing/programming-model/runtime#compute-budget)的约束。在备忘录程序中，计算资源用于解析UTF-8、验证签名者和记录日志，这限制了在单个指令中可以成功处理的备忘录长度和签名者数量。UTF-8备忘录越长或越复杂，支持的签名者就越少，反之亦然。

截至v1.5.1版本，一个未签名的指令可以支持最多566字节的单字节UTF-8。一个简单的32字节备忘录指令可以支持多达12个签名者。