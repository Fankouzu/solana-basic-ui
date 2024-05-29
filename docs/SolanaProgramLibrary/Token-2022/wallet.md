# Wallet Guide

本指南面向希望支持 Token-2022 程序的钱包开发者。

由于不同钱包在管理代币账户状态和连接区块链方面有着截然不同的内部机制，本指南将专注于所需的具体更改，而不会涉及代码设计。

## 动机

钱包开发者通常习惯于使用一个代币程序来处理所有代币。

为了正确支持 Token-2022，钱包开发者必须进行代码更改。

重要说明：如果不希望支持 Token-2022，无需采取任何行动。钱包将不会加载 Token-2022 账户，如果错误使用 Token-2022，由钱包创建的交易将会失败。

通常，当尝试使用 Token-2022 账户与 Token 程序交互时，交易最有可能会因 `ProgramError::IncorrectProgramId` 而失败。

## 前置条件

在本地测试时，确保至少使用 `solana-test-validator` 的 1.14.17 版本，该版本默认包含 Token-2022 程序。这个版本与 `spl-token` CLI 的 2.3.0 版本捆绑在一起，后者也支持 Token-2022。

## 设置

需要一些 Token-2022 代币进行测试。

首先，铸造一个带有扩展的代币。我们将使用“关闭铸币权限”扩展：

```
$ spl-token -ul create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-close

Creating token E5SUrbnx7bMBp3bRdMWNCFS3FXp5VpvFDdNFp8rjrMLM under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  E5SUrbnx7bMBp3bRdMWNCFS3FXp5VpvFDdNFp8rjrMLM
Decimals:  9

Signature: 2dYhT1M3dHjbGd9GFCFPXmHMtjujXBGhM8b5wBkx3mtUptQa5U9jjRTWHCEmUQnv8XLt2x5BHdbDUkZpNJFqfJn1
```

扩展非常重要，因为它将测试钱包是否能够正确处理扩展的铸币账户。

接下来，为测试钱包创建一个账户：

```
$ spl-token -ul create-account E5SUrbnx7bMBp3bRdMWNCFS3FXp5VpvFDdNFp8rjrMLM --owner <TEST_WALLET_ADDRESS> --fee-payer <FEE_PAYER_KEYPAIR>

Creating account 4L45ZpFS6dqTyLMofmQZ9yuTqYvQrfCJfWL2xAjd5WDW

Signature: 5Cjvvzid7w2tNZojrWVCmZ2MFiezxxnWgJHLJKkvJNByZU2sLN97y85CghxHwPaVf5d5pJAcDV9R4N1MNigAbBMN
```

使用 `--owner` 参数，新账户是一个关联的代币账户，其中包括“不变所有者”账户扩展。通过这种方式，还将测试扩展的代币账户。

最后，铸造一些代币：

```
$ spl-token -ul mint E5SUrbnx7bMBp3bRdMWNCFS3FXp5VpvFDdNFp8rjrMLM 100000 4L45ZpFS6dqTyLMofmQZ9yuTqYvQrfCJfWL2xAjd5WDW

Minting 100000 tokens  
 Token: E5SUrbnx7bMBp3bRdMWNCFS3FXp5VpvFDdNFp8rjrMLM  
 Recipient: 4L45ZpFS6dqTyLMofmQZ9yuTqYvQrfCJfWL2xAjd5WDW

Signature: 43rsisVeLKjBCgLruwTFJXtGTBgwyfpLjwm44dY2YLHH9WJaazEvkyYGdq6omqs4thRfCS4G8z4KqzEGRP2xoMo9
```

对于测试钱包来说，拥有一些 SOL 也是有帮助的，因此确保进行一些转账：

```
$ solana -ul transfer <TEST_WALLET_ADDRESS> 10 --allow-unfunded-recipient

Signature: 5A4MbdMTgGiV7hzLesKbzmrPSCvYPG15e1bg3d7dViqMaPbZrdJweKSuY1BQAfq245RMMYeGudxyKQYkgKoGT1Ui
```

最后，可以将所有这些账户保存在一个目录中，以便于重复使用和测试：

```
$ mkdir test-accounts

$ solana -ul account --output-file test-accounts/token-account.json --output json 4L45ZpFS6dqTyLMofmQZ9yuTqYvQrfCJfWL2xAjd5WDW... output truncated ...

$ solana -ul account --output-file test-accounts/mint.json --output json E5SUrbnx7bMBp3bRdMWNCFS3FXp5VpvFDdNFp8rjrMLM... output truncated ...

$ solana -ul account --output-file test-accounts/wallet.json --output json <TEST_WALLET_ADDRESS>
```

当想要重启本地测试节点验证器时，可以简单地运行以下指令：

```
$ solana-test-validator -r --account-dir test-accounts
```

## 本指南的结构

我们将通过一些简短的代码片段，介绍如何在钱包中支持 Token-2022。这项工作是为 Backpack 钱包在 [PR #3976](https://github.com/coral-xyz/backpack/pull/3976) 中完成的，但如前所述，实际的代码更改可能会在钱包中看起来非常不同。

## 第一部分：获取 Token-2022 账户

除了普通的代币账户外，钱包还必须获取 Token-2022 账户。通常，钱包使用一次 `getTokenAccountsByOwner` RPC 地址来获取账户。

对于 Token-2022，只需要增加一个调用来获取额外的账户：

```typescript
import { Connection, PublicKey } from '@solana/web3.js';

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);
const TOKEN_2022_PROGRAM_ID = new PublicKey(
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
);
const walletPublicKey = new PublicKey('11111111111111111111111111111111'); // insert your key
const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

const tokenAccounts = await connection.getTokenAccountsByOwner(
  walletPublicKey, { programId: TOKEN_PROGRAM_ID }
);
const token2022Accounts = await connection.getTokenAccountsByOwner(
  walletPublicKey, { programId: TOKEN_2022_PROGRAM_ID }
);
```


合并这两个响应，然后就可以开始了！如果能看到测试账户，那么就做对了。

如果出现问题，可能是因为钱包对代币账户的反序列化过于严格，所以请确保解除数据大小必须等于165字节的限制。

## 第二部分：使用代币程序ID进行指令操作

如果尝试转移或销毁 Token-2022 代币，可能会收到错误消息，因为钱包试图向 Token 而不是 Token-2022 发送指令。

这里有两种可能的解决方案。

### 选项 1：在获取时存储代币账户的所有者

在第一部分中，我们获取了所有代币账户并丢弃了与账户关联的程序ID。我们需要针对正确的程序而不是始终针对 Token 程序。

如果我们为每个代币账户存储程序ID，那么在需要转移或销毁时，我们可以重用这些信息。

```typescript
import { Connection, PublicKey } from '@solana/web3.js';
import { createTransferInstruction } from '@solana/spl-token';

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);
const TOKEN_2022_PROGRAM_ID = new PublicKey(
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
);
const walletPublicKey = new PublicKey('11111111111111111111111111111111'); // insert your key
const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

const tokenAccounts = await connection.getTokenAccountsByOwner(
  walletPublicKey, { programId: TOKEN_PROGRAM_ID }
);
const token2022Accounts = await connection.getTokenAccountsByOwner(
  walletPublicKey, { programId: TOKEN_2022_PROGRAM_ID }
);
const accountsWithProgramId = [...tokenAccounts.value, ...token2022Accounts.value].map(
  ({ account, pubkey }) =>
    {
      account,
      pubkey,
      programId: account.data.program === 'spl-token' ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID,
    },
);

// later on...
const accountWithProgramId = accountsWithProgramId[0];
const instruction = createTransferInstruction(
  accountWithProgramId.pubkey,    // source
  accountWithProgramId.pubkey,    // destination
  walletPublicKey,                // owner
  1,                              // amount
  [],                             // multisigners
  accountWithProgramId.programId, // token program id
);
```

### 选项 2：在转移/销毁前获取程序所有者

这种方法增加了一个网络调用，但可能更容易集成。在创建指令之前，可以从网络获取铸币、源账户或目的账户，并提取其 `owner` 字段。


```typescript
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
const accountPublicKey = new PublicKey('11111111111111111111111111111111'); // insert your account key here
const accountInfo = await connection.getParsedAccountInfo(accountPublicKey);
if (accountInfo.value === null) {
    throw new Error('Account not found');
}
const programId = accountInfo.value.owner;
```

## 第三部分：为关联的代币账户使用代币程序ID

每当我们推导出一个关联的代币账户时，我们必须使用正确的代币程序ID。目前，大多数实现都是硬编码的代币程序ID。相反，必须将程序ID作为一个参数添加：

```typescript
import { PublicKey } from '@solana/web3.js';

const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

function associatedTokenAccountAddress(
  mint: PublicKey,
  wallet: PublicKey,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [wallet.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
}
```

如果正在创建关联的代币账户，还需要传递代币程序ID，该ID当前默认为 `TOKEN_PROGRAM_ID`：

```typescript
import { Connection, PublicKey } from '@solana/web3.js';
import { createAssociatedTokenAccountInstruction } from '@solana/spl-token';

const tokenProgramId = new PublicKey(
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
); // either `Tokenz...` or `Tokenkeg...`
const wallet = new PublicKey('11111111111111111111111111111111'); // insert your key
const mint = new PublicKey('11111111111111111111111111111111'); // insert mint key
const associatedTokenAccount = associatedTokenAccountAddress(mint, wallet, tokenProgramId);

const instruction = createAssociatedTokenAccountInstruction(
  wallet,                 // payer
  associatedTokenAccount, // associated token account
  wallet,                 // owner
  tokenProgramId,         // token program id
);
```

完成这三个部分后，钱包将为 Token-2022 提供基本支持！