import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiTimeLine, RiMoneyDollarCircleLine, RiCheckLine } from 'react-icons/ri';
import { planService } from '../services/planService';
import Modal from '../components/Modal';
import ConfirmDelete from '../components/ConfirmDelete';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const emptyForm = { planId: null, planName: '', durationMonths: '', price: '' };

const extractPlans = (data) => {
  try {
    const safe = JSON.parse(JSON.stringify(data));
    const arr = Array.isArray(safe) ? safe : (safe ? [safe] : []);
    return arr.map(p => ({
      planId: p.planId,
      planName: p.planName || '',
      durationMonths: p.durationMonths || 0,
      price: p.price || 0,
    }));
  } catch (e) {
    return [];
  }
};

const COLORS = [
  { bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)', accent: '#06b6d4' },
  { bg: 'rgba(170,255,0,0.08)', border: 'rgba(170,255,0,0.2)', accent: '#aaff00' },
  { bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', accent: '#a78bfa' },
  { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', accent: '#f59e0b' },
  { bg: 'rgba(255,107,157,0.08)', border: 'rgba(255,107,157,0.2)', accent: '#ff6b9d' },
];

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!form.planId;

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await planService.getAll();
      setPlans(extractPlans(res.data));
    } catch {
      toast.error('Failed to load plans');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const filtered = plans.filter(p =>
    p.planName?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p) => {
    setForm({ planId: p.planId, planName: p.planName, durationMonths: p.durationMonths, price: p.price });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.planName || !form.durationMonths || !form.price) {
      toast.error('All fields are required'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, durationMonths: Number(form.durationMonths), price: Number(form.price) };
      if (isEdit) { await planService.update(payload); toast.success('Plan updated'); }
      else { await planService.save(payload); toast.success('Plan created'); }
      setModalOpen(false);
      fetchPlans();
    } catch { toast.error('Failed to save plan'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await planService.delete(deleteModal.id);
      toast.success('Plan deleted');
      setDeleteModal({ open: false, id: null, name: '' });
      fetchPlans();
    } catch { toast.error('Failed to delete plan'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search plans…" />
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #aaff00, #88cc00)',
          color: '#0d0d1f', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          boxShadow: '0 0 20px rgba(170,255,0,0.2)', flexShrink: 0,
        }}>
          <RiAddLine size={16} /> Add Plan
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 220, borderRadius: 16, background: 'rgba(37,37,64,0.5)', animation: 'pulse 2s infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title={search ? 'No plans found' : 'No plans yet'} message="Create your first plan to get started" />
      ) : (
        <AnimatePresence>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {filtered.map((plan, idx) => {
              const c = COLORS[idx % COLORS.length];
              return (
                <motion.div key={plan.planId}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    background: `linear-gradient(135deg, ${c.bg} 0%, rgba(22,22,46,0.7) 70%)`,
                    border: `1px solid ${c.border}`,
                    borderRadius: 16, padding: 20,
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  whileHover={{ y: -4 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>{plan.planName}</div>
                      <div style={{ fontSize: 12, color: c.accent, marginTop: 2 }}>Subscription Plan</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(plan)} style={{
                        width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: '#a0a0b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                        onMouseEnter={e => e.currentTarget.style.color = '#aaff00'}
                        onMouseLeave={e => e.currentTarget.style.color = '#a0a0b8'}
                      ><RiEditLine size={13} /></button>
                      <button onClick={() => setDeleteModal({ open: true, id: plan.planId, name: plan.planName })} style={{
                        width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: '#a0a0b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color = '#a0a0b8'}
                      ><RiDeleteBinLine size={13} /></button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: c.accent }}>
                      ₹{Number(plan.price).toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: 12, color: '#6e6e8a', marginLeft: 4 }}>/ plan</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#a0a0b8' }}>
                      <RiTimeLine size={14} color={c.accent} />
                      {plan.durationMonths} month{plan.durationMonths !== 1 ? 's' : ''} duration
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#a0a0b8' }}>
                      <RiMoneyDollarCircleLine size={14} color={c.accent} />
                      ₹{Math.round(plan.price / (plan.durationMonths || 1)).toLocaleString('en-IN')} per month
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#a0a0b8' }}>
                      <RiCheckLine size={14} color={c.accent} />
                      Full gym access
                    </div>
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 11, color: '#4a4a6a', fontFamily: 'monospace' }}>ID: {plan.planId}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? 'Edit Plan' : 'Create New Plan'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Plan Name *', key: 'planName', type: 'text', placeholder: 'e.g. Gold Monthly' },
            { label: 'Duration (Months) *', key: 'durationMonths', type: 'number', placeholder: 'e.g. 3' },
            { label: 'Price (₹) *', key: 'price', type: 'number', placeholder: 'e.g. 1500' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6e6e8a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
              <input
                type={type} value={form[key]} placeholder={placeholder}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                min={type === 'number' ? '0' : undefined}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(7,7,15,0.8)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e8e8ed', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#aaff00'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          ))}
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
              {saving ? 'Saving…' : isEdit ? 'Update Plan' : 'Create Plan'}
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

export default Plans;
