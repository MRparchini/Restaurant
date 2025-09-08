// src/components/ShiftsList.tsx
import React, { useEffect, useState } from 'react';
import { type ShiftTab } from '../../types';
import useShiftStore from '../../store/useShiftsStore';
import { addDays, startOfWeek } from 'date-fns';

const ShiftsListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ShiftTab>('today');
  const { fetchShifts, getShiftsByTab, loading, error } = useShiftStore();

  useEffect(() => {
    const today = new Date();
    
            const weekStart = startOfWeek(today).toDateString();
            const weekEnd = addDays(weekStart, 6).toDateString();
    fetchShifts(weekStart, weekEnd)
  }, [])

  const shifts = getShiftsByTab(activeTab);

  return (
    <div className="container mx-auto p-4">
      <div className="flex border-b mb-4">
        {(['today', 'week'] as ShiftTab[]).map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 ${activeTab === tab ? 'border-b-2 border-blue-500 font-bold' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div>Loading shifts...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}


      <div className="overflow-x-auto">
      {(!loading && shifts.length > 0) && <table className="bg-white border">

        <thead>
          <tr>
            <th className="border w-[200px]">Employee</th> {/* Fixed pixel width */}
            <th className="border w-[100px]">Shift Date</th>
            <th className="border w-[90px]">Start Time</th>
            <th className="border w-[90px]">End Time</th>
            <th className="border">Position</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map(shift => (
            <tr>
              <td className="border p-2">{shift.user_name}</td>
              <td className="border p-2">{shift.shift_date}</td>
              <td className="border p-2">{shift.start_time}</td>
              <td className="border p-2">{shift.end_time}</td>
              <td className="border p-2">{shift.position}</td>
            </tr>
          ))}
        </tbody>
      </table>}
      </div>

      {!loading && shifts.length === 0 && (
        <div className="text-gray-500">No shifts found for this period</div>
      )}
    </div>
  );
};

export default ShiftsListPage;