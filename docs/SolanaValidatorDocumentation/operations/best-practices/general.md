# Solana 验证器运维最佳实践

成功设置并启动 [测试网上的验证器](https://docs.solanalabs.com/operations/setup-a-validator)（或您选择的其他集群）后，您将需要熟悉如何在日常基础上维护验证器。在日常中，您将 [监控您的服务器](https://docs.solanalabs.com/operations/best-practices/monitoring)、定期更新软件（Solana 验证器软件和操作系统软件包）以及管理您的投票账户和身份账户。

所有这些技能对于实践都至关重要。最大限度地延长验证器的正常运行时间是成为优秀的运维人员的重要组成部分。

## 教育研讨会

Solana 验证器社区定期举办教育研讨会。您可以通过以下方式观看过去的研讨会。
[Solana 验证器教育研讨会播放列表](https://www.youtube.com/watch?v=86zySQ5vGW8&list=PLilwLeBwGuK6jKrmn7KOkxRxS9tvbRa5p).

## 辅助验证器命令行运维

在Solana命令行界面中，您可以运行带有`--help`标志的`solana-validator`命令，以更好地了解可用的标志和子命令。

```
solana-validator --help
```

## 重启您的验证节点

您可能出于多种运维原因需要重启您的验证器。作为最佳实践，您应该避免在领导者时段重启。[leader slot](https://solana.com/docs/terminology#leader-schedule) 是您的验证器预期产生区块的时间。为了集群的健康以及您的验证器赚取交易费奖励的能力，您不希望在产生区块的机会期间让验证器处于离线状态。

要查看一个周期的完整领导者日程，请使用以下命令：

```
solana leader-schedule
```

根据当前时段和领导者日程，您可以计算出您的验证器不预期产生区块的开放时间窗口。

假设您已准备好重启，您可以使用 `solana-validator exit` 命令。当达到适当的空闲时间窗口时，该命令会退出您的验证器进程。假设您为验证器进程实现了 systemd，验证器在退出后应该会自行重启。有关详细信息，请参见以下帮助命令：

```
solana-validator exit --help
```

## 升级

升级[Solana命令行界面软件](https://docs.solanalabs.com/cli/install)有多种方法。作为运维人员，您需要经常进行升级，因此熟悉这个过程非常重要。


> **注意** 在下载或从源代码构建最新版本时，
> 验证器节点无需离线。
> 以下所有方法都可以在验证器进程重新启动之前完成。

### 从源代码构建

最佳实践是从源代码构建您的Solana二进制文件。如果您从源代码构建，您可以确保在创建二进制文件之前代码没有被篡改。您还可能能够针对您的特定硬件优化您的`solana-validator`二进制文件。

如果您在验证器机器（或具有相同CPU的机器）上从源代码构建，您可以使用 `-march` 标志针对您的特定架构。请参阅以下文档以获取更多信息。
[从源代码构建的说明](https://docs.solanalabs.com/cli/install#build-from-source).

### solana-install

如果您不习惯从源代码构建，或者您需要快速安装新版本来测试某些功能，您可以改用 `solana-install` 命令。

假设您想要安装Solana版本`1.14.17`，您将执行以下操作：

```
solana-install init 1.14.17
```

这个命令会下载`1.14.17`版本的可执行文件，并将其安装到`.local`目录中。您也可以查看`solana-install --help`以获取更多选项。

> **注意** 这个命令只有在您已经安装了 Solana CLI 的情况下才有效。
> 如果您还没有安装CLI，请参考[安装 Solana CLI 工具](https://docs.solanalabs.com/cli/install)。

### 重启

对于所有安装方法，您需要重启验证器进程，才能使用新安装的版本。使用 `solana-validator exit` 来重启您的验证器进程。

### 验证版本

验证您的验证器进程是否已更改为所需版本的最佳方法是在重启后搜索日志。以下 grep 命令应该可以显示您的验证器使用哪个版本重启的：

```
grep -B1 'Starting validator with' <path/to/logfile>
```

## 快照

没有经历过显著停机（多个小时的停机）的验证器运维人员应该避免下载快照。保持本地账本对集群的健康以及您的验证器历史记录非常重要。因此，您不应该在您的验证器离线或遇到问题时下载新快照。下载快照应该只限于您没有本地状态的情况。长时间的停机或新验证器的首次安装是您可能没有本地状态的例子。在其他情况下，比如为了升级而重启，应该避免下载快照。

为了避免在重启时下载快照，请将以下标志添加到 `solana-validator` 命令中：

```
--no-snapshot-fetch
```

如果您在 `solana-validator` 命令中使用了这个标志，请确保在您的验证器启动后运行 `solana catchup <pubkey>`，以确保验证器在合理的时间内追赶上来。如果经过一段时间后（可能是几个小时），看起来您的验证器继续落后，那么您可能需要下载一个新的快照。

### 下载快照

如果您是第一次启动验证器，或者您的验证器在重启后落后得太远，那么您可能需要下载快照。

要下载快照，您必须**不要**使用 `--no-snapshot-fetch` 标志。
不使用该标志，您的验证器将自动从您使用 `--known-validator` 标志指定的已知验证器下载快照。

如果其中一个已知验证器下载速度很慢，您可以尝试向您的验证器添加 `--minimal-snapshot-download-speed` 标志。如果初始下载速度低于您设置的阈值，此标志将切换到另一个已知验证器。


### 手动下载快照

如果一个或多个您已知的验证器出现网络问题，那么您可能需要手动下载快照。要从您已知的验证器手动下载快照，首先，使用 `solana gossip` 命令找到验证器的IP地址。在以下示例中，`5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on` 是我的一个已知验证器的公钥：

```
solana gossip | grep 5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on
```

验证器的IP地址是`139.178.68.207`，并且这个验证器上开放的端口是`80`。您可以在 gossip 输出的第五列中看到 IP 地址和端口：

```
139.178.68.207  | 5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on | 8001   | 8004  | 139.178.68.207:80     | 1.10.27 | 1425680972
```

现在已知IP和端口，您可以下载完整快照或增量快照：

```
wget --trust-server-names http://139.178.68.207:80/snapshot.tar.bz2
wget --trust-server-names http://139.178.68.207:80/incremental-snapshot.tar.bz2
```

现在将这些文件移动到您的快照目录中。如果您尚未指定快照目录，则应将文件放入您的账本目录。

一旦您有了本地快照，您可以使用`--no-snapshot-fetch`标志重启您的验证器。

## 定期检查账户余额

确保身份账户中的资金不会意外耗尽至关重要，因为一旦资金耗尽，您的节点将停止投票。另外需要注意的是，在投票账户中的这三个密钥对中，身份账户的密钥对最为脆弱，因为在运行`solana-validator`软件时，身份账户的密钥对会存储在您的验证节点上。应该在该账户中存放多少SOL完全由您决定。作为最佳实践，定期检查该账户余额，并根据需要及时补充或提取资金。要查看账户余额，请执行：

```
solana balance validator-keypair.json
```

> **注意** `solana-watchtower` 可以监控验证器身份账户的最低余额。
> 有关详细信息，请参见[监控最佳实践](https://docs.solanalabs.com/operations/best-practices/monitoring)。

## 从投票账户中提取资金

作为提醒，您的提取者的密钥对应该**永远不要**存储在您的服务器上。它应该存储在硬件钱包、纸钱包或多重签名钱包中，以减轻黑客攻击和资金被盗的风险。

要从您的投票账户中提取资金，您需要在受信任的计算机上运行`solana withdraw-from-vote-account`。例如，在受信任的计算机上，
您可以从您的投票账户中提取所有资金（不包括租金豁免最低限额）。以下示例假设您有一个单独的密钥对来存储您的资金，名为`person-keypair.json`

```
solana withdraw-from-vote-account \
   vote-account-keypair.json \
   person-keypair.json ALL \
   --authorized-withdrawer authorized-withdrawer-keypair.json
```

要获取有关该命令的更多信息，请使用
`solana withdraw-from-vote-account --help`。

有关不同密钥对和其他相关操作的更详细说明，请参阅
[投票账户管理](https://docs.solanalabs.com/operations/guides/vote-accounts)。