# 程序示例


"[Solana程序示例](https://github.com/solana-developers/program-examples)" GitHub仓库提供了多个子文件夹，每个文件夹包含不同Solana编程范式和语言的代码示例，旨在帮助开发者学习和实验Solana区块链开发。

你可以在`solana-developers/program-examples`中找到这些示例以及README文件，这些文件会解释如何运行不同的示例。大多数示例是自包含的，并且有原生Rust（即无框架）、[Anchor](https://www.anchor-lang.com/docs/installation)、[Seahorse](https://seahorse-lang.org/)的版本，还包含我们希望[看到的贡献示例](https://github.com/solana-developers/program-examples?tab=readme-ov-file#examples-wed-love-to-see)。
在仓库中，你会找到以下子文件夹，每个文件夹内有各种示例程序：

- [程序示例](#程序示例)
  - [基础](#基础)
  - [压缩](#压缩)
  - [预言机](#预言机)
  - [代币](#代币)
  - [Token 2022（代币扩展）](#token-2022代币扩展)
  - [Break](#break)
    - [构建和运行](#构建和运行)

## 基础

包含一系列示例，展示了使用原生Rust库构建Solana程序的基础步骤。这些示例旨在帮助开发者理解Solana编程的核心概念。

| 示例名称                                                                                                                  | 描述                                                                                      | 语言                            |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------- |
| [创建账户](https://github.com/solana-developers/program-examples/tree/main/basics/account-data)                           | 在账户中保存地址、姓名、门牌号、街道和城市。                                              | Native, Anchor                    |
| [检查账户](https://github.com/solana-developers/program-examples/tree/main/basics/checking-accounts)                      | 安全课程，展示如何进行账户检查。                                                          | Native, Anchor                    |
| [关闭账户](https://github.com/solana-developers/program-examples/tree/main/basics/close-account)                          | 展示如何关闭账户以取回租金。                                                              | Native, Anchor                    |
| [计数器](https://github.com/solana-developers/program-examples/tree/main/basics/counter)                                  | 一个简单的计数器程序，包含所有不同的架构。                                                | Native, Anchor, Seahorse, mpl-stack |
| [创建账户](https://github.com/solana-developers/program-examples/tree/main/basics/create-account)                         | 如何在程序中创建系统账户。                                                                | Native, Anchor                    |
| [跨程序调用](https://github.com/solana-developers/program-examples/tree/main/basics/cross-program-invocation)             | 使用手和杠杆的类比展示如何在程序中调用另一个程序。                                        | Native, Anchor                    |
| [你好Solana](https://github.com/solana-developers/program-examples/tree/main/basics/hello-solana)                         | Hello world示例，仅在交易日志中打印hello world。                                          | Native, Anchor                    |
| [PDA租金支付者](https://github.com/solana-developers/program-examples/tree/main/basics/pda-rent-payer)                    | 展示如何使用PDA的lamports支付新账户的费用。                                               | Native, Anchor                    |
| [处理指令](https://github.com/solana-developers/program-examples/tree/main/basics/processing-instructions)                | 展示如何处理指令数据字符串和u32。                                                         | Native, Anchor                    |
| [程序派生地址](https://github.com/solana-developers/program-examples/tree/main/basics/program-derived-addresses)          | 展示如何使用种子引用PDA并在其中保存数据。                                                 | Native, Anchor                    |
| [重新分配](https://github.com/solana-developers/program-examples/tree/main/basics/realloc)                                | 展示如何增加和减少现有账户的大小。                                                        | Native, Anchor                    |
| [租金](https://github.com/solana-developers/program-examples/tree/main/basics/rent)                                       | 你将在这里学习如何在程序中计算租金要求。                                                  | Native, Anchor                    |
| [仓库布局](https://github.com/solana-developers/program-examples/tree/main/basics/repository-layout)                      | 关于如何构建程序布局的建议。                                                              | Native, Anchor                    |
| [转移SOL](https://github.com/solana-developers/program-examples/tree/main/basics/transfer-sol)                            | 展示系统账户和PDA的不同SOL转移方法。                                                      | Native, Anchor, Seahorse          |

## 压缩

包含一系列示例，展示如何在Solana上使用[状态压缩](/docs/advanced/state-compression.md)。主要集中在压缩NFT（cNFT）。

| 示例名称                                                                                                  | 描述                                                                                 | 语言   |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------ |
| [cNFT销毁](https://github.com/solana-developers/program-examples/tree/main/compression/cnft-burn)         | 要销毁cNFT，可以将其烧毁。此示例展示了如何在程序中执行此操作。                       | Anchor |
| [cNFT保险库](https://github.com/solana-developers/program-examples/tree/main/compression/cnft-vault/anchor) | 如何在程序中保管cNFT并再次发送出去。                                                 | Anchor |
| [cutils](https://github.com/solana-developers/program-examples/tree/main/compression/cutils)              | 一套工具，例如在程序中铸造和验证cNFT。                                               | Anchor |

## 预言机

预言机允许在程序中使用链下数据。

| 示例名称                                                                 | 描述                                                                 | 语言             |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------- | ---------------- |
| [Pyth](https://github.com/solana-developers/program-examples/tree/main/oracles/pyth) | Pyth使代币的价格数据在链上程序中可用。                                | Anchor, Seahorse |

## 代币

大多数Solana上的代币使用Solana程序库（SPL）代币标准。这里你可以找到许多关于如何铸造、转移、销毁代币以及如何在程序中与它们交互的示例。

| 示例名称                                                                                                    | 描述                                                                                       | 语言                     |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------ |
| [创建代币](https://github.com/solana-developers/program-examples/tree/main/tokens/create-token)             | 如何创建代币并添加Metaplex元数据。                                                         | Anchor, Native             |
| [NFT铸造器](https://github.com/solana-developers/program-examples/tree/main/tokens/nft-minter)              | 仅铸造一个代币数量，然后移除铸造权限。                                                     | Anchor, Native             |
| [PDA铸造权限](https://github.com/solana-developers/program-examples/tree/main/tokens/pda-mint-authority)    | 展示如何更改铸造的铸造权限，以便在程序中铸造代币。                                         | Anchor, Native             |
| [SPL代币铸造器](https://github.com/solana-developers/program-examples/tree/main/tokens/spl-token-minter)    | 解释如何使用关联代币账户来跟踪代币账户。                                                   | Anchor, Native             |
| [代币交换](https://github.com/solana-developers/program-examples/tree/main/tokens/token-swap)               | 广泛的示例，展示如何为SPL代币构建AMM（自动做市商）池。                                     | Anchor                   |
| [转移代币](https://github.com/solana-developers/program-examples/tree/main/tokens/transfer-tokens)          | 展示如何使用CPI将SPL代币转移到代币程序中。                                                 | Anchor, Native, Seahorse   |
| [Token-2022](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022)             | 参见Token 2022（代币扩展）。                                                               | Anchor, Native             |

## Token 2022（代币扩展）

Token 2022是Solana上的新代币标准。它更灵活，允许你为代币铸造添加16种不同的扩展，以增加更多功能。完整的扩展列表可以在[入门指南](https://solana.com/developers/guides/token-extensions/getting-started)中找到。

| 示例名称                                                                                                                            | 描述                                                                                                       | 语言   |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------ |
| [基础](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/basics/anchor)                             | 如何创建代币、铸造和转移它。                                                                               | Native |
| [默认账户状态](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/default-account-state/native)      | 此扩展允许你创建具有特定状态的代币账户，例如冻结状态。                                                     | Native   |
| [铸造关闭权限](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/mint-close-authority)              | 旧代币程序中无法关闭铸造，现在可以了。                                                                     | Native   |
| [多重扩展](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/multiple-extensions)                  | 展示如何为单个铸造添加多个扩展。                                                                           | Native   |
| [NFT元数据指针](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/nft-meta-data-pointer)            | 可以使用元数据扩展创建NFT并添加动态链上元数据。                                                             | Anchor |
| [不可转移](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/non-transferable/native)               | 例如用于成就、推荐计划或任何灵魂绑定代币。                                                                 | Native   |
| [转移费用](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/transfer-fees)                         | 每次转移代币时，部分代币会保留在代币账户中，然后可以收集这些代币。                                         | Native   |
| [转移钩子](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/transfer-hook)                        | 四个示例展示如何使用CPI从代币程序到你的程序中为代币添加额外功能。                                          | Anchor |

## Break

[Break](https://break.solana.com/)是一个React应用程序，给用户一种直观的感觉，展示Solana网络的快速和高性能。你能_打破_ Solana区块链吗？在15秒的游戏过程中，每次点击按钮或按键都会向集群发送一个新交易。尽可能快地敲击键盘，观看你的交易实时完成，而网络则从容应对！

Break可以在我们的Devnet、Testnet和Mainnet Beta网络上玩。在Devnet和Testnet上游戏是免费的，游戏会由网络水龙头资助。在Mainnet Beta上，用户每局游戏需支付0.08 SOL。会话账户可以通过本地密钥库钱包资助，或通过扫描Trust Wallet的二维码转移代币。

[点击这里玩Break](https://break.solana.com/)

### 构建和运行

首先获取示例代码的最新版本：

```shell
git clone https://github.com/solana-labs/break.git
cd break
```

接下来，按照git仓库的[README](https://github.com/solana-labs/break/blob/main/README.md)中的步骤操作。
