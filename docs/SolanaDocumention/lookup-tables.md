
# **地址查找表**

地址查找表通常称为“查找表”或简称“ALT”，允许开发人员创建相关地址的集合，以便在单个事务中有效地加载更多地址。

由于 Solana 区块链上的每笔交易都需要列出作为交易一部分进行交互的每个地址，因此该列表实际上将限制每笔交易的 32 个地址。在地址查找表的帮助下，一笔交易现在可以将该限制提高到每笔交易 256 个地址。

## 压缩链上地址

将所有所需地址存储在链上地址查找表中后，可以通过表中的 1 字节索引（而不是完整的 32 字节地址）在事务内引用每个地址。这种查找方法有效地将 32 字节地址“压缩”为 1 字节索引值。、

## 版本化交易

要在事务中使用地址查找表，开发人员必须使用随新版本事务格式引入的 v0 事务。

## 如何创建地址查找表

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



## 将地址添加到查找表

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



## 获取地址查找表

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



## 如何在交易中使用地址查找表

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

## 更多资源

- 阅读 [提案](https://docs.solanalabs.com/proposals/versioned-transactions)  了解地址查找表和版本化事务
- [使用地址查找表的 Rust 程序示例](https://github.com/TeamRaccoons/address-lookup-table-multi-swap)


## 地址查找表的应用

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

