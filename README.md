# 留白

一款旅行足迹记录工具。在中国地图上点亮去过的城市，为每个城市下的景点上传照片打卡，一键生成精美朋友圈海报。旁边的 AI 助手随时介绍当前城市附近有什么好玩的。

**前后端分离的多用户应用**：React 前端 + Spring Boot 后端 + MySQL，支持注册登录、数据云端存储、管理员后台。

---

## 功能

- **足迹地图** — 中国地图两级下钻（全国 → 省份），去过的城市/省份高亮显示
- **城市标记** — 支持旅游 / 居住 / 出差三种到访类型，支持批量标记多个城市，支持多次到访
- **打卡记录** — 为每个城市添加景点、美食、住宿等打卡点，附文字记录
- **照片管理** — 上传照片自动压缩（≤500KB），读取 EXIF 拍摄日期，支持全屏查看
- **相册视图** — 汇聚所有城市照片，按城市过滤，按拍摄时间倒序排列
- **时间轴** — 按到访时间倒序回顾所有旅行记录，按年月分组展示
- **行程管理** — 创建多城市组合行程，记录出行安排
- **统计分析** — ECharts 图表深度分析，展示覆盖率、出行里程等旅行数据
- **AI 旅行顾问** — 接入 Claude API，一键获取当前城市景点推荐、美食攻略、出行建议
- **朋友圈海报** — 3 种模板（地图成就 / 照片墙 / 年度总结），一键导出 PNG
- **视频导出** — 生成幻灯片式旅行回忆视频
- **数据备份** — 导出 `.footprint` 文件，随时导入恢复
- **账号系统** — 注册 / 登录，每个用户的数据互相隔离
- **管理后台** — 管理员可查看系统统计、管理用户（增删改、重置密码、启用/禁用），含分页与搜索

---

## 技术栈

| 层级       | 技术                                        |
| -------- | ----------------------------------------- |
| 前端框架   | React 19 + TypeScript + Vite              |
| 地图       | ECharts + 阿里 DataV GeoJSON               |
| 样式       | Tailwind CSS v3                           |
| 后端框架   | Spring Boot 3 (Java 17) + Spring Security |
| 鉴权       | JWT (jjwt)                                |
| 数据库     | MySQL 8 + Spring Data JPA                 |
| AI 接口    | Anthropic Claude API                      |

---

## 快速开始

### 1. 后端（Spring Boot + MySQL）

需要本地或远程的 MySQL 8。后端启动时会自动建表，并创建默认管理员账号。

```bash
cd BackEnd

# 通过环境变量配置（也可直接改 application.yaml 的默认值）
export DB_URL="jdbc:mysql://localhost:3306/liubai?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true"
export DB_USERNAME=root
export DB_PASSWORD=你的密码
export JWT_SECRET=至少32字节的随机字符串
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=设置一个安全的管理员密码
export APP_CORS_ALLOWED_ORIGINS=http://localhost:5173

./mvnw spring-boot:run
# → http://localhost:8080
```

**默认管理员**：首次启动按 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 创建（默认 `admin` / `admin123`，请务必在生产环境修改）。

### 2. 前端（React + Vite）

```bash
cd FrontEnd
npm install
npm run dev
# → http://localhost:5173
```

开发服务器已把 `/api` 代理到 `http://localhost:8080`（见 `vite.config.ts`）。

构建生产包：

```bash
npm run build
```

> **AI 功能配置**：登录后点击右上角「设置」，填入 Claude API Key（`sk-ant-api03-...`）即可使用 AI 城市助手。Key 仅保存在本地浏览器中，不会上传。

---

## 配置项（环境变量）

| 变量                       | 说明                          | 默认值（开发用）          |
| ------------------------ | --------------------------- | ----------------- |
| `DB_URL`                 | MySQL JDBC 连接串              | 本地 `liubai` 库     |
| `DB_USERNAME`            | 数据库用户名                      | `root`            |
| `DB_PASSWORD`            | 数据库密码                       | `123456`          |
| `JWT_SECRET`             | JWT 签名密钥，**生产必须覆盖**，≥32 字节 | 仅供开发的占位密钥         |
| `JWT_EXPIRATION`         | token 有效期（毫秒）               | `86400000`（1 天）   |
| `ADMIN_USERNAME`         | 首次启动创建的管理员用户名               | `admin`           |
| `ADMIN_PASSWORD`         | 首次启动创建的管理员密码                | `admin123`        |
| `APP_CORS_ALLOWED_ORIGINS` | 允许的前端来源，逗号分隔               | `http://localhost:5173,http://localhost:5174` |
| `JPA_SHOW_SQL`           | 是否打印 SQL                    | `false`           |

> ⚠️ 请勿把真实的 `JWT_SECRET`、数据库密码提交进仓库。

---

## 项目结构

```
留白/
├── BackEnd/                 # Spring Boot 后端
│   └── src/main/java/com/example/backend/
│       ├── controller/      # REST 接口（auth / cities / checkins / photos / trips / admin）
│       ├── service/         # 业务逻辑
│       ├── repository/      # Spring Data JPA
│       ├── entity/          # 实体（含 Visit 多次到访模型）
│       ├── dto/             # 请求/响应 DTO（不暴露 passwordHash）
│       ├── security/        # JWT 过滤器、SecurityConfig、401/403 处理
│       └── exception/       # 全局异常处理，统一 JSON 错误体
└── FrontEnd/                # React 前端
    └── src/
        ├── api/             # 后端接口客户端（client/city/checkin/trip/auth/admin）
        ├── context/         # AuthContext、CitiesContext（统一数据源）
        ├── components/      # 视图组件（map/panel/checkin/trip/admin/auth/...）
        ├── hooks/           # useApiCities、useStats
        └── utils/           # 图片压缩、地图数据
```

---

## 数据说明

所有业务数据（城市、到访、打卡、照片、行程）存储在后端 MySQL，按用户隔离。AI API Key 仍仅存于浏览器本地。

- **导出备份**（`.footprint`）— 不含照片，文件小，适合快速备份
- **导出完整数据**（`.footprint-full`）— 含所有照片 base64
- 在「设置」中可导入备份文件，导入会重建城市与打卡记录

---

## 许可证

本项目基于 [PolyForm Noncommercial License 1.0.0](LICENSE) 发布。

- 允许个人学习、研究、非营利组织使用
- **禁止任何商业用途**
