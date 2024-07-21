import { connection, payer, Log, LoadPublicKey } from "../libs/helpers";
import { Keypair } from "@solana/web3.js";
import { TransferToken } from "./TransferToken";
import { Ata } from "../3.WrapSOL/ATA";
import { getAccount } from "@solana/spl-token";
// 发送Token
(async () => {
  // 随机计算接收地址
  const toKeypair = Keypair.generate();
  Log("Payer address", payer.publicKey.toBase58());
  Log("To 公钥/地址", toKeypair.publicKey.toBase58());
  // 读取保存的Token地址
  let tokenMint = LoadPublicKey("Token");

  // 获取或创建From ATA
  const fromTokenAccount = await Ata(
    connection,
    payer,
    tokenMint,
    payer.publicKey
  );
  // 获取或创建To ATA
  const toTokenAccount = await Ata(
    connection,
    payer,
    tokenMint,
    toKeypair.publicKey
  );

  const fromBalanceBefore = await getAccount(connection, fromTokenAccount);
  const toBalanceBefore = await getAccount(connection, toTokenAccount);
  Log("from Balance before", fromBalanceBefore.amount);
  Log("to   Balance before", toBalanceBefore.amount);

  // 发送Token
  await TransferToken(
    connection,
    payer,
    fromTokenAccount,
    toTokenAccount,
    payer.publicKey,
    10
  );

  const fromBalanceAfter = await getAccount(connection, fromTokenAccount);
  const toBalanceAfter = await getAccount(connection, toTokenAccount);
  Log("from Balance after", fromBalanceAfter.amount);
  Log("to   Balance after", toBalanceAfter.amount);
})();
