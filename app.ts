import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import Message from "./model/messages.mode";
import cors from 'cors';
import path from "path";

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const port = process.env.PORT || 3000;
app.use(cors())

app.use("/socket.io", express.static(path.join(__dirname, "node_modules", "socket.io-client", "dist")));


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdb', {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

io.on('connection', async (socket) => {
  console.log('user connected', socket.id);

  try {
    const messages = await Message.find();
    socket.emit('load messages', messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
  }

  socket.on('chat message', (data) => {
    console.log('Received message:', data);
    const message = new Message({ user: data.user, text: data.message });
    message.save();
    console.log(message);
    
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/chat", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
