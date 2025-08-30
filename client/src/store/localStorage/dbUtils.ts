// src/store/dbUtils.ts
import { dbManager } from './indexedDB';

// Utility functions for debugging and managing IndexedDB

export const clearAllData = async () => {
  try {
    await dbManager.clear('employees');
    await dbManager.clear('shifts');
    await dbManager.clear('leave_requests');
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

export const exportAllData = async () => {
  try {
    const employees = await dbManager.getAll('employees');
    const shifts = await dbManager.getAll('shifts');
    const leaves = await dbManager.getAll('leave_requests');
    
    const data = {
      employees,
      shifts,
      leaves,
      exportedAt: new Date().toISOString()
    };
    
    // Create a downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restaurant-app-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('Data exported successfully');
    return data;
  } catch (error) {
    console.error('Error exporting data:', error);
  }
};

export const importData = async (jsonData: string) => {
  try {
    const data = JSON.parse(jsonData);
    
    // Clear existing data
    await clearAllData();
    
    // Import employees
    if (data.employees) {
      for (const employee of data.employees) {
        await dbManager.add('employees', employee);
      }
    }
    
    // Import shifts
    if (data.shifts) {
      for (const shift of data.shifts) {
        await dbManager.add('shifts', shift);
      }
    }
    
    // Import leaves
    if (data.leaves) {
      for (const leave of data.leaves) {
        await dbManager.add('leave_requests', leave);
      }
    }
    
    console.log('Data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

export const getDatabaseStats = async () => {
  try {
    const employees = await dbManager.getAll('employees');
    const shifts = await dbManager.getAll('shifts');
    const leaves = await dbManager.getAll('leave_requests');
    
    return {
      employees: employees.length,
      shifts: shifts.length,
      leaves: leaves.length,
      totalRecords: employees.length + shifts.length + leaves.length
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
};

// Add these functions to the global window object for debugging in console
if (typeof window !== 'undefined') {
  (window as any).dbUtils = {
    clearAllData,
    exportAllData,
    importData,
    getDatabaseStats
  };
}
