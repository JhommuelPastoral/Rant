import React, { useRef, useState, useEffect, useContext } from 'react';
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
  const apiUrl = import.meta.env.VITE_API_URL;
  const backUrl = import.meta.env.VITE_BACKEND_URL;
  const [message, setMessage] = useState('');
  const [rants, setRants] = useState([]);
  const { user,setUser ,loading } = useContext(userContext);
  const socket = useRef(null);
  const navigate = useNavigate();

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

    fetchRants();

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

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

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
        date: dayjs().format('MMM D, YYYY'),
        time: dayjs().format('hh:mm:ss A'),
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
            ? prev.likedRants.filter((id) => id !== rantId)
            : [...prev.likedRants, rantId],
        };
      });
  
      // Optimistically update the local state
      setRants((prevRants) =>
        prevRants.map((rant) =>
          rant._id === rantId
            ? {
                ...rant,
                likes: response.data.message === 'Like added successfully'
                  ? [...rant.likes, user._id]
                  : rant.likes.filter((id) => id !== user._id),
              }
            : rant
        )
      );
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };
  
  

  return (
    <main className="pt-[70px] font-Poppins bg-[#f9fafb] min-h-screen px-4">
      <div className="max-w-[700px] mx-auto flex flex-col gap-6">
        {/* Rant Box - Only show if user is logged in */}
        {user && (
          <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="w-[40px] h-[40px] rounded-full bg-[#9b87f5] text-sm flex items-center justify-center text-white font-bold cursor-pointer">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <textarea
                ref={textareaRef}
                onInput={handleInput}
                className="resize-none outline-none placeholder-gray-500 w-[80%] md:w-[90%] border-b"
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
                  <p className="text-gray-400 text-xs">{dayjs(rant.time).fromNow()}</p>
                </div>
              </div>
              <p className="text-gray-700">{rant.message}</p>
              <div className="flex justify-between items-center border-t pt-3 text-gray-400 text-sm">
                <div className="flex gap-4">
                <Heart 
                  onClick={() => handleLike(rant._id)} 
                  fill={user?.likedRants?.includes(rant._id) ? 'red' : 'none'}
                  stroke={user?.likedRants?.includes(rant._id) ? 'red' : 'gray'}                  
                  className="cursor-pointer"
                />
                <span>{rant.likes.length}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}