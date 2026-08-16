etcd 在这个系统中有四大核心能力。Put、Get、Delete 是基本读写。Watch 是监听变化实时推送。Lease 是给 key 绑 TTL，到期自动删除。Txn 是乐观锁事务。

Key 设计为 /worker/{env}/{podName} 和 /task/{env}/{taskID}，中间的 env 实现多环境隔离。

心跳机制：Sidecar 每 30 秒发心跳给 Scheduler，Scheduler 用 Txn 乐观锁写回 etcd，同时绑定最新 Lease。

故障检测链路：Worker 崩溃后心跳停止，Lease 过期，etcd 自动删除 key，触发 Watch Delete 事件，Scheduler 清理缓存并恢复并发计数。这样该用户的任务槽就释放了，可以提交新任务。

设计选择上用 Grant 每 300 秒重新创建 Lease，而不是 KeepAlive。TTL 设为 7200 秒，远大于 Grant 间隔，防止误删。