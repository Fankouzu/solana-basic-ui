import path from "path";
import fs from "fs";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { Log, initUmi } from "../libs/helpers";
import { Umi, createGenericFile } from "@metaplex-foundation/umi";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

(async () => {
  // 初始化umi
  const { umi } = initUmi();
  // 加载irysUploader
  umi.use(irysUploader());
  let json = [];

  for (let i = 0; i < 10; i++) {
    json.push(await uploadImg(umi, i));
  }
  console.log(JSON.stringify(json));
})();

async function uploadImg(umi: Umi, index: number) {
  const filename = index + 1;
  // 读取图像文件
  const fileBuffer = fs.readFileSync(
    path.join("../docs/public/NFTs", filename + ".jpg")
  );
  const file = createGenericFile(fileBuffer, filename + ".jpg", {
    contentType: "image/gif",
  });
  // 获取图像价格
  const uploadPrice = await umi.uploader.getUploadPrice([file]);
  // 上传图像
  const [imageUri] = await umi.uploader.upload([file]);
  const uri = await umi.uploader.uploadJson({
    name: "Master Cui #" + filename,
    description: "My Avator",
    image: imageUri,
  });

  Log(
    "uploadPrice",
    Number(uploadPrice.basisPoints) / LAMPORTS_PER_SOL + uploadPrice.identifier
  );
  Log("URI", uri);
  return { name: filename.toString(), uri: uri.replace("https://arweave.net/", "") };
}
