接下来我们看三个最核心的组件。

第一个是 app-gateway，它是任务入口。它做四件事：权限校验、参数映射、往 Mongo 写 AppRecord、往 Redis 入队，然后立即返回一个 task_id。为什么不能绕过它？因为它是唯一的鉴权入口，确保安全；所有任务必须创建 AppRecord，确保可观测；任务状态机依赖它建立初始状态，确保一致性。

第二个是 worker-scheduler，调度核心。它是多 Pod 并行的，没有 Leader 选举。它从 Redis 拉任务，从 Mongo 加载完整消息，注册到 etcd，然后下发给 Worker。这里有个关键设计：Worker Pull 模型。不是 scheduler 推任务给 Worker，而是 Worker 主动上报"我空闲了"，scheduler 才下发。这是天然的背压机制，Worker 永远不会被打爆。

第三个是 worker-sidecar，异构后端适配器。它是经典的 Adapter Pattern，把 scheduler 的派发逻辑和具体的推理后端解耦。新增一个 AI 能力时，scheduler 的代码不需要改，只需要在 sidecar 里新增 worker 实现。