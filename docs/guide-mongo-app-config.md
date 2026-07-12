# DM 小程序商城 Mongo 配置指南（dreammaker-scheduler 仓库）

> 来源：张秋荻 飞书文档《本次沉淀》(2026-07-08)
> 定位：理解小程序"配置即界面"机制，能独立完成新能力的商城登记
> 适用范围：**dreammaker-scheduler** 仓库，涉及 `dreamworker_apps` 表的结构与字段含义

---

## 一、核心概念：配置即界面

DM 主站的小程序页面**不是每个小程序单独写前端代码**，而是**前端读 mongo `dreamworker_apps` 表的 JSON 配置，动态渲染出表单**。

也就是说：你在 mongo 里写好配置 → 前端自动生成对应的 UI（输入框、下拉选择、滑块、文件上传等）。

---

## 二、Mongo 连接信息

| 环境 | URI |
|------|-----|
| 测试 | `mongodb://ocadmtmax163:2rCQ1pMdJV1XsRvyZq_aBy98@7.39.26.241:30000` |
| 生产（只读） | `mongodb://tmax_read_only:_xcLvmgQHoUZdBn00v1@10.217.9.82:20519/tmax?readPreference=secondary` |

数据库：`tmax`，集合：`dreamworker_apps`

### 执行 mongosh 脚本的两种方式

```bash
# 方式 1：命令行直接执行 .js 文件
mongosh "mongodb://ocadmtmax163:2rCQ1pMdJV1XsRvyZq_aBy98@7.39.26.241:30000/tmax?authSource=admin" /path/to/script.js

# 方式 2：先连接，再 load()
mongosh "mongodb://ocadmtmax163:2rCQ1pMdJV1XsRvyZq_aBy98@7.39.26.241:30000/tmax?authSource=admin"
# 进入 shell 后：
load("/path/to/script.js")
```

---

## 三、`dreamworker_apps` 文档结构（完整字段）

以 `volcengine-seed-audio` 为例，一条完整记录的顶层结构：

```javascript
{
  // ===== 基础信息 =====
  name: "volcengine-seed-audio",        // app 唯一标识，也是 API 路径: /api/v1/apps/<name>/run
  display_name: "火山引擎音频生成",       // 前端展示名
  desc: "基于火山引擎 seed-audio-1.0...", // 描述
  cover: "https://dreammaker-test.netease.com/static/image/model_image/...", // 封面图
  status: 1,                            // 1=上架, 0=下架
  env: "test",                          // 环境标识

  // ===== 分类与权限 =====
  deploy_type: "outer-cert",            // 部署类型
  type: "recommend",                    // 分类标签
  creator: "grp.dreammaker",            // 创建者
  group_id: [],                         // 限定可见的用户组（空=全部可见）

  // ===== API 开放配置 =====
  api_open: true,                       // 是否对外开放 API
  api_open_type: "model",               // 开放方式: "model" | "app"
  api_models: ["volcengine-seed-audio"], // 对外暴露的模型名列表

  // ===== 核心：api_info（前端渲染依据）=====
  api_info: {
    option_label: "音频生成能力",
    app_list: { ... },   // 多 sub_app 分组
    app_map: { ... }     // 每个 sub_app 的详细配置（params + output_info）
  }
}
```

---

## 四、`api_info.app_map.<sub_app_name>` 结构

这是前端渲染的核心数据源：

```javascript
{
  sub_app_name: "volcengine-seed-audio",
  show_name: "音频生成（seed-audio-1.0）",
  source: "volc-seed-audio",           // ★ 必须等于 WorkerType 常量值
  need_pay: 1,                         // 是否消耗积分
  model_field: "model",                // 哪个字段用于计费模型标识

  params: [ ... ],                     // ★ 输入表单配置（见下文）
  output_info: [ ... ],                // ★ 输出展示配置
  api_doc_params: [ ... ],             // API 文档用的参数描述
  condition: [],                       // 条件显示规则
  hidden_params: [],                   // 隐藏参数
}
```

### 关键约束

- `source` 的值**必须和** `model/model_worker_scheduler.go` 中对应的 `WorkerType` 常量值**完全一致**，否则任务进错 Redis 队列。

---

## 五、params 数组 — 表单组件类型（_type）

每个 param 对象通过 `_type` 决定前端渲染什么组件：

| _type | 渲染组件 | 典型场景 |
|-------|---------|---------|
| `Str` | 文本输入框 / 下拉选择 | 模型名、提示词、格式选择 |
| `Num` | 数字输入 / 滑块 | 采样率、语速、音量 |
| `Bool` | 开关 | 启用字幕、启用某功能 |
| `Image` | 图片上传 | 参考图片 |
| `FileSet` | 多文件上传 | 参考音频列表 |

### param 对象完整字段

```javascript
{
  _type: "Str",                         // 组件类型
  show_name: "提示词",                   // 前端标签文字
  real_name: "text_prompt",             // ★ 提交时的 JSON key（支持嵌套：audio_config.format）
  essential: 1,                         // 1=必填, 0=可选
  default: "",                          // 默认值
  placeholder: "请输入...",              // 输入框占位文字
  desc: "字段描述",                      // 悬浮说明
  extra: "额外提示文案",                 // 额外信息展示
  hide: false,                         // true=不在前端表单展示（仍会作为固定值提交）

  info: {
    mini_conf: {
      textarea: true,                  // Str 类型渲染为多行文本框
      diy_options: [...],              // 下拉选项列表 [{label, value}]
      show_way: "select",             // 强制显示为下拉选择
    },
    comp_mode: "audio",                // FileSet/File 的媒体类型
    upload_conf: { ext, maxCount, max_size, ... },  // 上传限制
    panel_max: 100,                    // Num 类型的滑块最大值
    panel_min: -50,                    // Num 类型的滑块最小值
    panel_step: 1,                     // 步长
    hidden: true,                      // info 级别的隐藏控制
  },

  resource_type: "input_url_set",      // 资源类型标识（文件上传用）
}
```

### 前端提交时 real_name 的映射规则

`real_name` 支持用 `.` 表示嵌套：

```
real_name: "audio_config.format"  →  提交 JSON: { "audio_config": { "format": "mp3" } }
real_name: "text_prompt"          →  提交 JSON: { "text_prompt": "..." }
```

---

## 六、output_info 数组 — 结果展示

```javascript
output_info: [
  {
    _type: "File",                     // 输出类型
    show_name: "生成音频",              // 展示标签
    real_name: "result",               // 对应 worker 返回的 output key
    info: { comp_mode: "audio" }       // 渲染方式：audio 播放器
  }
]
```

---

## 七、`app_list` — 多 sub_app 分组

当一个小程序有多个能力（如"文生音频" + "音频编辑"），通过 `app_list` 组织前端 tab 切换：

```javascript
app_list: {
  default: "volcengine-seed-audio",    // 默认选中的 sub_app
  items: [
    { label: "音频生成", children: ["volcengine-seed-audio"], auto_open: true },
    // 多能力时加更多 items：
    // { label: "音频编辑", children: ["volcengine-audio-edit"], auto_open: false }
  ]
}
```

---

## 八、静态图片上传

### 上传 API

```
POST https://api-int.dreammaker-test.netease.com/uploader/v1/s3
```

- 请求方式：multipart/form-data，file 字段放文件
- 可选参数：`calculate_hash=true`（用 sha256 前 11 位作文件名，相同文件不重复存储）
- 返回值：`static/image/<group_id>/<hash>.png`

### 拼接完整 URL

```
测试环境: https://dreammaker-test.netease.com/ + static/image/...
生产环境: https://dreammaker.netease.com/ + static/image/...
```

### 为什么 test 和 prod 都能访问同一张图？

**静态资源跨环境共享**——test 和 prod 的 static 服务指向同一个 S3 bucket。上传到 test 的图片，prod 也能直接用。这是刻意的架构设计：图片/视频等大文件没必要每个环境存一份。

### 上传流程（service_file.go）

```
FormFile("file") → DetectFileType → HandleUploadFile(图片取宽高)
→ GenS3Key(hash 或 UUID) → S3Manager.Upload → 返回 "static/" + key
```

---

## 九、完整的商城登记 Checklist

新接入一个 AI 能力，写 mongo 脚本时确认以下内容：

- [ ] `name` 全局唯一，与 API 路径一致
- [ ] `api_info.app_map.<sub_app>.source` 等于 `WorkerType` 常量值
- [ ] `params` 列表覆盖了供应商 API 的所有参数（非必填用 `essential: 0` + `default`）
- [ ] `real_name` 的嵌套层级与 worker 解析逻辑一致
- [ ] `_type` 选择正确（Str/Num/Bool/Image/FileSet）
- [ ] `output_info` 的 `real_name` 与 worker 返回的 output map key 一致
- [ ] `cover` 图片已上传并填了完整 URL
- [ ] `env` 字段与目标环境匹配（test/prod 分别登记）
- [ ] 脚本用 `replaceOne + upsert: true`，确保可重复执行
