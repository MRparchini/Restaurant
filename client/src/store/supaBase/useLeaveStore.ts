// src/store/useLeaveStore.ts
import { create } from 'zustand';
import { supabase } from '../../api/supabase';
import { type LeaveRequest } from '../../types';

interface LeaveState {
  leaves: LeaveRequest[];
  loading: boolean;
  error: string | null;
  fetchLeaves: () => Promise<void>;
  addLeave: (leave: Omit<LeaveRequest, 'id' | 'created_at' | 'status'>) => Promise<void>;
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
}

export const useLeaveStore = create<LeaveState>((set) => ({
  leaves: [],
  loading: false,
  error: null,

  fetchLeaves: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ leaves: data || [], loading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch leave requests',
        loading: false 
      });
    }
  },

  addLeave: async (leave) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('leave_requests')
        .insert({ ...leave, status: 'pending' });

      if (error) throw error;
      await useLeaveStore.getState().fetchLeaves();
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to add leave request',
        loading: false 
      });
      throw err;
    }
  },

  updateLeaveStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        leaves: state.leaves.map(l => 
          l.id === id ? { ...l, status } : l
        ),
        loading: false
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to update leave status',
        loading: false 
      });
      throw err;
    }
  }
}));