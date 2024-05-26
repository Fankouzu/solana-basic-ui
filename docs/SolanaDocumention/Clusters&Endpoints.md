# 群集和公共 RPC 端点

Solana区块链有几个不同的验证节点组，称为[集群](https://solana.com/zh/docs/core/clusters)。每个集群在整体生态系统中承担不同的任务，并包含专用的API节点来处理其各自集群的[JSON-RPC](https://solana.com/zh/docs/rpc)请求。

集群内的各个节点由第三方拥有和操作，每个节点都有一个公共端点。

## Solana公共RPC端点

Solana Labs团队为每个集群操作一个公共RPC端点。每个公共端点都受到速率限制，但用户和开发者可以通过这些端点与Solana区块链进行交互。

> 小贴士
>
> 公共端点速率限制可能会发生变化。本文档中列出的特定速率限制不保证是最新的。

### 使用不同集群的区块链浏览器

许多流行的Solana区块链浏览器支持选择任意集群，通常还允许高级用户添加自定义/私有RPC端点。

一些Solana区块链浏览器示例包括：

- [http://explorer.solana.com/](https://explorer.solana.com/).
- [http://solana.fm/](https://solana.fm/).
- [http://solscan.io/](https://solscan.io/).
- [http://solanabeach.io/](http://solanabeach.io/).
- [http://validators.app/](http://solanabeach.io/).

## 开发网

开发网是一个供任何人试用Solana的操作场所，无论是用户、代币持有者、应用开发者还是验证节点。

- 应用开发者应该对标开发网。
- 潜在的验证节点应首先对标开发网。

- 开发网和主网的关键区别：

  - 开发网代币**不是真实的**

  - 开发网包含一个用于应用测试空投的代币水龙头

  - 开发网可能会进行账本重置

  - 开发网通常运行与主网相同的软件发布分支版本，但可能运行比主网更高的小版本。

- 开发网中用于节点之间进行信息传递的入口点：`entrypoint.devnet.solana.com:8001`

### 开发网端点

- `https://api.devnet.solana.com` - 单个Solana Labs团队托管的API节点；有速率限制

#### **Solana命令行配置示例**

要使用Solana CLI连接到开发网集群：

```shell
solana config set --url https://api.devnet.solana.com
```

### 开发网速率限制

- 每10秒每IP的最大请求数：100
- 每10秒每IP的单个RPC最大请求数：40
- 每IP的最大并发连接数：40
- 每10秒每IP的最大连接速率：40
- 每30秒的最大数据量：100 MB

## 测试网

测试网是Solana核心贡献者在一个实时集群上进行最近发布功能的压力测试的地方，特别关注网络性能、稳定性和验证节点行为。

- 测试网代币**不是真实的**
- 测试网可能会进行账本重置
- 测试网包含一个用于应用测试空投的代币水龙头
- 测试网通常运行比开发网和主网更为新的软件发布分支

- 测试网中用于节点之间进行信息传递的入口点：`entrypoint.testnet.solana.com:8001`

### 测试网端点

- `https://api.testnet.solana.com` - 单个Solana Labs团队托管的API节点；有速率限制

#### **Solana命令行配置示例**
要使用Solana CLI连接到Testnet集群：

```shell
solana config set --url https://api.testnet.solana.com
```

### 测试网速率限制

- 每10秒每IP的最大请求数：100
- 每10秒每IP的单个RPC最大请求数：40
- 每IP的最大并发连接数：40
- 每10秒每IP的最大连接速率：40
- 每30秒的最大数据量：100 MB

## 主网 beta版



一个为Solana用户、开发者、验证节点和代币持有者提供的无许可、持久的集群。

- 主网 beta版上发行的代币是**真实**的SOL

- 主网 beta版中用于节点之间进行信息传递的入口点：`entrypoint.mainnet-beta.solana.com:8001`

### 主网 beta版端点
`https://api.mainnet-beta.solana.com` - Solana Labs托管的API节点集群，由负载均衡器支持；有速率限制

##### **Solana命令行配置示例**
要使用Solana CLI连接到主网 beta版集群：

```shell
solana config set --url https://api.mainnet-beta.solana.com
```

### 主网 beta版速率限制

- 每10秒每IP的最大请求数：100
- 每10秒每IP的单个RPC最大请求数：40
- 每IP的最大并发连接数：40
- 每10秒每IP的最大连接速率：40
- 每30秒的最大数据量：100 MB

> 小贴士
>
> 公共RPC端点并不适用于生产环境的应用程序。当您启动应用程序、发行NFT等时，请使用专用/私有RPC服务器。公共服务可能会被滥用，并且速率限制可能会在没有事先通知的情况下更改。同样，高流量网站也可能在没有事先通知的情况下被封锁。

## 常见HTTP错误代码

- 403 -- 您的IP地址或网站已被封锁。是时候运行您自己的RPC服务器或找到私人服务了。
- 429 -- 您的IP地址超出了速率限制。请放慢速度！使用[Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After) HTTP响应头来确定在再次发出请求之前需要等待多长时间。