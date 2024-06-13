import { fetchTreeConfigFromSeeds } from "@metaplex-foundation/mpl-bubblegum";
import { LoadPublicKey, Log } from "../libs/vars";
import { initUmi } from "../libs/helpers";
import { fetchMerkleTree } from "@metaplex-foundation/mpl-bubblegum";
import { publicKey } from "@metaplex-foundation/umi";

(async () => {
  // 初始化umi
  const { umi } = initUmi();
  // 读取保存的默克尔树地址
  let merkleTree = publicKey(LoadPublicKey("merkleTree"));
  // 获取默克尔树
  const merkleTreeAccount = await fetchMerkleTree(umi, merkleTree);
  Log("merkleTreeAccount", merkleTreeAccount);
  // 获取树配置
  const treeConfig = await fetchTreeConfigFromSeeds(umi, { merkleTree });
  Log("treeConfig", treeConfig);
})();
