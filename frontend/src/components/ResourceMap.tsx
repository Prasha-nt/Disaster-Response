import React, { useState } from 'react';
import { MapPin, Home, Heart, Package, Search } from 'lucide-react';
import { Resource, Disaster } from '../App';

interface ResourceMapProps {
  resources: Resource[];
  disasters: Disaster[];
}

const ResourceMap: React.FC<ResourceMapProps> = ({ resources, disasters }) => {
  const [selectedDisaster, setSelectedDisaster] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const resourceTypes = Array.from(new Set(resources.map(r => r.type)));
  
  const filteredResources = resources.filter(resource => {
    const matchesDisaster = !selectedDisaster || resource.disaster_id === selectedDisaster;
    const matchesType = !selectedType || resource.type === selectedType;
    return matchesDisaster && matchesType;
  });

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'shelter':
        return Home;
      case 'medical':
        return Heart;
      case 'supply':
        return Package;
      default:
        return MapPin;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'shelter':
        return 'bg-primary-100 text-primary-700 border-primary-200';
      case 'medical':
        return 'bg-danger-100 text-danger-700 border-danger-200';
      case 'supply':
        return 'bg-success-100 text-success-700 border-success-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resource Mapping</h2>
        <p className="text-gray-600">Locate shelters, supplies, and emergency resources</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Disaster
            </label>
            <select
              value={selectedDisaster}
              onChange={(e) => setSelectedDisaster(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Disasters</option>
              {disasters.map(disaster => (
                <option key={disaster.id} value={disaster.id}>
                  {disaster.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Types</option>
              {resourceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">Interactive Resource Map</span>
            <span className="text-sm text-gray-500">({filteredResources.length} resources)</span>
          </div>
        </div>
        
        <div className="h-96 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Map Integration</h3>
            <p className="text-gray-600 max-w-md">
              Interactive map would display resource locations with real-time updates.
              Integration with Google Maps, Mapbox, or OpenStreetMap would show precise coordinates.
            </p>
          </div>
        </div>
      </div>

      {/* Resource List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Available Resources</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredResources.length > 0 ? (
            filteredResources.map(resource => {
              const ResourceIcon = getResourceIcon(resource.type);
              const disaster = disasters.find(d => d.id === resource.disaster_id);
              
              return (
                <div key={resource.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg border ${getResourceColor(resource.type)}`}>
                      <ResourceIcon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{resource.name}</h4>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getResourceColor(resource.type)}`}>
                          {resource.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{resource.location_name}</span>
                      </div>
                      
                      {disaster && (
                        <div className="text-sm text-gray-500 mb-2">
                          Related to: <span className="font-medium">{disaster.title}</span>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-500">
                        Added on {new Date(resource.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <button className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                      Get Directions
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-500">
                {selectedDisaster || selectedType ? 'Try adjusting your filters' : 'No resources available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceMap;