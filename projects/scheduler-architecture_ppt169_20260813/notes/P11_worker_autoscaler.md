Worker 有五种状态：pending、running、recovering、terminating、terminated。处于 terminated 或 terminating 状态的 Worker 不参与任务分配。

Sidecar 优雅关闭是两阶段的。收到 K8s SIGTERM 后，先上报 shutdown，状态变为 terminating——这时不接新任务，但已有任务可以继续执行。等所有任务完成后，上报 exit，状态变为 terminated。这个两阶段设计保证了任务不会中途被杀。

Autoscaler 方面，K8s 原生的 HPA 看的是 CPU 和 Memory，但 GPU Worker 可能 GPU 负载高而 CPU 低，HPA 看不到 GPU 任务队列长度。所以我们自定义了 Autoscaler，直接读 Redis 队列长度来决策。30 秒定时触发，用 Redis 分布式锁保证同一时刻只有一个 Pod 在执行。扩容是唤醒 terminated 状态的 Worker，缩容是删除空闲超时的 Worker。安全检查方面，如果有 pending 或 terminating 的 Worker 就跳过本轮，防止雪球式过度扩容。