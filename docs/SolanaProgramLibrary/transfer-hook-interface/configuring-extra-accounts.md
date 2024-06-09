# 配置额外账户

正如前面提到的，实现转账钩子接口的程序可以为代币转账提供额外的自定义功能。然而，此功能可能需要除了转账指令中存在的账户之外的其他账户（例如源账户、铸造账户、目标账户等）。

转账钩子接口规范的一部分是验证账户，这是一个存储转账钩子程序所需额外账户配置的账户。

## 验证账户

验证账户是由转账钩子程序派生出来的一个 PDA（Program Derived Address，程序派生地址），其来源于以下种子：

```
"extra-account-metas" + <mint-address>
```

正如您所见，一个验证账户对应一个铸造账户。这意味着您可以为每个铸造账户定制所需的额外账户！

验证账户使用[类型-长度-值](https://en.wikipedia.org/wiki/Type%E2%80%93length%E2%80%93value)(TLV)编码来存储额外账户的配置：
- **类型：** 指令鉴别符，在这种情况下是 `Execute`
- **长度：** 后续数据缓冲区的总长度，在这种情况下是一个 `u32` 类型。
- **数据：** 数据本身，在这种情况下包含了额外账户的配置信息。

当转账钩子程序尝试从验证账户中反序列化额外账户配置时，它可以找到`Execute`指令的8字节鉴别符，然后读取长度，接着使用这个长度来反序列化数据。

数据本身是一系列固定大小的配置对象，它们被序列化进一个字节块中。由于这些条目是固定长度的，我们可以使用自定义的“切片”结构，通过将长度除以固定长度来确定条目的数量。

这种自定义的切片结构被称为 `PodSlice`，它是 Solana 程序库的一部分，具体位于 [Pod 库](https://github.com/solana-labs/solana-program-library/tree/master/libraries/pod) 中。Pod 库提供了一些固定长度的类型，这些类型实现了 `bytemuck` 的 [`Pod`](https://docs.rs/bytemuck/latest/bytemuck/trait.Pod.html) 特性，以及 `PodSlice`。

另一个对于类型-长度-值（Type-Length-Value）编码的数据非常有用的是[Type-Length-Value](https://github.com/solana-labs/solana-program-library/tree/master/libraries/type-length-value)库，它被广泛用于管理TLV编码的数据结构。

## 动态账户解析

当客户端构建发送到代币程序的转账指令时，它们必须确保指令包含了所有必需的账户，特别是你在验证账户中指定的额外必需账户。

这些额外的账户必须被**解析**，并且另一个用于提取转账钩子的额外账户解析的库是[TLV账户解析](https://github.com/solana-labs/solana-program-library/tree/master/libraries/tlv-account-resolution)。

使用TLV账户解析库，转账钩子程序可以支持额外必需账户的**动态账户解析**。这意味着没有任何特定的客户端或程序需要知道转账钩子需要哪些特定账户。相反，它们可以从验证账户的数据中自动解析出来。

实际上，转账钩子接口提供了助手函数，这些函数在转账钩子接口库的[链上](https://github.com/solana-labs/solana-program-library/blob/master/token/transfer-hook/interface/src/onchain.rs)和[链下](https://github.com/solana-labs/solana-program-library/blob/master/token/transfer-hook/interface/src/offchain.rs)模块中执行此账户解析。

账户解析是由额外账户的配置存储方式以及如何使用它们来派生实际的Solana地址和账户角色（签名者、可写等）来驱动的。

## `ExtraAccountMeta` 结构

作为 TLV 帐户解析库的成员，[`ExtraAccountMeta`](https://github.com/solana-labs/solana-program-library/blob/65a92e6e0a4346920582d9b3893cacafd85bb017/libraries/tlv-account-resolution/src/account.rs#L75) struct 允许将帐户配置序列化为长度为 35 字节的固定长度数据格式。

```rust
pub struct ExtraAccountMeta {
    /// Discriminator to tell whether this represents a standard
    /// `AccountMeta` or a PDA
    pub discriminator: u8,
    /// This `address_config` field can either be the pubkey of the account
    /// or the seeds used to derive the pubkey from provided inputs
    pub address_config: [u8; 32],
    /// Whether the account should sign
    pub is_signer: PodBool,
    /// Whether the account should be writable
    pub is_writable: PodBool,
}
```

正如结构文档所述，, 一个 `ExtraAccountMeta` 可以存储三种类型帐户的配置：:

|鉴别器|账号类型|
|:------------|:-----------|
|`0` | 具有静态地址的帐户 |
| `1` | 一个从转账钩子程序本身衍生的 PDA |
| `(1 << 7) + i ` | 一个由另一个程序衍生的 PDA, 其中 `i` 表示该程序在账户列表中的索引位置 |

`1 << 7` 表示 `u8` 类型的最高位，即数值 `128`。如果你要从中衍生这个 PDA 的程序在 `Execute` 的账户列表中的索引位置是 `9`，那么此账户配置的鉴别器就是 `128 + 9 = 137`。关于如何确定这个索引的位置，我们后续会详细说明。

### 具有静态地址的账户

静态地址的附加账户使用 `ExtraAccountMeta` 序列化相当直接。在这种情况下，识别符（discriminator）简单地设为 `0`，而 `address_config` 则是 32 字节的公钥。

### PDAs衍生的转账钩子程序

你可能会想：“我怎样才能在 32 个字节中存储我的所有 PDA 种子？” 好吧，你不需要。相反，您可以告诉帐户解析功能在哪里
找到你需要的种子。

为了实现这一目标，转移挂钩程序可以使用 [`Seed`](https://github.com/solana-labs/solana-program-library/blob/65a92e6e0a4346920582d9b3893cacafd85bb017/libraries/tlv-account-resolution/src/seeds.rs#L38) 枚举来描述种子及其来源。除了文字字面量之外，这些种子配置仅包含极少量的字节。

`Seed` 枚举支持以下类型的种子，可用于创建表示`address_config`的字节数组：
- **字面（Literal）**: 种子本身的文本编码为字节。
- **指令数据（Instruction Data）**: 指令数据的一个切片，由`index`（偏移量）和`length`定义，指示需要提取的字节数。
- **账户密钥（AccountKey）**: 账户列表中某个账户的地址，以字节形式表示，通过`index`指出该账户在账户列表中的位置。
- **账户数据（Account Data）**: 某账户数据的一个切片，通过`account_index`指出该账户在账户列表中的位置，以及`data_index`和`length`定义要提取的字节范围。  

下面是一个将一系列 `Seed` 元素打包进一个32字节的 `address_config` 缓冲区的例子:

```rust
let seed1 = Seed::Literal { bytes: vec![1; 8] };
let seed2 = Seed::InstructionData {
    index: 0,
    length: 4,
};
let seed3 = Seed::AccountKey { index: 0 };
let address_config: [u8; 32] = Seed::pack_into_address_config(
  &[seed1, seed2, seed3]
)?;
```

### 衍生自其他程序的 PDAs

为一个衍生自其他序的 PDA 存储种子配置的方法与上述过程相似。然而，作为该账户 PDA 衍生的程序必须包含在账户列表中。其在帐户列表中的索引是构建正确鉴别器所必需的，从而解析正确的 PDA。

```rust
let program_index = 7;
let seeds = &[seed1, seed2, seed3];
let is_signer = false;
let is_writable = true;

let extra_meta = ExtraAccountMeta::new_external_pda_with_seeds(
  program_index,
  seeds,
  is_signer,
  is_writable,
)?;
```
