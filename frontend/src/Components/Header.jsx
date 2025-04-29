import React, { useState } from 'react'
import { Bell } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { userContext } from '../../context/userContext'

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const {user, loading} = useContext(userContext);
  const handleLogout = async()=>{
    try {
      await axios.post(`${apiUrl}/api/users/logout`);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
  return (
    <header className="bg-white w-screen h-[50px] font-Poppins shadow-md fixed z-10">
      <div className="max-w-[1200px] mx-auto h-full flex justify-between items-center px-6">
        
        {/* Logo */}
        <p className="bg-gradient-to-r from-[#3a0ca3] via-[#4361ee] to-[#4cc9f0] text-transparent bg-clip-text text-lg font-bold">
          BlahBlah
        </p>

        {/* Right side */}
        <div className="flex items-center gap-5 relative">
          <Bell size={20} className="text-gray-600 cursor-pointer" />

          {/* Avatar */}
          <div 
            className="w-[30px] h-[30px] rounded-full bg-[rgb(155,135,245)] flex items-center justify-center cursor-pointer relative"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {!loading &&(
              <p className="text-white font-semibold text-xs">{user.username.charAt(0)}</p>
            ) }

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg py-2 w-36 flex flex-col text-sm text-gray-700 z-10">
                <button className="hover:bg-gray-100 py-2 px-4 text-left cursor-pointer">Profile</button>
                <button className="hover:bg-gray-100 py-2 px-4 text-left cursor-pointer">Settings</button>
                <button className="hover:bg-gray-100 py-2 px-4 text-left cursor-pointer" onClick={()=>{handleLogout()}} >Logout</button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}
