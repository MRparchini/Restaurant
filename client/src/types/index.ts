// src/types/index.ts
export interface Employee {
  id: string;
  full_name: string;
  user_name: string;
  role: 'admin' | 'employee';
  password: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Shift {
  id: string;
  user_id: string;
  user_name: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  position: string;
  rota_hours: number;
  created_at?: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  user_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface WeeklySchedule {
  shift_index: number;
  user_id: string;
  position: number;
  user_name: string;
  shifts: {
    [date: string]: {
      start_time: string;
      end_time: string;
    } | null;
  };
  rota_hours: number;
}

export type ShiftTab = 'today' | 'week' | 'upcoming';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface EmployeeContract {
  id: string;
  user_id: string;
  start_date: string; // ISO yyyy-MM-dd
  end_date: string;   // ISO yyyy-MM-dd
  hours_per_week: number;
  days_per_week: number;
  created_at: string; // ISO
}

export interface AnnualLeaveEntitlement {
  id: string;
  user_id: string;
  contract_id: string;
  leave_year_start: string; // ISO yyyy-MM-dd
  leave_year_end: string;   // ISO yyyy-MM-dd
  entitlement_hours: number;
  entitlement_days: number;
  calculation_basis: 'hours_per_week_5_6_pro_rata';
  created_at: string;
}