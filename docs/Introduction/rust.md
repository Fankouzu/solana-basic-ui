# Rust Client for Solana
# Solana的Rust客户端

Solana's Rust crates are published to crates.io and can be found on docs.rs with the `solana-` prefix.

Solana的Rust包已经发布到[crates.io](https://crates.io/search?q=solana-)，并且可以在[docs.rs](https://solana.com/docs/clients/rust#rust-crates)上以`solana-`前缀找到。


> **HELLO WORLD: GET STARTED WITH SOLANA DEVELOPMENT**
> 
> **HELLO WORLD：开始SOLANA开发**
> 
> To quickly get started with Solana development and build your first Rust program, take a look at these detailed quick start guides:
> 
> 要快速开始Solana开发并构建你的第一个Rust程序，请查看以下详细的快速入门指南：
> 
> * Build and deploy your first Solana program using only your browser. No installation needed.
> *   [使用浏览器构建并部署你的第一个Solana程序。](https://solana.com/developers/guides/getstarted/hello-world-in-your-browser)无需安装。
> 
> *   Setup your local environment and use the local test validator.
> *   [在本地本地环境设置并使用本地的测试验证器。](https://solana.com/developers/guides/getstarted/setup-local-development)

## Rust Crates \#

## Rust 包 \#

The following are the most important and commonly used Rust crates for Solana development:

以下是Solana开发中最重要且常用的Rust包：

*   `solana-program` — Imported by programs running on Solana, compiled to SBF. This crate contains many fundamental data types and is re-exported from `solana-sdk`, which cannot be imported from a Solana program.
*   [`solana-program`](https://docs.rs/solana-program/latest/solana_program/) — 由在Solana上运行的程序导入，编译为SBF。该包包含许多基本数据类型，并从[`solana-sdk`](https://docs.rs/solana-sdk/latest/solana_sdk/)重导出，Solana程序无法直接导入该包。

*   `solana-sdk` — The basic off-chain SDK, it re-exports `solana-program` and adds more APIs on top of that. Most Solana programs that do not run on-chain will import this.
*   [`solana-sdk`](https://docs.rs/solana-sdk/latest/solana_sdk/) — 基本的离线SDK，它重导出[`solana-program`](https://docs.rs/solana-program/latest/solana_program/)并在其上添加更多API。大多数不在链上运行的Solana程序将导入此包。

*   `solana-client` — For interacting with a Solana node via the JSON RPC API.
*   [`solana-client`](https://docs.rs/solana-client/latest/solana_client/) — 通过[JSON RPC API](https://solana.com/docs/rpc)与Solana节点交互。

*   `solana-cli-config` — Loading and saving the Solana CLI configuration file.
*   [`solana-cli-config`](https://docs.rs/solana-cli-config/latest/solana_cli_config/) — 加载和保存Solana CLI配置文件。

*   `solana-clap-utils` — Routines for setting up a CLI, using `clap`, as used by the main Solana CLI. Includes functions for loading all types of signers supported by the CLI.
*   [`solana-clap-utils`](https://docs.rs/solana-clap-utils/latest/solana_clap_utils/) — 使用 [`clap`](https://docs.rs/clap/latest/clap/) 设置 CLI 的例程，如主 Solana CLI 所使用的那样。包括加载 CLI 支持的所有类型签名者的功能。
