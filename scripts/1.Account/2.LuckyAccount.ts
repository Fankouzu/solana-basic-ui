import { Keypair } from "@solana/web3.js";
import { FgGreen, FgRed, FgYellow } from "../libs/vars";

// 幸运账号
const luckyStr = "Cui"; // 自定义前缀
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
      console.log(
        `${FgGreen}Found 公钥/地址: ${FgYellow + keypair.publicKey.toBase58()}`
      );
      console.log(`${FgGreen}Found 私钥: ${FgYellow}[${keypair.secretKey}]`);
      count++;
    } else {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`${FgRed}${keypair.publicKey.toString()}  ${retry}`);
      retry++;
    }
  }
})();
