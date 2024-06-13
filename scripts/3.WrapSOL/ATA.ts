import {
  PublicKey,
  Connection,
  Signer,
  Commitment,
  ConfirmOptions,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { Log } from "../libs/helpers";

/**
 * SPL 代币是使用一种特殊关系来拥有的，
 * 其中实际代币由不同的帐户存储/拥有，
 * 然后由用户的钱包/帐户拥有。
 * 这个特殊帐户称为'关联代币帐户'（或简称'ata'）
 * 它是这样的：
 * Token存储在每个Token账户的ata中，然后ata由用户的钱包拥有
 */
// 获取或创建关联的令牌帐户
export async function Ata(
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: PublicKey,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
) {
  const allowOwnerOffCurve = false;
  const commitment: Commitment = "processed";
  const confirmOptions: ConfirmOptions = {};
  // 获取或者创建ATA
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection, // 链接
    payer, // 支付账户Keypair
    mint, // mint账户公钥
    owner, // ATA账户的所有者
    allowOwnerOffCurve, // 允许所有者帐户成为 PDA（程序派生地址）
    commitment, // 查询状态所需的承诺级别
    confirmOptions, // 确认交易的选项
    programId, // SPL Token 计划账户
    associatedTokenProgramId // 关联Token程序账户
  ).then((ata) => ata.address);
  Log("Ata address", tokenAccount);
  return tokenAccount;
}
