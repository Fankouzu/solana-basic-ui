# 项目状态

所有集群已部署了除**保密转账功能**的最新智能合约程序。

一旦 Solana mainnet-beta 集群客户端升级至v1.17 版本，并启用了相应的系统调用，带有**保密转账功能**的程序将会被部署。

## 时间线

以下是程序的时间线和大致的预计时间：

| Issue | 预计时间 |
| --- | --- |
| Mainnet recommendation | 2024年冬季（取决于v1.17） |
| More ZK features | 2024年春季（取决于v1.18） |
| Freeze program | 2024年 |

更多信息： [https://github.com/orgs/solana-labs/projects/34](https://github.com/orgs/solana-labs/projects/34)

## 其他事项

### 支持椭圆曲线系统调用的v1.17版本

为了使用保密转账功能，集群必须至少运行启用了椭圆曲线系统调用功能的1.17版本客户端。

更多信息：[https://github.com/solana-labs/solana/issues/29612](https://github.com/solana-labs/solana/issues/29612)

### 零知识证明分离

为了使用保密转账功能，集群必须至少运行启用了ZK Token证明程序的1.17版本客户端。

更多信息：[https://github.com/solana-labs/solana/pull/32613](https://github.com/solana-labs/solana/pull/32613)


## 未来工作

### 带费用的保密转账

由于交易大小限制，目前无法进行带费用的保密转账。我们计划在Solana 1.18版本中加入这一功能。

### 钱包[​](#wallets "直接链接到钱包")

首先，钱包需要正确处理Token-2022程序及其账户，通过获取Token-2022账户并向正确的程序发送指令。

接下来，为了使用保密转账，钱包需要创建零知识证明，这涉及到一种新的交易流程。

### 增加交易大小

为了支持在一次交易中完成保密转账，而不分割成多次交易，Solana网络必须接受具有更大有效载荷的交易。

更多信息：[https://github.com/orgs/solana-labs/projects/16](https://github.com/orgs/solana-labs/projects/16)

## 可升级性

为了便于更新和安全修复，程序部署需要保持可升级性。一旦完成审计且程序稳定运行六个月后，部署将被标记为最终状态，之后将不再可能进行升级。
