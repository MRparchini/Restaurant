// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router';
import './App.css';
import Layout from './components/Layout';
import EditShiftPage from './pages/EditShiftPage';
import LoginPage from './pages/LoginPage';
import useEmployeeStore from './store/useEmployeeStore';
import type { Employee } from './types';
// Import seed data to initialize IndexedDB
import './store/localStorage/seedData';
// Import database utilities for debugging
import EmployeesPage from './pages/Employees/EmployeesPage';
import LeaveRequestFormPage from './pages/LeaveRequest/LeaveRequestFormPage';
import ShiftsListPage from './pages/Shifts/ShiftsListPage';
import WeeklyScheduleFormPage from './pages/WeeklySchedule/WeeklyScheduleFormPage';
import './store/localStorage/dbUtils';
import EmployeeFormPage from './pages/Employees/EmployeeFormPage';
import AnnualLeaveFormPage from './pages/AnnualLeave/AnnualLeaveFormPage';

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
  if(!appLoaded) {
    return <p>Loading ...</p>
  }

  if(!currentUser) {
    return <LoginPage />
  }
  return (
    <Router>
      <Routes>
        
        {currentUser ? (
          <Route path="/" element={<Layout />}>
            <Route index element={
              currentUser.role === 'admin' 
                ? <Navigate to="/admin" /> 
                : <Navigate to="/shifts" />
            } />
            <Route path="shifts/edit/:id" element={<EditShiftPage />} />
            <Route path="shifts" element={<ShiftsListPage />} />
            <Route path="schedule" element={<WeeklyScheduleFormPage />} />
            <Route path="leaves" element={<LeaveRequestFormPage />} />
            <Route path="admin" element={<EmployeesPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/add" element={<EmployeeFormPage />} />
            <Route path="anuual-leaves" element={<AnnualLeaveFormPage />} />
          </Route>
        ) : (
          <Route path="*" element={<p>Shifts</p>} />
        )}
      </Routes>
    </Router>
  );
};

export default App;