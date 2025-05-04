import user from "../models/userModels.js";
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { hashPassword, checkPassword, isPasswordMatch } from "../helpers/hash.js";
import rant from "../models/rantModels.js";

export const register = async (req,res)=>{
  
  try {
    const {email, password, username} = req.body;

    if(!email || !password || !username){
      return res.json({error: 'Invalid Credentials'});
    }

    if(!validator.isEmail(email)){
      return res.json({error: 'Invalid Email'});
    }

    const emailExist = await user.findOne({email});

    if(emailExist){
      return res.json({error: 'Email is already taken'});
    }

    if(!validator.isStrongPassword(password)){
      const issue = checkPassword(password);
      return res.json({error: issue});
    }

    const hashed = await hashPassword(password);
    const User = await user.create({email, password:hashed, username });
    return res.status(201).json({ message: 'Succesfully Created' });
 
  } catch (error) {
    return res.status(500).json({ error: error.message });

  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const User = await user.findOne({ email });

    if (!User) {
      return res.status(404).json({ error: 'No user found' });
    }

    const likedRants = await rant.find({ likes: User._id }).select('_id');
    const match = await isPasswordMatch(password, User.password);

    const commentRants = await rant.find({ 'comments.userId': User._id }).select('comments ');
    const userComments = [];

    commentRants.forEach((rantDoc)=>{
      rantDoc.comments.forEach((comment)=>{
        if(comment.userId.toString() === User._id.toString()){
          userComments.push(comment.userId);
        }
      })
    })
    if (match) {
      jwt.sign(
        { email: User.email, username: User.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' },
        (error, token) => {
          if (error) throw error;
          res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
          }).json({
            _id: User._id,
            email: User.email,
            username: User.username,
            likedRants: likedRants.map(r => r._id),
            commentedRants:userComments
          });
        }
      );
    } else {
      return res.status(401).json({ message: 'Password does not match' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};




// export const getProfile = async (req, res) => {
//   const { token } = req.cookies;
//   if (!token) {
//     return res.json(null);
//   }
  
//   const likedRants = await rant.find({ likes: User._id }).select('_id');
//   jwt.verify(token, process.env.JWT_SECRET, {}, (error, user) => {
//     if (error) {
//       console.log("Error verifying token:", error);
//       return res.status(401).json(null);
//     }

//     res.json({id: user_id, email: user.email});
//   });
// };

export const getProfile = async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json(null);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const foundUser = await user.findOne({ email: decoded.email });
    if (!foundUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const likedRants = await rant.find({ likes: foundUser._id }).select('_id');
    const commentRants = await rant.find({ 'comments.userId': foundUser._id }).select('comments ');
    const userComments = [];

    commentRants.forEach((rantDoc)=>{
      rantDoc.comments.forEach((comment)=>{
        if(comment.userId.toString() === foundUser._id.toString()){
          userComments.push(comment.userId);
        }
      })
    })
    res.json({
      _id: foundUser._id,
      email: foundUser.email,
      likedRants: likedRants.map((r) => r._id),
      username: foundUser.username,
      commentedRants: userComments
    });

  } catch (error) {
    console.error('Error verifying token or fetching user:', error.message);
    return res.status(401).json(null);
  }
};

export const logout = async (req,res)=>{
  res.cookie('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires: new Date(0),
  }).json({ message: 'Logged out successfully' });

}
