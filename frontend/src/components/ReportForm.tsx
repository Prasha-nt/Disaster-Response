import React, { useState } from 'react';
import { Shield, Camera, Upload, Loader2 } from 'lucide-react';
import { Disaster, Report } from '../App';

const API_BASE_URL = 'http://localhost:5000/api';

interface ReportFormProps {
  disasters: Disaster[];
  onReportCreated: (report: Report) => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ disasters, onReportCreated }) => {
  const [formData, setFormData] = useState({
    disaster_id: '',
    content: '',
    image_url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: 'netrunnerX',
        }),
      });

      if (response.ok) {
        const report = await response.json();
        onReportCreated(report);
        setFormData({ disaster_id: '', content: '', image_url: '' });
      } else {
        console.error('Failed to create report');
      }
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyImage = async () => {
    if (!formData.image_url.trim() || !formData.disaster_id) return;
    
    setIsVerifying(true);
    try {
      const response = await fetch(`${API_BASE_URL}/disasters/${formData.disaster_id}/verify-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: formData.image_url,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Image verification: ${result.verification_result}`);
      }
    } catch (error) {
      console.error('Error verifying image:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Submit Report</h2>
              <p className="text-sm text-gray-600">Share information about ongoing situations</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Disaster *
            </label>
            <select
              required
              value={formData.disaster_id}
              onChange={(e) => setFormData({ ...formData, disaster_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="">Select a disaster...</option>
              {disasters.map(disaster => (
                <option key={disaster.id} value={disaster.id}>
                  {disaster.title} - {disaster.location_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Content *
            </label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Describe what you've observed, needs, or offers for help..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (Optional)
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={verifyImage}
                disabled={isVerifying || !formData.image_url.trim() || !formData.disaster_id}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {isVerifying ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Images will be verified for authenticity using AI analysis
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Upload className="h-5 w-5 mr-2" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;