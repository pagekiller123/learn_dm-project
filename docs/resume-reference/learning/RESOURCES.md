# DM 项目学习资源

## Knowledge

### 项目内文档（一手资料，最高优先级）

- **[dm-monet-agent CLAUDE.md](../../../current_project/dm-monet-agent/CLAUDE.md)**
  Monet Agent 项目规则和背景。Use for: 理解 Monet 是什么、跟画布/客户端怎么协作、开发规范。

- **[dm-monet-agent AGENTS.md](../../../current_project/dm-monet-agent/AGENTS.md)**
  Monet 的 Agent 定义和职责。Use for: 学习 DeepAgent 框架下 Agent 的组织方式。

- **[dm-monet-agent openspec/](../../../current_project/dm-monet-agent/openspec/)**
  Monet 的 spec 文档（capability 设计）。Use for: 学习每个能力模块的设计意图（比读代码更高效）。

- **[dreammaker_scheduler AGENTS.md](../../../current_project/dreammaker_scheduler/AGENTS.md)**
  Scheduler 服务清单 + dmfr 用法。Use for: 学 Scheduler 五层架构和三大组件（app-gateway / worker-scheduler / worker-sidecar）。

- **[dreammaker_scheduler openspec/](../../../current_project/dreammaker_scheduler/openspec/)**
  Scheduler capability spec。Use for: 学各种 Worker 的设计和任务调度机制。

- **[dreammaker_gateway CLAUDE.md](../../../current_project/dreammaker_gateway/CLAUDE.md)**
  Gateway 包依赖 + ecode + 响应协议。Use for: 学供应商接入模式和 API 网关设计。

### 项目参考文档

- **[docs/guide-new-ai-capability.md](../../guide-new-ai-capability.md)**
  基于 Scheduler 接入新 AI 能力的完整链路。Use for: 学"一个新能力从 0 到 1 需要改哪些代码"。

- **[docs/guide-mongo-app-config.md](../../guide-mongo-app-config.md)**
  小程序商城"配置即界面"机制、dreamworker_apps 文档结构。Use for: 学参数化配置和前端渲染逻辑。

- **[docs/guide-dreammaker-docs.md](../../guide-dreammaker-docs.md)**
  文档站项目 + doc-gen skill 流程。Use for: 学 API 文档如何组织。

### POPO 团队空间 · Agent 官方技术方案（⭐ 顶层设计文档）

**目录 URL**: https://docs.popo.netease.com/team/pc/dreammaker/pageDetail/996914052a994cdd9d673816bd32f026
**目录名**: Agent（团队空间 dreammaker · teamSpaceId `332e46c02522490f9856818cc0668462` · folderId `996914052a994cdd9d673816bd32f026`）

读取方式：`popo-cli popo doc_get_doc_detail docId=<docId> teamSpaceId=332e46c02522490f9856818cc0668462`

| 文档 | 类型 | docId | 用途 |
|------|------|-------|------|
| **DreamMaker Agent 技术方案** ⭐⭐⭐ | popo doc | `793c642c8ae94c94baa5f8e99ecacbe7` | 顶层技术方案：五层客户端架构、Harness Artist 品牌概念、CLI vs MCP 权衡、Skills 生态。**面试讲整体架构的 canonical 出处**。作者：烂柯（李若鹏，gzliruopeng） |
| **AI Agent 框架深度选型对比报告** | md | `af805de3582d4fbda67ad60b6dbf1a36` | 讲清楚为什么选 DeepAgent。面试被问"为什么用这个框架"时的防守金句来源 |
| **Dm agent backend 技术方案** | md | `041ce07f5368408988b2300343af8dc7` | Agent 后端方案，可能包含 API 契约与生成任务链路细节 |
| **Monet x wuzu 语义画布统一技术方案** | md | `b90c4f1ed7454ed8baef152a4af546d8` | 画布集成方案，跟 Canvas Awareness 相关 |
| **Monet x wuzu 画布合并补充 AI Review Rules** | md | `1e06e852d80f4b179e041462710921b1` | Review 规则 |
| **Monet x wuzu 画布合并补充 AI Coding Rules** | md | `bbd9e3ec6e0f415586512e1e0e441a0d` | Coding 规则 |
| **agent 审批/权限系统设计** | md | `e6e7eca5d78f4579b9ea6dde745fe0e8` | HITL 审批 + 权限系统。对应 <code>INTERRUPT_ON_TOOLS</code> 的设计文档 |
| **proxy dm 文件同步方案** | md | `402e567daed5486588c79acbef18c0a9` | 文件同步方案 |
| **Harness Artist-DreamMaker × WuzuCat 合作** | popo doc | `499f47e2b998493c87674eb2e59da72d` | 品牌合作文档 |

⚠️ **重要**：这些文档是团队多人共识的**设计意图**，代码实现可能滞后或过渡态。参考策略见 [learning-records/0004-tech-spec-vs-actual-code-strategy.md](./learning-records/0004-tech-spec-vs-actual-code-strategy.md)：**宏观架构以文档为准，具体实现以代码为准**。

### GitLab 仓库（关键的"接管工作"来源）

- **[git-sa.nie.netease.com/tmax/dreammaker-scheduler](https://git-sa.nie.netease.com/tmax/dreammaker-scheduler)**
  Scheduler 仓库 MR 历史。Use for: 挑有含金量的 MR 作为"我做的工作"。

- **[git-sa.nie.netease.com/tmax/dreammaker-gateway](https://git-sa.nie.netease.com/tmax/dreammaker-gateway)**
  Gateway 仓库 MR 历史。Use for: 供应商接入相关 MR。

- **[git-sa.nie.netease.com/tmax/dm-monet-agent](https://git-sa.nie.netease.com/tmax/dm-monet-agent)**
  Monet 仓库 MR 历史。Use for: Agent 侧核心功能 MR。

### 外部理论支撑（面试深挖时用）

- **[DeepAgents 论文/文档](https://github.com/langchain-ai/deepagents)**
  Monet 用的框架。Use for: 讲 Monet 时能引用理论出处。

- **[Hertz 官方文档](https://www.cloudwego.io/zh/docs/hertz/)**
  字节 Go HTTP 框架，Scheduler 用。Use for: 深挖 Go 框架时用。

- **[Fiber 官方文档](https://docs.gofiber.io/)**
  另一个 Go Web 框架，Scheduler 也用。Use for: 对比 Hertz 时用。

- **[MCP 协议规范](https://spec.modelcontextprotocol.io/)**
  Model Context Protocol。Use for: 讨论 Tool Use 的现代协议标准。

## Wisdom (Communities)

- **DM 团队 GitLab MR 评论区**
  正职同事的 code review 意见。Use for: 学他们关注什么、代码质量标准。

- **DM 团队 POPO 群 / KM 知识库**
  team space ID `332e46c02522490f9856818cc0668462`。Use for: 遇到具体问题时问团队现成答案。

- **导师 / mentor**
  你的直接对接人。Use for: 关于哪些 MR 值得吃透、哪些细节不用管的判断。

## Gaps

- **量化数据无来源**：日均任务量、QPS、延迟等数字目前没有权威来源。需要问导师或从监控平台拿。
- **Monet 参与度浅**：需要通过 MR 补充"深度"，但不知道哪些 MR 值得深挖，需要导师推荐或自行 diff 优质提交。
- **架构图缺失**：项目文档里没有现成的系统架构图，需要自己边读边画。
