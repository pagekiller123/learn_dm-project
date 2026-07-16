# 简历项目描述初稿 — Monet Agent 项目

> 生成日期：2026-07-16
> 状态：**初稿，等量化数据回填**
> 依据：POPO Agent 目录 9 篇文档整合报告（见 [04-monet-full-tech-report.md](04-monet-full-tech-report.md)）
> 简历整体设计：见 [03-resume-design.md](03-resume-design.md)（Monet 排两份简历的第一项目）

---

## 使用说明

- 下面 4 条对应 Monet 项目最强的 4 个亮点，按简历重要度排序
- **XX% / XXms / XX 万**等占位符需要你去问导师或查监控平台后回填
- 面试防守问答见 [04-monet-full-tech-report.md](04-monet-full-tech-report.md) 每个亮点的"面试防守问答"章节
- 双层策略：这里的描述以**官方技术方案**为骨架（稳定），面试若被追问代码细节按当前 `src/monet/` 代码为准（易变）。详见 [learning/learning-records/0004-tech-spec-vs-actual-code-strategy.md](learning/learning-records/0004-tech-spec-vs-actual-code-strategy.md)

---

## 项目基本信息

```
Monet — DreamMaker AI 美术平台客户端 Agent 服务
角色：Agent 开发实习生
时间：202X.XX - 至今
技术栈：Python 3.13, FastAPI, LangChain, LangGraph, DeepAgent, SSE, SQLite, Pytest
项目背景：网易互娱 AI 美术平台 DreamMaker 的客户端 Agent 服务，
         打包在桌面客户端上，通过 SSE 与画布 UI 交互，
         驱动图像/视频/3D 等 AI 创作能力。定位为 Harness Artist
         平台的画布前端——美术师定义约束，Agent 自主执行并自我验证。
```

---

## 亮点 1 · Agent 本地执行 Human-in-the-Loop 交互通道 ⭐⭐⭐⭐⭐

```
1. Agent 本地执行 Human-in-the-Loop 交互通道
   基于 LangGraph interrupt 机制设计并落地 Agent 本地 shell / 文件读写的
   HITL 审批系统，抽象出 Confirmation / Choice 通用交互通道协议与
   Allow / Needs-Approval / Deny 三级决策。SSE 层新增 interaction.request /
   interaction.resolved 事件，前端零改动即可支撑未来"从 A/B/C 方案选一个"
   等新交互类型。日均审批请求 XX 次，用户平均响应延迟 XXs。
```

**量化点待填**：
- 日均审批请求次数
- 用户平均响应延迟
- 拦截的高风险操作数量

---

## 亮点 2 · AIGW 适配层与 SSE 流式协议 ⭐⭐⭐⭐⭐

```
2. AIGW 网关适配与 SSE 流式协议
   实现自定义 LangChain BaseChatModel Provider 屏蔽网易内部 AIGW 网关的
   非标准协议，让 DeepAgent / LangGraph 无感知复用；相比 Claude Agent SDK
   的 ModelProvider 大幅降低适配成本。设计 Message / Block 两层内容模型
   与 AgentStreamAdapter 适配器抽象基类（模板方法模式），将 LangGraph
   事件翻译为稳定的 SSE block 事件流,支持 text / thinking / tool_use /
   tool_result / image / file 六类 Block 及 delta 流式。首 token 延迟 XXms。
```

**量化点待填**：
- 首 token 延迟
- SSE 连接心跳保活配置
- 支持的 LLM Provider 数量

---

## 亮点 3 · Agent Canvas Awareness 画布感知 ⭐⭐⭐⭐

```
3. Agent Canvas Awareness 画布感知能力
   参与 Monet × WuzuBoard 语义画布合并，通过三层分离（创作体验/业务语义/
   执行）设计将双方 60+ 类节点收敛到统一 nodes/edges/groups/outputs 语义
   内核；基于 Pareto 分析定位 5 类覆盖 90% 使用量的核心节点，制定两月主
   路径闭环路线。落地 Agent 画布感知模块：从"孤立节点列表"演进为含分组、
   连线、产物状态、参数快照的可追踪执行图，支撑 Agent 对话前的画布概览
   自动生成,Agent 上下文命中率提升 XX%。
```

**量化点待填**：
- Agent 上下文命中率提升
- 画布节点类型总数
- 主路径节点数

---

## 亮点 4 · Agent 资源可达性与文件同步一致性 ⭐⭐⭐⭐ 【备选】

```
4. Agent-Backend 文件同步一致性设计
   重构 Agent - Backend - Storage Proxy 三方文件同步子系统，引入
   Lease + Fencing Token 状态模型与 Backend 原子裁决，消除多写入者竞态
   与"已成功记录被回滚"事故；Agent 侧从并发搬运者退回纯消费者，通过
   统一"先查后触发再轮询"逻辑自愈。文件同步成功率从 XX% 提升到 XX%,
   同步事故归零。
```

**⚠️ 用前自查**：
- 这一条相关度偏后端/分布式系统，AI Agent 岗可用但不最优
- 参与深度需确认——如果只是 Agent 侧改造实施者而非分布式一致性设计主 owner，包装成"Agent 侧职责重构"更贴合秋招体量
- 算法岗简历建议**不放**，用 Session/Checkpointer 或 Tool Use 系统替代

**量化点待填**：
- 文件同步成功率（改造前 vs 改造后）
- 消除的具体事故案例（有几条）

---

## 备选亮点池（如果 4 条里砍掉一条）

**备选 A · Agent Session 生命周期管理**
> 实现基于 in-flight registry + LangGraph checkpointer 的 Agent 会话生命周期管理：同 session 新请求自动 cancel 旧 task、外部 /cancel 接口、应用关停优雅清理三条取消路径；通过 `await cancelled_task` + identity 校验确保覆盖场景下的状态一致性。

**备选 B · Tool Use 系统 & 画布工具集**
> 设计并实现 Monet Agent 的 Tool Use 系统，落地 XX 个画布相关工具（canvas_query / canvas_node_detail / canvas_create_input_node / crop_node / generate_node 等）；通过 DeepAgent + LangGraph 的 tool_calls 机制驱动，配合 skills 三级路径（builtin/global/workspace）动态加载。

**备选 C · Prompt Caching / 上下文压缩**
> 集成 DeepAgent 的上下文压缩机制并落地本地 SQLite Checkpointer，长对话不溢出、断点恢复、无需云端同步；应用层只维护 session 元信息，历史交给 checkpointer。

**备选 D · 双 Backend 分层架构（LLM 推理直连 AIGW vs 生成任务走 Scheduler）** ⭐⭐⭐⭐
> 设计 Monet Agent 的双 Backend 分层架构：LLM 推理与纯文本生成通过自研 ChatAIGW（LangChain ChatOpenAI 子类）直连 AIGW 网关（低延迟、高频调用），图/视频/3D 等耗时重任务走 DreamMaker Scheduler 异步队列（GPU 资源池集中调度）。让 Agent 内部 LLM 调用不受 Scheduler 排队影响，同时保证 GPU 密集型任务有集中管理。<br>
> **Keyword**：Workload-based Routing, Backend Sharding, 延迟敏感 vs 吞吐敏感<br>
> **代码锚点**：`src/monet/model/aigw.py` (`ChatAIGW`) + `src/monet/generation/aigw_backend.py` (`AigwBackend`) + `src/monet/generation/dm_api_backend.py` (`DmApiBackend`)<br>
> **推荐用途**：AI Agent 岗的**架构思考深度**加分项。如果亮点 2（AIGW 适配）已经写了 BaseChatModel 抽象层，这条可以合并进去（把 workload 分层作为亮点 2 的第二段），或独立成第 5 条。

---

## 完整简历条目组合建议

**开发岗简历（4 条）**：
1. HITL 交互通道 ⭐⭐⭐⭐⭐
2. AIGW 适配 + SSE 协议 ⭐⭐⭐⭐⭐
3. Canvas Awareness ⭐⭐⭐⭐
4. 文件同步一致性 ⭐⭐⭐⭐

**算法岗简历（3-4 条）**：
1. HITL 交互通道 ⭐⭐⭐⭐⭐
2. AIGW 适配 + SSE 协议 ⭐⭐⭐⭐⭐
3. Canvas Awareness ⭐⭐⭐⭐
4. 备选 C（Prompt Caching + Checkpointer）—— 更贴算法岗关心的上下文工程

---

## 迭代记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-07-16 | v0.1 | 初稿，基于 POPO 9 篇文档整合 |
| 2026-07-16 | v0.2 | 加入备选 D 双 Backend 分层架构（对应 04 报告新增亮点） |
