import React, { useState } from 'react';
import { Home, Layers, Bookmark, Settings, BarChart3, MessageSquare, LogOut, ClipboardClock,PackageSearch,UserPlus   } from 'lucide-react';
import Logo from "../../assets/idea-lab.png"

export const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('home');

  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'equipment', icon: PackageSearch, label: 'Equipment' },
    { id: 'approval', icon: ClipboardClock, label: 'Approval' },
    { id: 'projects', icon: Layers, label: 'Projects' },
    { id: 'adminUser', icon: UserPlus, label: 'Admin Access' },
   
  ];

  const bottomItems = [

    { id: 'logout', icon: LogOut, label: 'Logout' },
  ];

  return (
    <div className="flex flex-col h-screen w-16 bg-white border-r border-gray-200 py-4 items-center justify-between">
      {/* Top Section */}
      <div className="flex flex-col items-center space-y-1">
        {/* Logo */}
        <div>
        <img src={Logo} alt="" className="h-10 mb-3" />
        <hr className="border-gray-300" />
        </div>       

        {/* Main Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 relative group ${
                activeItem === item.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 relative group ${
                activeItem === item.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};