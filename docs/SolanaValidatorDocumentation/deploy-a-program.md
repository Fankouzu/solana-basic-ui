# 使用 CLI 部署 Solana 程序

`program`开发者可以在链上部署 （通常称为智能合约）与 Solana 工具。


## 如何部署程序

要部署程序，您需要知道程序共享对象（程序二进制文件.so）的位置：

```sh
$ solana program deploy <PROGRAM_FILEPATH>
```

部署成功会返回已部署程序的程序id：

```sh
$ Program Id: 3KS2k14CmtnuVv2fvYcvdrNgC94Y11WETBpMUGgXyWZL
```

*或者*在deploy命令中指定密钥对来部署到特定的程序id：

```sh
$ solana program deploy --program-id <KEYPAIR_FILEPATH> <PROGRAM_FILEPATH>
```

与程序共享对象位于同一目录中的匹配程序密钥对文件命名为<PROGRAM_NAME>-keypair.json。匹配程序密钥对由程序构建工具自动生成。
```sh
./path-to-program/program.so
./path-to-program/program-keypair.json
```

## 打印program帐户

要获取有关已部署程序的信息：

```
solana program show <ACCOUNT_ADDRESS>
```

示例输出如下所示：
```
Program Id: 3KS2k14CmtnuVv2fvYcvdrNgC94Y11WETBpMUGgXyWZL
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: EHsACWBhgmw8iq5dmUZzTA1esRqcTognhKNHUkPi4q4g
Authority: FwoGJNUaJN2zfVEex9BB11Dqb3NJKy3e9oY3KTh9XzCU
Last Deployed In Slot: 63890568
Data Length: 5216 (0x1460) bytes
```
* `Program Id`: 程序 ID 是在调用程序时可以在指令的 program_id 字段中引用的地址。
* `Owner`: 部署此程序的加载程序。
* `ProgramData Address`: ProgramData地址是与program账户关联的账户，该账户持有program的数据（共享对象）。
* `Authority`: 权限是该program的升级权限。
* `Last Deployed In Slot` 是程序上次部署的位置。
* `Data Length`: 数据长度是为部署保留的空间大小。当前部署的程序实际使用的空间可能更少。
