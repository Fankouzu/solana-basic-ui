#  验证者节点配置

本节是首次在Solana测试网集群上配置验证者节点的指南。测试网是Solana的一个集群，用于主网之前测试软件性能。由于测试网每天都会进行压力测试，因此它是练习维护验证者节点的良好集群。

一旦您在测试网上有一个正常运行的验证者节点，您将希望在下一部分了解[操作最佳实践](https://docs.solanalabs.com/operations/best-practices/general)。尽管该指南特定用于测试网，但也可以调整为适用于主网或开发网集群。

请参考文档中的[可用集群](https://docs.solanalabs.com/clusters/available)部分，查看每个集群的示例命令。

现在让我们开始吧。

## 打开终端程序

在本指南的开始，您将在信任的计算机上运行命令，而不是在您计划用于维护验证者节点的远程机器上运行。首先，找到您信任的计算机上的终端程序。

- 在 Mac 上，您可以在 Spotlight 中搜索`terminal`。

- 在 Ubuntu 上，您可以按下 `CTRL + Alt + T` 打开终端。

- 在 Windows 上，您需要以管理员身份打开命令提示符。

## 本地安装Solana CLI

为了创建验证者节点投票账户，您需要在本地计算机上安装[Solana命令行接口（CLI）](https://docs.solanalabs.com/cli/)。

您可以使用Solana文档中的[安装工具](https://docs.solanalabs.com/cli/install#use-solanas-install-tool)部分安装CLI，或者您也可以选择[从源代码构建](https://docs.solanalabs.com/cli/install#build-from-source)。

> 从源代码构建对于那些希望获得更安全和潜在性能更优越的可执行文件是一个很好的选择。

安装了 Solana CLI 后，您可以在能够运行以下命令并在终端上得到响应后返回到本文档：

```
solana --version
```

您应该会看到类似以下的输出（请注意您的版本号可能会更高）：

```
solana-cli 1.14.17 (src:b29a37cf; feat:3488713414)
```

成功安装 cli 后，下一步就是更改配置，使其向 `testnet` 集群发出请求：

```
solana config set --url https://api.testnet.solana.com
```

要验证配置是否已更改，请运行

```
solana config get
```

你应该看到一行字：`RPC URL: https://api.testnet.solana.com`

## 创建私钥

在本地计算机上创建运行验证程序所需的 3 对密钥对（[参考文档](https://docs.solanalabs.com/operations/guides/validator-start#generate-identity)）：

> **注意:** 有些维护者选择使用 grind 子命令（[参考文档](https://docs.solanalabs.com/operations/guides/validator-start#vanity-keypair)）创建虚假密钥对作为身份和投票账户。

```
solana-keygen new -o validator-keypair.json
```

```
solana-keygen new -o vote-account-keypair.json
```

```
solana-keygen new -o authorized-withdrawer-keypair.json
```

> **重要提示：**authorized-withdrawer-keypair.json 应被视为非常敏感的信息。许多节点维护者选择使用多重签名、硬件钱包或纸质钱包作为可授权提款人密钥对。在本示例中，为了简单起见，密钥对被创建在磁盘上。此外，提款人密钥对应始终安全存储。可授权提款人密钥对**永远不应该**存储在验证者节点运行的远程机器上。获取更多信息，请参阅[验证者节点安全最佳实践](https://docs.solanalabs.com/operations/best-practices/security#do-not-store-your-withdrawer-key-on-your-validator)。

## 创建投票账户

在您创建投票账户之前，您需要进一步配置Solana命令行工具。

以下命令将Solana CLI默认使用的密钥对设置为您在终端中刚刚创建的 `validator-keypair.json` 文件：

```
solana config set --keypair ./validator-keypair.json
```

现在验证您的账户余额为 0：

```
solana balance
```

接下来，您需要向该密钥对账户中存入一些 SOL 以便创建交易（在本例中是创建您的投票账户）：

```
solana airdrop 1
```

> **注意：**airdrop 子命令在主网上不起作用，因此如果您要设置主网验证器，您需要获取 SOL 并将其转入该密钥对账户。

现在，使用Solana集群创建一个投票账户。

作为提醒，到目前为止提到的所有命令都**应该在您信任的计算机上**执行，**而不是**您计划运行验证者节点的服务器上。特别重要的是，以下命令必须在**信任的计算机**上执行：

```
solana create-vote-account -ut \
    --fee-payer ./validator-keypair.json \
    ./vote-account-keypair.json \
    ./validator-keypair.json \
    ./authorized-withdrawer-keypair.json
```

> **注意：**`-ut` 告诉CLI命令我们要使用测试网集群。`--fee-payer` 指定了用于支付交易费用的密钥对。如果您已经正确配置了Solana CLI，则这两个标志都不是必需的，但它们有助于确保您使用的是预期的集群和密钥对。

## 安全存储提款人密钥对

确保您的 `authorized-withdrawer-keypair.json` 被存储在一个安全的地方。如果您选择在磁盘上创建了密钥对，您应该首先备份该密钥对，然后从本地机器上删除它。

> **重要提示：**如果您丢失了提款人密钥对，您将失去对投票账户的控制权。您将无法从投票账户中提取代币或更新提款人。在继续之前，请确保安全地存储 `authorized-withdrawer-keypair.json`。

## 使用SSH登录到验证者节点

连接到您的远程服务器。具体到您的服务器，命令类似如下：

```
ssh user@<server.hostname>
```

您需要查询您的服务器提供商提供的正确的用户账户和主机名，以便使用 ssh 进行连接。

## 更新您的 Ubuntu 软件包

确保您的服务器上安装了最新的软件包版本：

```
sudo apt update
sudo apt upgrade
```

## Sol 用户

为运行验证者节点创建一个新的Ubuntu用户，名为`sol`：

```
sudo adduser sol
```

最佳实践是始终将您的验证者节点作为非root用户运行，就像我们刚刚创建的`sol`用户一样。

## 硬盘配置

在您的Ubuntu计算机上确保至少挂载了`2TB`的磁盘空间。您可以使用`df`命令检查磁盘空间使用情况：

```
df -h
```

> 如果有未挂载/未格式化的硬盘，您需要设置分区并挂载该硬盘。

要查看可用的硬盘设备，请使用以下命令列出块设备：

```
lsblk -f
```

您可能会看到列表中一些设备有名称但没有UUID。任何没有UUID的设备都是未格式化的。

### 硬盘格式化：账本

假设您有一个未格式化的NVMe驱动器，您需要先格式化该驱动器，然后再挂载它。

例如，如果您的计算机上有一个设备位于 `/dev/nvme0n1`，那么您可以使用以下命令格式化该驱动器：

```
sudo mkfs -t ext4 /dev/nvme0n1
```

对于您的计算机，设备名称和位置可能不同。

接下来，检查您现在是否有该设备的UUID：

```
lsblk -f
```

在第四列，设备名称旁边，您应该看到一个类似于这样的字母和数字串：`6abd1aa5-8422-4b18-8058-11f821fd3967`。这就是该设备的UUID。

### 挂载您的硬盘：账本

到目前为止，我们已经创建了一个格式化的驱动器，但在挂载它之前，您无法访问它。首先，创建一个用于挂载驱动器的目录：

```
sudo mkdir -p /mnt/ledger
```

接下来，将该目录的所有权更改为您的`sol`用户：

```
sudo chown -R sol:sol /mnt/ledger
```

现在您可以挂载驱动器了：

```
sudo mount /dev/nvme0n1 /mnt/ledger
```

### 格式化和挂载磁盘：账户数据库

您还希望将账户数据库（accounts db）挂载到一个单独的硬盘驱动器上。这个过程类似于上面的账本示例。

假设您的设备位于 `/dev/nvme1n1`，首先格式化该设备并验证其存在：

```
sudo mkfs -t ext4 /dev/nvme1n1
```

然后验证设备的UUID是否存在：

```
lsblk -f
```

创建一个用于挂载的目录：

```
sudo mkdir -p /mnt/accounts
```

将该目录的所有权更改为 sol 用户：

```
sudo chown -R sol:sol /mnt/accounts
```

最后，挂载驱动器：

```
sudo mount /dev/nvme1n1 /mnt/accounts
```

## 系统调优

### Linux

您的系统需要进行调优以确保验证者节点能够合理运行。如果不进行以下设置，您的验证器可能无法启动。

#### 优化 sysctl 参数

```
sudo bash -c "cat >/etc/sysctl.d/21-solana-validator.conf <<EOF
# Increase UDP buffer sizes
net.core.rmem_default = 134217728
net.core.rmem_max = 134217728
net.core.wmem_default = 134217728
net.core.wmem_max = 134217728

# Increase memory mapped files limit
vm.max_map_count = 1000000

# Increase number of allowed open file descriptors
fs.nr_open = 1000000
EOF"
```

```
sudo sysctl -p /etc/sysctl.d/21-solana-validator.conf
```

#### 增加 systemd 和 session 文件限制

如果你使用了系统服务文件，添加

```
LimitNOFILE=1000000
```

到`[Service]` 部分。否则，添加

```
DefaultLimitNOFILE=1000000
```

到`/etc/systemd/system.conf`的`[Manager]` 部分。

```
sudo systemctl daemon-reload
```

```
sudo bash -c "cat >/etc/security/limits.d/90-solana-nofiles.conf <<EOF
# Increase process file descriptor count limit
* - nofile 1000000
EOF"
```

```
### Close all open sessions (log out then, in again) ###
```

## 复制密钥对

在您的个人电脑上，而不是在验证者节点上，安全地将您的 `validator-keypair.json` 文件和 `vote-account-keypair.json` 文件复制到验证者节点服务器上可以使用以下命令：

```
scp validator-keypair.json sol@<server.hostname>:
scp vote-account-keypair.json sol@<server.hostname>:
```

> **注意：**`vote-account-keypair.json` 文件在创建账户后除了确认投票账户给潜在质押者外，没有其他功能。一旦账户创建，只有投票账户的公钥是重要的。

## 切换到sol用户

在验证者节点上，切换到`sol`用户

```
su - sol
```

## 在远程机器上安装Solana命令行

远程计算机需要安装 Solana cli 才能运行验证器软件。请再次参阅 [Solana 安装工具](https://docs.solanalabs.com/cli/install#use-solanas-install-tool)或从[源代码构建](https://docs.solanalabs.com/cli/install#build-from-source)。节点维护者最好从源代码构建，而不是使用预构建的二进制文件。

## 创建验证者节点启动脚本

在你的 sol 家目录（例如 `/home/sol/`）中创建一个名为 `bin` 的文件夹。在该文件夹中创建一个名为 `validator.sh` 的文件，并使其可执行：

```
mkdir -p /home/sol/bin
touch /home/sol/bin/validator.sh
chmod +x /home/sol/bin/validator.sh
```

接下来，打开 `validator.sh` 文件进行编辑：

```
nano /home/sol/bin/validator.sh
```

将以下内容复制并粘贴到 `validator.sh` 中，然后保存文件：

```
exec solana-validator \
    --identity validator-keypair.json \
    --vote-account vote-account-keypair.json \
    --known-validator 5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on \
    --known-validator 7XSY3MrYnK8vq693Rju17bbPkCN3Z7KvvfvJx4kdrsSY \
    --known-validator Ft5fbkqNa76vnsjYNwjDZUXoTWpP7VYm3mtsaQckQADN \
    --known-validator 9QxCLckBiJc783jnMvXZubK4wH86Eqqvashtrwvcsgkv \
    --only-known-rpc \
    --log /home/sol/solana-validator.log \
    --ledger /mnt/ledger \
    --rpc-port 8899 \
    --dynamic-port-range 8000-8020 \
    --entrypoint entrypoint.testnet.solana.com:8001 \
    --entrypoint entrypoint2.testnet.solana.com:8001 \
    --entrypoint entrypoint3.testnet.solana.com:8001 \
    --expected-genesis-hash 4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY \
    --wal-recovery-mode skip_any_corrupted_record \
    --limit-ledger-size
```

请参阅 `solana-validator --help` 以获取更多信息，了解每个参数在脚本中的作用。另请参阅[运行验证器的最佳实践](https://docs.solanalabs.com/operations/best-practices/general)。

## 确认您的验证者节点正在工作

执行 `validator.sh` 脚本，确认 `validator.sh` 文件运行正常：

```
/home/sol/bin/validator.sh
```

脚本应执行 `solana-validator` 进程。在新的终端窗口中，shh 进入服务器，然后验证进程是否正在运行：

```
ps aux | grep solana-validator
```

你应该会在输出结果中看到一行内容，其中包括已添加到 `validator.sh` 脚本中的 `solana-validator`所有参数。

接下来，我们需要查看日志，确保一切运行正常。

### tail实时查看日志文件

作为抽查，你需要确保你的验证者节点产生了合理的日志输出（**警告**，会有大量日志输出）。

在一个新的终端窗口中，ssh 进入你的验证者节点，将用户切换为 `sol` 用户，然后使用`tail`命令查看日志：

```
su - sol
tail -f solana-validator.log
```

当文件发生变化时，`tail` 命令将持续显示文件的输出。在验证者节点运行时，你应该能看到连续的日志输出流。留意是否有任何行显示 `_ERROR_`。

如果没有看到任何错误信息，请退出命令。

### Gossip协议

Gossip协议是 Solana 集群用于验证器节点间通信的协议。有关gossip的更多信息，请参[Gossip服务](https://docs.solanalabs.com/validator/gossip)。要确认验证者节点是否正常运行，请确保您的验证者已注册到gossip网络。

在新的终端窗口中，通过 ssh 连接到服务器。确认验证者节点的公钥：

```
solana-keygen pubkey ~/validator-keypair.json
```

命令 `solana gossip` 会列出所有已在协议中注册的验证者节点。为了检查新设置的验证器是否在 gossip 中，我们将在输出中 `grep` 我们的发布密钥：

```
solana gossip | grep <pubkey>
```

运行该命令后，您应该会看到如下一行：

```
139.178.68.207  | 5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on | 8001   | 8004  | 139.178.68.207:80     | 1.14.17 | 3488713414
```

如果在对 gossip 的输出进行 grep-ing 后没有看到任何输出，那么验证者节点可能出现了启动问题。如果是这种情况，请查看验证者节点日志输出开始调试。

### Solana验证者节点

确认验证者节点是否处于gossip后，可以使用 `solana validators` 命令确认验证器是否已加入网络。该命令会列出网络中的所有验证者，但和之前一样，我们可以在输出中`grep`我们所关心的验证器：

```
solana validators | grep <pubkey>
```

你应该看到这样一行输出：

```
5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on  FX6NNbS5GHc2kuzgTZetup6GZX6ReaWyki8Z8jC7rbNG  100%  197434166 (  0)  197434133 (  0)   2.11%   323614  1.14.17   2450110.588302720 SOL (1.74%)
```

### Solana Catchup

`Solana catchup` 命令是一个有用的工具，可用于查看验证者节点处理区块的速度。Solana 网络具有每秒产生大量交易的能力。由于你的验证者节点是网络的新成员，它必须向另一个验证者节点（在你的启动脚本中为`--known-validator`）下载最近的账本快照。当你收到快照时，你可能已经落后于网络。在此期间，许多交易可能已经处理并最终完成。为了让你的验证者节点参与共识，它必须*追上*网络的剩余部分，请求获得它没有的最新交易。

`Solana catchup` 命令是一种工具，它能告诉您验证者节点落后于网络多远，以及您追赶的速度有多快：

```
solana catchup <pubkey>
```

如果您看到试图连接的信息，您的验证器可能还不是网络的一部分。请务必检查日志，并仔细检查 `solana gossip` 和 `solana validators`，以确保验证程序运行正常。

一旦确认验证器可以无错启动，下一步就是创建一个系统服务来自动运行 `validator.sh` 文件。在 `validator.sh` 正在运行的窗口中按下 `CTRL+C` 键，停止当前正在运行的验证器。

## 创建系统服务

请按照以下说明将[验证者节点作为系统服务运行](https://docs.solanalabs.com/operations/guides/validator-start#systemd-unit)。

确保同时执行日志滚动。配置好系统服务后，使用新配置的服务启动验证者节点：

```
sudo systemctl enable --now sol
```

现在，通过跟踪日志和使用前面提到的命令检查 gossip 和 Solana 验证者节点，确认验者节点是否正常运行：

```
tail -f /home/sol/solana-validator*.log
```

## 监控

`solana-watchtower` 是一个可以在独立机器上运行的命令，用于监控您的服务器。你可以在文档中阅读更多关于使用 Solana Watchtower 处理[自动重启和监控](https://docs.solanalabs.com/operations/best-practices/monitoring#solana-watchtower)的信息。

##  常见问题

### 硬盘空间不足

确保您的账本数据放在至少有 `2TB` 空间的硬盘上。

### 验证者节点没有追上

这可能是网络/硬件问题，或者您可能需要从另一个验证者节点获取最新快照。