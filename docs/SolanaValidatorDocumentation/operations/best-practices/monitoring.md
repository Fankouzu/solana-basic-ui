# Solana 验证器监控最佳实践

确保你的验证器配置了监控至关重要。万一你的验证器出现逾期（落后于网络其他节点），你需要立即响应并修复问题。一个非常有用的监控工具是[`solana-watchtower`](https://docs.solanalabs.com/operations/best-practices/monitoring#solana-watchtower)。

## Solana Watchtower

Solana Watchtower是一款极为实用的监控工具，它会定期检查你的验证器健康状况。它能监控你的验证器是否有逾期行为，然后通过你选择的应用程序（如 Slack、Discord、Telegram 或 Twilio）通知你。此外，`solana-watchtower`还能监控整个集群的健康状态，使你能够意识到任何集群范围内的问题，从而确保你能及时响应并维护网络的稳定运行。

### 入门

要开始使用 Solana Watchtower，运行命令 `solana-watchtower --help`。从帮助菜单中，你可以查看可选标志及命令的解释。

以下是一个示例命令，用于监控标识公钥为 `2uTk98rqqwENevkPH2AHHzGHXgeGc1h6ku8hQUqWeXZp` 的验证器节点：

```
solana-watchtower --monitor-active-stake --validator-identity \
  2uTk98rqqwENevkPH2AHHzGHXgeGc1h6ku8hQUqWeXZp
```

该命令将监控你的验证器，但除非你添加了在 `solana-watchtower --help` 中提到的环境变量，否则你不会收到通知。由于为每种通知服务设置可能不那么直接，下一节将引导你完成[在 Telegram 上设置watchtower通知](https://docs.solanalabs.com/operations/best-practices/monitoring#setup-telegram-notifications)的步骤。

### 最佳实践

最佳实践是在与你的验证器分开的服务器上运行 `solana-watchtower` 命令。

如果您将 `solana-watchtower` 运行在与 `solana-validator` 进程相同的计算机上，那么在像停电这样的灾难性事件中，您可能无法意识到问题的存在，因为您的 `solana-watchtower` 进程会在同一时间停止，与您的 `solana-validator` 进程一起。

此外，虽然在终端中手动设置环境变量并运行 `solana-watchtower` 进程是测试命令的一种好方法，但从运行操作角度来看并不可靠，因为该进程不会在终端关闭或系统重启期间重新启动。

相反，您可以将 `solana-watchtower` 命令作为系统进程运行，类似于 `solana-validator`。在系统进程文件中，您可以指定机器人的环境变量。

### 设置 Telegram 通知

为了将验证器健康状态通知发送到您的Telegram账户，我们需要完成以下几个步骤：

1. 创建一个用于发送消息的机器人。这个机器人将通过 Telegram上 的 BotFather 来创建。
2. 给机器人发送一条消息。
3. 创建一个 Telegram 群组，该群组将接收 watchtower 的通知。
4. 在命令行环境中添加环境变量。
5. 重启`solana-watchtower`命令。

#### 使用BotFather创建机器人

在 Telegram 中搜索 `@BotFather`。向 **BotFather** 发送以下消息：`/newbot`。

现在，您需要为机器人想一个名字。唯一的要求是名字不能包含破折号或空格，并且**必须**以`bot`结尾。很多名字已经被占用，因此您可能需要尝试几个。一旦找到可用的名字，**BotFather**会回复您，其中包括与机器人聊天的链接以及机器人的一个令牌。请记下这个令牌，在设置环境变量时会用到。

#### 向机器人发送消息

在 Telegram 中找到该机器人并向它发送如下消息：`/start`。向机器人发送消息将在之后帮助您找到机器人聊天室ID。

#### 创建 Telegram 群组

在 Telegram 中，点击新消息图标，然后选择创建新群组。找到您新创建的机器人并将其添加到群组中。接下来，为群组起一个你喜欢的名字。

#### 为 Watchtower 设置环境变量

既然您已经设置了机器人，接下来需要为该机器人设置环境变量，以便 watchtower 能够发送通知。

首先，请回顾从**@BotFather**收到的聊天消息。在消息中，有一个用于您机器人的 HTTP API 令牌，格式如下：`389178471:MMTKMrnZB4ErUzJmuFIXTKE6DupLSgoa7h4o`。您将使用此令牌设置`TELEGRAM_BOT_TOKEN`环境变量。在计划运行`solana-watchtower`的终端中，执行以下命令：

```
export TELEGRAM_BOT_TOKEN=<HTTP API Token>
```

接下来，您需要群组的`chat id`，以便`solana-watchtower`知道应将消息发送到何处。首先，在您创建的聊天群组中向您的机器人发送一条消息，比如 `@newvalidatorbot hello`。

接下来，在您的浏览器中，访问 `https://api.telegram.org/bot<HTTP_API令牌>/getUpdates`。确保将`<HTTP_API令牌>`替换为您从**@BotFather**消息中获得的API令牌。同时，请确保在 URL 中的 API 令牌前包含单词`bot`。在浏览器中发起这个请求。

响应应该是JSON格式的。在JSON中搜索字符串`"chat":`。该`chat`对象下的`id`值就是您的`TELEGRAM_CHAT_ID`。它会是一个负数，比如：`-781559558`。请记住要包含负号！如果您在JSON中找不到`"chat":`，那么您可能需要先将机器人从聊天群组中移除，然后再重新添加一次。

掌握 Telegram `chat id` 后，导出您计划运行 solana-watchtower 的环境变量：

```
export TELEGRAM_CHAT_ID=<negative chat id number>
```

#### 重启 solana-watchtower

一旦设置了环境变量，接下来请重启 `solana-watchtower`。您应该能看到与验证器相关的输出信息。

为了测试您的Telegram配置是否工作正常，您可以暂时停止验证器，直到其被标记为逾期。一旦验证器处于逾期状态，最多在一分钟后，您应该能在Telegram群组中收到由您的机器人发送的消息。之后再次启动验证器，并确认您能从机器人那里收到另一条消息，这条消息应当显示 `all clear`。