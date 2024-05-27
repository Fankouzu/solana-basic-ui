### Solana链上程序开发概述

开发者可以编写并部署自己的程序到Solana区块链。这个过程可以大致总结为几个关键步骤。

<Callout title="Hello World: 开始Solana开发">

要快速开始Solana开发并构建你的第一个Rust程序，可以参考以下详细的快速入门指南：

- [仅使用浏览器构建并部署你的第一个Solana程序](/content/guides/getstarted/hello-world-in-your-browser.md)。无需安装。
- [设置本地环境](/content/guides/getstarted/setup-local-development.md)并使用本地测试验证器。

</Callout>

## 链上程序开发生命周期

1. 设置开发环境
2. 编写程序
3. 编译程序
4. 生成程序的公共地址
5. 部署程序

### 1. 设置开发环境

最稳健的开始Solana开发的方法是在本地计算机上[安装Solana CLI](https://docs.solanalabs.com/cli/install)工具。这将为你提供最强大的开发环境。

一些开发者也可能选择使用[Solana Playground](https://beta.solpg.io/)，这是一个基于浏览器的IDE。它允许你在浏览器中编写、构建和部署链上程序，无需安装。

### 2. 编写程序

编写Solana程序通常使用Rust语言。这些Rust程序实际上与创建传统的[Rust库](https://doc.rust-lang.org/rust-by-example/crates/lib.html)相同。

> 你可以在下方阅读更多关于其他[支持语言](#支持的语言)的信息。

### 3. 编译程序

当程序编写完成后，必须将其编译为[Berkley Packet Filter](faq.md#berkeley-packet-filter-bpf)字节码，然后部署到区块链。

### 4. 生成程序的公共地址

使用[Solana CLI](https://docs.solanalabs.com/cli/install)，开发者将为新程序生成一个新的唯一[密钥对](/docs/terminology.md#keypair)。这个密钥对的公共地址（又称[Pubkey](/docs/terminology.md#public-key-pubkey)）将在链上用作程序的公共地址（又称[`programId`](/docs/terminology.md#program-id)）。

### 5. 部署程序

再次使用CLI，编译后的程序可以通过创建包含程序字节码的多个交易来部署到选定的区块链集群。由于交易内存大小的限制，每个交易实际上是以快速发送小块程序到区块链的方式进行的。

一旦整个程序发送到区块链，最后会发送一个交易将所有缓冲的字节码写入程序的数据账户。这将标记新程序为`可执行`，或者完成升级现有程序的过程（如果它已经存在）。

## 支持的语言

Solana程序通常使用[Rust语言](lang-rust.md)编写，但也支持[C/C++](lang-c.md)。

社区也有通过各种努力使得可以用其他语言来编写链上程序，包括：

- 通过[Seahorse](https://seahorse.dev/)使用Python（它作为基于Rust的Anchor框架的包装器）

## 示例程序

你也可以探索[程序示例](examples.md)，查看链上程序的示例。

## 限制

随着对Solana链上程序开发的深入理解，我们需要知晓链上程序的一些重要限制。

阅读更多详细信息请访问[Solana的局限性](limitations.md)页面。

## 常见问题

浏览其他开发者关于编写/理解Solana程序的[常见问题](faq.md)。
