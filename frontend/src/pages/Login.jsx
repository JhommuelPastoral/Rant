import { useState, useEffect, useContext } from 'react';
import { Eye, EyeOff, ArrowLeftFromLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Icon from '../Icon.png';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { userContext } from '../../context/userContext';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSending, setSending] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { setUser } = useContext(userContext);
  const [data, setData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSending) {
      return;
    }

    setSending(true);

    try {
      const { email, password } = data;
      await toast.promise(
        axios.post(`${apiUrl}/api/users/login`, { email, password }),
        {
          loading: 'Logging in...',
          success: 'Login successful!',
          error: (err) => err.response?.data?.error || 'Login failed!',
        }
      ).then((response) => {
        console.log(response.data);
        setUser(response.data); 
        setData({
          email: '',
          password: '',
        });
        navigate('/dashboard');
      });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <header className='bg-white pt-[20px] px-[20px] font-Poppins'>
        <Link to='/'>
          <button className='flex gap-[10px] cursor-pointer'>
            <ArrowLeftFromLine /> Back
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
            Sign in to your account
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
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2 relative flex justify-center items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  required
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
                disabled={isSending}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300"
              >
                Sign in
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not a member?{' '}
            <Link to={'/register'}>
              <button className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign Up
              </button>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}