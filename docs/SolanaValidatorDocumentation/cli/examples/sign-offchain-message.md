# 使用 Solana CLI 进行链下消息签名

链下消息签名是一种使用 Solana 钱包对非交易消息进行签名的方法。此功能可用于验证用户身份或提供钱包所有权的证明。

## 签名链下消息

要签署任意链下消息，请运行以下命令：

```bash
solana sign-offchain-message <MESSAGE>
```

消息将被编码并使用 CLI 的默认私钥签名，签名结果将输出。如果你想使用其他密钥签名，只需使用 `-k/--keypair` 选项：

```bash
solana sign-offchain-message -k <KEYPAIR> <MESSAGE>
```

默认情况下，构建消息的版本为0，这是当前唯一支持的版本。当其他版本可用时，您可以使用 `--version` 选项覆盖默认值：

```bash
solana sign-offchain-message -k <KEYPAIR> --version <VERSION> <MESSAGE>
```

消息格式根据版本和消息文本自动确定。

版本 `0` 头部指定了三种消息格式，以便在消息的兼容性和组合之间做出权衡：

|  ID  |     编码方式     | 最大长度 | 硬件钱包支持 |
| :--: | :--------------: | :------: | :----------: |
|  0   | 受限制的 ASCII * |   1212   |      是      |
|  1   |      UTF-8       |   1212   |   仅盲签名   |
|  2   |      UTF-8       |  65515   |      否      |

\* 是指 [`isprint(3)` ](https://linux.die.net/man/3/isprint) 返回 true 的那些字符，即 `0x20..=0x7e`。

格式 `0` 和 `1` 是针对硬件钱包支持设计的，因为硬件钱包的 RAM 用于存储有效载荷，并且字体字符支持有限。

要使用 Ledger 硬件钱包签署链下消息，请确保你的 Ledger 运行最新的固件版本以及 Solana Ledger 应用程序版本 1.3.0 或更高版本。在 Ledger 解锁且 Solana Ledger 应用程序打开后，运行：

```bash
solana sign-offchain-message -k usb://ledger <MESSAGE>
```

有关如何设置和使用账本设备的更多信息，请查阅[此链接](https://docs.solanalabs.com/cli/wallets/hardware/ledger)。

请注意，UTF-8 编码的消息需要在 Solana Ledger App 中启用 `Allow blind sign` (允许盲签名）选项。此外，由于 Ledger 设备缺乏 UTF-8 支持，在这种情况下仅会显示消息的哈希值。

如果 `Display mode`（展示模式）设置为 `Expert`（专家模式） ，Ledger 将显示有关要签名的消息的技术信息。

## 验证链下消息签名

要验证链下消息签名，请运行以下命令：

```bash
solana verify-offchain-signature <MESSAGE> <SIGNATURE>
```

CLI 会使用默认的签名者公钥。您可以使用 `--signer` 选项来指定其他的密钥：

```bash
solana verify-offchain-signature --signer <PUBKEY> <MESSAGE> <SIGNATURE>
```

如果签名邮件的版本与默认版本不同，则需要显式指定匹配版本：

```bash
solana verify-offchain-signature --version <VERSION> <MESSAGE> <SIGNATURE>
```

## 协议规范

为了确保链下消息不是有效的交易，它们被编码为固定的前缀： `\xffsolana offchain` ，其中选择第一个字节，使其作为当今交易 `MessageHeader` 中的第一个字节隐含非法。有关有效载荷格式和其他注意事项的更多详细信息，请参阅[提案](More details about the payload format and other considerations are available in the [proposal](https://github.com/solana-labs/solana/blob/master/docs/src/proposals/off-chain-message-signing.md).)。
