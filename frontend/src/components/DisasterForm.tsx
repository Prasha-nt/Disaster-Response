import React, { useState } from 'react';
import { AlertTriangle, MapPin, Tag, Loader2 } from 'lucide-react';
import { Disaster } from '../App';

const API_BASE_URL = 'http://localhost:5000/api';

interface DisasterFormProps {
  onDisasterCreated: (disaster: Disaster) => void;
}

const DisasterForm: React.FC<DisasterFormProps> = ({ onDisasterCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    location_name: '',
    description: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/disasters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          owner_id: 'netrunnerX',
        }),
      });

      if (response.ok) {
        const disaster = await response.json();
        onDisasterCreated(disaster);
        setFormData({ title: '', location_name: '', description: '', tags: '' });
      } else {
        console.error('Failed to create disaster');
      }
    } catch (error) {
      console.error('Error creating disaster:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractLocation = async () => {
    if (!formData.description.trim()) return;
    
    setIsExtracting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: formData.description,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.location_name) {
          setFormData(prev => ({
            ...prev,
            location_name: result.location_name,
          }));
        }
      }
    } catch (error) {
      console.error('Error extracting location:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-danger-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-danger-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Report New Disaster</h2>
              <p className="text-sm text-gray-600">Provide detailed information about the disaster</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disaster Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="e.g., Major Flooding in Downtown Area"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Describe the disaster in detail, including location details..."
            />
            <button
              type="button"
              onClick={extractLocation}
              disabled={isExtracting || !formData.description.trim()}
              className="mt-2 flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-800 disabled:opacity-50"
            >
              {isExtracting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span>Extract Location from Description</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Name
            </label>
            <input
              type="text"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="e.g., Manhattan, NYC or 123 Main St, City"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="flood, urgent, evacuation (comma-separated)"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {['flood', 'earthquake', 'fire', 'urgent', 'evacuation', 'shelter'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const currentTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
                    if (!currentTags.includes(tag)) {
                      setFormData({
                        ...formData,
                        tags: [...currentTags, tag].join(', ')
                      });
                    }
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Tag className="h-3 w-3 inline mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-6 py-3 bg-danger-500 text-white font-medium rounded-lg hover:bg-danger-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2" />
              )}
              {isSubmitting ? 'Reporting...' : 'Report Disaster'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisasterForm;