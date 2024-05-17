# 安装SPL-Token客户端
命令spl-token行实用程序可用于创建SPL代币。在安装spl-token命令之前，需要安装[Rust](https://rustup.rs/)
## 安装
```sh
$ cargo install spl-token-cli
```
运行```spl-token --help```以获得可用命令的完整描述。

- spl-token命令的配置与solana命令行工具共享
- 通过运行solana命令行工具查询当前配置：
```sh
$ solana config get
Config File: /Users/you/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /Users/you/.config/solana/id.json
```
## 验证
```sh
$ spl-token -V
spl-token-cli 3.3.0
```