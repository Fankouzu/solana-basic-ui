import {
  fetchCandyMachine,
  updateCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import {
  generateSigner,
  none,
  percentAmount,
  publicKey,
  some,
} from "@metaplex-foundation/umi";
import {
  initUmi,
  loadOrGenerateKeypair,
  LoadPublicKey,
  txExplorer,
} from "../libs/helpers";

(async () => {
  // 初始化umi
  const { umi } = initUmi();
  // 读取candyMachine地址
  const candyMachineAddress = publicKey(LoadPublicKey("candyMachine"));
  // 获取candyMachine
  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
  // 创建一个新的Creator
  const newCreator = generateSigner(umi).publicKey;
  // 更新糖果机共享属性
  await updateCandyMachine(umi, {
    candyMachine: candyMachine.publicKey,
    data: {
      ...candyMachine.data,
      symbol: "NEW",
      sellerFeeBasisPoints: percentAmount(5.5, 2),
      creators: [
        { address: newCreator, verified: false, percentageShare: 100 },
      ],
      hiddenSettings: none(),
      configLineSettings: some({
        type: "configLines",
        prefixName: "Master Cui #$ID+1$",
        nameLength: 0,
        prefixUri: "https://arweave.net/",
        uriLength: 43,
        isSequential: true,
      }),
    },
  })
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
})();
