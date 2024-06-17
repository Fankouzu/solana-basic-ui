import {
  addConfigLines,
  fetchCandyMachine,
  mintV2,
} from "@metaplex-foundation/mpl-candy-machine";
import {
  generateSigner,
  publicKey,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { initUmi, txExplorer, LoadPublicKey } from "../libs/helpers";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";

(async () => {
  // 初始化umi
  const { umi, signer } = initUmi();
  // 读取candyMachine地址
  const candyMachineAddress = publicKey(LoadPublicKey("candyMachine"));
  // 获取糖果机
  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
  // 读取collection mint地址
  const collectionMint = publicKey(LoadPublicKey("collectionMint"));
  // 随机计算NFT item地址
  const nftMint = generateSigner(umi);
  // 铸造
  await transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: 800_000 }))
    .add(
      mintV2(umi, {
        candyMachine: candyMachine.publicKey,
        nftMint,
        collectionMint: collectionMint,
        collectionUpdateAuthority: signer.publicKey,
        tokenStandard: candyMachine.tokenStandard,
      })
    )
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
})();
