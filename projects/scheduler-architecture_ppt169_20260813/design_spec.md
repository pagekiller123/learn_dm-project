<!-- ppt-master-schema: design-spec/v1 -->
# Scheduler Architecture - Design Spec

## I. Project Information

| Item | Value |
| --- | --- |
| Project Name | scheduler-architecture |
| Canvas Format | PPT 16:9 (1280×720) |
| Page Count | 12 |
| Primary Language | zh-Hans |
| Target Audience | 新入职开发人员，了解 Go 基础和 HTTP 微服务概念，但对 DreamMaker 系统无认知 |
| Communication Intent | 教学 + 架构解说 — 在 15 分钟内从全貌到细节，让新人理解 Scheduler 微服务集群的整体架构、任务全链路、核心调度机制和高可用设计 |
| Desired Audience Outcome | 听完后能用自己的话描述一个 AI 任务从提交到返回结果经过了哪些组件，理解三套存储各自的角色，理解 Worker Pull 模型和乐观抢占的设计取舍 |
| Core Message / Ask / Action | 不同语义用不同存储，不同场景用不同策略 — 这是分布式系统设计的核心智慧 |
| Delivery Context | Presenter-led, 15 分钟技术分享会 |
| Artifact Afterlife | 团队内部存档复用，新人自学参考 |
| Reading Mode | presentation |
| Content Strategy | balanced default |
| Design Style | 深色科技风 — 深蓝黑底搭配高对比度文字和蓝橙双色强调 |
| AI Image Acquisition Path | not applicable |
| Generation Mode | continuous |
| Spec Refinement | disabled |
| Speaker Notes | enabled — workflow default |
| Custom Animations | disabled — workflow default |
| Narration Audio | disabled — workflow default |
| Created Date | 2026-08-13 |

## II. Canvas Specification

| Property | Value |
| --- | --- |
| Format | PPT 16:9 |
| Dimensions | 1280 × 720 |
| viewBox | `0 0 1280 720` |
| Margins | 48px all sides |
| Content Area | 48,48 to 1232,672 |

## III. Visual Theme

### Theme Style

- **Mode**: custom
- **Mode Behavior**: instructional — 先建立全貌（架构总览），再逐层递进讲解各子系统（调度、队列、高可用），每个主题先给结论再展开细节
- **Visual style**: custom
- **Visual Style Behavior**: dark-tech — 深色背景营造专注技术氛围，蓝色系主色调传递可靠/专业感，橙色点缀用于强调关键概念和动作，卡片式布局组织技术要点，代码风格排版增强工程属性

### Color Scheme

| Role | HEX | Purpose |
| --- | --- | --- |
| Background | #0F172A | 深蓝黑底，营造技术氛围 |
| Secondary background | #1E293B | 卡片/区块底色，层次分离 |
| Primary | #38BDF8 | 标题、关键术语、组件名 |
| Accent | #F97316 | 强调、高亮、关键动作 |
| Secondary accent | #A78BFA | 次要标注、辅助分类 |
| Body text | #E2E8F0 | 正文内容 |

## IV. Typography System

### Font Plan

| Role | Character (Reference) | Primary | English if non-English | Fallback tail |
| --- | --- | --- | --- | --- |
| Title | Sans-serif / Bold | Noto Sans SC | Inter | Microsoft YaHei, sans-serif |
| Body | Sans-serif / Regular | Noto Sans SC | Inter | Microsoft YaHei, sans-serif |
| Code | Monospace / Regular | Fira Code | Fira Code | SF Mono, Monaco, monospace |

- **Title stack**: Noto Sans SC, Inter, Microsoft YaHei, sans-serif
- **Body stack**: Noto Sans SC, Inter, Microsoft YaHei, sans-serif
- **Code stack**: Fira Code, SF Mono, Monaco, monospace

### Font Size Hierarchy

| Purpose | Anchor Size (px) |
| --- | ---: |
| Body | 18 |
| Title | 36 |
| Subtitle | 24 |
| Annotation | 14 |

## V. Layout Principles

### Page Structure

- **Header area**: 页面标题居左上角，高度约 80px
- **Content area**: 主内容区域，灵活布局（卡片、列表、表格）
- **Footer area**: 页码居右下角，高度约 32px

### Spacing Specification

| Element | Current Project |
| --- | --- |
| Safe margin | 48px |
| Content block gap | 24px |
| Icon-text gap | 12px |

## VI. Icon Usage Specification

- **Primary bundled library**: none

## VIII. Image Resource List

| Filename | Dimensions | Ratio | Purpose | Type | Layout pattern | Crop Policy | Acquire Via | Status | Reference | text_policy | page_role |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## IX. Content Outline

### Part 1: 系统总览

#### Slide 01 - 封面

- **Audience move**: 不了解 DreamMaker → 知道今天要学什么
- **Layout**: 居中大标题 + 副标题 + 底部信息行
- **Title**: DreamMaker Scheduler 架构深度解析
- **Core message**: 面向新人的系统入门
- **Content**:
  - 主标题：DreamMaker Scheduler 架构深度解析
  - 副标题：面向新人的系统入门
  - 信息行：约 15 分钟 · DreamMaker — 网易互娱 AI 美术平台

#### Slide 02 - Scheduler 是什么

- **Audience move**: 不知道 Scheduler 干什么 → 一句话定位 + 技术栈全貌
- **Layout**: 左侧一句话定位区块 + 右侧技术栈表格
- **Title**: Scheduler 是什么？
- **Core message**: Go 微服务集群，把 AI 生成任务从用户提交到 GPU Worker 执行，全流程调度
- **Content**:
  - 一句话：Scheduler = Go 微服务集群 + Redis 任务队列 + MongoDB 记录中心 + etcd Worker 注册中心 + K8s 服务发现
  - 核心使命：把 AI 生成任务（文生图、图生视频、3D 等）从用户提交到 GPU Worker 执行
  - 技术栈表格：Go+dmfr / Redis(ZSet) / MongoDB / etcd / Kafka / K8s+Istio / Hertz+Fiber，各一行角色说明

#### Slide 03 - 五层架构

- **Audience move**: 知道技术栈 → 理解分层职责边界
- **Layout**: 纵向五层堆叠，每层一个横向卡片，从上到下
- **Title**: 五层架构总览
- **Core message**: 每层只做自己的事，不越界
- **Content**:
  - 第 1 层 外部请求层：前端 / Monet / 内部工具 → 组装请求、携带鉴权
  - 第 2 层 业务服务层：api-outer / app-gateway → 参数校验、鉴权、入队
  - 第 3 层 基础设施层：worker-scheduler → 拉队列、分配任务、回写结果
  - 第 4 层 Worker 执行层：worker-sidecar + Workers → 执行推理、上报结果
  - 第 5 层 外部供应商层：ComfyUI / 火山 / Kling 等 → 实际 AI 推理

#### Slide 04 - 三大核心组件

- **Audience move**: 理解分层 → 理解三个核心组件的分工
- **Layout**: 三列卡片并排，每列一个组件
- **Title**: 三大核心组件
- **Core message**: app-gateway 入队、worker-scheduler 调度、worker-sidecar 适配
- **Content**:
  - app-gateway（任务入口）：权限校验 → 参数映射 → Mongo 入库 → Redis 入队 → 返回 task_id
  - worker-scheduler（调度核心）：多 Pod 并行 · Worker Pull 模型 · 从 Redis 拉 → Mongo 加载 → etcd 注册 → 下发
  - worker-sidecar（异构适配）：Adapter Pattern · 新增 AI 能力不改 scheduler · 本地后端 + 外部供应商统一接口

### Part 2: 任务调度

#### Slide 05 - 三套存储

- **Audience move**: 知道组件 → 理解为什么用三套存储
- **Layout**: 三列卡片，每列一种存储，顶部 logo/名称 + 下方要点
- **Title**: 为什么需要三套存储？
- **Core message**: 不同语义用不同存储 — 经典分布式系统取舍
- **Content**:
  - Redis：短生命周期"待消费"队列 · ZSet 排序 · 亚秒 /status 轮询
  - MongoDB：长生命周期"任务记录中心" · 参数/状态/结果全量 · 查询/审计/计费
  - etcd：运行态"强一致注册中心" · Lease+Watch · Worker 挂掉自动清理
  - 底部金句：核心原则 — 不同语义用不同存储，不要强求一套搞定

#### Slide 06 - 任务生命周期

- **Audience move**: 理解存储分工 → 理解一个任务的完整链路
- **Layout**: 三段式横向流程：提交 → 调度 → 执行回写
- **Title**: 任务完整生命周期
- **Core message**: 提交和执行完全异步，Worker Pull 天然背压
- **Content**:
  - 提交阶段：Client → api-outer(JWT) → app-gateway(权限+映射) → Mongo 写 AppRecord → Redis ZAdd → 返回 task_id
  - 调度阶段：Worker 上报空闲 → scheduler 拉任务 → WeightedScheduler 选优先级 → ZRem 抢占 → Mongo 加载 → etcd 注册 → 下发
  - 执行回写：Worker 推理 → 上报结果 → AfterCall → Mongo 写 Success → Kafka 通知 → etcd 删除

#### Slide 07 - 状态机与 Action

- **Audience move**: 理解链路 → 理解状态管理和代码编排
- **Layout**: 左侧状态机流转图 + 右侧 Action 三层结构
- **Title**: 任务状态机与 Action 编排
- **Core message**: Template Method + Strategy 模式，新供应商直接复用 commonAction
- **Content**:
  - 5 种状态：queued → running → success / failed / stopped
  - Action 三层：Base(公共) → commonAction(ZSet 队列) → 专用 action(仅差异大时)
  - 编排链路：BeforeProduce → Produce → Consume → BeforeCall → GenerateTask → AfterCall
  - Go 类型断言实现能力检测（接口隔离原则）

#### Slide 08 - Redis ZSet 乐观抢占

- **Audience move**: 理解编排 → 理解队列核心机制
- **Layout**: 上半部分对比亮点 + 下半部分两轮扫描流程
- **Title**: Redis ZSet 队列与乐观抢占
- **Core message**: ZRem 原子操作 + 两轮扫描兼顾公平与吞吐
- **Content**:
  - ZSet 设计：按 score 排序 · member 只存 user::taskID · 完整数据在 Mongo
  - 多队列 Key：{priority}::{source}::{taskMode}::{cluster} → 隔离/限流/调度/性能
  - 抢占：ZRem 返回 ≥1 = 抢到（原子操作，无需 Lua）
  - 两轮扫描：第一轮跳过冲突用户(公平) → 第二轮消费冲突任务(吞吐)

#### Slide 09 - 优先级与并发控制

- **Audience move**: 理解抢占 → 理解调度策略和并发管理
- **Layout**: 上部加权调度 + 下部并发控制
- **Title**: 优先级调度与并发控制
- **Core message**: 加权轮转防饥饿，CAS+etcd Watch 最终一致
- **Content**:
  - WeightedScheduler：配置 [pri:2 w:5, pri:1 w:3, pri:0 w:2] → 每 10 次 5/3/2 · 配额+降序兜底防饥饿
  - ConcurrentManager：CAS 原子操作（乐观无阻塞）
  - etcd Watch 同步：任务注册 → 所有 Pod +1 · 任务完成 → 所有 Pod -1 · 最终一致

### Part 3: 高可用

#### Slide 10 - etcd 注册与故障检测

- **Audience move**: 理解调度策略 → 理解运行态管理和故障恢复
- **Layout**: 上部 etcd 四大能力表格 + 下部故障检测链路
- **Title**: etcd 注册、心跳与故障检测
- **Core message**: Lease + Watch 实现自动故障检测和并发计数恢复
- **Content**:
  - etcd 四能力：Put/Get/Delete · Watch 实时推送 · Lease TTL 自动清理 · Txn 乐观锁
  - Key：/worker/{env}/{podName} · /task/{env}/{taskID}
  - 心跳：Sidecar 30s → Scheduler UpdateWorker(Txn 写回)
  - 故障链路：Worker 崩溃 → 心跳停 → Lease 过期 → Watch Delete → 清理缓存 + 计数恢复

#### Slide 11 - Worker 生命周期与 Autoscaler

- **Audience move**: 理解故障检测 → 理解生命周期管理和弹性伸缩
- **Layout**: 左侧 Worker 状态机 + 右侧 Autoscaler 逻辑
- **Title**: Worker 生命周期与 Autoscaler
- **Core message**: 两阶段优雅关闭 + 基于队列长度的自定义扩缩容
- **Content**:
  - 状态机：pending → running → recovering / terminating → terminated
  - 优雅关闭：SIGTERM → shutdown(不接新任务) → 等待完成 → exit
  - 自定义 Autoscaler vs HPA：HPA 看 CPU/Mem，看不到 GPU 队列长度
  - 扩容：唤醒 terminated Worker · 缩容：删除空闲超时 Worker · 安全检查防雪球

### Part 4: 总结

#### Slide 12 - 设计决策总结

- **Audience move**: 理解各子系统 → 提炼设计智慧
- **Layout**: 五行设计决策表 + 底部金句
- **Title**: 关键设计决策总结
- **Core message**: 不同语义用不同存储，不同场景用不同策略
- **Content**:
  - 三套存储各司其职：Redis 吞吐 · Mongo 持久 · etcd 一致性
  - Worker Pull 模型：天然背压，Worker 不被打爆
  - 多 Pod 并行 + 乐观抢占：etcd Watch 状态 + Redis ZRem 竞争
  - 两轮扫描：公平性优先，吞吐量兜底
  - 先加载再 Watch：全量基线 + 增量更新
  - 金句：不同语义用不同存储，不同场景用不同策略 — 分布式系统设计的核心智慧

## X. Speaker Notes Requirements

- **Generation**: enabled
- **Filename**: match each SVG filename under `notes/`
- **Content**: 基于课程 HTML 内容的完整逐字演讲稿，每页 1-1.5 分钟，口语化但专业
- **Total duration**: 15 minutes
- **Notes style**: conversational
- **Presentation purpose**: teach + explain
