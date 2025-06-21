import React from 'react';
import { Radio, RefreshCw, MessageCircle, Heart, Share, Clock } from 'lucide-react';

interface SocialMediaFeedProps {
  posts: any[];
  onRefresh: () => void;
}

const SocialMediaFeed: React.FC<SocialMediaFeedProps> = ({ posts, onRefresh }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social Media Monitoring</h2>
          <p className="text-gray-600">Real-time social media reports and updates</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Live Status */}
      <div className="bg-success-50 border border-success-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
          <Radio className="h-4 w-4 text-success-600" />
          <span className="text-success-800 font-medium">Live monitoring active</span>
          <span className="text-success-600 text-sm">• {posts.length} posts collected</span>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-sm">
                    {post.user ? post.user.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {post.user || 'Anonymous User'}
                    </span>
                    <span className="text-gray-500 text-sm">@{post.user || 'anonymous'}</span>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center space-x-1 text-gray-500 text-sm">
                      <Clock className="h-3 w-3" />
                      <span>{post.timestamp || 'Just now'}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-800 mb-3 leading-relaxed">
                    {post.post || post.content || 'No content available'}
                  </p>
                  
                  {post.location && (
                    <div className="text-sm text-gray-600 mb-3">
                      📍 {post.location}
                    </div>
                  )}
                  
                  {post.hashtags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.hashtags.map((tag: string, tagIndex: number) => (
                        <span key={tagIndex} className="text-primary-600 text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-6 text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-primary-600 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.replies || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-danger-600 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.likes || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-success-600 transition-colors">
                      <Share className="h-4 w-4" />
                      <span className="text-sm">{post.shares || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Radio className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No social media posts</h3>
            <p className="text-gray-500">Monitoring for disaster-related social media activity...</p>
            <div className="mt-4">
              <div className="animate-pulse flex space-x-4 justify-center">
                <div className="rounded-full bg-gray-200 h-3 w-3"></div>
                <div className="rounded-full bg-gray-200 h-3 w-3"></div>
                <div className="rounded-full bg-gray-200 h-3 w-3"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaFeed;