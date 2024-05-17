# 安装Solana命令行

## 安装
- 首先安装solana命令行，也就是solana客户端，这个安装过程需要科学上网
```sh
$ sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
downloading stable installer
✨ stable commit cd1c6d0 initialized
Adding
export PATH="/Users/you/.local/share/solana/install/active_release/bin:$PATH" to /Users/you/.profile

Close and reopen your terminal to apply the PATH changes or run the following in your existing shell:

export PATH="/Users/you/.local/share/solana/install/active_release/bin:$PATH"
```
## 验证
```sh
$ solana --version
solana-cli 1.18.4 (src:356c6a38; feat:3352961542, client:SolanaLabs)
```
## 设置网络环境
Solana的网络环境分成开发网、测试网、主网三个网络集群
官方RPC地址分别是：

DevNet: https://api.devnet.solana.com
TestNet: https://api.testnet.solana.com
MainNet: https://api.mainnet-beta.solana.com
- 将默认的命令行链接到开发网
```sh
$ solana config set --url https://api.devnet.solana.com
Config File: /Users/you/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /Users/you/.config/solana/id.json
Commitment: confirmed
```
## 创建账号
```sh
$ solana-keygen new --force
Generating a new keypair

For added security, enter a BIP39 passphrase

NOTE! This passphrase improves security of the recovery seed phrase NOT the
keypair file itself, which is stored as insecure plain text

BIP39 Passphrase (empty for none): 

Wrote new keypair to /Users/you/.config/solana/id.json
=======================================================================
pubkey: CAA2QJN8KrkZgsiEbvtx2JV6iWpDLBnfeTj9ZXwnujKh
=======================================================================
Save this seed phrase and your BIP39 passphrase to recover your new keypair:
sad practice lawn chief drive ...
=======================================================================
```
- keypair文件被加密存在存在"/Users/<你的用户名>/.config/solana/id.json"这个文件中
- 这个keypair对应的助记词为：```sad practice lawn chief drive ...```
- 对应的账户地址为：```CAA2QJN8KrkZgsiEbvtx2JV6iWpDLBnfeTj9ZXwnujKh```

## 获取公钥

```sh
$ solana-keygen pubkey
```


## 申请测试币
```sh
$ solana airdrop 1
```
## 查询余额
```sh
$ solana balance
```
## 转账
```sh
$ solana transfer --allow-unfunded-recipient CAA2QJN8KrkZgsiEbvtx2JV6iWpDLBnfeTj9ZXwnujKh 0.01
```

## 确认交易
```sh
// Command
$ solana confirm <TX_SIGNATURE>

// Return
"Confirmed" / "Not found" / "Transaction failed with error <ERR>"
```

## 部署程序
```sh
// Command
$ solana program deploy <PATH>

// Return
<PROGRAM_ID>
```
