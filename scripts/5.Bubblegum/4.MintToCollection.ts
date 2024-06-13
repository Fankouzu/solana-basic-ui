import { LoadPublicKey, txExplorer } from "../libs/vars";
import { initUmi } from "../libs/helpers";
import { mintToCollectionV1 } from "@metaplex-foundation/mpl-bubblegum";
import { publicKey } from "@metaplex-foundation/umi";

(async () => {
  // 初始化umi
  const { umi, signer } = initUmi();
  // 叶子所有者
  const leafOwner = signer.publicKey;
  // 读取保存的默克尔树地址
  const merkleTree = publicKey(LoadPublicKey("merkleTree"));
  // 读取collection mint地址
  const collectionMint = publicKey(LoadPublicKey("collectionMint"));
  // 铸造到collection
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
