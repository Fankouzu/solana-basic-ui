# 质押委托及奖励

质押者通过帮助验证账本而获得奖励。他们通过将自己的持币委托给验证节点完成上述操作。这些验证节点负责重放账本并将投票发送到每个节点的投票账户，持币者可以将自己的持币委托给这些投票账户。当遇到分叉时，集群的剩余部分会使用基于质押权重的投票来选择一个区块。验证者和质押者都需要经济激励来履行他们的职责。验证者需要补偿其硬件成本，而质押者需要补偿其持币可能被罚没的风险。相关经济学原理在[质押奖励](https://docs.solanalabs.com/implemented-proposals/staking-rewards)部分描述。本章节则描述实现的底层机制。

## 基本设计

总体思路是让验证者拥有一个Vote账户。该Vote账户跟踪验证者的投票，计算验证者生成的积分，以及提供验证者任何其他的特定状态。Vote账户不关心任何委托给它的质押，也没有质押权重。
一个单独的Stake账户（由质押者创建）指派质押所委托的Vote账户。产生的奖励数量与质押的lamports的量成正比。Stake账户仅由质押者拥有。该Stake账户中存储的lamports的一部分即是质押。

## 被动委托

一个Vote账户可以接受任意多个Stake账户的委托，而无需Vote账户的控制者进行交互操作，也无需向该账户提交投票。
所有拥有Vote账户公钥即“StakeStateV2::Stake::voter_pubkey”的Stake账户的持币总和，即为分配给该Vote账户的质押总量。

## 投票和质押账户

奖励过程被拆分为两个链上程序。Vote程序解决了如何使质押可以被罚没的问题。Stake程序作为奖励池的托管方，提供被动委托功能。Stake程序负责在确认质押者的委托参与了账本验证后，向质押者和验证者支付奖励。

### VoteState

VoteState是验证者已提交给网络的所有投票的当前状态。 VoteState包含以下状态信息:
- `votes` - 所提交的投票的数据结构。
- `credits` - Vote程序在其生命周期内所产生的奖励总数。
- `root_slot` - 最后一个达到奖励所需的完全锁定的提交的插槽。
- `commission` - 当前VoteState对质押者的Stake账户所获取奖励的佣金。这是奖励的最高百分比。
- `Account::lamports` - 通过佣金积累的 lamports，这些不算作质押
- `authorized_voter` - 只有该ID有权提交投票。该字段只能由该ID进行修改
- `node_pubkey` - 用于此账户投票的Solana节点
- `authorized_withdrawer` - 拥有本账户所持币的实体ID,与账户地址和授权投票签署人是分开的。

### VoteInstruction::Initialize\(VoteInit\)

- `account[0]` - RW - VoteState。

  `VoteInit` 包含新投票账户的 `node_pubkey`， `authorized_voter`，
  `authorized_withdrawer`, 和 `commission`。

  其他 VoteState 成员使用默认值。

### VoteInstruction::Authorize\(Pubkey, VoteAuthorize\)

根据VoteAuthorize参数 \(`Voter` 或者 `Withdrawer`\)更新账户的新授权投票人或提款人。交易必须由Vote账户的当前 `authorized_voter`或者`authorized_withdrawer`签名。

- `account[0]` - RW - VoteState. `VoteState::authorized_voter` 或者
  `authorized_withdrawer` 被设置为 `Pubkey`。

### VoteInstruction::AuthorizeWithSeed\(VoteAuthorizeWithSeedArgs\)

根据VoteAuthorize 参数 \(`Voter` 或者 `Withdrawer`\) 更新账户的新授权投票人或提款人。 不同于`VoteInstruction::Authorize`， 本指令适用于当投票账户的当前`authorized_voter` 或者 `authorized_withdrawer` 是派生密钥时。 交易必须由能够为该派生密钥的基础密钥签名的人签名。

- `account[0]` - RW - VoteState. `VoteState::authorized_voter` 或者
  `authorized_withdrawer` 被设置为 `Pubkey`。

### VoteInstruction::Vote\(Vote\)

- `account[0]` - RW - VoteState. 根据投票锁定规则（详见[Tower BFT](https://docs.solanalabs.com/implemented-proposals/tower-bft)）更新`VoteState::lockouts` 和
`VoteState::credits`。
- `account[1]` - RO - `sysvar::slot_hashes` 最近 N 个插槽及其哈希值的列表，用于验证投票。
- `account[2]` - RO - `sysvar::clock` 当前网络时间，以槽和纪元表示。

### StakeStateV2

StakeStateV2采用以下四种变体之一：StakeStateV2::Uninitialized,
StakeStateV2::Initialized, StakeStateV2::Stake, 和 StakeStateV2::RewardsPool.
在质押中，仅使用前三种变体，但只有 StakeStateV2::Stake 具有重要意义。所有RewardsPool均在创世时创建。

### StakeStateV2::Stake

StakeStateV2::Stake 是**质押者**当前的委托偏好，包含以下状态信息：

- `Account::lamports` - 可用于质押的 lamports。
- `stake` - 用于生成奖励的质押金额（受预热和冷却期影响），始终小于等于 Account::lamports。
- `voter_pubkey` - Lamports 被委托的 VoteState 实例的公钥。
- `credits_observed` - 在程序生命周期内累计领取的总奖励。
- `activated` - 该质押被激活/委托的纪元。在预热期结束后，完整的质押金额将被计入。
- `deactivated` - 该质押被停用的纪元。在账户完全停用之前，需要经过一些冷却纪元，之后质押才能被提取。
- `authorized_staker` - 必须签署委托、激活和停用交易的实体的公钥。
- `authorized_withdrawer` - 负责此账户中lamports的实体身份，与账户地址和授权质押者是分开的。

### StakeStateV2::RewardsPool

为了避免在赎回时出现整个网络范围的锁定或争用，创世块中包含了256个RewardsPool，它们使用预先确定的密钥进行初始化，每个池都有 std::u64::MAX 的奖励额度，以根据点数值来满足兑换请求。
Stakes账户和RewardsPool账户都归同一个 Stake 程序所有。

### StakeInstruction::DelegateStake

Stake账户会从 StakeStateV2::Initialized 变体切换为 StakeStateV2::Stake 变体，或者从已停用（即完全冷却完成）的 StakeStateV2::Stake 变体重新激活为 StakeStateV2::Stake。这便是质押者选择投票账户和验证节点，并将其抵押账户中的 lamports 委托给这些账户的方式。交易必须由Stake中的`authorized_staker` 签名。 

- `account[0]` - RW - StakeStateV2::Stake 实例.
  `StakeStateV2::Stake::credits_observed` 被初始化为
  `VoteState::credits`，`StakeStateV2::Stake::voter_pubkey` 被初始化为
  `account[1]`。 如果这是质押的初始代理，`StakeStateV2::Stake::stake` 会被初始化为账户的余额， `StakeStateV2::Stake::activated` 会被初始化为当前Bank纪元 `StakeStateV2::Stake::deactivated` 会被初始化为 std::u64::MAX
- `account[1]` - R - VoteState实例.
- `account[2]` - R - sysvar::clock 账户, 携带当前Bank纪元信息.
- `account[3]` - R - sysvar::stakehistory 账户，包含质押历史信息。
- `account[4]` - R - stake::Config 账户，它包含了预热（warmup）、冷却（cooldown）和罚没（slashing）配置。

### StakeInstruction::Authorize\(Pubkey, StakeAuthorize\)

根据StakeAuthorize参数 \(`Staker` 或 `Withdrawer`\)，更新账户的新授权质押者或提取者。交易必须由质押账户当前的 `authorized_staker` 或
`authorized_withdrawer`签名。 任何质押锁定期必须已经到期，或者锁定期的托管人也必须签署交易。

- `account[0]` - RW - StakeStateV2.

  `StakeStateV2::authorized_staker` 或 `authorized_withdrawer` 被设置为
  `Pubkey`.

### StakeInstruction::Deactivate

质押者可能希望从网络中提币。为此，他必须首先停止其质押，并等待冷却。交易必须由Stake的 `authorized_staker`签名。

- `account[0]` - RW - 停止质押的StakeStateV2::Stake实例
- `account[1]` - R - sysvar::clock 来自Bank的账户，包含当前纪元。

StakeStateV2::Stake::deactivated 被设置为当前 纪元 + 冷却。账户的质押将在该纪元内逐渐减少至零，Account::lamports 将可供提取。

### StakeInstruction::Withdraw\(u64\)

Lamports 会随着时间在质押账户中累积，除已激活质押之外，其他的部分都是可以提取的。交易必须由质押账户的`authorized_withdrawer`签名.

- `account[0]` - RW - 要从中提币的StakeStateV2::Stake
- `account[1]` - RW - 接收lamports的账户
- `account[2]` - R - sysvar::clock 来自Bank的账户，携带当前纪元信息，用于计算质押。
- `account[3]` - R - sysvar::stake_history 来自Bank的账户，携带预热/冷却的历史信息。

## 设计的好处

- 所有质押者仅需一次投票。
- 领取奖励时无需清理credit变量 。
- 每个委托质押可独立领取奖励。
- 委托质押的奖励被领取时，工作的佣金也会被同时存入

## 调用流程示例

![Passive Staking Callflow](https://docs.solanalabs.com/assets/images/passive-staking-callflow-13565fc53078e585d250a926832bc482.png)

## 质押奖励
此处简述验证者奖励机制的具体机制和规则。通过将质押委托给正确投票的验证者来获得奖励。不正确的投票会使该验证者的质押受到[罚没(slashing)](https://docs.solanalabs.com/proposals/slashing)。

### 基础知识

网络通过部分网络的[通货膨胀(inflation)](../../SolanaDocumention/terminology#通货膨胀)来支付奖励. 用于支付某个纪元奖励的 lamports 数量是固定的，必须根据每个节点的相对质押权重和参与度，在所有质押节点之间平均分配。权重单位被称为[点数(point)](../../SolanaDocumention/terminology#点数)。

某个纪元的奖励在该纪元结束之前不可领取。

在每个纪元结束时，会对该纪元内获得的总积分进行汇总，并用于分配该纪元通胀中的奖励部分，从而得出每个积分的值。该值会记录在银行的[系统变量(sysvar)](../../SolanaDocumention/terminology#系统变量)中。

在赎回过程中，质押程序会计算每个纪元内质押获得的积分数，将其乘以该纪元的积分值，然后根据投票账户的佣金设置，将相应数量的 lamports 从奖励账户转入质押账户和投票账户。

### 经济学

一个纪元的点数值取决于整个网络的参与度。如果某个纪元的参与度下降，那么对参与者来说，点数值会更高。

### 赚取积分

验证者每完成一次超过最大锁定时间的正确投票就会获得一个投票积分，即每次验证者的投票账户从锁定列表中移除一个槽位（slot），使该投票成为节点的根（root）。

委托给该验证者的质押者根据他们的质押比例获得积分。所得积分是投票积分与质押量的乘积。

### 质押的预热，冷却，提取

质押被委托后，并不会立即生效。它们首先需要经过一个预热期。在此期间，部分质押会被视为“有效”，其余部分被视为“激活中”。这些变化发生在纪元的边界上。

质押程序限制了整个网络质押总量的变化速率，这反映在质押程序的 `config::warmup_rate`中（在当前实现中设定为每个纪元25%）。

每个纪元中可以预热的质押数量取决于前一个纪元的总有效质押、总激活质押以及质押程序配置的预热速率。

冷却过程与预热类似。一旦质押被停用，其中一部分会被视为“有效”，同时也被视为“正在停用”。在质押冷却期间，它继续获得奖励并可能受到惩罚，但也逐渐可以进行提取。

引导质押不受预热限制。

奖励是根据该纪元内“有效”部分的质押支付的。

#### 预热示例

假设在第 N 纪元激活了一个 1000 的质押，网络的预热速率为 20%，在第 N 纪元网络的总质押量为 2000。

在第 N+1 纪元，可激活的网络质押量为 400（2000 的 20%），而在第 N 纪元中，此示例质押是唯一正在激活的质押，因此有权使用所有可用的预热空间。

| 纪元 | 有效质押 | 激活质押 | 总有效质押 | 总激活质押 |
| :---- | --------: | ---------: | --------------: | ---------------: |
| N-1   |           |            |           2,000 |                0 |
| N     |         0 |      1,000 |           2,000 |            1,000 |
| N+1   |       400 |        600 |           2,400 |              600 |
| N+2   |       880 |        120 |           2,880 |              120 |
| N+3   |      1000 |          0 |           3,000 |                0 |

如果在第 N 纪元激活了两个质押（X 和 Y），它们将根据各自的质押比例分配 20% 的预热空间。在每个纪元中，质押的有效部分和激活中的部分都是前一个纪元状态的函数。

| 纪元 | X 有效 | X 激活 | Y 有效 | Y 激活 | 总有效 | 总激活 |
| :---- | ----: | ----: | ----: | ----: | --------------: | ---------------: |
| N-1   |       |       |       |       |           2,000 |                0 |
| N     |     0 | 1,000 |     0 |   200 |           2,000 |            1,200 |
| N+1   |   333 |   667 |    67 |   133 |           2,400 |              800 |
| N+2   |   733 |   267 |   146 |    54 |           2,880 |              321 |
| N+3   |  1000 |     0 |   200 |     0 |           3,200 |                0 |

### 提取

在任何时候，只有有效质押和激活中质押之外的 lamports 才可以提取。这意味着在预热期间，实际上不能提取任何质押。在冷却期间，任何有效质押的之外代币都可以提取（activating  == 0）。由于获得的奖励会自动添加到质押中，因此通常只有在停用后才能进行提取。

### 锁定期

质押账户支持锁定期的概念，即在指定时间之前，质押账户余额不可提取。锁定期以纪元高度（epoch height）指定，即网络必须达到的最低纪元高度，才能提取质押账户的余额，除非交易由指定的托管人签署。该信息在创建质押账户时收集，并存储在质押账户状态的 Lockup 字段中。更改授权质押者或提取者也受到锁定期的限制，因为此类操作实际上是一种转移。
