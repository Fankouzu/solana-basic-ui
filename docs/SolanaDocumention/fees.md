# Solana上的交易费用

Solana区块链在使用无需许可的网络时会产生几种不同类型的费用和成本。这些可以细分为几种特定类型：

- 交易费用 - 让验证者处理交易/指令的费用
- 优先级费用 - 提高交易处理顺序的可选费用
- 租金 - 保留在链上数据的余额

## 交易费用

在Solana区块链上的链上程序中处理逻辑（指令）所支付的小额费用被称为“交易费”。

当每个[交易](./transactions#交易)（包含一个或多个[指令](./transactions#指令)）通过网络发送时，它会被当前的验证者领导者处理。一旦被确认为全局状态交易，这个交易费就会支付给网络，以帮助支持Solana区块链的经济设计。

> 交易费用与[租金](./rent)的账户数据存储押金不同。虽然交易费用是支付给处理Solana网络上指令的费用，但租金押金是在账户中保留的，用于在区块链上存储其数据，并且可以回收。

目前，基础Solana交易费设定为每个签名5k lamports的静态值。在这个基础费用之上，可以添加任何额外的[优先级费用](#优先级费用)。

### 为什么要支付交易费？

交易费用在Solana[经济设计](#基本经济设计)中提供了许多好处，主要是：

- 为验证者网络提供补偿，用于处理交易所需的CPU/GPU计算资源
- 通过引入交易的真实成本来减少网络垃圾
- 通过协议捕获的每笔交易的最低费用金额，为网络提供长期经济稳定性

### 基本经济设计

许多区块链网络（包括比特币和以太坊）依赖基于通货膨胀的协议的奖励来在短期内保护网络。从长远来看，这些网络将越来越依赖于交易费用来维持安全性。

Solana也是如此。具体来说：

- 每笔交易费用的固定比例（最初是50%）被*烧毁*（销毁），剩余的部分归当前处理交易的领导者所有。
- 预先设置好的全球通货膨胀率提供了一个来源，用于[奖励](https://docs.solanalabs.com/implemented-proposals/staking-rewards)分配给[Solana验证者](https://docs.solanalabs.com/operations)。

### 费用收集

交易需要至少有一个账户已签署交易并且是可写的。这些*可写签名者账户*首先在账户列表中被序列化，其中第一个总是被用作“费用支付者”。

在任何交易指令被处理之前，费用支付者的账户余额将被[扣除](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/runtime/src/bank.rs#L4045-L4064)以支付交易费用。如果费用支付者的余额不足以支付交易费用，则交易处理将停止，并将交易记录为失败。

如果余额足够，费用将被扣除，交易的指令将开始执行。如果任何指令导致错误，交易处理将停止，最终在Solana分类帐中记录为失败的交易。对于这些失败的交易，费用仍然由运行时收取。

如果任何指令返回错误或违反运行时限制，除了交易费扣除之外的所有账户更改都将被回滚。这是因为验证者网络已经消耗了计算资源来收集交易并开始初步处理。

### 费用分配

交易费用被[部分烧毁](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/runtime/src/bank/fee_distribution.rs#L55-L64)剩余的费用由产生包含相应交易的区块的验证者收集。具体来说，
[50%被烧毁](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/program/src/fee_calculator.rs#L79)和[50%被分配](https://github.com/anza-xyz/agave/blob/e621336acad4f5d6e5b860eaa1b074b01c99253c/runtime/src/bank/fee_distribution.rs#L58-L62) 
给产生区块的验证者。

### 为什么要烧掉一些费用？

如上所述，每笔交易费用的固定比例被*烧毁*（销毁）。这是为了巩固SOL的经济价值，从而维持网络的安全性。与完全烧毁交易费用的方案不同，领导者仍然有动机在他们的槽中包含尽可能多的交易（有机会创建区块）。

烧毁的费用还可以通过在分叉选择中被考虑来帮助防止恶意验证者审查交易。

#### 攻击示例：

在有恶意或审查领导者的Proof of History (PoH)分叉的情况下：

- 由于审查导致的费用损失，我们预计总费用烧毁量将**少于**一个类似的诚实分叉
- 如果审查领导者要补偿这些丢失的协议费用，他们将不得不在自己的分叉上自行替换烧毁的费用
- 因此，可能会降低审查的动机

### 计算交易费用

给定交易的完整费用基于两个主要部分计算：

- 每个签名的静态设置基础费用，以及
- 在交易期间使用的计算资源，以“[计算单元](#计算单元)”计量

由于每个交易可能需要不同数量的计算资源，每个交易都会作为计算预算的一部分分配最大数量的计算单元。

## 计算预算

为了防止滥用计算资源，每个交易都被分配了一个“计算预算”。这个预算指定了有关[计算单元](#计算单元)的详细信息，并包括：

- 交易可能执行的不同类型操作所关联的计算成本（每个操作消耗的计算单元）
- 交易可以消耗的最大计算单元数量（计算单元限制）
- 交易必须遵守的操作界限（如账户数据大小限制）

当交易消耗其整个计算预算（计算预算耗尽），或超过诸如尝试超过[max call stack depth](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget.rs#L138) 
或[max loaded account](#账户数据大小限制)数据大小限制等界限时，运行时将停止处理交易并返回错误。导致交易失败，并且除了交易费被[收集](#费用收集)之外，没有状态更改。

### 账户数据大小限制

交易可以通过包含一个`SetLoadedAccountsDataSizeLimit`指令（不得超过运行时的绝对最大值）来指定它允许加载的账户数据的最大字节数。如果没有提供`SetLoadedAccountsDataSizeLimit`，则交易默认使用运行时的[`MAX_LOADED_ACCOUNTS_DATA_SIZE_BYTES`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget_processor.rs#L137-L139) 值。

可以使用`ComputeBudgetInstruction::set_loaded_accounts_data_size_limit`函数创建此指令：

```rust
let instruction = ComputeBudgetInstruction::set_loaded_accounts_data_size_limit(100_000);
```

### 计算单元

链上每笔交易执行的所有操作都需要验证者在处理时消耗不同数量的计算资源（计算成本）。这些资源消耗的最小度量单位称为“计算单元”。

当交易被处理时，计算单元会随着其每条指令在链上的执行而逐步消耗（消耗预算）。由于每条指令执行不同的逻辑（写入账户、cpi、执行系统调用等），每条指令可能会消耗不同的计算单元数量。

> 程序可以记录有关其计算使用情况的详细信息，包括其分配的计算预算中剩余多少。有关更多信息，请参见程序调试。您还可以在这篇指南中找到有关优化计算使用的更多信息。

每笔交易都有一个[计算单元限制](#计算单元限制)，要么是由运行时设置的默认限制，要么是通过显式请求更高的限制。当交易超出其计算单元限制时，其处理将被停止，导致交易失败。

以下是一些常见的会产生计算成本的操作：

- 执行指令
- 程序之间传递数据
- 执行系统调用
- 使用系统变量
- 使用 `msg!` 宏记录日志
- 记录公钥
- 创建程序地址（PDAs）
- 跨程序调用（CPI）
- 加密操作

> 对于跨程序调用，被调用的指令继承了其父级的计算预算和限制。如果被调用的指令消耗了交易的剩余预算，或超出了界限，整个调用链和顶级交易处理将被停止。

您可以在Solana运行时的[`ComputeBudget`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget.rs#L19-L123)中找到有关消耗计算单元的所有操作的更多详细信息。

### 计算单元限制

每笔交易都有一个它可以消耗的最大计算单元数，称为“计算单元限制”。每笔交易，Solana运行时有一个绝对最大的计算单元限制的[140万CU](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget_processor.rs#L19)，并设置了一个每条指令的默认请求最大限制的[20万CU](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget_processor.rs#L18)。

交易可以通过包含一个单一的`SetComputeUnitLimit`指令来请求一个更具体和优化的计算单元限制。可以是更高或更低的限制。但它永远不能请求超过每笔交易的绝对最大限制。

虽然交易的默认计算单元限制在大多数简单交易中都能正常工作，但它们通常不是最优的（对运行时和用户来说都是如此）。对于更复杂的交易，比如调用执行多个CPI的程序，您可能需要为交易请求更高的计算单元限制。

为您的交易请求最优的计算单元限制对于帮助您支付更少的费用以及帮助在网络中更好地安排您的交易至关重要。钱包、dApps和其他服务应确保它们的计算单元请求是最优的，以为用户提供最佳体验。

> 有关更多详细信息和最佳实践，请阅读这篇关于请求最优计算限制的指南。

### 计算单元价格

当交易希望支付更高的费用以提高其处理优先级时，它可以设置一个“计算单元价格”。这个价格与[计算单元限制](#计算单元限制)结合使用，它会被用于确定交易的优先级费用。

默认情况下，没有设置[计算单元价格](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget_processor.rs#L38)，因此没有额外的优先级费用。

## 优先级费用

作为[计算预算](#计算预算)的一部分，运行时支持交易支付一个**可选**的费用，称为“优先级费用”。支付这个额外的费用有助于提高交易在处理时相对于其他交易的优先级，从而实现更快的执行时间。

### 如何计算优先级费用

交易的优先级费用是通过将其**计算单元限制**乘以**计算单元价格**（以*micro-lamports*为单位）来计算的。这些值可以通过包含以下计算预算指令来每笔交易设置一次：

- [`SetComputeUnitLimit`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/src/compute_budget.rs#L47-L50) - 设置交易可以消耗的最大计算单元数
- [`SetComputeUnitPrice`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/src/compute_budget.rs#L52-L55) - 设置交易愿意支付的额外费用以提高其优先级

如果没有提供`SetComputeUnitLimit`指令，则将使用[默认计算单元限制](#计算单元限制)。

如果没有提供`SetComputeUnitPrice`指令，则交易将默认为没有额外的提高费用，并且优先级最低（即没有优先级费用）。

### 如何设置优先级费用

交易的优先级费用是通过包含一个`SetComputeUnitPrice`指令，并可选地包含一个`SetComputeUnitLimit`指令来设置的。运行时将使用这些值来计算优先级费用，该费用将用于在区块内优先考虑给定的交易。

您可以通过它们的Rust或`@solana/web3.js`函数来创建这些指令。然后，每个指令可以包含在交易中并像正常一样发送到集群。另见下面的[最佳实践](#优先级费用最佳实践)。

与Solana交易中的其他指令不同，计算预算指令**不需要**任何账户。包含多个相同类型的指令的交易将失败。

<Callout type="caution">

交易中只能包含**每种类型**计算预算指令的**一个**。重复的指令类型将导致[`TransactionError::DuplicateInstruction`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/src/transaction/error.rs#L143-L145)错误，最终导致交易失败。

</Callout>

#### Rust

rust `solana-sdk` crate在[`ComputeBudgetInstruction`](https://docs.rs/solana-sdk/latest/solana_sdk/compute_budget/enum.ComputeBudgetInstruction.html)中包含了用于设置计算单元限制和计算单元价格的指令的函数：

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

下面您可以找到有关优先级费用的最佳实践的一般信息。您还可以在这篇关于[如何请求最优计算](https://solana.com/zh/developers/guides/advanced/how-to-request-optimal-compute)的指南中找到更详细的信息，包括如何模拟交易以确定其大约的计算使用情况。

#### 请求最小计算单元

交易应该请求执行所需的最小计算单元量，以最小化费用。还要注意，当请求的计算单元数量超过实际由执行的交易消耗的计算单元数量时，费用不会调整。

#### 获取最近的优先级费用

在将交易发送到集群之前，您可以使用`getRecentPrioritizationFees`RPC方法获取节点处理的最近区块内支付的最近优先级费用列表。

然后，您可以使用这些数据来估计您的交易的适当优先级费用，以既(a)更好地确保它被集群处理，(b)最小化支付的费用。

## 租金

存入每个[Solana账户](./accounts)以保持其数据在链上可用的费用称为“租金”。此费用在每个账户的正常lamport余额中保留，并在账户关闭时可以回收。

> 租金与[交易费用](#交易费用)不同。租金是“支付”（在账户中保留）以保持数据存储在Solana区块链上，并且可以回收。而交易费用是支付给网络处理[指令](./transactions#指令)的。

所有账户都必须保持足够高的lamport余额（相对于其分配的空间），以成为[免租金状态](#免租金状态)并保持在Solana区块链上。任何试图将账户余额减少到低于其租金豁免最低余额的交易都将失败（除非余额刚好减少到零）。

当账户所有者不再希望将此数据保留在链上并在全球状态下可用时，所有者可以关闭账户并回收租金存款。

这是通过将账户的全部lamport余额提取（转移）到另一个账户（即您的钱包）来实现的。通过将账户余额精确减少到`0`，运行时将通过“[垃圾回收](#垃圾回收)”把该账户及其关联数据从网络中移除。

### 租金率

Solana的租金费率是按网络范围设置的，主要基于运行时设置的“[lamports _per_ byte _per_ year](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/program/src/rent.rs#L27-L34)”。
目前，租金费率是一个静态数值，存储在[Rent sysvar](https://docs.solanalabs.com/runtime/sysvars#rent)中。

这个租金费率用于计算账户分配的空间（即可在账户中存储的数据量）所需的确切租金金额。一个账户分配的空间越多，被扣除的租金存款就会越高。

### 免租金状态

账户必须保持一个高于存储其各自数据所需的最低限额的lamport余额。这称为“免租金”状态，该余额称为“免租金最低余额”。

> Solana上的新账户（和程序）**必须**用足够的lamports初始化以成为免租金状态。但并不总是这样。
> 以前，运行时会定期且自动地从每个低于其免租金最低余额的账户中收取费用。最终将这些账户的余额减少到零，并从全球状态中进行垃圾收集（除非手动充值）。

在创建新账户的过程中，您必须确保存入足够的lamports以超过这个最低余额。低于这个最低阈值的任何金额都将导致交易失败。

每次账户余额减少时，运行时都会检查以确保账户仍然高于免租金的最低余额。除非他们将最终余额减少到刚好`0`（关闭账户），否则任何会导致账户余额降到租金豁免阈值以下的交易都会失败。

账户要达到免租金状态所需的具体最低余额取决于区块链当前的[租金率](#租金率)以及账户想要分配的存储空间量（账户大小）。因此，建议使用[`getMinimumBalanceForRentExemption`](/docs/rpc/http/getMinimumBalanceForRentExemption.mdx) RPC端点来计算给定账户大小的具体余额。

所需的租金存款金额也可以通过[`solana rent` CLI子命令](https://docs.solanalabs.com/cli/usage#solana-rent)来估算：

```shell
solana rent 15000

# output
Rent per byte-year: 0.00000348 SOL
Rent per epoch: 0.000288276 SOL
Rent-exempt minimum: 0.10529088 SOL
```

### 垃圾回收

无法维持lamport余额大于0的账户将通过称为*垃圾回收*的过程从网络中被删除。这个过程是为了帮助减少不再使用/维护的数据的网络存储占用。

在一笔交易成功将账户余额减少到刚好`0`之后，垃圾回收将由运行时自动执行。任何试图将账户余额减少到低于其租金豁免最低余额的交易（不是刚好零）都会失败。

<Callout type="warning">

需要注意的是，垃圾收集是在交易执行完成后发生的。如果在交易中有指令将账户余额减少到零以“关闭”账户，那么在该交易中的后续指令可以“重新打开”该账户。如果“关闭”指令中没有清除账户状态，那么后续的“重新打开”指令将会有相同的账户状态。这是一个安全问题，因此了解垃圾收集生效的确切时间是有益的。

</Callout>

即使账户已通过垃圾收集从网络中删除，它可能仍然有与其地址相关的交易（无论是过去的历史还是在将来）。即使Solana区块浏览器可能显示“找不到账户”之类的消息，您可能仍然可以查看与该账户相关的交易历史。

您可以通过阅读validator的[实施提案](https://docs.solanalabs.com/implemented-proposals/persistent-account-storage#garbage-collection)来了解更多关于垃圾收集的信息。
