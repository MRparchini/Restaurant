import { create } from 'zustand';
import { dbManager } from './indexedDB';
import { type EmployeeContract, type AnnualLeaveEntitlement } from '../../types';

interface AnnualLeaveState {
  contracts: EmployeeContract[];
  entitlements: AnnualLeaveEntitlement[];
  loading: boolean;
  error: string | null;
  fetchLatestContractByUser: (user_id: string) => Promise<EmployeeContract | null>;
  upsertContract: (contract: Omit<EmployeeContract, 'id' | 'created_at'> & Partial<Pick<EmployeeContract, 'id'>>) => Promise<EmployeeContract>;
  calculateAndSaveEntitlement: (params: {
    user_id: string;
    contract_id: string;
    // leave_year_start: string;
    // leave_year_end: string;
  }) => Promise<AnnualLeaveEntitlement>;
  calculateEntitlement: (params: {
    user_id: string;
    contract_id: string;
    // leave_year_start: string;
    // leave_year_end: string;
  }) => Promise<AnnualLeaveEntitlement>;
}

function calculateEntitlementDays(_hoursPerWeek: number, daysPerWeek: number) {
  // Base UK entitlement for part-time: 5.6 weeks
  // Convert to days based on daysPerWeek
  const fullYearDays = 5.6 * daysPerWeek;
  return +(fullYearDays).toFixed(2);
}

function calculateEntitlementHours(hoursPerWeek: number) {
  // start_date: contract.start_date,
  //       end_date: contract.end_date,
  //       hours_per_week: contract.hours_per_week,
  //       days_per_week: contract.days_per_week,
 const fullYearHours = 5.6 * hoursPerWeek;
  return +(fullYearHours).toFixed(2);
}

// function getYearPortion(startISO: string, endISO: string, leaveYearStartISO: string, leaveYearEndISO: string) {
//   const start = new Date(startISO);
//   const end = new Date(endISO);
//   const lyStart = new Date(leaveYearStartISO);
//   const lyEnd = new Date(leaveYearEndISO);

//   const periodStart = start > lyStart ? start : lyStart;
//   const periodEnd = end < lyEnd ? end : lyEnd;
//   const totalMs = lyEnd.getTime() - lyStart.getTime();
//   const activeMs = Math.max(0, periodEnd.getTime() - periodStart.getTime());
//   const portion = totalMs > 0 ? activeMs / totalMs : 0;
//   return Math.min(1, Math.max(0, portion));
// }

export const useAnnualLeaveStore = create<AnnualLeaveState>((set) => ({
  contracts: [],
  entitlements: [],
  loading: false,
  error: null,

  fetchLatestContractByUser: async (user_id) => {
    set({ loading: true, error: null });
    try {
      const all = await dbManager.getByIndex<EmployeeContract>('employee_contracts', 'user_id', user_id);
      const latest = all.sort((a, b) => (b.created_at.localeCompare(a.created_at)))[0] || null;
      set({ contracts: latest ? [latest] : [], loading: false });
      return latest;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load contract', loading: false });
      return null;
    }
  },

  upsertContract: async (contract) => {
    set({ loading: true, error: null });
    try {
      const nowISO = new Date().toISOString();
      const id = contract.id ?? crypto.randomUUID();
      const full: EmployeeContract = {
        id,
        user_id: contract.user_id,
        start_date: contract.start_date,
        end_date: contract.end_date,
        hours_per_week: contract.hours_per_week,
        days_per_week: contract.days_per_week,
        created_at: contract.id ? (contract as any).created_at ?? nowISO : nowISO
      };

      if (contract.id) {
        await dbManager.update('employee_contracts', full);
      } else {
        await dbManager.add('employee_contracts', full);
      }

      set({ contracts: [full], loading: false });
      return full;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to save contract', loading: false });
      throw err;
    }
  },

  calculateAndSaveEntitlement: async ({ user_id, contract_id }) => {
    set({ loading: true, error: null });
    try {
      const contract = await dbManager.get<EmployeeContract>('employee_contracts', contract_id);
      if (!contract) throw new Error('Contract not found');

      // const portion = getYearPortion(contract.start_date, contract.end_date, leave_year_start, leave_year_end);
      const entitlement_days = calculateEntitlementDays(contract.hours_per_week, contract.days_per_week);
      const entitlement_hours = calculateEntitlementHours(contract.hours_per_week);

      const result: AnnualLeaveEntitlement = {
        id: crypto.randomUUID(),
        user_id,
        contract_id,
        // leave_year_start,
        // leave_year_end,
        entitlement_hours,
        entitlement_days,
        calculation_basis: 'hours_per_week_5_6_pro_rata',
        created_at: new Date().toISOString()
      };

      await dbManager.add('annual_leave_entitlements', result);
      set((state) => ({ entitlements: [result, ...state.entitlements], loading: false }));
      return result;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to calculate entitlement', loading: false });
      throw err;
    }
  },
  calculateEntitlement: async ({ user_id, contract_id }) => {
    set({ loading: true, error: null });
    try {
      const contract = await dbManager.get<EmployeeContract>('employee_contracts', contract_id);
      if (!contract) throw new Error('Contract not found');
      
      // const portion = getYearPortion(contract.start_date, contract.end_date, leave_year_start, leave_year_end);
      // console.log(portion)
      const entitlement_days = calculateEntitlementDays(contract.hours_per_week, contract.days_per_week);
      const entitlement_hours = calculateEntitlementHours(contract.hours_per_week);
      
      const result: any = {
        // id: crypto.randomUUID(),
        user_id,
        // contract_id,
        // leave_year_start,
        // leave_year_end,
        entitlement_hours,
        entitlement_days,
        calculation_basis: 'hours_per_week_5_6_pro_rata',
        // created_at: new Date().toISOString()
      };
      
      set((state) => ({ entitlements: [result, ...state.entitlements], loading: false }));
      return result;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to calculate entitlement', loading: false });
      throw err;
    }
  }
}));

export default useAnnualLeaveStore;


