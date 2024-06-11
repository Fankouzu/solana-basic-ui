import { Keypair, SystemProgram } from "@solana/web3.js";
import { connection, payer, FgGreen, FgYellow } from "../libs/vars";
import { CreateAccountIx } from "./CreateAccountIx";
import { CreateVersionedTx } from "./CreateVersionedTx";
import { SignTx } from "./SignTx";
import { SendVersionedTx } from "./SendVersionedTx";
// 创建账户Ix，签署交易，发送交易
(async () => {
  console.log(
    `${FgGreen}Payer address: ${FgYellow + payer.publicKey.toBase58()}`
  );
  // 随机计算一个地址的keypair
  let to = Keypair.generate();
  console.log(`${FgGreen}to address: ${FgYellow + to.publicKey.toBase58()}`);
  // 创建账户的指令IX
  let createAccountIx = await CreateAccountIx(
    payer,
    to.publicKey,
    connection,
    SystemProgram.programId
  );
  // 创建版本化交易
  const tx = await CreateVersionedTx(payer.publicKey, connection, [
    createAccountIx,
  ]);
  // 签署交易
  const signedTx = await SignTx([payer, to], tx);
  // 发送版本化交易
  await SendVersionedTx(signedTx);
})();
