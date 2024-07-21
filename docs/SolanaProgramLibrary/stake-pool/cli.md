# 命令行界面

以下是命令行工具的Stake Pool程序中可用的指令，以及使用示例。

## 安装

`spl-stake-pool`命令行工具可用于试验SPL代币。首先确保你安装了[Rust](https://rustup.rs/)，然后运行：

```bash
$ cargo install spl-stake-pool-cli
```

运行 `spl-stake-pool --help` 查看所有可用命令的完整描述。

## 配置

`spl-stake-pool`配置与`solana`命令行工具共享。

### 当前配置

```bash
$ solana config get
Config File: ${HOME}/.config/solana/cli/config.yml
RPC URL: https://api.mainnet-beta.solana.com
WebSocket URL: wss://api.mainnet-beta.solana.com/ (computed)
Keypair Path: ${HOME}/.config/solana/id.json
```

### 集群RPC URL

参考[Solana集群](https://docs.solana.com/clusters)以获取特定于集群的RPC URL

```bash
$ solana config set --url https://api.devnet.solana.com
```

### 默认密钥对

有关如何设置密钥对（如果还没有密钥对）的信息，请参阅[密钥对规定](https://docs.solana.com/cli/conventions#keypair-conventions)。

密钥对文件

```bash
$ solana config set --keypair ${HOME}/new-keypair.json
```

参考[URL规范](https://docs.solana.com/wallet-guide/hardware-wallets#specify-a-keypair-url)设置硬件钱包URL。

```bash
$ solana config set --keypair usb://ledger/
```

### 本地运行

如果你想在不等待质押激活和停用的情况下，来本地测试质押池，你可以使用`solana-test-validator`工具运行质押池，缩短纪元（epochs）的时间，并从开发网拉取当前程序。

```bash
$ solana-test-validator -c SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy -c EmiU8AQkB2sswTxVB6aCmsAJftoowZGGDXuytm6X65R3 --url devnet --slots-per-epoch 32
$ solana config set --url http://127.0.0.1:8899 
```

## 质押池管理器示例

### 创建质押池

质押池管理器（Stake Pool Manager）以高级别控制质押池，并以SPL代币形式收取费用。管理器在创建时设置费用。例如，创建一个3%费用和最多1000个验证者质押的池：

```bash
$ spl-stake-pool create-pool --epoch-fee-numerator 3 --epoch-fee-denominator 100 --max-validators 1000
Creating reserve stake DVwDn4LTRztuai4QeenM6fyzgiwUGpVXVNZ1mgKE1Pyc
Creating mint BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB
Creating associated token account DgyZrAq88bnG1TNRxpgDQzWXpzEurCvfY2ukKFWBvADQ to receive stake pool tokens of mint BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB, owned by 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
Creating pool fee collection account DgyZrAq88bnG1TNRxpgDQzWXpzEurCvfY2ukKFWBvADQ
Signature: qQwqahLuC24wPwVdgVXtd7v5htSSPDAH3JxFNmXCv9aDwjjqygQ64VMg3WdPCiNzc4Bn8vtS3qcnUVHVP5MbKgL
Creating stake pool Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Signature: 5z6uH3EuPcujeWGpAjBtciSUR3TxtMBgWYU4ULagUso4QGzE9JenhYHwYthJ4b3rS57ByUNEXTr2BFyF5PjWC42Y
```

质押池的唯一标识符是 `Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR。`

质押池的SPL代币铸造标识符是 `BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB`。质押池对铸造有完全控制权。

质押池创建者的费用账户标识符是 `DgyZrAq88bnG1TNRxpgDQzWXpzEurCvfY2ukKFWBvADQ`。在每个纪元里，当质押池中的质押账户获得奖励时，程序会将相当于该纪元收益3%的SPL池代币铸造到这个账户。如果没有观察到收益，就什么都不会存入。

储备质押账户标识符是 `J5XB7mWpeaUZxZ6ogXT57qSCobczx27vLZYSgfSbZoBB`。此账户持有在验证者之间重新平衡时使用的额外质押。

对于有1000个验证者的质押池，创建质押池的成本不到0.5 SOL。

`create-pool`命令允许设置所有账户和密钥对为预先生成的值，包括：

- 质押池，通过 `--pool-keypair` 标识
- 验证者列表，通过 `--validator-list-keypair` 标识
- 池子代币铸造厂，通过 `--mint-keypair` 标识
- 池子储备质押账户，通过 `--reserve-keypair` 标识

否则，这些将默认为新生成的密钥对。

你可以随时运行 `spl-stake-pool create-pool -h` 来查看可用的选项。

### 创建限制性质押池

如果管理者希望将质押（质押和SOL）存款限制为特定的一个密钥，他们可以在创建时设置存款权限：

```bash
$ spl-stake-pool create-pool --epoch-fee-numerator 3 --epoch-fee-denominator 100 --max-validators 1000 --deposit-authority authority_keypair.json
Creating reserve stake DVwDn4LTRztuai4QeenM6fyzgiwUGpVXVNZ1mgKE1Pyc
Creating mint BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB
Creating associated token account DgyZrAq88bnG1TNRxpgDQzWXpzEurCvfY2ukKFWBvADQ to receive stake pool tokens of mint BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB, owned by 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
Creating pool fee collection account DgyZrAq88bnG1TNRxpgDQzWXpzEurCvfY2ukKFWBvADQ
Signature: qQwqahLuC24wPwVdgVXtd7v5htSSPDAH3JxFNmXCv9aDwjjqygQ64VMg3WdPCiNzc4Bn8vtS3qcnUVHVP5MbKgL
Creating stake pool Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Deposits will be restricted to 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn only, this can be changed using the set-funding-authority command.
Signature: 5z6uH3EuPcujeWGpAjBtciSUR3TxtMBgWYU4ULagUso4QGzE9JenhYHwYthJ4b3rS57ByUNEXTr2BFyF5PjWC42Y
```

正如输出所示，`set-funding-authority` 可以用来修改或删除存款权限。

只要设置了存款权限，SOL和质押存款必须由 `4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn` 签名，因此其他人不能参与。如前所述，这个功能不禁止提款，所以任何有池子代币的人仍然可以从池中提款。

### 设置管理者

质押池管理者可以将他们的管理员权限传递给另一个账户。

```bash
$ spl-stake-pool set-manager Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR --new-manager 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
Signature: 39N5gkaqXuWm6JPEUWfenKXeG4nSa71p7iHb9zurvdZcsWmbjdmSXwLVYfhAVHWucTY77sJ8SkUNpVpVAhe4eZ53
```

同时，他们还可以更改每个纪元接收费用的SPL代币账户。所提供代币账户的铸造厂必须是SPL代币铸造厂，在我们的例子中是 `BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB`。

```bash
$ spl-stake-pool set-manager Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR --new-fee-receiver HoCsh97wRxRXVjtG7dyfsXSwH9VxdDzC7GvAsBE1eqJz
Signature: 4aK8yzYvPBkP4PyuXTcCm529kjEH6tTt4ixc5D5ZyCrHwc4pvxAHj6wcr4cpAE1e3LddE87J1GLD466aiifcXoAY
```

### 设置费用

质押池管理者可以更新与质押池相关的任何费用，需要传入构成费用比例的分子和分母。

对于10%的纪元费用，他们可以执行以下操作：

```bash
$ spl-stake-pool set-fee Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR epoch 10 100
Signature: 5yPXfVj5cbKBfZiEVi2UR5bXzVDuc2c3ruBwSjkAqpvxPHigwGHiS1mXQVE4qwok5moMWT5RNYAMvkE9bnfQ1i93
```

为了保护质押池存款人免受恶意管理者的侵害，程序在跨越两个纪元的界限后才应用新的费用，提供了至少一个完整纪元的等待时间。

例如，如果在第100个纪元费用是1%，管理者将其设置为10%，管理者仍然会因为在第100和101个纪元赚取的奖励而获得1%的费用。从第102个纪元开始，管理者将获得10%的费用。

此外，为了防止恶意管理者立即将提款费用设置得非常高，从而使用户实际上无法提款，质押池程序目前每两个纪元界限强制执行最多增加1.5倍的限制。

例如，如果当前的提款费用是2.5%，可设置的最高费用是3.75%，将在两个纪元界限后生效。

费用类型可能的选项有`纪元费用`、`SOL提款`、`质押提款`、`SOL存款`和`质押存款`（epoch` 、 `sol-withdrawal` 、 `stake-withdrawal` 、 `sol-deposit 和 stake-deposit）。

### 设置推荐费用

质押池管理者可以随时更新存款上的推荐费，传入一个百分比金额。

要设置80%的质押存款推荐费，他们可以执行以下操作：

```bash
$ spl-stake-pool set-referral-fee Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR stake 80
Signature: 4vhaBEDhuKkVwMxy7TpyfHEk3Z5kGZKerD1AgajQBdiMRQLZuNZKVR3KQaqbUYZM7UyfRXgkZNdAeP1NfvmwKdqb
```

对于80%的推荐费，这意味着质押存款费用的20%归管理者所有，而80%归推荐人所有。

### 设置质押者

为了管理质押账户，质押池管理者或质押者可以设置质押池管理账户的质押者权限。

```
$ spl-stake-pool set-staker Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
Signature: 39N5gkaqXuWm6JPEUWfenKXeG4nSa71p7iHb9zurvdZcsWmbjdmSXwLVYfhAVHWucTY77sJ8SkUNpVpVAhe4eZ53
```

现在，新的质押者可以执行任何正常的质押池操作，包括添加和移除验证者以及重新平衡质押。

重要的安全提示：质押池程序仅向质押池质押者授予质押权限，并始终保留提款权限。因此，恶意的质押池质押者无法从质押池中窃取资金。

注意：为了避免“打扰管理者”，质押者也可以重新分配他们的质押权限。

### 设置资金权限

为了限制谁可以与池子交互，质押池管理者可能需要在质押存款、SOL存款或SOL提款上要求特定的签名。这并不会使得池子变得私有，因为所有信息都是在链上公开的，但它限制了谁可以使用池子。

例如，假设一个池子想要限制所有的SOL提款。

```bash
$ spl-stake-pool set-funding-authority Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR sol-withdraw AZ1PgxWSxw4ezX8gvpNgGsr39jJHCwtkaXr1mNMwWWeK
Signature: 3gx7ckGNSL7gUUyxh4CU3RH3Lyt88hiCvYQ4QRKtnmrZHvAS93ebP6bf39WYGTeKDMVSJUuwBEmk9VFSaWtXsHVV
```

执行此命令后，`AZ1PgxWSxw4ezX8gvpNgGsr39jJHCwtkaXr1mNMwWWeK` 必须对所有的SOL提款进行签名，否则操作将失败。

过了一段时间后，如果管理者希望启用SOL提款，他们可以移除这个限制：

```bash
$ spl-stake-pool set-funding-authority Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR sol-withdraw --unset
Signature: 5kWeBqoxyvANMHCP4ydsZRf8QU4hMotLnKkFbTEdvqEVywo4F3MpZtay7D57FbjJZpdp72fc3vrbxJi9qDLfLCnD
```

现在，只要储备中还有足够的SOL，任何人都可以从质押池中提取SOL。

资金权限相关选项有`sol-提款`、`sol-存款`和`质押存款`（ `sol-withdraw`, `sol-deposit`, and `stake-deposit`）。

注意：限制质押提款是不可能的。这将为恶意池管理者提供机会，实际上锁定用户资金。

## 质押池质押者示例

### 向池中添加验证者

为了适应大量用户向质押池存款，质押池只为每个验证者管理一个质押账户。要向质押池添加新的验证者，质押者必须使用`add-validator`命令。

用于向池中添加验证者的SOL来自质押池的储备账户。如果储备中的SOL不足，命令将失败。请确保使用`deposit-sol`命令将一些SOL转移到池中。

假设质押池中有10 SOL，让我们向质押池添加一些随机验证者。

```bash
$ spl-stake-pool add-validator Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR 38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk
Adding stake account F8e8Ympp4MkDSPZdvRxdQUZXRkMBDdyqgHa363GShAPt, delegated to 38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk
Signature: 5tdpsx64mVcSHBK8vMbBzFDHnEZB6GUmVpqSXXE5hezMAzPYwZbJCBtAHakDAiuWNcrMongGrmwDaeywhVz4i8pi
```

为了最大程度地提高审查抵抗能力，我们希望将我们的SOL分散到尽可能多的验证者那里，因此让我们再添加一些。

```bash
$ spl-stake-pool add-validator Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H
Adding stake account 5AaobwjccyHnXhFCd24uiX6VqPjXE3Ry4o92fJjqqjAr, delegated to J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H
Signature: 4xeve6gWuiffqBLAMcqa8s7dCMvBmSVdKbDu5WQhigLiXHdCjSNEwoZRexTZji786qgEjXg3nrUh4HcTt3RauZV5
$ spl-stake-pool add-validator Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
Adding stake account 3k7Nwu9jUSc6SNG11wzufKYoZXRFgxWamheGLYWp5Rvx, delegated to EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
Signature: 4VJYHpPmWkP99TdgYUTgLYixmhqmqsEkWtg4j7zvGZFjYbnLgryu48aV6ub8bqDyULzKckUhb6tvcmZmMX5AFf5G
```

我们可以使用Solana命令行工具查看质押账户的状态。

```bash
$ solana stake-account 5AaobwjccyHnXhFCd24uiX6VqPjXE3Ry4o92fJjqqjAr
Balance: 1.00228288 SOL
Rent Exempt Reserve: 0.00228288 SOL
Delegated Stake: 1 SOL
Active Stake: 0 SOL
Activating Stake: 1 SOL
Stake activates starting from epoch: 5
Delegated Vote Account Address: J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H
Stake Authority: DS3AyFN9dF1ruNBcSeo8XXQR8UyVMhcCPcnjU5GnY18S
Withdraw Authority: DS3AyFN9dF1ruNBcSeo8XXQR8UyVMhcCPcnjU5GnY18S
```

质押池创建了这些特殊的质押账户，其中1 SOL是所需的最低委托金额。质押和提款权限属于质押池提款权限，即从质押池地址派生的程序地址。

我们还可以看到质押池的状态。

```bash
$ spl-stake-pool list Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Stake Pool: Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Pool Token Mint: BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB
Epoch Fee: 3/100 of epoch rewards
Withdrawal Fee: none
Stake Deposit Fee: none
SOL Deposit Fee: none
SOL Deposit Referral Fee: none
Stake Deposit Referral Fee: none
Reserve Account: EN4px2h4gFkYtsQUi4yeCYBrdRM4DoRxCVJyavMXEAm5   Available Balance: ◎6.99315136
Vote Account: EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ      Balance: ◎1.002282880 Last Update Epoch: 4
Vote Account: J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H      Balance: ◎1.002282880 Last Update Epoch: 4
Vote Account: 38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk      Balance: ◎1.002282880 Last Update Epoch: 4
Total Pool Stake: ◎10.000000000
Total Pool Tokens: 10.00000000
Current Number of Validators: 3
Max Number of Validators: 1000
```

为了便于阅读，该工具不会显示质押池无法触及的余额。储备质押账户 `EN4px2h4gFkYtsQUi4yeCYBrdRM4DoRxCVJyavMXEAm5` 实际上还有额外的0.002282881 SOL余额，但由于这是最低要求金额，所以命令行不会显示。

### 移除验证者质押账户

如果质押池质押者希望停止委托给投票账户，他们可以完全从质押池中移除该验证者的质押账户。

和添加验证者一样，要移除的验证者质押账户必须恰好有1.00228288 SOL（1 SOL用于委托，0.00228288 SOL用于租金豁免）。

如果情况不是这样，质押者必须先将质押金额减少到这个最小数额。假设委托给`J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H`的验证者质押账户总共委托了7.5 SOL。为了减少这个数额，质押者可以执行以下操作：

```bash
$ spl-stake-pool decrease-validator-stake Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H 6.5
Signature: ZpQGwT85rJ8Y9afdkXhKo3TVv4xgTz741mmZj2vW7mihYseAkFsazWxza2y8eNGY4HDJm15c1cStwyiQzaM3RpH
```

好的，让我们尝试移除验证者`J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H`，其对应的质押账户是`5AaobwjccyHnXhFCd24uiX6VqPjXE3Ry4o92fJjqqjAr`。

```bash
$ spl-stake-pool remove-validator Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H
Removing stake account 5AaobwjccyHnXhFCd24uiX6VqPjXE3Ry4o92fJjqqjAr, delegated to J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H
Creating account to receive stake nHEEyey8KkgHuVRAUDzkH5Q4PkA4veSHuTxgG6C8L2G
Signature: 4XprnR768Ch6LUvqUVLTjMCiqdYvtjNfECh4izErqwbsASTGjUBz7NtLZHAiraTqhs7b9PoSAazetdsgXa6J4wVu
```

与普通提款不同，验证者的质押账户将被停用，并在下一个纪元与储备账户合并。

我们可以检查正在停用的质押账户：

```bash
$ solana stake-account nHEEyey8KkgHuVRAUDzkH5Q4PkA4veSHuTxgG6C8L2G
Balance: 1.002282880 SOL
Rent Exempt Reserve: 0.00228288 SOL
Delegated Stake: 1.000000000 SOL
Active Stake: 1.000000000 SOL
Stake deactivates starting from epoch: 10
Delegated Vote Account Address: J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H
Stake Authority: 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
Withdraw Authority: 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
```

### 重新平衡质押池

随着时间的推移，用户将向质押池管理的所有质押账户存款和提款，质押池的质押者可能希望重新平衡这些质押。

例如，假设质押者希望对池中的每个验证者进行相同数量的委托。当他们查看池的状态时，他们看到：

```bash
$ spl-stake-pool list Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Stake Pool: Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Pool Token Mint: BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB
Epoch Fee: 3/100 of epoch rewards
Withdrawal Fee: none
Stake Deposit Fee: none
SOL Deposit Fee: none
SOL Deposit Referral Fee: none
Stake Deposit Referral Fee: none
Reserve Account: EN4px2h4gFkYtsQUi4yeCYBrdRM4DoRxCVJyavMXEAm5   Available Balance: ◎10.006848640
Vote Account: EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ      Balance: ◎100.000000000 Last Update Epoch: 4
Vote Account: J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H      Balance: ◎10.000000000  Last Update Epoch: 4
Vote Account: 38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk      Balance: ◎10.000000000  Last Update Epoch: 4
Total Pool Stake: ◎130.006848640
Total Pool Tokens: 130.00684864
Current Number of Validators: 3
Max Number of Validators: 1000
```

这可不太好！第一个质押账户，`EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ`，分配得太多了。根据他们的策略，质押者希望`100`SOL能够均匀分配，也就是每个账户`40`SOL。他们需要将`30`SOL移动到`J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H`和`38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk`。

#### 减少验证者质押

首先，他们需要减少委托给`EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ`的质押账户`3k7Nwu9jUSc6SNG11wzufKYoZXRFgxWamheGLYWp5Rvx`上的金额，总共减少`60`SOL。

他们减少那部分SOL的操作如下：

```bash
$ spl-stake-pool decrease-validator-stake Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ 60
Signature: ZpQGwT85rJ8Y9afdkXhKo3TVv4xgTz741mmZj2vW7mihYseAkFsazWxza2y8eNGY4HDJm15c1cStwyiQzaM3RpH
```

在内部，该指令将来自验证者质押账户`3k7Nwu9jUSc6SNG11wzufKYoZXRFgxWamheGLYWp5Rvx`的60 SOL拆分并停用，转入一个临时质押账户，该账户完全由质押池拥有和管理。

一旦在下一个纪元质押被停用，`update`命令将自动将临时质押账户合并到一个储备质押账户中，该账户也完全由质押池拥有和管理。

#### 增加验证者质押

现在储备质押账户有足够的资金来执行重新平衡，质押者可以增加其他两个验证者`J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H`和`38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk`的质押。

他们向`J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H`增加了30 SOL：

```bash
$ spl-stake-pool increase-validator-stake Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H 30
Signature: 3GJACzjUGLPjcd9RLUW86AfBLWKapZRkxnEMc2yHT6erYtcKBgCapzyrVH6VN8Utxj7e2mtvzcigwLm6ZafXyTMw
```

并且他们增加了 30 SOL 到`38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk`：

```bash
$ spl-stake-pool increase-validator-stake Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR 38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk 30
Signature: 4zaKYu3MQ3as8reLbuHKaXN8FNaHvpHuiZtsJeARo67UKMo6wUUoWE88Fy8N4EYQYicuwULTNffcUD3a9jY88PoU
```

在内部，该指令也使用临时质押账户。这一次，质押池从储备质押中拆分为临时质押账户，然后将其激活到相应的验证者。

一到两个纪元后，一旦临时质押激活，update命令会自动将临时质押合并到验证者质押账户中，留下一个完全重新平衡的质押池：

```bash
$ spl-stake-pool list Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Stake Pool: Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Pool Token Mint: BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB
Preferred Deposit Validator: 38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk
Epoch Fee: 3/100 of epoch rewards
Withdrawal Fee: none
Stake Deposit Fee: none
SOL Deposit Fee: none
SOL Deposit Referral Fee: none
Stake Deposit Referral Fee: none
Reserve Account: EN4px2h4gFkYtsQUi4yeCYBrdRM4DoRxCVJyavMXEAm5   Available Balance: ◎10.006848640
Vote Account: EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ      Balance: ◎40.000000000  Last Update Epoch: 8
Vote Account: J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H      Balance: ◎40.000000000  Last Update Epoch: 8
Vote Account: 38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk      Balance: ◎40.000000000  Last Update Epoch: 8
Total Pool Stake: ◎130.006848640
Total Pool Tokens: 130.00684864
Current Number of Validators: 3
Max Number of Validators: 1000
```

由于在重新平衡过程中累积的质押奖励，池子可能无法达到完美的平衡。这是完全正常的。

### 设置首选的存款/提款验证者

由于质押池可以接受对其任何质押账户的存款，并且允许从任何质押账户提款，它可能被恶意套利者利用，这些套利者希望每个纪元都能最大化收益。

例如，如果一个质押池有1000个验证者，套利者可以向这些验证者中的任何一个质押。在时代的末尾，他们可以检查哪个验证者表现最佳，存入他们的质押，然后立即从表现最好的验证者那里提款。一旦奖励发放，他们可以取出他们宝贵的质押，并以高于原来数量的金额重新存入。

为了减轻这种套利行为，质押池的质押者可以设置首选的提款或存款验证者。任何存款或提款都必须进入相应的质押账户，这使得在没有大量资金的情况下进行这种攻击变得不可能。

让我们设置一个首选的存款验证者质押账户：

```bash
$ spl-stake-pool set-preferred-validator Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR deposit --vote-account EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
Signature: j6fbTqGJ8ehgKnSPns1adaSeFwg5M3wP1a32qYwZsQjymYoSejFUXLNGwvHSouJcFm4C78HUoC8xd7cvb5iActL
```

然后让我们将首选的提款验证者质押账户设置为同一个。

```bash
$ spl-stake-pool set-preferred-validator Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR withdraw --vote-account EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
Signature: 4MKdYLyFqU6H3311YZDeLtsoeGZMzswBHyBCRjHfkzuN1rB4LXJbPfkgUGLKkdbsxJvPRub7SqB1zNPTqDdwti2w
```

在任何时候，他们也可以选择取消设置首选验证者：

```bash
$ spl-stake-pool set-preferred-validator Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR withdraw --unset
Signature: 5Qh9FA3EXtJ7nKw7UyxmMWXnTMLRKQqcpvfEsEyBtxSPqzPAXp2vFXnPg1Pw8f37JFdvyzYay65CtA8Z1ewzVkvF
```

在`list`命令中会标记出首选验证者：

```bash
$ spl-stake-pool list Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Stake Pool: Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Pool Token Mint: BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB
Preferred Deposit Validator: EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
Preferred Withdraw Validator: EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
```

## 用户示例

### 列出验证者质押账户

为了向质押池存款，用户首先必须向与质押池相关联的验证者质押账户之一委托一些质押。命令行实用工具有一个特殊的指令，来查找哪些投票账户已经与质押池关联。

```bash
$ spl-stake-pool list Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Stake Pool: Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Pool Token Mint: BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB
Preferred Deposit Validator: 38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk
Epoch Fee: 3/100 of epoch rewards
Withdrawal Fee: none
Stake Deposit Fee: none
SOL Deposit Fee: none
SOL Deposit Referral Fee: none
Stake Deposit Referral Fee: none
Reserve Account: EN4px2h4gFkYtsQUi4yeCYBrdRM4DoRxCVJyavMXEAm5   Available Balance: ◎10.006848640
Vote Account: EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ      Balance: ◎35.000000000  Last Update Epoch: 8
Vote Account: J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H      Balance: ◎35.000000000  Last Update Epoch: 8
Vote Account: 38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk      Balance: ◎35.000000000  Last Update Epoch: 8
Total Pool Stake: ◎115.006848640
Total Pool Tokens: 115.00684864
Current Number of Validators: 3
Max Number of Validators: 1000
```

### 存款SOL

质押池直接从常规SOL钱包账户接受SOL存款，并作为交换铸造相应数量的池代币。

```bash
$ spl-stake-pool deposit-sol Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR 100
Using existing associated token account DgyZrAq88bnG1TNRxpgDQzWXpzEurCvfY2ukKFWBvADQ to receive stake pool tokens of mint BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB, owned by 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
Signature: 23CptpZaq33njCpJPAvk8XS53xXwpfqF1sGxChk3VDB5mzz7XPKQqwsreun3iwZ6b51AyHqGBaUyc6tx9fqvF9JK
```

作为回报，质押池为我们铸造了新的池代币，代表我们在池中的所有权份额。我们可以使用SPL代币命令行工具再次检查我们的质押池账户。

```bash
$ spl-token balance BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB
100.00000000
```

### 提款SOL

质押池允许直接从储备中提取SOL到常规SOL钱包账户，作为交换，会燃烧提供的池代币。

```bash
$ spl-stake-pool withdraw-sol Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR 7VXPpSxneL6JLj18Naw2gkukXtjBZfbmPh18cnoUCMD8 2
Signature: 4bqZKUUrjVspqTGqGqX4zxnHnJB67WbeukKUZRmxJ2yFmr275CtHPjZNzQJD9Pe7Q6mSxnUpcVv9FUdAbGP9RyBc
```

质押池已经燃烧了2个池代币，作为交换，向地址`7VXPpSxneL6JLj18Naw2gkukXtjBZfbmPh18cnoUCMD8`发送了SOL。

你可以检查池代币已经被燃烧的情况：

```bash
$ spl-token balance BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB
98.00000000
```

并且你可以确认收款方已经被记入：

```bash
$ solana balance 7VXPpSxneL6JLj18Naw2gkukXtjBZfbmPh18cnoUCMD8
2 SOL
```

### 质押存款

质押池也接受来自活跃质押账户的存款，因此我们必须首先创建质押账户，并将它们委托给质押池管理的其中一个验证者。使用前一节中的`list`命令，我们看到`38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk`是一个有效的投票账户，因此让我们创建一个质押账户，并将我们的质押委托到那里。

```bash
$ solana-keygen new --no-passphrase -o stake-account.json
Generating a new keypair
Wrote new keypair to stake-account.json
============================================================================
pubkey: 97wBBiLVA7fUViEew8yV8R6tTdKithZDVz8LHLfF9sTJ
============================================================================
Save this seed phrase to recover your new keypair:
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
============================================================================
$ solana create-stake-account stake-account.json 10
Signature: 5Y9r6MNoqJzVX8TWryAJbdp8i2DvintfxbYWoY6VcLEPgphK2tdydhtJTd3o3dF7QdM2Pg8sBFDZuyNcMag3nPvj
$ solana delegate-stake 97wBBiLVA7fUViEew8yV8R6tTdKithZDVz8LHLfF9sTJ 38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk
Signature: 2cDjHXSHjuadGQf1NQpPi43A8R19aCifsY16yTcictKPHcSAXN5TvXZ58nDJwkYs12tuZfTh5WVgAMSvptfrKdPP
```

两个纪元之后，当质押完全激活并且已经收到一个纪元奖励时，我们可以将质押存入质押池。

```bash
$ spl-stake-pool deposit-stake Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR 97wBBiLVA7fUViEew8yV8R6tTdKithZDVz8LHLfF9sTJ
Depositing stake 97wBBiLVA7fUViEew8yV8R6tTdKithZDVz8LHLfF9sTJ into stake pool account F8e8Ympp4MkDSPZdvRxdQUZXRkMBDdyqgHa363GShAPt
Using existing associated token account DgyZrAq88bnG1TNRxpgDQzWXpzEurCvfY2ukKFWBvADQ to receive stake pool tokens of mint BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB, owned by 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
Signature: 45x2UtA1b49eBPtRHdkvA3k8JneZzfwjptNN1kKQZaPABYiJ4hSA8qwi7qLNN5b3Fr4Z6vXhJprrTCpkk3f8UqgD
```

命令行工具（CLI）默认使用费用支付者的[关联代币账户](https://spl.solana.com/associated-token-account)来处理质押池代币，以及作为存入质押账户的提款权限。

或者，您可以自己创建一个SPL代币账户，并将其作为命令的`token-receiver`传递，并使用`withdraw-authority`标志指定质押账户上的提款权限。

```bash
$ spl-stake-pool deposit-stake Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR 97wBBiLVA7fUViEew8yV8R6tTdKithZDVz8LHLfF9sTJ --token-receiver 34XMHa3JUPv46ftU4dGHvemZ9oKVjnciRePYMcX3rjEF --withdraw-authority authority.json
Depositing stake 97wBBiLVA7fUViEew8yV8R6tTdKithZDVz8LHLfF9sTJ into stake pool account F8e8Ympp4MkDSPZdvRxdQUZXRkMBDdyqgHa363GShAPt
Signature: 4AESGZzqBVfj5xQnMiPWAwzJnAtQDRFK1Ha6jqKKTs46Zm5fw3LqgU1mRAT6CKTywVfFMHZCLm1hcQNScSMwVvjQ
```

作为回报，质押池为我们铸造了新的池代币，这些代币代表了我们在池中的所有权份额。我们可以使用SPL代币命令行工具来再次检查我们的质押池账户。

```bash
$ spl-token balance BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB
10.00000000
```

#### 关于质押存款费用的说明

质押池对于质押和SOL有各自的费用标准，因此从质押账户存款的总费用是根据租金豁免储备按SOL计算，以及委托部分按质押计算的。

例如，如果质押池的质押存款费用是1%，SOL存款费用是5%，您存入的质押账户中有10 SOL的质押金和0.00228288 SOL的租金豁免，那么收取的总费用是：

```tex
total_fee = stake_delegation * stake_deposit_fee + rent_exemption * sol_deposit_fee
total_fee = 10 * 1% + .00228288 * 5%
total_fee = 0.100114144
```

### 更新

每个纪元，网络都会向质押池管理的质押账户支付奖励，这增加了存款时铸造的池代币的价值。为了计算这些质押池代币的正确价值，我们必须每个纪元更新质押池管理的总价值。

```bash
$ spl-stake-pool update Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Signature: 2rtPNGKFSSnXFCb6MKG5wHp34dkB5hJWNhro8EU2oGh1USafAgzu98EgoRnPLi7ojQfmTpvXk4S7DWXYGu5t85Ka
Signature: 5V2oCNvZCNJfC6QXHmR2UHGxVMip6nfZixYkVjFQBTyTf2Z9s9GJ9BjkxSFGvUsvW6zc2cCRv9Lqucu1cgHMFcVU
```

如果另一个用户已经为当前时代更新了质押池余额，我们将看到不同的输出。

```bash
$ spl-stake-pool update Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR
Update not required
```

如果当前纪元没有人更新质押池，包括存款和提款在内的所有指令都将失败。更新指令是无需许可的，因此任何用户都可以在与质押池交互之前运行它。为了方便起见，命令行工具（CLI）在执行质押池的任何指令之前都会尝试进行更新。

如果质押池的临时质押处于非预期状态，且合并操作无法进行，有一个选项可以仅更新质押池余额而不执行合并，即使用`--no-merge`标志。

```bash
$ spl-stake-pool update Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR --no-merge
Signature: 5cjdZG727uzwnEEG3vJ1vskA9WsXibaEHh7imXSb2S1cwEYK4Q3btr2GEeAV8EffK4CEQ2WM6PQxawkJAHoZ4jsQ
Signature: EBHbSRstJ3HxKwYKak8vEwVMKr1UBxdbqs5KuX3XYt4ppPjhaziGEtvL2TJCm1HLokbrtMeTEv57Ef4xhByJtJP
```

紧接着，每当临时质押准备合并时，可以使用`--force`标志在同一时期强制进行另一次更新

```bash
$ spl-stake-pool update Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR --force
Signature: 5RneEBwJkFytBJaJdkvCTHFrG3QzE3SGf9vdBm9gteCcHV4HwaHzj3mjX1hZg4yCREQSgmo3H9bPF6auMmMFTSTo
Signature: 1215wJUY7vj82TQoGCacQ2VJZ157HnCTvfsUXkYph3nZzJNmeDaGmy1nCD7hkhFfxnQYYxVtec5TkDFGGB4e7EvG
```

### 提取质押

无论何时用户想要回收他们的SOL代币以及累积的奖励，他们都可以提供他们的池代币以换取一个激活的质押账户。

让我们用5个池代币来兑换活跃的质押SOL。

```bash
$ spl-stake-pool withdraw-stake Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR 5
Withdrawing ◎5.000000000, or 5 pool tokens, from stake account 3k7Nwu9jUSc6SNG11wzufKYoZXRFgxWamheGLYWp5Rvx, delegated to EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
Creating account to receive stake 5GuAyPAt6577HoGhSVRNBv6aHohVtjQ8q7q5i3X1p4tB
Signature: 5fzaKt5MU8bLjJRgNZyEktKsgweSQzFRpubCGKPeuk9shNQb4CtTkbgZ2X5MmC1VRDZ3YcCTPdtL9sFpXYfoqaeV
```

质押池收取了5个池代币，作为交换，用户收到了一个完全激活的质押账户，该账户已委托给地址 `EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ`。让我们再次检查质押账户的状态：

```bash
$ solana stake-account 5GuAyPAt6577HoGhSVRNBv6aHohVtjQ8q7q5i3X1p4tB
Balance: 5.00228288 SOL
Rent Exempt Reserve: 0.00228288 SOL
Delegated Stake: 5 SOL
Active Stake: 5 SOL
Delegated Vote Account Address: EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
Stake Authority: 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
Withdraw Authority: 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
```

注意：这个操作花费了用户一些资金，因为他们需要创建一个新的质押账户，并支付最低的租金免除费用，以便接收资金。这允许用户提取任何数量的质押池代币，即使这些代币不足以支付质押账户的租金免除。

另外，用户可以通过使用`--stake-receiver`参数来指定一个现有的未初始化的质押账户，以接收他们的质押。

```bash
$ spl-stake-pool withdraw-stake Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR  --amount 0.02 --vote-account EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ --stake-receiver CZF2z3JJoDmJRcVjtsrz1BKUUGNL3VPW5FPFqge1bzmQ
Withdrawing ◎5.000000000, or 5 pool tokens, from stake account 3k7Nwu9jUSc6SNG11wzufKYoZXRFgxWamheGLYWp5Rvx, delegated to EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
Signature: 2xBPVPJ749AE4hHNCNYdjuHv1EdMvxm9uvvraWfTA7Urrvecwh9w64URCyLLroLQ2RKDGE2QELM2ZHd8qRkjavJM
```

默认情况下，withdraw命令会使用`代币持有者`（token-owner）关联的代币账户来获取池代币。可以使用`--pool-account`标志来指定SPL代币账户。

```bash
$ spl-stake-pool withdraw-stake Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR 5 --pool-account 34XMHa3JUPv46ftU4dGHvemZ9oKVjnciRePYMcX3rjEF
Withdrawing ◎5.000000000, or 5 pool tokens, from stake account 3k7Nwu9jUSc6SNG11wzufKYoZXRFgxWamheGLYWp5Rvx, delegated to EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
Creating account to receive stake CZF2z3JJoDmJRcVjtsrz1BKUUGNL3VPW5FPFqge1bzmQ
Signature: 2xBPVPJ749AE4hHNCNYdjuHv1EdMvxm9uvvraWfTA7Urrvecwh9w64URCyLLroLQ2RKDGE2QELM2ZHd8qRkjavJM
```

默认情况下，withdraw命令会从池中最大的验证者质押账户中提取资金。也可以使用`--vote-account`标志来指定特定的投票账户进行提取。

```bash
$ spl-stake-pool withdraw-stake Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR  --amount 5 --vote-account EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
Withdrawing ◎5.000000000, or 5 pool tokens, from stake account 3k7Nwu9jUSc6SNG11wzufKYoZXRFgxWamheGLYWp5Rvx, delegated to EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
Creating account to receive stake CZF2z3JJoDmJRcVjtsrz1BKUUGNL3VPW5FPFqge1bzmQ
Signature: 2xBPVPJ749AE4hHNCNYdjuHv1EdMvxm9uvvraWfTA7Urrvecwh9w64URCyLLroLQ2RKDGE2QELM2ZHd8qRkjavJM
```

请注意，关联的验证者质押账户必须有足够的lamports来满足请求的池代币数量。

#### 特殊情况：退出有拖欠者的池子

使用储备质押，一个拖欠或恶意的质押者可以通过`decrease-validator-stake`操作将所有质押转移到储备中，这样池代币将不会获得奖励，而质押池用户也将无法提取他们的资金。

为了解决这种情况，也可以从质押池的储备中提取资金，但前提是所有的验证者质押账户都必须至少有`1 SOL + 质押账户的租金免除金额`。

```bash
$ spl-stake-pool withdraw-stake Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR 5 --use-reserve
Withdrawing ◎5.000000000, or 5 pool tokens, from stake account J5XB7mWpeaUZxZ6ogXT57qSCobczx27vLZYSgfSbZoBB
Creating account to receive stake 51XdXiBSsVzeuY79xJwWAGZgeKzzgFKWajkwvWyrRiNE
Signature: yQH9n7Go6iCMEYXqWef38ZYBPwXDmbwKAJFJ4EHD6TusBpusKsfNuT3TV9TL8FmxR2N9ExZTZwbD9Njc3rMvUcf
```

#### 特殊情况：从池中移除验证者

由于用于将验证者添加到池中的资金来自外部存款，因此拖欠或恶意的质押者可能会使用户无法通过将所有资金保持在最低金额来回收他们的SOL。

为了解决这种情况，也可以从质押池中移除验证者，但前提是所有的验证者质押账户都必须至少有`1 SOL + 质押账户的租金免除金额`。这意味着，如果验证者的质押账户中有足够的资金来覆盖租金免除，用户就可以从池中移除验证者，即使质押者试图通过保持最低金额来阻止用户回收资金。这样的机制可以保护用户的利益，确保他们能够从质押池中提取自己的份额。

```bash
$ spl-stake-pool withdraw-stake Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR 1.00228288 SOL
Withdrawing ◎1.00228288 or 1.00228288 pool tokens, from stake account J5XB7mWpeaUZxZ6ogXT57qSCobczx27vLZYSgfSbZoBB
Creating account to receive stake 51XdXiBSsVzeuY79xJwWAGZgeKzzgFKWajkwvWyrRiNE
Signature: yQH9n7Go6iCMEYXqWef38ZYBPwXDmbwKAJFJ4EHD6TusBpusKsfNuT3TV9TL8FmxR2N9ExZTZwbD9Njc3rMvUcf
```
