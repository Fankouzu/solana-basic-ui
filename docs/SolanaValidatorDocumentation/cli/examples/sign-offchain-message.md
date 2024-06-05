# 使用 Solana CLI 进行链下消息签名

链下消息签名是一种使用 Solana 钱包对非交易消息进行签名的方法。此功能可用于验证用户或者提供钱包拥有者的证明。



## 签署链下消息

要签署任意的链下消息，请运行以下的命令：

```
solana sign-offchain-message <MESSAGE>
```

该消息会被编码并被 CLI 的默认私钥签名，并且签名会输出到返回值中。如果您想使用其他密钥对其进行签名，只需使用 `-k/--keypair`  选项：

```
solana sign-offchain-message -k <KEYPAIR> <MESSAGE>
```

默认情况下，构建消息的版本为0，这是当前唯一支持的版本。当其他版本可用时，您可以使用 `--version` 选项覆盖默认值：

```
solana sign-offchain-message -k <KEYPAIR> --version <VERSION> <MESSAGE>
```

根据版本号和消息文本，消息格式会自动确定。

版本 `0` 头部指定了三种消息格式，以便在消息的兼容性和组合之间做出权衡：

|  ID  |     编码方式     | 最大长度 | 硬件钱包支持 |
| :--: | :--------------: | :------: | :----------: |
|  0   | 受限制的 ASCII * |   1212   |      是      |
|  1   |      UTF-8       |   1212   |    仅盲签    |
|  2   |      UTF-8       |  65515   |      否      |

*这些字符使 [`isprint(3)` ](https://linux.die.net/man/3/isprint)返回真，即，`0x20..=0x7e` 。

格式 `0` 和 `1` 是由硬件钱包支持驱动的，其中储存有效载荷的RAM和字体字符支持都是有限的。

要使用 Ledger 来签署一个离线消息，请确保您的 Ledger 运行的是最新的固件以及 Solana Ledger 应用版本是1.3.0或更高的版本。在解锁 Ledger 并打开 Solana Ledger App 后，请运行：

```
solana sign-offchain-message -k usb://ledger <MESSAGE>
```

要了解更多关于如何安装与使用 ledger 设备的信息，请查阅[此链接](https://docs.solanalabs.com/cli/wallets/hardware/ledger)。

请注意，UTF-8编码方式需要 在 Solana Ledger 中启用 `Allow blind sign` （允许盲签名）选项。同时，由于 Ledger 设备缺乏对 UTF-8 的支持，在这种情况下智慧显示消息的哈希值。

如果设置 `Display mode` （显示模式）为 `Expert` （专家），Ledger 将会显示关于待签名消息的技术信息。



## 验证链下消息签名

要验证链下消息签名，请运行以下命令：

```
solana verify-offchain-signature <MESSAGE> <SIGNATURE>
```

CLI 会使用默认的签名者公钥。您可以使用 `--signer` 选项来指定其他的密钥：

```
solana verify-offchain-signature --signer <PUBKEY> <MESSAGE> <SIGNATURE>
```

如果被签署的消息版本与默认的不同，您需要明确地指定其匹配的版本：

```
solana verify-offchain-signature --version <VERSION> <MESSAGE> <SIGNATURE>
```



## 协议规范

为了保证链下消息不被视为有效交易，他们采用了一个固定的前缀进行编码：`\xffsolana offchain` ，其中的第一个字符在今天的交易事务 `MessageHeader` 中作为首字节时是隐式非法的。关于有效载荷格式和其他注意事项的更多信息，请参阅[提案](More details about the payload format and other considerations are available in the [proposal](https://github.com/solana-labs/solana/blob/master/docs/src/proposals/off-chain-message-signing.md).)