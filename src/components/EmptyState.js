import React from 'react';
import { RiInboxLine } from 'react-icons/ri';

const EmptyState = ({ title = 'No data found', message = 'Try adjusting your search or add new entries.' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl glass-light flex items-center justify-center mb-4">
      <RiInboxLine size={28} className="text-obsidian-500" />
    </div>
    <h3 className="font-display font-600 text-obsidian-300 mb-1">{title}</h3>
    <p className="text-sm text-obsidian-500 max-w-xs">{message}</p>
  </div>
);

export default EmptyState;
