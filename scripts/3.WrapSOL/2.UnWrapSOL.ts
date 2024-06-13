import { NATIVE_MINT } from "@solana/spl-token";
import { connection, payer } from "../libs/helpers";
import { Ata } from "./ATA";
import { CloseAccount } from "./CloseAccount";
// 包装SOL
(async () => {
  // 查找用来保存你的wrapped SOL的Ata账户
  const associatedTokenAccount = await Ata(
    connection,
    payer,
    NATIVE_MINT,
    payer.publicKey
  );
  // 关闭账户，回收SOL
  await CloseAccount(
    connection,
    payer,
    associatedTokenAccount,
    payer.publicKey,
    payer
  );
})();
