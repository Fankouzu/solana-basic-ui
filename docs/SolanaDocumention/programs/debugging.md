# 调试程序

Solana 程序在链上运行，因此在野外调试它们可能很具挑战性。为了使调试程序更容易，开发者可以编写单元测试，以直接通过 Solana 运行时测试他们的程序执行，或者运行一个本地集群，以允许 RPC 客户端与他们的程序交互。

## 运行单元测试

- [使用 Rust 测试](https://solana.com/zh/docs/programs/lang-rust#how-to-test)
- [使用 C 测试](https://solana.com/zh/docs/programs/lang-c#how-to-test)

## 日志记录

在程序执行期间，运行时和程序都会记录状态和错误消息。

有关如何从程序中记录日志的信息，请参阅语言特定的文档：

- [从 Rust 程序记录日志](https://solana.com/zh/docs/programs/lang-rust#logging)
- [从 C 程序记录日志](https://solana.com/zh/docs/programs/lang-c#logging)

当运行本地集群时，日志将写入 stdout，只要它们通过 `RUST_LOG` 日志掩码启用。从程序开发的角度来看，集中关注运行时和程序日志，而不是整个集群的日志。要集中关注程序特定的信息，建议使用以下日志掩码：

```shell
export RUST_LOG=solana_runtime::system_instruction_processor=trace,solana_runtime::message_processor=info,solana_bpf_loader=debug,solana_rbpf=debug
```

直接来自程序（而不是运行时）的日志消息将以以下形式显示：

`程序日志：<用户定义的消息>`

## 错误处理

通过事务错误可以传递的信息量有限，但可能的失败点有很多。以下是可能的失败点和预期错误的信息：

- SBF 加载器可能无法解析程序，这不应该发生，因为加载器已经 _finalized_ 程序的账户数据。
  - `InstructionError::InvalidAccountData` 将作为事务错误的一部分返回。
- SBF 加载器可能无法设置程序的执行环境
  - `InstructionError::Custom(0x0b9f_0001)` 将作为事务错误的一部分返回。“0x0b9f_0001” 是 [`VirtualMachineCreationFailed`](https://github.com/solana-labs/solana/blob/bc7133d7526a041d1aaee807b80922baa89b6f90/programs/bpf_loader/src/lib.rs#L44) 的十六进制表示。
- SBF 加载器可能在程序执行期间检测到致命错误（例如恐慌、内存违规、系统调用错误等）
  - `InstructionError::Custom(0x0b9f_0002)` 将作为事务错误的一部分返回。“0x0b9f_0002” 是 [`VirtualMachineFailedToRunProgram`](https://github.com/solana-labs/solana/blob/bc7133d7526a041d1aaee807b80922baa89b6f90/programs/bpf_loader/src/lib.rs#L46) 的十六进制表示。
- 程序本身可能返回错误
  - `InstructionError::Custom(<用户定义的值>)` 将返回。用户定义的值不得与任何内置的[运行时程序错误冲突](https://github.com/solana-labs/solana/blob/bc7133d7526a041d1aaee807b80922baa89b6f90/sdk/program/src/program_error.rs#L87)。程序通常使用枚举类型来定义错误代码，从零开始，以便它们不会冲突。

在 `VirtualMachineFailedToRunProgram` 错误的情况下，关于失败的具体信息将写入[程序的执行日志](https://solana.com/zh/docs/programs/debugging#logging)中。

例如，涉及堆栈的访问违规将看起来像这样：

```text
SBF program 4uQeVj5tqViQh7yWWGStvkEG1Zmhx6uasJtWCJziofM failed: out of bounds memory store (insn #615), addr 0x200001e38/8
```

## 监控计算预算消耗

程序可以记录它在执行之前将被允许的剩余计算单元数。程序可以使用这些日志来包装它们想要配置的操作。

- [从 Rust 程序记录剩余计算单元](https://solana.com/zh/docs/programs/lang-rust#compute-budget)
- [从 C 程序记录剩余计算单元](https://solana.com/zh/docs/programs/lang-c#compute-budget)

有关计算预算的更多信息，请参阅[计算预算](https://solana.com/zh/docs/core/fees#compute-budget)。

## ELF 转储

SBF 共享对象的内部可以被转储到文本文件，以获取更多关于程序组成和运行时行为的信息。

- [创建 Rust 程序的转储文件](https://solana.com/zh/docs/programs/lang-rust#elf-dump)
- [创建 C 程序的转储文件](https://solana.com/zh/docs/programs/lang-c#elf-dump)

## 指令跟踪

在执行期间，运行时 SBF 解释器可以被配置为记录每个执行的 SBF 指令的跟踪消息。这对于 things like pin-pointing runtime context leading up to a memory access violation非常有帮助。

跟踪日志与[ELF 转储](https://solana.com/zh/docs/programs/debugging#elf-dump)一起，可以提供很多信息（尽管跟踪产生了很多信息）。

要在本地集群中启用 SBF 解释器跟踪消息，请在 `RUST_LOG` 中将 `solana_rbpf` 级别设置为 `trace`。例如：

`export RUST_LOG=solana_rbpf=trace`

## 调试源码

使用 Solana Rust 和 Clang 编译器二进制包平台工具，可以对链上程序进行源码调试。

使用 `program run` 子命令的 `solana-ledger-tool` 和 lldb，可以加载编译的链上程序，在 RBPF 虚拟机中执行，并运行一个 gdb 服务器，以接受来自 LLDB 或 GDB 的入站连接。一次 lldb 连接到 `solana-ledger-tool` gdb 服务器后，它可以控制链上程序的执行。运行 `solana-ledger-tool program run --help` 以获取指定输入数据的示例。

要编译程序以进行调试，请使用 cargo-build-sbf 构建实用程序带有 `--debug` 命令行选项。该实用程序将生成两个可加载文件：一个是通常的可加载模块，扩展名为 `.so`，另一个是包含 Dwarf 调试信息的可加载模块，扩展名为 `.debug`。

要在调试器中执行程序，请运行 `solana-ledger-tool program run` 带有 `-e debugger` 命令行选项。例如，对于一个名为 'helloworld' 的crate，编译并在 `target/deploy` 目录中生成可执行程序。那里应该有三个文件：

- helloworld-keypair.json -- 部署程序的密钥对，
- helloworld.debug -- 包含调试信息的二进制文件，
- helloworld.so -- 可加载到虚拟机中的可执行文件。命令行用于运行 `solana-ledger-tool` 将是类似于以下的：

```shell
solana-ledger-tool program run -l test-ledger -e debugger target/deploy/helloworld.so
```

注意 `solana-ledger-tool` 始终加载一个账本数据库。大多数链上程序以某种方式与账本交互。即使出于调试目的不需要账本，它仍然需要提供给 `solana-ledger-tool`。可以通过运行 `solana-test-validator` 创建一个最小的账本数据库，该命令将在 `test-ledger` 子目录中创建一个账本。

在调试器模式下 `solana-ledger-tool program run` 加载 `.so` 文件并开始监听来自调试器的入站连接：

```text
Waiting for a Debugger connection on "127.0.0.1:9001"...
```

要连接到 `solana-ledger-tool` 并执行程序，请运行 lldb。对于调试 Rust 程序，可能有助于运行 solana-lldb 包装器到 lldb，即在新的 shell 提示符下（而不是用于启动 `solana-ledger-tool` 的那个）运行以下命令：

```shell
solana-lldb
```

该脚本安装在平台工具路径中。如果该路径未添加到 `PATH` 环境变量中，可能需要指定完整路径，例如：

```text
~/.cache/solana/v1.35/platform-tools/llvm/bin/solana-lldb
```

在调试器中，加载 `.debug` 文件通过输入以下命令：

```text
(lldb) file target/deploy/helloworld.debug
```

如果调试器找到该文件，它将打印类似以下的内容：

```text
Current executable set to '/path/helloworld.debug' (bpf).
```

现在，连接到 `solana-ledger-tool` 实现的 gdb 服务器，并调试程序，如常。输入以下命令以连接到 gdb 服务器：

```text
(lldb) gdb-remote 127.0.0.1:9001
```

如果调试器和 gdb 服务器建立连接，程序的执行将停止在入口点函数，并且 lldb 应该打印入口点函数签名周围的几行源代码。从这里开始，可以使用正常的 lldb 命令来控制被调试程序的执行。

### 在 IDE 中调试

要在 Visual Studio IDE 中调试链上程序，请安装 CodeLLDB 扩展。打开 CodeLLDB 扩展设置。在高级设置中将 `Lldb: Library` 字段的值更改为 `liblldb.so` 的路径（或在 macOS 上的 `liblldb.dylib`）。例如，在 Linux 上可能的路径是 `/home/<user>/.cache/solana/v1.35/platform-tools/llvm/lib/liblldb.so`，其中 `<user>` 是您的 Linux 系统用户名。这也可以直接添加到 `~/.config/Code/User/settings.json` 文件中，例如：

```json
{
  "lldb.library": "/home/<user>/.cache/solana/v1.35/platform-tools/llvm/lib/liblldb.so"
}
```

在您的链上项目的 `.vscode` 子目录中，创建两个文件：

第一个文件是 `tasks.json`，内容如下：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "shell",
      "command": "cargo build-sbf --debug",
      "problemMatcher": [],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "solana-debugger",
      "type": "shell",
      "command": "solana-ledger-tool program run -l test-ledger -e debugger ${workspaceFolder}/target/deploy/helloworld.so"
    }
  ]
}
```

第一个任务是使用 cargo-build-sbf 实用程序构建链上程序。第二个任务是以调试器模式运行 `solana-ledger-tool program run`。

另一个文件是 `launch.json`，内容如下：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lldb",
      "request": "custom",
      "name": "Debug",
      "targetCreateCommands": [
        "target create ${workspaceFolder}/target/deploy/helloworld.debug"
      ],
      "processCreateCommands": ["gdb-remote 127.0.0.1:9001"]
    }
  ]
}
```

该文件指定了如何运行调试器并连接到 `solana-ledger-tool` 实现的 gdb 服务器。

要开始调试程序，首先构建它，然后运行 `solana-debugger` 任务。这些任务可以从 VSCode 的 `Terminal >> Run Task...` 菜单中启动。当 `solana-ledger-tool` 运行并监听入站连接时，就是启动调试器的时候。从 VSCode 的 `Run and Debug` 菜单中启动调试器。如果一切设置正确，VSCode 将启动一个调试会话，并且程序执行将停止在`entrypoint`函数。
