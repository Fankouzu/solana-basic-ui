import {
  Connection,
  Signer,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { FgGreen, FgYellow, FgRed } from "../libs/vars";
import {
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
    console.log(`${FgGreen}交易完成.`);
    console.log(FgYellow + explorerURL({ txSignature: sig }));
  } catch (err) {
    console.error(FgRed + "发送失败:");
    // 尝试从失败的交易中提取签名
    const failedSig = await extractSignatureFromFailedTransaction(
      connection,
      err
    );
    if (failedSig)
      console.log(
        `${FgRed}Failed signature: ${
          FgYellow + explorerURL({ txSignature: failedSig })
        }`
      );

    throw err;
  }
}
