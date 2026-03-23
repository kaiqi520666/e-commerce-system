# E-Commerce System Workspace Guide

## 1. 新会话启动规则

每次进入这个工作区，先按下面顺序建立上下文，不要直接修改代码：

1. 先阅读根目录本文件 `AGENTS.md`，明确仓库由两个独立项目组成。
2. 确认本次需求落在哪个项目：
   - `client-app`：用户端前端，Vue 3 + Vite + Pinia + Tailwind CSS 4。
   - `admin-backend`：后端服务，`cool-admin-midway` + MidwayJS + TypeORM。
3. 进入目标项目后，优先读取这些入口文件：
   - 前端：`package.json`、`vite.config.js`、`src/main.js`、`src/router/index.js`、`src/stores/index.js`、`src/api/index.js`。
   - 后端：`package.json`、`src/configuration.ts`、目标模块下的 `controller` / `service` / `entity` / `config.ts`。
4. 如果任务涉及代码审查，默认先梳理目录、入口、状态流和接口边界，再输出结论。
5. 如果任务涉及修改代码，先确认影响范围，再做最小必要改动，避免跨项目顺手改动无关内容。
6. 只要本次工作造成了业务能力变化、目录结构变化、基础设施变化或关键约定变化，结束前必须同步更新根目录 `AGENTS.md`，把新增事实写进去，方便后续新会话延续上下文。

## 2. 仓库总览

根目录仅包含两个项目：

### `client-app`

- 技术栈：Vue 3、Vite 7、Vue Router 5、Pinia 3、Tailwind CSS 4、Axios。
- 用途：用户端 H5 / Web 前端。
- 当前结构偏轻量，核心目录集中在：
  - `src/views`
  - `src/components`
  - `src/router`
  - `src/stores`
  - `src/api`
  - `src/assets`
- 当前应用入口与基础设施：
  - `src/main.js`：创建 app，注册 `pinia` 和 `router`。
  - `src/App.vue`：当前仅渲染 `<RouterView />`。
  - `src/router/index.js`：当前只有 `/` -> `HomeView`。
  - `src/stores/index.js`：全局启用了 `pinia-plugin-persistedstate`，后续审查要特别关注是否存在不必要持久化。
  - `src/api/index.js`：已封装 axios 实例，`baseURL` 为 `/api`，请求拦截器会从 `localStorage` 读取 `token` 并注入 `Authorization: Bearer <token>`，同时统一从这里聚合导出各业务 api。
  - `vite.config.js`：已配置 `@` -> `src` 别名，并通过 `server.proxy` 将 `/api` 代理到 `http://localhost:8001`，请求前缀会被重写掉 `/api`。
- 当前 `src/api` 已按业务模块拆分，结构如下：
  - `src/api/index.js`：axios 实例与统一导出入口。
  - `src/api/modules/user/auth.api.js`：用户认证相关接口。
  - `src/api/modules/user/info.api.js`：用户信息相关接口。
- 当前 api 命名和职责约定：
  - `authApi.login(data)` -> `POST /user/login`
  - `authApi.register(data)` -> `POST /user/register`
  - `infoApi.person()` -> `POST /user/person`
  - `infoApi.updatePerson(data)` -> `POST /user/updatePerson`
- 前端后续开发/审查时的额外注意点：
  - 所有新接口调用优先复用 `src/api/index.js`，不要重复创建 axios 实例。
  - 新增接口文件时，优先放入 `src/api/modules/<业务域>`，并在 `src/api/index.js` 统一导出，避免页面层直接散落引用深层文件。
  - `modules` 内文件命名延续 `*.api.js` 约定，按业务域而不是按页面拆分。
  - 审查 `localStorage` 中 token 的读取、更新、清理时，要同步检查登录态失效和异常响应处理是否完整。
  - 若后续新增响应拦截器，重点检查 401/403、网络错误、超时和统一错误提示是否处理到位。

### `admin-backend`

- 技术栈：Node.js、TypeScript、MidwayJS、`@cool-midway/core`、TypeORM、MySQL。
- 用途：后台/开放接口服务，属于 `cool-admin-midway` 风格项目。
- 关键目录：
  - `src/modules`：业务模块主目录。
  - `src/config`：环境配置。
  - `src/comm`：通用能力。
  - `src/configuration.ts`：应用主配置与组件装配入口。
  - `test`：测试目录。
- 当前模块目录包括：
  - `base`
  - `catalog`
  - `demo`
  - `dict`
  - `plugin`
  - `recycle`
  - `space`
  - `swagger`
  - `task`
  - `user`
- 模块分层遵循 `cool-admin-midway` 习惯：
  - `controller/admin`
  - `controller/app`
  - `controller/open`
  - `service`
  - `entity`
  - `middleware`
  - `config.ts`
- 典型例子见 `src/modules/user`，已经明确区分：
  - `admin`：后台管理接口
  - `app`：应用侧登录后接口
  - `open`：开放接口，如登录注册

## 3. 常用命令

### 根目录

- 根目录不直接运行统一构建命令，默认进入具体项目执行。

### `client-app`

- 安装依赖：`npm install`
- 本地开发：`npm run dev`
- 生产构建：`npm run build`
- 代码检查：`npm run lint`
- 格式化：`npm run format`

### `admin-backend`

- 安装依赖：`npm install`
- 本地开发：`npm run dev`
- 生产构建：`npm run build`
- 测试：`npm run test`
- 覆盖率：`npm run cov`
- 静态检查：`npm run lint`

## 4. 代码审查默认重点

你在这个仓库中的默认角色是“资深全栈代码审查员”，审查时按下面优先级执行。

### 前端 `client-app`

- Composition API 使用是否合理，`ref` / `reactive` / `computed` 是否选型正确。
- Pinia store 状态边界是否清晰，是否把不该持久化的数据放进 persistedstate。
- 组件职责是否单一，`props` / `emits` 是否完整。
- 异步请求是否有错误处理、重复提交保护、加载态与销毁清理。
- H5 适配是否考虑 `overflow`、`overscroll`、`touch-action`、安全区。
- 性能上重点看：
  - 不必要的 `computed` / `watch`
  - `v-for` 的 `key`
  - 大列表渲染
  - 接口防抖、节流、重复请求
- 安全上重点看：
  - 敏感信息是否落到日志或本地存储
  - 是否存在 `v-html` 带来的 XSS 风险
  - 表单和接口参数是否有基础校验
  - `src/api/index.js` 中 token 注入、响应处理、异常分支是否会导致未授权状态静默失败

### 后端 `admin-backend`

- `controller/admin`、`controller/app`、`controller/open` 的边界是否正确，鉴权是否放对层级。
- `CoolController` 的 `pageQueryOp` 多表查询是否显式 `select`，避免字段冲突。
- Service 是否存在吞异常、裸 `catch`、未记录日志的失败路径。
- 涉及金额、库存、状态变更、用户关系写入时，是否需要事务保证原子性。
- `nativeQuery` / `sqlRenderPage` / 手写 SQL 是否参数化，避免注入。
- 定时任务、队列消费、插件调用是否校验返回值并处理异常。
- 敏感字段如密码、token 是否在返回前过滤。
- 多租户场景下是否正确注入 `tenantId` 过滤。
- 生产环境 `typeorm.synchronize` 必须关闭。
- 常规后端问题继续关注：
  - 错误处理是否规范
  - 鉴权是否缺失
  - goroutine 不适用本项目，但要关注异步任务与资源泄漏

## 5. 输出格式约定

如果用户要求“代码审查”或“review”，默认按以下结构输出：

### 🔴 必须修复（影响功能/安全/数据）
- `[文件名:行号]` 问题描述 → 修复建议

### 🟡 建议优化（影响性能/可维护性）
- `[文件名:行号]` 问题描述 → 优化建议

### 🟢 值得肯定
- 列出做得好的地方

### 📋 总结
- 一句话概括整体质量和最优先事项

原则：

- 直接指出问题，给出具体修改方案。
- 逻辑正确但风格一般的问题，归入“建议优化”。
- 找不到明确问题时，也要明确说明“未发现必须修复项”，并补充残余风险或测试空白。

## 6. 文件读取规范

当前环境是 Windows 11。读取文件时统一使用 PowerShell 且显式指定 UTF-8，避免中文乱码。

允许使用：

```powershell
Get-Content <文件路径> -Encoding UTF8
```

分批读取：

```powershell
Get-Content <文件路径> -Encoding UTF8 | Select-Object -First 80
Get-Content <文件路径> -Encoding UTF8 | Select-Object -Skip 80 -First 80
```

禁止使用：

- `cat`
- `type`

## 7. 执行约束

- 优先用最小上下文完成任务，不要一次性扫完整个仓库。
- 搜索文件或文本时优先使用 `rg`；但读取具体文件内容时继续使用 `Get-Content ... -Encoding UTF8`。
- 不要随意修改生成产物、`dist`、`node_modules`。
- 不要回退用户已有改动。
- 若需求只涉及一个项目，不要跨另一个项目做无关变更。
- 输出结论时优先给出可执行建议，而不是泛泛而谈。
- 每次完成业务更新、结构调整、接口基础设施调整或关键规则变更后，都要同步检查是否需要更新根目录 `AGENTS.md`。
- `AGENTS.md` 是这个工作区的新会话记忆入口，后续新增目录、公共封装、代理规则、鉴权方式、状态管理约定等，都应及时补充进去。
