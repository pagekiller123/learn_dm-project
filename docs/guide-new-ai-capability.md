# DM 接入新 AI 能力开发指南（dreammaker-scheduler 仓库）

> 来源：张秋荻《工作和踩坑记录：DM API 接入 火山语音识别模型》(2026-07-02)
> 定位：面向新人，AI 辅助开发时的背景知识补充
> 适用范围：**dreammaker-scheduler** 仓库（Go + dmfr），涉及 worker-sidecar、app-gateway、AIGW 客户端等模块

---

## 一、一次 AI 能力调用的完整链路

以"用户调 火山ASR 语音识别"为例，请求经过以下 15 步：

```
用户(DM主站/Apifox)
  │ POST /api/v1/apps/<app_name>/run
  ▼
api-outer          验 JWT → 解析身份 → 反代
  │
  ▼
app-gateway        查 mongo dreamworker_apps 拿 app 配置
                   校验 params → 生成 task_id → 写 record(status=queued)
                   推 Redis 队列: apps_queue::<source>::<cluster>::<env>
                   同步返回 {task_id} 给用户
  │
  ▼
worker-scheduler   监听 etcd 心跳 → 唤起匹配的 worker pod → BRPOP 任务
  │
  ▼
worker-sidecar     拿到 jobData → switch(subAppName) 分发
                   解析 params → s3→FP URL 转换 → 拿用户 token
                   调 AIGW GenTask → 轮询 QueryTask → 拿结果
  │
  ▼
AIGW               公司级 AI 网关，计费/限流/鉴权 → 转发给火山
  │
  ▼
火山 ASR           异步处理 → 返回识别结果

结果回传：
worker → worker-scheduler(写 mongo record status=succeeded + output)
用户轮询 → GET /api/v1/apps/<app_name>/status?task_id=xxx → app-gateway 读 mongo → 返回
```

### 涉及的核心服务

| 服务 | 职责 |
|------|------|
| api-outer | DM 对外 HTTP 入口，JWT 鉴权 + 身份解析 + 反代 |
| app-gateway | APP 调度核心，查 mongo 配置、入库 record、写 Redis 队列 |
| worker-scheduler | Leader 选举 + worker 心跳 + 任务派发 + 结果回写 |
| worker-sidecar | 具体执行任务的 pod，调外部 AI 服务 |
| AIGW (aigw-int.netease.com) | 公司级 AI 网关（不在 DM 仓库），统一出口 |
| Mongo | 存 dreamworker_apps (app配置) 和 dreamworker_apps_record (任务记录) |
| Redis | 任务队列 + 进度缓存 |
| K8s + api-kube | 容器编排，拉起/销毁 worker pod |
| ncr (ncr.nie.netease.com) | 网易私有 Docker 镜像仓库 |

---

## 二、接入新能力需要写的代码产物

| 层次 | 文件位置 | 作用 |
|------|---------|------|
| AIGW 客户端 | `api/external/aigw/<供应商>_<能力>.go` | 定义 URI + 请求/响应 struct + GenTask/QueryTask |
| Worker 实现 | `app/worker-sidecar/sidecar/<供应商_能力域>/worker_<能力>.go` | 解析 params → 调 AIGW → 维护进度 → 解析结果 |
| Worker 注册 | 4 处修改（见下文） | 让系统认识新的 sub_app |
| APP 商城登记 | `scripts/apps_insert_<能力名>.md` (mongosh 脚本) | 往 dreamworker_apps 表插配置 |
| 规范文档 | `openspec/changes/<change-name>/` | proposal / design / tasks / spec |

### Worker 注册需要改的 4 个文件

1. **`worker.go`** — Run() 和 Progress() 的 switch 各加一个 case
2. **`api/external/aigw/common.go`** — GetTaskAPI() 工厂函数加新 case
3. **`model/model_worker_scheduler.go`** — 加 WorkerType 常量（如 `WorkerTypeVolcAsrFileStandard = "volc-asr-file"`）
4. **`app/worker-sidecar/service/service.go`** — newWorker() 工厂 switch 加 case

---

## 三、Worker 内部执行模型

```
Run(jobData)                    ← 主入口，阻塞
  │ switch(subAppName) → runXxx()
  │   解析 params → 调 AIGW GenTask
  │   <-finishedChan  ⏳ 阻塞等待
  │
  │   ═══ 外部定时器每 3 秒调 Progress() ═══
  │
Progress()                      ← 轮询入口
  │ switch(subAppName) → progressXxx()
  │   调 AIGW QueryTask
  │   succeeded/failed → finish(result) → finishedChan ← result
  │
  └─ finishedChan 收到结果 → Run() 解除阻塞 → return output
```

关键设计：
- `finishedChan` 模式：主流程阻塞，轮询协程负责通知完成
- `fakeProgress`：向 worker-scheduler 上报假进度（外部异步任务无法实时获取真实进度）
- 同一供应商的多个能力共用一个 Worker struct，通过 `subAppName` 分发

---

## 四、编译打包测试流程

### 4.1 编译 + 打镜像 + 推 ncr

```bash
./local_build.sh worker-sidecar
```

流程：`goimports 格式化 → 交叉编译(GOOS=linux GOARCH=amd64) → 生成 Dockerfile → docker build → docker push ncr`

> 公司禁用 Docker Desktop，本地用 Rancher Desktop 替代。

### 4.2 mongosh 商城登记

连接 mongo test 环境 → 执行 scripts/ 下的 upsert 脚本 → 验证 dreamworker_apps 有记录

### 4.3 端到端测试 (Apifox)

1. **调 api-kube 拉 pod**：POST 创建 worker → GET 确认 Running
2. **调 api-outer**：
   - POST `https://api-int.dreammaker-test.netease.com/api/v1/apps/<app_name>/run`
   - GET `https://api-int.dreammaker-test.netease.com/api/v1/apps/<app_name>/status?task_id=xxx`
3. **验证 mongo**：在 dreamworker_apps_record 中按 task_id 查记录，status 应为 succeeded

---

## 五、踩坑清单（接入新能力必读）

| # | 坑 | 正确做法 |
|---|---|---------|
| 1 | Demo 的 curl 是直接调 AIGW 的，不是端到端路径 | 端到端入口是 `api-int.dreammaker-test.netease.com`，不是 `aigw-int.netease.com` |
| 2 | 内网 `static/` URL 供应商无法访问 | worker 里必须做 s3→FP 公网 URL 转换 (`ensureXxxPublicURL`) |
| 3 | WorkerType 常量和 mongo sub_apps.source 不一致 | 两者**必须完全一致**，否则任务进错队列，永远 pending 或被其他 pod 抢走 |
| 4 | struct 只定义了必填字段 | 供应商文档里有的字段都应定义，用 `omitempty` 控制不传 |
| 5 | 测试只跑了 Happy Path | 至少覆盖：必填缺失、无效 URL、错误 sub_app_name、默认值生效、功能开关对比 |
| 6 | 测试方法生搬 AI 生成 | 自己理解链路后设计边界测试用例 |

---

## 六、常见 HTTP Headers（DM 请求）

| Header | 作用 |
|--------|------|
| X-Access-Token | 用户在 AIGW 的鉴权 token |
| X-Aigw-APP | AIGW 应用标识码 |
| X-Auth-User | api-outer → app-gateway 传递的用户身份 |
| X-Group-ID | 用户所属的计费组 ID |

---

## 七、Go 语法速查（项目中高频出现）

仅列项目中最常见的模式，完整 Go 教程自行查阅：

- **package + import**：代码按包隔离，`import` 分标准库/第三方/别名三种
- **struct + json tag**：业务数据载体，`json:"xxx"` 控制序列化字段名，`omitempty` 控制空值不输出
- **方法绑定**：`func (w *Worker) Run(...)` — 操作原对象不拷贝
- **泛型**：`AigwTaskResp[T]` — 外层通用 envelope，T 为业务结果 struct
- **interface**：只声明方法签名，struct 隐式实现（实现了方法就算实现了接口）
- **多返回**：`(result, err)` 成对返回是 Go 惯例
- **const**：编译期固定值，用于 URI / WorkerType 等不变配置

---

## 八、关键文件索引（dreammaker-scheduler 仓库）

| 路径 | 内容 |
|------|------|
| `api/external/aigw/` | 所有 AIGW 客户端（每个供应商能力一个文件）|
| `api/external/aigw/common.go` | TaskAPI 接口 + 工厂函数 + 通用 HTTP 模板 |
| `app/worker-sidecar/sidecar/` | 按供应商/能力域分包的 worker 实现 |
| `app/worker-sidecar/service/service.go` | worker-sidecar 服务入口，newWorker() 工厂 |
| `model/model_worker_scheduler.go` | WorkerType 常量 + 通信协议 struct |
| `scripts/` | mongosh 商城登记脚本 |
| `local_build.sh` | 编译 + 打镜像 + 推 ncr 脚本 |
