// src/components/Layout.tsx
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router';
import { useEmployeeStore } from '../store/useEmployeeStore';

const Layout: React.FC = () => {
  const { currentUser } = useEmployeeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <Link to="/shifts" className="hover:underline">Shifts</Link>
            {currentUser.role === 'admin' && (
              <>
                <Link to="/schedule" className="hover:underline">Schedule</Link>
                <Link to="/admin" className="hover:underline">Admin</Link>
              </>
            )}
            <Link to="/leaves" className="hover:underline">Leave Requests</Link>
          </div>
          <div className="flex items-center space-x-4">
            <span>Hello, {currentUser.full_name}</span>
            <button 
              onClick={handleLogout}
              className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;