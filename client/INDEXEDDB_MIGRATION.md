# Migration from Supabase to IndexedDB

This document explains the changes made to migrate the restaurant app from Supabase to IndexedDB for local data storage.

## Overview

The app has been migrated from using Supabase (cloud database) to IndexedDB (local browser storage). This change allows the app to work completely offline without requiring an internet connection or external database setup.

## What Changed

### 1. New IndexedDB Manager (`src/store/indexedDB.ts`)
- Created a centralized IndexedDB manager class
- Handles database initialization, CRUD operations, and indexing
- Provides a consistent API for all stores

### 2. Updated Stores
All stores have been updated to use IndexedDB instead of Supabase:

- `src/store/useEmployeeStore.ts` - Employee management
- `src/store/useShiftsStore.ts` - Shift scheduling
- `src/store/useLeaveStore.ts` - Leave request management
- `src/store/localStorage/useEmployeeStore.ts` - Local storage version
- `src/store/localStorage/useShiftsStore.ts` - Local storage version
- `src/store/localStorage/useLeaveStore.ts` - Local storage version

### 3. Data Seeding (`src/store/seedData.ts`)
- Automatically seeds the database with initial test data
- Creates sample employees, shifts, and leave requests
- Only runs once when the database is first initialized

### 4. Database Utilities (`src/store/dbUtils.ts`)
- Provides debugging and management functions
- Available globally as `window.dbUtils` for console access

## Database Schema

The IndexedDB contains three object stores:

### Employees Store
- **Key**: `id` (UUID)
- **Indexes**: 
  - `user_name` (unique)
  - `email` (unique)

### Shifts Store
- **Key**: `id` (UUID)
- **Indexes**:
  - `user_id`
  - `shift_date`
  - `user_id_date` (compound index)

### Leave Requests Store
- **Key**: `id` (UUID)
- **Indexes**:
  - `user_id`
  - `status`

## Initial Test Data

The database is automatically seeded with:

- **Admin User**: username: `admin`, password: `admin123`
- **John Doe**: username: `john`, password: `john123`
- **Jane Smith**: username: `jane`, password: `jane123`

## Usage

### Basic Operations
The stores work exactly the same as before - no changes needed in components:

```typescript
import { useEmployeeStore } from './store/useEmployeeStore';

const { fetchEmployees, addEmployee, employees } = useEmployeeStore();

// Fetch all employees
await fetchEmployees();

// Add a new employee
await addEmployee({
  full_name: 'New Employee',
  user_name: 'newuser',
  role: 'employee',
  password: 'password123',
  email: 'new@example.com',
  phone: '+1234567890'
});
```

### Debugging
Use the browser console to access database utilities:

```javascript
// Get database statistics
await window.dbUtils.getDatabaseStats();

// Export all data
await window.dbUtils.exportAllData();

// Clear all data
await window.dbUtils.clearAllData();

// Import data from JSON
await window.dbUtils.importData(jsonString);
```

## Benefits of IndexedDB

1. **Offline First**: App works without internet connection
2. **No Setup Required**: No need for database credentials or configuration
3. **Fast Performance**: Local storage is faster than network requests
4. **Privacy**: All data stays on the user's device
5. **Cost Effective**: No cloud database costs

## Limitations

1. **Data Persistence**: Data is stored locally and may be cleared by browser settings
2. **No Sync**: Data doesn't sync across devices
3. **Storage Limits**: Subject to browser storage quotas
4. **No Backup**: No automatic cloud backup

## Migration Notes

- All existing Supabase API calls have been replaced with IndexedDB operations
- The app maintains the same interface and functionality
- No changes required in React components or UI
- Data is automatically migrated when the app first loads

## Troubleshooting

### Database Not Initializing
Check the browser console for IndexedDB errors. Common issues:
- Browser doesn't support IndexedDB
- Storage quota exceeded
- Private browsing mode (may block IndexedDB)

### Data Not Persisting
- Check browser storage settings
- Ensure cookies and site data are enabled
- Check if browser is in private/incognito mode

### Performance Issues
- Large datasets may cause slower performance
- Consider implementing pagination for large lists
- Use indexes for frequently queried fields

## Future Enhancements

Potential improvements for the IndexedDB implementation:
1. Data compression for large datasets
2. Background sync when internet is available
3. Data export/import functionality
4. Backup and restore capabilities
5. Conflict resolution for concurrent updates
