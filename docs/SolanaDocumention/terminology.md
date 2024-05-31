# 术语

以下术语在整个 Solana 文档和开发生态系统中使用。

<a id="account"></a>

## 账户 [account](#account)
一条Solana账本记录，可以持有数据或作为一个可执行程序。

类似于传统银行的账户，Solana账户可以持有称为[lamports](#lamport)的资金。如同Linux系统中的文件，它可以通过一个键（通常称为[公钥](#public-key-pubkey)或pubkey）来寻址。

键可能是以下之一：
- 一个ed25519公钥
- 一个程序派生账户地址（32字节值，从ed25519曲线中推导出来）
- 一个ed25519公钥的哈希，附加32字符的字符串

<a id="account-owner"></a>

## 账户拥有者 [account owner](#account-owner)
拥有账户的程序的地址。只有拥有者程序才能修改账户。

<a id="app"></a>

## 应用程序 [app](#app)
与Solana集群交互的前端应用程序。

<a id="bank-state"></a>

## 银行状态 [bank state](#bank-state)
在给定[tick高度](#tick-height)下解释账本上所有程序的结果。它至少包括持有非零[本地代币](#native-token)的所有[账户](#account)集合。

<a id="block"></a>

## 区块 [block](#block)
由一个[投票](#ledger-vote)覆盖的账本中的连续[条目](#entry)集。一个[领导者](#leader)每个[时隙](#slot)最多生产一个区块。

<a id="blockhash"></a>

## 区块哈希 [blockhash](#blockhash)
标识记录（区块）的唯一值（[哈希](#hash)）。Solana从区块的最后一个[条目ID](#entry-id)计算一个区块哈希。

<a id="block-height"></a>

## 区块高度 [block height](#block-height)
当前区块下方的[区块](#block)数量。紧随[创世区块](#genesis-block)之后的区块高度为一。

<a id="bootstrap-validator"></a>

## 引导验证者 [bootstrap validator](#bootstrap-validator)
生成区块链创世（第一个）[区块](#block)的[验证者](#validator)。

<a id="bpf-loader"></a>

## BPF加载器 [BPF loader](#bpf-loader)
Solana程序，负责拥有和加载[BPF](https://solana.com/zh/docs/programs/faq#berkeley-packet-filter-bpf)[链上程序](#onchain-program)，使程序能够与运行时接口。

<a id="client"></a>

## 客户端 [client](#client)
访问Solana服务器网络[集群](#cluster)的计算机程序。

<a id="commitment"></a>

## 承诺 [commitment](#commitment)
对[区块](#block)的网络确认的度量。

<a id="cluster"></a>

## 集群 [cluster](#cluster)
维护单一[账本](#ledger)的一组[验证者](#validator)。

<a id="compute-budget"></a>

## 计算预算 [compute budget](#compute-budget)
每笔交易消耗的最大[计算单位](#compute-units)数。

<a id="compute-units"></a>

## 计算单位 [compute units](#compute-units)
区块链计算资源消耗的最小测量单位。

<a id="confirmation-time"></a>

## 确认时间 [confirmation time](#confirmation-time)
从[领导者](#leader)创建一个[tick条目](#tick-entry)到创建一个[确认区块](#confirmed-block)的时钟持续时间。

<a id="confirmed-block"></a>

## 确认区块 [confirmed block](#confirmed-block)
已收到[账本投票](#ledger-vote)超级多数票的[区块](#block)。

<a id="control-plane"></a>

## 控制平面 [control plane](#control-plane)
连接[集群](#cluster)所有[节点](#node)的gossip网络。

<a id="cooldown-period"></a>

## 冷却期 [cooldown period](#cooldown-period)
在[质押](#stake)被停用后的若干[周期](#epoch)，期间逐渐变得可以提取。在此期间，质押被认为是“正在停用”。更多信息请参见：[质押预热和冷却](https://docs.solanalabs.com/implemented-proposals/staking-rewards#stake-warmup-cooldown-withdrawal)。

<a id="credit"></a>

## 信用 [credit](#credit)
参见[投票信用](#vote-credit)。

<a id="cross-program-invocation-cpi"></a>

## 跨程序调用 (CPI) [cross-program invocation (CPI)](#cross-program-invocation-cpi)
从一个[链上程序](#onchain-program)调用另一个。更多信息请参见：[程序间调用](https://solana.com/zh/docs/core/cpi)。

<a id="data-plane"></a>

## 数据平面 [data plane](#data-plane)
用于高效验证[条目](#entry)并达成共识的多播网络。

<a id="drone"></a>

## 无人机 [drone](#drone)
作为用户私钥托管人的链外服务。它通常用于验证和签署交易。

<a id="entry"></a>

## 条目 [entry](#entry)
账本中的一个[条目](#entry)，可以是一个[tick](#tick)或一个[交易条目](#transactions-entry)。

<a id="entry-id"></a>

## 条目ID [entry id](#entry-id)
一个对条目最终内容的抗预像攻击[哈希](#hash)，作为条目的全局唯一标识符。该哈希作为以下内容的证据：
- 条目是在一段时间后生成的
- 包含的[交易](#transaction)是条目中的那些交易
- 条目相对于账本中其他条目的位置

参见[历史证明](#proof-of-history-poh)。

<a id="epoch"></a>

## 纪元 [epoch](#epoch)
有效的[领导者计划](#leader-schedule)的时间，即[时隙](#slot)数。

<a id="fee-account"></a>

## 费用账户 [fee account](#fee-account)
交易中的费用账户是支付将交易包括在账本中的费用的账户。这是交易中的第一个账户。由于支付交易费用会减少账户余额，因此该账户必须在交易中声明为可读写。

<a id="finality"></a>

## 最终性 [finality](#finality)
当代表2/3[质押](#stake)的节点有一个共同的[根](#root)。

<a id="fork"></a>

## 分叉 [fork](#fork)
从共同条目派生但随后分叉的[账本](#ledger)。

<a id="genesis-block"></a>

## 创世区块 [genesis block](#genesis-block)
链中的第一个[区块](#block)。

<a id="genesis-config"></a>

## 创世配置 [genesis config](#genesis-config)
为[创世区块](#genesis-block)准备[账本](#ledger)的配置文件。

<a id="hash"></a>

## 哈希 [hash](#hash)
字节序列的数字指纹。

<a id="inflation"></a>

## 通货膨胀 [inflation](#inflation)
随着时间的推移，代币供应量的增加用于资助验证奖励和Solana的持续开发。

<a id="inner-instruction"></a>

## 内部指令 [inner instruction](#inner-instruction)
参见[跨程序调用](#cross-program-invocation-cpi)。

<a id="instruction"></a>

## 指令 [instruction](#instruction)
调用特定[指令处理程序](#instruction-handler)的调用。[指令](#instruction)还指定要读取或修改的账户，以及作为辅助输入提供的附加数据。[客户端](#client)必须在[交易](#transaction)中包含至少一个指令，所有指令必须完成，交易才能被视为成功。

<a id="instruction-handler"></a>

## 指令处理程序 [instruction handler](#instruction-handler)
处理[交易](#transaction)中[指令](#instruction)的[程序](#program)函数。指令处理程序可以包含一个或多个[跨程序调用](#cross-program-invocation-cpi)。

<a id="keypair"></a>

## 密钥对 [keypair](#keypair)
访问账户所需的[公钥](#public-key-pubkey)和对应的[私钥](#private-key)。

<a id="lamport"></a>

## lamport [lamport](#lamport)
价值0.000000001[sol](#sol)的[本地代币](#native-token)的分量单位。

在计算预算中，微lamports用于计算[优先费用](#prioritization-fee)。

<a id="leader"></a>

## 领导者 [leader](#leader)
当[验证者](#validator)将[条目](#entry)附加到[账本](#ledger)时的角色。

<a id="leader-schedule"></a>

## 领导者计划 [leader schedule](#leader-schedule)
将[验证者](#validator)[公钥](#public-key-pubkey)映射到[时隙](#slot)的序列。集群使用领导者计划来确定任何时刻的领导者。

<a id="ledger"></a>

## 账本 [ledger](#ledger)
包含由[客户端](#client)签名的[交易](#transaction)的[条目](#entry)列表。从概念上讲，可以追溯到[创世区块](#genesis-block)，但实际的[验证者](#validator)的账本可能只包含较新的[区块](#block)以减少存储，因为较旧的区块在设计上不需要用于验证未来的区块。

<a id="ledger-vote"></a>

## 账本投票 [ledger vote](#ledger-vote)
在给定[tick高度](#tick-height)上[验证者](#validator)状态的[哈希](#hash)。它包含验证者对已收到的区块的验证确认，以及在特定时间段（锁定期）内不投票给冲突区块（即[分叉](#fork)）的承诺。

<a id="light-client"></a>

## 轻客户端 [light client](#light-client)
一种可以验证其指向有效[集群](#cluster)的[客户端](#client)。它执行的账本验证比[薄客户端](#thin-client)多，比[验证者](#validator)少。

<a id="loader"></a>

## 加载器 [loader](#loader)
能够解释其他链上程序二进制编码的[程序](#program)。

<a id="lockout"></a>

## 锁定期 [lockout](#lockout)
[验证者](#validator)无法对另一个[分叉](#fork)进行[投票](#ledger-vote)的时间段。

<a id="message"></a>

## 消息 [message](#message)
[交易](#transaction)的结构化内容。通常包含一个头部、账户地址数组、最近的[区块哈希](#blockhash)和指令数组。更多关于交易内部消息格式的信息请参见：[交易消息格式](https://solana.com/zh/docs/core/transactions#message-header)。

<a id="nakamoto-coefficient"></a>

## 中本聪系数 [Nakamoto coefficient](#nakamoto-coefficient)
一种衡量去中心化程度的指标，中本聪系数是可以集体行动关闭区块链的独立实体的最小数量。这个术语由Balaji S. Srinivasan和Leland Lee在[量化去中心化](https://news.earn.com/quantifying-decentralization-e39db233c28e)中提出。

<a id="native-token"></a>

## 本地代币 [native token](#native-token)
用于跟踪集群中[节点](#node)完成工作的[代币](#token)。

<a id="node"></a>

## 节点 [node](#node)
参与[集群](#cluster)的计算机。

<a id="node-count"></a>

## 节点数量 [node count](#node-count)
参与[集群](#cluster)的[验证者](#validator)数量。

<a id="onchain-program"></a>

## 链上程序 [onchain program](#onchain-program)
Solana区块链上可执行的代码，解释每个[交易](#transaction)中发送的[指令](#instruction)，读取并修改其控制的账户。这些程序在其他区块链上通常称为“[智能合约](https://solana.com/zh/docs/core/programs)”。

<a id="poh"></a>

## 历史证明 (PoH) [proof of history](#proof-of-history-poh)
一个证明堆栈，每个证明都证明在创建前存在一些数据，并且在上一个证明之前经过了精确的时间。像[可验证延迟函数 (VDF)](#verifiable-delay-function-vdf)一样，历史证明可以在比生成所需时间更短的时间内验证。

<a id="prioritization-fee"></a>

## 优先费用 [prioritization fee](#prioritization-fee)
用户可以在计算预算[指令](#instruction)中指定的额外费用，以优先处理他们的[交易](#transaction)。优先费用通过将请求的最大计算单位数乘以计算单位价格（以每计算单位0.000001 lamports为增量指定）并四舍五入到最接近的lamport来计算。交易应请求执行所需的最小计算单位数以最小化费用。

<a id="public-key-pubkey"></a>

## 公钥 (pubkey) [public key](#public-key-pubkey)
[密钥对](#keypair)的公钥。

<a id="rent"></a>

## 租金 [rent](#rent)
由[账户](#account)和[程序](#program)支付的在区块链上存储数据的费用。当账户余额不足以支付租金时，账户可能会被垃圾回收。更多关于租金的信息请参见：[什么是租金？](https://solana.com/zh/docs/intro/rent)。

<a id="rent-exempt"></a>

## 免租 [rent exempt](#rent-exempt)
维持最小lamport余额与账户存储的数据量成比例的账户。所有新创建的账户永久存储在链上，直到账户关闭。不可能创建低于免租门槛的账户。

<a id="root"></a>

## 根 [root](#root)
在[验证者](#validator)上达到最大[锁定期](#lockout)的[区块](#block)或[时隙](#slot)。根是所有活动分叉的祖先的最高区块。根的所有祖先区块也都是根。不是根的祖先且不是根的后代的区块将被排除在共识考虑之外，并可以被丢弃。

<a id="runtime"></a>

## 运行时 [runtime](#runtime)
负责执行[程序](#program)的[验证者](#validator)组件。

<a id="sealevel"></a>

## Sealevel [Sealevel](#sealevel)
Solana的并行运行时，用于[链上程序](#onchain-program)。

<a id="shred"></a>

## 分片 [shred](#shred)
一个[区块](#block)的一部分；在[验证者](#validator)之间传递的最小单位。

<a id="signature"></a>

## 签名 [signature](#signature)
一个64字节的ed25519签名，包含R（32字节）和S（32字节）。R是一个不小序的Edwards点，S是0 <= S < L范围内的标量。这个要求确保没有签名可变性。每个交易必须至少有一个签名用于[费用账户](#fee-account)。因此，交易中的第一个签名可以视为[交易ID](#transaction-id)。

<a id="skip-rate"></a>

## 跳过率 [skip rate](#skip-rate)
当前纪元中[领导者](#leader)时隙的总时隙中[跳过时隙](#skipped-slot)的百分比。由于样本量小，因此在纪元边界后和对领导者时隙数量较少的验证者可能具有高方差，但有时也可用于识别节点配置错误。

<a id="skipped-slot"></a>

## 跳过时隙 [skipped slot](#skipped-slot)
由于领导者离线或集群共识放弃了包含时隙的[分叉](#fork)而未产生[区块](#block)的过去时隙。跳过的时隙不会作为后续时隙的祖先出现，不会增加[区块高度](#block-height)，也不会过期最旧的recent_blockhash。是否跳过时隙只能在最新[根](#root)时隙之后确定。

<a id="slot"></a>

## 时隙 [slot](#slot)
每个[领导者](#leader)吸收交易并生成[区块](#block)的时间段。时隙集合创建一个逻辑时钟。时隙按顺序排列且不重叠，大致相当于实际世界的时间，依据[历史证明 (PoH)](#proof-of-history-poh)。

<a id="smart-contract"></a>

## 智能合约 [smart contract](#smart-contract)
参见[链上程序](#onchain-program)。

<a id="sol"></a>

## sol [sol](#sol)
Solana[集群](#cluster)的[本地代币](#native-token)。

<a id="solana-program-library-spl"></a>

## Solana程序库 (SPL) [Solana Program Library (SPL)](#solana-program-library-spl)
Solana上的[程序](https://spl.solana.com/)库，如spl-token，便于创建和使用代币等任务。

<a id="stake"></a>

## 质押 [stake](#stake)
如果能够证明[验证者](#validator)的恶意行为，则这些代币将被没收给[集群](#cluster)。

<a id="stake-weighted-quality-of-service-swqos"></a>

## 质押加权服务质量 (SWQoS) [stake-weighted quality of service (SWQoS)](#stake-weighted-quality-of-service-swqos)
SWQoS允许[交易](https://solana.com/zh/developers/guides/advanced/stake-weighted-qos)从质押验证者中获得优先处理。

<a id="supermajority"></a>

## 超级多数 [supermajority](#supermajority)
[集群](#cluster)的2/3。

<a id="sysvar"></a>

## 系统变量 [sysvar](#sysvar)
系统[账户](#account)。[系统变量](https://docs.solanalabs.com/runtime/sysvars)提供集群状态信息，如当前tick高度、奖励[点数](#point)值等。程序可以通过系统变量账户（公钥）或通过系统调用访问系统变量。

<a id="thin-client"></a>

## 薄客户端 [thin client](#thin-client)
一种[客户端](#client)，它相信自己正在与一个有效的[集群](#cluster)进行通信。

<a id="tick"></a>

## tick [tick](#tick)
估算时钟持续时间的账本[条目](#entry)。

<a id="tick-height"></a>

## tick高度 [tick height](#tick-height)
账本中的第N个[tick](#tick)。

<a id="token"></a>

## 代币 [token](#token)
一种数字可转移的资产。

<a id="token-extensions-program"></a>

## 代币扩展程序 [Token Extensions Program](#token-extensions-program)
[代币扩展程序](https://spl.solana.com/token-2022)的程序ID为`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`，包括与[代币程序](#token-program)相同的功能，但附带扩展，如保密转账、自定义转账逻辑、扩展元数据等。

<a id="token-program"></a>

## 代币程序 [Token Program](#token-program)
[代币程序](https://spl.solana.com/token)的程序ID为`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`，提供代币转账、冻结和铸造的基本功能。

<a id="tps"></a>

## 每秒交易数 (tps) [transactions per second (tps)](#tps)
每秒的[交易](#transaction)数量。

<a id="tpu"></a>

## 交易处理单元 (tpu) [transaction processing unit (tpu)](#tpu)
[交易处理单元](https://docs.solanalabs.com/validator/tpu)。

<a id="transaction"></a>

## 交易 [transaction](#transaction)
由一个或多个[客户端](#client)使用一个或多个[密钥对](#keypair)签名的一个或多个[指令](#instruction)，原子性地执行，只有两种可能结果：成功或失败。

<a id="transaction-id"></a>

## 交易ID [transaction id](#transaction-id)
[交易](#transaction)中的第一个[签名](#signature)，可用于在完整的[账本](#ledger)中唯一标识交易。

<a id="transaction-confirmations"></a>

## 交易确认数 [transaction confirmations](#transaction-confirmations)
自交易被接受到[账本](#ledger)以来的[确认区块](#confirmed-block)数量。当交易的区块成为[根](#root)时，交易即被最终确定。

<a id="transactions-entry"></a>

## 交易条目 [transactions entry](#transactions-entry)
可以并行执行的一组[交易](#transaction)。

<a id="tvu"></a>

## 交易验证单元 (tvu) [transaction validation unit (tvu)](#tvu)
[交易验证单元](https://docs.solanalabs.com/validator/tvu)。

<a id="validator"></a>

## 验证者 [validator](#validator)
在Solana网络[集群](#cluster)中生成新[区块](#block)的完整参与者。验证者验证添加到[账本](#ledger)中的交易。

<a id="vdf"></a>

## 可验证延迟函数 (VDF) [verifiable delay function (VDF)](#verifiable-delay-function-vdf)
一个需要固定时间执行并生成可验证其运行的证明的函数，该证明可以在比生成所需时间更短的时间内验证。

<a id="vote"></a>

## 投票 [vote](#vote)
参见[账本投票](#ledger-vote)。

<a id="vote-credit"></a>

## 投票信用 [vote credit](#vote-credit)
对[验证者](#validator)的奖励统计。当验证者达到一个[根](#root)时，投票信用会被奖励到其投票账户。

<a id="wallet"></a>

## 钱包 [wallet](#wallet)
管理资金的一组[密钥对](#keypair)。

<a id="warmup-period"></a>

## 预热期 [warmup period](#warmup-period)
在[质押](#stake)被委派后若干[周期](#epoch)，期间质押逐渐生效。在此期间，质押被认为是“正在激活”。
更多信息请参见：[质押预热和冷却](https://docs.solanalabs.com/consensus/stake-delegation-and-rewards#stake-warmup-cooldown-withdrawal)。