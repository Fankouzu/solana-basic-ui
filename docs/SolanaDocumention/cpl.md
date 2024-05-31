# 跨程序调用（CPI）

跨程序调用 (CPI) 是指一个程序调用另一个程序的指令。此机制允许 Solana 程序具有可组合性。

您可以将指令视为程序向网络公开的 API 端点，将 CPI 视为一个 API 在内部调用另一个 API。

![调用示意图](https://solana-developer-content.vercel.app/assets/docs/core/cpi/cpi.svg)

当一个程序向另一个程序发起跨程序调用（CPI）时：
- 初始交易中调用程序A的签署者权限会被延申给程序B。
- 被调用的程序B也可以进一步对其他程序进行CPI，深度最多为4（例如: B->C,C->D）。
- 这些程序可以代表源自其程序ID的程序[PDAs](https://solana.com/zh/docs/core/pda)进行“签名”

::: tip INFO
Solana程序运行时定义了一个名为[`max_invoke_stack_height`](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/program-runtime/src/compute_budget.rs#L31-L35)的常量，其[值设定为5](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/program-runtime/src/compute_budget.rs#L138)。这代表着程序指令调用堆栈的最大高度。对于交易指令，堆栈高度从1开始，每当一个程序调用另一个指令时，高度增加1。这个设置实质上将CPI的调用深度限制在了4层。
::: 

## 关键点

- CPIs（跨程序调用）允许Solana程序指令直接调用另一个程序上的指令。
- 调用程序的签署者权限会被扩展到被调用程序上。
- 在执行CPI时，程序也能代表自身程序ID的PDAs进行“签名”。
- 被调用程序还可以向其他程序发起更多的CPI，但调用深度最多限制到4层。

## 如何编写一个CPI

编写一个CPI指令遵循与构建交易中添加[指令](https://solana.com/zh/docs/core/transactions#instruction)相同的模式。在内部，每个CPI指令都必须指定以下信息：

- 程序地址：指定被调用的程序
- 账户：列出指令要读取或写入的每个账户，包括其他程序
- 指令数据：指定要调用的程序上的哪个指令，以及该指令需要的任何的额外的数据（函数参数）

根据你正在调用的程序，可能有可用的crate（Cargo包管理中的术语，指软件包或库），其中包含用于构建指令的帮助函数。然后，程序使用来自`solana_program`库的以下两个函数之一来执行CPI：

- `invoke` - 当没有PDA签署者时使用
- `invoke_signed` - 当调用程序需要使用源自其程序ID的PDA进行签名时使用

## 基础CPI

`invoke` 函数用于创建不需要PDA签署者的CPI。当创建CPI时，提供给调用程序的签署者权限会自动的扩展到被调用程序。
```rust
	pub fn invoke(
		instruction: &Instruction,
		account_infos: &[AccountInfo<'_>]
	) -> Result<(), ProgramError>
```
这是[Solana Playground](https://beta.solpg.io/github.com/ZYJLiu/doc-examples/tree/main/cpi-invoke)上的一个示例程序，它使用`invoke`函数进行CPI，以调用系统程序上的转账指令。你也可以参考[基本的CPI指南](https://solana.com/zh/developers/guides/getstarted/how-to-cpi)以获取更多的详细信息。

## 有PDA签署者的CPI

`invoke_signed`函数用于创建需要PDA签署者的CPI。用于衍生签名者PDAs的种子会被作为`signer_seeds`传入给`invoke_signed`函数。

你可以参考[程序衍生地址](https://solana.com/zh/docs/core/pda)页面以获取关于如何衍生PDAs的具体细节。

```rust
pub fn invoke_signed(
    instruction: &Instruction,
    account_infos: &[AccountInfo<'_>],
    signers_seeds: &[&[&[u8]]]
) -> Result<(), ProgramError>
```

运行时会根据调用者程序的权限来判断能向被调用的程序扩展哪些权限。权限在此上下文中指的是签署者以及可写账户。例如，如果调用者正在处理指令中包含一个签署者或者可写账户，那么调用者就可以调用另一个同样包含该签署者和/或可写账户的指令。

尽管PDAs[没有私钥](https://solana.com/zh/docs/core/pda#what-is-a-pda)，它们仍然可以通过CPI在指令中充当签名者。为了验证PDA是否由调用程序派生，用于生成PDA的种子必须作为`signers_seeds`包含在内。

当处理CPI时，Solana运行时会在[内部使用`create_program_address`](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src/syscalls/cpi.rs#L550)和调用程序的`signers_seeds`和`program_id`。如果找到有效的PDA，该地址就会被[添加为有效的签署者](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src/syscalls/cpi.rs#L552)。

这里有个[Solana Playground](https://beta.solpg.io/github.com/ZYJLiu/doc-examples/tree/main/cpi-invoke-signed)上的示例程序，它使用`invoke_signed`函数进行CPI，调用系统程序上的转账指令，并使用PDA作为签署者。你还可以参考“[带有PDA签署者的CPI指南](https://solana.com/zh/developers/guides/getstarted/how-to-cpi-with-signer)”以获取更多详细信息。

