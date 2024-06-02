# 在 Solana 命令行界面中使用 Ledger Nano 硬件钱包

本页面描述了如何去使用 Ledger Nano S，Nano S Plus，或Nano X 通过命令行工具与Solana进行交互。

## 开始之前

+ [使用 Solana 应用程序设置 Nano](https://support.ledger.com/hc/en-us/articles/360016265659-Solana-SOL-?docs=true)
+ [安装 Solana 命令行工具](https://docs.solanalabs.com/cli/install)


## 在 Solana CLI 中使用 Ledger Nano

1. 确保 Ledger Live 应用已经关闭
2. 将您的 Nano 插入电脑USB接口
3. 输入密码并启动 Nano 上的 Solana 应用程序
4. 确认屏幕上显示“应用程式已就绪”

### 查看您的钱包 ID

在您的电脑上，运行：

```
solana-keygen pubkey usb://ledger
```

这将确认您的 Ledger 设备正确连接并处于与 Solana CLI 交互的合适状态。该命令会返回您 Ledger 独一无二的钱包 ID 。当您有多个 Nano 设备连接到同一台电脑时，您可以通过钱包 ID 来指定需要使用的 Ledger 硬件钱包。如果您仅计划一次只在电脑上使用一个 Nano ，那么就不需要包含钱包 ID 。有关使用钱包 ID 来指定使用特定 Ledger 的信息，请查看[管理多个硬件钱包](https://docs.solanalabs.com/cli/wallets/hardware/ledger#manage-multiple-hardware-wallets)

### 查看您的钱包地址

您的 Nano 支持任意数量的有效钱包和签名者。要查看任何地址，请使用如下所示的 `solana-keygen pubkey` 命令，后跟一个有效[密钥对URL](https://docs.solanalabs.com/cli/wallets/hardware/#specify-a-keypair-url)。

如果希望出于不同目的在您自己的账户之间转移代币，或者例如在设备上使用不同的密钥对作为权益账户的签署授权，拥有多个钱包地址会很管用。

下面所有命令都会显示与给定密钥对路径相关联的不同的地址，尝试一下吧！

```
solana-keygen pubkey usb://ledger
solana-keygen pubkey usb://ledger?key=0
solana-keygen pubkey usb://ledger?key=1
solana-keygen pubkey usb://ledger?key=2
```

+ **注意**：在**zsh**中，密钥对URL参数将被忽略，更多[详情请参考故障排除部分](https://docs.solanalabs.com/cli/wallets/hardware/ledger#troubleshooting)


你也可以为 `key=` 后面的数字使用其他值。这些命令所显示的任何地址都是有效的 Solana 钱包地址。与每个地址关联的私钥部分都被安全地保存在 Nano 上，并用于从该地址签署交易。只需记下来您用来派生任何接收代币地址的密钥对 URL 即可。

如果您计划在设备上仅使用单个地址/密钥对，一个易于记忆的好路径可能是使用 `key=0` 处的地址。使用以下命令查看此地址：

```
solana-keygen pubkey usb://ledger?key=0
```

现在您拥有了一个（或多个）钱包地址，您可以公开地将它们分享出去作为您的接收地址，并且您可以使用相应的密钥对 URL 作为从该地址发起交易的签署者。

### 查看余额

要查看任意账户的余额，无论它使用的是哪个钱包，请使用 `solana balance` 命令：

```
solana balance SOME_WALLET_ADDRESS
```

例如，如果您的地址是 `7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri` ，则输入以下命令以查看余额：

```
solana balance 7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri
```

您也可以在 [Explorer](https://explorer.solana.com/accounts) 的“Accounts”标签页中查看任何账户地址的余额，将地址粘贴到框中以便在网页浏览器中查看余额。

**注意**：任何余额为0 SOL 的地址，比如您在 Ledger 上新创建的地址，在 Explorer 中会显示为“未找到”。在 Solana 中，空账户和不存在的账户视为相同。当您的账户地址中有 SOL 时，这种情况就会改变。

### 从 Nano 中发送 SOL

要从由您的 Nano 控制的地址发送代币，您需要使用该设备签署交易，使用与派生地址相同的密钥对 URL 。为此，请确保您的 Nano 已插入，并已使用 PIN 解锁，Ledger Live 没有运行，并且设备上已打开 Solana 应用程序，显示“应用程序已就绪”。

`solana transfer` 命令用于指定向哪个地址发送代币、发送多少代币，并使用 `--keypair` 参数来指定哪个密钥对正在发送代币，该密钥对将签署交易，且与此地址关联的余额将会减少。

```
solana transfer RECIPIENT_ADDRESS AMOUNT --keypair KEYPAIR_URL_OF_SENDER
```

下面是一个完整示例。首先，查看特定密钥对URL处的地址。其次，检查该地址的余额。最后，输入转账交易，向收款地址 `7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri` 发送 `1`  SOL 。当您按下回车键执行转账命令时，系统会提示您在 Ledger 设备上批准交易详情。在设备上，使用右和左按钮审查交易详情。如果一切无误，点击“批准”屏幕上的两个按钮，否则在“拒绝”屏幕上按下两个按钮。

```
~$ solana-keygen pubkey usb://ledger?key=42
CjeqzArkZt6xwdnZ9NZSf8D1CNJN1rjeFiyd8q7iLWAV

~$ solana balance CjeqzArkZt6xwdnZ9NZSf8D1CNJN1rjeFiyd8q7iLWAV
1.000005 SOL

~$ solana transfer 7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri 1 --keypair usb://ledger?key=42
Waiting for your approval on Ledger hardware wallet usb://ledger/2JT2Xvy6T8hSmT8g6WdeDbHUgoeGdj6bE2VueCZUJmyN
✅ Approved

Signature: kemu9jDEuPirKNRKiHan7ycybYsZp7pFefAdvWZRq5VRHCLgXTXaFVw3pfh87MQcWX4kQY4TjSBmESrwMApom1V
```

在设备上批准交易后，程序将显示交易签名，并等待最大确认数（32）之后返回。这只需要几秒钟，然后交易在 Solana 网络上最终确定。您可以通过访问 [Explorer](https://explorer.solana.com/transactions) 的“Transaction”标签页并粘贴交易签名来查看此交易或任何其他交易的详细信息。

## 进阶操作

### 管理多个硬件钱包

有时使用来自多个硬件钱包的密钥签署交易非常有用。使用多个钱包进行签名需要完全限定的密钥对 URL 。如果 URL 不是完全限定的，Solana 命令行界面（CLI）会提示您选择所有已连接硬件钱包的完全限定 URL ，并要求您为每个签名选择要使用的钱包。

除了使用交互式提示之外，您可以使用 Solana CLI 的 `resolve-signer` 命令生成完全限定的URL。例如，尝试将 Nano 连接到 USB，使用 PIN 码解锁，然后运行以下命令：

```
solana resolve-signer usb://ledger?key=0/0
```

您将看到类似的输出：

```
usb://ledger/BsNsvfXqQTtJnagwFWdBS7FBXgnsK8VZ5CmuznN85swK?key=0/0
```

但其中 `BsNsvfXqQTtJnagwFWdBS7FBXgnsK8VZ5CmuznN85swK` 是您的 `WALLET_ID` 。

有了完全限定的 URL，您可以在同一台计算机上连接多个硬件钱包，并唯一识别出它们中任何一个的密钥对。在 Solana 命令期望的 `<KEYPAIR>` 条目处使用 `resolve-signer` 命令的输出，将该解析路径作为给定交易相应部分的签署者使用。

## 故障排除

### 在 zsh 中密钥对 URL 参数被忽略

问号字符在 zsh 中是一个特殊字符。如果您不使用这个特性，可以在您的 ~/.zshrc 文件中添加以下行，将问号视为普通字符：

```
unsetopt nomatch
```

之后，要么重启您的 shell 窗口，要么运行 `~/.zshrc` 来重新加载配置：

```
source ~/.zshrc
```

如果您不想禁用 zsh 对问号字符的特殊处理，也可以在密钥对 URL 中用反斜线对其进行显式禁用。例如：

```
solana-keygen pubkey usb://ledger\?key=0
```

## 支持与帮助

您可以在 [Solana StackExchange](https://solana.stackexchange.com/) 上找到更多的支持与帮助。

了解更多关于[发送和接收代币](https://docs.solanalabs.com/cli/examples/transfer-tokens)以及[委托权益](https://docs.solanalabs.com/cli/examples/delegate-stake)的信息。您可以在任何接受选项或参数 `<KEYPAIR>` 的地方使用您的 Ledger 密钥对 URL。