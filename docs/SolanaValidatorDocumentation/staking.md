# 使用 Solana CLI 质押 SOL

收到SOL后，您可以考虑通过将质押委托给验证者节点来使用它。质押就是我们所说的质押账户中的代币。Solana 根据委托给他们的质押量来衡量验证者节点的投票，这让这些节点在确定区块链中下一个有效的交易块时拥有更大的影响力。然后，Solana 会定期生成新的 SOL 来奖励质押者和验证者节点。您委托的质押越多，您获得的奖励就越多。

> **更多信息**:
> 
> 要了解有关质押的概述，请首先阅读 [质押和通胀常见问题解答](https://solana.com/staking).

## 创建一个质押账户

要委托质押，您需要将一些代币转入质押账户。要创建账户，您需要一个密钥对。其公钥将用作[质押账户地址](https://solana.com/docs/economics/staking/stake-accounts#account-address)。这里不需要密码或加密；创建质押账户后，此密钥对将被丢弃。

``` bash
solana-keygen new --no-passphrase -o stake-account.json
```
输出将在文本后包含公钥 `pubkey:`
``` bash
pubkey: GKvqsuNcnwWqPzzuhLmGi4rzzh55FhJtGizkhHaEJqiV
```
复制公钥并将其保存以备不时之需。当您下次想要对质押账户执行操作时，您将需要它。
现在，创建一个质押账户：
```bash
solana create-stake-account --from <KEYPAIR> stake-account.json <AMOUNT> \
    --stake-authority <KEYPAIR> --withdraw-authority <KEYPAIR> \
    --fee-payer <KEYPAIR>
```
`<AMOUNT>` 代币从 "from" 处的账户转移 `<KEYPAIR>` 到 stake-account.json 公钥处的新质押账户。

现在可以暂时丢弃 stake-account.json 文件。要授权其他操作，您将使用 `--stake-authority` 或者 `--withdraw-authority` 密钥对，而不是 stake-account.json。

使用以下命令查看新的质押账户 `solana stake-account`：
```bash
solana stake-account <STAKE_ACCOUNT_ADDRESS>
```
输出将类似于此：
```
Total Stake: 5000 SOL
Stake account is undelegated
Stake Authority: EXU95vqs93yPeCeAU7mPPu6HbRUmTFPEiGug9oCdvQ5F
Withdraw Authority: EXU95vqs93yPeCeAU7mPPu6HbRUmTFPEiGug9oCdvQ5F
```
## 设置质押和提取权限
[质押和提取权限](https://solana.com/docs/economics/staking/stake-accounts#understanding-account-authorities) 
可以在创建账户时通过 `--stake-authority` 和 `--withdraw-authority` 选项设置, 也可以在创建账户后使用 `solana stake-authorize` 命令设置。
例如，要设置新的质押权限，请运行：
```bash
solana stake-authorize <STAKE_ACCOUNT_ADDRESS> \
    --stake-authority <KEYPAIR> --new-stake-authority <PUBKEY> \
    --fee-payer <KEYPAIR>
```
这将使用现有的质押权限密钥对 `<KEYPAIR>` 来授权一个新的质押权限公钥 `<PUBKEY>` 给质押账户 `<STAKE_ACCOUNT_ADDRESS>`。

## <span id="高级-派生质押账户地址">高级: 派生质押账户地址</span>

当你委托质押时，你将质押账户中的所有代币委托给单个节点。要委托给多个节点，你需要多个质押账户。为每个账户创建一个新的密钥对并管理这些地址可能会很繁琐。幸运的是，你可以使用 `--seed` 选项派生质押地址：
```bash
solana create-stake-account --from <KEYPAIR> <STAKE_ACCOUNT_KEYPAIR> --seed <STRING> <AMOUNT> \
    --stake-authority <PUBKEY> --withdraw-authority <PUBKEY> --fee-payer <KEYPAIR>
```
`<STRING>` 是一个任意字符串，长度最多为32字节，通常是一个数字，用于表示这是第几个派生账户。第一个账户可能是 "0", 然后是 "1", 依此类推。`<STAKE_ACCOUNT_KEYPAIR>` 的公钥作为基础地址。该命令从基础地址和种子字符串派生出一个新地址。要查看命令将派生出哪个质押地址，可以使用 `solana create-address-with-seed`:
```bash
solana create-address-with-seed --from <PUBKEY> <SEED_STRING> STAKE
```
`<PUBKEY>` 是传递给 `solana create-stake-account`的 `<STAKE_ACCOUNT_KEYPAIR>` 的公钥。
该命令将输出一个派生地址，该地址可以用作质押操作中的 `<STAKE_ACCOUNT_ADDRESS>` 参数。
## 委托质押
要将您的权益委托给验证者，您需要其投票账户地址。可以通过使用 `solana validators` 命令查询集群中所有验证者及其投票账户的列表来找到该地址：
```bash
solana validators
```
每行的第一列包含验证者的身份信息，第二列是投票账户地址。选择一个验证者并在 `solana delegate-stake` 命令中使用其投票账户地址：
```bash
solana delegate-stake --stake-authority <KEYPAIR> <STAKE_ACCOUNT_ADDRESS> <VOTE_ACCOUNT_ADDRESS> \
    --fee-payer <KEYPAIR>
```
该授权密钥对 `<KEYPAIR>` 授权对地址为 `<STAKE_ACCOUNT_ADDRESS>` 的账户进行操作。该权益被委托给地址为 `<VOTE_ACCOUNT_ADDRESS>` 的投票账户。
在委托质押后，使用 `solana stake-account` 命令观察权益账户的变化：
```bash
solana stake-account <STAKE_ACCOUNT_ADDRESS>
```
在输出中，你会看到新的字段 "Delegated Stake" 和 "Delegated Vote Account Address"。输出将类似于以下内容：
```bash
Total Stake: 5000 SOL
Credits Observed: 147462
Delegated Stake: 4999.99771712 SOL
Delegated Vote Account Address: CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1
Stake activates starting from epoch: 42
Stake Authority: EXU95vqs93yPeCeAU7mPPu6HbRUmTFPEiGug9oCdvQ5F
Withdraw Authority: EXU95vqs93yPeCeAU7mPPu6HbRUmTFPEiGug9oCdvQ5F
```
## 撤销质押
一旦委托了质押，你可以使用 `solana deactivate-stake` 命令来取消委托质押：
```bash
solana deactivate-stake --stake-authority <KEYPAIR> <STAKE_ACCOUNT_ADDRESS> \
    --fee-payer <KEYPAIR>
```
质押授权密钥对 `<KEYPAIR>` 授权对地址为 `<STAKE_ACCOUNT_ADDRESS>` 的账户进行操作。
请注意，质押需要经过一段时间才能 "冷却"。 在冷却期间尝试委托质押将失败。

## 取回质押
使用 `solana withdraw-stake` 命令从质押账户中转移代币：
```bash
solana withdraw-stake --withdraw-authority <KEYPAIR> <STAKE_ACCOUNT_ADDRESS> <RECIPIENT_ADDRESS> <AMOUNT> \
    --fee-payer <KEYPAIR>
```
`<STAKE_ACCOUNT_ADDRESS>` 是现有的质押账户, `<KEYPAIR>` 是质押权限, `<AMOUNT>` 是要转移到 `<RECIPIENT_ADDRESS>` 的代币数量。

## 拆分质押
在你现有的质押不符合取回条件时，你可能希望将质押委托给其他验证者节点。这可能是因为它当前正在质押、冷却或锁定。要将代币从现有的质押账户转移到新的账户，可以使用 `solana split-stake` 命令：
```bash
solana split-stake --stake-authority <KEYPAIR> <STAKE_ACCOUNT_ADDRESS> <NEW_STAKE_ACCOUNT_KEYPAIR> <AMOUNT> \
    --fee-payer <KEYPAIR>
```
`<STAKE_ACCOUNT_ADDRESS>` 是现有的质押账户, `<KEYPAIR>` 是质押授权的密钥对, `<NEW_STAKE_ACCOUNT_KEYPAIR>` 是新账户的密钥对, `<AMOUNT>` 是要转移到新账户的代币数量。
要将质押账户拆分为衍生账户地址, 请使用 `--seed `选项。有关详细信息，请参阅[派生质押账户地址](#高级-派生质押账户地址)。




















