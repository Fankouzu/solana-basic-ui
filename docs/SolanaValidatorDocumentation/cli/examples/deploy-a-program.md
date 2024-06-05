# 使用CLI部署Solana程序

开发者可以使用 Solana CLI部署[链上程序](https://solana.com/docs/terminology#program)（通常在其他地方称为智能合约）。

要了解在 Solana 上开发和执行程序，请从 [Solana 程序介绍](https://solana.com/docs/core/programs)开始，然后深入了解[链上程序开发](https://solana.com/docs/programs)的细节。

使用 Solana CLI 与链上加载器交互来部署程序：

+ 初始化程序账户
+ 将程序的共享对象（程序二进制文件 `.so`）上传到程序账户的数据缓冲区
+ （可选）验证上传的程序
+ 通过将程序账户标记为可执行来完成程序的部署

部署后，任何人都可以通过将引用程序的交易发送到集群来执行程序。

## 如何部署程序

要部署程序，您需要程序的共享对象（程序二进制文件 `.so`）的路径：

``` bash
solana program deploy <PROGRAM_FILEPATH>
```

成功部署后会返回已部署程序的程序 ID，例如：

```bash
Program Id: 3KS2k14CmtnuVv2fvYcvdrNgC94Y11WETBpMUGgXyWZL
```

要在部署命令中指定密钥对以部署到特定程序id，请使用：

```bash
solana program deploy --program-id <KEYPAIR_FILEPATH> <PROGRAM_FILEPATH>
```

如果命令行中未指定程序 ID，将先查找与 `<PROGRAM_FILEPATH>` 匹配的密钥对文件，或者在内部生成一个新的密钥对。

匹配的程序密钥对文件，位于程序的共享对象相同的目录中，并命名为 `<PROGRAM_NAME>-keypair.json`。匹配的程序密钥对由程序构建工具自动生成：

```bash
./path-to-program/program.so
./path-to-program/program-keypair.json
```

## 显示程序账户

获取已部署程序的详细信息：

```
solana program show <ACCOUNT_ADDRESS>
```

示例输出：

```bash
Program Id: 3KS2k14CmtnuVv2fvYcvdrNgC94Y11WETBpMUGgXyWZL
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: EHsACWBhgmw8iq5dmUZzTA1esRqcTognhKNHUkPi4q4g
Authority: FwoGJNUaJN2zfVEex9BB11Dqb3NJKy3e9oY3KTh9XzCU
Last Deployed In Slot: 63890568
Data Length: 5216 (0x1460) bytes
```

+ `Program Id` 是调用程序时可以在指令的 `program_id` 字段中引用的地址。
+ `Owner`是部署此程序用的加载程序。
+ `ProgramData Address` 是与程序账户关联的账户，用于储存程序数据（共享对象）。
+ `Authority` 是程序的升级权限拥有者。
+ `Last Deployed In Slot` 是程序上次部署时的槽位。
+ `Data Length` 是为部署保留的空间大小。目前已部署程序实际使用的空间可能更少。

## 重新部署 Solana 程序

可以将程序重新部署到相同地址，以便于快速开发、修复错误或升级。如果未提供程序 ID，程序将部署到 `<PROGRAM_NAME>-keypair.json` 的默认地址。此默认密钥对在首次程序编译期间生成。

重新部署的命令与部署命令相同：

```bash
solana program deploy <PROGRAM_FILEPATH>
```

默认情况下，程序部署到与原始程序文件大小匹配的账户。但是，如果重新部署的程序更大，重新部署将失败。为避免这种情况，请指定 `max_len`，其至少为程序预计的大小（以字节为单位），并留有一定的余量：

```bash
solana program deploy --max-len 200000 <PROGRAM_FILEPATH>
```

## 扩展程序

如果程序已经部署，并且重新部署超出了账户的 `max_len`，可以扩展程序以适应更大的重新部署：

```bash
solana program extend <PROGRAM_ID> <ADDITIONAL_BYTES>
```

## 恢复失败的部署

如果程序部署失败，将会有一个挂起的中间缓冲账户，并包含非零余额。为了收回该余额，您可以通过提供相同的中间缓冲区来恢复失败的`部署`。

部署失败将打印错误消息，指定恢复生成的中间缓冲区密钥对所需的助记词：

```bash
==================================================================================
使用`solana-keygen recovery`和以下 12 个单词的助记词短语恢复中间账户的临时密钥对文件：
==================================================================================
valley flat great hockey share token excess clever benefit traffic avocado athlete
==================================================================================
要恢复部署，请将恢复的密钥对作为 [BUFFER_SIGNER] 参数传递给`solana program deploy`或` solana program write-buffer`。 或者要恢复帐户的 lampors，请将其作为 [BUFFER_ACCOUNT_ADDRESS] 参数传递给`solana program drain`。
==================================================================================
```

恢复密钥对：

```bash
solana-keygen recover -o <KEYPAIR_PATH>
```

当系统提示时，输入12个单词的助记词短语。

然后发出新的部署命令并指定缓冲区：

```bash
solana program deploy --buffer <KEYPAIR_PATH> <PROGRAM_FILEPATH>
```

## 关闭程序和缓冲区并回收其lamports

程序和缓冲账户都可以关闭，其 lamport 余额转移到接收者的账户。

如果部署失败，将会有一个剩余的缓冲账户持有 lamports。缓冲账户可以用来[恢复部署](https://docs.solanalabs.com/cli/examples/deploy-a-program#resuming-a-failed-deploy)或关闭。

关闭账户需要程序或缓冲账户的权限，要列出所有与默认权限匹配的开放程序或缓冲账户：

```bash
solana program show --programs
solana program show --buffers
```

要指定不同的权限：

```bash
solana program show --programs --buffer-authority <AUTHORITY_ADDRESS>
solana program show --buffers --buffer-authority <AUTHORITY_ADDRESS>
```

关闭单个账户：

```bash
solana program close <BADDRESS>
```

关闭单个帐户并指定与默认帐户不同的权限：

```bash
solana program close <ADDRESS> --buffer-authority <KEYPAIR_FILEPATH>
```

关闭单个账户并指定不同的接收者：

```bash
solana program close <ADDRESS> --recipient <RECIPIENT_ADDRESS>
```

关闭与当前权限关联的所有缓冲账户：

```bash
solana program close --buffers
```

显示所有的缓冲账户，无论是什么权限：

```bash
solana program show --buffers --all
```

## 设置程序的升级权限

程序的升级权限必须存在才能部署程序。如果在程序部署期间未指定权限账户，则将用默认密钥对作为权限账户。这就是为什么在上面的步骤中重新部署程序不需要显式指定权限的原因。

在部署时可以指定权限账户：

```bash
solana program deploy --upgrade-authority <UPGRADE_AUTHORITY_SIGNER> <PROGRAM_FILEPATH>
```

或在部署后使用默认密钥对作为当前权限账户：

```bash
solana program set-upgrade-authority <PROGRAM_ADDRESS> --new-upgrade-authority <NEW_UPGRADE_AUTHORITY>
```

或者在部署后指定当前权限账户：

```bash
solana program set-upgrade-authority <PROGRAM_ADDRESS> --upgrade-authority <UPGRADE_AUTHORITY_SIGNER> --new-upgrade-authority <NEW_UPGRADE_AUTHORITY>
```

默认情况下，`set-upgrade-authority` 需要新权限的签名。这种行为防止开发人员将升级权限交给他们无法访问的密钥。`--skip-new-upgrade-authority-signer-check` 选项可以放宽签名检查。这对于新升级权限是离线签名者或多重签名的情况很有用。



## 不可变程序

通过在部署期间指定 `--final` 标志，可以将程序标记为不可变，从而防止所有的重新部署：

```bash
solana program deploy <PROGRAM_FILEPATH> --final
```

或者之后的任何时间：

```bash
solana program set-upgrade-authority <PROGRAM_ADDRESS> --final
```

## 将程序导出为文件

部署的程序可以导出回本地文件：

```bash
solana program dump <ACCOUNT_ADDRESS> <OUTPUT_FILEPATH>
```

导出的文件将与部署的文件相同，因此对于共享对象（程序二进制文件 `.so`），导出的文件将是一个功能齐全的共享对象。请注意，`dump` 命令会导出整个数据空间，这意味着输出文件在共享对象的数据之后会有填充零，直到到达数据空间最大值 `max_len`。有时很适合将程序导出并与已知的程序二进制文件进行比较，来确保它们相匹配。导出的文件可以截断填充零后进行哈希，然后与原始程序文件的哈希进行比较。

```bash
$ solana dump <ACCOUNT_ADDRESS> dump.so
$ cp original.so extended.so
$ truncate -r dump.so extended.so
$ sha256sum extended.so dump.so
```

## 使用中间缓冲账户

程序可以先写入中间缓冲账户，而不是直接部署到程序账户。中间账户对于多方管理的程序非常有用，治理成员可以先验证中间缓冲内容，然后投票批准使用它进行升级。

```bash
solana program write-buffer <PROGRAM_FILEPATH>
```

缓冲账户由权限方管理。如需创建并指定不同于默认权限方的缓冲账户：

```
solana program write-buffer <PROGRAM_FILEPATH> --buffer-authority <BUFFER_AUTHORITY_SIGNER>
```

只有缓冲权限方才能写入缓冲账户，因此上面的 `--buffer-authority` 必须是**签名者**，而不是地址。这一要求限制了离线签署者的使用。要使用离线地址作为缓冲权限，必须先用在线密钥对初始化和写入缓冲账户，然后使用 `solana program set-buffer-authority` 指定缓冲权限：

```bash
solana program set-buffer-authority <BUFFER_ADDRESS> --new-buffer-authority <NEW_BUFFER_AUTHORITY>
```

与程序账户不同，缓冲账户无法被标记为不可变，因此不支持 `--final` 选项。

一旦缓冲账户被完全写入，可以通过 `deploy` 命令将程序部署：

```bash
solana program deploy --program-id <PROGRAM_ADDRESS> --buffer <BUFFER_ADDRESS>
```

注意，缓冲权限方必须与程序的升级权限方匹配。在部署过程中，缓冲账户的内容会复制到程序数据账户中，缓冲账户会被清空。缓冲账户中的 lamports 会退还到一个溢出账户中。

缓冲账户也和程序账户一样支持 `show` 和 `dump` 操作。

## 使用离线签名者作为权限方进行程序升级

某些安全模型需要将签名过程与交易广播分离，这样签名密钥可以完全断开与任何网络的连接，也就是所谓的[离线签名](https://docs.solanalabs.com/cli/examples/offline-signing)。

本节介绍程序开发人员如何使用离线签名来升级他们的程序，与[之前的章节](https://docs.solanalabs.com/cli/examples/deploy-a-program#redeploy-a-program)不同，之前的章节假设机器连接到互联网，即在线签名。

请注意，只有升级命令可以在离线模式下执行。初始程序部署必须由在线机器执行，只有后续的程序升级才可以利用离线签名。

假设您的程序已部署并且其升级权限已更改为离线签名者，在常见的设置中将包含两个不同的签名者：

+ 在线签名者（支付上传程序缓冲区和升级程序的费用）
+ 离线签名者（程序升级权限方）

总体流程如下：

1. （在线）创建缓冲并写入新的程序
2. （在线）设置缓冲权限方给离线签署者
3. （可选，在线）验证链上缓冲区内容
4. （离线）签署升级程序的交易
5. （在线）使用此签名来广播升级交易。

```bash
# (1) （使用在线机器）创建缓冲区
solana program write-buffer <PROGRAM_FILEPATH>

# (2) （使用在线机器）将缓冲权限设置为离线签名者
solana program set-buffer-authority <BUFFER_PUBKEY> --new-buffer-authority <OFFLINE_SIGNER_PUBKEY>
```

(3)（可选）您可以验证上传的程序是否与构建的二进制文件匹配。更多详细信息，请参见[将程序导出到文件](https://docs.solanalabs.com/cli/examples/deploy-a-program#dumping-a-program-to-a-file)。

```bash
# (4) （使用离线机器）获取希望升级程序的签名
solana program upgrade <BUFFER_PUBKEY> <PROGRAM_ID> --sign-only --fee-payer <ONLINE_SIGNER_PUBKEY> --upgrade-authority <OFFLINE_SIGNER> --blockhash <VALUE>

# (5) （使用在线机器）使用该签名构建并广播链上的升级交易
solana program upgrade <BUFFER_PUBKEY> <PROGRAM_ID> --fee-payer <ONLINE_SIGNER> --upgrade-authority <OFFLINE_SIGNER_PUBKEY> --blockhash <VALUE> --signer <OFFLINE_SIGNER_PUBKEY>:<OFFLINE_SIGNER_SIGNATURE>
```

注意：

+ 通常，前一个命令的输出包含一些对后续命令有用的值，例如 `--program-id` ，`--buffer` ，`--signer` 。
+ 您需要在离线/在线模式中为具有相同名称的参数指定匹配（或对应）的值（`--fee-payer`, `--program-id`, `--upgrade-authority`, `--buffer`, `--blockhash`）
+ 您应该提前预填充除 `blockhash` 之外的所有值，一旦准备好进行，您需要查找最近的 `blockhash` 并将其粘贴进去以生成离线交易签名。`blockhash` 在大约 60 秒后过期。如果没有及时完成，只需获取另一个新的哈希并重复直到成功，或者考虑使用[持久交易随机数](https://docs.solanalabs.com/cli/examples/durable-nonce)。
