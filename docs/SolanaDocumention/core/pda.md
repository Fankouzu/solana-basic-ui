# 程序派生地址 (PDA)

程序派生地址 （PDA） 为Solana上的开发人员提供了两个主要用例：

- **确定性帐户地址**: PDA 提供了一种机制，使用可选的“种子”（预定义输入）和特定程序 ID 的组合来确定派生地址。

- **启用程序签名**: Solana 运行时使程序能够“签名”从其程序ID派生的PDA。

你可以将PDA视为一种从预定义的输入集（例如字符串、数字和其他账户地址）在链上创建类似Hashmap哈希映射结构的方法。

这种方法的好处是它消除了跟踪确切地址的需要。相反，你只需要调用用于其派生的特定输入。

![Program Derived Address](https://solana-developer-content.vercel.app/assets/docs/core/pda/pda.svg)

重要的是要明白，简单地派生一个程序派生地址 （PDA） 并不会自动在该地址创建一个链上账户。
以 PDA 作为链上地址的账户必须通过用于派生地址的程序显式创建。
你可以将派生 PDA 视为在地图上查找地址。仅仅有一个地址并不意味着在那个位置构建任何内容。

::: tip INFO
本节将介绍派生PDA的详细信息。 有关程序如何使用PDA进行签名的详细信息将在[跨程序调用(CPIs)](https://solana.com/docs/core/cpi)一节中讨论， 因为它需要这两个概念的上下文。
:::

## 要点

- PDA是使用用户定义的种子、增量种子和程序的ID的组合确定性派生的地址。

- PDA是在Ed25519曲线之外生成的并且没有对应私钥的地址。

- Solana程序可以通过编程方式“签名”使用其程序ID派生的PDA。

- 派生PDA不会自动创建链上账户。

- 使用 PDA 作为其地址的帐户必须通过 Solana 程序中的专用指令显示创建。

## 什么是PDA

PDA是确定派生的地址，看起来像标准公钥，但没有关联的私钥。
这意味着任何外部用户都无法为该地址生成有效的签名。
但是，Solana 运行时使程序能够以编程方式“签名”PDA，而无需私钥。

就上下文而言，
Solana[密钥对](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/src/signer/keypair.rs#L25)
是 Ed25519 曲线（椭圆曲线加密）上的点，具有公钥和相应的私钥。
我们经常使用公钥作为新链上账户的唯一ID和用于签名的私钥。

![曲线上的地址](https://solana-developer-content.vercel.app/assets/docs/core/pda/address-on-curve.svg)

PDA是使用一组预定义的输入有意派生的点，这些点在Ed25519曲线外。
不在Ed25519曲线上的点没有有效的相应私钥，不能用于加密操作（签名）。

然后，PDA 可以用作链上账户的地址（唯一标识符），提供了一种轻松存储、映射和获取程序状态的方法。

![曲线外地址](https://solana-developer-content.vercel.app/assets/docs/core/pda/address-off-curve.svg)

## 如何派生 PDA

PDA的推导需要3个输入。

- **可选种子(Optional seeds)**:用于派生 PDA 的预定义输入（例如字符串、数字、其他帐户地址）。这些输入将转换为字节缓冲区。
- **增量种子(Bump seed)**: 用于保证生成有效 PDA（偏离曲线）的附加输入（值介于 255-0 之间）。在生成PDA以将点从Ed25519曲线上“凸起”时，此增量种子（从255开始）将附加到可选种子中。增量种子有时被称为“随机数”。
- **程序ID(Program ID)**: 程序的地址，PDA由它派生。这也是可以代表PDA“签名”的程序。

![PDA推导](https://solana-developer-content.vercel.app/assets/docs/core/pda/pda-derivation.svg)

以下示例包括指向 Solana Playground 的链接，您可以在其中在浏览器内编辑器中运行示例。

### 查找程序地址
要推导 PDA，我们可以使用 
[`findProgramAddressSync`](https://github.com/solana-labs/solana-web3.js/blob/ca9da583a39cdf8fd874a2e03fccdc849e29de34/packages/library-legacy/src/publickey.ts#L212)
的方法。 
[`@solana/web3.js`](https://www.npmjs.com/package/@solana/web3.js)
在其他编程语言（例如
[Rust](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/pubkey.rs#L484)), 
中也有此函数的等效项，但在本节中，我们将介绍使用 Javascript 的示例。

使用该 `findProgramAddressSync`方法时，我们传入：

- 预定义的可选种子(Optional seeds)转换为字节缓冲区，以及

- 用于派生PDA的程序ID(Optional seeds)（地址）

找到有效的PDA后，`findProgramAddressSync` 返回派生PDA的地址（PDA）和增量种子(Bump seed)。

下面的示例派生了一个 PDA，但不提供任何可选种子。

```ts /[]/
import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("11111111111111111111111111111111");

const [PDA, bump] = PublicKey.findProgramAddressSync([], programId);

console.log(`PDA: ${PDA}`);
console.log(`Bump: ${bump}`);
```

你可以在
[Solana Playground](https://beta.solpg.io/66031e5acffcf4b13384cfef)
上运行此示例。PDA和增量种子(Bump seed)输出将始终相同：

```
PDA: Cu7NwqCXSmsR5vgGA3Vw9uYVViPi3kQvkbKByVQ8nPY9
Bump: 255
```

下面的下一个示例添加了一个可选的种子“helloWorld”。

```ts /string/
import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("11111111111111111111111111111111");
const string = "helloWorld";

const [PDA, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from(string)],
  programId,
);

console.log(`PDA: ${PDA}`);
console.log(`Bump: ${bump}`);
```

你也可以在
[Solana Playground](https://beta.solpg.io/66031ee5cffcf4b13384cff0)
上运行此示例。PDA和增量种子(Bump seed)输出将始终相同：

```
PDA: 46GZzzetjCURsdFPb7rcnspbEMnCBXe9kpjrsZAkKb6X
Bump: 254
```

请注意，增量种子(Bump seed)是254。这意味着255推导出了Ed25519曲线上的一个点，并且不是有效的PDA。

返回 `findProgramAddressSync`
的增量种子(Bump seed)是派生有效 PDA 的可选种子(Optional seeds)和程序ID(Program ID)
的给定组合的第一个值（介于 255-0 之间）。

::: tip INFO
第一个有效的增量种子(Bump seed)种子称为“规范bump”(canonical bump)。为了程序安全，建议在使用PDA时仅使用规范bump。
:::

### CreateProgramAddress

在底层，`findProgramAddressSync` 将迭代地将一个额外的增量种子(Bump seed)（随机数）
附加到种子缓冲区并调用该 `createProgramAddressSync` 方法。
增量种子(Bump seed)从值 255 开始，递减 1，直到找到有效的 PDA（不在曲线上）。

你可以通过使用 `createProgramAddressSync` 
显式传入增量种子(Bump seed) 254 来复制前面的示例。

```ts /bump/
import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("11111111111111111111111111111111");
const string = "helloWorld";
const bump = 254;

const PDA = PublicKey.createProgramAddressSync(
  [Buffer.from(string), Buffer.from([bump])],
  programId,
);

console.log(`PDA: ${PDA}`);
```

在[Solana Playground](https://beta.solpg.io/66031f8ecffcf4b13384cff1).
上运行上面的这个例子。
给定相同的种子和程序 ID，PDA 输出将与前一个输出匹配：
```
PDA: 46GZzzetjCURsdFPb7rcnspbEMnCBXe9kpjrsZAkKb6X
```

### 规范Bump(canonical bump)

“规范Bump”(canonical bump)是指派生有效 PDA 的第一个增量种子(Bump seed)（从 255 开始并递减 1）。
为了程序安全，建议仅使用派生自规范seed的 PDA。

以下示例以前面的示例为参考，
尝试使用 255-0 中的每个增量种子来推导 PDA。

```ts
import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("11111111111111111111111111111111");
const string = "helloWorld";

// Loop through all bump seeds for demonstration
for (let bump = 255; bump >= 0; bump--) {
  try {
    const PDA = PublicKey.createProgramAddressSync(
      [Buffer.from(string), Buffer.from([bump])],
      programId,
    );
    console.log("bump " + bump + ": " + PDA);
  } catch (error) {
    console.log("bump " + bump + ": " + error);
  }
}
```

在[Solana Playground](https://beta.solpg.io/66032009cffcf4b13384cff2) 上运行该示例，您应该会看到以下输出：

```
bump 255: Error: Invalid seeds, address must fall off the curve
bump 254: 46GZzzetjCURsdFPb7rcnspbEMnCBXe9kpjrsZAkKb6X
bump 253: GBNWBGxKmdcd7JrMnBdZke9Fumj9sir4rpbruwEGmR4y
bump 252: THfBMgduMonjaNsCisKa7Qz2cBoG1VCUYHyso7UXYHH
bump 251: EuRrNqJAofo7y3Jy6MGvF7eZAYegqYTwH2dnLCwDDGdP
bump 250: Error: Invalid seeds, address must fall off the curve
...
// 剩余 bump 输出
```

正如预期的那样，增量种子（Bump seed）255抛出错误，
并且第一个推导有效 PDA 的增量种子Bump seed）是 254。

但是，请注意，增量种子 253-251 都派生了具有不同地址的有效PDA。
这意味着，给定相同的可选种子（ optional seeds ）和 `programId`，
具有不同值的增量种子仍然可以派生有效的 PDA。


::: danger WARNING
在构建 Solana 程序时，建议包括安全检查，以验证传递给程序的 PDA 是否使用规范Bump派生。如果不这样做，可能会引入漏洞，从而允许向程序提供非预期帐户。
:::

## 创建PDA帐户

[Solana Playground](https://beta.solpg.io/github.com/ZYJLiu/doc-examples/tree/main/pda-account)
上的这个示例程序演示了如何使用 PDA 作为新帐户的地址创建帐户。
示例程序是使用 Anchor 框架编写的。

在 `lib.rs` 文件中，您将找到以下程序，其中包括使用PDA作为帐户地址创建新帐户的单个指令。
新帐户存储用户地址和用于派生PDA的增量种子（`bump seed`）。

```rust filename="lib.rs" {11-14,26-29}
use anchor_lang::prelude::*;

declare_id!("75GJVCJNhaukaa2vCCqhreY31gaphv7XTScBChmr1ueR");

#[program]
pub mod pda_account {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let account_data = &mut ctx.accounts.pda_account;
        // store the address of the `user`
        account_data.user = *ctx.accounts.user.key;
        // store the canonical bump
        account_data.bump = ctx.bumps.pda_account;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        // set the seeds to derive the PDA
        seeds = [b"data", user.key().as_ref()],
        // use the canonical bump
        bump,
        payer = user,
        space = 8 + DataAccount::INIT_SPACE
    )]
    pub pda_account: Account<'info, DataAccount>,
    pub system_program: Program<'info, System>,
}

#[account]

#[derive(InitSpace)]
pub struct DataAccount {
    pub user: Pubkey,
    pub bump: u8,
}
```

用于派生 PDA 的种子包括硬编码字符串 `data` 和指令中提供的 `user` 帐户地址。
Anchor 框架会自动派生规范增量种子 （`Bump seed`） 。

```rust /data/ /user.key()/ /bump/
#[account(
    init,
    seeds = [b"data", user.key().as_ref()],
    bump,
    payer = user,
    space = 8 + DataAccount::INIT_SPACE
)]
pub pda_account: Account<'info, DataAccount>,
```

从 `init` 约束可以看出 Anchor 调用系统程序以使用 PDA 作为地址创建新帐户。
在底层，这是通过 [CPI](https://solana.com/docs/core/cpi) 
完成的。


```rust /init/
#[account(
    init,
    seeds = [b"data", user.key().as_ref()],
    bump,
    payer = user,
    space = 8 + DataAccount::INIT_SPACE
)]
pub pda_account: Account<'info, DataAccount>,
```

在上面提供的 Solana Playground 链接中的测试文件
（ `pda-account.test.ts` ） 中，您将找到等效的 Javascript 来派生 PDA。

```ts /data/ /user.publicKey/
const [PDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("data"), user.publicKey.toBuffer()],
  program.programId,
);
```

然后发送交易以调用 `initialize` 指令以使用 PDA 作为地址创建新的链上账户。
发送交易后，PDA将用于获取链上帐户。

```ts /initialize()/ /PDA/  {14}
it("Is initialized!", async () => {
  const transactionSignature = await program.methods
    .initialize()
    .accounts({
      user: user.publicKey,
      pdaAccount: PDA,
    })
    .rpc();

  console.log("Transaction Signature:", transactionSignature);
});

it("Fetch Account", async () => {
  const pdaAccount = await program.account.dataAccount.fetch(PDA);
  console.log(JSON.stringify(pdaAccount, null, 2));
});
```

请注意，如果你使用相同的 `user` 地址作为种子多次调用该 `initialize` 指令，
那么交易将失败。这是因为派生地址上已经存在一个帐户。
