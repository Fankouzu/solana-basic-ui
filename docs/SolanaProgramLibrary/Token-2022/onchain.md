# On-chain Program Guide

## 在程序中同时支持 Token 和 Token-2022

本指南适用于希望同时支持 Token 和 Token-2022 的链上程序/去中心化应用（Dapp）开发者。

## 前置条件

本指南需要使用 Solana CLI 工具套件，最低版本为 1.10.33，以支持所有 Token-2022 功能。

## 动机

链上程序开发者通常习惯于在应用程序中只包含一个代币程序，用于所有代币。

随着 Token-2022 的加入，开发者必须更新链上程序。本指南将引导完成支持两者所需的步骤。

重要说明：如果不希望支持 Token-2022，无需进行任何操作。如果包含任何与 Token-2022 的代币铸造/账户相关的指令，现有的链上程序将会执行失败。

最有可能的是，当尝试创建一个 CPI 指令进入 Token 程序时，如果提供了 Token-2022 程序 ID，程序将因 `ProgramError::IncorrectProgramId` 而失败。

## 本指南的结构

为了安全地编写转账指令，本指南将遵循测试驱动开发的方法：

+ 添加对 `spl-token-2022` 的依赖
+ 更改测试以使用 `spl_token::id()` 或 `spl_token_2022::id()`，并查看所有测试是否因 Token-2022 而失败
+ 更新链上程序代码，始终使用来自 `spl_token_2022` 的指令和反序列化器，使所有测试通过

可选的，如果一条指令铸造超过一种代币，这在大多数 DeFi 中很常见，必须为每一个额外的代币铸造添加一个输入代币程序账户。由于有可能交换所有类型的代币，需要调用正确的 token 程序。

这里的所有内容都将引用 token-swap 程序的真实提交，因此开发者可以随时跟进并对程序进行更改。

## 第一部分：在单一代币使用场景中支持两种代币程序

### 步骤 1：更新依赖

在 `Cargo.toml` 文件中，添加最新版的 `spl-token-2022` 到 `dependencies`。在 [crates.io](https://crates.io/) 检查 `spl-token-2022` 的最新版本，因为通常跟随主网一同发布。

### 步骤 2：为 Token 和 Token-2022 添加测试用例

使用 `test-case` crate，可以更新所有测试以使用 Token 和 Token-2022。例如，定义一个测试如下：

```text
#[tokio::test]
async fn test_swap() {
    ...
}
```

```text
#[test_case(spl_token::id() ; "Token Program")]
#[test_case(spl_token_2022::id() ; "Token-2022 Program")]
#[tokio::test]
async fn test_swap(token_program_id: Pubkey) {
    ...
}
```
在测试程序中，必须确保将 `spl_token_2022.so` 放在正确的位置。可以在下载后，将其添加到 `tests/fixtures/` 目录中。

```console
$ solana program dump TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb spl_token_2022.so
```

如果在本地 `solana-test-validator` 测试环境中，可以替换为下列指令：

```console
$ solana-test-validator -c TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
```

**注意**：这个步骤是临时的，直到 Token-2022 默认包含在 `program-test` 和 `solana-test-validator` 中为止。

token-swap 不使用 `program-test`，所以会有更多的样板代码，但适用相同的原则。

### 步骤 3：替换指令生成器

代码中所有使用 `spl_token::instruction` 的地方现在必须使用 `spl_token_2022::instruction`。"Token-2022 Program" 的测试仍然会失败，但使用新的指令生成器，"Token Program" 的测试将会通过。

如果程序使用了未经检查的转账，将看到一个弃用警告：

```text
warning: use of deprecated function `spl_token_2022::instruction::transfer`: please use `transfer_checked` or `transfer_checked_with_fee` instead
```

如果一个代币有转账费用，未经检查的转账将会失败。后续会修正这个问题。如果愿意，在此期间，可以添加一个 `#[allow(deprecated)]` 来持续集成（CI），并附上一个 TODO 或者问题，以便在各处转换为 `transfer_checked`。


### 第四步：将 `spl_token::id()` 替换为一个参数

从第二步开始，通过添加 `token_program_id` 作为参数，启动了从固定程序标识符向灵活参数转换的过程。现在，可以在智能合约程序和测试中广泛地使用这个参数。

无论何时代码中出现 `spl_token::id()`，都应用与 `spl_token::id()` 或 `spl_token_2022::id()` 相对应的参数代替。

完成这些更改后，所有测试应该能够顺利通过！但别急，为了确保兼容性，还需要执行最后一个步骤。

### 第五步：在测试中添加扩展

尽管所有测试都已通过，但仍需考虑到 token-2022 中账户的差异。

账户扩展存储在账户的前165字节之后，如果账户的大小不是165字节和82字节， `Account::unpack` 和 `Mint::unpack` 将会失败。

通过向所有铸币和代币账户添加扩展来再次使测试失败。将向铸币账户添加 `MintCloseAuthority` 扩展，并向账户添加 `ImmutableOwner` 扩展。

在创建铸币账户时，先计算所需空间，然后分配，接着在 `initialize_mint` 之前加入 `initialize_mint_close_authority` 指令。例如：

```rust
use spl_token_2022::{extension::ExtensionType, instruction::*, state::Mint};
use solana_sdk::{system_instruction, transaction::Transaction};

// Calculate the space required using the `ExtensionType`
let space = ExtensionType::try_calculate_account_len::<Mint>(&[ExtensionType::MintCloseAuthority]).unwrap();

// get the Rent object and calculate the rent required
let rent_required = rent.minimum_balance(space);

// and then create the account using those parameters
let create_instruction = system_instruction::create_account(&payer.pubkey(), mint_pubkey, rent_required, space, token_program_id);

// Important: you must initialize the mint close authority *BEFORE* initializing the mint,
// and only when working with Token-2022, since the instruction is unsupported by Token.
let initialize_close_authority_instruction = initialize_mint_close_authority(token_program_id, mint_pubkey, Some(close_authority)).unwrap();
let initialize_mint_instruction = initialize_mint(token_program_id, mint_pubkey, mint_authority_pubkey, freeze_authority, 9).unwrap();

// Make the transaction with all of these instructions
let create_mint_transaction = Transaction::new(&[create_instruction, initialize_close_authority_instruction, initialize_mint_instruction], Some(&payer.pubkey));

// Sign it and send it however you want!
```


与代币账户的情况类似，但将使用 `ImmutableOwner` 扩展，两个程序都支持这一扩展，但 `Tokenkeg...` 将无操作执行。


```rust
use spl_token_2022::{extension::ExtensionType, instruction::*, state::Account};
use solana_sdk::{system_instruction, transaction::Transaction};

// Calculate the space required using the `ExtensionType`
let space = ExtensionType::try_calculate_account_len::<Account>(&[ExtensionType::ImmutableOwner]).unwrap();

// get the Rent object and calculate the rent required
let rent_required = rent.minimum_balance(space);

// and then create the account using those parameters
let create_instruction = system_instruction::create_account(&payer.pubkey(), account_pubkey, rent_required, space, token_program_id);

// Important: you must initialize immutable owner *BEFORE* initializing the account
let initialize_immutable_owner_instruction = initialize_immutable_owner(token_program_id, account_pubkey).unwrap();
let initialize_account_instruction = initialize_account(token_program_id, account_pubkey, mint_pubkey, owner_pubkey).unwrap();

// Make the transaction with all of these instructions
let create_account_transaction = Transaction::new(&[create_instruction, initialize_immutable_owner_instruction, initialize_account_instruction], Some(&payer.pubkey));

// Sign it and send it however you want!
```

在进行这些更改之后，一切会再次失败！

### 第六步：使用 `StateWithExtensions` 代替 `Mint` 和 `Account`

由于添加了扩展，程序试图反序列化 `Mint` 或 `Account`将导致失败。

Token-2022 添加了一种称为 `StateWithExtensions`的新类型，它允许反序列化基本类型，然后随时提取任何扩展。其成本与普通的 `unpack` 非常接近。

在代码中的任何地方，无论看到 `Mint::unpack` 或 `Account::unpack`，都将需要将其更改为：

```rust
use spl_token_2022::{extension::StateWithExtensions, state::{Account, Mint}};
let account_state = StateWithExtensions::<Account>::unpack(&token_account_info.data.borrow())?;
let mint_state = StateWithExtensions::<Mint>::unpack(&mint_account_info.data.borrow())?;
```
每当需要访问状态中的字段时，都需要通过 `base` 来进行。例如，要访问数量，必须这样做：

```rust
let token_amount = account_state.base.amount;
```
通常情况下，只需要在访问这些字段的地方添加 `.base`。

完成这些操作后，所有测试应该都能通过！现在程序与 Token-2022 兼容了！

不过，如果程序同时使用多种代币类型，那么还需要做更多的工作。

## 第二部分：支持混合代币程序：将 Token 代币交易为 Token-2022 代币

在第一部分中，探讨了在程序中支持 Token-2022 所需的最少工作量。然而，这些工作并不能涵盖所有情况。特别是在代币交换程序中，大多数指令涉及多种代币类型。如果这些代币类型来自不同的代币程序，那么当前的实现将会失败。

例如，如果想将来自 Token 程序的代币交换为来自 Token-2022 程序的代币，那么程序指令必须提供每个代币程序，以便程序可以调用它们。

以下是如何在同一指令中支持这两个代币程序的步骤。

### 第一步：更新所有指令接口

第一步是更新所有指令接口，使其能够接受程序中使用的每种代币类型的代币程序。

例如，这里是 `Swap` 指令的之前的定义：

```rust
///   Swap the tokens in the pool.
///
///   0. `[]` Token-swap
///   1. `[]` swap authority
///   2. `[]` user transfer authority
///   3. `[writable]` token_(A|B) SOURCE Account, amount is transferable by user transfer authority,
///   4. `[writable]` token_(A|B) Base Account to swap INTO.  Must be the SOURCE token.
///   5. `[writable]` token_(A|B) Base Account to swap FROM.  Must be the DESTINATION token.
///   6. `[writable]` token_(A|B) DESTINATION Account assigned to USER as the owner.
///   7. `[writable]` Pool token mint, to generate trading fees
///   8. `[writable]` Fee account, to receive trading fees
///   9. `[]` Token program id
///   10. `[optional, writable]` Host fee account to receive additional trading fees
Swap {
    pub amount_in: u64,
    pub minimum_amount_out: u64
}
```

`Swap` 包含三种不同的代币类型：代币 A，代币 B 和池代币。为每种代币添加一个单独的代币程序，将指令转换为：

```rust
///   Swap the tokens in the pool.
///
///   0. `[]` Token-swap
///   1. `[]` swap authority
///   2. `[]` user transfer authority
///   3. `[writable]` token_(A|B) SOURCE Account, amount is transferable by user transfer authority,
///   4. `[writable]` token_(A|B) Base Account to swap INTO.  Must be the SOURCE token.
///   5. `[writable]` token_(A|B) Base Account to swap FROM.  Must be the DESTINATION token.
///   6. `[writable]` token_(A|B) DESTINATION Account assigned to USER as the owner.
///   7. `[writable]` Pool token mint, to generate trading fees
///   8. `[writable]` Fee account, to receive trading fees
///   9. `[]` Token (A|B) SOURCE program id
///   10. `[]` Token (A|B) DESTINATION program id
///   11. `[]` Pool Token program id
///   12. `[optional, writable]` Host fee account to receive additional trading fees
Swap {
    pub amount_in: u64,
    pub minimum_amount_out: u64
}
```

请注意新输入的 `9.` 和 `10.` 以及对 `11` 的澄清。

这些额外的账户可能会让让人产生疑问：随着这些新账户的加入，交易的大小会有多大？如果同时使用 Token 和 Token-2022，额外的 Token-2022 程序将占用交易中的空间，公钥需要 32 字节，其索引需要 1 字节。

另一方面，由于 Solana 交易格式中的账户去重，如果一次只使用一个代币程序，将只产生 1 字节的开销。

还请注意，有些指令将保持不变。例如，这里是 `Initialize` 指令：

```rust
///   Initializes a new swap
///
///   0. `[writable, signer]` New Token-swap to create.
///   1. `[]` swap authority derived from `create_program_address(&[Token-swap account])`
///   2. `[]` token_a Account. Must be non zero, owned by swap authority.
///   3. `[]` token_b Account. Must be non zero, owned by swap authority.
///   4. `[writable]` Pool Token Mint. Must be empty, owned by swap authority.
///   5. `[]` Pool Token Account to deposit trading and withdraw fees.
///   Must be empty, not owned by swap authority
///   6. `[writable]` Pool Token Account to deposit the initial pool token
///   supply.  Must be empty, not owned by swap authority.
///   7. `[]` Token program id
Initialize { ... } // details omitted
```

尽管传入了代币 A 和代币 B 的账户，但实际上不需要调用它们各自的代币程序。但因为需要铸造新的池代币，必须传入池代币铸造所需的代币程序。

这一步主要是接口更新的繁琐工作。如果在这一步之后有些测试失败了，不用担心，将在下一步中修复它们。

### 第二步：更新指令处理器

如果指令处理器在添加了代币程序后期望获得账户，可能会看到一些测试失败。

具体来说，在代币交换示例中，`Swap` 指令期望在末尾有一个可选账户，这个账户已经被新增的代币程序覆盖了。

在这一步中，将提取所有新提供的账户。例如，在 `Swap` 指令处理器中，我们将从：

```rust
let account_info_iter = &mut accounts.iter();
let swap_info = next_account_info(account_info_iter)?;
let authority_info = next_account_info(account_info_iter)?;
let user_transfer_authority_info = next_account_info(account_info_iter)?;
let source_info = next_account_info(account_info_iter)?;
let swap_source_info = next_account_info(account_info_iter)?;
let swap_destination_info = next_account_info(account_info_iter)?;
let destination_info = next_account_info(account_info_iter)?;
let pool_mint_info = next_account_info(account_info_iter)?;
let pool_fee_account_info = next_account_info(account_info_iter)?;
let token_program_info = next_account_info(account_info_iter)?;
```

变换为:

```rust
let account_info_iter = &mut accounts.iter();
let swap_info = next_account_info(account_info_iter)?;
let authority_info = next_account_info(account_info_iter)?;
let user_transfer_authority_info = next_account_info(account_info_iter)?;
let source_info = next_account_info(account_info_iter)?;
let swap_source_info = next_account_info(account_info_iter)?;
let swap_destination_info = next_account_info(account_info_iter)?;
let destination_info = next_account_info(account_info_iter)?;
let pool_mint_info = next_account_info(account_info_iter)?;
let pool_fee_account_info = next_account_info(account_info_iter)?;
let source_token_program_info = next_account_info(account_info_iter)?; // added
let destination_token_program_info = next_account_info(account_info_iter)?; // added
let pool_token_program_info = next_account_info(account_info_iter)?; // renamed
```

目前，只需使用其中一个即可。例如，将在所有地方使用 `pool_token_program_info`。在下一步中，将添加一些测试，由于总是使用相同的代币程序，这些测试将如预期地失败。

再次强调，所有测试应该都能通过！但这种情况不会持续太久。

### 第3步：同时使用多个代币程序编写测试

遵循测试驱动开发的原则，首先编写一些将失败的测试。

之前定义的 `test_case` 仅提供了一个程序ID。现在是时候混合使用，并增加更多案例。为了全面覆盖，可以做所有不同程序的排列组合，但先从以下几种情况开始：

+   所有的代币都属于 Token
+   所有的代币都属于 Token-2022
+   池代币属于 Token，但是代币 A 和 B 属于 Token-2022
+   池代币属于 Token-2022，但是代币 A 和 B 是混合的

更新测试用例，传入三个不同的程序ID，然后在测试中使用它们。例如，转换如下：

```rust
#[test_case(spl_token::id(); "token")]
#[test_case(spl_token_2022::id(); "token-2022")]
fn test_initialize(token_program_id: Pubkey) {
```

变换为:

```rust
#[test_case(spl_token::id(), spl_token::id(), spl_token::id(); "all-token")]
#[test_case(spl_token_2022::id(), spl_token_2022::id(), spl_token_2022::id(); "all-token-2022")]
#[test_case(spl_token::id(), spl_token_2022::id(), spl_token_2022::id(); "mixed-pool-token")]
#[test_case(spl_token_2022::id(), spl_token_2022::id(), spl_token::id(); "mixed-pool-token-2022")]
fn test_initialize(pool_token_program_id: Pubkey, token_a_program_id: Pubkey, token_b_program_id: Pubkey) {
    ...
}
```
这一步也可能涉及到频繁的修改，但请花时间仔细处理，会得到 `mixed-pool-token` 和 `mixed-pool-token-2022` 测试案例的失败测试。


### 第4步：在处理器中使用适当的代币程序

现在修复失败的测试！错误发生的原因是，试图在“混合”Token和Token-2022环境中使用错误程序操作代币。

需要正确使用在第2步中提取的所有 `pool_token_program_info` / `token_a_program_info` 变量。

在代币交换示例中，检查所有默认填充 `pool_token_program_info` 的地方，并改为正确的程序信息。例如，在 `process_swap` 中转移代币时，当前有：

```rust
Self::token_transfer(
    swap_info.key,
    pool_token_program_info.clone(),
    source_info.clone(),
    swap_source_info.clone(),
    user_transfer_authority_info.clone(),
    token_swap.bump_seed(),
    to_u64(result.source_amount_swapped)?,
)?;
```
使用正确的代币程序，如下：

```rust
Self::token_transfer(
    swap_info.key,
    source_token_program_info.clone(),
    source_info.clone(),
    swap_source_info.clone(),
    user_transfer_authority_info.clone(),
    token_swap.bump_seed(),
    to_u64(result.source_amount_swapped)?,
)?;
```

在进行此操作时，如果注意到以下形式的代币账户或铸币的所有者检查：

```rust
if token_account_info.owner != &spl_token::id() { ... }
```

需要从 `spl_token_2022` 更新到一个新的所有者检查：

```rust
if spl_token_2022::check_spl_token_program_account(token_account_info.owner).is_err() { ... }
```

在这一步中，由于代币交换中的所有测试案例，还必须更新由于所有者代币程序不匹配而导致的预期错误。

这很繁琐，但到目前为止，我们已经更新了程序，使其能同时使用 Token 和 Token-2022。

## 第三部分：支持所有扩展

目前看起来程序运行得很完美，处理 Token-2022 铸币时不会有任何问题。

不幸的是，为了在代币交换中实现完全兼容，还需要做一些工作。由于程序使用的是 `transfer` 而不是 `transfer_checked`，对于某些铸币操作它将失败。

如果想要支持 Token-2022 中的所有扩展，必须升级到使用 `transfer_checked`。像往常一样，先从失败测试开始。

### 第1步：向 Token-2022 测试中添加转账费用扩展

Token-2022 测试初始化了 `MintCloseAuthority` 扩展。让我们在铸币中添加 `TransferFeeConfig` 扩展，并在代币账户中添加 `TransferFeeAmount` 扩展。

替换：

```rust
let mint_space = ExtensionType::try_calculate_account_len::<Mint>(&[ExtensionType::MintCloseAuthority]).unwrap();
let account_space = ExtensionType::try_calculate_account_len::<Account>(&[ExtensionType::ImmutableOwner]).unwrap();
```

替换为:

```rust
let mint_space = ExtensionType::try_calculate_account_len::<Mint>(&[ExtensionType::MintCloseAuthority, ExtensionType::TransferFeeConfig]).unwrap();
let account_space = ExtensionType::try_calculate_account_len::<Account>(&[ExtensionType::ImmutableOwner, ExtensionType::TransferFeeAmount]).unwrap();
```
在初始化铸币时，我们将在初始化交易中添加指令以初始化转账费配置：

```rust
let rate_authority = Keypair::new();
let withdraw_authority = Keypair::new();

let instruction = spl_token_2022::extension::transfer_fee::instruction::initialize_transfer_fee_config(
    program_id, &mint_key, rate_authority.pubkey(), withdraw_authority.pubkey(), 0, 0
).unwrap();
```

通过这一步，一些 Token-2022 测试会出现以下失败：“Mint required for this account to transfer tokens, use `transfer_checked` or `transfer_checked_with_fee`”。

### 第2步：在使用 `transfer` 的指令中添加铸币

`transfer` 和 `transfer_checked` 之间的最大区别是代币是否已铸造。首先，我们必须为使用 `transfer` 的每一个指令提供铸币账户。

例如，swap 指令变为：

```rust
///   Swap the tokens in the pool.
///
///   0. `[]` Token-swap
///   1. `[]` swap authority
///   2. `[]` user transfer authority
///   3. `[writable]` token_(A|B) SOURCE Account, amount is transferable by user transfer authority,
///   4. `[writable]` token_(A|B) Base Account to swap INTO.  Must be the SOURCE token.
///   5. `[writable]` token_(A|B) Base Account to swap FROM.  Must be the DESTINATION token.
///   6. `[writable]` token_(A|B) DESTINATION Account assigned to USER as the owner.
///   7. `[writable]` Pool token mint, to generate trading fees
///   8. `[writable]` Fee account, to receive trading fees
///   9. `[]` Token (A|B) SOURCE mint
///   10. `[]` Token (A|B) DESTINATION mint
///   11. `[]` Token (A|B) SOURCE program id
///   12. `[]` Token (A|B) DESTINATION program id
///   13. `[]` Pool Token program id
///   14. `[optional, writable]` Host fee account to receive additional trading fees
Swap(...),
```

请注意添加的 `Token (A|B) SOURCE mint` 和 `Token (A|B) DESTINATION mint`。池代币的铸币已经包含在内，所以这里是安全的。

接下来，在处理器代码中，将提取这些额外的账户，但尚未使用它们。

对于swap，变为：

```rust
let account_info_iter = &mut accounts.iter();
let swap_info = next_account_info(account_info_iter)?;
let authority_info = next_account_info(account_info_iter)?;
let user_transfer_authority_info = next_account_info(account_info_iter)?;
let source_info = next_account_info(account_info_iter)?;
let swap_source_info = next_account_info(account_info_iter)?;
let swap_destination_info = next_account_info(account_info_iter)?;
let destination_info = next_account_info(account_info_iter)?;
let pool_mint_info = next_account_info(account_info_iter)?;
let pool_fee_account_info = next_account_info(account_info_iter)?;
let source_token_mint_info = next_account_info(account_info_iter)?;
let destination_token_mint_info = next_account_info(account_info_iter)?;
let source_token_program_info = next_account_info(account_info_iter)?;
let destination_token_program_info = next_account_info(account_info_iter)?;
let pool_token_program_info = next_account_info(account_info_iter)?;
```

请注意添加的 `source_token_mint_info` 和 `destination_token_mint_info`。

将检查所有使用 `transfer` 的指令，对于代币交换来说，包括 `swap`、`deposit_all_token_types`、`withdraw_all_token_types`、`deposit_single_token_type_exact_amount_in` 和 `withdraw_single_token_type_exact_amount_out`。

完成这些后，一些 Token-2022 的测试仍然会失败，但是 Token 的测试都通过了。

### 第3步：将 `transfer` 指令更改为 `transfer_checked` 指令

一切都已就绪，可以使用 `transfer_checked` 了，所以下一步将非常简单，并使所有测试都通过。

在使用 `spl_token_2022::instruction::transfer` 的地方，改为使用 `spl_token_2022::instruction::transfer_checked`，同时提供铸币账户信息和小数位数。

例如：

```rust
let decimals = StateWithExtensions::<Mint>::unpack(&mint.data.borrow()).map(|m| m.base)?.decimals;
let ix = spl_token_2022::instruction::transfer_checked(
  token_program.key,
  source.key,
  mint.key,
  destination.key,
  authority.key,
  &[],
  amount,
  decimals,
)?;
invoke(
  &ix,
  &[source, mint, destination, authority, token_program],
)
```

完成这一步后，所有测试会再次通过！

## 第四部分：支持转账费用计算

为支持 Token-2022 中的每一个可能的扩展，我们发现 token-swap 在某些扩展上表现出一些奇怪的行为。

在 token-swap 中，如果一个代币有转账费用，那么曲线计算将不正确。例如，如果尝试用代币 A 兑换代币 B，而代币 A 有 1% 的转账费用，那么到达池中的代币将会减少，这意味着您应该收到更少的代币。

下列示例将添加逻辑来正确处理 token-swap 中的转账费用扩展。

### 第1步：添加一个有转账费用的失败交换测试

从添加一个交换具有非零转账费用代币的失败测试开始。

对于 token-swap，可以复用之前的测试，该测试检查曲线计算是否与实际交易一致。最重要的部分是在初始化铸币时添加转账费用：

```rust
let rate_authority = Keypair::new();
let withdraw_authority = Keypair::new();

let instruction = spl_token_2022::extension::transfer_fee::instruction::initialize_transfer_fee_config(
    program_id, &mint_key, rate_authority.pubkey(), withdraw_authority.pubkey(), 0, 0
).unwrap();
```

替换为:

```rust
let rate_authority = Keypair::new();
let withdraw_authority = Keypair::new();
let transfer_fee_basis_points = 100;
let maximum_transfer_fee = 1_000_000_000;

let instruction = spl_token_2022::extension::transfer_fee::instruction::initialize_transfer_fee_config(
    program_id, &mint_key, rate_authority.pubkey(), withdraw_authority.pubkey(), 
    transfer_fee_basis_points, maximum_transfer_fee
).unwrap();
```

### 第2步：计算预期的转账费用

每当程序转移代币时，需要检查铸币是否包含转账费用并相应地处理。

要检查铸币是否有扩展，只需要获取所需类型的扩展，并正确处理有效的错误情况。

要更改交易的金额：

```rust
use solana_program::{clock::Clock, sysvar::Sysvar};
use spl_token_2022::{extension::{StateWithExtensions, transfer_fee::TransferFeeConfig}, state::Mint};

let mint_data = token_mint_info.data.borrow();
let mint = StateWithExtensions::<Mint>::unpack(&mint_data)?;
let actual_amount = if let Ok(transfer_fee_config) = mint.get_extension::<TransferFeeConfig>() {
    let fee = transfer_fee_config
        .calculate_epoch_fee(Clock::get()?.epoch, amount)
        .ok_or(ProgramError::InvalidArgument)?;
    amount.saturating_sub(fee)
} else {
    amount
};
```
在进行这些更改后，测试将会再次通过！

**注意**：在 token-swap 的情况下，需要反向计算费用，这增加了额外的复杂性。但大多数情况下，程序不需要这样做。

## 第五部分：禁用可关闭的代币铸造

在 Token-2022 中，如果某些代币铸造的供应量为0，它们是可以被关闭的。通常情况下，因为所有的代币账户都是空的，代币是可关闭的，这不会造成任何损害。

然而，如果程序存储了关于铸造代币的任何信息，代币铸造被关闭并在同一地址上重新创建，信息可能会不同步。更糟的是，该账户可能被用于完全不同的事情。如果程序正在存储铸造代币的信息，请找到一种方法重新设计解决方案，使其始终能直接使用铸造代币的信息。

在 token-swap 中，程序很好地处理了关闭的铸造代币，但如果池铸币被关闭，一个空的池可能会变得无法使用。由于池子本来就是空的，所以没有资金风险，但为了本教程的目的，禁止池铸币被关闭。

向池铸币添加一个关闭权限。在初始化期间执行：

```rust
use spl_token_2022::{extension::ExtensionType, instruction::*, state::Mint};
use solana_sdk::{system_instruction, transaction::Transaction};

// Calculate the space required using the `ExtensionType`
let space = ExtensionType::try_calculate_account_len::<Mint>(&[ExtensionType::MintCloseAuthority]).unwrap();

// get the Rent object and calculate the rent required
let rent_required = rent.minimum_balance(space);

// and then create the account using those parameters
let create_instruction = system_instruction::create_account(&payer.pubkey(), mint_pubkey, rent_required, space, token_program_id);

// Important: you must initialize the mint close authority *BEFORE* initializing the mint,
// and only when working with Token-2022, since the instruction is unsupported by Token.
let initialize_close_authority_instruction = initialize_mint_close_authority(token_program_id, mint_pubkey, Some(close_authority)).unwrap();
let initialize_mint_instruction = initialize_mint(token_program_id, mint_pubkey, mint_authority_pubkey, freeze_authority, 9).unwrap();

// Make the transaction with all of these instructions
let create_mint_transaction = Transaction::new(&[create_instruction, initialize_close_authority_instruction, initialize_mint_instruction], Some(&payer.pubkey));
```

然后尝试像平常一样初始化 token swap 池，并检查是否失败。由于没有逻辑禁止关闭权限，它会失败。

### 第2步：添加处理器检查以禁用铸币关闭权限

在处理初始化代码时，添加一个检查，看看是否存在非 `None` 的铸币关闭权限。

例如：

```rust
let pool_mint_data = pool_mint_info.data.borrow();
let pool_mint = StateWithExtensions::<Mint>::unpack(pool_mint_data)?;
if let Ok(extension) = pool_mint.get_extension::<MintCloseAuthority>() {
    let close_authority: Option<Pubkey> = extension.close_authority.into();
    if close_authority.is_some() {
        return Err(ProgramError::InvalidAccountData);
    }
}
```

现在测试可以通过！