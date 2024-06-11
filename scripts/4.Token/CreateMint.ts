import { createMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, Signer } from "@solana/web3.js";
import { savePublicKeyToFile } from "../libs/helpers";
import { FgGreen, FgYellow } from "../libs/vars";
// 创建mint账户
export async function CreateMint(
  connection: Connection,
  payer: Signer,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  decimals: number,
  symble: string,
  keypair = Keypair.generate(),
  programId = TOKEN_PROGRAM_ID
) {
  // 随机创建密钥对用作mint账户
  const mintKeypair = keypair || Keypair.generate();
  // 创建mint账户
  const mint = await createMint(
    connection, // 链接
    payer, // 支付账户
    mintAuthority, // 铸造账户地址
    freezeAuthority, // 冻结账户地址
    decimals, // 小数点精度
    mintKeypair, // 可选密钥对，默认为新的随机密钥对
    undefined, // 确认交易的选项
    programId // SPL Token程序账户
  );
  console.log(`${FgGreen}Mint地址： ${FgYellow + mint.toBase58()}`);
  // 保存Token账户地址
  savePublicKeyToFile(symble, mint);
  return mint;
}
