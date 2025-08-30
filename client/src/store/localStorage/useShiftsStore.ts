// src/store/useShiftStore.ts
import { create } from 'zustand';
import { type Shift, type WeeklySchedule } from '../../types';
import { dbManager } from './indexedDB';
// import { addDays, format, startOfWeek, isAfter } from 'date-fns';
import { format, isAfter } from 'date-fns';

interface ShiftState {
  shifts: Shift[];
  loading: boolean;
  error: string | null;
  fetchShifts: (startDate: string, endDate: string) => Promise<void>;
  addShift: (shift: Omit<Shift, 'id' | 'created_at'>) => Promise<void>;
  addWeeklySchedule: (schedule: WeeklySchedule) => Promise<void>;
  updateShift: (id: string, updates: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  getShiftsByTab: (tab: 'today' | 'week' | 'upcoming') => Shift[];
}

const mockData = [
  {
    "id": "5d75a1e8-ae7d-4229-a9fb-f3bc898bdc07",
    "user_id": "1bf0551c-d505-4854-ac0a-f3817dabf2e8",
    "user_name": "Admin User",
    "shift_date": "2025-08-17",
    "start_time": "12:00:00",
    "end_time": "17:00:00",
    "position": "Manager",
    "rota_hours": 0,
    "created_at": "2025-08-17T16:23:53.155685+00:00"
  },
  {
    "id": "21e5f135-7492-453c-9ffe-78f53d5e8434",
    "user_id": "1bf0551c-d505-4854-ac0a-f3817dabf2e8",
    "user_name": "Admin User",
    "shift_date": "2025-08-17",
    "start_time": "08:00:00",
    "end_time": "20:25:00",
    "position": "Manager",
    "rota_hours": 0,
    "created_at": "2025-08-17T17:14:43.655002+00:00"
  },
  {
    "id": "cdde2cdd-5caa-442c-94c2-06468d20b2b4",
    "user_id": "93111519-f4aa-4d40-8eb9-8a060dbf34b4",
    "user_name": "John Doe",
    "shift_date": "2025-08-17",
    "start_time": "20:00:00",
    "end_time": "23:00:00",
    "position": "",
    "rota_hours": 0,
    "created_at": "2025-08-17T17:14:44.37142+00:00"
  },
  {
    "id": "a33cece9-b2c1-40be-a937-810ecfdd6e1f",
    "user_id": "1bf0551c-d505-4854-ac0a-f3817dabf2e8",
    "user_name": "Admin User",
    "shift_date": "2025-08-20",
    "start_time": "08:20:00",
    "end_time": "20:00:00",
    "position": "Cashier",
    "rota_hours": 0,
    "created_at": "2025-08-19T14:39:39.319396+00:00"
  },
  {
    "id": "b9ae089c-b056-46ec-846f-fa206c27bb96",
    "user_id": "1bf0551c-d505-4854-ac0a-f3817dabf2e8",
    "user_name": "Admin User",
    "shift_date": "2025-08-21",
    "start_time": "15:15:00",
    "end_time": "17:20:00",
    "position": "Cashier",
    "rota_hours": 0,
    "created_at": "2025-08-19T14:39:39.319396+00:00"
  },
  {
    "id": "674cd20a-0cf5-42b8-9597-f2f937507ac2",
    "user_id": "93111519-f4aa-4d40-8eb9-8a060dbf34b4",
    "user_name": "John Doe",
    "shift_date": "2025-08-22",
    "start_time": "08:00:00",
    "end_time": "20:00:00",
    "position": "Cashier",
    "rota_hours": 0,
    "created_at": "2025-08-19T14:39:40.021015+00:00"
  }
];

export const useShiftStore = create<ShiftState>((set, get) => ({
  shifts: mockData || [],
  loading: false,
  error: null,

  fetchShifts: async (_startDate, _endDate) => {
    set({ loading: true, error: null });
    try {
      const allShifts = await dbManager.getAll<Shift>('shifts');
      const filteredShifts = allShifts
      // .filter(shift => 
      //   shift.shift_date >= startDate && shift.shift_date <= endDate
      // );
      set({ shifts: filteredShifts, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch shifts',
        loading: false
      });
    }
  },

  addShift: async (shift) => {
    set({ loading: true, error: null });
    try {
      const newShift: Shift = {
        ...shift,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      
      await dbManager.add('shifts', newShift);
      set((state) => ({
        shifts: [...state.shifts, newShift],
        loading: false
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to add shift',
        loading: false
      });
      throw err;
    }
  },

  addWeeklySchedule: async (schedule: WeeklySchedule) => {
    set({ loading: true, error: null });
    
    try {
      // Get the week range from the schedule
      const weekDates = Object.keys(schedule.shifts);
      if (weekDates.length === 0) {
        throw new Error('No dates in schedule');
      }

      const firstDate = weekDates[0];
      const lastDate = weekDates[weekDates.length - 1];

      // 1. First delete all existing shifts for this user in this date range
      const allShifts = await dbManager.getAll<Shift>('shifts');
      const shiftsToDelete = allShifts
      // .filter(shift => 
      //   shift.user_id === schedule.user_id && 
      //   shift.shift_date >= firstDate && 
      //   shift.shift_date <= lastDate
      // );
      
      for (const shift of shiftsToDelete) {
        await dbManager.delete('shifts', shift.id);
      }

      // 2. Prepare all new shifts for insertion
      const shiftsToAdd = Object.entries(schedule.shifts)
        .filter(([_, shift]) => shift !== null)
        .map(([date, shift]) => ({
          id: crypto.randomUUID(),
          user_id: schedule.user_id,
          user_name: schedule.user_name,
          shift_date: date,
          start_time: shift!.start_time,
          end_time: shift!.end_time,
          position: schedule.position.toString(),
          rota_hours: schedule.rota_hours,
          created_at: new Date().toISOString()
        }));

      // If no shifts to add (all empty), we're done
      if (shiftsToAdd.length === 0) {
        set({ loading: false });
        return;
      }

      // 3. Insert all new shifts
      for (const shift of shiftsToAdd) {
        await dbManager.add('shifts', shift);
      }

      // 4. Update local state by removing deleted shifts and adding new ones
      set((state) => {
        // Remove any shifts for this user in the date range
        const filteredShifts = state.shifts.filter(shift => 
          !(shift.user_id === schedule.user_id && 
            shift.shift_date >= firstDate && 
            shift.shift_date <= lastDate)
        );
        
        // Add the new shifts
        return {
          shifts: [...filteredShifts, ...shiftsToAdd],
          loading: false
        };
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save weekly schedule';
      set({ 
        error: errorMessage,
        loading: false 
      });
      throw err;
    }
  },

  updateShift: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const currentShift = get().shifts.find(s => s.id === id);
      if (!currentShift) throw new Error('Shift not found');
      
      const updatedShift = { ...currentShift, ...updates };
      await dbManager.update('shifts', updatedShift);
      
      set((state) => ({
        shifts: state.shifts.map(s => s.id === id ? updatedShift : s),
        loading: false
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update shift',
        loading: false
      });
      throw err;
    }
  },

  deleteShift: async (id) => {
    set({ loading: true, error: null });
    try {
      await dbManager.delete('shifts', id);
      set((state) => ({
        shifts: state.shifts.filter(s => s.id !== id),
        loading: false
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to delete shift',
        loading: false
      });
      throw err;
    }
  },

  getShiftsByTab: (tab) => {
    const today = new Date();
    const shifts = get().shifts;

    switch (tab) {
      case 'today':
        return shifts.filter(s => s.shift_date === format(today, 'yyyy-MM-dd'));
      case 'week':
        // const weekStart = startOfWeek(today);
        // const weekEnd = addDays(weekStart, 6);
        return shifts
        // .filter(s => {
        //   const shift_date = new Date(s.shift_date);
        //   return shift_date >= weekStart && shift_date <= weekEnd;
        // });
      case 'upcoming':
        return shifts.filter(s => isAfter(new Date(s.shift_date), today));
      default:
        return shifts;
    }
  }
}));

