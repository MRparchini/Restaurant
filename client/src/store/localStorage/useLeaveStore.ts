// src/store/useLeaveStore.ts
import { create } from 'zustand';
import { dbManager } from './indexedDB';
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
      const leaves = await dbManager.getAll<LeaveRequest>('leave_requests');
      set({ leaves: leaves || [], loading: false });
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
      const newLeave: LeaveRequest = {
        ...leave,
        id: crypto.randomUUID(),
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      await dbManager.add('leave_requests', newLeave);
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
      const currentLeave = await dbManager.get<LeaveRequest>('leave_requests', id);
      if (!currentLeave) throw new Error('Leave request not found');
      
      const updatedLeave = { ...currentLeave, status };
      await dbManager.update('leave_requests', updatedLeave);
      
      set((state) => ({
        leaves: state.leaves.map(l => 
          l.id === id ? updatedLeave : l
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