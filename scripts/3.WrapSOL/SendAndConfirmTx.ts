import {
  Connection,
  Signer,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  Log,
  FgRed,
  explorerURL,
  extractSignatureFromFailedTransaction,
  printConsoleSeparator,
} from "../libs/helpers";
// 发送并确认交易
export async function SendAndConfirmTx(
  connection: Connection,
  transaction: Transaction,
  signers: Signer[]
) {
  printConsoleSeparator();
  try {
    // 实际发送交易
    const sig = await sendAndConfirmTransaction(
      connection,
      transaction,
      signers
    );
    // 输出浏览器链接
    Log("交易完成", explorerURL({ txSignature: sig }));
  } catch (err) {
    console.error(FgRed + "发送失败:");
    // 尝试从失败的交易中提取签名
    const failedSig = await extractSignatureFromFailedTransaction(
      connection,
      err
    );
    if (failedSig)
      Log("Failed signature", explorerURL({ txSignature: failedSig }));

    throw err;
  }
}
