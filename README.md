# 街头艺人演出实时应援灯墙系统

实时应援系统：观众通过 App 发送彩色光效，在大屏幕上以粒子动画呈现，艺人可查看热力图并触发全场特效。

## 架构

```
[React Native App] --Socket.IO--> [Express Server + MongoDB] --Socket.IO--> [LED 大屏幕/Web展示页]
                                          |
                                   [艺人控制台]
```

## 快速开始

### 1. 启动后端

```bash
cd server
npm install
# 初始化测试数据（需要 MongoDB 运行中）
node seed.js
# 启动服务
npm start
```

服务运行在 `http://localhost:3000`

### 2. 打开大屏幕展示页

浏览器打开 `display/index.html`（需要后端运行中）

### 3. 打开艺人控制台

浏览器打开 `performer/index.html?id=<performerId>`

### 4. React Native App

```bash
cd app
npm install
# 使用 Expo 或 React Native CLI 运行
npx react-native start
```

## 功能特性

- **观众端**：选择艺人 → 选择颜色 → 点击应援按钮发送光效
- **大屏幕**：Canvas 2D 粒子动画，实时展示所有应援
- **艺人端**：实时热力图 + 应援统计 + 触发全场特效（烟花/波浪/彩虹）
- **防刷机制**：同一观众每分钟限 5 次应援（服务端滑动窗口）

## API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/performers` | GET | 获取活跃艺人列表 |
| `/api/performers` | POST | 创建艺人 |
| `/api/cheers/stats/:performerId` | GET | 获取应援统计 |
| `/health` | GET | 健康检查 |

## Socket.IO 事件

| 事件 | 方向 | 数据 |
|------|------|------|
| `cheer` | 客户端→服务端 | `{ userId, performerId, color }` |
| `new-cheer` | 服务端→客户端 | `{ id, performerId, color, timestamp }` |
| `trigger-effect` | 客户端→服务端 | `{ performerId, effect }` |
| `special-effect` | 服务端→客户端 | `{ effect, performerId }` |
| `rate-limited` | 服务端→客户端 | `{ remaining, retryAfter }` |

## 技术栈

- **后端**: Node.js, Express, Socket.IO, Mongoose, MongoDB
- **观众App**: React Native, socket.io-client
- **展示页**: Vanilla JS, Canvas 2D
- **艺人端**: Vanilla JS, Canvas 2D
