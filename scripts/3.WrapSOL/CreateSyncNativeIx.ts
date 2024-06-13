import {
  TOKEN_PROGRAM_ID,
  createSyncNativeInstruction,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
// 构造 SyncNative 指令
export function CreateSyncNativeIx(
  account: PublicKey,
  programId = TOKEN_PROGRAM_ID
) {
  return createSyncNativeInstruction(
    account, // 用于同步 lampport 的本地帐户
    programId // SPL Token 程序账户
  );
}
