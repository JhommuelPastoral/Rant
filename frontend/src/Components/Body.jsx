import React, { useRef, useState, useEffect, useContext } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client'; // Import socket.io-client
import relativeTime from 'dayjs/plugin/relativeTime';
import { userContext } from '../../context/userContext';
dayjs.extend(relativeTime); // Use relative time plugin

export default function Body() {
  const textareaRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const backUrl = import.meta.env.VITE_BACKEND_URL;
  const [message, setMessage] = useState('');
  const [rants, setRants] = useState([]); // State to hold the rants
  const {user} = useContext(userContext);
  // Initialize Socket.IO client
  const socket = useRef(null);

  // Fetch all rants when component mounts
  useEffect(() => {
    const fetchRants = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/rants/getRant`);
        setRants(response.data);  // Store rants in state
      } catch (error) {
        console.error('Error fetching rants:', error);
      }
    };

    fetchRants();

    // Connect to the Socket.IO server
    socket.current = io(backUrl, { withCredentials: true });

    // Listen for new rants
    socket.current.on('newRant', (newRant) => {
      setRants((prevRants) => [newRant, ...prevRants]); // Add the new rant at the top
    });

    // Cleanup on component unmount
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []); // Empty dependency array means it only runs once when the component mounts

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height first
      textarea.style.height = `${textarea.scrollHeight}px`; // Set it based on scrollHeight
    }
  };

  const handleSubmit = async () => {
    try {
      const rant = {
        name: user?.username,
        message,
        date: dayjs().format('MMM D, YYYY'),  // Date format
        time: dayjs().format('hh:mm:ss A')              // Relative time format (e.g. "a few seconds ago")
      };

      toast.promise(axios.post(`${apiUrl}/api/rants`, rant), {
        loading: 'Creating New Rant',
        success: 'Successful!',
        error: (err) => err.response?.data?.error || 'Rant creation failed!',
      }).then(() => {
        setMessage(''); // Clear the textarea
      });

    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <main className="pt-[70px] font-Poppins bg-[#f9fafb] min-h-screen px-4">
      <div className="max-w-[700px] mx-auto flex flex-col gap-6">
        {/* Rant Box */}
        <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-4">
          {/* Avatar + Textarea */}
          <div className="flex gap-4">
            <div className="w-[40px] h-[40px] rounded-full bg-[#9b87f5] text-sm flex items-center justify-center text-white font-bold cursor-pointer">
            {user?.username?.charAt(0)}
            </div>
            <textarea
              ref={textareaRef}
              onInput={handleInput}
              className="resize-none outline-none placeholder-gray-500 w-[80%] md:w-[90%] border-b"
              rows={3}
              onChange={(e) => { setMessage(e.target.value); }}
              value={message}
              placeholder="What's bothering you today?"
            ></textarea>
          </div>
          {/* Button */}
          <div className="flex justify-end">
            <button className="bg-[#9b87f5] text-white text-sm px-5 py-2 rounded-lg hover:opacity-90" onClick={handleSubmit}>
              Rant
            </button>
          </div>
        </div>

        {/* Render New Rants */}
        {rants.map((rant, index) => (
          <div key={index} className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-[40px] h-[40px] rounded-full bg-[#9b87f5] flex items-center justify-center text-white text-sm">
                {rant.name.charAt(0)} {/* Display first letter of name */}
              </div>
              <div>
                <p className="font-semibold">{rant.name} <span className="text-gray-400 text-sm">@anonymous</span></p>
                <p className="text-gray-400 text-xs">{dayjs(rant.time).fromNow()}</p> {/* Use relative time */}
              </div>
            </div>
            <p className="text-gray-700">{rant.message}</p>
            <div className="flex justify-between items-center border-t pt-3 text-gray-400 text-sm">
              <div className="flex gap-4">
                <span>24</span>
                <span>5</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
