import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { Log, initUmi, txExplorer } from "../libs/helpers";
import {
  TokenStandard,
  createAndMint,
} from "@metaplex-foundation/mpl-token-metadata";

(async () => {
  // 初始化umi
  const { umi } = initUmi();

  const mint = generateSigner(umi);
  Log("initializeFromMint Mint address", mint.publicKey);

  await createAndMint(umi, {
    mint,
    name: "Master Cui NFT",
    uri: "https://arweave.net/4bk4Tq5j8NWZmSD50G4h-d4Lsq5LOdXa7NKDYMOrGFY",
    sellerFeeBasisPoints: percentAmount(5.5),
    tokenStandard: TokenStandard.NonFungible,
  })
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
})();
