/*
  # Disaster Response Platform Database Schema

  1. Tables
    - disasters: Core disaster records with geospatial support
    - reports: User-submitted reports linked to disasters
    - resources: Emergency resources with location data
    - cache: API response caching system

  2. Indexes
    - Geospatial indexes for location-based queries
    - Text indexes for tag-based filtering
    - Performance indexes for common queries

  3. Security
    - Row Level Security enabled on all tables
    - Basic authentication policies for demo purposes
*/

-- Enable PostGIS extension for geospatial support
CREATE EXTENSION IF NOT EXISTS postgis;

-- Disasters table
CREATE TABLE IF NOT EXISTS disasters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location_name text,
  location geography(POINT, 4326),
  description text NOT NULL,
  tags text[] DEFAULT '{}',
  owner_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  audit_trail jsonb DEFAULT '[]'::jsonb
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id uuid REFERENCES disasters(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  content text NOT NULL,
  image_url text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at timestamptz,
  verified_by text,
  created_at timestamptz DEFAULT now()
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id uuid REFERENCES disasters(id) ON DELETE CASCADE,
  name text NOT NULL,
  location_name text NOT NULL,
  location geography(POINT, 4326),
  type text NOT NULL,
  created_by text DEFAULT 'system',
  created_at timestamptz DEFAULT now()
);

-- Cache table for API responses
CREATE TABLE IF NOT EXISTS cache (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS disasters_location_idx ON disasters USING GIST (location);
CREATE INDEX IF NOT EXISTS disasters_tags_idx ON disasters USING GIN (tags);
CREATE INDEX IF NOT EXISTS disasters_owner_idx ON disasters (owner_id);
CREATE INDEX IF NOT EXISTS disasters_created_at_idx ON disasters (created_at DESC);

CREATE INDEX IF NOT EXISTS reports_disaster_id_idx ON reports (disaster_id);
CREATE INDEX IF NOT EXISTS reports_user_id_idx ON reports (user_id);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports (created_at DESC);
CREATE INDEX IF NOT EXISTS reports_verification_idx ON reports (verification_status);

CREATE INDEX IF NOT EXISTS resources_location_idx ON resources USING GIST (location);
CREATE INDEX IF NOT EXISTS resources_disaster_id_idx ON resources (disaster_id);
CREATE INDEX IF NOT EXISTS resources_type_idx ON resources (type);
CREATE INDEX IF NOT EXISTS resources_created_at_idx ON resources (created_at DESC);

CREATE INDEX IF NOT EXISTS cache_expires_at_idx ON cache (expires_at);

-- Enable Row Level Security
ALTER TABLE disasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for demo (allow all operations for authenticated users)
CREATE POLICY "Allow all operations on disasters" ON disasters FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations on reports" ON reports FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations on resources" ON resources FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations on cache" ON cache FOR ALL TO authenticated USING (true);

-- Public access policies for demo purposes (remove in production)
CREATE POLICY "Allow public read on disasters" ON disasters FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read on reports" ON reports FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read on resources" ON resources FOR SELECT TO anon USING (true);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby resources using geospatial queries
CREATE OR REPLACE FUNCTION get_nearby_resources(
  target_point geography,
  radius_meters integer DEFAULT 10000,
  disaster_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  disaster_id uuid,
  name text,
  location_name text,
  location geography,
  type text,
  created_by text,
  created_at timestamptz,
  distance_meters numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.disaster_id,
    r.name,
    r.location_name,
    r.location,
    r.type,
    r.created_by,
    r.created_at,
    ST_Distance(r.location, target_point)::numeric as distance_meters
  FROM resources r
  WHERE 
    ST_DWithin(r.location, target_point, radius_meters)
    AND (get_nearby_resources.disaster_id IS NULL OR r.disaster_id = get_nearby_resources.disaster_id)
  ORDER BY ST_Distance(r.location, target_point);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_disasters_updated_at 
  BEFORE UPDATE ON disasters 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO disasters (title, location_name, description, tags, owner_id) VALUES
  ('NYC Flood Emergency', 'Manhattan, NYC', 'Heavy flooding in Manhattan due to storm surge. Multiple streets impassable.', ARRAY['flood', 'urgent', 'evacuation'], 'netrunnerX'),
  ('Earthquake Damage Assessment', 'Brooklyn, NYC', 'Minor earthquake damage reported in several buildings. Structural assessments ongoing.', ARRAY['earthquake', 'assessment'], 'reliefAdmin'),
  ('Power Outage - Queens', 'Queens, NYC', 'Widespread power outage affecting 10,000+ residents. Estimated restoration in 6 hours.', ARRAY['power', 'outage'], 'netrunnerX')
ON CONFLICT DO NOTHING;

-- Update locations with coordinates for sample data
UPDATE disasters 
SET location = ST_SetSRID(ST_Point(-73.9712, 40.7831), 4326)
WHERE location_name = 'Manhattan, NYC' AND location IS NULL;

UPDATE disasters 
SET location = ST_SetSRID(ST_Point(-73.9442, 40.6782), 4326)
WHERE location_name = 'Brooklyn, NYC' AND location IS NULL;

UPDATE disasters 
SET location = ST_SetSRID(ST_Point(-73.7949, 40.7282), 4326)
WHERE location_name = 'Queens, NYC' AND location IS NULL;

-- Sample resources
INSERT INTO resources (disaster_id, name, location_name, type) 
SELECT 
  d.id,
  'Red Cross Emergency Shelter',
  'Lower East Side, NYC',
  'shelter'
FROM disasters d WHERE d.title = 'NYC Flood Emergency'
ON CONFLICT DO NOTHING;

INSERT INTO resources (disaster_id, name, location_name, type)
SELECT 
  d.id,
  'Mobile Medical Unit',
  'Brooklyn Heights, NYC', 
  'medical'
FROM disasters d WHERE d.title = 'Earthquake Damage Assessment'
ON CONFLICT DO NOTHING;

-- Update resource locations
UPDATE resources 
SET location = ST_SetSRID(ST_Point(-73.9839, 40.7209), 4326)
WHERE location_name = 'Lower East Side, NYC' AND location IS NULL;

UPDATE resources 
SET location = ST_SetSRID(ST_Point(-73.9961, 40.6955), 4326)
WHERE location_name = 'Brooklyn Heights, NYC' AND location IS NULL;

-- Sample reports
INSERT INTO reports (disaster_id, user_id, content, verification_status)
SELECT 
  d.id,
  'citizen1',
  'Water level rising on Houston Street. Several cars abandoned. Need immediate evacuation assistance.',
  'verified'
FROM disasters d WHERE d.title = 'NYC Flood Emergency'
ON CONFLICT DO NOTHING;

INSERT INTO reports (disaster_id, user_id, content, verification_status)
SELECT 
  d.id,
  'localreporter',
  'Cracks visible in building facade on Atlantic Avenue. Residents evacuated as precaution.',
  'pending'
FROM disasters d WHERE d.title = 'Earthquake Damage Assessment'
ON CONFLICT DO NOTHING;