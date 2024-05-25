import { defineConfig, type DefaultTheme } from "vitepress";

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: "Solana中文文档",
      link: "/SolanaDocumention/overview",
      activeMatch: "/SolanaDocumention/",
    },
    {
      text: "Solana验证者文档",
      link: "/SolanaValidatorDocumentation/connecting-to-a-cluster",
      activeMatch: "/SolanaValidatorDocumentation/",
    },
    {
      text: "Solana程序库",
      link: "/SolanaProgramLibrary/index",
      activeMatch: "/SolanaProgramLibrary/",
    },
  ];
}

function sidebarSolanaDocumention(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Solana中文文档",
      collapsed: false,
      items: [
        { text: "概述", link: "overview" },
        { text: "租金经济", link: "rent" },
        { text: "钱包指南", link: "wallets" },
        { text: "开发入门", link: "dev" },
      ],
    },
    {
      text: "核心概念",
      collapsed: false,
      items: [
        { text: "账户模型", link: "accounts" },
        { text: "交易与指令", link: "transactions" }
      ],
    },
    {
      text: "高级概念",
      collapsed: false,
      items: [
        { text: "版本化交易", link: "versions" },
        { text: "地址查找表", link: "lookup-tables" },
        { text: "交易确认及过期", link: "confirmation" },
        { text: "重试交易", link: "retry" },
        { text: "状态压缩", link: "state-compression" },
      ],
    },
    {
      text: "Solana客户端",
      collapsed: false,
      items: [
        { text: "Rust", link: "rust" },
      ],
    },
  ];
}

function sidebarSolanaValidatorDocumentation(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Solana验证者文档",
      collapsed: false,
      items: [
        {
          text: "使用 Solana CLI 连接到集群",
          link: "connecting-to-a-cluster",
        },
        { text: "使用 Solana CLI 质押 SOL", link: "staking" },
        { text: "使用 CLI 部署 Solana 程序", link: "deploy-a-program" },
        { text: "Solana CLI 中的持久交易nonce", link: "durable-nonce" },
        {
          text: "使用 Solana CLI 进行离线交易签名",
          link: "offline-signing",
        },
        {
          text: "使用 Solana CLI 进行链下消息签名",
          link: "sign-offchain-message",
        },
        {
          text: "使用本地集群进行开发",
          link: "test-validator",
        },
        {
          text: "使用 Solana CLI 发送和接收代币",
          link: "transfer-tokens",
        },
      ],
    },
  ];
}

function sidebarSolanaProgramLibrary(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Solana程序库",
      collapsed: false,
      items: [
        { text: "概述", link: "index" },
        { text: "Token程序", link: "token" },
      ],
    },
  ];
}
// refer https://vitepress.dev/reference/site-config for details
export default defineConfig({
  lang: "zh-CN",
  title: "Solana中文大全",
  description: "由崔棉大师@MasterCui和捕鲸船社区小伙伴共建的Solana学习社区.",

  themeConfig: {
    nav: nav(),

    sidebar: {
      "/SolanaDocumention/": {
        base: "/SolanaDocumention/",
        items: sidebarSolanaDocumention(),
      },
      "/SolanaValidatorDocumentation/": { base: "/SolanaValidatorDocumentation/", items: sidebarSolanaValidatorDocumentation() },
      "/SolanaProgramLibrary/": { base: "/SolanaProgramLibrary/", items: sidebarSolanaProgramLibrary() },
    },
    footer: {
      message:
        "本教程招募共建者,联系<a href='https://x.com/@MasterCui'>崔棉大师</a>",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    outline: {
      label: "页面导航",
    },
    editLink: {
      pattern:
        "https://github.com/Fankouzu/solana-basic-ui/edit/main/docs/:path",
      text: "在 GitHub 上编辑此页面",
    },
    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },
  },
});
