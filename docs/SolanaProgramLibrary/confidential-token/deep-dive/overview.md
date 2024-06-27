# 协议概览

本节主要介绍保密代币扩展背后的密码学协议。实际使用过程中，并不需要深入了解加密扩展的细节。快速入门指南可参阅前一章节。

需要注意的是，本节主要介绍保密代币扩展的底层密码学设计的出发点，对协议的某些部分描述可能与实际实现有所差异。关于底层密码学的详细介绍，可参考后续的小节、[源代码](https://github.com/solana-labs/solana-program-library)以及其中的文档。

## 带有加密和证明的代币

 `Mint` 和 `Account` 是 Token程序中使用的主要状态数据结构。其中，`Mint` 数据结构用于存储代币的全局信息。

```rust
/// Mint data.
struct Mint {
    mint_authority: Option<Pubkey>,
    supply: u64,
    ... // other fields omitted
}
```

`Account` 数据结构用于存储用户余额信息。

```rust
/// Account data.
struct Account {
    mint: Pubkey,
    owner: Pubkey,
    amount: u64,
    ... // other fields omitted
}
```

用户可以使用 `InitializeMint` 和 `InitializeAccount` 指令初始化`Mint` 和 `Account` 。用户还可以使用许多其他指令来修改其状态。本节将重点介绍 `Transfer` 指令。`Transfer` 指令创建如下：


```rust
/// Transfer instruction data
///
/// Accounts expected:
///   0. `[writable]` The source account.
///   1. `[writable]` The destination account.
///   2. `[signer]` The source account's owner.
struct Transfer {
  amount: u64,
}
```

### 加密

`Account` 状态存储在链上，可以查找与任何用户关联的余额。在加密扩展中，我们使用公钥加密方案 (PKE) 对余额进行加密，以此实现余额隐藏。一个简单的公钥加密方案如下：

```rust
trait PKE<Message> {
  type SecretKey;
  type PublicKey;
  type Ciphertext;

  keygen() -> (SecretKey, PublicKey);
  encrypt(PublicKey, Message) -> Ciphertext;
  decrypt(SecretKey, Ciphertext) -> Message;
}
```

以`Account`状态为例：

```rust
Account {
    mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB,
    owner: 5vBrLAPeMjJr9UfssGbjUaBmWtrXTg2vZuMN6L4c8HE6,
    amount: 50,
    ...
}
```

为隐藏账户余额，在存储上链前，我们使用账户所有者的公钥对账户余额进行加密。

```rust
Account {
    mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB,
    owner: 5vBrLAPeMjJr9UfssGbjUaBmWtrXTg2vZuMN6L4c8HE6, // pubkey_owner
    amount: PKE::encrypt(pubkey_owner, 50), // amount encrypted
    ...
}
```

同样，我们可以使用加密技术在交易中隐藏转账金额。参考下方的转账指令，为了隐藏交易金额，可以在提交上链前，使用发送者的公钥对其进行加密。

```rust
Transfer {
    amount: PKE::encrypt(pubkey_owner, 10),
}
```

通过对账户余额和转账金额进行加密，我们能为Token程序增加保密性。


### 线性同态加密

采用上述方法后，因为所有交易金额都是经过加密的，Token程序无法减扣或增加账户的金额。

采用类似 ElGamal 的*线性同态*加密方案可以解决上述问题。对于任意两个数字`x_0`、`x_1`以及它们在同一个公钥下的加密结果`ct_0`、`ct_1`，如果存在一种加密方案使得密文的加法和减法操作满足以下条件，则这个加密方案就被认为是线性同态的。

```rust
let (sk, pk) = PKE::keygen();

let ct_0 = PKE::encrypt(pk, x_0);
let ct_1 = PKE::encrypt(pk, x_1);

assert_eq!(x_0 + x_1, PKE::decrypt(sk, ct_0 + ct_1));
```

因此，加密后的数据可以使用线性同态加密方案进行加法和减法运算。`x_0`和`x_1`先单独加密再求和或求差的结果与`x_0`和`x_1`先计算和或差再加密的结果相同。

通过使用线性同态加密方案加密余额和转账金额，Token程序可以实现在加密形式下处理余额和转账金额。为了使用线性同态加密，需要确保所有涉及的加密数据都是在相同公钥下生成，当进行转账时，转账金额需要同时在发送者和接收者的公钥下进行加密。


```rust
Transfer {
  amount_sender: PKE::encrypt(pubkey_sender, 10),
  amount_receiver: PKE::encrypt(pubkey_receiver, 10),
}
```

在接收到这种形式的转账指令后，Token程序可以地对源账户和目标账户进行密文减法和加法操作。

```rust
Account {
    mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB,
    owner: 5vBrLAPeMjJr9UfssGbjUaBmWtrXTg2vZuMN6L4c8HE6, // pubkey_sender
    amount: PKE::encrypt(pubkey_sender, 50) - PKE::encrypt(pubkey_sender, 10),
    ...
}
```

```rust
Account {
    mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB,
    owner: 0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7, // pubkey_receiver
    amount: PKE::encrypt(pubkey_receiver, 50) + PKE::encrypt(pubkey_receiver, 10),
    ...
}
```

### 零知识证明

由于加密账户余额和转账金额是加密的，Token程序无法检查转账金额的有效性。例如，一个账户余额为50个代币的用户不能向另一个账户转账70个代币。Token程序可以检测用户账户中常规SPL代币的余额是否充足，但如果账户余额和转账金额都被加密，那么Token程序将无法验证交易的有效性。

通过要求转账指令包含验证其正确性的零知识证明可以解决这个问题。零知识证明由`prove`和`verify`两组算法组成，它们在公共数据和私有数据上工作。`prove`算法生成一个“证明”，证明公共数据和私有数据的某种属性是真的。`verify`算法检查这个证明是否有效。

```rust
trait ZKP<PublicData, PrivateData> {
  type Proof;

  prove(PublicData, PrivateData) -> Proof;
  verify(PublicData, Proof) -> bool;
}
```

`证明`不会泄露任何关于实际私有数据的信息是零知识证明系统的一个特殊属性。

在转账指令中，我们需要以下类型的零知识证明：

+ **范围证明**：范围证明是一种特殊类型的零知识证明，它允许用户生成一个证明 `proof`，值 `x` 经证明密文 `ct` 加密后，能够落在指定的范围 `lower_bound` 和 `upper_bound` 之间：
    
    + 若果x满足 `lower_bound <= x < upper_bound`，Proof将成功：  

    ```rust
    let ct = PKE::encrypt(pk, x);
    let public_data = (pk, ct);
    let private_data = (sk, x);

    let proof = RangeProof::prove(public_data, private_data);
    assert_eq!(RangeProof::verify(public_data, proof), true);
    ```
    +   如果x超出界限，任何Proof都将失败：

    ```rust
    let ct = PKE::encrypt(pk, x);
    let public_data = (pk, ct);

    assert_eq!(RangeProof::verify(public_data, proof), false);
    ```
    
    零知识证明可以保证会证明`lower_bound <= x < upper_bound`，而生成的证明不会泄露输入`x`的实际值。
    
    在加密扩展中，我们要求转账指令包含一个范围证明，以证明以下几点：

  +   通过证明确认源账户中有足够的资金。具体而言，设`ct_source`是源账户加密后的余额，`ct_transfer`是加密后的转账金额。那么`x`是经过加密后的`ct_source - ct_transfer`值，且这个`x`满足`0 <= x < u64::MAX`，其中`u64::MAX`代表64位无符号整数的最大值。

        
  +   证明应当确认转账金额本身是一个正的64位数字。设ct_transfer是加密后的转账金额。那么这个证明应该确认ct_transfer加密了一个值x，且满足0 <= x < u64::MAX。
        
+   *等值证明*：一个转账指令包含了转账值`x`的两个密文：一个是使用发送方公钥`pk_sender`加密的`ct_sender = PKE::encrypt(pk_sender, x)`，另一个是使用接收方公钥`pk_receiver`加密的`ct_receiver = PKE::encrypt(pk_receiver, x)`。一个恶意用户可能会对`ct_sender`和`ct_receiver`加密两个不同的值。

    等值证明是一种特殊类型的零知识证明，允许用户证明两个密文 `ct_0` 和 `ct_1` 加密相同的值 `x`。在加密扩展程序中，我们要求转账指令包含一个等值证明，以证明这两个密文加密的值相同。
    
    零知识证明保证 `proof_eq` 不会泄露 `x_0` 和 `x_1` 的实际值，只会证明 `x_0 == x_1`。
    

我们将在后续章节中介绍这些算法。

## 可用功能

### 加密密钥

在前一章节中，我们使用账户所有者的公钥加密账户的余额。而在加密扩展程序的实际使用中，我们使用一个独立的、针对每个账户的加密密钥来加密账户余额。

```rust
Account {
    mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB,
    owner: 5vBrLAPeMjJr9UfssGbjUaBmWtrXTg2vZuMN6L4c8HE6,
    encryption_key: mpbpvs1LksLmdMhCEzyu5UEWEb3dsRPbB5, // pke_pubkey
    amount: PKE::encrypt(pke_pubkey, 50),
    ...
}
```

账户所有者可以使用 `ConfidentialTransferInstruction::ConfigureAccount` 指令设置账户专用的 `encryption_key`。对应的私钥可以私密地存储在客户端钱包中，也可以由所有者签名密钥确定性地派生。

因为这可能存在潜在的漏洞，不建议直接重用签名密钥进行加密。加密扩展的设计为尽可能通用、提供更灵活的接口，使用专用密钥分别签署交易和解密交易金额。

在潜在的应用中，特定账户的解密密钥可以在多个用户（例如监管者）之间共享，这些用户有权访问账户余额。尽管这些用户可以解密账户余额，但只有拥有所有者签名密钥的账户才能签署发起代币转账的交易。账户所有者可以使用 `ConfigureAccount` 指令更新账户的加密密钥。


### 全局审计员

由于每个用户账户都关联有独立的解密密钥，用户可以给予潜在审计员对*特定*账户余额的读取权限。加密扩展同样提供了一个可选的*全局*审计员功能，可在铸造代币时选择启用。具体而言，在加密扩展中，铸造数据结构维护了一个额外的全局审计员加密密钥。这个审计员加密密钥可以在铸造初始化时指定，并通过`ConfidentialTransferInstruction::ConfigureMint`指令进行更新。如果铸造中的转账审计员加密密钥不是`None`，那么任何转账指令必须额外包含审计员加密密钥加密的转账金额。

```rust
Transfer {
  amount_sender: PKE::encrypt(pke_pubkey_sender, 10),
  amount_receiver: PKE::encrypt(pke_pubkey_receiver, 10),
  amount_auditor: PKE::encrypt(pke_pubkey_auditor, 10),
  range_proof: RangeProof,
  equality_proof: EqualityProof,
  ...
}
```

这允许任何持有审计员私钥的实体能够解密特定铸造代币的任何转账金额。

不诚实的发送者可能在源和目的地公钥下加密不一致的转账金额，他们也可能在审计员加密密钥下加密不一致的转账金额。如果在代币铸造时审计员加密密钥不是`None`，Token程序为证明加密是一致的，会要求转账指令中的转账金额要包含额外的零知识证明。

### 待处理余额和可用余额

攻击者可以通过使用*抢跑交易*来破坏加密扩展账户的使用。零知识证明是相对于账户的加密余额进行验证的。假设用户Alice基于她当前的加密账户余额生成了一个证明。如果另一个用户Bob向Alice转移了一些代币，并且Bob的交易先被处理，那么Alice的交易将被代币程序拒绝，因为证明将无法对更新的账户状态进行验证。

在正常情况下，一旦交易被程序拒绝，Alice可以查找更新的密文并提交新的交易。然而，如果一个恶意攻击者不断向网络中发送转账到Alice账户的交易，那么理论上该账户可能变得无法使用。为了防止这种攻击，我们修改了账户数据结构，使账户的加密余额被分为两个独立的部分：*待处理*余额和*可用*余额。

```rust
let ct_pending = PKE::encrypt(pke_pubkey, 10);
let ct_available = PKE::encryption(pke_pubkey, 50);

Account {
    mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB,
    owner: 5vBrLAPeMjJr9UfssGbjUaBmWtrXTg2vZuMN6L4c8HE6,
    encryption_key: mpbpvs1LksLmdMhCEzyu5UEWEb3dsRPbB5,
    pending_balance: ct_pending,
    account_balance: ct_available,
    ...
}
```

从账户转出的任何资金都从其可用余额中扣除。账户接收的任何资金都会添加到其待处理余额中。

例如，将10个代币从发送者账户转移到接收者账户的转账指令。

```rust
let ct_transfer_sender = PKE::encrypt(pke_pubkey_sender, 10);
let ct_transfer_receiver = PKE::encrypt(pke_pubkey_receiver, 10);
let ct_transfer_auditor = PKE::encrypt(pke_pubkey_auditor, 10);

Transfer {
  amount_sender: ct_transfer_sender,
  amount_receiver: ct_transfer_receiver,
  amount_auditor: ct_transfer_auditor,
  range_proof: RangeProof,
  equality_proof: EqualityProof,
  ...
}
```

在收到并验证该交易后，Token程序从发送者的可用余额中扣除加密的金额，并将加密的金额添加到接收者的待处理余额中。

```rust
Account {
    mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB,
    owner: 5vBrLAPeMjJr9UfssGbjUaBmWtrXTg2vZuMN6L4c8HE6,
    encryption_key: mpbpvs1LksLmdMhCEzyu5UEWEb3dsRPbB5,
    pending_balance: ct_sender_pending,
    available_balance: ct_sender_available - ct_transfer_sender,
    ...
}
```

此修改消除了发送者更改接收者可用余额的能力。由于区间证明是相对于可用余额生成和验证的，这防止了用户的交易因另一个用户生成的交易而失效。

通过 `ApplyPendingBalance` 指令，可以将账户的待处理余额合并到可用余额中，该操作只能由账户所有者授权。收到该指令并验证账户所有者签署了交易后，Token程序将待处理余额添加到可用余额中。

```rust
Account {
    mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB,
    owner: 5vBrLAPeMjJr9UfssGbjUaBmWtrXTg2vZuMN6L4c8HE6,
    encryption_key: mpbpvs1LksLmdMhCEzyu5UEWEb3dsRPbB5,
    pending_balance: ct_pending_receiver - ct_transfer_receiver,
    available_balance: ct_available_receiver,
    ...
}
```

## 密码学优化

### 离散对数问题

使用线性同态ElGamal加密的主要限制是解密的低效性。为了恢复原本加密的值，必须解决一个称为*离散对数*的计算问题，即使使用正确的私钥，也需要指数时间来解决。在加密扩展程序中，我们通过以下两种方式解决这个问题：

+   转账金额限制为48位
+   转账金额和账户待处理余额分别作为两个独立的密文进行加密
+   账户可用余额仍使用对称加密方案进行加密

有关更多详细信息，请参阅后续章节和源代码中的文档。

### Twisted ElGamal 加密

设计任何隐私支付系统的关键挑战之一是尽量减小交易的大小。在加密扩展中，我们进行了许多优化以减少交易大小。在这些优化中，使用*twisted* ElGamal 加密（在[CMTA19](https://eprint.iacr.org/2019/319)中提出）带来了显著的节省。twisted ElGamal 加密是标准 ElGamal 加密方案的一个简单变体，其中密文被分为两个部分：

+   加密消息的*Pedersen承诺*，它独立于任何ElGamal公钥。
+   *解密句柄*，它根据特定的ElGamal公钥编码加密随机性，且独立于加密消息。

我们将在后续提供twisted ElGamal加密的更多细节。
