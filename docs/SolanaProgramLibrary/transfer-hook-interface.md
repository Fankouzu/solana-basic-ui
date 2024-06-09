# 转账钩子接口

转账钩子接口（Transfer Hook Interface）是 Solana 程序库中引入的几个接口之一，任何 Solana 程序都可以实现该接口。

在转账过程中，Token-2022会使用此接口调用铸币配置的转账钩子程序，具体操作如[转账钩子扩展指南](https://spl.solana.com/token-2022/extensions#transfer-hook)所述。此外，SPL的GitHub仓库中还提供了一个[参考实现](https://github.com/solana-labs/solana-program-library/tree/master/token/transfer-hook/example)，详尽展示了如何在自己的程序中实现这一接口。

转账钩子接口设计用于让代币创建者能“挂钩”额外的功能到代币转账过程中。代币程序通过接口定义的指令调用转账钩子程序来进行 CPI（Cross-Program Invocation，跨程序调用）。随后，转账钩子程序可以执行任何自定义功能。

以 Token-2022 为例，代币创建者通过铸币扩展来配置一个转账钩子程序，而这个扩展则告诉 Token-2022 在进行转账操作时应该调用哪个程序。

通过这个接口，程序能够组合出高度可定制的转账功能，这些功能可以与其他许多程序兼容，特别是实现了 SPL 代币接口的代币。