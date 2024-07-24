# 快速开始指南

本指南适用于希望立即开始运行质押池的管理者。

## 前提条件

本指南需要 Solana CLI 工具套件和 Stake Pool CLI 工具。

- [安装 Solana 工具](https://docs.solana.com/cli/install-solana-cli-tools)
- [安装 Stake Pool CLI](https://spl.solana.com/stake-pool/cli)

你还必须拥有一个包含 SOL 的账户。假设你使用的是通过 `solana-keygen new` 在默认位置创建的默认密钥对。请注意，如果需要，可以在每个命令中覆盖默认密钥对。

如果你在本地使用 `solana-test-validator`，默认密钥对会自动启动并拥有 500,000,000 SOL。

如果你在 开发网 或 测试网 上运行，可以使用 `solana airdrop 1` 来空投资金。

如果你在 主网beta版 上运行，则必须通过其他方式（如从交易所或朋友等处）购买资金。

## 示例脚本

本指南使用 [GitHub 上的示例脚本](https://github.com/solana-labs/solana-program-library/tree/master/stake-pool/cli/scripts) 来快速轻松地运行所有内容。

你将看到以下脚本：

- `setup-test-validator.sh`：设置带有验证者投票账户的本地测试验证者
- `setup-stake-pool.sh`：创建具有硬编码参数的新质押池
- `add-validators.sh`：向质押池添加验证者
- `deposit.sh`：进行质押和 SOL 存款
- `rebalance.sh`：重新平衡质押池
- `withdraw.sh`：进行一些提款

本指南将使用大多数这些脚本在本地网络上设置质押池。

## （可选）步骤 0：设置本地网络以进行测试

所有这些脚本都可以在 开发网、测试网 或 主网beta版 上运行，但为了进行更多实验，我们将使用 `setup-test-validator.sh` 设置一个带有一些验证者投票账户的本地验证者。

该脚本接受要创建的投票账户数量和输出验证者投票账户的文件路径，例如：

```bash
$ ./setup-test-validator.sh 10 local_validators.txt
```

这大约需要 10 秒钟，最终会输出一个包含 base58 编码公钥列表的文件。这些代表本地网络上的验证者投票账户，例如：

```bash
EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
J3xu64PWShcMen99kU3igxtwbke2Nwfo8pkZNRgrq66H
38DYMkwYCvsj8TC6cNaEvFHHVDYeWDp1qUgMgyjNqZXk
7q371UZcYJTMmFPeijUJ6RBr6jHE9t4mDd2gnDs7wpje
7ffftyketRJrmCcczhSnWatxB32SzAG3dhDpnyRdm91d
HtqJXQNWr4E1qxftAxxqNnHbpSYnokayHSxurzS9vKKF
4e6EmSSmExdRM6tF1osYiAq9HxXN5oVvDqS78FcT6F4P
DrT6VGqqJT1GRVaZmuEjNim4ie7ecmNixjiycd67jyJy
71vNo5HBuAtejbcQYp9CdBeT7npVdbJqjmuWbXbNeudq
7FMebvnWnWN45KF5Fa3Y7kAJZReKU6WLzribtWDJybax
```

注意：如果另一个 `solana-test-validator` 已经在运行，这将会失败。

### 本地网络的重要注意事项

如果你使用的是 32 个槽位的纪元，那么在使用某个质押池命令时，则很有可能在使用其中一个质押池命令时传递一个纪元，导致其失败并显示：`Custom program error: 0x11`。这是完全正常的，并且在其他网络上不会发生。你只需重新运行命令。

由于测试验证者网络上没有投票活动，你需要在使用 `solana delegate-stake` 时使用 `--force` 标志，例如：

```bash
$ solana delegate-stake --force stake.json CzDy6uxLTko5Jjcdm46AozMmrARY6R2aDBagdemiBuiT
```

## 步骤 1：创建质押池

我们的下一个脚本是 `setup-stake-pool.sh`。在其中，你会看到一个很大的区域可以在其中修改你的质押池参数。这些参数用于创建新的质押池，并包括：

- 纪元（epoch）费用，以两个不同的标志表示，分子和分母
- 提款费用，以两个不同的标志表示，分子和分母
- 存款费用，以两个不同的标志表示，分子和分母
- 推荐费用（佣金），以 0 到 100 之间的数字表示（包括 0 和 100）
- 最大验证者数量（目前最高可能是 2,950）
- （可选）存款授权，用于受限制的池

虽然费用在此时似乎不太有趣或有欺骗性，但请考虑运行质押池的成本，以及潜在的恶意行为者，如果您的权益池没有费用，他们可能会滥用您的权益池。

这些参数中的每一个在池子创建后都是可修改的，因此不必担心被锁定在任何选择中。

修改参数以满足你的需求。费用尤其重要，以避免滥用，因此请花时间审查和计算最适合你的池子的费用。

仔细阅读[费用](https://spl.solana.com/stake-pool/fees)以获取有关费用和最佳实践的更多信息。

在我们的示例中，我们将使用 0.3% 的费用、50% 的推荐费用，选择不设置存款授权，并拥有最大数量的验证

```bash
$ ./setup-stake-pool.sh 15
Creating pool
+ spl-stake-pool create-pool --epoch-fee-numerator 3 --epoch-fee-denominator 1000 --withdrawal-fee-numerator 3 --withdrawal-fee-denominator 1000 --deposit-fee-numerator 3 --deposit-fee-denominator 1000 --referral-fee 50 --max-validators 2350 --pool-keypair keys/stake-pool.json --validator-list-keypair keys/validator-list.json --mint-keypair keys/mint.json --reserve-keypair keys/reserve.json
Creating reserve stake 4tvTkLB4X7ahUYZ2NaTohkG3mud4UBBvu9ZEGD4Wk9mt
Creating mint BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB
Creating associated token account DgyZrAq88bnG1TNRxpgDQzWXpzEurCvfY2ukKFWBvADQ to receive stake pool tokens of mint BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB, owned by 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
Creating pool fee collection account DgyZrAq88bnG1TNRxpgDQzWXpzEurCvfY2ukKFWBvADQ
Signature: 51yf2J6dSGAx42KPs2oTMTV4ufEm1ncAHyLPQ6PNf4sbeMHGqno7BGn2tHkUnrd7PRXiWBbGzCWpJNevYjmoLgn2
Creating stake pool Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR with validator list 86VZZCuqiz7sDJpFKjQy9c9dZQN9vwDKbYgY8pcwHuaF
Signature: 47QHcWMEa5Syg13C3SQRA4n88Y8iLx1f39wJXQAStRUxpt2VD5t6pYgAdruNRHUQt1ZBY8QwbvEC1LX9j3nPrAzn
Depositing SOL into stake pool
Update not required
Using existing associated token account DgyZrAq88bnG1TNRxpgDQzWXpzEurCvfY2ukKFWBvADQ to receive stake pool tokens of mint BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB, owned by 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
Signature: 4jnS368HcofZ1rUpsGZtmSK9kVxFzJRndSX5VS7eMV3kVgzyg9efA4mcgd2C6BoSNksTmTonRGXTVM1WMywFpiKq
```

你的质押池现在已经存在了！对于最大数量的验证者，此阶段的成本约为 2.02 SOL，加上存入池中的 15 SOL 以换取池代币。

## 步骤 2：向池中存入 SOL

现在池子已经存在，让我们存入一些 SOL 以换取一些池代币。

SOL 可能是最具吸引力的存款形式，因为它对每个人来说都是最容易使用的。通常，这可能通过 DeFi 应用或钱包完成，但在我们的示例中，我们将直接从命令行进行操作。

在创建池子时，我们已经存入了 15 SOL，但现在让我们再向池中存入 10 SOL：

```bash
$ spl-stake-pool deposit-sol Zg5YBPAk8RqBR9kaLLSoN5C8Uv7nErBz1WC63HTsCPR 10
Using existing associated token account DgyZrAq88bnG1TNRxpgDQzWXpzEurCvfY2ukKFWBvADQ to receive stake pool tokens of mint BoNneHKDrX9BHjjvSpPfnQyRjsnc9WFH71v8wrgCd7LB, owned by 4SnSuUtJGKvk2GYpBwmEsWG53zTurVM8yXGsoiZQyMJn
Signature: 4AJv6hSznYoMGnaQvjWXSBjKqtjYpjBx2MLezmRRjWRDa8vUaBLQfPNGd3kamZNs1JeWSvnzczwtzsMD5WkgKamA
```

## 步骤 3：向池中添加验证者

现在池中已经有了一些 SOL，我们需要向其中添加验证者。

使用 `add-validators.sh` 脚本，我们将把在步骤 0 中创建的每个验证者添加到质押池中。如果你在其他网络上运行，可以创建一个包含验证者投票账户的文件。

```bash
$ ./add-validators.sh keys/stake-pool.json local_validators.txt
Adding validator stake accounts to the pool
Adding stake account 3k7Nwu9jUSc6SNG11wzufKYoZXRFgxWamheGLYWp5Rvx, delegated to EhRbKi4Vhm1oUCGWHiLEMYZqDrHwEd7Jgzgi26QJKvfQ
Signature: 5Vm2n3umPXFzQgDiaib1B42k7GqsNYHZWrauoe4DUyFszczB7Hjv9r1DKWKrypc8KDiUccdWmJhHBqM1fdP6WiCm
Signature: 3XtmYu9msqnMeKJs9BopYjn5QTc5hENMXXiBwvEw6HYzU5w6z1HUkGwNW24io4Vu9WRKFFN6SAtrfkZBLK4fYjv4
... (something similar repeated 9 more times)
```

此操作将从储备中移动 1.00228288 SOL 到给定验证者的质押账户。这意味着您要添加的每个验证者都需要超过 1 个 SOL。

## 步骤 4：向池中质押

现在你的池中已有验证者，它可以接受质押账户供您管理。存款有两种可能来源：SOL 或质押账户。在步骤 2 中，我们直接存入了 SOL，所以现在我们将存入质押账户。

此选项对已经拥有质押账户的用户特别有吸引力，他们可能希望换取质押池代币，或者希望进一步分散他们的质押。
`deposit.sh` 脚本展示了如何使用 CLI 来实现这一点。

创建新的质押，将给定数量的资金存入池中的每个质押账户，使用质押池和验证者文件。

```bash
$ ./deposit.sh keys/stake-pool.json local_validators.txt 10
```

## 步骤 5：重新平衡池中的质押

随着时间的推移，当人们将 SOL 存入储备时，或者随着验证者性能的变化，你可能需要重新分配质押。最佳方式是通过一个自动化系统来收集关于质押池和网络的信息，并决定分配给每个验证者的质押数量。

Solana 基金会为其委托计划维护了一个开源机器人，可以为你的质押池进行适配。源码是 [stake-o-matic GitHub仓库](https://github.com/solana-labs/stake-o-matic/tree/master/bot) 的一部分。

此外，还有一个正在开发中的 Python 质押池机器人，可以在 [stake-pool-py on GitHub](https://github.com/solana-labs/solana-program-library/tree/master/stake-pool/py) 中找到。

在我们的示例中，我们将运行一个简单的池重新平衡器，它会按给定数量增加列表中每个验证者的质押。没有任何检查或逻辑来确保这是有效的。

```bash
$ ./rebalance.sh keys/stake-pool.json local_validators.txt 100
```

## 步骤 6：从质押池中提款

最后，如果用户想从质押池中提款，他们可以选择从储备中提取 SOL（如果储备中有足够的 SOL），或者从池中的某个质押账户中提取。

`withdraw.sh` 脚本根据质押池、验证者文件和金额，从池中的每个质押账户中移除质押和 SOL。

```bash
$ ./withdraw.sh keys/stake-pool.json local_validators.txt 100
```
