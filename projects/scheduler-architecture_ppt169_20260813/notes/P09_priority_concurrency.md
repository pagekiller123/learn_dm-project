优先级调度用 WeightedScheduler，加权轮转。配置比如 priority 2 权重 5、priority 1 权重 3、priority 0 权重 2，那么每 10 次消费中高优先级 5 次、中 3 次、低 2 次。配额耗尽就重置，保证最低优先级每轮至少被消费 1 次，防饥饿。高优先级队列为空时，低优先级立即有机会，这是降序兜底。

并发控制用 ConcurrentManager，用 CAS 原子操作。低竞争场景下 CAS 比 Mutex 性能更好。并发数同步靠 etcd Watch 驱动：任务注册到 etcd 时所有 Pod 收到 Put 事件加 1，任务完成删除时所有 Pod 收到 Delete 事件减 1。这是最终一致的，有毫秒级延迟，但对实际场景完全可以接受。