import { defineConfig, type DefaultTheme } from "vitepress";

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: "官方文档",
      items: [
        {
          text: "Solana中文文档",
          link: "/SolanaDocumention/home",
          activeMatch: "/SolanaDocumention/",
        },
        {
          text: "Solana验证器文档",
          link: "/SolanaValidatorDocumentation/home",
          activeMatch: "/SolanaValidatorDocumentation/",
        },
        {
          text: "Solana程序库",
          link: "/SolanaProgramLibrary/home",
          activeMatch: "/SolanaProgramLibrary/",
        },
      ],
    },
    {
      text: "社区教程",
      items: [
        {
          text: "Solana Basic",
          link: "/SolanaBasic/000",
          activeMatch: "/SolanaBasic/",
        },
        {
          text: "Solana Action & Blink",
          link: "/SolanaAction/001",
          activeMatch: "/SolanaAction/",
        },
      ],
    },
    {
      text: "资源导航",
      items: [
        {
          text: "浏览器",
          link: "/SolanaResources/explorer",
          activeMatch: "/SolanaResources/explorer",
        },
        {
          text: "基础设施",
          link: "/SolanaResources/infrastructure",
          activeMatch: "/SolanaResources/infrastructure",
        },
        {
          text: "信息查询",
          link: "/SolanaResources/information",
          activeMatch: "/SolanaResources/information",
        },
        {
          text: "钱包",
          link: "/SolanaResources/wallets",
          activeMatch: "/SolanaResources/wallets",
        },
        {
          text: "资产查询",
          link: "/SolanaResources/assets",
          activeMatch: "/SolanaResources/assets",
        },
        {
          text: "Defi",
          link: "/SolanaResources/defi",
          activeMatch: "/SolanaResources/defi",
        },
      ],
    },
    {
      text: "Solana黑客松",
      items:[
        {
          text: "介绍",
          link: "/Hackathon/01.md",
          activeMatch: "/Hackathon/01",
        },
        {
          text: "资源",
          link: "/Hackathon/res.md",
          activeMatch: "/Hackathon/res",
        },
        {
          text: "FAQ",
          link: "/Hackathon/faq.md",
          activeMatch: "/Hackathon/faq",
        },
      ]
    },
    {
      text: "加入Solar社区",
      link: "/Solar/01.md",
      activeMatch: "/Solar",
    },
  ];
}

function sidebarSolanaResources(): DefaultTheme.SidebarItem[] {
  return [
    { text: "浏览器", link: "explorer" },
    { text: "基础设施", link: "infrastructure" },
    { text: "信息查询", link: "information" },
    { text: "钱包", link: "wallets" },
    { text: "资产查询", link: "assets" },
    { text: "Defi", link: "defi" },
  ];
}
function sidebarSolanaBasic(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "第一阶段：账户与代币",
      collapsed: false,
      items: [
        { text: "核心概念", link: "000" },
        { text: "客户端安装", link: "001" },
        { text: "代币基础", link: "002" },
        { text: "非同质化代币", link: "003" },
      ],
    },
    {
      text: "第二阶段：脚本互动",
      collapsed: false,
      items: [
        { text: "账户", link: "004" },
        { text: "版本化交易", link: "005" },
        { text: "包装SOL", link: "006" },
        { text: "创建代币", link: "007" },
        { text: "非同质化代币", link: "008" },
      ],
    },
    {
      text: "第三阶段：",
      collapsed: false,
      items: [
        { text: "糖果机概述", link: "009" },
        { text: "配置糖果机", link: "010" },
        { text: "管理糖果机", link: "011" },
        { text: "插入项目", link: "012" },
        { text: "糖果卫士", link: "013" },
        { text: "卫士组", link: "014" },
        { text: "铸造", link: "015" },
      ],
    },
  ];
}
function sidebarSolanaDocumention(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Solana文档",
      link: "home",
      collapsed: false,
      items: [{ text: "术语", link: "terminology" }],
    },
    {
      text: "简介",
      collapsed: false,
      items: [
        { text: "概述", link: "intro/overview" },
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
        { text: "跨程序调用", link: "core/cpl" },
        { text: "Solana链上代币", link: "core/tokens" },
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
      text: "Solana 经济",
      collapsed: false,
      link: "economics/economics",
      items: [
        {
          text: "通胀",
          collapsed: true,
          items: [
            {
              text: "通胀计划",
              link: "economics/inflation/inflation-schedule",
            },
            { text: "通胀术语", link: "economics/inflation/terminology" },
          ],
        },
        {
          text: "质押",
          link: "economics/staking/staking",
          collapsed: true,
          items: [
            { text: "质押编程", link: "economics/staking/stake-programming" },
            { text: "质押账户", link: "economics/staking/stake-accounts" },
          ],
        },
      ],
    },
    {
      text: "开发程序",
      collapsed: false,
      items: [
        { text: "概述", link: "programs/overview" },
        { text: "调试程序", link: "programs/debugging" },
        { text: "部署程序", link: "programs/deploying" },
        { text: "程序示例", link: "programs/examples" },
        { text: "常见问题", link: "programs/faq" },
        { text: "使用C语言开发", link: "programs/lang-c" },
        { text: "使用Rust语言开发", link: "programs/lang-rust" },
        { text: "局限性", link: "programs/limitations" },
      ],
    },
    {
      text: "更多",
      collapsed: false,
      base: "/SolanaDocumention/more/",
      items: [{ text: "将 Solana 添加到您的交易所", link: "exchange" }],
    },
  ];
}

function sidebarSolanaValidatorDocumentation(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Solana验证器文档",
      items: [
        {
          text: "首页",
          link: "home",
        },
        {
          text: "介绍",
          collapsed: false,
          items: [
            {
              text: "什么是验证器",
              link: "what-is-a-validator",
            },
            { text: "什么是RPC节点", link: "what-is-an-rpc-node" },
            { text: "关于验证器的常见问题", link: "faq" },
            { text: "向后兼容性策略", link: "backwards-compatibility" },
          ],
        },
        {
          text: "命令行CLI工具",
          collapsed: false,
          items: [
            { text: "概述", link: "cli/cli" },
            { text: "安装 Solana CLI", link: "cli/install" },
            { text: "Solana CLI介绍", link: "cli/intro" },
            { text: "参考和用法", link: "cli/usage" },
            {
              text: "命令行钱包",
              collapsed: false,
              items: [
                {
                  text: "概述",
                  link: "cli/wallets/wallets",
                },
                {
                  text: "纸质钱包",
                  link: "cli/wallets/paper",
                },
                {
                  text: "文件系统钱包",
                  link: "cli/wallets/file-system",
                },
                {
                  text: "硬件钱包",
                  collapsed: false,
                  items: [
                    {
                      text: "在Solana CLI中使用",
                      link: "cli/wallets/hardware/hardware",
                    },
                    {
                      text: "Ledger Nano",
                      link: "cli/wallets/hardware/ledger",
                    },
                  ],
                },
              ],
            },
            {
              text: "命令示例",
              collapsed: false,
              items: [
                {
                  text: "连接到集群",
                  link: "cli/examples/choose-a-cluster",
                },
                {
                  text: "质押",
                  link: "cli/examples/delegate-staking",
                },
                {
                  text: "部署程序",
                  link: "cli/examples/deploy-a-program",
                },
                {
                  text: "持久化交易随机数",
                  link: "cli/examples/durable-nonce",
                },
                {
                  text: "离线交易签名",
                  link: "cli/examples/offline-signing",
                },
                {
                  text: "链下消息签名",
                  link: "cli/examples/sign-offchain-message",
                },
                {
                  text: "测试验证器",
                  link: "cli/examples/test-validator",
                },
                {
                  text: "发送与接收代币",
                  link: "cli/examples/transfer-tokens",
                },
              ],
            },
          ],
        },
        {
          text: "架构",
          collapsed: false,
          items: [
            { text: "概述", link: "architecture" },
            {
              text: "集群",
              collapsed: false,
              items: [
                { text: "概述", link: "clusters/clusters" },
                { text: "Solana可用集群", link: "clusters/availiable" },
                { text: "集群性能基准测试", link: "clusters/benchmark" },
                { text: "集群性能指标", link: "clusters/metrics" },
              ],
            },
            {
              text: "共识",
              collapsed: false,
              items: [
                { text: "Solana承诺状态", link: "consensus/commitments" },
                { text: "分叉生成", link: "consensus/fork-generation" },
                { text: "管理分叉", link: "consensus/managing-forks" },
              ],
            },
          ],
        },
        {
          text: "运行验证器",
          collapsed: false,
          items: [
            { text: "运行验证器", link: "operations/operations" },
            {
              text: "验证者节点 vs RPC节点",
              link: "operations/validator-or-rpc-node",
            },
            { text: "准备工作", link: "operations/prerequisites" },
          ],
        },
      ],
    },
  ];
}

function sidebarSolanaProgramLibrary(): DefaultTheme.SidebarItem[] {
  return [
    { text: "介绍", link: "home" },
    { text: "Token程序", link: "token" },
    {
      text: "Token2022",
      collapsed: false,
      items: [
        { text: "Token2022程序", link: "token-2022/token-2022" },
        { text: "项目状态", link: "token-2022/status" },
        { text: "扩展指南", link: "token-2022/extensions" },
        { text: "钱包指南", link: "token-2022/wallet" },
        { text: "链上程序指南", link: "token-2022/onchain" },
        { text: "幻灯片演示", link: "token-2022/presentation" },
      ],
    },
    { text: "Token 兑换程序", link: "token-swap" },

    { text: "代币升级程序", link: "token-upgrade" },
    { text: "备忘录程序", link: "memo" },
    { text: "域名服务", link: "name-service" },
    { text: "共享内存程序", link: "shared-memory" },
    {
      text: "质押池",
      collapsed: false,
      items: [{ text: "质押池介绍", link: "stake-pool/stake-pool" }],
    },
    { text: "单一验证节点质押池", link: "single-pool" },
    {
      text: "转账钩子接口",
      collapsed: false,
      items: [
        { text: "介绍", link: "transfer-hook-interface" },
        { text: "规范", link: "transfer-hook-interface/specification" },
        {
          text: "配置额外账户",
          link: "transfer-hook-interface/configuring-extra-accounts",
        },
        { text: "示例", link: "transfer-hook-interface/examples" },
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
    logo: "/solanaLogoMark.svg",
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
      "/SolanaBasic/": {
        base: "/SolanaBasic/",
        items: sidebarSolanaBasic(),
      },
      "/SolanaResources/": {
        base: "/SolanaResources/",
        items: sidebarSolanaResources(),
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
