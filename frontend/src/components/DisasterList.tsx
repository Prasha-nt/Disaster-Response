import React, { useState } from 'react';
import { AlertTriangle, MapPin, Calendar, Tag, Search, Filter, RefreshCw } from 'lucide-react';
import { Disaster } from '../App';

interface DisasterListProps {
  disasters: Disaster[];
  onRefresh: () => void;
}

const DisasterList: React.FC<DisasterListProps> = ({ disasters, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const allTags = Array.from(new Set(disasters.flatMap(d => d.tags)));
  
  const filteredDisasters = disasters.filter(disaster => {
    const matchesSearch = disaster.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disaster.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disaster.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || disaster.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const getSeverityColor = (tags: string[]) => {
    if (tags.includes('urgent')) return 'bg-danger-100 text-danger-800 border-danger-200';
    if (tags.includes('severe')) return 'bg-warning-100 text-warning-800 border-warning-200';
    return 'bg-primary-100 text-primary-800 border-primary-200';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Active Disasters</h2>
          <p className="text-gray-600">Monitor and manage disaster situations</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search disasters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Disasters Grid */}
      <div className="grid gap-6">
        {filteredDisasters.length > 0 ? (
          filteredDisasters.map(disaster => (
            <div key={disaster.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-danger-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-danger-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{disaster.title}</h3>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{disaster.location_name || 'Location not specified'}</span>
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3">{disaster.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {disaster.tags.map(tag => (
                          <span key={tag} className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(disaster.tags)}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(disaster.created_at).toLocaleDateString()}</span>
                        </div>
                        <span>by {disaster.owner_id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No disasters found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedTag ? 'Try adjusting your search filters' : 'No active disasters reported'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisasterList;