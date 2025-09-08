// src/components/Layout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router';
import useEmployeeStore from '../store/useEmployeeStore';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const { currentUser } = useEmployeeStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <button
            aria-label="Open menu"
            className="p-2 rounded hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            {/* Hamburger icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-4">
            <span>Hello, {currentUser.full_name}</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4">
        <Outlet />
      </main>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
};

export default Layout;