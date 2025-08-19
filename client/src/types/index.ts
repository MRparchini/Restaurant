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