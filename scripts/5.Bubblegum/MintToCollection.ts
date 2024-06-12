import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { CLUSTER_URL, txExplorer } from "../libs/vars";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { umiPayer } from "../libs/helpers";
import {
  mintToCollectionV1,
  mplBubblegum,
} from "@metaplex-foundation/mpl-bubblegum";

(async () => {
  const umi = createUmi(CLUSTER_URL);
  const signer = createSignerFromKeypair(umi, umiPayer);
  umi.use(signerIdentity(signer, true));
  umi.use(mplBubblegum());

  const leafOwner = signer.publicKey;
  const merkleTree = publicKey("CK7ULz818gi974avXxxDLbpkCK85kGw5JHUSNTQYaW4m");
  const collectionMint = publicKey(
    "9312zbW5LFe12RA5U5kCvfG7bsjwM4RBz5ZXH52qywi6"
  );

  await mintToCollectionV1(umi, {
    leafOwner,
    merkleTree,
    collectionMint,
    metadata: {
      name: "My Compressed NFT",
      uri: "https://example.com/my-cnft.json",
      sellerFeeBasisPoints: 500, // 5%
      collection: { key: collectionMint, verified: false },
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
