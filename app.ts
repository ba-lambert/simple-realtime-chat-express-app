import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import Message from "./model/messages.mode";
import cors from 'cors';
import path from "path";
import { signup, login } from "./controllers/user.controller";
import { isAuthenticated } from "./auth.middleware";
import jwt from 'jsonwebtoken';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const port = process.env.PORT || 3000;
app.use(cors())
app.use(express.json());
app.use("/socket.io", express.static(path.join(__dirname, "node_modules", "socket.io-client", "dist")));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdb', {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

io.use(async (socket, next) => {
  const token:any = socket.handshake.query.token;
  try {
    const decodedToken = jwt.verify(token, 'secretKey');
    (socket as any).userId = (decodedToken as any).userId;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    next(new Error('Authentication error'));
  }
});

io.on('connection', async (socket) => {
  console.log('user connected', socket.id);

  try {
    const messages = await Message.find();
    socket.emit('load messages', messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
  }

  socket.on('chat message', async (data) => {
    try {
      const message = new Message({ user: (socket as any).userId, text: data.message });
      await message.save();
      io.emit('chat message', { user: (socket as any).userId, message: data.message });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// Apply isAuthenticated middleware to protect chat route
app.get("/chat", isAuthenticated, (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/signup', signup);
app.post('/login', login);

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});


// import express, { Express, Request, Response } from "express";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { Server as SocketIOServer } from "socket.io";
// import http from "http";
// import Message from "./model/messages.mode";
// import cors from 'cors';
// import path from "path";
// import { login, signup } from "./controllers/user.controller";
// import { isAuthenticated } from "./auth.middleware";
// import jwt from 'jsonwebtoken';

// dotenv.config();

// const app: Express = express();
// const server = http.createServer(app);
// const io = new SocketIOServer(server);
// const port = process.env.PORT || 3000;
// app.use(cors())
// app.use(express.json());
// app.use("/socket.io", express.static(path.join(__dirname, "node_modules", "socket.io-client", "dist")));


// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdb', {
//   // useNewUrlParser: true,
//   // useUnifiedTopology: true,
// });

// io.on('connection', async (socket) => {
//   console.log('user connected', socket.id);

//   try {
//     const messages = await Message.find();
//     socket.emit('load messages', messages);
//   } catch (error) {
//     console.error('Error fetching messages:', error);
//   }
//   socket.on('chat message', (data) => {
//     const decodedToken = jwt.verify(data.user, 'secretKey');
//     const username = (decodedToken as any).username;
//     console.log('Received message:', data);
//     const message = new Message({ user: username, text: data.message });
//     message.save();
//     console.log(message);
    
//     io.emit('chat message', data);
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });

// app.get("/", (req: Request, res: Response) => {
//   res.send("Express + TypeScript Server");
// });

// app.get("/chat",isAuthenticated, (req: Request, res: Response) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

// app.post('/signup',signup)
// app.post('/login',login)

// server.listen(port, () => {
//   console.log(`[server]: Server is running at http://localhost:${port}`);
// });
