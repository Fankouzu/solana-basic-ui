import { getMint } from "@solana/spl-token";
import { Log, connection, payer } from "../libs/helpers";
import { CreateMint } from "./CreateMint";
// 创建mint账户
(async () => {
  const mint = await CreateMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    2, // 小数点精度
    "Token"
  );
  // 获取铸造详情
  const mintInfo = await getMint(connection, mint);
  Log("mintInfo", mintInfo);
})();
