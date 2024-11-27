# 在Solana上开发
设置开发环境

Solana CLI 是连接网络的入口，可以完成从智能合约部署到优化的所有操作。为了获得最佳的开发体验，推荐设置一个本地开发环境，以便进行充分的测试和迭代。

Anchor 开发的前置条件

本指南假设您已经熟悉 Solana 的编程模型并掌握 Rust 的基础知识。对于初学者，可以参考以下资源：Rust Book 和 Rust By Example。这些资源可以提供扎实的基础知识，并通过 Anchor 框架进一步简化开发流程。

在我们开始 Anchor 开发之旅时，我们将探索 Solana 程序的开发、测试和交互的细节，为创新型区块链应用奠定基础。

安装 Anchor

设置 Anchor 包括几个简单的步骤，以安装必要的工具和软件包。本节将介绍如何安装这些工具和软件包，包括 Rust、Solana 工具套件、Yarn 和 Anchor 版本管理器。

Rust 可以通过官方 Rust 网站或使用命令行安装：

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
**安装 Solana 工具套件**

Anchor 还需要安装 Solana 工具套件。最新版本（在撰写本文时的版本为1.17.16）可以通过以下命令在 macOS 和 Linux 上安装：

```
sh -c "$(curl -sSfL https://release.solana.com/v1.17.16/install)"
```

Windows上Solana CLI套件：

```
cmd /c "curl https://release.solana.com/v1.17.16/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs"
```
然而，强烈建议您使用 Windows Subsystem for Linux (WSL)。这将使您能够在 Windows 机器上运行 Linux 环境，而无需双系统启动或启动单独的虚拟机。通过这种方式安装时，可以参考 Linux 的安装说明（例如，使用 curl 命令）。

开发者还可以将 v1.17.16 替换为他们希望下载的版本标签，或者使用 stable（稳定版）、beta（测试版）或 edge（最新开发版）等通道名称。安装完成后，运行 solana --version 以确认已安装所需版本的 Solana。

**安装Yarn**

Anchor 还需要 Yarn。Yarn 可以通过 Corepack 安装，从 Node.js 14.9 或 16.9 版本开始，所有官方的 Node.js 发行版都包含 Corepack。然而，目前 Corepack 仍处于试验阶段，因此需要运行 corepack enable 来激活它。某些第三方发行的 Node.js 可能默认未包含 Corepack。因此，在激活 Corepack 之前，可能需要运行如下命令安装它。

```
npm install -g corepack
```
**使用AVM安装Anchor**

Anchor 文档建议通过 Anchor Version Manager (AVM) 安装 Anchor。AVM 可以简化 anchor-cli 二进制文件的多版本管理和选择。这可能需要用于生成可验证的构建，或者在不同程序中使用备用版本。可以运行Cargo的以下命令来安装AVM：

```
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
```

然后,安装并使用最新版本：
```
avm install latest
avm use latest

# Verify the installation
avm --version
```

要查看 anchor-cli 的可用版本列表，可以使用 avm list 命令。开发者可以使用 avm use 命令选择特定版本。选定的版本会一直保持使用，直到被更改为其他版本。开发者可以使用 avm uninstall 命令卸载特定版本。

**通过二进制文件和源码构建安装 Anchor**

在 Linux 系统上，可以通过 npm 包 @coral-xyz/anchor-cli 获取 Anchor 的二进制文件。目前，仅支持 x86_64 Linux。因此，对于其他操作系统，开发者必须从源码构建。开发者可以直接使用 Cargo 安装 CLI。例如：

```
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli --locked
```
修改 --tag 参数可以安装其他所需版本的 Anchor。如果 Cargo 安装失败，可能需要安装其他依赖项。例如，在 Ubuntu 系统上：
```
sudo apt-get update && sudo apt-get upgrade && sudo apt-get install -y pkg-config build-essential libudev-dev
```
开发者可以通过运行 anchor --version 命令验证 Anchor 是否安装成功。

## Solana Playground
开发者在首次使用 Solana Playground 时必须创建一个 Playground Wallet。在屏幕左下角点击标有 "Not connected" 的红色状态指示器，随后会弹出以下窗口：
![](https://8bit-1.gitbook.io/~gitbook/image?url=https%3A%2F%2F1486933772-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FIBeoVp9xMrkk7k3CEA3R%252Fuploads%252FtGrPlsLsw02duhj7Iq7n%252Fhttps___dev-to-uploads.s3.amazonaws.com_uploads_articles_7af3j4ynqm8p4czm1u6t%2520%281%29.avif%3Falt%3Dmedia%26token%3D28d12d21-5e37-45b7-b69a-b213005cc524&width=768&dpr=3&quality=100&sign=7e699e3c&sv=1)

点击 `Continue` 以创建一个可在 IDE 中使用的 Devnet 钱包。

要为钱包提供资金，开发者可以在 Playground 终端中运行命令 `solana airdrop <amount>`，其中 `<amount>` 替换为所需的 Devnet SOL 数量。或者，可以访问专门的水龙头页面获取 Devnet SOL。我建议查看有关如何获取 Devnet SOL 的指南。

请注意，您可能会遇到以下错误：

```
Error: unable to confirm transaction. This can happen in situations such as transaction expiration and insufficient fee-payer funds
```

这通常是由于 Devnet 水龙头资源耗尽或请求的 SOL 数量过多引起的。当前限制为 5 SOL，这已经足够部署该程序。因此，建议从水龙头请求 5 SOL，或者运行命令 solana airdrop 5。逐步请求较小数量可能会避免速率限制的问题。

**Hello, World!**

"Hello, World!" 程序被认为是学习新框架或编程语言的绝佳入门方式。这是因为它的简单性，所有技能水平的开发者都可以轻松理解。这样的程序还可以展示新的编程模型的基本结构和语法，而无需引入复杂的逻辑或功能。"Hello, World!" 已迅速成为编码领域的标准入门程序，因此在 Anchor 中编写一个这样的程序也就理所当然。本节将介绍如何使用本地 Anchor 开发环境以及 Solana Playground 构建和部署一个 "Hello, World!" 程序。

使用本地 Anchor 开发环境创建新项目

在已安装 Anchor 的情况下，创建一个新项目非常简单：
```
anchor init hello-world
cd hello-world
```
这些命令将初始化一个名为 hello-world 的 Anchor 新项目，并进入该项目的目录。在该目录下，导航至 hello-world/programs/hello-world/src/lib.rs 文件。此文件包含以下初始代码：
```
use anchor_lang::prelude::*;

declare_id!("HZfVb1ohL1TejhZNkgFSKqGsyTznYtrwLV6GpA8BwV5Q");

#[program]
mod hello_world {
use super::*;

pub fn hello(_ctx: Context<Hello>) -> Result<()> {
    msg!("Hello, World!");
    Ok(())
}

#[derive(Accounts)]
pub struct Hello {}
}
```
Anchor 为我们准备了一些文件和目录，具体包括：

一个空的 app 文件夹，用于程序的客户端部分

一个 programs 文件夹，用于存放所有 Solana 程序

一个 tests 文件夹，用于 JavaScript 测试，其中包含根据初始代码自动生成的测试文件

一个 Anchor.toml 配置文件。如果您不熟悉 Rust，TOML 文件是一种简单易读的配置文件格式。Anchor.toml 文件用于配置 Anchor 如何与程序交互，例如程序应部署到哪个集群。

**使用 Solana Playground 创建新项目**

在 Solana Playground 上创建新项目非常简单。导航到左上角并点击

Create a New Project：

![](https://8bit-1.gitbook.io/~gitbook/image?url=https%3A%2F%2F1486933772-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FIBeoVp9xMrkk7k3CEA3R%252Fuploads%252Fey3fZZTBDNyHqDxj1lB8%252Fhttps___dev-to-uploads.s3.amazonaws.com_uploads_articles_51cj6hipch5q0z6n1c06%2520%281%29.avif%3Falt%3Dmedia%26token%3D4eec15b5-748f-401d-8b3b-4a78cc36bc72&width=768&dpr=3&quality=100&sign=490e93f0&sv=1)

接下来会弹出以下模式窗口：

![](https://8bit-1.gitbook.io/~gitbook/image?url=https%3A%2F%2F1486933772-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FIBeoVp9xMrkk7k3CEA3R%252Fuploads%252FkrcSC238IaYM7C16dWeO%252Fhttps___dev-to-uploads.s3.amazonaws.com_uploads_articles_x8l1dcgerpqkps0jdzax.avif%3Falt%3Dmedia%26token%3D90b8f963-e154-4804-abd9-86731026b731&width=768&dpr=3&quality=100&sign=12b75191&sv=1)

为您的程序命名，选择 Anchor (Rust)，然后点击 Create。这将在您的浏览器中直接创建一个新的 Anchor 项目。在左侧的 Program 部分，您将看到一个 src 目录，其中包含 lib.rs 文件，该文件具有以下初始代码：
```
use anchor_lang::prelude::*;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("11111111111111111111111111111111");

#[program]
mod hello_anchor {
    use super::*;
    pub fn initialize(ctx: Context, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Changed data to: {}!", data); // Message will show up in the tx logs
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // We must specify the space in order to initialize an account.
    // First 8 bytes are default account discriminator,
    // next 8 bytes come from NewAccount.data being type u64.
    // (u64 = 64 bits unsigned integer = 8 bytes)
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    data: u64
}
```
请注意，Solana Playground 仅生成了 client.ts 和 anchor.test.ts 文件。我建议您阅读本地使用 Anchor 创建程序的部分，以了解新 Anchor 项目通常生成的文件结构和内容的详细说明。

**编写 Hello, World!**

无论您是通过本地 Anchor 还是 Solana Playground 使用 Anchor，对于一个非常简单的 Hello, World! 程序，都可以将初始代码替换为以下内容：
![](https://8bit-1.gitbook.io/~gitbook/image?url=https%3A%2F%2F1486933772-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FIBeoVp9xMrkk7k3CEA3R%252Fuploads%252FRJLS8ZClvpQXKhHU4t6D%252Fhttps___dev-to-uploads.s3.amazonaws.com_uploads_articles_52mc4jpsazlqkm40i441.png%3Falt%3Dmedia%26token%3De1405502-8a9f-4b4a-a28e-ef0010d43aef&width=768&dpr=3&quality=100&sign=b2de037c&sv=1)

```
use anchor_lang::prelude::*;

declare_id!("HZfVb1ohL1TejhZNkgFSKqGsyTznYtrwLV6GpA8BwV5Q");

#[program]
pub mod hello-world {
    use super::*;

    pub fn initialize(ctx: Context) -> Result<()> {
        Ok(())
    }

    pub fn create_message(ctx: Context<CreateMessage>, content: String) -> Result<()> {
        let message: &mut Account<Message> = &mut ctx.accounts.message;
        let author: &Signer = &ctx.accounts.author;
        let clock: Clock = Clock::get().unwrap();

        message.author = *author.key;
        message.timestamp = clock.unix_timestamp;
        message.content = content;

        Ok(())
    }


    pub fn update_message(ctx: Context<UpdateMessage>, content: String) -> Result<()> {
        let message: &mut Account<Message> = &mut ctx.accounts.message;
        let author: &Signer = &ctx.accounts.author;
        let clock: Clock = Clock::get().unwrap();

        message.author = *author.key;
        message.timestamp = clock.unix_timestamp;
        message.content = content;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[account]
pub struct Message {
    pub author: Pubkey,
    pub timestamp: i64,
    pub content: String,
}

#[derive(Accounts)]
pub struct CreateMessage<'info> {
        #[account(init, payer = author, space = 1000)]
    pub message: Account<'info, Message>,
        #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateMessage<'info> {
        #[account(mut)]
    pub message: Account<'info, Message>,
        #[account(mut)]
    pub author: Signer<'info>,
}
```
我们将在后续部分详细介绍每个部分的具体内容。目前，需要注意宏和特性的使用，它们简化了开发过程。declare_id! 宏为程序设置了公钥。对于本地开发，anchor init 命令在设置程序时会在 target/deploy 目录中生成一个密钥对，并填充此宏。Solana Playground 也会自动为我们完成这一操作。

在我们的主要模块 hello_world 中，我们创建了一个记录 "Hello, World!" 日志的函数。它返回 Ok(()) 来表示程序成功执行。注意，我们在 ctx 前加了一个下划线，以避免控制台中出现未使用变量的警告。Hello 是一个账户结构体，但由于程序仅记录一条新消息，因此不需要传递任何账户。

就这样！没有必要接受任何账户或执行复杂的逻辑。上述代码创建了一个记录 "Hello, World!" 的程序。

**本地构建与部署**

本节将重点介绍如何部署到Localhost。虽然 Solana Playground 默认使用 Devnet，但本地开发环境可以显著提升开发体验。它不仅速度更快，还能规避在 Devnet 测试时常见的问题，例如交易所需的 SOL 不足、部署速度慢，以及当 Devnet 无法访问时无法进行测试。相比之下，本地开发可以在每次测试时保证一个全新的状态，从而提供一个更受控且高效的开发环境。

**配置工具**

首先，我们需要确保 Solana 工具套件已正确配置为用于本地主机（Localhost）开发。运行命令 `solana config set --url localhost`，以确保所有配置都指向Localhost。

同时，确保您拥有一个本地密钥对以便与 Solana 进行交互。要使用 Solana CLI 部署程序，您需要一个包含 SOL 余额的 Solana 钱包。运行 `solana address` 命令检查您是否已有本地密钥对。如果出现错误，请运行 `solana-keygen new` 命令。默认情况下，将在路径 `~/.config/solana/id.json` 创建一个新的文件系统钱包，同时提供一套助记词，用于恢复公钥和私钥。建议您保存此密钥对，即使它仅用于本地开发。请注意，如果默认位置已经存在一个文件系统钱包，`solana-keygen new` 命令不会覆盖它，除非您指定了 `--force` 参数。

配置 Anchor.toml 文件

接下来，我们需要确保 Anchor.toml 文件正确指向本地主机。请确保文件包含以下代码：

```
...
[programs.localnet]
hello-world = "EJTW6qsbfya86xeLRQpKLM8qhn11cJXmU35QbJwE11R8"
...
[provider]
cluster = "Localnet"
wallet = '~config/solana/id.json'
```
此处[programs.localnet] 表示程序在本地网络（即 Localhost）上的 ID。程序 ID 始终根据集群指定，因为同一个程序可以在不同的集群上部署到不同的地址。从开发者体验的角度来看，为部署到不同集群的程序声明新的程序 ID 可能会比较繁琐。

程序 ID 是公开的，但其密钥对存储在 target/deploy 文件夹中，并遵循基于程序名称的特定命名规则。例如，如果程序名为 hello_world，Anchor 将在 target/deploy/hello-world-keypair.json 中查找密钥对。如果部署时找不到此文件，Anchor 将生成一个新的密钥对，这将导致生成新的程序 ID。因此，在首次部署后更新程序 ID 是至关重要的。hello-world-keypair.json 文件是程序所有权的证明。如果密钥对泄露，恶意用户可能会对程序进行未经授权的更改。

通过 [provider]，我们告诉 Anchor 使用本地主机（Localhost）和指定的钱包来支付存储和交易费用。

**编写测试用例**

首先，我们将测试是否能够创建一条消息。在您的 tests/solana-hello-world.ts 文件中，在 describe() 函数中添加以下测试：
```
it("Can create a message", async () => {
    const message = anchor.web3.Keypair.generate();
    const messageContent = "Hello World!";
    await program.rpc.createMessage(messageContent, {
      accounts: {
        message: message.publicKey,
        author: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [message],
    });


    const messageAccount = await program.account.message.fetch(
      message.publicKey
    );


    assert.equal(
      messageAccount.author.toBase58(),
      provider.wallet.publicKey.toBase58()
    );
    assert.equal(messageAccount.content, messageContent);
    assert.ok(messageAccount.timestamp);
  });
```

**逐行解析：**

首先，我们生成了一个包含公钥和私钥的密钥对（Keypair）。其中，公钥将被用作要创建的消息账户的 accountId。然后，我们定义了消息的内容：“Hello World” 😉！

接着，我们使用前面定义的程序调用部署在 Solana 程序上的 createMessage 指令。

在 createMessage 指令的上下文中，我们需要提供三个账户：要创建的消息账户，消息的作者账户以及Solana 的 systemProgram 账户。我们以这些账户的公钥作为输入（请记住，账户 ID 和程序 ID 都只是公钥！）。

同时，我们需要为消息账户提供密钥对作为签名。这是因为账户需要通过该指令签名以确认系统程序创建消息账户的操作。此外，我们还需要作者钱包的签名，但 Anchor 会自动隐式提供签名，因此不需要手动处理。

等待指令执行完成后，我们通过消息账户的公钥，从我们编写的 Solana 程序中读取该消息账户的数据。

最后，我们使用 assert 库确认存储在账户中的数据（作者、消息内容和时间戳）是否符合预期。

**构建、部署和运行本地账本**

使用 `anchor build` 命令来构建程序。如果需要针对特定程序构建，可以使用 `anchor build -p` 命令，并将其替换为程序的名称。由于我们在本地网络（localnet）上开发，可以使用 Anchor CLI 的 localnet 命令来简化开发流程。例如，`anchor localnet --skip-build` 非常有用，它允许跳过工作区中程序的构建，从而节省时间，特别是在程序代码未被修改的情况下运行测试时。

如果我们现在尝试运行 `anchor deploy` 命令，将会收到一个错误。

这是因为我们的机器上尚未运行一个可供测试的 Solana 集群。我们可以运行一个本地账本来模拟集群。Solana CLI 提供了内置的测试验证器（test validator）。运行 `solana-test-validator` 命令将在工作站上启动一个功能齐全的单节点集群。它具有以下优势：
无 RPC 速率限制，
无空投限制，
可以直接部署链上程序，
从文件加载账户，
从公共集群克隆账户。

测试验证器需要在单独的终端窗口中运行，并保持运行状态，以确保本地集群保持在线并可供交互。

现在，我们可以成功运行 `anchor deploy` 命令，将程序部署到本地账本。任何传输到本地账本的数据都将保存到当前工作目录下生成的 test-ledger 文件夹中。

建议将此文件夹添加到 .gitignore 文件中，以避免将其提交到代码库。此外，退出本地账本（即在终端中按下 Ctrl + C）不会删除传输到集群的任何数据。要删除这些数据，可以移除 test-ledger 文件夹或运行 `solana-test-validator --reset`。

恭喜！您已成功将第一个 Solana 程序部署到本地！


**Solana 区块链浏览器**

开发者还可以将 Solana Explorer 配置为连接本地账本。导航到 Solana Explorer。在导航栏中，点击显示当前集群状态的绿色按钮：
![](https://8bit-1.gitbook.io/~gitbook/image?url=https%3A%2F%2Fmedia.dev.to%2Fcdn-cgi%2Fimage%2Fwidth%3D800%252Cheight%3D%252Cfit%3Dscale-down%252Cgravity%3Dauto%252Cformat%3Dauto%2Fhttps%253A%252F%252Fdev-to-uploads.s3.amazonaws.com%252Fuploads%252Farticles%252Fnlr8hf6g1i66wj3o6t8h.png&width=300&dpr=4&quality=100&sign=7ceb8046&sv=1)

这将打开一个侧边栏，允许您选择一个集群。点击 “Custom RPC URL”（自定义 RPC URL）。此时应该自动填充为 http://localhost:8899。如果没有，请手动填写该地址，使 Explorer 指向您的本地主机的 8899 端口：

![](https://media.dev.to/cdn-cgi/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F3soid7kljeemxvdysg1a.png)

**这具有以下重要意义：**

它允许开发者实时检查本地账本上的交易，类似于在 Devnet 或 Mainnet 上使用区块浏览器的功能。

更容易可视化账户、代币和程序的状态，就像它们运行在实际集群上一样。

提供关于错误和交易失败的详细信息。

提供跨集群的一致开发体验，因为这是一个相似的界面。

**部署到 Devnet**

尽管推荐使用本地主机开发，但如果开发者希望专门在 Devnet 集群上进行测试，也可以选择将程序部署到 Devnet。部署过程大致相同，不同之处在于无需运行本地账本（因为我们可以直接与完整的 Solana 集群交互！）。

运行命令 `solana config set --url devnet` 将当前选择的集群更改为 Devnet。此后，在终端中运行的任何 Solana 命令都将在 Devnet 上执行。然后，在 Anchor.toml 文件中，复制 [programs.localnet] 部分并将其重命名为 [programs.devnet]。同时，将 [provider] 的配置更改为指向 Devnet：
```
...
[programs.localnet]
hello-world = "EJTW6qsbfya86xeLRQpKLM8qhn11cJXmU35QbJwE11R8"

[programs.devnet]
hello-world = "EJTW6qsbfya86xeLRQpKLM8qhn11cJXmU35QbJwE11R8"
...
[provider]
cluster = "Devnet"
wallet = '~config/solana/id.json'
```
开发者必须确保拥有 Devnet SOL 才能部署程序。可以使用 solana airdrop 命令将 SOL 空投到默认密钥对位置 ~/.config/solana/id.json。也可以在使用 `solana airdrop`时指定一个钱包地址。此外，可以访问 Devnet 水龙头获取 SOL。我建议查看相关指南以了解如何获取 Devnet SOL。

请注意，您可能会遇到以下错误：
```
Error: unable to confirm transaction. This can happen in situations such as transaction expiration and insufficient fee-payer funds
```
这通常是由于 Devnet 水龙头资源耗尽或一次性请求过多 SOL 导致的。当前的限制为 5 SOL，这已经足够部署该程序。因此，建议从水龙头请求 5 SOL，或者执行命令 solana airdrop 5。逐步请求较小数量的 SOL 也可能避免触发速率限制。

现在，使用以下命令构建并部署程序：
```
anchor build
anchor deploy
```
恭喜！您已经成功将第一个 Solana 程序部署到 Devnet！

**在 Solana Playground 上构建和部署**

在 Solana Playground 中，导航到左侧边栏的工具图标（Tools）。点击 Build。在控制台中，您应该会看到以下内容：
```
Building...
Build successful. Completed in 2.20s..
```
请注意，declare_id! 宏中的 ID 已被覆盖。这个新的地址是我们将部署程序的位置。现在，点击 Deploy。在您的控制台中，您应该会看到类似以下的内容：
```
Deploying... This could take a while depending on the program size and network conditions.
Warning: 41 transactions not confirmed, retrying...
Deployment successful. Completed in 17s.
```
恭喜！您已通过 Solana Playground 成功将第一个 Solana 程序部署到 Devnet！

## 创建一个 Solana 钱包

钱包用于管理您的密钥和 Solana (SOL) 代币。您有两种主要选择：

- CLI 钱包：使用 Solana 命令行工具创建钱包。  
- 基于网页的钱包：常见选择包括 Phantom 和 Solflare。

附加说明：

- 安全性：始终优先保护好您的钱包助记词。  
- Solana 开发是一个快速发展的领域，请确保查看官方文档以了解最新的工具和最佳实践。  
- 可以探索 [Solana Cookbook](https://solanacookbook.com/) 这样的资源，以获取指南和示例。

现在，您已经具备在 Solana 上开发的基本知识！如果需要关于特定开发任务的指导或有其他问题，请告诉我。

### 连接钱包

我们现在已经了解了一些通过代码与网络交互的方法。在进行交易时，我们使用了私钥，但这并不适合普通用户。为了让用户能够用真实货币购买我们的产品（如 JPEG 图像），我们需要与钱包集成。

“钱包”这个名字有些奇怪，因为它们不仅仅是用来存储资产的。钱包是任何可以安全存储私钥并允许用户签署交易的工具。它们形式多样，最常见的是浏览器扩展程序，并且为开发者提供了 API，开发者可以通过这些 API 向用户建议交易。

钱包让您能够安全地执行这些操作。我们将使用最受欢迎的 Phantom 浏览器插件，当然，如果您愿意，也可以选择其他钱包。

现在，让我们将我们的 Web 应用程序连接到一个钱包，并向用户提交一个交易请求！

![](https://8bit-1.gitbook.io/~gitbook/image?url=https%3A%2F%2F1486933772-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FIBeoVp9xMrkk7k3CEA3R%252Fuploads%252FExwIu0PggnK972PVDof2%252Fhttps___dev-to-uploads.s3.amazonaws.com_uploads_articles_9vy7na48nv79bbmcm2hu.avif%3Falt%3Dmedia%26token%3Ddd9dd9f7-1890-4ea7-a81b-1d65f99673a9&width=768&dpr=3&quality=100&sign=2154d4d6&sv=1)

## 前端集成

恭喜您完成到这里！您已经成功部署了 Solana 程序，现在我们将构建一个前端应用程序，与该程序进行交互，允许您在 Solana 区块链上写入和更新消息！在本教程结束时，您将学会如何将您的 Web3 应用程序连接到用户的 Phantom 钱包，并使用您之前部署的 Solana 程序来存储可以由任何人更改的消息。我们将一起完成这个过程！

与之前一样，您可以在 GitHub 上找到完整的代码示例。

**1. 设置您的应用程序**

创建应用程序

在 “Hello World Solana Program” 教程中，我们设置了一个名为 `solana-hello-world` 的 Anchor 项目。从终端确保您位于该项目目录中。在该项目中，您会发现一个空的 `app` 文件夹。我们将用一个 Next.js TypeScript 启动模板覆盖这个空的 `app` 文件夹，它将作为我们 Web3 应用程序的基础！

```
yarn create next-app --typescript app
```
现在，`app` 文件夹中将包含一些不同的子文件夹和文件，您可以使用喜欢的代码编辑器（如 VSCode）查看它们。以下是对我们来说最重要的部分：

- 一个 `pages` 文件夹，其中包含我们将要编写的实际应用程序代码。
- 一个 `pages/api` 文件夹，其中将存放与 Solana 程序连接的代码。
- `_app.tsx` 和 `index.tsx` 文件，它们将包含我们的前端代码。
- 一个 `styles` 文件夹，其中包含应用程序的 CSS 文件。我们只需编辑一次 `Home.module.css` 文件，之后无需再担心样式问题！

接下来，进入 `app` 文件夹并安装我们需要的依赖项，包括 Anchor、Solana 和 Phantom。
```
cd app
yarn add @coral-xyz/anchor @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/wallet-adapter-base
```
这是一个 Git 提交检查点，用于确保您已成功创建应用程序！到目前为止，您应该已经能够创建一个 Next.js 项目，并添加我们稍后将使用的相关依赖库。如果完成了这些步骤，那么我们继续吧！

**设置初始前端**

使用您喜欢的代码编辑器（如 VSCode），打开 `app/pages/index.tsx` 文件。这个文件中包含了许多不需要的模板代码，请将其全部删除，并添加以下代码作为起点：

```
import styles from "../styles/Home.module.css";


export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <h1 className={styles.title}>
          Your First Solana Program with{" "}
          <a href="https://www.startonsolana.com/">SOLANA</a>!
        </h1>
      </div>
    </div>
  );
}
```
以上代码仅用于为您的应用程序渲染一个巨大的标题！接下来，打开 `app/styles/Home.module.css` 文件。同样地，其中也包含很多模板代码。将其全部删除，并添加以下内容：
```
.container {
  padding: 2rem;
}


.navbar {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}


.main {
  min-height: 80vh;
  padding: 64px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}


.title {
  margin: 0;
  line-height: 1.15;
  font-size: 64px;
  text-align: center;
}


.title a {
  color: #0070f3;
}


.title a:hover,
.title a:focus,
.title a:active {
  text-decoration: underline;
  border-color: #0070f3;
}


.message_bar {
  display: flex;
  justify-content: center;
}


.message_input {
  border: none;
  font-size: 16px;
  font-weight: 600;
  height: 48px;
  padding: 0 24px;
  border-radius: 4px;
  margin: 16px;
  text-align: center;
}


.message_button {
  background-color: #0070f3;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  height: 48px;
  padding: 0 24px;
  border-radius: 4px;
  margin: 16px;
  text-align: center;
}


.card {
  margin: 16px;
  padding: 24px;
  text-align: left;
  color: inherit;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  transition: color 0.15s ease, border-color 0.15s ease;
  max-width: 600px;
}


.card h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
}


@media (prefers-color-scheme: dark) {
  .card {
    border-color: #222;
  }
}


.loader_bar {
  display: flex;
  justify-content: center;
  align-items: center;
}


.loader {
  border: 16px solid #f3f3f3;
  border-top: 16px solid #0070f3;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 2s linear infinite;
  margin: 16px;
}


@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```
不用太担心 CSS！这些代码只是为了让我们的应用程序看起来更美观。使用 Solana 程序和创建 Web3 应用程序并不需要 CSS，它只是让界面看起来更好看 😅。如果您感兴趣，可以进一步学习相关内容。

太棒了！现在我们已经准备好查看我们的应用程序了！在终端中，从您的 `app` 目录运行以下命令，即可在 `http://localhost:3000/` 查看您的应用程序：
```
yarn dev
```
您应该会看到如下界面：

太棒了 🤩！您现在已经有了一个运行中的 Web3 应用程序。尽管我们还没有添加任何区块链相关的内容，但我们马上就要开始了！请确保您的代码与这个 Git 提交检查点一致。

现在，在终端中按下 `CTRL+C` 停止运行您的应用程序，因为我们需要进行一些修改。

**添加 Solana Program IDL**

为了最终连接到我们的 Solana 程序，我们需要添加在上一个教程中运行 `anchor build` 时生成的 IDL 文件。确保您仍然在终端中的 `app` 文件夹，使用以下命令将 IDL 和类型文件添加到我们的 Web3 应用程序代码中，以便稍后使用：

```
cp -r ../target/idl ./pages/api/idl
cp -r ../target/types ./pages/api/types
```
再来一个 Git 提交检查点，以确保您一切正常！请确保您的 Web3 应用程序看起来与上述截图一样惊艳！您的代码应该完全匹配——如果不一致，请复制并粘贴正确的代码以确保更新到位。接下来的内容会变得更加有趣 😏。

**2. 连接您的 Phantom 钱包**

忘了安装 Phantom 钱包了吗？

您应该在之前的教程中已经安装了 Phantom 钱包！如果还没有完成，您可以按照此安装教程下载并设置 Phantom。
```
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com."
```
📘

为什么我们要为 SOLANA RPC URL 创建一个特殊的文件？

当您最终将代码推送到 GitHub 仓库时，不应该在应用程序中硬编码诸如 SOLANA RPC URL 这样的私密信息。否则，某些不怀好意的人可能会找到这些信息并恶意滥用您的连接。因此，我们使用 `.env.local` 文件来隐藏 SOLANA RPC URL 和其 API KEY（如果您在使用 mainnet-beta）。得益于 `app/.gitignore` 文件，此 `.env.local` 文件不会被推送到 GitHub。问题解决了！

以下是一个快速的 Git 提交检查点，用于确认您是否正确完成了这一步！需要说明的是，我添加了一个 `.env.local.example` 文件，但在本地，您应该有一个 `.env.local` 文件（它不会被 GitHub 跟踪）。此外，您还应该添加了您的 API Key。

**添加常量和辅助函数**

现在我们已经设置了 Solana RPC URL，需要在此私有环境变量的基础上添加一些应用程序其余部分需要使用的其他变量。以 `app` 为根目录，在 `api` 文件夹下新建一个名为 `utils` 的文件夹，然后创建一个名为 `constants.ts` 的文件，并添加以下内容：

```
import idl from "../idl/solana_hello_world.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";


/* Constants for RPC Connection the Solana Blockchain */
export const commitmentLevel = "processed";
export const endpoint =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");
export const connection = new Connection(endpoint, commitmentLevel);


/* Constants for the Deployed "Hello World" Program */
export const helloWorldprogramId = new PublicKey(idl.metadata.address);
export const helloWorldprogramInterface = JSON.parse(JSON.stringify(idl));
```
**逐行解析：**

首先，我们导入了 IDL 文件以及来自 Solana Web3 库的一些相关类。  

然后，我们创建了一些常量，用于指定我们通过 Solana RPC URL 端点与 Solana 区块链连接时需要的 `commitmentLevel`。  

最后，我们从之前导入的 IDL 中添加了一些常量，以便轻松访问 `helloWorldprogramId` 和 `helloWorldprogramInterface`。我们将这些常量保存在同一个文件中，接下来调用 Solana 程序时将会非常有用。

📘

**什么是 Commitment Level（确认级别）？**

Commitment 描述了某一时刻包含交易的区块被确认的程度。您可能知道，区块链实际上是一系列交易块的链条。在被添加到链中以供应用程序读取之前，区块需要网络中的节点确认，而这需要一定时间。Commitment Level 决定了区块需要多少个节点确认后，才可以通过 Web3 应用程序的客户端读取。确认的节点越多，区块真正被附加到区块链上的可能性越大。

本质上，这是一个关于速度与安全性的权衡。读取 Solana 交易时，`processed` 是最快的，而 `finalized` 是最安全的。通常，开发者会选择中间的 `confirmed`，但对于本应用程序，我们可以使用 `processed`。关于此内容的更多信息可以在相关文档中找到。

现在，在 `app/pages/api/utils` 文件夹中，再添加一个名为 `useIsMounted.ts` 的文件，并加入以下内容：

```
import { useEffect, useState } from "react";


export default function useIsMounted() {
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);


  return mounted;
}
```
如果没有这个文件，在集成 Phantom 钱包时您可能会遇到 Hydration Error（渲染错误）。这并不是非常关键，主要需要注意的是，我们必须访问 `window.solana` 对象，而这个对象只有在组件挂载后才能被我们的应用程序访问。通过 React 的 `useEffect` 钩子，我们可以绕过这个问题！（如果感兴趣，您可以观看一个类似但使用不同钱包库的视频进行详细了解！）

好了！确保您的应用程序常量和辅助函数已经正确设置。现在，我们将在添加 Phantom 钱包代码后进行一个 Git 提交检查点 😁！

**集成 Phantom 钱包**

首先，我们需要进入 Phantom 钱包并将网络集群调整为 Devnet，以便它可以与我们的应用程序正常工作。点击左上角的“Settings”（设置）按钮，然后转到“Developer Settings”（开发者设置）。接着点击“Change Network”（更改网络），将网络调整为“Devnet”。您可以参考下面的屏幕录制 GIF。

接下来，让我们在 `app/pages/_app.ts` 文件中添加一些提供程序，以支持集成 Phantom 钱包。删除其中的模板代码，然后添加以下内容：

```
import type { AppProps } from "next/app";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { endpoint } from "./api/utils/constants";
import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/globals.css";


function MyApp({ Component, pageProps }: AppProps) {
  const phantomWallet = new PhantomWalletAdapter();


  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[phantomWallet]}>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}


export default MyApp;
```
**逐段解析：**

前几行代码只是导入我们在第 1 步中安装的相关库，这些库可以帮助应用程序支持不同类型的 Solana 钱包。

MyApp 函数这是顶级组件，用于渲染我们的应用程序。在其中，我们实例化了一个名为 `phantomWallet` 的变量，表示我们应用程序中连接用户 Phantom 钱包的一种方式。接着，我们渲染了应用程序的组件。

React Provider是一个包裹应用程序代码的封装器，为应用程序提供上下文信息，包括我们正在使用的 RPC URL 端点（Devnet）和希望展示的钱包（Phantom）。这些由我们安装的 Solana 钱包库提供的功能隐藏了许多实现细节，让钱包的集成变得无缝而高效！非常酷 😄！

好了！现在让我们通过编辑 `app/pages/index.tsx` 将 Phantom 钱包集成到页面中，如下所示：

```
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import useIsMounted from "./api/utils/useIsMounted";
import styles from "../styles/Home.module.css";


export default function Home() {
  const mounted = useIsMounted();


  return (
    <div className={styles.container}>
      <div className={styles.navbar}>{mounted && <WalletMultiButton />}</div>


      <div className={styles.main}>
        <h1 className={styles.title}>
          Your First Solana Program with{" "}
          <a href="https://www.startonsolana.com/">Solana</a>!
        </h1>
      </div>
    </div>
  );
}
```
从上次修改文件以来，我们做了一些小改动：

我们导入了一些库，以便支持钱包按钮的功能。  
我们添加了 `mounted` 函数，确保钱包按钮只在组件挂载后才渲染，这一点在之前已经提到过。  
我们使用 `WalletMultiButton` 组件，将钱包按钮添加到应用程序的右上角！

太棒了 🥳！我们已经成功将 Phantom 钱包连接到您的应用程序！现在，您可以编写代码，在用户授权的情况下代表用户发送交易，并将数据写入 Solana 区块链。这里是一个 Git 提交检查点，确保一切正常。让我们继续吧！

**3. 将应用程序连接到您的 Solana 程序**

现在我们进入最酷的部分——连接到我们部署的 Solana 程序 😤！快速给您的钱包空投一些 SOL，因为接下来我们将需要它。

```
solana airdrop 3
```

**创建一个 "Create Message" API**

让我们先明确应用程序的目标：

当用户成功连接钱包后，我们希望显示一个输入表单，让用户可以编写消息。

然后，用户点击一个按钮，将这条消息写入 Solana 区块链。

消息写入后，我们需要在应用程序中显示消息的详细信息，包括消息内容、作者（用户）以及发布时间。

实际上，我们可以通过调用 Solana 程序来实现所有这些功能。在 `app/pages/api` 文件夹中，将 `hello.ts` 重命名为 `createMessage.ts`，然后删除所有代码，并替换为以下内容：

```
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import { SolanaHelloWorld } from "./types/solana_hello_world";
import {
  connection,
  commitmentLevel,
  helloWorldprogramId,
  helloWorldprogramInterface,
} from "./utils/constants";
import { AnchorWallet } from "@solana/wallet-adapter-react";


export default async function createMessage(
  inputtedMessage: string,
  wallet: AnchorWallet,
  messageAccount: web3.Keypair
) {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: commitmentLevel,
  });


  if (!provider) return;


  /* create the program interface combining the idl, program Id, and provider */
  const program = new Program(
    helloWorldprogramInterface,
    helloWorldprogramId,
    provider
  ) as Program<SolanaHelloWorld>;


  try {
    /* interact with the program via rpc */
    const txn = await program.rpc.createMessage(inputtedMessage, {
      accounts: {
        message: messageAccount.publicKey,
        author: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [messageAccount],
    });


    const message = await program.account.message.fetch(
      messageAccount.publicKey
    );
    console.log("messageAccount Data: ", message);
    return message;
  } catch (err) {
    console.log("Transaction error: ", err);
    return;
  }
}
```
您会注意到，这段代码实际上与我们在上一个教程中编写的测试代码非常相似！我们来简单讲解一下：

导入相关库和常量后，函数会接收用户输入的消息 (`inputtedMessage`)、用户的钱包以及程序将初始化用于保存消息的账户。

上一教程中我们创建了一个provider，它是我们与 Solana 的连接桥梁，包括：
   - 一个 RPC 提供器
   - 一个 Solana 钱包地址  

Connection + Wallet =  Provider！
 此外，我们还指定了之前相同的 Commitment Level。

最后，我们调用了Solana程序来创建消息。就像我们在上一个教程的测试中所做的一样，我们包括了必要的账户和签名，以及用户输入的消息内容来完成调用。然后，我们从Solana程序中获取并返回该消息以供前端使用。

现在让我们将这个新的API端点集成到前端代码中！完整的`app/pages/index.tsx`文件内容如下所示：

```
import { useState } from "react";
import { Keypair } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import useIsMounted from "./api/utils/useIsMounted";
import createMessage from "./api/createMessage";
import styles from "../styles/Home.module.css";


export default function Home() {
  const [messageAccount, _] = useState(Keypair.generate());
  const [message, setMessage] = useState("");
  const [messageAuthor, setMessageAuthor] = useState("");
  const [messageTime, setMessageTime] = useState(0);
  const [inputtedMessage, setInputtedMessage] = useState("");


  const wallet = useAnchorWallet();
  const mounted = useIsMounted();


  return (
    <div className={styles.container}>
      <div className={styles.navbar}>{mounted && <WalletMultiButton />}</div>


      <div className={styles.main}>
        <h1 className={styles.title}>
          Your First Solana Program with{" "}
          <a href="https://www.startonsolana.com">Solana</a>!
        </h1>


        {wallet && (
          <div className={styles.message_bar}>
            <input
              className={styles.message_input}
              placeholder="Write Your Message!"
              onChange={(e) => setInputtedMessage(e.target.value)}
              value={inputtedMessage}
            />
            <button
              className={styles.message_button}
              disabled={!inputtedMessage}
              onClick={async () => {
                const message = await createMessage(
                  inputtedMessage,
                  wallet,
                  messageAccount
                );
                if (message) {
                  setMessage(message.content.toString());
                  setMessageAuthor(message.author.toString());
                  setMessageTime(message.timestamp.toNumber() * 1000);
                  setInputtedMessage("");
                }
              }}
            >
              Create a Message!
            </button>
          </div>
        )}


        {wallet && message && (
          <div className={styles.card}>
            <h2>Current Message: {message}</h2>
            <h2>
              Message Author: {messageAuthor.substring(0, 4)}
              ...
              {messageAuthor.slice(-4)}
            </h2>
            <h2>Time Published: {new Date(messageTime).toLocaleString()}</h2>
          </div>
        )}
      </div>
    </div>
  );
}
```

**让我们回顾一下我们添加的内容：**

我们导入了更多相关的库以及新创建的 `createMessage` 函数。

我们包含了一些需要使用的状态变量。

`messageAccount` 是生成的公私钥对，将用于在 Solana 区块链上存储消息。我们使用 `Keypair.generate()` 对其进行了初始化。

`message`、`messageAuthor` 和 `messageTime` 将分别存储消息的三个对应组件——内容、作者和时间戳。我们会用它们来渲染消息。

`inputtedMessage` 将跟踪用户在下面的新输入字段中输入的消息，直到他们提交消息为止。当消息被写入后，我们会清空此变量。

然后，我们在页面中添加了一个输入文本框和按钮，用户可以在连接钱包的情况下输入并提交消息。

最后，如果有提交的消息且用户的钱包仍然连接，我们会渲染消息的内容、作者和发布时间。

现在你的应用程序应该是这样的：

看看你已经取得了多大的进展 👨‍🎓！你已经创建了一个可以连接用户钱包并将用户编写的消息提交到区块链的应用程序，**并且**你还能在应用程序中显示这些消息。太令人印象深刻了。我们已经完成了 99% 的工作——这是一个 Git 提交检查点，确保你的代码一切就绪。

恭喜！你现在拥有了一个完整的 Web3 应用程序！用户现在可以将消息写入 Solana 区块链，并在以后编辑这条消息！这是一个 Git 提交检查点，确保你的应用程序功能正常。