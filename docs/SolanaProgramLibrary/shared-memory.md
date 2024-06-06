# 共享内存程序

共享内存程序是一个简单且高度优化的程序，可以将指令数据写入提供的账户数据中。

## 背景

Solana的编程模型以及本文档中使用的Solana术语定义可在以下链接中找到：

+   [https://docs.solana.com/apps](https://docs.solana.com/apps)
+   [https://docs.solana.com/terminology](https://docs.solana.com/terminology)

## 源代码

共享内存程序的源代码可在 [GitHub](https://github.com/solana-labs/solana-program-library) 上找到。


## 接口

共享内存程序期望接收一个账户，并将指令数据写入该账户的数据中。指令数据的前 8 个字节包含账户数据的小端偏移量。从该偏移量开始，指令数据的其余部分将被写入账户数据。

## 操作概述

对于将跨程序调用程序的数据返回给调用者，该程序十分有用。由于账户不需要签名，因此不建议使用此程序在不同交易的程序之间传递数据，因为这样不可靠。
