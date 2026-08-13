# P01 - 封面

大家好，今天我来给大家做一个关于 DreamMaker Scheduler 的架构分享。

DreamMaker 是我们网易互娱内部的 AI 美术平台，它把市面上各种 AI 模型——文生图、图生视频、3D 生成、语音等等——统一封装成了内部服务。

而 Scheduler，就是这个平台的后端微服务集群。它负责的事情用一句话概括就是：把 AI 生成任务从用户提交到 GPU Worker 执行，全流程调度。

今天这个分享大概 15 分钟，我会从整体架构讲起，然后深入任务调度和高可用机制。听完之后，大家应该能够用自己的话描述"一个 AI 任务从提交到返回结果到底经过了哪些组件"。

我们开始。

# P02 - Scheduler 是什么

首先看 Scheduler 的技术全貌。

一句话定位：Scheduler 是一个 Go 微服务集群，加上 Redis 任务队列、MongoDB 记录中心、etcd Worker 注册中心、K8s 服务发现，以及我们内部的 dmfr 框架。

右边这个表列出了核心技术栈。Go 加 dmfr 是我们统一的微服务框架，提供 HTTP Server、Client、日志、错误码这些标准化能力。Redis 用 ZSet 来做任务队列和乐观抢占。MongoDB 是任务记录中心，所有的参数、状态、结果都长期存在这里。etcd 做 Worker 和 Task 的运行态注册。Kafka 负责任务完成后通知下游的监控和统计系统。K8s 加 Istio 做服务发现和统一鉴权。HTTP 框架方面，新代码用 Hertz，老代码保留 Fiber。

大家不用一次记住所有的，后面我们会逐个展开。

# P03 - 五层架构

Scheduler 整体分为五层，每层有明确的职责边界。

最上面是外部请求层——前端主站、Monet 客户端、内部工具。它们只做一件事：组装 HTTP 请求、携带鉴权 Header。

第二层是业务服务层——api-outer 和 app-gateway。这一层负责参数校验、鉴权、参数映射和入队。注意，它不能直接调用 Worker，也不做 GPU 调度。

第三层是基础设施层——worker-scheduler。它从 Redis 拉队列、分配任务、回写结果。它不关心具体的推理逻辑。

第四层是 Worker 执行层——worker-sidecar 加上各类 Worker。它们接收任务、执行推理、上报结果。注意，Worker 不能反向依赖 app-gateway。

最底层是外部供应商层——ComfyUI、SD-WebUI、火山、Kling、Runway 这些。它们做实际的 AI 推理。

核心原则就一句话：每层只做自己的事，不越界。

# P04 - 三大核心组件

接下来我们看三个最核心的组件。

第一个是 app-gateway，它是任务入口。它做四件事：权限校验、参数映射、往 Mongo 写 AppRecord、往 Redis 入队，然后立即返回一个 task_id。为什么不能绕过它？因为它是唯一的鉴权入口，确保安全；所有任务必须创建 AppRecord，确保可观测；任务状态机依赖它建立初始状态，确保一致性。

第二个是 worker-scheduler，调度核心。它是多 Pod 并行的，没有 Leader 选举。它从 Redis 拉任务，从 Mongo 加载完整消息，注册到 etcd，然后下发给 Worker。这里有个关键设计：Worker Pull 模型。不是 scheduler 推任务给 Worker，而是 Worker 主动上报"我空闲了"，scheduler 才下发。这是天然的背压机制，Worker 永远不会被打爆。

第三个是 worker-sidecar，异构后端适配器。它是经典的 Adapter Pattern，把 scheduler 的派发逻辑和具体的推理后端解耦。新增一个 AI 能力时，scheduler 的调度代码不需要改，只需要在 sidecar 里新增 worker 实现，再在 action 层处理参数映射。

# P05 - 三套存储

很多人会问：为什么要用三套存储？Redis、MongoDB、etcd 各管各的，不能一套搞定吗？

答案是：不同语义用不同存储。

Redis 是短生命周期的"待消费"队列。用 ZSet 排序，member 只存 user 和 taskID，体积小、排序快。同时还给前端的 /status 接口做缓存，亚秒响应。

MongoDB 是长生命周期的"任务记录中心"。任务的所有参数、状态、结果都全量存在这里，用于查询、审计、计费。

etcd 是运行态的"强一致注册中心"。它有 Lease 和 Watch 两个杀手特性。Worker 挂掉之后，Lease 过期，key 自动删除，scheduler 通过 Watch 立刻感知。Mongo 做不到这种"心跳自动清理"。

底部这句话请大家记住：不同语义用不同存储，不要强求一套搞定——这是经典的分布式系统取舍。

# P06 - 任务生命周期

现在我们把前面的内容串起来，看一个任务从提交到完成的完整链路。

分三个阶段。

提交阶段：客户端发请求到 api-outer，JWT 鉴权通过后转给 app-gateway，权限校验加参数映射，然后往 Mongo 写 AppRecord，往 Redis ZAdd 入队，最后立即返回 task_id。注意，这里是完全异步的，提交后不等执行。

调度阶段：Worker 上报"我空闲了"，scheduler 先用 WeightedScheduler 选优先级，再 ZRange 扫描候选，ZRem 原子抢占，从 Mongo 加载完整消息，注册到 etcd，然后下发 JobReportData 给 Worker。

执行回写阶段：Worker 执行推理，上报结果，scheduler 调用 AfterCall 和 MapCallResponse 处理结果，写 Mongo Success，Kafka 通知下游，最后删除 etcd 中的 running 注册。

客户端通过 GET /status 轮询来获取结果。

# P07 - 状态机与 Action

每个任务有 6 种状态：waiting、queued、running、success、failed、stopped。waiting 用于任务等待前置条件的场景，queued 是入队后的初始状态。

代码层面用 Action 编排模式。设计模式是 Template Method 加 Strategy。分三层：Base 层实现公共逻辑，commonAction 层实现 ZSet 队列的入队、出队和抢占，大多数新供应商直接复用这一层就够了。只有工作流差异很大的才需要写专用 action。

编排链路是：BeforeProduce、Produce、Consume、BeforeCall、GenerateTask、AfterCall。

还有一个有意思的设计：Go 的类型断言做能力检测。不同 action 需要不同的能力，比如有的需要 RequestMapper 做参数映射，有的需要 Generator 生成 JobData。与其放在一个大接口里强制空实现，不如用类型断言实现接口隔离原则。

# P08 - Redis ZSet 乐观抢占

这是调度的核心机制。

ZSet 的设计有几个亮点。score 用毫秒时间戳，保证同优先级内 FIFO。member 只存 user 和 taskID，完整数据在 Mongo——这是关注点分离。抢占用 ZRem，返回值大于等于 1 就是抢到了。这是原子操作，不需要 Lua 脚本。因为 ZRange 只是 peek，真正的竞争点在 ZRem。多个 scheduler 同时 ZRange 到同一个 member 没关系，谁先 ZRem 谁赢。

队列不是一个大队列，而是按 priority、source、taskMode、cluster 拆成多个小队列。注意，当 priority 等于 0 时，key 会省略 priority 段，这是向后兼容的设计。好处是：不同集群隔离、独立限流、支持优先级调度、小队列 ZRange 更快。

消费时用两轮扫描策略。第一轮跳过有并发冲突的用户，优先分配给没有运行中任务的人——这是公平性。如果第一轮没抢到，第二轮消费冲突任务——保证吞吐量。这是经典的公平性和吞吐量的权衡。

# P09 - 优先级与并发控制

优先级调度用 WeightedScheduler，加权轮转。配置比如 priority 2 权重 5、priority 1 权重 3、priority 0 权重 2，那么每 10 次消费中高优先级 5 次、中 3 次、低 2 次。配额耗尽就重置，保证最低优先级每轮至少被消费 1 次，防饥饿。高优先级队列为空时，低优先级立即有机会，这是降序兜底。

并发控制用 ConcurrentManager，用 CAS 原子操作。低竞争场景下 CAS 比 Mutex 性能更好。并发数同步靠 etcd Watch 驱动：任务注册到 etcd 时所有 Pod 收到 Put 事件加 1，任务完成删除时所有 Pod 收到 Delete 事件减 1。这是最终一致的，有毫秒级延迟，但对实际场景完全可以接受。

# P10 - etcd 注册与故障检测

etcd 在这个系统中有四大核心能力。Put、Get、Delete 是基本读写。Watch 是监听变化实时推送。Lease 是给 key 绑 TTL，到期自动删除。Txn 是乐观锁事务。

Key 设计为 /worker/{env}/{podName} 和 /task/{env}/{taskID}，中间的 env 实现多环境隔离。

心跳机制：Sidecar 每 30 秒发心跳给 Scheduler，Scheduler 用 Txn 乐观锁写回 etcd，同时绑定最新 Lease。

故障检测链路：Worker 崩溃后心跳停止，Lease 过期，etcd 自动删除 key，触发 Watch Delete 事件，Scheduler 清理缓存并恢复并发计数。这样该用户的任务槽就释放了，可以提交新任务。

设计选择上用 Grant 每 300 秒重新创建 Lease，而不是 KeepAlive。TTL 设为 7200 秒，远大于 Grant 间隔，防止误删。

# P11 - Worker 生命周期与 Autoscaler

Worker 有五种状态：pending、running、recovering、terminating、terminated。处于 terminated 或 terminating 状态的 Worker 不参与任务分配。

Sidecar 优雅关闭是两阶段的。收到 K8s SIGTERM 后，先上报 shutdown，状态变为 terminating——这时不接新任务，但已有任务可以继续执行。等所有任务完成后，上报 exit，状态变为 terminated。这个两阶段设计保证了任务不会中途被杀。

Autoscaler 方面，K8s 原生的 HPA 看的是 CPU 和 Memory，但 GPU Worker 可能 GPU 负载高而 CPU 低，HPA 看不到 GPU 任务队列长度。所以我们自定义了 Autoscaler，直接读 MongoDB 中 queued 状态的任务数量来决策。30 秒定时触发，用 Redis 分布式锁保证同一时刻只有一个 Pod 在执行。扩容是唤醒 terminated 状态的 Worker，缩容是删除空闲超时的 Worker。安全检查方面，如果有 pending 或 terminating 的 Worker 就跳过本轮，防止雪球式过度扩容。

# P12 - 设计决策总结

最后总结五个核心设计决策。

第一，三套存储各司其职。Redis 做吞吐，Mongo 做持久，etcd 做一致性。

第二，Worker Pull 模型。天然背压，Worker 不会被打爆。

第三，多 Pod 并行加乐观抢占。etcd Watch 同步状态，Redis ZRem 竞争任务，不需要 Leader 选举。

第四，两轮扫描。公平性优先，吞吐量兜底。

第五，先加载再 Watch。启动时从 etcd 全量加载建立基线，然后 Watch 做增量更新。

最后送大家一句话：不同语义用不同存储，不同场景用不同策略。这就是分布式系统设计的核心智慧。

谢谢大家。
