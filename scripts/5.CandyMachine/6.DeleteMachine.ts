import {
  deleteCandyGuard,
  deleteCandyMachine,
  fetchCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { publicKey } from "@metaplex-foundation/umi";
import { initUmi, txExplorer, LoadPublicKey } from "../libs/helpers";

(async () => {
  // 初始化umi
  const { umi } = initUmi();
  // 读取candyMachine地址
  const candyMachineAddress = publicKey(LoadPublicKey("candyMachine"));
  // 获取糖果机
  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
  // 删除糖果机
  await deleteCandyMachine(umi, {
    candyMachine: candyMachine.publicKey,
  })
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
  // 删除Guard
  await deleteCandyGuard(umi, {
    candyGuard: candyMachine.mintAuthority,
  })
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
})();
