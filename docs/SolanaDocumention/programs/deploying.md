# 部署程序

Solana链上程序（也称为“智能合约”）存储在Solana的“可执行”账户中。这些账户与其他账户相同，但以下情况除外：

- 启用了“可执行”的标识，以及
- 账户所有者被分配为 BPF 加载器

除了这些例外之外，它们遵循与非可执行账户相同的，运行时的规则，持有用于支付租金费用的 SOL 代币，并存储由 BPF 加载器程序管理的数据缓冲区。最新的 BPF 加载器称为“可升级 BPF 加载器”。

## 可升级BPF加载器概述

### 状态账户

可升级的BPF加载器程序支持三种不同类型的状态账户：

1. [程序账户](https://github.com/solana-labs/solana/blob/master/sdk/program/src/bpf_loader_upgradeable.rs#L34)：这是链上程序的主要账户，其地址通常被称为“程序 ID”。程序 ID 是交易指令引用以调用程序的地址。程序账户一旦部署就不可变，因此可以将其视为存储在其他账户中的字节码和状态的代理账户。
2. [程序数据账户](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/bpf_loader_upgradeable.rs#L39)：该账户存储链上程序的可执行字节码。当程序升级时，该账户的数据会被更新为新的字节码。除了字节码之外，程序数据账户还负责存储最后修改时的槽位和唯一有权修改该账户的账户地址（可以清除此地址以使程序不可变）。
3. [缓冲区账户](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/bpf_loader_upgradeable.rs#L27)：这些账户在通过一系列交易部署程序时暂时地存储字节码。它们还各自存储唯一有权进行写入操作的账户地址。

### 指令

上述状态账户只能通过可升级的BPF加载器程序支持的以下指令之一进行修改：

1. [初始化缓冲区](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L21)：创建一个缓冲账户并存储允许修改缓冲区的权限地址。
2. [写入](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L28)：在缓冲区账户内的指定字节偏移处写入字节码。由于Solana交易的最大序列化后的大小为1232字节，所以在写入操作时小块小块处理。
3. [部署](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L77)：创建程序账户和程序数据账户。通过从缓冲账户复制字节码填充程序数据账户。如果字节码有效，程序账户将被设置为可执行，从而允许其被调用。如果字节码无效，指令将失败，所有更改将被回滚。
4. [升级](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L102)：通过从缓冲账户复制可执行字节码来填充现有的程序数据账户。类似于部署指令，它只有在字节码有效时才会成功。
5. [设置权限](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L114)：如果账户的当前权限已签署正在处理的交易，则更新程序数据或缓冲账户的权限。如果权限被删除且没有替换，则无法设置为新地址，且账户永远无法关闭。
6. [关闭](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L127)：清除程序数据账户或缓冲账户的数据，并收回存着的用于租金豁免的 SOL。

## `solana program deploy`的工作原理

由于Solana交易的最大大小限制为1232字节，部署一个程序需要数百甚至数千次交易。Solana CLI通过`solana program deploy`子命令处理这些快速发送的交易。该过程可以分为以下三个阶段：

1. [缓冲区初始化](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L2113)：首先，CLI发送一个交易，[创建一个缓冲区账户](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L1903)，并足够大到来存储正在部署的字节码。它还调用[初始化缓冲区指令](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/programs/bpf_loader/src/lib.rs#L320)来设置缓冲区权限，以限制对部署程序所选地址的写入
2. [缓冲区写入](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L2129)：一旦缓冲账户初始化，CLI 将[程序字节码分成](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L1940)大约 1KB 的块，并[以每秒 100 次交易的速度发送交易](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/client/src/tpu_client.rs#L133)，通过[写入缓冲指令](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/programs/bpf_loader/src/lib.rs#L334)写入每个块。这些交易直接发送到当前领导者的交易处理（TPU）端口，并行处理。一旦所有交易都已发送，CLI 将使用[交易签名批次轮询 RPC API ](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/client/src/tpu_client.rs#L216)，以确保每次写入都成功并得到确认。
3. [最终化](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L1807)：写入完成后，CLI发送最终交易以部署新程序或升级现有程序。在任何情况下，写入缓冲账户的字节码将被复制到程序数据账户中并进行验证。

## 从程序账户中回收租金

在 Solana 区块链上存储数据需要支付租金，包括链上程序的字节码。因此，随着您部署更多或更大的程序，支付以保持租金豁免的租金金额也会增加。

根据当前的租金成本模型配置，租金豁免账户需要存入大约 0.7 SOL 每 100KB 存储。由于程序账户通常是 Solana 上最大的账户之一，这些成本可能会对自己部署程序的开发人员产生较大影响。

#### 程序使用的数据量示例

作为存储在链上的账户数量和潜在数据的数据点，以下是指定链上程序在`主网Beta版`槽位 `103,089,804` 处的最大账户（至少 100KB）的分布：

1. **Serum Dex v3**: 1798个账户
2. **Metaplex Candy Machine**: 1089个账户
3. **Serum Dex v2**: 864个账户
4. **可升级BPF程序加载器**: 824个账户
5. **BPF程序加载器v2**: 191个账户
6. **BPF程序加载器v1**: 150个账户

### 回收缓冲区账户

可升级 BPF 加载器使用缓冲账户临时存储正在链上部署的字节码。在升级程序时需要这种临时缓冲区，因为当前部署的程序字节码不能受到正在进行的升级的影响。

不幸的是，部署有时会失败，开发人员可能会使用新的缓冲区重试部署，而没有意识到他们在早期部署中遗忘的缓冲账户中存储了大量的 SOL。

::: tip INFO
截至到插槽`103,089,804`在`主网beta版`上有 276 个废弃的缓冲账户可以进行回收！
:::

开发人员可以使用 Solana CLI 检查他们是否拥有任何废弃的缓冲账户：

```shell
solana program show --buffers --keypair ~/.config/solana/MY_KEYPAIR.json

Buffer Address                               | Authority                                    | Balance
9vXW2c3qo6DrLHa1Pkya4Mw2BWZSRYs9aoyoP3g85wCA | 2nr1bHFT86W9tGnyvmYW4vcHKsQB3sVQfnddasz4kExM | 3.41076888 SOL
```

他们可以使用以下命令关闭这些缓冲区以回收SOL余额：

```shell
solana program close --buffers --keypair ~/.config/solana/MY_KEYPAIR.json
```

#### 通过RPC API获取缓冲区账户的所有者

可以通过 RPC API 获取所有废弃的程序部署缓冲账户的所有者：

```shell
curl http://api.mainnet-beta.solana.com -H "Content-Type: application/json" \
--data-binary @- << EOF | jq --raw-output '.result | .[] | .account.data[0]'
{
    "jsonrpc":"2.0", "id":1, "method":"getProgramAccounts",
    "params":[
        "BPFLoaderUpgradeab1e11111111111111111111111",
        {
            "dataSlice": {"offset": 5, "length": 32},
            "filters": [{"memcmp": {"offset": 0, "bytes": "2UzHM"}}],
            "encoding": "base64"
        }
    ]
}
EOF
```

在将base64编码的密钥重新编码为base58并按密钥分组后，并按密钥分组，我们看到一些账户有超过 10 个缓冲账户可以关闭，哇哦！

```shell
'BE3G2F5jKygsSNbPFKHHTxvKpuFXSumASeGweLcei6G3' => 10 buffer accounts
'EsQ179Q8ESroBnnmTDmWEV4rZLkRc3yck32PqMxypE5z' => 10 buffer accounts
'6KXtB89kAgzW7ApFzqhBg5tgnVinzP4NSXVqMAWnXcHs' => 12 buffer accounts
'FinVobfi4tbdMdfN9jhzUuDVqGXfcFnRGX57xHcTWLfW' => 15 buffer accounts
'TESAinbTL2eBLkWqyGA82y1RS6kArHvuYWfkL9dKkbs' => 42 buffer accounts
```

### 回收程序数据账户

您现在可能认为程序数据帐户（存储链上程序的可执行字节码的帐户）也可以关闭。

::: tip INFO
这并不意味着程序账户可以关闭（这些账户是不可变的，永远不能收回，但没关系，它们很小）。还需要记住的是，一旦程序数据账户被删除，它们永远无法为现有程序重新创建。因此，对于任何关闭的程序数据账户，其对应的程序（及其程序 ID）将有效地被永久禁用，并且不能重新部署。
:::

虽然开发人员很少需要关闭程序数据账户，因为它们可以在升级期间重写，但一种可能的情况是，程序数据账户不能调整大小。您可能希望将程序部署到一个新地址，以容纳更大的可执行文件。

回收程序数据账户租金存款的能力也使在`mainnet-beta`集群上进行测试和实验的成本大大降低，因为您可以回收除交易费用和程序账户的一小部分租金之外的所有费用。这样即使开发者错误地在意外地址或错误的集群上部署了程序，这也可以帮助他们恢复大部分资金。

要查看由您的钱包地址拥有的程序，可以运行：

```shell
solana -V # 必须是1.7.11或更高版本！
solana program show --programs --keypair ~/.config/solana/MY_KEYPAIR.json

Program Id                                   | Slot      | Authority                                    | Balance
CN5x9WEusU6pNH66G22SnspVx4cogWLqMfmb85Z3GW7N | 53796672  | 2nr1bHFT86W9tGnyvmYW4vcHKsQB3sVQfnddasz4kExM | 0.54397272 SOL
```

要关闭这些程序数据账户并回收其 SOL 余额，可以运行：

```shell
solana program close --programs --keypair ~/.config/solana/MY_KEYPAIR.json
```

您可能会担心此功能允许恶意行为者关闭程序，从而对最终用户产生负面影响。这种担心是可以理解的，不过就算有了这个功能，坏人也不能比以前造成更严重的后果。

因为就算没有关闭程序数据账户的功能，也可以通过其他方式来达到类似的结果 - 比如把程序升级成一个无操作实现的版本，然后再清除其升级权限，这样程序就永远无法再升级变动了。简单来说，这个新功能就相当于多了个收回押金的选项，但禁用程序在技术上本来就做得到。
