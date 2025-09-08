// src/store/useEmployeeStore.ts
import { create } from 'zustand';
import { db } from '../../api/fibase';
import { type Employee } from '../../types';
import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';

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
            const snapshot = await getDocs(collection(db, 'employees'));
            const employees: Employee[] = snapshot.docs.map((d: any) => ({ id: d.id, ...(d.data() as Omit<Employee, 'id'>) }));
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
            const payload = { ...employee, created_at: new Date().toISOString() } as Omit<Employee, 'id'>;
            await addDoc(collection(db, 'employees'), payload);
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
            await deleteDoc(doc(db, 'employees', id));
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
            const q = query(collection(db, 'employees'), where('user_name', '==', user_name), where('password', '==', password));
            const snapshot = await getDocs(q);
            if (snapshot.empty || snapshot.size !== 1) {
                throw new Error('Invalid user_name or password');
            }
            const docSnap = snapshot.docs[0];
            const user: Employee = { id: docSnap.id, ...(docSnap.data() as Omit<Employee, 'id'>) };
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