import { cacheService } from '../config/supabase.js';

// Mock social media monitoring service
export async function getMockSocialMediaPosts(keywords = 'disaster') {
  const cacheKey = `social_posts_${keywords}`;
  
  // Check cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    console.log('📱 Using cached social media posts');
    return cached;
  }

  try {
    console.log(`📡 Monitoring social media for: ${keywords}`);
    
    // Mock posts with disaster-related content
    const mockPosts = [
      {
        user: 'citizen_reporter',
        post: 'Major flooding on 42nd Street! Water up to car windows. Avoid the area. #NYCFlood #Emergency',
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        location: '42nd Street, NYC',
        hashtags: ['NYCFlood', 'Emergency'],
        likes: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
        replies: Math.floor(Math.random() * 20),
        priority: 'high'
      },
      {
        user: 'relief_volunteer',
        post: 'Setting up emergency shelter at Lincoln High School. Hot food and blankets available. DM for directions. #DisasterRelief',
        timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
        location: 'Lincoln High School',
        hashtags: ['DisasterRelief', 'Shelter'],
        likes: Math.floor(Math.random() * 80),
        shares: Math.floor(Math.random() * 40),
        replies: Math.floor(Math.random() * 15),
        priority: 'medium'
      },
      {
        user: 'local_news',
        post: 'BREAKING: City declares state of emergency due to severe flooding. Residents advised to stay indoors. #Breaking #StateOfEmergency',
        timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString(),
        location: 'Citywide',
        hashtags: ['Breaking', 'StateOfEmergency'],
        likes: Math.floor(Math.random() * 200),
        shares: Math.floor(Math.random() * 100),
        replies: Math.floor(Math.random() * 50),
        priority: 'urgent'
      },
      {
        user: 'concerned_parent',
        post: 'School bus stuck in flood water on Oak Avenue. Kids safe but scared. When will help arrive? #SchoolBus #FloodRescue',
        timestamp: new Date(Date.now() - Math.random() * 5400000).toISOString(),
        location: 'Oak Avenue',
        hashtags: ['SchoolBus', 'FloodRescue'],
        likes: Math.floor(Math.random() * 60),
        shares: Math.floor(Math.random() * 30),
        replies: Math.floor(Math.random() * 25),
        priority: 'high'
      },
      {
        user: 'first_responder',
        post: 'Water rescue teams deployed to downtown area. Evacuating residents from lower floors. Stay calm, help is coming. #WaterRescue',
        timestamp: new Date(Date.now() - Math.random() * 9000000).toISOString(),
        location: 'Downtown',
        hashtags: ['WaterRescue', 'FirstResponders'],
        likes: Math.floor(Math.random() * 150),
        shares: Math.floor(Math.random() * 75),
        replies: Math.floor(Math.random() * 35),
        priority: 'high'
      },
      {
        user: 'community_leader',
        post: 'Community center on Maple St opening as evacuation site. Volunteers needed to help with supplies and registration. #CommunityResponse',
        timestamp: new Date(Date.now() - Math.random() * 10800000).toISOString(),
        location: 'Maple Street',
        hashtags: ['CommunityResponse', 'Volunteers'],
        likes: Math.floor(Math.random() * 90),
        shares: Math.floor(Math.random() * 45),
        replies: Math.floor(Math.random() * 18),
        priority: 'medium'
      }
    ];

    // Simulate real-time updates by randomly selecting posts
    const numPosts = Math.floor(Math.random() * 4) + 3; // 3-6 posts
    const selectedPosts = mockPosts
      .sort(() => 0.5 - Math.random())
      .slice(0, numPosts)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Cache for a short time to simulate real-time updates
    await cacheService.set(cacheKey, selectedPosts, 2); // 2 minute cache

    return selectedPosts;
  } catch (error) {
    console.error('Social media monitoring error:', error);
    return [];
  }
}

// Function to get priority alerts from social media
export function getPriorityAlerts(posts) {
  const urgentKeywords = ['urgent', 'emergency', 'sos', 'help', 'trapped', 'danger'];
  
  return posts.filter(post => {
    const content = post.post.toLowerCase();
    return urgentKeywords.some(keyword => content.includes(keyword)) || 
           post.priority === 'urgent' || 
           post.priority === 'high';
  });
}

// Function to classify posts by sentiment/urgency
export function classifyPost(post) {
  const urgentPatterns = [
    /urgent|emergency|sos|help|trapped|danger|rescue/i,
    /need help|immediate|critical|life threatening/i
  ];
  
  const offerPatterns = [
    /offering|providing|available|volunteer|donate/i,
    /shelter|food|water|supplies|transportation/i
  ];

  const reportPatterns = [
    /flooding|fire|earthquake|damage|blocked|evacuate/i,
    /situation|condition|status|update/i
  ];

  if (urgentPatterns.some(pattern => pattern.test(post.post))) {
    return { category: 'urgent_need', priority: 'high' };
  } else if (offerPatterns.some(pattern => pattern.test(post.post))) {
    return { category: 'offer_help', priority: 'medium' };
  } else if (reportPatterns.some(pattern => pattern.test(post.post))) {
    return { category: 'situation_report', priority: 'medium' };
  }
  
  return { category: 'general', priority: 'low' };
}