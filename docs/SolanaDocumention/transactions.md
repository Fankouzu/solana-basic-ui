# 交易与指令

在Solana上，我们发送[交易](./transactions#交易)与网络进行交互。交易包括一个或多个[指令](./transactions#指令)，每个指令代表一个要处理的具体操作。指令的执行逻辑存储在部署到Solana网络上的程序中，每个程序存储自己的一组指令。

以下是有关如何执行交易的关键细节：

- 执行顺序：如果交易包括多个指令，则按照它们添加到交易中的顺序处理这些指令。
- 原子性：交易是原子性的，这意味着它要么完全完成，所有指令都成功处理，要么完全失败。如果交易中的任何指令失败，则不会执行任何指令。

为了简化，可以认为交易是处理一个或多个指令的请求。

![简化的交易](https://solana-developer-content.vercel.app/assets/docs/core/transactions/transaction-simple.svg)

<center>简化的交易</center>

你可以将交易想象成一个信封，每个指令都是你填写并放入信封中的文件。然后我们邮寄信封以处理文件，就像在网络中发送交易以处理我们的指令一样。

## 关键点

- Solana交易由与网络上的各种程序交互的指令组成，每个指令代表一个特定的操作。

- 每个指令指定执行指令的程序、指令所需的账户和执行指令所需的数据。

- 交易中的指令按照它们列出的顺序进行处理。

- 交易是原子性的，意味着要么所有指令都成功处理，要么整个交易失败。

- 交易的最大大小为1232字节。

## 基本示例

下面是一个图表，表示一个交易，其中包含一个将SOL从发送者转移到接收者的单一指令。

Solana上的个别“钱包”是由[System Program](./accounts#系统程序)拥有的账户。作为[Solana账户模型](./accounts.md)的一部分，只有拥有账户的程序才被允许修改账户上的数据。

因此，从“钱包”账户转移SOL需要发送交易以调用System Program上的转移指令。

![SOL转移](https://solana-developer-content.vercel.app/assets/docs/core/transactions/sol-transfer.svg)

<center>SOL转移</center>

发送者账户必须作为交易上的签名者(`is_signer`)包含在内，以批准扣除他们的lamport余额。发送者和接收者的账户都必须是可变的(`is_writable`)，因为指令修改了两个账户的lamport余额。

一旦发送交易，System Program被调用以处理转移指令。然后，System Program相应地更新了发送者和接收者的lamport余额。

![SOL转移过程](https://solana-developer-content.vercel.app/assets/docs/core/transactions/sol-transfer-process.svg)

<center>SOL转移过程</center>

### 简单的SOL转移

这里是一个[Solana Playground](https://beta.solpg.io/656a0ea7fb53fa325bfd0c3e)示例，展示如何使用`SystemProgram.transfer`方法构建SOL转移指令：

```typescript
// 定义要转移的数量
const transferAmount = 0.01; // 0.01 SOL

// 为从钱包1向钱包2转移SOL创建一个转移指令
const transferInstruction = SystemProgram.transfer({
  fromPubkey: sender.publicKey,
  toPubkey: receiver.publicKey,
  lamports: transferAmount * LAMPORTS_PER_SOL, // 将transferAmount转换为lamports
});

// 将转移指令添加到新交易中
const transaction = new Transaction().add(transferInstruction);
```

运行脚本并检查记录到控制台的交易细节。在下面的部分中，我们将详细介绍幕后发生的事情的细节。

## 交易

Solana[交易](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/src/transaction/mod.rs#L173)由以下组成：

1. [签名](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/src/signature.rs#L27)：交易中包含的签名数组。
2. [消息](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/message/legacy.rs#L110)：要原子性处理的指令列表。

![交易格式](https://solana-developer-content.vercel.app/assets/docs/core/transactions/tx_format.png)

<center>交易格式</center>

交易消息的结构包括：

- [消息头](./transactions#消息头)：指定签名者和只读账户的数量。
- [账户地址](./transactions#账户地址数组)：交易指令所需的账户地址数组。
- [最近区块哈希](./transactions#最近区块哈希)：作为交易的时间戳。
- [指令](./transactions#指令数组)：要执行的指令数组。

![交易消息](https://solana-developer-content.vercel.app/assets/docs/core/transactions/legacy_message.png)

### 交易大小

Solana网络遵循最大传输单元（MTU）大小为 1280 字节，与 [IPv6 MTU](https://en.wikipedia.org/wiki/IPv6_packet) 
大小限制一致，以确保通过 UDP 快速可靠地传输集群信息。在考虑必要的头部（IPv6 的 40 字节和片段头部的 8 字节）之后，
[剩余 1232 字节可用于数据包数据](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/src/packet.rs#L16-L21)，例如序列化的交易。

这意味着 Solana 交易的总大小限制为 1232 字节。签名和消息的组合不能超过此限制。

- 签名：每个签名需要 64 字节。签名的数量可以根据交易的要求而变化。
- 消息：消息包括指令、账户和额外的元数据，每个账户需要 32 字节。账户加上元数据的组合大小可以根据交易中包含的指令而变化。

![交易格式](https://solana-developer-content.vercel.app/assets/docs/core/transactions/issues_with_legacy_txs.png)

<center>交易格式</center>

### 消息头

交易的账户地址数组中包含的[消息头](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/message/mod.rs#L96) 
指定了特权。它由三个字节组成，每个字节包含一个u8整数，共同指定：

1. 交易所需的签名数量。
2. 需要签名的只读账户地址数量。
3. 不需要签名的只读账户地址数量。

![消息头](https://solana-developer-content.vercel.app/assets/docs/core/transactions/message_header.png)

<center>消息头</center>

### 紧凑数组格式

在交易消息的上下文中，紧凑数组指的是以以下格式序列化的数组：

1. 数组的长度，编码为[紧凑-u16](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/short_vec.rs). 
2. 编码长度后，数组的各个项目按顺序列出。

![紧凑数组格式](https://solana-developer-content.vercel.app/assets/docs/core/transactions/compact_array_format.png)

<center>紧凑数组格式</center>

这种编码方法用于指定交易消息中
[账户地址](./transactions#账户地址数组)和
[指令数组](./transactions#指令数组)的长度。

### 账户地址数组

交易消息包括一个数组，其中包含交易内指令所需的所有[账户地址](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/message/legacy.rs#L119)。

这个数组以[紧凑-u16](./transactions#紧凑数组格式)编码的账户地址数量开始，然后是按账户特权排序的地址。消息头中的元数据用于确定每个部分中的账户数量。

- 可写且为签名者的账户
- 只读且为签名者的账户
- 可写且不是签名者的账户
- 只读且不是签名者的账户

![紧凑账户地址数组](https://solana-developer-content.vercel.app/assets/docs/core/transactions/compat_array_of_account_addresses.png)

<center>紧凑账户地址数组</center>

### 最近区块哈希

所有交易都包含一个[最近区块哈希](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/message/legacy.rs#L122)，作为交易的时间戳。区块哈希用于防止重复和消除过时的交易。

交易的区块哈希的最大年龄是 150 个区块（假设区块时间为 400ms，大约 1 分钟。如果交易的区块哈希比最新的区块哈希早150个区块，它就被认为是过期的。这意味着在特定时间框架内未处理的交易将永远不会被执行。

您可以使用`getLatestBlockhash`RPC方法获取当前区块哈希和最后一个区块高度，该区块哈希将有效。这里有一个[Solana Playground](https://beta.solpg.io/661a06e1cffcf4b13384d046)的示例。

### 指令数组

交易消息包括一个数组，其中包含所有请求处理的
[指令](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/message/legacy.rs#L128)。交易消息中的指令以[CompiledInstruction](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/instruction.rs#L633)的格式。

就像账户地址数组一样，这个紧凑的数组以[紧凑-u16](./transactions#紧凑数组格式)编码的指令数量开始，然后是指令数组。数组中的每个指令指定以下信息：

1. **程序 ID**：标识将处理指令的链上程序。这表示为指向账户地址数组中账户地址的u8索引。
2. **紧凑账户地址索引数组**：指向每个指令所需的账户地址数组的u8索引数组。
3. **不透明u8数据的紧凑数组**：特定于被调用程序的u8字节数组。此数据指定要在程序上调用的指令以及指令所需的任何其他数据（例如函数参数）。

![紧凑指令数组](https://solana-developer-content.vercel.app/assets/docs/core/transactions/compact_array_of_ixs.png)

<center>紧凑指令数组</center>


### 示例交易结构

下面是一个交易的示例结构，包括一个单一的[SOL 转账](./transactions#基本示例)指令。它显示了消息的详细信息，包括头、账户密钥、区块哈希和指令，以及交易的签名。

- `header`：包括用于指定 `accountKeys` 数组中读写和签名者权限的数据。
- `accountKeys`：包括交易上所有指令的账户地址数组。
- `recentBlockhash`：创建交易时包含在交易上的区块哈希。
- `instructions`：包括交易上的所有指令的数组。每个指令中的 `account` 和 `programIdIndex` 通过索引引用 `accountKeys` 数组。
- `signatures`：包括交易上所有需要作为签名者的账户的签名数组。签名是通过使用账户的相应私钥对交易消息进行签名创建的。

```json
"transaction": {
    "message": {
      "header": {
        "numReadonlySignedAccounts": 0,
        "numReadonlyUnsignedAccounts": 1,
        "numRequiredSignatures": 1
      },
      "accountKeys": [
        "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R",
        "5snoUseZG8s8CDFHrXY2ZHaCrJYsW457piktDmhyb5Jd",
        "11111111111111111111111111111111"
      ],
      "recentBlockhash": "DzfXchZJoLMG3cNftcf2sw7qatkkuwQf4xH15N5wkKAb",
      "instructions": [
        {
          "accounts": [
            0,
            1
          ],
          "data": "3Bxs4NN8M2Yn4TLb",
          "programIdIndex": 2,
          "stackHeight": null
        }
      ],
      "indexToProgramIds": {}
    },
    "signatures": [
      "5LrcE2f6uvydKRquEJ8xp19heGxSvqsVbcqUeFoiWbXe8JNip7ftPQNTAVPyTK7ijVdpkzmKKaAQR7MWMmujAhXD"
    ]
  }
```

## 指令

一个[指令](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/instruction.rs#L329)是链上处理特定操作的请求，并且是[程序](./accounts#程序帐户)中最小的连续执行逻辑单元。

在构建要添加到交易中的指令时，每个指令必须包括以下信息：

- **程序地址**：指定被调用的程序。
- **账户**：列出指令读取或写入的每个账户，包括使用`AccountMeta`结构的其他程序。
- **指令数据**：一个字节数组，指定程序上的哪个[指令处理器]被调用，以及指令处理器所需的任何附加数据（函数参数）。

![交易指令](https://solana-developer-content.vercel.app/assets/docs/core/transactions/instruction.svg)
<center>交易指令</center>

### AccountMeta

对于指令所需的每个账户，必须指定以下信息：

- `pubkey`：账户的链上地址
- `is_signer`：指定账户是否需要作为交易的签名者
- `is_writable`：指定账户数据是否会被修改

这些信息被称为[AccountMeta](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/instruction.rs#L539)。

![AccountMeta](https://solana-developer-content.vercel.app/assets/docs/core/transactions/accountmeta.svg)

<center>AccountMeta</center>

通过指定指令所需的所有账户，以及每个账户是否可写，交易可以并行处理。

例如，两个不包含写入相同状态的任何账户的交易可以同时执行。

### 示例指令结构

下面是一个[SOL转账](./transactions#基本示例)指令的结构示例，详细说明了账户密钥、程序ID和指令所需的数据。

- `keys`：包括指令所需的每个账户的`AccountMeta`。
- `programId`：包含被调用指令执行逻辑的程序的地址。
- `data`：作为字节缓冲区的指令数据

```
{
  "keys": [
    {
      "pubkey": "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R",
      "isSigner": true,
      "isWritable": true
    },
    {
      "pubkey": "BpvxsLYKQZTH42jjtWHZpsVSa7s6JVwLKwBptPSHXuZc",
      "isSigner": false,
      "isWritable": true
    }
  ],
  "programId": "11111111111111111111111111111111",
  "data": [2,0,0,0,128,150,152,0,0,0,0,0]
}
```

## 扩展示例

构建程序指令的细节通常由客户端库抽象化。然而，如果没有可用的客户端库，您总是可以手动构建指令。

### 手动SOL转账

这是一个[Solana Playground](https://beta.solpg.io/656a102efb53fa325bfd0c3f)示例，展示了如何手动构建SOL转账指令：

```typescript
// 定义要转账的金额
const transferAmount = 0.01; // 0.01 SOL

// SystemProgram转账指令的指令索引
const transferInstructionIndex = 2;

// 为要传递给转账指令的数据创建一个缓冲区
const instructionData = Buffer.alloc(4 + 8); // uint32 + uint64
// 将指令索引写入缓冲区
instructionData.writeUInt32LE(transferInstructionIndex, 0);
// 将转账金额写入缓冲区
instructionData.writeBigUInt64LE(BigInt(transferAmount * LAMPORTS_PER_SOL), 4);

// 手动创建一个转账指令，用于从发送者到接收者的SOL转账
const transferInstruction = new TransactionInstruction({
  keys: [
    { pubkey: sender.publicKey, isSigner: true, isWritable: true },
    { pubkey: receiver.publicKey, isSigner: false, isWritable: true },
  ],
  programId: SystemProgram.programId,
  data: instructionData,
});

// 将转账指令添加到新交易中
const transaction = new Transaction().add(transferInstruction);
```

在底层，使用SystemProgram.transfer方法的[简单示例](./transactions#简单的sol转移)在功能上等同于上面的更详细的示例。`SystemProgram.transfer`方法只是抽象化了创建指令数据缓冲区和指令所需的每个账户的`AccountMeta`的细节。