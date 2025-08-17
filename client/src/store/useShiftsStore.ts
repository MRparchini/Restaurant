// src/store/useShiftStore.ts
import { create } from 'zustand';
import { supabase } from '../api/supabase';
import { type Shift, type WeeklySchedule } from '../types';
import { addDays, format, startOfWeek, isAfter } from 'date-fns';

interface ShiftState {
  shifts: Shift[];
  loading: boolean;
  error: string | null;
  fetchShifts: () => Promise<void>;
  addShift: (shift: Omit<Shift, 'id' | 'created_at'>) => Promise<void>;
  addWeeklySchedule: (schedule: WeeklySchedule) => Promise<void>;
  updateShift: (id: string, updates: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  getShiftsByTab: (tab: 'today' | 'week' | 'upcoming') => Shift[];
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  shifts: [],
  loading: false,
  error: null,

  fetchShifts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('shift_date', { ascending: true });

      if (error) throw error;
      set({ shifts: data || [], loading: false });
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
      const { data, error } = await supabase
        .from('shifts')
        .insert(shift)
        .select();

      if (error) throw error;
      set((state) => ({ 
        shifts: [...state.shifts, ...(data || [])], 
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

  addWeeklySchedule: async (schedule) => {
    set({ loading: true, error: null });
    try {
      // Convert weekly schedule to individual shifts
      const shiftsToAdd = Object.entries(schedule.shifts)
        .filter(([_, shift]) => shift !== null)
        .map(([date, shift]) => ({
          user_id: schedule.user_id,
          user_name: schedule.user_name,
          shift_date: date,
          start_time: shift!.start_time,
          end_time: shift!.end_time,
          position: shift!.position,
          rota_hours: schedule.rota_hours
        }));

      const { data, error } = await supabase
        .from('shifts')
        .insert(shiftsToAdd)
        .select();

      if (error) throw error;
      set((state) => ({ 
        shifts: [...state.shifts, ...(data || [])], 
        loading: false 
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to add weekly schedule',
        loading: false 
      });
      throw err;
    }
  },

  updateShift: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const {  error } = await supabase
        .from('shifts')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      set((state) => ({
        shifts: state.shifts.map(s => s.id === id ? { ...s, ...updates } : s),
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
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
        const weekStart = startOfWeek(today);
        const weekEnd = addDays(weekStart, 6);
        return shifts.filter(s => {
          const shift_date = new Date(s.shift_date);
          return shift_date >= weekStart && shift_date <= weekEnd;
        });
      case 'upcoming':
        return shifts.filter(s => isAfter(new Date(s.shift_date), today));
      default:
        return shifts;
    }
  }
}));