# Web3.js API 示例

## Web3 API 参考指南

`@solana/web3.js` 库是一个涵盖 [Solana JSON RPC API](https://solana.com/zh/docs/rpc)的包。

你可以在[这里](https://solana-labs.github.io/solana-web3.js/)找到 `@solana/web3.js` 库的完整文档。

## 通用

### 连接

[源文档](https://solana-labs.github.io/solana-web3.js/classes/Connection.html)

Connection连接 用于与 [Solana JSON RPC](https://solana.com/zh/docs/rpc) 交互。你可以使用 Connection 来确认交易、获取账户信息等。

你可以通过定义 JSON RPC 集群端点和所需的确认级别来创建连接。完成后，你可以使用这个连接对象与任何 Solana JSON RPC API 进行交互。

#### 示例用法

```js
const web3 = require("@solana/web3.js");
 
let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
 
let slot = await connection.getSlot();
console.log(slot);
// 93186439
 
let blockTime = await connection.getBlockTime(slot);
console.log(blockTime);
// 1630747045
 
let block = await connection.getBlock(slot);
console.log(block);
 
/*
{
    blockHeight: null,
    blockTime: 1630747045,
    blockhash: 'AsFv1aV5DGip9YJHHqVjrGg6EKk55xuyxn2HeiN9xQyn',
    parentSlot: 93186438,
    previousBlockhash: '11111111111111111111111111111111',
    rewards: [],
    transactions: []
}
*/
 
let slotLeader = await connection.getSlotLeader();
console.log(slotLeader);
//49AqLYbpJYc2DrzGUAH1fhWJy62yxBxpLEkfJwjKy2jr
```

上面的示例仅展示了 Connection 的一些方法。请参阅[源生成文档](https://solana-labs.github.io/solana-web3.js/classes/Connection.html)以获取完整列表。

### 交易

[源文档](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html)

Transaction交易用于与 Solana 区块链上的程序交互。这些交易由 TransactionInstructions 构成，包含所有可能交互的账户以及任何所需的数据或程序地址。每个 TransactionInstruction 包含键、数据和 programId。你可以在单个交易中进行多个指令，同时与多个程序交互。

#### 示例用法

```js
const web3 = require("@solana/web3.js");
const nacl = require("tweetnacl");
 
// 为付款账户空投sol
let payer = web3.Keypair.generate();
let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
 
let airdropSignature = await connection.requestAirdrop(
  payer.publicKey,
  web3.LAMPORTS_PER_SOL,
);
 
await connection.confirmTransaction({ signature: airdropSignature });
 
let toAccount = web3.Keypair.generate();
 
// 创建一个简单的交易
let transaction = new web3.Transaction();
 
// 加入一个指令操作
transaction.add(
  web3.SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: toAccount.publicKey,
    lamports: 1000,
  }),
);
 
// 发送和确认交易
// 注意：如果未设置参数，feePayer 默认为第一个签名者或付款人
await web3.sendAndConfirmTransaction(connection, transaction, [payer]);
 
// 或者，手动构建交易
let recentBlockhash = await connection.getRecentBlockhash();
let manualTransaction = new web3.Transaction({
  recentBlockhash: recentBlockhash.blockhash,
  feePayer: payer.publicKey,
});
manualTransaction.add(
  web3.SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: toAccount.publicKey,
    lamports: 1000,
  }),
);
 
let transactionBuffer = manualTransaction.serializeMessage();
let signature = nacl.sign.detached(transactionBuffer, payer.secretKey);
 
manualTransaction.addSignature(payer.publicKey, signature);
 
let isVerifiedSignature = manualTransaction.verifySignatures();
console.log(`The signatures were verified: ${isVerifiedSignature}`);
 
// 签名已验证为：true
 
let rawTransaction = manualTransaction.serialize();
 
await web3.sendAndConfirmRawTransaction(connection, rawTransaction);
```

### 密钥对 

[源文档](https://solana-labs.github.io/solana-web3.js/classes/Keypair.html)

Keypair密钥对 用于在 Solana 上创建一个具有公钥和私钥的账户。你可以生成一个新的密钥对，从种子生成，或从私钥创建。

#### 示例用法

```js
const { Keypair } = require("@solana/web3.js");
 
let account = Keypair.generate();
 
console.log(account.publicKey.toBase58());
console.log(account.secretKey);
 
// 2DVaHtcdTf7cm18Zm9VV8rKK4oSnjmTkKE6MiXe18Qsb
// Uint8Array(64) [
//   152,  43, 116, 211, 207,  41, 220,  33, 193, 168, 118,
//    24, 176,  83, 206, 132,  47, 194,   2, 203, 186, 131,
//   197, 228, 156, 170, 154,  41,  56,  76, 159, 124,  18,
//    14, 247,  32, 210,  51, 102,  41,  43,  21,  12, 170,
//   166, 210, 195, 188,  60, 220, 210,  96, 136, 158,   6,
//   205, 189, 165, 112,  32, 200, 116, 164, 234
// ]
 
let seed = Uint8Array.from([
  70, 60, 102, 100, 70, 60, 102, 100, 70, 60, 102, 100, 70, 60, 102, 100, 70,
  60, 102, 100, 70, 60, 102, 100, 70, 60, 102, 100, 70, 60, 102, 100,
]);
let accountFromSeed = Keypair.fromSeed(seed);
 
console.log(accountFromSeed.publicKey.toBase58());
console.log(accountFromSeed.secretKey);
 
// 3LDverZtSC9Duw2wyGC1C38atMG49toPNW9jtGJiw9Ar
// Uint8Array(64) [
//    70,  60, 102, 100,  70,  60, 102, 100,  70,  60, 102,
//   100,  70,  60, 102, 100,  70,  60, 102, 100,  70,  60,
//   102, 100,  70,  60, 102, 100,  70,  60, 102, 100,  34,
//   164,   6,  12,   9, 193, 196,  30, 148, 122, 175,  11,
//    28, 243, 209,  82, 240, 184,  30,  31,  56, 223, 236,
//   227,  60,  72, 215,  47, 208, 209, 162,  59
// ]
 
let accountFromSecret = Keypair.fromSecretKey(account.secretKey);
 
console.log(accountFromSecret.publicKey.toBase58());
console.log(accountFromSecret.secretKey);
 
// 2DVaHtcdTf7cm18Zm9VV8rKK4oSnjmTkKE6MiXe18Qsb
// Uint8Array(64) [
//   152,  43, 116, 211, 207,  41, 220,  33, 193, 168, 118,
//    24, 176,  83, 206, 132,  47, 194,   2, 203, 186, 131,
//   197, 228, 156, 170, 154,  41,  56,  76, 159, 124,  18,
//    14, 247,  32, 210,  51, 102,  41,  43,  21,  12, 170,
//   166, 210, 195, 188,  60, 220, 210,  96, 136, 158,   6,
//   205, 189, 165, 112,  32, 200, 116, 164, 234
// ]
```

使用 `generate` 可以生成一个用于在 Solana 上作为账户的随机密钥对。使用 `fromSeed`，你可以使用确定性构造函数生成一个密钥对。`fromSecret` 则从一个秘密的 Uint8Array 创建一个密钥对。你可以看到，生成的密钥对和 `fromSecret` 密钥对的公钥是相同的，因为生成的密钥对的私钥被用在 `fromSecret` 中。

**警告**：除非你正在创建一个高熵种子，否则不要使用 `fromSeed`。不要共享你的种子。像对待私钥一样对待你的种子。

### 公钥 

[源文档](https://solana-labs.github.io/solana-web3.js/classes/PublicKey.html)

PublicKey公钥 在 `@solana/web3.js` 中的交易、密钥对和程序中使用。列出交易中的每个账户时，以及作为 Solana 上的通用标识符时，需要 publickey。

可以使用 base58 编码字符串、缓冲区、Uint8Array、数字和数字数组来创建 公钥。

#### 示例用法

```js
const { Buffer } = require("buffer");
const web3 = require("@solana/web3.js");
const crypto = require("crypto");
 
// 用base58编码的字符串生成应该公钥
let base58publicKey = new web3.PublicKey(
  "5xot9PVkphiX2adznghwrAuxGs2zeWisNSxMW6hU6Hkj",
);
console.log(base58publicKey.toBase58());
 
// 5xot9PVkphiX2adznghwrAuxGs2zeWisNSxMW6hU6Hkj
 
// 创建一个程序地址
let highEntropyBuffer = crypto.randomBytes(31);
let programAddressFromKey = await web3.PublicKey.createProgramAddress(
  [highEntropyBuffer.slice(0, 31)],
  base58publicKey,
);
console.log(`Generated Program Address: ${programAddressFromKey.toBase58()}`);
 
// 生成的程序地址: 3thxPEEz4EDWHNxo1LpEpsAxZryPAHyvNVXJEJWgBgwJ
 
// 用公钥找到程序地址
let validProgramAddress = await web3.PublicKey.findProgramAddress(
  [Buffer.from("", "utf8")],
  programAddressFromKey,
);
console.log(`Valid Program Address: ${validProgramAddress}`);
 
// 合法的地址: C14Gs3oyeXbASzwUpqSymCKpEyccfEuSe8VRar9vJQRE,253
```

### 系统程序

[源文档](https://solana-labs.github.io/solana-web3.js/classes/SystemProgram.html)

SystemProgram系统程序 允许创建账户、分配账户数据、将账户分配给程序、处理 nonce 账户以及转移 lamports。你可以使用 SystemInstruction 类来帮助解码和读取单个指令。

#### 示例用法 

```js
const web3 = require("@solana/web3.js");
 
// 为付款账户空投sol
let payer = web3.Keypair.generate();
let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
 
let airdropSignature = await connection.requestAirdrop(
  payer.publicKey,
  web3.LAMPORTS_PER_SOL,
);
 
await connection.confirmTransaction({ signature: airdropSignature });
 
// 分配账户数据
let allocatedAccount = web3.Keypair.generate();
let allocateInstruction = web3.SystemProgram.allocate({
  accountPubkey: allocatedAccount.publicKey,
  space: 100,
});
let transaction = new web3.Transaction().add(allocateInstruction);
 
await web3.sendAndConfirmTransaction(connection, transaction, [
  payer,
  allocatedAccount,
]);
 
// 创建 Nonce 账户
let nonceAccount = web3.Keypair.generate();
let minimumAmountForNonceAccount =
  await connection.getMinimumBalanceForRentExemption(web3.NONCE_ACCOUNT_LENGTH);
let createNonceAccountTransaction = new web3.Transaction().add(
  web3.SystemProgram.createNonceAccount({
    fromPubkey: payer.publicKey,
    noncePubkey: nonceAccount.publicKey,
    authorizedPubkey: payer.publicKey,
    lamports: minimumAmountForNonceAccount,
  }),
);
 
await web3.sendAndConfirmTransaction(
  connection,
  createNonceAccountTransaction,
  [payer, nonceAccount],
);
 
// Advance nonce - 用于作为账户托管人创建交易
let advanceNonceTransaction = new web3.Transaction().add(
  web3.SystemProgram.nonceAdvance({
    noncePubkey: nonceAccount.publicKey,
    authorizedPubkey: payer.publicKey,
  }),
);
 
await web3.sendAndConfirmTransaction(connection, advanceNonceTransaction, [
  payer,
]);
 
// 在这些账户里转移lamports
let toAccount = web3.Keypair.generate();
 
let transferTransaction = new web3.Transaction().add(
  web3.SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: toAccount.publicKey,
    lamports: 1000,
  }),
);
await web3.sendAndConfirmTransaction(connection, transferTransaction, [payer]);
 
// 将新帐户分配给程序
let programId = web3.Keypair.generate();
let assignedAccount = web3.Keypair.generate();
 
let assignTransaction = new web3.Transaction().add(
  web3.SystemProgram.assign({
    accountPubkey: assignedAccount.publicKey,
    programId: programId.publicKey,
  }),
);
 
await web3.sendAndConfirmTransaction(connection, assignTransaction, [
  payer,
  assignedAccount,
]);
```

### Secp256k1程序

[源文档](https://solana-labs.github.io/solana-web3.js/classes/Secp256k1Program.html)

Secp256k1程序 用于验证 Secp256k1 签名，这些签名被比特币和以太坊使用。

#### 示例用法 

```js
const { keccak_256 } = require("js-sha3");
const web3 = require("@solana/web3.js");
const secp256k1 = require("secp256k1");
 
// secp256k1生成以太坊账户
let secp256k1PrivateKey;
do {
  secp256k1PrivateKey = web3.Keypair.generate().secretKey.slice(0, 32);
} while (!secp256k1.privateKeyVerify(secp256k1PrivateKey));
 
let secp256k1PublicKey = secp256k1
  .publicKeyCreate(secp256k1PrivateKey, false)
  .slice(1);
 
let ethAddress =
  web3.Secp256k1Program.publicKeyToEthAddress(secp256k1PublicKey);
console.log(`Ethereum Address: 0x${ethAddress.toString("hex")}`);
 
// 以太坊账户地址: 0xadbf43eec40694eacf36e34bb5337fba6a2aa8ee
 
// 资助密钥对以创建指令
let fromPublicKey = web3.Keypair.generate();
let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
 
let airdropSignature = await connection.requestAirdrop(
  fromPublicKey.publicKey,
  web3.LAMPORTS_PER_SOL,
);
 
await connection.confirmTransaction({ signature: airdropSignature });
 
// 使用以太坊密钥签署消息
let plaintext = Buffer.from("string address");
let plaintextHash = Buffer.from(keccak_256.update(plaintext).digest());
let { signature, recid: recoveryId } = secp256k1.ecdsaSign(
  plaintextHash,
  secp256k1PrivateKey,
);
 
// 创建交易验证签名
let transaction = new Transaction().add(
  web3.Secp256k1Program.createInstructionWithEthAddress({
    ethAddress: ethAddress.toString("hex"),
    plaintext,
    signature,
    recoveryId,
  }),
);
 
// 如果消息被验证是由该地址签名的，则交易将成功
await web3.sendAndConfirmTransaction(connection, transaction, [fromPublicKey]);
```

### 消息

[源文档](https://solana-labs.github.io/solana-web3.js/classes/Message.html)

Message消息 是构建交易的另一种方式。你可以使用交易的一部分账户、头、指令和 recentBlockhash 来构建消息。一个交易是一个消息加上执行交易所需的签名列表。

#### 示例用法 

```js
const { Buffer } = require("buffer");
const bs58 = require("bs58");
const web3 = require("@solana/web3.js");
 
let toPublicKey = web3.Keypair.generate().publicKey;
let fromPublicKey = web3.Keypair.generate();
 
let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
 
let airdropSignature = await connection.requestAirdrop(
  fromPublicKey.publicKey,
  web3.LAMPORTS_PER_SOL,
);
 
await connection.confirmTransaction({ signature: airdropSignature });
 
let type = web3.SYSTEM_INSTRUCTION_LAYOUTS.Transfer;
let data = Buffer.alloc(type.layout.span);
let layoutFields = Object.assign({ instruction: type.index });
type.layout.encode(layoutFields, data);
 
let recentBlockhash = await connection.getRecentBlockhash();
 
let messageParams = {
  accountKeys: [
    fromPublicKey.publicKey.toString(),
    toPublicKey.toString(),
    web3.SystemProgram.programId.toString(),
  ],
  header: {
    numReadonlySignedAccounts: 0,
    numReadonlyUnsignedAccounts: 1,
    numRequiredSignatures: 1,
  },
  instructions: [
    {
      accounts: [0, 1],
      data: bs58.encode(data),
      programIdIndex: 2,
    },
  ],
  recentBlockhash,
};
 
let message = new web3.Message(messageParams);
 
let transaction = web3.Transaction.populate(message, [
  fromPublicKey.publicKey.toString(),
]);
 
await web3.sendAndConfirmTransaction(connection, transaction, [fromPublicKey]);
```

### 结构体

[源文档](https://solana-labs.github.io/solana-web3.js/classes/Struct.html)

Struct结构体 类用于在 JavaScript 中创建与 Rust 兼容的结构体。该类仅兼容 Borsh 编码的 Rust 结构体。

#### 示例用法 

Rust中的结构体:

```rust
pub struct Fee {
    pub denominator: u64,
    pub numerator: u64,
}
```

使用web3:

```js
import BN from "bn.js";
import { Struct } from "@solana/web3.js";
 
export class Fee extends Struct {
  denominator: BN;
  numerator: BN;
}
```

### 枚举

[源文档](https://solana-labs.github.io/solana-web3.js/classes/Enum.html)

Enum枚举 类用于在 JavaScript 中表示与 Rust 兼容的枚举。枚举在日志中将只是一个字符串表示，但当与 [结构体](https://solana.com/zh/docs/clients/javascriptstruct) 一起使用时，可以正确编码/解码。该类仅兼容 Borsh 编码的 Rust 枚举。

#### 示例用法 

Rust:

```rust
pub enum AccountType {
    Uninitialized,
    StakePool,
    ValidatorList,
}
```

Web3:

```js
import { Enum } from "@solana/web3.js";
 
export class AccountType extends Enum {}
```

### Nonce账户 

[源文档](https://solana-labs.github.io/solana-web3.js/classes/NonceAccount.html)

如果交易的 `recentBlockhash` 字段太旧，通常会被拒绝。为了提供某些托管服务，使用了 NonceAccount Nonce 账户。使用 Nonce 账户在链上捕获的 `recentBlockhash` 的交易只要 Nonce 账户不被推进就不会过期。

你可以先创建一个普通账户，然后使用 `SystemProgram` 将其变为 Nonce 账户来创建一个 nonce 账户。

#### 示例用法 

```js
const web3 = require("@solana/web3.js");
 
// 创建连接
let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
 
// 生成地址
let account = web3.Keypair.generate();
let nonceAccount = web3.Keypair.generate();
 
// 存入账户
let airdropSignature = await connection.requestAirdrop(
  account.publicKey,
  web3.LAMPORTS_PER_SOL,
);
 
await connection.confirmTransaction({ signature: airdropSignature });
 
// 获得租金减免的最低金额
let minimumAmount = await connection.getMinimumBalanceForRentExemption(
  web3.NONCE_ACCOUNT_LENGTH,
);
 
// 形成CreateNonceAccount交易
let transaction = new web3.Transaction().add(
  web3.SystemProgram.createNonceAccount({
    fromPubkey: account.publicKey,
    noncePubkey: nonceAccount.publicKey,
    authorizedPubkey: account.publicKey,
    lamports: minimumAmount,
  }),
);
// 生成 Nonce 账户
await web3.sendAndConfirmTransaction(connection, transaction, [
  account,
  nonceAccount,
]);
 
let nonceAccountData = await connection.getNonce(
  nonceAccount.publicKey,
  "confirmed",
);
 
console.log(nonceAccountData);
// NonceAccount {
//   authorizedPubkey: PublicKey {
//     _bn: <BN: 919981a5497e8f85c805547439ae59f607ea625b86b1138ea6e41a68ab8ee038>
//   },
//   nonce: '93zGZbhMmReyz4YHXjt2gHsvu5tjARsyukxD4xnaWaBq',
//   feeCalculator: { lamportsPerSignature: 5000 }
// }
 
let nonceAccountInfo = await connection.getAccountInfo(
  nonceAccount.publicKey,
  "confirmed",
);
 
let nonceAccountFromInfo = web3.NonceAccount.fromAccountData(
  nonceAccountInfo.data,
);
 
console.log(nonceAccountFromInfo);
// NonceAccount {
//   authorizedPubkey: PublicKey {
//     _bn: <BN: 919981a5497e8f85c805547439ae59f607ea625b86b1138ea6e41a68ab8ee038>
//   },
//   nonce: '93zGZbhMmReyz4YHXjt2gHsvu5tjARsyukxD4xnaWaBq',
//   feeCalculator: { lamportsPerSignature: 5000 }
// }
```

上面的示例展示了如何使用 `SystemProgram.createNonceAccount` 创建一个 `NonceAccount`，以及如何从 accountInfo 中检索 `Nonce账户`。使用 nonce，你可以离线创建带有 nonce 的交易以取代 `recentBlockhash`。

### 投票账户

[源文档](https://solana-labs.github.io/solana-web3.js/classes/VoteAccount.html)

Vote Account投票账户 对象提供了解码网络上本地投票账户程序的投票账户的功能。

#### 示例用法

```js
const web3 = require("@solana/web3.js");
 
let voteAccountInfo = await connection.getProgramAccounts(web3.VOTE_PROGRAM_ID);
let voteAccountFromData = web3.VoteAccount.fromAccountData(
  voteAccountInfo[0].account.data,
);
console.log(voteAccountFromData);
/*
VoteAccount {
  nodePubkey: PublicKey {
    _bn: <BN: cf1c635246d4a2ebce7b96bf9f44cacd7feed5552be3c714d8813c46c7e5ec02>
  },
  authorizedWithdrawer: PublicKey {
    _bn: <BN: b76ae0caa56f2b9906a37f1b2d4f8c9d2a74c1420cd9eebe99920b364d5cde54>
  },
  commission: 10,
  rootSlot: 104570885,
  votes: [
    { slot: 104570886, confirmationCount: 31 },
    { slot: 104570887, confirmationCount: 30 },
    { slot: 104570888, confirmationCount: 29 },
    { slot: 104570889, confirmationCount: 28 },
    { slot: 104570890, confirmationCount: 27 },
    { slot: 104570891, confirmationCount: 26 },
    { slot: 104570892, confirmationCount: 25 },
    { slot: 104570893, confirmationCount: 24 },
    { slot: 104570894, confirmationCount: 23 },
    ...
  ],
  authorizedVoters: [ { epoch: 242, authorizedVoter: [PublicKey] } ],
  priorVoters: [
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object]
   ],
  epochCredits: [
    { epoch: 179, credits: 33723163, prevCredits: 33431259 },
    { epoch: 180, credits: 34022643, prevCredits: 33723163 },
    { epoch: 181, credits: 34331103, prevCredits: 34022643 },
    { epoch: 182, credits: 34619348, prevCredits: 34331103 },
    { epoch: 183, credits: 34880375, prevCredits: 34619348 },
    { epoch: 184, credits: 35074055, prevCredits: 34880375 },
    { epoch: 185, credits: 35254965, prevCredits: 35074055 },
    { epoch: 186, credits: 35437863, prevCredits: 35254965 },
    { epoch: 187, credits: 35672671, prevCredits: 35437863 },
    { epoch: 188, credits: 35950286, prevCredits: 35672671 },
    { epoch: 189, credits: 36228439, prevCredits: 35950286 },
    ...
  ],
  lastTimestamp: { slot: 104570916, timestamp: 1635730116 }
}
*/
```

## 质押

### 质押程序 

[源文档](https://solana-labs.github.io/solana-web3.js/classes/StakeProgram.html)

StakeProgram质押程序 便于质押 SOL 并将其委托给网络上的任何验证节点。你可以使用 质押程序 创建一个质押账户，质押一些 SOL，授权账户提取你的质押，停用你的质押并提取你的资金。StakeInstruction 类用于解码和读取调用 质押程序 的交易中的更多指令。

#### 示例用法 

```js
const web3 = require("@solana/web3.js");

// 为创建交易的密钥提供资金
let fromPublicKey = web3.Keypair.generate();
let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");

let airdropSignature = await connection.requestAirdrop(
  fromPublicKey.publicKey,
  web3.LAMPORTS_PER_SOL,
);
await connection.confirmTransaction({ signature: airdropSignature });

// 创建账户
let stakeAccount = web3.Keypair.generate();
let authorizedAccount = web3.Keypair.generate();
/* 注意：这是质押账户的最低金额 -- 添加额外的 Lamports 用于质押
    例如，我们添加 50 个 lamports 作为质押的一部分 */
let lamportsForStakeAccount =
  (await connection.getMinimumBalanceForRentExemption(
    web3.StakeProgram.space,
  )) + 50;

let createAccountTransaction = web3.StakeProgram.createAccount({
  fromPubkey: fromPublicKey.publicKey,
  authorized: new web3.Authorized(
    authorizedAccount.publicKey,
    authorizedAccount.publicKey,
  ),
  lamports: lamportsForStakeAccount,
  lockup: new web3.Lockup(0, 0, fromPublicKey.publicKey),
  stakePubkey: stakeAccount.publicKey,
});
await web3.sendAndConfirmTransaction(connection, createAccountTransaction, [
  fromPublicKey,
  stakeAccount,
]);

// 检查质押是否可用
let stakeBalance = await connection.getBalance(stakeAccount.publicKey);
console.log(`Stake balance: ${stakeBalance}`);
// 质押余额: 2282930

// 我们可以验证质押的状态。这可能需要一些时间才能激活
let stakeState = await connection.getStakeActivation(stakeAccount.publicKey);
console.log(`Stake state: ${stakeState.state}`);
// 质押状态: inactive

// 为了委托我们的质押，我们获取当前的投票账户并选择第一个
let voteAccounts = await connection.getVoteAccounts();
let voteAccount = voteAccounts.current.concat(voteAccounts.delinquent)[0];
let votePubkey = new web3.PublicKey(voteAccount.votePubkey);

// 然后我们可以将我们的质押委托给投票账户
let delegateTransaction = web3.StakeProgram.delegate({
  stakePubkey: stakeAccount.publicKey,
  authorizedPubkey: authorizedAccount.publicKey,
  votePubkey: votePubkey,
});
await web3.sendAndConfirmTransaction(connection, delegateTransaction, [
  fromPublicKey,
  authorizedAccount,
]);

// 要提取我们的资金，我们首先必须停用质押
let deactivateTransaction = web3.StakeProgram.deactivate({
  stakePubkey: stakeAccount.publicKey,
  authorizedPubkey: authorizedAccount.publicKey,
});
await web3.sendAndConfirmTransaction(connection, deactivateTransaction, [
  fromPublicKey,
  authorizedAccount,
]);

// 一旦停用，我们可以提取资金
let withdrawTransaction = web3.StakeProgram.withdraw({
  stakePubkey: stakeAccount.publicKey,
  authorizedPubkey: authorizedAccount.publicKey,
  toPubkey: fromPublicKey.publicKey,
  lamports: stakeBalance,
});

await web3.sendAndConfirmTransaction(connection, withdrawTransaction, [
  fromPublicKey,
  authorizedAccount,
]);

```

### 授权者 

[源文档](https://solana-labs.github.io/solana-web3.js/classes/Authorized.html)

Authorized授权者是一个对象，用于在 Solana 内部创建一个授权账户进行质押时使用。你可以分别指定`质押者`和`提取者`，允许不同的账户提取，而不是质押者。

你可以在 [质押程序](https://solana.com/zh/docs/clients/javascript#stakeprogram) 下找到更多 `授权者`对象的用法。

### Lockup

[源文档](https://solana-labs.github.io/solana-web3.js/classes/Lockup.html)

Lockup 与 [StakeProgram](https://solana.com/zh/docs/clients/javascriptstakeprogram) 一起使用来创建一个账户。Lockup 用于确定质押将被锁定或无法提取的时间。如果 epoch 和 Unix 时间戳都设置为 0，则该账户的锁定将被禁用。

#### 示例用法

```js
const {
  Authorized,
  Keypair,
  Lockup,
  StakeProgram,
} = require("@solana/web3.js");
 
let account = Keypair.generate();
let stakeAccount = Keypair.generate();
let authorized = new Authorized(account.publicKey, account.publicKey);
let lockup = new Lockup(0, 0, account.publicKey);
 
let createStakeAccountInstruction = StakeProgram.createAccount({
  fromPubkey: account.publicKey,
  authorized: authorized,
  lamports: 1000,
  lockup: lockup,
  stakePubkey: stakeAccount.publicKey,
});
```

上面的代码创建了一个 `createStakeAccountInstruction`，用于在创建 `质押程序` 的账户时使用。epoch 和 Unix 时间戳都设置为 0，禁用该账户的锁定。

有关更多信息，请参阅 [质押程序](https://solana.com/zh/docs/clients/javascriptstakeprogram) 。
