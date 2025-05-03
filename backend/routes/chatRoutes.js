import express from 'express';
import authMiddleware from '../auth/authMiddleware.js';
import { addChat,getChat } from '../controllers/chatController.js';

const router = express.Router();
const chatRouter = (io)=>{

  // router.post('/', (req,res)=> addChat(req, res,io) );
  // router.get('/getchats', (req,res)=> getChat(req, res));

  router.post('/', authMiddleware, (req,res)=> addChat(req, res,io) );
  router.get('/getchats', authMiddleware, (req,res)=> getChat(req, res));

  return router;
}
export default chatRouter;