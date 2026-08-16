每个任务有 5 种状态：queued、running、success、failed、stopped。

代码层面用 Action 编排模式。设计模式是 Template Method 加 Strategy。分三层：Base 层实现公共逻辑，commonAction 层实现 ZSet 队列的入队、出队和抢占，大多数新供应商直接复用这一层就够了。只有工作流差异很大的才需要写专用 action。

编排链路是：BeforeProduce、Produce、Consume、BeforeCall、GenerateTask、AfterCall。

还有一个有意思的设计：Go 的类型断言做能力检测。不同 action 需要不同的能力，比如有的需要 RequestMapper 做参数映射，有的需要 Generator 生成 JobData。与其放在一个大接口里强制空实现，不如用类型断言实现接口隔离原则。