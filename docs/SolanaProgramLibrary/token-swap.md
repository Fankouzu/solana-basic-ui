# Token Swap Program

一个类似于 Uniswap 的 swap 平台，用于 Solana 区块链上的 Token 程序，实现了多种自动化做市商（AMM）曲线。

## 审计

仓库的 [README](https://github.com/solana-labs/solana-program-library#audits) 文件包含了程序审计的信息。

## 可用部署

| Network | Version | Program Address |
| --- | --- | --- |
| Testnet | 3.0.0 | `SwapsVeCiPHMUAtzQWZw7RjsKjgCjhwU55QGu4U1Szw` |
| Devnet | 3.0.0 | `SwapsVeCiPHMUAtzQWZw7RjsKjgCjhwU55QGu4U1Szw` |

虽然第三方在 Mainnet Beta 上部署了 token-swap，但团队没有计划自己部署。

查看[程序仓库](https://github.com/solana-labs/solana-program-library/tree/master/token-swap)以获取更多开发者信息。

## 概述

代币交换程序允许不经由中心化限价订单簿简单地交易代币对。该程序使用一种称为“曲线”的数学公式来计算所有交易的价格。曲线的目的是模仿正常市场动态：例如，当交易者购买大量某种代币时，另一种代币的价值就会上升。

池中的存款人为代币对提供流动性。这种流动性使得以即时价格执行交易成为可能。作为提供流动性的回报，存款人会收到池代币，代表他们在池中的部分所有权。在每一笔交易中，程序会保留部分输入代币作为费用。这个费用通过存储在池中，增加了池代币的价值。

这个程序在很大程度上受到了 [Uniswap](https://uniswap.org/) 和 [Balancer](https://balancer.finance/) 的启发。更多信息可以在它们的优秀文档和白皮书中找到。

## 背景

Solana 的编程模型和本文档中使用的 Solana 术语的定义可以在以下链接找到：

+   [https://docs.solana.com/apps](https://docs.solana.com/apps)
+   [https://docs.solana.com/terminology](https://docs.solana.com/terminology)

## 源代码

Token Swap Program 的源代码可在 [GitHub](https://github.com/solana-labs/solana-program-library) 上找到。

## 接口

提供了 [JavaScript 绑定](https://github.com/solana-labs/solana-program-library/blob/master/token-swap/js/src/index.ts)，支持将 Token Swap Program 加载到链上并发出指令。

示例用户界面可在[此处](https://github.com/solana-labs/oyster-swap)找到。

## 操作概述

以下内容解释了 Token Swap Program 中可用的指令。请注意，每个指令都有一个简单的代码示例，可在端到端测试中找到。

### 创建新的代币交换池
创建池展示了 Solana 上的账户、指令和授权模型，这与其他区块链相比可能有很大的不同。初始化两种代币类型之间的池，为简单起见，我们将它们称为“A”和“B”，需要以下账户：

- 空的池状态账户
- 池权限
- 代币 A 账户
- 代币 B 账户
- 池代币铸币
- 池代币费用账户
- 池代币接收账户
- 代币程序

池状态账户只需使用 `system_instruction::create_account` 创建，并确保具有正确的大小和足够的 lamports 以免租金。池权限是一个程序派生地址，可以对其他程序的指令“签名”。这对于 Token Swap Program 来说是必需的，以便铸造池代币并从其代币 A 和 B 账户中转移代币。

代币 A / B 账户、池代币铸币和池代币账户都必须创建（使用 `system_instruction::create_account`）并初始化（使用 `spl_token::instruction::initialize_mint` 或 `spl_token::instruction::initialize_account`）。代币 A 和 B 账户必须用代币充值，并将其所有者设置为交换权限，铸币也必须由交换权限拥有。

一旦所有这些账户都被创建，Token Swap 的 initialize 指令将正确设置一切，并允许立即交易。请注意，池状态账户在 initialize 上不需要是签名者，因此在执行 initialize 指令时将其与 `system_instruction::create_account` 放在同一交易中是很重要的。

### 交换操作

一旦池被创建，用户可以立即开始使用 `swap` 指令在其上进行交易。`swap` 指令会将代币从用户的源账户转移到交换的源代币账户，然后将代币从其目的代币账户转移到用户的目的代币账户。

由于 Solana 程序要求在指令中声明所有账户，用户需要从池状态账户收集所有账户信息：代币 A 和 B 账户、池代币铸币以及费用账户。

此外，用户必须允许从他们的源代币账户转移代币。最佳实践是使用 `spl_token::instruction::approve` 授权一个精确的金额给一个新的一次性密钥对，然后让这个新的密钥对签署交换交易。这限制了程序可以从用户账户中取走的代币数量。

### 存入流动性

为了实现交易，池需要从外部获得流动性。使用 `deposit_all_token_types` 或 `deposit_single_token_type_exact_amount_in` 指令，任何人都可以为其他人提供交易所需的流动性，并且作为交换，存款人将收到代表池中所有 A 和 B 代币的部分所有权的池代币。

此外，用户将需要授权一个代表从他们的 A 和 B 代币账户转移代币。这限制了程序可以从用户账户中取走的代币数量。

### 提取流动性

在任何时候，池代币持有者都可以兑换他们的池代币，以换取代币 A 和 B，按照曲线确定的当前“公平”汇率返回。在 `withdraw_all_token_types` 和 `withdraw_single_token_type_exact_amount_out` 指令中，池代币被销毁，代币 A 和 B 被转移到用户的账户中。

此外，用户将需要授权一个代表从他们的池代币账户转移代币。这限制了程序可以从用户账户中取走的代币数量。

## 曲线

Token Swap 程序完全可以自定义，适用于任何实现了 [CurveCalculator](https://github.com/solana-labs/solana-program-library/blob/master/token-swap/program/src/curve/calculator.rs) 特性的交易曲线。如果您想实现一个新的自动化做市商，可能只需复制 Token Swap 程序并实现一个新的曲线即可。以下是一些现成的曲线可供参考。

### 恒定乘积

[恒定乘积曲线](https://github.com/solana-labs/solana-program-library/blob/master/token-swap/program/src/curve/constant_product.rs) 是众所周知的 Uniswap 和 Balancer 风格的曲线，它在所有交换中保持一个不变量，表达为交换中代币 A 和代币 B 数量的乘积。

```text
A_total * B_total = invariant
```
如果交易者希望用代币 A 兑换一定数量的代币 B，代币 B 的计算方式如下：

```text
(A_total + A_in) * (B_total - B_out) = invariant
```

例如，如果交换中有100个代币A和5000个代币B，而交易者希望投入10个代币A，我们可以解出`invariant`然后计算`B_out`：

```text
A_total * B_total = 100 * 5,000 = 500,000 = invariant
```

然后

```text
(A_total + A_in) * (B_total - B_out) = invariant(100 + 10) * (5,000 - B_out) = 500,0005,000 - B_out = 500,000 / 1105,000 - (500,000 / 110) = B_outB_out = 454.5454...
```

更多信息可在 [Uniswap 白皮书](https://uniswap.org/whitepaper.pdf) 和 [Balancer 白皮书](https://balancer.finance/whitepaper/) 中找到。

### 固定价格曲线

[固定价格曲线](https://github.com/solana-labs/solana-program-library/blob/master/token-swap/program/src/curve/constant_price.rs) 是一种简单的曲线，始终保持代币 A 相对于代币 B 的价格不变。在初始化时，交换创建者设定 1 个代币 B 相对于代币 A 的成本。例如，如果价格设定为 17，则始终需要 17 个代币 A 来换取 1 个代币 B，反之亦然。

请注意，这种曲线不遵循传统市场动态，因为价格始终保持不变。

固定价格曲线最适用于新代币的固定发行，这些新代币明确不应受市场动态影响。例如，一位去中心化游戏创建者希望出售新的“SOLGAME”代币以供在其游戏中使用，因此他们创建了一个固定价格交换，每个 SOLGAME 定价为 2 USDC，并在交换创建时提供所有的 SOLGAME 代币。用户可以前往交换处购买他们想要的所有代币，而不用担心市场会使 SOLGAME 代币变得过于昂贵。

### 稳定曲线（建设中）

来自 [curve.fi](https://www.curve.fi/) 的[稳定曲线](https://github.com/solana-labs/solana-program-library/blob/master/token-swap/program/src/curve/stable.rs)拥有不同的形状，优先考虑“稳定”交易，即交易中价格保持恒定。最重要的是，价格的变动不像常数乘积曲线那样快，因此代表相同价值的两种币之间的稳定交换应尽可能接近1:1。例如，代表美元价值的稳定币（USDC、TUSD、USDT、DAI）由于交换中的代币数量不应存在大的价格差异。

该曲线反映了 curve 的动态，更多信息可以在他们的[白皮书](https://www.curve.fi/stableswap-paper.pdf)中找到。

Token Swap Program 中稳定曲线的实现仍在建设中，一个更完整的版本可以在[stable-swap-program](https://github.com/michaelhly/stable-swap-program/)中找到。

### 偏移曲线

[偏移曲线](https://github.com/solana-labs/solana-program-library/blob/master/token-swap/program/src/curve/offset.rs)可以被视为常数价格曲线和常数产品曲线的结合。它遵循常数产品曲线的动态，但允许池创建者在一侧设置一个“偏移”。该曲线的不变量是：

```text
(A_total) * (B_total + B_offset) = invariant
```

这对于初始代币发行非常有用，其中代币创造者希望在不提供资金支持交换另一侧的情况下，通过交换出售一些新代币。这与常数价格曲线相似，但关键的区别在于偏移曲线捕捉了正常的市场动态，即随着购买，提供的代币价格将会上升。

例如，一个去中心化博彩应用的创建者希望以美元稳定币USDC交换市场上新的“SOLBET”代币，并且他们认为每个代币至少值4 USDC。他们创建了一个SOLBET与USDC之间的池，一边投入1000 SOLBET，另一边则是0 USDC，但设有4000 USDC的偏移。

如果交易者尝试用40 USDC购乏SOLBET，那么将使用偏移来计算不变量：

```text
(SOLBET_total) * (USDC_total + USDC_offset) = invariant1,000 * (0 + 4,000) = 4,000,000(SOLBET_total - SOLBET_out) * (USDC_total + USDC_offset + USDC_in) = invariantSOLBET_out = 9.901
```

交易者用40 USDC收到了9.901 SOLBET，因此每个SOLBET的价格约为4.04 USDC，略高于每个SOLBET 4 USDC的最低价。

相反，如果交易者在创建后立即尝试用SOLBET购买USDC，交易会失败，因为池中实际上没有USDC。

## 测试

代币交换程序使用多种策略进行测试，包括单元测试、集成测试、属性测试和模糊测试。由于单元测试和集成测试已经广为人知，我们在这里重点介绍属性测试和模糊测试。

### 属性测试

在使用 [proptest](https://altsysrq.github.io/proptest-book/intro.html) 工具箱时，我们专门测试曲线的特定数学属性，尤其是为了避免在任何交易、存款或提款中泄露价值。本文档不涉及属性测试的详细解释，但是与代币交换程序相关的特定属性测试可以在仓库的 [curves](https://github.com/solana-labs/solana-program-library/blob/master/token-swap/program/src/curve/constant_product.rs) 和 [math](https://github.com/solana-labs/solana-program-library/blob/master/token-swap/program/src/curve/math.rs) 部分找到。

### 模糊测试

使用 [honggfuzz](https://github.com/rust-fuzz/honggfuzz-rs) ，我们定期测试代币交换程序的所有可能输入，确保程序不会意外崩溃或泄露代币。本文档不涉及模糊测试的详细解释，但是程序的具体实现可以在仓库中的 [指令模糊测试](https://github.com/solana-labs/solana-program-library/blob/master/token-swap/program/fuzz/src/instructions.rs) 部分找到。