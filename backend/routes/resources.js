import express from 'express';
import { supabase } from '../config/supabase.js';
import { geocodeLocation } from '../services/geocoding.js';
import { io } from '../server.js';

const router = express.Router();

// GET /api/resources
router.get('/', async (req, res) => {
  try {
    const { disaster_id, lat, lon, radius } = req.query;
    
    let query = supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (disaster_id) {
      query = query.eq('disaster_id', disaster_id);
    }

    // Geospatial query for nearby resources
    if (lat && lon) {
      const radiusMeters = radius ? parseInt(radius) * 1000 : 10000; // Default 10km
      const point = `POINT(${lon} ${lat})`;
      
      query = query.rpc('get_nearby_resources', {
        target_point: point,
        radius_meters: radiusMeters
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch resources' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/resources
router.post('/', async (req, res) => {
  try {
    const { disaster_id, name, location_name, type, user_id } = req.body;

    if (!disaster_id || !name || !location_name || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Geocode location
    let locationData = null;
    try {
      locationData = await geocodeLocation(location_name);
    } catch (geocodeError) {
      console.error('Geocoding error:', geocodeError);
    }

    const resourceData = {
      disaster_id,
      name,
      location_name,
      type,
      created_by: user_id || 'system'
    };

    // Add location coordinates if available
    if (locationData && locationData.lat && locationData.lng) {
      resourceData.location = `POINT(${locationData.lng} ${locationData.lat})`;
    }

    const { data, error } = await supabase
      .from('resources')
      .insert([resourceData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create resource' });
    }

    // Emit real-time update
    io.emit('resources_updated', data);

    console.log(`🏠 Resource mapped: ${data.name} at ${location_name}`);
    res.status(201).json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/disasters/:id/resources
router.get('/disasters/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lon } = req.query;

    let query = supabase
      .from('resources')
      .select('*')
      .eq('disaster_id', id)
      .order('created_at', { ascending: false });

    // If coordinates provided, order by distance
    if (lat && lon) {
      const point = `POINT(${lon} ${lat})`;
      query = query.rpc('get_nearby_resources', {
        target_point: point,
        disaster_id: id
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch resources' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;