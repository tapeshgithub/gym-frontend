import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiPhoneLine, RiMailLine, RiCalendarLine } from 'react-icons/ri';
import { memberService } from '../services/memberService';
import Modal from '../components/Modal';
import ConfirmDelete from '../components/ConfirmDelete';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import TableSkeleton from '../components/TableSkeleton';
import toast from 'react-hot-toast';

const emptyForm = { memberId: null, name: '', phone: '', email: '', joinDate: '' };

const extractMembers = (data) => {
  try {
    const arr = Array.isArray(data) ? data : (data ? [data] : []);
    return arr.map(m => ({
      memberId: m.memberId,
      name:     m.name     || '',
      email:    m.email    || '',
      phone:    m.phone    || '',
      joinDate: m.joinDate || '',
    }));
  } catch (e) {
    return [];
  }
};

const Members = () => {
  const [members, setMembers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const isEdit = !!form.memberId;

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res  = await memberService.getAll();
      const safe = JSON.parse(JSON.stringify(res.data));
      setMembers(extractMembers(safe));
    } catch (err) {
      toast.error('Failed to load members');
    }
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search)
  );

  const openAdd  = () => { setForm(emptyForm); setModalOpen(true); };
  const openEdit = (m) => {
    // joinDate from backend can be "2026-05-05" or ["2026", "5", "5"] array
    let jd = '';
    if (m.joinDate) {
      if (Array.isArray(m.joinDate)) {
        // Spring sometimes returns date as [year, month, day] array
        const [y, mo, d] = m.joinDate;
        jd = `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      } else {
        jd = String(m.joinDate).split('T')[0];
      }
    }
    setForm({
      memberId: m.memberId,
      name:     m.name  || '',
      phone:    m.phone || '',
      email:    m.email || '',
      joinDate: jd,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    setSaving(true);
    try {
      // Build payload - always send joinDate as "YYYY-MM-DD" string
      // Spring Boot with LocalDate will parse it correctly
      const payload = {
        name:     form.name,
        phone:    form.phone,
        email:    form.email,
        joinDate: form.joinDate || null,
      };

      if (isEdit) {
        payload.memberId = form.memberId;
        await memberService.update(payload);
        toast.success('Member updated');
      } else {
        await memberService.save(payload);
        toast.success('Member added');
      }
      setModalOpen(false);
      fetchMembers();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Unknown error';
      toast.error('Failed to save: ' + msg);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await memberService.delete(deleteModal.id);
      toast.success('Member deleted');
      setDeleteModal({ open: false, id: null, name: '' });
      fetchMembers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const cardStyle = {
    background: 'rgba(22,22,46,0.7)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search members…" />
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #aaff00, #88cc00)',
          color: '#0d0d1f', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          boxShadow: '0 0 20px rgba(170,255,0,0.2)', flexShrink: 0,
        }}>
          <RiAddLine size={16} /> Add Member
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#a0a0b8' }}>
            All Members <span style={{ color: '#4a4a6a', fontFamily: 'monospace' }}>({filtered.length})</span>
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['#', 'Name', 'Email', 'Phone', 'Join Date', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontSize: 11,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: '#6e6e8a', fontWeight: 600,
                    borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <TableSkeleton rows={5} /> : (
                filtered.map((m, idx) => (
                  <tr key={m.memberId}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', color: '#4a4a6a', fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'rgba(170,255,0,0.1)', border: '1px solid rgba(170,255,0,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: '#aaff00', flexShrink: 0,
                        }}>{m.name?.charAt(0)?.toUpperCase() || '?'}</div>
                        <span style={{ color: '#fff', fontWeight: 500, fontSize: 14 }}>{m.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#a0a0b8', fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><RiMailLine size={13} />{m.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#a0a0b8', fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><RiPhoneLine size={13} />{m.phone || '—'}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#a0a0b8', fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RiCalendarLine size={13} />
                        {Array.isArray(m.joinDate)
                          ? `${m.joinDate[0]}-${String(m.joinDate[1]).padStart(2,'0')}-${String(m.joinDate[2]).padStart(2,'0')}`
                          : m.joinDate ? String(m.joinDate).split('T')[0] : '—'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(m)} style={{
                          width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: '#a0a0b8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                          onMouseEnter={e => e.currentTarget.style.color = '#aaff00'}
                          onMouseLeave={e => e.currentTarget.style.color = '#a0a0b8'}
                        ><RiEditLine size={14} /></button>
                        <button onClick={() => setDeleteModal({ open: true, id: m.memberId, name: m.name })} style={{
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
              title={search ? 'No members found' : 'No members yet'}
              message={search ? 'Try a different search' : 'Click "Add Member" to get started'}
            />
          )}
        </div>
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? 'Edit Member' : 'Add New Member'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'John Doe' },
            { label: 'Email *', key: 'email', type: 'email', placeholder: 'john@example.com' },
            { label: 'Phone', key: 'phone', type: 'text', placeholder: '+91 9999999999' },
            { label: 'Join Date', key: 'joinDate', type: 'date', placeholder: '' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6e6e8a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
              <input
                type={type} value={form[key]} placeholder={placeholder}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
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
              {saving ? 'Saving…' : isEdit ? 'Update Member' : 'Add Member'}
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

export default Members;
