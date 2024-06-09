# 单一验证节点质押池

为所有 Solana 验证者提供无需信任的流动性质押。

| 信息         | 账户地址                                          |
|------------|-----------------------------------------------|
| 单一验证者质押池   | `SVSPxpvHdN29nkVg9rPapPNDddN5DipNLRUFhyjFThE` |

## 概述

单一验证者质押池程序是一个 SPL 程序，提供零费用、无对手方风险和100%资本效率的流动性质押。

该程序为每个投票账户定义了一个标准质押池，可以无权限地初始化，并在质押委托给其指定验证者时铸造相应的代币作为质押凭证。

此程序是现有多验证者质押池程序的精简版本，代码量减少了约80%，以降低执行风险。

## 源代码

单一验证者质押池程序的源代码可在
[GitHub](https://github.com/solana-labs/solana-program-library/tree/master/single-pool/program) 上获取。

## 安全审计

单一验证者质押池程序经过三次审计，以确保资金的完全安全：

* Zellic (2024-01-02)
    - 审查提交哈希：[`ef44df9`](https://github.com/solana-labs/solana-program-library/commit/ef44df985e76a697ee9a8aabb3a223610e4cf1dc)
    - 报告：https://github.com/solana-labs/security-audits/blob/master/spl/ZellicSinglePoolAudit-2024-01-02.pdf
* Neodyme (2023-08-08)
    - 审查提交哈希：[`735d729`](https://github.com/solana-labs/solana-program-library/commit/735d7292e35d35101750a4452d2647bdbf848e8b)
    - 报告：https://github.com/solana-labs/security-audits/blob/master/spl/NeodymeSinglePoolAudit-2023-08-08.pdf
* Zellic (2023-06-21)
    - 审查提交哈希：[`9dbdc3b`](https://github.com/solana-labs/solana-program-library/commit/9dbdc3bdae31dda1dcb35346aab2d879deecf194)
    - 报告：https://github.com/solana-labs/security-audits/blob/master/spl/ZellicSinglePoolAudit-2023-06-21.pdf

## 接口

单一验证者质押池程序是用 Rust 编写的，可以在 [crates.io](https://crates.io/crates/spl-single-pool) 和 [docs.rs](https://docs.rs/spl-single-pool)上获取。

同时也提供了适用于 JavaScript 的接口： [Web3.js Classic](https://www.npmjs.com/package/@solana/spl-single-pool-classic) 和 [Web3.js Next](https://www.npmjs.com/package/@solana/spl-single-pool)。

## 参考指南

### 环境设置

- 使用 CLI

与单一质押池程序交互的最简单方式是使用 `spl-single-pool` 命令行程序。在安装 [Rust](https://rustup.rs/)后，运行以下命令：

```sh
cargo install spl-single-pool-cli
```

运行 `spl-single-pool --help` 以获取可用命令的完整描述。

### 配置

`spl-single-pool` 的配置与 `solana` 命令行工具共享。

#### 当前配置

```sh
solana config get
Config File: ${HOME}/.config/solana/cli/config.yml
RPC URL: https://api.mainnet-beta.solana.com
WebSocket URL: wss://api.mainnet-beta.solana.com/ (computed)
Keypair Path: ${HOME}/.config/solana/id.json
Commitment: confirmed
```

#### 集群 RPC URL

查看 [Solana clusters](https://docs.solana.com/clusters) 获取关于 solana 特定集群 RPC URL 的详细信息。

设置节点配置文件，连接 solana devnet 集群

```sh
solana config set --url https://api.devnet.solana.com
```

#### 默认密钥对

如果您还没有密钥对的话，查看[Keypair conventions](https://docs.solana.com/cli/conventions#keypair-conventions) 以获取有关如何设置密钥对的信息。

设置指定的密钥对文件为节点默认密钥对

```sh
solana config set --keypair ${HOME}/new-keypair.json
```

设置硬件钱包为节点默认密钥对 ([URL spec](https://docs.solana.com/wallet-guide/hardware-wallets#specify-a-keypair-url))

```sh
solana config set --keypair usb://ledger/
```

`spl-single-pool` 通常使用默认密钥对作为费用支付者，从钱包中提取资金（例如，用于资助新的质押账户），并在需要时作为账户的签名权限。当需要代币账户时，它默认使用默认密钥对的关联账户。所有这些角色都可以通过命令行标志进行覆盖。

- 使用 WEB3.JS CLASSIC

::: code-group

```sh [pnpm]
pnpm install @solana/spl-single-pool-classic
```

```sh [yarn]
yarn add @solana/spl-single-pool-classic
```

```sh [npm]
npm install @solana/spl-single-pool-classic
```

:::

### 配置

您可以使用 `@solana/web3.js` 中的 `Connection` 连接到不同的集群

```typescript
import { Connection, clusterApiUrl } from '@solana/web3.js';
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
```

### 密钥对

您可以使用 `@solana/web3.js` 中的 [`Keypair`](https://solana-labs.github.io/solana-web3.js/classes/Keypair.html) 获取您的密钥对，或者让用户的钱包处理密钥对，并使用 [`wallet-adapter`](https://github.com/solana-labs/wallet-adapter) 中的 `sendTransaction` 方法进行交易。

- 使用 WEB3.JS NEXT

::: code-group

```sh [pnpm]
pnpm install @solana/spl-single-pool
```

```sh [yarn]
yarn add @solana/spl-single-pool
```

```sh [npm]
npm install @solana/spl-single-pool
```

:::

### 配置

您可以使用 `@solana/web3.js` 中的 `createDefaultRpcTransport` 和 `createSolanaRpc` 连接到不同的集群。

```typescript
import { createDefaultRpcTransport, createSolanaRpc } from '@solana/web3.js';
const transport = createDefaultRpcTransport({ url: 'https://api.devnet.solana.com' });
const rpc = createSolanaRpc({ transport });
```

### 密钥对

Web3.js Next 使用 [`crypto.subtle`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle) 进行密钥管理。在本地开发中，可以使用 `crypto.subtle.importKey` 创建一个 `{ privateKey, publicKey }` 对象，以生成签名（私钥）和验证（公钥）密钥。 一般来说，最好让用户的钱包来管理密钥，因为系统的设计是为了确保密钥不会从安全存储中泄露。

### 设置单一验证者质押池

#### 创建质押池

任何人都可以为给定的投票账户无许可地创建单一验证者质押池。这使得您可以在持有代币化形式的价值的同时，获得与直接质押相同的全部质押收益。它还允许您在市场上买卖小于最小委托量的质押。

假设存在投票账户 `Ammgaa2iZfA745BmZMhkcS27uh87fEVDC6Gm2RXz5hrC`，我们在地址 `DkE6XFGbqSyYzRugLVSmmB42F9BQZ7mZU837e2Cti7kb` 创建一个质押池：

::: code-group

```sh [CLI]
spl-single-pool manage initialize Ammgaa2iZfA745BmZMhkcS27uh87fEVDC6Gm2RXz5hrC
```

```typescript [WEB3.JS CLASSIC]
const voteAccountAddress = new PublicKey('Ammgaa2iZfA745BmZMhkcS27uh87fEVDC6Gm2RXz5hrC');
const transaction = await SinglePoolProgram.initialize(
  connection,
  voteAccountAddress,
  feePayerAddress,
);

// 用费用支付者进行签名
```

```typescript [WEB3.JS NEXT]
const voteAccountAddress = 'Ammgaa2iZfA745BmZMhkcS27uh87fEVDC6Gm2RXz5hrC' as VoteAccountAddress;
const transaction = await SinglePoolProgram.initialize(
  rpc,
  voteAccountAddress,
  feePayerAddress,
);

// 用费用支付者进行签名
```

:::

#### 管理代币元数据

默认情况下，当创建一个质押池时，它也会为与该池关联的铸币（mint）创建 Metaplex 代币元数据。如果由于某种原因，质押池创建者选择不创建这些元数据，任何人都可以无许可地创建默认元数据：

::: code-group

```sh [CLI]
spl-single-pool manage create-token-metadata --pool DkE6XFGbqSyYzRugLVSmmB42F9BQZ7mZU837e2Cti7kb
```

```typescript [WEB3.JS CLASSIC]
const transaction = await SinglePoolProgram.createTokenMetadata(poolAddress, feePayerAddress);

// 用费用支付者进行签名
```

```typescript [WEB3.JS NEXT]
const transaction = await SinglePoolProgram.createTokenMetadata(poolAddress, feePayerAddress);

// 用费用支付者进行签名
```

:::

默认的代币元数据仅提供最基本的信息，主要突出了验证者投票账户的地址。然而，投票账户的所有者可以将元数据更改为他们希望的任何内容。通过使用投票账户的授权提取者签名，他们可以证明自己的身份；这是质押池中唯一需要权限的操作指令。

::: code-group

```sh [CLI]
spl-single-pool manage update-token-metadata DkE6XFGbqSyYzRugLVSmmB42F9BQZ7mZU837e2Cti7kb "My Cool Pool" cPool "https://www.cool.pool/token.jpg"
```

```typescript [WEB3.JS CLASSIC]
const transaction = await SinglePoolProgram.updateTokenMetadata(
  voteAccountAddress,
  authorizedWithdrawerAddress,
  'My Cool Pool',
  'cPool',
  'https://www.cool.pool/token.jpg',
);

// 用费用支付者和授权提取者进行签名。
```

```typescript [WEB3.JS NEXT]
const transaction = await SinglePoolProgram.updateTokenMetadata(
  voteAccountAddress,
  authorizedWithdrawerAddress,
  'My Cool Pool',
  'cPool',
  'https://www.cool.pool/token.jpg',
);

// 用费用支付者和授权提取者进行签名。
```

:::

URL 参数是可选的。

### 使用单一验证者质押池

#### 质押

当创建一个质押池时，其质押账户会被委托给相应的投票账户。在该周期内，处于“激活”状态的质押可以存入池中。在此周期之后，质押必须处于“活跃”状态才能存入池中。也就是说，它必须被委托给投票账户，并且只能在下一个周期开始后进行存入操作。

假设质押账户 `9cc4cmLcZA89fYmcVPPTLmHPQ5gab3R6jMqj124abkSi` 处于活跃状态：

::: code-group

```sh [CLI]
# 当提供了明确的质押账户地址时，CLI 可以自动确定质押池地址。

spl-single-pool deposit 9cc4cmLcZA89fYmcVPPTLmHPQ5gab3R6jMqj124abkSi
```

```typescript [WEB3.JS CLASSIC]
const transaction = await SinglePoolProgram.deposit({
  connection,
  pool: poolAddress,
  userWallet,
  userStakeAccount,
});

// 如果签名者不同，则使用费用支付者和质押账户提取权限进行签名。
// userWallet 是一个便捷参数，用于将一个账户用作支付者、权限持有者和 lamport 接收者。
```

```typescript [WEB3.JS NEXT]
const transaction = await SinglePoolProgram.deposit({
  rpc,
  pool: poolAddress,
  userWallet,
  userStakeAccount,
});

// 如果签名者不同，则使用费用支付者和质押账户提取权限进行签名。
// userWallet 是一个便捷参数，用于将一个账户用作支付者、权限持有者和 lamport 接收者。
```

:::

所有版本的 `deposit` 命令/交易在池代币的关联代币账户不存在且未提供辅助代币账户地址的情况下，都会自动创建该关联代币账户。

该程序还为每个质押池提供一个便捷地址，称为默认存入地址。

这允许用户在程序派生地址创建并委托质押，然后在下个周期存入质押，而无需生成或跟踪任何新的密钥对。

用户在决定存入之前，始终保留对质押账户的完全控制权。

- 使用 CLI

```sh
spl-single-pool create-default-stake --pool DkE6XFGbqSyYzRugLVSmmB42F9BQZ7mZU837e2Cti7kb 1000000000
```

一旦质押变为活跃状态，通常是在下一个周期：

```sh
spl-single-pool deposit --pool DkE6XFGbqSyYzRugLVSmmB42F9BQZ7mZU837e2Cti7kb --default-stake-account
```

- 使用 WEB3.JS CLASSIC

```typescript
const transaction = await SinglePoolProgram.createAndDelegateUserStake(
  connection,
  voteAccountAddress,
  userWallet,
  1000000000,
);

// 使用用户钱包签名
```

一旦质押变为活跃状态，通常是在下一个周期：

```typescript
const transaction = await SinglePoolProgram.deposit({
  connection,
  pool: poolAddress,
  userWallet,
  depositFromDefaultAccount: true,
});

// 使用用户钱包签名
```

- 使用 WEB3.JS NEXT

```typescript
const transaction = await SinglePoolProgram.createAndDelegateUserStake(
  rpc,
  voteAccountAddress,
  userWallet,
  1000000000n,
);

// 使用用户钱包签名，该钱包用作费用支付者，并作为种子账户的基础地址。
```

一旦质押变为活跃状态，通常是在下一个周期：

```typescript
const transaction = await SinglePoolProgram.deposit({
  rpc,
  pool: poolAddress,
  userWallet,
  depositFromDefaultAccount: true,
});

// 使用用户钱包签名，该钱包用作费用支付者，并作为种子账户的基础地址。
```

#### 提取

提取操作很简单，只需销毁代币即可收到其支持的质押金额。质押可以提取到已委托给相应投票账户的活跃质押账户，或提取到一个新质押账户，所有权限都会分配给用户钱包。

在内部，所有版本的 `withdraw` 命令/交易都使用代币委托来完成销毁操作。这意味着用户无需为单一质押池程序提供钱包签名。

::: code-group

```sh [CLI]
# 可以传递 `--deactivate` 标志，以便方便地启动解除委托的过程。

spl-single-pool withdraw --pool DkE6XFGbqSyYzRugLVSmmB42F9BQZ7mZU837e2Cti7kb 1000000000
```

```typescript [WEB3.JS CLASSIC]
const withdrawAccount = new Keypair();
const transaction = await SinglePoolProgram.withdraw({
  connection,
  pool: poolAddress,
  userWallet,
  userStakeAccount: withdrawAccount.publicKey,
  tokenAmount: 1000000000,
  createStakeAccount: true,
});

// 用费用支付者签名，如果正在创建新账户，还需要使用质押账户的密钥对进行签名。
```

```typescript [WEB3.JS NEXT]
const { publicKey, privateKey } = await generateKeyPair();
const transaction = await SinglePoolProgram.withdraw({
  rpc,
  pool: poolAddress,
  userWallet,
  userStakeAccount: publicKey,
  tokenAmount: 1000000000n,
  createStakeAccount: true,
});

// 用费用支付者签名，如果正在创建新账户，还需要使用质押账户的密钥对进行签名。
```

:::