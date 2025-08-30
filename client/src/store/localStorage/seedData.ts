// src/store/seedData.ts
import { dbManager } from './indexedDB';
import type { Employee, Shift, LeaveRequest } from '../../types';

export const seedInitialData = async () => {
  try {
    // Check if data already exists
    const existingEmployees = await dbManager.getAll<Employee>('employees');
    if (existingEmployees.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database with initial data...');

    // Seed employees
    const employees: Omit<Employee, 'id' | 'created_at'>[] = [
      {
        full_name: 'Admin User',
        user_name: 'admin',
        role: 'admin',
        password: 'admin123',
        email: 'admin@restaurant.com',
        phone: '+1234567890'
      },
      {
        full_name: 'John Doe',
        user_name: 'john',
        role: 'employee',
        password: 'john123',
        email: 'john@restaurant.com',
        phone: '+1234567891'
      },
      {
        full_name: 'Jane Smith',
        user_name: 'jane',
        role: 'employee',
        password: 'jane123',
        email: 'jane@restaurant.com',
        phone: '+1234567892'
      }
    ];

    for (const employee of employees) {
      const newEmployee: Employee = {
        ...employee,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      await dbManager.add('employees', newEmployee);
    }

    // Seed shifts
    const shifts: Omit<Shift, 'id' | 'created_at'>[] = [
      {
        user_id: employees[0].user_name, // admin
        user_name: 'Admin User',
        shift_date: '2025-01-20',
        start_time: '08:00:00',
        end_time: '16:00:00',
        position: 'Manager',
        rota_hours: 8
      },
      {
        user_id: employees[1].user_name, // john
        user_name: 'John Doe',
        shift_date: '2025-01-20',
        start_time: '16:00:00',
        end_time: '24:00:00',
        position: 'Cashier',
        rota_hours: 8
      },
      {
        user_id: employees[2].user_name, // jane
        user_name: 'Jane Smith',
        shift_date: '2025-01-21',
        start_time: '12:00:00',
        end_time: '20:00:00',
        position: 'Server',
        rota_hours: 8
      }
    ];

    for (const shift of shifts) {
      const newShift: Shift = {
        ...shift,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      await dbManager.add('shifts', newShift);
    }

    // Seed leave requests
    const leaveRequests: Omit<LeaveRequest, 'id' | 'created_at'>[] = [
      {
        user_id: employees[1].user_name, // john
        user_name: 'John Doe',
        start_date: '2025-02-01',
        end_date: '2025-02-03',
        reason: 'Family vacation',
        status: 'pending'
      },
      {
        user_id: employees[2].user_name, // jane
        user_name: 'Jane Smith',
        start_date: '2025-02-15',
        end_date: '2025-02-16',
        reason: 'Medical appointment',
        status: 'approved'
      }
    ];

    for (const leave of leaveRequests) {
      const newLeave: LeaveRequest = {
        ...leave,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      await dbManager.add('leave_requests', newLeave);
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Auto-seed when this module is imported
dbManager.init().then(() => {
  seedInitialData();
}).catch(console.error);
