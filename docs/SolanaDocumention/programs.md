# 程序

在Solana生态系统中，“智能合约”被称为程序。每个[程序](./accounts#程序帐户) 是一个链上账户，存储可执行逻辑，组织成特定功能，称为[指令](./transactions#指令)。

有关Solana程序的更多主题，请参考本文档中包含的部署程序部分的页面。

## 关键点

- 程序是包含可执行代码的链上账户。此代码组织成称为指令的不同功能。

- 程序是无状态的，但可以包括创建新账户的指令，这些账户用于存储和管理程序状态。

- 程序可以通过升级权限来更新。当升级权限设置为null时，程序变为不可变。

- 可验证构建使用户能够验证链上程序与公开可用的源代码匹配。

## 编写Solana程序

Solana程序主要是用
[Rust](https://doc.rust-lang.org/book/) 编程语言编写的，有两种常见的开发方法：

- Anchor: 为Solana程序开发设计的框架。它提供了一种更快、更简单的编写程序的方式，使用Rust宏显著减少样板代码。对于初学者，建议从Anchor框架开始。

- 原生Rust: 这种方法涉及在不使用任何框架的情况下用Rust编写Solana程序。它提供了更多的灵活性，但复杂性增加。

## 更新Solana程序

链上程序可以由被指定为“升级权限”的账户[直接修改](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src/lib.rs#L675)，它通常是最初部署程序的账户。

如果[升级权限](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src/lib.rs#L865)被撤销并设置为 `None`，则程序变为不可变，无法再更新。

## 可验证程序

确保链上代码的完整性和可验证性至关重要。可验证构建确保部署在链上的可执行代码可以由任何第三方独立验证，以匹配其公共源代码。这个过程增强了透明度和信任，使得能够检测源代码和部署程序之间的差异。

Solana开发者社区引入了支持可验证构建的工具，使开发人员和用户都能够验证链上程序准确地反映了它们公开共享的源代码。

- **搜索已验证的程序**: 要快速检查已验证的程序，用户可以在 [SolanaFM](https://solana.fm/)探索器上搜索程序地址，并导航到“验证”标签。查看已验证程序的示例[这里](https://solana.fm/address/PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY)。

- **验证工具**: Ellipsis Labs的[Solana可验证构建CLI](https://github.com/Ellipsis-Labs/solana-verifiable-build)使用户能够独立地验证链上程序与发布的源代码。

- **Anchor中对可验证构建的支持**: Anchor提供了内置的可验证构建支持。详细信息可以在[Anchor文档](https://www.anchor-lang.com/docs/verifiable-builds) 中找到。

## 伯克利包过滤器 (BPF)

Solana利用 [LLVM编译器基础设施](https://llvm.org/) 将程序编译成[可执行和可链接格式 (ELF)](https://en.wikipedia.org/wiki/Executable_and_Linkable_Format)文件。这些文件包括Solana程序的修改版本的[伯克利包过滤器 (eBPF)](https://en.wikipedia.org/wiki/EBPF)字节码，称为“Solana字节码格式” (sBPF)。

使用LLVM使Solana能够潜在地支持任何可以编译到LLVM的BPF后端的编程语言。这显著增强了Solana作为开发平台的灵活性。