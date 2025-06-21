import React from 'react';
import { AlertTriangle, Wifi, WifiOff, Bell } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  notifications: string[];
}

const Header: React.FC<HeaderProps> = ({ isConnected, notifications }) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Disaster Response Platform
              </h1>
              <p className="text-xs text-gray-500">
                Real-time coordination & management
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-success-500" />
                  <span className="text-sm text-success-600 font-medium">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-danger-500" />
                  <span className="text-sm text-danger-600 font-medium">Offline</span>
                </>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">NX</span>
              </div>
              <span className="text-sm font-medium text-gray-700">netrunnerX</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;