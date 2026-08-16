这是调度的核心机制。

ZSet 的设计有几个亮点。score 用毫秒时间戳，保证同优先级内 FIFO。member 只存 user 和 taskID，完整数据在 Mongo——这是关注点分离。抢占用 ZRem，返回值大于等于 1 就是抢到了。这是原子操作，不需要 Lua 脚本。因为 ZRange 只是 peek，真正的竞争点在 ZRem。多个 scheduler 同时 ZRange 到同一个 member 没关系，谁先 ZRem 谁赢。

队列不是一个大队列，而是按 priority、source、taskMode、cluster 拆成多个小队列。好处是：不同集群隔离、独立限流、支持优先级调度、小队列 ZRange 更快。

消费时用两轮扫描策略。第一轮跳过有并发冲突的用户，优先分配给没有运行中任务的人——这是公平性。如果第一轮没抢到，第二轮消费冲突任务——保证吞吐量。这是经典的公平性和吞吐量的权衡。