import { closeAccount } from "@solana/spl-token";
import { Connection, PublicKey, Signer } from "@solana/web3.js";
import { FgGreen, FgYellow } from "../libs/vars";
// 关闭账户
export async function CloseAccount(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  destination: PublicKey,
  authority: Signer | PublicKey
) {
  // 获取余额
  const walletBalance = await connection.getBalance(payer.publicKey);
  console.log(
    `${FgGreen}Balance before unwrapping 1 WSOL: ${FgYellow + walletBalance}`
  );
  // 关闭账户
  await closeAccount(
    connection, // 链接
    payer, // 支付账户
    account, // 账户地址
    destination, // 接收已关闭账户剩余余额的账户
    authority // 有权关闭账户的权限
  );
  // 获取新余额
  const walletBalancePostClose = await connection.getBalance(payer.publicKey);
  console.log(
    `${FgGreen}Balance after unwrapping 1 WSOL: ${
      FgYellow + walletBalancePostClose
    }`
  );
}
