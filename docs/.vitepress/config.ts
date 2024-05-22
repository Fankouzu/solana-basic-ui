import { defineConfig, type DefaultTheme } from "vitepress";

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: "Solana介绍",
      link: "/Introduction/overview",
      activeMatch: "/Introduction/",
    },
    {
      text: "CLI命令行工具",
      link: "/CLI/connecting-to-a-cluster",
      activeMatch: "/CLI/",
    },
    {
      text: "SPL Token",
      link: "/SPL-Token/index",
      activeMatch: "/SPL/",
    },
  ];
}

function sidebarIntroduction(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Solana介绍",
      collapsed: false,
      items: [
        { text: "概述", link: "/overview" },
        { text: "租金经济", link: "/rent" },
        { text: "钱包指南", link: "/wallets" },
        { text: "开发入门", link: "/dev" },
      ],
    },
  ];
}

function sidebarCLI(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "CLI命令行工具",
      collapsed: false,
      items: [
        {
          text: "使用 Solana CLI 连接到集群",
          link: "/connecting-to-a-cluster",
        },
        { text: "使用 Solana CLI 质押 SOL", link: "/staking" },
        { text: "使用 CLI 部署 Solana 程序", link: "/deploy-a-program" },
        { text: "Solana CLI 中的持久交易nonce", link: "/durable-nonce" },
        {
          text: "使用 Solana CLI 进行离线交易签名",
          link: "/offline-signing",
        },
        {
          text: "使用 Solana CLI 进行链下消息签名",
          link: "/sign-offchain-message",
        },
        {
          text: "使用本地集群进行开发",
          link: "/test-validator",
        },
        {
          text: "使用 Solana CLI 发送和接收代币",
          link: "/transfer-tokens",
        },
      ],
    },
  ];
}

function sidebarSPL(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "SPL Token",
      collapsed: false,
      items: [
        { text: "概述", link: "/index" },
        { text: "Token程序", link: "/token" },
      ],
    },
  ];
}
// refer https://vitepress.dev/reference/site-config for details
export default defineConfig({
  lang: "zh-CN",
  title: "Solana开发入门",
  description: "由崔棉大师@MasterCui为您带来的Solana开发入门教学.",

  themeConfig: {
    nav: nav(),

    sidebar: {
      "/Introduction/": {
        base: "/Introduction/",
        items: sidebarIntroduction(),
      },
      "/CLI/": { base: "/CLI/", items: sidebarCLI() },
      "/SPL-Token/": { base: "/SPL-Token/", items: sidebarSPL() },
    },
  },
});