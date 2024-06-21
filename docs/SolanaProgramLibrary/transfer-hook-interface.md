# 转账钩子接口

转账钩子接口（Transfer Hook Interface）是 Solana 程序库中引入的几个接口之一，任何 Solana 程序都可以实现该接口。

在转账过程中，Token-2022会使用此接口调用铸币配置的转账钩子程序，如[转账钩子扩展指南](https://spl.solana.com/token-2022/extensions#transfer-hook)中所述。此外，SPL的GitHub仓库中还提供了一个[参考实现](https://github.com/solana-labs/solana-program-library/tree/master/token/transfer-hook/example)，详细介绍了如何在自己的程序中实现该接口。

转账钩子接口旨在允许代币创建者在代币转账中“挂钩”（附带）额外的功能。代币程序通过接口定义的指令调用转账钩子程序来进行 CPI（跨程序调用）调用转账钩子程序。然后转账钩子程序可以执行任何自定义功能。

对于Token-2022，代币创建者使用铸币扩展来配置转账钩子程序，这个扩展告诉Token-2022在进行转账时应调用哪个程序。

通过这个接口，程序可以组成高度可定制的转账功能，并且可以与许多其他程序兼容，特别是实现了SPL Token接口的代币。
