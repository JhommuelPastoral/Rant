import express from 'express';
import { addLikes, addRant, getRants } from '../controllers/rantController.js';

const router = express.Router();

// Create a function to pass `io` to the routes
const rantRouter = (io) => {
  // POST route to add a new rant
  router.post('/', (req, res) => addRant(req, res, io));

  // GET route to fetch all rants
  router.get('/getRant', (req, res) => getRants(req, res)); 
  router.post('/likes', (req, res) => addLikes(req, res, io)); 

  return router;
};

export default rantRouter;
