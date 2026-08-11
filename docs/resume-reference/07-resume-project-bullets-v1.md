# 简历项目经历初稿 v1

> 生成日期：2026-08-01
> 状态：**初稿，量化数据待补**
> 写作风格参考：06-external-internship-reference.md（懂车族/京东密集段落式）

---

## 实习经历（简写）

```
网易互娱 | AI 平台开发实习生 | 202X.XX - 至今
参与 Monet AI 智能体平台和 DreamMaker 分布式任务调度系统的开发

科大讯飞 | 大模型算法实习生 | 202X.XX - 202X.XX
参与大模型后训练（GRPO 强化学习）与训练数据工程工作
```

---

## 项目一：Monet — AI 美术智能体平台

**角色**：Agent 开发实习生 &emsp; **时间**：202X.XX - 至今
**技术栈**：Python 3.13, FastAPI, LangGraph, DeepAgent, MCP, SSE, SQLite, Pytest
**项目背景**：网易互娱 AI 美术平台客户端 Agent 服务，打包在桌面客户端中，通过 SSE 与画布 UI 交互，驱动图像/视频/3D 等 AI 创作能力，日均处理 XX 万请求。

### Bullet 1 · SSE 流式响应协议设计

设计 Agent 到前端的 SSE 流式通信协议：抽象出流适配器基类（模板方法模式），提供事件 ID 自增、心跳保活、异常帧自动发送等通用能力；实现具体适配器将 LangGraph 内部事件翻译为 Message → Block 两层内容模型，支持 text / tool_use 等内容块类型及 delta 增量推送。前端只需监听标准化 SSE 事件即可渲染，底层 Agent 框架切换对前端完全透明。

### Bullet 2 · Agent 画布感知机制

实现 Agent 对画布状态的实时感知，设计三层注入机制解决"LLM 不知道画布长什么样"的问题：第一层在请求入口自动拉取画布概览写入请求级缓存（contextvar）；第二层在每次 LLM 调用时拦截注入最新画布状态（深拷贝避免污染历史记录）；第三层提供按需查询工具，Agent 需要节点细节时主动调用，复用缓存避免重复请求。相比将画布信息硬编码在 System Prompt 中，该方案支持动态更新且不占用固定 token 窗口。

### Bullet 3 · Human-in-the-Loop 权限审批

基于 LangGraph interrupt 机制实现本地执行的权限审批系统：定义权限引擎协议，将操作分为读操作（直接放行）和写操作/命令执行（需用户审批）两类；审批时 Agent 暂停并通过 SSE 推送审批请求事件，用户决策通过 REST API 回传后唤醒 Agent 继续执行。协议设计支持 Confirmation / Choice 等多种交互类型扩展，新增交互场景无需修改通信层。

### Bullet 4 · 对话状态持久化与断点续跑

基于 LangGraph Checkpointer 机制实现本地 SQLite 持久化，支持 Agent 对话的断点恢复：每次状态转换自动写入 checkpoint，客户端重启或断连后从最近检查点恢复上下文，无需云端同步；设计会话级任务取消机制，同一 session 新请求到来时自动取消旧任务并等待其安全退出，保证 checkpoint 状态一致性。

---

## 项目二：DreamMaker — 分布式 AI 任务调度平台

**角色**：后端开发实习生 &emsp; **时间**：202X.XX - 至今
**技术栈**：Go, Hertz/Fiber, Redis, MongoDB, etcd, Kubernetes, dmfr 微服务框架
**项目背景**：网易互娱 AI 美术平台主站后端，五层微服务架构（网关→业务→调度→Worker→供应商），承载图像/视频/3D/音频等 10 类 AI 任务的调度与执行，日均处理 XX 万任务。

### Bullet 1 · Redis 任务队列与优先级调度

参与任务调度核心链路开发：基于 Redis ZSet 实现优先级任务队列，以时间戳为 score 保证同优先级 FIFO，通过 ZRange + ZRem 实现乐观抢占式消费（类 CAS），避免分布式锁开销；实现 WeightedScheduler 加权轮询算法，按配额比例分配不同优先级任务的消费额度，配额耗尽后降序兜底保证低优先级不被饿死；基于 etcd Watch + 内存原子计数器实现用户级并发控制（ConcurrentManager），同一用户同时运行的任务数超过阈值时跳过该用户任务，避免单用户独占集群资源。

### Bullet 2 · 调度系统高可用设计

参与调度系统的高可用能力建设：Worker 通过 etcd Lease 注册并以 30s 间隔上报心跳，worker-scheduler 通过 etcd Watch 实时感知 Worker 上下线；Worker 崩溃后 Lease 过期触发 Delete 事件，scheduler 自动回收该 Worker 上的任务并重新入队，保证任务不丢失；实现应用层 Autoscaler，30s 轮询 Redis 队列深度与在线 Worker 数量，积压任务超过处理能力时通过 K8s API 自动扩容 StatefulSet 副本，空闲超时后缩容释放资源。

### Bullet 3 · 供应商 429 限流排队重试机制

针对外部 AI 供应商（GPT-Image / Gemini）并发槽满返回 429 时直接报错的问题，实现排队重试机制：收到 429 后进入指数退避重试循环（initial 3s, max 60s, multiplier 2.0, jitter ±20%），最大等待 12h；超时后返回 retryable error 触发 fallback 切换备用供应商通道。零配置默认启用，通过白名单控制生效范围，避免对时效敏感任务造成阻塞。

### Bullet 4 · 统一限流与 API Key 管理

参与 DreamMaker 对外 API 开放能力建设：实现统一限流中间件，支持 App 级和 Model 级两层限流策略（Redis 计数器 + 滑动窗口），default 用户兜底；开发 API Key 全生命周期管理（创建 / 轮转 / 禁用 / 删除），Authorization 层拦截 disabled 状态 Key，Delete/Disable 操作校验用户组管理员或 Key 创建者权限。API Key 上限从 3 提升到 10，支持按 api_type 区分 app/model 粒度申请。

---

## 写作备注

### 量化数据待填（后续从监控或同事处确认）

**Monet**:
- [ ] 日均请求量
- [ ] 后处理能力种类数
- [ ] 批量生成耗时降低比例
- [ ] 任务成功率提升

**Scheduler**:
- [ ] 日均任务量
- [ ] 429 重试后成功率
- [ ] 图片压缩后放行率（如"XX% 的超限请求经压缩后成功提交"）
- [ ] 接入的供应商/能力数量

### 面试可能追问的点

| Bullet | 可能追问 | 准备方向 |
|--------|---------|---------|
| Monet-1 SSE 流式 | 为什么要三层？心跳怎么做？delta 怎么拼？ | AgentStreamAdapter 模板方法 + 心跳间隔 + block delta 拼接 |
| Monet-2 画布感知 | 为什么注入在模型层不在 System Prompt？contextvar 线程安全？ | 动态变化不适合静态 prompt + contextvar 请求作用域隔离 |
| Monet-3 HITL | interrupt 怎么实现？并发安全？超时？ | asyncio.Event + 单机单用户无竞态 + 超时 cleanup |
| Monet-4 Checkpointer | checkpoint 什么时候写？怎么恢复？多轮冲突？ | 每次状态转换写入 + thread_id 定位 + in-flight cancel |
| Scheduler-1 重试 | 为什么 max 12h？会不会堆积？ | PT 专用通道无超时压力 + 队列深度监控 |
| Scheduler-2 队列调度 | ZSet vs List 怎么选？乐观抢占怎么保证不重复消费？ | ZSet 支持优先级 + ZRem 原子性 + 两轮扫描 |
| Scheduler-3 高可用 | Leader 挂了怎么办？脑裂怎么防？ | LeaseLock 机制 + OnStoppedLeading 退出 + etcd Watch |
| Scheduler-4 限流 | 滑动窗口 vs 令牌桶？为什么选这个？ | 实现简单 + 精度够用 + Redis 原子操作 |
