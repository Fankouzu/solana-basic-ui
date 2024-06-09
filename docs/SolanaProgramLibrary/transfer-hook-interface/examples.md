# 示例

更多的示例可以在[Transfer Hook 示例测试](https://github.com/solana-labs/solana-program-library/blob/master/token/transfer-hook/example/tests/functional.rs)以及[TLV 账户解析测试](https://github.com/solana-labs/solana-program-library/blob/master/libraries/tlv-account-resolution/src/state.rs)中找到。

## 链上初始化额外账户元数据

`ExtraAccountMetaList`结构体设计用于实现与额外账户配置工作的高度集成。具体定义可参见[solana-program-library](https://github.com/solana-labs/solana-program-library/blob/65a92e6e0a4346920582d9b3893cacafd85bb017/libraries/tlv-account-resolution/src/state.rs#L167)

使用 `ExtraAccountMetaList::init<T>(..)` 方法，你可以通过提供缓冲区的可变引用和 `ExtraAccountMeta` 配置的切片，来初始化一个包含序列化后的 `ExtraAccountMeta` 配置的缓冲区。其中泛型 `T` 表示额外账户配置应归属的指令的识别符。在我们的场景中，这将是来自转账钩子接口的 [`spl_transfer_hook_interface::instruction::ExecuteInstruction`](https://github.com/solana-labs/solana-program-library/blob/eb32c5e72c6d917e732bded9863db7657b23e428/token/transfer-hook/interface/src/instruction.rs#L68) 指令。

> 请注意，SPL 转账钩子接口中所有的指令都实现了一个特定的
> trait
> [`SplDiscriminate`](https://github.com/solana-labs/solana-program-library/blob/65a92e6e0a4346920582d9b3893cacafd85bb017/libraries/discriminator/src/discriminator.rs#L9),
> 它提供了一个恒定的 8 字节鉴别器，可用于创建 TLV 数据条目。

```rust
pub fn process_initialize_extra_account_meta_list(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    extra_account_metas: &[ExtraAccountMeta],
) -> ProgramResult {
  let account_info_iter = &mut accounts.iter();

  let validation_info = next_account_info(account_info_iter)?;
  let mint_info = next_account_info(account_info_iter)?;
  let authority_info = next_account_info(account_info_iter)?;
  let _system_program_info = next_account_info(account_info_iter)?;

  // Check validation account
  let (expected_validation_address, bump_seed) =
      get_extra_account_metas_address_and_bump_seed(mint_info.key, program_id);
  if expected_validation_address != *validation_info.key {
      return Err(ProgramError::InvalidSeeds);
  }

  // Create the account
  let bump_seed = [bump_seed];
  let signer_seeds = collect_extra_account_metas_signer_seeds(mint_info.key, &bump_seed);
  let length = extra_account_metas.len();
  let account_size = ExtraAccountMetaList::size_of(length)?;
  invoke_signed(
      &system_instruction::allocate(validation_info.key, account_size as u64),
      &[validation_info.clone()],
      &[&signer_seeds],
  )?;
  invoke_signed(
      &system_instruction::assign(validation_info.key, program_id),
      &[validation_info.clone()],
      &[&signer_seeds],
  )?;

  // Write the data
  let mut data = validation_info.try_borrow_mut_data()?;
  ExtraAccountMetaList::init::<ExecuteInstruction>(&mut data, extra_account_metas)?;

  Ok(())
}
```

在可变帐户数据上调用 `ExtraAccountMetaList::init::<ExecuteInstruction>(..)` 后，该帐户现在存储了`Execute`指令的所有序列化额外帐户配置！

## 解析链下额外账户元数据

在构建包含指令的交易时，无论该指令是直接用于你的转账钩子程序，还是用于将通过CPI（Cross-Program Invocation）调用你的转账钩子程序的另一个程序，你必须包含所有必需的账户——包括额外账户。

以下是一个示例，展示了转账钩子接口[离线辅助函数](https://github.com/solana-labs/solana-program-library/blob/65a92e6e0a4346920582d9b3893cacafd85bb017/token/transfer-hook/interface/src/offchain.rs#L50)中所含逻辑。

```rust
// You'll need to provide an "account data function", which is a function that
// can, given a `Pubkey`, return account data within an `AccountDataResult`.
// This is most likely based off of an RPC call like `getAccountInfo`.

// Load the validation state data
let validate_state_pubkey = get_extra_account_metas_address(mint_pubkey, program_id);
let validate_state_data = fetch_account_data_fn(validate_state_pubkey)
    .await?
    .ok_or(ProgramError::InvalidAccountData)?;


// First create an `ExecuteInstruction`
let mut execute_instruction = execute(
    program_id,
    source_pubkey,
    mint_pubkey,
    destination_pubkey,
    authority_pubkey,
    &validate_state_pubkey,
    amount,
);

// Resolve all additional required accounts for `ExecuteInstruction`
ExtraAccountMetaList::add_to_instruction::<ExecuteInstruction, _, _>(
    &mut execute_instruction,
    fetch_account_data_fn,
    &validate_state_data,
)
.await?;

// Add only the extra accounts resolved from the validation state
instruction
    .accounts
    .extend_from_slice(&execute_instruction.accounts[5..]);

// Add the program id and validation state account
instruction
    .accounts
    .push(AccountMeta::new_readonly(*program_id, false));
instruction
    .accounts
    .push(AccountMeta::new_readonly(validate_state_pubkey, false));
```

从示例中可以看出，需要记住的一个重要概念是这些额外账户是为哪个指令准备的。即便你可能正在为另一个不一定需要这些账户的程序构建指令，但如果该程序将通过CPI调用你的转账钩子程序，那么它就必须包含正确的账户。

此外，为了成功执行动态账户解析，需要提供与验证账户中配置的指令相匹配的正确指令——在这里是指转账钩子接口的`ExecuteInstruction`。因此，我们首先创建一个`ExecuteInstruction`，然后为该指令解析额外账户，最后将这些账户添加到我们当前的指令中。这样做可以确保在执行过程中，所有必要的账户都得到正确的处理和包含。

## 为 CPI 解析链上额外账户元数据

在执行寻求将 CPI 连接到你的转账钩子程序期间，尽管额外所需的账户已由离线账户解析提供，执行程序也必须知道如何使用正确的账户构建 CPI 指令！

以下是一个示例，展示了转账钩子接口[链上辅助函数](https://github.com/solana-labs/solana-program-library/blob/65a92e6e0a4346920582d9b3893cacafd85bb017/token/transfer-hook/interface/src/onchain.rs#L67)中所包含的逻辑。

```rust
// Find the validation account from the list of `AccountInfo`s and load its
// data
let validate_state_pubkey = get_extra_account_metas_address(mint_info.key, program_id);
let validate_state_info = account_infos
    .iter()
    .find(|&x| *x.key == validate_state_pubkey)
    .ok_or(TransferHookError::IncorrectAccount)?;

// Find the transfer hook program ID
let program_info = account_infos
    .iter()
    .find(|&x| x.key == program_id)
    .ok_or(TransferHookError::IncorrectAccount)?;

// First create an `ExecuteInstruction`
let mut execute_instruction = instruction::execute(
    program_id,
    source_info.key,
    mint_info.key,
    destination_info.key,
    authority_info.key,
    &validate_state_pubkey,
    amount,
);
let mut execute_account_infos = vec![
    source_info,
    mint_info,
    destination_info,
    authority_info,
    validate_state_info.clone(),
];

// Resolve all additional required accounts for `ExecuteInstruction`
ExtraAccountMetaList::add_to_cpi_instruction::<instruction::ExecuteInstruction>(
    &mut execute_instruction,
    &mut execute_account_infos,
    &validate_state_info.try_borrow_data()?,
    account_infos,
)?;

// Add only the extra accounts resolved from the validation state
cpi_instruction
    .accounts
    .extend_from_slice(&execute_instruction.accounts[5..]);
cpi_account_infos.extend_from_slice(&execute_account_infos[5..]);

// Add the program id and validation state account
cpi_instruction
    .accounts
    .push(AccountMeta::new_readonly(*program_id, false));
cpi_instruction
    .accounts
    .push(AccountMeta::new_readonly(validate_state_pubkey, false));
cpi_account_infos.push(program_info.clone());
cpi_account_infos.push(validate_state_info.clone());
```

虽然这个例子可能看起来比链下例子更冗长，但实际上它执行的是完全相同的步骤，只是带有一个指令和一个账户信息列表，因为 CPI 需要这两者。

`ExtraAccountMetaList::add_to_instruction(..)` 和 `ExtraAccountMetaList::add_to_cpi_instruction(..)` 两个方法之间的主要区别在于，后者会在列表中找到对应的 `AccountInfo`，并在将解析出的 `AccountMeta` 添加到指令的同时，也将其添加到 `cpi_account_infos` 中，这样可以确保所有解析出的账户密钥都存在于 `AccountInfo` 列表里，满足CPI操作的需求。