import express from 'express';
import { supabase } from '../config/supabase.js';
import { io } from '../server.js';

const router = express.Router();

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const { disaster_id } = req.query;
    
    let query = supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (disaster_id) {
      query = query.eq('disaster_id', disaster_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/reports
router.post('/', async (req, res) => {
  try {
    const { disaster_id, user_id, content, image_url } = req.body;

    if (!disaster_id || !user_id || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const reportData = {
      disaster_id,
      user_id,
      content,
      image_url: image_url || null,
      verification_status: 'pending'
    };

    
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create report' });
    }

    console.log(`📝 Report created for disaster ${disaster_id} by ${user_id}`);
    res.status(201).json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/reports/:id/verify
router.put('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { verification_status, verifier_id } = req.body;

    if (!['verified', 'rejected'].includes(verification_status)) {
      return res.status(400).json({ error: 'Invalid verification status' });
    }

    const { data, error } = await supabase
      .from('reports')
      .update({ 
        verification_status,
        verified_at: new Date().toISOString(),
        verified_by: verifier_id || 'system'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to verify report' });
    }

    console.log(`✅ Report ${id} ${verification_status} by ${verifier_id || 'system'}`);
    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;