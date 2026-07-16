# POPO Agent 目录 9 篇文档 · 全量精读结论

三个 Explore agent 并行读完了 POPO 团队空间 dreammaker/Agent 目录下的全部 9 篇文档（顶层技术方案 + 框架选型报告 + backend 方案 + 语义画布 + Harness Artist 合作 + 审批设计 + 文件同步 + Coding Rules + Review Rules）。整理出对秋招简历/面试有价值的 7 大亮点池、7 个事实澄清、以及 4 条可直接落到简历的项目描述初稿。

## 关键发现

**7 大简历亮点（按强度排序）**：
- ⭐⭐⭐⭐⭐ Agent 本地执行 + HITL 交互通道（LangGraph interrupt + Confirmation/Choice 通用协议 + 三级决策）
- ⭐⭐⭐⭐⭐ 自定义 LangChain BaseChatModel 适配 AIGW
- ⭐⭐⭐⭐⭐ SSE 流式协议 + Message/Block 两层内容模型 + AgentStreamAdapter 模板方法抽象
- ⭐⭐⭐⭐ Monet × WuzuBoard 语义画布合并（60+ 节点收敛、三层分离、Pareto 分析）
- ⭐⭐⭐⭐ Agent Canvas Awareness（可追踪执行图、outputs 产物追踪）
- ⭐⭐⭐⭐ Agent-Backend 文件同步一致性（Lease + Fencing Token）— 分布式后端题材，AI 岗相关度弱
- ⭐⭐⭐ AI-native 团队协作（Spec-driven + AI Review）— 氛围加分

**7 个新澄清事实**：
1. "TapNow" 是 Monet 的旧代号，dm-tapnow 前端仓库名沿用
2. 框架最终选 LangChain DeepAgent（不是 Claude SDK / Opencode）
3. 选它的关键：AIGW 非标准协议，LangChain BaseChatModel 是业界最成熟的 LLM 适配抽象
4. 代码里的 INTERRUPT_ON_TOOLS 就是 LangGraph interrupt_on 机制
5. 审批被抽象成"交互通道 Interaction Channel"（通用基础设施），Confirmation/Choice 是消费者
6. Monet 有 SSE 适配器抽象层（AgentStreamAdapter → DeepAgentStreamAdapter），换框架前端零改动
7. 画布已从"孤立节点列表"演进为"可追踪执行图"

**面试防守金句**：
- "在 AIGW 适配、流式、上下文压缩、Skills、会话持久化五大需求上，DeepAgent 是唯一全部内置支持的框架，其他框架至少要自建 2-3 项。"
- "LangChain BaseChatModel 是业界最成熟的自定义 LLM Provider 抽象。"
- "如果 DeepAgent 灵活性成为瓶颈，可平滑降级到 LangGraph（同一生态、API 兼容）。"

## Implications

- 4 条简历项目描述初稿已定稿，等学员收集完量化数据（QPS/延迟/成功率等）后即可落笔
- Lesson 0001 图 A 的"方案候选：Claude SDK / Opencode；实际用：DeepAgent"表述可以更精确——**Opencode 是备选之一，Claude SDK 也在评估过；最终 DeepAgent 胜出的关键理由是 AIGW 非标准协议 + LangChain 适配抽象最成熟**
- 后续 Lesson 优先深挖三个最强亮点：Lesson 0003 建议直接做"HITL 交互通道设计"；Lesson 0004 做"BaseChatModel + SSE 适配"；Lesson 0005 做"Canvas Awareness"
- 学员需自查参与深度：文件同步方案和 Coding/Review Rules 如果没有真实参与，只能在"团队协作"角度提，不能吹成"我设计的"

## 参考

- 完整 9 篇文档 docId 索引：`docs/resume-reference/learning/RESOURCES.md`
- 简历项目描述初稿：见本 learning-record 底部对话上下文（学员看到 assistant 的整合报告）
- 双层记忆策略：[[tech-spec-vs-actual-code-strategy]]（[learning-records/0004](0004-tech-spec-vs-actual-code-strategy.md)）
- 面试时"用哪个"决策：见 memory 目录 [[monet-official-tech-docs]]
