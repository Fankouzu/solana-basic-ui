# 代币升级程序

代币升级程序提供了一种无状态协议，用于将代币从一个铸币地址永久转换为另一个铸币地址。

该程序提供了一种简单的机制，用于烧毁原始代币并从由程序控制的托管账户中接收相同数量的新代币。

## 审计

该仓库的 [README](https://github.com/solana-labs/solana-program-library#audits) 文件包含关于程序审计的信息。


## 背景

Token-2022 包含许多新功能，供铸币地址所有者自定义其代币的行为。您可以在[文档](https://spl.solana.com/token-2022)中找到有关 Token-2022 及其扩展的完整信息。

铸币地址所有者可能希望为其用户利用这些新功能，但无法自动将代币从 Token 转换为 Token-2022。

代币升级程序定义了一个托管授权，这是由两个地址（原始铸币地址和新铸币地址）派生出的程序地址。任何由该托管授权拥有或委托的新代币账户都可以用作托管账户。

原始代币持有者提供他们的原始代币账户、新代币账户和托管账户。如果托管账户中有足够的代币，协议将烧毁原始代币并将相同数量的新代币转移到用户的新账户。

该程序确保两个铸币地址的小数位数相同，因此如果铸币地址的小数位数不同，升级将失败。

该程序完全无状态且实现简单因此铸币地址所有者可以根据需要添加额外功能。例如，如果他们想在具有不同小数位数的铸币地址之间进行升级，可以定义如何按需缩放转移的数量。

**注意**：代币升级程序也可以交换属于同一程序但不同铸币地址的代币。例如，铸币地址所有者可以在两个 Token-2022 铸币地址之间提供升级。如果铸币地址所有者希望为其铸币地址添加新功能，这将非常有用。


## 源代码

代币升级程序的源代码可在 [GitHub](https://github.com/solana-labs/solana-program-library) 上找到。

## 接口

代币升级程序使用 Rust 编写，可在 [crates.io](https://crates.io/) 和 [docs.rs](https://docs.rs/) 上找到。

## 命令行工具

`spl-token-upgrade` 命令行工具可用于管理代币升级。如果你已经安装了[Rust](https://rustup.rs/)，运行以下命令：

```sh
$ cargo install spl-token-upgrade-cli
```

运行 `spl-token-upgrade --help` 获取可用命令的完整说明。

### 配置

`spl-token-upgrade` 配置与 `solana` 命令行工具共享。

## 代币升级流程

本节描述了铸币地址所有者和代币持有者如何将代币从Token标准升级到Token-2022的过程。

本指南还将使用`spl-token`命令行工具。更多详情，请参阅完整的[Token文档](https://spl.solana.com/token)。

### 准备工作

一名铸币所有者拥有一枚与Token程序关联的铸币，其地址为`o1d5Jt8z8vszx4FJ2gNJ3FZH34cer9sbparg7GVt7qm`，他们希望`o1d`代币持有者能将其代币升级到与Token-2022标准关联的`NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ`代币。

### 创建代币托管账户

命令行工具允许任何人创建一个由托管授权拥有的新代币账户，给定原始和新铸币地址：

```sh
$ spl-token-upgrade create-escrow o1d5Jt8z8vszx4FJ2gNJ3FZH34cer9sbparg7GVt7qm NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ

Creating escrow account 2mW9oGUbaJiCHtkhN5TNTaucY2ziJmAdcJtp5Ud6m4Jy owned by escrow authority A38VXB1Qgssz2qkKgzEkyZNQ27oTuy18T6tA9HRP5mpE

Signature: 4tuJffE4DTrsXb7AM3UWNjd286vyAQcvhQaSKPVThaZMzaBiptKCKudaMWjbbygTUEaho87Ar288Mih5Hx6PpKke
```

**注意**：命令行工具为托管授权创建关联的代币账户，但任何由托管授权拥有或委托的 `NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ` 代币账户都可以用于升级。

### 将代币添加到托管账户

创建了托管账户后，铸币地址所有者必须向该账户添加代币。他们可以通过铸造新代币或转移现有代币来完成此操作。

```sh
$ spl-token mint NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ 1000 2mW9oGUbaJiCHtkhN5TNTaucY2ziJmAdcJtp5Ud6m4Jy
```

或者:

```sh
$ spl-token transfer NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ 1000 2mW9oGUbaJiCHtkhN5TNTaucY2ziJmAdcJtp5Ud6m4Jy
```

### 将原始代币升级为新代币

准备好所有账户后，任何原始代币持有者可以随时兑换新代币。

首先，他们必须创建一个新代币账户以接收代币：

```sh
$ spl-token create-account NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ
```

接下来转换代币:

```sh
$ spl-token-upgrade exchange o1d5Jt8z8vszx4FJ2gNJ3FZH34cer9sbparg7GVt7qm NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ

Burning tokens from account 4YfpfMzHYCCYVBJqvTG9VtTPLMuPzVBi77aMRxVB4TDg, receiving tokens into account JCaWYSvLZkja51RbToWBaV4kp1PhfddX64cTLUqpdMzE

Signature: 3Zs1PtMV7XyRpfX9k7cPg7Hd43URvBD3aYEnd6hb5deKvSWXrEW5yoRaCuqtYJSsoa2WtkdprTsHEh3VLYWEGhkb
```

该工具默认使用用户在原始和新铸币地址上的关联代币账户，以及托管授权在新铸币地址上的账户。也可以单独指定这些账户：

```sh
$ spl-token-upgrade exchange o1d5Jt8z8vszx4FJ2gNJ3FZH34cer9sbparg7GVt7qm NewnQeoDG4BbHRCodgjscuypfXdiixcWDPyLiseziQZ --burn-from 4YfpfMzHYCCYVBJqvTG9VtTPLMuPzVBi77aMRxVB4TDg --destination JCaWYSvLZkja51RbToWBaV4kp1PhfddX64cTLUqpdMzE --escrow 2mW9oGUbaJiCHtkhN5TNTaucY2ziJmAdcJtp5Ud6m4Jy

Burning tokens from account 4YfpfMzHYCCYVBJqvTG9VtTPLMuPzVBi77aMRxVB4TDg, receiving tokens into account JCaWYSvLZkja51RbToWBaV4kp1PhfddX64cTLUqpdMzE

Signature: 3P4o4Fxnm4yvB9i6jQzyniqNUqnNLsaQZmCw5q5n5J8nwv9wxJ73ZRYH3XNFT4ferDbCXMqc5egCkhZEkyfCxhgC
```

升级后，用户可以清理旧代币账户以回收用作租金的 lamports。

```sh
$ spl-token close o1d5Jt8z8vszx4FJ2gNJ3FZH34cer9sbparg7GVt7qm
```
