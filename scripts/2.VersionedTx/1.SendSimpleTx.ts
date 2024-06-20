import { Keypair, SystemProgram } from "@solana/web3.js";
import { connection, payer, Log } from "../libs/helpers";
import { CreateAccountIx } from "./CreateAccountIx";
import { CreateVersionedTx } from "./CreateVersionedTx";
import { SignTx } from "./SignTx";
import { SendVersionedTx } from "./SendVersionedTx";
// 创建账户Ix，签署交易，发送交易
(async () => {
  Log("Payer address", payer.publicKey.toBase58());
  // 随机计算一个地址的keypair
  let to = Keypair.generate();
  Log("to address", to.publicKey.toBase58());
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
