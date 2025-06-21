import express from 'express';
import { supabase } from '../config/supabase.js';
import { geocodeLocation } from '../services/geocoding.js';
import { io } from '../server.js';

const router = express.Router();

// GET /api/disasters
router.get('/', async (req, res) => {
  try {
    const { tag } = req.query;
    
    let query = supabase
      .from('disasters')
      .select('*')
      .order('created_at', { ascending: false });

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch disasters' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/disasters
router.post('/', async (req, res) => {
  try {
    const { title, location_name, description, tags, owner_id } = req.body;

    if (!title || !description || !owner_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Geocode location if provided
    let locationData = null;
    if (location_name) {
      try {
        locationData = await geocodeLocation(location_name);
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        // Continue without coordinates
      }
    }

    const disasterData = {
      title,
      location_name: location_name || null,
      description,
      tags: tags || [],
      owner_id,
      audit_trail: [{
        action: 'create',
        user_id: owner_id,
        timestamp: new Date().toISOString()
      }]
    };

    // Add location coordinates if available
    if (locationData && locationData.lat && locationData.lng) {
      disasterData.location = `POINT(${locationData.lng} ${locationData.lat})`;
    }

    const { data, error } = await supabase
      .from('disasters')
      .insert([disasterData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create disaster' });
    }

    // Emit real-time update
    io.emit('disaster_updated', data);

    console.log(`✅ Disaster created: ${data.title} by ${owner_id}`);
    res.status(201).json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/disasters/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('disasters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(404).json({ error: 'Disaster not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/disasters/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location_name, description, tags, user_id } = req.body;

    // Get existing disaster for audit trail
    const { data: existingDisaster } = await supabase
      .from('disasters')
      .select('audit_trail')
      .eq('id', id)
      .single();

    const auditTrail = existingDisaster?.audit_trail || [];
    auditTrail.push({
      action: 'update',
      user_id: user_id || 'system',
      timestamp: new Date().toISOString()
    });

    const updateData = {
      ...(title && { title }),
      ...(location_name !== undefined && { location_name }),
      ...(description && { description }),
      ...(tags && { tags }),
      audit_trail: auditTrail
    };

    const { data, error } = await supabase
      .from('disasters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to update disaster' });
    }

    // Emit real-time update
    io.emit('disaster_updated', data);

    console.log(`✅ Disaster updated: ${data.title}`);
    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/disasters/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const { error } = await supabase
      .from('disasters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to delete disaster' });
    }

    // Emit real-time update
    io.emit('disaster_updated', { id, action: 'deleted' });

    console.log(`✅ Disaster deleted: ${id} by ${user_id || 'system'}`);
    res.status(204).send();
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/disasters/:id/verify-image
router.post('/:id/verify-image', async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Mock image verification (would use Gemini API in production)
    const verificationResult = Math.random() > 0.5 ? 'verified' : 'suspicious';
    
    console.log(`🔍 Image verification for disaster ${id}: ${verificationResult}`);
    
    res.json({
      verification_result: verificationResult,
      confidence: Math.random() * 100,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Image verification error:', error);
    res.status(500).json({ error: 'Image verification failed' });
  }
});

export default router;