import React, { useEffect, useMemo, useState } from 'react';
import useEmployeeStore from '../../store/useEmployeeStore';
import useAnnualLeaveStore from '../../store/useAnnualLeaveStore';

interface ContractForm {
  id?: string;
  user_id: string;
  start_date: string;
  end_date: string;
  hours_per_week: number;
  days_per_week: number;
}

export default function AnnualLeaveFormPage() {
  const { employees, fetchEmployees } = useEmployeeStore();
  const { fetchLatestContractByUser, upsertContract, calculateEntitlement, calculateAndSaveEntitlement, loading, error } = useAnnualLeaveStore();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  // const [leaveYearStart, setLeaveYearStart] = useState<string>('');
  // const [leaveYearEnd, setLeaveYearEnd] = useState<string>('');

  const [form, setForm] = useState<ContractForm>({
    user_id: '',
    start_date: '',
    end_date: '',
    hours_per_week: 0,
    days_per_week: 0,
  });

  useEffect(() => {
    fetchEmployees().catch(() => {});
  }, [fetchEmployees]);

  useEffect(() => {
    if (!selectedUserId) return;
    (async () => {
      const latest = await fetchLatestContractByUser(selectedUserId);
      console.log("latest: ", latest)
      if (latest) {
        
    const res = await calculateEntitlement({
      user_id: selectedUserId,
      contract_id: latest.id,
      // leave_year_start: leaveYearStart,
      // leave_year_end: leaveYearEnd,
    });
    console.log("RESSS:, ", res)
        setForm({
          id: latest.id,
          user_id: latest.user_id,
          start_date: latest.start_date,
          end_date: latest.end_date,
          hours_per_week: latest.hours_per_week,
          days_per_week: latest.days_per_week,
        });
      } else {
        setForm({ id: undefined, user_id: selectedUserId, start_date: '', end_date: '', hours_per_week: 0, days_per_week: 0 });
      }
    })();
  }, [selectedUserId, fetchLatestContractByUser]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'hours_per_week' || name === 'days_per_week' ? Number(value) : value
    }));
  };

  const selectedEmployeeName = useMemo(() => employees.find(e => e.id === selectedUserId)?.full_name || '', [employees, selectedUserId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    if (!form.start_date || !form.end_date) return;
    // if (!leaveYearStart || !leaveYearEnd) return;

    const saved = await upsertContract({
      id: form.id,
      user_id: selectedUserId,
      start_date: form.start_date,
      end_date: form.end_date,
      hours_per_week: form.hours_per_week,
      days_per_week: form.days_per_week,
    });

    const res = await calculateEntitlement({
      user_id: selectedUserId,
      contract_id: saved.id,
      // leave_year_start: leaveYearStart,
      // leave_year_end: leaveYearEnd,
    });
    console.log("RES: ", res)
    return
    await calculateAndSaveEntitlement({
      user_id: selectedUserId,
      contract_id: saved.id,
      // leave_year_start: leaveYearStart,
      // leave_year_end: leaveYearEnd,
    });
    // Optionally show a toast or message; keeping it simple here
    alert('Entitlement calculated and saved');
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h2>Annual Leave Entitlement</h2>
      {error ? (<div style={{ color: 'red' }}>{error}</div>) : null}

      <div style={{ marginBottom: 16 }}>
        <label>Employee</label>
        <select 
        value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} 
        className="w-full p-1 border rounded"
        // style={{ display: 'block', width: '100%', padding: 8 }}
        >
          <option value="">Select employee...</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.full_name}</option>
          ))}
        </select>
      </div>

      {selectedUserId ? (
        <form onSubmit={onSubmit}>
          <fieldset style={{ border: '1px solid #ddd', padding: 16, marginBottom: 16 }}>
            <legend>Contract details {selectedEmployeeName ? `for ${selectedEmployeeName}` : ''}</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label>Start date</label>
                <input type="date" name="start_date" value={form.start_date} onChange={onChange} required />
              </div>
              <div>
                <label>End date</label>
                <input type="date" name="end_date" value={form.end_date} onChange={onChange} required />
              </div>
              <div>
                <label>Hours worked per week</label>
                <input type="number" min={0} step={0.1} name="hours_per_week" value={form.hours_per_week} onChange={onChange} required />
              </div>
              <div>
                <label>Number of days worked per week</label>
                <input type="number" min={0} step={0.1} name="days_per_week" value={form.days_per_week} onChange={onChange} required />
              </div>
            </div>
          </fieldset>

          {/* <fieldset style={{ border: '1px solid #ddd', padding: 16, marginBottom: 16 }}>
            <legend>Leave year window</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label>Leave year start</label>
                <input type="date" value={leaveYearStart} onChange={(e) => setLeaveYearStart(e.target.value)} required />
              </div>
              <div>
                <label>Leave year end</label>
                <input type="date" value={leaveYearEnd} onChange={(e) => setLeaveYearEnd(e.target.value)} required />
              </div>
            </div>
          </fieldset> */}

          <button className="mb-4 bg-blue-500 text-white px-4 py-2 rounded" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Calculate & Save'}</button>
        </form>
      ) : null}
    </div>
  );
}


