# 版本化交易

版本化交易是新的交易形式，允许在 Solana 运行时中使用附加功能，包括地址查找表。

虽然不需要对链上程序进行更改来支持版本化交易的新功能（或向后兼容），但开发人员将需要更新其客户端代码以防止由于不同交易版本而导致的错误。

## 当前交易版本

Solana 运行时支持两种交易版本：

- legacy - 旧的交易版本，没有额外的功能
- v0 - 添加了对[地址查找表](./lookup-tables)的支持

## 最大交易版本

返回交易的所有 RPC 请求都应使用 `maxSupportedTransactionVersion` 选项指定它们在应用程序中支持的最高交易版本，包括 `getBlock` 和 `getTransaction`。

如果返回的版本化交易高于设置的 `maxSupportedTransactionVersion`，则 RPC 请求将失败。 （即，如果选择旧版时返回 v0 版本交易，返回版本高于 `maxSupportedTransactionVersion` 的版本，交易失败）

> 小贴士
>
> 警告：如果未设置 `maxSupportedTransactionVersion` 值，则 RPC 响应中将仅允许旧交易。因此，如果返回 v0 版本交易，RPC 请求将失败。

## 如何设置最大交易版本

可以使用 `@solana/web3.js` 库和直接向 RPC 端点发送 JSON 格式的请求来设置 `maxSupportedTransactionVersion`。

### 使用 web3.js

使用 [`@solana/web3.js`](https://solana-labs.github.io/solana-web3.js/) 库, 可以检索最近的块或获取指定的交易：

```js
// connect to the `devnet` cluster and get the current `slot`
const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
const slot = await connection.getSlot();

// get the latest block (allowing for v0 transactions)
const block = await connection.getBlock(slot, {
  maxSupportedTransactionVersion: 0,
});

// get a specific transaction (allowing for v0 transactions)
const getTx = await connection.getTransaction(
  "3jpoANiFeVGisWRY5UP648xRXs3iQasCHABPWRWnoEjeA93nc79WrnGgpgazjq4K9m8g2NJoyKoWBV1Kx5VmtwHQ",
  {
    maxSupportedTransactionVersion: 0,
  }
);
```

### 向 RPC 发送 JSON 请求

使用标准 JSON 格式的 POST 请求, 在检索指定块时设置 `maxSupportedTransactionVersion`：

```bash
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d \
'{"jsonrpc": "2.0", "id":1, "method": "getBlock", "params": [430, {
  "encoding":"json",
  "maxSupportedTransactionVersion":0,
  "transactionDetails":"full",
  "rewards":false
}]}'
```

## 如何创建版本化交易

版本化交易的创建方式与创建交易的方法类似。需要注意的是，使用某些库时存在差异。

下面是如何使用 `@solana/web3.js` 库创建版本化交易, 然后在两个帐户之间执行 SOL 传输的示例。

**说明：**

- `payer`是有效的密钥对钱包，由 SOL 资助
- `toAccount` 一个有效的密钥对

**步骤：**

1. 导入 web3.js 库并创建与所需集群的连接 `connection`。

2. 定义交易和帐户所需的最近的 `blockhash` 和 `minRent`：

示例代码：

```js
// 引入solana web3.js的包
const web3 = require("@solana/web3.js");

// 链接RPC
const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
// 获取租金豁免的最小余额；也就是账户中最少存在多少sol，可以免除账户租金
let minRent = await connection.getMinimumBalanceForRentExemption(0);
// 获取最新的区块hash
let blockhash = await connection
  .getLatestBlockhash()
  .then((res) => res.blockhash);
```

3. 创建一个包含在交易中发送的所有指令 `instructions` 的数组。如下所示，创建一个简单的 SOL 传输指令：

   ```js
   // 创建 transfer 指令数组
   const instructions = [
     web3.SystemProgram.transfer({
       fromPubkey: payer.publicKey,
       toPubkey: toAccount.publicKey,
       lamports: minRent,
     }),
   ];
   ```

4. 使用所需的指令 `instruction` 构建 `MessageV0` 格式的交易消息

   ```js
   // 以 MessageVo 编译消息
   const messageV0 = new web3.TransactionMessage({
     payerKey: payer.publicKey,
     recentBlockhash: blockhash,
     instructions,
   }).compileToV0Message();
   ```

5. 创建一个新的 `VersionedTransaction`，传入 v0 兼容消息：

   ```js
   // 构造交易对象
   const transaction = new web3.VersionedTransaction(messageV0);

   // 使用payer签名交易
   transaction.sign([payer]);
   ```

   交易签名有两种方式：

   - 将签名 `signatures` 数组传递到 `VersionedTransaction` 方法中
   - 调用 `transaction.sign()` 方法，传递所需签名者 `Signers` 的数组

6. 向 RPC 提交交易

   ```js
   // 提交 VO 版本的交易
   const txId = await connection.sendTransaction(transaction);
   console.log(`https://explorer.solana.com/tx/${txId}?cluster=devnet`);
   ```

## 更多资源

- 使用 [地址查找表的版本化交易](./lookup-tables.md)
- 在 solana 浏览器查看 [ v0 交易的示例](https://explorer.solana.com/tx/h9WQsqSUYhFvrbJWKFPaXximJpLf6Z568NW1j6PBn3f7GPzQXe9PYMYbmWSUFHwgnUmycDNbEX9cr6WjUWkUFKx/?cluster=devnet)

- 阅读已接受的版本化交易和地址查找表 [提案](https://docs.solanalabs.com/proposals/versioned-transactions)
