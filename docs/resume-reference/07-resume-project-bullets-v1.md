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

### Bullet 1 · Agent 本地执行 + Human-in-the-Loop 交互通道

基于 LangGraph interrupt 机制实现 Agent 本地 shell 执行和文件读写的 HITL 审批能力。设计 Confirmation / Choice 两类通用交互协议和 Allow / Needs-Approval / Deny 三级权限决策模型；SSE 层新增 interaction.request / interaction.resolved 事件对，前端收到请求后弹出审批弹窗，用户决策通过 POST /chat/{session_id}/resume 回传 Agent 继续执行。交互通道协议可扩展，后续新增"从多方案选一个"等交互类型无需改动 SSE 层。

### Bullet 2 · MCP 协议接入与运行时工具管理

实现 Agent 对 MCP（Model Context Protocol）server 的接入能力，支持 stdio / HTTP / SSE / WebSocket 四种传输协议。开发运行时增删改查 API，支持用户在不重启 Agent 的情况下热加载新的 MCP server；将 MCP 工具自动注入 DeepAgent 的工具列表，与内置画布工具统一调度。解决了 SSE 工具调用关联串位和 MCP ToolMessage 内容序列化兼容问题。

### Bullet 3 · 声明式后处理调用框架

重构后处理系统为声明式三层架构（接口层→定义层→执行层）：接口层暴露统一的 REST API，定义层通过 config + JSON Schema 描述每种后处理操作的参数和后端调用方式，执行层统一执行轮询与结果回填。新增后处理操作只需编写一份配置文件和参数 Schema，无需新写执行器代码。基于该框架接入 VR 全景图、多角度灯光、AI 扩图等 XX 种后处理能力。

### Bullet 4 · 批量生成并发轮询与瞬时容错

解决批量生成场景下串行轮询效率低、网络抖动误判任务失败的问题。引入 TaskOutcome sum type（Succeeded / Failed / Aborted）统一任务终态表达，将串行轮询改为 asyncio 并发，单次网络超时不再直接判定失败而是进入瞬时容错重试。批量生成改为增量回显模式，每个子任务独立完成即写入画布，用户无需等待全部完成。

---

## 项目二：DreamMaker — 分布式 AI 任务调度平台

**角色**：后端开发实习生 &emsp; **时间**：202X.XX - 至今
**技术栈**：Go, Hertz/Fiber, Redis, MongoDB, etcd, Kubernetes, dmfr 微服务框架
**项目背景**：网易互娱 AI 美术平台主站后端，五层微服务架构（网关→业务→调度→Worker→供应商），承载图像/视频/3D/音频等 10 类 AI 任务的调度与执行，日均处理 XX 万任务。

### Bullet 1 · Redis 任务队列与优先级调度

参与任务调度核心链路开发：基于 Redis ZSet 实现优先级任务队列，以时间戳为 score 保证同优先级 FIFO，通过 ZRangeByScore + ZRem 实现乐观抢占式消费（类 CAS），避免分布式锁开销；实现 WeightedScheduler 加权轮询算法，按配额比例分配不同优先级任务的消费额度，配额耗尽后降序兜底保证低优先级不被饿死；基于 etcd Watch + 内存计数器实现用户级并发控制（ConcurrentManager），同一用户同时运行的任务数超过阈值时跳过该用户任务，避免单用户独占集群资源。

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
| Monet-1 HITL | interrupt 怎么实现的？并发安全？ | LangGraph interrupt 机制 + SSE 单连接无竞态 |
| Monet-2 MCP | MCP 和普通 Function Calling 区别？热加载怎么做？ | 协议标准化 + server 生命周期管理 |
| Monet-3 声明式框架 | 为什么不用策略模式/工厂？配置怎么校验？ | config 足够表达语义 + JSON Schema 校验 |
| Monet-4 容错 | 什么是"瞬时容错"？怎么判断临时故障？ | 重试次数 + 指数退避 + 终态判定 |
| Scheduler-1 重试 | 为什么 max 12h？会不会堆积？ | PT 专用通道无超时压力 + 队列深度监控 |
| Scheduler-2 队列调度 | ZSet vs List 怎么选？乐观抢占怎么保证不重复消费？ | ZSet 支持优先级 + ZRem 原子性 + 两轮扫描 |
| Scheduler-3 高可用 | Leader 挂了怎么办？脑裂怎么防？ | LeaseLock 机制 + OnStoppedLeading 退出 + etcd Watch |
| Scheduler-4 限流 | 滑动窗口 vs 令牌桶？为什么选这个？ | 实现简单 + 精度够用 + Redis 原子操作 |
