# 程序

在 Solana 生态系统中，“智能合约”被称为程序。每个[程序](https://solana.com/zh/docs/core/accounts#program-account)都是一个链上账户，用于存储可执行逻辑，并组织成特定的功能，称为[指令](https://solana.com/zh/docs/core/transactions#instruction)。

有关 Solana 程序的其他主题，请参阅本文档的“[部署程序](https://solana.com/zh/docs/programs)”部分下包含的页面。

## 关键点

- 程序是包含可执行代码的链上账户。此代码被组织成不同的函数，称为指令

- 程序是无状态的，但可以包括创建新账户的指令，这些账户用于存储和管理程序状态。

- 程序可以通过升级权限设定的账户来更新。当升级权限设置为null时，程序变为不可变。

- 可验证的构建使用户能够验证链上程序是否与公开可用的源代码匹配。

## 编写Solana程序

Solana程序主要是用[Rust](https://doc.rust-lang.org/book/) 编程语言编写的，有两种常见的开发方法：

- [Anchor](https://solana.com/zh/developers/guides/getstarted/intro-to-anchor)：专为 Solana 程序开发设计的框架。它提供了一种更快、更简单的程序编写方法，使用 Rust 宏来显著减少样板代码。对于初学者建议从 Anchor 框架开始。

- [原生 Rust](https://solana.com/zh/developers/guides/getstarted/intro-to-native-rust)：这种方法涉及在不利用任何框架的情况下用 Rust 编写 Solana 程序。它提供了更大的灵活性，但也增加了复杂性。

## 升级Solana程序

链上程序可以由被指定为“升级权限”的账户[直接修改](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src/lib.rs#L675)，该账户通常是最初部署程序的账户。

如果[升级权限](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src/lib.rs#L865)被撤销并设置为 `None`，则程序变为不可变，无法再更新。

## 可验证程序

确保链上代码的完整性和可验证性至关重要。可验证的构建确保部署在链上的可执行代码可以独立验证，以匹配任何第三方的公共源代码。此过程增强了透明度和信任度，从而可以检测源代码和已部署程序之间的差异。

Solana 开发者社区引入了支持可验证构建的工具，使开发者和用户能够验证链上程序是否准确反映了他们公开共享的源代码。

- **搜索已验证的程序**: 要快速检查已验证的程序，用户可以在 [SolanaFM](https://solana.fm/)浏览器上搜索程序地址并转到到“验证”网页标签。在[这里](https://solana.fm/address/PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY)查看经过验证的程序示例。

- **验证工具**: Ellipsis Labs的[Solana可验证构建CLI](https://github.com/Ellipsis-Labs/solana-verifiable-build)使用户能够独立地验证链上程序与发布的源代码。

- **Anchor中对可验证构建的支持**: Anchor提供了内置的可验证构建支持。详细信息可以在[Anchor文档](https://www.anchor-lang.com/docs/verifiable-builds) 中找到。

## 伯克利包过滤器 (BPF)

Solana利用 [LLVM编译器基础设施](https://llvm.org/) 将程序编译成[可执行和可链接格式 (ELF)](https://en.wikipedia.org/wiki/Executable_and_Linkable_Format)文件。这些文件包括Solana程序的[伯克利包过滤器 (eBPF)](https://en.wikipedia.org/wiki/EBPF)字节码的修改版本，称为“Solana字节码格式” (sBPF)。

LLVM 的使用使 Solana 能够潜在地支持任何可以编译到 LLVM 的 BPF 后端的编程语言。这大大增强了 Solana 作为开发平台的灵活性。
