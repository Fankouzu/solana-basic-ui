import { connection, payer, FgGreen, FgYellow, TokenMint } from "../libs/vars";
import { Ata } from "../3.WrapSOL/ATA";
import { Burn } from "./Burn";
// 演示如何在现有 SPL 代币铸币厂中创建新的 SPL 代币（又名'铸造代币'）
(async () => {
  console.log(
    `${FgGreen}Payer address: ${FgYellow + payer.publicKey.toBase58()}`
  );
  // 读取保存的Token地址
  let tokenMint = TokenMint("Token");
  // Ata地址
  const associatedTokenAccount = await Ata(
    connection,
    payer,
    tokenMint,
    payer.publicKey
  );
  // 2位精度，10.00个
  const amountOfTokensToBurn = 1_000;
  // 销毁方法
  await Burn(
    connection,
    payer,
    associatedTokenAccount,
    tokenMint,
    payer,
    amountOfTokensToBurn
  );
})();
