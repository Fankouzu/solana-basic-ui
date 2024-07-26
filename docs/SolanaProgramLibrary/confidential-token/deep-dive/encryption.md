# 加密

加密扩展程序采用公钥加密方案和经过身份验证的对称加密方案。对于公钥加密，该程序使用[twisted ElGamal](https://eprint.iacr.org/2019/319)加密方案 ，对称加密则是使用 [AES-GCM-SIV](https://datatracker.ietf.org/doc/html/rfc8452)。


## Twisted ElGamal 加密方案

twisted ElGamal 加密是标准 ElGamal 加密方案的一个简单变体，其中密文分为两个部分：

+   加密消息的Pedersen承诺。这个组件与公钥无关。
+   一个"解密核心"，它将加密随机性与特定的ElGamal公钥绑定。这个组件与实际加密的消息无关。

twisted ElGamal 密文的结构简化了某些零知识证明系统的设计。此外，由于加密消息被编码为 Pedersen 承诺，许多专门为 Pedersen 承诺设计的现有零知识证明系统可以直接应用于twisted ElGamal密文。

我们在[注释](https://spl.solana.com/assets/files/twisted_elgamal-2115c6b1e6c62a2bb4516891b8ae9ee0.pdf)中提供了 twisted ElGamal 加密的正式描述。

### 密文解密

在协议中使用 ElGamal 加密的缺点是解密低效。ElGamal 密文的解密时间随着加密数字的大小呈指数级增长。使用现代的硬件解密 32 位消息，时间可能在数秒之内，但随着消息大小的增加，这很快就变得不可行。标准的 Token 账户存储的一般是单位为 `u64` 位的余额，但 ElGamal 密文无法解密大于 64 位的消息。因此，在账户状态和转账数据中，对余额和转账金额的加密和处理方式需要特别注意。

## 账户状态

如果 twisted ElGamal 加密方案的解密速度很快，可以将加密转账账户和加密指令数据结构设计为如下形式：

```rust
struct ConfidentialTransferAccount {
  /// `true` 表示该账户已被批准使用。在获得批准之前，
  /// 该账户的所有机密转账操作都将失败。
  approved: PodBool,

  /// 与 ElGamal 加密相关联的公钥
  encryption_pubkey: ElGamalPubkey,

  /// 待处理余额（由 `encryption_pubkey` 加密）
  pending_balance: ElGamalCiphertext,

  /// 可用余额（由 `encryption_pubkey` 加密）
  available_balance: ElGamalCiphertext,
}
```

```rust
// 实际的加密组件被组织在 `VerifyTransfer` 指令数据中
struct ConfidentialTransferInstructionData {
  /// 使用发送方 ElGamal 公钥加密的转账金额
  encrypted_amount_sender: ElGamalCiphertext,
  /// 使用接收方 ElGamal 公钥加密的转账金额
  encrypted_amount_receiver: ElGamalCiphertext,
}
```

Token 程序在接收到转账指令后将 `encrypted_amount_receiver` 结合到账户的 `pending_balance` 中。

这两个组件的实际结构更加复杂，由于 `TransferInstructionData` 需要零知识证明组件，我们将在下一小节详细讨论其数据结构，此处我们专注于 `ConfidentialTransferAccount`的介绍。我们从上面理想化的`ConfidentialTransferAccount` 结构开始，逐步修改它以生成最终结构。

### 可用余额

如果可用余额仅作为普通的 `u64` 值进行加密，那么客户端将无法解密并恢复账户中的确切余额。因此，在 Token 程序中，可用余额还使用一种经过认证的对称加密方案进行了额外加密。得到的密文被存储为账户的 `decryptable_balance`，相应的对称密钥应该作为独立的密钥存储在客户端，或者从所有者签名密钥动态派生。

```rust
struct ConfidentialTransferAccount {
  /// `true` 表示该账户已被批准使用。在获得批准之前，
  /// 该账户的所有机密转账操作都将失败。
  approved: PodBool,

  /// 与 ElGamal 加密相关联的公钥
  encryption_pubkey: ElGamalPubkey,

  /// 待处理余额（由 `encryption_pubkey` 加密）
  pending_balance: ElGamalCiphertext,

  /// 可用余额（由 `encryption_pubkey` 加密）
  available_balance: ElGamalCiphertext,

  /// 可解密的可用余额
  decryptable_available_balance: AeCiphertext,
}
```

`decryptable_available_balance`易于解密，客户通常应利用它来解密账户内的可用余额。而`available_balance`的ElGamal密文则主要用于在创建转账指令时生成零知识证明。

`available_balance`与`decryptable_available_balance`应当对同一笔与账户相关的可用余额进行加密处理。账户中的可用余额仅可能在执行了`ApplyPendingBalance`指令或发起了一笔出账`Transfer`指令后发生变化。这两类指令均需在其指令数据中包含`new_decryptable_available_balance`这一项。

### 待处理余额

与可用余额的情况类似，人们可以考虑为待处理余额添加一个 `decryptable_pending_balance`。然而，虽然可用余额总是由账户所有者掌控（通过`ApplyPendingBalance`和`Transfer`指令），但账户的待处理余额可能会随着传入的转账而不断变化。由于可解密余额密文的相应解密密钥只有账户所有者知道，因此`Transfer`指令的发起者无法更新收款方账户的可解密余额。

因此，针对待处理余额，Token程序会保存两组独立的ElGamal密文，其中一组加密64位待处理余额的低位数，另一组则加密高位数。

```rust
struct ConfidentialTransferAccount {
  /// `true` 表示该账户已被批准使用。在获得批准之前，
  /// 该账户的所有机密转账操作都将失败。
  approved: PodBool,

  /// 与 ElGamal 加密相关联的公钥
  encryption_pubkey: ElGamalPubkey,

  /// 待处理余额的低位（由 `encryption_pubkey` 加密）
  pending_balance_lo: ElGamalCiphertext,

  /// 待处理余额的高位（由 `encryption_pubkey` 加密）
  pending_balance_hi: ElGamalCiphertext,

  /// 可用余额（由 `encryption_pubkey` 加密）
  available_balance: ElGamalCiphertext,

  /// 可解密的可用余额
  decryptable_available_balance: AeCiphertext,
}
```

我们将转账指令数据中的转账金额密文划分为低位加密和高位加密两部分。

```rust
// 实际的加密组件被组织在 `VerifyTransfer` 指令数据中
struct ConfidentialTransferInstructionData {
  /// 使用发送方 ElGamal 公钥加密的转账金额
  encrypted_amount_sender: ElGamalCiphertext,
  /// 使用接收方 ElGamal 公钥加密的转账金额低位
  encrypted_amount_lo_receiver: ElGamalCiphertext,
  /// 使用接收方 ElGamal 公钥加密的转账金额高位
  encrypted_amount_hi_receiver: ElGamalCiphertext,
}
```

在接受到转账指令时，Token程序将指令数据中的`encrypted_amount_lo_receiver`累加到账户的`pending_balance_lo`，并将`encrypted_amount_hi_receiver`累加到`pending_balance_hi`。

将上述结构中的64位待处理余额及转账金额划分的一种方式是将其均匀分割为低位和高位的两个32位数字。由于每个密文中加密的数额均为32位数字，可以高效完成解密操作。

但这种方法的问题在于，加密32位数字的`pending_balance_lo`很容易溢出，变得大于32位数字。例如，向某账户进行两次金额为`2^32-1`的转账会使该账户中的`pending_balance_lo`密文达到`2^32`，即一个33位的数字。随着加密金额的溢出，解密密文的难度会逐渐增加。

为了应对溢出问题，在账户状态中增加以下两个组件。

+   账户状态会追踪自上次`ApplyPendingBalance`指令以来收到的入账转账数量。
+   账户状态中保存了一个`maximum_pending_balance_credit_counter`，它限制了在应用 `ApplyPendingBalance` 指令之前可以接收的传入转账数量。上限可以通过`ConfigureAccount`进行配置，通常应设置为`2^16`。

```rust
struct ConfidentialTransferAccount {
  ... // 省略 `approved`、`encryption_pubkey` 和可用余额字段

  /// 待处理余额的低位（由 `encryption_pubkey` 加密）
  pending_balance_lo: ElGamalCiphertext,

  /// 待处理余额的高位（由 `encryption_pubkey` 加密）
  pending_balance_hi: ElGamalCiphertext,

  /// 在执行 `ApplyPendingBalance` 指令之前，可以对 `pending_balance`
  /// 进行信用的 `Deposit` 和 `Transfer` 指令的最大数量
  pub maximum_pending_balance_credit_counter: u64,

  /// 自上次执行 `ApplyPendingBalance` 指令以来的传入转账数量
  pub pending_balance_credit_counter: u64,
}
```

我们对转账指令数据做出如下修改：

+   转账金额限制为 48 位数字。
+   转账金额被分为 16 位和 32 位数字，并作为两个密文 `encrypted_amount_lo_receiver `和 `encrypted_amount_hi_receiver `进行加密。

```rust
// 实际的加密组件被组织在 `VerifyTransfer` 指令数据中
struct ConfidentialTransferInstructionData {
  /// 使用发送方 ElGamal 公钥加密的转账金额
  encrypted_amount_sender: ElGamalCiphertext,
  /// 使用接收方 ElGamal 公钥加密的转账金额的低 *16 位*
  encrypted_amount_lo_receiver: ElGamalCiphertext,
  /// 使用接收方 ElGamal 公钥加密的转账金额的高 *32 位*
  encrypted_amount_hi_receiver: ElGamalCiphertext,
}
```

为了在ElGamal解密的效率与隐私转账的实用性之间取得平衡，对转账金额进行限制。使用`pending_balance_credit_counter`和`maximum_pending_balance_credit_counter`两个字段限制待处理余额中加密的`pending_balance_lo`和`pending_balance_hi`金额。

设想一下当`maximum_pending_balance_credit_counter`被设定为`2^16`的情况。


+ `encrypted_amount_lo_receiver`最大加密一个16位数字，即使在经历了`2^16`次入账转账之后，账户中的`pending_balance_lo`密文所加密的余额最多仍是一个32位数。这部分待处理余额能够被高效解密。

+ `encrypted_amount_hi_receiver`最大加密一个32位数字，在经历`2^16`次入账转账后，`pending_balance_hi`密文加密的余额最多是一个48位数。

  解密一个大的 48 位数字是十分缓慢的。然而对于大多数应用来说，非常大金额的转账相对较少。要使一个账户持有大的 48 位数字的待处理余额，它必须接收大量的高交易金额。维护高代币余额的客户端可以频繁提交` ApplyPendingBalance` 指令，将待处理余额转入可用余额，以防止 `pending_balance_hi `加密过大的数字。。
