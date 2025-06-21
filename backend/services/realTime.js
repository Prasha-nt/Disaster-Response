import { supabase } from '../config/supabase.js';
import { getMockSocialMediaPosts } from './socialMedia.js';

export function setupRealTime(io) {
  console.log('🔄 Setting up real-time monitoring...');
  
  // Monitor social media every 2 minutes
  setInterval(async () => {
    try {
      const posts = await getMockSocialMediaPosts('live_monitoring');
      if (posts.length > 0) {
        // Emit the latest post to all connected clients
        io.emit('social_media_updated', posts[0]);
        console.log(`📡 Real-time update: Social media post broadcasted`);
      }
    } catch (error) {
      console.error('Real-time social media monitoring error:', error);
    }
  }, 120000); // 2 minutes

  // Simulate resource updates every 5 minutes
  setInterval(async () => {
    try {
      const mockResource = {
        id: `resource_${Date.now()}`,
        name: `Emergency Supply Station ${Math.floor(Math.random() * 100)}`,
        type: ['shelter', 'medical', 'supply'][Math.floor(Math.random() * 3)],
        location_name: ['Downtown', 'Uptown', 'East Side', 'West Side'][Math.floor(Math.random() * 4)],
        created_at: new Date().toISOString()
      };
      
      io.emit('resources_updated', mockResource);
      console.log(`🏠 Real-time update: New resource - ${mockResource.name}`);
    } catch (error) {
      console.error('Real-time resource monitoring error:', error);
    }
  }, 300000); // 5 minutes

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`👤 Client connected: ${socket.id}`);
    
    // Send welcome message with current system status
    socket.emit('system_status', {
      status: 'online',
      timestamp: new Date().toISOString(),
      message: 'Connected to disaster coordination system'
    });

    socket.on('disconnect', () => {
      console.log(`👤 Client disconnected: ${socket.id}`);
    });

    // Handle subscription to specific disaster updates
    socket.on('subscribe_disaster', (disasterId) => {
      socket.join(`disaster_${disasterId}`);
      console.log(`📡 Client ${socket.id} subscribed to disaster ${disasterId}`);
    });

    // Handle unsubscription
    socket.on('unsubscribe_disaster', (disasterId) => {
      socket.leave(`disaster_${disasterId}`);
      console.log(`📡 Client ${socket.id} unsubscribed from disaster ${disasterId}`);
    });
  });

  console.log('✅ Real-time monitoring system initialized');
}

// Function to broadcast disaster-specific updates
export function broadcastDisasterUpdate(io, disasterId, updateType, data) {
  io.to(`disaster_${disasterId}`).emit('disaster_specific_update', {
    disaster_id: disasterId,
    type: updateType,
    data,
    timestamp: new Date().toISOString()
  });
  
  console.log(`📡 Broadcasted ${updateType} update for disaster ${disasterId}`);
}