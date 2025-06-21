import express from 'express';
import { cacheService } from '../config/supabase.js';
import { getMockSocialMediaPosts } from '../services/socialMedia.js';
import { io } from '../server.js';

const router = express.Router();

// GET /api/social-media
router.get('/', async (req, res) => {
  try {
    const { disaster_id, keywords } = req.query;
    
    // Check cache first
    const cacheKey = `social_media_${disaster_id || 'all'}_${keywords || 'default'}`;
    let cachedData = await cacheService.get(cacheKey);
    
    if (cachedData) {
      console.log('📱 Serving cached social media data');
      return res.json(cachedData);
    }

    // Get fresh data (mock or real API)
    const posts = await getMockSocialMediaPosts(keywords);
    
    // Cache the results
    await cacheService.set(cacheKey, posts, 5); // 5 minute cache
    
    console.log(`📱 Fetched ${posts.length} social media posts`);
    res.json(posts);
  } catch (error) {
    console.error('Social media fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch social media data' });
  }
});

// GET /api/disasters/:id/social-media
router.get('/disasters/:id/social-media', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check cache first
    const cacheKey = `disaster_social_${id}`;
    let cachedData = await cacheService.get(cacheKey);
    
    if (cachedData) {
      console.log(`📱 Serving cached social media for disaster ${id}`);
      return res.json(cachedData);
    }

    // Get disaster-specific posts
    const posts = await getMockSocialMediaPosts(`disaster_${id}`);
    
    // Cache the results
    await cacheService.set(cacheKey, posts, 10); // 10 minute cache
    
    // Emit real-time update
    if (posts.length > 0) {
      io.emit('social_media_updated', {
        disaster_id: id,
        posts: posts.slice(0, 3) // Send latest 3 posts
      });
    }
    
    console.log(`📱 Fetched ${posts.length} posts for disaster ${id}`);
    res.json(posts);
  } catch (error) {
    console.error('Disaster social media fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch disaster social media' });
  }
});

// Mock endpoint for testing
router.get('/mock', async (req, res) => {
  try {
    const mockPosts = [
      {
        user: 'citizen1',
        post: '#floodrelief Need food and water in Lower East Side NYC. Family of 4 trapped on 3rd floor.',
        timestamp: new Date().toISOString(),
        location: 'Lower East Side, NYC',
        hashtags: ['floodrelief', 'NYC', 'help'],
        likes: 15,
        shares: 8,
        replies: 3
      },
      {
        user: 'reliefworker',
        post: 'Red Cross shelter now open at Manhattan Community College. Hot meals and dry clothes available. #disaster #shelter',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        location: 'Manhattan, NYC',
        hashtags: ['disaster', 'shelter', 'RedCross'],
        likes: 42,
        shares: 28,
        replies: 7
      },
      {
        user: 'localreporter',
        post: 'Water levels rising on Houston St. Evacuation recommended for blocks 100-200. #flooding #evacuation',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        location: 'Houston St, NYC',
        hashtags: ['flooding', 'evacuation', 'NYC'],
        likes: 67,
        shares: 45,
        replies: 12
      }
    ];

    res.json(mockPosts);
  } catch (error) {
    console.error('Mock social media error:', error);
    res.status(500).json({ error: 'Failed to generate mock data' });
  }
});

export default router;