# 使用Rust进行开发

Solana支持使用[Rust](https://www.rust-lang.org/)编程语言编写链上程序。

::: tip HELLO WORLD: 开始 SOLANA 开发

要快速开始Solana开发并构建你的第一个Rust程序，请查看这些详细的快速入门指南：

- [使用浏览器构建和部署你的第一个Solana程序](https://solana.com/content/guides/getstarted/hello-world-in-your-browser.md)。无需安装IDE。
- [设置本地环境](https://solana.com/content/guides/getstarted/setup-local-development.md)并使用本地测试验证器。

:::

## 项目结构

Solana Rust程序遵循典型的[Rust项目结构](https://doc.rust-lang.org/cargo/guide/project-layout.html)：

```text
/inc/
/src/
/Cargo.toml
```

Solana Rust程序可以直接依赖于其他程序，以便在进行[跨程序调用](https://solana.com/docs/core/cpi.md)时访问指令帮助程序。这样做时，重要的是不要引入依赖程序的入口点函数标识，因为它们可能与程序自身的入口点冲突。为避免这种情况，程序应在`Cargo.toml`中定义一个`no-entrypoint`特性，并使用它来排除入口点。

- [定义特性](https://github.com/solana-labs/solana-program-library/blob/fca9836a2c8e18fc7e3595287484e9acd60a8f64/token/program/Cargo.toml#L12)
- [排除入口点](https://github.com/solana-labs/solana-program-library/blob/fca9836a2c8e18fc7e3595287484e9acd60a8f64/token/program/src/lib.rs#L12)

然后，当其他程序将此程序作为依赖项包含时，应使用`no-entrypoint`特性。

- [不包含入口点](https://github.com/solana-labs/solana-program-library/blob/fca9836a2c8e18fc7e3595287484e9acd60a8f64/token-swap/program/Cargo.toml#L22)

## 项目依赖

所有的Solana Rust程序必须引入[`solana-program`](https://crates.io/crates/solana-program) 包。

Solana SBF程序有一些[限制](#restrictions)，可能会阻止某些包作为依赖项的引入或需要特殊处理。

例如：

- 需要架构是官方工具链支持的子集的包。除非该包被分叉并添加SBF到那些架构检查中，否则没有解决办法。
- 依赖于`rand`的包在Solana的确定性程序环境中不受支持。要包含依赖于`rand`的包，请参阅[依赖Rand](#depending-on-rand)。
- 即使程序本身不包含堆栈溢出的代码，包也可能会导致堆栈溢出。有关更多信息，请参阅[堆栈](https://solana.com/docs/programs/faq.md#stack)。

## 构建方法

首先设置环境：

- 从 https://rustup.rs/ 安装最新的Rust稳定版本
- 安装最新的[Solana命令行工具](https://docs.solanalabs.com/cli/install)

也可以使用普通的cargo build在主机上构建程序，用于单元测试：

```shell
cargo build
```

要为Solana SBF目标构建特定程序（如SPL Token），以便部署到集群：

```shell
cd <程序目录>
cargo build-bpf
```

## 测试方法

Solana程序可以用直接执行程序函数方法通过传统的`cargo test`机制进行单元测试，。

为了帮助在更接近真实集群的环境中进行测试，开发人员可以使用[`program-test`](https://crates.io/crates/solana-program-test) 包来启动一个本地运行的实例，并允许测试在持续运行的情况下发送多个交易。

有关更多信息，请参阅[系统变量示例测试](https://github.com/solana-labs/solana-program-library/blob/master/examples/rust/sysvar/tests/functional.rs)，此示例展示了如何发送和处理包含系统变量账户的指令。

## 程序入口点

程序导出一个已知的入口点函数标识，Solana运行时在调用程序时会查找并调用该函数标识。Solana支持多个版本的BPF加载器，入口点在它们之间可能有所不同。程序必须为相同的加载器编写并部署。有关更多详细信息，请参阅[加载器FAQ部分](https://solana.com/docs/programs/faq.md#loaders)。

目前有两个支持的加载器：[BPF Loader](https://github.com/solana-labs/solana/blob/d9b0fc0e3eec67dfe4a97d9298b15969b2804fab/sdk/program/src/bpf_loader.rs#L17)和[BPF Loader deprecated](https://github.com/solana-labs/solana/blob/d9b0fc0e3eec67dfe4a97d9298b15969b2804fab/sdk/program/src/bpf_loader_deprecated.rs#L14)

它们都有相同的初始入口点定义，以下是运行时查找并调用的初始函数标识：

```rust
#[no_mangle]
pub unsafe extern "C" fn entrypoint(input: *mut u8) -> u64;
```

这个入口点接受一个通用的字节数组，其中包含序列化的程序参数（程序id、账户、指令数据等）。要反序列化参数，每个加载器都包含自己的包装宏，该宏导出初始入口点，反序列化参数，调用用户定义的指令处理函数，并返回结果。

你可以在这里找到入口点宏：

- [BPF Loader的入口点宏](https://github.com/solana-labs/solana/blob/9b1199cdb1b391b00d510ed7fc4866bdf6ee4eb3/sdk/program/src/entrypoint.rs#L42)
- [BPF Loader deprecated的入口点宏](https://github.com/solana-labs/solana/blob/9b1199cdb1b391b00d510ed7fc4866bdf6ee4eb3/sdk/program/src/entrypoint_deprecated.rs#L38)

入口点宏调用的程序定义的指令处理函数必须采用以下形式：

```rust
pub type ProcessInstruction =
    fn(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult;
```

### 参数反序列化

每个加载器提供一个帮助函数，将程序的输入参数反序列化为Rust类型。入口点宏会自动调用反序列化帮助函数：

- [BPF Loader反序列化](https://github.com/solana-labs/solana/blob/d9b0fc0e3eec67dfe4a97d9298b15969b2804fab/sdk/program/src/entrypoint.rs#L146)
- [BPF Loader deprecated反序列化](https://github.com/solana-labs/solana/blob/d9b0fc0e3eec67dfe4a97d9298b15969b2804fab/sdk/program/src/entrypoint_deprecated.rs#L57)

一些程序可能希望自己执行反序列化，它们可以通过提供自己的[初始入口点](#program-entrypoint)实现来实现这一点。请注意，提供的反序列化函数会保留对序列化字节数组的引用，用于程序允许修改的变量（lamports、账户数据）。这样做的原因是返回时加载器会读取这些修改，以便提交。如果程序实现了自己的反序列化函数，它们需要确保程序希望提交的任何修改都写回到输入字节数组中。

有关加载器如何序列化程序输入的详细信息，请参阅[输入参数序列化](https://solana.com/docs/programs/faq.md#input-parameter-serialization)文档。

### 数据类型

加载程序器的入口点宏使用以下参数调用程序定义的指令处理器函数：

```rust
program_id: &Pubkey,
accounts: &[AccountInfo],
instruction_data: &[u8]
```

程序id（program_id）是当前执行程序的公钥。

账户（accounts）是指令引用其账户的有序切片，表示为[AccountInfo](https://github.com/solana-labs/solana/blob/d9b0fc0e3eec67dfe4a97d9298b15969b2804fab/sdk/program/src/account_info.rs#L12)结构。账户在数组中的位置表示其含义，例如在转移lamports时，指令会将第一个账户定义为源账户，第二个账户定义为目标账户。

`AccountInfo`结构的成员是只读的，除了`lamports`和`data`。根据“运行时执行策略”，程序可以修改这两个成员。这两个成员都受Rust的`RefCell`构造保护，因此必须借用它们才能读取或写入。这样做的原因是它们都指向初始输入字节数组，但账户（accounts）切片中可能有多个条目指向同一个账户。使用`RefCell`可以确保程序不会通过多个`AccountInfo`结构对相同的底层数据进行重叠读/写。如果程序实现了自己的反序列化函数，则应小心处理重复账户。

指令数据（instruction_data）是指令正在处理的[指令数据](https://solana.com/docs/core/transactions.md#instruction)的通用字节数组。

## 堆

Rust程序通过定义自定义[`global_allocator`](https://github.com/solana-labs/solana/blob/d9b0fc0e3eec67dfe4a97d9298b15969b2804fab/sdk/program/src/entrypoint.rs#L72)直接实现堆。

程序可以根据其特定需求实现自己的`global_allocator`。有关更多信息，请参阅[自定义堆示例](#examples)。

## 局限性

链上Rust程序支持大多数Rust的libstd、libcore和liballoc，以及许多第三方crate。

由于这些程序在资源受限的单线程环境中运行，并且是确定性的，因此存在一些限制：

- 不可访问
  - `rand`
  - `std::fs`
  - `std::net`
  - `std::future`
  - `std::process`
  - `std::sync`
  - `std::task`
  - `std::thread`
  - `std::time`
- 有限访问：
  - `std::hash`
  - `std::os`
- Bincode在周期和调用深度上极其耗费计算资源，应避免使用。
- 应避免字符串格式化，因为它也非常耗费计算资源。
- 不支持`println!`、`print!`，应使用Solana的[日志工具](#日志)
- 运行时对程序在处理一个指令期间可以执行的指令数量有限制。有关更多信息，请参阅[计算预算](https://solana.com/docs/core/fees.md#compute-budget)。

## Rand依赖

程序受限于确定性运行，因此不提供随机数。有时程序可能依赖于一个依赖 `rand` 的 crate，即使程序本身不使用任何随机数功能。如果程序依赖 `rand`，编译将失败，因为 Solana 不支持 `get-random`。错误通常如下所示：


```shell
error: target is not supported, for more information see: https://docs.rs/getrandom/#unsupported-targets
   --> /Users/jack/.cargo/registry/src/github.com-1ecc6299db9ec823/getrandom-0.1.14/src/lib.rs:257:9
    |
257 | /         compile_error!("\
258 | |             target is not supported, for more information see: \
259 | |             https://docs.rs/getrandom/#unsupported-targets\
260 | |         ");
    | |___________^
```

要解决此依赖问题，请在程序的`Cargo.toml`中添加以下依赖项：

```toml
getrandom = { version = "0.1.14", features = ["dummy"] }
```

或者如果依赖于getrandom v0.2，请添加：

```toml
getrandom = { version = "0.2.2", features = ["custom"] }
```

## 日志

Rust的`println!`宏在计算上非常昂贵且不受支持。相反，提供了辅助宏[`msg!`](https://github.com/solana-labs/solana/blob/d9b0fc0e3eec67dfe4a97d9298b15969b2804fab/sdk/program/src/log.rs#L33)。

`msg!`有两种形式：

```rust
msg!("A string");
```

或

```rust
msg!(0_64, 1_64, 2_64, 3_64, 4_64);
```

两种形式都将结果输出到程序日志。如果程序想的话，可以使用`format!`模拟`println!`：

```rust
msg!("Some variable: {:?}", variable);
```

[调试](https://solana.com/docs/programs/debugging.md#logging)部分有更多关于使用程序日志的信息，此[Rust示例](#examples)中包含一个日志记录示例。

## 异常处理

Rust的`panic!`、`assert!`和内部异常结果默认打印到[程序日志](https://solana.com/docs/programs/debugging.md#logging)。

```shell
INFO  solana_runtime::message_processor] Finalized account CGLhHSuWsp1gT4B7MY2KACqp9RUwQRhcUFfVSuxpSajZ
INFO  solana_runtime::message_processor] Call SBF program CGLhHSuWsp1gT4B7MY2KACqp9RUwQRhcUFfVSuxpSajZ
INFO  solana_runtime::message_processor] Program log: Panicked at: 'assertion failed: `(left == right)`
      left: `1`,
     right: `2`', rust/panic/src/lib.rs:22:5
INFO  solana_runtime::message_processor] SBF program consumed 5453 of 200000 units
INFO  solana_runtime::message_processor] SBF program CGLhHSuWsp1gT4B7MY2KACqp9RUwQRhcUFfVSuxpSajZ failed: BPF program panicked
```

### 自定义异常处理程序

程序可以通过提供自己的实现来覆盖默认的异常处理程序。

首先在程序的`Cargo.toml`中定义`custom-panic`特性

```toml
[features]
default = ["custom-panic"]
custom-panic = []
```

然后提供自定义的异常处理程序实现：

```rust
#[cfg(all(feature = "custom-panic", target_os = "solana"))]
#[no_mangle]
fn custom_panic(info: &core::panic::PanicInfo<'_>) {
    solana_program::msg!("program custom panic enabled");
    solana_program::msg!("{}", info);
}
```

上述代码显示了默认实现，但开发人员可以用更适合自己需求的实现替换它。

支持完整的异常消息的默认实现的一个副作用是，程序需要在共享对象中引入更多的Rust `libstd`，实现寻常程序已经引入了大量的`libstd`，可能不会注意到共享对象大小的显著增加。但那些明确尝试通过避免`libstd`来保持小的程序可能会受到很大的影响（约25kb）。为了避免这种影响，程序可以提供自己空实现的自定义异常处理程序。

```rust
#[cfg(all(feature = "custom-panic", target_os = "solana"))]
#[no_mangle]
fn custom_panic(info: &core::panic::PanicInfo<'_>) {
    // 为了节省空间，不做任何操作
}
```

## 计算预算

使用系统调用`sol_remaining_compute_units()`返回一个`u64`，指示此交易剩余的计算单元数。

使用系统调用[`sol_log_compute_units()`](https://github.com/solana-labs/solana/blob/d9b0fc0e3eec67dfe4a97d9298b15969b2804fab/sdk/program/src/log.rs#L141)记录一条消息，包含程序在执行停止前可以消耗的剩余计算单元数。

有关更多信息，请参阅[计算预算](https://solana.com/docs/core/fees.md#compute-budget)文档。

## ELF转储

可以将SBF共享对象内部转储到文本文件中，以更深入了解程序的组成及其在运行时可能做的事情。转储将包含ELF信息以及所有符号和实现它们的指令列表。某些BPF加载程序的错误日志消息将引用错误发生的特定指令号。这些引用可以在ELF转储中查找，以确定出错的指令及其上下文。

要创建转储文件：

```shell
cd <程序目录>
cargo build-bpf --dump
```

## 示例

[Solana程序库GitHub仓库](https://github.com/solana-labs/solana-program-library/tree/master/examples/rust)包含一系列Rust示例。

[Solana开发者程序示例GitHub仓库](https://github.com/solana-developers/program-examples)也包含一系列从初级到中级的Rust程序示例。

