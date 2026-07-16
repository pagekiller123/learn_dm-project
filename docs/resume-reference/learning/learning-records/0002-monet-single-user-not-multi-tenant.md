# Monet 是单机单用户场景，不是多用户共享 Agent 进程

学员发现 Lesson 0001 里前后矛盾："多个用户共享同一 Agent 进程" vs "一台机器一个进程的单用户场景"。查证 <code>config.py:20</code> 中 <code>host = "127.0.0.1"</code> 后确认后者才对——**Monet 只监听本地回环地址，跟客户端打包为桌面软件，本来就是单机单用户**。

## Why matters
- 这解释了 Monet 侧不需要考虑：多租户隔离、跨用户限流、水平扩展、分布式 checkpointer 存储等云端多用户场景的问题
- 但**同一用户会在同一进程内发起多次请求**，请求级 model 的真正原因是：AIGW token 刷新、前端切模型、每次请求要新的 contextvar 上下文

## Evidence
- <code>src/monet/config.py:20</code>：<code>host: str = "127.0.0.1"</code>
- <code>CLAUDE.md</code> 明写"运行在用户客户端，与客户端项目打包为桌面软件"
- <code>routes.py:293-300</code>：每次 <code>/chat</code> 从 request 里提 auth → build headers → create_model → create_agent

## Implications
- 面试若被问 "Monet 高并发怎么设计"，先澄清 **单机单用户** 的部署形态，绕开无关的多租户问题
- Lesson 0001 相关表述已更正；后续讲 Scheduler 时要区分开——Scheduler 才是云端多租户 / 多用户 / 分布式的场景
- 我（作为教师）已经两次在同一节课上给出误导性表述（checkpointer 记忆共享 → 多用户共享 Agent 进程），提示教学质量控制不够——后续新 lesson 生成前先自查"这个说法是不是我脑补的、有没有代码证据"
