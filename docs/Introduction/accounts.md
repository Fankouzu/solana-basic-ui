# Solana 账户模型
On Solana, all data is stored in what are referred to as "accounts”. The way data is organized on Solana resembles a key-value store, where each entry in the database is called an "account".
在 Solana 上，所有数据都存储在所谓的“帐户”中。Solana 上的数据组织方式类似于[键值存储](https://en.wikipedia.org/wiki/Key%E2%80%93value_database)，其中数据库中的每个条目都称为“帐户”。

![Accounts](https://solana-developer-content.vercel.app/assets/docs/core/accounts/accounts.svg)
<center>Accounts</center>

## 要点
帐户最多可以存储10MB的数据，这些数据主要包含由可执行程序代码或程序状态。

帐户需要以SOL为单位的租赁押金，与存储的数据量成正比，该押金在帐户关闭时可全额退还。

每个帐户都有一个程序“所有者”。只有帐户所有者的程序才能修改其数据或扣除其lamport余额。但是，任何人都可以增加余额。

程序（智能合约）是存储可执行代码的无状态帐户。

数据帐户由程序创建，用于存储和管理程序状态。

本机程序是Solana运行时附带的内置程序。

Sysvar帐户是存储网络群集状态的特殊帐户。

## 帐户
每个帐户都可以通过其唯一地址进行识别，地址以[Ed25519算法](https://ed25519.cr.yp.to/)生成32个字节的公钥来表示。您可以将地址视为帐户的唯一标识符。
![](https://solana-developer-content.vercel.app/assets/docs/core/accounts/accounts.svg)
<center>账户地址 </center>

This relationship between the account and its address can be thought of as a key-value pair, where the address serves as the key to locate the corresponding on-chain data of the account.
账户与其地址之间的这种关系可以看作是键值对，其中地址用于定位账户相应链上数据。

### 账户信息
帐户的最大大小为[10MB（10兆字节）](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/system_instruction.rs#L85)，存储在 Solana 上每个帐户上的数据具有以下结构，称为[AccountInfo](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/account_info.rs#L19)。
![AccountInfo](https://solana-developer-content.vercel.app/assets/docs/core/accounts/accountinfo.svg)
<center>账户信息</center>

The AccountInfo for each account includes the following fields:
AccountInfo 对于每个帐户都包含以下字段：

data: A byte array that stores the state of an account. If the account is a program (smart contract), this stores executable program code. This field is often referred to as the "account data".
data ：存储帐户状态的字节数组。如果帐户是一个程序（智能合约），则存储可执行程序代码。此字段通常称为“帐户数据”。
executable: A boolean flag that indicates if the account is a program.
executable ：指示帐户是否为程序的布尔标志。
lamports: A numeric representation of the account's balance in lamports, the smallest unit of SOL (1 SOL = 1 billion lamports).
lamports ：账户余额的数字表示，单位为 lamports，即 SOL 的最小单位（1 SOL = 10 亿 lamports）。
owner: Specifies the public key (program ID) of the program that owns the account.
owner ：指定拥有该帐户的程序的公钥（程序 ID）。
As a key part of the Solana Account Model, every account on Solana has a designated "owner", specifically a program. Only the program designated as the owner of an account can modify the data stored on the account or deduct the lamport balance. It's important to note that while only the owner may deduct the balance, anyone can increase the balance.
作为 Solana 账户模型的关键部分，Solana 上的每个账户都有一个指定的“所有者”，特别是一个程序。只有被指定为账户所有者的程序才能修改账户上存储的数据或扣除lamport余额。需要注意的是，虽然只有所有者可以扣除余额，但任何人都可以增加余额。

INFO 信息
To store data on-chain, a certain amount of SOL must be transferred to an account. The amount transferred is proportional to the size of the data stored on the account. This concept is commonly referred to as “rent”. However, you can think of "rent" more like a "deposit" because the SOL allocated to an account can be fully recovered when the account is closed.
要在链上存储数据，必须将一定数量的 SOL 转移到一个账户。转移的金额与帐户中存储的数据大小成正比。这个概念通常被称为“租金”。但是，您可以将“租金”视为“押金”，因为当帐户关闭时，分配给帐户的 SOL 可以完全恢复。

Native Programs # 本机程序#
Solana contains a small handful of native programs that are part of the validator implementation and provide various core functionalities for the network. You can find the full list of native programs here.
Solana 包含少量原生程序，这些程序是验证器实现的一部分，并为网络提供各种核心功能。您可以在此处找到本机程序的完整列表。

When developing custom programs on Solana, you will commonly interact with two native programs, the System Program and the BPF Loader.
在 Solana 上开发自定义程序时，您通常会与两个本机程序进行交互，即系统程序和 BPF 加载程序。

System Program # 系统程序#
By default, all new accounts are owned by the System Program. The System Program performs several key tasks such as:
默认情况下，所有新帐户都归系统程序所有。系统程序执行几个关键任务，例如：

New Account Creation: Only the System Program can create new accounts.
创建新帐户：只有系统程序可以创建新帐户。
Space Allocation: Sets the byte capacity for the data field of each account.
空间分配：设置每个账户的数据字段的字节容量。
Assign Program Ownership: Once the System Program creates an account, it can reassign the designated program owner to a different program account. This is how custom programs take ownership of new accounts created by the System Program.
分配程序所有权：系统程序创建帐户后，可以将指定的程序所有者重新分配给其他程序帐户。这就是自定义程序获取系统程序创建的新帐户的所有权的方式。
On Solana, a "wallet" is simply an account owned by the System Program. The lamport balance of the wallet is the amount of SOL owned by the account.
在 Solana 上，“钱包”只是系统程序拥有的帐户。钱包的 lamport 余额是账户拥有的 SOL 金额。

System Account
System Account 系统帐户

INFO 信息
Only accounts owned by the System Program can be used as transaction fee payers.
只有系统程序拥有的帐户才能用作交易费用支付者。

BPFLoader Program # BPFLoader程序#
The BPF Loader is the program designated as the "owner" of all other programs on the network, excluding Native Programs. It is responsible for deploying, upgrading, and executing custom programs.
BPF 加载程序是被指定为网络上所有其他程序（不包括本机程序）的“所有者”的程序。它负责部署、升级和执行自定义程序。

Sysvar Accounts # Sysvar 账户#
Sysvar accounts are special accounts located at predefined addresses that provide access to cluster state data. These accounts are dynamically updated with data about the network cluster. You can find the full list of Sysvar Accounts here.
Sysvar 帐户是位于预定义地址的特殊帐户，用于提供对集群状态数据的访问。这些帐户会使用有关网络群集的数据动态更新。您可以在此处找到 Sysvar 帐户的完整列表。

Custom Programs # 自定义程序#
On Solana, “smart contracts” are referred to as programs. A program is an account that contains executable code and is indicated by an “executable” flag that is set to true.
在 Solana 上，“智能合约”被称为程序。程序是包含可执行代码的帐户，并由设置为 true 的“可执行”标志指示。

For a more detailed explanation of the program deployment process, refer to the Deploying Programs page of this documentation.
有关程序部署过程的更详细说明，请参阅本文档的“部署程序”页。

Program Account # 计划帐户#
When new programs are deployed on Solana, technically three separate accounts are created:
在 Solana 上部署新程序时，从技术上讲会创建三个单独的帐户：

Program Account: The main account representing an on-chain program. This account stores the address of an executable data account (which stores the compiled program code) and the update authority for the program (address authorized to make changes to the program).
程序账户：代表链上程序的主账户。此帐户存储可执行数据帐户的地址（用于存储已编译的程序代码）和程序的更新权限（有权对程序进行更改的地址）。
Program Executable Data Account: An account that contains the executable byte code of the program.
程序可执行数据帐户：包含程序的可执行字节码的帐户。
Buffer Account: A temporary account that stores byte code while a program is being actively deployed or upgraded. Once the process is complete, the data is transferred to the Program Executable Data Account and the buffer account is closed.
缓冲区帐户：在主动部署或升级程序时存储字节码的临时帐户。该过程完成后，数据将传输到程序可执行数据帐户，并关闭缓冲区帐户。
For example, here are links to the Solana Explorer for the Token Extensions Program Account and its corresponding Program Executable Data Account.
例如，以下是指向令牌扩展程序帐户及其对应程序可执行数据帐户的 Solana Explorer 的链接。

Program and Executable Data Accounts
Program and Executable Data Accounts
程序和可执行数据帐户

For simplicity, you can think of the "Program Account" as the program itself.
为简单起见，您可以将“程序帐户”视为程序本身。

Program Account
Program Account 计划帐户

INFO 信息
The address of the "Program Account" is commonly referred to as the “Program ID”, which is used to invoke the program.
“程序帐户”的地址通常称为“程序 ID”，用于调用程序。

Data Account # 数据帐户#
Solana programs are "stateless", meaning that program accounts only contain the program's executable byte code. To store and modify additional data, new accounts must be created. These accounts are commonly referred to as “data accounts”.
Solana 程序是“无状态的”，这意味着程序帐户仅包含程序的可执行字节码。若要存储和修改其他数据，必须创建新帐户。这些帐户通常称为“数据帐户”。

Data accounts can store any arbitrary data as defined in the owner program's code.
数据帐户可以存储所有者程序代码中定义的任何任意数据。

Data Account
Data Account 数据帐户

Note that only the System Program can create new accounts. Once the System Program creates an account, it can then transfer ownership of the new account to another program.
请注意，只有系统程序可以创建新帐户。一旦系统程序创建了一个帐户，它就可以将新帐户的所有权转移到另一个程序。

In other words, creating a data account for a custom program requires two steps:
换句话说，为自定义程序创建数据帐户需要两个步骤：

Invoke the System Program to create an account, which then transfers ownership to a custom program
调用系统程序创建一个帐户，然后将所有权转移给自定义程序
Invoke the custom program, which now owns the account, to then initialize the account data as defined in the program code
调用现在拥有该帐户的自定义程序，然后初始化程序代码中定义的帐户数据
This data account creation process is often abstracted as a single step, but it's helpful to understand the underlying process.
此数据帐户创建过程通常抽象为单个步骤，但了解基础过程很有帮助。