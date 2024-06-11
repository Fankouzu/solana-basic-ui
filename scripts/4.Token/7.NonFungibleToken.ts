import { AuthorityType, getAccount, getMint } from "@solana/spl-token";
import { connection, payer, FgGreen, FgYellow } from "../libs/vars";
import { Ata } from "../3.WrapSOL/ATA";
import { AddTransaction } from "../3.WrapSOL/AddTransaction";
import { SendAndConfirmTx } from "../3.WrapSOL/SendAndConfirmTx";
import { CreateSetAuthorityIx } from "./CreateSetAuthorityInstyIx";
import { CreateMint } from "./CreateMint";
import { MintTo } from "./MintTo";
// 创建NFT
(async () => {
  // 创建Token，精度为0
  const tokenMint = await CreateMint(
    connection, // 链接
    payer, // 支付账户
    payer.publicKey, // 铸造权限
    payer.publicKey, // 冻结权限
    0, // NFT的小数点精度为0
    "NFT" // NFT的symbol
  );
  // 创建ATA账户
  const associatedTokenAccount = await Ata(
    connection,
    payer,
    tokenMint,
    payer.publicKey
  );
  // 向ATA账户铸造1个Token
  await MintTo(
    connection,  // 链接
    payer,  // 支付账户
    tokenMint, // mint账户
    associatedTokenAccount, // ATA账户
    payer, // 铸造权限
    1 // 数量为1
  );
  // 创建设置权限为空的指令交易
  let tx = AddTransaction(
    CreateSetAuthorityIx(
      tokenMint,
      payer.publicKey,
      AuthorityType.MintTokens,
      null
    )
  );
  // 发送交易
  await SendAndConfirmTx(connection, tx, [payer]);
  // 获取账户信息
  const accountInfo = await getAccount(connection, associatedTokenAccount);
  console.log(`${FgGreen}账户余额： ${FgYellow + accountInfo.amount}`);
  const mintInfo = await getMint(connection, tokenMint);
  console.log(`${FgGreen}NFT信息：`, mintInfo);
})();
