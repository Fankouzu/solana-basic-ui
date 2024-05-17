# 创建随机的Keypair密钥对

通过```Keypair.generate()```函数创建随机的密钥对，用在solana开发脚本中

## 代码
```js
import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
// 随机创建Keypair
let keypair = Keypair.generate();
console.log(`publicKey 公钥/地址: ${keypair.publicKey.toBase58()}`);
console.log(`secretKey 私钥: [${keypair.secretKey}]`);
console.log(`secretKey 私钥-Base58: ${base58.encode(keypair.secretKey)}`);
```

## 视频

<iframe width="560" height="315" src="https://www.youtube.com/embed/hrlRwnuDa4I" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
