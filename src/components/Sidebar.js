import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiDashboardLine, RiUserLine, RiFileListLine,
  RiMedalLine, RiLogoutBoxLine, RiFlashlightLine,
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/members',   icon: RiUserLine,      label: 'Members' },
  { to: '/plans',     icon: RiFileListLine,  label: 'Plans' },
  { to: '/memberships', icon: RiMedalLine,   label: 'Memberships' },
];

const SIDEBAR_W = 260;

const Sidebar = ({ open, setOpen, isDesktop }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: `${SIDEBAR_W}px`,
    zIndex: 30,
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(180deg, #0d0d1f 0%, #10101e 100%)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    transform: isDesktop ? 'translateX(0)' : open ? 'translateX(0)' : `translateX(-${SIDEBAR_W}px)`,
    transition: 'transform 0.3s ease',
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!isDesktop && open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 20,
            }}
          />
        )}
      </AnimatePresence>

      <div style={sidebarStyle}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'linear-gradient(135deg, #aaff00, #88cc00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(170,255,0,0.3)',
            flexShrink: 0,
          }}>
            <RiFlashlightLine size={18} color="#0d0d1f" />
          </div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', lineHeight: 1 }}>
              GymOS
            </div>
            <div style={{ fontSize: 11, color: '#6e6e8a', marginTop: 2 }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav label */}
        <div style={{ padding: '0 16px 8px', fontSize: 10, fontFamily: "'Syne', sans-serif", fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4a4a6a' }}>
          Main Menu
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => !isDesktop && setOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 12,
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                transition: 'all 0.2s ease',
                background: isActive ? 'rgba(170,255,0,0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(170,255,0,0.2)' : '1px solid transparent',
                color: isActive ? '#aaff00' : '#a0a0b8',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} color={isActive ? '#aaff00' : '#6e6e8a'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '16px 12px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            padding: '12px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ fontSize: 11, color: '#6e6e8a' }}>Logged in as</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || 'Admin'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500, color: '#6e6e8a',
              transition: 'all 0.2s ease', width: '100%',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6e6e8a'; }}
          >
            <RiLogoutBoxLine size={18} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
