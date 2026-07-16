# POPO Agent 目录 · 9 篇文档整合报告

> 生成日期：2026-07-16
> 数据来源：POPO 团队空间 dreammaker（teamSpaceId `332e46c02522490f9856818cc0668462`）→ Agent 目录（folderId `996914052a994cdd9d673816bd32f026`）
> 阅读方式：`popo-cli popo doc_get_doc_detail docId=<docId> teamSpaceId=332e46c02522490f9856818cc0668462`
> 完整 docId 索引见 [../learning/RESOURCES.md](../learning/RESOURCES.md)
> 双层记忆策略见 [../learning/learning-records/0004-tech-spec-vs-actual-code-strategy.md](../learning/learning-records/0004-tech-spec-vs-actual-code-strategy.md)

---

## 一、9 篇文档的关系图

```
DreamMaker Agent 技术方案（顶层愿景，2026-04）  ← 793c642c8ae94c94baa5f8e99ecacbe7
 │
 ├── 执行引擎选型
 │    → AI Agent 框架深度选型对比报告  ← af805de3582d4fbda67ad60b6dbf1a36
 │      结论：LangChain DeepAgent（5 大需求唯一全内置）
 │
 ├── 后端设计
 │    → Dm agent backend 技术方案  ← 041ce07f5368408988b2300343af8dc7
 │      七模块 + SSE 协议 + Message/Block 两层内容
 │
 ├── 画布合并
 │    ├── Monet x wuzu 语义画布统一技术方案  ← b90c4f1ed7454ed8baef152a4af546d8
 │    │   三层分离（体验 / 语义 / 执行）+ 五分类节点
 │    ├── AI Coding Rules（写代码时的约束）  ← bbd9e3ec6e0f415586512e1e0e441a0d
 │    └── AI Review Rules（review 时的 checklist）  ← 1e06e852d80f4b179e041462710921b1
 │
 ├── 客户端能力扩展
 │    ├── agent 审批/权限系统设计 ⭐ 简历最强  ← e6e7eca5d78f4579b9ea6dde745fe0e8
 │    │   Human-in-the-Loop 通用交互通道
 │    └── proxy dm 文件同步方案  ← 402e567daed5486588c79acbef18c0a9
 │        Lease + Fencing Token 分布式一致性
 │
 └── 产品定位
      └── Harness Artist × WuzuCat 合作  ← 499f47e2b998493c87674eb2e59da72d
        品牌级概念，Monet 是"Harness Artist 画布前端"
```

---

## 二、7 个关键事实澄清（补充/纠正之前的理解）

| # | 事实 | 影响 |
|---|------|------|
| 1 | **"TapNow" 是 Monet 的旧代号** | 2026-04-14 前的文档都叫 `dm-tapnow-agent`。前端仓库 `dm-tapnow` 就是从这来 |
| 2 | **框架最终选：LangChain DeepAgent**（不是 Claude SDK / Opencode） | Lesson 0001 图 A "方案候选" 备注可以更明确 |
| 3 | **选它的关键原因：AIGW 是非标准协议** | Claude SDK 的 ModelProvider 深度耦合 Anthropic 格式，适配 AIGW 就是"模拟一个 Anthropic API"，成本高。LangChain 的 `BaseChatModel` 是业界最成熟的 LLM 适配抽象 |
| 4 | **`INTERRUPT_ON_TOOLS` 是 LangGraph `interrupt_on` 机制** | 代码里的这个常量就是审批设计文档里定义的实现路径 |
| 5 | **审批不是"审批模块"，是"交互通道 Interaction Channel"** | 通用的"Agent 暂停 → 结构化请求 → 等响应 → 恢复"基础设施。Confirmation / Choice 是它的两种消费者 |
| 6 | **Monet 有 SSE 适配器抽象层（模板方法模式）** | `AgentStreamAdapter` 抽象 + `DeepAgentStreamAdapter` 具体，换 Agent 框架前端零改动 |
| 7 | **画布已从"孤立节点列表"→"可追踪执行图"** | Agent 对话前生成画布概览、`outputs[]` 承接产物状态和参数快照 |

---

## 三、7 大简历亮点池（按强度排序）

### ⭐⭐⭐⭐⭐ 必写：Agent 本地执行 + HITL 交互通道

**背景**：Monet 打包在客户端上，Agent 需要能跑 shell、读写用户本地文件，但敏感操作必须审批。

**设计要点**：
- 基于 **LangGraph `interrupt_on`** 机制，Agent 调用敏感工具 → graph 暂停到 checkpointer → 权限中间层裁决
- 三级决策：`ALLOW` / `NEEDS_APPROVAL`（发 SSE `interaction.request` 给前端） / `DENY`
- 抽象成**通用"交互通道"** 而非专用审批模块——Confirmation / Choice 是它的两种消费者
- 分层粒度：工具级 / 路径级（`FilesystemPermission`） / 命令分级 / 用户授权持久化

**代码锚点**：
- `src/monet/agent/factory.py` — `INTERRUPT_ON_TOOLS = {"execute": True, "write_file": True, "edit_file": True}`
- `src/monet/api/routes.py` — `POST /chat/{session_id}/resume`（`Command(resume=...)` 恢复机制）

**简历一句话**：
> 基于 LangGraph interrupt 机制设计并落地 Agent 本地执行的 Human-in-the-Loop 交互通道，抽象出 Confirmation / Choice 通用协议与三级权限决策（Allow / Needs-Approval / Deny），支撑 shell 与文件工具的安全审批。

**Keyword**：HITL, LangGraph checkpointer, Interrupt/Resume, 权限中间层, 交互通道抽象

**面试防守问答**：
- Q: 为什么不做成"审批模块"？
  A: 因为审批只是"Agent 暂停等用户响应"这个模式的一种。未来让用户从 A/B/C 里选方案（Choice）复用同一机制。抽象成通用通道比堆专用模块更长期收益。
- Q: `interrupt_on` 的粒度？
  A: LangGraph 的 `interrupt_on` 是**工具级全量**的（一个 tool 要么全触发要么全不触发），无法条件性判断。所以我们在中间层做了二次决策：先触发 interrupt，再由权限引擎裁决 Allow/Needs-Approval/Deny，前两者自动 resume，只有第二种真正推给前端。

---

### ⭐⭐⭐⭐⭐ 必写：自定义 LangChain BaseChatModel 适配 AIGW

**背景**：AIGW（AI Gateway）是网易内部的非标准 LLM 协议，需要让 DeepAgent 无感知调用。

**设计要点**：
- 自研 `BaseChatModel` 子类，屏蔽上层框架 → 底层实际走内部 AIGW
- 这是团队选 LangChain 生态而不是 Claude SDK 的关键理由（后者 ModelProvider 深度耦合 Anthropic 格式）

**代码锚点**：
- 相关模块：`src/monet/services/`（模型 provider 实现，需查具体文件名）
- `src/monet/generation/dm_api_backend.py`（DM API 层的 HTTP 封装）

**简历一句话**：
> 实现自定义 LangChain BaseChatModel Provider，屏蔽内部 AIGW 网关的非标准协议，让 DeepAgent / LangGraph 无感知复用；相比 Claude Agent SDK 的 ModelProvider 大幅降低适配成本。

**Keyword**：LangChain BaseChatModel, 自定义 LLM Provider, 协议适配, AIGW

**面试防守问答**：
- Q: 为什么不用 Claude SDK？
  A: Claude SDK 的 ModelProvider 深度耦合 Anthropic messages/tool_use 格式，AIGW 是非标准协议，适配 Claude SDK 等价于"模拟一个 Anthropic API"，工程成本高。LangChain 的 `BaseChatModel` 是业界最成熟的 LLM 适配抽象，我们复用它成本最低。
- Q: LangChain 的抽象层数深，调试怎么办？
  A: 是问题，我们承认这个代价（LangChain → LangGraph → DeepAgent 三层）。缓解方式：核心链路加 trace 埋点、单元测试覆盖 provider 层。团队备选：如果 DeepAgent 灵活性成为瓶颈，可平滑降级到 LangGraph（同一生态、API 兼容，1-2 周工程量）。

---

### ⭐⭐⭐⭐⭐ 必写：SSE 流式协议 + Message/Block 两层内容模型

**背景**：Agent 需要把 LangGraph 内部事件流以稳定协议推给前端画布。

**设计要点**：
- **Message → Block 两层内容协议**：Block type 覆盖 `text / thinking / tool_use / tool_result / image / file`，`text/thinking` 支持 delta 流式
- **四层事件**：控制层（heartbeat / done / error）、消息层、内容层、业务层
- **适配器架构（模板方法模式）**：`AgentStreamAdapter` 抽象 + `DeepAgentStreamAdapter` 具体，把 `on_chat_model_stream / on_tool_start / on_tool_end` 翻译为 `block.created / block.delta / block.updated`
- **换 Agent 框架前端零改动**

**代码锚点**：
- `src/monet/sse/` — SSE 层实现
- `src/monet/api/routes.py` — SSE 端点

**简历一句话**：
> 设计 Agent SSE 流式协议与 Message/Block 两层内容模型，通过 AgentStreamAdapter 抽象基类将 LangGraph 事件翻译为稳定的 block 事件序列，实现 Agent 框架与前端渲染的完全解耦。

**Keyword**：SSE, 模板方法模式, 适配器模式, Agent 框架解耦

**面试防守问答**：
- Q: 为什么不直接把 LangGraph 事件透传给前端？
  A: 因为 LangGraph 事件是框架内部实现细节，如果透传，未来换框架前端全部要改。Block 协议是"稳定的对外契约"，Adapter 层负责翻译，换框架只需新写一个 Adapter 子类。
- Q: Block delta 怎么保证顺序？
  A: 用递增的 block_id + version，同一 block 的 delta 顺序追加，前端按顺序拼接。

---

### ⭐⭐⭐⭐ 强推：LLM 推理与生成任务的双 Backend 分层架构

**背景**：Monet 里的"生成"分两类——**LLM 对话推理**（Agent 每步思考都调）和**耗时任务**（图/视频/3D 生成）。两者延迟要求和资源特性完全不同，如果都走同一个后端会互相拖累。

**设计要点**：
- **LLM 推理直连 AIGW**：通过自研 `ChatAIGW`（`langchain_openai.ChatOpenAI` 子类）直接打 <code>https://aigw.netease.com</code>，完全绕开 Scheduler
  - 低延迟：Agent 一次对话可能调 LLM 十几次，累积 RTT 敏感
  - 高频调用、纯文本、无需异步
  - 复用 OpenAI 兼容协议（Chat Completions API）+ AIGW header 鉴权
- **重任务走 Scheduler**：通过 `DmApiBackend` 走 <code>https://api-all.dreammaker.netease.com</code>
  - 异步任务队列：submit/poll/fetch_result 三段式
  - GPU 资源池集中管理
  - 支撑计费、审计、多租户
- **同类内也有细分**：`AigwBackend`（纯文本生成，走 AIGW 同步返回）vs `DmApiBackend`（图/视频/3D，走 Scheduler 异步）

**关键洞察**：这是**按 workload 特性选择合适后端**的架构模式——不是"能不能走同一个后端"，而是**"该不该走"**。低延迟高频调用 vs 高延迟异步任务，两条路径完全独立、互不干扰。

**代码锚点**：
- `src/monet/config.py:25` — `aigw_base_url = "https://aigw.netease.com"`
- `src/monet/config.py:40` — `dm_api_base_url = "https://api-all.dreammaker.netease.com"`
- `src/monet/model/aigw.py` — `ChatAIGW(ChatOpenAI)`：LLM 推理直连
- `src/monet/generation/aigw_backend.py` — `AigwBackend`：纯文本生成走 AIGW
- `src/monet/generation/dm_api_backend.py` — `DmApiBackend`：图/视频/3D 走 Scheduler

**简历一句话**：
> 设计 Monet Agent 的双 Backend 分层架构：LLM 推理与纯文本生成通过自研 ChatAIGW（LangChain BaseChatModel 子类）直连 AIGW 网关（低延迟、高频调用），图/视频/3D 等耗时重任务走 DreamMaker Scheduler 异步队列（GPU 资源池集中调度）。让 Agent 内部 LLM 调用不受 Scheduler 排队影响，同时保证 GPU 密集型任务有集中管理。

**Keyword**：Workload-based Routing, Backend Sharding, 分层调用, 延迟敏感 vs 吞吐敏感

**面试防守问答**：
- Q: Monet Agent 可以直接调用 AIGW 吗？还是必须经过 Scheduler？
  A: **可以直连，架构上是两条完全独立的路径**。LLM 推理（Agent 每步思考）通过 ChatAIGW 直接打 AIGW；只有图/视频/3D 这种 GPU 密集型任务才走 Scheduler 的异步队列。config.py 里 aigw_base_url 和 dm_api_base_url 是两个独立的 upstream。
- Q: 为什么不统一走 Scheduler？
  A: 延迟。Agent 一次对话可能调 LLM 十几次做推理，如果每次都走 Scheduler 会累积 RTT 到不能忍——Scheduler 是异步任务队列，本来就不是为低延迟高频调用设计的。反过来图/视频/3D 生成本来就 10 秒起、1 分钟起，Scheduler 的排队和 GPU 调度收益远大于 RTT 代价。
- Q: `ChatAIGW` 为什么继承 `ChatOpenAI` 而不是 `BaseChatModel`？
  A: AIGW 网关本身兼容 OpenAI Chat Completions API 协议（这是网易内部约定，让内部服务都能复用 OpenAI 生态），所以复用 `ChatOpenAI` 比从 `BaseChatModel` 从零实现省事得多。ChatAIGW 只需处理三处适配：AIGW header 鉴权（无需 api_key）、强制走 Chat Completions API（不走 Responses API，兼容 Claude/Gemini 等非 OpenAI 模型）、image_url 转 base64。

---

### ⭐⭐⭐⭐ 强推：Monet × WuzuBoard 语义画布合并

**背景**：Monet（资源节点）和 WuzuCat（创作流程画布）两个画布体系合并，涉及 60+ 类节点收敛。

**设计要点**：
- **画布三层分离**：创作体验 / 业务语义 / 执行——共同层只保业务语义 + 承接执行
- **五分类节点** + Pareto 分析（5 类节点覆盖 90% 使用量）
- **共同协议 `common.canvas`**：`{schemaVersion, canvas{id, name, version, nodes[], edges[], groups[], metadata}}`
- **`outputs[]` 追踪产物**：主产物、历史产物、状态（running/done/failed）、来源、参数快照

**代码锚点**：
- 需查 `openspec/specs/` 或 `openspec/changes/` 里画布相关 spec
- `src/monet/services/canvas_*.py`（画布相关服务）

**简历一句话**：
> 参与设计 Monet × WuzuBoard 画布统一语义协议，将双方 60+ 类节点通过三层分离（体验/语义/执行）收敛到统一语义内核；基于 Pareto 分析定位 5 类覆盖 90% 使用量的核心节点，制定两月主路径闭环路线。

**Keyword**：语义协议设计, 三层分离, Pareto 分析, 跨仓库协议治理

---

### ⭐⭐⭐⭐ 强推：Agent Canvas Awareness

**背景**：Agent 需要在对话前理解画布上下文。

**设计要点**：
- 画布详情不再是孤立节点列表，会读取 `nodes + edges + groups`
- Agent 对话前**自动生成画布概览**
- `outputs[]` 承接产物状态和参数快照，Agent 能理解"这个节点曾经产出什么、现在采用哪个结果"

**代码锚点**：
- `src/monet/services/canvas_context.py`、`canvas_overview.py`（画布上下文构建）
- `src/monet/tools/canvas_query.py`（Agent 可调用的画布查询工具）

**简历一句话**：
> 落地 Monet Agent 画布整体感知能力：从"孤立节点列表"演进为"可追踪执行图"（含分组、连线、产物状态、参数快照），支撑 Agent 对话前的画布概览生成。

**Keyword**：Context Engineering, Canvas Awareness, Agent 上下文构建

---

### ⭐⭐⭐⭐ 备选：Agent-Backend 文件同步一致性

**背景**：办公网 FTP ↔ DM 服务端存储两套存储物理隔离，AI 生成服务只能读 DM，必须最终一致。之前有过多写入者竞态事故（文件已上传但记录被回滚成 failed）。

**设计要点**：
- **Lease + Fencing Token**（租约 = 活性，令牌 = 归属）
- Backend **原子裁决**替代"读取→内存校验→写回"
- 心跳续租、账本只进不退（done 不可逆）
- **Agent 侧从并发搬运者退回纯消费者** → 消除竞态

**简历一句话**：
> 重构 Agent-Backend-Proxy 三方文件同步子系统，引入 Lease + Fencing Token 状态模型与 Backend 原子裁决，消除多写入者竞态与"已成功记录被回滚"事故；Agent 侧从并发搬运者退回纯消费者，通过统一的"先查后触发再轮询"逻辑自愈。

**Keyword**：Lease-based lock, Fencing Token, Optimistic Concurrency Control, Best-effort Async Replication

**⚠️ 注意**：这个话题**跟 AI Agent 岗直接相关度弱**，是分布式后端能力。建议放在"辅助亮点"位置，或者算法岗简历里不放。**参与深度未确认，需自查**。

---

### ⭐⭐⭐ 氛围加分：AI-native 团队协作

**背景**：Monet × WuzuBoard 合并期间，团队制定了 AI Coding Rules / AI Review Rules 来约束 Claude Code / Codex 生成代码的方向。

**核心概念**：
- **Spec Gate**（无 Spec 不许实现）
- **节点归类七分法**（resource / generation-capability / postprocess-capability / flow-structure / collection-or-container / product-view-state / unsupported）
- **共同语义画布 vs 产品视图状态分离**
- **conversionReport 记录不可映射内容**
- **AI Review 状态写回 Spec**（PASS / PASS_WITH_NOTES / FAIL 三种结论，通过 `/code review` 斜杠命令触发）

**简历里怎么用**：
- 不直接写"我编写了规则"（除非你真的参与了）
- 项目描述里点一句："遵循团队 Spec-driven Development 与 AI Review 流程，所有共同语义改动先输出 Spec 并通过 `/code review` 后再实现"
- 面试口头素材：如果问"你们团队怎么用 AI 编程工具"，展开讲 Spec Gate → Code → Review → 状态回写闭环

**Keyword**：Spec-driven Development, AI-native Engineering, Spec Gate

---

## 四、面试防守金句总集

1. "在 AIGW 适配、流式、上下文压缩、Skills、会话持久化五大需求上，DeepAgent 是唯一全部内置支持的框架，其他框架至少要自建 2-3 项。"

2. "LangChain BaseChatModel 是业界最成熟的自定义 LLM Provider 抽象。"

3. "如果 DeepAgent 灵活性成为瓶颈，可平滑降级到 LangGraph（同一生态、API 兼容），1-2 周工程量换取完全的 Graph 控制权。"

4. "客户端 Agent 相比纯平台服务：响应更快（无 RTT）、用户控制感强、本地文件系统与 DCC 工具集成更自然。"

5. "审批不是审批模块，是交互通道——Confirmation/Choice 是它的两种消费者。"

6. "换 Agent 框架前端零改动——AgentStreamAdapter 抽象层负责翻译。"

7. "Monet 是 DreamMaker Harness Artist 平台的画布前端——美术师定义风格约束和质量标准，Agent 自主执行并自我验证，把 Harness Engineering 范式从软件工程扩展到美术创作。"

8. "Monet 内部两条独立路径：LLM 推理直连 AIGW（低延迟高频），图/视频/3D 走 Scheduler 异步队列（GPU 集中调度）——按 workload 特性选后端。"

9. "Monet 用 Agent 而不是工作流，是因为用户通过自然语言交互、步骤不固定——Agent 的价值在'理解和编排'，不在'精确操控 UI'。工作流适合固定步骤，Agent 适合不确定步骤。"

---

### 防守问答展开：为什么用 Agent 而不是工作流？

- Q: 用户点击"生成图像"这种操作，不能写死成工作流吗？为什么要做成 Agent？
  A: "点击生成一张图"只是最简单的场景。Monet 的入口是对话框，用户用自然语言说"帮我画一个赛博朋克风格的猫，参考画布上已有的那张风格"——这需要 Agent 先调 `canvas_subgraph` 查画布、再优化 prompt、再调 `generate_and_create_node`，链路不固定，取决于用户说了什么和画布当前状态。如果用工作流，每多一种组合就要多写一条分支，组合爆炸。Agent 的 LLM 推理能力天然处理这种不确定性。

---

## 五、需要用户自查/追问导师的问题

- [ ] 文件同步方案（proxy dm）你实际参与到什么程度？（决定是否写到简历）
- [ ] AI Coding Rules / Review Rules 你有没有参与共建？（同上）
- [ ] Monet 的量化数据：日均会话量、任务成功率、SSE 首 token 延迟、支持的工具数量、接入的 AI 供应商数量
- [ ] 自定义 BaseChatModel 具体在哪个文件？（用 Grep 找 `BaseChatModel` 子类）
- [ ] `AgentStreamAdapter` 抽象基类具体在哪个文件？（`src/monet/sse/`）
