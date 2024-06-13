import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { initUmi, savePublicKeyToFile, Log, txExplorer } from "../libs/helpers";
import { createNft } from "@metaplex-foundation/mpl-token-metadata";

(async () => {
  // 初始化umi
  const { umi } = initUmi();
  // 随机创建collection mint账户keypair
  const collectionMint = generateSigner(umi);
  Log("Collection Mint address", collectionMint.publicKey);
  // 创建collection
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
  // 保存collection mint地址
  savePublicKeyToFile("collectionMint", collectionMint.publicKey);
})();
