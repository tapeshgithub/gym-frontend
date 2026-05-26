import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color, delay = 0, sub }) => {
  const colorMap = {
    volt: { bg: 'rgba(170,255,0,0.08)', border: 'rgba(170,255,0,0.2)', icon: '#aaff00' },
    cyan: { bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)', icon: '#06b6d4' },
    pink: { bg: 'rgba(255,107,157,0.08)', border: 'rgba(255,107,157,0.2)', icon: '#ff6b9d' },
    amber: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: '#f59e0b' },
    violet: { bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', icon: '#a78bfa' },
  };
  const c = colorMap[color] || colorMap.volt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card-base p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          <Icon size={20} style={{ color: c.icon }} />
        </div>
      </div>
      <p className="text-2xl font-display font-700 text-white mb-1">{value ?? '—'}</p>
      <p className="text-sm text-obsidian-400">{label}</p>
      {sub && <p className="text-xs text-obsidian-500 mt-1">{sub}</p>}
    </motion.div>
  );
};

export default StatCard;
