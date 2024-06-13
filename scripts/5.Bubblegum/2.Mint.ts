import { mintV1 } from "@metaplex-foundation/mpl-bubblegum";
import { LoadPublicKey, txExplorer } from "../libs/vars";
import { none, publicKey } from "@metaplex-foundation/umi";
import { initUmi, saveSignatureToFile } from "../libs/helpers";

(async () => {
  // 初始化umi
  const { umi, signer } = initUmi();
  // 叶子所有者
  const leafOwner = signer.publicKey;
  // 读取保存的默克尔树地址
  let merkleTree = publicKey(LoadPublicKey("merkleTree"));
  // 铸造
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
      saveSignatureToFile("signature", signature);
    });
})();
