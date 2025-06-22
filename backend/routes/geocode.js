// routes/geocode.js
import express from 'express';
import fetch from 'node-fetch';
import { geocodeLocation } from '../services/geocoding.js';
import dotenv from 'dotenv';

dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const router = express.Router();

// POST /api/geocode
router.post('/', async (req, res) => {
  try {
    const { description, location_name } = req.body;

    if (!description && !location_name) {
      return res.status(400).json({ error: 'Description or location_name is required' });
    }

    let extractedLocation = location_name;

    // ✅ Step 1: Use Gemini 2.0 Flash API to extract location (if not provided)
    if (!extractedLocation && description) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const body = {
          contents: [
            {
              parts: [
                {
                  text: `Extract only the location name (city, town, landmark) from this disaster report: "${description}"`,
                },
              ],
            },
          ],
        };

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const geminiData = await geminiRes.json();
        extractedLocation = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!extractedLocation) throw new Error('No location extracted from Gemini API');
      } catch (error) {
        console.error('❌ Gemini API error:', error.message || error);
        return res.status(500).json({ error: 'Failed to extract location using Gemini' });
      }
    }

    // ✅ Step 2: Geocode the location using OpenStreetMap (unchanged)
    let coordinates = null;
    if (extractedLocation) {
      try {
        coordinates = await geocodeLocation(extractedLocation);
      } catch (error) {
        console.error('⚠️ Geocoding error:', error.message || error);
      }
    }

    console.log(`🗺️ Location: "${description}" → "${extractedLocation}" → ${coordinates ? `${coordinates.lat}, ${coordinates.lng}` : 'No coordinates'}`);

    res.json({
      original_description: description,
      location_name: extractedLocation,
      coordinates,
    });

  } catch (error) {
    console.error('❌ Geocode route error:', error.message || error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
