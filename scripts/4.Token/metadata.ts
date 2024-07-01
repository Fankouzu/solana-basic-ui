import { Keypair, SystemProgram } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddressSync,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";
import { connection, payer, Log } from "../libs/helpers";
import { SendAndConfirmTx } from "../3.WrapSOL/SendAndConfirmTx";
import { AddTransaction } from "../3.WrapSOL/AddTransaction";

(async () => {
  Log("Payer address", payer.publicKey.toBase58());
  
  const mint = Keypair.generate();
  Log("mint address", mint.publicKey.toBase58());

  const decimals = 9;

  // Ata地址
  const associatedToken = getAssociatedTokenAddressSync(
    mint.publicKey,
    payer.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const amountOfTokensToMint = 1_000_000_000_000_000;

  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    name: "TOKEN_NAME",
    symbol: "SMBL",
    uri: "URI",
    additionalMetadata: [["new-field", "new-value"]],
  };

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

  const mintLamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen
  );

  const mintTransaction = AddTransaction(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint.publicKey,
      space: mintLen,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMetadataPointerInstruction(
      mint.publicKey,
      payer.publicKey,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeMintInstruction(
      mint.publicKey,
      decimals,
      payer.publicKey,
      null,
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      mint: mint.publicKey,
      metadata: mint.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: payer.publicKey,
      updateAuthority: payer.publicKey,
    }),
    createAssociatedTokenAccountIdempotentInstruction(
      payer.publicKey,
      associatedToken,
      payer.publicKey,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    ),
    createMintToInstruction(
      mint.publicKey,
      associatedToken,
      payer.publicKey,
      amountOfTokensToMint,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )
  );
  await SendAndConfirmTx(connection, mintTransaction, [payer, mint]);
})();
