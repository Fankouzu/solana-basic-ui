import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createTree, mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import { CLUSTER_URL, FgGreen, FgYellow, txExplorer } from "../libs/vars";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { umiPayer } from "../libs/helpers";

(async () => {
  const umi = createUmi(CLUSTER_URL);
  const signer = createSignerFromKeypair(umi, umiPayer);
  umi.use(signerIdentity(signer, true));
  umi.use(mplBubblegum());

  const merkleTree = generateSigner(umi);
  console.log(
    `${FgGreen}merkleTree address: ${FgYellow + merkleTree.publicKey}`
  );
  (
    await createTree(umi, {
      merkleTree,
      maxDepth: 5,
      maxBufferSize: 8,
    })
  )
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
})();
