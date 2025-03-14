import app, { httpServer } from '../server.js';

export default async function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('初始化 Socket.IO');
    res.socket.server.io = httpServer;
  }

  app(req, res);
} 