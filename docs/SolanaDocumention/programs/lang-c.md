### 使用C语言开发

Solana支持使用C和C++编写链上程序。

## 项目布局

C项目的布局如下：

```text
/src/<程序名>
/makefile
```

`makefile`应包含以下内容：

```shell
OUT_DIR := <放置生成的共享对象的路径>
include ~/.local/share/solana/install/active_release/bin/sdk/sbf/c/sbf.mk
```

sbf-sdk可能不在上述确切位置，但如果你按照[如何构建](#how-to-build)设置环境，那么它应该会在正确的位置。

## 如何构建

首先设置环境：

- 从 https://rustup.rs 安装最新的Rust稳定版
- 安装最新的[Solana命令行工具](https://docs.solanalabs.com/cli/install)

然后使用make进行构建：

```shell
make -C <程序目录>
```

## 如何测试

Solana使用[Criterion](https://github.com/Snaipe/Criterion)测试框架，每次构建程序时都会执行测试[如何构建](#how-to-build)。

要添加测试，创建一个新文件，放在源文件旁边，命名为`test_<程序名>.c`，并用Criterion测试用例填充它。有关如何编写测试用例的信息，请参见[Criterion文档](https://criterion.readthedocs.io/en/master)。

## 程序入口点

程序导出一个已知的入口点符号，Solana运行时在调用程序时会查找并调用该符号。Solana支持多个版本的SBF加载器，入口点可能因版本而异。程序必须为相同的加载器编写和部署。有关更多详细信息，请参见[加载器FAQ部分](/docs/programs/faq.md#loaders)。

目前有两个支持的加载器：
[SBF Loader](https://github.com/solana-labs/solana/blob/7ddf10e602d2ed87a9e3737aa8c32f1db9f909d8/sdk/program/src/bpf_loader.rs#L17)
和
[SBF Loader deprecated](https://github.com/solana-labs/solana/blob/7ddf10e602d2ed87a9e3737aa8c32f1db9f909d8/sdk/program/src/bpf_loader_deprecated.rs#L14)。

它们都有相同的原始入口点定义，以下是运行时查找并调用的原始符号：

```c
extern uint64_t entrypoint(const uint8_t *input)
```

这个入口点接受传入一个通用的字节数组参数，其中包含序列化的程序参数（程序ID、账户、指令数据等）。要反序列化参数，每个加载器都有自己的[辅助函数](#serialization)。

### 序列化

每个加载器提供一个辅助函数，将程序的输入参数反序列化为C类型：

- [SBF Loader反序列化](https://github.com/solana-labs/solana/blob/d2ee9db2143859fa5dc26b15ee6da9c25cc0429c/sdk/sbf/c/inc/solana_sdk.h#L304)
- [SBF Loader deprecated反序列化](https://github.com/solana-labs/solana/blob/8415c22b593f164020adc7afe782e8041d756ddf/sdk/sbf/c/inc/deserialize_deprecated.h#L25)

一些程序可能希望自己进行反序列化，它们可以通过提供自己的[原始入口点](#program-entrypoint)实现。请注意，提供的反序列化函数会保留对程序允许修改的变量（lamports、账户数据）的序列化字节数组的引用。这样做的原因是返回时加载器会读取这些修改，以便于提交。如果程序实现了自己的反序列化函数，则需要确保程序希望提交的任何修改都必须写回输入字节数组。

有关加载器如何序列化程序输入的详细信息，请参见[输入参数序列化](https://solana.com/docs/programs/faq#input-parameter-serialization)文档。

## 数据类型

加载器的反序列化辅助函数会填充[SolParameters](https://github.com/solana-labs/solana/blob/8415c22b593f164020adc7afe782e8041d756ddf/sdk/sbf/c/inc/solana_sdk.h#L276)结构：

```c
/**
 * 程序入口点输入数据反序列化后的结构。
 */
typedef struct {
  SolAccountInfo* ka; /** 指向SolAccountInfo数组的指针，必须已经指向一个SolAccountInfos数组 */
  uint64_t ka_num; /** `ka`中SolAccountInfo条目的数量 */
  const uint8_t *data; /** 指向指令数据的指针 */
  uint64_t data_len; /** 指令数据的长度（字节） */
  const SolPubkey *program_id; /** 当前执行程序的program_id */
} SolParameters;
```

'ka'是指令引用的账户的有序数组，表示为[SolAccountInfo](https://github.com/solana-labs/solana/blob/8415c22b593f164020adc7afe782e8041d756ddf/sdk/sbf/c/inc/solana_sdk.h#L173)结构。账户在数组中的位置表示其含义，例如，在转移lamports时，指令可能将第一个账户定义为源账户，第二个账户定义为目标账户。

`SolAccountInfo`结构的成员是只读的，除了`lamports`和`data`。程序可以根据“运行时执行政策”修改这两个成员。当指令多次引用同一个账户时，数组中可能会有重复的`SolAccountInfo`条目，但它们都指向原始输入字节数组。程序应谨慎处理这些情况，以避免对同一缓冲区的重叠读/写。如果程序实现了自己的反序列化函数，应小心处理重复账户。

`data`是指令正在处理的[指令数据](/docs/core/transactions.md#instruction)的通用字节数组。

`program_id`是当前执行程序的公钥。

## 堆

C程序可以通过系统调用[`calloc`](https://github.com/solana-labs/solana/blob/c3d2d2134c93001566e1e56f691582f379b5ae55/sdk/sbf/c/inc/solana_sdk.h#L245)分配内存，或在从虚拟地址x300000000开始的32KB堆区域上实现自己的堆。堆区域也被`calloc`使用，因此如果程序实现了自己的堆，则不应调用`calloc`。

## 日志记录

运行时提供了两个系统调用，它们可以接受数据并将其记录到程序日志中。

- [`sol_log(const char*)`](https://github.com/solana-labs/solana/blob/d2ee9db2143859fa5dc26b15ee6da9c25cc0429c/sdk/sbf/c/inc/solana_sdk.h#L128)
- [`sol_log_64(uint64_t, uint64_t, uint64_t, uint64_t, uint64_t)`](https://github.com/solana-labs/solana/blob/d2ee9db2143859fa5dc26b15ee6da9c25cc0429c/sdk/sbf/c/inc/solana_sdk.h#L134)

[调试](/docs/programs/debugging.md#logging)部分有更多关于使用程序日志的信息。

## 计算预算

使用系统调用`sol_remaining_compute_units()`返回一个`u64`，表示此交易剩余的计算单元数。

使用系统调用[`sol_log_compute_units()`](https://github.com/solana-labs/solana/blob/d3a3a7548c857f26ec2cb10e270da72d373020ec/sdk/sbf/c/inc/solana_sdk.h#L140)记录一条消息，包含程序在执行停止前可以消耗的剩余计算单元数。

有关更多信息，请参见[计算预算](/docs/core/fees.md#compute-budget)文档。

## ELF转储

可以将SBF共享对象的内部内容转储到文本文件中，以更深入地了解程序的组成及其在运行时可能执行的操作。转储将包含ELF信息以及所有符号和实现它们的指令列表。某些SBF加载器的错误日志消息会引用发生错误的特定指令编号。这些引用可以在ELF转储中查找，以识别出错的指令及其上下文。

要创建转储文件：

```shell
cd <程序目录>
make dump_<程序名>
```

## 示例

[Solana程序库github](https://github.com/solana-labs/solana-program-library/tree/master/examples/c)仓库包含一系列C语言示例。
