// src/components/WeeklyScheduleForm.tsx
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { type WeeklySchedule } from '../types';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { useLeaveStore } from '../store/useLeaveStore';
import { useShiftStore } from '../store/useShiftsStore';

const WeeklyScheduleForm: React.FC = () => {
  const { employees } = useEmployeeStore();
  const {shifts, addWeeklySchedule } = useShiftStore();
  const { leaves } = useLeaveStore();
  const [schedule, setSchedule] = useState<WeeklySchedule[]>([]);

  const weekStart = startOfWeek(new Date());
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  

  console.log("shifts", shifts)
  console.log("sche", schedule)

  useEffect(() => {
    // Initialize schedule for each employee
    const initialSchedule: WeeklySchedule[] = [];
    employees.forEach((emp, i) => {
      let shiftPyload = {
        shift_index: i,
        user_id: emp.id,
        user_name: emp.full_name,
        shifts: {},
        rota_hours: 0
      }
      weekDays.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        (shiftPyload.shifts as any)[dateStr] = null
      });
      initialSchedule.push(shiftPyload)
    });
    setSchedule(initialSchedule);
  }, [employees]);

  const handleShiftChange = (
    shift_index: number,
    date: string,
    field: 'start_time' | 'end_time' | 'position' | 'user_id',
    value: string
  ) => {
    setSchedule(prev => {
      const newSchedule =  [...prev ];
      if(field === "user_id") {
        newSchedule[shift_index].user_id = value
      }
      else {
        if (!newSchedule[shift_index].shifts[date]) {
          newSchedule[shift_index].shifts[date] = {
            start_time: '',
            end_time: '',
            position: ''
          };
        }
        newSchedule[shift_index].shifts[date]![field] = value;
      }
      return newSchedule;
    });
  };

  const handlerota_hoursChange = (shift_index: number) => {
    const target = schedule[shift_index];
    if (!target) return 0;
    const targetShifts = Object.values(target.shifts);

    let totalMinutes = 0;

    targetShifts.forEach(shift => {
      if (
        shift &&
        shift.start_time &&
        shift.end_time &&
        shift.start_time.length === 5 &&
        shift.end_time.length === 5
      ) {
        // Parse "HH:mm"
        const [startHour, startMinute] = shift.start_time.split(':').map(Number);
        const [endHour, endMinute] = shift.end_time.split(':').map(Number);

        let start = startHour * 60 + startMinute;
        let end = endHour * 60 + endMinute;

        // If end is less than start, assume overnight shift (add 24h)
        if (end < start) {
          end += 24 * 60;
        }

        totalMinutes += end - start;
      }
    });

    // Return hours as float with 2 decimals
    return +(totalMinutes / 60).toFixed(2);
  };

  const handleSubmit = async () => {
    try {
      const schedulesToSubmit = Object.values(schedule).map(s => ({
        ...s,
        rota_hours: 0// rota_hours[s.user_id] || 0
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
        <table className="min-w-full table-fixed bg-white border">
          <thead>
            <tr>
              <th className="border p-2  w-[200px]">Employee</th>
              {weekDays.map(day => (
                <th key={day.toString()} className="border p-2 w-[180px]">
                  {format(day, 'EEE MM/dd')}
                </th>
              ))}
              <th className="border p-2 w-[200px]">Rota Hours</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map(record => {
              return <tr key={record.shift_index}>
                <td className="border p-2 w-[200px]"><select 
                value={record.user_id}
                onChange={(e) => handleShiftChange(record.shift_index, "", 'user_id', e.target.value)}>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                  ))}
                  </select></td>
                  
                {weekDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const onLeave = isEmployeeOnLeave(record.user_id, dateStr);

                  return (
                    <td key={dateStr} className={`border p-2 w-[180px] ${onLeave ? 'bg-red-100' : ''}`}>
                      {onLeave ? (
                        <div className="text-red-500">On Leave</div>
                      ) : (
                        <div className="space-y-2">
                          <div className="timesWrapper">
                            <input
                              type="time"
                              value={schedule[record.shift_index]?.shifts[dateStr]?.start_time || ''}
                              onChange={(e) => handleShiftChange(record.shift_index, dateStr, 'start_time', e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                            <input
                              type="time"
                              value={schedule[record.shift_index]?.shifts[dateStr]?.end_time || ''}
                              onChange={(e) => handleShiftChange(record.shift_index, dateStr, 'end_time', e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          </div>
                          <select
                            value={schedule[record.shift_index]?.shifts[dateStr]?.position || ''}
                            onChange={(e) => handleShiftChange(record.shift_index, dateStr, 'position', e.target.value)}
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
                <td className="border p-2 w-[400px]">
                  <input
                    type="number"
                    value={handlerota_hoursChange(record.shift_index)}
                    className="w-full p-1 border rounded"
                    min="0"
                  />
                </td>

              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyScheduleForm;