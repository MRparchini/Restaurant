// src/store/useEmployeeStore.ts
import { create } from 'zustand';
import { supabase } from '../../api/supabase';
import { type Employee } from '../../types';

interface EmployeeState {
    employees: Employee[];
    loading: boolean;
    error: string | null;
    currentUser: Employee | null;
    setCurrentUser: (userInfo: Employee) => void;
    fetchEmployees: () => Promise<void>;
    addEmployee: (employee: Omit<Employee, 'id' | 'created_at'>) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;
    login: (user_name: string, password: string) => Promise<Employee | null>;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
    employees: [],
    loading: false,
    error: null,
    currentUser: null,
    setCurrentUser: (useInfo) => {
        set({currentUser: useInfo})
    },
    fetchEmployees: async () => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            set({ employees: data || [], loading: false });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Failed to fetch employees',
                loading: false
            });
        }
    },

    addEmployee: async (employee) => {
        set({ loading: true, error: null });
        try {
            const { error } = await supabase
                .from('employees')
                .insert(employee);

            if (error) throw error;
            await useEmployeeStore.getState().fetchEmployees();
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Failed to add employee',
                loading: false
            });
            throw err;
        }
    },

    deleteEmployee: async (id) => {
        set({ loading: true, error: null });
        try {
            const { error } = await supabase
                .from('employees')
                .delete()
                .eq('id', id);

            if (error) throw error;
            set((state) => ({
                employees: state.employees.filter(emp => emp.id !== id),
                loading: false
            }));
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Failed to delete employee',
                loading: false
            });
            throw err;
        }
    },


    login: async (user_name, password) => {
  set({ loading: true, error: null });
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_name', user_name)
      .eq('password', password);

    if (error) throw error;
    
    // Check if we got exactly one user
    if (!data || data.length !== 1) {
      throw new Error('Invalid user_name or password');
    }

    const user = data[0];
    set({ currentUser: user, loading: false });
    return user;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Login failed';
    set({ 
      error: errorMessage,
      loading: false,
      currentUser: null
    });
    return null;
  }
}
}));