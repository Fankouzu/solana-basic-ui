import { VersionedTransaction } from "@solana/web3.js";
import { connection, FgGreen, FgYellow, FgRed } from "../libs/vars";
import {
  explorerURL,
  extractSignatureFromFailedTransaction,
  printConsoleSeparator,
} from "../libs/helpers";
// 发送交易
export async function SendVersionedTx(
  tx: VersionedTransaction // 版本化交易
) {
  printConsoleSeparator();
  try {
    // 实际发送交易
    const sig = await connection.sendTransaction(tx);
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
