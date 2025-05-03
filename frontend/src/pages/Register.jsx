import { useState , useEffect} from 'react';
import { Eye, EyeOff,ArrowLeftFromLine } from 'lucide-react';
import Icon from '../Icon.png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = { email, password, username };

    toast.promise(
      axios.post(`${apiUrl}/api/users/register`, data),
      {
        loading: 'Registering...',
        success: (response) => {
          if (response.data.error) {
            const errorMessage = response.data.error;
            if (Array.isArray(errorMessage)) {
              errorMessage.forEach((err) => toast.error(err));
            } else {
              toast.error(errorMessage);
            }
          } else {
            setEmail('');
            setPassword('');
            setUsername('');
            navigate('/login');
            return 'Registered successfully!';
          }
        },
        error: (err) => {
          const errorMessage = err.response?.data?.error || err.message || 'Registration failed!';
          return errorMessage;
        }
      }
    );
  };

  return (
    <>
      <header className='bg-white pt-[20px] px-[20px] font-Poppins'>
        <Link to='/'>
          <button className='flex gap-[10px] cursor-pointer' >
            <ArrowLeftFromLine/> Back
          </button>        
        </Link>
      </header>
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src={Icon}
            className="mx-auto h-[100px] w-[100px]"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  autoComplete="email"
                  onChange={(e)=>{setEmail(e.target.value)}}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
              <label htmlFor="Username" className="block text-sm/6 font-medium text-gray-900">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="Username"
                  name="Username"
                  required
                  value={username}
                  onChange={(e)=>{setUsername(e.target.value)}}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>

              </div>
              <div className="mt-2 relative flex justify-center items-center">
                <input
                  id="password"
                  name="password"
                  value={password}
                  type={showPassword ? 'text' : 'password'}
                  required
                  onChange={(e)=>{setPassword(e.target.value)}}
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign Up
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Already have an account?{' '}
            <Link to='/login'>
              <button  className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign In
              </button>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
