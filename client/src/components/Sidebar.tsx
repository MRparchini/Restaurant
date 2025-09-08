// src/components/Sidebar.tsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import useEmployeeStore from '../store/useEmployeeStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useEmployeeStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('userInfo');
    } catch {}
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 max-w-[80vw] bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!isOpen}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold text-lg">Menu</div>
          <button onClick={onClose} aria-label="Close sidebar" className="p-2 rounded hover:bg-gray-100">
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <Link to="/shifts" onClick={onClose} className="block px-3 py-2 rounded hover:bg-gray-100">Shifts</Link>
          {currentUser?.role === 'admin' && (
            <>
              <Link to="/schedule" onClick={onClose} className="block px-3 py-2 rounded hover:bg-gray-100">Schedule</Link>
              <Link to="/admin" onClick={onClose} className="block px-3 py-2 rounded hover:bg-gray-100">Employees</Link>
            </>
          )}
          <Link to="/leaves" onClick={onClose} className="block px-3 py-2 rounded hover:bg-gray-100">Leave Requests</Link>
        </nav>

        <div className="mt-auto p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


