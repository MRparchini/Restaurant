// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import ShiftsList from './components/ShiftsList';
import WeeklyScheduleForm from './components/WeeklyScheduleForm';
import EmployeeForm from './components/EmployeeForm';
import LeaveRequestForm from './components/LeaveRequestForm';
import { useEmployeeStore } from './store/useEmployeeStore';
import EditShiftPage from './pages/EditShiftPage';
import './App.css'
import type { Employee } from './types';

const App: React.FC = () => {
  const [appLoaded, setAppLoaded] = useState(false)
  const [currentUser, setCurrentUser] = useState<Employee>(undefined as any)
  const { setCurrentUser: _setCurrentUser, fetchEmployees } = useEmployeeStore();

  useEffect(() => {
    const user = localStorage.getItem('userInfo')
    if(user) {
      _setCurrentUser(JSON.parse(user))
      setCurrentUser(JSON.parse(user))
      fetchEmployees()
    }
    setTimeout(() => {
      setAppLoaded(true)
    }, 500);
  }, [])
  console.log("NNNN: ", currentUser)
  if(!appLoaded) {
    return <p>Loading ...</p>
  }

  if(!currentUser) {
    return <LoginPage />
  }
  return (
    <Router basename='resturant'>
      <Routes>
        
        {currentUser ? (
          <Route path="/" element={<Layout />}>
            <Route index element={
              currentUser.role === 'admin' 
                ? <Navigate to="/admin" /> 
                : <Navigate to="/shifts" />
            } />
            <Route path="shifts/edit/:id" element={<EditShiftPage />} />
            <Route path="shifts" element={<ShiftsList />} />
            <Route path="schedule" element={<WeeklyScheduleForm />} />
            <Route path="leaves" element={<LeaveRequestForm />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="employees/add" element={<EmployeeForm />} />
          </Route>
        ) : (
          <Route path="*" element={<p>Shifts</p>} />
        )}
      </Routes>
    </Router>
  );
};

export default App;