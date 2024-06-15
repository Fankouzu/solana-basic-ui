# 安装 Solana CLI

可以根据您习惯的工作流程，在您的计算机上安装Solana工具:

- [使用Solana的安装工具（最简单的选项）](https://docs.solanalabs.com/cli/install#use-solanas-install-tool)
- [下载预构建的二进制文件](https://docs.solanalabs.com/cli/install#download-prebuilt-binaries)
- [从源代码构建](https://docs.solanalabs.com/cli/install#build-from-source)
- [使用 Homebrew](https://docs.solanalabs.com/cli/install#use-homebrew)

## 使用Solana的安装工具

### MacOS 和 Linux

- 打开您习惯的终端应用程序
- 通过运行以下命令在您的计算机上安装 Solana 版本 v1.18.15：

```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.15/install)"
```

- 您可以将 `v1.18.16` 替换为与所需版本的软件版本匹配的版本标记，也可以使用以下任一标记渠道名称： `stable` 、 `beta` 或 `edge` 。
- 以下输出表示更新成功：

```bash
downloading v1.18.15 installer
Configuration: /home/solana/.config/solana/install/config.yml
Active release directory: /home/solana/.local/share/solana/install/active_release
* Release version: v1.18.15
* Release URL: https://github.com/solana-labs/solana/releases/download/v1.18.15/solana-release-x86_64-unknown-linux-gnu.tar.bz2
Update successful
```

- 根据不同系统，安装程序消息的末尾可能会提示您

```bash
Please update your PATH environment variable to include the solana programs:
```

- 如果收到上述消息，请将建议的命令复制并粘贴到其下方进行更新`PATH`
- 通过运行以下命令确认您已安装所需的版本`solana`：

```bash
solana --version
```

- 安装成功后， `solana-install update`可用于随时将 Solana 软件进行版本更新。

------

### Windows

- 以管理员身份打开命令提示符 （ `cmd.exe` ）
  - 在 Windows 搜索栏中搜索命令提示符。当命令提示符应用出现时，右键单击并选择“以管理员身份打开”。如果弹出窗口提示您“是否要允许此应用对设备进行更改？”，请单击“是”。
- 复制并粘贴以下命令，然后按 Enter 键将 Solana 安装程序下载到临时目录中：

```bash
cmd /c "curl https://release.solana.com/v1.18.15/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs"
```

- 复制并粘贴以下命令，然后按 Enter 键安装最新版本的 Solana。如果您看到系统弹出安全窗口，请选择允许程序运行。

```bash
C:\solana-install-tmp\solana-install-init.exe v1.18.15
```

- 安装程序完成后，按 Enter。
- 关闭命令提示符窗口，然后以普通用户身份打开新的命令提示符窗口
  - 在搜索栏中搜索“命令提示符”，然后左键单击命令提示符应用程序图标，无需以管理员身份运行）
- 通过输入以下命令确认您已安装所需的`solana`版本：

```bash
solana --version
```

- 安装成功后， `solana-install update`可用于随时将 Solana 软件进行版本更新

## 下载预构建的二进制文件

如果您不想使用`solana-install`来管理安装，可以手动下载并安装二进制文件。

### Linux

在https://github.com/solana-labs/solana/releases/latest下载二进制文件**solana-release-x86_64-unknown-linux-gnu.tar.bz2**,然后解压归档文件：

```bash
tar jxf solana-release-x86_64-unknown-linux-gnu.tar.bz2
cd solana-release/
export PATH=$PWD/bin:$PATH
```

### MacOS

在https://github.com/solana-labs/solana/releases/latest下载二进制文件**solana-release-x86_64-apple-darwin.tar.bz2**,然后解压归档文件：

```bash
tar jxf solana-release-x86_64-apple-darwin.tar.bz2
cd solana-release/
export PATH=$PWD/bin:$PATH
```

### Windows

- 在https://github.com/solana-labs/solana/releases/latest, 下载二进制文件**solana-release-x86_64-pc-windows-msvc.tar.bz2**, 然后使用Winzip或类似工具提取存档：
- 打开命令提示符并导航到解压二进制文件的目录，然后运行：

```bash
cd solana-release/
set PATH=%cd%/bin;%PATH%
```

## 从源代码开始构建

如果您无法使用预构建的二进制文件，或者更喜欢从源代码构建，请按照以下步骤操作，确保您的系统已安装必要的前提条件。

### 前提条件

在从源代码生成之前，请确保安装：

#### 对于 Debian 和其他 Linux 发行版：

Rust语言：在 https://www.rust-lang.org/tools/install 选中“安装 Rust”，推荐使用以下命令：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

安装构建依赖项：

- 基本构建工具
- 软件包配置
- Udev 和 LLM 及 libclang
- 协议缓冲区

```bash
apt-get install \
    build-essential \
    pkg-config \
    libudev-dev llvm libclang-dev \
    protobuf-compiler
```

#### 对于其他 Linux 发行版：

将`apt`替换为发行版的包管理器（例如， `yum` ， `dnf` ， `pacman` ），并根据需要调整包名称。

#### 对于 macOS：

安装 Homebrew（如果尚未安装），请在 https://brew.sh/ 选中“安装 Hombrew”，推荐使用以下命令：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```


使用 Homebrew 安装必要的工具和库：

```bash
brew install rust pkg-config libudev protobuf llvm coreutils
```

按照 brew install 命令末尾给出的有关 `PATH` 配置的说明进行操作。

#### 对于 Windows：


Rust语言：在 https://www.rust-lang.org/tools/install 选中“安装 Rust”，推荐使用以下命令：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

- 在[Visual Studio downloads page](https://visualstudio.microsoft.com/downloads/)下载并安装适用于 Visual Studio 的生成工具（2019 或更高版本）。请确保安装中包含 C++ 生成工具。 
- 安装 LLVM：在[official LLVM download page](https://releases.llvm.org/download.html)下载并安装 LLVM。
- 安装 Protocol Buffers Compiler （protoc）：在 [GitHub releases page of Protocol Buffers](https://github.com/protocolbuffers/protobuf/releases)下载`protoc` ，并将其添加到 `PATH` .

::: tip INFO

Windows 10 或 11 上的用户可能需要安装适用于 Linux 的 Windows 子系统 （WSL） 才能从源代码生成。WSL 提供现有 Windows 安装中运行的 Linux 环境。这样，您可以运行常规 Linux 软件，包括 Solana CLI 的 Linux 版本。

安装后，在 Windows 终端运行 `wsl` ，然后继续执行上面的 Debian 和其他 Linux 发行版。

:::

### 从源代码构建

安装好必备必备条件后，继续从源代码构建 Solana，在[Solana's GitHub releases page](https://github.com/solana-labs/solana/releases/latest)下载源代码文件。解压代码并使用以下命令构建二进制文件：

```bash
./scripts/cargo-install-all.sh .
export PATH=$PWD/bin:$PATH
```

然后，您可以运行以下命令以获得与预构建二进制文件相同的结果：

```bash
solana-install init
```

## 使用 Homebrew

此选项要求您在 MacOS 或 Linux 计算机上安装[Homebrew](https://brew.sh/) 包管理器。

### MacOS 和 Linux

- 按照以下说明进行操作： https://formulae.brew.sh/formula/solana

[Homebrew formulae](https://github.com/Homebrew/homebrew-core/blob/HEAD/Formula/solana.rb) 在每次`solana`发布后都会更新，但也可能存在 Homebrew 版本过时的情况。

- 通过输入以下命令确认您已 `solana` 安装所需的版本：

```bash
solana --version
```
