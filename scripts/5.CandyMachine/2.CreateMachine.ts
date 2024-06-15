import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { create } from "@metaplex-foundation/mpl-candy-machine";
import {
  dateTime,
  generateSigner,
  percentAmount,
  publicKey,
  sol,
  some,
} from "@metaplex-foundation/umi";
import {
  initUmi,
  savePublicKeyToFile,
  Log,
  txExplorer,
  LoadPublicKey,
} from "../libs/helpers";

(async () => {
  // 初始化umi
  const { umi, signer } = initUmi();
  // 读取collection mint地址
  const collectionMint = publicKey(LoadPublicKey("collectionMint"));
  // 创建糖果机账户keypair
  const candyMachine = generateSigner(umi);
  Log("candyMachine address", candyMachine.publicKey);

  (
    await create(umi, {
      candyMachine: candyMachine, // 糖果机账户keypair
      collectionMint: collectionMint, // Collection 合集地址
      collectionUpdateAuthority: signer, // 合集更新权限
      tokenStandard: TokenStandard.NonFungible, // Token类型
      sellerFeeBasisPoints: percentAmount(9.99, 2), // 版税9.99%
      itemsAvailable: 10, // 可插入的Item数量
      creators: [
        // 创建者
        {
          address: signer.publicKey, // 创建着地址
          verified: true, // 是否验证
          percentageShare: 100, // 版税占比100%
        },
      ],
      configLineSettings: some({
        // 配置行设置
        prefixName: "My New NFT #$ID+1$", // 名称前缀
        nameLength: 0, // 名称长度
        prefixUri: "https://arweave.net/", // URI前缀
        uriLength: 43, // URI长度
        isSequential: false, // 随机排序
      }),
      guards: {
        botTax: some({ lamports: sol(0.01), lastInstruction: true }),
        solPayment: some({ lamports: sol(1.5), destination: signer.publicKey }),
        startDate: some({ date: dateTime("2024-07-01T00:00:00Z") }),
      },
    })
  )
    .sendAndConfirm(umi)
    .then(({ signature }) => {
      txExplorer(signature);
    });
  // 保存candyMachine地址
  savePublicKeyToFile("candyMachine", candyMachine.publicKey);
})();
