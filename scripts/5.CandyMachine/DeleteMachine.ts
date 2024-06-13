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

  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);

  await deleteCandyMachine(umi, {
    candyMachine: candyMachine.publicKey,
  })
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });

  await deleteCandyGuard(umi, {
    candyGuard: candyMachine.mintAuthority,
  })
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
})();
