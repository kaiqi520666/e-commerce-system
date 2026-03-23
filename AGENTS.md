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

- 技术栈：Vue 3、Vite 7、Vue Router 5、Pinia 3、Tailwind CSS 4、Axios、`lucide-vue-next`。
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
  - `src/router/index.js`：当前已经切换为商城主路由，根路径重定向到 `/notice`，5 个主入口为 `notice`、`category`、`cart`、`orders`、`profile`。
  - 认证页面已从个人中心拆出为独立路由：`/login` 和 `/register`，不挂在商城主导航中。
  - 前端路由权限当前已按页面区分：`/notice`、`/category`、`/goods/:id` 为公开访问；`/cart`、`/orders`、`/profile` 需要登录后访问。
  - 路由守卫当前统一使用 `route.meta.requiresAuth` / `guestOnly` 控制访问，未登录进入受保护页会跳转到 `/login?redirect=<原目标地址>`，登录/注册成功后需要优先回跳原目标页。
  - 商品详情页已接入独立路由：`/goods/:id`，但仍沿用商城主壳和分类页视觉主题。
  - `src/stores/index.js`：全局启用了 `pinia-plugin-persistedstate`，后续审查要特别关注是否存在不必要持久化。
  - `src/stores/user.js` 当前仅持久化 `token` / `refreshToken`，`profile` 改为应用启动时通过 `bootstrapAuth()` 主动拉取恢复，避免使用过期资料缓存。
  - `src/api/index.js`：已封装 axios 实例，`baseURL` 为 `/api`，请求拦截器会从 `localStorage` 读取 `token` 并直接注入 `Authorization` 原始 token，响应拦截器会解包 `cool-admin-midway` 风格的 `{ code, message, data }` 响应。
  - 当前前端 401 失效处理已统一收口在 `src/api/core.js`：接口返回未登录时会清理本地登录态；若当前位于受保护页，则自动跳转登录页并保留 `redirect` 回跳地址。
  - `vite.config.js`：已配置 `@` -> `src` 别名，并通过 `server.proxy` 将 `/api` 代理到 `http://localhost:8001`，请求前缀会被重写掉 `/api`。
- 当前前端已经完成第一阶段商城基础壳：
  - 商城壳布局已内聚到 `src/App.vue`，不再单独维护 `AppShell.vue`
  - 公共导航组件：`src/components/AppNavigation.vue`
  - 公共 UI 组件：`GlassPanel`、`ProductCard`、`CategoryRail`、`SectionHeader`、`EmptyState`、`UiIcon`
  - 已新增可复用页面顶部栏组件 `src/components/PageTopBar.vue`，用于固定在页面顶部的返回 + 标题头部；商品详情页已接入，后续其它独立详情/流程页优先复用。
  - 已新增可复用动态背景组件 `src/components/MatrixBackground.vue`，用于黑客帝国式字母下落氛围层；后续如需同类背景动效优先复用，不要在页面内重复手写字符背景。
  - 全局覆盖组件：`GlobalToast`、`GlobalConfirm`、`GlobalLoading`
  - 5 个页面视图：`src/views/NoticeView.vue`、`CategoryView.vue`、`CartView.vue`、`OrdersView.vue`、`ProfileView.vue`
  - 独立认证页面：`src/views/LoginView.vue`、`src/views/RegisterView.vue`
  - 商品详情页面：`src/views/GoodsDetailView.vue`
  - 全局主题样式位于 `src/assets/main.css`，已落黑蓝科技风、液态玻璃效果、移动端底部导航和 PC 端侧导航的基础样式
  - `UiIcon.vue` 已切换为 `lucide-vue-next` 图标映射层，后续统一复用 Lucide，不再新增手写 SVG 图标
  - 首页和导航视觉已升级为更强层次的黑蓝科技风：增加轨道背景、发光层、数据面板、信息流卡片和更明显的层级分区，不再维持单纯的“玻璃卡片平铺”
  - `App.vue` 已按路由区分页面背景主题：公告、分类、购物车、订单、我的虽然仍属于同一套黑蓝科技风，但各自有不同的背景色氛围，不要再把所有页面压回完全一致的底色
  - 移动端底部导航要保持独立的“系统导航底座”视觉，颜色、描边、阴影和激活态需明显区别于页面内容卡片，避免与正文区域混成同一层
  - 当前页面密度已经主动收紧：卡片圆角、容器外边距、区块 gap 和大面积留白都做了压缩，后续不要再回到“大圆角 + 大留白 + 很空”的展示型风格
  - 分类页现在必须按后端返回的树状分类结构渲染，使用折叠面板/树形导航展示父子层级，不要再把树拍平成普通按钮列表
  - 分类页交互已区分端形态：PC 端保留左侧树状折叠分类，移动端改为“横向顶级分类 + 当前顶级分类叶子分类快捷入口 + 底部分类弹层 + 商品区优先显示”，避免顶级分类过多导致用户长距离下滑后才看到商品，同时保证切换顶级分类后能直接看到更细分类入口
  - 顶级分类如果有 `thumb`，当前会优先显示在分类页的顶级分类入口和顶级分类识别区中；PC 树状导航的顶级节点也会显示缩略图，帮助用户更快识别大类
- 当前 `src/api` 已按业务模块拆分，结构如下：
  - `src/api/core.js`：axios 实例与请求/响应拦截器核心。
  - `src/api/index.js`：统一导出入口。
  - `src/api/modules/catalog/category.api.js`：分类树接口。
  - `src/api/modules/catalog/goods.api.js`：商品列表/详情接口。
  - `src/api/modules/catalog/index.js`：`catalogApi` 聚合导出。
  - `src/api/modules/user/auth.api.js`：用户认证相关接口。
  - `src/api/modules/user/info.api.js`：用户信息相关接口。
- 当前 api 命名和职责约定：
  - `catalogApi.categoryList()` -> `POST /open/catalog/category/list`
  - `catalogApi.goodsList(data)` -> `POST /open/catalog/goods/list`
  - `catalogApi.goodsInfo(id)` -> `POST /open/catalog/goods/info`
  - `authApi.login(data)` -> `POST /open/user/auth/login`
  - `authApi.register(data)` -> `POST /open/user/auth/register`
  - `infoApi.person()` -> `POST /app/user/info/person`
  - `infoApi.updatePerson(data)` -> `POST /app/user/info/updatePerson`
- 当前 `src/stores` 已按职责拆分：
  - `ui.js`：当前导航态与页面路由同步
  - `catalog.js`：分类树、推荐商品、分类商品列表、loading
  - `user.js`：token、refreshToken、profile、登录/注册/拉取资料
  - `cart.js`：本地购物车状态，当前不再预置 mock 数据；由分类页/商品详情页真实写入，支持数量范围、参数组合区分、金额汇总与持久化
  - `overlay.js`：全局 toast / confirm / loading 状态，不持久化
- 前端后续开发/审查时的额外注意点：
  - 所有新接口调用优先复用 `src/api/index.js`，不要重复创建 axios 实例。
  - 新增接口文件时，优先放入 `src/api/modules/<业务域>`，并在 `src/api/index.js` 统一导出，避免页面层直接散落引用深层文件。
  - `modules` 内文件命名延续 `*.api.js` 约定，按业务域而不是按页面拆分。
  - 图标库统一使用 `lucide-vue-next`；除非有明确品牌图标或特殊造型需求，不要继续写自定义路径 SVG。
  - 商品与分类缩略图当前应统一通过可复用的图片兜底组件处理，不仅要处理 `thumb` 为空，也要处理图片 URL 加载失败（404/403/超时）后的回退展示，避免出现浏览器破图图标。
  - 新增的登录页、注册页、全局确认框、全局提示、全局加载层也统一走 `UiIcon.vue` 的 Lucide 映射，不要在这些新组件里再单独引入一套图标实现。
  - 全局提示、确认框、加载态统一走根组件 `GlobalToast`、`GlobalConfirm`、`GlobalLoading` 和 `overlay store`，不要在页面里重复造弹层。
  - 当前已接入全局交互层的场景包括：登录、注册、个人中心退出登录、购物车数量增减和结算占位提示；后续新增关键交互时优先复用这套全局反馈。
  - 商品详情页当前已接入 `catalogApi.goodsInfo(id)`，并展示 `thumb`、`name`、`price`、`label`、`isClose`、`stock`、`minOrderNum`、`maxOrderNum`、`paramsTemplate`、`detail`、`title`、`content` 等真实字段；富文本详情经过前端基础清洗后再渲染。
  - `paramsTemplate` 当前已升级为真实下单表单渲染，而不是纯说明卡：例如 `type = 61` 需要渲染成 `type="url"` 的必填输入框，字段标题取 `name`，`placeholder` 取 `description`，并结合 `verify.min / verify.max` 做输入校验；`max = -1` 视为不限。
  - 商品详情页里带选项的参数（例如 `type = 8`）当前不要再用原生 `select`，统一改成点击后从底部弹出的 Sheet 选择器，保证移动端交互一致。
  - 商品详情页的参数 Sheet 打开时，必须锁住 `html/body` 的背景滚动，并让 Sheet 自己成为独立滚动容器；否则在浏览器移动端模拟下使用滚轮或中键滚动时，会把外层页面一起带着滚动。
  - 商品详情页需要单独渲染“下单数量”输入框，范围取商品的 `minOrderNum / maxOrderNum`，加入购物车前必须先校验数量。
  - 商品详情页当前按“少而准”的信息结构展示：优先保留主图、标签、商品名、价格、购买数量范围、下单表单、购买须知、商品详情，不要再堆库存、商品类型、单位这类弱信息。
  - 商品详情页的主操作固定为两个按钮：`立即购买` 与 `加入购物车`；在当前前端阶段，`立即购买` 走“校验通过后加入购物车并跳转购物车页”的流程。
  - 商品详情页的默认设计心智是“下单流程页”，不是普通商品介绍页；推荐结构为：顶部标题栏、注意事项、商品摘要、普通/批量下单切换、参数表单、数量步进器、底部固定结算栏，并在这个流程骨架里继续沿用项目自己的黑蓝科技风。
  - 商品详情页底部 `Total` 当前按业务要求最多保留 7 位小数，但尾随 `0` 不显示；例如 `0.0192000` 显示为 `0.0192`。
  - 商品详情页结算区当前采用响应式双模式：移动端使用底部固定操作栏，PC 端改为页面内 `sticky` 结算区，不再用右下角固定悬浮条。
  - 商品详情页在移动端不再显示商城底部导航；外层壳与详情页自身的底部留白不能叠加，避免页面底部出现过大的空白区。
  - 商品详情页移动端的内容容器底部留白必须按固定结算栏的真实高度预留，宁可略多也不要压到最后一个下单面板，否则滚动到底会发生内容与结算栏重叠。
  - 当前视觉方向不是极简卡片堆叠，而是“高端稳重的黑蓝科技风 + 克制液态玻璃 + 更强的信息层次”；后续改页面时要继续保持这种节奏。
  - 分类页/商品列表中的 `ProductCard` 不要再用占位文案；当前已按后端真实字段展示 `thumb`、`name`、`price`、`label`、`isClose`、`minOrderNum`、`maxOrderNum` 等有效信息，其中 `isClose=1` 表示暂停购买，`2` 表示正常购买。
  - 分类页移动端当前已改成更高操作效率的结构：顶部搜索框、横向顶级分类、左侧子分类栏、右侧紧凑商品列表；不再使用之前“顶部横滑分类 + 下方普通商品网格”的弱操作流。
  - 分类页移动端已恢复“底部弹出完整树状分类”的能力，`全部分类` 入口当前放在搜索区右侧，作为搜索旁边的次级操作。
  - 分类页商品数据流当前已切回 `catalogApi.goodsPage(data)` -> `POST /open/catalog/goods/page`，后端返回结构为 `{ list, pagination }`；`catalog store` 负责维护当前页、页大小、总数和 `hasMoreGoods`。
  - 分类页移动端商品列表当前支持本地关键词过滤、滚动到底自动加载更多，并提供“立即购买”与快捷加入购物车入口；PC 端继续保留左侧树状分类与网格商品卡，并额外提供“加载更多”按钮。
  - 分类页移动端左侧子分类栏当前采用更紧凑的窄栏设计：适当放宽栏宽、减小字号和内边距、分类名单行省略，优先减少换行和上下滚动。
  - 分类页移动端商品项当前默认采用“左图 / 中间信息 / 右侧操作”的紧凑横排布局，价格紧跟标题区，不再使用大留白纵向卡片。
  - 分类页中 `isClose = 1` 的商品当前统一视为不可点击：移动端列表里的“立即购买”和快捷加入购物车都必须禁用，避免继续进入详情或下单流程。
  - 分类页移动端左侧分类栏和右侧商品列表区当前都应是独立纵向滚动区，不要再让商品区只能跟随整页滚动。
  - 为避免移动端分类页出现“整页还能轻微上下拖动”，`App.vue` 的外层壳在 `route.name === 'category'` 时应切为 `100svh + overflow-hidden`，滚动只留给分类页内部区域。
  - 如果前端需要保留局部横向滚动能力（例如分类页移动端顶级分类条），不要在 `body`、`#app`、`.app-bg` 或页面根容器上加 `overflow-x: hidden/clip` 去截断；优先只在真实超宽元素上做收口。
  - 全站图片兜底当前统一使用 `public/placeholder.svg`，调用路径固定为 `/placeholder.svg`；`SafeImage.vue` 需要优先回退到这张黑蓝科技风 SVG 占位图，只有占位图本身也失败时才退回文字或图标兜底。
  - `cart.js` 现已支持通过 `addItem(payload)` 从商品详情页按指定数量加入购物车，并可附带参数表单值 `params`。
  - `ProfileView.vue` 现在专注承接资料、权益和会员入口；登录/注册表单不要再塞回个人中心，应继续维护为独立认证页。
  - 商品价格展示不要默认补固定两位小数；后端价格可能带最多 7 位小数，前端展示时应去掉无意义的尾随 `0`，按真实有效小数位显示。
  - 这个仓库的 `app/user` 鉴权中间件当前直接读取 `Authorization` 原始 token，不接受 `Bearer <token>` 格式；前端不要改回 Bearer。
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
- 当前 `catalog` 模块对外开放的商品/分类能力已包含：
  - `POST /open/catalog/category/list`：分类树
  - `POST /open/catalog/goods/list`：按分类返回商品列表；若传入父分类，会自动下钻到其所有叶子分类后汇总商品
  - `POST /open/catalog/goods/page`：保留分页商品查询能力
  - `POST /open/catalog/goods/info`：商品详情

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
