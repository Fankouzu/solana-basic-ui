# Solana 开发入门
欢迎来到 Solana 开发者文档！
此页面包含开始使用Solana开发所需的所有信息，包括基本要求、Solana 开发的工作原理以及入门所需的工具。

## 高级开发人员概述
Solana 的开发可以分为两个主要部分：
1. **链上程序开发：**这是您直接创建和部署自定义程序到区块链的地方。部署后，任何知道如何与它们通信的人都可以使用它们。您可以使用 Rust、C 或 C++ 编写这些程序。目前Rust是最支持链上程序开发的。
2. **客户端开发：**这是编写与链上程序通信的软件（称为去中心化应用程序或 dApp）部分。您的应用可以提交交易以在链上执行操作。客户端开发可以用任何编程语言编写。

客户端和链上之间的“粘合剂”是 [Solana JSON RPC API](https://solana.com/docs/rpc)。客户端向 Solana 网络发送 RPC 请求，与链上程序进行交互。这与前端和后端之间的正常开发非常相似。与在 Solana 上工作的主要区别在于后端是一个全局无需许可的区块链。这意味着任何人都可以与您的链上程序进行交互，而无需颁发 API 密钥或任何其他形式的许可。

![客户如何使用Solana区块链](https://solana-developer-content.vercel.app/assets/docs/intro/developer_flow.png)

<center>客户端如何同Solana区块链协同工作</center>

Solana 开发与其他区块链略有不同，因为它具有高度可组合的链上程序。这意味着您可以在任何已经部署的程序之上进行构建，而且通常无需进行任何自定义链上程序开发即可完成。例如，如果要涉及代币，则可以使用已部署在网络上的[代币程序](https://solana.com/docs/core/tokens)。客户端的应用程序可按你自己选择的语言开发。
有志于在Solana上构建的开发人员会发现，开发使用的技术栈与任何其他开发技术栈非常相似。主要区别在于，您将在区块链上开发，并且必须考虑用户如何在链上与您的应用程序进行交互，而不仅仅是在前端。在Solana上进行开发仍然有CI/CD通道、测试、调试工具、前端和后端，以及您在正常开发流程中涉及的任何内容。

## 入门须知
要开始Solana开发，您需要不同的工具，具体取决于您是针对客户端、链上程序还是两者都有。

### 客户端开发
如果你正在开发链上应用程序，你应该知道 Rust。
如果你在客户端进行开发，你可以使用任何你熟悉的编程语言。Solana 拥有社区贡献的 SDK，以帮助开发人员以最流行的语言与 Solana 网络进行交互：

| 开发语言   | SDK   |
|--------|----------|
| RUST | [solana_sdk](https://docs.rs/solana-sdk/latest/solana_sdk/) |
| Typescript | [@solana/web3.js](https://github.com/solana-labs/solana-web3.js) |
| Python | [solders](https://github.com/kevinheavey/solders) |
| Java | [solanaj](https://github.com/skynetcap/solanaj) |
| C++ | [solcpp](https://github.com/mschneider/solcpp) |
| Go | [solana-go](https://github.com/gagliardetto/solana-go) |
| Kotlin | [solanaKT](https://github.com/metaplex-foundation/SolanaKT) |
| Dart | [solana](https://github.com/espresso-cash/espresso-cash-public/tree/master/packages/solana) |

您还需要与RPC建立连接才能与网络交互。可以使用[RPC服务供应商](https://solana.com/rpc)，也可以[运行自己的RPC节点](https://docs.solanalabs.com/operations/setup-an-rpc-node)。

要快速开始入门你应用程序的前端，您可以通过在命令行工具中输入以下内容来生成可自定义的 Solana 脚手架：

```shell
npx create-solana-dapp <project-name>
```

这将创建一个包含所有必要文件和基本配置的新项目，以开始在 Solana 上构建。脚手架将包括一个示例前端和一个链上程序模板（如果您选择了的话）。您可以阅读[`create-solana-dapp`文档](https://github.com/solana-developers/create-solana-dapp?tab=readme-ov-file#create-solana-dapp) 以了解更多信息。

### 链上程序开发
链上程序开发包括用Rust、C或C++编写程序。首先，您需要确保电脑上安装了 Rust。您可以使用以下命令执行此操作：

```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

然后，您需要[安装Solana CLI](https://docs.solanalabs.com/cli/install)来编译和部署您的程序。您可以通过运行以下命令来安装 Solana CLI：

```shell
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

建议使用Solana CLI运行本地验证器来测试您的程序。要在安装Solana CLI后,运行本地验证器，请运行以下命令：

```shell
solana-test-validator
```

这将在您的计算机上启动一个本地验证者程序，您可以使用它来测试您的程序。您可以[在本指南中阅读有关本地开发的更多信息](https://solana.com/developers/guides/getstarted/setup-local-development)。

在构建链上程序时，您可以选择使用原生 Rust（即没有框架）构建或使用 Anchor 框架。Anchor 是一个框架，通过为开发人员提供更高级别的API，可以更轻松地在Solana上构建。把Anchor想象成用React构建你的网站，而不是原始的Javascript和HTML。虽然Javascript和HTML可以让您更好地控制您的网站，但 React 可以加速您的开发并使开发变得容易。您可以在它们的网站上阅读有关[Anchor](https://www.anchor-lang.com/)的更多信息。

你需要一种方法来测试你的程序。根据您的语言偏好，有几种不同的方法可以测试您的程序：
- [solana-program-test](https://docs.rs/solana-program-test/latest/solana_program_test/) - 内置于Rust中的测试框架

- [solana-bankrun](https://kevinheavey.github.io/solana-bankrun/) - 为编写 Typescript 测试而构建的测试框架

- [bankrun](https://kevinheavey.github.io/solders/tutorials/bankrun.html) - 为编写 Python 测试而构建的测试框架

如果您不想在本地开发程序，还可以使用在线[在线IDE Solana Playground](https://beta.solpg.io/)。Solana Playground 允许您在 Solana 上编写、测试和部署程序。您可以[按照我们的指南](https://solana.com/zh/developers/guides/getstarted/hello-world-in-your-browser)开始使用 Solana Playground。

### 开发环境
根据您的工作选择合适的环境非常重要。在Solana，有几种不同的网络环境（称为集群）来促进成熟的测试和 CI/CD 实践：

- 主网Beta版：所有操作发生的生产网络。这里的交易需要真金白银。
- 开发网：保证产品质量的网络，通过部署要测试的程序来保证上线后产品的质量，就是“生产模拟环境”。
- 本地：在计算机上运行 `solana-test-validator` 的用于测试程序的本地网络。这应该是您在开发程序时的首选。

## 示例参考
当您开始在Solana上构建时，还有一些资源可以帮助您加快进程：

- [Solana Cookbook](https://solana.com/developers/cookbook)：一系列参考和代码片段，帮助您在 Solana 上的开发。
- [Solana程序示例](https://github.com/solana-developers/program-examples)：示例程序的仓库，为程序上的不同操作提开发模块。
- [指南](https://solana.com/developers/guides)：教程和指南，引导您完成在Solana上的构建。

## 获取帮助
你能找到的最好的帮助是在[Solana StackExchange](https://solana.stackexchange.com/)上。首先在那里搜索您的问题-很有可能已经有其他人提出问题并有答案。如果不存在，请添加一个新问题！请记住在您的问题中包含尽可能多的详细信息，请使用文本（而不是屏幕截图）来显示错误消息，以便其他有相同问题的人可以找到您的问题！

## 后续步骤
您现在已经准备好开始在 Solana 上开发构建了！

- [在浏览器中部署您的第一个Solana程序](https://solana.com/developers/guides/getstarted/hello-world-in-your-browser)
- [设置本地开发环境](https://solana.com/developers/guides/getstarted/setup-local-development)
- [开始使用 Rust 在本地构建程序](https://solana.com/developers/guides/getstarted/local-rust-hello-world)
- [编写Solana程序概述](https://solana.com/docs/programs)
