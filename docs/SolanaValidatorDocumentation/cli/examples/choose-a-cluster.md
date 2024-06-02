# 通过 Solana 命令行界面（CLI）连接到集群

在[Solana 集群](https://docs.solanalabs.com/clusters/available)中查看有关可用集群的相关信息。

## 配置命令行工具

您可以通过运行以下命令来查看 Solana CLI 当前对应的是哪个集群：

```bash
solana config get
```

使用 `solana config set` 命令来设定集群。任何未来的子命令都将在你设置的集群上发送或接收信息。

例如想要连接到开发网集群，请运行：

```bash
solana config set --url https://api.devnet.solana.com
```

## 确保版本匹配

虽然不是绝对必要的，但当 CLI 的版本与集群上运行的软件版本匹配时，CLI 通常效果最佳。若要获取本地安装的 CLI 版本，请运行：

```bash
solana --version
```

若要获取群集版本，请运行：

```bash
solana cluster-version
```

确保本地 CLI 版本大于或等于集群版本。
