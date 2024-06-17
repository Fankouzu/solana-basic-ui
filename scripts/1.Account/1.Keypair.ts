import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import { Log } from "../libs/helpers";

// 创建Keypair
(async () => {
  // 随机创建Keypair
  let keypair = Keypair.generate();
  Log("publicKey 公钥/地址", keypair.publicKey.toBase58());
  Log("secretKey 私钥", keypair.secretKey);
  Log("secretKey 私钥-Base58", base58.encode(keypair.secretKey));
})();
