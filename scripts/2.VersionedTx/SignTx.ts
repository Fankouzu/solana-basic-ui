import { Signer, VersionedTransaction } from "@solana/web3.js";
import { Log } from "../libs/helpers";
// 签署交易
export async function SignTx(
  signers: Signer[], // 签名人的keypair数组
  tx: VersionedTransaction // 版本化交易
): Promise<VersionedTransaction> {
  // 返回版本化交易
  // 使用我们所需的签名者（例如'Payer'和'keypair'）签署交易
  tx.sign(signers);
  Log("签名", tx.signatures);
  return tx;
}
