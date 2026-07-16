# Checkpointer 是"存储单例"，不是"记忆共享"

学员追问 Lesson 0001 里"不同用户/会话共享 Agent 长期记忆"这句话，纠正为：**AsyncSqliteSaver 是进程级单例，但记忆按 session_id (LangGraph thread_id) 隔离**。共享的是存储组件本身（避免重复建 SQLite 连接），不是记忆内容。

这个误解在讲 LangGraph checkpointer 时很典型——单例的组件 ≠ 共享的数据。后续讲 Scheduler 侧的共享资源（Redis 连接池、etcd client 等）时，同样区分"组件共享"vs"数据隔离"。

## Evidence
- 用户主动质疑课程原句 → 说明有独立判断力，不是被动接受知识
- 引用 <code>container.py:101</code> 单例代码 + <code>routes.py:188 adelete_thread(session_id)</code> 完成了自我验证

## Implications
- 面试若被问"为什么用单例 checkpointer"，标准答案是"性能与资源优化，不是记忆共享"
- 后续讲 Scheduler 的 <code>etcd worker registry</code>、Redis queue 时，也应显式区分"共享连接"vs"隔离数据"
