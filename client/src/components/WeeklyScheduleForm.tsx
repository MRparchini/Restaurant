// src/components/WeeklyScheduleForm.tsx
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { type WeeklySchedule } from '../types';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { useLeaveStore } from '../store/useLeaveStore';
import { useShiftStore } from '../store/useShiftsStore';

const WeeklyScheduleForm: React.FC = () => {
  const { employees } = useEmployeeStore();
  const { addWeeklySchedule } = useShiftStore();
  const { leaves } = useLeaveStore();
  const [schedule, setSchedule] = useState<Record<string, WeeklySchedule>>({});
  const [rota_hours, setrota_hours] = useState<Record<string, number>>({});

  const weekStart = startOfWeek(new Date());
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  useEffect(() => {
    // Initialize schedule for each employee
    const initialSchedule: Record<string, WeeklySchedule> = {};
    employees.forEach(emp => {
      initialSchedule[emp.id] = {
        user_id: emp.id,
        user_name: emp.full_name,
        shifts: {},
        rota_hours: 0
      };
      weekDays.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        initialSchedule[emp.id].shifts[dateStr] = null;
      });
    });
    setSchedule(initialSchedule);
  }, [employees]);

  const handleShiftChange = (
    employeeId: string,
    date: string,
    field: 'start_time' | 'end_time' | 'position',
    value: string
  ) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      if (!newSchedule[employeeId].shifts[date]) {
        newSchedule[employeeId].shifts[date] = {
          start_time: '',
          end_time: '',
          position: ''
        };
      }
      newSchedule[employeeId].shifts[date]![field] = value;
      return newSchedule;
    });
  };

  const handlerota_hoursChange = (employeeId: string, hours: number) => {
    setrota_hours(prev => ({
      ...prev,
      [employeeId]: hours
    }));
  };

  const handleSubmit = async () => {
    try {
      const schedulesToSubmit = Object.values(schedule).map(s => ({
        ...s,
        rota_hours: rota_hours[s.user_id] || 0
      }));
      
      for (const s of schedulesToSubmit) {
        await addWeeklySchedule(s);
      }
      alert('Weekly schedule saved successfully!');
    } catch (error) {
      alert('Failed to save schedule: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const isEmployeeOnLeave = (employeeId: string, date: string) => {
    return leaves.some(leave => 
      leave.user_id === employeeId && 
      leave.status === 'approved' &&
      date >= leave.start_date && 
      date <= leave.end_date
    );
  };

  return (
    <div className="overflow-x-auto">
      <button 
        onClick={handleSubmit}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save Weekly Schedule
      </button>

      <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border p-2">Employee</th>
            {weekDays.map(day => (
              <th key={day.toString()} className="border p-2">
                {format(day, 'EEE MM/dd')}
              </th>
            ))}
            <th className="border p-2">Rota Hours</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee.id}>
              <td className="border p-2">{employee.full_name}</td>
              {weekDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const onLeave = isEmployeeOnLeave(employee.id, dateStr);
                
                return (
                  <td key={dateStr} className={`border p-2 ${onLeave ? 'bg-red-100' : ''}`}>
                    {onLeave ? (
                      <div className="text-red-500">On Leave</div>
                    ) : (
                      <div className="space-y-2">
                       <div className="timesWrapper">
                         <input
                          type="time"
                          value={schedule[employee.id]?.shifts[dateStr]?.start_time || ''}
                          onChange={(e) => handleShiftChange(employee.id, dateStr, 'start_time', e.target.value)}
                          className="w-full p-1 border rounded"
                        />
                        <input
                          type="time"
                          value={schedule[employee.id]?.shifts[dateStr]?.end_time || ''}
                          onChange={(e) => handleShiftChange(employee.id, dateStr, 'end_time', e.target.value)}
                          className="w-full p-1 border rounded"
                        />
                       </div>
                        <select
                          value={schedule[employee.id]?.shifts[dateStr]?.position || ''}
                          onChange={(e) => handleShiftChange(employee.id, dateStr, 'position', e.target.value)}
                          className="w-full p-1 border rounded"
                        >
                          <option value="">Select Position</option>
                          <option value="Manager">Manager</option>
                          <option value="Cashier">Cashier</option>
                          <option value="Barista">Barista</option>
                        </select>
                      </div>
                    )}
                  </td>
                );
              })}
              <td className="border p-2">
                <input
                  type="number"
                  value={rota_hours[employee.id] || 0}
                  onChange={(e) => handlerota_hoursChange(employee.id, parseInt(e.target.value))}
                  className="w-full p-1 border rounded"
                  min="0"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
</div>
    </div>
  );
};

export default WeeklyScheduleForm;