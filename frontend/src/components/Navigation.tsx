import React from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Plus, 
  FileText, 
  Radio, 
  MapPin,
  Activity
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'disasters', label: 'Disasters', icon: AlertTriangle },
    { id: 'create-disaster', label: 'Report Disaster', icon: Plus },
    { id: 'create-report', label: 'Submit Report', icon: FileText },
    { id: 'social-media', label: 'Social Feed', icon: Radio },
    { id: 'resources', label: 'Resource Map', icon: MapPin },
  ];

  return (
    <nav className="bg-white border-r border-gray-200 w-full lg:w-64 lg:min-h-screen">
      <div className="p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full animate-pulse-slow"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;