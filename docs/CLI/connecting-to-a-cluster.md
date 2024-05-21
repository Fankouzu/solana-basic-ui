# 使用 Solana CLI 连接到集群

## 配置命令行工具

查看当前连接的集群

```sh
$ solana config get
```

使用solana config set命令来连接到特定的集群。设置后，任何未来的子命令将会发送/接收来自该集群的信息。

例如，要连接到 Devnet 集群，请运行：

```sh
$ solana config set --url https://api.devnet.solana.com
```

## 确保版本匹配

最好本地CLI版本大于或等于集群版本。

要获取本地安装的 CLI 版本，请运行：

```sh
$ solana --version
```

要获取集群版本，请运行：

```sh
$ solana cluster-version
```

