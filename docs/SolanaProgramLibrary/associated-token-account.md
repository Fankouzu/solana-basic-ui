# 关联代币账户程序

该程序定义了将用户的钱包地址映射到其持有的关联代币账户的规则和机制。

## 设计初衷

+   一个用户可能拥有属于同一代币铸造的多个代币账户，这使得其他用户难以确定应该将代币发送到哪个账户，并在许多其他代币管理方面带来了摩擦。该程序引入了一种从用户的主系统账户地址和代币铸造地址确定性地推导代币账户密钥的方法，使用户能够为其拥有的每种代币创建一个主代币账户。我们称这些账户为关联代币账户。

+   此外，它还允许用户向其他用户发送代币，即使接收者尚未为该铸造创建代币账户。与系统转账不同，为了使代币转账成功，接收者必须已经拥有一个与铸造兼容的代币账户，并且需要有人为该代币账户提供资金。如果接收者必须首先为其提供资金，这将使空投活动等操作变得困难，并且总体上增加了代币转账的摩擦。关联代币账户程序允许发送方为接收方创建关联代币账户，使代币转账顺利进行。

有关代币的更多相关信息，请参见[SPL 代币](https://spl.solana.com/token)程序。


## 背景

Solana 的编程模型和本文档中使用的 Solana 术语的定义可以在以下链接找到：

+   [https://docs.solana.com/apps](https://docs.solana.com/apps)
+   [https://docs.solana.com/terminology](https://docs.solana.com/terminology)

## 源代码

关联代币账户的源代码可在 [GitHub](https://github.com/solana-labs/solana-program-library) 上找到。

## 接口

关联代币账户程序（Associated Token Account Program）使用 Rust 编写，可在 [crates.io](https://crates.io/) 和 [docs.rs](https://docs.rs/) 上找到。

### 查找关联代币账户地址

给定钱包地址的关联代币账户是一个由程序派生的账户，由钱包地址本身和代币铸造组成。

客户端可以使用 `get_associated_token_address` Rust 函数推导钱包的关联代币地址。

在 TypeScript 中可以这样推导关联账户地址：

```ts
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

function findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
): PublicKey {
    return PublicKey.findProgramAddressSync(
        [
            walletAddress.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
        ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )[0];
}
```

### 创建一个关联代币账户

如果给定钱包地址的关联代币账户尚不存在，可以通过发出包含 `create_associated_token_account` 指令的交易由任何人创建。

无论创建者是谁，新关联代币账户将完全由钱包拥有，就像钱包本身创建的一样。
