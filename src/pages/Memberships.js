import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiCalendarLine } from 'react-icons/ri';
import { membershipService } from '../services/membershipService';
import { memberService } from '../services/memberService';
import { planService } from '../services/planService';
import Modal from '../components/Modal';
import ConfirmDelete from '../components/ConfirmDelete';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import TableSkeleton from '../components/TableSkeleton';
import toast from 'react-hot-toast';
import { safeParse } from '../utils/safeData';

// Backend now returns MembershipDTO with flat fields:
// membershipId, memberId, memberName, memberEmail, memberPhone,
// planId, planName, planDurationMonths, planPrice,
// startDate, endDate, paymentStatus

const emptyForm = {
  membershipId: null,
  memberId: '',
  planId: '',
  startDate: '',
  endDate: '',
  paymentStatus: 'PAID',
};

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 12,
  background: 'rgba(7,7,15,0.8)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#e8e8ed', fontSize: 14, outline: 'none', boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600, color: '#6e6e8a',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
};

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [members, setMembers]         = useState([]);
  const [plans, setPlans]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [payFilter, setPayFilter]     = useState('ALL');
  const [modalOpen, setModalOpen]     = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const isEdit = !!form.membershipId;

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [msRes, mRes, pRes] = await Promise.all([
        membershipService.getAll(),
        memberService.getAll(),
        planService.getAll(),
      ]);

      // Members - safe parse (handles circular refs from @JsonManagedReference)
      const cleanMembers = safeParse(mRes.data).map(x => ({
        memberId: x.memberId,
        name:     x.name  || '',
        email:    x.email || '',
        phone:    x.phone || '',
      }));

      // Plans - safe parse
      const cleanPlans = safeParse(pRes.data).map(x => ({
        planId:         x.planId,
        planName:       x.planName       || '',
        durationMonths: x.durationMonths || 0,
        price:          Number(x.price)  || 0,
      }));

      // Memberships - now returned as DTO with all fields flat
      const cleanMs = safeParse(msRes.data).map(x => ({
        membershipId:  x.membershipId,
        memberId:      x.memberId,
        memberName:    x.memberName    || (x.memberId ? `Member #${x.memberId}` : '—'),
        memberEmail:   x.memberEmail   || '',
        memberPhone:   x.memberPhone   || '',
        planId:        x.planId,
        planName:      x.planName      || (x.planId ? `Plan #${x.planId}` : '—'),
        planPrice:     x.planPrice     || 0,
        startDate:     x.startDate     || '',
        endDate:       x.endDate       || '',
        paymentStatus: x.paymentStatus || '',
      }));

      setMembers(cleanMembers);
      setPlans(cleanPlans);
      setMemberships(cleanMs);
    } catch (err) {
      console.error('fetchAll error:', err);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = memberships.filter(ms => {
    const matchSearch =
      ms.memberName?.toLowerCase().includes(search.toLowerCase()) ||
      ms.planName?.toLowerCase().includes(search.toLowerCase());
    const matchPay = payFilter === 'ALL' || ms.paymentStatus?.toUpperCase() === payFilter;
    return matchSearch && matchPay;
  });

  const openAdd  = () => { setForm(emptyForm); setModalOpen(true); };
  const openEdit = (ms) => {
    setForm({
      membershipId:  ms.membershipId,
      memberId:      ms.memberId      || '',
      planId:        ms.planId        || '',
      startDate:     ms.startDate     ? ms.startDate.split('T')[0] : '',
      endDate:       ms.endDate       ? ms.endDate.split('T')[0]   : '',
      paymentStatus: ms.paymentStatus || 'PAID',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.memberId || !form.planId || !form.startDate || !form.endDate || !form.paymentStatus) {
      toast.error('All fields are required'); return;
    }
    setSaving(true);
    try {
      const payload = {
        member:        { memberId: Number(form.memberId) },
        plan:          { planId:   Number(form.planId) },
        startDate:     form.startDate,
        endDate:       form.endDate,
        paymentStatus: form.paymentStatus,
      };
      if (isEdit) payload.membershipId = form.membershipId;

      if (isEdit) {
        await membershipService.update(payload);
        toast.success('Membership updated');
      } else {
        await membershipService.save(payload);
        toast.success('Membership created');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error('Save error:', err.response?.data || err.message);
      toast.error('Failed to save: ' + (err.response?.data?.message || err.response?.data || err.message));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await membershipService.delete(deleteModal.id);
      toast.success('Membership deleted');
      setDeleteModal({ open: false, id: null, name: '' });
      fetchAll();
    } catch { toast.error('Failed to delete'); }
  };

  const payBadgeStyle = (ps) => {
    const p = ps?.toUpperCase();
    if (p === 'PAID')   return { background: 'rgba(170,255,0,0.12)',   color: '#aaff00', border: '1px solid rgba(170,255,0,0.25)' };
    if (p === 'UNPAID') return { background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' };
    return                     { background: 'rgba(245,158,11,0.12)',  color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' };
  };

  const filterBtnStyle = (key) => ({
    padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
    cursor: 'pointer', border: '1px solid',
    ...(payFilter === key
      ? key === 'ALL'    ? { background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }
      : key === 'PAID'   ? { background: 'rgba(170,255,0,0.1)',   borderColor: 'rgba(170,255,0,0.3)',   color: '#aaff00' }
      : key === 'UNPAID' ? { background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' }
                         : { background: 'rgba(245,158,11,0.1)',  borderColor: 'rgba(245,158,11,0.3)',  color: '#f59e0b' }
      : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#6e6e8a' }
    ),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by member or plan…" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['ALL', 'PAID', 'UNPAID', 'PENDING'].map(s => (
            <button key={s} onClick={() => setPayFilter(s)} style={filterBtnStyle(s)}>{s}</button>
          ))}
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
          borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #aaff00, #88cc00)',
          color: '#0d0d1f', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          boxShadow: '0 0 20px rgba(170,255,0,0.2)', flexShrink: 0,
        }}>
          <RiAddLine size={16} /> Add Membership
        </button>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{
        background: 'rgba(22,22,46,0.7)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#a0a0b8' }}>
            All Memberships{' '}
            <span style={{ color: '#4a4a6a', fontFamily: 'monospace' }}>({filtered.length})</span>
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['#', 'Member', 'Plan', 'Start Date', 'End Date', 'Payment', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontSize: 11,
                    letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6e6e8a',
                    fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <TableSkeleton rows={5} /> : (
                filtered.map((ms, idx) => (
                  <tr key={ms.membershipId}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', color: '#4a4a6a', fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: '#06b6d4', flexShrink: 0,
                        }}>{ms.memberName?.charAt(0)?.toUpperCase() || '?'}</div>
                        <div>
                          <div style={{ color: '#fff', fontWeight: 500, fontSize: 14 }}>{ms.memberName}</div>
                          {ms.memberEmail && <div style={{ fontSize: 11, color: '#4a4a6a' }}>{ms.memberEmail}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: 12, color: '#a0a0b8',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      }}>{ms.planName}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#a0a0b8', fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RiCalendarLine size={12} />{ms.startDate?.split('T')[0] || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#a0a0b8', fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RiCalendarLine size={12} />{ms.endDate?.split('T')[0] || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                        ...payBadgeStyle(ms.paymentStatus),
                      }}>{ms.paymentStatus || '—'}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(ms)} style={{
                          width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: '#a0a0b8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                          onMouseEnter={e => e.currentTarget.style.color = '#aaff00'}
                          onMouseLeave={e => e.currentTarget.style.color = '#a0a0b8'}
                        ><RiEditLine size={14} /></button>
                        <button onClick={() => setDeleteModal({ open: true, id: ms.membershipId, name: `${ms.memberName}'s membership` })} style={{
                          width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: '#a0a0b8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                          onMouseLeave={e => e.currentTarget.style.color = '#a0a0b8'}
                        ><RiDeleteBinLine size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <EmptyState
              title={search || payFilter !== 'ALL' ? 'No memberships found' : 'No memberships yet'}
              message='Click "Add Membership" to get started'
            />
          )}
        </div>
      </motion.div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? 'Edit Membership' : 'Add Membership'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Member *</label>
            <select value={form.memberId} onChange={e => setForm({ ...form, memberId: e.target.value })} style={inputStyle}>
              <option value="">Select member…</option>
              {members.map(m => <option key={m.memberId} value={m.memberId}>{m.name} ({m.email})</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Plan *</label>
            <select value={form.planId} onChange={e => setForm({ ...form, planId: e.target.value })} style={inputStyle}>
              <option value="">Select plan…</option>
              {plans.map(p => <option key={p.planId} value={p.planId}>{p.planName} — ₹{p.price} / {p.durationMonths}mo</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Start Date *</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                style={{ ...inputStyle, padding: '10px 12px' }} />
            </div>
            <div>
              <label style={labelStyle}>End Date *</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                style={{ ...inputStyle, padding: '10px 12px' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Payment Status *</label>
            <select value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value })} style={inputStyle}>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{
              flex: 1, padding: 10, borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 500,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#a0a0b8',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              flex: 1, padding: 10, borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 600,
              background: 'linear-gradient(135deg, #aaff00, #88cc00)', color: '#0d0d1f',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            }}>
              {saving ? 'Saving…' : isEdit ? 'Update Membership' : 'Add Membership'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        itemName={deleteModal.name}
      />
    </div>
  );
};

export default Memberships;
