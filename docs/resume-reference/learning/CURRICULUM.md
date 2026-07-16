# 课程大纲

> 学习路径：架构总览 → 关键模块 → MR 亮点挖掘 → 简历整合

## 阶段一：架构总览（2 节）

### 0001 — Monet 整体架构总览
- **目标**：能在白板画出 Monet 架构图，讲清 DeepAgent 框架下的模块协作、跟客户端画布的交互模式
- **产出**：架构图（Mermaid）+ 术语表 + 3 个面试常问点

### 0002 — Scheduler 整体架构总览
- **目标**：能讲清五层架构、三大核心组件（app-gateway / worker-scheduler / worker-sidecar）职责边界
- **产出**：架构图 + 关键数据流（任务从入口到 Worker）+ 3 个面试常问点

## 阶段二：关键模块深入（4 节）

### 0003 — Monet Agent Runner + Tool Use 机制
- **模块**：`src/monet/agent/runner.py` + `src/monet/tools/`
- **目标**：讲清 Agent Loop 如何驱动、Tool Calling 怎么实现
- **候选亮点**：Tool Use 设计（可写入简历）

### 0004 — Scheduler 任务调度全链路
- **模块**：`app/app-gateway` → Redis queue → `app/worker-scheduler` → `app/worker-sidecar`
- **目标**：讲清一个任务从提交到执行完的完整流程
- **候选亮点**：分布式任务调度（可写入简历）

### 0005 — Monet 画布感知（Monet 独特能力）
- **模块**：`src/monet/agent/state_reader.py` + `src/monet/tools/canvas*.py`
- **目标**：讲清 Agent 如何理解画布上下文（业内少见）
- **候选亮点**：Canvas Awareness + Query Tool（可写入简历）

### 0006 — Scheduler GPU/Worker 调度 + 高可用
- **模块**：`app/worker-scheduler` + etcd worker registry + Leader 选举
- **目标**：讲清资源分配和高可用机制
- **候选亮点**：Leader 选举 + GPU 调度（可写入简历）

## 阶段三：从 MR 挖亮点（≥4 节）

### 0007 — 方法论：如何评估一个 MR 的含金量
- **教内容**：什么样的 MR 值得"接管"、什么样的太套路（对应"简历三"的评论洞察）
- **产出**：MR 评估 checklist

### 0008+ — 挑 MR 深挖（每节 1 个 MR）
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

## 阶段四：简历整合（1 节）

### 最终节 — 把亮点写进简历
- **产出**：两份简历的项目描述初稿（对应 03-resume-design.md 中的模板）

---

## 学习节奏建议

- 每天 1 节课，约 30-45 分钟
- 每节课学完当天/次日做一次回顾（间隔重复）
- 阶段一 + 阶段二完成后（约 1 周），开始并行做阶段三（MR 挖掘）
- 秋招关键窗口内至少完成 6 节以上
