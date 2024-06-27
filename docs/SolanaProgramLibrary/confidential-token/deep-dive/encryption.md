# 加密

加密扩展程序采用公钥加密方案和认证对称加密方案。其中，公钥加密使用 [twisted ElGamal](https://eprint.iacr.org/2019/319) ，对称加密使用 [AES-GCM-SIV](https://datatracker.ietf.org/doc/html/rfc8452)。


## Twisted ElGamal 加密方案

twisted ElGamal 加密是标准 ElGamal 加密方案的一个简单变体，其中密文被分为两个部分：

+   加密消息的*Pedersen承诺*，它独立于任何ElGamal公钥。
+   *解密句柄*，它根据特定的ElGamal公钥编码加密随机性，且独立于加密消息。

twisted ElGamal 密文结构简化了零知识证明系统的设计。由于加密消息被编码为 Pedersen 承诺，许多为 Pedersen 承诺设计的现有零知识证明系统可以直接用于 twisted ElGamal 密文。

我们在[注释](https://spl.solana.com/assets/files/twisted_elgamal-2115c6b1e6c62a2bb4516891b8ae9ee0.pdf)中提供了 twisted ElGamal 加密的正式描述。

### 密文解密

在协议中使用 ElGamal 加密的缺点是解密低效。ElGamal 密文的解密时间随着加密数字的大小呈指数增长。使用现代硬件解密 32 位消息的时间可能在数秒之内，但随着消息大小的增加，这很快就变得不可行。标准的 Token 账户存储的一般是单位为 `u64` 位的余额，但 ElGamal 密文无法解密大于 64 位消息。因此，在账户状态和转账数据中对余额和转账金额的加密和处理方式需要特别注意。

## Account State[​](#account-state "Direct link to Account State")

If the decryption of the twisted ElGamal encryption scheme were fast, then a confidential transfer account and a confidential instruction data could be modeled as follows:

## 账户状态

如果 twisted ElGamal 加密方案的解密速度很快，可以将加密转账账户和加密指令数据结构设计为如下形式：

```rust
struct ConfidentialTransferAccount {
  /// `true` if this account has been approved for use. All confidential
  /// transfer operations for
  /// the account will fail until approval is granted.
  approved: PodBool,

  /// The public key associated with ElGamal encryption
  encryption_pubkey: ElGamalPubkey,

  /// The pending balance (encrypted by `encryption_pubkey`)
  pending_balance: ElGamalCiphertext,

  /// The available balance (encrypted by `encryption_pubkey`)
  available_balance: ElGamalCiphertext,
}
```

```rust
// Actual cryptographic components are organized in `VerifyTransfer`
// instruction data
struct ConfidentialTransferInstructionData {
  /// The transfer amount encrypted under the sender ElGamal public key
  encrypted_amount_sender: ElGamalCiphertext,
  /// The transfer amount encrypted under the receiver ElGamal public key
  encrypted_amount_receiver: ElGamalCiphertext,
}
```

Token 程序在接收到转账指令后将 `encrypted_amount_receiver` 聚合到账户的 `pending_balance` 中。

由于 `TransferInstructionData` 需要零知识证明组件，这两个组件的实际结构更加复杂。我们将在下一小节详细讨论其数据结构，此处我们专注于 `ConfidentialTransferAccount`。我们从上面的`ConfidentialTransferAccount` 结构开始，逐步修改它以生成最终结构。

### 可用余额

如果以 `u64` 值加密可用余额，那么客户端将无法解密并恢复账户中的确切余额。因此，在 Token 程序中额外使用对称加密方式对可用余额进行加密，得到的密文存储为账户的 `decryptable_balance`，相应的对称密钥应当存储在客户端作为独立密钥，或者从所有者签名密钥中动态派生出来。

```rust
struct ConfidentialTransferAccount {
  /// `true` if this account has been approved for use. All confidential
  /// transfer operations for
  /// the account will fail until approval is granted.
  approved: PodBool,

  /// The public key associated with ElGamal encryption
  encryption_pubkey: ElGamalPubkey,

  /// The pending balance (encrypted by `encryption_pubkey`)
  pending_balance: ElGamalCiphertext,

  /// The available balance (encrypted by `encryption_pubkey`)
  available_balance: ElGamalCiphertext,

  /// The decryptable available balance
  decryptable_available_balance: AeCiphertext,
}
```
`decryptable_available_balance`易于解密，客户通常应利用它来解密账户内的可用余额。而`available_balance`的ElGamal密文则主要用于在创建转账指令时生成零知识证明。

`available_balance`与`decryptable_available_balance`应当对同一笔与账户相关的可用余额进行加密处理。账户中的可用余额仅可能在执行了`ApplyPendingBalance`指令或发起了一笔出账`Transfer`指令后发生变化。这两类指令均需在其指令数据中包含`new_decryptable_available_balance`这一项。

### 待处理余额

我们可以考虑类似处理可用余额的方式给待处理余额加入一个`decryptable_pending_balance`。然而，可用余额总是由账户所有者（通过`ApplyPendingBalance`和`Transfer`指令）掌控，账户的待处理余额可能因不断接收到转账而频繁变动。由于解密余额密文所需的密钥仅账户所有者知晓，因此`Transfer`指令的发起者无法更新收款方账户的可解密余额。

因此，针对待处理余额，Token程序会保存两组独立的ElGamal密文，其中一组加密64位待处理余额的低位数，另一组则加密高位数。

```rust
struct ConfidentialTransferAccount {
  /// `true` if this account has been approved for use. All confidential
  /// transfer operations for
  /// the account will fail until approval is granted.
  approved: PodBool,

  /// The public key associated with ElGamal encryption
  encryption_pubkey: ElGamalPubkey,

  /// The low-bits of the pending balance (encrypted by `encryption_pubkey`)
  pending_balance_lo: ElGamalCiphertext,

  /// The high-bits of the pending balance (encrypted by `encryption_pubkey`)
  pending_balance_hi: ElGamalCiphertext,

  /// The available balance (encrypted by `encryption_pubkey`)
  available_balance: ElGamalCiphertext,

  /// The decryptable available balance
  decryptable_available_balance: AeCiphertext,
}
```

我们将转账指令数据中的转账金额密文划分为低位加密和高位加密两部分。

```rust
// Actual cryptographic components are organized in `VerifyTransfer`
// instruction data
struct ConfidentialTransferInstructionData {
  /// The transfer amount encrypted under the sender ElGamal public key
  encrypted_amount_sender: ElGamalCiphertext,
  /// The low-bits of the transfer amount encrypted under the receiver
  /// ElGamal public key
  encrypted_amount_lo_receiver: ElGamalCiphertext,
  /// The high-bits of the transfer amount encrypted under the receiver
  /// ElGamal public key
  encrypted_amount_hi_receiver: ElGamalCiphertext,
}
```

在接受到转账指令时，Token程序将指令数据中的`encrypted_amount_lo_receiver`累加到账户的`pending_balance_lo`，并将`encrypted_amount_hi_receiver`累加到`pending_balance_hi`。

将上述结构中的64位待处理余额及转账金额划分的一种方式是将其均匀分割为低位和高位的两个32位数字。由于每个密文中加密的数额均为32位数字，可以高效完成解密操作。

但这种方法的问题在于，加密32位数字的`pending_balance_lo`很容易溢出，变得大于32位数字。例如，向某账户进行两次金额为`2^32-1`的转账会使该账户中的`pending_balance_lo`密文达到`2^32`，即一个33位的数字。随着加密金额的溢出，解密密文的难度会逐渐增加。

为了应对溢出问题，在账户状态中增加以下两个组件。

+   账户状态会追踪自上次`ApplyPendingBalance`指令以来收到的入账转账数量。
+   账户状态中保存了一个`maximum_pending_balance_credit_counter`组件，用以限制在对账户应用`ApplyPendingBalance`指令前，其能接收的入账转账次数。上限可以通过`ConfigureAccount`进行配置，通常应设置为`2^16`。
  


```rust
struct ConfidentialTransferAccount {
  ... // `approved`, `encryption_pubkey`, available balance fields omitted

  /// The low bits of the pending balance (encrypted by `encryption_pubkey`)
  pending_balance_lo: ElGamalCiphertext,

  /// The high bits of the pending balance (encrypted by `encryption_pubkey`)
  pending_balance_hi: ElGamalCiphertext,

  /// The maximum number of `Deposit` and `Transfer` instructions that can credit
  /// `pending_balance` before the `ApplyPendingBalance` instruction is executed
  pub maximum_pending_balance_credit_counter: u64,

  /// The number of incoming transfers since the `ApplyPendingBalance` instruction
  /// was executed
  pub pending_balance_credit_counter: u64,
}
```

我们对转账指令数据做出如下修改：

+   转账金额被限定为一个48位的数字。
+   转账金额被拆分为16位（`encrypted_amount_lo_receiver`）和32位（`encrypted_amount_hi_receiver`）数字进行加密。

```rust
// Actual cryptographic components are organized in `VerifyTransfer`
// instruction data
struct ConfidentialTransferInstructionData {
  /// The transfer amount encrypted under the sender ElGamal public key
  encrypted_amount_sender: ElGamalCiphertext,
  /// The low *16-bits* of the transfer amount encrypted under the receiver
  /// ElGamal public key
  encrypted_amount_lo_receiver: ElGamalCiphertext,
  /// The high *32-bits* of the transfer amount encrypted under the receiver
  /// ElGamal public key
  encrypted_amount_hi_receiver: ElGamalCiphertext,
}
```

为了在ElGamal解密的效率与隐私转账的实用性之间取得平衡，对转账金额进行限制。使用`pending_balance_credit_counter`和`maximum_pending_balance_credit_counter`两个字段限制待处理余额中加密的`pending_balance_lo`和`pending_balance_hi`金额。

设想一下当`maximum_pending_balance_credit_counter`被设定为`2^16`的情况。


+   `encrypted_amount_lo_receiver`最大加密一个16位数字，即使在经历了`2^16`次入账转账之后，账户中的`pending_balance_lo`密文所加密的余额最多仍是一个32位数。这部分待处理余额能够被高效解密。
    
+   `encrypted_amount_hi_receiver`最大加密一个32位数字，在经历`2^16`次入账转账后，`pending_balance_hi`密文加密的余额最多是一个48位数。
    
    解密一个48位数字速度较慢。然而，对于大多数应用场景而言，涉及极高交易金额的转账相对较为罕见。账户只有接收大量高金额的交易才会构成48位数字的待处理余额。具有高额代币余额的账户为防止`pending_balance_hi`加密过于庞大的数字，可以通过多次提交`ApplyPendingBalance`指令将待处理余额转入可用余额。
