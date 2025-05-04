import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDb from './config/db.js';
import userRouter from './routes/userRoutes.js';
import cookieParser from 'cookie-parser';
import rantRouter from './routes/rantRoutes.js';
import http from 'http';  // Import http here
import { Server } from 'socket.io';  // Use the named import from socket.io
import chatRouter from './routes/chatRoutes.js';
const app = express();

// Create an HTTP server and pass it to Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO with the server
//https://rantt.onrender.com
const io = new Server(server, {
  cors: {
  origin: 'https://rantt.onrender.com',  // Replace with your frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: 'https://rantt.onrender.com',  // Replace with your frontend URL
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
dotenv.config();

// Set up routes and pass io to the router
app.use('/api/users', userRouter);
app.use('/api/rants', rantRouter(io));
app.use('/api/chats', chatRouter(io));

// Start the server
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  connectDb();
});
