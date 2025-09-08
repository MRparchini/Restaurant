// src/components/LeaveRequestForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import useEmployeeStore from '../../store/useEmployeeStore';
import useLeaveStore from '../../store/useLeaveStore';

const LeaveRequestFormPage: React.FC = () => {
  const { currentUser } = useEmployeeStore();
  const { addLeave } = useLeaveStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      await addLeave({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        ...formData
      });
      navigate('/leaves');
    } catch (error) {
      alert('Failed to submit leave request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Request Leave</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">End Date</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Reason</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default LeaveRequestFormPage;