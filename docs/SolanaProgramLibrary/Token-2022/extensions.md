# 扩展指南

Token-2022程序通过扩展模型为代币铸造和代币账户提供了额外的功能。

本指南解释了所有可用的扩展，并提供了一些使用它们的示例。

请参阅[Token-2022介绍](https://spl.solana.com/token-2022)以获取有关Token-2022及其扩展概念的更多信息。

## 设置

请参阅 [代币设置指南](https://spl.solana.com/token#setup) 以安装客户端工具。Token-2022 使用相同的 CLI 和 NPM 包，以实现最大的兼容性。

所有 JS 示例都是基于测试修改的，并且可以在 [代币 JS 示例](https://github.com/solana-labs/solana-program-library/tree/master/token/js/examples)中完整获取。

## 扩展

### 关闭铸币权限

Token 程序允许所有者关闭代币账户，但无法关闭铸币账户。在 Token-2022 程序中，可以通过在初始化铸币功能前初始化 `MintCloseAuthority` 扩展来关闭铸币功能。

#### 示例：初始化铸币并具备铸币关闭权限

```shell
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-close

Creating token C47NXhUTVEisCfX7s16KrxYyimnui7HpUXZecE2TmLdB under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
```

```js
import {
    closeAccount,
    createInitializeMintInstruction,
    createInitializeMintCloseAuthorityInstruction,
    getMintLen,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';

(async () => {
    const payer = Keypair.generate();

    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    const mintAuthority = Keypair.generate();
    const freezeAuthority = Keypair.generate();
    const closeAuthority = Keypair.generate();

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

    const extensions = [ExtensionType.MintCloseAuthority];
    const mintLen = getMintLen(extensions);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMintCloseAuthorityInstruction(mint, closeAuthority.publicKey, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(
            mint,
            9,
            mintAuthority.publicKey,
            freezeAuthority.publicKey,
            TOKEN_2022_PROGRAM_ID
        )
    );
    await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair], undefined);
})();
```

#### 示例：停止铸币

使用 `MintCloseAuthority` 扩展和一个有效的权限，可以关闭铸币账户并回收铸币账户上的 lamports。  

**注意**：铸币的供应量必须为 0。

```shell
$ spl-token close-mint C47NXhUTVEisCfX7s16KrxYyimnui7HpUXZecE2TmLdB   

Signature: 5nidwS9fJGJGdmaQjcwvNGVtk2ba5Zyu9ZLubjUKSsaAyzLUYvB6LK5RfUA767veBr45x7R1WW9N7WkYZ3Rqsb5B
```

```js
await closeAccount(connection, payer, mint, payer.publicKey, closeAuthority, [], undefined, TOKEN_2022_PROGRAM_ID);
```

### 转账费用

在 Token 程序中，无法在每次转账时评估费用。现有系统通常涉及冻结用户账户，并强制他们通过第三方来解冻、转账和重新冻结账户。

使用 Token-2022 程序，可以在铸币时配置转账费用，使得费用在协议层面被评估。在每次转账时，接收账户上会保留一定数量的代币，接收者无法触及这部分代币。这些代币可以在铸币时通过一个独立权限来控制和管理。

**重要说明**：使用带有转账费用的代币转账需要使用 `transfer_checked` 或 `transfer_checked_with_fee` 而非 `transfer`。否则，转账将失败。

#### 示例：创建带有转账费用的代币

转账费用配置包含几个重要字段：

+   基点费率：每次转账收取的费用，以转账金额的基点为单位。例如，50个基点的情况下，1000枚代币的转账将产生5枚代币的费用。
+   最大费用：转账费用的上限。如果最大费用设置为5000代币，即使是10,000,000,000,000代币的转账，最大费用也只是5000代币。
+   转账费用权限：可以修改费用的实体。
+   提取保留费用权限：可以管理在铸币或代币账户上保留的代币的实体。

让我们铸币一个代币，设置50个基点的转账费用和5000代币的最大费用。

```shell
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --transfer-fee 50 5000

Creating token Dg3i18BN7vzsbAZDnDv3H8nQQjSaPUTqhwX41J7NZb5H under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  Dg3i18BN7vzsbAZDnDv3H8nQQjSaPUTqhwX41J7NZb5H
Decimals:  9

Signature: 39okFGqW23wQZ1HqH2tdJvtFP5aYgpfbmNktCZpV5XKTpKuA9xJmvBmrBwcLdfAT632VEC4y4dJJfDoeAvMWRPYP
```

```js
import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';

import {
    ExtensionType,
    createInitializeMintInstruction,
    mintTo,
    createAccount,
    getMintLen,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

import {
    createInitializeTransferFeeConfigInstruction,
    harvestWithheldTokensToMint,
    transferCheckedWithFee,
    withdrawWithheldTokensFromAccounts,
    withdrawWithheldTokensFromMint,
} from '@solana/spl-token';

(async () => {
    const payer = Keypair.generate();

    const mintAuthority = Keypair.generate();
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    const transferFeeConfigAuthority = Keypair.generate();
    const withdrawWithheldAuthority = Keypair.generate();

    const extensions = [ExtensionType.TransferFeeConfig];

    const mintLen = getMintLen(extensions);
    const decimals = 9;
    const feeBasisPoints = 50;
    const maxFee = BigInt(5_000);

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen);
    const mintTransaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports: mintLamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeTransferFeeConfigInstruction(
            mint,
            transferFeeConfigAuthority.publicKey,
            withdrawWithheldAuthority.publicKey,
            feeBasisPoints,
            maxFee,
            TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(mint, decimals, mintAuthority.publicKey, null, TOKEN_2022_PROGRAM_ID)
    );
    await sendAndConfirmTransaction(connection, mintTransaction, [payer, mintKeypair], undefined);
})();
```

#### 示例：带费用检查的代币转账

作为扩展的一部分，引入了一个新的 `transfer_checked_with_fee` 指令，该指令接受预期的费用。只有当费用计算正确时，转账才会成功，以避免在转账过程中出现任何意外。

```shell
$ spl-token create-account Dg3i18BN7vzsbAZDnDv3H8nQQjSaPUTqhwX41J7NZb5H
Creating account 7UKuG4W68hW9eGrDms6BenRf8DCEHKGN49xewtWyB5cx

Signature: 6h591BMuguh9TtSdQPRPcPy97mLqJiybeaxGVZzD8mvPEsYypjZ2jjKgHzji5FGh8CJE3NAzqrqGxfyMdnbWrs7
$ solana-keygen new -o destination.json
$ spl-token create-account Dg3i18BN7vzsbAZDnDv3H8nQQjSaPUTqhwX41J7NZb5H destination.json
Creating account 5wY8fiMZG5wGbQmtzKgqqEEp4vsCMJZ53RXEagUUWhEr

Signature: 2SyA17AJRWLH2j7svgxgW7nouUGioeWoRDWjz2Wq8j1eisThezSvqgN4NbHfj9uWmDh2XRp56ttZtHV1SxaUC7ys
$ spl-token mint Dg3i18BN7vzsbAZDnDv3H8nQQjSaPUTqhwX41J7NZb5H 1000000000
Minting 1000000000 tokens
  Token: Dg3i18BN7vzsbAZDnDv3H8nQQjSaPUTqhwX41J7NZb5H
  Recipient: 7UKuG4W68hW9eGrDms6BenRf8DCEHKGN49xewtWyB5cx

Signature: 5MFJGpLaWe3yLLU8X4ax3KofeqPVzdxJsa3ScjChJJHJawKsRx4og9eaFkWn3CPF7JXaxdj5v4LdAW56LiNTuP6s
$ spl-token transfer --expected-fee 0.000005 Dg3i18BN7vzsbAZDnDv3H8nQQjSaPUTqhwX41J7NZb5H 1000000 destination.json
Transfer 1000000 tokens
  Sender: 7UKuG4W68hW9eGrDms6BenRf8DCEHKGN49xewtWyB5cx
  Recipient: 5wY8fiMZG5wGbQmtzKgqqEEp4vsCMJZ53RXEagUUWhEr

Signature: 3hc3CCiETiuCArJ6yZ76ScyfMeK1rw8CTfZ3aDGnYoEMeoqXfSNAtnM3ATFjm7UihthzEkEWzeUfWL4qqqB4ofgv
```

```js
    const mintAmount = BigInt(1_000_000_000);
    const owner = Keypair.generate();
    const sourceAccount = await createAccount(
        connection,
        payer,
        mint,
        owner.publicKey,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
    );
    await mintTo(
        connection,
        payer,
        mint,
        sourceAccount,
        mintAuthority,
        mintAmount,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID
    );

    const accountKeypair = Keypair.generate();
    const destinationAccount = await createAccount(
        connection,
        payer,
        mint,
        owner.publicKey,
        accountKeypair,
        undefined,
        TOKEN_2022_PROGRAM_ID
    );

    const transferAmount = BigInt(1_000_000);
    const fee = (transferAmount * BigInt(feeBasisPoints)) / BigInt(10_000);
    await transferCheckedWithFee(
        connection,
        payer,
        sourceAccount,
        mint,
        destinationAccount,
        owner,
        transferAmount,
        decimals,
        fee,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID
    );
```

#### 示例：查找有保留代币的账户

当用户转移他们的代币时，转账费用会积累在各个接收账户中。在初始化时配置的提取保留费用权限，可以使用 `withdraw_withheld_tokens_from_accounts` 或 `harvest_withheld_tokens_to_mint` 将这些代币转移到他们希望的任何地方。

然而，在执行这些操作之前，他们必须通过迭代铸币的所有账户来找出哪些账户有保留的代币。

```shell
CLI 支持即将推出！
```

```js
    const allAccounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
        commitment: 'confirmed',
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: mint.toString(),
                },
            },
        ],
    });
    const accountsToWithdrawFrom = [];
    for (const accountInfo of allAccounts) {
        const account = unpackAccount(accountInfo.account, accountInfo.pubkey, TOKEN_2022_PROGRAM_ID);
        const transferFeeAmount = getTransferFeeAmount(account);
        if (transferFeeAmount !== null && transferFeeAmount.withheldAmount > BigInt(0)) {
            accountsToWithdrawFrom.push(accountInfo.pubkey);
        }
    }
```

#### 示例：从账户中提取保留的代币

找到这些账户后，保留提取权限可以移动这些保留的代币。

```
$ spl-token withdraw-withheld-tokens 7UKuG4W68hW9eGrDms6BenRf8DCEHKGN49xewtWyB5cx 5wY8fiMZG5wGbQmtzKgqqEEp4vsCMJZ53RXEagUUWhEr

Signature: 2NfjbEnRQC7kXkf86stb6u7eUtaQTGDebo8ktCdz4gP4wCD93xtx75rSJxJDQVePNAa8NqtVLjUm19ZBDRVaYurt
```

```js
    await withdrawWithheldTokensFromAccounts(
        connection,
        payer,
        mint,
        destinationAccount,
        withdrawWithheldAuthority,
        [],
        [destinationAccount],
        undefined,
        TOKEN_2022_PROGRAM_ID
    );
```

**注意**：由接收账户汇集转账费用的设计旨在最大化交易的并行处理。否则，一个配置的费用接收账户在并行转账中会被写锁定，从而降低协议的吞吐量。


#### 示例：将保留的代币收集到铸币账户

用户可能希望关闭一个有保留转账费用的代币账户，但是拥有任何代币（包括被保留的代币）的账户都无法关闭。

为了清空账户中的保留代币，他们可以使用无需权限的 `harvest_withheld_tokens_to_mint` 指令。

收集指令通常不会显式暴露，因为通常不需要使用它。然而，在关闭账户之前需要使用它，所以我们可以通过关闭账户来展示收集行为：

```
$ spl-token close --address 5wY8fiMZG5wGbQmtzKgqqEEp4vsCMJZ53RXEagUUWhEr

Signature: KAKXryAdGSVFqpQhrwrvP6NCAQwLQp2Sj1WiAqCHxxwJsvRLKx4JzWgN9zYUaJNmfrZnQQw9yYoDw5Xx1YrwY6i

Signature: 2i5KGekFFtwzkX2W71cxPvQsGEH21qmZ3ieNQz7Mz2qGqp2pyzMNZhSVRfxJxQuAxnKQoZKjAb62FBx2gxaq25Le
```

```js
    await harvestWithheldTokensToMint(connection, payer, mint, [destinationAccount], undefined, TOKEN_2022_PROGRAM_ID);
```

#### 示例：从铸币账户提取保留的代币

当用户将保留的代币转移到铸币账户后，提取权限可选择将这些代币从铸币账户转移到任何其他账户。

```
$ spl-token withdraw-withheld-tokens --include-mint 7UKuG4W68hW9eGrDms6BenRf8DCEHKGN49xewtWyB5cx

Signature: 5KzdgcKgi3rLaBRfDbG5pxZwyKppyVjAA8TUCjTMfb1vMYv7CLQWaxgFz81jz4reUaF7oP67Gdqoc91Ted6qr1Hb
```

```js
    await withdrawWithheldTokensFromMint(
        connection,
        payer,
        mint,
        destinationAccount,
        withdrawWithheldAuthority,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID
    );
```

### 默认账户状态

代币铸造者可能希望限制谁可以使用他们的代币。针对这个问题，存在许多过于强制的解决方案，其中大多数包括在开始时通过一个中心化服务。然而，即使通过中心化服务，任何人也可能创建一个新的代币账户并转移代币。

为了简化限制，铸币创建者可以使用 `DefaultAccountState` 扩展，该扩展可以强制所有新的代币账户被冻结。这样，用户最终必须与某些服务互动才能解冻他们的账户并使用代币。

#### 示例: 铸造具有冻结账户的代币

```shell
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-freeze --default-account-state frozen
Creating token 8Sqz2zV8TFTnkLtnCdqRkjJsre3GKRwHcZd3juE5jJHf under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  8Sqz2zV8TFTnkLtnCdqRkjJsre3GKRwHcZd3juE5jJHf
Decimals:  9

Signature: 5wfYvovguPEbyv2uSWxGt9JcpTWgyuP4hY3wutjS32Ahnoni4qd7gf6sLre855WvT6xLHwrvV7J8bVmXymNU2qUz

$ spl-token create-account 8Sqz2zV8TFTnkLtnCdqRkjJsre3GKRwHcZd3juE5jJHf
Creating account 6XpKagP1N3K1XnzStufpV5YZ6DksEkQWgLNG9kPpLyvv

Signature: 2awxWdQMgv89ew34sEyG361vshB2wPXHHfva5iJ43dWr18f2Pr6awoXfsqYPpyS2eSbH6jhfVY9EUck8iJ4wCSN6

$ spl-token display 6XpKagP1N3K1XnzStufpV5YZ6DksEkQWgLNG9kPpLyvv
SPL Token Account
  Address: 6XpKagP1N3K1XnzStufpV5YZ6DksEkQWgLNG9kPpLyvv
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Balance: 0
  Decimals: 9
  Mint: 8Sqz2zV8TFTnkLtnCdqRkjJsre3GKRwHcZd3juE5jJHf
  Owner: 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
  State: Frozen
  Delegation: (not set)
  Close authority: (not set)
Extensions:
  Immutable owner
```

```js
import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
    AccountState,
    createInitializeMintInstruction,
    createInitializeDefaultAccountStateInstruction,
    getMintLen,
    updateDefaultAccountState,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

(async () => {
    const payer = Keypair.generate();

    const mintAuthority = Keypair.generate();
    const freezeAuthority = Keypair.generate();
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    const extensions = [ExtensionType.DefaultAccountState];
    const mintLen = getMintLen(extensions);
    const decimals = 9;

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

    const defaultState = AccountState.Frozen;

    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeDefaultAccountStateInstruction(mint, defaultState, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(
            mint,
            decimals,
            mintAuthority.publicKey,
            freezeAuthority.publicKey,
            TOKEN_2022_PROGRAM_ID
        )
    );
    await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair], undefined);
})();
```

#### 示例：更新默认状态

随着时间的推移，如果代币铸造者决定放宽这一限制，可以签署一个 `update_default_account_state` 指令，使所有账户默认处于未冻结状态。

```
$ spl-token update-default-account-state 8Sqz2zV8TFTnkLtnCdqRkjJsre3GKRwHcZd3juE5jJHf initialized

Signature: 3Mm2JCPrf6SrAe9awV3QzYvHiYmatiGWTmrQ7YnmzJSqyNCf75rLNMyH7jU26uZwX7q3MmBEBj1A36o5sGk9Vakb
```

```js
    await updateDefaultAccountState(
        connection,
        payer,
        mint,
        AccountState.Initialized,
        freezeAuthority,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID
    );
```

### 不可变拥有者

代币账户的拥有者可以将所有权重新分配给任何其他地址。这在许多情况下是有用的，但它也可能造成安全漏洞。

例如，关联代币账户（Associated Token Accounts）的地址是基于拥有者和代币铸币地址派生的，这使得找到一个拥有者的“正确”代币账户变得容易。如果账户拥有者已经重新分配了他们的关联代币账户的所有权，那么应用程序可能会派生该账户的地址并使用它，而不知道它已经不再属于原拥有者。

为了避免这个问题，Token-2022 包含了 `ImmutableOwner` 扩展，这使得重新分配账户的所有权变得不可能。关联代币账户程序在创建账户时总是使用这个扩展。

#### 示例：创建具有不可变所有权的账户

```
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token
Creating token CZxztd7SEZWxg6B9PH5xa7QwKpMCpWBJiTLftw1o3qyV under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  CZxztd7SEZWxg6B9PH5xa7QwKpMCpWBJiTLftw1o3qyV
Decimals:  9

Signature: 4fT19YaE3zAscj71n213K22M3wDSXgwSn39RBCVtiCTxMX7pZhAoHywP2QMKqWpZMB5vT7diQ8QaFp3abHztpyPC
$ solana-keygen new -o account.json
$ spl-token create-account CZxztd7SEZWxg6B9PH5xa7QwKpMCpWBJiTLftw1o3qyV account.json --immutable
Creating account EV2xsZto1TRqehewwWHUUQm68X6C6MepBSkbfZcVdShy

Signature: 5NqXiE3LPFnufnZhcwKPoZt7DaPR7qwfhmRr9W9ykhNM7rnu6MDdx7n5eTpEisiaSET2R4fZW7a91Ai6pCuskXF8
```

```js
import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
    createAccount,
    createMint,
    createInitializeImmutableOwnerInstruction,
    createInitializeAccountInstruction,
    getAccountLen,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const payer = Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

    const mintAuthority = Keypair.generate();
    const decimals = 9;
    const mint = await createMint(
        connection,
        payer,
        mintAuthority.publicKey,
        mintAuthority.publicKey,
        decimals,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
    );

    const accountLen = getAccountLen([ExtensionType.ImmutableOwner]);
    const lamports = await connection.getMinimumBalanceForRentExemption(accountLen);

    const owner = Keypair.generate();
    const accountKeypair = Keypair.generate();
    const account = accountKeypair.publicKey;
    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: account,
            space: accountLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeImmutableOwnerInstruction(account, TOKEN_2022_PROGRAM_ID),
        createInitializeAccountInstruction(account, mint, owner.publicKey, TOKEN_2022_PROGRAM_ID)
    );
    await sendAndConfirmTransaction(connection, transaction, [payer, accountKeypair], undefined);
})();
```

#### 示例：创建具有不可变所有权的关联代币账户

所有关联代币账户都包含了不可变所有权扩展，因此使用这个扩展非常简单。

```
$ spl-token create-account CZxztd7SEZWxg6B9PH5xa7QwKpMCpWBJiTLftw1o3qyV

Creating account 4nvfLgYMERdNbbf1pADUSp44XukAyjeWWXCMkM1gMqC4

Signature: w4TRYDdCpTfmQh96E4UNgFFeiAHphWNaeYrJTu6bGyuPMokJrKFR33Ntj3iNQ5QQuFqom2CaYkhXiX9sBpWEW23
```

```js
    const associatedAccount = await createAccount(
        connection,
        payer,
        mint,
        owner.publicKey,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
    );
```

如果提供了 `--immutable` 参数，那么CLI会告诉我们指定它是不必要的：

```
$ spl-token create-account CZxztd7SEZWxg6B9PH5xa7QwKpMCpWBJiTLftw1o3qyV --immutable

Creating account 4nvfLgYMERdNbbf1pADUSp44XukAyjeWWXCMkM1gMqC4
Note: --immutable specified, but Token-2022 ATAs are always immutable, ignoring

Signature: w4TRYDdCpTfmQh96E4UNgFFeiAHphWNaeYrJTu6bGyuPMokJrKFR33Ntj3iNQ5QQuFqom2CaYkhXiX9sBpWEW23
```

### 不可转让代币

为了配合不可变所有权的代币账户，`NonTransferable` 铸币扩展允许创建“灵魂绑定”的代币，这些代币不能转移到任何其他实体。例如，这个扩展非常适合只能属于一个人或账户的成就。

这个扩展与发行一个代币然后冻结账户非常相似，但它允许所有者在需要时销毁并关闭账户。

#### 示例: 铸造不可转让代币

```
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-non-transferable

Creating token 7De7wwkvNLPXpShbPDeRCLukb3CRzCNcC3iUuHtD6k4f under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  7De7wwkvNLPXpShbPDeRCLukb3CRzCNcC3iUuHtD6k4f
Decimals:  9

Signature: 2QtCBwCo2J9hf2Prd2t4CBBUxEXQCBSSD5gkNc59AwhxsKgRp92czNAvwWDxjeXGFCWSuNmzAcD19cEpqubovDDv
```

```js
import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
    createInitializeNonTransferableMintInstruction,
    createInitializeMintInstruction,
    getMintLen,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const payer = Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

    const mintAuthority = Keypair.generate();
    const decimals = 9;

    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    const mintLen = getMintLen([ExtensionType.NonTransferable]);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(mint, decimals, mintAuthority.publicKey, null, TOKEN_2022_PROGRAM_ID)
    );
    await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair], undefined);
})();
```

### 转账时附加备忘录

传统银行系统通常要求所有转账都必须附加备忘录。Token-2022 程序包含了一个扩展来满足这一需求。

通过在您的代币账户上启用必须附加备忘录的转账，该程序强制要求所有进账转账必须在转账指令之前附带一个备忘录指令。

**注意**：只要在调用转账之前执行 CPI 来记录备忘录，这也适用于 CPI 上下文。

#### 示例: 创建附加备忘录的转账交易

```shell
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token
Creating token EbPBt3XkCb9trcV4c8fidhrvoeURbDbW87Acustzyi8N under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  EbPBt3XkCb9trcV4c8fidhrvoeURbDbW87Acustzyi8N
Decimals:  9

Signature: 2mCoV3ujSUArgZMyayiYtLZp2QzpqKx3NXnv9W8DpinY39rBU2yGmYLfp2tZ9uZqVbfJ6Mf3SqDHexdCcFcDAEvc
$ spl-token create-account EbPBt3XkCb9trcV4c8fidhrvoeURbDbW87Acustzyi8N
Creating account 4Uzz67txwYbfYpF8r5UGEMYJwhPAYQ5eFUY89KTYc2bL

Signature: 57wZHDaQtSzszDkusrnozZNj5PemQhpqHMEFLWFKpqASCErcDuBuYuEky5g3evHtkjMrKgh1s3aEap1L8y5UhW5W
$ spl-token enable-required-transfer-memos 4Uzz67txwYbfYpF8r5UGEMYJwhPAYQ5eFUY89KTYc2bL
Signature: 5MnWtrhMK32zkbacDMwBNft48VAUpr4EoRM87hkT9AFYvPgPEU7V7ERV6gdfb3kASri4wnUnr13hNKuYJ66pD8Fs
```

```js
import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { createMemoInstruction } from '@solana/spl-memo';
import {
    createAssociatedTokenAccount,
    createMint,
    createEnableRequiredMemoTransfersInstruction,
    createInitializeAccountInstruction,
    createTransferInstruction,
    disableRequiredMemoTransfers,
    enableRequiredMemoTransfers,
    getAccountLen,
    mintTo,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const payer = Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

    const mintAuthority = Keypair.generate();
    const decimals = 9;
    const mint = await createMint(
        connection,
        payer,
        mintAuthority.publicKey,
        mintAuthority.publicKey,
        decimals,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
    );

    const accountLen = getAccountLen([ExtensionType.MemoTransfer]);
    const lamports = await connection.getMinimumBalanceForRentExemption(accountLen);

    const owner = Keypair.generate();
    const destinationKeypair = Keypair.generate();
    const destination = destinationKeypair.publicKey;
    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: destination,
            space: accountLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeAccountInstruction(destination, mint, owner.publicKey, TOKEN_2022_PROGRAM_ID),
        createEnableRequiredMemoTransfersInstruction(destination, owner.publicKey, [], TOKEN_2022_PROGRAM_ID)
    );

    await sendAndConfirmTransaction(connection, transaction, [payer, owner, destinationKeypair], undefined);

})();
```

#### 示例：启用或禁用必须附加备忘录的转账

账户所有者可以随时选择开启或关闭必须附加备忘录的转账功能。

```
$ spl-token disable-required-transfer-memos 4Uzz67txwYbfYpF8r5UGEMYJwhPAYQ5eFUY89KTYc2bL
Signature: 5a9X8JrWzwZqb3iMonfUfSZbisQ57aEmW5cFntWGYRv2UZx8ACkMineBEQRHwLMzYHeyFDEHMXu8zqAMv5tm4u1g

$ spl-token enable-required-transfer-memos 4Uzz67txwYbfYpF8r5UGEMYJwhPAYQ5eFUY89KTYc2bL
Signature: 5MnWtrhMK32zkbacDMwBNft48VAUpr4EoRM87hkT9AFYvPgPEU7V7ERV6gdfb3kASri4wnUnr13hNKuYJ66pD8Fs
```

```js
    await disableRequiredMemoTransfers(connection, payer, destination, owner, [], undefined, TOKEN_2022_PROGRAM_ID);

    await enableRequiredMemoTransfers(connection, payer, destination, owner, [], undefined, TOKEN_2022_PROGRAM_ID);
```

#### 示例：带备忘录的转账

当向需要转账备忘录的账户转账时，您必须在转账之前包含一个备忘录指令。

```
$ spl-token transfer EbPBt3XkCb9trcV4c8fidhrvoeURbDbW87Acustzyi8N 10 4Uzz67txwYbfYpF8r5UGEMYJwhPAYQ5eFUY89KTYc2bL --with-memo "memo text"

Signature: 5a9X8JrWzwZqb3iMonfUfSZbisQ57aEmW5cFntWGYRv2UZx8ACkMineBEQRHwLMzYHeyFDEHMXu8zqAMv5tm4u1g
```

```js
    const sourceTokenAccount = await createAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey,
        undefined,
        TOKEN_2022_PROGRAM_ID
    );
    await mintTo(connection, payer, mint, sourceTokenAccount, mintAuthority, 100, [], undefined, TOKEN_2022_PROGRAM_ID);

    const transferTransaction = new Transaction().add(
        createMemoInstruction('Hello, memo-transfer!', [payer.publicKey]),
        createTransferInstruction(sourceTokenAccount, destination, payer.publicKey, 100, [], TOKEN_2022_PROGRAM_ID)
    );
    await sendAndConfirmTransaction(connection, transferTransaction, [payer], undefined);
```

### 账户空间重新分配

在前面的示例中，聪明的读者可能已经注意到 JavaScript 代码中的 `EnableRequiredOfMemoTransfers` 指令是在 `InitializeAccount` 之后执行的，这意味着这个扩展可以在账户已经创建后启用。

然而，为了在账户创建后实际添加这个扩展，您可能需要在账户中重新分配更多空间以容纳额外的扩展字节。

`Reallocate` 指令允许所有者重新分配其代币账户以腾出空间容纳更多扩展。

#### 示例：重新分配现有账户以启用备忘录转账

CLI 会自动进行重新分配，因此如果您在一个空间不足的账户上使用 `enable-required-transfer-memos`，它将添加 `Reallocate` 指令。

```
$ spl-token create-account EbPBt3XkCb9trcV4c8fidhrvoeURbDbW87Acustzyi8N
Creating account 4Uzz67txwYbfYpF8r5UGEMYJwhPAYQ5eFUY89KTYc2bL

Signature: 57wZHDaQtSzszDkusrnozZNj5PemQhpqHMEFLWFKpqASCErcDuBuYuEky5g3evHtkjMrKgh1s3aEap1L8y5UhW5W
$ spl-token enable-required-transfer-memos 4Uzz67txwYbfYpF8r5UGEMYJwhPAYQ5eFUY89KTYc2bL
Signature: 5MnWtrhMK32zkbacDMwBNft48VAUpr4EoRM87hkT9AFYvPgPEU7V7ERV6gdfb3kASri4wnUnr13hNKuYJ66pD8Fs
```

```js
import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
    createAccount,
    createMint,
    createEnableRequiredMemoTransfersInstruction,
    createReallocateInstruction,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const payer = Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

    const mintAuthority = Keypair.generate();
    const decimals = 9;
    const mint = await createMint(
        connection,
        payer,
        mintAuthority.publicKey,
        mintAuthority.publicKey,
        decimals,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
    );

    const owner = Keypair.generate();
    const account = await createAccount(
        connection,
        payer,
        mint,
        owner.publicKey,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
    );

    const extensions = [ExtensionType.MemoTransfer];
    const transaction = new Transaction().add(
        createReallocateInstruction(
            account,
            payer.publicKey,
            extensions,
            owner.publicKey,
            undefined,
            TOKEN_2022_PROGRAM_ID
        ),
        createEnableRequiredMemoTransfersInstruction(account, owner.publicKey, [], TOKEN_2022_PROGRAM_ID)
    );
    await sendAndConfirmTransaction(connection, transaction, [payer, owner], undefined);
})();
```

### 利息增值代币

在现实世界中，价值不断增长或减少的代币有很多用途。最著名的例子是债券。

在 Token 程序中，这种功能只能通过需要定期重设或更新操作的代理合约来实现。

然而，随着 Token-2022 程序扩展模型的引入，我们有可能改变代币在用户界面(UI)中显示数量的方式。使用 `InterestBearingMint` 扩展和 `amount_to_ui_amount` 指令，您可以为您的代币设置利率，并在任何时候获取其含利息的金额。

利息基于网络中的时间戳连续复利计算。由于网络时间戳可能发生的偏差，累积的利息可能低于预期值。幸运的是，这种情况很少见。

**注意**：没有新的代币被创造，用户界面显示的金额是代币数量加上所有累积的利息。这个功能完全是表面上的。

#### 示例: 创建利息增值代币

```
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --interest-rate 10

Creating token 7N4HggYEJAtCLJdnHGCtFqfxcB5rhQCsQTze3ftYstVj under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  7N4HggYEJAtCLJdnHGCtFqfxcB5rhQCsQTze3ftYstVj
Decimals:  9

Signature: 5dSW5QUacEsaKYb3MwYp4ycqq4jpNJ1rpLhS5rotoe3CWv9XhhjrncUFpk14R1fRamS1xprziC3NkpbYno4c8JxD
```

```js
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createInterestBearingMint, updateRateInterestBearingMint, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const payer = Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

    const mintAuthority = Keypair.generate();
    const freezeAuthority = Keypair.generate();
    const rateAuthority = Keypair.generate();
    const mintKeypair = Keypair.generate();
    const rate = 10;
    const decimals = 9;
    const mint = await createInterestBearingMint(
        connection,
        payer,
        mintAuthority.publicKey,
        freezeAuthority.publicKey,
        rateAuthority.publicKey,
        rate,
        decimals,
        mintKeypair,
        undefined,
        TOKEN_2022_PROGRAM_ID
    );
})();
```

#### 示例：更新利率

利率管理者可以随时更新铸造代币的利率。

```
$ spl-token set-interest-rate 7N4HggYEJAtCLJdnHGCtFqfxcB5rhQCsQTze3ftYstVj 50

Setting Interest Rate for 7N4HggYEJAtCLJdnHGCtFqfxcB5rhQCsQTze3ftYstVj to 50 bps

Signature: 5DQs6hzkfGq3uotESuVwF7MGeMawwfQcm1e9RHaUeVySDV6xpUzYhzdb6ygqJfsEZqewgiDR5KuxaGzkdTMcDrTn
```

```js
    const updateRate = 50;
    await updateRateInterestBearingMint(
        connection,
        payer,
        mint,
        rateAuthority,
        updateRate,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID
    );
```

### 永久委托

在 Token-2022 程序中，可以为代币铸造指定一个永久委托账户。这一权限拥有对该铸造代币任何账户的无限控制权限，意味着它可以燃烧或转移任何数量的代币。

虽然这一功能确实存在被滥用的空间，但它在现实世界中有许多重要的用途。

在某些司法管辖区，稳定币发行者必须能够从受制裁实体中没收资产。通过永久委托，稳定币发行者可以从受制裁实体拥有的账户中转移或燃烧代币。

还可以在NFT上实施[ Harberger 税](http://www.harbergertax.com/)，其中一个拍卖程序拥有该代币的永久委托权限。如果前一个所有者未支付税款，委托权限代表可以在销售后将NFT从所有者转移给买家。

#### 示例: 铸造具有永久委托权限的代币

```
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-permanent-delegate

Creating token 7LUgoQCqhk3VMPhpAnmS1zdCFW4C6cupxgbqWrTwydGx under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  7LUgoQCqhk3VMPhpAnmS1zdCFW4C6cupxgbqWrTwydGx
Decimals:  9

Signature: 439yVq2WfUEegAPv5BAkFampBPo696UbZ58RAYCzvUcbcBcxhfThpt1pcdKmiQrurHj65CqmWiHzrfT12BhL3Nxb
```

CLI 默认将永久委托设置为代币铸造者权限，但您可以使用 `authorize` 命令进行更改。

```
$ spl-token authorize 7LUgoQCqhk3VMPhpAnmS1zdCFW4C6cupxgbqWrTwydGx permanent-delegate GFMniFoE5X4F87L9jzjHaW4MTkXyX1AYHNfhFencgamg

Updating 7LUgoQCqhk3VMPhpAnmS1zdCFW4C6cupxgbqWrTwydGx 
Current permanent delegate: 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn 
New permanent delegate: GFMniFoE5X4F87L9jzjHaW4MTkXyX1AYHNfhFencgamg

Signature: 2ABDrR6meXk4rrAwd2LsHaTsnM5BuTC9RbiZmgBxgzze8ZM2yxuYp8iyg8viHgVaKRbXGzjKsFjF5RR9Kkzn4Prj
```


```js
import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';

import {
    ExtensionType,
    createInitializeMintInstruction,
    createInitializePermanentDelegateInstruction,
    mintTo,
    createAccount,
    getMintLen,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

(async () => {
    const payer = Keypair.generate();

    const mintAuthority = Keypair.generate();
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    const permanentDelegate = Keypair.generate();

    const extensions = [ExtensionType.PermanentDelegate];
    const mintLen = getMintLen(extensions);
    const decimals = 9;

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen);
    const mintTransaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports: mintLamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializePermanentDelegateInstruction(mint, permanentDelegate.publicKey, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(mint, decimals, mintAuthority.publicKey, null, TOKEN_2022_PROGRAM_ID)
    );
    await sendAndConfirmTransaction(connection, mintTransaction, [payer, mintKeypair], undefined);
})();
```

### CPI 守护

CPI 守护是一个扩展，它禁止在跨智能合约程序调用中执行某些操作，以保护用户避免在无法看到的、隐藏在非系统或 Token 程序中签名。

用户可以随意在其代币账户上启用或禁用 CPI 守护扩展。启用后，在 CPI 过程中会有以下效果：

+   Transfer：进行签名的权限或授权身份必须是该账户的委托者或代理人
+   Burn：进行签名的权限或授权身份必须是该账户的委托者或代理人
+   Approve：禁止
+   Close Account：lamport 目的地必须是账户所有者
+   Set Close Authority：除非是取消设置，否则禁止
+   Set Owner：始终禁止，包括在 CPI 外部

#### 背景

在与去中心化应用（dapp）交互时，用户会签署前端代码构建的交易。在获得用户的签名后，dapp 有三种基本方式可以从用户转移资金到 dapp（或等效地销毁它们）：

+   在交易中插入一个转账指令
+   在交易中插入一个授权指令，并在程序权限下执行 CPI 转账
+   插入一个不透明的程序指令，并在用户授权下执行 CPI 转账

前两种方式是安全的，因为用户可以准确地看到正在执行的操作，没有任何歧义。第三种方式则相当危险。钱包签名允许程序以用户的身份执行任何操作，而对其行为无法看到。虽然有一些解决方案的尝试，例如模拟交易并警告有关余额变化，但从根本上说，这是难以解决的。

有两种方式可以使这更加安全：

+   每当钱包签名被用于不透明（非system、非token 程序）指令时，钱包都会发出警告。应教育用户将对此类指令的签名请求视为高度可疑
+   代币程序禁止使用用户权限进行 CPI 调用，强制不透明程序直接请求用户的权限

CPI 守护涵盖了第二种情况。

#### 示例: 为代币账户开启CPI保护

```
$ spl-token enable-cpi-guard 4YfkXX89TrsWqSSxb3av36Rk8EZBoDqxGzuaDNXr7UnL

Signature: 2fohon7oraTCgBZB3dfzhpGsBobYmYPgA8nvgCqKzjqpdX6EYZaBY3VwzjNuwDpsFYYNbpTVYBjxqiaMBrvXM8S2
```

```js
import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
    createMint,
    createEnableCpiGuardInstruction,
    createInitializeAccountInstruction,
    disableCpiGuard,
    enableCpiGuard,
    getAccountLen,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const payer = Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

    const mintAuthority = Keypair.generate();
    const decimals = 9;
    const mint = await createMint(
        connection,
        payer,
        mintAuthority.publicKey,
        mintAuthority.publicKey,
        decimals,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
    );

    const accountLen = getAccountLen([ExtensionType.CpiGuard]);
    const lamports = await connection.getMinimumBalanceForRentExemption(accountLen);

    const owner = Keypair.generate();
    const destinationKeypair = Keypair.generate();
    const destination = destinationKeypair.publicKey;
    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: destination,
            space: accountLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeAccountInstruction(destination, mint, owner.publicKey, TOKEN_2022_PROGRAM_ID),
        createEnableCpiGuardInstruction(destination, owner.publicKey, [], TOKEN_2022_PROGRAM_ID)
    );

    await sendAndConfirmTransaction(connection, transaction, [payer, owner, destinationKeypair], undefined);

    // OR
    await enableCpiGuard(connection, payer, destination, owner, [], undefined, TOKEN_2022_PROGRAM_ID);
})();
```

#### 示例: 为代币账户关闭CPI保护


```
$ spl-token disable-cpi-guard 4YfkXX89TrsWqSSxb3av36Rk8EZBoDqxGzuaDNXr7UnL

Signature: 4JJSBSc1UAtArbBqYRpTk9264WwJuZ8n6NqyXtCSmyVQpmHoetzyVDwHxtxrdK8wQawoocDxFD9rRPhpAMzJ6EdG
```

```js
    await disableCpiGuard(connection, payer, destination, owner, [], undefined, TOKEN_2022_PROGRAM_ID);
```

### 转账触发器

#### 动机

代币创造者可能需要更多控制权来管理他们的代币如何被转移。最显著的用例围绕 NFT 版税。每当一个代币被移动时，创造者应有权获得版税，但由于当前代币程序的设计，无法在协议级别停止转移。

当前的解决方案通常采用永久冻结代币，这需要一个完整的代理层来与代币进行交互。钱包和市场需要了解代理层，以便正确使用代币。

更糟糕的是，不同的版税系统有不同的代理层来使用他们的代币。总之，这些系统损害了组合性，并使开发更加困难。

#### 解决方案

为了改善现状，Token-2022 引入了[转账触发器接口](https://spl.solana.com/transfer-hook-interface)和扩展的概念。代币创造者必须开发并部署一个实现该接口的程序，然后配置其代币铸造时指定使用该程序。

在转账过程中，Token-2022 程序会调用指定的程序，该程序根据该铸币地址和程序 ID 定义好的程序派生地址调用。此调用发生在所有其他转账逻辑之后，因此账户反映了转账的*结束*状态。

与转账触发器程序交互时，可以仅使用 `Transfer` 指令所需的账户向程序发送一条指令（如 `Execute`（转账）），程序可能需要的任何额外账户都会在链上自动解析！这个过程在下方 **资源** 链接的多个 `README` 文件中有详细解释。


#### 资源

接口描述和结构体位于 [spl-transfer-hook-interface](https://github.com/solana-labs/solana-program-library/tree/master/token/transfer-hook/interface)，同时还提供了一个简单的程序实现示例。您可以在仓库的 [README](https://github.com/solana-labs/solana-program-library/tree/master/token/transfer-hook/interface/README.md) 中找到如何为链上程序实现此接口或与实现**转账触发器**的程序交互的详细说明。

`spl-transfer-hook-interface` 库提供了链上和链下帮助程序，用于解析所需的额外账户。请查看 [invoke.rs](https://github.com/solana-labs/solana-program-library/tree/master/token/transfer-hook/interface/src/invoke.rs) 了解链上使用方法，以及 [offchain.rs](https://github.com/solana-labs/solana-program-library/tree/master/token/transfer-hook/interface/src/offchain.rs) 了解如何使用 `BanksClient` 或 `RpcClient` 等异步链下客户端获取所需的额外账户元数据。

一个可用的示例程序位于 [spl-transfer-hook-example](https://github.com/solana-labs/solana-program-library/tree/master/token/transfer-hook/example)。Token-2022 在测试中使用这个示例程序来确保它正确使用**转账触发器**接口。

示例程序和接口由 [spl-tlv-account-resolution](https://github.com/solana-labs/solana-program-library/tree/master/libraries/tlv-account-resolution) 库支持，在其仓库的 [README](https://github.com/solana-labs/solana-program-library/tree/master/libraries/tlv-account-resolution/README.md) 中有详细说明。

#### 示例: 铸造带有转账触发器的代币

```
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --transfer-hook 7N4HggYEJAtCLJdnHGCtFqfxcB5rhQCsQTze3ftYstVj

Creating token HFg1FFaj4PqFHmkYrqbZsarNJEZT436aXAXgQFMJihwc under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  HFg1FFaj4PqFHmkYrqbZsarNJEZT436aXAXgQFMJihwc
Decimals:  9

Signature: 3ug4Ejs16jJgEm1WyBwDDxzh9xqPzQ3a2cmy1hSYiPFcLQi9U12HYF1Dbhzb2bx75SSydfU6W4e11dGUXaPbJqVc
```

```js
import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';

import {
    ExtensionType,
    createInitializeMintInstruction,
    createInitializeTransferHookInstruction,
    mintTo,
    createAccount,
    getMintLen,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

(async () => {
    const payer = Keypair.generate();

    const mintAuthority = Keypair.generate();
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    const extensions = [ExtensionType.TransferHook];
    const mintLen = getMintLen(extensions);
    const decimals = 9;
    const transferHookProgramId = new PublicKey('7N4HggYEJAtCLJdnHGCtFqfxcB5rhQCsQTze3ftYstVj')

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen);
    const mintTransaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports: mintLamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeTransferHookInstruction(mint, payer.publicKey, transferHookProgramId, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(mint, decimals, mintAuthority.publicKey, null, TOKEN_2022_PROGRAM_ID)
    );
    await sendAndConfirmTransaction(connection, mintTransaction, [payer, mintKeypair], undefined);
})();
```

#### 示例: 升级转账触发器

```
$ spl-token set-transfer-hook HFg1FFaj4PqFHmkYrqbZsarNJEZT436aXAXgQFMJihwc EbPBt3XkCb9trcV4c8fidhrvoeURbDbW87Acustzyi8N

Signature: 3Ffw6yjseDsL3Az5n2LjdwXXwVPYxDF3JUU1JC1KGAEb1LE68S9VN4ebtAyvKeYMHvhjdz1LJVyugGNdWHyotzay
```

```js
await updateTransferHook(
  connection,
  payer, mint,
  newTransferHookProgramId,
  payer.publicKey,
  [],
  undefined,
  TOKEN_2022_PROGRAM_ID
);
```

#### 示例: 管理转账触发器智能合约程序

一个用于管理转账触发器程序的示例命令行界面（CLI）位于 [spl-transfer-hook-cli](https://github.com/solana-labs/solana-program-library/tree/master/token/transfer-hook/cli)。代币铸造者可以为他们自己的程序分叉这个工具。

它只包含一个命令，用于为代币铸造创建所需的转账触发器账户。

首先，您必须构建转账触发器程序并部署它：

```
$ cargo build-sbf
$ solana program deploy target/deploy/spl-transfer-hook-example.so
```

然后, 需要初始化转账触发器账户:

```
$ spl-transfer-hook create-extra-metas <PROGRAM_ID> <MINT_ID> [<ACCOUNT_PUBKEY>:<ROLE> ...]
```

### 元数据指针

随着元数据程序潜在增多的可能性，一个代币铸造地址可以有多个不同的账户，所有这些账户都声称描述了该铸币。

为了让客户端容易区分，元数据指针扩展允许代币创建者指定一个描述规范元数据的地址。正如您将在“元数据”部分看到的，这个地址可以是铸币本身！

然而，为了避免伪造的铸币声称自己是稳定币，客户端必须检查铸币和元数据是否相互指向。

#### 示例：铸造一个带有指向外部账户元数据指针的代币

```
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --metadata-address 7N4HggYEJAtCLJdnHGCtFqfxcB5rhQCsQTze3ftYstVj

Creating token HFg1FFaj4PqFHmkYrqbZsarNJEZT436aXAXgQFMJihwc under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  HFg1FFaj4PqFHmkYrqbZsarNJEZT436aXAXgQFMJihwc
Decimals:  9

Signature: 3ug4Ejs16jJgEm1WyBwDDxzh9xqPzQ3a2cmy1hSYiPFcLQi9U12HYF1Dbhzb2bx75SSydfU6W4e11dGUXaPbJqVc
```

### 原数据

为了便于使用 token-metadata，Token-2022 程序允许代币铸造者直接在铸币账户中包含其代币的元数据。

Token-2022 实现了 [spl-token-metadata-interface](https://github.com/solana-labs/solana-program-library/tree/master/token-metadata/interface) 中的所有指令。

元数据扩展应该直接与元数据指针扩展协同工作。在创建铸币时，您还应该添加元数据指针扩展，指向铸币本身。

这些工具会自动为您完成这些操作。

#### 示例: 铸造一个带有原数据的代币


```
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-metadata

Creating token 5K8RVdjpY3CHujyKjQ7RkyiCJqTG8Kba9krNfpZnmvpS under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

To initialize metadata inside the mint, please run `spl-token initialize-metadata 5K8RVdjpY3CHujyKjQ7RkyiCJqTG8Kba9krNfpZnmvpS <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>`, and sign with the mint authority

Address:  5K8RVdjpY3CHujyKjQ7RkyiCJqTG8Kba9krNfpZnmvpS
Decimals:  9

Signature: 2BZH8KE7zVcBj7Mmnu6uCM9NT4ey7qHasZmEk6Bt3tyx1wKCXS3JtcgEvrXXEMFB5numQgA9wvR67o2Z4YQdEw7m

$ spl-token initialize-metadata 5K8RVdjpY3CHujyKjQ7RkyiCJqTG8Kba9krNfpZnmvpS MyTokenName TOKEN http://my.token --update-authority 3pGiHDDek35npQuyWQ7FGcWxqJdHvVPDHDDmBFs2YxQj

Signature: 2H16XtBqdwSbvvq8g5o2jhy4TknP6zgt71KHawEdyPvNuvusQrV4dPccUrMqjFeNTbk75AtzmzUVueH3yWiTjBCG
```


```js
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from '@solana/spl-token';
import { createInitializeInstruction, pack, TokenMetadata } from '@solana/spl-token-metadata';

(async () => {
  const payer = Keypair.generate();

  const mint = Keypair.generate();
  const decimals = 9;

  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    name: 'TOKEN_NAME',
    symbol: 'SMBL',
    uri: 'URI',
    additionalMetadata: [['new-field', 'new-value']],
  };

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction({
    signature: airdropSignature,
    ...(await connection.getLatestBlockhash()),
  });

  const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint.publicKey,
      space: mintLen,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMetadataPointerInstruction(mint.publicKey, payer.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID),
    createInitializeMintInstruction(mint.publicKey, decimals, payer.publicKey, null, TOKEN_2022_PROGRAM_ID),
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      mint: mint.publicKey,
      metadata: mint.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: payer.publicKey,
      updateAuthority: payer.publicKey,
    }),
  );
  await sendAndConfirmTransaction(connection, mintTransaction, [payer, mint]);
})();
```

#### 示例: 升级字段

```
$ spl-token update-metadata 5K8RVdjpY3CHujyKjQ7RkyiCJqTG8Kba9krNfpZnmvpS name YourToken

Signature: 2H16XtBqdwSbvvq8g5o2jhy4TknP6zgt71KHawEdyPvNuvusQrV4dPccUrMqjFeNTbk75AtzmzUVueH3yWiTjBCG
```

```js
import { createUpdateFieldInstruction } from "@solana/spl-token-metadata";

(async () => {
  const tx = new Transaction().add(
    createUpdateFieldInstruction({
      metadata: mint.publicKey,
      updateAuthority: payer.publicKey,
      programId: TOKEN_2022_PROGRAM_ID,
      field: 'name',
      value: 'YourToken',
    }),
  );
  await sendAndConfirmTransaction(connection, tx, [ payer, mint ]);
})();
```

#### 示例: 添加自定义字段

```
$ spl-token update-metadata 5K8RVdjpY3CHujyKjQ7RkyiCJqTG8Kba9krNfpZnmvpS new-field new-value

Signature: 31uerYNa6yhb21k5CCX69k7RLUKEhJEV99UadEpPnZtWWpykwr7vkTFkuFeJ7AaEyQPrepe8m8xr4N23JEAeuTRY
```

```js
import { createUpdateFieldInstruction } from "@solana/spl-token-metadata";

(async () => {
  const tx = new Transaction().add(
    createUpdateFieldInstruction({
      metadata: mint.publicKey,
      updateAuthority: payer.publicKey,
      programId: TOKEN_2022_PROGRAM_ID,
      field: 'new-field',
      value: 'new-value',
    }),
  );
  await sendAndConfirmTransaction(connection, tx, [ payer, mint ]);
})();
```

#### 示例: 移除自定义字段

```
$ spl-token update-metadata 5K8RVdjpY3CHujyKjQ7RkyiCJqTG8Kba9krNfpZnmvpS new-field --remove

Signature: 52s1mxRqnr2jcZNvcmcgsQuXfVyT2w1TuRsEE3J6YwEZBu74BbFcHh2DvwnJG7qC7Cy6C5ZrTfnoPREFjFS7kXjF
```

```js
import { createRemoveKeyInstruction } from "@solana/spl-token-metadata";

(async () => {
  const tx = new Transaction().add(
    createRemoveKeyInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mint.publicKey,
      updateAuthority: payer.publicKey,
      key: 'new-field',
      idempotent: true, // If false the operation will fail if the field does not exist in the metadata
    }),
  );
  await sendAndConfirmTransaction(connection, tx, [ payer, mint ]);
})();
```

### 组指针

与元数据指针类似，组指针允许代币创建者指定一个描述铸币的组账户。与其描述代币元数据不同，组账户描述的是将代币分组的配置。

当 Token-2022 铸币拥有一个组指针时，该铸币被认为是一个组铸币（例如一个收藏品 NFT）。组铸币具有允许它们作为相关代币集合的参考点的配置。

与元数据类似，组指针可以指向铸币本身，客户端必须检查铸币和组是否互相指向。

#### 示例：铸造一个带有指向外部账户的组指针代币

```
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --group-address 7ZJVSav7y76M41eFeyA3xz39UDigQspVNwyJ469TgR1S

Creating token EUMhJgfvjZa7Lb7fSqfD6WCUwELzzRVKunKSnSi4xK42 under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  EUMhJgfvjZa7Lb7fSqfD6WCUwELzzRVKunKSnSi4xK42
Decimals:  9

Signature: 3ug4Ejs16jJgEm1WyBwDDxzh9xqPzQ3a2cmy1hSYiPFcLQi9U12HYF1Dbhzb2bx75SSydfU6W4e11dGUXaPbJqVc
```

### 组

Token-2022 程序支持通过组扩展对代币进行分组。组的更新权限和组的大小等配置信息可以直接存储在铸造代币中。

Token-2022 实现了 [spl-token-group-interface](https://github.com/solana-labs/solana-program-library/tree/master/token-group/interface) 中的所有指令。

组扩展可以直接与组指针扩展协同工作。要在代币铸造中初始化组配置，您必须在铸造代币时添加指向代币本身的组指针扩展。

工具会自动为您完成这些操作。

#### 示例: 铸造一个带有组配置的代币

```
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-group
Creating token 812A34SxxYx9KqFwUNAuW7Wpwtmuj2pc5u1TGQcvPnj3 under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
To initialize group configurations inside the mint, please run `spl-token initialize-group 812A34SxxYx9KqFwUNAuW7Wpwtmuj2pc5u1TGQcvPnj3 <MAX_SIZE>`, and sign with the mint authority.

Address:  812A34SxxYx9KqFwUNAuW7Wpwtmuj2pc5u1TGQcvPnj3
Decimals:  9

Signature: 2BZH8KE7zVcBj7Mmnu6uCM9NT4ey7qHasZmEk6Bt3tyx1wKCXS3JtcgEvrXXEMFB5numQgA9wvR67o2Z4YQdEw7m

$ spl-token initialize-group 812A34SxxYx9KqFwUNAuW7Wpwtmuj2pc5u1TGQcvPnj3 12 --update-authority 3pGiHDDek35npQuyWQ7FGcWxqJdHvVPDHDDmBFs2YxQj
Signature: 2H16XtBqdwSbvvq8g5o2jhy4TknP6zgt71KHawEdyPvNuvusQrV4dPccUrMqjFeNTbk75AtzmzUVueH3yWiTjBCG
```


### 成员指针

与元数据指针和组指针类似，成员指针允许代币创建者指定一个描述代币的成员账户。该指针描述了代币作为一个组成员的配置。

当 Token-2022 程序的代币铸造拥有成员指针时，该代币被视为成员代币（例如属于某个收藏系列的 NFT）。

与元数据和组一样，成员指针可以指向代币本身，客户端必须检查代币和成员是否相互指向。

#### 示例: 铸造一个带有指向外部账户成员指针的代币

```
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --member-address CXWuFdWifFQSvMMZ3UxZZVKtjYi2bZt89f5v3yV8zdVE

Creating token 5anZzJbbj6rBkrXW7zzw7MH28xXufj7AB5oKX1Cv4fdh under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  5anZzJbbj6rBkrXW7zzw7MH28xXufj7AB5oKX1Cv4fdh
Decimals:  9

Signature: 3ug4Ejs16jJgEm1WyBwDDxzh9xqPzQ3a2cmy1hSYiPFcLQi9U12HYF1Dbhzb2bx75SSydfU6W4e11dGUXaPbJqVc
```

### 成员

成员扩展在使用 Token-2022 管理代币组中也扮演着关键角色。成员的配置，如组地址和成员编号等，可以直接存储在铸币本身中。

成员扩展与组扩展一样，直接与成员指针扩展协同工作。要在铸币中初始化成员配置，您必须在创建铸币时添加指向铸币本身的成员指针扩展。

工具会自动为您完成这些操作。

#### 示例: 铸造一个具有成员配置的代币

```
$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-member

Creating token 9uyqmf9Ued4yQKi4hXT5wMzPF5Nv1S6skAjkjxcCaAyV under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
To initialize group member configurations inside the mint, please run `spl-token initialize-member 9uyqmf9Ued4yQKi4hXT5wMzPF5Nv1S6skAjkjxcCaAyV`, and sign with the mint authority.

Address:  9uyqmf9Ued4yQKi4hXT5wMzPF5Nv1S6skAjkjxcCaAyV
Decimals:  9

Signature: 2BZH8KE7zVcBj7Mmnu6uCM9NT4ey7qHasZmEk6Bt3tyx1wKCXS3JtcgEvrXXEMFB5numQgA9wvR67o2Z4YQdEw7m

$ spl-token initialize-member 9uyqmf9Ued4yQKi4hXT5wMzPF5Nv1S6skAjkjxcCaAyV --update-authority 3pGiHDDek35npQuyWQ7FGcWxqJdHvVPDHDDmBFs2YxQj
Signature: 2H16XtBqdwSbvvq8g5o2jhy4TknP6zgt71KHawEdyPvNuvusQrV4dPccUrMqjFeNTbk75AtzmzUVueH3yWiTjBCG
```
