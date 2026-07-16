
## 一、项目快速定位

DreamMaker(DM)是网易互娱内部的 AI 美术平台,把市面上的 AI 模型(文/图/视频/3D/音频)统一封装成内部服务。

**三个仓库**:
| 仓库 | 语言 / 框架 | 角色 |
|---|---|---|
| `dm-monet-agent` | Python 3.13 + DeepAgent | 本地 Agent 服务,跟 Monet 桌面客户端打包 |
| `dreammaker-gateway` | Go + dmfr(Hertz) | 美术 AI 供应商网关,接入各类外部 AI 供应商 |
| `dreammaker-scheduler` | Go + dmfr(Hertz / Fiber) | 后端微服务集合,主站走这边 |

各仓库的细节、模块划分,以各自仓库根的 `CLAUDE.md` / `AGENTS.md` / `openspec/project.md` 为准。

**环境链接**：
| 环境 | 主站 URL |
|------|----------|
| 测试 | https://dreammaker-test.netease.com |
| 生产 | https://dreammaker.netease.com |

---

## 二、跨仓库共识

只列**长期成立**的事实,接口字段、payload 不在这里,要查具体接口去 spec。


### 2.1 Scheduler 仓库专属共识

- 设计理念:**以 App 为原子能力**,上层系统(2d、story-board 等)由 App 组装。
- 五层架构:外部请求层 → 业务服务层(含 `app-gateway`)→ 基础服务层(`worker-scheduler`)→ Worker 执行层(`sidecar` + 各类 worker)→ 外部供应商层。
- 三大核心组件分工:
  - `app-gateway`:任务入口、参数校验、入队;
  - `worker-scheduler`:Leader 选举 + 任务分配;
  - `worker-sidecar`:任务执行 + 状态 / 结果上报。
- Worker 分 10 大类(图像 / 视频 / 3D / 腾讯混元 / 火山 / 语音 / LLM / 工具 / 工作流 / 桌面软件)。

> Gateway 自己的内部约定(包依赖边界、ecode 使用、HTTP 响应写法)详见 `dreammaker-gateway` 仓库根的 `CLAUDE.md`,不在团队版重复。
> Monet 桌面端 + Agent 侧的链路待补充。

---

## 三、开发流程约定

### 3.1 SDD（Spec-Driven Development）

- **每个改动都必须有关联 spec**，无 spec 不进 MR。
- 例外：spec 文档自身的改动豁免。

#### 开发前必须执行的流程

1. **明确要改哪个仓库** — 确定目标仓库（`dreammaker-scheduler` / `dreammaker-gateway` / `dm-monet-agent`）。
2. **（可选）用 `superpowers:brainstorming` 梳理思路** — 需求模糊、方案不确定、或涉及多模块协作时，先用 brainstorming 理清设计方向。
3. **必须在目标仓库目录下用 openspec 写 spec** — 进入对应仓库的工作目录，使用 `/opsx:propose` 生成 spec 到该仓库的 `openspec/changes/` 下。spec 通过后用 `/opsx:apply` 归档到 `openspec/specs/`。
4. **spec 就绪后才开始写代码。**

示例：要给 `dreammaker-scheduler` 接入新能力 →
```
cd current_project/dreammaker_scheduler/
# 用 openspec skill 在这个仓库的 openspec/ 下生成 spec
/opsx:propose
# spec 审核通过后
/opsx:apply
# 然后才开始写代码
```

### 3.2 质量门禁

- 任何改动 commit 前必须通过本仓库的**类型检查 + 格式化 + lint**(无论 Python 还是 Go);push 前必须通过相关**单元测试**。
- 具体命令以各仓库 `AGENTS.md` / `CLAUDE.md` 为准,团队版不固化(避免命令变更后这里过时)。

### 3.3 Commit / MR

- 一次 commit 只做一个逻辑变更。
- commit message **不带任何 AI 工具生成的署名 / 水印**(Claude / Codex / 等)。
- 各仓库的 commit 格式约定不同(行动类型前缀 vs Emoji 前缀),沿用各仓库 `AGENTS.md` / `CLAUDE.md` 现有约定,不强行统一。
- MR 合入目标分支由各仓库自身分支模型决定(如 dm-monet-agent 走 `feature/* → develop → master`),不在团队版强求统一。

---

## 四、危险动作清单

凡是**会扣真钱 / 影响线上 / 不可逆**的动作,必须先获得明确授权再执行。

- ❌ **禁止主动跑 e2e 测试**:`dm-monet-agent` 的 `tests/e2e/` 调真实付费接口(DM / AIGW / 画布后端);未经用户明确要求,不执行 `pytest -m e2e` 或任何能触发 e2e 的命令。
- ❌ **禁止改对外协议(HTTP 响应字段、错误码、capability 注册项)而不走 spec**:接口被多方依赖,改一处影响一片。
- ❌ **禁止 `git push` / `git reset --hard` / 强制覆盖远端分支**:这些动作不可逆,执行前必须用户授权。
- ❌ **禁止新增 capability 时漏配限流规则**:gateway 侧 `CodeRateLimitMiddleware` 要求命中规则才放行,无规则会被 429 拦截。
- ⚠️ 改协议 / 改公共数据模型 / 改 ecode 前,先翻对应仓库 `docs/system/` 或 `openspec/specs/`,确认影响面。

---

## 五、工具与 skill 约定

- **OpenSpec**:npm 全局已装,新项目目录首次使用前要 `openspec init`;改动写 spec 用 `/opsx:propose` / `/opsx:apply` / `/opsx:archive`。
- **测试 / lint 命令**:以各仓库 `AGENTS.md` / `CLAUDE.md` 为准(Python 走 `pyright` + `ruff` + `pytest`,Go 走 `go vet` + `go test`)。
- **dmfr**:Go 仓库的脚手架,**能用 dmfr 解决的不要重复造轮子**(HTTP client、logging、ecode、tracing、配置、启动模板)。
- **领域 skill**:各仓库自己装了若干本地 skill(如 `dm-monet-agent` 的 `mr` / `review` / `write-model-api-doc`,`dreammaker-gateway` 的 `seed-gateway-capability`),仅在对应工作目录下使用。

---

## 六、AI 协作具体要求

> **为什么立这些规则**:不立规则的话,AI 在团队代码里持续犯三类错 ——
>
> 1. **错误假设**:替你假设业务设计,然后一路跑下去不回头检查;
> 2. **过度复杂化**:100 行能解决的事写 1000 行,加不必要的抽象;
> 3. **附带伤害**:顺手改不理解的注释和代码,即使跟任务无关。
>
> 上面每一条都对应一种已经发生过 / 容易发生的事故,不是形式主义。

### 6.1 四条铁律(任何任务前都先满足)

1. **Ask, don't assume(问,不要假设)** — 不清楚需求 / 接口 / 业务背景时,写一行代码前先问。永不静默假设。
2. **Simplest solution first(先实现最简单的版本)** — 总是先实现能工作的最简单的东西。不要添加没被要求的抽象。
3. **Don't touch unrelated code(不碰无关代码)** — 文件不在当前任务直接范围内,不要修改它(包括"顺手优化注释 / 格式")。
4. **Flag uncertainty explicitly(显式标出不确定)** — 对方法不自信时,在继续前说出来。自信但有错的损害,远大于承认缺口的损害。

### 6.2 DreamMaker 场景特别强调的两条

5. ★★★ **不凭训练数据猜函数签名 / API / 配置项,先用 Grep / Read 查实际代码** — DM 跨仓库 + 跨语言(Python / Go),且 Go 仓库 Hertz 与 Fiber 混用,DeepAgent / dmfr 都是内部封装,凭印象写错误率极高。
6. **写代码前先搜项目里有没有现成的工具函数 / 常量** — 三个仓库已经实现了大量功能,`pkg/`、`util/`、`internal/` 下经常有现成的;不要重复造轮子。

### 6.3 沟通要求

- **中文回复**(代码、技术术语、专有名词用原文)。
- **diff 透明**:改完代码主动告诉用户改了哪几个文件、加了什么、删了什么,让用户能快速 review。
- **不知道就说不知道**,不要为了"显得专业"编造事实或脑补业务背景。

---

## 七、关键文件索引

不放具体相对路径(各人本地 clone 位置不同),只列**每个仓库根下能找到的文件名**,自己用 `find` / IDE 跳转。

### 各仓库入口

- `dm-monet-agent` 仓库根:`AGENTS.md` / `CLAUDE.md` / `README.md`
- `dreammaker-gateway` 仓库根:`CLAUDE.md` — 含包依赖边界、ecode 清单、响应协议
- `dreammaker-scheduler` 仓库根:`AGENTS.md` — 含服务清单、dmfr 用法

### 各仓库 OpenSpec(若已 init)

- `openspec/project.md` — 项目顶层介绍
- `openspec/specs/` — 各 capability 的设计文档
- `openspec/changes/` — 待合入的变更

### 团队空间(用 popo-doc / km-ask skill 读取)

- POPO 团队空间:`dreammaker`,team space ID = `332e46c02522490f9856818cc0668462`。具体文档随项目阶段会变,需要时用 popo-doc skill 在团队空间内现查,不在本文写死 docId 清单。

### Agent 官方技术方案（用户秋招简历核心背书来源）

`docs/resume-reference/learning/RESOURCES.md` 里维护了 POPO 团队空间"Agent"目录下 9 篇官方技术文档的 docId 索引（如"DreamMaker Agent 技术方案"`793c642c8ae94c94baa5f8e99ecacbe7`、"AI Agent 框架深度选型对比报告"`af805de3582d4fbda67ad60b6dbf1a36` 等）。

**AI session 处理 Monet 相关话题时**:
- 讲整体架构、设计意图、产品愿景 → 优先引这些文档（用 popo-doc skill 读取，稳定不变）
- 讲具体实现、"我做了什么" → 以 `current_project/dm-monet-agent/src/` 代码为准（易变）
- 两者冲突时 → 按 [docs/resume-reference/learning/learning-records/0004-tech-spec-vs-actual-code-strategy.md](docs/resume-reference/learning/learning-records/0004-tech-spec-vs-actual-code-strategy.md) 的双层策略处理

### 简历学习工作区

`docs/resume-reference/` 是学员秋招简历的所有落盘素材。**AI session 帮学员做简历相关任务时,必读 [docs/resume-reference/README.md](docs/resume-reference/README.md) 作为入口**——它索引了：

- **04-monet-full-tech-report.md**: POPO Agent 目录 9 篇文档整合报告,含 7 大简历亮点池、面试防守金句、亮点池代码锚点
- **05-monet-resume-bullets-draft.md**: Monet 项目 4 条简历条目初稿(等量化数据回填)
- **01-03**: 简历案例、写作指南、整体设计方案
- **learning/**: teach skill 建立的学习工作区,含 HTML 课程和学习记录

**不要重新探索这些内容**;直接读 README 定位到具体文件。

---

## 八、用户背景

详见 [docs/user-background.md](docs/user-background.md) — 包含角色定位、学习目标、协作偏好。AI 协作时应据此调整解释深度和沟通方式。

---

## 九、开发参考文档

| 文档 | 内容 | 何时读 |
|------|------|--------|
| [docs/guide-new-ai-capability.md](docs/guide-new-ai-capability.md) | 基于 dreammaker-scheduler 接入新 AI 能力的完整链路、代码产物清单、编译测试流程、踩坑清单 | 需要在 scheduler 仓库给 DM 接入新的 AI 供应商能力时 |
| [docs/guide-mongo-app-config.md](docs/guide-mongo-app-config.md) | 小程序商城"配置即界面"机制、dreamworker_apps 文档结构、params 类型系统、静态图片上传 | 需要写 mongo 商城登记脚本或理解前端表单渲染逻辑时 |
| [docs/guide-dreammaker-docs.md](docs/guide-dreammaker-docs.md) | `dreammaker-docs` 文档站项目、`/dreammaker-doc-gen` skill 完整流程(以 `volcengine-seed-audio` 为端到端示例)、发布上线、常见踩坑 | 需要给 DM 新接入的 AI 能力生成 API 文档、或排查文档站相关问题时 |