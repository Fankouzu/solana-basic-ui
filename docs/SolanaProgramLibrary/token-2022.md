# Token-2022 程序

一种定义在 Solana 区块链上的代币智能合约程序。该智能合约程序为同质化代币（Fungible Tokens）和非同质化代币（Non-Fungible Tokens）定义了一个通用实现。

Token-2022 程序，也称为 Token 扩展，是 [Token 程序](https://spl.solana.com/token) 功能的超集。

| 信息 | 账户地址 |
| --- | --- |
| Token-2022 Program | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |

## 动机

现有的 Token 程序通过一套简单的接口和结构，满足了 Solana 上大多数同质化和非同质化代币的需求。自 2020 年首次部署以来，该程序已经经过了严格的审计。

然而，随着越来越多的开发者带着新想法来到 Solana，他们已经开始分叉 Token 程序以增加功能。更改和部署程序很简单，但在整个生态系统中被采纳却很困难。

Solana 的编程模型要求将程序与账户一起包含在交易中，这使得制定涉及多个代币程序的交易变得复杂。

除了技术难题外，钱包和链上程序必须信任他们选择支持的代币程序。

我们需要增加新的代币功能，同时尽量减少对用户、钱包和 dApps 的干扰。最重要的是，我们必须保证现有代币的安全。

为了实现这两个目标，开发了一个新的代币智能合约程序 Token-2022，并部署在与 Token 程序不同的地址上。


## 概念

为了尽可能简单的被采纳，Token-2022 程序中的功能和结构一定是 Token 程序的超集。

### 指令

Token-2022 程序支持与 Token 程序字节级别完全相同的指令布局。例如，如果您想在具有两位小数的铸造代币上转移 100 个代币，您需要创建一个 `TransferChecked` 指令，其字节表示数据如下：

```text
[12, 100, 0, 0, 0, 0, 0, 0, 0, 2]
 ^^ TransferChecked enum
    ^^^^^^^^^^^^^^^^^^^^^^^^ 100, as a little-endian 64-bit unsigned integer
                              ^ 2, as a byte
```

这种格式对 Token 程序和 Token-2022 程序都有相同的含义。如果您想针对某个程序而不是另一个程序，您只需更改指令中的 `program_id`。

Token-2022 程序中的所有新指令都是从 Token 程序停止的地方开始的。Token 程序有 25 个独特的指令，索引从 0 到 24。Token-2022 程序支持所有这些指令，并在索引 25 处添加新功能。

没有计划向 Token 程序添加新指令。

### 铸币和账户

在结构布局方面，二者遵循相同的理念。`账户` 结构在 Token 和 Token-2022 之间的前 `165` 字节具有完全相同的表示形式，而 `铸币` 结构在前 `82` 字节内的表示形式也相同。

### 扩展

新功能需要在 `铸币` 结构和 `账户` 结构中添加新字段，这将使得所有账户在Token-2022程序中具有相同的布局变得不可能。

新字段以扩展的形式添加。

铸币创建者和账户所有者可以选择加入Token-2022的功能。扩展数据写在`Account` 末尾之后的Token中，即索引`165`处的字节。这意味着总是可以区分铸币和账户。

您可以在[源代码](https://github.com/solana-labs/solana-program-library/blob/master/token/program-2022/src/extension/mod.rs)中了解这是如何实现的。

当前的铸币扩展包括：

+   confidential transfers      
+   transfer fees               
+   closing mint                
+   interest-bearing tokens     
+   non-transferable tokens     
+   permanent delegate          
+   transfer hook               
+   metadata pointer            
+   metadata                    


当前的账户扩展包括：
+   memo required on incoming transfers  
+   immutable ownership    
+   default account state  
+   CPI guard              

扩展可以混合和匹配，这意味着创建一个代币可以只有转账费、只有产生利息、两者兼有或两者都没有！

### 关联代币账户

为了简化操作，仍然只有一个关联代币账户程序，该程序为Token或Token-2022程序创建新的代币账户。

## 开始

要开始使用 Token-2022，请参考以下步骤：

+   [Install the Solana Tools   ](https://docs.solana.com/cli/install-solana-cli-tools)
+   [Project Status ](https://spl.solana.com/token-2022/status)
+   [Extension Guide ](https://spl.solana.com/token-2022/extensions)
+   [Wallet Guide ](https://spl.solana.com/token-2022/wallet)
+   [On-Chain Program Guide ](https://spl.solana.com/token-2022/onchain)
+   [Presentation about Token-2022 ](https://spl.solana.com/token-2022/presentation)

若需查看 Token 程序中现有的功能，请参阅 [token 文档](https://spl.solana.com/token)。Token 程序的功能也同样适用于 Token-2022。

## 源代码

Token-2022 程序的源代码可以在 [GitHub](https://github.com/solana-labs/solana-program-library/tree/master/token/program-2022) 上找到。

关于类型和指令的信息，可以在 [docs.rs](https://docs.rs/spl-token-2022/latest/spl_token_2022/) 上查阅 Rust 文档。

## 安全审计

Token-2022 程序已经进行了多次安全审计。所有的审计报告都会在完成后在这里发布。

以下是截至 2023 年 12 月 13 日完成的审计：

+   Halborn
    +   Review commit hash [`c3137a`](https://github.com/solana-labs/solana-program-library/tree/c3137af9dfa2cc0873cc84c4418dea88ac542965/token/program-2022)
    +   Final report [https://github.com/solana-labs/security-audits/blob/master/spl/HalbornToken2022Audit-2022-07-27.pdf](https://github.com/solana-labs/security-audits/blob/master/spl/HalbornToken2022Audit-2022-07-27.pdf)
+   Zellic
    +   Review commit hash [`54695b`](https://github.com/solana-labs/solana-program-library/tree/54695b233484722458b18c0e26ebb8334f98422c/token/program-2022)
    +   Final report [https://github.com/solana-labs/security-audits/blob/master/spl/ZellicToken2022Audit-2022-12-05.pdf](https://github.com/solana-labs/security-audits/blob/master/spl/ZellicToken2022Audit-2022-12-05.pdf)
+   Trail of Bits
    +   Review commit hash [`50abad`](https://github.com/solana-labs/solana-program-library/tree/50abadd819df2e406567d6eca31c213264c1c7cd/token/program-2022)
    +   Final report [https://github.com/solana-labs/security-audits/blob/master/spl/TrailOfBitsToken2022Audit-2023-02-10.pdf](https://github.com/solana-labs/security-audits/blob/master/spl/TrailOfBitsToken2022Audit-2023-02-10.pdf)
+   NCC Group
    +   Review commit hash [`4e43aa`](https://github.com/solana-labs/solana/tree/4e43aa6c18e6bb4d98559f80eb004de18bc6b418/zk-token-sdk)
    +   Final report [https://github.com/solana-labs/security-audits/blob/master/spl/NCCToken2022Audit-2023-04-05.pdf](https://github.com/solana-labs/security-audits/blob/master/spl/NCCToken2022Audit-2023-04-05.pdf)
+   OtterSec
    +   Review commit hash [`e92413`](https://github.com/solana-labs/solana-program-library/tree/e924132d65ba0896249fb4983f6f97caff15721a)
    +   Final report [https://github.com/solana-labs/security-audits/blob/master/spl/OtterSecToken2022Audit-2023-11-03.pdf](https://github.com/solana-labs/security-audits/blob/master/spl/OtterSecToken2022Audit-2023-11-03.pdf)
+   OtterSec (ZK Token SDK)
    +   Review commit hash [`9e703f8`](https://github.com/solana-labs/solana/tree/9e703f8/zk-token-sdk)
    +   Final report [https://github.com/solana-labs/security-audits/blob/master/spl/OtterSecZkTokenSdkAudit-2023-11-04.pdf](https://github.com/solana-labs/security-audits/blob/master/spl/OtterSecZkTokenSdkAudit-2023-11-04.pdf)
