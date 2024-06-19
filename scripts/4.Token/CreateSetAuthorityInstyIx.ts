import {
  AuthorityType,
  createSetAuthorityInstruction,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
// 设置权限
export function CreateSetAuthorityIx(
  account: PublicKey,
  currentAuthority: PublicKey,
  authorityType: AuthorityType,
  newAuthority: PublicKey | null
) {
  return createSetAuthorityInstruction(
    account, // mint账户地址
    currentAuthority, // 原权限地址
    authorityType, // 权限类型
    newAuthority // 新权限地址
  );
}
