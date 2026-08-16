现在我们把前面的内容串起来，看一个任务从提交到完成的完整链路。

分三个阶段。

提交阶段：客户端发请求到 api-outer，JWT 鉴权通过后转给 app-gateway，权限校验加参数映射，然后往 Mongo 写 AppRecord，往 Redis ZAdd 入队，最后立即返回 task_id。注意，这里是完全异步的，提交后不等执行。

调度阶段：Worker 上报"我空闲了"，scheduler 先用 WeightedScheduler 选优先级，再 ZRange 扫描候选，ZRem 原子抢占，从 Mongo 加载完整消息，注册到 etcd，然后下发 JobReportData 给 Worker。

执行回写阶段：Worker 执行推理，上报结果，scheduler 调用 AfterCall 和 MapCallResponse 处理结果，写 Mongo Success，Kafka 通知下游，最后删除 etcd 中的 running 注册。

客户端通过 GET /status 轮询来获取结果。