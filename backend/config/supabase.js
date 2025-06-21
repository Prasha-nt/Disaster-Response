import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Cache management functions
export const cacheService = {
  async get(key) {
    try {
      const { data, error } = await supabase
        .from('cache')
        .select('value, expires_at')
        .eq('key', key)
        .single();

      if (error || !data) return null;

      // Check if cache has expired
      if (new Date(data.expires_at) < new Date()) {
        await this.delete(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set(key, value, ttlMinutes = 60) {
    try {
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
      
      const { error } = await supabase
        .from('cache')
        .upsert({
          key,
          value,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        console.error('Cache set error:', error);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async delete(key) {
    try {
      await supabase
        .from('cache')
        .delete()
        .eq('key', key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
};