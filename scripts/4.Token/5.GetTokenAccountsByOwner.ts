import { connection, payer, Log } from "../libs/helpers";
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
// 查询账户下所有Token
(async () => {
  const tokenAccounts = await connection.getTokenAccountsByOwner(
    payer.publicKey,
    {
      programId: TOKEN_PROGRAM_ID,
    }
  );

  console.log("Token                                          Balance");
  console.log("------------------------------------------------------------");
  tokenAccounts.value.forEach((tokenAccount) => {
    const accountData = AccountLayout.decode(tokenAccount.account.data);
    Log(new PublicKey(accountData.mint).toString(), accountData.amount);
  });
})();
