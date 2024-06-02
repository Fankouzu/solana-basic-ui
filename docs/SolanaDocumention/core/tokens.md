# Solana链上代币

代币是代表不同类别资产所有权的数字资产。
代币化使产权的数字化成为可能，是管理可替代和不可替代资产的基本组成部分。

- 同质化代币代表相同类型和价值的可互换和可分割资产（例如 USDC）。

- 非同质化代币（NFT）代表不可分割资产（例如艺术品）的所有权。

本节将介绍代币在 Solana 上如何表示的基础知识。这些被称为 SPL
([Solana 程序库](https://github.com/solana-labs/solana-program-library))
代币

- [代币程序](https://solana.com/docs/core/tokens#token-program)包含与网络上的代币（同质化和非同质化）交互的所有指令逻辑。

- [铸币账户](https://solana.com/docs/core/tokens#mint-account)代表一种特定类型的代币，并存储有关代币的全局元数据，
  例如总供应量和铸币权限（授权创建代币新单位的地址）。

- [代币账户](https://solana.com/docs/core/tokens#token-account)跟踪特定地址拥有特定类型代币（铸币账户）的单位数量的个人所有权。


：：：tips INFO
代币程序目前有两个版本。原始[代币程序](https://github.com/solana-labs/solana-program-library/tree/b1c44c171bc95e6ee74af12365cb9cbab68be76c/token/program)和[代币扩展程序](https://github.com/solana-labs/solana-program-library/tree/b1c44c171bc95e6ee74af12365cb9cbab68be76c/token/program-2022)（Token2022）。代币扩展程序的功能与原始代币程序相同，但具有附加功能和改进。代币扩展程序是用于创建新代币（铸币账户）的推荐版本。
:::

## 要点

- 代币代表对同质化（可互换）或非同质化（唯一）资产的所有权。

- 代币程序包含与网络上同质化和非同质化代币交互的所有指令。

- 代币扩展程序是代币程序的新版本，它包含其他功能，同时保持相同的核心功能。

- Mint账户代表网络上的唯一代币，并存储全局元数据，例如总供应量。

- 代币账户跟踪特定铸币账户的个人代币所有权。

- 关联代币账户是使用源自所有者和铸币账户地址的地址创建的代币账户。


## 代币程序

[代币程序](https://github.com/solana-labs/solana-program-library/tree/b1c44c171bc95e6ee74af12365cb9cbab68be76c/token/program)
包含与网络上的代币（同质化和非同质化）交互的所有指令逻辑。
Solana上的所有代币实际上是代币计划拥有的
[数据账户](https://solana.com/docs/core/accounts#data-account)。

您可以在
[此处](https://github.com/solana-labs/solana-program-library/blob/b1c44c171bc95e6ee74af12365cb9cbab68be76c/token/program/src/instruction.rs)
找到代币程序说明的完整列表。

![代币程序](https://solana-developer-content.vercel.app/assets/docs/core/tokens/token-program.svg)

一些常用的说明包括：

- [`InitializeMint`](https://github.com/solana-labs/solana-program-library/blob/b1c44c171bc95e6ee74af12365cb9cbab68be76c/token/program/src/processor.rs#L29):
   ：创建一个新的铸币账户来代表一种新型的代币。
- [`InitializeAccount`](https://github.com/solana-labs/solana-program-library/blob/b1c44c171bc95e6ee74af12365cb9cbab68be76c/token/program/src/processor.rs#L84):
 ：创建一个新的代币账户来持有特定类型代币（铸币厂）的单位。
- [`MintTo`](https://github.com/solana-labs/solana-program-library/blob/b1c44c171bc95e6ee74af12365cb9cbab68be76c/token/program/src/processor.rs#L522):
 创建特定类型代币的新单位，并将其添加到代币帐户。这增加了代币的供应，并且只能由铸币账户的铸币厂机构完成。
- [`Transfer`](https://github.com/solana-labs/solana-program-library/blob/b1c44c171bc95e6ee74af12365cb9cbab68be76c/token/program/src/processor.rs#L228):
 将特定类型代币的单位从一个代币账户转移到另一个代币账户。

### Mint账户

Solana 上的代币由代币计划拥有的[铸币账户](https://github.com/solana-labs/solana-program-library/blob/b1c44c171bc95e6ee74af12365cb9cbab68be76c/token/program/src/state.rs#L18-L32)
的地址唯一标识。
此帐户实际上是特定代币的全局计数器，并存储以下数据：

- 供应量：代币的总供应量
- 代币精度：代币小数精度位数
- 铸币权限：被授权创建代币新单位的账户，从而增加供应量
- 冻结权限：有权冻代币从“代币账户”转移的账户


![Mint Account](https://solana-developer-content.vercel.app/assets/docs/core/tokens/mint-account.svg)

存储在每个铸币厂帐户上的完整详细信息包括以下内容：

```rust
pub struct Mint {
    /// Optional authority used to mint new tokens. The mint authority may only
    /// be provided during mint creation. If no mint authority is present
    /// then the mint has a fixed supply and no further tokens may be
    /// minted.
    pub mint_authority: COption<Pubkey>,
    /// Total supply of tokens.
    pub supply: u64,
    /// Number of base 10 digits to the right of the decimal place.
    pub decimals: u8,
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
    /// Optional authority to freeze token accounts.
    pub freeze_authority: COption<Pubkey>,
}
```

作为参考，这里是
[USDC铸币账户](https://explorer.solana.com/address/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v).
的Solana Explorer链接。

### 代币账户

要跟踪特定代币的每个单位的个人所有权，必须创建代币计划拥有的另一种类型的数据帐户。此帐户称为
[代币帐户](https://github.com/solana-labs/solana-program-library/blob/b1c44c171bc95e6ee74af12365cb9cbab68be76c/token/program/src/state.rs#L89-L110)
。

账户上最常引用的数据包括：

- 铸造: 代币账户持有的代币类型
- 所有者：被授权将代币转出代币账户的账户
- 金额：代币账户当前持有的代币单位数量

![代币账户](https://solana-developer-content.vercel.app/assets/docs/core/tokens/token-account.svg)

存储在每个代币账户上的完整详细信息包括以下内容：

```rust
pub struct Account {
    /// The mint associated with this account
    pub mint: Pubkey,
    /// The owner of this account.
    pub owner: Pubkey,
    /// The amount of tokens this account holds.
    pub amount: u64,
    /// If `delegate` is `Some` then `delegated_amount` represents
    /// the amount authorized by the delegate
    pub delegate: COption<Pubkey>,
    /// The account's state
    pub state: AccountState,
    /// If is_native.is_some, this is a native token, and the value logs the
    /// rent-exempt reserve. An Account is required to be rent-exempt, so
    /// the value is used by the Processor to ensure that wrapped SOL
    /// accounts do not drop below this threshold.
    pub is_native: COption<u64>,
    /// The amount delegated
    pub delegated_amount: u64,
    /// Optional authority to close the account.
    pub close_authority: COption<Pubkey>,
}
```

为了让钱包拥有某个代币的单位数量，它需要为特定类型的代币（铸币）创建一个代币账户，将钱包指定为代币账户的所有者。一个钱包可以为同一类型的代币创建多个代币账户，但每个代币账户只能由一个钱包拥有，并持有一种代币的数量。

![Account Relationship](https://solana-developer-content.vercel.app/assets/docs/core/tokens/token-account-relationship.svg)

:::tips INFO
请注意，每个代币账户的数据都包含一个`owner`字段，用于识别谁对该特定代币账户拥有权限。这与 AccountInfo 中指定的程序所有者是分开的，[AccountInfo](https://solana.com/docs/core/accounts#accountinfo)是所有代币帐户的代币程序。
:::

### 关联代币账户

为了简化为特定铸币和所有者查找代币账户地址的过程，我们经常使用关联代币账户。

关联代币账户是一种代币账户，其地址是使用所有者的地址和铸币账户的地址确定派生的。
您可以将关联代币账户视为特定铸币厂和所有者的“默认”代币账户。

重要的是要了解关联的代币账户不是不同类型的代币账户。它只是一个具有特定地址代币帐户。


![关联代币账户](https://solana-developer-content.vercel.app/assets/docs/core/tokens/associated-token-account.svg)

这在 Solana 开发中引入了一个关键概念：[程序派生地址（PDA](https://solana.com/docs/core/pda)。
从概念上讲，PDA提供了一种使用一些预定义输入生成地址的确定性方法。这使我们能够在以后轻松找到帐户的地址。

这是一个 [Solana Playground](https://beta.solpg.io/656a2dd0fb53fa325bfd0c41)
示例， 它派生了 USDC 关联代币账户地址和所有者。它将始终为同一铸币和所有者生成
[相同的地址](https://explorer.solana.com/address/4kokFKCFMxpCpG41yLYkLEqXW8g1WPfCt2NC9KGivY6N)。

```ts
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

const associatedTokenAccountAddress = getAssociatedTokenAddressSync(
  USDC_MINT_ADDRESS,
  OWNER_ADDRESS,
);
```

具体而言，关联代币账户的地址是使用以下输入派生的。下面是一个[Solana Playground](https://beta.solpg.io/656a31d0fb53fa325bfd0c42)示例，它生成的地址与上一个示例相同。

```ts
import { PublicKey } from "@solana/web3.js";

const [PDA, bump] = PublicKey.findProgramAddressSync(
  [
    OWNER_ADDRESS.toBuffer(),
    TOKEN_PROGRAM_ID.toBuffer(),
    USDC_MINT_ADDRESS.toBuffer(),
  ],
  ASSOCIATED_TOKEN_PROGRAM_ID,
);
```

对于两个钱包持有相同类型代币的单位，每个钱包都需要自己的代币账户来获得特定的铸币账户。
下图演示了此帐户关系扩展。

![Accounts Relationship Expanded](https://solana-developer-content.vercel.app/assets/docs/core/tokens/token-account-relationship-ata.svg)

## 代币示例

[`spl-token` CLI](https://docs.solanalabs.com/cli) 可用于试验 SPL 代币。
在下面的示例中，我们将使用 [Solana Playground](https://beta.solpg.io/)
终端直接在浏览器中运行 CLI 命令，而无需在本地安装 CLI。

创建代币和账户需要 SOL 用于账户租金、存款和交易费用。如果这是您第一次使用 Solana Playground，
请创建一个 Playground 钱包并在 Playground 终端中运行该 `solana airdrop`命令。您还可以使用公共
[Web 水龙头](https://faucet.solana.com/)
获取 devnet SOL。

```sh
solana airdrop 2
```

运行 `spl-token --help`以获取可用命令的完整说明。

```sh
spl-token --help
```

或者，你可以使用以下命令在本地安装 spl-token CLI。这需要首先
[安装 Rust](https://rustup.rs/)。

:::tips INFO
在以下各节中，运行 CLI 命令时显示的帐户地址将与下面显示的示例输出不同。请使用 Playground 终端中显示的地址进行操作。例如，输出的地址 `create-token`是 Playground 钱包设置为铸币机构的铸币帐户。
:::

###  创建新代币

要创建新代币（[mint 帐户](https://solana.com/docs/core/tokens#mint-account) ），请在 Solana Playground 终端中运行以下命令。

```sh
spl-token create-token
```

您应该会看到类似于以下内容的输出。您可以使用 `Address` 和 `Signature`. 在 
[Solana Explorer](https://explorer.solana.com/?cluster=devnet)
上检查代币和交易详细信息。

在下面的示例输出中，新代币的唯一标识符（地址）为 
`99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg` 。

```console filename="Terminal Output" /99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg/
Creating token 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg

Address:  99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg
Decimals:  9

Signature: 44fvKfT1ezBUwdzrCys3fvCdFxbLMnNvBstds76QZyE6cXag5NupBprSXwxPTzzjrC3cA6nvUZaLFTvmcKyzxrm1
```

新代币最初没有供应。你可以使用以下命令检查代币的当前供应情况：


```sh
spl-token supply <TOKEN_ADDRESS>
```

对新创建的代币运行 `supply` 命令将返回以下 `0` 值：

```sh /99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg/
spl-token supply 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg
```

在后台，创建一个新的铸币账户需要发送带有两条指令的交易。这是
[Solana Playground](https://beta.solpg.io/660ce32ecffcf4b13384d00f)
上的一个 Javascript 示例。

1. 调用系统程序创建一个具有足够空间容纳铸币帐户数据的新帐户， 
    然后将所有权转移到代币程序。

2. 调用代币程序将新账户的数据初始化为铸币账户

### 创建代币账户

要持有特定代币的单位，您必须首先创建一个[代币账户](https://solana.com/docs/core/tokens#token-account)。
若要创建新的代币帐户，请使用以下命令：

```sh
spl-token create-account [OPTIONS] <TOKEN_ADDRESS>
```

例如，在 Solana Playground 终端中运行以下命令：

```sh
spl-token create-account 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg
```

返回以下输出：

- `AfB7uwBEsGtrrBqPTVqEgzWed5XdYfM1psPNLmf7EeX9`  是为保存 `create-account`命令中指定的代币单位而创建代币帐户的地址。

```console
Creating account AfB7uwBEsGtrrBqPTVqEgzWed5XdYfM1psPNLmf7EeX9

Signature: 2BtrynuCLX9CNofFiaw6Yzbx6hit66pup9Sk7aFjwU2NEbFz7NCHD9w9sWhrCfEd73XveAGK1DxFpJoQZPXU9tS1
```

默认情况下，该 `create-account`命令会创建一个[关联代币帐户](https://solana.com/docs/core/tokens#associated-token-account)，
并将你的钱包地址作为代币帐户所有者。

您可以使用以下命令创建具有不同所有者的代币帐户：

```sh
spl-token create-account --owner <OWNER_ADDRESS> <TOKEN_ADDRESS>
```

例如，运行以下命令：

```sh
spl-token create-account --owner 2i3KvjDCZWxBsqcxBHpdEaZYQwQSYE6LXUMx5VjY5XrR 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg
```

返回以下输出：

- `Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt` is the address of the token
  account created to hold units of the token specified in the `create-account`
  command (`99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg`) and owned by the
  address specified following the `--owner` flag
  (`2i3KvjDCZWxBsqcxBHpdEaZYQwQSYE6LXUMx5VjY5XrR`). This is useful when you need
  to create a token account for another user.

```sh
Creating account Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt

Signature: 44vqKdfzspT592REDPY4goaRJH3uJ3Ce13G4BCuUHg35dVUbHuGTHvqn4ZjYF9BGe9QrjMfe9GmuLkQhSZCBQuEt
```

在后台，创建一个关联的代币账户需要调用
[关联代币程序](https://github.com/solana-labs/solana-program-library/tree/b1c44c171bc95e6ee74af12365cb9cbab68be76c/associated-token-account/program/src)
的单个指令。这是
[Solana Playground](https://beta.solpg.io/660ce868cffcf4b13384d011)
上的一个 Javascript 示例。

关联代币程序使用[跨程序调用](https://solana.com/docs/core/cpi)
来处理：


- [调用系统程序](https://github.com/solana-labs/solana-program-library/blob/b1c44c171bc95e6ee74af12365cb9cbab68be76c/associated-token-account/program/src/tools/account.rs#L19)
  以使用提供的 PDA 作为新帐户的地址创建新帐户

- [调用代币程序](https://github.com/solana-labs/solana-program-library/blob/b1c44c171bc95e6ee74af12365cb9cbab68be76c/associated-token-account/program/src/processor.rs#L138-L161)
  以初始化新帐户的代币帐户数据。

或者，使用随机生成的密钥对（而不是关联的代币账户）创建新的代币账户需要发送包含两条指令的交易。
这是 [Solana Playground](https://beta.solpg.io/660ce716cffcf4b13384d010)
上的一个 Javascript 示例。


1. 调用系统程序创建一个具有足够空间用于代币帐户数据的新帐户，然后将所有权转移给代币程序。

2. 调用代币程序，将新账户的数据初始化为代币账户

### 铸造代币

若要创建一定数量的代币，请使用以下命令：


```sh
spl-token mint [OPTIONS] <TOKEN_ADDRESS> <TOKEN_AMOUNT> [--] [RECIPIENT_TOKEN_ACCOUNT_ADDRESS]
```

例如，运行以下命令：

```sh
spl-token mint 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg 100
```

返回以下输出：

- `99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg` 是铸造代币的铸币账户的地址（增加总供应量）。

- `AfB7uwBEsGtrrBqPTVqEgzWed5XdYfM1psPNLmf7EeX9`是你的钱包代币账户的地址，代币单位正在被铸造到（增加金额）。

```sh
Minting 100 tokens
  Token: 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg
  Recipient: AfB7uwBEsGtrrBqPTVqEgzWed5XdYfM1psPNLmf7EeX9

Signature: 2NJ1m7qCraPSBAVxbr2ssmWZmBU9Jc8pDtJAnyZsZJRcaYCYMqq1oRY1gqA4ddQno3g3xcnny5fzr1dvsnFKMEqG
```

要将代币铸造到其他代币账户，请指定预期收件人代币账户的地址。例如，运行以下命令：

```sh
spl-token mint 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg 100 -- Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt
```

返回以下输出：

- `99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg` is the address of the mint
  account that tokens are being minted for (increasing total supply).

- `Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt` is the address of the token
  account that units of the token are being minted to (increasing amount).

```sh
Minting 100 tokens
  Token: 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg
  Recipient: Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt

Signature: 3SQvNM3o9DsTiLwcEkSPT1Edr14RgE2wC54TEjonEP2swyVCp2jPWYWdD6RwXUGpvDNUkKWzVBZVFShn5yntxVd7
```

在后台，创建代币的新单位需要调用代币程序上的 MintTo 指令。该指令必须由铸币厂当局签署。该指令将代币的新单位铸造到代币账户中，并增加铸币账户的总供应量。这是 [Solana Playground](https://beta.solpg.io/660cea45cffcf4b13384d012)上的一个 Javascript 示例。

### 转移代币

若要在两个代币账户之间转移代币数量，请使用以下命令：

```sh
spl-token transfer [OPTIONS] <TOKEN_ADDRESS> <TOKEN_AMOUNT> <RECIPIENT_ADDRESS
or RECIPIENT_TOKEN_ACCOUNT_ADDRESS>
```

例如，运行以下命令：

```sh
spl-token transfer 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg 100 Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt
```

返回以下输出：

- `AfB7uwBEsGtrrBqPTVqEgzWed5XdYfM1psPNLmf7EeX9` 是要从中转移代币的代币账户的地址。
   这将是要转移的指定代币的代币帐户的地址。

- `Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt` 是要将代币转移到的代币账户的地址。

```sh
Transfer 100 tokens
  Sender: AfB7uwBEsGtrrBqPTVqEgzWed5XdYfM1psPNLmf7EeX9
  Recipient: Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt

Signature: 5y6HVwV8V2hHGLTVmTmdySRiEUCZnWmkasAvJ7J6m7JR46obbGKCBqUFgLpZu5zQGwM4Xy6GZ4M5LKd1h6Padx3o
```

在后台，转移代币需要调用代币程序上的 `Transfer` 指令。此指令必须由发送方的代币账户的所有者签名。
该指令将代币单位从一个代币账户转移到另一个代币账户。这是 
[Solana Playground](https://beta.solpg.io/660ced84cffcf4b13384d013)
上的一个 Javascript 示例。

请务必了解，发送方和接收方都必须具有要传输的特定类型的代币的现有代币帐户。
发送方可以在交易中包含其他说明，以创建接收方的代币账户，该账户通常是关联代币账户。

### 创建代币元数据

代币扩展计划允许将其他可自定义的元数据（例如名称、符号、图像链接）直接存储在 Mint 帐户上。

:::tips INFO
要使用 Token Extensions CLI 标志，请确保您已本地安装 CLI，版本 3.4.0 或更高版本：
`cargo install --version 3.4.0 spl-token-cli`
:::

若要创建启用了元数据扩展的新代币，请使用以下命令：

```sh
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
--enable-metadata
```

该命令返回以下输出：

- `BdhzpzhTD1MFqBiwNdrRy4jFo2FHFufw3n9e8sVjJczP`是在启用元数据扩展的情况下创建的新代币的地址。

```sh
Creating token BdhzpzhTD1MFqBiwNdrRy4jFo2FHFufw3n9e8sVjJczP under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
To initialize metadata inside the mint, please run `spl-token initialize-metadata BdhzpzhTD1MFqBiwNdrRy4jFo2FHFufw3n9e8sVjJczP <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>`, and sign with the mint authority.

Address:  BdhzpzhTD1MFqBiwNdrRy4jFo2FHFufw3n9e8sVjJczP
Decimals:  9

Signature: 5iQofFeXdYhMi9uTzZghcq8stAaa6CY6saUwcdnELST13eNSifiuLbvR5DnRt311frkCTUh5oecj8YEvZSB3wfai
```

一旦创建启用了元数据扩展的新代币后，请使用以下命令初始化元数据。

```sh
spl-token initialize-metadata <TOKEN_MINT_ADDRESS> <YOUR_TOKEN_NAME>
<YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>
```

代币URI通常是指向要与代币关联的链下元数据的链接。你可以在
[此处](https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json)
找到JSON格式的示例。

例如，运行以下命令会将额外的元数据直接存储在指定的铸币帐户上：

```sh
spl-token initialize-metadata BdhzpzhTD1MFqBiwNdrRy4jFo2FHFufw3n9e8sVjJczP "TokenName" "TokenSymbol" "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json"
```
然后，您可以在资源管理器中查找铸币帐户的地址以检查元数据。例如，这是在 
[SolanaFm](https://solana.fm/address/BdhzpzhTD1MFqBiwNdrRy4jFo2FHFufw3n9e8sVjJczP?cluster=devnet-solana)
资源管理器上启用元数据扩展时创建的代币。

有关详细信息，请参阅
[元数据扩展指南](https://solana.com/developers/guides/token-extensions/metadata-pointer)
。
有关各种代币扩展的更多详细信息，请参阅代币扩展
[入门指南](https://solana.com/developers/guides/token-extensions/getting-started)
和 
[SPL文档](https://spl.solana.com/token-2022/extensions)。

