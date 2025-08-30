// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useEmployeeStore } from '../store/localStorage/useEmployeeStore';

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({
    user_name: '',
    password: ''
  });
  const { login, setCurrentUser } = useEmployeeStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(credentials.user_name, credentials.password);
      if (user) {
        localStorage.setItem("userInfo", JSON.stringify(user))
        setCurrentUser(user)
        setTimeout(() => {
          window.location.href = (user.role === 'admin' ? '/admin' : '/shifts');
          window.location.reload()
        }, 500);
      }
    } catch (error) {
      alert('Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Shift Management Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">user_name</label>
            <input
              type="text"
              name="user_name"
              value={credentials.user_name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;