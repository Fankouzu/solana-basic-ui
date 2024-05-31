# Solana上的交易费用

Solana区块链有几种不同类型的费用和成本开销，这些费用是使用该无准入要求的网络所产生的。它们可以分为几种特定类型：

- 交易费用 - 给验证者处理交易/指令的费用
- 优先级费用 - 一种可选费用，用于提高交易被处理的顺序
- 租金 - 为了在链上存储数据而预留的余额

## 交易费用

在Solana区块链上的链上程序中处理的逻辑（指令）所支付的小额费用被称为“交易费”。

当每个[交易](https://solana.com/zh/docs/core/transactions#transaction)（包含一个或多个[指令](https://solana.com/zh/docs/core/transactions#instruction)）通过网络发送时，它会被当前的验证者中的领导者处理。一旦被确认为全局状态交易，这个交易费就会支付给网络，以帮助支持Solana区块链的经济激励模型。

> 注意：
>
> 交易费用不同于账户数据存储的[租金](https://solana.com/zh/docs/core/fees#rent)。交易费用是为了在 Solana 网络上处理指令而支付的，而租金是为了在区块链上存储账户数据而预留的余额，且可以回收。

目前，基础Solana交易费设定为每个签名5k lamports的静态值。在这个基础费用之上，可以添加任何额外的[优先级费用](#优先级费用)。

### 为什么要支付交易费？

交易费用在Solana[经济模型设计](#基本经济设计)中体现出了许多好处，主要是：

- 为验证者网络提供处理交易所需的CPU/GPU计算资源的补偿
- 通过引入交易的真实成本来减少网络垃圾
- 通过协议设定的每笔交易的最低费用金额，为网络提供长期的经济稳定性

### 基础经济模型设计

许多区块链网络（包括比特币和以太坊）依赖基于通货膨胀的协议的奖励来在短期内保护网络。长期来看，这些网络将越来越依赖于交易费用来维持安全性。

Solana也是如此。具体说来：

- 每笔交易费用的固定比例（最初是50%）被*烧毁*（销毁），剩余的部分归当前处理交易的[领导者](https://solana.com/zh/docs/terminology#leader)所有。
- 预先设置好的全局通货膨胀率为分配给[Solana 验证者](https://docs.solanalabs.com/operations)的[奖励](https://docs.solanalabs.com/implemented-proposals/staking-rewards)提供了来源

### 费用收取

交易必须至少有一个账户已签署交易并是可写入的。这些*可写入的签名者帐户*首先在帐户列表中序列化，其中第一个始终用作“*费用支付者*”。

在任何交易指令被处理之前，费用支付者的账户[余额将被扣除](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/runtime/src/bank.rs#L4045-L4064)以支付交易费用。如果费用支付者的余额不足以支付交易费用，交易处理将终止并导致交易失败。

如果余额足够，费用将被扣除，然后交易的指令将开始执行。如果任何指令导致错误，交易处理将停止并最终在Solana账本中记录为失败的交易。对于这些失败的交易，运行时仍会收取费用。

如果任何指令返回错误或违反运行时限制，则除交易费用扣除外的所有帐户更改都将回滚。这是因为验证者网络已经花费了计算资源来收集交易并执行初始处理。

### 费用分配

交易费用被[部分销毁](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/runtime/src/bank/fee_distribution.rs#L55-L64)，剩余费用由产生相应交易包含在其中的区块验证者收取。具体来说， [50%被销毁](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/program/src/fee_calculator.rs#L79)，[50%分配给](https://github.com/anza-xyz/agave/blob/e621336acad4f5d6e5b860eaa1b074b01c99253c/runtime/src/bank/fee_distribution.rs#L58-L62)产生区块的验证者。

### 为什么要烧毁一些费用？

如上所述，每笔交易费用的固定比例被烧毁（销毁）。这是为了巩固SOL的经济价值，从而维持网络的安全性。与交易费用完全被烧毁的计划不同，领导者仍然被激励在他们的槽中包含尽可能多的交易（创建区块的机会）。

烧毁的费用还有助于防止恶意验证者通过在[分叉](https://solana.com/zh/docs/terminology#fork)选择中被选中来审查交易。

#### 攻击示例：

在有恶意或审查领导者的[历史证明(PoH)](https://solana.com/zh/docs/terminology#proof-of-history-poh)分叉的情况下：

- 由于审查导致的费用损失，我们预计销毁的总费用将*低于*比较下的诚实分叉
- 如果审查领导者要补偿这些损失的协议费用，他们将不得不自己更换分叉上烧毁的费用
- 从而可能首先减少审查的动机

### 计算交易费用

给定交易的全部费用是根据两个主要部分计算的：

- 每个签名的静态设置基础费用，以及
- 在交易期间使用的计算资源，以“[*计算单元*](#计算单元)”计量

由于每个交易可能需要不同数量的计算资源，每个交易都会作为计算预算的一部分分配最大数量的计算单元。

## 计算预算

为了防止计算资源的滥用，每个交易都被分配了一个“计算预算”。这个预算指定了有关[计算单元](#计算单元)的详细信息，包括：

- 交易可能执行的不同类型操作所关联的计算成本（每个操作消耗的计算单元）
- 交易可以消耗的最大计算单元数量（计算单元限制）
- 交易必须遵守的操作边界（如账户数据大小限制）

当交易消耗其整个计算预算（计算预算耗尽），或超过例如尝试超过 [最大调用堆栈深度](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget.rs#L138)
或[最大加载账户](#账户数据大小限制)数据大小限制等边界时，运行时将终止处理交易并返回错误。导致交易失败且状态不更改（除了[收取](https://solana.com/zh/docs/core/fees#fee-collection)交易费用）。

### 账户数据大小限制

交易可以通过包含一个`SetLoadedAccountsDataSizeLimit`指令（不得超过运行时的绝对最大值）来指定它允许加载的账户数据的最大字节数。如果没有提供`SetLoadedAccountsDataSizeLimit`，则交易默认使用运行时的[`MAX_LOADED_ACCOUNTS_DATA_SIZE_BYTES`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget_processor.rs#L137-L139) 值。

可以使用`ComputeBudgetInstruction::set_loaded_accounts_data_size_limit`函数创建此指令：

```rust
let instruction = ComputeBudgetInstruction::set_loaded_accounts_data_size_limit(100_000);
```

### 计算单元

链上每笔交易执行的所有操作都需要验证者在处理时消耗不同数量的计算资源（计算成本）。这些资源消耗的最小度量单位称为“计算单元”。

在处理交易时，计算单元会被链上执行的每条指令（消耗预算）逐步消耗。由于每条指令执行不同的逻辑（写入帐户、CPI、执行系统调用等），因此每条指令可能消耗[不同数量](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget.rs#L133-L178)的计算单元。

> 注意：
>
> 程序可以记录有关其计算使用情况的详细信息，包括其分配的计算预算中剩余的金额。有关详细信息，请参阅[程序调试](https://solana.com/zh/docs/programs/debugging#monitoring-compute-budget-consumption)。您还可以在本指南中找到有关[优化计算使用情况](https://solana.com/zh/developers/guides/advanced/how-to-optimize-compute)的详细信息。

每笔交易都有一个[计算单元限制](#计算单元限制)，要么是由运行时设置的默认限制，要么是通过显式请求更高的限制。当交易超出其计算单元限制时处理将被停止，从而导致交易失败。

以下是一些产生计算成本的常见操作：

- 执行指令
- 在程序之间传递数据
- 执行系统调用
- 使用系统变量
- 使用 `msg!` 宏记录日志
- 记录公钥
- 创建程序地址（PDAs）
- 跨程序调用（CPI）
- 加密操作

> 注意：
>
> 对于[跨程序调用](https://solana.com/zh/docs/core/cpi)，调用的指令将继承其父级的计算预算和限制。如果调用的指令消耗了事务的剩余预算，或者超出了边界，则整个调用链和顶级交易处理将终止。

您可以在Solana运行时的[`ComputeBudget`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget.rs#L19-L123)中找到有关消耗计算单元的所有操作的更多详细信息。

### 计算单元限制

每笔交易都有一个可以使用的最大计算单元数 （CU），称为“*计算单元限制*”。每个交易，Solana 运行时的绝对最大计算单元限制为[140万CU](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget_processor.rs#L19)，并将默认请求的最大限制设置为每条指令[每条指令20万CU](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget_processor.rs#L18)。

交易可以通过包含单个 `SetComputeUnitLimit` 指令来请求更具体和最佳的计算单元限制。可以是上限或下限。但它可能永远不会要求高于每笔交易的绝对最大限制。

虽然交易的默认计算单位限制在大多数情况下适用于简单交易，但它们通常不是最佳的（对于运行时和用户）。对于更复杂的交易，例如调用执行多个 CPI 的程序，您可能需要为交易请求更高的计算单位限制。

请求交易的最佳计算单元限制，对于帮助您降低交易费用并帮助在网络上更好地安排交易至关重要。钱包、dApp 和其他服务应确保其计算单元请求是最佳的，以便为其用户提供最佳体验。

> 注意：
>
> 有关更多详细信息和最佳实践，请阅读这篇关于 [请求最佳计算限制](https://solana.com/zh/developers/guides/advanced/how-to-request-optimal-compute)的指南。

### 计算单元价格

当交易希望支付更高的费用以提高其处理优先级时，它可以设置一个“计算单元价格”。此价格与[计算单元限制](#计算单元限制)结合使用，将用于确定交易的优先级费用。

默认情况下，没有设置[计算单元价格](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget_processor.rs#L38)，因此没有额外的优先级费用。

## 优先级费用

作为[计算预算](#计算预算)的一部分，运行时支持交易支付一个**可选**的费用，称为“优先级费用”。支付这笔额外费用有助于提高交易在处理时优先于其他交易的方式，从而缩短执行时间。

### 如何计算优先级费用

交易的优先级费用是通过将其**计算单元限制**乘以**计算单元价格**（以*micro-lamports*为单位）来计算的。这些值可以通过包含以下计算预算指令来每笔交易设置一次：

- [`SetComputeUnitLimit`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/src/compute_budget.rs#L47-L50) - 设置交易可以消耗的最大计算单元数
- [`SetComputeUnitPrice`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/src/compute_budget.rs#L52-L55) - 设置交易愿意支付的额外费用以提高其优先级

如果没有提供`SetComputeUnitLimit`指令，则将使用[默认计算单元限制](#计算单元限制)。

如果没有提供`SetComputeUnitPrice`指令，则交易将默认为没有额外的提高费用，并且优先级最低（即没有优先级费用）。

### 如何设置优先级费用

交易的优先级费用是通过包含一个`SetComputeUnitPrice`指令，并可选地包含一个`SetComputeUnitLimit`指令来设置的。运行时将使用这些值来计算优先级费用，该费用将用于确定区块内给定交易的优先级。

您可以通过它们的Rust或`@solana/web3.js`函数来创建这些指令。然后，每条指令都可以包含在交易中，并像往常一样发送到集群。另见下面的[最佳实践](#优先级费用最佳实践)。

与Solana交易中的其他指令不同，计算预算指令**不需要**任何账户。包含任意其他类型的指令的交易将失败。

> 小心:
> 事务只能包含每种类型的计算预算指令中的一种。重复的指令类型将导致 `TransactionError::DuplicateInstruction` 错误，并最终导致交易失败。

#### Rust

rust`solana-sdk`包，包含用于 `ComputeBudgetInstruction` 制作用于设置计算单位限制和计算单位价格的指令的函数

```rust
let instruction = ComputeBudgetInstruction::set_compute_unit_limit(300_000);
```

```rust
let instruction = ComputeBudgetInstruction::set_compute_unit_price(1);
```

#### Javascript

`@solana/web3.js`库在[`ComputeBudgetProgram`](https://solana-labs.github.io/solana-web3.js/classes/ComputeBudgetProgram.html)类中包含了用于设置计算单元限制和计算单元价格的指令的函数：

```js
const instruction = ComputeBudgetProgram.setComputeUnitLimit({
  units: 300_000,
});
```

```js
const instruction = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 1,
});
```

### 优先级费用最佳实践

您可以在下面找到有关优先费用最佳实践的一般信息。您还可以在本指南中找到有关[如何请求交易计算](https://solana.com/zh/developers/guides/advanced/how-to-request-optimal-compute)的更多详细信息，包括如何模拟交易以确定其近似计算使用情况。

#### 请求最小计算单元

交易应请求执行所需的最小计算单元数，以最大程度地降低费用。另请注意，当请求的计算单位数超过已执行事务实际消耗的计算单位数时，不会调整费用。

#### 获取最近的优先级费用

在将交易发送到集群之前，您可以使用`getRecentPrioritizationFees`RPC方法获取节点处理的最近区块内支付的最近优先级费用列表。

然后，您可以使用此数据来估算交易的适当优先级费用，以便（a）更好地确保集群处理交易，以及（b）最大限度地减少支付的费用。

## 租金

存入每个[Solana 账户](https://solana.com/zh/docs/core/accounts)以使其相关数据在链上可用的费用称为“租金”。这笔费用在每个账户的正常 lamport 余额中扣留，并在账户关闭时收回。

> 注意：
>
> 租金与[交易费用](#交易费用)不同。租金是“支付”（在账户中预扣）以保持数据存储在Solana区块链上，并且可以回收。而交易费用是支付给网络处理[指令](./transactions#指令)的。

所有账户都必须保持足够高的lamport余额（相对于其分配的空间），以成为[免租金状态](#免租金状态)并保持在Solana区块链上。任何试图将账户余额减少到低于其租金豁免最低余额的交易都将失败（除非余额刚好减少到零）。

当账户所有者不再希望将此数据保留在链上并在全球状态下可用时，所有者可以关闭账户并回收租金存款。

这是通过将账户的全部lamport余额提取（转移）到另一个账户（即您的钱包）来实现的。通过将账户余额精确减少到`0`，运行时将通过“[垃圾回收](#垃圾回收)”把该账户及其关联数据从网络中移除。

### 租金率

Solana 租金是在整个网络的基础上设置的，主要基于运行时设置的“[每年每字节的lamports](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/program/src/rent.rs#L27-L34)”。
目前，租金费率是一个静态数值，存储在[租金系统变量](https://docs.solanalabs.com/runtime/sysvars#rent)中。

此租金率用于计算在帐户内为分配给帐户的空间（即可以存储在帐户中的数据量）预扣的确切租金金额。账户分配的空间越多，预扣的租金押金就越高。

### 免租金

账户必须保持大于在链上存储其各自数据所需的最低限度的 lamport 余额。这被称为“*免租金*”，该余额称为“*免租金最低余额*”。

> 注意：
>
> Solana 上的新帐户（和程序）**需要**初始化足够的 lamports 才能免租。但情况并非总是如此。以前，运行时会定期自动从每个帐户收取低于其最低余额的费用，以免除租金。最终将这些帐户的余额减少到零，并从全局状态中回收垃圾（除非手动充值）。

在创建新帐户的过程中，您必须确保存入足够的 lamports 以高于此最低余额。任何低于此最低阈值的行为都将导致交易失败。

每次帐户的余额减少时，运行时都会执行检查，以查看帐户是否仍高于此最低余额以免除租金。除非他们将最终余额减少到精确 `0` （关闭账户），否则会导致账户余额低于免租金门槛的交易将失败。

免租金账户的具体最低余额取决于区块链当前的[租金率](https://solana.com/zh/docs/core/fees#rent-rate)和账户想要分配的所需存储空间量（账户大小）。因此，建议使用 `getMinimumBalanceForRentExemption` RPC端点来计算给定帐户大小的特定余额。

所需的租金存款金额也可以通过[`solana rent` CLI子命令](https://docs.solanalabs.com/cli/usage#solana-rent)来估算：

```shell
solana rent 15000
 
# output
Rent per byte-year: 0.00000348 SOL
Rent per epoch: 0.000288276 SOL
Rent-exempt minimum: 0.10529088 SOL
```

### 垃圾回收

未保持 lamport 余额大于零的帐户将在称为垃圾回收的过程中从网络中删除。此过程有助于减少不再使用/维护的数据的网络范围存储。

在交易成功将帐户余额减少到精确 `0` 后，运行时会自动进行垃圾回收。任何试图将账户余额降低到其租金豁免最低余额（不完全为零）的交易都将失败。

> 警告：
>
> 请务必注意，垃圾回收发生在事务执行完成后。如果有通过将账户余额减少到零来“关闭”账户的指令，则可以通过稍后的指令在同一笔交易中“重新打开”该账户。如果在“关闭”指令中未清除账户状态，则后面的“重新打开”指令将具有相同的账户状态。这是一个安全问题，因此最好知道垃圾回收生效的确切时间。

即使帐户已从网络中删除（通过垃圾回收），它可能仍具有与其地址关联的交易（过去的历史记录或将来）。即使 Solana 区块浏览器可能会显示“未找到账户”类型的消息，您仍然可以查看与该账户关联的交易历史记录。

您可以阅读验证者[实施的垃圾回收提案 ](https://docs.solanalabs.com/implemented-proposals/persistent-account-storage#garbage-collection)以了解更多信息。
