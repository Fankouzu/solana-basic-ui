import { defineConfig, type DefaultTheme } from "vitepress";

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: "Solana中文文档",
      link: "/SolanaDocumention/intro/overview",
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
        { text: "概述", link: "intro/overview" },
        // { text: "租金经济", link: "rent" },
        { text: "钱包指南", link: "intro/wallets" },
        { text: "开发入门", link: "intro/dev" },
      ],
    },
    {
      text: "核心概念",
      collapsed: false,
      items: [
        { text: "账户模型", link: "core/accounts" },
        { text: "交易与指令", link: "core/transactions" },
        { text: "交易费用", link: "core/fees" },
        { text: "程序", link: "core/programs" },
        { text: "程序派生地址", link: "core/pda" },
        { text: "群集和公共 RPC 端点", link: "core/clusters" },
      ],
    },
    {
      text: "高级概念",
      collapsed: false,
      items: [
        { text: "版本化交易", link: "advanced/versions" },
        { text: "地址查找表", link: "advanced/lookup-tables" },
        { text: "交易确认及过期", link: "advanced/confirmation" },
        { text: "重试交易", link: "advanced/retry" },
        { text: "状态压缩", link: "advanced/state-compression" },
      ],
    },
    {
      text: "Solana客户端",
      collapsed: false,
      items: [
        { text: "Rust", link: "clients/rust" },
        { text: "JavaScript/TypeScript", link: "clients/javascript" },
        { text: "Web3.js API 范例", link: "clients/javascript-reference" },
      ],
    },
    {
      text: "经济",
      collapsed: false,
      items: [
        {
          text: "质押",
          collapsed: false,
          items: [
            { text: "质押编程", link: "economics/staking/stake-programming" },
          ],
        },
      ],
    },
  ];
}

function sidebarSolanaValidatorDocumentation(): DefaultTheme.SidebarItem[] {
  return [
    { text: "首页", link: "index" },
    {
      text: "介绍",
      collapsed: false,
      items: [
        {
          text: "什么是验证者",
          link: "what-is-a-validator",
        },
        { text: "什么是RPC节点", link: "what-is-an-rpc-node" },
        { text: "关于验证者的常见问题", link: "faq" },
        { text: "向后兼容性策略", link: "backwards-compatibility" },
      ],
    },
    {
      text: "命令行CLI工具",
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
        },{
          text: "命令行钱包",
          collapsed: false,
          items: [
            {
              text: "硬件钱包",
              collapsed: false,
              items: [
                {
                  text: "在Solana CLI中使用",
                  link: "cli/wallets/hardware/index",
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

function sidebarSolanaProgramLibrary(): DefaultTheme.SidebarItem[] {
  return [
    { text: "介绍", link: "index" },
    { text: "Token程序", link: "token" },
    {
      text: "Token2022",
      collapsed: false,
      items: [
        { text: "Token2022程序", link: "token-2022/index" },
        { text: "项目状态", link: "token-2022/status" },
        { text: "扩展指南", link: "token-2022/extensions" },
        { text: "钱包指南", link: "token-2022/wallet" },
        { text: "链上程序指南", link: "token-2022/onchain" },
        { text: "幻灯片演示", link: "token-2022/presentation" },
      ],
    },
    { text: "Token 兑换程序", link: "token-swap" },
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
      "/SolanaValidatorDocumentation/": {
        base: "/SolanaValidatorDocumentation/",
        items: sidebarSolanaValidatorDocumentation(),
      },
      "/SolanaProgramLibrary/": {
        base: "/SolanaProgramLibrary/",
        items: sidebarSolanaProgramLibrary(),
      },
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
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "无法找到相关结果",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
            },
          },
        },
      },
    },
  },
});
