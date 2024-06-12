import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { CLUSTER_URL, FgGreen, FgYellow, txExplorer } from "../libs/vars";
import {
  createSignerFromKeypair,
  generateSigner,
  percentAmount,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { umiPayer } from "../libs/helpers";
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

(async () => {
  const umi = createUmi(CLUSTER_URL);
  const signer = createSignerFromKeypair(umi, umiPayer);
  umi.use(signerIdentity(signer, true));
  umi.use(mplTokenMetadata());

  const collectionMint = generateSigner(umi);
  console.log(
    `${FgGreen}Collection Mint address: ${FgYellow + collectionMint.publicKey}`
  );

  await createNft(umi, {
    mint: collectionMint,
    name: "My Collection",
    uri: "https://example.com/my-collection.json",
    sellerFeeBasisPoints: percentAmount(5.5), // 5.5%
    isCollection: true,
  })
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
})();
