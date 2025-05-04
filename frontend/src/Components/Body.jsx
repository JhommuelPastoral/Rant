import React, { useRef, useState, useEffect, useContext, use } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import relativeTime from 'dayjs/plugin/relativeTime';
import { userContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

dayjs.extend(relativeTime);

export default function Body() {
  const textareaRef = useRef(null);
  const commentRefs = useRef({});
  const apiUrl = import.meta.env.VITE_API_URL;
  const backUrl = import.meta.env.VITE_BACKEND_URL;
  const [message, setMessage] = useState('');
  const [rants, setRants] = useState([]);
  const { user,setUser ,loading } = useContext(userContext);
  const socket = useRef(null);
  const navigate = useNavigate();
  const [comments, setComments] = useState({});
  const commentEndRefs = useRef({});
  const [showChat, setShowChat] = useState(true);
  const chatRef = useRef(null);
  const [chat, setchat] = useState('');
  const [allchats, setAllChats] = useState([]); 
  const chatEndRef = useRef(null);
  useEffect(() => {
    const fetchRants = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/rants/getRant`);
        setRants(response.data);
      } catch (error) {
        console.error('Error fetching rants:', error);
        toast.error('Failed to load rants');
      }
    };

    const fetchChats =  async ()=>{
      try {
        const response = await axios.get(`${apiUrl}/api/chats/getchats`);
        setAllChats(response.data);
      } catch (error) {
        console.error('Error fetching rants:', error);
        toast.error('Failed to load rants');
      }
    }
  
    fetchRants();
    fetchChats();
  
    socket.current = io(backUrl, { withCredentials: true });
  
    socket.current.on('newRant', (newRant) => {
      setRants((prevRants) => [...prevRants, newRant]);
    });
  
    socket.current.on('newLike', (updatedRant) => {
      setRants((prevRants) =>
        prevRants.map((rant) =>
          rant._id === updatedRant._id ? updatedRant : rant
        )
      );
    });
  
    socket.current.on('newComment', ({ rantId, comment }) => {
      setRants((prevRants) =>
        prevRants.map((rant) =>
          rant._id === rantId
            ? { ...rant, comments: [...rant.comments, comment] }
            : rant
        )
      );
    });
    socket.current.on('newChat',({userId, username, message}) =>{
      setAllChats((prev) => [...prev, {userId, username, message}] )
    });
  
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allchats]);
  

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  const handleComment = (rantId) => {
    const textarea = commentRefs.current[rantId];
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  const handleChatInput = () =>{
    const chat = chatRef.current;
    if(chat){
      chat.style.height = 'auto';
      chat.style.height = `${chat.scrollHeight}px`;
    }
  }


  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to post a rant');
      navigate('/login');
      return;
    }

    try {
      const rant = {
        name: user.username,
        message,
        timestamp: dayjs().toISOString(), 
      };

      await toast.promise(axios.post(`${apiUrl}/api/rants`, rant), {
        loading: 'Creating New Rant',
        success: 'Rant posted!',
        error: (err) => err.response?.data?.error || 'Rant creation failed!',
      });

      setMessage('');
      textareaRef.current.style.height = 'auto';
    } catch (error) {
      console.error('Error posting rant:', error);
    }
  };
  if (loading) {
    return null;
  }

  const handleLike = async (rantId) => {
    if (!user) {
      toast.error('Please log in to like or unlike a rant');
      navigate('/login');
      return;
    }
  
    try {
      // Send a request to like/unlike the rant
      const response = await toast.promise(
        axios.post(`${apiUrl}/api/rants/likes`, { userId: user._id, rantId }),
        {
          loading: 'Updating like...',
          success: (response) => response.data.message,
          error: (err) => err.response?.data?.message || 'Failed to update like',
        }
      );

      setUser((prev) => {
        const alreadyLiked = prev.likedRants.includes(rantId);
        return {
          ...prev,
          likedRants: alreadyLiked
            ? prev.likedRants.filter((id) => id !== rantId) //Unlike
            : [...prev.likedRants, rantId], // add like
        };
      });
      setRants((prevRants) => {
        return prevRants.map((rant) => {
          if (rant._id === rantId) {
            const isLikeAdded = response.data.message === 'Like added successfully';
            const alreadyLiked = rant.likes.includes(user._id);
      
            let updatedLikes;
      
            if (isLikeAdded) {
              if (alreadyLiked) {
                updatedLikes = rant.likes;
              } else {
                updatedLikes = [...rant.likes, user._id]; 
              }
            } 
            else {
              updatedLikes = rant.likes.filter((id) => id !== user._id);
            }
      
            return {
              ...rant,
              likes: updatedLikes,
            };
          } else {
            return rant;
          }
        });
      });
      
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };
  
  const handleCommentSubmit = async (rantId, userName) => {
    if (!user) {
      toast.error('Please log in to post a comment');
      navigate('/login');
      return;
    }
  
    const commentText = comments[rantId];
  
    if (!commentText) {
      toast.error('Please write a comment before submitting');
      return;
    }
  
    try {
      await toast.promise(
        axios.post(`${apiUrl}/api/rants/comment`, { userId: user._id, rantId, commentText, username:userName }),
        {
          loading: 'Posting comment...',
          success: 'Comment posted!',
          error: (err) => err.response?.data?.error || 'Failed to post comment!',
        }
      )
  
      setComments((prev) => ({ ...prev, [rantId]  : '' }));
      setUser((prev)=>({...prev, commentedRants: [...prev.commentedRants, user?._id]}));

      const el = commentEndRefs.current[rantId];
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };
  
  const handleMessageSubmit = async()=>{
    if (!user) {
      toast.error('Please log in to post a comment');
      navigate('/login');
      return;
    }
    try {
      if(!chat){
        toast.error('Please write a message before submitting');
      }
      const time = dayjs().format('hh:mm A');
      await toast.promise(
        axios.post(`${apiUrl}/api/chats`, {message: chat, userId: user?._id, username: user?.username, time}),
        {
          loading: 'Sending message...',
          success: 'Message sent!',
          error: 'Failed to send message'
        }
      ).then(()=>{
        setchat('');
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

      })


    } catch (error) {
      console.error('Error posting message:', error);

    }
  }
  
  return (
    <main className="pt-[70px] font-Poppins bg-[#f9fafb] min-h-screen px-4 pb-[50px]">
      <div className="max-w-[1400px] mx-auto flex justify-center gap-10 ">
  
        {/* Left Sticky Side */}
        <div className="hidden xl:block sticky top-[90px] h-fit">
          <div className="bg-white p-6 w-[300px] h-[400px] shadow-md rounded-2xl border border-gray-100">
            <div className="flex flex-col items-center justify-start h-full space-y-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-purple-400 text-white flex items-center justify-center text-3xl font-bold shadow">
                <span>{user?.username?.charAt(0).toUpperCase()}</span>
              </div>

              {/* Username */}
              <div className="text-center w-full">
                <h2 className="text-2xl font-semibold text-gray-800">{user?.username}</h2>
                <p className="text-gray-500 text-sm mt-1">Member since 2025</p>
              </div>

              {/* Divider */}
              <hr className="w-full border-t border-gray-200" />

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 w-full px-2">
                <div className="text-center">
                  <p className="text-xl font-bold text-purple-600">{user?.likedRants.length}</p>
                  <p className="text-sm text-gray-600">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-purple-600">10</p>
                  <p className="text-sm text-gray-600">Rants</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-purple-600">{user?.commentedRants.length}</p>
                  <p className="text-sm text-gray-600">Comments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

  
        {/* Main Content */}
        <div className="w-full max-w-[700px] flex flex-col gap-6">
          {/* Rant Box */}
          {user && (
            <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="w-[40px] h-[40px] rounded-full bg-[#9b87f5] text-sm flex items-center justify-center text-white font-bold cursor-pointer">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <textarea
                  ref={textareaRef}
                  onInput={handleInput}
                  className="overflow-hidden resize-none outline-none placeholder-gray-500 w-[80%] md:w-[90%] border-b"
                  rows={3}
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                  placeholder="What's bothering you today?"
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-[#9b87f5] text-white text-sm px-5 py-2 rounded-lg hover:opacity-90"
                  onClick={handleSubmit}
                >
                  Rant
                </button>
              </div>
            </div>
          )}
  
          {/* Render Rants */}
          {rants.length === 0 ? (
            <p className="text-center text-gray-500">No rants yet. Be the first to rant!</p>
          ) : (
            rants.slice(0).reverse().map((rant, index) => (
              <div key={index} className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-full bg-[#9b87f5] flex items-center justify-center text-white text-sm">
                    {rant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {rant.name} <span className="text-gray-400 text-sm">@anonymous</span>
                    </p>
                    <p className="text-gray-400 text-xs">{dayjs(rant.timestamp).fromNow()}</p>
                  </div>
                </div>
                <p className="text-gray-700 break-words">{rant.message}</p>
                <div className="flex justify-between items-center border-t pt-3 text-gray-400 text-sm">
                  <div className="flex gap-4 justify-center items-center">
                    <Heart
                      onClick={() => handleLike(rant._id)}
                      fill={user?.likedRants?.includes(rant._id) ? 'red' : 'none'}
                      stroke={user?.likedRants?.includes(rant._id) ? 'red' : 'gray'}
                      className="cursor-pointer"
                    />
                    <span>{rant.likes.length}</span>
                    <span>Comments</span>
                  </div>
                </div>
  
                {/* Comments Section */}
                <div className="pt-3 border-t flex flex-col h-auto">
                  {/* Existing Comments */}
                  <div className="space-y-2 overflow-y-auto pr-2 max-h-[200px]" ref={(el) => (commentEndRefs.current[rant._id] = el)}>
                    {rant.comments && rant.comments.length > 0 ? (
                      rant.comments.map((cmt, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <div className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center text-white text-xs font-semibold">
                            {cmt?.username.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div className="bg-gray-100 p-2 rounded-xl w-[94%]">
                            <div className="font-semibold text-xs text-gray-600">{cmt?.username}</div>
                            <div>{cmt.comment}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No comments yet.</p>
                    )}
                    <div ref={(el) => (commentEndRefs.current[rant._id] = el)} />
                  </div>
  
                  {/* Comment Input */}
                  <div className="flex gap-2 mt-3 items-center">
                    <textarea
                      ref={(el) => (commentRefs.current[rant._id] = el)}
                      onInput={() => handleComment(rant._id)}
                      onChange={(e) =>
                        setComments((prev) => ({
                          ...prev,
                          [rant._id]: e.target.value,
                        }))
                      }
                      value={comments[rant._id] || ''}
                      placeholder="Write a comment..."
                      className="resize-none overflow-hidden outline-none h-auto placeholder-gray-500 w-full border-b px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      rows={1}
                    />
                    <button
                      className="bg-purple-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-purple-600 transition"
                      onClick={() => {
                        handleCommentSubmit(rant._id, user?.username);
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
  
        {/* Right Sticky Side */}
        <div className="hidden xl:block sticky top-[90px] h-fit">
          <div className="bg-white p-4 w-[300px] shadow-md rounded-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Trends for you</h2>

            <div className="hover:bg-gray-100 p-2 rounded-lg cursor-pointer transition">
              <p className="text-xs text-gray-500">Trending in Philippines</p>
              <p className="text-sm font-semibold text-gray-800">#MayThe4th</p>
              <p className="text-xs text-gray-500">45.3K Tweets</p>
            </div>

            <div className="hover:bg-gray-100 p-2 rounded-lg cursor-pointer transition">
              <p className="text-xs text-gray-500">Music · Trending</p>
              <p className="text-sm font-semibold text-gray-800">#TaylorSwift</p>
              <p className="text-xs text-gray-500">120K Tweets</p>
            </div>

            <div className="hover:bg-gray-100 p-2 rounded-lg cursor-pointer transition">
              <p className="text-xs text-gray-500">Politics · Trending</p>
              <p className="text-sm font-semibold text-gray-800">Leni Robredo</p>
              <p className="text-xs text-gray-500">15.2K Tweets</p>
            </div>
            <div className="hover:bg-gray-100 p-2 rounded-lg cursor-pointer transition">
              <p className="text-xs text-gray-500">Entertainment · Trending</p>
              <p className="text-sm font-semibold text-gray-800">#KDramaFever</p>
              <p className="text-xs text-gray-500">22.1K Tweets</p>
            </div>

            <div className="hover:bg-gray-100 p-2 rounded-lg cursor-pointer transition">
              <p className="text-xs text-gray-500">Sports · Trending</p>
              <p className="text-sm font-semibold text-gray-800">#UAAPSeason87</p>
              <p className="text-xs text-gray-500">8,400 Tweets</p>

            </div>
          </div>
        </div>


        {/* Chats */}
        {showChat && (
        <div className="fixed bottom-4 right-4 z-50 w-[300px] bg-white shadow-lg rounded-xl overflow-hidden text-sm">
          <div className="bg-purple-500 text-white px-4 py-2 font-semibold flex justify-between items-center cursor-pointer">
            <span>Global Chats</span>
            <button className="text-white hover:text-gray-200" onClick={() => setShowChat(false)}>×</button>
          </div>

          <div className="p-3 h-[300px] flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 " >
              {allchats.map((ch, index) =>{
                if(ch.userId.toString() === user?._id.toString()  ){
                  return(
                    <div className="flex items-end justify-end gap-2" key ={index}>
                      <div>
                        <div className="bg-purple-100 p-2 rounded-lg max-w-[200px]">
                          {ch.message}
                        </div>
                        <div className="text-xs text-gray-400 text-right mt-1">{ch.time}</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold">{ch.username.charAt(0).toUpperCase()}</div>
                    </div>
                  )
                }

                else{
                  return(
                    <div className="flex items-start gap-2" key ={index}>
                      <div className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center text-white font-semibold">{ch.username.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="bg-gray-200 p-2 rounded-lg max-w-[200px]">
                          {ch.message}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{ch.time}</div>
                      </div>
                    </div>
                  )
                }
              })}


              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 mt-3 shadow-2xl ">
              <textarea
                ref={chatRef}
                onInput={handleChatInput}
                onChange={(e)=>{setchat(e.target.value)}}
                value={chat}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none overflow-y-auto placeholder-gray-500 transition-all max-h-[120px]"
                rows={1}
              />
              <button onClick={handleMessageSubmit} className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-600 transition">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

        
        {!showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="fixed bottom-4 right-4 z-50 cursor-pointer bg-purple-500 text-white w-12 h-12 rounded-full shadow-lg hover:bg-purple-600 transition flex items-center justify-center group"
          >
            💬
            <span className="absolute top-2 -left-25 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Global Chats
            </span>
          </button>
        )}

    
      </div>
    </main>
  );
  
}