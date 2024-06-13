import {
  addConfigLines,
  fetchCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { publicKey } from "@metaplex-foundation/umi";
import { initUmi, txExplorer, LoadPublicKey } from "../libs/helpers";

(async () => {
  // 初始化umi
  const { umi } = initUmi();
  // 读取candyMachine地址
  const candyMachineAddress = publicKey(LoadPublicKey("candyMachine"));

  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
  await addConfigLines(umi, {
    candyMachine: candyMachine.publicKey,
    index: candyMachine.itemsLoaded,
    configLines: [
      { name: "My NFT #1", uri: "https://example.com/nft1.json" },
      { name: "My NFT #2", uri: "https://example.com/nft2.json" },
    ],
  })
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
})();
