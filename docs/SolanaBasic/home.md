# Solana Basic

> 作者 崔棉大师 X：[@MasterCui](https://x.com/@MasterCui) Youtube: [崔棉大师](https://www.youtube.com/channel/UCv4y5qSUbJ8UC3CUmBPC_BA)

## 第一阶段，账户与代币

在第一阶段学习中，我们将学会通过命令行和 javascript 脚本创建账户，并且创建代币，同时学到 Solana 的特殊特性，通过代币账户来保存代币，这和以太坊智能合约的账本型合约有着本质的不同；并且我们还将了解到非同质化代币在 Solana 系统中的定义，即精度为 0 的代币都属于非同质化的代币；

### Solana 开发流程

- Solana 开发者工作流程是程序-客户（program-client）模型。程序开发的第一个工作流程允许您直接创建和部署自定义的 Rust、C 和 C++程序到区块链。一旦这些程序部署完成，任何知道如何与它们通信的人都可以使用它们。您可以使用任何可用的客户端 SDK（或 CLI）编写 dApps 来与这些程序通信，所有这些 SDK 都在底层使用 JSON RPC API。

![solana-overview-client-program.png](/solana-overview-client-program.png)

### 账户

- 在 Solana 中，"Everythin is an Account" 类似 Linux 世界里面把所有的资源都抽象成"文件"一样。
- Solana 作为一个分布式区块链系统，所有的信息都存储在 Account 对象中，如合约（Solana 叫 Onchain Program）, 账号信息，合约中存储的内容等都是存储在一个个 Account 对象中。

### 账号和签名

- Solana 的签名系统使用的是 Ed25519 ,说人话就是： Ed25519 是一种计算快，安全性高，且生成的签名内容小的一种不对称加密算法。新一代公链几乎都支持这个算法。

- 所以 Solana 的，我们用户理解的账号，就是一串 Ed25519 的私钥，各种钱包里面的助记词，会被转换成随机数种子， 再用随机数种子来生成一个私钥，所以助记词最终也是换算成私钥。所以用户账号的本质就是私钥，而用户账号的地址 则是这私钥对应的公钥,优于公钥是二进制的，为了可读性，将其进行 Base58 编码后的值，就是这个账号的地址。 如：HawRVHh7t4d3H3bitWHFt25WhhoDmbJMCfWdESQQoYEy

- 把这里的公钥和私钥放一起，就是所谓的 Keypair，或者叫公私钥对。假设这里把私钥进行加密，并由用户来设置密码， 公钥作为这个私钥的索引。就实现了一个简单的钱包系统了。

- 通过用户选择的公钥，加上密码，得到对应的私钥，再用私钥去操作的他的账号

### 交易

- 交易就是链外数据和链上数据产生的一次交互。比如发起一笔转账，在 StepN 里面发起一次 Claim 动作。 交易是对多个交易指令的打包，所以起内容主要就是各个交易指令，以及相应指令对应的发起人和签名。交易就是一连串的交易指令，以及需要签名的指令的签名内容。

### 合约

- 合约分为两类，一类是普通合约一类是系统合约，前者在 Solana 中称为"On Chain Program" 后者称为"Native Program" 其实本质都是类似其他公链上所说的合约。
- 系统合约是由节点在部署的时候生成的，普通用户无法更新，他们像普通合约一样，可以被其他合约或者 RPC 进行调用
  - 系统合约有
  - System Program: 创建账号，转账等作用
  - BPF Loader Program: 部署和更新合约
  - Vote program: 创建并管理用户 POS 代理投票的状态和奖励
- 一般我们说的合约都是普通合约，或者叫 "On Chain Program"。普通合约是由用户开发并部署，Solana 官方也有 一些官方开发的合约，如 Token、ATA 账号等合约。
  - 当用户通过"BPF Loader Program"部署一个新合约的时候，新合约 Account 中的被标记为 true，表示他是一个可以 被执行的合约账号。不同于有些公链，Solana 上的合约是可以被更新的，也可以被销毁。并且当销毁的时候，用于存储 代码的账号所消耗的资源也会归还给部署者。

### 合约与 Account

- 在上面的 Account 介绍中，我们有个 owner 的成员，这个就表示这个 Account 是被哪个合约管理的，或者说哪个 合约可以对这个 Account 进行读写，类似 Linux 操作系统中，文件属于哪个用户。

### 租约

- Solana 的资金模型中，每个 Solana 账户在区块链上存储数据的费用称为“租金”。 这种基于时间和空间的费用来保持账户及其数据在区块链上的活动为节点提供相应的收入。

- 所有 Solana 账户（以及计划）都需要保持足够高的 LAMPORT 余额，才能免除租金并保留在 Solana 区块链上。

- 当帐户不再有足够的 LAMPORTS 来支付租金时，它将通过称为垃圾收集的过程从网络中删除。

- 注意：租金与交易费用不同。 支付租金（或保存在账户中）以将数据存储在 Solana 区块链上。 而交易费用是为了处理网络上的指令而支付的。

### 租金率

- Solana 租金率是在网络范围内设置的，主要基于每年每字节设置的 LAMPORTS。 目前，租金率为静态金额并存储在 Rent 系统变量中。

### SPL 代币

- 在以太坊中，普通代币被一个叫 ERC20 的提案定了规范，可以认为普通代币合约统一叫做 ERC20 代币。

那么 Solana 世界里的 ERC20 代币是什么呢？答案就是 SPL 代币。

> The Solana Program Library (SPL) is a collection of on-chain programs targeting the Sealevel parallel runtime.

SPL Token 是 " Solana Program Library"中的一个组成部分，叫做"Token Program"，简称为 SPL Token。

所有的代币都有这个合约来管理，该合约代码在 <https://github.com/solana-labs/solana-program-library/tree/master/token>

### 代币信息

- 不同于以太坊中，一个代币就是一个合约。SPL Token 中，一个代币，仅仅是一个归 Token 合约管理的普通的 Account 对象，这个对象里面的二进制数据定义了 这个代币的基本属性。

![mint_wallet_account.png](/mint_wallet_account.png)

### SPL Token Account

- 那么每个用户的拥有的代币数量信息存在哪里呢？这个合约又定义了一个账号结构，来表示某个地址含有某个代币的数量。

![spl_pda_account.png](/spl_pda_account.png)
