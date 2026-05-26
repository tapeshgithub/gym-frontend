import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiUserLine, RiFileListLine, RiMedalLine, RiCheckboxCircleLine, RiArrowRightLine,
} from 'react-icons/ri';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { memberService } from '../services/memberService';
import { planService } from '../services/planService';
import { membershipService } from '../services/membershipService';
import StatCard from '../components/StatCard';
import { safeParse } from '../utils/safeData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#16162e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', fontSize: 12 }}>
        <p style={{ color: '#6e6e8a', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [members, setMembers]         = useState([]);
  const [plans, setPlans]             = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [m, p, ms] = await Promise.all([
          memberService.getAll(),
          planService.getAll(),
          membershipService.getAll(),
        ]);

        const cleanM = safeParse(m.data).map(x => ({
          memberId: x.memberId,
          name:     x.name     || '',
          email:    x.email    || '',
          joinDate: x.joinDate || '',
        }));

        const cleanP = safeParse(p.data).map(x => ({
          planId:   x.planId,
          planName: x.planName || '',
          price:    Number(x.price) || 0,
        }));

        // Memberships now come as DTO with memberId, planId, memberName, planName, planPrice
        const cleanMs = safeParse(ms.data).map(x => ({
          membershipId:  x.membershipId,
          memberId:      x.memberId,
          planId:        x.planId,
          memberName:    x.memberName    || `Member #${x.memberId}`,
          planName:      x.planName      || `Plan #${x.planId}`,
          planPrice:     x.planPrice     || 0,
          startDate:     x.startDate     || '',
          endDate:       x.endDate       || '',
          paymentStatus: x.paymentStatus || '',
        }));

        setMembers(cleanM);
        setPlans(cleanP);
        setMemberships(cleanMs);
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const paid    = memberships.filter(ms => ms.paymentStatus?.toUpperCase() === 'PAID').length;
  const unpaid  = memberships.length - paid;
  const revenue = memberships.reduce((sum, ms) => sum + (ms.planPrice || 0), 0);

  const planDist = plans.map(pl => ({
    name:  pl.planName,
    count: memberships.filter(ms => ms.planId === pl.planId).length,
  }));

  const monthlyData = (() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString('default', { month: 'short' });
      const count = memberships.filter(ms => {
        if (!ms.startDate) return false;
        const start = new Date(ms.startDate);
        return start.getMonth() === d.getMonth() && start.getFullYear() === d.getFullYear();
      }).length;
      return { month: label, memberships: count };
    });
  })();

  const recentMembers     = [...members].sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate)).slice(0, 5);
  const recentMemberships = [...memberships].sort((a, b) => new Date(b.startDate) - new Date(a.startDate)).slice(0, 5);

  const cardBase = {
    background: 'rgba(22,22,46,0.7)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard icon={RiUserLine}           label="Total Members"     value={members.length}     color="volt"   delay={0} />
        <StatCard icon={RiFileListLine}       label="Total Plans"       value={plans.length}       color="cyan"   delay={0.05} />
        <StatCard icon={RiMedalLine}          label="Total Memberships" value={memberships.length} color="violet" delay={0.1} />
        <StatCard icon={RiCheckboxCircleLine} label="Paid Memberships"  value={paid}               color="pink"   delay={0.15} sub={`${unpaid} unpaid`} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ ...cardBase, padding: 20, background: 'linear-gradient(135deg, rgba(170,255,0,0.08) 0%, rgba(22,22,46,0.7) 60%)', borderColor: 'rgba(170,255,0,0.15)' }}>
        <div style={{ fontSize: 11, color: '#6e6e8a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Estimated Total Revenue</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>₹{revenue.toLocaleString('en-IN')}</div>
        <div style={{ fontSize: 12, color: '#4a4a6a', marginTop: 4 }}>Based on plan prices across all memberships</div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ ...cardBase, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#a0a0b8', marginBottom: 16 }}>Membership Trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#aaff00" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#aaff00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6e6e8a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6e6e8a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="memberships" stroke="#aaff00" strokeWidth={2} fill="url(#aG)" name="Memberships" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ ...cardBase, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#a0a0b8', marginBottom: 16 }}>Plan Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={planDist} barSize={28}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6e6e8a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6e6e8a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#06b6d4" radius={[6,6,0,0]} name="Members" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ ...cardBase, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#a0a0b8' }}>Recent Members</span>
            <a href="/members" style={{ fontSize: 12, color: '#aaff00', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View all <RiArrowRightLine size={12} /></a>
          </div>
          {loading ? (
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 40, borderRadius: 10, background: 'rgba(37,37,64,0.5)' }} />)}
            </div>
          ) : recentMembers.length === 0 ? (
            <p style={{ padding: 20, fontSize: 13, color: '#4a4a6a', textAlign: 'center' }}>No members yet</p>
          ) : recentMembers.map(m => (
            <div key={m.memberId} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(170,255,0,0.1)', border: '1px solid rgba(170,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#aaff00', flexShrink: 0 }}>
                {m.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                <div style={{ fontSize: 11, color: '#4a4a6a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
              </div>
              {m.joinDate && <span style={{ fontSize: 11, color: '#4a4a6a', flexShrink: 0 }}>{m.joinDate.split('T')[0]}</span>}
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ ...cardBase, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#a0a0b8' }}>Recent Memberships</span>
            <a href="/memberships" style={{ fontSize: 12, color: '#aaff00', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View all <RiArrowRightLine size={12} /></a>
          </div>
          {loading ? (
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 40, borderRadius: 10, background: 'rgba(37,37,64,0.5)' }} />)}
            </div>
          ) : recentMemberships.length === 0 ? (
            <p style={{ padding: 20, fontSize: 13, color: '#4a4a6a', textAlign: 'center' }}>No memberships yet</p>
          ) : recentMemberships.map(ms => {
            const p = ms.paymentStatus?.toUpperCase();
            const badgeColor = p === 'PAID' ? '#aaff00' : p === 'UNPAID' ? '#f87171' : '#f59e0b';
            const badgeBg    = p === 'PAID' ? 'rgba(170,255,0,0.1)' : p === 'UNPAID' ? 'rgba(248,113,113,0.1)' : 'rgba(245,158,11,0.1)';
            return (
              <div key={ms.membershipId} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ms.memberName}</div>
                  <div style={{ fontSize: 11, color: '#4a4a6a' }}>{ms.planName} · {ms.startDate?.split('T')[0] || '—'}</div>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500, color: badgeColor, background: badgeBg, flexShrink: 0 }}>{ms.paymentStatus}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
