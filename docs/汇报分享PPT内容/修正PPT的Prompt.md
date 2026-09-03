# PPT 内容修正 Prompt

> 将以下 Prompt 完整粘贴给 ppt-master 或其他 AI PPT 工具，让它修正已生成的 PPT 中 4 处与代码不符的内容。

---

## Prompt

请对已生成的 18 页 DreamMaker 技术架构 PPT 做以下 **4 处内容修正**，其余页面保持不变。

### 修正 1：P08 — Block 类型数量（低优先级）

**原文：** "六种 Block 类型"
**改为：** "七种 Block 类型"，补充列出：TextBlock、ThinkingBlock、ToolUseBlock、ImageBlock、FileBlock、NodeBlock、SkillBlock

如果页面上有具体列举 Block 类型的地方，补上 SkillBlock。

---

### 修正 2：P09 — 分层上下文感知（重要）

**第一层"画布概览"原文：** "渲染成 Markdown 摘要"
**改为：** "按节点规模分 **5 级渐进渲染**成 Markdown 摘要"

如果页面有三层金字塔图或卡片，第一层的描述改为：
- 画布概览（入口注入，**5 级渐进渲染** + ContextVar 缓存）
- ≤5 节点：全量详情（id/type/label/position/output + 边）
- 6-30：id/type/label + 边
- 31-100：最多 60 节点 + 类型分布
- \>100：仅总数 + 类型分布

**第三层原文：** "Token 预算管理（三道防线）：token 预检 → 渐进式裁剪 → LLM 摘要压缩"
**整段替换为：** "上下文溢出自动压缩"，内容改为：
- 上游 LLM 返回上下文超长错误时
- ChatAIGW 转为 ContextOverflowError
- DeepAgent 框架 SummarizationMiddleware 自动压缩历史并重试
- SSE 层过滤压缩过程输出，用户无感知
- **被动触发**，非主动预检

删除所有提到"tiktoken"、"渐进式裁剪"、"保留最近 4 轮"、"200-500 token 摘要"的内容。

**Speaker Notes 同步改为：**
上下文注入三层：画布概览按节点规模 5 级渐进渲染后注入到每次 LLM 调用前、按需工具查询节点详情、上下文溢出时 ChatAIGW 转 ContextOverflowError 由 DeepAgent SummarizationMiddleware 自动压缩历史并重试，被动触发，用户无感知。

---

### 修正 3：P17 — 容错降级第一层 executeWithRetry（中优先级）

**原文：** "最多 3 次重试，指数退避 1s→2s→4s"
**改为：** "最多 **3 次尝试**（含首次调用），指数退避 **1s→2s**"

补充说明：第三次（最后一次）失败后不再 sleep，直接返回错误。4s 退避实际不会被执行。

如果页面上有三层嵌套图，第一层的标注从 "3 次，1s→2s→4s" 改为 "3 次尝试，1s→2s"。

**Speaker Notes 同步改为：**
容错三层：executeWithRetry 做 3 次尝试（含首次）指数退避 1s→2s，最后一次失败不再 sleep；queue-retry 针对 429 限流做长退避最长 12 小时；Fallback chain 按模型粒度线性切换供应商，无状态 per-request。可优化方向是熔断器。

---

### 修正 4：P18 — 总结页（跟随修正 2、3 同步调整）

如果总结页中 Agent 服务亮点提到"Token 预算三道防线"，改为"上下文溢出自动压缩"。
如果 Worker 亮点提到"1s→2s→4s"，改为"1s→2s"。

---

### 注意事项

- 只改上述 4 处内容，其余 14 页不要动
- 保持深色科技风格和现有布局不变
- 每页的 Speaker Notes 必须同步更新
- 这是工作周会汇报用的 PPT，**不允许有任何杜撰内容**，所有修正都已经过代码核实
