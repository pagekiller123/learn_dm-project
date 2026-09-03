# 生成 PPT 的 Prompt

> 将以下 Prompt 完整粘贴给 ppt-master（在 ppt-master 目录下新开 Claude Code 会话）或其他 AI PPT 工具。

---

## Prompt

请根据以下内容生成一份**中文技术汇报 PPT**，18 页，深色商务科技风格。

### 整体要求

- **用途**：公司内部周会技术汇报，听众是后端/基础架构方向的同事和主管
- **风格**：深色背景 + 蓝/青色系科技风，文字白色为主，关键词用亮色高亮
- **字体**：标题用粗体，正文用简洁的无衬线字体
- **每页文字量**：标题 + 3-5 个要点，不要大段文字，技术细节用简短关键词或示意图表达
- **配图**：需要架构图/流程图的页面用简洁的方框+箭头示意图，不需要真实截图

### 18 页结构

**P01 — 封面**
- 标题：DreamMaker AI 美术平台 — 技术架构分享
- 副标题：部署拓扑 · Agent 引擎 · 云端调度
- 作者/日期

**P02 — 部署拓扑：三个物理位置**
- 架构图：左侧"用户电脑"（包含 Electron 前端 + Python Agent 服务），右侧"云端服务器"（Scheduler 集群 + AIGW）
- 标注三个位置：① Electron 客户端 ② dm-monet-agent 本地服务 ③ 云端微服务
- 通信方式标注：前端↔Agent 用 SSE，Agent→AIGW 用流式 HTTP（全链路流式），Agent→Scheduler 用 REST（POST 提交 + GET 轮询）

**P03 — 模块一：Electron 前端 UI 形态**
- 界面示意：左侧"画布区域"（React Flow，节点+连线），右侧"Agent 聊天面板"
- 两种操作路径：手动操作画布 vs Agent 对话驱动
- 节点类型：图像/视频/3D/音频/文本

**P04 — 画布数据存储与前后端通信**
- 关键点：画布数据存云端（dm-tapnow-backend），不在本地
- 本地 Agent = 纯计算节点，唯一持久化数据 = SQLite checkpoint
- 通信模型：POST /chat → SSE 长连接推事件 → POST /resume 审批决策

**P05 — 模块二：Agent 引擎 DeepAgents + LangGraph**
- ReAct 循环图：LLM 推理 → 工具调用 → 观察结果 → 继续推理
- 三个关键设计：ChatAIGW（继承 ChatOpenAI）流式调用、AsyncSqliteSaver 状态持久化、recursion_limit=9999
- 底层：LangGraph StateGraph 状态机

**P06 — asyncio 事件循环与协程调度**
- 单线程事件循环示意图：多个协程交替执行，await 时切换
- 核心原则：任何同步阻塞 = 冻住整个服务
- 异步替代：httpx 替代 requests，asyncio.sleep 替代 time.sleep

**P07 — ContextVar：跨框架传递画布数据**
- 调用链示意：routes → StreamAdapter → LangGraph → ChatAIGW → inject_canvas_overview
- ContextVar 解法：入口写入，深层直接读取，不改框架签名
- 两个价值：免传参 + 请求内缓存

**P08 — Message/Block 双层模型与 SSE 事件翻译**
- 数据结构：Message 包含 blocks 数组，每个 Block 有 type（text/tool_use/...）
- SSE 生命周期：block.created → block.delta → block.updated
- DeepAgentStreamAdapter：LangGraph 内部事件 → 前端 SSE 协议（框架解耦）

**P09 — 分层上下文感知**
- 三层金字塔图：
  - 底层：画布概览（入口注入，5 级渐进渲染 + ContextVar 缓存）
  - 中层：按需查询（工具检索，节点详情/子图）
  - 顶层：上下文溢出自动压缩（ChatAIGW 转 ContextOverflowError → DeepAgent SummarizationMiddleware 压缩历史 → 重试，被动触发）

**P10 — HITL 人机审批流程**
- 四步流程图：中断（GraphInterrupt）→ 推送审批事件 → 等待决策（asyncio.Event, 300s 超时）→ 恢复（Command resume）
- 两层权限：工具级静态配置 + 请求级模式（ASK / FULL_ACCESS）
- 关键约束：interrupt() 前代码必须幂等

**P11 — 任务提交与轮询**
- 流程：POST 提交 → 拿 task_id → 固定间隔轮询 → 拿结果
- 轮询间隔：图像 5s / 3D 10s / 视频 30s
- 过渡：引出模块三

**P12 — 模块三：Scheduler 四大组件与任务全链路**
- 四个组件方框图：app-gateway → worker-scheduler → worker-sidecar → AIGW 供应商网关
- 全链路箭头流：提交 → Redis 入队 + MongoDB 记录 → 消费调度 → 执行 → Report 回写 → 轮询返回

**P13 — 优先级队列调度：加权轮询 + 无锁抢占**
- 加权轮询示意：priority=5 weight=5, priority=0 weight=3 → 一轮 8 次分配
- 三层消费：加权选队列 → 尝试消费 → 降序兜底
- 无锁抢占：ZRange 批量取 256 → 遍历检查并发 → ZREM 原子抢占

**P14 — 用户并发管控：etcd Watch + 内存原子计数器**
- ConcurrentManager：taskMap + userMap，go.uber.org/atomic Int64，CAS 循环
- etcd Watch 驱动：PUT → +1，DELETE → -1
- 多 Pod 一致性：各自 Watch 同一前缀，毫秒级最终一致

**P15 — Worker 注册发现与心跳**
- 生命周期图：启动注册 → 30s 心跳 → 宕机 → Lease 过期 → Watch DELETE → 三步清理
- 两套 Lease：scheduler 侧 TTL=7200s（任务），api-kube 侧 TTL=3600s（Worker Pod）
- 清理三步：workerCache.Delete → cacheKeyManager.WorkerDelete → workerClusterMap.Decr

**P16 — GPU Worker 弹性扩缩容**
- 为什么不能用 HPA：GPU 满载时 CPU 闲，HPA 误判
- 自定义 Autoscaler：队列积压深度，30s 检查，唤醒 terminated Pod
- 五个防护：冷却机制 / 优雅下线 / MinWorker / 安全检查 / SetNX 互斥锁

**P17 — 容错降级：三层重试与供应商切换**
- 三层嵌套图（从内到外）：
  - 第一层 executeWithRetry：3 次尝试（含首次），1s→2s 指数退避，最后一次失败不再 sleep
  - 第二层 queue-retry：429 限流，3s→60s 长退避，最长 12h
  - 第三层 Fallback chain：主供应商 → 备用 1 → 备用 2（无状态 per-request）
- 可优化方向：熔断器 Circuit Breaker

**P18 — 总结与回顾**
- 全链路回顾图：用户操作 → Electron → Agent 服务 → Scheduler → Worker → 供应商 → 结果回传
- 三个模块核心亮点各一句话：
  - Agent：全链路流式 + ReAct 状态机 + HITL 审批
  - Scheduler：加权轮询 + 无锁抢占 + etcd Watch 并发管控
  - Worker：三层容错 + GPU 自定义扩缩容
- "谢谢，欢迎交流"

### 输出要求

- 生成可编辑的 .pptx 文件
- 每页有 Speaker Notes（演讲备注），内容参考下面附带的演讲稿
- 架构图/流程图用简洁方框+箭头，颜色与整体风格一致
- 代码片段（如有）用等宽字体 + 深色代码块背景

### 演讲稿（放入每页 Speaker Notes）

P01: 各位好，今天分享 DreamMaker 平台的技术架构。DreamMaker 是内部 AI 美术平台，统一封装文生图、图生视频、3D 生成等 AI 模型。我会从部署拓扑开始，依次讲前端、本地 Agent 服务、云端调度三个模块。

P02: 系统运行在三个物理位置：用户桌面的 Electron 客户端、同样在本地的 Python Agent 服务（打包在一起自动拉起）、以及云端的 Go 微服务集群。通信方式不同：前端和 Agent 之间 SSE 长连接做流式推送；Agent 到云端分两条链路——调 AIGW 做 LLM 推理是全链路流式的，调 Scheduler 做生成任务是 REST 轮询。

P03: 前端是 Electron 应用，左边画布区域基于 React Flow，用户创建各种生成节点并连线表示引用关系。右边 Agent 聊天面板支持自然语言驱动操作。用户有两条路径：手动操作画布或通过 Agent 对话。

P04: 画布数据不在本地，存在云端 dm-tapnow-backend。本地 Agent 是纯计算节点，唯一持久化数据是 SQLite 里的对话 checkpoint。通信模型是 POST /chat 发起 SSE 长连接，审批走 POST /resume。

P05: Agent 核心是 ReAct 循环：推理→工具调用→观察→继续。底层是 LangGraph StateGraph 状态机。LLM 通过 ChatAIGW 流式调用 AIGW 网关，状态用 AsyncSqliteSaver 持久化到本地 SQLite。

P06: 服务是 asyncio 单线程事件循环，所有请求都是协程。关键原则：任何同步阻塞会冻住整个服务。所有 I/O 用异步版本——httpx、asyncio.sleep、async LLM 方法。协程在 await 时切换，宏观上像并发。

P07: 画布数据需要在深层调用链使用，但中间隔着 LangGraph 框架改不了签名。用 ContextVar 解决：入口写入，深层直接读取。价值是免传参和请求内缓存——入口拉一次画布数据，同一请求内复用。

P08: Agent 回复用 Message/Block 双层结构：Message 是容器，Block 是内容片段，每种 type 独立渲染。SSE 事件对应 Block 生命周期。DeepAgentStreamAdapter 把 LangGraph 内部事件翻译成前端协议，实现框架解耦。

P09: 上下文注入三层：画布概览按节点规模 5 级渐进渲染后注入到每次 LLM 调用前、按需工具查询节点详情、上下文溢出时 ChatAIGW 转 ContextOverflowError 由 DeepAgent SummarizationMiddleware 自动压缩历史并重试，被动触发，用户无感知。

P10: 审批流程四步：LangGraph 抛 GraphInterrupt 异常中断并持久化 state → 推 interaction.request 事件 → asyncio.Event 等待 300 秒 → 用户决策后 Command resume 恢复状态机。要求 interrupt 前代码幂等。

P11: Agent 通过 DmProvider POST 提交生成任务拿 task_id，然后固定间隔轮询——图像 5s、3D 10s、视频 30s。结果通过 block.updated 推给前端。轮询对象是 Scheduler，不是 AIGW。

P12: 云端四个组件：app-gateway 做入口校验、worker-scheduler 做调度、worker-sidecar 执行、AIGW 对接供应商。完整链路：提交 → Redis 入队 + MongoDB 记录 → 消费分配 → 执行 → Report 回写 + Kafka → 轮询返回。

P13: Redis ZSet 优先级队列，加权轮询防饥饿——每个优先级按 weight 分配配额，耗尽重置。消费三层：加权选队列→尝试→降序兜底。无锁抢占用 ZREM 原子性——谁删成功谁拥有，比分布式锁简单高效。

P14: ConcurrentManager 用内存原子计数器（CAS 循环）限制用户并发。etcd Watch 驱动：PUT +1、DELETE -1。多 Pod 各自 Watch 同一前缀保持最终一致。

P15: Worker 生命周期：启动注册到 etcd → 30s 心跳 → 宕机后 Lease 过期自动删 key → Watch 触发三步清理。两套 Lease：scheduler 侧 7200s（任务），api-kube 侧 3600s（Pod）。

P16: GPU Worker 不能用 HPA（满载时 CPU 闲会误判），自定义 Autoscaler 基于队列积压深度。扩容唤醒 terminated Pod，需要有可复用 Pod 才会扩。五个防护：冷却机制、优雅下线、最小副本数、安全检查、SetNX 互斥锁。

P17: 容错三层：executeWithRetry 做 3 次尝试（含首次）指数退避 1s→2s，最后一次失败不再 sleep；queue-retry 针对 429 限流做长退避最长 12 小时；Fallback chain 按模型粒度线性切换供应商，无状态 per-request。可优化方向是熔断器。

P18: 回顾全链路——用户操作 → Electron → Agent → Scheduler → Worker → 供应商 → 结果回传。三个模块亮点：Agent 的全链路流式+HITL 审批、Scheduler 的加权调度+无锁抢占、Worker 的三层容错+GPU 自定义扩缩容。谢谢大家。
