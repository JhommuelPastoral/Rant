import axios from 'axios';
import { createContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const userContext = createContext({});

export default function UserContextProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/users/profile`)
      .then(({ data }) => {
        if (data) {
          console.log(data);
          setUser(data);
          navigate('/dashboard');
        } else {
          setUser(null);
          navigate('/');
        }
      })
      .catch((err) => {
        console.error('Token expired or request failed:', err);
        setUser(null);
        navigate('/');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); 

  return (
    <userContext.Provider value={{ user, setUser, loading }}>
      {children}
    </userContext.Provider>
  );
}