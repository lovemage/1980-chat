import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// 生产环境静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://1980-chat.vercel.app', 'https://*.vercel.app']
      : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 存储用户信息
const users = new Map();
const rooms = ['mtv', 'picman', 'future'];

io.on('connection', (socket) => {
  console.log('用户连接成功');

  socket.on('joinRoom', (data) => {
    const { nickname, race, region, room } = data;
    
    if (users.has(nickname)) {
      socket.emit('error', '该昵称已被使用');
      return;
    }

    users.set(nickname, { race, region, room, socket: socket.id });
    socket.join(room);
    
    // 广播用户列表更新
    io.to(room).emit('userList', Array.from(users.entries())
      .filter(([_, info]) => info.room === room)
      .map(([name, info]) => ({
        nickname: name,
        race: info.race,
        region: info.region
      })));
    
    console.log(`${nickname} 加入了 ${room} 房间`);
  });

  socket.on('switchRoom', (data) => {
    const { from, to, user } = data;
    
    socket.leave(from);
    socket.join(to);
    
    if (users.has(user.nickname)) {
      const userInfo = users.get(user.nickname);
      users.set(user.nickname, { ...userInfo, room: to });
    }
    
    // 更新两个房间的用户列表
    [from, to].forEach(room => {
      io.to(room).emit('userList', Array.from(users.entries())
        .filter(([_, info]) => info.room === room)
        .map(([name, info]) => ({
          nickname: name,
          ...info
        }))
      );
    });
    
    console.log(`${user.nickname} 从 ${from} 切换到 ${to} 房间`);
  });

  socket.on('sendMessage', (data) => {
    const { text, room } = data;
    io.to(room).emit('message', {
      id: Date.now(),
      text,
      timestamp: new Date(),
      ...data
    });
  });

  socket.on('disconnect', () => {
    // 找到并移除断开连接的用户
    for (const [nickname, info] of users.entries()) {
      if (info.socket === socket.id) {
        const room = info.room;
        users.delete(nickname);
        
        // 更新房间用户列表
        io.to(room).emit('userList', Array.from(users.entries())
          .filter(([_, userInfo]) => userInfo.room === room)
          .map(([name, userInfo]) => ({
            nickname: name,
            ...userInfo
          }))
        );
        
        console.log(`${nickname} 断开连接`);
        break;
      }
    }
  });

  // 确保所有路由都返回index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
});

let PORT = process.env.PORT || 3000;
const startServer = () => {
  httpServer.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`端口 ${PORT} 被占用，尝试下一个端口...`);
      PORT++;
      startServer();
    } else {
      console.error('服务器启动错误:', err);
    }
  });
};

startServer(); 