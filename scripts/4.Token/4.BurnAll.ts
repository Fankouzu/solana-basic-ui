import { connection, payer, FgGreen, FgYellow, TokenMint } from "../libs/vars";
import { getAccount } from "@solana/spl-token";
import { Ata } from "../3.WrapSOL/ATA";
import { CloseAccount } from "../3.WrapSOL/CloseAccount";
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
  const balance = await getAccount(connection, associatedTokenAccount);
  console.log(`${FgGreen}Token Balance: ${FgYellow + balance.amount}`);
  // 销毁方法
  await Burn(
    connection,
    payer,
    associatedTokenAccount,
    tokenMint,
    payer,
    balance.amount
  );
  // 关闭账户，回收SOL
  await CloseAccount(
    connection,
    payer,
    associatedTokenAccount,
    payer.publicKey,
    payer
  );
})();
