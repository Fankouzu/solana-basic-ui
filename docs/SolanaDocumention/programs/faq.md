# 常见问题

在编写或使用Solana程序时，经常会遇到一些常见问题或挑战。以下是一些资源，帮助解答这些问题。

如果这里没有解决，请在[StackExchange](https://solana.stackexchange.com/questions/ask?tags=solana-program)上使用`solana-program`标签提问。

## 限制

在Solana区块链上开发程序有一些固有的限制。以下是你可能会遇到的一些常见限制。

详见[开发程序的限制](/docs/programs/limitations.md)

## Berkeley Packet Filter (BPF)

Solana链上程序通过[LLVM编译器基础设施](https://llvm.org/)编译为包含[Berkeley Packet Filter (BPF)](https://en.wikipedia.org/wiki/Berkeley_Packet_Filter)字节码的[可执行和链接格式 (ELF)](https://en.wikipedia.org/wiki/Executable_and_Linkable_Format)。

由于Solana使用LLVM编译器基础设施，程序可以用任何能针对LLVM的BPF后端的编程语言编写。

BPF提供了一种高效的[指令集](https://github.com/iovisor/bpf-docs/blob/master/eBPF.md)，可以在解释虚拟机中执行，也可以作为高效的即时编译本地指令执行。

## 内存映射

Solana SBF程序使用的虚拟地址内存映射是固定的，布局如下：

- 程序代码从0x100000000开始
- 堆栈数据从0x200000000开始
- 堆数据从0x300000000开始
- 程序输入参数从0x400000000开始

上述虚拟地址是起始地址，但程序只能访问内存映射的一部分。如果程序尝试读取或写入未授权的虚拟地址，将会触发程序崩溃，并返回包含尝试违规地址和大小的`AccessViolation`错误。

## InvalidAccountData

这个程序错误可能由多种原因引起。通常是因为传递给程序的账户不符合预期，可能是指令中的位置错误或账户与正在执行的指令不兼容。

在执行跨程序指令时，如果忘记提供被调用程序的账户，也可能导致这个错误。

## InvalidInstructionData

在尝试反序列化指令时可能会发生这个程序错误，检查传递的结构是否与指令完全匹配。字段之间可能有一些填充。如果程序实现了Rust的`Pack`特性，可以尝试打包和解包指令类型`T`，以确定程序期望的确切编码。

## MissingRequiredSignature

某些指令要求账户是签名者；如果账户预期是签名者但不是，将返回此错误。

在执行需要签名程序地址的跨程序调用时，如果传递的签名者种子与创建程序地址时使用的签名者种子不匹配，也可能导致这个错误。

## `rand` Rust依赖导致编译失败

详见[Rust项目依赖](/docs/programs/lang-rust.md#project-dependencies)

## Rust限制

详见[Rust限制](/docs/programs/lang-rust.md#restrictions)

## 堆栈

SBF使用堆栈帧而不是可变堆栈指针。每个堆栈帧大小为4KB。

如果程序违反了堆栈帧大小限制，编译器会报告超限警告。

例如：

```text
Error: Function _ZN16curve25519_dalek7edwards21EdwardsBasepointTable6create17h178b3d2411f7f082E Stack offset of -30728 exceeded max offset of -4096 by 26632 bytes, please minimize large stack variables
```

消息标识了哪个符号超出了其堆栈帧，但如果是Rust或C++符号，名称可能会被混淆。

> 要解混淆Rust符号，请使用[rustfilt](https://github.com/luser/rustfilt)。

上述警告来自一个Rust程序，所以解混淆后的符号名称是：

```shell
rustfilt _ZN16curve25519_dalek7edwards21EdwardsBasepointTable6create17h178b3d2411f7f082E
curve25519_dalek::edwards::EdwardsBasepointTable::create
```

要解混淆C++符号，请使用binutils中的`c++filt`。

报告警告而不是错误的原因是某些依赖的crate可能包含违反堆栈帧限制的功能，即使程序不使用这些功能。如果程序在运行时违反堆栈大小限制，将报告`AccessViolation`错误。

SBF堆栈帧占用从`0x200000000`开始的虚拟地址范围。

## 堆大小

程序可以直接在C中或通过Rust的`alloc` API访问运行时堆。为了快速分配，使用了一个简单的32KB突增堆。堆不支持`free`或`realloc`，所以要明智地使用它。

内部，程序可以访问从虚拟地址0x300000000开始的32KB内存区域，并可以根据程序的具体需求实现自定义堆。

- [Rust程序堆使用](/docs/programs/lang-rust.md#heap)
- [C程序堆使用](/docs/programs/lang-c.md#heap)

## 加载器

程序通过运行时加载器部署和执行，目前支持两个加载器
[BPF加载器](https://github.com/solana-labs/solana/blob/7ddf10e602d2ed87a9e3737aa8c32f1db9f909d8/sdk/program/src/bpf_loader.rs#L17)
和
[BPF加载器已弃用](https://github.com/solana-labs/solana/blob/7ddf10e602d2ed87a9e3737aa8c32f1db9f909d8/sdk/program/src/bpf_loader_deprecated.rs#L14)

加载器可能支持不同的应用程序二进制接口，因此开发人员必须为特定加载器编写并部署程序。如果为一个加载器编写的程序部署到另一个加载器，通常会由于程序输入参数的反序列化不匹配而导致`AccessViolation`错误。

实际上，程序应始终针对最新的BPF加载器编写，最新的加载器是命令行界面和JavaScript API的默认加载器。

有关为特定加载器实现程序的语言特定信息，请参见：

- [Rust程序入口点](/docs/programs/lang-rust.md#program-entrypoint)
- [C程序入口点](/docs/programs/lang-c.md#program-entrypoint)

### 部署

SBF程序部署是将BPF共享对象上传到程序账户的数据中并将账户标记为可执行的过程。客户端将BPF共享对象分成较小的部分，并将它们作为[`Write`](https://github.com/solana-labs/solana/blob/bc7133d7526a041d1aaee807b80922baa89b6f90/sdk/program/src/loader_instruction.rs#L13)指令的数据发送到加载器，加载器将数据写入程序的账户数据中。一旦接收到所有部分，客户端发送[`Finalize`](https://github.com/solana-labs/solana/blob/bc7133d7526a041d1aaee807b80922baa89b6f90/sdk/program/src/loader_instruction.rs#L30)指令到加载器，加载器验证SBF数据有效并将程序账户标记为_可执行_。一旦程序账户被标记为可执行，后续交易可以发出指令让该程序处理。

当指令指向可执行的SBF程序时，加载器配置程序的执行环境，序列化程序的输入参数，调用程序的入口点，并报告遇到的任何错误。

有关更多信息，请参见[部署程序](/docs/programs/deploying.md)。

### 输入参数序列化

SBF加载器将程序输入参数序列化为字节数组，然后传递给程序的入口点，程序负责在链上反序列化它。弃用的加载器和当前加载器之间的一个变化是输入参数的序列化方式，使得各种参数在对齐的字节数组中落在对齐的偏移量上。这允许反序列化实现直接引用字节数组并为程序提供对齐的指针。

有关序列化的语言特定信息，请参见：

- [Rust程序参数反序列化](/docs/programs/lang-rust.md#parameter-deserialization)
- [C程序参数反序列化](/docs/programs/lang-c.md#parameter-deserialization)

最新的加载器按如下方式序列化程序输入参数（所有编码为小端）：

- 8字节无符号账户数量
- 对于每个账户
  - 1字节指示是否为重复账户，如果不是重复账户，则值为0xff，否则值为重复账户的索引。
  - 如果是重复账户：7字节填充
  - 如果不是重复账户：
    - 1字节布尔值，账户是否为签名者
    - 1字节布尔值，账户是否可写
    - 1字节布尔值，账户是否可执行
    - 4字节填充
    - 32字节账户公钥
    - 32字节账户所有者公钥
    - 8字节无符号账户拥有的lamports数量
    - 8字节无符号账户数据字节数
    - x字节账户数据
    - 10k字节填充，用于重新分配
    - 足够的填充以对齐偏移量到8字节。
    - 8字节租赁周期
- 8字节无符号指令数据数量
- x字节指令数据
- 32字节程序ID

Citations:
[1] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/1785762/b8060ac4-4af9-405b-9833-397a0e3ba766/faq.md