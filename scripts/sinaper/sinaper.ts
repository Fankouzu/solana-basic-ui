import { TOKEN_PROGRAM_ID, getMint } from "@solana/spl-token";
import { Log, payer } from "../libs/helpers";
import { Connection } from "@solana/web3.js";

// 'Program log: Instruction: Route'
const mainnet =
  "https://purple-quiet-thunder.solana-mainnet.quiknode.pro/b41faf9488cc255180120cad8e0be2309c454bb7/";
(async () => {
  const connection = new Connection(mainnet, "confirmed");
  connection.onLogs(
    TOKEN_PROGRAM_ID,
    async (logs, context) => {
      logs.logs.forEach((item) => {
        if (item == "Program log: Instruction: Burn") {
          Log("logs=====================", logs.logs);
        }
      });
    },
    "confirmed"
  );
})();
