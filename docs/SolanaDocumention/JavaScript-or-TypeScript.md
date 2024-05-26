# Solana的JavaScript客户端库

## Solana-Web3.js是什么? 

Solana-Web3.js 库旨在提供对 Solana 的全面支持。该库是基于 [Solana JSON RPC API](https://solana.com/zh/docs/rpc)构建的。

你可以在[这里](https://solana-labs.github.io/solana-web3.js/)找到 `@solana/web3.js` 库的完整文档。

## 常见术语

| 术语 | 定义                                                         |
| ---- | ------------------------------------------------------------ |
| 程序 | 用于解释指令的无状态可执行代码。程序能够根据提供的指令执行操作。 |
| 指令 | 客户端可以包含在交易中的最小程序单元。在处理代码中，一条指令可以包含一个或多个跨程序调用。 |
| 交易 | 一个或多个由客户端使用一个或多个密钥对签署并原子执行的指令，只有两种可能的结果：成功或失败。 |

完整的术语列表，请参阅 [Solana 术语](https://solana.com/zh/docs/terminology#cross-program-invocation-cpi)。

## 入门指南

### 安装

#### yarn 

```shell
yarn add @solana/web3.js
```

#### npm 

```shell
npm install --save @solana/web3.js
```

#### Bundle 

```html
<script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js"></script>
<script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js"></script>
```

### 用法

#### Javascript

```js
const solanaWeb3 = require("@solana/web3.js");
console.log(solanaWeb3);
```

#### ES6 

```js
import * as solanaWeb3 from "@solana/web3.js";
console.log(solanaWeb3);
```

#### Browser Bundle

```js
// solanaWeb3 通过 bundle 脚本提供在全局命名空间中
console.log(solanaWeb3);
```

## 快速入门

### 连接到钱包

为了允许用户在 Solana 上使用你的 dApp 或应用，他们需要访问他们的密钥对。密钥对是一个具有匹配公钥的私钥，用于签署交易。

有两种方法可以获得密钥对：

1. 生成一个新的密钥对
2. 使用秘密密钥获取密钥对

你可以通过以下方式获得一个新的密钥对：

```js
const { Keypair } = require("@solana/web3.js");
 
let keypair = Keypair.generate();
```

这将为用户生成一个全新的密钥对，以便在你的应用中进行存储和使用。

你可以允许用户通过文本框输入秘密密钥，并使用 `Keypair.fromSecretKey(secretKey)` 获取密钥对。

```js
const { Keypair } = require("@solana/web3.js");
 
let secretKey = Uint8Array.from([
  202, 171, 192, 129, 150, 189, 204, 241, 142, 71, 205, 2, 81, 97, 2, 176, 48,
  81, 45, 1, 96, 138, 220, 132, 231, 131, 120, 77, 66, 40, 97, 172, 91, 245, 84,
  221, 157, 190, 9, 145, 176, 130, 25, 43, 72, 107, 190, 229, 75, 88, 191, 136,
  7, 167, 109, 91, 170, 164, 186, 15, 142, 36, 12, 23,
]);
 
let keypair = Keypair.fromSecretKey(secretKey);
```

许多钱包如今允许用户通过各种扩展或网络钱包带来他们的密钥对。一般建议是使用钱包而不是密钥对来签署交易。钱包在 dApp 和密钥对之间创建了一个分离层，确保 dApp 永远无法访问秘密密钥。你可以使用 [wallet-adapter](https://github.com/solana-labs/wallet-adapter)库找到连接外部钱包的方法。

### 创建和发送交易

为了与 Solana 上的程序交互，你需要创建、签署并将交易发送到网络。交易是带有签名的指令集合。指令在交易中的顺序决定了它们的执行顺序。

在 Solana-Web3.js 中，交易使用 `Transaction` 对象创建，并添加所需的消息、地址或指令。

以下是一个转账交易的示例：

```js
const {
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
 
let fromKeypair = Keypair.generate();
let toKeypair = Keypair.generate();
let transaction = new Transaction();
 
transaction.add(
  SystemProgram.transfer({
    fromPubkey: fromKeypair.publicKey,
    toPubkey: toKeypair.publicKey,
    lamports: LAMPORTS_PER_SOL,
  }),
);
```

上述代码创建了一个准备签署并广播到网络的交易。`SystemProgram.transfer` 指令被添加到交易中，包含发送的 lamports 数量以及接收和发送公钥。

剩下的就是使用密钥对签署交易并将其发送到网络。你可以使用 `sendAndConfirmTransaction` 来发送交易，如果你希望在交易完成后通知用户或执行某些操作；如果你不需要等待交易确认，可以使用 `sendTransaction`。

```js
const {
  sendAndConfirmTransaction,
  clusterApiUrl,
  Connection,
} = require("@solana/web3.js");
 
let keypair = Keypair.generate();
let connection = new Connection(clusterApiUrl("testnet"));
 
sendAndConfirmTransaction(connection, transaction, [keypair]);
```

上述代码使用 `SystemProgram` 接受一个 `TransactionInstruction`，创建一个交易并将其发送到网络。你需要使用 `Connection` 定义你连接的 Solana 网络，即主网-beta版、测试网或开发网。

### 与自定义程序交互

上一节介绍了发送基本交易。在 Solana 上，你所做的一切都是与不同的程序交互，包括上一节的转账交易。在现在，Solana 上的程序要么是用 Rust 要么是用 C 编写的。

让我们来看一下 `SystemProgram`。在 Solana 中分配空间的方法签名在 Rust 中看起来像这样：

```rust
pub fn allocate(
    pubkey: &Pubkey,
    space: u64
) -> Instruction
```

在 Solana 中，当你想与程序交互时，你必须首先知道你将与哪些账户进行交互。

你必须始终提供每个程序将在指令中交互的账户。不仅如此，你还必须提供账户是否为 `isSigner` 或 `isWritable`。

在上述 `allocate` 方法中，需要一个单一的账户 `pubkey` 以及分配的空间数量。我们知道 `allocate` 方法通过在账户内分配空间来写入该账户，因此 `pubkey` 需要是 `isWritable`。当你指定运行指令的账户时，需要 `isSigner`。在这种情况下，签名者是调用 `allocate` 在自己内部分配空间的账户。

让我们看一下如何使用 solana-web3.js 调用此指令：

```js
let keypair = web3.Keypair.generate();
let payer = web3.Keypair.generate();
let connection = new web3.Connection(web3.clusterApiUrl("testnet"));
 
let airdropSignature = await connection.requestAirdrop(
  payer.publicKey,
  web3.LAMPORTS_PER_SOL,
);
 
await connection.confirmTransaction({ signature: airdropSignature });
```

首先，我们设置账户密钥对和连接，以便我们有一个账户可以在 测试网 上进行分配。我们还创建了一个付款密钥对，并请求了一些 sol 以便我们可以支付分配交易。

```js
let allocateTransaction = new web3.Transaction({
  feePayer: payer.publicKey,
});
let keys = [{ pubkey: keypair.publicKey, isSigner: true, isWritable: true }];
let params = { space: 100 };
```

我们创建了 `allocateTransaction`、`keys` 和 `params` 对象。`feePayer` 是创建交易时的可选字段，用于指定谁支付交易费用，默认为交易中第一个签名者的 `pubkey`。`keys` 表示程序的 `allocate` 函数将与之交互的所有账户。由于 `allocate` 函数还需要空间，我们创建了 `params` 以便稍后调用 `allocate` 函数时使用。

```js
let allocateStruct = {
  index: 8,
  layout: struct([u32("instruction"), ns64("space")]),
};
```

上述内容使用 `@solana/buffer-layout` 中的 `u32` 和 `ns64` 创建，以便于创建负载。`allocate` 函数接受参数 `space`。为了与该函数交互，我们必须将数据提供为 Buffer 格式。`buffer-layout` 库有助于分配缓冲区并正确编码，以便 Solana 上的 Rust 程序解析。

让我们分解这个结构。

```rust
{
  index: 8, /* <-- */
  layout: struct([
    u32('instruction'),
    ns64('space'),
  ])
}
```

`index` 被设置为8，因为`allocate`函数在`SystemProgram`的指令枚举中位于第8位。

```rust
/* https://github.com/solana-labs/solana/blob/21bc43ed58c63c827ba4db30426965ef3e807180/sdk/program/src/system_instruction.rs#L142-L305 */
pub enum SystemInstruction {
    /** 0 **/CreateAccount {/**/},
    /** 1 **/Assign {/**/},
    /** 2 **/Transfer {/**/},
    /** 3 **/CreateAccountWithSeed {/**/},
    /** 4 **/AdvanceNonceAccount,
    /** 5 **/WithdrawNonceAccount(u64),
    /** 6 **/InitializeNonceAccount(Pubkey),
    /** 7 **/AuthorizeNonceAccount(Pubkey),
    /** 8 **/Allocate {/**/},
    /** 9 **/AllocateWithSeed {/**/},
    /** 10 **/AssignWithSeed {/**/},
    /** 11 **/TransferWithSeed {/**/},
    /** 12 **/UpgradeNonceAccount,
}
```

接下来是 `u32('instruction')`。

```rust
{
  index: 8,
  layout: struct([
    u32('instruction'), /* <-- */
    ns64('space'),
  ])
}
```

在调用指令时，`allocate` 结构中的`layout`必须始终首先包含 `u32('instruction')`。

```rust
{  index: 8,  layout: struc{
  index: 8,
  layout: struct([
    u32('instruction'),
    ns64('space'), /* <-- */
  ])
}t([    u32('instruction'),    ns64('space'), /* <-- */  ])}
```

`ns64('space')` 是 `allocate` 函数的参数。你可以在原始的 Rust `allocate` 函数中看到，`space` 是 `u64` 类型。`u64` 是一个无符号的64位整数。JavaScript 默认仅提供最高53位整数。`ns64` 来自 `@solana/buffer-layout`，有助于在 Rust 和 JavaScript 之间进行类型转换。你可以在 [solana-labs/buffer-layout](https://github.com/solana-labs/buffer-layout).中找到更多 Rust 和 JavaScript 之间的类型转换。

```rust
let data = Buffer.alloc(allocateStruct.layout.span);
let layoutFields = Object.assign({ instruction: allocateStruct.index }, params);
allocateStruct.layout.encode(layoutFields, data);
```

使用先前创建的 `bufferLayout`，我们可以分配一个数据缓冲区。然后我们分配参数 `{ space: 100 }`，以便它正确映射到布局，并将其编码到数据缓冲区。现在数据已准备好发送到程序。

```js
allocateTransaction.add(
  new web3.TransactionInstruction({
    keys,
    programId: web3.SystemProgram.programId,
    data,
  }),
);
 
await web3.sendAndConfirmTransaction(connection, allocateTransaction, [
  payer,
  keypair,
]);
```

最后，我们添加了带有所有账户密钥、付款人、数据和程序ID的交易指令，并将交易广播到网络。

完整代码如下所示：

```js
const { struct, u32, ns64 } = require("@solana/buffer-layout");
const { Buffer } = require("buffer");
const web3 = require("@solana/web3.js");
 
let keypair = web3.Keypair.generate();
let payer = web3.Keypair.generate();
 
let connection = new web3.Connection(web3.clusterApiUrl("testnet"));
 
let airdropSignature = await connection.requestAirdrop(
  payer.publicKey,
  web3.LAMPORTS_PER_SOL,
);
 
await connection.confirmTransaction({ signature: airdropSignature });
 
let allocateTransaction = new web3.Transaction({
  feePayer: payer.publicKey,
});
let keys = [{ pubkey: keypair.publicKey, isSigner: true, isWritable: true }];
let params = { space: 100 };
 
let allocateStruct = {
  index: 8,
  layout: struct([u32("instruction"), ns64("space")]),
};
 
let data = Buffer.alloc(allocateStruct.layout.span);
let layoutFields = Object.assign({ instruction: allocateStruct.index }, params);
allocateStruct.layout.encode(layoutFields, data);
 
allocateTransaction.add(
  new web3.TransactionInstruction({
    keys,
    programId: web3.SystemProgram.programId,
    data,
  }),
);
 
await web3.sendAndConfirmTransaction(connection, allocateTransaction, [
  payer,
  keypair,
]);
```