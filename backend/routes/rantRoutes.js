import express from 'express';
import authMiddleware from '../auth/authMiddleware.js';
import { addLikes, addRant, getRants, addComment } from '../controllers/rantController.js';

const router = express.Router();

// Create a function to pass `io` to the routes
const rantRouter = (io) => {
  router.post('/', authMiddleware, (req, res) => addRant(req, res, io));
  router.get('/getRant', (req, res) => getRants(req, res)); // Optional: make public
  router.post('/likes', authMiddleware, (req, res) => addLikes(req, res, io));
  router.post('/comment', authMiddleware, (req, res) => addComment(req, res, io));

  return router;
};

export default rantRouter;
