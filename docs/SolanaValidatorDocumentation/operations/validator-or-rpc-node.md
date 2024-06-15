# 共识验证者节点 vs RPC节点

维护共识验证者节点与维护RPC节点有很大的不同。你必须根据自己的兴趣、技术背景和目标来决定哪种选择最适合你。

## 共识验证者节点

作为验证者节点，您的主要任务是维护网络，并确保您的节点以最佳状态运行，以便您能够全面参与集群共识。您需要吸引 SOL 的质押到您的验证节点，这将使您的验证节点有机会生成更多区块并获得奖励。

每个质押的验证节点通过[投票信用](https://solana.com/docs/terminology#vote-credit)（vote credits）获得通胀奖励。投票信用会分配给对[领导者](https://solana.com/docs/terminology#leader)生成的[区块](https://solana.com/docs/terminology#block)投票的验证节点。所有成功对被添加到区块链上的区块进行投票的验证节点都会获得投票信用。此外，当验证节点是领导者时，它可以通过生成并添加到区块链的每个区块获得交易费用和[存储租金费用](https://solana.com/docs/core/accounts#rent)。

由于 Solana 中的所有投票都发生在区块链上，验证节点会为每次投票支付交易费用。这些交易费用大约每天为 1.0 SOL。

> 确保您的验证者节点在其身份账户中始终有足够的 SOL 来支付这些交易费用，这是非常重要的！

### 运行共识验证者的经济学

作为一个节点维护者，了解共识验证者如何通过协议花费和赚取SOL是非常重要的。

所有投票的验证节点（共识验证节点）必须为其同意的区块支付投票交易费用。投票的费用每天可达 1.1 SOL。

一个进行投票的验证者可以通过两种方式赚取SOL：

1. 在每个纪元（epoch）结束时支付的通胀奖励。参见[质押奖励](https://docs.solanalabs.com/implemented-proposals/staking-rewards)。
2. 生成的区块获得 50% 的交易费用。参见[交易费用的基本经济设计](https://solana.com/docs/intro/transaction_fees#basic-economic-design)。

以下链接是社区提供的关于运行验证节点经济学的资源：

- Michael Hubbard 撰写了一篇[文章](https://laine-sa.medium.com/solana-staking-rewards-validator-economics-how-does-it-work-6718e4cccc4e)，更深入地解释了面向质押用户和验证者的Solana经济学。

- Congent Crypto 撰写了一篇[博客文章](https://medium.com/@Cogent_Crypto/how-to-become-a-validator-on-solana-9dc4288107b7)，讨论了验证者经济和入门指南。

- Cogent Crypto 还提供了一个[验证者利润计算器](https://cogentcrypto.io/ValidatorProfitCalculator)。

## RPC节点

虽然RPC节点维护者不会收到奖励（因为节点不参与投票），但运行RPC节点有不同的初衷。

RPC节点维护者为希望与Solana区块链交互的用户提供服务。由于你的主要用户通常是技术人员，你需要能够回答有关RPC调用性能的技术问题。这可能需要更多地了解[Solana核心架构](https://docs.solanalabs.com/clusters/)。

如果您作为一项业务运营 RPC 节点，您的工作还将涉及扩展系统以满足用户的需求。例如，一些 RPC 提供商为需要大量请求的项目创建专用服务器。具有开发运营或软件工程背景的人将是您团队中非常重要的一部分。您需要对 Solana 架构和 [JSON RPC API](https://solana.com/docs/rpc/http) 有深入的了解。

或者，您可能是一支希望运行自己的基础设施的开发团队。在这种情况下，RPC 基础设施可能是您生产堆栈的一部分。开发团队可以使用 [Geyser插件](https://docs.solanalabs.com/validator/geyser)来实时访问集群中账户或区块的信息。
