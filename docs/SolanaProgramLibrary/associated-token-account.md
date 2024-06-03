# 关联代币账户程序

该程序定义了一种约定，并提供了一种机制，用于将用户的钱包地址映射到他们持有的关联代币账户。

## 动机

+   用户可能拥有属于同一铸造代币的多个代币账户，这使得其他用户难以知道应该向哪个账户发送代币，并且在代币管理的许多其他方面引入了摩擦。这个程序引入了一种方法，可以从用户的主系统账户地址和一个代币铸造地址确定性地派生出一个代币账户密钥，允许用户为他们拥有的每种代币创建一个主代币账户。我们称这些账户为关联代币账户。

+   此外，它允许用户向另一个用户发送代币，即使受益人尚未拥有该铸造代币的代币账户。与系统转账不同，为了使代币转账成功，接收者必须已经拥有与兼容铸造代币的代币账户，且需要有人为该代币账户提供资金。如果接收者必须首先资助它，这会使诸如空投活动之类的事情变得困难，并且通常增加了代币转移的摩擦。关联代币账户程序允许发送者为接收者创建关联代币账户，因此代币转账就可以顺利进行。

有关代币的更多信息，请参见 SPL 代币程序。


## 背景

Solana 的编程模型和本文档中使用的 Solana 术语的定义可以在以下链接找到：

+   [https://docs.solana.com/apps](https://docs.solana.com/apps)
+   [https://docs.solana.com/terminology](https://docs.solana.com/terminology)

## 源代码

关联代币账户的源代码可在 [GitHub](https://github.com/solana-labs/solana-program-library) 上找到。

## 接口

关联代币账户程序（Associated Token Account Program）使用 Rust 编写，并可在 [crates.io](https://crates.io/) 和 [docs.rs](https://docs.rs/) 上找到。

### 查找关联代币账户地址
对于给定的钱包地址，关联的代币账户是一种以钱包地址本身和代币铸造地址为参数，由程序派生的账户。

客户端可以使用 Rust 函数 `get_associated_token_address` 来派生钱包的关联代币地址。

在 TypeScript 中，可以使用以下方法派生关联账户地址：

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

如果给定钱包地址的关联代币账户尚未存在，任何人都可以通过发起包含 `create_associated_token_account` 指令的交易来创建。

无论是谁创建，新的关联代币账户都将完全由钱包拥有，就好像是钱包本身创建了它一样。

