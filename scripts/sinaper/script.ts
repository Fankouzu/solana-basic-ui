import "dotenv/config";
import axios from "axios";
import {
  Keypair,
  Connection,
  clusterApiUrl,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { AccountLayout } from "@solana/spl-token";
import pkg from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import fs from "fs";
import bs58 from "bs58";
import blessed from "blessed";
import contrib from "blessed-contrib";

const { Builder } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const SOLANA_WALLET_PATH = process.env.SOLANA_WALLET_PATH;

let privateKey;
try {
  const keypair = fs.readFileSync(SOLANA_WALLET_PATH, "utf8");
  const keypairArray = JSON.parse(keypair);

  if (Array.isArray(keypairArray)) {
    privateKey = Uint8Array.from(keypairArray);
    console.log("Private key loaded from keypair file.");
  } else {
    throw new Error("Invalid keypair format");
  }
} catch (error) {
  console.error("Error reading Solana wallet keypair:", error);
  process.exit(1);
}

const payer = Keypair.fromSecretKey(privateKey);
const connection = new Connection(clusterApiUrl("mainnet-beta"));

// Adjustable variables
const MINIMUM_BUY_AMOUNT = parseFloat(process.env.MINIMUM_BUY_AMOUNT || 0.015);
const MAX_BONDING_CURVE_PROGRESS = parseInt(
  process.env.MAX_BONDING_CURVE_PROGRESS || 10
);
const SELL_BONDING_CURVE_PROGRESS = parseInt(
  process.env.SELL_BONDING_CURVE_PROGRESS || 15
);
const PROFIT_TARGET_1 = 1.25; // 25% increase
const PROFIT_TARGET_2 = 1.25; // Another 25% increase
const STOP_LOSS_LIMIT = 0.9; // 10% decrease
const MONITOR_INTERVAL = 5 * 1000; // 5 seconds
const SELL_TIMEOUT = 2 * 60 * 1000; // 2 minutes
const TRADE_DELAY = 90 * 1000; // 90 seconds delay
const PRIORITY_FEE_BASE = 0.0003; // Base priority fee

// Create a blessed screen
const screen = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

const logBox = grid.set(3, 0, 9, 12, blessed.box, {
  fg: "green",
  label: "Trading Bot Log",
  scrollable: true,
  alwaysScroll: true,
  scrollbar: {
    fg: "green",
    ch: "|",
  },
});

const accountInfoBox = grid.set(9, 0, 2, 12, blessed.box, {
  fg: "green",
  label: "Account Info",
  tags: true,
});

const menuBox = grid.set(11, 0, 1, 12, blessed.box, {
  fg: "white",
  label: "Menu",
  tags: true,
  content: "R: Reset Timer | C: Continue | S: Sell 75%",
});

screen.render();

let resetTimer = false;
let continueTrade = false;
let sellImmediately = false;

const updateLog = (message) => {
  logBox.insertBottom(message);
  logBox.setScrollPerc(100);
  screen.render();
};

const updateAccountInfo = async () => {
  const balance = await checkBalance();
  const tokenBalances = await fetchSPLTokens();

  let tokenBalancesText = "";
  tokenBalances.forEach((token) => {
    if (token.amount > 1) {
      tokenBalancesText += `Mint: ${token.mint}, Amount: ${token.amount} SPL\n`;
    }
  });

  accountInfoBox.setContent(
    `Account address: ${payer.publicKey.toString()}\nAccount balance: ${balance} SOL\n${tokenBalancesText}`
  );
  screen.render();
};

const setVisualMode = (mode) => {
  if (mode === "trading") {
    logBox.style.fg = "yellow";
    logBox.style.border = { type: "line", fg: "red" };
    accountInfoBox.style.fg = "yellow";
    accountInfoBox.style.border = { type: "line", fg: "red" };
  } else {
    logBox.style.fg = "green";
    logBox.style.border = { type: "line", fg: "blue" };
    accountInfoBox.style.fg = "green";
    accountInfoBox.style.border = { type: "line", fg: "blue" };
  }
  screen.render();
};

const fetchNewPairs = async (limit = 5) => {
  const url = "https://pumpapi.fun/api/get_newer_mints";
  try {
    const response = await axios.get(url, { params: { limit } });
    return response.data.mint || [];
  } catch (error) {
    updateLog(`Error fetching new pairs: ${error.message}`);
    return [];
  }
};

const scrapeTokenInfo = async (contractAddress) => {
  let options = new chrome.Options();
  options.addArguments("headless");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    await driver.get(`https://pump.fun/${contractAddress}`);
    await driver.sleep(5000);

    const pageSource = await driver.getPageSource();

    const extractText = (source, keyword) => {
      const index = source.indexOf(keyword);
      if (index !== -1) {
        const start = source.indexOf(":", index) + 2;
        const end = source.indexOf("<", start);
        return source.substring(start, end).trim();
      }
      return null;
    };

    const ticker = extractText(pageSource, "Ticker");
    const marketcap = parseFloat(
      extractText(pageSource, "Market cap").replace(/\$|,/g, "")
    );
    const bondingCurve = parseInt(
      extractText(pageSource, "bonding curve progress").replace("%", "")
    );

    updateLog(`\nTicker: ${ticker}`);
    updateLog(`Market Cap: $${marketcap}`);
    updateLog(`Bonding Curve Progress: ${bondingCurve}%`);

    return { ticker, marketcap, bondingCurve };
  } catch (error) {
    updateLog(`Error scraping token info: ${error}`);
    return null;
  } finally {
    await driver.quit();
  }
};

const pumpFunBuy = async (mint, amount) => {
  const url = "https://pumpapi.fun/api/trade";
  const data = {
    trade_type: "buy",
    mint,
    amount,
    slippage: 5,
    priorityFee: PRIORITY_FEE_BASE,
    userPrivateKey: bs58.encode(privateKey),
  };

  try {
    const response = await axios.post(url, data);
    return response.data.tx_hash;
  } catch (error) {
    updateLog(`Error executing buy transaction: ${error.message}`);
    return null;
  }
};

const pumpFunSell = async (mint, amount) => {
  const url = "https://pumpapi.fun/api/trade";
  const data = {
    trade_type: "sell",
    mint,
    amount: amount.toString(),
    slippage: 5,
    priorityFee: PRIORITY_FEE_BASE,
    userPrivateKey: bs58.encode(privateKey),
  };

  try {
    const response = await axios.post(url, data);
    return response.data.tx_hash;
  } catch (error) {
    updateLog(`Error executing sell transaction: ${error.message}`);
    return null;
  }
};

const checkBalance = async () => {
  const balance = await connection.getBalance(payer.publicKey);
  updateLog(`Current balance: ${balance / 1e9} SOL`);
  return balance / 1e9;
};

const fetchSPLTokens = async () => {
  try {
    const tokenAccounts = await connection.getTokenAccountsByOwner(
      payer.publicKey,
      {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      }
    );
    return tokenAccounts.value
      .map((accountInfo) => {
        const accountData = AccountLayout.decode(accountInfo.account.data);
        return {
          mint: new PublicKey(accountData.mint).toString(),
          amount: Number(accountData.amount) / 10 ** 6,
        };
      })
      .filter((token) => token.amount > 1);
  } catch (error) {
    updateLog(`Error fetching SPL tokens: ${error.message}`);
    return [];
  }
};

const sellTokens = async (mint, sellPercentage) => {
  const tokens = await fetchSPLTokens();
  for (const token of tokens) {
    if (token.mint === mint) {
      const amountToSell = token.amount * sellPercentage;
      if (amountToSell >= 1) {
        updateLog(`Selling ${amountToSell} of token ${mint}`);

        let attempts = 5;
        let txHash = null;
        while (attempts > 0) {
          txHash = await pumpFunSell(mint, amountToSell);
          if (txHash) {
            updateLog(
              `Sold ${amountToSell} of token ${mint} with transaction hash: ${txHash}`
            );
            break;
          } else {
            updateLog(
              `Retrying sell transaction... Attempts left: ${attempts - 1}`
            );
            attempts--;
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }

        if (!txHash) {
          updateLog(`Failed to sell token ${mint} after multiple attempts.`);
        }
      } else {
        updateLog(
          `Skipping token ${mint} as the human-readable amount is less than 1`
        );
      }
      break;
    }
  }
};

const monitorTrade = async (mint, initialMarketCap, initialBondingCurve) => {
  let endTime = Date.now() + SELL_TIMEOUT;
  const tradeAllowedTime = Date.now() + TRADE_DELAY;
  let lastMarketCap = initialMarketCap;

  while (Date.now() < endTime) {
    const tokenInfo = await scrapeTokenInfo(mint);
    if (tokenInfo) {
      const marketCapChange =
        ((tokenInfo.marketcap - initialMarketCap) / initialMarketCap) * 100;
      updateLog(`\nTicker: ${tokenInfo.ticker}`);
      updateLog(`Market Cap: $${tokenInfo.marketcap}`);
      updateLog(
        `Current Market Cap: $${
          tokenInfo.marketcap
        }, Change: ${marketCapChange.toFixed(2)}%`
      );
      updateLog(
        `Time remaining: ${((endTime - Date.now()) / 1000).toFixed(0)}s`
      );
      updateLog(`Pump.fun link: https://pump.fun/${mint}`);
      updateLog(`Current Bonding Curve: ${tokenInfo.bondingCurve}%`);

      if (marketCapChange >= 25) {
        updateLog(
          `Market cap increased by 25%. Selling 50% of tokens for mint: ${mint}`
        );
        await sellTokens(mint, 0.5); // Sell 50% to take profit
        // Adjust trailing stop-loss for remaining position
        lastMarketCap = tokenInfo.marketcap;
        continueTrade = true;
      } else if (marketCapChange <= -10) {
        updateLog(
          `Market cap fell by more than 10%. Selling all tokens for mint: ${mint}`
        );
        await sellTokens(mint, 1.0); // Sell all to stop loss
        break;
      } else if (tokenInfo.bondingCurve >= SELL_BONDING_CURVE_PROGRESS) {
        updateLog(
          `Bonding curve reached ${SELL_BONDING_CURVE_PROGRESS}%. Selling 75% of tokens for mint: ${mint}`
        );
        await sellTokens(mint, 0.75); // Sell 75% due to bonding curve and keep 25% moonbag
        break;
      }

      if (tokenInfo.marketcap > lastMarketCap * PROFIT_TARGET_2) {
        updateLog(
          "Price increased another 25%, selling 75% of remaining tokens."
        );
        await sellTokens(mint, 0.75);
        lastMarketCap = tokenInfo.marketcap;
      }

      if (resetTimer) {
        updateLog("Resetting timer.");
        endTime = Date.now() + SELL_TIMEOUT;
        resetTimer = false;
      }

      if (continueTrade) {
        updateLog("Continuing to the next trade.");
        continueTrade = false;
        break;
      }

      if (sellImmediately) {
        updateLog("Selling 75% immediately.");
        await sellTokens(mint, 0.75);
        sellImmediately = false;
        break;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, MONITOR_INTERVAL));
  }

  // If time expires without significant change, sell 75% and keep the rest as a moon bag
  if (Date.now() >= endTime) {
    updateLog(
      `Market cap did not increase by 25% within the set time. Selling 75% of tokens for mint: ${mint}`
    );
    await sellTokens(mint, 0.75); // Sell 75% and keep 25% moonbag
  }
};

const simulateTrade = async () => {
  const newPairs = await fetchNewPairs();
  for (const mint of newPairs) {
    const tokenInfo = await scrapeTokenInfo(mint);
    if (tokenInfo && tokenInfo.bondingCurve < MAX_BONDING_CURVE_PROGRESS) {
      updateLog(`Executing buy transaction for mint: ${mint}`);
      setVisualMode("trading");
      let attempts = 3;
      let txHash;
      while (attempts > 0) {
        txHash = await pumpFunBuy(mint, MINIMUM_BUY_AMOUNT);
        if (txHash) break;
        attempts--;
        updateLog(`Retrying buy transaction... Attempts left: ${attempts}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      if (!txHash) {
        updateLog(`Failed to execute buy transaction for mint: ${mint}`);
      } else {
        updateLog(`Transaction successful with hash: ${txHash}`);
        await monitorTrade(mint, tokenInfo.marketcap, tokenInfo.bondingCurve);
      }
      setVisualMode("searching");
    } else {
      updateLog(
        `Bonding curve progress is ${MAX_BONDING_CURVE_PROGRESS}% or higher. Looking for newer tokens...`
      );
    }
  }
};

const main = async () => {
  updateLog("Starting live trading mode...");
  await updateAccountInfo(); // Display account info before starting the trade loop
  setVisualMode("searching");
  while (true) {
    await simulateTrade();
    updateLog("All pairs processed. Retrying in 5 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};

const liveUpdateAccountInfo = async () => {
  while (true) {
    await updateAccountInfo();
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Update every 10 seconds
  }
};

const calculateRentExemption = async (dataLength) => {
  try {
    const rentExemptionAmount =
      await connection.getMinimumBalanceForRentExemption(dataLength);
    updateLog(
      `Rent exemption amount for ${dataLength} bytes: ${
        rentExemptionAmount / 1e9
      } SOL`
    );
    return rentExemptionAmount;
  } catch (error) {
    updateLog(`Error calculating rent exemption: ${error.message}`);
    return null;
  }
};

const splashScreen = () => {
  const splash = blessed.box({
    parent: screen,
    top: "center",
    left: "center",
    width: "80%",
    height: "80%",
    content: `
Welcome to the Solana Trading Bot!

This tool helps you trade tokens on the Solana blockchain based on bonding curves and market cap changes.

Trading Strategy:
- The bot scrapes data to identify new tokens with favorable bonding curves.
- The bot monitors market cap changes and bonding curves to decide when to sell.
- Goal is to take profit at a 25% increase, and again at another 25% increase.
- Stop loss set if the market cap falls by 10% or if the bonding curve reaches a critical level.

This uses Solana CLI to make trades. Must have Node, Selenium, Chrome WebDriver, and funded Solana wallet.
Make sure to set Wallet JSON location and trading settings in .ENV file

Requirements:
- Node.js
- Solana CLI
- Selenium WebDriver (Chrome)

Thank you for using this tool By TreeCityWes.eth of HashHead.io
Donations are sent to 8bXf8Rg3u4Prz71LgKR5mpa7aMe2F4cSKYYRctmqro6x

Press Enter to support the developer with a 0.05 SOL donation. (Press C to continue without supporting the developer)
        `,
    border: {
      type: "line",
    },
    style: {
      fg: "white",
      bg: "blue",
      border: {
        fg: "green",
      },
      hover: {
        bg: "green",
      },
    },
  });

  screen.append(splash);
  screen.render();

  screen.key(["enter", "c"], async (ch, key) => {
    splash.destroy();
    screen.render();
    checkBalance().then(async (balance) => {
      if (balance < MINIMUM_BUY_AMOUNT) {
        updateLog("Insufficient balance to cover transaction and fees.");
        process.exit(1);
      } else {
        const rentExemptionAmount = await calculateRentExemption(165);
        if (
          rentExemptionAmount &&
          balance < MINIMUM_BUY_AMOUNT + rentExemptionAmount / 1e9
        ) {
          updateLog(
            "Insufficient balance to cover rent exemption and transaction."
          );
          process.exit(1);
        } else {
          main();
          liveUpdateAccountInfo(); // Start live update of account info
        }
      }
    });
  });
};

splashScreen();
screen.key(["escape", "q", "C-c"], (ch, key) => process.exit(0));
