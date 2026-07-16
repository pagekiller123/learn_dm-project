# Monet 前端 dm-tapnow 是 React 18 + ReactFlow + Electron

学员追问 Lesson 0001 架构图里 "React" 的证据。查证：前端仓库 <code>current_project/dm-tapnow</code> 是 pnpm monorepo，<code>package.json</code> 明确用了 <code>@types/react ^18.2.66</code> 和 <code>@testing-library/react</code>；<code>apps/</code> 下有 <code>agent / desktop / frontend</code> 三个应用，Desktop 是 Electron 壳。<code>CLAUDE.md</code> Core Systems 明写画布用 ReactFlow。

## Evidence
- <code>dm-tapnow/package.json</code>：<code>"@types/react": "^18.2.66"</code> + <code>"electron"</code> in <code>onlyBuiltDependencies</code>
- <code>dm-tapnow/apps/</code>：<code>agent / desktop / frontend</code>
- <code>dm-tapnow/CLAUDE.md</code> Core Systems 表：<code>ReactFlow → CanvasFlow.tsx</code>
- <code>coding.mdc</code>：Zustand + undoManager + SWR + use-bus 四种状态方案

## Implications
- Lesson 0001 架构图已从 "React" 更新为 "React + ReactFlow + Electron"
- Lesson 0001 新增"前端技术栈速查"小节 + 面试防守话术
- 学员简历上**不该展开讲前端技术**，但要能<strong>定位工作边界</strong>——"我在 Monet Agent 侧，跟前端通过 HTTP + SSE 交互"
- 教师自我提醒（第三次）：<strong>说任何技术栈前必须先查证据</strong>。这次侥幸猜对但 Lesson 0001 原句"React" 就是拍脑袋写的，属于蒙对了本质但过程错误
