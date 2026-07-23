# 课程大纲

> 学习路径：架构总览 → 关键模块 → MR 亮点挖掘 → 简历整合
>
> **编号规则**：Monet 系列用 `M` 前缀，Scheduler 系列用 `S` 前缀，两条线独立推进。

## Monet 系列（M 前缀）

### M001 — Monet 整体架构总览 ✅
- **文件**：`lessons/M001-monet-architecture-overview.html`
- **目标**：能在白板画出 Monet 架构图，讲清 DeepAgent 框架下的模块协作、跟客户端画布的交互模式
- **产出**：架构图（Mermaid）+ 术语表 + 3 个面试常问点

### M002 — Monet Agent 核心：工厂、Runner 与 Agent Loop ✅
- **文件**：`lessons/M002-monet-agent-core-factory-runner-loop.html`
- **目标**：讲清一次 /chat 请求的完整链路、Agent Loop 在哪运行、SSE 适配器如何翻译事件
- **产出**：数据流时序图 + 4 文件职责表 + 3 道 Quiz

### M003 — Monet Tool Use 系统 ✅
- **文件**：`lessons/M003-monet-tool-use-system.html`
- **目标**：讲清 7 个画布工具的内部实现、Agent 如何组合工具完成任务
- **产出**：10 工具全景表 + 工具间组合模式 + 3 道 Quiz

### M004 — Monet 画布感知 ✅
- **文件**：`lessons/M004-canvas-awareness.html`
- **模块**：`canvas_context.py` + `canvas_overview.py` + `aigw.py` + `canvas_query.py` + `state_reader.py`
- **目标**：讲清 Agent 怎么"看见"画布——三层感知机制
- **产出**：三层感知数据流时序图 + 分级渲染策略表 + 7 个面试防守点 + contextvar 设计权衡
- **主线故事**：Agent 怎么"看见"画布？
  1. **每轮对话入口**：`_prime_canvas_context` 拉取概览写入 contextvar
  2. **每次 LLM 调用**：`ChatAIGW._inject_canvas_overview` 拦截注入最新 HumanMessage（深拷贝，不污染 checkpoint）
  3. **按需深挖**：`canvas_node_detail` / `canvas_subgraph` 复用 contextvar 缓存或现拉

### M005 — Monet 生成链路 ✅
- **文件**：`lessons/M005-generation-pipeline.html`
- **模块**：`agent_generation.py` + `generation_runner.py` + `service.py` + `registry.py` + 三种 backend 实现
- **目标**：讲清 Agent 调用 AI 生成内容的完整链路（从工具调用到画布节点创建）
- **产出**：四层架构时序图 + 模型注册表设计 + submit → poll → fetch 三阶段协议 + 重试策略
- **主线故事**：Agent 怎么调用 AI 生成图片/视频/3D？
  1. **编排层**：`AgentGenerationService` 负责业务编排（引用解析、参数校验、节点创建）
  2. **执行层**：`GenerationRunner` 提供 submit → poll → fetch → mirror 原子操作
  3. **服务层**：`GenerationService` 负责模型路由、参数转换、后端分发
  4. **传输层**：`GenerationBackend` 协议统一三种后端（DM API / AIGW / Ailab）

---

## Scheduler 系列（S 前缀）

### S001 — Scheduler 整体架构总览 ✅
- **文件**：`lessons/S001-scheduler-architecture-overview.html`
- **目标**：能讲清五层架构、三大核心组件（app-gateway / worker-scheduler / worker-sidecar）职责边界
- **产出**：架构图 + 关键数据流（任务从入口到 Worker）+ 3 个面试常问点

### S002 — Scheduler 任务调度全链路（待定）
- **模块**：`app/app-gateway` → Redis queue → `app/worker-scheduler` → `app/worker-sidecar`
- **目标**：讲清一个任务从提交到执行完的完整流程
- **候选亮点**：分布式任务调度（可写入简历）

### S003 — Scheduler GPU/Worker 调度 + 高可用（待定）
- **模块**：`app/worker-scheduler` + etcd worker registry + Leader 选举
- **目标**：讲清资源分配和高可用机制
- **候选亮点**：Leader 选举 + GPU 调度（可写入简历）

---

## 跨项目系列

### X001 — 方法论：如何评估一个 MR 的含金量（待定）
- **教内容**：什么样的 MR 值得"接管"、什么样的太套路（对应"简历三"的评论洞察）
- **产出**：MR 评估 checklist

### X002+ — 挑 MR 深挖（每节 1 个 MR）
- **候选清单**（待跟用户确定）：
  - Monet 侧候选：
    - 流式响应改造 / SSE 协议演进
    - Prompt Caching 引入
    - 生成后处理链路优化
    - 新工具（新 tool）从 0 到 1
  - Scheduler 侧候选：
    - APP 商城 + 参数映射
    - 一次新供应商接入（gateway 侧）
    - Worker 类型扩展
    - 任务队列 / 状态回写优化

### X-FINAL — 把亮点写进简历
- **产出**：两份简历的项目描述初稿（对应 03-resume-design.md 中的模板）

---

## 学习节奏建议

- 每天 1 节课，约 30-45 分钟
- 每节课学完当天/次日做一次回顾（间隔重复）
- Monet 和 Scheduler 可以按自己节奏交替，不用严格按顺序
- 秋招关键窗口内至少完成 6 节以上
