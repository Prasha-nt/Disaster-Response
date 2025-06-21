import express from 'express';
import { extractLocationFromDescription, geocodeLocation } from '../services/geocoding.js';

const router = express.Router();

// POST /api/geocode
router.post('/', async (req, res) => {
  try {
    const { description, location_name } = req.body;

    if (!description && !location_name) {
      return res.status(400).json({ error: 'Description or location_name is required' });
    }

    let extractedLocation = location_name;
    
    // Extract location from description if not provided
    if (!extractedLocation && description) {
      try {
        extractedLocation = await extractLocationFromDescription(description);
      } catch (error) {
        console.error('Location extraction error:', error);
        return res.status(500).json({ error: 'Failed to extract location' });
      }
    }

    // Geocode the location
    let coordinates = null;
    if (extractedLocation) {
      try {
        coordinates = await geocodeLocation(extractedLocation);
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }

    console.log(`🗺️  Location processing: "${description}" -> "${extractedLocation}" -> ${coordinates ? `${coordinates.lat}, ${coordinates.lng}` : 'no coordinates'}`);

    res.json({
      original_description: description,
      location_name: extractedLocation,
      coordinates
    });
  } catch (error) {
    console.error('Geocoding route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;