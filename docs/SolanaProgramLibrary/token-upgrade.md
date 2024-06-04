# 代币升级程序

代币升级程序是一种无状态协议，用于永久性地将代币从一种铸币转换到另一种铸币。

该程序提供了一种简易机制，用于销毁原始代币，并从受程序控制的托管账户中接收等量的新代币。这种机制确保了转换过程的安全与高效，同时维持了代币总量的一致性。

## 审计

该仓库的 [README](https://github.com/solana-labs/solana-program-library#audits) 文件包含关于程序审计的信息。


## 背景

Token-2022 包含了许多新功能，使铸币所有者能够定制其代币的行为。关于 Token-2022 及其扩展的完整信息，您可以在[文档](https://spl.solana.com/token-2022)中找到。

铸币所有者可能希望利用新功能来提升用户体验，但目前没有自动将 Token 转换至 Token-2022 的方法。

代币升级程序定义了一个托管权限，这是一个从两个地址（原铸币和新铸币）派生出的程序地址。任何由该托管权限拥有或被委派的新代币账户都可作为托管账户使用。

持有原代币的用户需提供其原始代币账户、一个新代币账户以及托管账户。如果托管账户中的代币数量足够，协议将销毁原代币，并将相同数量的新代币转移至用户的新开账户。

程序会确保原铸币与新铸币的小数位数相同，若两者小数位数不同，则升级将失败。

该程序完全无状态且实现简单，所以铸币所有者可以添加额外功能进行定制。例如，如果他们希望在小数位数不同的铸币间进行升级，可以自定义如何按需求扩大或缩小转移的数量。

**注意**：代币升级程序同样支持在同一程序下，但不同铸币之间的代币交换。例如，铸币所有者可在两个 Token-2022 铸币之间提供升级。这对于铸币所有者想要为其铸币增添新功能时非常有用。


## 源代码

代币升级程序的源代码可在 [GitHub](https://github.com/solana-labs/solana-program-library) 上找到。

## 接口

代币升级程序使用 Rust 编写，可在 [crates.io](https://crates.io/) 和 [docs.rs](https://docs.rs/) 上找到。

## 命令行工具

`spl-token-upgrade` 命令行工具可用于管理代币升级。一旦你已经安装了[Rust](https://rustup.rs/)，运行以下命令：

```sh
$ cargo install spl-token-upgrade-cli
```

运行 `spl-token-upgrade --help` 来获取所有可用命令的完整描述。这将帮助你了解如何使用此工具执行各种与代币升级相关的操作。

### 配置

`spl-token-upgrade` 与 `solana` 命令行工具共享配置文件.

## 代币升级流程

本节将介绍铸币所有者及代币持有者如何将代币从Token标准升级到Token-2022标准的过程。

本指南还将使用`spl-token`命令行工具。更多详情，请参阅完整的[Token文档](https://spl.solana.com/token)。

### 准备工作

一名铸币所有者拥有一枚与Token程序关联的铸币，其地址为`o1d5Jt8z8vszx4FJ2gNJ3FZH34cer9sbparg7GVt7qm`，他们希望`o1d`代币持有者能将其代币升级到与Token-2022标准相关联的`NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ`代币。

### 创建代币托管账户

通过给定的原铸币和新铸币地址，任何人可使用命令行工具创建一个新的代币账户，该账户具有托管权限：

```sh
$ spl-token-upgrade create-escrow o1d5Jt8z8vszx4FJ2gNJ3FZH34cer9sbparg7GVt7qm NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ

Creating escrow account 2mW9oGUbaJiCHtkhN5TNTaucY2ziJmAdcJtp5Ud6m4Jy owned by escrow authority A38VXB1Qgssz2qkKgzEkyZNQ27oTuy18T6tA9HRP5mpE

Signature: 4tuJffE4DTrsXb7AM3UWNjd286vyAQcvhQaSKPVThaZMzaBiptKCKudaMWjbbygTUEaho87Ar288Mih5Hx6PpKke
```

**注意**：命令行工具会为托管权限创建关联的代币账户，但是任何`NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ`的代币账户都可以用于升级，只要该账户归托管权限所有或被委托给托管权限即可。

### 向托管账户添加代币

创建了托管账户后，铸币所有者现在必须向该账户添加代币。可以通过铸造新的代币或转移现有的代币来完成这一操作。

```sh
$ spl-token mint NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ 1000 2mW9oGUbaJiCHtkhN5TNTaucY2ziJmAdcJtp5Ud6m4Jy
```

或者:

```sh
$ spl-token transfer NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ 1000 2mW9oGUbaJiCHtkhN5TNTaucY2ziJmAdcJtp5Ud6m4Jy
```

### 将原始代币升级为新代币

当所有账户准备就绪后，任何原始代币持有人都可以在他们想要的任何时候兑换新代币。

首先，他们必须创建一个新的代币账户以接收这些代币。

```sh
$ spl-token create-account NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ
```

接下来转换代币:

```sh
$ spl-token-upgrade exchange o1d5Jt8z8vszx4FJ2gNJ3FZH34cer9sbparg7GVt7qm NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ

Burning tokens from account 4YfpfMzHYCCYVBJqvTG9VtTPLMuPzVBi77aMRxVB4TDg, receiving tokens into account JCaWYSvLZkja51RbToWBaV4kp1PhfddX64cTLUqpdMzE

Signature: 3Zs1PtMV7XyRpfX9k7cPg7Hd43URvBD3aYEnd6hb5deKvSWXrEW5yoRaCuqtYJSsoa2WtkdprTsHEh3VLYWEGhkb
```

该工具默认情况下会使用与用户关联的代币账户，包括原始代币铸币、新代币铸币以及新代币上的托管授权。不过，你也可以选择分别指定每一个账户：

```sh
$ spl-token-upgrade exchange o1d5Jt8z8vszx4FJ2gNJ3FZH34cer9sbparg7GVt7qm NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ --burn-from 4YfpfMzHYCCYVBJqvTG9VtTPLMuPzVBi77aMRxVB4TDg --destination JCaWYSvLZkja51RbToWBaV4kp1PhfddX64cTLUqpdMzE --escrow 2mW9oGUbaJiCHtkhN5TNTaucY2ziJmAdcJtp5Ud6m4Jy

Burning tokens from account 4YfpfMzHYCCYVBJqvTG9VtTPLMuPzVBi77aMRxVB4TDg, receiving tokens into account JCaWYSvLZkja51RbToWBaV4kp1PhfddX64cTLUqpdMzE

Signature: 3P4o4Fxnm4yvB9i6jQzyniqNUqnNLsaQZmCw5q5n5J8nwv9wxJ73ZRYH3XNFT4ferDbCXMqc5egCkhZEkyfCxhgC
```
升级后，用户可以清理旧的代币账户，以便回收租金。

```sh
$ spl-token close o1d5Jt8z8vszx4FJ2gNJ3FZH34cer9sbparg7GVt7qm
```