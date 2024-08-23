import { Keypair } from "@solana/web3.js";
import { Log, FgRed } from "../libs/helpers";

// 幸运账号
const luckyStr = "Bm3"; // 自定义前缀
(async () => {
  let count = 0;
  let retry = 0;
  // 循环直到找到50个幸运账号
  while (count < 50) {
    // 随机Keypair
    let keypair = Keypair.generate();
    if (keypair.publicKey.toString().startsWith(luckyStr)) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      Log("publicKey 公钥/地址", keypair.publicKey.toBase58());
      Log("secretKey 私钥", keypair.secretKey);
      count++;
    } else {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`${FgRed}${keypair.publicKey.toString()}  ${retry}`);
      retry++;
    }
  }
})();
