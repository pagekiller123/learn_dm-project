# DreamMaker Docs 文档站项目介绍

> 本文介绍 `dreammaker-docs` 这个文档站项目:它是什么、`/dreammaker-doc-gen` skill 是怎么把"供应商文档 + Mongo 里的 App 配置"合成最终 API 文档的、如何发布上线。
>
> 面向团队内新同事和 AI 协作者。如果你只是想"跑一遍更新某个 App 的文档",看本文第三节就够了。

---

## 一、项目定位

`dreammaker-docs` 是 DreamMaker(DM)主站的**对外 API 文档站**,技术栈是 VitePress。

- **线上地址**:https://dreammaker-docs.netease.com
- **仓库根目录**:`current_project/dreammaker_docs/`
- **文档源目录**:`zh/` —— VitePress 的页面根,所有文档都是 markdown
- **内容分区**:
  - `zh/dm/` —— DM 主站(API 文档、接入指南、FAQ、计费)
  - `zh/sunshine/` —— Sunshine Flow(节点式可视化工作流)
  - `zh/storyboard/` —— Storyboard AI
- **API 文档目录**:`zh/dm/API/` —— 按能力类型(图像/视频/音频/3D/LLM 等)分目录,每接入一个新的 DM 小程序 App 就往这里加一个页面

每次 DM 接入了新的 AI 供应商能力,就需要在这里生成对应的 API 文档页面 —— 这就是 `/dreammaker-doc-gen` skill 要做的事。

---

## 二、核心工作流:`/dreammaker-doc-gen`

### 2.1 这个 skill 在干什么

一句话:**读取供应商原始文档 + Mongo 里的 App 配置,套模板生成 API 文档 markdown,再把"参数表"和"是否开放 API"写回 Mongo。**

为什么要这么麻烦,不直接手写字段?

- 文档里的**参数表必须和 Mongo 里 `dreamworker_apps.params` 对齐** —— 前端表单就是从这个字段渲染的,文档写错了用户调用会 400。
- 文档里标注"是否开放 API"必须和 Mongo 里 `dreamworker_apps.api_open` 对齐 —— 主站开放平台是从这个字段读的。
- 如果文档和 Mongo 不一致,要么用户调不通,要么内部接口暴露到外部。所以必须"一次生成、同步写回"。

### 2.2 五步流程

| 步骤 | 动作 | 脚本 / 工具 | 产物 |
|---|---|---|---|
| 1 | 检查环境 | 手工(`mongod -V`、`NODE_PATH`、`MONGO_URI`) | 确认能跑 |
| 2 | 抓供应商文档 | `scripts/fetch_webpage.js`(Playwright + Turndown) | `docs/vendor_docs/{vendor}/{app}.md` |
| 3 | 查 Mongo 拿 App 配置 | `scripts/query_app_info.py` | 输出 app_id、capability_name、params 结构、现有 api_open |
| 4 | 生成 API 文档 | AI 用 skill 里的 `references/doc_template.md` 模板合成 | `zh/dm/API/{分类}/{app_name}_api_doc.md` |
| 5 | 把参数表 + 开放状态写回 Mongo | `scripts/update_app_config.py` | Mongo 里 `dreamworker_apps` 文档的 `api_doc_params` 和 `api_open` 字段被更新 |

其中第 5 步只在你**主动要求**"把参数表和 api_open 写回 Mongo"时才执行 —— 默认只生成文档不写库。要写库需要明确给 skill 下指令(见 SKILL.md 的"触发场景")。

### 2.3 skill 里的脚本都在哪

全部在 `current_project/dreammaker_docs/.claude/skills/dreammaker-doc-gen/`:

| 路径 | 用途 |
|---|---|
| `SKILL.md` | skill 的完整说明、输入输出格式、触发条件 |
| `scripts/fetch_webpage.js` | Playwright 抓网页 + Turndown 转 markdown,产出 `docs/vendor_docs/{vendor}/{app}.md` |
| `scripts/query_app_info.py` | 连 Mongo 查 `dreamworker_apps` 文档,输出该 App 的 app_id / capability_name / params 结构 / api_open |
| `scripts/update_app_config.py` | 把生成的参数表(`api_doc_params`)和开放配置(`api_open`)写回 Mongo |
| `scripts/test_api.py` | 真实调一下生成的 endpoint(JWT 鉴权),验证文档里的参数能跑通 |
| `references/doc_template.md` | API 文档模板 —— 最终生成的 markdown 长什么样、各小节怎么排,都由它决定 |
| `references/data_model.md` | Mongo 里 `dreamworker_apps` 的关键字段说明(params / api_open / api_doc_params / 各供应商特有字段) |

Node 依赖装在 `scripts/node_modules/`(skill 内引用,走 `NODE_PATH=scripts/node_modules`),不要在仓库根 `npm install` 装 skill 的依赖。

---

## 三、端到端示例:volcengine-seed-audio

下面以火山引擎的 Seed-Audio(音频合成 TTS 类能力)为例,展示 skill 完整跑一遍是什么体验。

### 3.1 触发 skill

用户(一般是刚接完这个 App 的开发同学)对 AI 说:

> "帮我生成 volcengine-seed-audio 的 API 文档,供应商文档地址是 https://www.volcengine.com/docs/82379/1399178"

AI 识别到 `dreammaker-doc-gen` skill 触发条件(关键词:"生成 API 文档" / "小程序文档" / "帮我生成文档"),开始执行。

### 3.2 第一步:查 Mongo

AI 先跑 `query_app_info.py`,把 App 在 Mongo 里的信息拉出来:

```bash
cd current_project/dreammaker_docs
python .claude/skills/dreammaker-doc-gen/scripts/query_app_info.py volcengine-seed-audio
```

输出类似:

```
=== App Info: volcengine-seed-audio ===
app_id:              6912345678abcdef01234567
capability_name:     volcengine-seed-audio
supplier:            volcengine
type:                audio
status:              online
params (15 items):   cluster, appid, token, ...
api_open:            False
api_doc_params:      (empty, 还没生成过)
```

这一步让 AI 知道:
- `app_id` 和 `capability_name`(最终生成的文档路径、文件命名要用)
- `supplier`(决定供应商文档去哪抓、套哪个模板分支)
- `type`(决定 API 文档放到 `zh/dm/API/audio/` 这个分类下)
- `params` 的具体结构(每个参数叫什么、什么类型、默认值)—— 文档里的参数表直接从这渲染
- 当前 `api_open` 状态(默认是 False,要不要开放 API 是用户决定的事)

### 3.3 第二步:抓供应商文档

AI 用 `fetch_webpage.js` 抓用户给的 URL,转成 markdown 存到 `docs/vendor_docs/volcengine/volcengine-seed-audio.md`:

```bash
NODE_PATH=.claude/skills/dreammaker-doc-gen/scripts/node_modules \
  node .claude/skills/dreammaker-doc-gen/scripts/fetch_webpage.js \
  "https://www.volcengine.com/docs/82379/1399178" \
  docs/vendor_docs/volcengine/volcengine-seed-audio.md
```

抓到的原始文档里包含:请求 URL、所有请求参数(`text`、`speaker`、`speed` 等)、响应字段、错误码列表。
但**原始文档不会告诉我们**哪些参数是 DM 平台特有的(比如 `cluster`、`appid`、`token` 这些是从 DM 上下文注入的),哪些是供应商原生的 —— 这一步需要 AI 结合 Mongo 里的 `params` 字段做映射。

### 3.4 第三步:AI 合成最终文档

AI 把三样东西合到一起:
1. Mongo 里的 `params` 结构(平台层 + 供应商原生参数)
2. 供应商文档里的字段语义说明(描述、取值范围、示例)
3. `references/doc_template.md` 的骨架

生成一个 markdown 文件,典型结构:

```markdown
# 火山 Seed-Audio
> 一句话介绍

## 功能说明
...

## 接入方式
- 调用 URL:/api/v1/audio/tts
- 请求方式:POST
- Content-Type:application/json

## 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| cluster | string | 是 | - | DM 平台注入,集群标识 |
| text | string | 是 | - | 待合成的文本 |
| speaker | string | 否 | zh_female_... | 音色 |
| ... | ... | ... | ... | ... |

## 响应字段
...

## 错误码
...

## 示例代码
Python / curl / Node.js
```

写到 `zh/dm/API/audio/volcengine-seed-audio.md`(注意路径由 `type=audio` 决定)。

### 3.5 第四步:注册到侧边栏

文档生成完,还要把它加到 VitePress 的 sidebar 里,否则页面是存在的但导航里看不到。

编辑 `.vitepress/config.mjs`,在 `sidebar` 的 audio 分组里加一行:

```js
{ text: '火山 Seed-Audio', link: '/zh/dm/API/audio/volcengine-seed-audio' }
```

### 3.6 第五步(可选):写回 Mongo

如果用户明确要求"把参数表和 api_open 也写回 Mongo",AI 会:

1. 从刚生成的文档里提取参数表 → 转成 `api_doc_params` 格式
2. 询问用户:"要不要开放 API?(默认否)"
3. 跑 `update_app_config.py` 把这两个字段写回 `dreamworker_apps` 的对应文档

```bash
python .claude/skills/dreammaker-doc-gen/scripts/update_app_config.py \
  volcengine-seed-audio \
  --api-doc-params '<json>' \
  --api-open true
```

⚠️ 这一步**默认不跑**。只生成文档 + 不写库是安全的;写库是"会扣真钱/影响线上"级别的危险动作,需要用户明确授权。

### 3.7 第六步(可选):真实调一遍验证

如果要验证文档里的参数确实能跑通,跑 `test_api.py`:

```bash
python .claude/skills/dreammaker-doc-gen/scripts/test_api.py volcengine-seed-audio
```

会用 JWT 鉴权打真实的 DM 接口,确认返回 200。**这是真正会扣供应商钱的**(调一次就扣一次),所以没得到用户授权不要主动跑。

---

## 四、发布上线流程

文档生成完、侧边栏加完、本地 `npm run docs:dev` 确认没问题后,发布上线:

### 4.1 提交代码

```bash
cd current_project/dreammaker_docs
git add zh/dm/API/audio/volcengine-seed-audio.md .vitepress/config.mjs
git commit -m "docs: 新增火山 Seed-Audio API 文档"
git push origin master
```

### 4.2 打 tag 触发 CI/CD

```bash
git tag -a v0.0.XX-release -m ":sparkles: 新增火山 Seed-Audio API 文档"
git push origin v0.0.XX-release
```

版本号在 `master` 上最新 tag 的基础上递增。推送 tag 会自动触发 GitLab CI 流水线(构建 Docker 镜像 + rsync 到 `7.49.2.3`)。

流水线状态查看:[devcloud dreammaker-docs](https://devcloud.nie.netease.com/_dep258/pipeline/gitlab?_repo_id=69cf2b093cf7c6e8c48d825b)

流水线跑完,文档就上线了 —— 也就是你看到的 `https://dreammaker-docs.netease.com/zh/dm/API/audio/volcengine-seed-audio.html`。

---

## 五、关键文件索引

| 文件 / 目录 | 用途 |
|---|---|
| `current_project/dreammaker_docs/zh/` | 文档源(VitePress 页面根) |
| `current_project/dreammaker_docs/zh/dm/API/` | API 文档目录,按 `image` / `video` / `audio` / `3d` / `llm` 等分子目录 |
| `current_project/dreammaker_docs/.vitepress/config.mjs` | 站点配置 + sidebar 导航树,**新增文档必须改这里** |
| `current_project/dreammaker_docs/.claude/skills/dreammaker-doc-gen/SKILL.md` | skill 完整说明 |
| `current_project/dreammaker_docs/.claude/skills/dreammaker-doc-gen/references/doc_template.md` | API 文档模板 |
| `current_project/dreammaker_docs/.claude/skills/dreammaker-doc-gen/references/data_model.md` | Mongo `dreamworker_apps` 字段说明 |
| `current_project/dreammaker_docs/scripts/release.sh` | 自动打 tag 的脚本,`--dry-run` 可预览 |

---

## 六、常见踩坑

### 6.1 参数表跟 Mongo 对不上

最常见。文档里写了 15 个参数,Mongo 里实际只有 13 个 —— 用户调用时前端表单渲染的字段和文档不一致。

**解法**:生成文档时一定要先跑 `query_app_info.py` 拿当前 Mongo 的 `params` 结构,以 Mongo 为准;不要直接照抄供应商文档。

### 6.2 加了文档但没加 sidebar

文档文件生成了,但 `config.mjs` 里没加对应条目 —— 文档存在但导航里看不到,等于没发布。

**解法**:每次新增文档,同步改 `.vitepress/config.mjs` 的 `sidebar` 数组。

### 6.3 `NODE_PATH` 没设

跑 `fetch_webpage.js` 时报 `Cannot find module 'playwright'` —— 因为 skill 的 Node 依赖装在 `.claude/skills/dreammaker-doc-gen/scripts/node_modules/`,不在全局也不在仓库根。

**解法**:命令前加 `NODE_PATH=.claude/skills/dreammaker-doc-gen/scripts/node_modules`。

### 6.4 Mongo 连接失败

本地跑 skill 时报连接超时 —— 多半是 `MONGO_URI` 环境变量没设,或者没连上内网。

**解法**:确认 `MONGO_URI` 指向正确的 Mongo 集群(团队内部 wiki 有地址),且当前机器在允许访问的白名单里。

### 6.5 api_open 字段被误改成 true

如果 skill 第五步被误触发,把某个本来不开放的 App 设成了 `api_open: true`,主站开放平台会立刻暴露这个接口。

**解法**:写库动作必须用户明确授权;AI 默认不写库。如果误改了,立刻在 Mongo 里改回 `false` 并通知团队。

---

## 七、和相关文档的关系

- [接入新 AI 能力指南](guide-new-ai-capability.md):讲怎么在 scheduler 仓库接入新 App,是本文的"上游" —— 接完 App 才需要生成文档。
- [Mongo App 配置指南](guide-mongo-app-config.md):详细讲 `dreamworker_apps` 文档结构,本文提到的 `params` / `api_open` / `api_doc_params` 字段都在那篇文档里有展开。
