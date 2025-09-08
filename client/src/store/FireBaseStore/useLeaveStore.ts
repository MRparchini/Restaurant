// src/store/useLeaveStore.ts
import { create } from 'zustand';
import { db } from '../../api/fibase';
import { type LeaveRequest } from '../../types';
import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';

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
      const snapshot = await getDocs(collection(db, 'leave_requests'));
      const leaves: LeaveRequest[] = snapshot.docs.map((d: any) => ({ id: d.id, ...(d.data() as Omit<LeaveRequest, 'id'>) }));
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
      const payload = { ...leave, status: 'pending', created_at: new Date().toISOString() } as Omit<LeaveRequest, 'id'>;
      await addDoc(collection(db, 'leave_requests'), payload);
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
      const ref = doc(db, 'leave_requests', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('Leave request not found');
      await updateDoc(ref, { status });
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