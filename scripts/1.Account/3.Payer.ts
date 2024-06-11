import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { connection, FgGreen, FgYellow } from "../libs/vars";
import { loadOrGenerateKeypair } from "../libs/helpers";
import base58 from "bs58";
// 生成后面教程所需的支付账号Payer
(async () => {
  // 如果存在.local_keys/Payer.json则读取保存的账号，否则生成新账号，并保存json文件
  let payer = loadOrGenerateKeypair("Payer");
  console.log(
    `${FgGreen}publicKey 公钥/地址: ${FgYellow + payer.publicKey.toBase58()}`
  );
  console.log(`${FgGreen}secretKey 私钥: ${FgYellow}[${payer.secretKey}]`);
  console.log(
    `${FgGreen}secretKey 私钥-Base58: ${
      FgYellow + base58.encode(payer.secretKey)
    }`
  );
  // 查询余额
  const currentBalance = await connection.getBalance(payer.publicKey);
  console.log(
    `${FgGreen}Payer当前余额 (in lamports): ${FgYellow + currentBalance}`
  );
  console.log(
    `${FgGreen}Payer当前余额 (in SOL): ${
      FgYellow + currentBalance / LAMPORTS_PER_SOL
    }`
  );
  // 如果少于1sol，请求空投
  if (currentBalance <= LAMPORTS_PER_SOL) {
    console.log("请求空投...");
    await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);
  }
})();
