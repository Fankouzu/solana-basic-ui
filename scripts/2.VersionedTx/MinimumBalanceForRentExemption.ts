import { Connection } from "@solana/web3.js";
import { Log } from "../libs/helpers";
// 获取最小租金豁免数额
export async function getLamports(connection: Connection, space: number = 0) {
  // 请求在链上分配“空间”字节数的成本（以lamports为单位）
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  Log("共需要lamports", lamports);
  return lamports;
}
