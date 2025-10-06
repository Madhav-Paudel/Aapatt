import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/map', icon: '🗺️', label: 'Live Map' },
    { path: '/providers', icon: '🚑', label: 'Providers' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-primary">🚨 Aapatt</h1>
        <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              location.pathname === item.path
                ? 'bg-primary text-white'
                : 'hover:bg-gray-800 text-gray-300'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">Version 1.0.0</p>
        <p className="text-xs text-gray-500 mt-1">© 2024 Aapatt</p>
      </div>
    </div>
  );
};

export default Sidebar;
