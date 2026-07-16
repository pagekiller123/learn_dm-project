# 简历参考素材总入口

> 27 届秋招 · AI Agent 开发/算法方向
> 所有落盘的简历相关素材都在这个目录，新 session 打开先读这个文件。

---

## 📁 文件索引

### 顶层素材（依赖度低，可独立阅读）

| # | 文件 | 内容 | 何时读 |
|---|------|------|--------|
| 01 | [01-agent-resume-collection.md](01-agent-resume-collection.md) | 从网上收集的 7 份 Agent 方向简历 + 评论区锐评 | 想看别人的简历怎么写、评论区批评点、避坑 |
| 02 | [02-resume-writing-guide.md](02-resume-writing-guide.md) | Agent 方向简历写作总指南（技术栈关键词、STAR 结构、避坑清单） | 开始动笔前必读 |
| 03 | [03-resume-design.md](03-resume-design.md) | 两份简历的整体设计方案（开发岗 vs 算法岗，项目排序） | 决定简历骨架时 |
| 04 | [04-monet-full-tech-report.md](04-monet-full-tech-report.md) ⭐ | **POPO Agent 目录 9 篇文档整合报告**：关系图 + 7 个事实澄清 + 7 大亮点池 + 面试防守金句 | 讲 Monet 项目、面试准备时 |
| 05 | [05-monet-resume-bullets-draft.md](05-monet-resume-bullets-draft.md) ⭐ | **Monet 项目 4 条简历项目描述初稿**（等量化数据回填） | 写简历项目条目时 |

### 学习工作区（teach skill 建立，深度学习）

| 目录 | 说明 |
|------|------|
| [learning/](learning/) | teach skill 的学习工作区，包含 MISSION、RESOURCES、CURRICULUM、lessons、learning-records 等 |
| [learning/lessons/0001-monet-architecture-overview.html](learning/lessons/0001-monet-architecture-overview.html) | Monet 整体架构总览（含官方五层图 + 当前代码图 + 面试防守话术） |
| [learning/lessons/0002-scheduler-architecture-overview.html](learning/lessons/0002-scheduler-architecture-overview.html) | Scheduler 整体架构总览 |
| [learning/learning-records/](learning/learning-records/) | 学习记录：checkpointer 单例、单机单用户、前端技术栈、双层记忆策略、POPO 9 篇文档整合等 |
| [learning/RESOURCES.md](learning/RESOURCES.md) | 所有学习资源索引，含 POPO Agent 目录 9 篇文档的 docId |

---

## 🎯 常见任务快速导航

### 我想开始写简历
1. 先读 [03-resume-design.md](03-resume-design.md) 确定骨架
2. 再读 [05-monet-resume-bullets-draft.md](05-monet-resume-bullets-draft.md) 取 Monet 条目初稿
3. 结合 [02-resume-writing-guide.md](02-resume-writing-guide.md) 的写作规范打磨措辞

### 我要面试了，准备防守话术
1. 读 [04-monet-full-tech-report.md](04-monet-full-tech-report.md) 第四章"面试防守金句总集"
2. 每个亮点章节末尾的"面试防守问答"
3. [learning/learning-records/](learning/learning-records/) 里的每条记录都是曾经卡住我理解的关键点

### 我想深入学 Monet / Scheduler 的架构
1. 打开 [learning/lessons/](learning/lessons/) 里的 HTML 课程
2. 官方文档索引在 [learning/RESOURCES.md](learning/RESOURCES.md)（含 popo-cli 读取命令）

### 我要评估某个亮点值不值得写
- 每个亮点已经标了 ⭐ 数量（1-5 颗）见 [04-monet-full-tech-report.md](04-monet-full-tech-report.md) 第三章
- 判断标准：AI Agent 岗直接相关度 + 参与深度 + 量化数据可获得性

---

## 🔑 核心原则速查

### 双层记忆策略（重要）

- **宏观架构 + 设计意图** → 官方技术方案（稳定，不变）
- **具体实现细节** → 当前代码（易变，跟着代码走）
- 冲突时明确划分讲，不默认以某一方为准

见 [learning/learning-records/0004-tech-spec-vs-actual-code-strategy.md](learning/learning-records/0004-tech-spec-vs-actual-code-strategy.md)

### 简历避坑三条铁律

1. **不要技术名词堆砌** — 每个 keyword 后要跟"用它解决了什么问题"
2. **不要只写"负责 X"** — 写"用 XX 技术解决了 XX 问题，结果 XX"
3. **必须量化** — 成功率 XX%、延迟 XXms、提升 XX%

见 [02-resume-writing-guide.md](02-resume-writing-guide.md) 第四章

### AI 协作原则

- 中文回复
- Diff 透明（改完主动告诉用户改了哪几个文件）
- 不知道就说不知道，不脑补业务背景

见项目根 [../../CLAUDE.md](../../CLAUDE.md) 第六章

---

## 📊 当前进度

| 项目 | 状态 |
|------|------|
| JD 分析 | ✅ 完成（[02-resume-writing-guide.md](02-resume-writing-guide.md) 里有 JD 关注点总结） |
| 简历案例收集 | ✅ 完成（[01-agent-resume-collection.md](01-agent-resume-collection.md)） |
| 简历整体设计 | ✅ 完成（[03-resume-design.md](03-resume-design.md)） |
| Monet 官方文档精读 | ✅ 完成（[04-monet-full-tech-report.md](04-monet-full-tech-report.md)） |
| Monet 简历条目初稿 | ✅ 完成（[05-monet-resume-bullets-draft.md](05-monet-resume-bullets-draft.md)） |
| Monet 架构学习 | ✅ Lesson 0001 完成 |
| Scheduler 架构学习 | ✅ Lesson 0002 完成 |
| **量化数据收集** | ⏳ **待办**：日均任务量、QPS、延迟、成功率等 |
| **参与深度确认** | ⏳ **待办**：文件同步、Coding/Review Rules 是否要写 |
| Scheduler 官方文档精读 | ⏳ 未开始（`docs/dreammaker-architecture/`） |
| Scheduler 简历条目初稿 | ⏳ 未开始 |
| DM 主站简历条目 | ⏳ 未开始 |
| 讯飞 GRPO 简历条目 | ⏳ 未开始 |

---

## 更新历史

| 日期 | 变更 |
|------|------|
| 2026-07-16 | 建立 README 索引；落盘 04 整合报告、05 简历条目初稿 |
| 2026-07-15 | 建立 teach 工作区，生成 Lesson 0001/0002 |
| 2026-07-14 | 建立 03 简历设计方案 |
| 2026-07-13 | 建立 01/02 参考素材 |
