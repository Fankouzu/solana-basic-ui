import {
  fetchCandyGuard,
  fetchCandyMachine,
  updateCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine";
import { dateTime, publicKey, sol, some } from "@metaplex-foundation/umi";
import { initUmi, LoadPublicKey, txExplorer } from "../libs/helpers";

(async () => {
  // 初始化umi
  const { umi, signer } = initUmi();
  // 读取candyMachine地址
  const candyMachineAddress = publicKey(LoadPublicKey("candyMachine"));
  // 获取candyMachine
  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
  // 获取candyGuard
  const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);

  // 更新糖果机共享属性
  await updateCandyGuard(umi, {
    candyGuard: candyGuard.publicKey,
    // 如果启用默认Guard，则打开下面的注释
    // guards: {
    //   botTax: some({ lamports: sol(0.001), lastInstruction: true }),
    // },
    // 如果启用默认Guard，则注释掉下一行
    guards: candyGuard.guards,
    groups: [
      {
        label: "early",
        guards: {
          solPayment: some({ lamports: sol(1), destination: signer.publicKey }),
          startDate: some({ date: dateTime("2024-7-1T16:00:00Z") }),
          endDate: some({ date: dateTime("2024-7-1T17:00:00Z") }),
          botTax: some({ lamports: sol(0.001), lastInstruction: true }), // 如果启用默认Guard，则注释掉此行
        },
      },
      {
        label: "late",
        guards: {
          solPayment: some({ lamports: sol(3), destination: signer.publicKey }),
          startDate: some({ date: dateTime("2024-7-1T17:00:00Z") }),
          botTax: some({ lamports: sol(0.001), lastInstruction: true }), // 如果启用默认Guard，则注释掉此行
        },
      },
    ],
  })
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
})();
