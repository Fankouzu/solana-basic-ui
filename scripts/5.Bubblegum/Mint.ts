import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  LeafSchema,
  findLeafAssetIdPda,
  mintV1,
  mplBubblegum,
  parseLeafFromMintV1Transaction,
} from "@metaplex-foundation/mpl-bubblegum";
import { CLUSTER_URL, txExplorer } from "../libs/vars";
import {
  createSignerFromKeypair,
  none,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { umiPayer } from "../libs/helpers";

(async () => {
  const umi = createUmi(CLUSTER_URL);
  const signer = createSignerFromKeypair(umi, umiPayer);
  umi.use(signerIdentity(signer, true));
  umi.use(mplBubblegum());

  const leafOwner = signer.publicKey;
  const merkleTree = publicKey("CK7ULz818gi974avXxxDLbpkCK85kGw5JHUSNTQYaW4m");

  await mintV1(umi, {
    leafOwner,
    merkleTree,
    metadata: {
      name: "My Compressed NFT",
      uri: "https://example.com/my-cnft.json",
      sellerFeeBasisPoints: 500, // 5%
      collection: none(),
      creators: [
        { address: umi.identity.publicKey, verified: false, share: 100 },
      ],
    },
  })
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
})();
