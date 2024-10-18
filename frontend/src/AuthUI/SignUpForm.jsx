import React, { useState } from 'react';
import axios from 'axios'; // Import axios


const SignUpForm = () => {

  
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleUsername = (e) => {
    setUsername(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Prepare the payload
    const userData = { email, username, password };
    console.log(userData);

    await axios.post(`${baseUrl}/auth/signup`, userData)
      .then((response) => {
        // Handle successful signup
        alert('Signup successful!');
        console.log('Signup successful:', response.data);
      })
      .catch((error) => {
        // Handle errors
        console.error('Signup failed:', error);
        alert('Signup failed. Please try again.');
      });
  };


  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <form className="p-6 pb-8" onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="font-bold text-black" htmlFor="email">
            Email Address:
          </label>
          <input
            type="text"
            id="email"
            className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            placeholder="Enter Email Address"
            onChange={handleEmail}
            value={email}
          />
        </div>
        <div className="mb-6">
          <label className="font-bold text-black" htmlFor="username">
            Username:
          </label>
          <input
            type="text"
            id="username"
            className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            placeholder="Enter username"
            onChange={handleUsername}
            value={username}
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
            onChange={handlePassword}
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

export default SignUpForm;
