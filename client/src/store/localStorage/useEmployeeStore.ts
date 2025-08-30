// src/store/useEmployeeStore.ts
import { create } from 'zustand';
import { dbManager } from './indexedDB';
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
            const employees = await dbManager.getAll<Employee>('employees');
            set({ employees: employees || [], loading: false });
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
            const newEmployee: Employee = {
                ...employee,
                id: crypto.randomUUID(),
                created_at: new Date().toISOString()
            };
            
            await dbManager.add('employees', newEmployee);
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
            await dbManager.delete('employees', id);
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
            const employees = await dbManager.getByIndex<Employee>('employees', 'user_name', user_name);
            
            // Check if we got exactly one user with matching password
            const user = employees.find(emp => emp.password === password);
            
            if (!user) {
                throw new Error('Invalid user_name or password');
            }

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