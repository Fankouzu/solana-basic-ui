import { Keypair, SystemProgram, PublicKey, Connection } from "@solana/web3.js";
import { getLamports } from "./MinimumBalanceForRentExemption";
// 创建发送交易
export async function Transfer(
  connection: Connection,
  payer: Keypair,
  toPubkey: PublicKey,
  amount: number = 0
) {
  // 请求在链上分配“空间”字节数的成本（以lamports为单位）
  const lamports = await getLamports(connection);
  // 创建一个指令用于发送交易
  const transferToTestWalletIx = SystemProgram.transfer({
    // 要发送的数量，以lamports为单位，加上空间租用成本
    lamports: lamports + amount,
    // `fromPubkey` - 该帐户需要签署交易
    fromPubkey: payer.publicKey,
    // `toPubkey` - 不需要签署交易
    toPubkey: toPubkey,
    // 该帐户的owner程序id为系统程序id
    programId: SystemProgram.programId,
  });
  return transferToTestWalletIx;
}
