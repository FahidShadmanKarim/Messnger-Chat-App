import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm'

const AuthPage = () => {
  
  const [variant, setVariant] = useState('login'); // 'login' or 'signup'

  const toggleVariant = () => {
    setVariant((prev) => (prev === 'login' ? 'signup' : 'login'));
    console.log(variant)
  };

  return (
    <div className="h-screen bg-gray-100 flex justify-center items-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Title above the card */}
        <div className="text-center mb-4">
          <img
            alt="Logo"
            height="48"
            width="48"
            className="mx-auto w-12 h-12"
            src="/logo.png"
          />
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {variant === 'login' ? "Sign in to your Account" : "Sign Up for an Account"}
          </h2>
        </div>

        {/* Conditional Rendering of Forms */}
        {variant === 'login' ? <LoginForm /> : <SignUpForm  />}

        {/* Toggle Link */}
        <div className="text-center mt-4">
          <span className="text-gray-600">
            {variant === 'login' ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button 
            onClick={toggleVariant} 
            className="text-blue-500 ml-1"
          >
            {variant === 'login' ? "Sign Up" : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
