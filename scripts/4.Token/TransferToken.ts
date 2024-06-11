import { transfer } from "@solana/spl-token";
import { Connection, PublicKey, Signer } from "@solana/web3.js";
import { explorerURL } from "../libs/helpers";
import { FgGreen, FgYellow } from "../libs/vars";
// 发送Token
export async function TransferToken(
  connection: Connection,
  payer: Signer,
  source: PublicKey,
  destination: PublicKey,
  owner: Signer | PublicKey,
  amount: number | bigint
) {
  const signature = await transfer(
    connection, // 链接
    payer, // 支付账户
    source, // 发送源的ATA账户地址
    destination, // 接收账户的ATA地址
    owner, // Token的拥有者地址
    amount // 发送数量
  );
  console.log(`${FgGreen}交易完成.`);
  console.log(FgYellow + explorerURL({ txSignature: signature }));
}
