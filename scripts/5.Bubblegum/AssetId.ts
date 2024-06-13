import {
  findLeafAssetIdPda,
  parseLeafFromMintV1Transaction,
} from "@metaplex-foundation/mpl-bubblegum";
import { LoadPublicKey, LoadSignature, Log } from "../libs/vars";
import { initUmi } from "../libs/helpers";
import { publicKey } from "@metaplex-foundation/umi";

(async () => {
  // 初始化umi
  const { umi } = initUmi();
  // 读取交易签名
  let signature = LoadSignature("signature");
  // 读取保存的默克尔树地址
  let merkleTree = publicKey(LoadPublicKey("merkleTree"));
  // 从铸币交易中获取叶模式
  const leaf = await parseLeafFromMintV1Transaction(umi, signature);
  const assetId = findLeafAssetIdPda(umi, {
    merkleTree,
    leafIndex: leaf.nonce,
  });
  Log("assetId", assetId);
})();
