# 规范

转账钩子(Transfer Hook)接口规范包括两个可选指令和一个必需指令。

每个转账钩子接口的指令在其指令数据的开头，都使用一个特定的 8 字节识别符。

## 指令：`Execute`（执行）

`Execute`（执行）指令是任何希望实现该接口的程序所必需的，这也是自定义转账功能所在的指令。

- **识别符：**字符串字面量` "spl-transfer-hook-interface" `的前 8 字节哈希值
- **数据:**
  - `amount: u64` - 转账金额
- **金额:**
  - 1 `[]`: 源代币账户
  - 2 `[]`: Mint 地址
  - 3 `[]`: 目标代币账户
  - 4 `[]`: 源代币授权账户
  - 5 `[]`: 验证账户
  - `n` 其他附加账户，写入验证账户中

**验证账户**是转账钩子接口中的关键组成部分，在[下一节](https://spl.solana.com/transfer-hook-interface/configuring-extra-accounts)中有更详细的介绍。简而言之，它是一个存储配置数据的账户，可以反序列化以确定转账钩子程序所需的其他账户。

接口的以下两个指令处理这些配置。

## (可选) 指令: `InitializeExtraAccountMetaList`

这条指令顾名思义：它初始化验证账户以存储`Execute`指令所需的额外[`AccountMeta`](https://docs.rs/solana-program/latest/solana_program/instruction/struct.AccountMeta.html)配置列表。

- **识别符：** 字符串字面量` "spl-transfer-hook-interface" `的前 8 字节哈希值
- **数据:**
  - `extra_account_metas: Vec<ExtraAccountMeta>` - 需要写入验证账户的额外账户配置列表
- **账号:**
  - 1 `[writable]`（可写）: 验证账户
  - 2 `[]`: Mint 地址
  - 3 `[signer]`（签名者）: Mint 权限持有者
  - 4 `[]`: 系统程序 (System program)

## (可选) 指令: `UpdateExtraAccountMetaList`

`UpdateExtraAccountMetaList` 指令允许链上程序更新其 `Execute` 所需账户列表。通过实施此指令，开发人员可以更新存储在验证账户中的所需额外账户列表。

- **识别符：** 字符串字面量` "spl-transfer-hook-interface" `的前 8 字节哈希值
- **数据:**
  - `extra_account_metas: Vec<ExtraAccountMeta>` - 需要写入验证账户的额外账户配置列表
- **账号:**
  - 1 `[writable]`（可写）: 验证账户
  - 2 `[]`: Mint 地址
  - 3 `[signer]`（签名者）: 铸造权限持有者
