import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  TransactionInstruction,
  Connection,
} from "@solana/web3.js";
import { FgGreen, FgYellow } from "../libs/vars";
// 创建版本化交易
export async function CreateVersionedTx(
  payerKey: PublicKey, // 支付账户的公钥
  connection: Connection, // 链接
  txs: TransactionInstruction[] // 交易的指令数组
): Promise<VersionedTransaction> { // 返回版本化交易
  // 获取最后的区块hash
  let recentBlockhash = await connection
    .getLatestBlockhash()
    .then((res) => res.blockhash);

  // 创建消息 (v0)
  const message = new TransactionMessage({
    payerKey: payerKey,
    recentBlockhash,
    instructions: txs,
  }).compileToV0Message();

  // 用消息创建版本化交易
  const tx = new VersionedTransaction(message);
  console.log(`${FgGreen}tx.version: ${FgYellow + tx.version}`);
  return tx;
}
