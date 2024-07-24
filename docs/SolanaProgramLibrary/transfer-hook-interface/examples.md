# 示例

更多的示例可以在[转账钩子（Transfer Hook）示例测试](https://github.com/solana-labs/solana-program-library/blob/master/token/transfer-hook/example/tests/functional.rs)以及[TLV 账户解析（Account Resolution）测试](https://github.com/solana-labs/solana-program-library/blob/master/libraries/tlv-account-resolution/src/state.rs)中找到。

## 链上初始化额外账户元数据

[`ExtraAccountMetaList`](https://github.com/solana-labs/solana-program-library/blob/65a92e6e0a4346920582d9b3893cacafd85bb017/libraries/tlv-account-resolution/src/state.rs#L167)结构体设计用于实现与额外账户配置工作的高度集成。

使用 `ExtraAccountMetaList::init<T>(..)` 方法，你可以通过提供缓冲区的可变引用和 `ExtraAccountMeta` 的切片来初始化缓冲区中的序列化 ExtraAccountMeta 配置。泛型 `T` 是指应分配额外账户配置的指令。在我们的例子中，这将是转账钩子接口中的[`spl_transfer_hook_interface::instruction::ExecuteInstruction`](https://github.com/solana-labs/solana-program-library/blob/eb32c5e72c6d917e732bded9863db7657b23e428/token/transfer-hook/interface/src/instruction.rs#L68)。

> 注意：SPL Transfer Hook 接口中的所有指令都实现了 [`SplDiscriminate`](https://github.com/solana-labs/solana-program-library/blob/65a92e6e0a4346920582d9b3893cacafd85bb017/libraries/discriminator/src/discriminator.rs#L9)特征（trait ），该特征提供一个常量 8 字节的识别符，可用于创建 TLV 数据条目。

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

  // 检查验证账户
  let (expected_validation_address, bump_seed) =
      get_extra_account_metas_address_and_bump_seed(mint_info.key, program_id);
  if expected_validation_address != *validation_info.key {
      return Err(ProgramError::InvalidSeeds);
  }

  // 创建账户
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

  // 写入数据
  let mut data = validation_info.try_borrow_mut_data()?;
  ExtraAccountMetaList::init::<ExecuteInstruction>(&mut data, extra_account_metas)?;

  Ok(())
}

```

调用 `ExtraAccountMetaList::init::<ExecuteInstruction>(..)` 可变帐户数据后，该帐户现在存储了 `Execute` 指令的所有序列化额外帐户配置！

## 解析链下额外账户元数据

在构建指令时，无论是直接用于您的转账钩子程序还是用于将 CPI（跨程序调用）到您的转账钩子程序的另一个程序，您必须包含所有必需的账户，包括额外的账户。

以下是一个示例，展示了转账钩子接口[链下辅助函数](https://github.com/solana-labs/solana-program-library/blob/65a92e6e0a4346920582d9b3893cacafd85bb017/token/transfer-hook/interface/src/offchain.rs#L50)中所含逻辑。

```rust
// 您需要提供一个“账户数据函数”，这是一个函数，可以根据给定的 `Pubkey` 返回 `AccountDataResult` 中的账户数据。
// 这很可能基于像 `getAccountInfo` 这样的 RPC 调用。

// 加载验证状态数据
let validate_state_pubkey = get_extra_account_metas_address(mint_pubkey, program_id);
let validate_state_data = fetch_account_data_fn(validate_state_pubkey)
    .await?
    .ok_or(ProgramError::InvalidAccountData)?;

// 首先创建一个 `ExecuteInstruction`
let mut execute_instruction = execute(
    program_id,
    source_pubkey,
    mint_pubkey,
    destination_pubkey,
    authority_pubkey,
    &validate_state_pubkey,
    amount,
);

// 为 `ExecuteInstruction` 解析所有额外必需账户
ExtraAccountMetaList::add_to_instruction::<ExecuteInstruction, _, _>(
    &mut execute_instruction,
    fetch_account_data_fn,
    &validate_state_data,
)
.await?;

// 仅添加从验证状态解析的额外账户
instruction
    .accounts
    .extend_from_slice(&execute_instruction.accounts[5..]);

// 添加程序 ID 和验证状态账户
instruction
    .accounts
    .push(AccountMeta::new_readonly(*program_id, false));
instruction
    .accounts
    .push(AccountMeta::new_readonly(validate_state_pubkey, false));

```

从示例中可以看出，记住这些额外账户是针对哪个指令的这一重要概念非常关键。即使您可能正在为其他程序构建指令，如果该程序要 CPI 到您的转账钩子程序，它也需要包含正确的账户。

此外，为了成功执行动态账户解析，需要提供与验证账户中配置的指令相匹配的正确指令——在这里是指转账钩子接口的`ExecuteInstruction`。因此，我们首先创建一个`ExecuteInstruction`，然后为该指令解析额外账户，最后将这些账户添加到我们当前的指令中。

## CPI 的链上解析额外账户元数据

在执行一个希望 CPI 到您的转账钩子程序的程序期间，即使额外必需账户是通过链下账户解析提供的，执行程序仍然需要知道如何构建带有正确账户的 CPI 指令！

以下是一个示例，展示了转账钩子接口[链上辅助函数](https://github.com/solana-labs/solana-program-library/blob/65a92e6e0a4346920582d9b3893cacafd85bb017/token/transfer-hook/interface/src/onchain.rs#L67)中所包含的逻辑。

```rust
// 从 `AccountInfo` 列表中找到验证账户并加载其数据
let validate_state_pubkey = get_extra_account_metas_address(mint_info.key, program_id);
let validate_state_info = account_infos
    .iter()
    .find(|&x| *x.key == validate_state_pubkey)
    .ok_or(TransferHookError::IncorrectAccount)?;

// 找到转账钩子程序 ID
let program_info = account_infos
    .iter()
    .find(|&x| x.key == program_id)
    .ok_or(TransferHookError::IncorrectAccount)?;

// 首先创建一个 `ExecuteInstruction`
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

// 为 `ExecuteInstruction` 解析所有额外必需账户
ExtraAccountMetaList::add_to_cpi_instruction::<instruction::ExecuteInstruction>(
    &mut execute_instruction,
    &mut execute_account_infos,
    &validate_state_info.try_borrow_data()?,
    account_infos,
)?;

// 仅添加从验证状态解析的额外账户
cpi_instruction
    .accounts
    .extend_from_slice(&execute_instruction.accounts[5..]);
cpi_account_infos.extend_from_slice(&execute_account_infos[5..]);

// 添加程序 ID 和验证状态账户
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

`ExtraAccountMetaList::add_to_instruction(..)` 和 `ExtraAccountMetaList::add_to_cpi_instruction(..)` 两个方法之间的主要区别在于，后者方法会在添加解析的 `AccountMeta` 到指令的同时找到账户信息列表中的相应 `AccountInfo`，并将其添加到 `cpi_account_infos` 中，以确保所有解析的账户密钥都存在于 `AccountInfo` 列表中。
