import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Rocket, FileText, Gift, Settings } from 'lucide-react';
import { cn } from '../utils/cn';

export const AdminNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'main', icon: <Rocket size={24} />, path: '/admin/event', label: 'Главная' },
    { id: 'log', icon: <FileText size={24} />, path: '/log', label: 'Журнал' },
    { id: 'chests', icon: <Gift size={24} />, path: '/admin/chests', label: 'Сундуки' },
    { id: 'settings', icon: <Settings size={24} />, path: '#', label: 'Настройки' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-surface-2 border-t border-surface-1 py-3 px-6 z-50">
      <div className="flex justify-between items-center">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-pos-1" : "text-text-muted hover:text-white"
              )}
            >
              {item.icon}
              <span className="text-[10px] font-exo font-semibold">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  );
};
