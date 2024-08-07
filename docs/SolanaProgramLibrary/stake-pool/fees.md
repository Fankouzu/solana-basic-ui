# 费用

质押池的运营商应该花时间理解每种费用的目的，并仔细考虑它们，以确保质押池不会被滥用。

有五种不同的费用来源。

### 纪元费用

每个纪元（大约2天），池中的质押账户会获得通胀奖励，因此质押池会按获得奖励的比例，将池子代币铸造到管理者的费用账户中。

例如，如果池子获得了10 SOL的奖励，并且费用设置为2%，管理者将获得价值0.2 SOL的池子代币。

请注意，纪元费用是在正常验证者佣金评估后收取的。例如，如果一个验证者收取8%的佣金，质押池收取2%，而池中的质押在佣金前赚取了100 SOL，那么这个质押实际上会为池增加90.16 SOL。该验证者的总奖励将减少约9.84%。

当纪元费用更新时，变更仅在两个纪元边界后生效。例如，如果在100纪元更新纪元费用，新的费用将仅从102纪元开始使用。

### SOL提款费

将所需提款金额的一部分发送给管理者。

例如，如果用户希望提款100池子代币，费用设置为3%，3池子代币将归管理者所有，剩余的97代币将转换为SOL并发送给用户。

当SOL提款费更新时，变更仅在两个纪元边界后生效。例如，如果在100纪元更新费用，新的费用将仅从102纪元开始使用。

此外，费用增加限制为当前费用的1.5倍。例如，如果当前费用为2.5%，则可设置的最高费用为3.75%，这将在两个纪元边界后生效。

### 质押提款费

在为用户创建新的质押之前，将所需提款金额的一部分发送给管理者。

例如，如果用户希望提款100池子代币，费用设置为0.5%，0.5池子代币将归管理者所有，剩余的99.5代币将转换为SOL然后作为已激活的质押账户发送给用户。

当质押提款费更新时，变更仅在两个纪元边界后生效。例如，如果在100纪元更新费用，新的费用将仅从102纪元开始使用。

此外，费用增加限制为当前费用的1.5倍。例如，如果当前费用为2.5%，则可设置的最高费用为3.75%，这将在两个纪元边界后生效。

### SOL存款费

将整个SOL存款转换为池子代币，然后将池子代币的一部分发送给管理者，其余部分发送给用户。

例如，如果用户存入100 SOL，转换为90池子代币，费用为1%，那么用户将收到89.1池子代币，管理者将收到0.9池子代币。

### 质押存款费

将质押账户的委托加上租金豁免转换为池子代币，将其中一部分发送给管理者，其余部分发送给用户。质押账户的租金豁免部分按照SOL存款率转换，而质押按照质押存款率转换。

例如，假设池子代币与SOL的汇率为1:1，SOL存款率为10%，质押存款率为5%。如果用户存入一个质押账户，其中质押了100 SOL和0.00228288 SOL用于租金豁免。来自质押的费用价值5池子代币，来自租金豁免的费用价值0.000228288池子代币，因此用户收到95.002054592池子代币，管理者收到5.000228288池子代币。

## 推荐费（佣金）

对于合作伙伴应用程序，管理者可以在存款上设置推荐费。在SOL或质押存款期间，质押池将池子代币费用的百分比重新分配给另一个地址作为推荐费。

这个选项对钱包提供商特别有吸引力。当钱包集成质押池时，钱包开发者将有机会在用户存入质押池时赚取额外的代币。质押池管理者可以利用这个功能建立战略合作伙伴关系，并吸引更多人使用质押池！

## 最佳实践

除了货币化之外，费用是避免对质押池进行经济攻击并保持其运行的关键工具。为此，质押池CLI将防止管理者创建没有费用的池，除非他们还提供`--yolo`标志。

### 纪元

如果一个有1000个验证者的质押池每个纪元运行一次重新平衡脚本，质押者需要发送大约200笔交易来更新质押池余额，然后多达1000笔交易来增加或减少每个验证者的质押。

在撰写本文时，当前交易费用为每个签名 5,000 lamports ，因此这1200笔交易的最低成本为 6,000,000 lamports ，或0.006 SOL。为了收支平衡，质押池管理者每个纪元必须赚取0.006 SOL的费用。

例如，假设我们有一个质押了10,000 SOL的质押池，其质押赚取6% APY / ~3.3基点每个纪元的收益，每个纪元大约产生3.3 SOL的奖励。这个质押池的最低收支平衡纪元费用为0.18%。

### 质押存款/提款

如果质押池没有存款或提款费，恶意的池子代币持有者可以轻易地从质押池中窃取价值。

在最简单的攻击中，每个纪元的末尾，恶意的池子代币持有者找到池中表现最好的验证者，提取相当于他们所有池子代币的活跃质押，等待纪元滚动，赚取最大的质押奖励，然后立即重新存入质押池。

实际上，恶意存款人总是委托给质押池中表现最好的验证者，而从未真正向该验证者承诺质押。除此之外，恶意存款人绕过了任何纪元费用。

为了使这种攻击不可行，质押池管理者可以设置存款或提款费。如果质押池的整体表现为6% APY / ~3.3基点每个纪元，而最佳验证者的表现为6.15% APY / ~3.37基点每个纪元，那么最低的质押存款/提款费将是0.07基点。

为了完全安全，如果池中的一个违约验证者降低了性能，管理者可能希望提高更多。

### SOL存款/提款

如果质押池的SOL存款/提款费为0，则恶意的SOL持有者可以执行类似的攻击，从池中提取更多价值。

如果他们将SOL存入质押池，提取池中顶级验证者的质押账户，等待纪元滚动，然后将该质押重新存入池中，然后提取SOL，他们基本上在没有任何时间承诺的情况下免费赚取了即时奖励。与此同时，质押池的性能下降了，因为存入的流动SOL没有赚取奖励。

例如，如果质押池中表现最好的验证者赚取6.15% APY / ~3.37基点每个纪元，那么最低的SOL存款/提款费应该是3.37基点。

### 最后的思考

前几节中概述的攻击是任何人都可以轻易执行的最简单的攻击，只需通过每个 epoch 运行几次几个个脚本即可。对于零费用或非常低费用的质押池，可能有更复杂的攻击，因此请确保用费用保护您的存款人！
