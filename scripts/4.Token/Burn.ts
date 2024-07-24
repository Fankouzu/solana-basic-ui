import { burn } from "@solana/spl-token";
import { Connection, PublicKey, Signer } from "@solana/web3.js";
import { explorerURL,Log } from "../libs/helpers";
// 销毁Token
export async function Burn(
  connection: Connection,
  payer: Signer,
  account: PublicKey,
  mint: PublicKey,
  owner: Signer | PublicKey,
  amount: number | bigint
) {
  const mintSig = await burn(
    connection, // 网络链接
    payer, // 支付账户
    account, // Ata地址
    mint, // token地址
    owner, // 铸造权限
    amount // 数量
  );

  Log("交易完成", explorerURL({ txSignature: mintSig }));
}
