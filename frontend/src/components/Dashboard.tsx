import React from 'react';
import {
  AlertTriangle,
  MapPin,
  Radio,
  Activity,
  Clock,
  Shield,
} from 'lucide-react';
import { Disaster, Report, Resource } from '../App';

interface DashboardProps {
  disasters: Disaster[];
  reports: Report[];
  resources: Resource[];
  socialMediaPosts: any[];
  isConnected: boolean;
  onTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  disasters,
  reports,
  resources,
  socialMediaPosts,
  isConnected,
  onTabChange,
}) => {
  const urgentDisasters = disasters.filter(d => d.tags.includes('urgent')).length;
  const verifiedReports = reports.filter(r => r.verification_status === 'verified').length;

  const recentActivity = [...disasters, ...reports]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-1`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg').replace('600', '50')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Status Banner */}
      <div
        className={`p-4 rounded-lg border ${
          isConnected
            ? 'bg-success-50 border-success-200 text-success-800'
            : 'bg-danger-50 border-danger-200 text-danger-800'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span className="font-medium">
            System Status: {isConnected ? 'Online & Monitoring' : 'Connection Issues'}
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Disasters"
          value={disasters.length}
          icon={AlertTriangle}
          color="text-danger-600"
          subtitle={`${urgentDisasters} urgent`}
        />
        <StatCard
          title="Active Reports"
          value={reports.length}
          icon={Shield}
          color="text-primary-600"
          subtitle={`${verifiedReports} verified`}
        />
        <StatCard
          title="Available Resources"
          value={resources.length}
          icon={MapPin}
          color="text-success-600"
          subtitle="Shelters, supplies"
        />
        <StatCard
          title="Social Media Posts"
          value={socialMediaPosts.length}
          icon={Radio}
          color="text-warning-600"
          subtitle="Last 24 hours"
        />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="p-6 space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((item, index) => (
              <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-50 last:border-b-0">
                <div className="flex-shrink-0">
                  {'title' in item ? (
                    <div className="w-8 h-8 bg-danger-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-danger-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {'title' in item ? `Disaster: ${item.title}` : 'New Report Submitted'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {'location_name' in item ? item.location_name : item.content || ''}
                  </p>

                  {/* ✅ Render image if it's a report and has image_url */}
                  {'content' in item && item.image_url && (
                    <div className="mt-2">
                      <img
                        src={item.image_url}
                        alt="Report"
                        className="max-w-xs max-h-32 rounded border object-cover"
                      />
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-3">
            <button
              onClick={() => onTabChange('create-disaster')}
              className="w-full flex items-center justify-center px-4 py-3 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors duration-200"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Emergency
            </button>
            <button
              onClick={() => onTabChange('create-report')}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Shield className="h-4 w-4 mr-2" />
              Submit Report
            </button>
            <button
              onClick={() => onTabChange('resources')}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Find Resources
            </button>
            <button
              onClick={() => onTabChange('social-media')}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Radio className="h-4 w-4 mr-2" />
              Monitor Social Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
