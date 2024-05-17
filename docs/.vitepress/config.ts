import { defineConfig } from "vitepress";

// refer https://vitepress.dev/reference/site-config for details
export default defineConfig({
  lang: "zh-CN",
  title: "Solana开发入门",
  description: "由崔棉大师@MasterCui为您带来的Solana开发入门教学.",

  themeConfig: {
    nav: [
      { text: "开始", link: "/start" },
      // {
      //   text: "Dropdown Menu",
      //   items: [
      //     { text: "Item A", link: "/item-1" },
      //     { text: "Item B", link: "/item-2" },
      //     { text: "Item C", link: "/item-3" },
      //   ],
      // },

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
              { text: "创建Token", link: "/CLI/create-token" },
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
