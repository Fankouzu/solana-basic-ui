# 零知识证明

零知识证明是一种允许用户证明加密数据某些特性的工具。在加密扩展中使用的大部分零知识证明都是相对较小的系统，专为加密扩展设计。由于其简洁性，程序中使用所有零知识系统都不需要受信设置或复杂的电路设计。

在加密扩展中使用的零知识证明可以分为两类：*sigma*协议和*bulletproofs*。Sigma协议是为加密扩展定制的简单系统。Bulletproofs是一种现有的、源于研究论文[Bulletproofs: Short Proofs for Confidential Transactions and More](https://eprint.iacr.org/2017/1066)的范围证明系统。


## 转账指令数据

加密扩展的 `Transfer` 指令数据需要多个加密组件。我们通过一系列步骤构建转账数据，以便直观理解每个组件。

```rust
struct TransferData {  ...}
```

### ElGamal 公钥

转账指令关联有三个 ElGamal 公钥：发送方、接收方和审计方（sender, receiver, and auditor）。转账指令数据必须包含这三个加密公钥。

```rust
struct TransferPubkeys {
  source_pubkey: ElGamalPubkey,
  destination_pubkey: ElGamal Pubkey,
  auditor_pubkey: ElGamalPubkey,
}

struct TransferData {
  transfer_pubkeys: TransferPubkeys,
}
```

如果没有与代币相关联的审计方，那么审计方的公钥为32个零字节。

### 低位和高位加密

转账指令数据必须包含三个经ElGamal公钥加密的转账金额。为了应对上一节讨论的ElGamal解密问题，转账金额被限制为48位数字，并且被加密为两个独立的数字：表示低16位的 `amount_lo` 和表示高32位的 `amount_hi`。

每个 `amount_lo` 和 `amount_hi` 都在三个 ElGamal 公钥下加密。为了避免在转账数据中包含三个独立的密文，我们利用了ElGamal加密的随机重用特性来最小化密文的大小。

```rust
/// 使用三个ElGamal公钥加密的转账金额的密文结构
/// public keys
struct TransferAmountEncryption {
  commitment: PedersenCommitment,
  source_handle: DecryptHandle,
  destination_handle: DecryptionHandle,
  auditor_handle: DecryptHandle,
}

struct TransferData {
  ciphertext_lo: TransferAmountEncryption,
  ciphertext_hi: TransferAmountEncryption,
  transfer_pubkeys: TransferPubkeys,
}
```

除了这些密文之外，转账数据还必须包含证明这些密文是正确生成的证明。用户可能有两种方式欺骗程序。首先，用户可能提供格式错误的密文。例如，即使用户可能使用错误的公钥加密转账金额，程序也无法检查密文的有效性。因此，我们要求转账数据需要一个密文*有效性*证明，以证明密文是正确生成的。

密文有效性证明只能保证twisted ElGamal密文是正确生成的。然而，它并不能证明密文中加密金额的任何属性。例如，恶意用户可以加密负值，但程序仅通过检查密文无法检测到这一点。因此，除了密文有效性证明之外，转账指令还必须包含一个*范围证明*，以证明加密的金额`amount_lo`和`amount_hi`分别是16位和32位的正数值。

```rust
struct TransferProof {
  validity_proof: ValidityProof,
  range_proof: RangeProof,
}

struct TransferData {
  ciphertext_lo: TransferAmountEncryption,
  ciphertext_hi: TransferAmountEncryption,
  transfer_pubkeys: TransferPubkeys,
  proof: TransferProof,
}
```

### 验证净余额(Net-Balance)

最后，除了证明转账金额被正确加密，用户还必须包含一个证明，证实源账户有足够的余额进行转账。最常见的方式是用户生成一个范围证明，证明密文`source_available_balance - (ciphertext_lo + 2^16 * ciphertext_hi)`（即源账户的可用余额减去转账金额）加密的是一个正的64位数值。由于Bulletproofs支持证明的聚合，这个额外的范围证明可以与原有关于转账金额的范围证明整合在一起。


```rust
struct TransferProof {
  validity_proof: ValidityProof,
  range_proof: RangeProof, // 证明密文金额和净余额
}

struct TransferData {
  ciphertext_lo: TransferAmountEncryption,
  ciphertext_hi: TransferAmountEncryption,
  transfer_pubkeys: TransferPubkeys,
  proof: TransferProof,
}
```

上述方案存在一个技术性问题，即尽管转账的发起者掌握着ElGamal解密密钥，可以用来解密`source_available_balance`的密文，但他们不一定能获取到用于生成`source_available_balance - (ciphertext_lo + 2^16 * ciphertext_hi)`密文上范围证明所需的Pedersen承诺的开启值。因此，在转账指令中，我们要求发送者在客户端解密`source_available_balance - (ciphertext_lo + 2^16 * ciphertext_hi)`的密文，并且附加一个对更新后源账户余额`new_source_commitment`的新的Pedersen承诺。此外，还需要提供一个*等值证明*，用以确保`source_available_balance - (ciphertext_lo + 2^16 * ciphertext_hi)`的密文与`new_source_commitment`加密的是同一个消息。


```rust
struct TransferProof {
  new_source_commitment: PedersenCommitment,
  equality_proof: CtxtCommEqualityProof,
  validity_proof: ValidityProof,
  range_proof: RangeProof,
}

struct TransferData {
  ciphertext_lo: TransferAmountEncryption,
  ciphertext_hi: TransferAmountEncryption,
  transfer_pubkeys: TransferPubkeys,
  proof: TransferProof,
}
```

## 转账的费用指令数据

可以为扩展了费用的代币启用加密扩展。如果某个代币启用了费用扩展，任何相应代币的保密转账都必须使用加密扩展的 `TransferWithFee` 指令。除了 `Transfer` 指令所需的数据外，`TransferWithFee` 指令还需要与费用相关的额外加密组件。

### 转账费用原理

如果代币启用了费用扩展，那么涉及该代币的转账需要按转账金额百分比计算支付转账费用。交易费用由两个参数决定：

+ `bp`: 表示手续费率的基点。这是一个正整数，代表一个小数点后两位的百分比率。

  比如，`bp = 1` 代表手续费率为0.01%，`bp = 100` 代表手续费率为1%，而 `bp = 10000` 代表手续费率为100%。

+ `max_fee`: 最大手续费率。转账手续费是根据由`bp`确定的费率来计算的，但其值不会超过`max_fee`的上限。

  假设转账金额为200个代币。

  +   对于手续费参数 `bp = 100` 和 `max_fee = 3`，手续费就是转账金额的1%，也就是2。
  +   对于手续费参数 `bp = 200` 和 `max_fee = 3`，手续费为3，因为200的2%是4，这超过了最大手续费3的限制。

转账费用向上取整到最接近的正整数。例如，如果转账金额为 `100` 且费用参数为 `bp = 110` 和 `max_fee = 3`，则费用为 `2`，这是从转账金额的1.1%向上取整得出的。

费用参数可以在启用了费用扩展的代币中指定。除了费用参数外，启用了费用扩展的代币还包含 `withdraw_withheld_authority` 字段，该字段指定可以收取从转账金额中扣除的费用权限的公钥。

启用了费用扩展的代币账户有一个关联字段 `withheld_amount`。从转账金额中扣除的任何转账费用都会聚合到转账目标账户的 `withheld_amount` 字段中。提取扣留费用的权限可以使用 `TransferFeeInstructions::WithdrawWithheldTokensFromAccounts` 将 `withheld_amount` 提取到特定账户，或使用 `TransferFeeInstructions::HarvestWithheldTokensToMint` 提取到代币账户中。累积在代币账户中的扣留费用可以使用 `TransferFeeInstructions::WithdrawWithheldTokensFromMint` 提取到一个账户中。

### 费用加密

因为转账金额可以从费用中推断出来，加密扩展的 `TransferWithFee` 指令中不能以明文形式包含实际的转账费用金额。在加密扩展中，转账费使用目标账户和提取权限的 ElGamal 公钥加密。

```rust
struct FeeEncryption {
    commitment: PedersenCommitment,
    destination_handle: DecryptHandle,
    withdraw_withheld_authority_handle: DecryptHandle,
}

struct TransferWithFeeData {
  ... // `TransferData` 组件
  fee_ciphertext: FeeEncryption,
}
```

在收到 `TransferWithFee` 指令后，代币程序会从同一公钥下的加密转账金额中扣除目标账户 ElGamal 公钥下的加密费用。然后，将在提取扣留权限的 ElGamal 公钥下加密的费用密文聚合到目标账户的 `withheld_fee` 组件中。

### 验证费用密文

验证费用密文部分涉及到`TransferWithFee`指令数据中用于确认加密费用有效性的必要字段。由于费用是加密的，代币程序不能仅通过检查密文来验证费用是否正确计算。因此，`TransferWithFee`必须包含三个额外的证明来确保费用密文的有效性：

- **密文有效性证明**(*ciphertext validity proof*)：这部分证明确保实际的费用密文是在正确的接收方以及提现扣留授权的ElGamal公钥下正确生成的。
- **费用sigma证明**(*fee sigma proof*)：结合范围证明组件，费用sigma证明确保在`fee_ciphertext`中加密的费用根据费用参数被适当地计算。
- **范围证明**(*range proof*)：结合费用sigma证明组件，范围证明组件确保在`fee_ciphertext`中的加密费用根据费用参数被适当地计算。

对于这些证明的具体规范，我们参考以下更详细的说明。

## Sigma 证明

### （公钥）有效性证明

公钥有效性证明可以确认一个 twisted ElGamal 公钥是一个格式正确的公钥。系统的具体描述在以下注释中说明。

[[注释]](https://spl.solana.com/assets/files/pubkey_proof-9d51d5965c7b089fd264ddb2ce4e3e7f.pdf)

公钥有效性证明是 `ConfigureAccount` 指令所必需的。

### （密文）有效性证明

密文有效性证明可以确认一个 twisted ElGamal 密文是一个格式正确的密文。系统的具体描述在以下注释中详细说明。

[[注释]](https://spl.solana.com/assets/files/validity_proof-0f656f3de18e5794d6ddd39a2fd223f5.pdf)

有效性证明是`Withdraw`、`Transfer` 和 `TransferWithFee` 指令所必需的。这些指令要求客户端在指令数据中包含twisted ElGamal密文。附带的有效性证明保证了这些ElGamal密文是格式正确，是按照加密协议正确构造的。

### 零余额证明(Zero-balance Proof)

零余额证明可以确认一个 twisted ElGamal 密文加密的是数字零。系统的具体描述在以下注释中详细说明。

[注释](https://spl.solana.com/assets/files/zero_proof-3ec2a7e45f813a9467989be213439424.pdf)。

零余额证明是 `EmptyAccount` 指令所必需的，该指令用于准备关闭一个代币账户。只有当账户余额为零时，账户才可以被关闭。由于余额在机密扩展中是加密的，Token 程序无法通过检查账户状态直接验证账户中的加密余额是否为零。因此，程序通过验证附在 `EmptyAccount` 指令中的零余额证明来检查余额是否确实为零。

### 等值证明(Equality Proof)

加密扩展使用了两种类型的等值证明。第一种是“密文-承诺”等值证明，它证实了一个扭曲的ElGamal密文和一个Pedersen承诺编码了相同的信息。第二种是“密文-密文”等值证明，它证实了两个扭曲的ElGamal密文加密的是同一信息。系统具体的描述在以下的注释文档中给出。

[[注释]](https://spl.solana.com/assets/files/equality_proof-c6a1d284e7c945c6fbef90929cf852d7.pdf).


等值证明的两种变体对于不同的交易指令至关重要。在`Transfer`和`TransferWithFee`指令中，需要使用“密文-承诺”等值证明；而在`WithdrawWithheldTokensFromMint`和`WithdrawWithheldTokensFromAccounts`指令中，则需要使用“密文-密文”等值证明。这些证明确保了在执行相关操作时，涉及的密文确实代表了相同的资产值，从而保障了交易的安全性和准确性。

### Sigma 费用证明(Fee Sigma Proof)

Sigma 费用证明确保已提交的转账费用被正确计算。系统的具体描述在以下注释中详细说明。

[注释]

Sigma 费用证明是`TransferWithFee`指令必需的。


## 范围证明(Range Proofs)

加密扩展使用 Bulletproofs 进行范围证明。参阅[academic paper](https://eprint.iacr.org/2017/1066)和[dalek](https://doc-internal.dalek.rs/bulletproofs/notes/index.html)了解详细信息。
