# 规范

转账钩子接口规范包括两个可选指令和一个必需指令。

转账钩子接口的每个指令在其指令数据的开头使用特定的8字节鉴别符。

## 指令：`Execute`（执行）

`Execute`（执行）指令是任何希望实现该接口的程序所必需的，这也是自定义转账功能所在的指令。

- **鉴别器：** `"spl-transfer-hook-interface:execute"`字符串文字哈希值的前8个字节
- **数据:**
  - `amount: u64` - 转账金额
- **金额:**
  - 1 `[]`: 源 token 账户
  - 2 `[]`: Mint 地址
  - 3 `[]`: 目标 token 账户
  - 4 `[]`: 源 token 授权账户
  - 5 `[]`: 验证账户
  - `n` 额外账户数量，写入验证账户中

**验证账户**是转账钩子接口中的关键组成部分，并在[下一部分](https://spl.solana.com/transfer-hook-interface/configuring-extra-accounts)中有更详细的介绍。简而言之，它是一个存储配置数据的账户，这些配置数据可以被反序列化以确定转账钩子程序所需的所有额外账户。

接口的下两个指令处理这些配置

### (可选) 指令: `InitializeExtraAccountMetaList`

这条指令的执行内容正如其名称所示：它初始化验证账户以存储`Execute`指令所需的额外[`AccountMeta`](https://docs.rs/solana-program/latest/solana_program/instruction/struct.AccountMeta.html)配置列表。

- **鉴别器：** `"spl-transfer-hook-interface:initialize-extra-account-metas"`字符串文字哈希值的前8个字节
- **数据:**
  - `extra_account_metas: Vec<ExtraAccountMeta>` - 需要写入验证账户的额外账户配置列表
- **账号:**
  - 1 `[writable]`: 验证账户
  - 2 `[]`: Mint 地址
  - 3 `[signer]`: 铸造权限持有者
  - 4 `[]`: 系统程序 (System program)

### (可选) 指令: `UpdateExtraAccountMetaList`

`UpdateExtraAccountMetaList` 指令允许链上程序更新其 `Execute` 所需账户列表。通过实施此指令，开发人员可以更新存储在验证账户中的所需额外账户列表。

- **鉴别器：** `"spl-transfer-hook-interface:update-extra-account-metas"`字符串文字哈希值的前8个字节 
- **数据:**
  - `extra_account_metas: Vec<ExtraAccountMeta>` - 需要写入验证账户的额外账户配置列表
- **账号:**
  - 1 `[writable]`: 验证账户
  - 2 `[]`: Mint 地址
  - 3 `[signer]`: 铸造权限持有者


