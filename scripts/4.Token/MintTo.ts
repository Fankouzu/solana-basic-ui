import { mintTo } from "@solana/spl-token";
import { Connection, PublicKey, Signer } from "@solana/web3.js";
import { explorerURL } from "../libs/helpers";
import { FgGreen, FgYellow } from "../libs/vars";
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
  console.log(FgGreen + "Minting some tokens to the ata...");
  const mintSig = await mintTo(
    connection, // 网络链接
    payer, // 支付账户
    mint, // token地址
    destination, // Ata地址
    authority, // 铸造权限
    amount // 数量
  );

  console.log(`${FgGreen}交易完成.`);
  console.log(FgYellow + explorerURL({ txSignature: mintSig }));
}
