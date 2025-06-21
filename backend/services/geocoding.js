import { cacheService } from '../config/supabase.js';

// Mock Gemini API for location extraction
export async function extractLocationFromDescription(description) {
  const cacheKey = `location_extract_${Buffer.from(description).toString('base64').slice(0, 20)}`;
  
  // Check cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    console.log('🎯 Using cached location extraction');
    return cached;
  }

  try {
    // Simulate Gemini API call
    console.log('🤖 Extracting location with AI...');
    
    // Simple location extraction logic (would use Gemini API in production)
    const locationPatterns = [
      /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s*[A-Z]{2,})/gi,
      /at\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s*[A-Z]{2,})/gi,
      /([A-Z][a-z]+\s*,\s*[A-Z]{2,})/g,
      /(Manhattan|Brooklyn|Queens|Bronx|Staten Island)/gi,
      /([A-Z][a-z]+\s+Street|[A-Z][a-z]+\s+Ave|[A-Z][a-z]+\s+Road)/gi
    ];

    let extractedLocation = null;
    
    for (const pattern of locationPatterns) {
      const match = description.match(pattern);
      if (match) {
        extractedLocation = match[0].replace(/^(in|at)\s+/i, '').trim();
        break;
      }
    }

    // Default fallback locations for demo
    if (!extractedLocation) {
      const defaultLocations = [
        'Manhattan, NYC',
        'Brooklyn, NYC', 
        'Downtown Area',
        'City Center'
      ];
      extractedLocation = defaultLocations[Math.floor(Math.random() * defaultLocations.length)];
    }

    // Cache the result
    await cacheService.set(cacheKey, extractedLocation, 60); // 1 hour cache

    return extractedLocation;
  } catch (error) {
    console.error('Location extraction error:', error);
    return null;
  }
}

// Mock geocoding service (would use Google Maps, Mapbox, or OSM in production)
export async function geocodeLocation(locationName) {
  const cacheKey = `geocode_${locationName.toLowerCase().replace(/\s+/g, '_')}`;
  
  // Check cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    console.log('🗺️  Using cached geocoding result');
    return cached;
  }

  try {
    console.log(`🌍 Geocoding location: ${locationName}`);
    
    // Mock coordinates for common locations (would use real geocoding API)
    const mockCoordinates = {
      'manhattan, nyc': { lat: 40.7831, lng: -73.9712 },
      'manhattan': { lat: 40.7831, lng: -73.9712 },
      'brooklyn, nyc': { lat: 40.6782, lng: -73.9442 },
      'brooklyn': { lat: 40.6782, lng: -73.9442 },
      'queens, nyc': { lat: 40.7282, lng: -73.7949 },
      'queens': { lat: 40.7282, lng: -73.7949 },
      'bronx, nyc': { lat: 40.8448, lng: -73.8648 },
      'bronx': { lat: 40.8448, lng: -73.8648 },
      'lower east side, nyc': { lat: 40.7209, lng: -73.9839 },
      'lower east side': { lat: 40.7209, lng: -73.9839 },
      'downtown area': { lat: 40.7589, lng: -73.9851 },
      'city center': { lat: 40.7614, lng: -73.9776 },
      'houston st, nyc': { lat: 40.7242, lng: -73.9857 }
    };

    const normalizedName = locationName.toLowerCase();
    let coordinates = mockCoordinates[normalizedName];

    // If not found, try partial matches
    if (!coordinates) {
      const partialMatch = Object.keys(mockCoordinates).find(key => 
        normalizedName.includes(key) || key.includes(normalizedName)
      );
      if (partialMatch) {
        coordinates = mockCoordinates[partialMatch];
      }
    }

    // Generate random coordinates near NYC if no match
    if (!coordinates) {
      coordinates = {
        lat: 40.7128 + (Math.random() - 0.5) * 0.2, // ±0.1 degrees around NYC
        lng: -74.0060 + (Math.random() - 0.5) * 0.2
      };
    }

    // Cache the result
    await cacheService.set(cacheKey, coordinates, 1440); // 24 hour cache

    return coordinates;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}