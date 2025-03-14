# 1980s Chat Room

一个充满复古风格的在线聊天室，带有1980年代的主题和风格。

## 特点

- 三个独特的聊天室主题：MTV、PIC_MAN、和 Back to the Future
- 支持中英文切换
- 自动机器人消息系统
- 随机灾难事件
- 复古风格的用户界面
- 实时在线用户列表
- 广告系统集成

## 技术栈

- Frontend: React + TypeScript + Vite + TailwindCSS
- Backend: Node.js + Express + Socket.IO
- 实时通信: Socket.IO
- 样式: TailwindCSS + Lucide Icons

## 安装

```bash
# 克隆仓库
git clone [your-repository-url]

# 安装依赖
npm install

# 开发环境运行
npm run dev

# 生产环境构建
npm run build

# 启动生产服务器
npm start
```

## 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

## 部署

1. 构建前端资源：
```bash
npm run build
```

2. 设置环境变量：
```bash
export NODE_ENV=production
export PORT=3000 # 可选
```

3. 启动服务器：
```bash
npm start
```

## 配置

在生产环境中，请修改 `server.js` 中的以下配置：

```javascript
cors: {
  origin: ['https://your-domain.com', 'http://your-domain.com']
}
```

## 许可证

MIT 