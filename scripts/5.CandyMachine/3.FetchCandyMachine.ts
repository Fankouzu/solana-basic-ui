import {
  fetchCandyGuard,
  fetchCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { publicKey } from "@metaplex-foundation/umi";
import { initUmi, LoadPublicKey } from "../libs/helpers";

(async () => {
  // 初始化umi
  const { umi } = initUmi();
  // 读取candyMachine地址
  const candyMachineAddress = publicKey(LoadPublicKey("candyMachine"));

  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
  console.log(candyMachine);
  const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
  console.log(candyGuard);

  // candyMachine.publicKey; // The public key of the Candy Machine account.
  // candyMachine.mintAuthority; // The mint authority of the Candy Machine which, in most cases, is the Candy Guard address.
  // candyMachine.data.itemsAvailable; // Total number of NFTs available.
  // candyMachine.itemsRedeemed; // Number of NFTs minted.
  // candyMachine.items[0].index; // The index of the first loaded item.
  // candyMachine.items[0].name; // The name of the first loaded item (with prefix).
  // candyMachine.items[0].uri; // The URI of the first loaded item (with prefix).
  // candyMachine.items[0].minted; // Whether the first item has been minted.
})();
