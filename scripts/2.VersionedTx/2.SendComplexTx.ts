import { Keypair, SystemProgram } from "@solana/web3.js";
import { payer, connection, STATIC_PUBLICKEY, Log } from "../libs/helpers";
import { CreateAccountIx } from "./CreateAccountIx";
import { Transfer } from "./Transfer";
import { CreateVersionedTx } from "./CreateVersionedTx";
import { SignTx } from "./SignTx";
import { SendVersionedTx } from "./SendVersionedTx";
// 创建账户Ix，两个发送交易
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
  // 创建发送SOL的指令，发送到to地址2000lamport
  let transfer_1 = await Transfer(connection, payer, to.publicKey, 2_000);
  // 创建发送SOL的指令，发送到STATIC_PUBLICKEY地址1000000lamport
  let transfer_2 = await Transfer(
    connection,
    payer,
    STATIC_PUBLICKEY,
    1_000_000
  );
  // 将三个指令IX打包创建版本化交易
  const tx = await CreateVersionedTx(payer.publicKey, connection, [
    createAccountIx,
    transfer_1,
    transfer_2,
  ]);
  // 计算交易费
  const fees = await connection.getFeeForMessage(tx.message);
  console.log(`Estimated SOL transfer cost: ${fees.value} lamports`);
  // 使用支付账户和to账户签名交易
  const signedTx = await SignTx([payer, to], tx);
  // 发送版本化交易
  await SendVersionedTx(signedTx);
})();
