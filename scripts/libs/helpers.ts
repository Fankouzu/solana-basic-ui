import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import base58 from "bs58";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
// load the env variables from file
dotenv.config();

// define some default locations
const DEFAULT_KEY_DIR_NAME = ".local_keys";
const DEFAULT_PUBLIC_KEY_FILE = "keys.json";
const DEFAULT_SIGNATURE_FILE = "sigs.json";
const DEFAULT_DEMO_DATA_FILE = "demo.json";

export const FgGreen = "\x1b[32m";
export const FgRed = "\x1b[31m";
export const FgYellow = "\x1b[33m";
/**
 * Load the `payer` keypair from the local file system, or load/generate a new
 * one and storing it within the local directory
 */
export const payer = loadOrGenerateKeypair("Payer");

// generate a new Keypair for testing, named `wallet`
export const testWallet = loadOrGenerateKeypair("testWallet");

// load the env variables and store the cluster RPC url
export const CLUSTER_URL = process.env.RPC_URL ?? clusterApiUrl("devnet");

// create a new rpc connection
export const connection = new Connection(CLUSTER_URL, "confirmed");

/**
 * Load locally stored PublicKey addresses
 */
export function loadPublicKeysFromFile(
  absPath: string = `${DEFAULT_KEY_DIR_NAME}/${DEFAULT_PUBLIC_KEY_FILE}`
) {
  try {
    if (!absPath) throw Error("No path provided");
    if (!fs.existsSync(absPath)) throw Error("File does not exist.");

    // load the public keys from the file
    const data =
      JSON.parse(fs.readFileSync(absPath, { encoding: "utf-8" })) || {};
    // convert all loaded keyed values into valid public keys
    for (const [key, value] of Object.entries(data)) {
      data[key] = new PublicKey(value as string) ?? "";
    }

    return data;
  } catch (err) {
    // console.warn("Unable to load local file");
  }
  // always return an object
  return {};
}

export function loadSignaturesFromFile(
  absPath: string = `${DEFAULT_KEY_DIR_NAME}/${DEFAULT_SIGNATURE_FILE}`
) {
  try {
    if (!absPath) throw Error("No path provided");
    if (!fs.existsSync(absPath)) throw Error("File does not exist.");

    // load the signatures from the file
    const data =
      JSON.parse(fs.readFileSync(absPath, { encoding: "utf-8" })) || {};
    // convert all loaded keyed values into valid signatures
    for (const [key, value] of Object.entries(data)) {
      data[key] = value ?? "";
    }

    return data;
  } catch (err) {
    // console.warn("Unable to load local file");
  }
  // always return an object
  return {};
}

/*
  Locally save a PublicKey addresses to the filesystem for later retrieval
*/
export function savePublicKeyToFile(
  name: string,
  publicKey: string,
  absPath: string = `${DEFAULT_KEY_DIR_NAME}/${DEFAULT_PUBLIC_KEY_FILE}`
) {
  try {
    // if (!absPath) throw Error("No path provided");
    // if (!fs.existsSync(absPath)) throw Error("File does not exist.");

    // fetch all the current values
    let data: any = loadPublicKeysFromFile(absPath);

    // convert all loaded keyed values from PublicKeys to strings
    for (const [key, value] of Object.entries(data)) {
      data[key as any] = (value as PublicKey).toBase58();
    }
    data = { ...data, [name]: publicKey };

    // actually save the data to the file
    fs.writeFileSync(absPath, JSON.stringify(data), {
      encoding: "utf-8",
    });

    // reload the keys for sanity
    data = loadPublicKeysFromFile(absPath);

    return data;
  } catch (err) {
    console.warn("Unable to save to file");
  }
  // always return an object
  return {};
}

/*
  Locally save a PublicKey addresses to the filesystem for later retrieval
*/
export function saveSignatureToFile(
  name: string,
  signature: Uint8Array,
  absPath: string = `${DEFAULT_KEY_DIR_NAME}/${DEFAULT_SIGNATURE_FILE}`
) {
  try {
    // if (!absPath) throw Error("No path provided");
    // if (!fs.existsSync(absPath)) throw Error("File does not exist.");

    // fetch all the current values
    let data: any = loadSignaturesFromFile(absPath);

    // convert all loaded keyed values from PublicKeys to strings
    for (const [key, value] of Object.entries(data)) {
      data[key as any] = base58.encode(value as Uint8Array);
    }
    data = { ...data, [name]: base58.encode(signature) };

    // actually save the data to the file
    fs.writeFileSync(absPath, JSON.stringify(data), {
      encoding: "utf-8",
    });

    // reload the sigs for sanity
    data = loadSignaturesFromFile(absPath);

    return data;
  } catch (err) {
    console.warn("Unable to save to file");
  }
  // always return an object
  return {};
}

/*
  Load a locally stored JSON keypair file and convert it to a valid Keypair
*/
export function loadKeypairFromFile(absPath: string) {
  try {
    if (!absPath) throw Error("No path provided");
    if (!fs.existsSync(absPath)) throw Error("File does not exist.");

    // load the keypair from the file
    const keyfileBytes = JSON.parse(
      fs.readFileSync(absPath, { encoding: "utf-8" })
    );
    // parse the loaded secretKey into a valid keypair
    const keypair = Keypair.fromSecretKey(new Uint8Array(keyfileBytes));
    return keypair;
  } catch (err) {
    // return false;
    throw err;
  }
}

/*
  Save a locally stored JSON keypair file for later importing
*/
export function saveKeypairToFile(
  keypair: Keypair,
  fileName: string,
  dirName: string = DEFAULT_KEY_DIR_NAME
) {
  fileName = path.join(dirName, `${fileName}.json`);

  // create the `dirName` directory, if it does not exists
  if (!fs.existsSync(`./${dirName}/`)) fs.mkdirSync(`./${dirName}/`);

  // remove the current file, if it already exists
  if (fs.existsSync(fileName)) fs.unlinkSync(fileName);

  // write the `secretKey` value as a string
  fs.writeFileSync(fileName, `[${keypair.secretKey.toString()}]`, {
    encoding: "utf-8",
  });

  return fileName;
}

/*
  Attempt to load a keypair from the filesystem, or generate and save a new one
*/
export function loadOrGenerateKeypair(
  fileName: string,
  dirName: string = DEFAULT_KEY_DIR_NAME
) {
  try {
    // compute the path to locate the file
    const searchPath = path.join(dirName, `${fileName}.json`);
    let keypair = Keypair.generate();

    // attempt to load the keypair from the file
    if (fs.existsSync(searchPath)) keypair = loadKeypairFromFile(searchPath);
    // when unable to locate the keypair, save the new one
    else saveKeypairToFile(keypair, fileName, dirName);

    return keypair;
  } catch (err) {
    console.error("loadOrGenerateKeypair:", err);
    throw err;
  }
}

/*
  Compute the Solana explorer address for the various data
*/
export function explorerURL({
  address,
  txSignature,
  cluster,
}: {
  address?: string;
  txSignature?: string;
  cluster?: "devnet" | "testnet" | "mainnet" | "mainnet-beta";
}) {
  let baseUrl: string;
  //
  if (address) baseUrl = `https://explorer.solana.com/address/${address}`;
  else if (txSignature)
    baseUrl = `https://explorer.solana.com/tx/${txSignature}`;
  else return "[unknown]";

  // auto append the desired search params
  const url = new URL(baseUrl);
  url.searchParams.append("cluster", cluster || "devnet");
  return url.toString() + "\n";
}

/**
 * Auto airdrop the given wallet of of a balance of < 0.5 SOL
 */
export async function airdropOnLowBalance(
  connection: Connection,
  keypair: Keypair,
  forceAirdrop: boolean = false
) {
  // get the current balance
  let balance = await connection.getBalance(keypair.publicKey);

  // define the low balance threshold before airdrop
  const MIN_BALANCE_TO_AIRDROP = LAMPORTS_PER_SOL / 2; // current: 0.5 SOL

  // check the balance of the two accounts, airdrop when low
  if (forceAirdrop === true || balance < MIN_BALANCE_TO_AIRDROP) {
    console.log(
      `Requesting airdrop of 1 SOL to ${keypair.publicKey.toBase58()}...`
    );
    await connection
      .requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL)
      .then((sig) => {
        console.log("Tx signature:", sig);
        // balance = balance + LAMPORTS_PER_SOL;
      });

    // fetch the new balance
    // const newBalance = await connection.getBalance(keypair.publicKey);
    // return newBalance;
  }
  // else console.log("Balance of:", balance / LAMPORTS_PER_SOL, "SOL");

  return balance;
}

/*
  Helper function to extract a transaction signature from a failed transaction's error message
*/
export async function extractSignatureFromFailedTransaction(
  connection: Connection,
  err: any,
  fetchLogs?: boolean
) {
  if (err?.signature) return err.signature;

  // extract the failed transaction's signature
  const failedSig = new RegExp(
    /^((.*)?Error: )?(Transaction|Signature) ([A-Z0-9]{32,}) /gim
  ).exec(err?.message?.toString())?.[4];

  // ensure a signature was found
  if (failedSig) {
    // when desired, attempt to fetch the program logs from the cluster
    if (fetchLogs)
      await connection
        .getTransaction(failedSig, {
          maxSupportedTransactionVersion: 0,
        })
        .then((tx) => {
          console.log(`\n==== Transaction logs for ${failedSig} ====`);
          console.log(explorerURL({ txSignature: failedSig }), "");
          console.log(
            tx?.meta?.logMessages ?? "No log messages provided by RPC"
          );
          console.log(`==== END LOGS ====\n`);
        });
    else {
      console.log("\n========================================");
      console.log(explorerURL({ txSignature: failedSig }));
      console.log("========================================\n");
    }
  }

  // always return the failed signature value
  return failedSig;
}

/*
  Standard number formatter
*/
export function numberFormatter(num: number, forceDecimals = false) {
  // set the significant figures
  const minimumFractionDigits = num < 1 || forceDecimals ? 10 : 2;

  // do the formatting
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits,
  }).format(num);
}


/*
  Display a separator in the console, with our without a message
*/
export function printConsoleSeparator(message?: string) {
  console.log("\n===============================================");
  console.log("===============================================\n");
  if (message) console.log(message);
}

export function UmiKeypair(
  fileName: string,
  dirName: string = DEFAULT_KEY_DIR_NAME
) {
  try {
    // compute the path to locate the file
    const searchPath = path.join(dirName, `${fileName}.json`);
    const loaded = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(searchPath).toString()))
    );

    return fromWeb3JsKeypair(loaded);
  } catch (err) {
    console.error("loadOrGenerateKeypair:", err);
    throw err;
  }
}

export const umiPayer = UmiKeypair("payer");

export function initUmi() {
  const umi = createUmi(CLUSTER_URL);
  const signer = createSignerFromKeypair(umi, umiPayer);
  umi.use(signerIdentity(signer, true));
  umi.use(mplTokenMetadata());
  umi.use(mplCandyMachine());
  return { umi,signer };
}

export function LoadPublicKey(symble: string) {
  // load the stored PublicKeys for ease of use
  let localKeys = loadPublicKeysFromFile();

  const pubkey: PublicKey = localKeys[symble];

  console.log(FgGreen + "==== Local PublicKeys loaded ====");
  console.log(`${FgGreen}PublicKeys: ${FgYellow + pubkey}`);
  console.log(FgYellow + explorerURL({ address: pubkey.toString() }));
  return pubkey;
}

export function LoadSignature(symble: string) {
  // load the stored PublicKeys for ease of use
  let sigs = loadSignaturesFromFile();

  const sig: string = sigs[symble];

  console.log(FgGreen + "==== Local Signature loaded ====");
  console.log(`${FgGreen}Signature: ${FgYellow + sig}`);
  console.log(FgYellow + explorerURL({ txSignature: sig }));
  return base58.decode(sig);
}

export function txExplorer(signature: Uint8Array) {
  console.log(
    FgYellow + explorerURL({ txSignature: base58.encode(signature) })
  );
}
export function pubkeyExplorer(pubkey: string) {
  console.log(FgYellow + explorerURL({ address: pubkey }));
}

export function Log(message: string, value: any) {
  console.log(`${FgGreen + message}: ${FgYellow}`, value);
}
