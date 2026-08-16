Scheduler 整体分为五层，每层有明确的职责边界。

最上面是外部请求层——前端主站、Monet 客户端、内部工具。它们只做一件事：组装 HTTP 请求、携带鉴权 Header。

第二层是业务服务层——api-outer 和 app-gateway。这一层负责参数校验、鉴权、参数映射和入队。注意，它不能直接调用 Worker，也不做 GPU 调度。

第三层是基础设施层——worker-scheduler。它从 Redis 拉队列、分配任务、回写结果。它不关心具体的推理逻辑。

第四层是 Worker 执行层——worker-sidecar 加上各类 Worker。它们接收任务、执行推理、上报结果。注意，Worker 不能反向依赖 app-gateway。

最底层是外部供应商层——ComfyUI、SD-WebUI、火山、Kling、Runway 这些。它们做实际的 AI 推理。

核心原则就一句话：每层只做自己的事，不越界。