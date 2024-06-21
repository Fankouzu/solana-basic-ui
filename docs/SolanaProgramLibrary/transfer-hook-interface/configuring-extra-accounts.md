# 配置额外账户

正如前面提到的，实现转账钩子接口的程序可以为代币转账提供额外的自定义功能。然而，这些功能可能需要转账指令中不存在的额外账户（例如源账户、铸币账户、目标账户等）。

转账钩子接口规范的一部分是验证账户，这是一个存储转账钩子程序所需的额外账户配置的账户。

## 验证账户

验证账户是从转账钩子程序派生的PDA（程序派生地址），其种子如下：

```tex
"extra-account-metas" + <mint-address>
```

可以看出，一个验证账户映射到一个铸币账户。这意味着您可以按每个铸币账户定制所需的额外账户！

验证账户使用[类型-长度-值](https://en.wikipedia.org/wiki/Type%E2%80%93length%E2%80%93value)(TLV)编码来存储额外账户的配置：

- **类型：** 指令识别符，此处为 `Execute`
- **长度：** 后续数据缓冲区的总长度，此处为一个 `u32` 
- **数据：** 数据其本身，包含额外账户配置的数据

当转账钩子程序希望从验证账户反序列化额外账户配置时，可以找到8字节的 `Execute` 指令识别符，然后读取长度，并使用该长度反序列化数据。

数据本身是固定大小的配置对象列表，序列化为字节块。由于条目是固定长度的，我们可以使用自定义的“切片”结构，通过将长度除以固定长度来确定条目的数量。

这种自定义切片结构称为 `PodSlice`，是 Solana 程序库中的 [Pod 库](https://github.com/solana-labs/solana-program-library/tree/master/libraries/pod) 的一部分。Pod 库提供了一些实现 `bytemuck` `Pod` 特性（trait） 的固定长度类型，以及 `PodSlice`。

另一个用于处理类型-长度-值(TLV)编码数据的 SPL 库是 [Type-Length-Value](https://github.com/solana-labs/solana-program-library/tree/master/libraries/type-length-value) 库，它广泛用于管理 TLV 编码的数据结构。

## 动态账户解析

当客户端构建代币程序的转账指令时，他们必须确保指令包含所有必需的账户，特别是验证账户中指定的额外必需账户。

这些额外账户必须被**解析**，另一个用于解析转账钩子额外账户的库是 [TLV Account Resolution](https://github.com/solana-labs/solana-program-library/tree/master/libraries/tlv-account-resolution)（TLV 帐户解析库）。

使用TLV 帐户解析库，转账钩子程序可以实现额外必需账户的**动态解析**。这意味着任何特定客户端或程序都不需要知道转账钩子所需的具体账户。相反，它们可以从验证账户的数据中自动解析。

实际上，转账钩子接口在接口 crate 的[链上](https://github.com/solana-labs/solana-program-library/blob/master/token/transfer-hook/interface/src/onchain.rs)和[链下](https://github.com/solana-labs/solana-program-library/blob/master/token/transfer-hook/interface/src/offchain.rs)模块中提供了执行此账户解析的帮助函数。

账户解析功能通过存储额外账户配置的方式，以及如何用于派生实际的 Solana 地址和角色（签名者、可写等）来实现。

## `ExtraAccountMeta` 结构体

作为 TLV 帐户解析库的成员，[`ExtraAccountMeta`](https://github.com/solana-labs/solana-program-library/blob/65a92e6e0a4346920582d9b3893cacafd85bb017/libraries/tlv-account-resolution/src/account.rs#L75) 结构体允许账户配置序列化为长度为35字节的固定长度数据格式。

```rust
pub struct ExtraAccountMeta {
    /// 区分这是标准 `AccountMeta` 还是 PDA
    pub discriminator: u8,
    /// `address_config` 字段可以是账户的公钥，
    /// 或用于从提供的输入派生公钥的种子
    pub address_config: [u8; 32],
    /// 账户是否应签名
    pub is_signer: PodBool,
    /// 账户是否可写
    pub is_writable: PodBool,
}

```

正如结构文档所述，, 一个 `ExtraAccountMeta` 可以存储三种类型帐户的配置：:

| 识别符          | 账户类型                                                   |
| :-------------- | :--------------------------------------------------------- |
| `0`             | 静态地址账户                                               |
| `1`             | 转账钩子程序本身的PDA                                      |
| `(1 << 7) + i ` | 其他程序衍生的PDA，程序的索引`i`为该程序在账户列表中的索引 |

`1 << 7` 是 `u8` 的最高位，或 `128` 。如果从中派生此 PDA 的程序位于 的 `Execute` 帐户列表的索引 `9` 处，则此帐户配置的识别符为 `128 + 9 = 137` 。稍后将详细介绍确定此索引位置的确定。

### 静态地址账户

静态地址的附加账户使用 `ExtraAccountMeta` 序列化相当直接。在这种情况下，识别符（discriminator）简单地设为 `0`，而 `address_config`（地址配置） 则是 32 字节的公钥。

### 转账钩子程序的PDAs

可能会问：“如何在32字节中存储所有PDA种子？”实际上，不需要。相反，您可以告诉账户解析功能在哪里找到所需的种子。

为此，转账钩子程序可以使用 `Seed` 枚举来描述种子及其位置。除了文字之外，这些种子配置仅包含少量字节。

`Seed` 枚举支持以下类型的种子，可用于创建`address_config`的字节数组：

- **字面值（Literal）**: 编码为字节的字面种子。
- **指令数据（Instruction Data）**: 指令数据的一个切片，由`index`（偏移量）和`length`（长度）指定。
- **账户密钥（AccountKey）**: 账户列表中某个账户的地址，以字节形式表示，指定该账户在账户列表中的`index`
- **账户数据（Account Data）**: 某账户数据的一个切片，通过`account_index`指定该账户在账户列表中的位置，以及`data_index`和`length`定义要提取的字节范围。  

下面是一个将一组`Seed` 条目打包进一个32字节的 `address_config` 的示例:

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

### 其他程序的PDAs

存储其他程序PDA地址的种子配置与上述相同。然而，此账户的地址必须在账户列表中，其索引是构建正确识别符并解析正确PDA所需的。

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
