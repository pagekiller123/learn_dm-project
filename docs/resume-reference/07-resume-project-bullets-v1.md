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

### Bullet 1 · 供应商 429 限流排队重试机制

针对外部 AI 供应商（GPT-Image / Gemini）并发槽满返回 429 时直接报错的问题，实现排队重试机制：收到 429 后进入指数退避重试循环（initial 3s, max 60s, multiplier 2.0, jitter ±20%），最大等待 12h；超时后返回 retryable error 触发 fallback 切换备用供应商通道。零配置默认启用，通过白名单控制生效范围，避免对时效敏感任务造成阻塞。

### Bullet 2 · 图片超限自动压缩兜底

解决 GPT-Image-2 等模型对上传图片有 4MB 字节限制，用户需自行压缩才能重试的体验问题。在 app-gateway 的 validate 阶段插入图片压缩中间件：字节超限时自动尝试压缩，压缩后仍超限再返回错误；支持分辨率区间归一化（长边缩小 + 短边放大）、数组字段逐元素处理和 Alpha 通道保留策略。该能力通过 MongoDB 中的 App 配置驱动，新模型接入只需在 DB 添加压缩规则，无需修改代码。

### Bullet 3 · 新 AI 能力全链路接入（音频 / 3D）

独立完成 Seed-Audio 语音生成和 Meshy 3D 模型生成的全链路接入：从 App 注册（MongoDB 配置 + 小程序商城参数定义）→ app-gateway 参数校验与路由 → Worker 任务执行与轮询 → 产物下载代理与格式转换 → 前端记录查询。处理了 Meshy 外部 URL 下载超时（添加代理 + 超时兜底从 60min 调整为 90min）、3D 模型拓扑重建参数映射等供应商适配问题。

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
| Scheduler-2 压缩 | 压缩算法？会不会影响画质？ | WebP/JPEG 质量递减 + 像素限制不动 |
| Scheduler-3 接入 | 全链路多长？踩了什么坑？ | 6 步 + Meshy URL 超时 + 3D 拓扑参数 |
| Scheduler-4 限流 | 滑动窗口 vs 令牌桶？为什么选这个？ | 实现简单 + 精度够用 + Redis 原子操作 |
