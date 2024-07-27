import { TransactionBuilder, publicKey } from "@metaplex-foundation/umi";
import { initUmi, txExplorer } from "../libs/helpers";
import {
  findAssociatedInscriptionPda,
  findInscriptionMetadataPda,
  findMintInscriptionPda,
  initializeAssociatedInscription,
  initializeFromMint,
  writeData,
} from "@metaplex-foundation/mpl-inscription";
import fs from "fs";

(async () => {
  // 初始化umi
  const { umi, signer } = initUmi();

  const mint = publicKey("4fBzrPVMh4z6dkXXEtEDNrX6LbgD8xkxssLtpZKNry22");

  const inscriptionAccount = findMintInscriptionPda(umi, {
    mint: mint,
  });

  const inscriptionMetadataAccount = await findInscriptionMetadataPda(umi, {
    inscriptionAccount: inscriptionAccount[0],
  });

  let builder = new TransactionBuilder();

  builder = builder.add(
    initializeFromMint(umi, {
      mintAccount: mint,
    })
  );

  builder = builder.add(
    writeData(umi, {
      inscriptionAccount: inscriptionAccount[0],
      inscriptionMetadataAccount,
      value: Buffer.from(
        '{"p":"spl-20","op":"deploy","tick":"acbl","max":"21000000","lim":"1000"}'
      ),
      associatedTag: null,
      offset: 0,
    })
  );

  const associatedInscriptionAccount = findAssociatedInscriptionPda(umi, {
    associated_tag: "image",
    inscriptionMetadataAccount,
  });

  builder = builder.add(
    initializeAssociatedInscription(umi, {
      inscriptionAccount,
      inscriptionMetadataAccount,
      associatedInscriptionAccount,
      associationTag: "image",
    })
  );

  await builder
    .sendAndConfirm(umi, { confirm: { commitment: "finalized" } })
    .then(({ signature }) => {
      txExplorer(signature);
    });

  // Open the image file to fetch the raw bytes.
  const imageBytes: Buffer = await fs.promises.readFile(
    "./6.Inscription/nft.png"
  );

  // And write the image.
  const chunkSize = 800;
  for (let i = 0; i < imageBytes.length; i += chunkSize) {
    const chunk = imageBytes.slice(i, i + chunkSize);
    await writeData(umi, {
      inscriptionAccount: associatedInscriptionAccount,
      inscriptionMetadataAccount,
      value: chunk,
      associatedTag: "image",
      offset: i,
    })
      .sendAndConfirm(umi)
      .then(({ signature }) => {
        txExplorer(signature);
      });
  }
})();
