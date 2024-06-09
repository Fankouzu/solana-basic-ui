# 共识验证者 vs RPC节点

维护共识验证者与维护RPC节点有很大的不同。你必须根据自己的兴趣、技术背景和目标来决定哪种选择最适合你。

## 共识验证者

作为验证者，你的主要任务是维护网络并确保你的节点能够最佳地运行，从而使你能够充分参与集群共识。你将希望吸引更多的SOL质押到你的验证者节点，这将为你的验证者节点提供更多生成区块和赚取奖励的机会。

每个质押的验证者通过[投票积分](https://solana.com/docs/terminology#vote-credit)获得通胀奖励。投票积分分配给那些对[领导者](https://solana.com/docs/terminology#leader)生成的[区块](https://solana.com/docs/terminology#block)进行投票的验证者。成功对添加到区块链上的区块进行投票的所有验证者都将获得投票积分。此外，当验证者成为领导者时，它可以从每个成功添加到区块链的区块中赚取交易费和[存储租赁费](https://solana.com/docs/core/accounts#rent)。

由于Solana中的所有投票都发生在区块链上，验证者每次投票都会产生交易费用。这些交易费用每天大约为1.0 SOL。

> 确保您的验证者身份账户中始终有足够的SOL来支付这些交易费用是非常重要的！

### 运行共识验证者的经济

作为一个节点维护者，了解共识验证者如何通过协议花费和赚取SOL是非常重要的。

所有进行投票的验证者（共识验证者）必须为他们同意的区块支付投票交易费用。投票的成本每天最高可达1.1 SOL。

一个进行投票的验证者可以通过两种来源赚取SOL：

1. 在每个epoch结束时支付的通胀奖励。参见[质押奖励](https://docs.solanalabs.com/implemented-proposals/staking-rewards)。
2. 赚取由验证者生成区块中交易费用的50％。参见[交易费用的基本经济设计](https://solana.com/docs/intro/transaction_fees#basic-economic-design)。

以下链接是社区提供的资源，讨论了运行验证者的经济：

- Michael Hubbard 撰写了一篇[文章](https://laine-sa.medium.com/solana-staking-rewards-validator-economics-how-does-it-work-6718e4cccc4e)，更深入地解释了面向质押用户和验证者的Solana经济。

- Congent Crypto 撰写了一篇[博客文章](https://medium.com/@Cogent_Crypto/how-to-become-a-validator-on-solana-9dc4288107b7)，讨论了验证者经济和入门指南。

- Cogent Crypto 还提供了一个[验证者利润计算器](https://cogentcrypto.io/ValidatorProfitCalculator)。

## RPC节点

虽然RPC节点维护者不会收到奖励（因为节点不参与投票），但运行RPC节点有不同的初衷。

RPC节点维护者为希望与Solana区块链交互的用户提供服务。由于你的主要用户通常是技术人员，你需要能够回答有关RPC调用性能的技术问题。这可能需要更多地了解[Solana核心架构](https://docs.solanalabs.com/clusters/)。

如果你将RPC节点作为业务运营，你的工作还将涉及扩展你的系统以满足用户的需求。例如，一些RPC服务商为需要大量请求的项目提供专用服务器。具有开发运维或软件工程背景的人将成为您团队中非常重要的一部分。你需要对Solana架构和[JSON RPC API](https://solana.com/docs/rpc/http)有深入的理解。

或者，你们可能是一个开发团队，希望维护自己的基础设施。在这种情况下，RPC基础设施可以成为你们的生产力的一部分。例如，开发团队可以使用[Geyser插件](https://docs.solanalabs.com/validator/geyser)实时访问集群中的账户或区块信息。