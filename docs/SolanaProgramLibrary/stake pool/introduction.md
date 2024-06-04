# 质押池介绍

一个将 SOL 汇集在一起，并由运行委托机器人（Delegation Bot）的链下代理进行质押的程序，该机器人会在网络上重新分配质押，并试图最大化抗审查性和奖励。

信息 | 账户地址 
-- | -- 
质押池程序| SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy

# 入门指南

开始使用质押池：
- [安装Solana 工具](https://docs.solana.com/cli/install-solana-cli-tools)
- [安装质押池CLI](https://spl.solana.com/stake-pool/cli)
- [按照快速入门指南操作](https://spl.solana.com/stake-pool/quickstart)
- [了解更多关于质押池的信息](https://spl.solana.com/stake-pool/overview)
- [了解更多关于费用和货币化的信息](https://spl.solana.com/stake-pool/fees)

# 源码
质押池程序的源码可在 [GitHub](https://github.com/solana-labs/solana-program-library/tree/master/stake-pool) 上获取。

有关类型和指令的信息，可在 [docs.rs](https://docs.rs/spl-stake-pool/latest/spl_stake_pool/index.html) 上查阅质押池 Rust 文档。

# 安全审计
多家安全公司对质押池程序进行了审计，以确保资金的完全安全。审计报告按时间顺序排列，并附上每次审计时的提交哈希：

- Quantstamp
  - 初次审查提交哈希：[99914c9](https://github.com/solana-labs/solana-program-library/tree/99914c9fc7246b22ef04416586ab1722c89576de)
  - 复审提交哈希：[3b48fa0](https://github.com/solana-labs/solana-program-library/tree/3b48fa09d38d1b66ffb4fef186b606f1bc4fdb31)
  - 最终报告：https://github.com/solana-labs/security-audits/blob/master/spl/QuantstampStakePoolAudit-2021-10-22.pdf
- Neodyme
  - 审查提交哈希：[0a85a9a](https://github.com/solana-labs/solana-program-library/tree/0a85a9a533795b6338ea144e433893c6c0056210)
  - 报告：https://github.com/solana-labs/security-audits/blob/master/spl/NeodymeStakePoolAudit-2021-10-16.pdf
- Kudelski
  - 审查提交哈希：[3dd6767](https://github.com/solana-labs/solana-program-library/tree/3dd67672974f92d3b648bb50ee74f4747a5f8973)
  - 报告：https://github.com/solana-labs/security-audits/blob/master/spl/KudelskiStakePoolAudit-2021-07-07.pdf
- Neodyme 第二次审计
  - 审查提交哈希：[fd92ccf](https://github.com/solana-labs/solana-program-library/tree/fd92ccf9e9308508b719d6e5f36474f57023b0b2)
  - 报告：https://github.com/solana-labs/security-audits/blob/master/spl/NeodymeStakePoolAudit-2022-12-10.pdf
- OtterSec
  - 审查提交哈希：[eba709b](https://github.com/solana-labs/solana-program-library/tree/eba709b9317f8c7b8b197045161cb744241f0bff)
  - 报告：https://github.com/solana-labs/security-audits/blob/master/spl/OtterSecStakePoolAudit-2023-01-20.pdf
- Neodyme 第三次审计
  - 审查提交哈希：[b341022](https://github.com/solana-labs/solana-program-library/tree/b34102211f2a5ea6b83f3ee22f045fb115d87813)
  - 报告：https://github.com/solana-labs/security-audits/blob/master/spl/NeodymeStakePoolAudit-2023-01-31.pdf
- Halborn
  - 审查提交哈希：[eba709b](https://github.com/solana-labs/solana-program-library/tree/eba709b9317f8c7b8b197045161cb744241f0bff)
  - 报告：https://github.com/solana-labs/security-audits/blob/master/spl/HalbornStakePoolAudit-2023-01-25.pdf
- Neodyme 第四次审计
  - 审查提交哈希：[6ed7254](https://github.com/solana-labs/solana-program-library/tree/6ed7254d1a578ffbc2b091d28cb92b25e7cc511d)
  - 报告：https://github.com/solana-labs/security-audits/blob/master/spl/NeodymeStakePoolAudit-2023-11-14.pdf
- Halborn 第二次审计
  - 审查提交哈希：[a17fffe](https://github.com/solana-labs/solana-program-library/tree/a17fffe70d6cc13742abfbc4a4a375b087580bc1)
  - 报告：https://github.com/solana-labs/security-audits/blob/master/spl/HalbornStakePoolAudit-2023-12-31.pdf
