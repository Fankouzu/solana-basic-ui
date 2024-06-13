import { createTree } from "@metaplex-foundation/mpl-bubblegum";
import { Log, txExplorer } from "../libs/vars";
import { generateSigner } from "@metaplex-foundation/umi";
import { initUmi, savePublicKeyToFile } from "../libs/helpers";

(async () => {
  // 初始化umi
  const { umi } = initUmi();
  // 随机创建默克尔树账户的keypair
  const merkleTree = generateSigner(umi);
  Log("merkleTree address", merkleTree.publicKey);
  // 创建默克尔树账户
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
  // 保存默克尔树地址
  savePublicKeyToFile("merkleTree", merkleTree.publicKey);
})();
