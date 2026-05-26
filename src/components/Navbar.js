import React from 'react';
import { useLocation } from 'react-router-dom';
import { RiMenu2Line } from 'react-icons/ri';

const pageTitles = {
  '/dashboard':   { title: 'Dashboard',   sub: 'Overview of your gym operations' },
  '/members':     { title: 'Members',     sub: 'Manage your gym members' },
  '/plans':       { title: 'Plans',       sub: 'Subscription plans & pricing' },
  '/memberships': { title: 'Memberships', sub: 'Active & expired memberships' },
};

const Navbar = ({ setOpen }) => {
  const { pathname } = useLocation();
  const { title, sub } = pageTitles[pathname] || { title: 'GymOS', sub: '' };

  return (
    <header style={{
      height: 64, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px',
      position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(13,13,31,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => setOpen(p => !p)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#a0a0b8',
          }}
        >
          <RiMenu2Line size={18} />
        </button>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', lineHeight: 1 }}>
            {title}
          </div>
          {sub && <div style={{ fontSize: 12, color: '#6e6e8a', marginTop: 3 }}>{sub}</div>}
        </div>
      </div>

      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'linear-gradient(135deg, #aaff00, #88cc00)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: '#0d0d1f',
      }}>
        G
      </div>
    </header>
  );
};

export default Navbar;
