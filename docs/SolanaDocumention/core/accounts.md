# Solana 账户模型
在 Solana 上，所有数据都存储在所谓的“帐户”中。Solana 上的数据组织方式类似于[键值存储](https://en.wikipedia.org/wiki/Key%E2%80%93value_database)，其中数据库中的每个条目都称为“帐户”。

![Accounts](https://solana-developer-content.vercel.app/assets/docs/core/accounts/accounts.svg)
<center>Accounts</center>

## 要点
- 帐户最多可以存储10MB的数据，这些数据主要包含由可执行程序代码或程序状态。

- 帐户需要以SOL为单位的租赁押金，与存储的数据量成正比，该押金在帐户关闭时可全额退还。

- 每个帐户都有一个程序“所有者”。只有帐户所有者的程序才能修改其数据或扣除其lamport余额。但是，任何人都可以增加余额。

- 程序（智能合约）是存储可执行代码的无状态帐户。

- 数据帐户由程序创建，用于存储和管理程序状态。

- 本机程序是Solana运行时附带的内置程序。

- Sysvar帐户是存储网络群集状态的特殊帐户。

## 帐户
每个帐户都可以通过其唯一地址进行识别，地址以[Ed25519算法](https://ed25519.cr.yp.to/)生成32个字节的`公钥`来表示。您可以将地址视为帐户的唯一标识符。
![](https://solana-developer-content.vercel.app/assets/docs/core/accounts/accounts.svg)
<center>账户地址 </center>

账户与其地址之间的这种关系可以看作是键值对，其中地址用于定位账户相应链上数据。

### 账户信息
帐户的最大大小为[10MB（10兆字节）](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/system_instruction.rs#L85)，存储在 Solana 上每个帐户上的数据具有以下结构，称为[AccountInfo](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/account_info.rs#L19)。
![AccountInfo](https://solana-developer-content.vercel.app/assets/docs/core/accounts/accountinfo.svg)
<center>账户信息</center>

对于每个帐户`AccountInfo`都包含以下字段：

- `data` ：存储帐户状态的字节数组。如果帐户是一个程序（智能合约），则存储可执行程序代码。此字段通常称为“帐户数据”。
- `executable` ：指示帐户是否为程序的布尔标志。
- `lamports` ：账户余额的数字表示，单位为[lamports](https://solana.com/docs/terminology#lamport)，即 SOL 的最小单位（1 SOL = 10 亿 lamports）。
- `owner` ：指定拥有帐户程序的公钥（程序 ID）。

作为Solana账户模型的关键部分，Solana 上的每个账户都有一个指定的“所有者”，特别是一个程序。只有被指定为账户所有者的程序才能修改账户上存储的数据或扣除lamport余额。需要注意的是，虽然只有所有者可以扣除余额，但任何人都可以增加余额。

:::tip INFO
要在链上存储数据，必须将一定数量的SOL转移到一个账户。转移的金额与帐户中存储的数据大小成正比。这个概念通常被称为“租金”。但是，您可以将“租金”视为“押金”，因为当帐户关闭时，分配给帐户的SOL可以完全恢复。
:::

## 本机程序
Solana包含少量原生程序，这些程序是验证器实现的一部分，并为网络提供各种核心功能。您可以在[此处](https://docs.solanalabs.com/runtime/programs)找到本机程序的完整列表。

在Solana上开发自定义程序时，您通常会与两个本机程序进行交互，即系统程序和BPF加载程序。

### 系统程序

默认情况下，所有新帐户都归[系统程序](https://github.com/solana-labs/solana/tree/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/system/src)所有。系统程序执行几个关键任务，例如：

New Account Creation: Only the System Program can create new accounts.
- [创建新帐户](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/system/src/system_processor.rs#L145)：只有系统程序可以创建新帐户。
- [空间分配](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/system/src/system_processor.rs#L70)：设置每个账户的数据字段的字节容量。
- [分配程序所有权](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/system/src/system_processor.rs#L112)：系统程序创建帐户后，可以将指定的程序所有者重新分配给其他程序帐户。这就是自定义程序获取系统程序创建的新帐户的所有权的方式。
在Solana上，“钱包”只是系统程序拥有的帐户。钱包的lamport余额是账户拥有的SOL金额。

![System Account](https://solana-developer-content.vercel.app/assets/docs/core/accounts/system-account.svg)

<center>系统帐户</center>

:::tip INFO
只有系统程序拥有的帐户才能用作交易费用支付方。
:::

### BPFLoader程序
[BPF加载程序](https://github.com/solana-labs/solana/tree/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src)是被指定为网络上所有其他程序（不包括本机程序）的“所有者”的程序。它负责部署、升级和执行自定义程序。

## Sysvar账户
Sysvar帐户是位于预定义地址的特殊帐户，用于提供对集群状态数据的访问。这些帐户会使用有关网络群集的数据动态更新。您可以在[此处](https://docs.solanalabs.com/runtime/sysvars)找到Sysvar帐户的完整列表。

## 自定义程序
在 Solana 上，“智能合约”被称为[程序](https://solana.com/docs/core/programs)。程序是包含可执行代码的帐户，并由设置为 true 的“可执行”标志指示。

有关程序部署过程的更详细说明，请参阅本文档的[“部署程序”](https://solana.com/docs/programs/deploying)页。

### 程序帐户
在Solana上[部署](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src/lib.rs#L498)新程序时，从技术上讲会创建三个单独的帐户：

- `程序账户`：代表链上程序的主账户。此帐户存储可执行数据帐户的地址（用于存储已编译的程序代码）和程序的更新权限（有权对程序进行更改的地址）。
- `程序可执行数据帐户`：包含程序的可执行字节码的帐户。
- `缓冲区帐户`：在主动部署或升级程序时存储字节码的临时帐户。该过程完成后，数据将传输到程序可执行数据帐户，并关闭缓冲区帐户。
例如，以下是指向令牌扩展[程序帐户](https://explorer.solana.com/address/TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb)及其对应程序[可执行数据帐户](https://explorer.solana.com/address/DoU57AYuPFu2QU514RktNPG22QhApEjnKxnBcu4BHDTY)的 Solana Explorer 的链接。

![Program and Executable Data Accounts](https://solana-developer-content.vercel.app/assets/docs/core/accounts/program-account-expanded.svg)
<center>程序和可执行数据帐户</center>

为简单起见，您可以将“程序帐户”视为程序本身。

![Program Account](https://solana-developer-content.vercel.app/assets/docs/core/accounts/program-account-simple.svg)
<center>程序帐户</center>

:::tip INFO
“程序帐户”的地址通常称为“程序 ID”，用于调用程序。
:::

## 数据帐户
Solana程序是“无状态的”，这意味着程序帐户仅包含程序的可执行字节码。若要存储和修改其他数据，必须创建新帐户。这些帐户通常称为“数据帐户”。

数据帐户可以存储所有者程序代码中定义的任何任意数据。

![Data Account](https://solana-developer-content.vercel.app/assets/docs/core/accounts/data-account.svg)
<center>数据帐户</center>

请注意，只有[系统程序](https://solana.com/docs/core/accounts#system-program)可以创建新帐户。一旦系统程序创建了一个帐户，它就可以将新帐户的所有权转移到另一个程序。

换句话说，为自定义程序创建数据帐户需要两个步骤：
1. 调用系统程序创建一个帐户，然后将所有权转移给自定义程序

2. 调用现在拥有该帐户的自定义程序，然后初始化程序代码中定义的帐户数据

此数据帐户创建过程通常抽象为单个步骤，但了解基础过程很有帮助。