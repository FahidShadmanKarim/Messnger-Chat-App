import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const LoginForm = () => {

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleUserPassword = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
     
      const data = await response.json();
      const userEmail = data['user']['userEmail'];
      const userName = data['user']['userName'];
      const userId = data['user']['userId'];
    

      if (response.ok) {
        // Handle successful login

        login('dummyToken',userId,userName);
        navigate('/home');
        console.log('Login successful of user ');
       
      } else {
        // Handle errors
        console.error('Login failed:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <form className="p-6 pb-8" onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="font-bold text-black" htmlFor="userName">
            Username:
          </label>
          <input
            type="text"
            id="userName"
            className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            placeholder="Enter username"
            onChange={handleEmail}
            value={email}
          />
        </div>
        <div className="mb-6">
          <label className="font-bold text-black" htmlFor="password">
            Password:
          </label>
          <input
            type="password"
            id="password"
            className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            placeholder="Enter Password"
            onChange={handleUserPassword}
            value={password}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-md transition duration-300"
          style={{ backgroundColor: '#42b0f5' }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
