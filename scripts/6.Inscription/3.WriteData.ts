import { TransactionBuilder, publicKey } from "@metaplex-foundation/umi";
import { initUmi, txExplorer } from "../libs/helpers";
import {
  findInscriptionMetadataPda,
  findMintInscriptionPda,
  writeData,
} from "@metaplex-foundation/mpl-inscription";

(async () => {
  // 初始化umi
  const { umi, signer } = initUmi();
  const mint = publicKey("HGyVFG4gysVXC85gNskCpNUCS21G3TAd4G5Wvx6Shuau");

  const inscriptionAccount = findMintInscriptionPda(umi, {
    mint: mint,
  });

  const inscriptionMetadataAccount = await findInscriptionMetadataPda(umi, {
    inscriptionAccount: inscriptionAccount[0],
  });

  let builder = new TransactionBuilder();

  builder = builder.add(
    writeData(umi, {
      inscriptionAccount: inscriptionAccount[0],
      inscriptionMetadataAccount: inscriptionMetadataAccount,
      authority: signer,
      value: Buffer.from(
        '{"description": "A bread! But on-chain!", "external_url": "https://breadheads.io"}'
      ),
      associatedTag: null,
      offset: 0,
    })
  );

  await builder
    .sendAndConfirm(umi, { confirm: { commitment: "finalized" } })
    .then(({ signature }) => {
      txExplorer(signature);
    });
})();
