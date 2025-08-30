// src/pages/EditShiftPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { type Shift } from '../types';
import { useEmployeeStore } from '../store/localStorage/useEmployeeStore';
import { useShiftStore } from '../store/localStorage/useShiftsStore';

const EditShiftPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useEmployeeStore();
  const { shifts, updateShift, fetchShifts } = useShiftStore();
  
  const [formData, setFormData] = useState<Omit<Shift, 'id' | 'createdAt'>>({
    user_id: '',
    user_name: '',
    shift_date: '',
    start_time: '',
    end_time: '',
    position: '',
    rota_hours: 0
  }as Shift);

  // Load shift data when component mounts
  useEffect(() => {
    if (!id) return;

    // If shifts are already loaded, find the shift
    if (shifts.length > 0) {
      const shiftToEdit = shifts.find((shift: Shift) => shift.id === id);
      if (shiftToEdit) {
        const { id: _, created_at: __, ...rest } = shiftToEdit;
        setFormData(rest);
      }
    } else {
      // If no shifts loaded, fetch them first
      fetchShifts(new Date().toISOString(), new Date().toISOString()).then(() => {
        const shiftToEdit = shifts.find((shift: Shift) => shift.id === id);
        if (shiftToEdit) {
          const { id: _, created_at: __, ...rest } = shiftToEdit;
          setFormData(rest);
        }
      });
    }
  }, [id, shifts, fetchShifts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rotaHours' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateShift(id, formData);
      navigate('/shifts');
    } catch (error) {
      console.error('Failed to update shift:', error);
      alert('Failed to update shift. Please try again.');
    }
  };

  if (!currentUser) {
    return <div>Please login to edit shifts</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Shift</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Employee Name</label>
          <input
            type="text"
            name="user_ame"
            value={formData.user_name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            disabled={currentUser.role !== 'admin'}
          />
        </div>
        
        <div>
          <label className="block mb-1">Shift Date</label>
          <input
            type="date"
            name="shift_date"
            value={formData.shift_date}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Start Time</label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-1">End Time</label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div>
          <label className="block mb-1">Position</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select Position</option>
            <option value="Manager">Manager</option>
            <option value="Cashier">Cashier</option>
            <option value="Barista">Barista</option>
            <option value="Cook">Cook</option>
          </select>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/shifts')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditShiftPage;