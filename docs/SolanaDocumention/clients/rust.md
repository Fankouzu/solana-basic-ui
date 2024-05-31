# Solana的Rust客户端

Solana的Rust包已经发布到[crates.io](https://crates.io/search?q=solana-)，并且可以在[docs.rs](https://solana.com/docs/clients/rust#rust-crates)上以`solana-`前缀找到。

> 
> **HELLO WORLD：开始SOLANA开发**
> 
> 要快速开始Solana开发并构建你的第一个Rust程序，请查看以下详细的快速入门指南：
> 
> *   [使用浏览器构建并部署你的第一个Solana程序。](https://solana.com/developers/guides/getstarted/hello-world-in-your-browser)无需安装。
> 
> *   [在本地本地环境设置并使用本地的测试验证器。](https://solana.com/developers/guides/getstarted/setup-local-development)

## Rust 包

以下是Solana开发中最重要且常用的Rust包：
*   [`solana-program`](https://docs.rs/solana-program/latest/solana_program/) — 由在Solana上运行的程序导入，编译为SBF。该包包含许多基本数据类型，并从[`solana-sdk`](https://docs.rs/solana-sdk/latest/solana_sdk/)重导出，Solana程序无法直接导入该包。

*   [`solana-sdk`](https://docs.rs/solana-sdk/latest/solana_sdk/) — 基本的离线SDK，它重导出[`solana-program`](https://docs.rs/solana-program/latest/solana_program/)并在其上添加更多API。大多数不在链上运行的Solana程序将导入此包。

*   [`solana-client`](https://docs.rs/solana-client/latest/solana_client/) — 通过[JSON RPC API](https://solana.com/docs/rpc)与Solana节点交互。

*   [`solana-cli-config`](https://docs.rs/solana-cli-config/latest/solana_cli_config/) — 加载和保存Solana CLI配置文件。

*   [`solana-clap-utils`](https://docs.rs/solana-clap-utils/latest/solana_clap_utils/) — 使用 [`clap`](https://docs.rs/clap/latest/clap/) 设置 CLI 的例程，如主 Solana CLI 所使用的那样。包括加载 CLI 支持的所有类型签名者的功能。
