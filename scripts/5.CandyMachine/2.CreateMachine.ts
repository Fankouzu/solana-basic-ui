import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { create } from "@metaplex-foundation/mpl-candy-machine";
import {
  generateSigner,
  percentAmount,
  publicKey,
  some,
} from "@metaplex-foundation/umi";
import {
  initUmi,
  savePublicKeyToFile,
  Log,
  txExplorer,
  LoadPublicKey,
} from "../libs/helpers";

(async () => {
  // 初始化umi
  const { umi, signer } = initUmi();
  // 读取collection mint地址
  const collectionMint = publicKey(LoadPublicKey("collectionMint"));

  const candyMachine = generateSigner(umi);
  Log("candyMachine address", candyMachine.publicKey);

  (
    await create(umi, {
      candyMachine,
      collectionMint: collectionMint,
      collectionUpdateAuthority: signer,
      tokenStandard: TokenStandard.NonFungible,
      sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
      itemsAvailable: 10,
      creators: [
        {
          address: signer.publicKey,
          verified: true,
          percentageShare: 100,
        },
      ],
      configLineSettings: some({
        prefixName: "My New NFT #$ID+1$",
        nameLength: 0,
        prefixUri: "https://arweave.net/",
        uriLength: 43,
        isSequential: false,
      }),
    })
  )
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
  // 保存candyMachine地址
  savePublicKeyToFile("candyMachine", candyMachine.publicKey);
})();
