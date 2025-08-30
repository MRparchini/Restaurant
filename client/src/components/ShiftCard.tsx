// src/components/ShiftCard.tsx
import React from 'react';
import { format, parseISO } from 'date-fns';
import { type Shift } from '../types';
import { Link } from 'react-router';
import { useEmployeeStore } from '../store/localStorage/useEmployeeStore';
import { useShiftStore } from '../store/localStorage/useShiftsStore';

interface ShiftCardProps {
  shift: Shift;
}

const ShiftCard: React.FC<ShiftCardProps> = ({ shift }) => {
  const { currentUser } = useEmployeeStore();
  const { deleteShift } = useShiftStore();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this shift?')) {
      await deleteShift(shift.id);
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{shift.user_name}</h3>
          <p className="text-gray-600">
            {format(parseISO(shift.shift_date), 'MMM dd, yyyy (EEEE)')}
          </p>
          <p className="mt-1">
            <span className="font-medium">Time:</span> {shift.start_time} - {shift.end_time}
          </p>
          <p>
            <span className="font-medium">Position:</span> {shift.position}
          </p>
          <p>
            <span className="font-medium">Rota Hours:</span> {shift.rota_hours}
          </p>
        </div>
        
        {currentUser?.role === 'admin' && (
          <div className="flex space-x-2">
            <Link
              to={`/shifts/edit/${shift.id}`}
              className="text-blue-500 hover:underline text-sm"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:underline text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftCard;