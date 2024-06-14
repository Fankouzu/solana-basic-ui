import {
  addConfigLines,
  fetchCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { publicKey } from "@metaplex-foundation/umi";
import { initUmi, txExplorer, LoadPublicKey } from "../libs/helpers";
import metadata from "./metadata.json";

(async () => {
  // 初始化umi
  const { umi } = initUmi();
  // 读取candyMachine地址
  const candyMachineAddress = publicKey(LoadPublicKey("candyMachine"));
  // 获取糖果机
  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
  // 插入项目
  await addConfigLines(umi, {
    candyMachine: candyMachine.publicKey,
    index: candyMachine.itemsLoaded,
    configLines: metadata,
  })
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
})();
