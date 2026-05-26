import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0d0d1f' }}>
      {/* Background */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse at 20% 0%, rgba(124,58,237,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(6,182,212,0.06) 0%, transparent 50%)',
        }}
      />

      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} isDesktop={isDesktop} />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        marginLeft: isDesktop ? '260px' : '0px',
        position: 'relative',
        zIndex: 10,
        transition: 'margin-left 0.3s ease',
      }}>
        <Navbar setOpen={setSidebarOpen} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
