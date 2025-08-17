// src/components/ShiftsList.tsx
import React, { useEffect, useState } from 'react';
import { type ShiftTab } from '../types';
import ShiftCard from './ShiftCard';
import { useShiftStore } from '../store/useShiftsStore';

const ShiftsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ShiftTab>('today');
  const { fetchShifts, getShiftsByTab, loading, error } = useShiftStore();

  useEffect(() => {
    fetchShifts()
  }, [])
  
  const shifts = getShiftsByTab(activeTab);

  return (
    <div className="container mx-auto p-4">
      <div className="flex border-b mb-4">
        {(['today', 'week', 'upcoming'] as ShiftTab[]).map(tab => (
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shifts.map(shift => (
          <ShiftCard key={shift.id} shift={shift} />
        ))}
      </div>

      {!loading && shifts.length === 0 && (
        <div className="text-gray-500">No shifts found for this period</div>
      )}
    </div>
  );
};

export default ShiftsList;