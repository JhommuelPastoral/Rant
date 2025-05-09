import rant from '../models/rantModels.js';
import mongoose from 'mongoose';


export const addRant = async (req, res, io) => {
  const { name, message, timestamp } = req.body;

  if (!name || !message || !timestamp ) {
    return res.json({ error: 'Invalid Details' });
  }

  try {
    const newRant = await rant.create({ name, message, timestamp });

    // Emit a 'newRant' event to all connected clients
    io.emit('newRant', newRant); 

    return res.status(201).json({ message: 'Successfully added', Rants: newRant });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong', details: error });
  }
};

export const addComment = async (req,res,io)=>{

  try {
    const {userId, rantId, commentText, username} = req.body;
    if(!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(rantId)){
      return res.status(400).json({error: "Invalid ID Format"});
    }
    const rantToUpdate = await rant.findById(rantId);
  
    if(!rantToUpdate){
      return res.status(404).json({error: "Rant Not Found"});
    }

    const newComment = {
      userId,
      comment: commentText,
      username
    }

    rantToUpdate.comments.push(newComment);
    await rantToUpdate.save();

    io.emit('newComment', {
      rantId,
      comment: newComment,
      username
    });
    return res.status(200).json({ message: 'Comment added successfully', rant: rantToUpdate });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }

}


export const getRants = async (req, res) => {
  try {
    const rants = await rant.find();  
    res.status(200).json(rants);      
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const addLikes = async (req, res, io) => {
  try {
    const { userId, rantId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(rantId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const rantToUpdate = await rant.findById(rantId);
    if (!rantToUpdate) {
      return res.status(404).json({ message: 'Rant not found' });
    }

    const isLiked = rantToUpdate.likes.includes(userId);
    if (isLiked) {
      rantToUpdate.likes = rantToUpdate.likes.filter((id) => id.toString() !== userId);
      await rantToUpdate.save(); 
      io.emit('newLike', rantToUpdate);
      return res.status(200).json({ message: 'Like removed successfully' });
    } else {
      rantToUpdate.likes.push(userId);
      await rantToUpdate.save();
      io.emit('newLike', rantToUpdate);
      return res.status(200).json({ message: 'Like added successfully' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



