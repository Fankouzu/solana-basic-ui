# 在Solana命令行中使用硬件钱包

签署交易需要使用私钥，但是将私钥存储在我们的私人电脑或者手机中，私钥容易被盗取。为私钥添加密码可以增加私钥的安全性，但

许多人想要更高的安全性于是将他们的私钥转移到一个名为*硬件钱包*的独立物理设备上。硬件钱包是一种小型手持设备，它存储私钥并为签名交易提供接口。

Solana命令行为硬件钱包提供了一流的支持，在任何地方使用密钥对文件路径（在使用文档中被称作`<keypair>`），用户可以发送*一个密钥对链接*，这个链接唯一标识了硬件钱包中的密钥对



## 支持的硬件钱包[](#支持的硬件钱包)

Solana命令行支持的硬件钱包如下

- [Ledger Nano S and Ledger Nano X](https://docs.solanalabs.com/cli/wallets/hardware/ledger)



## 指定一个密钥对链接[](#指定一个密钥对)

Solana定义了密钥对链接格式，以唯一定位连接到计算机的硬件钱包上的任何Solana密钥对。

 密钥对链接有以下形式，其中的方括号表示可选字段:

```txt
 usb://<MANUFACTURER>[/<WALLET_ID>][?key=<DERIVATION_PATH>]WALLET_ID
```

`WALLET_ID`是一个全局唯一的键，用于消除多个设备的歧义。

`DERVIATION_PATH`用于寻找硬件钱包中的Solana密钥。路径的形式为`<ACCOUNT>[/<CHANGE>]`,，其中每个`ACCOUNT`和`CHANGE`都是非负整数

例如，一个Ledger设备的一个完全合格的链接可能是:

```txt
usb://ledger/BsNsvfXqQTtJnagwFWdBS7FBXgnsK8VZ5CmuznN85swK?key=0/0
```

所有派生路径都隐式地包含前缀44'/501'，这表明路径遵循[BIP44]([bips/bip-0044.mediawiki at master · bitcoin/bips (github.com)](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki))规范，并且任何派生密钥都是Solana密钥(硬币类型501)。单引号表示“加固”派生。因为Solana使用Ed25519签名算法，所以所有派生密钥都是硬化的，因此添加引号是可自助选择和不必要的。



