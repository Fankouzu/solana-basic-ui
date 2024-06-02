# 通过 Solana 命令行界面（CLI）连接到集群

有关可用集群的一般信息，请参阅[Solana 集群](https://docs.solanalabs.com/clusters/available)。

## 配置命令行工具

您可以通过运行以下命令来查看 Solana CLI 当前针对的是哪个集群：

```
solana config get
```

使用 `solana config set` 命令来定位特定的集群。设置集群目标后，任何未来的子命令都将在该集群上发送或接收信息。

例如想要定位到开发网集群，请运行：

```
solana config set --url https://api.devnet.solana.com
```

## 确保版本匹配

尽管不是严格必要，但当 CLI 的版本与集群上运行的软件版本相匹配时， CLI 通常能更好地工作。 要获取本地安装的 CLI 版本，请运行：

```
solana --version
```

要获取集群的版本，请运行：

```
solana cluster-version
```

请确保本地的 CLI 版本大于或者等于集群的版本。