import chat from "../models/chatModels.js";

export const addChat = async(req,res,io)=>{
  
  try {
    const {userId, username, message, time} = req.body;
  
    if(!userId || !username || !message){
      return res.status(401).json({error: "Invalid Credentials"});
    }
  
    const newMessage = await chat.create({userId, username, message, time});
    io.emit("newChat", {userId, username, message});
    return res.status(201).json({ message: 'Successfully added', newMessage: newMessage });
    
  } catch (error) {
    return res.status(501).json({ err: error.message });

  }
}

export const getChat = async(req,res)=>{

  try {
    const chats = await chat.find();
    res.status(201).json(chats);
  } catch (error) {
    return res.status(501).json({ err: error.message });
  }


}