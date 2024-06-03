# 部署程序

Solana链上程序（也称为“智能合约”）存储在Solana的“可执行”账户中。这些账户与其他账户相同，但有以下例外：

- 启用了“可执行”标志，
- 并且所有者被分配给BPF加载器

除了这些例外，它们同样受非可执行账户相同的运行时规则的约束，持有用于租金费用的SOL代币，并存储由BPF加载器程序管理的数据缓冲区。最新的BPF加载器称为“可升级的BPF加载器”。

## 可升级BPF加载器概述

### 状态账户

可升级的BPF加载器程序支持三种不同类型的状态账户：

1. [程序账户](https://github.com/solana-labs/solana/blob/master/sdk/program/src/bpf_loader_upgradeable.rs#L34):
   这是链上程序的主要账户，其地址通常被称为“程序ID”。交易指令引用程序ID以调用程序。程序账户一旦部署就不可变，因此可以将其视为字节码和存储在其他账户中的状态的代理账户。
2. [程序数据账户](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/bpf_loader_upgradeable.rs#L39):
   该账户存储链上程序的可执行字节码。当程序升级时，该账户的数据会更新为新的字节码。除了字节码，程序数据账户还负责存储上次修改时的插槽和唯一有权修改该账户的账户地址（该地址可以被清除以使程序不可变）。
3. [缓冲区账户](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/bpf_loader_upgradeable.rs#L27):
   这些账户在程序通过一系列交易积极部署时临时存储字节码。它们还各自存储唯一有权进行写入的账户地址。

### 指令

上述状态账户只能通过可升级的BPF加载器程序支持的以下指令之一进行修改：

1. [初始化缓冲区](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L21):
   创建一个缓冲区账户并存储一个有权修改缓冲区的授权地址。
2. [写入](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L28):
   在缓冲区账户内的指定字节偏移处写入字节码。由于Solana交易的最大序列化大小为1232字节，写入以小块处理。
3. [部署](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L77):
   创建程序账户和程序数据账户。通过从缓冲区账户复制字节码来填充程序数据账户。如果字节码有效，程序账户将被设置为可执行，从而允许其被调用。如果字节码无效，指令将失败并且所有更改将被撤销。
4. [升级](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L102):
   通过从缓冲区账户复制可执行字节码来填充现有的程序数据账户。与部署指令类似，只有在字节码有效时才会成功。
5. [设置权限](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L114):
   如果账户的当前权限已签署正在处理的交易，则更新程序数据或缓冲区账户的权限。如果权限被删除而没有替换，则无法将其设置为新地址，并且账户永远无法关闭。
6. [关闭](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L127):
   清除程序数据账户或缓冲区账户的数据，并收回用于租金豁免存款的SOL。

## `solana program deploy`的工作原理

由于Solana交易的最大大小限制为1232字节，部署一个程序需要数百甚至数千次交易。Solana CLI通过`solana program deploy`子命令处理这些快速发送的交易。该过程可以分为以下三个阶段：

1. [缓冲区初始化](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L2113):
   首先，CLI发送一个交易，创建一个足够大的缓冲区账户来存储正在部署的字节码。它还调用[初始化缓冲区指令](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/programs/bpf_loader/src/lib.rs#L320)来设置缓冲区权限，以限制写入到部署者选择的地址。
2. [缓冲区写入](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L2129):
   一旦缓冲区账户初始化，CLI将程序字节码分成约1KB的块，并以每秒100个交易的速度发送交易来写入每个块。这些交易直接发送到当前领导者的交易处理（TPU）端口，并与彼此并行处理。一旦所有交易都已发送，CLI通过批量交易签名轮询RPC API，以确保每次写入都成功并确认。
3. [最终化](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L1807):
   写入完成后，CLI发送最终交易以部署新程序或升级现有程序。在任何情况下，写入缓冲区账户的字节码将被复制到程序数据账户并进行验证。

## 从程序账户中回收租金

在Solana区块链上存储数据需要支付租金，包括链上程序的字节码。 因此，随着您部署更多或更大的程序，为保持租金豁免所支付的租金金额也会增加。

根据当前的租金成本模型配置，一个租金豁免账户需要存入约0.7 SOL每100KB存储。这些成本可能对部署自己程序的开发者产生较大影响，因为程序账户通常是我们在Solana上看到的最大的账户之一。

#### 程序使用的数据示例

作为链上存储数据量和账户数量的数据点，以下是插槽`103,089,804`在`mainnet-beta`上分配给链上程序的最大账户（至少100KB）的分布：

1. **Serum Dex v3**: 1798个账户
2. **Metaplex Candy Machine**: 1089个账户
3. **Serum Dex v2**: 864个账户
4. **可升级BPF程序加载器**: 824个账户
5. **BPF程序加载器v2**: 191个账户
6. **BPF程序加载器v1**: 150个账户

### 回收缓冲区账户

缓冲区账户由可升级的BPF加载器用于临时存储正在链上部署的字节码。当升级程序时需要这个临时缓冲区，因为当前部署的程序的字节码不能受到正在进行的升级的影响。

不幸的是，部署有时会失败，开发者可能会重新尝试使用新的缓冲区进行部署，而没有意识到他们在之前的部署中遗留的缓冲区账户中存储了大量的SOL。

> 截至插槽`103,089,804`在`mainnet-beta`上，有276个被遗弃的缓冲区账户可以被回收！

开发者可以使用Solana CLI检查他们是否拥有任何被遗弃的缓冲区账户：

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

可以通过RPC API获取所有被遗弃的程序部署缓冲区账户的所有者：

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

在将base64编码的密钥重新编码为base58并按密钥分组后，我们发现一些账户有超过10个缓冲区账户可以关闭，真是糟糕！

```shell
'BE3G2F5jKygsSNbPFKHHTxvKpuFXSumASeGweLcei6G3' => 10 buffer accounts
'EsQ179Q8ESroBnnmTDmWEV4rZLkRc3yck32PqMxypE5z' => 10 buffer accounts
'6KXtB89kAgzW7ApFzqhBg5tgnVinzP4NSXVqMAWnXcHs' => 12 buffer accounts
'FinVobfi4tbdMdfN9jhzUuDVqGXfcFnRGX57xHcTWLfW' => 15 buffer accounts
'TESAinbTL2eBLkWqyGA82y1RS6kArHvuYWfkL9dKkbs' => 42 buffer accounts
```

### 回收程序数据账户

您现在可能意识到程序数据账户（存储链上程序的可执行字节码的账户）也可以关闭。

> **注意：** 这并不意味着程序账户可以关闭（这些账户是不可变的，永远无法回收，但没关系，它们很小）。还需要注意的是，一旦程序数据账户被删除，它们永远无法为现有程序重新创建。因此，任何关闭的程序数据账户对应的程序（及其程序ID）将被永久禁用，无法重新部署。

虽然开发者通常不需要关闭程序数据账户，因为它们可以在升级期间重写，但一种可能的情况是，由于程序数据账户无法调整大小，您可能希望在新地址部署程序以容纳更大的可执行文件。

回收程序数据账户租金存款的能力也使在`mainnet-beta`集群上进行测试和实验的成本大大降低，因为您可以回收除交易费用和程序账户的一小部分租金之外的所有费用。最后，如果开发者错误地在意外地址或错误的集群上部署了程序，这也可以帮助他们恢复大部分资金。

要查看由您的钱包地址拥有的程序，您可以运行：

```shell
solana -V # 必须是1.7.11或更高版本！
solana program show --programs --keypair ~/.config/solana/MY_KEYPAIR.json

Program Id                                   | Slot      | Authority                                    | Balance
CN5x9WEusU6pNH66G22SnspVx4cogWLqMfmb85Z3GW7N | 53796672  | 2nr1bHFT86W9tGnyvmYW4vcHKsQB3sVQfnddasz4kExM | 0.54397272 SOL
```

要关闭这些程序数据账户并回收其SOL余额，您可以运行：

```shell
solana program close --programs --keypair ~/.config/solana/MY_KEYPAIR.json
```

您可能担心这个新功能可能会被坏人利用，让他们能关掉程序，从而影响到正常用户。这种担心是可以理解的，不过就算有了这个功能，坏人也不能比以前造成更严重的后果。

因为就算没有关闭程序数据账户的功能，也可以通过其他方式来达到类似的结果 - 比如把程序更新成一个什么都不做的版本，然后再把更新权限关掉，这样程序就永远无法再升级了。简单来说，这个新功能就相当于多了个收回押金的选项，但禁用程序在技术上本来就做得到。

