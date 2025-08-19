// src/pages/AdminPage.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { useEmployeeStore } from '../store/useEmployeeStore';

const AdminPage: React.FC = () => {
  const { employees, fetchEmployees, loading, error, currentUser, deleteEmployee } = useEmployeeStore();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You must be an admin to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <Link 
          to="/employees/add"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Employee
        </Link>
      </div>

      {loading && <div>Loading employees...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">user_name</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id}>
                <td className="border p-2">{employee.full_name}</td>
                <td className="border p-2">{employee.user_name}</td>
                <td className="border p-2 capitalize">{employee.role}</td>
                <td className="border p-2">{employee.email}</td>
                <td className="border p-2">{employee.phone}</td>
                <td className="border p-2">
                  <button
                    className="text-red-500 hover:underline"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this employee?')) {
                        await deleteEmployee(employee.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;