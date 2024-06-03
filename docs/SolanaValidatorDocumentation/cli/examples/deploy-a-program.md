# 通过CLI部署一个 Solana 程序

开发者可以使用 Solana 工具部署[链上程序](https://solana.com/docs/terminology#program)（在其他地方被称为智能合约）。

要学习如何在 Solana 上部署并运行一个程序，请从 [Solana 程序介绍](https://solana.com/docs/core/programs)开始，然后深入了解[链上程序开发](https://solana.com/docs/programs)的细节。

为了部署一个程序，可以使用 Solan 工具与链上加载器交互，以执行以下操作：

+ 初始化一个程序账户
+ 将程序的共享对象（即程序二进制文件 `.so`）上传到程序账户的数据缓冲区
+ （可选）验证已上传的程序
+ 通过标记程序账户为可执行来完成程序部署

一旦部署，任何人都可以通过通过向集群发送引用该程序的交易来执行该程序。



## 如何部署程序

部署程序是，需要提供程序共享对象（程序二进制文件 `.so`）：

``` 
solana program deploy <PROGRAM_FILEPATH>
```

部署成功后会返回被程序的 id，例如：

```
Program Id: 3KS2k14CmtnuVv2fvYcvdrNgC94Y11WETBpMUGgXyWZL
```

要在部署命令中指定密钥对以部署到特定程序id，请使用：

```
solana program deploy --program-id <KEYPAIR_FILEPATH> <PROGRAM_FILEPATH>
```

如果在命令行中程序 id 未被指定，命令行工具会首先查找匹配 `<PROGRAM_FILEPATH>`的密钥对，或者在内部生成一个新的密钥对。

匹配的程序密钥对文件位于与程序共享对象的统一目录中，名为 <PROGRAM_NAME>-keypair.json 。 匹配程序的密钥对会由程序构建工具自动生成：

```
./path-to-program/program.so
./path-to-program/program-keypair.json
```



## 显示程序账户

要获得已部署的程序的信息，请运行：

```
solana program show <ACCOUNT_ADDRESS>
```

以下是一个示例的输出信息：

```
Program Id: 3KS2k14CmtnuVv2fvYcvdrNgC94Y11WETBpMUGgXyWZL
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: EHsACWBhgmw8iq5dmUZzTA1esRqcTognhKNHUkPi4q4g
Authority: FwoGJNUaJN2zfVEex9BB11Dqb3NJKy3e9oY3KTh9XzCU
Last Deployed In Slot: 63890568
Data Length: 5216 (0x1460) bytes
```

+ `Program Id` 是当调用程序时可以用于指令中 `program_id` 字段引用的地址。
+ `Owner`是部署此程序用的加载器。
+ `ProgramData Address` 是与程序账户关联的账户，用于储存程序数据（共享对象）。
+ `Authority` 是程序的升级权限持有者。
+ `Last Deployed In Slot` 是程序上次部署时的槽位。
+ `Data Length` 是为部署预留的空间大小。当前部署程序实际使用的空间可能会较小。



## 重新部署 Solana 程序

程序可以重新部署到相同的地址，以便快速开发、修复错误或进行升级。如果程序 id 并未提供，程序会部署到在 `<PROGRAM_NAME>-keypair.json` 中的默认地址。此默认密钥对在第一次程序编译时便已经生成。

重新部署的命令与部署命令相同：

```
solana program deploy <PROGRAM_FILEPATH>
```

默认情况下，程序被部署到与原始程序文件大小匹配的账户上。但是，如果重新部署的程序体积更大，则重新部署将会失败。为避免此情况，可以指定一个至少等于程序与其大小（以字节为单位的）`max_len`（并留有一定的余地）。

```
solana program deploy --max-len 200000 <PROGRAM_FILEPATH>
```



## 扩展程序

如果程序已经部署，并且重新部署超过了账户的最大长度 `max_len`，可以扩展程序以适应更大的重新部署。

```
solana program extend <PROGRAM_ID> <ADDITIONAL_BYTES>
```



## 恢复失败的部署

如果程序部署失败，会留下一个含有非零余额的中间缓冲账户。为了回收这部分余额，你可以通过向新的 `deploy` 部署调用提供相同的中间缓冲的来恢复失败的部署。

部署失败时，错误消息会指明恢复生成的中间缓冲密钥对所需的助记词种子短语：

```
==================================================================================
使用以下12个单词的助记词短语，通过`solana-keygen recover`恢复中间账户的临时密钥对文件：
==================================================================================
valley flat great hockey share token excess clever benefit traffic avocado athlete
==================================================================================
要恢复部署，请将恢复的密钥对作为 [BUFFER_SIGNER] 参数传递给`solana program deploy`或` solana program write-buffer`。 或者，要回收账户的lamports，将其作为 [BUFFER_ACCOUNT_ADDRESS] 参数传递给`solana program drain`。
==================================================================================
```

要恢复密钥对，请运行：

```
solana-keygen recover -o <KEYPAIR_PATH>
```

当提示时，输入12个单词的助记词短语。

然后发出一个系的部署命令并指定缓冲区：

```
solana program deploy --buffer <KEYPAIR_PATH> <PROGRAM_FILEPATH>
```



## 关闭程序和缓冲区并回收他们的lamports

程序和缓冲账户都可以被关闭，并且他们的lamports余额会被转移到接收者的账户下。

如果部署失败，会一流一个持有lamports的缓冲账户。这个缓冲账户可以用来[恢复部署](https://docs.solanalabs.com/cli/examples/deploy-a-program#resuming-a-failed-deploy)或者直接关闭。

关闭账户时，需要程序或缓冲账户的权限方在场，要列出所有与默认权限匹配的打开的程序或缓冲账户：

```
solana program show --programs
solana program show --buffers
```

如需指定不同的权限方：

```
solana program show --programs --buffer-authority <AUTHORITY_ADDRESS>
solana program show --buffers --buffer-authority <AUTHORITY_ADDRESS>
```

如要关闭单一账户：

```
solana program close <BADDRESS>
```

如要关闭单个账户并指定不同于默认的权限方：

```
solana program close <ADDRESS> --buffer-authority <KEYPAIR_FILEPATH>
```

如要关闭单个账户并指定不同于默认的接收方：

```
solana program close <ADDRESS> --recipient <RECIPIENT_ADDRESS>
```

如要关闭所有与当前权限方关联的账户：

```
solana program close --buffers
```

显示所有缓冲账户，不考虑权限方：

```
solana program show --buffers --all
```



## 设置程序的升级权限方

部署程序时必须有升级权限方在场。如果在程序部署时为指定权限方，则使用默认密钥对作为权限方。这就是为什么在上面的步骤中重新部署程序不需要明确指定权限方的原因。

在部署时可以指定权限方：

```
solana program deploy --upgrade-authority <UPGRADE_AUTHORITY_SIGNER> <PROGRAM_FILEPATH>
```

或者在部署后使用默认密钥对作为当前权限方：

```
solana program set-upgrade-authority <PROGRAM_ADDRESS> --new-upgrade-authority <NEW_UPGRADE_AUTHORITY>
```

或者在部署后指定当前权限方：

```
solana program set-upgrade-authority <PROGRAM_ADDRESS> --upgrade-authority <UPGRADE_AUTHORITY_SIGNER> --new-upgrade-authority <NEW_UPGRADE_AUTHORITY>
```

默认情况下，`set-upgrade-authority` 需要新权限方的签名。此行为防止开发者将升级权限赋予他们无法访问的密钥。`--skip-new-upgrade-authority-signer-check` 选项放宽了该限制。这对于新升级权限方时离线签名者或多签情况时尤为管用。



## 不可变程序

程序可被标记为不可变，为防止之后的重新部署。通过在部署期间指定 `--final`标志实现：

```
solana program deploy <PROGRAM_FILEPATH> --final
```

或者之后的任何时间：

```
solana program set-upgrade-authority <PROGRAM_ADDRESS> --final
```



## 将程序导出为文件

部署的程序可以导回到本地文件：

```
solana program dump <ACCOUNT_ADDRESS> <OUTPUT_FILEPATH>
```

导出的文件与部署的文件一致，因此对于共享对象（程序二进制文件 `.so`），导出的文件讲述一个完全功能性的共享对象。请注意，导出命令 `dump` 会稻城整个数据空间，这意味着输出文件在共享对象数据之后，直到 `max_len` ，会有尾随的零。有时导出并比较程序是有用的，以确保它与一致的程序二进制文件匹配。导出的文件可以截断零，进行哈希运算，并与原始文件的哈希进行比较。

```
$ solana dump <ACCOUNT_ADDRESS> dump.so
$ cp original.so extended.so
$ truncate -r dump.so extended.so
$ sha256sum extended.so dump.so
```



## 使用中间缓冲账户

程序可以写入一个中间缓冲账户而不是直接部署到程序账户。中间缓冲账户在诸如多实体管理的程序中很有用，其中管理成员首先验证中间缓冲内容，然后投票决定是否使用其来进行升级。

```
solana program write-buffer <PROGRAM_FILEPATH>
```

缓冲账户可以被权限方管理。如需创建并指定不同于默认权限方的缓冲账户，请运行：

```
solana program write-buffer <PROGRAM_FILEPATH> --buffer-authority <BUFFER_AUTHORITY_SIGNER>
```

只有缓冲权限方才能写入缓冲账户，因此上面的 `--buffer-authority` 必须是一个**签署者**，而不是一个地址。这一要求限制了离线签署者的使用。想要使用离线签署者作为缓冲权限方，缓冲账户必须被在线密钥对初始化并写入，然后使用 `solana program set-buffer-authority` 分配缓冲权限方：

```
solana program set-buffer-authority <BUFFER_ADDRESS> --new-buffer-authority <NEW_BUFFER_AUTHORITY>
```

不像程序账户，缓冲账户无法被标记为不可变，所以其不支持 `--final` 选项。

一旦缓冲账户完全写入，就可以将其传递给 `deploy` 命令来部署程序：

```
solana program deploy --program-id <PROGRAM_ADDRESS> --buffer <BUFFER_ADDRESS>
```

请注意，缓冲权限方必须与程序升级权限方向匹配。在部署时，缓冲账户的内容会被拷贝到程序数据账户，并且缓冲账户会被清零。缓冲账户的 lamports 会退还给溢出账户。

缓冲账户也像程序一样支持 `show` 和 `dump` 操作。

## 使用离线签名者作为权限方进行程序升级

某些安全模型要求将签名过程与交易广播分开，使得签名密钥可以完全与任何网络断开链接，也就是所谓的[离线签名](https://docs.solanalabs.com/cli/examples/offline-signing)。

本章节介绍程序开发者如何使用离线签名来升级他们的程序，与[之前的章节](https://docs.solanalabs.com/cli/examples/deploy-a-program#redeploy-a-program)不同，之前的章节假设机器连接到互联网，即在线签名。

请注意，只有升级命令 `upgrade` 可以在离线模式下执行。程序的初始部署必须有联机机器执行，只有后续的程序升级才能利用离线签名。

假设您的程序已经被部署并且其升级权限已经更改为离线签署者，典型的设置将包括2个不同的签署者：

+ 在线签署者（用于上传程序缓冲区和升级程序的费用支付者）
+ 离线签署者（程序升级权限方）

一般流程如下：

1. （在线）创建缓冲并写入新的程序
2. （在线）设置缓冲权限方给离线签署者
3. （可选，在线）验证缓冲的链上内容
4. （离线）签署交易以升级程序
5. （在线）使用此签名来广播升级交易。

```
# (1) （使用联机机器）创建缓冲区
solana program write-buffer <PROGRAM_FILEPATH>

# (2) （使用联机机器）将缓冲区权限设置为离线签署者
solana program set-buffer-authority <BUFFER_PUBKEY> --new-buffer-authority <OFFLINE_SIGNER_PUBKEY>
```

(3)（可选）您可以验证上传的程序是否与构建的二进制文件匹配。更多详细信息，请参见[将程序导出到文件](https://docs.solanalabs.com/cli/examples/deploy-a-program#dumping-a-program-to-a-file)。

```
# (4) （使用离线机器）为升级程序意图获取签名
solana program upgrade <BUFFER_PUBKEY> <PROGRAM_ID> --sign-only --fee-payer <ONLINE_SIGNER_PUBKEY> --upgrade-authority <OFFLINE_SIGNER> --blockhash <VALUE>

# (5) （使用联机机器）使用此签名构建并在链上广播升级交易
solana program upgrade <BUFFER_PUBKEY> <PROGRAM_ID> --fee-payer <ONLINE_SIGNER> --upgrade-authority <OFFLINE_SIGNER_PUBKEY> --blockhash <VALUE> --signer <OFFLINE_SIGNER_PUBKEY>:<OFFLINE_SIGNER_SIGNATURE>
```

注意：

+ 通常，前面命令的输出包含一些对后续命令有用的值，例如 `--program-id` ，`--buffer` ，`--signer` 。
+ 在离线/在线模式下，对于具有相同名称的参数（如 `--fee-payer` 、`--program-id` 、`--upgrade-authority` 、`--buffer` 、`--blockhash`），您需要指定匹配（或相应）的值。
+ 您应该提前填写除 `blockhash` 之外的所有值，一旦准备行动，需要查找最近的 `blockhash` 并粘贴以生成离线交易签名。`blockhash` 约60秒后过期。如果没来得及，只需再次获取新的哈希并重复，直到成功，或者考虑使用[持久的交易随机数](https://docs.solanalabs.com/cli/examples/durable-nonce)。