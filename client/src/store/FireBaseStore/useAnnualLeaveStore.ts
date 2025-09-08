import { create } from 'zustand';
import { db } from '../../api/fibase';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
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
    leave_year_start: string;
    leave_year_end: string;
  }) => Promise<AnnualLeaveEntitlement>;
}

function calculateEntitlementDays(hoursPerWeek: number, daysPerWeek: number, leaveDaysInYearPortion: number) {
  const fullYearDays = 5.6 * daysPerWeek;
  return +(fullYearDays * leaveDaysInYearPortion).toFixed(2);
}

function calculateEntitlementHours(hoursPerWeek: number, leaveWeeksPortion: number) {
  const fullYearHours = 5.6 * hoursPerWeek;
  return +(fullYearHours * leaveWeeksPortion).toFixed(2);
}

function getYearPortion(startISO: string, endISO: string, leaveYearStartISO: string, leaveYearEndISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const lyStart = new Date(leaveYearStartISO);
  const lyEnd = new Date(leaveYearEndISO);
  const periodStart = start > lyStart ? start : lyStart;
  const periodEnd = end < lyEnd ? end : lyEnd;
  const totalMs = lyEnd.getTime() - lyStart.getTime();
  const activeMs = Math.max(0, periodEnd.getTime() - periodStart.getTime());
  const portion = totalMs > 0 ? activeMs / totalMs : 0;
  return Math.min(1, Math.max(0, portion));
}

export const useAnnualLeaveStore = create<AnnualLeaveState>((set) => ({
  contracts: [],
  entitlements: [],
  loading: false,
  error: null,

  fetchLatestContractByUser: async (user_id) => {
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, 'employee_contracts'), where('user_id', '==', user_id), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const latest = snapshot.docs[0] ? ({ id: snapshot.docs[0].id, ...(snapshot.docs[0].data() as any) } as EmployeeContract) : null;
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
      if (contract.id) {
        const ref = doc(db, 'employee_contracts', contract.id);
        const existing = await getDoc(ref);
        if (!existing.exists()) throw new Error('Contract not found');
        await updateDoc(ref, {
          user_id: contract.user_id,
          start_date: contract.start_date,
          end_date: contract.end_date,
          hours_per_week: contract.hours_per_week,
          days_per_week: contract.days_per_week
        });
        const updated: EmployeeContract = { id: contract.id, ...(await getDoc(ref)).data() as any };
        set({ contracts: [updated], loading: false });
        return updated;
      } else {
        const payload = {
          user_id: contract.user_id,
          start_date: contract.start_date,
          end_date: contract.end_date,
          hours_per_week: contract.hours_per_week,
          days_per_week: contract.days_per_week,
          created_at: nowISO
        } as Omit<EmployeeContract, 'id'>;
        const created = await addDoc(collection(db, 'employee_contracts'), payload as any);
        const saved: EmployeeContract = { id: created.id, ...(payload as any) };
        set({ contracts: [saved], loading: false });
        return saved;
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to save contract', loading: false });
      throw err;
    }
  },

  calculateAndSaveEntitlement: async ({ user_id, contract_id, leave_year_start, leave_year_end }) => {
    set({ loading: true, error: null });
    try {
      const ref = doc(db, 'employee_contracts', contract_id);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('Contract not found');
      const contract = { id: ref.id, ...(snap.data() as any) } as EmployeeContract;

      const portion = getYearPortion(contract.start_date, contract.end_date, leave_year_start, leave_year_end);
      const entitlement_days = calculateEntitlementDays(contract.hours_per_week, contract.days_per_week, portion);
      const entitlement_hours = calculateEntitlementHours(contract.hours_per_week, portion);

      const payload = {
        user_id,
        contract_id,
        leave_year_start,
        leave_year_end,
        entitlement_hours,
        entitlement_days,
        calculation_basis: 'hours_per_week_5_6_pro_rata',
        created_at: new Date().toISOString()
      } as Omit<AnnualLeaveEntitlement, 'id'>;

      const created = await addDoc(collection(db, 'annual_leave_entitlements'), payload as any);
      const result: AnnualLeaveEntitlement = { id: created.id, ...(payload as any) };
      set((state) => ({ entitlements: [result, ...state.entitlements], loading: false }));
      return result;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to calculate entitlement', loading: false });
      throw err;
    }
  }
}));

export default useAnnualLeaveStore;


