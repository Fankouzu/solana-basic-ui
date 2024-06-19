import {
  fetchCandyMachine,
  setCandyGuardAuthority,
  setCandyMachineAuthority,
  setMintAuthority,
} from "@metaplex-foundation/mpl-candy-machine";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import {
  initUmi,
  LoadPublicKey,
  loadOrGenerateKeypair,
  txExplorer,
} from "../libs/helpers";

(async () => {
  // 初始化umi
  const { umi, signer } = initUmi();
  // 读取candyMachine地址
  const candyMachineAddress = publicKey(LoadPublicKey("candyMachine"));
  // 获取candyMachine
  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
  // 创建并保存新的权限
  const newAuthority = loadOrGenerateKeypair("CandyMachineAuthority");
  // 设置糖果机权限
  await setCandyMachineAuthority(umi, {
    candyMachine: candyMachine.publicKey,
    authority: signer,
    newAuthority: publicKey(newAuthority.publicKey),
  })
    .add(
      // 设置糖果卫士权限
      setCandyGuardAuthority(umi, {
        candyGuard: candyMachine.mintAuthority,
        authority: signer,
        newAuthority: publicKey(newAuthority.publicKey),
      })
    )
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });

  // 设置铸造权限
  // const newMintAuthority = generateSigner(umi);
  // await setMintAuthority(umi, {
  //   candyMachine: candyMachine.publicKey,
  //   authority: signer,
  //   mintAuthority: newMintAuthority,
  // }).sendAndConfirm(umi);
})();
