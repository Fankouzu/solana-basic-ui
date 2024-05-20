import { defineConfig } from "vitepress";

// refer https://vitepress.dev/reference/site-config for details
export default defineConfig({
  lang: "zh-CN",
  title: "Solana开发入门",
  description: "由崔棉大师@MasterCui为您带来的Solana开发入门教学.",

  themeConfig: {
    nav: [
      { text: "开始", link: "/start" },
      {
        text: "CLI命令行工具",
        items: [
          { text: "connecting to a cluster",link: "/CLI/connecting-to-a-cluster.md" },
          { text: "staking",link: "/CLI/staking.md" },
          { text: "使用 CLI 部署 Solana 程序",link: "/CLI/deploy-a-program.md" },
          { text: "Solana CLI 中的持久交易nonce",link: "/CLI/durable-nonce.md" },
          { text: "使用 Solana CLI 进行离线交易签名",link: "/CLI/offline-signing.md" },
          { text: "使用 Solana CLI 进行链下消息签名",link: "/CLI/sign-offchain-message.md" },
        ],
      },

      // ...
    ],

    sidebar: [
      {
        items: [
          { text: "开始", link: "/start" },
          {
            text: "安装命令行工具",
            items: [
              { text: "Solana客户端", link: "/CLI/solana" },
              { text: "spl-token客户端", link: "/CLI/spl" },
            ],
          },
          {
            text: "CLI命令行",
            items: [
              { text: "创建Token", link: "/CLI/solana" },
              { text: "spl-token客户端", link: "/CLI/spl" },
            ],
          },
          {
            text: "账户相关",
            items: [
              { text: "创建账户", link: "/Account/Keypair" },
              { text: "幸运账号", link: "/Account/LuckyAccount" },
              { text: "支付账户", link: "/Account/Payer" },
            ],
          },
          // ...
        ],
        // text: "Solana开发入门",
      },
    ],
  },
});
