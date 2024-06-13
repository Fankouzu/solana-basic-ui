import { mintTo } from "@solana/spl-token";
import { Connection, PublicKey, Signer } from "@solana/web3.js";
import { explorerURL, Log } from "../libs/helpers";
// 铸造Token
export async function MintTo(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  destination: PublicKey,
  authority: Signer | PublicKey,
  amount: number | bigint
) {
  // 铸造一些数量的Token到Ata账户
  const mintSig = await mintTo(
    connection, // 网络链接
    payer, // 支付账户
    mint, // token地址
    destination, // Ata地址
    authority, // 铸造权限
    amount // 数量
  );

  Log("交易完成", explorerURL({ txSignature: mintSig }));
}
