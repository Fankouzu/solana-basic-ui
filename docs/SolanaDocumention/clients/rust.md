# Solana的Rust客户端库

Solana的Rust包已经发布到[crates.io](https://crates.io/search?q=solana-)，并且可以在[docs.rs](https://solana.com/docs/clients/rust#rust-crates)上以`solana-`前缀找到。

::: tip HELLO WORLD：开始SOLANA开发

要快速开始Solana开发并构建你的第一个Rust程序，请查看以下详细的快速入门指南：

*   [使用浏览器构建并部署你的第一个Solana程序](https://solana.com/developers/guides/getstarted/hello-world-in-your-browser)并无需安装。

*   [在本地本地环境设置](https://solana.com/developers/guides/getstarted/setup-local-development)并使用本地的测试验证器。

:::

## Rust 包

以下是Solana开发中最重要且常用的Rust包：
*   [solana-program](https://docs.rs/solana-program/latest/solana_program/) — 由运行在 Solana 上的程序导入并编译为 SBF类型。包含许多基本数据类型，并从[solana-sdk](https://docs.rs/solana-sdk/latest/solana_sdk/)重新导出，Solana程序无法直接导入该包。

*   [solana-sdk](https://docs.rs/solana-sdk/latest/solana_sdk/) — 基本的链下SDK，它在此基础上重新导出[solana-program](https://docs.rs/solana-program/latest/solana_program/)并在其上添加更多API。大多数不在链上运行的Solana程序都会导入它。

*   [solana-client](https://docs.rs/solana-client/latest/solana_client/) — 通过[JSON RPC API](https://solana.com/docs/rpc)与Solana节点交互。

*   [solana-cli-config](https://docs.rs/solana-cli-config/latest/solana_cli_config/) — 加载和保存Solana CLI配置文件。

*   [solana-clap-utils](https://docs.rs/solana-clap-utils/latest/solana_clap_utils/) — 用于设置命令行界面（CLI）的步骤，使用[clap](https://docs.rs/clap/latest/clap/) 库，就像 Solana 主命令行界面那样。它包括了加载所有 CLI 支持的签名者类型的功能。
