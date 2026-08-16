首先看 Scheduler 的技术全貌。

一句话定位：Scheduler 是一个 Go 微服务集群，加上 Redis 任务队列、MongoDB 记录中心、etcd Worker 注册中心、K8s 服务发现，以及我们内部的 dmfr 框架。

右边这个表列出了核心技术栈。Go 加 dmfr 是我们统一的微服务框架，提供 HTTP Server、Client、日志、错误码这些标准化能力。Redis 用 ZSet 来做任务队列和乐观抢占。MongoDB 是任务记录中心，所有的参数、状态、结果都长期存在这里。etcd 做 Worker 和 Task 的运行态注册。Kafka 负责任务完成后通知下游的监控和统计系统。K8s 加 Istio 做服务发现和统一鉴权。HTTP 框架方面，新代码用 Hertz，老代码保留 Fiber。

大家不用一次记住所有的，后面我们会逐个展开。