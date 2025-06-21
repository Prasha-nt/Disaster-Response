import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Bell
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import DisasterForm from './components/DisasterForm';
import ReportForm from './components/ReportForm';
import DisasterList from './components/DisasterList';
import SocialMediaFeed from './components/SocialMediaFeed';
import ResourceMap from './components/ResourceMap';
import Header from './components/Header';
import Navigation from './components/Navigation';

const API_BASE_URL = '/api';

export interface Disaster {
  id: string;
  title: string;
  location_name: string;
  description: string;
  tags: string[];
  owner_id: string;
  created_at: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Report {
  id: string;
  disaster_id: string;
  user_id: string;
  content: string;
  image_url?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export interface Resource {
  id: string;
  disaster_id: string;
  name: string;
  location_name: string;
  type: string;
  created_at: string;
  location?: {
    lat: number;
    lng: number;
  };
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [socialMediaPosts, setSocialMediaPosts] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      addNotification('Connected to disaster coordination system');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      addNotification('Disconnected from system');
    });

    newSocket.on('disaster_updated', (data) => {
      addNotification(`Disaster updated: ${data.title}`);
      loadDisasters();
    });

    newSocket.on('social_media_updated', (data) => {
      addNotification('New social media reports available');
      setSocialMediaPosts(prev => [data, ...prev].slice(0, 50));
    });

    newSocket.on('resources_updated', (data) => {
      addNotification(`New resource available: ${data.name}`);
      loadResources();
    });

    loadDisasters();
    loadReports();
    loadResources();
    loadSocialMedia();

    return () => {
      newSocket.close();
    };
  }, []);

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 10));
    setTimeout(() => {
      setNotifications(prev => prev.slice(0, -1));
    }, 5000);
  };

  const loadDisasters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/disasters`);
      if (response.ok) {
        const data = await response.json();
        setDisasters(data);
      }
    } catch (error) {
      console.error('Failed to load disasters:', error);
    }
  };

  const loadReports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`);
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const loadResources = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resources`);
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Failed to load resources:', error);
    }
  };

  const loadSocialMedia = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media`);
      if (response.ok) {
        const data = await response.json();
        setSocialMediaPosts(data);
      }
    } catch (error) {
      console.error('Failed to load social media:', error);
    }
  };

  const handleDisasterCreated = (disaster: Disaster) => {
    setDisasters(prev => [disaster, ...prev]);
    addNotification(`New disaster reported: ${disaster.title}`);
  };

  const handleReportCreated = (report: Report) => {
    setReports(prev => [report, ...prev]);
    addNotification('New report submitted');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            disasters={disasters}
            reports={reports}
            resources={resources}
            socialMediaPosts={socialMediaPosts}
            isConnected={isConnected}
            onTabChange={setActiveTab}
          />
        );
      case 'disasters':
        return <DisasterList disasters={disasters} onRefresh={loadDisasters} />;
      case 'create-disaster':
        return <DisasterForm onDisasterCreated={handleDisasterCreated} />;
      case 'create-report':
        return <ReportForm disasters={disasters} onReportCreated={handleReportCreated} />;
      case 'social-media':
        return <SocialMediaFeed posts={socialMediaPosts} onRefresh={loadSocialMedia} />;
      case 'resources':
        return <ResourceMap resources={resources} disasters={disasters} />;
      default:
        return (
          <Dashboard
            disasters={disasters}
            reports={reports}
            resources={resources}
            socialMediaPosts={socialMediaPosts}
            isConnected={isConnected}
            onTabChange={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isConnected={isConnected} notifications={notifications} />

      <div className="flex flex-col lg:flex-row">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>

      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.slice(0, 3).map((notification, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm animate-slide-up"
          >
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-primary-500" />
              <p className="text-sm text-gray-800">{notification}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
