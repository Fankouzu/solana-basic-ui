# 高级概念

## 版本化交易

版本化事务是新的事务格式，允许在 Solana 运行时中使用附加功能，包括地址查找表。

虽然不需要对链上程序进行更改来支持版本化交易的新功能（或向后兼容），但开发人员将需要更新其客户端代码以防止由于不同交易版本而导致的错误。

### 当前交易版本

Solana 运行时支持两种事务版本：

- legacy - 较旧的交易格式，没有额外的好处
- 0 - 添加了对[地址查找表](##地址查找表)的支持

### 最大支持交易版本

返回事务的所有 RPC 请求都应使用 maxSupportedTransactionVersion 选项指定它们在应用程序中支持的最高事务版本，包括 getBlock 和 getTransaction。

如果返回的版本化事务高于设置的 maxSupportedTransactionVersion，则 RPC 请求将失败。 （即，如果选择旧版时返回版本 0 交易，返回版本高于maxSupportedTransactionVersion 的版本，交易失败）

> 小贴士
>
> 警告：如果未设置 maxSupportedTransactionVersion 值，则 RPC 响应中将仅允许旧事务。因此，如果返回任何版本 0 事务，您的 RPC 请求将失败。



### 如何设置最大支持版本

使用标准 JSON 格式的 POST 请求，您可以在检索特定块时设置 maxSupportedTransactionVersion：

```bash
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d \
'{"jsonrpc": "2.0", "id":1, "method": "getBlock", "params": [430, {
  "encoding":"json",
  "maxSupportedTransactionVersion":0,
  "transactionDetails":"full",
  "rewards":false
}]}'
```

### 如何创建版本化事务

版本化事务的创建方式与创建事务的旧方法类似。需要注意的是，使用某些库时存在差异。

下面是如何使用 @solana/web3.js 库创建版本化事务以在两个帐户之间执行 SOL 传输的示例。

**说明：**

- ``payer``是有效的密钥对钱包，由 SOL 资助
- ``toAccount`` 一个有效的密钥对

**步骤：**

1. 导入 web3.js 库并创建与所需集群的连接。

2. 我们定义交易和帐户所需的最近的 blockhash 和 minRent：

代码片段：

```js
// 引入solana web3.js的包
const web3 = require("@solana/web3.js");
 
// 链接RPC
const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
// 获取租金豁免的最余额；也就是账户中最少存在多少sol，可以免除账户租金
let minRent = await connection.getMinimumBalanceForRentExemption(0);
// 获取最新的区块hash
let blockhash = await connection
  .getLatestBlockhash()
  .then(res => res.blockhash);
```

3. 创建一个包含您希望在交易中发送的所有指令的数组。在下面的示例中，我们将创建一个简单的 SOL 传输指令：

   ```js
   // 创建transfer指令数组
   const instructions = [
     web3.SystemProgram.transfer({
       fromPubkey: payer.publicKey,
       toPubkey: toAccount.publicKey,
       lamports: minRent,
     }),
   ];
   ```

   

4. 使用您所需的指令构建 MessageV0 格式的交易消息

   ```js
   // 以MessageVo编译消息
   const messageV0 = new web3.TransactionMessage({
     payerKey: payer.publicKey,
     recentBlockhash: blockhash,
     instructions,
   }).compileToV0Message();
   ```

   

5. 创建一个新的 VersionedTransaction，传入我们的 v0 兼容消息：

   ```js
   // 构造交易对象
   const transaction = new web3.VersionedTransaction(messageV0);
    
   // 使用payer签名交易
   transaction.sign([payer]);
   ```

   交易签名有两种方式：

   - 将签名数组传递到 VersionedTransaction 方法中
   - 调用 transaction.sign() 方法，传递所需签名者的数组

6. 向RPC提交交易

   ```js
   // 提交VO版本的交易
   const txId = await connection.sendTransaction(transaction);
   console.log(`https://explorer.solana.com/tx/${txId}?cluster=devnet`);
   ```

   

## **地址查找表**

地址查找表通常称为“查找表”或简称“ALT”，允许开发人员创建相关地址的集合，以便在单个事务中有效地加载更多地址。

由于 Solana 区块链上的每笔交易都需要列出作为交易一部分进行交互的每个地址，因此该列表实际上将限制每笔交易的 32 个地址。在地址查找表的帮助下，一笔交易现在可以将该限制提高到每笔交易 256 个地址。

### 压缩链上地址

将所有所需地址存储在链上地址查找表中后，可以通过表中的 1 字节索引（而不是完整的 32 字节地址）在事务内引用每个地址。这种查找方法有效地将 32 字节地址“压缩”为 1 字节索引值。、

### 版本化交易

要在事务中使用地址查找表，开发人员必须使用随新版本事务格式引入的 v0 事务。

### 如何创建地址查找表

使用 @solana/web3.js 库创建新的查找表与旧的遗留事务类似，但有一些差异。

使用 @solana/web3.js 库，您可以使用 createLookupTable 函数来构造创建新查找表所需的指令，并确定其地址：

```js
const web3 = require("@solana/web3.js");
 
// 连接RPC
const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
// 获取slot
const slot = await connection.getSlot();
 
// 假设：
// `payer` 是一个有效的有足够的 SOL 来支付执行费用 的`Keypair`
const [lookupTableInst, lookupTableAddress] = 
  web3.AddressLookupTableProgram.createLookupTable({
    authority: payer.publicKey,
    payer: payer.publicKey,
    recentSlot: slot,
  });
 
console.log("lookup table address:", lookupTableAddress.toBase58());
 
// 在链上创建地址查找表：
// 在交易中发送 `lookupTableInst` 指令
```

> 小贴士
>
> 注意：地址查找表可以使用 v0 事务或旧事务创建。但在使用 v0 版本事务时，Solana 运行时只能检索和处理查找表中的其他地址。



### 将地址添加到查找表

将地址添加到查找表称为“扩展”。使用@solana/web3.js库，您可以使用extendLookupTable方法创建新的扩展指令：

```js
// 通过“extend”指令将地址添加到“lookupTableAddress”表
const extendInstruction = web3.AddressLookupTableProgram.extendLookupTable({
  payer: payer.publicKey,
  authority: payer.publicKey,
  lookupTable: lookupTableAddress,
  addresses: [
    payer.publicKey,
    web3.SystemProgram.programId,
    // 添加更多的地址
  ],
});
 
// 在事务中将此 `extendInstruction` 发送到 rpc
// 将 `addresses` 列表插入到地址为 `lookupTableAddress` 的查找表中
```

> 小贴士
>
> 注意：由于与旧事务相同的内存限制，用于扩展地址查找表的任何事务也受到一次可以添加的地址数量的限制。
>
> 因此，您将需要使用多个事务来扩展具有更多地址（~20）的任何表，这些地址可以适应单个事务的内存限制。

一旦这些地址被插入表中并存储在链上，您将能够在未来的交易中使用地址查找表。在这些未来的交易中启用最多 256 个地址。



### 获取地址查找表

与从集群请求另一个帐户（或 PDA）类似，您可以使用 getAddressLookupTable 方法获取完整的地址查找表：

```js
// 定义要获取的查找表的`PublicKey`
const lookupTableAddress = new web3.PublicKey("");
 
// 从链上中获取表
const lookupTableAccount = (
  await connection.getAddressLookupTable(lookupTableAddress)
).value;
 
// `lookupTableAccount` 现在将是一个 `AddressLookupTableAccount` 对象
 
console.log("Table address from cluster:", lookupTableAccount.key.toBase58());
```

我们的lookupTableAccount变量现在将是一个AddressLookupTableAccount对象，我们可以解析它以读取查找表中链上存储的所有地址的列表：

```js
// 循环解析地址查找表中的地址
for (let i = 0; i < lookupTableAccount.state.addresses.length; i++) {
  const address = lookupTableAccount.state.addresses[i];
  console.log(i, address.toBase58());
}
```



### 如何在事务中使用地址查找表

创建查找表并将所需地址存储在链上（通过扩展查找表）后，您可以创建 v0 交易以利用链上查找功能。

就像旧的遗留交易一样，您可以创建交易将在链上执行的所有指令。然后，您可以向 `v0 事务中使用的消息提供这些指令的数组。

> 小贴士
>
> 注意：v0 事务中使用的指令可以使用过去用于创建指令的相同方法和函数来构造。涉及地址查找表的指令无需更改。



```js
// 假设：
// - `arrayOfInstructions` 已被创建为 `TransactionInstruction` 的 `array`
// - 我们正在使用上面获得的 `lookupTableAccount`
 
// 构造一个v0 兼容事务`消息`
const messageV0 = new web3.TransactionMessage({
  payerKey: payer.publicKey,
  recentBlockhash: blockhash,
  instructions: arrayOfInstructions, // 注意这是一个指令数组
}).compileToV0Message([lookupTableAccount]);
 
// 根据 v0 消息创建 v0 交易
const transactionV0 = new web3.VersionedTransaction(messageV0);
 
// 使用我们创建的名为“payer”的文件系统钱包签署 v0 交易
transactionV0.sign([payer]);
 
// 发送并确认交易
//（注意：这里没有签名者数组；请参阅下面的注释...）
const txid = await web3.sendAndConfirmTransaction(connection, transactionV0);
 
console.log(
  `Transaction: https://explorer.solana.com/tx/${txid}?cluster=devnet`,
);
```

> 小贴士
>
> 注意：将 VersionedTransaction 发送到集群时，必须在调用 sendAndConfirmTransaction 方法之前对其进行签名。如果您传递签名者数组（就像旧交易一样），该方法将触发错误！



### 地址查找表的应用

地址查找表可以用于减小一个事务中地址占用空间。例如在SPL token分发中，会存在大量的接受地址，如果写完整的地址，会占用大量空间，而使用地址查找表，会节省很多空间，因为地址查找表将32字节的地址压缩为了1字节的索引。

看一下分发token场景下，对地址查找表应用的代码示例：

```rust
use solana_sdk::{
    instruction::Instruction,
    pubkey::Pubkey,
    signer::Signer,
    transaction::Transaction,
};
use solana_client::rpc_client::RpcClient;
use spl_token::instruction::transfer;
use solana_sdk::system_instruction;

fn main() {
    let client = RpcClient::new("https://api.mainnet-beta.solana.com");

    // 定义接收地址
    let addresses = vec![
        Pubkey::new_unique(),
        Pubkey::new_unique(),
        Pubkey::new_unique(),
        // 添加更多目标地址
    ];

    // 定义地址查找表地址
    let lookup_table_address = Pubkey::new_unique();

    // 创建添加地址到查找表的指令
    let add_addresses_ix = system_instruction::add_addresses_to_lookup_table(
        &lookup_table_address,
        &addresses,
    );

    let payer = // 定义支付账户
    let source_token_account = // 定义源代币账户
    let amount = // 定义转账金额

    // 生成代币分发指令
    let instructions: Vec<Instruction> = addresses.iter().map(|&dest_address| {
        transfer(
            &spl_token::id(),
            &source_token_account,
            &dest_address,
            &payer.pubkey(),
            &[],
            amount,
        ).unwrap()
    }).collect();

    // 创建并发送引用查找表的交易
    let mut transaction = Transaction::new_with_lookup_table(
        &instructions,
        &[lookup_table],
        &payer,
        &client.get_latest_blockhash().unwrap(),
    );

    // 发送交易
    client.send_and_confirm_transaction(&mut transaction).unwrap();
}
```



## 交易确认及过期

对于许多新开发人员来说，在构建应用程序时，与交易确认相关的问题很常见。本文旨在增进对 Solana 区块链上使用的确认机制的整体理解，包括一些推荐的最佳实践。



### 交易简要背景

Before diving into how Solana transaction confirmation and expiration works, let's briefly set the base understanding of a few things:在深入了解 Solana 交易确认和到期的工作原理之前，我们先简要了解以下几件事：

- 什么是交易
- 交易的生命周期
- 什么是区块哈希
- 简要了解历史证明（PoH）及其与区块哈希的关系
- 

### 什么是交易？

交易由两个部分组成：消息和签名列表。交易消息是神奇发生的地方，从高层次来看，它由三个组成部分组成：

- 要调用的指令列表
- 要加载的帐户列表
- 最近的区块哈希



### 事务生命周期复习

以下是交易生命周期的高级视图。本文将涉及除步骤 1 和 4 之外的所有内容。

1. 创建指令列表以及指令需要读取和写入的帐户列表
2. 获取最近的区块哈希并使用它来准备交易消息
3. 模拟交易以确保其行为符合预期
4. 提示用户使用私钥对准备好的交易消息进行签名
5. 将交易发送到 RPC 节点，该节点尝试将其转发给当前的区块生产者
6. 希望区块生产者验证交易并将其提交到他们生产的区块中
7. 确认交易已包含在区块中或检测交易何时过期



### 什么是区块哈希？ 

“区块哈希”是指“插槽”的最后一个历史证明（PoH）哈希（如下所述）。由于 Solana 使用 PoH 作为可信时钟，因此交易的最近区块哈希可以被视为时间戳。

### 历史证明复习

Solana 的历史证明机制使用很长的递归 SHA-256 哈希链来构建可信时钟。

历史证明的“历史”部分含义：区块生产者将交易 ID 哈希到流中，以记录在其区块中处理了哪些交易。

PoH 哈希计算：next_hash = hash(prev_hash, hash(transaction_ids))

PoH 可以用作可信时钟，因为每个哈希必须按顺序生成。每个生成的块都包含一个块哈希和一个称为“ticks”的哈希检查点列表，以便验证器可以并行验证完整的哈希链并证明确实已经过去了一段时间。

### 交易过期

默认情况下，如果在一定时间内未提交到区块，所有 Solana 交易都会过期。绝大多数交易确认问题都与 RPC 节点和验证器如何检测和处理过期交易有关。深入了解交易过期的工作原理应该有助于您诊断大部分交易确认问题。



#### 交易过期工作原理

每笔交易都包含一个“最近的区块哈希”，用作 PoH 时钟时间戳，并在该区块哈希不再“足够新”时过期。

当每个块最终确定时（即达到最大刻度高度，到达“块边界”），该块的最终哈希值将被添加到 BlockhashQueue 中，该队列最多存储 300 个最新块哈希值。在交易处理期间，Solana 验证器将检查每笔交易的最新区块哈希值是否记录在最近 151 个存储的哈希值（也称为“最大处理期限”）内。如果交易的最近区块哈希值早于此最大处理期限，则不会处理该交易。

由于当前的最大处理年龄为 150，并且队列中的块哈希的“年龄”为 0 索引，因此实际上有 151 个块哈希被认为“足够新”且可用于处理。

由于时隙（又名验证器可以生成块的时间段）配置为持续约 400 毫秒，但可能在 400 毫秒到 600 毫秒之间波动，因此给定的块哈希只能被交易使用约 60 到 90 秒，然后才会被视为过期通过运行时。

#### 交易过期示例

让我们看一个简单的例子：

1. 验证者正在为当前槽主动生成新块
2. 验证器接收来自用户的交易，其中包含最近的 blockhash abcd...
3. 验证器根据 BlockhashQueue 中最近的区块哈希列表检查此区块哈希 abcd... 并发现它是在 151 个区块前创建的
4. 由于它正好是 151 个区块哈希旧的，因此该交易尚未过期并且仍然可以被处理！
5. 但是等等：在实际处理交易之前，验证器完成了下一个块的创建并将其添加到 BlockhashQueue 中。然后验证器开始为下一个时隙生成块（验证器为 4 个连续时隙生成块）
6. 验证器再次检查同一笔交易，发现它现在有 152 个区块哈希值旧，并拒绝它，因为它太旧了:(

#### 为什么交易会过期？ 

实际上，这样做有一个很好的理由，它是为了帮助验证者避免处理同一笔交易两次。

防止双重处理的一种简单的暴力方法可能是根据区块链的整个交易历史记录检查每笔新交易。但是，通过让交易在短时间内过期，验证器只需要检查新交易是否属于最近处理的相对较小的交易集中。

#### 其他区块链

Solana 防止双重处理的方法与其他区块链有很大不同。例如，以太坊跟踪每个交易发送者的计数器（随机数），并且只会处理使用下一个有效随机数的交易。

以太坊的方法对于验证者来说实施起来很简单，但对于用户来说可能会出现问题。许多人都遇到过这样的情况：他们的以太坊交易长时间陷入待处理状态，并且所有后来使用较高随机数值的交易都被阻止处理。

#### Solana 的优势

Solana 的方法有一些优点：

1. 单个费用支付者可以同时提交多笔交易，并且允许以任何顺序进行处理。如果您同时使用多个应用程序，则可能会发生这种情况。
2. 如果交易没有提交到区块并过期，用户可以再次尝试，因为他们知道他们之前的交易将永远不会被处理。

通过不使用计数器，Solana 钱包体验可能更容易让用户理解，因为他们可以快速到达成功、失败或过期状态，并避免烦人的待处理状态。

#### Solana 的缺点

当然也有一些缺点：

1. 验证者必须主动跟踪一组所有已处理的交易 ID，以防止重复处理。
2. 如果过期时间太短，用户可能无法在过期前提交交易。

这些缺点凸显了如何配置交易到期的权衡。如果交易的过期时间增加，验证器需要使用更多的内存来跟踪更多的交易。如果过期时间缩短，用户就没有足够的时间提交交易。

目前，Solana 集群要求交易使用不超过 151 个区块的区块哈希。

> 小贴士
>
> 这个[Github issue](https://github.com/solana-labs/solana/issues/23582) 包含一些计算，估计主网测试版验证器需要大约 150MB 的内存来跟踪交易。如果有必要的话，将来可以在不减少到期时间的情况下进行精简，如该问题中详细介绍的那样。



### 交易确认提示

如前所述，区块哈希在仅 151 个区块的时间段后就会过期，当在 400 毫秒的目标时间内处理时隙时，该时间段最快可以过去一分钟。

考虑到客户端需要获取最近的区块哈希，等待用户签名，并最终希望广播的交易到达愿意接受它的领导者，一分钟并不是很多时间。让我们了解一些技巧，以帮助避免由于交易过期而导致确认失败！

#### 获取具有适当承诺级别的块哈希

鉴于到期时间很短，客户端和应用程序必须帮助用户使用尽可能新的区块哈希创建交易。

获取区块哈希时，当前推荐的 RPC API 称为 getLatestBlockhash。默认情况下，该 API 使用最终确定的承诺级别来返回最近最终确定的区块的区块哈希值。但是，您可以通过将承诺参数设置为不同的承诺级别来覆盖此行为。

**推荐**

已确认的承诺级别几乎应该始终用于 RPC 请求，因为它通常仅落后于已处理的承诺几个槽，并且属于丢弃分叉的可能性非常低。

但请随意考虑其他选择：

- 选择“已处理”将使您能够获取与其他承诺级别相比的最新区块哈希，因此可以为您提供最多的时间来准备和处理交易。但由于 Solana 区块链中分叉的普遍存在，大约 5% 的区块最终没有被集群最终确定，因此您的交易很有可能使用属于已丢弃分叉的区块哈希。使用区块哈希作为废弃区块的交易永远不会被最终区块链中的任何区块视为最近的交易。
- 使用最终确定的默认承诺级别将消除您选择的区块哈希属于已删除分叉的任何风险。权衡是，最近确认的区块和最近最终确定的区块之间通常至少存在 32 个时隙的差异。这种权衡相当严重，并且有效地将事务的过期时间减少了大约 13 秒，但在不稳定的集群条件下，这个时间可能会更长。

#### 使用适当的预检承诺级别

如果您的交易使用从一个 RPC 节点获取的区块哈希，然后您使用不同的 RPC 节点发送或模拟该交易，则可能会因一个节点落后于另一个节点而遇到问题。

当 RPC 节点收到 sendTransaction 请求时，它们将尝试使用最新完成的块或使用 preflightCommitment 参数选择的块来确定事务的过期块。一个非常常见的问题是，收到的交易的区块哈希是在用于计算该交易到期的区块之后生成的。如果 RPC 节点无法确定您的交易何时过期，它只会转发您的交易一次，然后会删除该交易。

同样，当RPC节点收到simulateTransaction请求时，它们将使用最新完成的块或使用preflightCommitment参数选择的块来模拟您的交易。如果选择用于模拟的块比用于交易的块哈希的块旧，则模拟将失败并出现可怕的“未找到块哈希”错误。

**推荐**

即使您使用skipPreflight，也始终将 preflightCommitment 参数设置为与用于为 sendTransaction 和simulateTransaction 请求获取交易的块哈希值相同的承诺级别。

#### 发送交易时要警惕落后的 RPC 节点 

当您的应用程序使用 RPC 池服务或当创建事务和发送事务时 RPC 端点不同时，您需要警惕一个 RPC 节点落后于另一个的情况。例如，如果您从一个 RPC 节点获取交易区块哈希，然后将该交易发送到第二个 RPC 节点进行转发或模拟，则第二个 RPC 节点可能落后于第一个节点。

**推荐**

对于 sendTransaction 请求，客户端应定期向 RPC 节点重新发送事务，这样，如果 RPC 节点稍微落后于集群，它最终会赶上并正确检测事务的过期情况。

对于simulateTransaction请求，客户端应使用replaceRecentBlockhash参数告诉RPC节点将模拟交易的blockhash替换为对模拟始终有效的blockhash。

#### 避免重复使用过时的区块哈希

即使您的应用程序获取了最近的区块哈希，也请确保您不会在交易中重复使用该区块哈希太久。理想的情况是在用户签署交易之前获取最近的区块哈希。

**应用推荐**

频繁轮询最近的新区块哈希，以确保每当用户触发创建交易的操作时，您的应用程序已经有一个准备就绪的新区块哈希。

**钱包推荐**

定期轮询新的最近的区块哈希，并在签署交易之前替换交易的最近的区块哈希，以确保区块哈希尽可能新鲜。

#### 获取区块哈希时使用健康的 RPC 节点 

通过从 RPC 节点获取具有已确认承诺级别的最新区块哈希，它将使用它所知道的最新已确认区块的区块哈希进行响应。 Solana 的区块传播协议会优先将区块发送到质押节点，因此 RPC 节点自然会落后于集群其他节点一个区块。他们还必须做更多的工作来处理应用程序请求，并且在用户流量大的情况下可能会滞后更多。

因此，滞后的 RPC 节点可以使用集群不久前确认的块哈希来响应 getLatestBlockhash 请求。默认情况下，落后的 RPC 节点检测到它落后于集群超过 150 个槽，将停止响应请求，但在达到该阈值之前，它们仍然可以返回即将过期的块哈希。

**推荐**

使用以下方法之一监控 RPC 节点的运行状况，以确保它们具有最新的集群状态视图：

1. 使用 getSlot RPC API 和已处理的承诺级别来获取 RPC 节点的最高已处理插槽，然后调用 getMaxShredInsertSlot RPC API 来获取 RPC 节点已收到块“碎片”的最高插槽。如果这些响应之间的差异非常大，则集群生成的块远远早于 RPC 节点处理的块。
2. 在几个不同的 RPC API 节点上调用具有已确认承诺级别的 getLatestBlockhash RPC API，并使用为其上下文槽返回最高槽的节点中的块哈希。

#### 等待足够长的时间过期

**推荐**

当调用 getLatestBlockhash RPC API 获取交易的最新区块哈希时，请记下响应中的 lastValidBlockHeight。

然后，使用已确认的承诺级别轮询 getBlockHeight RPC API，直到返回的块高度大于之前返回的最后一个有效块高度。

#### 考虑使用“持久”交易

有时交易过期问题确实很难避免（例如离线签名、集群不稳定）。如果前面的技巧仍然不足以满足您的用例，您可以改用持久事务（它们只需要一些设置）。

要开始使用持久交易，用户首先需要提交一个交易，该交易调用创建特殊链上“随机数”帐户并在其中存储“持久区块哈希”的指令。在未来的任何时候（只要随机数账户尚未被使用），用户都可以通过遵循以下两条规则来创建持久交易：

1. 指令列表必须以加载其链上随机数账户的“预先随机数”系统指令开始
2. 交易的区块哈希必须等于链上随机数账户存储的持久区块哈希

以下是 Solana 运行时处理这些持久事务的方式：

1. 如果交易的区块哈希不再是“最近的”，运行时会检查交易的指令列表是否以“提前随机数”系统指令开头
2. 如果是，则加载由“advance nonce”指令指定的随机数帐户
3. 然后它检查存储的持久区块哈希是否与交易的区块哈希相匹配
4. 最后，它确保将随机数帐户存储的区块哈希推进到最新的区块哈希，以确保同一交易永远不会被再次处理

有关这些持久事务如何工作的更多详细信息，您可以阅读 [original proposal](https://docs.solanalabs.com/implemented-proposals/durable-tx-nonces) 并查看 Solana 文档中的 [check out an example](https://solana.com/zh/developers/guides/advanced/introduction-to-durable-nonces) 。



## 重试交易

### 重试事务

在某些情况下，看似有效的交易可能会在包含在区块中之前被删除。这种情况最常发生在网络拥塞期间，此时 RPC 节点无法将事务重新广播给领导者。对于最终用户来说，他们的交易可能看起来完全消失了。虽然 RPC 节点配备了通用重播算法，但应用程序开发人员也能够开发自己的自定义重播逻辑。

### TLDR

- 节点将尝试使用通用算法重新广播交易
- 应用程序开发人员可以实现自己的自定义转播逻辑
- 开发人员应该利用 sendTransaction JSON-RPC 方法上的 maxRetries 参数
- 开发人员应启用预检检查以在提交交易之前引发错误
- 在重新签署任何交易之前，确保初始交易的区块哈希已过期非常重要

### 交易过程

#### 客户如何提交交易

在 Solana 中，没有内存池的概念。所有交易，无论是通过编程方式发起还是由最终用户发起，都会有效地路由到领导者，以便可以将它们处理成一个块。有两种主要方式可以将交易发送给领导者：

1. 通过 RPC 服务器和 sendTransaction JSON-RPC 方法进行代理
2. 通过 [TPU Client ](https://docs.rs/solana-client/latest/solana_client/tpu_client/index.html) 直接与领导者联系

绝大多数最终用户将通过 RPC 服务器提交交易。当客户端提交交易时，接收 RPC 节点将依次尝试将交易广播给当前和下一个领导者。在领导者处理事务之前，除了客户端和中继 RPC 节点所知之外，没有任何事务记录。对于 TPU 客户端，重播和领导者转发完全由客户端软件处理。

![image-20240525140005154](C:\Users\Ss\AppData\Roaming\Typora\typora-user-images\image-20240525140005154.png)

#### RPC 节点如何广播事务

RPC节点通过sendTransaction接收到交易后，会将交易转换为UDP数据包，然后转发给相关领导者。 UDP 允许验证者快速相互通信，但不提供有关交易交付的任何保证。

由于 Solana 的领导者时间表在每个 epoch（约 2 天）之前都是已知的，因此 RPC 节点将直接向当前和下一个领导者广播其交易。这与以太坊等其他八卦协议形成鲜明对比，后者在整个网络中随机且广泛地传播交易。默认情况下，RPC 节点将尝试每两秒将交易转发给领导者，直到交易最终确定或交易的区块哈希过期（150 个区块或截至撰写本文时约 1 分 19 秒）。如果未完成的重播队列大小大于 10,000 个事务，则新提交的事务将被丢弃。 RPC 操作员可以调整命令行参数来更改此重试逻辑的默认行为。

当 RPC 节点广播交易时，它将尝试将交易转发到领导者的交易处理单元 (TPU)。 TPU 分五个不同的阶段处理交易：

- [Fetch Stage](https://github.com/solana-labs/solana/blob/cd6f931223181d5a1d47cba64e857785a175a760/core/src/fetch_stage.rs#L21)
- [SigVerify Stage](https://github.com/solana-labs/solana/blob/cd6f931223181d5a1d47cba64e857785a175a760/core/src/tpu.rs#L91)
- [Banking Stage](https://github.com/solana-labs/solana/blob/cd6f931223181d5a1d47cba64e857785a175a760/core/src/banking_stage.rs#L249)
- [Proof of History Service](https://github.com/solana-labs/solana/blob/cd6f931223181d5a1d47cba64e857785a175a760/poh/src/poh_service.rs)
- [Broadcast Stage](https://github.com/solana-labs/solana/blob/cd6f931223181d5a1d47cba64e857785a175a760/core/src/tpu.rs#L136)

![](C:\Users\Ss\AppData\Roaming\Typora\typora-user-images\image-20240525140150734.png)

在这五个阶段中，Fetch Stage 负责接收事务。在获取阶段，验证器将根据三个端口对传入交易进行分类：

- tpu处理常规交易，例如代币转移、NFT 铸币和程序指令
- tpu_vote 专注于投票交易
- tpu_forwards 将未处理的数据包转发给下一个领导者

有关 TPU 的更多信息，请参阅 [Jito Labs](https://jito-labs.medium.com/solana-validator-101-transaction-processing-90bcdc271143) 撰写的这篇精彩文章。

### 交易如何被丢弃

在整个交易过程中，在某些情况下交易可能会无意中从网络中丢失。

#### 在处理交易之前

如果网络丢弃一笔交易，它很可能会在领导者处理该交易之前这样做。 UDP 数据包丢失是发生这种情况的最简单原因。在网络负载严重的时期，验证器也可能会因处理所需的大量交易而不堪重负。虽然验证器可以通过 tpu_forwards 转发剩余交易，但可以转发的数据量是有限的。此外，每个转发仅限于验证器之间的单跳。也就是说，tpu_forwards 端口上收到的交易不会转发到其他验证器。

还有两个鲜为人知的原因可能会导致交易在处理之前被删除。第一个场景涉及通过 RPC 池提交的事务。有时，RPC 池的一部分可能会远远领先于池的其余部分。当池中的节点需要协同工作时，这可能会导致问题。在这个例子中，交易的recentBlockhash是从池的高级部分（后端A）查询的。当交易被提交到池的滞后部分（后端B）时，节点将无法识别高级区块哈希并会丢弃交易。如果开发人员对 sendTransaction 启用预检检查，则可以在事务提交时检测到这一点。

![image-20240525140425764](C:\Users\Ss\AppData\Roaming\Typora\typora-user-images\image-20240525140425764.png)

​									

临时网络分叉也可能导致交易丢失。如果验证者在银行阶段重播其区块的速度很慢，它可能最终会创建一个少数派分叉。当客户端构建交易时，交易可能会引用仅存在于少数派叉上的最近的Blockhash。提交事务后，集群可以在处理事务之前切换出少数派分叉。在这种情况下，由于找不到区块哈希，交易被丢弃。

![image-20240525140557114](C:\Users\Ss\AppData\Roaming\Typora\typora-user-images\image-20240525140557114.png)

#### 交易处理之后和最终确定之前

如果交易引用来自少数分叉的最近的Blockhash，则该交易仍然有可能被处理。然而，在这种情况下，它将由少数分叉上的领导者处理。当这个领导者试图与网络的其他部分共享其处理过的交易时，它将无法与不识别少数分叉的大多数验证者达成共识。此时，交易将在最终确定之前被删除。

![image-20240525140633521](C:\Users\Ss\AppData\Roaming\Typora\typora-user-images\image-20240525140633521.png)







### 处理丢弃的交易

虽然 RPC 节点会尝试重新广播事务，但它们采用的算法是通用的，并且通常不适合特定应用程序的需求。为了应对网络拥塞，应用程序开发人员应该定制自己的重播逻辑。

### 深入了解 sendTransaction

当涉及到提交事务时，sendTransaction RPC 方法是开发人员可用的主要工具。 sendTransaction 只负责将事务从客户端中继到 RPC 节点。如果节点收到交易，sendTransaction 将返回可用于跟踪交易的交易 id。成功的响应并不表明事务是否将由集群处理或完成。

#### 请求参数

- ``stringtransaction: string ``- 完全签名的交易，作为编码字符串
- (optional) ``configuration: object``
  - `skipPreflight`: `boolean`  - 如果为 true，则跳过预检事务检查（默认值：false）
  - (optional) `preflightCommitment`: `string` - 用于针对银行槽进行预检模拟的承诺级别（默认值：“最终确定”）。
  - (optional) `encoding`: `string` - Encoding used for the transaction data. Either "base58" (slow), or "base64". (default: "base58").（可选）编码：字符串 - 用于交易数据的编码。 “base58”（慢）或“base64”。 （默认值：“base58”）。
  - (optional) `maxRetries`: `usize` -  RPC 节点重试向领导者发送事务的最大次数。如果未提供此参数，RPC 节点将重试交易，直到交易完成或区块哈希过期。

#### 返回值:

- `transaction id`: `string` -  嵌入交易中的第一个交易签名，作为 base-58 编码的字符串。此事务 ID 可以与 getSignatureStatuses 一起使用来轮询状态更新。

### 自定义重播逻辑

为了开发自己的重播逻辑，开发人员应该利用 sendTransaction 的 maxRetries 参数。如果提供，maxRetries将覆盖RPC节点的默认重试逻辑，允许开发人员在合理的范围内手动控制重试过程。

手动重试事务的常见模式涉及临时存储来自 getLatestBlockhash 的 LastValidBlockHeight。一旦隐藏，应用程序就可以轮询集群的区块高度并以适当的时间间隔手动重试事务。在网络拥塞时，将 maxRetries 设置为 0 并通过自定义算法手动重播是有利的。虽然某些应用程序可能采用指数退避算法，但其他应用程序（例如 Mango）选择以恒定间隔不断重新提交事务，直到发生超时。

```js
import {
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import * as nacl from "tweetnacl";
 
const sleep = async (ms: number) => {
  return new Promise(r => setTimeout(r, ms));
};
 
(async () => {
  const payer = Keypair.generate();
  const toAccount = Keypair.generate().publicKey;
 
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
 
  const airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    LAMPORTS_PER_SOL,
  );
 
  await connection.confirmTransaction({ signature: airdropSignature });
 
  const blockhashResponse = await connection.getLatestBlockhashAndContext();
  const lastValidBlockHeight = blockhashResponse.context.slot + 150;
 
  const transaction = new Transaction({
    feePayer: payer.publicKey,
    blockhash: blockhashResponse.value.blockhash,
    lastValidBlockHeight: lastValidBlockHeight,
  }).add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: toAccount,
      lamports: 1000000,
    }),
  );
  const message = transaction.serializeMessage();
  const signature = nacl.sign.detached(message, payer.secretKey);
  transaction.addSignature(payer.publicKey, Buffer.from(signature));
  const rawTransaction = transaction.serialize();
  let blockheight = await connection.getBlockHeight();
 
  while (blockheight < lastValidBlockHeight) {
    connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
    });
    await sleep(500);
    blockheight = await connection.getBlockHeight();
  }
})();
```



当通过 getLatestBlockhash 进行轮询时，应用程序应指定其预期的承诺级别。通过将其承诺设置为已确认（投票）或最终确定（确认后约 30 个区块），应用程序可以避免从少数分叉轮询区块哈希。

当通过 getLatestBlockhash 进行轮询时，应用程序应指定其预期的承诺级别。通过将其承诺设置为已确认（投票）或最终确定（确认后约 30 个区块），应用程序可以避免从少数分叉轮询区块哈希。



### 跳过预检的成本

默认情况下，sendTransaction 将在提交交易之前执行三项预检检查。具体来说，sendTransaction 将：

- 验证所有签名均有效
- 检查引用的区块哈希是否在最近 150 个区块内
- 根据 preflightCommitment 指定的银行槽模拟交易

如果这三个预检检查中的任何一个失败，sendTransaction 将在提交交易之前引发错误。预检检查通常是丢失事务和允许客户端优雅地处理错误之间的区别。为了确保解决这些常见错误，建议开发人员将skipPreflight 设置为false。

### 何时重新签署交易

尽管尝试了重播，但有时可能会要求客户端重新签署交易。在重新签署任何交易之前，确保初始交易的区块哈希已过期非常重要。如果初始区块哈希仍然有效，则两笔交易都有可能被网络接受。对于最终用户来说，这看起来就像他们无意中发送了同一笔交易两次。

在 Solana 中，一旦删除的交易引用的 blockhash 早于从 getLatestBlockhash 接收到的 lastValidBlockHeight，就可以安全地丢弃该交易。开发人员应该通过查询 getEpochInfo 并与响应中的 blockHeight 进行比较来跟踪这个 lastValidBlockHeight。一旦区块哈希失效，客户端可以使用新查询的区块哈希重新签名。



## 状态压缩

在 Solana 上，状态压缩是创建链外数据“指纹”（或哈希）并将该指纹存储在链上以进行安全验证的方法。有效利用 Solana 账本的安全性来安全地验证链下数据，验证其未被篡改。

这种“压缩”方法允许 Solana 程序和 dApp 使用廉价的区块链账本空间（而不是更昂贵的账户空间）来安全地存储数据。

这是通过使用一种特殊的二叉树结构（称为并发默克尔树）来创建每条数据（称为叶子）的哈希值，将它们哈希在一起，然后仅将最终哈希值存储在链上来实现的。

### 什么是状态压缩？

简而言之，状态压缩使用“树”结构以确定性方式将链下数据加密地散列在一起，以计算存储在链上的单个最终散列。

这些树是在这个“确定性”过程中通过以下方式创建的：

- 获取任何数据
- 创建此数据的哈希值
- 将此哈希值存储为树底部的叶子
- 然后将每个叶子对散列在一起，创建一个分支
- 然后将每个分支散列在一起
- 不断地爬树并将相邻的分支散列在一起
- 一旦到达树的顶部，就会产生最终的根哈希

然后将该根哈希存储在链上，作为每个叶子中所有数据的可验证证明。允许任何人以加密方式验证树中的所有链外数据，同时实际上仅在链上存储最少量的数据。因此，由于这种“状态压缩”，显着降低了存储/证明大量数据的成本。

### 默克尔树和并发默克尔树

Solana 的状态压缩使用了一种特殊类型的默克尔树，它允许对任何给定的树进行多次更改，同时仍然保持树的完整性和有效性。

这种特殊的树，被称为“并发默克尔树”，有效地在链上保留了树的“变更日志”。在证明失效之前，允许对同一棵树进行多次快速更改（即所有更改都在同一块中）。

### 什么是默克尔树？ 

Merkle 树，有时称为“哈希树”，是一种基于哈希的二叉树结构，其中每个叶节点都表示为其内部数据的加密哈希。每个不是叶子的节点（称为分支）都表示为其子叶子哈希的哈希。

然后，每个分支也被散列在一起，爬上树，直到最终只剩下一个散列。这个最终的哈希值称为根哈希值或“根”，然后可以与“证明路径”结合使用来验证叶节点中存储的任何数据。

一旦计算出最终的根哈希，就可以通过重新哈希特定叶子的数据和攀爬树的每个相邻分支的哈希标签（称为证明或“证明路径”）来验证叶节点中存储的任何数据。将此“重新散列”与根散列进行比较是对底层叶数据的验证。如果它们匹配，则数据被验证准确。如果它们不匹配，则叶数据已更改。

无论何时需要，都可以通过简单地散列新叶数据并以与原始根相同的方式重新计算根散列来改变原始叶数据。然后使用这个新的根哈希来验证任何数据，并有效地使先前的根哈希和先前的证明无效。因此，对这些传统merkle树的每次改变都需要串行执行。

> 小贴士
>
> 使用 Merkle 树时，更改叶数据和计算新的根哈希的过程可能是非常常见的事情！虽然它是树的设计点之一，但它可能导致最显着的缺点之一：快速变化。

### 什么是并发默克尔树？ #

运行时内，验证器可以相对快速地连续接收更改链上传统 Merkle 树的请求（例如在同一槽内）。每个叶子数据更改仍需要串行执行。由于根哈希和证明被槽中的先前更改请求无效，导致每个后续更改请求失败。

输入并发默克尔树。

并发默克尔树存储最近更改的安全更改日志、根哈希以及派生它的证明。此变更日志“缓冲区”存储在链上特定于每棵树的帐户中，具有最大数量的变更日志“记录”（也称为 maxBufferSize）。

当验证器在同一槽中接收到多个叶数据更改请求时，链上并发默克尔树可以使用此“更改日志缓冲区”作为更可接受的证明的事实来源。有效地允许在同一槽中对同一棵树进行最多 maxBufferSize 的更改。显着提高吞吐量。

### 调整并发默克尔树的大小

创建这些链上树之一时，有 3 个值将决定树的大小、创建树的成本以及树的并发更改数量：

1. max depth
2. max buffer size
3. canopy depth

#### 最大深度

树的“最大深度”是从任何数据叶到树根的最大跳数。

由于默克尔树是二叉树，因此每个叶子仅与另一个叶子相连；作为一对叶存在。

因此，树的 maxDepth 用于通过简单的计算来确定要在树中存储的节点（也称为数据块或叶子）的最大数量：

``nodes_count = 2 ^ maxDepth``

由于必须在创建树时设置树深度，因此您必须决定希望树存储多少数据。然后使用上面的简单计算，您可以确定存储数据的最低 maxDepth。

##### 示例 1：铸造 100 nfts

如果你想创建一棵树来存储 100 个压缩的 nft，我们至少需要“100 个叶子”或“100 个节点”。

```js
// maxDepth=6 -> 64 nodes2^6 = 64 
// maxDepth=7 -> 128 nodes2^7 = 128
```

我们必须使用 maxDepth 7 以确保我们可以存储所有数据。

##### 示例 2：铸造 15000 nfts

如果你想创建一棵树来存储 15000 个压缩的 nft，我们至少需要“15000 个叶子”或“15000 个节点”。

```js
// maxDepth=13 -> 8192 nodes2^13 = 8192 
// maxDepth=14 -> 16384 nodes2^14 = 16384
```

我们必须使用 maxDepth 14 以确保我们可以存储所有数据。

##### 最大深度越高，成本越高

值将是创建树时成本的主要驱动因素之一，因为您将在创建树时预先支付此成本。最大树深度越高，可以存储的数据指纹（也称为哈希）越多，成本就越高。

#### 最大缓冲区大小

“最大缓冲区大小”实际上是在根哈希仍然有效的情况下树上可以发生的最大更改数量。

由于根哈希实际上是所有叶子数据的单个哈希，因此更改任何单个叶子都会使更改常规树的任何叶子的所有后续尝试所需的证明无效。

但对于并发树，实际上存在这些证明的更新的变更日志。该变更日志缓冲区的大小是在树创建时通过 maxBufferSize 值进行调整和设置的。

#### 冠层深度

“树冠深度”，有时称为树冠大小，是任何给定证明路径在链上缓存/存储的证明节点的数量。

当对叶子执行更新操作时，例如转让所有权（例如出售压缩的 NFT），必须使用完整的证明路径来验证叶子的原始所有权，从而允许更新操作。此验证是使用完整的证明路径来正确计算当前根哈希（或通过链上“并发缓冲区”的任何缓存根哈希）来执行的。

树的最大深度越大，执行此验证所需的证明节点就越多。例如，如果您的最大深度为 14，则总共需要使用 14 个证明节点来进行验证。随着树变得越来越大，完整的证明路径也变得越来越大。

通常，每个证明节点都需要包含在每个树更新交易中。由于每个证明节点值在事务中占用 32 个字节（类似于提供公钥），因此较大的树将很快超过最大事务大小限制。

进入canopy。 Canopy 能够在链上存储一定数量的证明节点（对于任何给定的证明路径）。允许在每个更新交易中包含较少的证明节点，从而使总体交易大小保持在限制以下。

例如，最大深度为 14 的树总共需要 14 个证明节点。如果 canopy 为 10，则每个更新交易只需要提交 4 个证明节点。

##### 冠层深度值越大，成本越高

canopyDepth 值也是创建树时的主要成本因素，因为您将在创建树时预先支付此成本。 Canopy 深度越高，链上存储的数据证明节点越多，成本越高。

##### 较小的冠层限制了可组合性

虽然树冠越高，树的创建成本就越高，但树冠深度越低，则需要在每个更新事务中包含更多的证明节点。需要提交的节点越多，交易规模就越大，因此越容易超出交易规模限制。

对于任何其他尝试与您的树/叶子交互的 Solana 程序或 dApp 来说也是如此。如果您的树需要太多证明节点（由于树冠深度较低），则另一个链上程序可以提供的任何其他附加操作将受到其特定指令大小加上您的证明节点列表大小的限制。限制可组合性以及特定树的潜在附加实用性。

例如，如果您的树用于压缩 NFT 并且树冠深度非常低，则 NFT 市场可能只能支持简单的 NFT 传输。并且无法支持链上竞价系统。

### 创建一棵树的成本

创建并发默克尔树的成本基于树的大小参数：maxDepth、maxBufferSize 和 canopyDepth。这些值都用于计算树存在于链上所需的链上存储（以字节为单位）。

一旦计算出所需的空间（以字节为单位），并使用 getMinimumBalanceForRentExemption RPC 方法，请求在链上分配此字节数的成本（以 lamports 为单位）。

##### 在 JavaScript 中计算树成本

在 @solana/spl-account-compression 包中，开发人员可以使用 getConcurrentMerkleTreeAccountSize 函数来计算给定树大小参数所需的空间。

然后使用 getMinimumBalanceForRentExemption 函数获取为链上树分配所需空间的最终成本（以 lamports 为单位）。

然后确定 lamports 的成本，以使此规模的帐户免租金，类似于任何其他帐户创建。

```js
// 计算树空间
const requiredSpace = getConcurrentMerkleTreeAccountSize(
  maxDepth,
  maxBufferSize,
  canopyDepth,
);
 
// 获取链上存储花费
const storageCost =
  await connection.getMinimumBalanceForRentExemption(requiredSpace);
```

#### 成本示例

下面列出了不同树大小的几个示例成本，包括每个树可能有多少个叶节点：

**示例 #1：16,384 个节点，成本为 0.222 SOL**

- 最大深度为 14，最大缓冲区大小为 64
- 最大叶节点数：16,384
- 创建树冠深度为 0 的成本约为 0.222 SOL

**示例 #2：16,384 个节点，成本 1.134 SOL**

- 最大深度为 14，最大缓冲区大小为 64
- 最大叶节点数：16,384
- 树冠深度 11 的创建成本约为 1.134 SOL

**示例 #3：1,048,576 个节点，花费 1.673 SOL**

- 最大深度为 20，最大缓冲区大小为 256
- 最大叶节点数：1,048,576
- 创建深度为 10 的树冠大约需要 1.673 SOL

**示例 #4：1,048,576 个节点，花费 15.814 SOL**

- 最大深度为 20，最大缓冲区大小为 256
- 最大叶节点数：1,048,576
- 树冠深度 15 的创建成本约为 15.814 SOL

### 压缩NFT 

压缩 NFT 是 Solana 上状态压缩最流行的用例之一。通过压缩，一百万个 NFT 集合的铸造成本约为 50 SOL，而未压缩的等效集合则约为 12,000 SOL。

如果您有兴趣自己创建压缩 NFT，请阅读我们有关 [铸造和传输压缩 NFT  ](https://solana.com/zh/developers/guides/javascript/compressed-nfts)的开发人员指南。

