import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message:{
    type:String
  },
  username:{
    type:String
  },
  time:{
    type:String
  }


},{timestamps:true});

const chat = mongoose.model('Chat', chatSchema);
export default chat;