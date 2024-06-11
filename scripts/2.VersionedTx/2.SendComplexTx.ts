import { Keypair, SystemProgram } from "@solana/web3.js";
import {
  payer,
  connection,
  STATIC_PUBLICKEY,
  FgGreen,
  FgYellow,
} from "../libs/vars";
import { CreateAccountIx } from "./CreateAccountIx";
import { Transfer } from "./Transfer";
import { CreateVersionedTx } from "./CreateVersionedTx";
import { SignTx } from "./SignTx";
import { SendVersionedTx } from "./SendVersionedTx";
// 创建账户Ix，两个发送交易
(async () => {
  console.log(
    `${FgGreen}Payer address: ${FgYellow + payer.publicKey.toBase58()}`
  );
  let to = Keypair.generate();
  console.log(`${FgGreen}to address: ${FgYellow + to.publicKey.toBase58()}`);
  let createAccountIx = await CreateAccountIx(
    payer,
    to.publicKey,
    connection,
    SystemProgram.programId
  );

  let transfer_1 = await Transfer(connection, payer, to.publicKey, 2_000);
  let transfer_2 = await Transfer(
    connection,
    payer,
    STATIC_PUBLICKEY,
    1_000_000
  );
  const tx = await CreateVersionedTx(payer.publicKey, connection, [
    createAccountIx,
    transfer_1,
    transfer_2,
  ]);
  const signedTx = await SignTx([payer, to], tx);

  await SendVersionedTx(signedTx);
})();
