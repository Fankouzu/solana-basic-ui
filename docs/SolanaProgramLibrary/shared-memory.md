# 共享内存程序

共享内存程序是一个简单且高度优化的程序，可以将指令信息写入指定账户的数据域中。

## 背景

Solana的编程模型以及本文档中使用的Solana术语的定义可在以下链接中找到：

+   [https://docs.solana.com/apps](https://docs.solana.com/apps)
+   [https://docs.solana.com/terminology](https://docs.solana.com/terminology)

## 源代码

共享内存程序的源代码可在 [GitHub](https://github.com/solana-labs/solana-program-library) 上找到。


## 接口

共享内存程序需要一个已经存在的账户，并将指令数据写入该账户的数据域中。指令数据的前8个字节包含账户数据域中的小端偏移量。其余的指令数据将从该偏移量开始写入账户数据域中。

## 操作概述

当在多个智能合约程序间进行调用，并需要返回数据给程序调用者时，共享内存程序非常有用。但因为不需要账户签名，利用共享内存在不同交易内的程序间传递数据是不可靠的。
